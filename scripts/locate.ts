#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Locate the component at a point, read its spec, and shoot its region.
 *
 *   npm run locate -- --screen home-today --x 195 --y 640
 *   npm run locate -- --screen home-today --x 195 --y 640 --pad 32 --scale 2 --out /tmp/locate
 *
 * Point (--x/--y) is in points, origin at the top-left of the device screen
 * (status bar included) — the same coordinate space the panel reports in
 * Khung x/y. Output is two files side by side:
 *
 *   <screen>-locate-<x>x<y>@<scale>x.png   the element's region (pad around it)
 *   <screen>-locate-<x>x<y>.json           Copy-JSON-shaped spec + point + box
 *
 * Zero dependencies: drives the Chrome already on the machine over CDP,
 * composes the document with src/extractor/compose.ts (the same module the
 * app and the exporter use), captures with the real src/extractor/bridge.js,
 * and interprets with src/spec/infer.ts. Nothing here owns a rule.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEVICES, getDevice } from '../src/frame/devices.ts'
import { composeScreenDoc } from '../src/extractor/compose.ts'
import { buildSpec } from '../src/spec/infer.ts'
import { scanProjects } from './scan-projects.ts'
import { launch, shutdown } from './export/cdp.ts'
import { startSite } from './export/site.ts'
import { evaluate, waitForHeight } from './export/render.ts'
import { sleep } from './export/chrome.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS_DIR = path.join(ROOT, 'src/screens')
const PUBLIC_DIR = path.join(ROOT, 'public')
const STYLESHEETS = ['tokens.css', 'icons.css', 'icon-set.css']

const HELP = `
Locate a component by point, read its spec, shoot its region.

  --screen <id>   screen id (required). Try --list
  --x <pt>        point x in points, from the device top-left (required)
  --y <pt>        point y in points, from the device top-left (required)
  --pad <pt>      padding around the element in the shot      (default: 24)
  --scale <n>     pixel density multiplier                    (default: 2)
  --device <id>   device preset                               (default: reference)
  --theme <mode>  light | dark                                (default: light)
  --out <dir>     output directory                            (default: exports)
  --list          print available screens, then exit
  --help          print this message
`.trim()

function fail(message) {
  console.error(`locate: ${message}`)
  process.exit(1)
}

