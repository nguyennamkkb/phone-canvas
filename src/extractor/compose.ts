import type { Device } from '../frame/devices'
import { expandComponents } from '../components/expand.ts'

/**
 * Compose a self-contained document for one phone screen.
 *
 * Pure and dependency-free on purpose: the app feeds it CSS/JS it imported with
 * `?raw`, and `scripts/export.ts` feeds it the same files read off disk. There
 * is exactly one definition of what a screen document is.
 *
 * The document is always the device's natural size, so 1 CSS px === 1 pt and
 * every measured number is directly usable as a SwiftUI point value.
 */

export type ComposeOptions = {
  /** the screen's own markup — sits between the status bar and home indicator */
  html: string
  device: Device
  /** stylesheets in order: tokens first, then anything that extends them */
  stylesheets: string[]
  /**
   * Contents of bridge.js, or null to compose a clean document.
   * Exports use null: no measurement attributes, no hover overlay.
   */
  bridgeJs?: string | null
  /** identify which canvas node this iframe belongs to (app only) */
  nodeId?: string
  /**
   * Opaque per-node token. A sandboxed iframe's WindowProxy is not a stable
   * identity across navigations, so the parent routes messages by this instead
   * of by comparing `event.source` against `iframe.contentWindow`.
   */
  token?: string
  /** dark surfaces need a light status bar */
  lightStatusBar?: boolean
  /** color mode — sets data-theme on <html> so project tokens.css can switch */
  theme?: 'light' | 'dark'
  /**
   * component-system: id → html for the project. Every `<!-- @component id -->`
   * in `html` is replaced before the document is assembled.
   */
  components?: Record<string, string>
  /**
   * Drop the OS chrome (status bar + home indicator) and let `.device` hug its
   * content. Used to preview a bare component in the catalog, never for a
   * screen on the board or in an export.
   */
  bare?: boolean
}

/**
 * Chrome CSS — the OS-owned regions that wrap the screen.
 *
 * The screen author never writes these. They are injected so every screen has
 * the same 3-band structure:
 *
 *   .device
 *   ├── .statusbar      (safeTop)      — OS chrome, excluded from capture
 *   ├── .viewport       (flex: 1)      — the screen's own markup goes here
 *   └── .home-indicator (safeBottom)   — OS chrome, excluded from capture
 *
 * This mirrors the 4-region skeleton of the `mobile-ui-pencil` skill and maps
 * onto SwiftUI's safe area / `.safeAreaInset` without reinterpretation.
 *
 * `.device` has a MINIMUM height but no maximum: a screen that needs 1200pt
 * becomes a 1200pt document rather than a scrollbar.
 */
const CHROME_CSS = `
html, body { width: var(--device-w); min-height: var(--device-h); }
.device {
  display: flex; flex-direction: column;
  width: var(--device-w); min-height: var(--device-h);
  background: var(--bg);
}
/* component preview: no chrome, hug the component's own height */
.device.is-bare { min-height: 0; }
body.is-bare { min-height: 0; }
.viewport {
  flex: 1 1 auto; min-height: 0;
  display: flex; flex-direction: column;
  position: relative;
}
.statusbar {
  flex: 0 0 auto; height: var(--safe-top);
  display: flex; flex-direction: row; align-items: center;
  justify-content: space-between;
  padding: 0 var(--safe-x) 0;
  padding-top: var(--status-offset);
  font-size: 15px; font-weight: 600; line-height: 20px;
  color: var(--label); background: transparent;
  pointer-events: none;
}
.statusbar.is-light { color: #fff; }
.sb-left { display: flex; flex-direction: row; align-items: center; }
.sb-right { display: flex; flex-direction: row; align-items: center; gap: 5px; }
.sb-ico { display: block; color: currentColor; }
.home-indicator {
  flex: 0 0 auto; height: var(--safe-bottom);
  display: flex; flex-direction: row; align-items: center; justify-content: center;
  pointer-events: none;
}
.home-indicator i {
  display: block; width: 139px; height: 5px; border-radius: 999px;
  background: var(--label); opacity: 0.85;
}
/* optional screen background (§ screenBgOf): a dark fallback color means the
   home bar must read white, mirroring .statusbar.is-light for the text */
.device.is-dark .home-indicator i {
  background: #fff;
}
`

