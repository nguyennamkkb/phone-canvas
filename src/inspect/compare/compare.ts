import type { SpecNode } from '../../spec/types'

/**
 * One field of one node that two screens disagree on.
 *
 * The kinds are the drift classes that actually cost money on a screen family
 * with one design DNA: spacing/padding/type read as "same card, wrong number",
 * a differing role means the two screens are not even the same component.
 */
export type DriftKind =
  | 'role'
  | 'box'
  | 'gap'
  | 'padding'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'letterSpacing'
  | 'radius'
  | 'color'
  | 'background'
  | 'text'

/**
 * `a` is the first tree's value, `b` the second's; `null` means the field (or
 * the whole node) is absent on that side, which the panel renders as `—`.
 */
export type DriftRow = { kind: DriftKind; path: string; a: string | null; b: string | null }

/**
 * Canonical kind order. It is the tiebreak when two kinds have the same count
 * and the fallback order of the panel, so the summary line never jitters
 * between renders.
 */
export const DRIFT_KINDS: readonly DriftKind[] = [
  'role',
  'box',
  'gap',
  'padding',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'radius',
  'color',
  'background',
  'text',
]

/**
 * Upper bound on rows `diffSpecs` returns. Two screens of the same family drift
 * in a handful of fields; anything past this many rows is a tree pairing that
 * went wrong (or two unrelated screens), and a 5 000-row list is unreadable and
 * slow to render. The panel says the list was truncated.
 */
export const DRIFT_ROW_CAP = 200

/** 1 decimal is the resolution the panel shows; below it, numbers are noise. */
const round1 = (v: number): number => Math.round(v * 10) / 10

/** `null` for an absent/blank string, so "no color" never diffs against "no color". */
const str = (v: string | null | undefined): string | null => {
  const t = (v ?? '').trim()
  return t === '' ? null : t
}

/** Numeric values are compared *and* printed after rounding, so 12 vs 12.04 is not drift. */
const numStr = (v: number | null | undefined): string | null =>
  v === null || v === undefined || Number.isNaN(v) ? null : String(round1(v))

/** `all 16` / `top 12 right 16` — same shape as the detail panel's padding line. */
function edgesLabel(e: { top: number; right: number; bottom: number; left: number }): string {
  const { top, right, bottom, left } = e
  if (top === right && right === bottom && bottom === left) return `all ${round1(top)}`
  const parts: string[] = []
  if (top) parts.push(`top ${round1(top)}`)
  if (right) parts.push(`right ${round1(right)}`)
  if (bottom) parts.push(`bottom ${round1(bottom)}`)
  if (left) parts.push(`left ${round1(left)}`)
  return parts.length > 0 ? parts.join(' ') : '0'
}

/**
 * A fill is only comparable as a whole: `color #ffffff` vs `gradient linear-…`
 * is drift even when neither has a flat hex, while two absent fills (alpha 0 /
 * empty) are both `null` and produce no row.
 */
function backgroundValue(n: SpecNode): string | null {
  const s = n.surface
  if (s.backgroundKind === 'image' || s.backgroundKind === 'gradient') {
    return [s.backgroundKind, str(s.backgroundImage)].filter(Boolean).join(' ')
  }
  const hex = str(s.backgroundHex)
  if (hex === null || s.backgroundAlpha === 0) return null
  return hex
}

/**
 * Human breadcrumb: ancestor roles root-first, then the node's own label,
 * e.g. `VStack > HStack > Text · "Monthly"`.
 *
 * The spec tree is flat and keeps its nesting in `parent`/`depth` (`SpecNode`
 * has no `children`), so the ancestors are walked by id on a map built once per
 * tree. A parent id that is not in the list (a partial tree) ends the walk
 * instead of throwing.
 */
function breadcrumb(byId: Map<string, SpecNode>, node: SpecNode): string {
  const roles: string[] = []
  const seen = new Set<string>([node.id])
  let parentId = node.parent
  while (parentId !== null && !seen.has(parentId)) {
    seen.add(parentId)
    const parent = byId.get(parentId)
    if (!parent) break
    roles.push(parent.role)
    parentId = parent.parent
  }
  roles.reverse()
  return [...roles, str(node.label) ?? node.role].join(' > ')
}

/** Only the pair's diverging values are compared; equality is silence. */
function pushStr(
  rows: DriftRow[],
  kind: DriftKind,
  path: string,
  a: string | null,
  b: string | null,
): void {
  // two absent values are not drift — an absent side paired with a present one is
  if (a === null && b === null) return
  if (a !== null && b !== null && a.toLowerCase() === b.toLowerCase()) return
  rows.push({ kind, path, a, b })
}

function pushNum(
  rows: DriftRow[],
  kind: DriftKind,
  path: string,
  a: number | null | undefined,
  b: number | null | undefined,
): void {
  pushStr(rows, kind, path, numStr(a), numStr(b))
}

