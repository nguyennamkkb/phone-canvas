#!/usr/bin/env node
/**
 * Export every screen to PNG, at any device size and scale.
 *
 *   npm run export
 *   npm run export -- --screen my-screen --scale 3
 *   npm run export -- --device iphone-se --out /tmp/shots
 *
 * Zero dependencies. A phone screen is real HTML, so something has to lay it
 * out — this drives the Chrome already on the machine (or $CHROME_PATH) over
 * the DevTools protocol and never needs a build step or a running dev server.
 *
 * What you get is the screen itself: the device size, the status bar, the home
 * indicator, and the exact pixels the panel measures. The iPhone chassis you
 * see on the board is drawn by the React layer and is deliberately not included
 * — it is decoration, and it would be wrong in a handoff.
 *
 * The document is composed by `src/extractor/compose.ts`, the same module the
 * app uses, so an export can never drift from what the board shows.
 *
 * Split (3.5) into cli/cdp/site/render/chrome modules; this file only wires them.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEVICES, getDevice } from '../src/frame/devices.ts'
import type { Device } from '../src/frame/devices.ts'
import { composeScreenDoc } from '../src/extractor/compose.ts'
import { scanProjects } from './scan-projects.ts'
import { exportFileName, parseArgs } from './export/cli.ts'
import type { Options } from './export/cli.ts'
import { launch, shutdown } from './export/cdp.ts'
import type { Browser } from './export/cdp.ts'
import { startSite } from './export/site.ts'
import { evaluate, renderPng, waitForHeight } from './export/render.ts'
import { elementStem, openElementSession } from './export/element.ts'
import type { ElementNode } from './export/element.ts'
import {
  buildElementGoldenRecord,
  buildGoldenRecord,
  compareElementGolden,
  elementGoldenKey,
  loadElementGolden,
  loadManifest,
  phashPng,
  resolveGoldenDir,
  saveElementGolden,
  saveManifest,
  upsertElementRecord,
  upsertRecord,
} from './export/golden.ts'
import type { ElementGoldenCompare, GoldenManifest } from './export/golden.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS_DIR = path.join(ROOT, 'src/screens')
const PUBLIC_DIR = path.join(ROOT, 'public')
const STYLESHEETS = ['core.css', 'palettes.css', 'vocab.css', 'icons.css', 'icon-set.css']

function fail(message: string): never {
  console.error(`export: ${message}`)
  process.exit(1)
}

/** relative inside the project, absolute outside it — never a `../../..` ladder */
function display(target: string): string {
  const relative = path.relative(ROOT, target)
  return relative.startsWith('..') ? target : relative
}

/* ------------------------------------------------------------ elements -- */

/** element.ts's default crop pad (private there); the panel's default too */
const ELEMENT_PAD_PT = 24
/** boxes from the two measurements are the same layout, rounded the same way */
const BOX_TOLERANCE_PT = 0.5

/** One element of a rendered screen, in the shape `--element` matches on. */
type DomElement = {
  tag: string
  id: string
  classes: string[]
  src: string
  alt: string
  symbol: string
  asset: string
  iconSrc: string
  box: { x: number; y: number; w: number; h: number }
}

/**
 * Every croppable element of the screen, in document order.
 *
 * The filter is the bridge's own (`src/extractor/bridge.js`): a hidden or
 * zero-sized node is not a node the board can select, and a name that resolves
 * from the CLI must resolve in the panel too. Boxes are device points from the
 * frame's top-left, rounded to 2dp exactly like the bridge's, so a box
 * measured here can be matched against the boxes the crop pipeline reports.
 */
const ELEMENTS_JS = `(() => {
  const shell = document.body.getBoundingClientRect()
  const round = (n) => Math.round(n * 100) / 100
  const out = []
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    if (el.parentElement && el.parentElement.closest('svg')) continue
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) continue
    out.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: [...el.classList],
      src: el.getAttribute('src') || '',
      alt: el.getAttribute('alt') || '',
      symbol: el.getAttribute('data-symbol') || '',
      asset: el.getAttribute('data-asset') || '',
      iconSrc: (cs.getPropertyValue('--icon-src') || '').replace(/^['"]|['"]$/g, '').trim(),
      box: { x: round(r.left - shell.left), y: round(r.top - shell.top), w: round(r.width), h: round(r.height) },
    })
  }
  return out
})()`

