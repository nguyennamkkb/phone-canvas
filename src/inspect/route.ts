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
 * Pure accept/drop decision for a bridge → parent message: same origin as the
 * board (srcdoc iframes inherit the parent origin) + registered frame +
 * matching per-node token + v:1 schema. Strangers fail here and are ignored
 * completely; malformed payloads from a known frame fail here too but the
 * caller counts them via `shouldCountDrop` so the panel can say so.
 */
export function shouldAccept(
  entry: RouteEntry | undefined,
  data: unknown,
  origin: string,
  expectedOrigin?: string,
): data is BridgeMessage {
  if (!entry) return false
  if (origin !== expectedOrBrowser(expectedOrigin)) return false
  if (!isRawPayload(data)) return false
  return data.token === entry.token
}

/**
 * Malformed but authenticated: same origin, known frame, matching token, yet
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
  if (!entry || origin !== expectedOrBrowser(expectedOrigin)) return false
  if (typeof data !== 'object' || data === null) return false
  if (!('pc' in data) || !('token' in data)) return false
  if (data.pc !== true || data.token !== entry.token) return false
  return !isRawPayload(data)
}
