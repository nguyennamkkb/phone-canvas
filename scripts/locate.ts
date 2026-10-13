#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Locate the component at a point, read its spec, and shoot its region.
 *
 *   npm run locate -- --screen home-today --x 195 --y 640
 *   npm run locate -- --screen home-today --box 40,300,310,120 --pad-pct 0.1 --ancestors 1
 *   npm run locate -- --screen home-today --box 0,120,390,300 --children
 *
 * Point (--x/--y) and box (--box) are in points, origin at the top-left of the
 * device screen (status bar included) — the same coordinate space the panel
 * reports in Khung x/y. Output is two files side by side:
 *
 *   <screen>-locate-<x>x<y>@<scale>x.png   the element's region (pad around it)
 *   <screen>-locate-<x>x<y>.json           Copy-JSON-shaped spec + point + box
 *
 * The pipeline itself lives in scripts/export/element.ts — the same module the
 * board's dev endpoint calls, so a crop from the CLI and a crop from the board
 * can never disagree. This file is argument parsing, file naming and printing.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { isKnownDevice } from '../src/frame/devices.ts'
import { scanProjects } from './scan-projects.ts'
import { openElementSession } from './export/element.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const HELP = `
Locate a component by point, read its spec, shoot its region.

  --screen <id>   screen id (required). Try --list
  --x <pt>        point x in points, from the device top-left
  --y <pt>        point y in points, from the device top-left
  --box <x,y,w,h> element box in points, alternative to --x/--y (wins)
  --pad <pt>      padding around the element in the shot      (default: 24)
  --pad-pct <n>   padding as a fraction of the box's larger side (e.g. 0.1);
                  wins over --pad when given
  --ancestors <n> ancestor levels to include in the region    (default: 0)
  --children      one PNG + JSON per direct child, not one region
  --hide <sel>    hide elements matching the selector before the shot
                  (repeatable; e.g. --hide ".ob-float")
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
  const o = {
    screen: null,
    x: null,
    y: null,
    box: null,
    pad: 24,
    padPct: null,
    ancestors: 0,
    children: false,
    hide: [] as string[],
    scale: 2,
    device: 'reference',
    theme: 'light',
    out: 'exports',
    list: false,
  }
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
      case '--children':
        o.children = true
        break
      case '--hide':
        o.hide.push(next())
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
      case '--box': {
        const parts = next().split(',').map((p) => Number(p.trim()))
        if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0)) {
          throw new Error('--box must be x,y,w,h in points (numbers >= 0)')
        }
        o.box = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] }
        break
      }
      case '--pad': {
        const n = Number(next())
        if (!Number.isFinite(n) || n < 0) throw new Error('--pad must be a number >= 0')
        o.pad = n
        break
      }
      case '--pad-pct': {
        const n = Number(next())
        if (!Number.isFinite(n) || n < 0) throw new Error('--pad-pct must be a fraction >= 0 (e.g. 0.1)')
        o.padPct = n
        break
      }
      case '--ancestors': {
        const n = Number(next())
        if (!Number.isInteger(n) || n < 0) throw new Error('--ancestors must be an integer >= 0')
        o.ancestors = n
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
  if (options.box === null && (options.x === null || options.y === null)) {
    fail('--x and --y are required (points, from the device top-left)')
  }
  if (!isKnownDevice(options.device)) fail(`unknown device "${options.device}"`)
  if (options.theme !== 'light' && options.theme !== 'dark') fail('unknown theme (want: light | dark)')

  const screen = registry.screens.find((s) => s.id === options.screen)
  if (!screen) fail(`unknown screen "${options.screen}". Try --list`)

  // --x/--y is a zero-sized box at the point: the module hits the element that
  // contains it, and the payload's point comes back as exactly those numbers.
  const box = options.box ?? { x: options.x, y: options.y, w: 0, h: 0 }
  const input = {
    screen: screen.id,
    box,
    device: options.device,
    theme: options.theme,
    padPt: options.pad,
    padPct: options.padPct,
    ancestorLevels: options.ancestors,
    scale: options.scale,
    hide: options.hide,
  }

  const outDir = path.resolve(ROOT, options.out)
  await mkdir(outDir, { recursive: true })

  const session = await openElementSession()
  try {
    if (options.children) {
      const result = await session.exportChildren({ ...input, outDir })
      for (const file of result.files) {
        console.log(`${path.relative(ROOT, file.png)}  ${path.relative(ROOT, file.json)}`)
      }
      console.log(`children ${result.count} written to ${path.relative(ROOT, outDir)}`)
      return
    }

    const result = await session.crop(input)

    // the name keeps the point the user asked about, not the element the hit
    // resolved to — the two differ as soon as a screen is edited
    const tag = options.box
      ? `${screen.id}-locate-${box.x}x${box.y}-${box.w}x${box.h}`
      : `${screen.id}-locate-${options.x}x${options.y}`
    const pngFile = path.join(outDir, `${tag}@${options.scale}x.png`)
    const jsonFile = path.join(outDir, `${tag}.json`)
    await writeFile(pngFile, result.png)
    // `png` names the file that was actually written, not the module default
    const payload = { ...result.payload, png: path.basename(pngFile) }
    await writeFile(jsonFile, JSON.stringify(payload, null, 2) + '\n')

    const spec = payload.selectedElement
    if (spec) {
      console.log(`hit   ${spec.role} · ${spec.label}`)
      console.log(`box   ${spec.box.x}, ${spec.box.y} · ${spec.box.w}×${spec.box.h} pt`)
      console.log(`shape ${spec.swiftUiShape}`)
      console.log(`depth ${spec.depth} · ${result.ancestors.length} ancestors · ${payload.candidates} nodes captured`)
    } else {
      console.log(`miss  no component at ${box.x + box.w / 2}, ${box.y + box.h / 2} (OS chrome or empty area)`)
      console.log(`nodes ${payload.candidates} captured — nothing contains the point`)
    }
    console.log(`${path.relative(ROOT, pngFile)}  ${payload.pngWidth}×${payload.pngHeight}`)
    console.log(path.relative(ROOT, jsonFile))
  } finally {
    await session.close()
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
