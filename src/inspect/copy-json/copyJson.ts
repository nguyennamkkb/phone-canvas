import type { SpecNode } from '../../spec/types'

/**
 * Copy-JSON handoff payload (v1) — frozen shape, see `src/inspect/copy-json.test.ts`.
 * Downstream consumers (agent prompts, the future MCP integration) parse this,
 * so any field change bumps PAYLOAD_VERSION and the snapshot test.
 */
export const PAYLOAD_VERSION = 1

export type CopyPayload =
  | { version: number; screen: string | null; selectedElement: SpecNode }
  | { version: number; screen: string | null; elements: SpecNode[] }

export function copyPayloadFor(
  selectedNodeId: string | null,
  specList: SpecNode[],
  selected: SpecNode | null,
): CopyPayload {
  if (selected) return { version: PAYLOAD_VERSION, screen: selectedNodeId, selectedElement: selected }
  return { version: PAYLOAD_VERSION, screen: selectedNodeId, elements: specList }
}

export function copyPayloadText(payload: CopyPayload): string {
  return JSON.stringify(payload, null, 2)
}
