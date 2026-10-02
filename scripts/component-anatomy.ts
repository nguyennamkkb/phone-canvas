/**
 * Component anatomy header (E6 enforcement, 04_COMPONENT_SYSTEM §3).
 *
 * Every `project/<id>/components/*.html` must open with a machine-checkable
 * header naming all 11 anatomy items:
 *
 *   <!-- @anatomy name=<stem> purpose="…" anatomy="…" variants="…"
 *        states="…" tokens="…" regions="…" platforms="…" interaction="…"
 *        a11y="…" examples="…" -->
 *
 * The header is an HTML comment, so every existing lint keeps passing:
 * `withoutComments` (region-rules), the subset comment-strip, and the token
 * VAR_RE (which only scans markup) all ignore it by construction. The
 * components-lint reads it with a regex over the raw file — no new parser
 * in any other pipeline.
 *
 * Values are free text EXCEPT `name` (must equal the filename stem) and
 * `tokens` (every `var(--*)` the component body uses must be listed — the
 * one cross-check the lint performs beyond presence).
 */

export const ANATOMY_ITEMS = [
  'name',
  'purpose',
  'anatomy',
  'variants',
  'states',
  'tokens',
  'regions',
  'platforms',
  'interaction',
  'a11y',
  'examples',
] as const

export type AnatomyItem = (typeof ANATOMY_ITEMS)[number]

export type AnatomyHeader = {
  fields: Record<AnatomyItem, string>
}

const OPEN_RE = /<!--[\s\S]*?@anatomy\b([\s\S]*?)-->/i
const FIELD_RE = /([a-zA-Z0-9]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/g

/** first @anatomy comment in the file, parsed to fields (null when absent) */
export function anatomyOf(html: string, _stem: string): AnatomyHeader | null {
  const open = OPEN_RE.exec(html)
  if (!open) return null
  const fields = {} as Record<AnatomyItem, string>
  for (const m of open[1].matchAll(FIELD_RE)) {
    const key = m[1].toLowerCase() as AnatomyItem
    if (!(ANATOMY_ITEMS as readonly string[]).includes(key)) continue
    fields[key] = (m[2] ?? m[3] ?? m[4] ?? '').trim()
  }
  return { fields }
}

/** vars the rendered body actually uses (comments stripped, like the lints) */
export function bodyVars(html: string): string[] {
  const body = html.replace(/<!--[\s\S]*?-->/g, '')
  const out = new Set<string>()
  for (const m of body.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) out.add(m[1])
  return [...out]
}

/**
 * Which of the 11 items are missing or dishonest: absent header → all 11;
 * present header → empty value, name≠stem, or a body var missing from tokens.
 */
export function missingAnatomyItems(html: string, stem: string): string[] {
  const parsed = anatomyOf(html, stem)
  if (!parsed) return [...ANATOMY_ITEMS]
  const missing: string[] = []
  for (const item of ANATOMY_ITEMS) {
    if (item === 'name') {
      if (parsed.fields.name !== stem) missing.push('name')
      continue
    }
    if (!parsed.fields[item]) {
      missing.push(item)
      continue
    }
    if (item === 'tokens') {
      const listed = parsed.fields.tokens.split(/[\s,]+/).filter(Boolean)
      const unlisted = bodyVars(html).filter((v) => !listed.includes(v))
      if (unlisted.length > 0) missing.push('tokens')
    }
  }
  return missing
}

/** one-line header the scaffold writes; values prefilled from the template */
export function renderAnatomyHeader(fields: Record<string, string>): string {
  const parts = ANATOMY_ITEMS.map((item) => `${item}=${JSON.stringify(fields[item] ?? '')}`)
  return `<!-- @anatomy ${parts.join(' ')} -->\n`
}
