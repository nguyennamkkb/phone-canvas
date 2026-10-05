import type { RawNode } from './types.ts'

/**
 * Bridge wire version. The iframe stamps every message with `v`; the parent
 * drops anything else with a visible counter instead of crashing or hanging
 * on "loading". Bump only with a bridge + validator change together.
 */
export const BRIDGE_VERSION = 1 as const

/**
 * Wire envelope: routing fields (`pc`/`v`/`nodeId`/`token`/`type`) plus the
 * per-type body. Extra fields are ignored so a newer bridge stays readable.
 */
export type BridgeMessage =
  | { pc: true; v: 1; nodeId: string; token: string; type: 'spec'; nodes: RawNode[] }
  | { pc: true; v: 1; nodeId: string; token: string; type: 'height'; value: number; content: number }
  | { pc: true; v: 1; nodeId: string; token: string; type: 'select'; id: string | null }
  | { pc: true; v: 1; nodeId: string; token: string; type: 'ready' }

/**
 * Canonical object guard for the spec boundary (validate.ts is this
 * boundary's type-guard module; the repo has no shared one). Defined once
 * here and reused below — never recreated at call sites.
 */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Finite numbers only: structured clone can carry NaN/Infinity, JSON can't. */
function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

/** Minimal shape the parent actually reads; extra bridge fields are ignored. */
export function isRawNode(n: unknown): n is RawNode {
  if (!isRecord(n)) return false
  if (typeof n.id !== 'string' || typeof n.tag !== 'string') return false
  if (typeof n.parent !== 'string' && n.parent !== null) return false
  const box = n.box
  if (!isRecord(box)) return false
  if (!isNum(box.x) || !isNum(box.y) || !isNum(box.w) || !isNum(box.h)) return false
  if (!isRecord(n.css)) return false
  return true
}

/**
 * Versioned schema gate for every bridge → parent message. Anything malformed
 * (missing `nodes`/`box`/`css`, wrong types, wrong version) is rejected so
 * the caller can drop it with a counter instead of processing it.
 */
export function isRawPayload(data: unknown): data is BridgeMessage {
  if (!isRecord(data)) return false
  if (data.pc !== true) return false
  if (data.v !== BRIDGE_VERSION) return false
  if (typeof data.nodeId !== 'string' || typeof data.token !== 'string') return false
  switch (data.type) {
    case 'spec':
      return Array.isArray(data.nodes) && data.nodes.every(isRawNode)
    case 'height':
      return isNum(data.value) && isNum(data.content)
    case 'select':
      return typeof data.id === 'string' || data.id === null
    case 'ready':
      return true
    default:
      return false
  }
}
