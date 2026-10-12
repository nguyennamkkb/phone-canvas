import { isRawPayload } from '../spec/validate.ts'
import type { BridgeMessage } from '../spec/validate.ts'

/**
 * Registered iframe needed for routing. The element itself stays in the
 * context; only the token participates in the accept/drop decision.
 */
export type RouteEntry = { token: string }

function expectedOrBrowser(given: string | undefined): string {
  if (given !== undefined) return given
  return typeof window === 'undefined' ? '' : window.location.origin
}

/**
 * Where a bridge message may come from.
 *
 * The board's iframes are `sandbox="allow-scripts"` — no `allow-same-origin` —
 * so the browser gives each one an OPAQUE origin and `event.origin` arrives as
 * the string `"null"`, never the board's own origin. (Verified in a real
 * browser: the same srcdoc without the sandbox attribute reports the parent
 * origin, with it reports `"null"`.) An equality check against
 * `window.location.origin` therefore rejected every message the bridge ever
 * sent, which is why the panel could sit on "Đang đọc DOM…" forever.
 *
 * The opaque origin cannot identify a frame, so it is not what authenticates
 * one: the per-node token does (random per node, present only in that node's
 * srcdoc, compared below). A foreign origin still fails here, and an opaque
 * origin without the right token fails the token gate like any other stranger.
 */
function originAllowed(origin: string, expectedOrigin?: string): boolean {
  return origin === expectedOrBrowser(expectedOrigin) || origin === 'null'
}

/**
 * Pure accept/drop decision for a bridge → parent message: allowed origin
 * (the board's own, or the opaque origin a sandboxed srcdoc frame reports) +
 * registered frame + matching per-node token + v:1 schema. Strangers fail here
 * and are ignored completely; malformed payloads from a known frame fail here
 * too but the caller counts them via `shouldCountDrop` so the panel can say so.
 */
export function shouldAccept(
  entry: RouteEntry | undefined,
  data: unknown,
  origin: string,
  expectedOrigin?: string,
): data is BridgeMessage {
  if (!entry) return false
  if (!originAllowed(origin, expectedOrigin)) return false
  if (!isRawPayload(data)) return false
  return data.token === entry.token
}

/**
 * Malformed but authenticated: allowed origin, known frame, matching token, yet
 * the schema gate fails. Worth a visible drop counter (not a silent ignore).
 * Everything else — foreign origins, unknown frames, token mismatches,
 * non-bridge traffic — returns false and stays fully ignored.
 */
export function shouldCountDrop(
  entry: RouteEntry | undefined,
  data: unknown,
  origin: string,
  expectedOrigin?: string,
): boolean {
  if (!entry || !originAllowed(origin, expectedOrigin)) return false
  if (typeof data !== 'object' || data === null) return false
  if (!('pc' in data) || !('token' in data)) return false
  if (data.pc !== true || data.token !== entry.token) return false
  return !isRawPayload(data)
}
