/**
 * Legacy regex parser for `compose.ts` — kept for one release as the
 * cross-check target (core-hardening §2.2).
 *
 * These are the pre-parse5 implementations, moved verbatim and exported under
 * the same names. `compose.ts` runs them after computing with the parse5 tree
 * walk; any difference warns (naming the input point) and the parse5 result
 * wins. Delete this file once the warn has stayed silent for a release.
 */

const VOID_TAGS = new Set([
  'img', 'input', 'br', 'hr', 'source', 'track', 'wbr', 'area', 'base', 'col',
  'embed', 'link', 'meta', 'param',
])

/** end index (exclusive) of the element whose opening tag starts at `openIndex` */
export function matchElementEnd(src: string, openIndex: number): number | null {
  const open = /^<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/.exec(src.slice(openIndex))
  if (!open) return null
  const name = (open[1] ?? '').toLowerCase()
  if (/\/\s*$/.test(open[2] ?? '') || VOID_TAGS.has(name)) return openIndex + open[0].length
  const tagRe = new RegExp(`<(/?)${name}\\b([^>]*)>`, 'gi')
  tagRe.lastIndex = openIndex + open[0].length
  let depth = 1
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(src)) !== null) {
    if (/\/\s*$/.test(m[2] ?? '')) continue
    if (m[1] === '/') {
      depth -= 1
      if (depth === 0) return m.index + m[0].length
    } else depth += 1
  }
  return null
}

/**
 * Pull every element carrying `attr="…"` out of `html`, preserving document
 * order. Returns the elements (outer markup + attribute value) and the markup
 * with them removed. Used by the shell to lift nav/tab slot content out of the
 * screen so the shell can place it — the author keeps writing plain content.
 */
export function takeAttributed(
  html: string,
  attr: string,
): { items: Array<{ outer: string; value: string }>; rest: string } {
  // the value is optional: `data-tab` is a valid boolean attribute, so the
  // regex accepts `attr`, `attr="v"`, `attr='v'` and `attr=v`, and refuses a
  // longer name (`data-tabs`) via the trailing boundary.
  const re = new RegExp(
    `<([a-zA-Z][a-zA-Z0-9-]*)\\b[^>]*\\b${attr}\\b(?![\\w-])(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?[^>]*>`,
    'g',
  )
  const spans: Array<{ start: number; end: number; value: string; outer: string }> = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const end = matchElementEnd(html, m.index)
    if (end === null) continue
    spans.push({
      start: m.index,
      end,
      value: m[2] ?? m[3] ?? m[4] ?? '',
      outer: html.slice(m.index, end),
    })
    re.lastIndex = end
  }
  let rest = ''
  let last = 0
  for (const span of spans) {
    rest += html.slice(last, span.start)
    last = span.end
  }
  rest += html.slice(last)
  return { items: spans.map(({ outer, value }) => ({ outer, value })), rest }
}

/** the opening tag split from its content — attributes only ever go on the tag */
export function splitOpenTag(outer: string): { open: string; close: string } {
  let quote: string | null = null
  for (let i = 0; i < outer.length; i += 1) {
    const ch = outer[i] as string
    if (quote) {
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '>') return { open: outer.slice(0, i + 1), close: outer.slice(i + 1) }
  }
  return { open: outer, close: '' }
}

/** the visible text of an element: tags stripped, whitespace collapsed */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** set an attribute on an opening tag, replacing any earlier one; null removes */
export function withAttr(open: string, name: string, value: string | null): string {
  const re = new RegExp(`\\s+${name}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'i')
  const stripped = open.replace(re, '')
  if (value === null) return stripped
  const escaped = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  return stripped.replace(/(\s*\/?>)$/, ` ${name}="${escaped}"$1`)
}

/** add or remove one class on an opening tag, leaving the rest alone */
export function withClass(open: string, cls: string, on: boolean): string {
  const m = /\sclass\s*=\s*("([^"]*)"|'([^']*)')/i.exec(open)
  if (!m) return on ? withAttr(open, 'class', cls) : open
  const names = (m[2] ?? m[3] ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((c) => c !== cls)
  if (on) names.push(cls)
  return open.replace(m[0], ` class="${names.join(' ')}"`)
}
