#!/usr/bin/env node
/**
 * Export every icon glyph used by the screens to transparent PNGs.
 *
 *   npm run export:icons
 *   npm run export:icons -- --out /tmp/icons --base 24
 *
 * Scans project screens + components for `data-symbol`, resolves each through
 * SYMBOLS in `scripts/icons.ts`, and screenshots the raw SVG with the
 * machine's Chrome (headless, transparent). Zero dependencies — same precedent
 * as `scripts/export.ts`.
 *
 * Output `<out>/<symbol>@<scale>x.png`, scales 1/2/3 of `--base` (24):
 * `house@1x.png` is 24px, `house@3x.png` is 72px.
 */

import { spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { findChrome } from './export/chrome.ts'
import { scanProjects } from './scan-projects.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const SCALES = [1, 2, 3] as const

/** `chevron.left` + 2 -> `chevron.left@2x.png` */
export function iconFileName(symbol: string, scale: number): string {
  return `${symbol}@${scale}x.png`
}

/**
 * Default out dir: explicit `--out` wins; a single `--project` scopes into
 * that project's folder; otherwise the shared root icons folder.
 */
export function resolveOutDir(outFlag: string | undefined, projects: string[]): string {
  if (outFlag !== undefined) return outFlag
  if (projects.length === 1) return `project/${projects[0]}/exports/icons`
  return 'exports/icons'
}

function fail(message: string): never {
  console.error(`export:icons: ${message}`)
  process.exit(1)
}

/** symbol -> svg file, read off the same table the icon generator uses */
async function loadSymbols(): Promise<Record<string, string>> {
  const src = await readFile(path.join(ROOT, 'scripts', 'icons.ts'), 'utf8')
  const body = src.slice(src.indexOf('const SYMBOLS'))
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/^\s*'?(.*?)'?\s*:\s*'([^']+\.svg)'/gm)) {
    out[m[1] as string] = m[2] as string
  }
  return out
}

async function usedSymbols(onlyProject?: string): Promise<string[]> {
  const { registry } = await scanProjects()
  if (onlyProject !== undefined && !registry.projects.some((p) => p.id === onlyProject)) {
    fail(`unknown project "${onlyProject}". Try npm run project -- list`)
  }
  const found = new Set<string>()
  const screens = registry.screens.filter((s) => onlyProject === undefined || s.projectId === onlyProject)
  const components = registry.components.filter((c) => onlyProject === undefined || c.project === onlyProject)
  const both = [...screens.map((s) => s.file), ...components.map((c) => c.file)]
  for (const file of both) {
    const html = await readFile(path.join(ROOT, file), 'utf8')
    for (const m of html.matchAll(/\bdata-symbol\s*=\s*"([^"]+)"/g)) {
      found.add(m[1] as string)
    }
  }
  return [...found].sort()
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log(
      [
        'Export used icon glyphs to transparent PNGs.',
        '',
        '  --project <id>   only that project\u2019s symbols → project/<id>/exports/icons/',
        '  --out <dir>      output directory (default: exports/icons)',
        '  --base <n>       base pixel size, ×1/×2/×3          (default: 24)',
        '',
        'Examples',
        '  npm run export:icons',
        '  npm run export:icons -- --project calo-ai',
      ].join('\n'),
    )
    return
  }
  const valueOf = (flag: string): string | undefined => {
    const i = args.indexOf(flag)
    return i === -1 ? undefined : args[i + 1]
  }
  const projects = args.filter((a, i) => i > 0 && args[i - 1] === '--project' && a !== undefined) as string[]
  const outDir = path.resolve(ROOT, resolveOutDir(valueOf('--out'), projects))
  const baseRaw = valueOf('--base')
  const base = baseRaw === undefined ? 24 : Number(baseRaw)
  if (!Number.isFinite(base) || base <= 0) fail(`--base must be a positive number`)
  let chrome: string
  try {
    chrome = findChrome()
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
  const table = await loadSymbols()
  const symbols = await usedSymbols(projects.length === 1 ? projects[0] : undefined)
  const missing = symbols.filter((s) => !(s in table))
  if (missing.length > 0) fail(`no SVG mapped for: ${missing.join(', ')} (add to SYMBOLS in scripts/icons.ts)`)
  await mkdir(outDir, { recursive: true })
  await mkdir(path.join(tmpdir(), 'phone-canvas-icons'), { recursive: true })
  let n = 0
  for (const symbol of symbols) {
    const svg = await readFile(path.join(ROOT, 'public', 'icons', table[symbol] as string), 'utf8')
    for (const scale of SCALES) {
      const size = base * scale
      const doc =
        `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head>` +
        `<body>${svg}</body></html>`
      const page = path.join(tmpdir(), 'phone-canvas-icons', `${symbol.replace(/[^a-z0-9]+/gi, '_')}.html`)
      await writeFile(page, doc)
      const dest = path.join(outDir, iconFileName(symbol, scale))
      const run = spawnSync(
        chrome,
        [
          '--headless=new',
          '--disable-gpu',
          '--hide-scrollbars',
          `--window-size=${size},${size}`,
          '--default-background-color=00000000',
          `--screenshot=${dest}`,
          pathToFileURL(page).href,
        ],
        { encoding: 'utf8' },
      )
      if (run.status !== 0) fail(`chrome screenshot failed for ${symbol}@${scale}x: ${run.stderr.trim()}`)
      n += 1
    }
  }
  console.log(`${n} files → ${path.relative(ROOT, outDir)}/ (${symbols.length} symbols × ${SCALES.length} scales)`)
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  main().catch((error: unknown) => {
    fail(error instanceof Error ? error.message : String(error))
  })
}
