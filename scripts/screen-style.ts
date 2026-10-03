/**
 * Per-screen `<style>` blocks (option A, recipe `screen-style.md`).
 *
 * One typed helper both lints import, so `lint:tokens` and `lint:subset` can
 * never disagree about what a screen's own style block defines or forbids.
 * Erasable-syntax only: the `@ts-nocheck` lint CLIs import this under Node
 * type-stripping, same as `screen-filter.ts`.
 *
 * Convention enforced elsewhere (not here): one `<style>` block, first lines
 * of the file after the `pc` header, selectors prefixed with the screen id.
 */

/** `<style …>…</style>` — attribute-tolerant, case-insensitive, non-greedy */
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi

const DEF_RE = /--([a-z0-9-]+)\s*:\s*[^;{}]+;/g

/** one live style block: its CSS plus the offset where that CSS starts in `html` */
export type StyleBlock = {
  css: string
  index: number
}

/** every live `<style>` block (HTML comments blanked so indices stay valid) */
export function styleBlocksOf(html: string): StyleBlock[] {
  const src = html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '))
  const out: StyleBlock[] = []
  STYLE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = STYLE_RE.exec(src)) !== null) {
    out.push({ css: m[1] ?? '', index: m.index + m[0].indexOf(m[1] ?? '') })
  }
  return out
}

/** `--*` custom properties a screen/component defines inside its own blocks */
export function styleDefsOf(html: string): Set<string> {
  const out = new Set<string>()
  for (const block of styleBlocksOf(html)) {
    const css = block.css.replace(/\/\*[\s\S]*?\*\//g, '')
    for (const d of css.matchAll(DEF_RE)) out.add(`--${d[1]}`)
  }
  return out
}

/**
 * Chrome/shell selectors a screen `<style>` block must never target.
 * The shell owns these (compose.ts injects them around the screen's markup):
 * `.device` + `.statusbar` + `.home-indicator` wrap the screen, `.viewport`
 * holds it, `.region-nav`/`.region-tabs` + slot divs + `.shell-nav-btn` are
 * the nav/tab bands. A per-screen block styling them would leak across the
 * document — the block lives in `<body>`, unscoped by construction.
 */
const CHROME_CLASSES = new Set([
  '.device',
  '.statusbar',
  '.home-indicator',
  '.viewport',
  '.region-nav',
  '.region-tabs',
  '.shell-nav-btn',
  '.nav-slot-back',
  '.nav-slot-title',
  '.nav-slot-right',
  '.sb-left',
  '.sb-right',
  '.sb-ico',
])

const CHROME_PREFIX = ['.nav-slot-', '.sb-']

/** a bare `html`/`body` rule restyles the whole document, same leak */
const CHROME_ELEMENTS = new Set(['html', 'body'])

/** selector groups: `a, b { … }` (at-rules skipped, inner rules still match) */
const RULE_RE = /([^{}]+)\{/g

export type ChromeHit = {
  selector: string
  /** absolute offset in `html` (approximate: start of the selector group) */
  index: number
}

/** every chrome/shell selector a file's own style blocks target */
export function chromeSelectorHits(html: string): ChromeHit[] {
  const out: ChromeHit[] = []
  for (const block of styleBlocksOf(html)) {
    const css = block.css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    RULE_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = RULE_RE.exec(css)) !== null) {
      const group = (m[1] ?? '').trim()
      if (group === '' || group.startsWith('@')) continue
      for (const raw of group.split(',')) {
        const sel = raw.trim()
        if (sel === '') continue
        let bad = false
        for (const cm of sel.matchAll(/\.[a-zA-Z0-9_-]+/g)) {
          const cls = cm[0].toLowerCase()
          if (CHROME_CLASSES.has(cls) || CHROME_PREFIX.some((p) => cls.startsWith(p))) {
            bad = true
            break
          }
        }
        if (!bad) {
          const first = sel.split(/[\s>+~:.#\[]/)[0]?.toLowerCase() ?? ''
          if (CHROME_ELEMENTS.has(first)) bad = true
        }
        if (bad) out.push({ selector: sel, index: block.index + m.index })
      }
    }
  }
  return out
}
