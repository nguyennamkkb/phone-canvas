/**
 * Read-only badge logic (E3, track 009 tools 5/13).
 *
 * Pure functions only — no DOM, no fs, no React. The components render what
 * these return; every branch is pinned by `badges.test.ts`.
 */

export type OwnerKind = 'status' | 'nav' | 'content' | 'tab' | 'shell' | 'component'

export type OwnerHint = {
  /** data-slot host: back | title | right */
  slot?: string
  /** data-tab destination */
  tab?: boolean
  /** node came from an @component include */
  component?: boolean
  /** OS chrome outside the viewport (bridge never captures it — for completeness) */
  chrome?: 'status' | 'home'
}

/**
 * Which band owns a node. Shell bands win over content: a title-slot span
 * holds text but is still nav chrome, and that ordering is the whole point —
 * the badge must never call shell chrome "content".
 */
export function ownerOf(_node: { tag: string; role: string }, hint: OwnerHint): OwnerKind {
  if (hint.chrome === 'status') return 'status'
  if (hint.chrome === 'home') return 'shell'
  if (hint.slot) return 'nav'
  if (hint.tab) return 'tab'
  if (hint.component) return 'component'
  return 'content'
}

export type GoldenState = 'match' | 'mismatch' | 'missing'

export type GoldenStatus = {
  state: GoldenState
  /** human line for the badge; never empty */
  label: string
}

type GoldenLike = { sha256: string; width: number; height: number }

type ManifestLike = { records?: Record<string, GoldenLike | undefined> } | null | undefined

/**
 * Golden-vs-current from a manifest-shaped object. Reads only — a missing or
 * corrupt manifest is "missing" (badge shows "chưa có"), never an error, so
 * the board renders identically with zero goldens on disk.
 */
export function goldenStatusFor(
  manifest: ManifestLike | unknown,
  key: string,
  current: GoldenLike,
): GoldenStatus {
  const maybe = manifest as ManifestLike
  const records =
    maybe !== null &&
    typeof maybe === 'object' &&
    maybe.records !== null &&
    typeof maybe.records === 'object'
      ? (maybe.records as Record<string, GoldenLike | undefined>)
      : null
  const record = records?.[key]
  if (!record || typeof record.sha256 !== 'string') {
    return { state: 'missing', label: 'chưa có golden' }
  }
  if (record.sha256 === current.sha256) return { state: 'match', label: 'khớp golden' }
  return { state: 'mismatch', label: 'lệch golden' }
}