function parse(argv) {
  const o = { screen: null, x: null, y: null, pad: 24, scale: 2, device: 'reference', theme: 'light', out: 'exports', list: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => {
      const v = argv[++i]
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`)
      return v
    }
    switch (a) {
      case '--help':
      case '-h':
        console.log(HELP)
        process.exit(0)
      case '--list':
        o.list = true
        break
      case '--screen':
        o.screen = next()
        break
      case '--x':
      case '--y': {
        const n = Number(next())
        if (!Number.isFinite(n) || n < 0) throw new Error(`${a} must be a number >= 0 (points)`)
        o[a.slice(2)] = n
        break
      }
      case '--pad': {
        const n = Number(next())
        if (!Number.isFinite(n) || n < 0) throw new Error('--pad must be a number >= 0')
        o.pad = n
        break
      }
      case '--scale': {
        const n = Number(next())
        if (!Number.isFinite(n) || n <= 0) throw new Error('--scale must be a positive number')
        o.scale = n
        break
      }
      case '--device':
        o.device = next()
        break
      case '--theme':
        o.theme = next()
        break
      case '--out':
        o.out = next()
        break
      default:
        throw new Error(`unknown option: ${a}`)
    }
  }
  return o
}

/** deepest node containing the point; ties break toward the smallest box */
function hitTest(nodes, x, y) {
  let best = null
  for (const n of nodes) {
    const b = n.box
    if (x < b.x || x >= b.x + b.w || y < b.y || y >= b.y + b.h) continue
    if (!best || n.depth > best.depth || (n.depth === best.depth && b.w * b.h < best.box.w * best.box.h)) {
      best = n
    }
  }
  return best
}

async function main() {
  let options
  try {
    options = parse(process.argv.slice(2))
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }

  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    fail(`project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }

  if (options.list || !options.screen) {
    for (const screen of registry.screens) console.log(`  ${screen.id.padEnd(20)} ${screen.title}`)
    if (options.list) return
    fail('--screen is required. Try --list')
  }
  if (options.x === null || options.y === null) fail('--x and --y are required (points, from the device top-left)')
  if (!DEVICES.some((d) => d.id === options.device)) fail(`unknown device "${options.device}"`)
  if (options.theme !== 'light' && options.theme !== 'dark') fail('unknown theme (want: light | dark)')

  const screen = registry.screens.find((s) => s.id === options.screen)
  if (!screen) fail(`unknown screen "${options.screen}". Try --list`)

  const device = getDevice(options.device)
  const sharedStyles = await Promise.all(STYLESHEETS.map((n) => readFile(path.join(SCREENS_DIR, n), 'utf8')))
  const bridgeJs = await readFile(path.join(ROOT, 'src/extractor/bridge.js'), 'utf8')
  const projectTokens = registry.tokens[screen.projectId] ?? null
  const components = {}
  for (const c of registry.components) {
    if (c.project === screen.projectId) components[c.id] = c.html
  }
  const stylesheets = projectTokens ? [...sharedStyles, projectTokens] : sharedStyles

  // bridge included: we need its real capture, not a clean export document.
  // Its hover overlay stays display:none without input, so the shot is clean.
  const key = `${screen.id}--${device.id}--${options.theme}`
  const documents = new Map([
    [key, composeScreenDoc({
      html: screen.html,
      device,
      stylesheets,
      bridgeJs,
      lightStatusBar: screen.lightStatusBar,
      theme: options.theme,
      components,
    })],
  ])

  const outDir = path.resolve(ROOT, options.out)
  await mkdir(outDir, { recursive: true })

  const site = await startSite(documents, PUBLIC_DIR)
  const browser = await launch()
  try {
    const { targetId } = await browser.cdp.send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await browser.cdp.send('Target.attachToTarget', { targetId, flatten: true })
    browser.cdp.attach(sessionId)
    try {
      await browser.cdp.send('Page.enable')
      await browser.cdp.send('Runtime.enable')
      await browser.cdp.send('Emulation.setDeviceMetricsOverride', {
        width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false,
      })
      await browser.cdp.send('Page.navigate', { url: `${site.origin}/screen/${key}` })
      const contentHeight = await waitForHeight(browser.cdp)

      // The bridge posts its spec to window.parent — here the page IS the top
      // window, so listen for our own message then force one fresh capture.
      const payload = await evaluate(
        browser.cdp,
        `(async () => new Promise((resolve, reject) => {
          const to = setTimeout(() => reject(new Error('timeout')), 8000);
          const h = (e) => {
            const d = e.data;
            if (d && d.pc === true && d.type === 'spec' && Array.isArray(d.nodes)) {
              clearTimeout(to);
              removeEventListener('message', h);
              resolve({ nodes: d.nodes, device: d.device || null });
            }
          };
          addEventListener('message', h);
          postMessage({ pc: true, type: 'recapture', token: '' }, '*');
        }))()`,
      )
      const nodes = payload?.nodes ?? []
      if (nodes.length === 0) fail('bridge captured nothing — the screen produced no layout')

      const raw = hitTest(nodes, options.x, options.y)
      const specList = buildSpec(nodes)
      const byId = new Map(specList.map((s) => [s.id, s]))
      const element = raw ? byId.get(raw.id) ?? null : null
      const ancestors = []
      if (element) {
        let cur = byId.get(element.parent)
        while (cur) {
          ancestors.unshift(cur)
          cur = cur.parent ? byId.get(cur.parent) : undefined
        }
      }

      // region = element box + pad (or a pad-sized square around a bare point),
      // clamped to the document so the clip never exceeds the page
      const focus = element
        ? element.box
        : { x: options.x, y: options.y, w: 0, h: 0 }
      const clip = {
        x: Math.max(0, Math.floor(Math.min(focus.x - options.pad, device.width - 1))),
        y: Math.max(0, Math.floor(Math.min(focus.y - options.pad, contentHeight - 1))),
        width: 1,
        height: 1,
      }
      clip.width = Math.max(1, Math.floor(Math.min(focus.x + focus.w + options.pad, device.width) - clip.x))
      clip.height = Math.max(1, Math.floor(Math.min(focus.y + focus.h + options.pad, contentHeight) - clip.y))

      await browser.cdp.send('Emulation.setDeviceMetricsOverride', {
        width: device.width, height: contentHeight, deviceScaleFactor: options.scale, mobile: false,
      })
      await sleep(80)
      const shot = await browser.cdp.send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } })
      const png = Buffer.from(shot.data, 'base64')

      const tag = `${screen.id}-locate-${options.x}x${options.y}`
      const pngFile = path.join(outDir, `${tag}@${options.scale}x.png`)
      const jsonFile = path.join(outDir, `${tag}.json`)
      await writeFile(pngFile, png)

      const payload1 = {
        version: 1,
        screen: screen.id,
        device: device.id,
        theme: options.theme,
        point: { x: options.x, y: options.y },
        hit: !!element,
        selectedElement: element,
        ancestors: ancestors.map((a) => ({ id: a.id, role: a.role, label: a.label, box: a.box })),
        candidates: nodes.length,
        png: path.basename(pngFile),
        pngClip: clip,
        pngWidth: png.readUInt32BE(16),
        pngHeight: png.readUInt32BE(20),
      }
      await writeFile(jsonFile, JSON.stringify(payload1, null, 2) + '\n')

      if (element) {
        console.log(`hit   ${element.role} · ${element.label}`)
        console.log(`box   ${element.box.x}, ${element.box.y} · ${element.box.w}×${element.box.h} pt`)
        console.log(`shape ${element.swiftUiShape}`)
        console.log(`depth ${element.depth} · ${ancestors.length} ancestors · ${nodes.length} nodes captured`)
      } else {
        console.log(`miss  no component at ${options.x}, ${options.y} (OS chrome or empty area)`)
        console.log(`nodes ${nodes.length} captured — nothing contains the point`)
      }
      console.log(`${path.relative(ROOT, pngFile)}  ${payload1.pngWidth}×${payload1.pngHeight}`)
      console.log(path.relative(ROOT, jsonFile))
    } finally {
      browser.cdp.attach(null)
      await browser.cdp.send('Target.closeTarget', { targetId }).catch(() => {})
    }
  } finally {
    await shutdown(browser)
    await site.close()
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
