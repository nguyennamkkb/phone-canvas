import globalCss from '../screens/tokens.css?raw'
import moodtrackerCss from '../../project/moodtracker/tokens.css?raw'

/**
 * Design tokens as data — parsed from the same css files the iframes load,
 * so the board table and the spec panel can never disagree with rendering.
 *
 * Source order is the contract: project tokens.css is layered after the
 * global one, and a project name always wins over a global name when two
 * tokens share a value (e.g. --bg and --paper are both #faf8f5).
 *
 * Vite-side only (?raw imports). scripts/export.ts must not import this.
 */

export type TokenGroup = 'color' | 'spacing' | 'radius' | 'type'
export type ThemeMode = 'light' | 'dark'

export type Token = {
  name: string
  group: TokenGroup
  /** resolved value per mode — non-colors repeat the same string twice */
  light: string
  dark: string
}

type Rgba = [number, number, number, number]

const PROJECT_CSS: Record<string, string> = {
  moodtracker: moodtrackerCss,
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** raw `--name: value` pairs in file order */
function parseVars(css: string): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const re = /--([a-z0-9-]+)\s*:\s*([^;{}]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css)) !== null) out.push([`--${m[1]}`, m[2].trim()])
  return out
}

/** split a project/global file into light vars + dark-override vars.
 *  Files keep :root first, then one :root[data-theme='dark'] block closed
 *  by a `}` on its own line — the match stops there so later blocks
 *  (shared scales) stay in light. */
function splitModes(css: string): { light: Array<[string, string]>; dark: Array<[string, string]> } {
  const clean = stripComments(css)
  const darkMatch = /:root\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)^\}/m.exec(clean)
  const darkSrc = darkMatch?.[1] ?? ''
  const lightSrc = darkMatch ? clean.replace(darkMatch[0], '') : clean
  return { light: parseVars(lightSrc), dark: parseVars(darkSrc) }
}

function groupOf(name: string, lightValue: string): TokenGroup {
  const n = name.slice(2)
  if (/^s\d+$/.test(n)) return 'spacing'
  if (/^(r-sm|r-md|r-lg|r-xl|r-full)$/.test(n)) return 'radius'
  if (/^(t-|font)/.test(n)) return 'type'
  // anything else with a size value (e.g. --ring-size) reads as spacing;
  // colors are whatever parses as a color
  return toRgba(lightValue) ? 'color' : 'spacing'
}

/** merged token list for a project: project names first, then global-only */
export function tokensOf(projectId: string): Token[] {
  const global = splitModes(globalCss)
  const project = splitModes(PROJECT_CSS[projectId] ?? '')
  const globalLight = new Map(global.light)
  const globalDark = new Map(global.dark)
  const projectLight = new Map(project.light)
  const projectDark = new Map(project.dark)

  const names: string[] = [
    ...projectLight.keys(),
    ...[...globalLight.keys()].filter((n) => !projectLight.has(n)),
  ]
  return names.map((name) => {
    const light = projectLight.get(name) ?? globalLight.get(name) ?? ''
    // dark falls back to light when a token defines no dark value
    // (spacing, radii, type sizes have no mode)
    const dark = projectDark.get(name) ?? globalDark.get(name) ?? light
    return { name, group: groupOf(name, light), light, dark }
  })
}

/** project-file tokens only — the app's own system, no global fallback.
 *  Unknown ids (custom boards) resolve to []. Spec/lookup still uses the
 *  merged tokensOf(); this is purely what the board table displays. */
export function projectTokensOf(projectId: string): Token[] {
  const project = splitModes(PROJECT_CSS[projectId] ?? '')
  const light = new Map(project.light)
  const dark = new Map(project.dark)
  return [...light.keys()].map((name) => {
    const l = light.get(name) ?? ''
    return { name, group: groupOf(name, l), light: l, dark: dark.get(name) ?? l }
  })
}

/* ------------------------------------------------- color matching (panel) -- */

/**
 * Normalize a css color to an rgba tuple. Handles #rgb, #rrggbb, rgb() and
 * rgba() — the shapes token files and getComputedStyle() produce.
 * Matching on the tuple (not on hex) keeps translucent tokens distinct:
 * --label-3 and --separator share rgb(43,29,22) but not alpha.
 */
export function toRgba(value: string): Rgba | null {
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
  const a = parts.length > 3 && Number.isFinite(parts[3]) ? (parts[3] as number) : 1
  return [Math.round(parts[0] as number), Math.round(parts[1] as number), Math.round(parts[2] as number), a]
}

function sameRgba(a: Rgba, b: Rgba): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && Math.abs(a[3] - b[3]) < 0.01
}

/**
 * Token name for a computed color string, e.g. "rgba(124, 148, 72, 1)" →
 * "--sage-deep". Project mode matters: dark surfaces resolve dark values.
 * Returns null when the color is not a token (hardcoded hex in a screen).
 */
export function tokenNameForColor(
  projectId: string,
  raw: string,
  mode: ThemeMode = 'light',
): string | null {
  const target = toRgba(raw)
  if (!target) return null
  for (const t of tokensOf(projectId)) {
    if (t.group !== 'color') continue
    const candidate = toRgba(mode === 'dark' ? t.dark : t.light)
    if (candidate && sameRgba(target, candidate)) return t.name
  }
  return null
}