/**
 * The names one element answers to: its class tokens, the pipeline's own
 * `elementStem` for it, and the raw `data-asset`.
 *
 * `elementStem` is reused on the measured element so a name can never mean two
 * different things in the CLI and in the crop (it folds `data-asset`, then
 * symbol / icon / image file, then the class token, then the id). Its last
 * resort (role-index) names nothing here, so it is dropped instead of
 * pretending to be a handle. The class list is added whole on top: a secondary
 * class (`is-best`) or a utility (`col`) is a name a reviewer may reach for,
 * even though the stem only keeps one token.
 */
function elementNames(element: DomElement): string[] {
  const stem = elementStem({
    id: element.id,
    tag: element.tag,
    parent: null,
    depth: 0,
    role: '',
    label: '',
    box: element.box,
    attrs: {
      src: element.src,
      alt: element.alt,
      symbol: element.symbol,
      asset: element.asset,
      iconSrc: element.iconSrc,
      class: element.classes.join(' '),
    },
  })
  const names = new Set(element.classes)
  if (stem !== 'element-1') names.add(stem)
  if (element.asset) names.add(element.asset)
  return [...names]
}

/** `div.pw-card.ss-cell` — what one matched element is, for the report. */
function describeElement(element: DomElement): string {
  return `${element.tag}${element.classes.map((name) => `.${name}`).join('')}`
}

/** Board vocabulary for one element verdict. */
function verdictLabel(compare: ElementGoldenCompare): string {
  if (compare.state === 'missing') return 'chưa có golden'
  return compare.state === 'match' ? 'khớp' : 'lệch'
}

/** The screen's elements, measured in a throwaway page at 1x — the crop's space. */
async function measureElements(browser: Browser, url: string, device: Device): Promise<DomElement[]> {
  const cdp = browser.cdp
  const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  cdp.attach(sessionId)
  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    // 1x: a crop box is device points, and the pipeline measures at 1x too
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: device.width,
      height: device.height,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await cdp.send('Page.navigate', { url })
    await waitForHeight(cdp)
    const measured = await evaluate(cdp, ELEMENTS_JS)
    if (!Array.isArray(measured) || measured.length === 0) {
      throw new Error(`element: ${url} produced no measurable layout`)
    }
    return measured as DomElement[]
  } finally {
    cdp.attach(null)
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {})
  }
}

/**
 * `--element <query>` (write) and `--element-check <query>` (compare only)
 * over every selected render.
 *
 * The query is resolved against the composed document: one token matches any
 * name the element answers to (stem, `data-asset`, class), and a dot-separated
 * set requires all of them on the SAME element — `pw-card` alone matches five
 * elements on seasonal-sale, so a pin that silently retargets the first
 * lookalike is a lie. The crop comes from `scripts/export/element.ts`, the
 * module the board's dev endpoint drives, so a CLI crop and a panel crop of one
 * element are the same pixels, keyed by the pipeline's own stem for it — the
 * identity the board holds for its selection.
 *
 * Write mode keeps the store current: first match wins and the other matches
 * are printed. Check mode writes nothing and treats every non-match as a
 * failure — `lệch`, a spec-digest change, a missing golden, an ambiguous match
 * and no match at all all exit 1, because a green that never measured anything
 * is a lie.
 *
 * Records land under the project that owns the screen (`resolveGoldenDir`),
 * not under the run's `--out`-style dir: the board reads element goldens from
 * its own project, and a golden the panel cannot find is a golden that does
 * not exist. The screen records keep their existing dir, untouched.
 *
 * Returns false when check mode found a failing render.
 */
