#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Token lint (v3 gate + token-layers): screens may only name defined tokens,
 * must use a token where one exists, and dual-mode projects must twin colors.
 *
 *   npm run lint:tokens
 *   npm run lint:tokens -- --screen <id>   (only that screen; dark-twin then
 *          checks just that screen's project — same screen-filter pattern)
 *
 * Rules:
 *   error  var(--x) with no definition in the global or project tokens.css
 *          (the --sage-wash class of bug: resolves to guaranteed-invalid)
 *   error  nền .screen root sai: thiếu fallback, ảnh ngoài dự án, hoặc asset
 *          không tồn tại trong project/<id>/assets/
 *   error  no-literal: a hardcoded color/spacing/radius in a screen <style>
 *          block or style="" attribute whose value has an equivalent token
 *          (reports file:line + the var(--*) to use instead)
 *   error  dark-twin: a project :root color token with no twin in a
 *          :root[data-theme='dark'] block (dark would silently show light)
 *   warn   hardcoded hex/rgba colors in screen markup with NO token
 *          equivalent (prefer a token; nothing to suggest)
 *   warn   screen names a global-only color (tier rule: give the project
 *          its own semantic alias instead of borrowing the shared palette)
 *
 * The pure rule helpers (parseModeVars, tokenColorName, noLiteralViolations,
 * darkTwinViolations) are exported for scripts/tokens-lint.test.ts. Color
 * matching mirrors tokenNameForColor in src/tokens/tokens.ts (tuple match,
 * project names first) but is reimplemented here: that module uses Vite
 * `?raw` imports, which this node CLI cannot load.
 *
 * Discovery comes from scripts/scan-projects.ts — the same registry the board
 * and the exporter read, so a lint can never see a different project tree.
 * Warnings never fail; errors exit 1.
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { filterByScreen, parseScreenFilter, printHelpIfRequested, reportNoScreenMatch } from './screen-filter.ts'
import { scanProjects } from './scan-projects.ts'
import { styleDefsOf } from './screen-style.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** global layers in cascade order (core → palettes → vocab), replacing tokens.css */
const GLOBAL_LAYERS = ['core.css', 'palettes.css', 'vocab.css']

const VAR_RE = /var\(\s*(--[a-z0-9-]+)/g
const DEF_RE = /--([a-z0-9-]+)\s*:\s*[^;{}]+;/g
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const RGBA_RE = /rgba?\([^)]*\)/g

/** element-scoped or chrome vars — not design tokens */
const IGNORED = new Set(['--icon'])
const IGNORED_PREFIX = ['--device-', '--safe-', '--status-']

function isTokenVar(name) {
  if (IGNORED.has(name)) return false
  return !IGNORED_PREFIX.some((p) => name.startsWith(p))
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

function isColorValue(value) {
  return /^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\(/i.test(value)
}

/** longhand background declarations off the `.screen` root tag (or null) */
function rootBackgroundOf(html) {
  const tag = /<[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*>/i.exec(html)
  if (!tag) return null
  const style = (/style\s*=\s*"([^"]*)"/i.exec(tag[0]) ?? /style\s*=\s*'([^']*)'/i.exec(tag[0]))?.[1]
  if (!style) return null
  const get = (prop) => {
    const m = new RegExp(`${prop}\\s*:\\s*([^;]*)`, 'i').exec(style)
    return m ? m[1].trim() : ''
  }
  const color = get('background-color')
  const image = get('background-image')
  if (!color && !image) return null
  return {
    index: tag.index,
    color,
    image,
    size: get('background-size'),
    position: get('background-position'),
    repeat: get('background-repeat'),
  }
}

/* ---------------------------------- token-layers rules (exported for tests) -- */

/** spacing scale values with the token to use instead of the literal */
export const SPACING_PX = { 4: '--s1', 8: '--s2', 12: '--s3', 16: '--s4', 20: '--s5', 24: '--s6', 32: '--s8', 40: '--s10' }

/** radius scale values with the token to use instead of the literal */
export const RADIUS_PX = { 8: '--r-sm', 12: '--r-md', 20: '--r-lg', 28: '--r-xl', 999: '--r-full' }

const COLOR_PROPS = {
  color: true,
  'background-color': true,
  'border-color': true,
  'border-top-color': true,
  'border-right-color': true,
  'border-bottom-color': true,
  'border-left-color': true,
  'outline-color': true,
  fill: true,
  stroke: true,
}
const SPACING_PROPS = {
  padding: true,
  'padding-top': true,
  'padding-right': true,
  'padding-bottom': true,
  'padding-left': true,
  margin: true,
  'margin-top': true,
  'margin-right': true,
  'margin-bottom': true,
  'margin-left': true,
  gap: true,
  'row-gap': true,
  'column-gap': true,
}
const RADIUS_PROPS = {
  'border-radius': true,
  'border-top-left-radius': true,
  'border-top-right-radius': true,
  'border-bottom-right-radius': true,
  'border-bottom-left-radius': true,
}

/** `projectId:--token` → why no dark twin is intended (kept small; prefer twins) */
export const DARK_TWIN_ALLOWLIST = {
  'scratch-widget:--separator':
    'mirrors the global iOS separator byte-for-byte, and the global layers carry no dark twin either — dark falls back to the same value board-wide',
}

/**
 * Split a tokens file into light vars, dark-override vars, and own-twins.
 * Reads EVERY :root[data-theme='dark'] block (including scoped dark rules
 * like `:root[data-theme='dark'] .app-mood`); a `:root, :root[data-theme]`
 * combined rule counts as both. `light` holds everything outside a dark
 * selector (mirroring how whole-file var scans feed tokensOf upstream);
 * `rootLight` holds only :root-level tokens, which is what the dark-twin
 * rule judges — scoped element vars (.screen/…) never participate in
 * :root dark switching. Each entry carries its file line for file:line errors.
 */
export function parseModeVars(css) {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, (s) => ' '.repeat(s.length))
  const light = new Map()
  const rootLight = new Map()
  const dark = new Map()
  const ownTwin = new Set()
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g
  let r
  while ((r = ruleRe.exec(flat)) !== null) {
    const parts = r[1].split(',')
    const hasDark = parts.some((p) => p.includes('data-theme'))
    const hasPlainRoot = parts.some((p) => p.includes(':root') && !p.includes('data-theme'))
    const varRe = /--([a-z0-9-]+)\s*:\s*([^;{}]+);/g
    let m
    while ((m = varRe.exec(r[2])) !== null) {
      const name = `--${m[1]}`
      const entry = { value: m[2].trim(), line: lineOf(flat, r.index + r[1].length + 1 + m.index) }
      if (hasDark && hasPlainRoot) {
        light.set(name, entry)
        rootLight.set(name, entry)
        dark.set(name, entry)
        ownTwin.add(name)
      } else if (hasDark) {
        dark.set(name, entry)
      } else {
        light.set(name, entry)
        if (hasPlainRoot) rootLight.set(name, entry)
      }
    }
  }
  return { light, rootLight, dark, ownTwin }
}

/** Normalize a css color to an rgba tuple (mirrors toRgba in src/tokens/tokens.ts). */
export function toRgbaToken(value) {
  const v = value.trim().toLowerCase()
  if (v === 'transparent') return [0, 0, 0, 0]
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v)
  if (hex?.[1]) {
    const h = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1]
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(v)
  if (!m?.[1]) return null
  const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
  if (parts.length < 3 || parts.slice(0, 3).some((x) => !Number.isFinite(x))) return null
  const a = parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1
  return [Math.round(parts[0]), Math.round(parts[1]), Math.round(parts[2]), a]
}

/**
 * First token name whose light value matches a literal color, or null.
 * `entries` is [[name, value]] in tokensOf precedence (project names first,
 * then global-only) so project aliases win ties the same way the board does.
 */
export function tokenColorName(entries, raw) {
  const target = toRgbaToken(raw)
  if (!target) return null
  for (const [name, value] of entries) {
    const candidate = toRgbaToken(value)
    if (
      candidate &&
      candidate[0] === target[0] &&
      candidate[1] === target[1] &&
      candidate[2] === target[2] &&
      Math.abs(candidate[3] - target[3]) < 0.01
    ) {
      return name
    }
  }
  return null
}

const LITERAL_COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g
const PX_RE = /(-?\d+(?:\.\d+)?)px\b/g

/**
 * Hardcoded color/spacing/radius literals in a screen that have an equivalent
 * token. Scans <style> blocks and style="" attributes (comments blanked so
 * offsets still map to file lines); declarations already on var()/calc() and
 * custom-property definitions (--x: …) are usages-neutral and skipped.
 * Returns {line, message} with the var(--*) fix hint in the message.
 */
export function noLiteralViolations(html, file, entries) {
  const out = []
  const regions = []
  let m
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi
  while ((m = styleRe.exec(html)) !== null) regions.push({ start: m.index + m[0].indexOf(m[1]), css: m[1] })
  const attrRe = /\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi
  while ((m = attrRe.exec(html)) !== null) {
    const body = m[2] ?? m[3]
    regions.push({ start: m.index + m[0].indexOf(body), css: body })
  }
  const declRe = /([a-z-]+)\s*:\s*([^;{}]+);?/gi
  for (const region of regions) {
    const clean = region.css.replace(/\/\*[\s\S]*?\*\//g, (s) => ' '.repeat(s.length))
    declRe.lastIndex = 0
    let d
    while ((d = declRe.exec(clean)) !== null) {
      const prop = d[1].toLowerCase()
      if (prop.startsWith('--')) continue
      const value = d[2].trim()
      if (!value || value.includes('var(') || value.includes('calc(')) continue
      const line = lineOf(html, region.start + d.index)
      if (Object.hasOwn(COLOR_PROPS, prop) || (prop === 'background' && isColorValue(value))) {
        LITERAL_COLOR_RE.lastIndex = 0
        const lit = LITERAL_COLOR_RE.exec(value)?.[0]
        if (lit && !/^(transparent|currentcolor|inherit)$/i.test(lit)) {
          const token = tokenColorName(entries, lit)
          if (token) out.push({ line, message: `${file}:${line}  màu cứng ${lit} — dùng var(${token})` })
        }
      } else if (Object.hasOwn(SPACING_PROPS, prop)) {
        PX_RE.lastIndex = 0
        let p
        while ((p = PX_RE.exec(value)) !== null) {
          const n = Number(p[1])
          if (n > 0 && Number.isInteger(n) && Object.hasOwn(SPACING_PX, n)) {
            out.push({ line, message: `${file}:${line}  ${prop} cứng ${p[0]} — dùng var(${SPACING_PX[n]})` })
            break
          }
        }
      } else if (Object.hasOwn(RADIUS_PROPS, prop)) {
        PX_RE.lastIndex = 0
        let p
        while ((p = PX_RE.exec(value)) !== null) {
          const n = Number(p[1])
          if (n > 0 && Number.isInteger(n) && Object.hasOwn(RADIUS_PX, n)) {
            out.push({ line, message: `${file}:${line}  ${prop} cứng ${p[0]} — dùng var(${RADIUS_PX[n]})` })
            break
          }
        }
      }
    }
  }
  return out
}

/**
 * Leftover hardcoded colors with no token equivalent (the historical warning).
 * Custom-property definitions (`--x: …`) are definition-sites, not usages, so
 * matches falling inside one are skipped by span — a literal also used at a
 * real use-site still reports even when the same value is defined somewhere.
 */
export function leftoverHardColors(html: string): string[] {
  const defSpans: Array<[number, number]> = []
  DEF_RE.lastIndex = 0
  let d
  while ((d = DEF_RE.exec(html)) !== null) defSpans.push([d.index, d.index + d[0].length])
  const hard: string[] = []
  const seen = new Set<string>()
  for (const m of html.matchAll(HEX_RE)) {
    if (m.index === undefined || defSpans.some(([s, e]) => m.index as number >= s && (m.index as number) < e)) continue
    const v = m[0].toLowerCase()
    if (!seen.has(v)) {
      seen.add(v)
      hard.push(v)
    }
  }
  for (const m of html.matchAll(RGBA_RE)) {
    if (m.index === undefined || defSpans.some(([s, e]) => m.index as number >= s && (m.index as number) < e)) continue
    if (!seen.has('rgba(…)')) {
      seen.add('rgba(…)')
      hard.push('rgba(…)')
    }
  }
  return hard
}


/**
 * Project :root color tokens with no dark twin. Projects with no dark block
 * at all render identical values in both modes (dark-first / single-mode by
 * convention), so there is nothing to fall back silently — only dual-mode
 * projects are judged. Scoped element vars (.screen/…) are outside the rule:
 * they never participate in :root dark switching.
 */
export function darkTwinViolations(projectId, css) {
  const { rootLight, dark, ownTwin } = parseModeVars(css)
  if (dark.size === 0) return []
  const out = []
  for (const [name, entry] of rootLight) {
    if (!isColorValue(entry.value)) continue
    if (dark.has(name) || ownTwin.has(name)) continue
    if (DARK_TWIN_ALLOWLIST[`${projectId}:${name}`]) continue
    out.push({
      line: entry.line,
      message: `project/${projectId}/tokens.css:${entry.line}  ${name} thiếu dark twin — thêm vào :root[data-theme='dark']`,
    })
  }
  return out
}

const HELP = `
Token lint: screens may only name defined tokens; literals with a token equivalent fail; dual-mode projects must twin colors.

  --screen <id>   only check that screen (dark-twin checks just its project)
  --help          print this message

Examples
  npm run lint:tokens
  npm run lint:tokens -- --screen today
`.trim()

async function main() {
  const argv = process.argv.slice(2)
  if (printHelpIfRequested(argv, HELP)) return
  const only = parseScreenFilter(argv)
  const { registry, errors: registryErrors } = await scanProjects()
  let errors = registryErrors.length
  let warns = 0
  for (const error of registryErrors) console.error(`error  ${error.file}  ${error.message}`)

  // tokens defined globally (layered files, cascade order), then per project
  // (project wins / owns its aliases)
  const global = (
    await Promise.all(GLOBAL_LAYERS.map((n) => readFile(path.join(ROOT, 'src/screens', n), 'utf8')))
  ).join('\n')
  const globalModes = parseModeVars(global)
  const names = new Set()
  const globalColors = new Set()
  for (const m of global.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) {
    names.add(`--${m[1]}`)
    if (isColorValue(m[0].split(':')[1].trim())) globalColors.add(`--${m[1]}`)
  }

  const projectNames = new Map()
  const projectOwnsColor = new Map()
  const projectModes = new Map()
  const projectEntries = new Map()
  for (const project of registry.projects) {
    const set = new Set(names)
    const own = new Set()
    const css = registry.tokens[project.id]
    const modes = parseModeVars(css ?? '')
    projectModes.set(project.id, modes)
    if (css) {
      for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) {
        set.add(`--${m[1]}`)
        if (isColorValue(m[0].split(':')[1].trim())) own.add(`--${m[1]}`)
      }
    }
    projectNames.set(project.id, set)
    projectOwnsColor.set(project.id, own)
    // merged [[name, light-value]] in tokensOf precedence: project names
    // first, then global-only — so hints name the project alias on ties.
    const values = new Map()
    for (const [n, e] of globalModes.light) values.set(n, e.value)
    for (const [n, e] of modes.light) values.set(n, e.value)
    projectEntries.set(
      project.id,
      [...modes.light.keys(), ...[...globalModes.light.keys()].filter((n) => !modes.light.has(n))].map((n) => [
        n,
        values.get(n),
      ]),
    )
  }

  const sharedImages = new Set(await readdir(path.join(ROOT, 'public/images')).catch(() => []))

  const screens = filterByScreen(registry.screens, only)
  if (only && screens.length === 0) reportNoScreenMatch('lint:tokens', only)

  for (const screen of screens) {
    const html = screen.html
    const pid = screen.projectId
    // per-screen <style> blocks (recipe screen-style.md): definitions the
    // screen carries itself join the known set — usage below stays unchanged.
    const known = new Set([...(projectNames.get(pid) ?? names), ...styleDefsOf(html)])
    // the chrome-selector guard lives in subset-lint (structural); this lint
    // only teaches the known-set so local defs stop false-positiving.
    const projectAssets = new Set(registry.assets[pid] ?? [])
    const seen = new Set()

    VAR_RE.lastIndex = 0
    let m
    while ((m = VAR_RE.exec(html)) !== null) {
      const name = m[1]
      if (!isTokenVar(name) || seen.has(name)) continue
      seen.add(name)
      if (!known.has(name)) {
        console.error(`error  ${screen.file}:${lineOf(html, m.index)}  ${name} chưa định nghĩa`)
        errors += 1
      } else if (globalColors.has(name) && !projectOwnsColor.get(pid)?.has(name)) {
        console.warn(
          `warn   ${screen.file}:${lineOf(html, m.index)}  ${name} là màu global — nên alias trong project/${pid}/tokens.css`,
        )
        warns += 1
      }
    }

    // no-literal: hardcoded values with a token equivalent are errors with a
    // fix hint; leftovers without one keep the historical warning.
    const entries = projectEntries.get(pid) ?? []
    const literals = noLiteralViolations(html, screen.file, entries)
    for (const v of literals) {
      console.error(`error  ${v.message}`)
      errors += 1
    }
    if (literals.length === 0) {
      const hard = leftoverHardColors(html)
      if (hard.length > 0) {
        console.warn(`warn   ${screen.file}  màu cứng: ${hard.slice(0, 5).join(', ')}${hard.length > 5 ? '…' : ''}`)
        warns += 1
      }
    }

    // optional screen background values (recipe screen-background): the root
    // may carry longhand background-color/background-image; the color must be a
    // token (or #000 dark-stage), the image must be an existing asset of THIS
    // project (or a shared public/images file), with fixed cover geometry.
    const rootBg = rootBackgroundOf(html)
    if (rootBg) {
      const rootLine = lineOf(html, rootBg.index)
      if (rootBg.color && !/^var\(--[a-z0-9-]+\)$|^#000000$|^#000$/i.test(rootBg.color)) {
        console.error(
          `error  ${screen.file}:${rootLine}  nền .screen root phải là var(--token) hoặc #000 (đang: ${rootBg.color.slice(0, 40)})`,
        )
        errors += 1
      }
      if (rootBg.image && rootBg.image.toLowerCase() !== 'none') {
        if (!rootBg.color) {
          console.error(`error  ${screen.file}:${rootLine}  background-image trên root thiếu background-color fallback`)
          errors += 1
        }
        for (const m of rootBg.image.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
          const u = m[2].trim()
          if (u.startsWith('/images/')) {
            if (!sharedImages.has(u.slice('/images/'.length))) {
              console.error(`error  ${screen.file}:${rootLine}  ${u} không tồn tại trong public/images/`)
              errors += 1
            }
          } else if (u.startsWith(`/project/${pid}/assets/`)) {
            const rel = u.slice(`/project/${pid}/assets/`.length)
            if (!projectAssets.has(rel)) {
              console.error(`error  ${screen.file}:${rootLine}  ${u} không tồn tại trong project/${pid}/assets/`)
              errors += 1
            }
          } else {
            console.error(
              `error  ${screen.file}:${rootLine}  ảnh nền root phải là /project/${pid}/assets/<file> (hoặc /images/<file> dùng chung) — đang: ${u.slice(0, 60)}`,
            )
            errors += 1
          }
        }
        // only url(…) and bare gradients may appear — no remote/data URLs
        // (strip innermost calls first so rgba() inside a gradient survives)
        let bare = rootBg.image.replace(/url\([^)]*\)/gi, '')
        let prev = ''
        while (prev !== bare) {
          prev = bare
          bare = bare.replace(/[a-z-]+\([^()]*\)/gi, '')
        }
        bare = bare.replace(/[,;\s]/g, '')
        if (bare !== '' || /https?:|data:/i.test(rootBg.image)) {
          console.error(
            `error  ${screen.file}:${rootLine}  background-image trên root chỉ nhận url(/project/<id>/assets/…) hoặc gradient — không URL ngoài/data-URI`,
          )
          errors += 1
        }
        if (rootBg.size && !/^cover$/i.test(rootBg.size)) {
          console.error(`error  ${screen.file}:${rootLine}  ảnh nền root phải background-size: cover (để .device lan đúng)`)
          errors += 1
        }
        if (rootBg.repeat && !/^no-repeat$/i.test(rootBg.repeat)) {
          console.error(`error  ${screen.file}:${rootLine}  ảnh nền root phải background-repeat: no-repeat`)
          errors += 1
        }
      }
    }
  }

  // dark-twin: every :root color token of a dual-mode project needs its twin.
  // --screen narrows this to that screen's project; without it every project.
  const twinProjects = only
    ? [...new Set(screens.map((s) => s.projectId))]
    : registry.projects.map((p) => p.id)
  for (const pid of twinProjects) {
    const css = registry.tokens[pid]
    if (!css) continue
    for (const v of darkTwinViolations(pid, css)) {
      console.error(`error  ${v.message}`)
      errors += 1
    }
  }

  console.log(`\n${errors} lỗi, ${warns} cảnh báo`)
  if (errors > 0) process.exit(1)
}

// Importable by scripts/tokens-lint.test.ts without running the CLI: only
// auto-run when invoked as `node scripts/tokens-lint.ts` (argv[1] is the file).
if ((process.argv[1] ?? '').endsWith('tokens-lint.ts')) {
  main().catch((error) => {
    console.error(`lint:tokens: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
