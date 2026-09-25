#!/usr/bin/env node
/**
 * Export every screen to PNG, at any device size and scale.
 *
 *   npm run export
 *   npm run export -- --screen journal-list --scale 3
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
import { SCREEN_FILES } from '../src/screens/manifest.ts'
import { COMPONENT_FILES } from '../src/components/manifest.ts'
import { BUILTIN_PROJECTS } from '../src/projects/builtin.ts'
import { composeScreenDoc } from '../src/extractor/compose.ts'
import { exportFileName, parseArgs } from './export/cli.ts'
import { launch, shutdown } from './export/cdp.ts'
import { startSite } from './export/site.ts'
import { renderPng } from './export/render.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS_DIR = path.join(ROOT, 'src/screens')
const PUBLIC_DIR = path.join(ROOT, 'public')
const STYLESHEETS = ['tokens.css', 'icons.css', 'icon-set.css']

/**
 * Screen identity comes from `src/screens/manifest.ts`, never from the
 * directory listing. Scanning for `*.html` gives a second, drifting source of
 * ids: a file that exists but is not registered would export under a name the
 * board has never heard of, and a rename would silently change an id.
 */
const SCREEN_BY_ID = new Map(SCREEN_FILES.map((screen) => [screen.id, screen]))

async function listScreens(): Promise<string[]> {
  return SCREEN_FILES.map((screen) => screen.id)
}

function fail(message: string): never {
  console.error(`export: ${message}`)
  process.exit(1)
}

/** relative inside the project, absolute outside it — never a `../../..` ladder */
function display(target: string): string {
  const relative = path.relative(ROOT, target)
  return relative.startsWith('..') ? target : relative
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const allScreens = await listScreens()

  if (options.screens.length === 0 && options.devices.length === 0) {
    console.log('screens:')
    for (const screen of SCREEN_FILES) console.log(`  ${screen.id.padEnd(20)} ${screen.title}`)
    console.log('projects:')
    for (const project of BUILTIN_PROJECTS)
      console.log(`  ${project.id.padEnd(20)} ${project.title} (${project.screenIds.length} screens)`)
    console.log('devices:')
    for (const device of DEVICES) console.log(`  ${device.id.padEnd(20)} ${device.name}`)
    return
  }

  // --project unions its screens into the export set (still compatible with --screen)
  if (options.projects.length > 0) {
    const fromProjects: string[] = []
    for (const pid of options.projects) {
      const project = BUILTIN_PROJECTS.find((p) => p.id === pid)
      if (!project) fail(`unknown project "${pid}". Try --list`)
      fromProjects.push(...project.screenIds)
    }
    const explicit = options.screens.includes('all') ? [] : options.screens
    const merged = [...explicit, ...fromProjects]
    options.screens = merged.length ? [...new Set(merged)] : ['all']
  }

  const screens = options.screens.includes('all') ? allScreens : options.screens
  const devices = options.devices.includes('all')
    ? DEVICES.map((device) => device.id)
    : options.devices
  const themes = options.themes.includes('all') ? ['light', 'dark'] : options.themes

  for (const id of screens) {
    if (!allScreens.includes(id)) fail(`unknown screen "${id}". Try --list`)
  }
  for (const id of devices) {
    if (!DEVICES.some((device) => device.id === id)) fail(`unknown device "${id}". Try --list`)
  }
  for (const id of themes) {
    if (id !== 'light' && id !== 'dark') fail(`unknown theme "${id}". Try --list`)
  }

  const sharedStyles = await Promise.all(
    STYLESHEETS.map((name) => readFile(path.join(SCREENS_DIR, name), 'utf8')),
  )
  const outDir = path.resolve(ROOT, options.out)
  await mkdir(outDir, { recursive: true })

  // compose everything up front so the site can serve it by URL
  const documents = new Map<string, string>()
  for (const screenId of screens) {
    const screen = SCREEN_BY_ID.get(screenId)
    if (!screen) fail(`unknown screen "${screenId}". Try --list`)
    // screen.file is relative to the repo root (project/<id>/<name>.html);
    // shared stylesheets still come from src/screens/, then the owning
    // project's tokens.css — the same order the board uses.
    const html = await readFile(path.join(ROOT, screen.file), 'utf8')
    const owner = BUILTIN_PROJECTS.find((p) => p.screenIds.includes(screenId))
    const projectTokens = owner
      ? await readFile(path.join(ROOT, 'project', owner.id, 'tokens.css'), 'utf8').catch(
          () => null,
        )
      : null
    // component-system: the same files the board loads via `?raw`, read here
    // off disk so an export expands `@component` exactly like the board does.
    const components: Record<string, string> = {}
    if (owner) {
      for (const component of COMPONENT_FILES) {
        if (component.project !== owner.id) continue
        components[component.id] = await readFile(path.join(ROOT, component.file), 'utf8')
      }
    }
    const stylesheets = projectTokens ? [...sharedStyles, projectTokens] : sharedStyles
    for (const deviceId of devices) {
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
  try {
    for (const screenId of screens) {
      for (const deviceId of devices) {
        const device = getDevice(deviceId)
        for (const theme of themes) {
          const url = `${site.origin}/screen/${screenId}--${deviceId}--${theme}`
          const png = await renderPng(browser.cdp, url, device.width, device.height, options.scale)

          // an explicitly named device always keeps its suffix: without this
          // a phone export and an ipad-11 export of one screen land on the
          // same filename and the second silently overwrites the first
          const multiDevice = devices.length > 1 || options.explicitDevices
          const file = path.join(
            outDir,
            exportFileName(screenId, deviceId, theme, options.scale, multiDevice),
          )
          await writeFile(file, png)
          written++
          // PNG IHDR: width at byte 16, height at byte 20, big-endian
          const pngWidth = png.readUInt32BE(16)
          const pngHeight = png.readUInt32BE(20)
          console.log(
            `${display(file)}  ${pngWidth}×${pngHeight}  ${(png.length / 1024).toFixed(0)} KB`,
          )
        }
      }
    }
  } finally {
    await shutdown(browser)
    await site.close()
  }

  console.log(`\n${written} file${written === 1 ? '' : 's'} → ${display(outDir)}/`)
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error))
})