async function runElementGoldens(args: {
  options: Options
  browser: Browser
  origin: string
  screens: string[]
  devicesFor: (screenId: string) => string[]
  themes: string[]
  projectOf: (screenId: string) => string
  check: boolean
}): Promise<boolean> {
  const query = args.options.element as string
  const tokens = query.split('.').filter(Boolean)
  const session = await openElementSession()
  // one manifest per store dir: two screens of two projects are two stores
  const manifests = new Map<string, GoldenManifest>()
  let renders = 0
  let failed = 0
  try {
    for (const screenId of args.screens) {
      const goldenDir = path.resolve(ROOT, resolveGoldenDir({ projects: [args.projectOf(screenId)] }))
      for (const deviceId of args.devicesFor(screenId)) {
        const device = getDevice(deviceId)
        for (const theme of args.themes) {
          const render = `${screenId}--${deviceId}--${theme}`
          const url = `${args.origin}/screen/${render}`
          const measured = await measureElements(args.browser, url, device)
          const named = measured.map((element) => ({ element, names: elementNames(element) }))
          const hits = named
            .filter((candidate) => tokens.every((token) => candidate.names.includes(token)))
            .map((candidate) => candidate.element)
          if (hits.length === 0) {
            const available = [...new Set(named.flatMap((candidate) => candidate.names))].sort()
            throw new Error(`--element ${query}: no element on ${render}.\n  available: ${available.join(', ')}`)
          }
          if (args.check && hits.length > 1) {
            throw new Error(
              `--element ${query}: ${hits.length} elements match on ${render} — pin the class set, never the first lookalike.\n` +
                hits.map((hit) => `  candidate: ${describeElement(hit)}`).join('\n'),
            )
          }
          const first = hits[0]
          // write mode reports the match instead of hiding it: two elements of
          // one class are two different golden values
          if (!args.check) {
            for (const other of hits.slice(1)) {
              console.log(`  also matched on ${screenId}: ${describeElement(other)}`)
            }
          }

          // the element's own box goes in twice: as the box to resolve from and
          // as the single ancestor box the region is unioned with, so whichever
          // node the probe lands on, the crop is the matched element (+pad)
          const crop = await session.crop({
            screen: screenId,
            box: first.box,
            device: deviceId,
            theme: theme as 'light' | 'dark',
            ancestors: [first.box],
            ancestorLevels: 1,
            padPt: ELEMENT_PAD_PT,
            padPct: null,
            scale: args.options.scale,
          })
          // deepest first: the matched element itself, or the deepest node that
          // still fills exactly the box that was measured for it
          const chain = [...crop.ancestors, crop.element].filter((node): node is ElementNode => node !== null)
          const node = chain.reverse().find(
            (candidate) =>
              Math.abs(candidate.box.x - first.box.x) < BOX_TOLERANCE_PT &&
              Math.abs(candidate.box.y - first.box.y) < BOX_TOLERANCE_PT &&
              Math.abs(candidate.box.w - first.box.w) < BOX_TOLERANCE_PT &&
              Math.abs(candidate.box.h - first.box.h) < BOX_TOLERANCE_PT,
          )
          if (!node) {
            throw new Error(
              `--element ${query}: the crop of ${render} resolved no element at the measured box`,
            )
          }

          const stem = elementStem(node)
          const key = elementGoldenKey({ screen: screenId, device: deviceId, theme, stem })
          // compare first, write second: the verdict is about the golden that
          // was there before this run, which is the only useful reading
          const golden = loadElementGolden(goldenDir, key)
          const verdict = compareElementGolden(golden?.record, crop.png, crop.payload)
          const head =
            `element ${key}  clip ${crop.clip.x},${crop.clip.y} ${crop.clip.width}×${crop.clip.height}pt  ` +
            `crop ${verdictLabel(verdict)} (d=${verdict.distance ?? '—'})  ` +
            `spec ${verdict.specMatch === null ? '—' : verdict.specMatch ? 'khớp' : 'lệch'}`

          if (args.check) {
            renders++
            // both halves fail the pin: a corner tweak the coarse dHash cannot
            // see is still a style change, which is what the digest is for
            if (verdict.state !== 'match' || verdict.specMatch === false) failed++
            // the hashes are the evidence: on a `lệch` say which dHash moved
            console.log(
              verdict.state === 'match'
                ? head
                : `${head}  phash ${golden?.record.phash ?? '—'}→${phashPng(crop.png)}`,
            )
            if (verdict.state === 'match' && verdict.specMatch === false) {
              console.log('  note: the crop is unchanged but the declared style moved — that is why this pin fails')
            }
            continue
          }

          const record = buildElementGoldenRecord({
            identity: { screen: screenId, device: deviceId, theme, stem, scale: args.options.scale },
            png: crop.png,
            payload: crop.payload,
            pngFile: `${key}.png`,
          })
          saveElementGolden(goldenDir, record, crop.png)
          manifests.set(goldenDir, upsertElementRecord(manifests.get(goldenDir) ?? loadManifest(goldenDir), record))
          console.log(`${head}  ${display(path.join(goldenDir, record.png))}`)
          console.log(`  ${JSON.stringify(record)}`)
        }
      }
    }
    if (args.check) {
      console.log(`element check: ${renders} render(s), ${failed} failed`)
      return failed === 0
    }
    for (const [dir, manifest] of manifests) {
      saveManifest(dir, manifest)
      console.log(`${Object.keys(manifest.elements ?? {}).length} element golden record(s) → ${display(dir)}/`)
    }
    return true
  } finally {
    await session.close()
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  // One registry for the whole run: the same discovery the board reads, so a
  // file added under project/ is exported without a codegen or manifest edit.
  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    fail(`project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }
  const screenById = new Map(registry.screens.map((screen) => [screen.id, screen]))
  const allScreens = registry.screens.map((screen) => screen.id)

  if (options.screens.length === 0 && options.devices.length === 0) {
    console.log('screens:')
    for (const screen of registry.screens) console.log(`  ${screen.id.padEnd(20)} ${screen.title}`)
    console.log('projects:')
    for (const project of registry.projects)
      console.log(`  ${project.id.padEnd(20)} ${project.title} (${project.screenIds.length} screens)`)
    console.log('devices:')
    for (const device of DEVICES) console.log(`  ${device.id.padEnd(20)} ${device.name}`)
    return
  }

  // --project unions its screens into the export set (still compatible with --screen)
  if (options.projects.length > 0) {
    const fromProjects: string[] = []
    for (const pid of options.projects) {
      const project = registry.projects.find((p) => p.id === pid)
      if (!project) fail(`unknown project "${pid}". Try --list`)
      fromProjects.push(...project.screenIds)
    }
    const explicit = options.screens.includes('all') ? [] : options.screens
    const merged = [...explicit, ...fromProjects]
    options.screens = merged.length ? [...new Set(merged)] : ['all']
  }

  const screens = options.screens.includes('all') ? allScreens : options.screens
  // No explicit --device: each screen renders at its own header deviceId
  // (`<!-- pc {"deviceId":"widget-small"} -->`), falling back to reference.
  // An explicit --device (even once) overrides every screen, so a phone export
  // and a widget export of the same screen never silently share a filename.
  const explicitDeviceIds = options.explicitDevices ? options.devices : null
  const devicesFor = (screenId: string): string[] => {
    if (explicitDeviceIds) return explicitDeviceIds.includes('all') ? DEVICES.map((d) => d.id) : explicitDeviceIds
    return [screenById.get(screenId)?.deviceId ?? 'reference']
  }
  const themes = options.themes.includes('all') ? ['light', 'dark'] : options.themes
  for (const id of screens) {
    if (!allScreens.includes(id)) fail(`unknown screen "${id}". Try --list`)
  }
  const knownDevice = (id: string): boolean => DEVICES.some((device) => device.id === id)
  if (explicitDeviceIds && !explicitDeviceIds.includes('all')) {
    for (const id of explicitDeviceIds) {
      if (!knownDevice(id)) fail(`unknown device "${id}". Try --list`)
    }
  }
  for (const id of themes) {
    if (id !== 'light' && id !== 'dark') fail(`unknown theme "${id}". Try --list`)
  }

  const sharedStyles = await Promise.all(
    STYLESHEETS.map((name) => readFile(path.join(SCREENS_DIR, name), 'utf8')),
  )
  const outDir = path.resolve(ROOT, options.out)
  // check mode writes nothing at all — no output dir, no PNGs, no manifest
  if (!options.elementCheck) await mkdir(outDir, { recursive: true })

  // compose everything up front so the site can serve it by URL
  const documents = new Map<string, string>()
  for (const screenId of screens) {
    const screen = screenById.get(screenId)
    if (!screen) fail(`unknown screen "${screenId}". Try --list`)
    // shared stylesheets come from src/screens/, then the owning project's
    // tokens.css — the same order the board uses.
    const html = screen.html
    const projectTokens = registry.tokens[screen.projectId] ?? null
    const components: Record<string, string> = {}
    for (const component of registry.components) {
      if (component.project !== screen.projectId) continue
      components[component.id] = component.html
    }
    const stylesheets = projectTokens ? [...sharedStyles, projectTokens] : sharedStyles
    for (const deviceId of devicesFor(screenId)) {
      if (!knownDevice(deviceId)) fail(`unknown device "${deviceId}". Try --list`)
      const device = getDevice(deviceId)
      // no bridge: an export carries no measurement scaffolding
      for (const theme of themes) {
        documents.set(
          `${screenId}--${deviceId}--${theme}`,
          composeScreenDoc({
            html,
            device,
            stylesheets,
            bridgeJs: null,
            lightStatusBar: screen.lightStatusBar,
            theme: theme as 'light' | 'dark',
            components,
          }),
        )
      }
    }
  }

  const site = await startSite(documents, PUBLIC_DIR)
  const browser = await launch()
  let written = 0
  // golden store only exists when flagged; plain exports never touch it
  const goldenDir = options.golden ? path.resolve(ROOT, resolveGoldenDir(options)) : null
  let manifest = goldenDir ? loadManifest(goldenDir) : null
  try {
    // compare-only: no screen renders, no writes — only the pinned elements
    if (options.elementCheck) {
      const ok = await runElementGoldens({
        options,
        browser,
        origin: site.origin,
        screens,
        devicesFor,
        themes,
        projectOf: (screenId) => screenById.get(screenId)?.projectId ?? '',
        check: true,
      })
      if (!ok) process.exitCode = 1
      return
    }

    for (const screenId of screens) {
      const screenDevices = devicesFor(screenId)
      for (const deviceId of screenDevices) {
        const device = getDevice(deviceId)
        for (const theme of themes) {
          const url = `${site.origin}/screen/${screenId}--${deviceId}--${theme}`
          const png = await renderPng(browser.cdp, url, device.width, device.height, options.scale, options.full)

          // an explicitly named device always keeps its suffix: without this
          // a phone export and an ipad-11 export of one screen land on the
          // same filename and the second silently overwrites the first
          const multiDevice = screenDevices.length > 1 || options.explicitDevices
          const file = path.join(
            outDir,
            exportFileName(screenId, deviceId, theme, options.scale, multiDevice, options.full),
          )
          await writeFile(file, png)
          written++
          // PNG IHDR: width at byte 16, height at byte 20, big-endian
          const pngWidth = png.readUInt32BE(16)
          const pngHeight = png.readUInt32BE(20)
          if (goldenDir && manifest) {
            const goldens = path.join(
              goldenDir,
              exportFileName(screenId, deviceId, theme, options.scale, true, options.full),
            )
            await mkdir(goldenDir, { recursive: true })
            await writeFile(goldens, png)
            manifest = upsertRecord(
              manifest,
              buildGoldenRecord({
                screen: screenId,
                device: deviceId,
                theme,
                scale: options.scale,
                full: options.full,
                file: path.basename(goldens),
                png,
                width: pngWidth,
                height: pngHeight,
                timestamp: new Date().toISOString(),
              }),
            )
          }
          console.log(
            `${display(file)}  ${pngWidth}×${pngHeight}  ${(png.length / 1024).toFixed(0)} KB`,
          )
        }
      }
    }

    // element goldens ride on the same store; absent without --element, so a
    // screen-only --golden stays exactly what it was
    if (options.element) {
      await runElementGoldens({
        options,
        browser,
        origin: site.origin,
        screens,
        devicesFor,
        themes,
        projectOf: (screenId) => screenById.get(screenId)?.projectId ?? '',
        check: false,
      })
    }
  } finally {
    await shutdown(browser)
    await site.close()
  }

  console.log(`\n${written} file${written === 1 ? '' : 's'} → ${display(outDir)}/`)
  if (goldenDir && manifest) {
    saveManifest(goldenDir, manifest)
    console.log(`${Object.keys(manifest.records).length} golden record(s) → ${display(goldenDir)}/`)
  }
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error))
})