/** Fields of a paired node. Roles already differ when this runs; numbers are still compared —
 * a role change (Button → Text) usually drags padding and type size along with it. */
function comparePair(rows: DriftRow[], path: string, a: SpecNode, b: SpecNode): void {
  pushStr(rows, 'role', path, a.role, b.role)

  const aw = numStr(a.box.w)
  const bw = numStr(b.box.w)
  const ah = numStr(a.box.h)
  const bh = numStr(b.box.h)
  if (!(aw === bw && ah === bh)) {
    pushStr(rows, 'box', path, `${aw ?? '—'} × ${ah ?? '—'}`, `${bw ?? '—'} × ${bh ?? '—'}`)
  }

  pushNum(rows, 'gap', path, a.layout.gap, b.layout.gap)

  const ap = `${a.padding.top},${a.padding.right},${a.padding.bottom},${a.padding.left}`
  const bp = `${b.padding.top},${b.padding.right},${b.padding.bottom},${b.padding.left}`
  if (ap !== bp) pushStr(rows, 'padding', path, edgesLabel(a.padding), edgesLabel(b.padding))

  pushNum(rows, 'fontSize', path, a.typography?.size, b.typography?.size)
  pushNum(rows, 'fontWeight', path, a.typography?.weight, b.typography?.weight)
  pushNum(rows, 'lineHeight', path, a.typography?.lineHeight, b.typography?.lineHeight)
  pushNum(rows, 'letterSpacing', path, a.typography?.tracking, b.typography?.tracking)
  pushStr(rows, 'color', path, str(a.typography?.colorHex), str(b.typography?.colorHex))

  pushNum(rows, 'radius', path, a.surface.radius, b.surface.radius)
  pushStr(rows, 'background', path, backgroundValue(a), backgroundValue(b))

  pushStr(rows, 'text', path, str(a.text), str(b.text))
}

/**
 * Flatten both trees in document order, pair index-wise, and report one row per
 * differing field.
 *
 * Alignment rules:
 * - `SpecNode[]` is already flat in document order — nesting lives in
 *   `parent`/`depth`, not in a `children` array — so flattening is the
 *   identity and pairing is a single index-wise pass over the two lists.
 * - Pair by index: `a[i]` against `b[i]`. Index-wise pairing is the only rule
 *   that needs no ids in common (each screen's nodes have their own ids).
 * - A pair whose `role` differs emits ONE `role` row and then still compares the
 *   numeric fields.
 * - A pair that is missing on one side (different tree lengths) emits ONE `role`
 *   row with the present side's role and `null` on the other, and compares no
 *   fields: an absent node has no spacing to be wrong about.
 * - A field absent on both sides (`typography: null`, no fill, blank text) never
 *   emits a row; absent on one side only is drift.
 * - Numeric fields are rounded to 1 decimal before comparing, so 12 vs 12.04 is
 *   not a row. String fields compare case-insensitively after trimming.
 * - Output is capped at `DRIFT_ROW_CAP` rows; nodes past the cap are not compared.
 *
 * `path` is a human breadcrumb: ancestor roles + the node's own label, e.g.
 * `VStack > HStack > Text · "Monthly"`. When a side has no such node, the other
 * side's path is used.
 */
export function diffSpecs(a: SpecNode[], b: SpecNode[]): DriftRow[] {
  const byIdA = new Map(a.map((n) => [n.id, n]))
  const byIdB = new Map(b.map((n) => [n.id, n]))
  const rows: DriftRow[] = []
  const len = Math.max(a.length, b.length)

  for (let i = 0; i < len; i += 1) {
    if (rows.length >= DRIFT_ROW_CAP) break
    const nodeA = a[i] as SpecNode | undefined
    const nodeB = b[i] as SpecNode | undefined

    if (!nodeA || !nodeB) {
      const present = (nodeA ?? nodeB) as SpecNode
      const byId = nodeA ? byIdA : byIdB
      rows.push({
        kind: 'role',
        path: breadcrumb(byId, present),
        a: nodeA ? nodeA.role : null,
        b: nodeB ? nodeB.role : null,
      })
      continue
    }

    comparePair(rows, breadcrumb(byIdA, nodeA), nodeA, nodeB)
  }

  return rows
}

/**
 * Rows per kind, most frequent first, ties by the canonical `DRIFT_KINDS` order.
 * The panel leads with "3 spacing · 1 type" instead of a wall of rows, so the
 * biggest drift class has to be the first thing read.
 */
export function driftCounts(rows: DriftRow[]): Array<{ kind: DriftKind; count: number }> {
  const counts = new Map<DriftKind, number>()
  for (const row of rows) counts.set(row.kind, (counts.get(row.kind) ?? 0) + 1)

  // ≤12 kinds, so the canonical-order lookup can afford an indexOf per comparison
  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((x, y) => y.count - x.count || DRIFT_KINDS.indexOf(x.kind) - DRIFT_KINDS.indexOf(y.kind))
}
