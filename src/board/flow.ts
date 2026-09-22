import type { Edge } from '@xyflow/react'

/**
 * Flow edge model (flow-core): a plain ReactFlow edge plus an optional
 * source-component label — which button/tab leads into the target view.
 *
 * The label lives on the edge itself so `addEdge`, undo snapshots and
 * `saveBoard` carry it for free. Old snapshots have no `data.flow` and
 * read as unlabeled — read-old/write-new, no migration.
 */
export type FlowData = {
  flow?: { sourceComponent?: string }
}

export type FlowEdge = Edge<FlowData>

type Endpoints = { source: string | null; target: string | null }

/** Connect rules: no self-loops, no duplicate pairs. */
export function canConnect(edges: readonly Edge[], c: Endpoints): boolean {
  if (!c.source || !c.target || c.source === c.target) return false
  return !edges.some((e) => e.source === c.source && e.target === c.target)
}

/** Keep only edges whose both ends survived node filtering. */
export function pruneEdges<N extends { id: string }>(nodes: readonly N[], edges: readonly Edge[]): Edge[] {
  const ids = new Set(nodes.map((n) => n.id))
  return edges.filter((e) => ids.has(e.source) && ids.has(e.target))
}

/** Label text for an edge, from any era of snapshot. */
export function edgeLabel(e: Edge): string | undefined {
  const data = (e.data ?? {}) as FlowData
  const name = data.flow?.sourceComponent?.trim()
  return name ? name : undefined
}

/** Set (or clear, with a blank name) the source-component label. */
export function withLabel<E extends Edge>(e: E, name: string): E {
  const trimmed = name.trim()
  const data = { ...((e.data ?? {}) as Record<string, unknown>) } as Record<string, unknown> & FlowData
  if (trimmed) data.flow = { sourceComponent: trimmed }
  else delete data.flow
  return { ...e, data, label: trimmed || undefined }
}