function statusBarHtml(device: Device, light: boolean): string {
  if (device.safeTop <= 0) return ''
  return `
  <div class="statusbar${light ? ' is-light' : ''}">
    <div class="sb-left"><span>9:41</span></div>
    <div class="sb-right">
      <svg class="sb-ico" width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
        <rect x="0" y="8.5" width="3" height="3.5" rx="1"/>
        <rect x="4.6" y="6" width="3" height="6" rx="1"/>
        <rect x="9.2" y="3.5" width="3" height="8.5" rx="1"/>
        <rect x="13.8" y="1" width="3" height="11" rx="1" opacity="0.35"/>
      </svg>
      <svg class="sb-ico" width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
        <path d="M8 11.2 6.1 9a2.9 2.9 0 0 1 3.8 0L8 11.2Z"/>
        <path d="M8 6.2c-1.5 0-2.9.55-3.95 1.45l-1.15-1.3A7.2 7.2 0 0 1 8 4.4c1.95 0 3.7.75 4.95 1.95l-1.15 1.3A5.7 5.7 0 0 0 8 6.2Z"/>
        <path d="M8 2.3c-2.5 0-4.8.9-6.6 2.4L.3 3.4A11.2 11.2 0 0 1 8 0.3c3 0 5.75 1.15 7.7 3.1l-1.1 1.3A9.3 9.3 0 0 0 8 2.3Z"/>
      </svg>
      <svg class="sb-ico" width="25" height="12" viewBox="0 0 25 12" fill="none">
        <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.4"/>
        <rect x="2" y="2" width="18" height="8" rx="2.2" fill="currentColor"/>
        <path d="M23 4v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.4"/>
      </svg>
    </div>
  </div>`
}

function homeIndicatorHtml(device: Device): string {
  if (device.safeBottom <= 0) return ''
  return `\n  <div class="home-indicator"><i></i></div>`
}

/**
 * Optional screen background (screen-background recipe).
 *
 * A screen may paint its own root (`<div class="screen" style="background-color:
 * var(--x); background-image: url(/images/y.svg)">`), but the OS chrome strips
 * (status bar + home indicator) sit OUTSIDE the screen on `.device`, which keeps
 * `var(--bg)`. Without propagation the strips would show the old color — a seam.
 *
 * So: read the root's LONGHAND background declarations and replay them onto
 * `.device`. Pure string work, so the board and the exporter agree byte for
 * byte. Shorthand `background:` is deliberately NOT parsed (the lint forces
 * longhand for image/gradient backgrounds); screens without a root background
 * get back exactly what they always got.
 */
export type ScreenBg = {
  /** inline CSS for `.device` ('' when the screen declares no root background) */
  style: string
  /** the fallback color is dark — the home indicator should flip white */
  isDark: boolean
}

const ROOT_TAG_RE = /<[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*>/i

function styleOf(tag: string): string {
  const m = /style\s*=\s*"([^"]*)"/i.exec(tag) ?? /style\s*=\s*'([^']*)'/i.exec(tag)
  return m?.[1] ?? ''
}

/** split `a: b; c: d` without choking on `url(...;...)` or gradients */
function declarations(style: string): Array<[string, string]> {
  const out: Array<[string, string]> = []
  let depth = 0
  let cur = ''
  const push = () => {
    const i = cur.indexOf(':')
    if (i > 0) out.push([cur.slice(0, i).trim().toLowerCase(), cur.slice(i + 1).trim()])
    cur = ''
  }
  for (const ch of style) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ';' && depth === 0) push()
    else cur += ch
  }
  if (cur.trim()) push()
  return out
}

