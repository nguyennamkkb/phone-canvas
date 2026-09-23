/**
 * Component expansion (component-system).
 *
 * A screen (or a component) references another component with a placeholder
 * comment: `<!-- @component <id> -->`. Expansion is a pure string operation so
 * it can run inside `composeScreenDoc` — the one function both the app and the
 * exporter call — which is what keeps the board and an export from drifting.
 *
 * Kept dependency-free on purpose: `compose.ts` is pure, and this must stay so.
 */

export type ExpandErrorKind = 'missing' | 'cycle' | 'depth'

export type ExpandError = {
  kind: ExpandErrorKind
  /** the component id the placeholder asked for */
  id: string
}

export type ExpandResult = {
  /** html with every resolvable placeholder replaced */
  html: string
  /** problems found; the offending placeholder is left as a comment */
  errors: ExpandError[]
}

/** `<!-- @component tab -->` — id is kebab-case-ish, no spaces */
const PLACEHOLDER = /<!--\s*@component\s+([a-zA-Z0-9_-]+)\s*-->/g

/** a component chain deeper than this is a bug, not a design */
const MAX_DEPTH = 20

/**
 * Replace every `@component` placeholder with the component's html, recursively.
 * A missing id, a cycle (A includes B includes A) or a chain past MAX_DEPTH is
 * reported and the placeholder is left untouched — invisible in the document,
 * and named by the lint/board rather than silently swallowed.
 */
export function expandComponents(
  html: string,
  components: Record<string, string>,
): ExpandResult {
  const errors: ExpandError[] = []
  const seenErrors = new Set<string>()
  const report = (kind: ExpandErrorKind, id: string) => {
    const key = `${kind}:${id}`
    if (seenErrors.has(key)) return
    seenErrors.add(key)
    errors.push({ kind, id })
  }

  function walk(source: string, stack: string[], depth: number): string {
    // a fresh regex per call: `String.replace` mutates a global regex's
    // lastIndex, and a shared one would be corrupted by the nested walk()
    const re = new RegExp(PLACEHOLDER.source, 'g')
    return source.replace(re, (match, id: string) => {
      if (depth >= MAX_DEPTH) {
        report('depth', id)
        return match
      }
      const component = components[id]
      if (component === undefined) {
        report('missing', id)
        return match
      }
      if (stack.includes(id)) {
        report('cycle', id)
        return match
      }
      return walk(component, [...stack, id], depth + 1)
    })
  }

  return { html: walk(html, [], 0), errors }
}