/** values with quotes/brackets would break the device's style attribute */
function safeCssValue(v: string): boolean {
  return v !== '' && !/["'`<>{};]/.test(v) && v.length <= 300
}

/** `url("…")` / `url('…')` → `url(…)` so the device attribute stays quoteless */
function unquoteUrl(v: string): string {
  return v.replace(/url\(\s*(['"])([^'")]+)\1\s*\)/g, 'url($2)')
}

function luminanceOf(color: string): number | null {
  const v = color.trim().toLowerCase()
  let r = 0
  let g = 0
  let b = 0
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v)
  if (hex?.[1]) {
    const h = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1]
    r = parseInt(h.slice(0, 2), 16)
    g = parseInt(h.slice(2, 4), 16)
    b = parseInt(h.slice(4, 6), 16)
  } else {
    const m = /^rgba?\(([^)]+)\)$/.exec(v)
    if (!m?.[1]) return null
    const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    if (parts.length < 3 || parts.slice(0, 3).some((x) => !Number.isFinite(x))) return null
    if (parts.length > 3 && (parts[3] ?? 1) < 0.5) return null
    r = parts[0] as number
    g = parts[1] as number
    b = parts[2] as number
  }
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function screenBgOf(html: string): ScreenBg {
  const none: ScreenBg = { style: '', isDark: false }
  const tag = ROOT_TAG_RE.exec(html)?.[0]
  if (!tag) return none
  let color = ''
  let image = ''
  for (const [prop, value] of declarations(styleOf(tag))) {
    if (prop === 'background-color') color = value
    else if (prop === 'background-image') image = unquoteUrl(value)
  }
  if (color !== '' && !safeCssValue(color)) return none
  if (image !== '' && (image === 'none' || !safeCssValue(image))) {
    if (image !== 'none') return none
    image = ''
  }
  if (!color && !image) return none
  const parts: string[] = []
  if (color) parts.push(`background-color: ${color}`)
  if (image) {
    // fixed geometry per the recipe: the author must use cover/center/no-repeat
    // on .screen too, so the strips read as a continuation of the same picture
    parts.push(`background-image: ${image}`)
    parts.push('background-size: cover')
    parts.push('background-position: center')
    parts.push('background-repeat: no-repeat')
  }
  const lum = color ? luminanceOf(color) : null
  return { style: parts.join('; ') + ';', isDark: lum !== null && lum < 0.35 }
}

export function composeScreenDoc(options: ComposeOptions): string {
  const {
    html,
    device,
    stylesheets,
    bridgeJs = null,
    nodeId,
    token,
    lightStatusBar,
    theme,
    components,
    bare = false,
  } = options
  const themeAttr = theme === 'dark' ? ' data-theme="dark"' : ''
  // component-system: splice `@component` fragments in before assembly. A
  // missing id / cycle is left as an inert comment here; lint and the board
  // name it. Pure, so the app and the exporter expand identically.
  const body = components ? expandComponents(html, components).html : html

  const styles = stylesheets.map((css) => `<style>${css}</style>`).join('\n')

  // optional screen background: replay the root's longhand background onto
  // .device so the statusbar/home strips continue the screen instead of
  // showing the project's default --bg as a seam
  const screenBg = screenBgOf(body)

  const deviceAttrs =
    nodeId && token ? ` data-node-id="${nodeId}" data-node-token="${token}"` : ''

  const bridge = bridgeJs
    ? `\n<script>${bridgeJs.replace(/<\/script/gi, '<\\/script')}</script>`
    : ''

  return `<!doctype html>
<html lang="en"${themeAttr}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${styles}
<style>
:root {
  --device-w: ${device.width}px;
  --device-h: ${device.height}px;
  --safe-top: ${device.safeTop}px;
  --safe-bottom: ${device.safeBottom}px;
  --safe-x: ${device.island === 'none' ? 16 : 28}px;
  --status-offset: ${device.island === 'none' ? 0 : 8}px;
}
${CHROME_CSS}
</style>
</head>
<body${bare ? ' class="is-bare"' : ''}>
<div class="device${bare ? ' is-bare' : ''}${screenBg.isDark ? ' is-dark' : ''}"${screenBg.style ? ` style="${screenBg.style}"` : ''}${deviceAttrs}>
${bare ? '' : statusBarHtml(device, lightStatusBar ?? false)}
  <div class="viewport">${body}</div>${bare ? '' : homeIndicatorHtml(device)}
</div>${bridge}
</body>
</html>`
}
