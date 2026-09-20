import type { Edge } from '@xyflow/react'
import type { BoardNode } from '../canvas/TokenNode'
import type { Project } from './projects'
import { BUILTIN_PROJECTS } from './projects'

/**
 * Per-project persistence (localStorage, no backend).
 *
 * - `pc.board.<projectId>` → { nodes, edges }: layout survives reload.
 * - `pc.projects.custom`   → Project[]: user-created boards.
 * - `pc.ui.panelVisible`   → right sidebar collapsed or not.
 *
 * v2: board snapshots are written as `{ v: 2, nodes, edges }`. v1 payloads
 * (bare `{ nodes, edges }`, no `v`) still load — read-old/write-new, no
 * migration script. `pc.ui.lastProject` is retired: the URL hash is the
 * source of truth for the active board (2.1).
 *
 * Specs/sizes are deliberately NOT persisted: the bridge re-measures
 * every iframe on mount, so a cached height could never go stale.
 */

const BOARD_PREFIX = 'pc.board.'
const CUSTOM_KEY = 'pc.projects.custom'
const PANEL_KEY = 'pc.ui.panelVisible'

export type BoardSnapshot = {
  v: 2
  nodes: BoardNode[]
  edges: Edge[]
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode / quota — board just becomes session-only */
  }
}

function safeDel(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

function validNodesEdges(parsed: { nodes?: unknown; edges?: unknown }): parsed is { nodes: BoardNode[]; edges: Edge[] } {
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return false
  // minimal shape check — a corrupt entry falls back to fresh layout
  return (parsed.nodes as unknown[]).every((n) => n !== null && typeof n === 'object' && typeof (n as { id?: unknown }).id === 'string' && 'data' in (n as object))
}

export function loadBoard(projectId: string): BoardSnapshot | null {
  const raw = safeGet(BOARD_PREFIX + projectId)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { v?: unknown; nodes?: unknown; edges?: unknown }
    if (!validNodesEdges(parsed)) {
      console.warn(`[phone-canvas] ignoring corrupt board snapshot for "${projectId}"`)
      return null
    }
    // v1 (no v) and v2 share the same nodes/edges shape — normalize on read
    return { v: 2, nodes: parsed.nodes as BoardNode[], edges: parsed.edges as Edge[] }
  } catch {
    console.warn(`[phone-canvas] ignoring unreadable board snapshot for "${projectId}"`)
    return null
  }
}

export function saveBoard(projectId: string, snapshot: { nodes: BoardNode[]; edges: Edge[] }): void {
  safeSet(BOARD_PREFIX + projectId, JSON.stringify({ v: 2, nodes: snapshot.nodes, edges: snapshot.edges }))
}

export function clearBoard(projectId: string): void {
  safeDel(BOARD_PREFIX + projectId)
}

export function loadCustomProjects(): Project[] {
  const raw = safeGet(CUSTOM_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Project[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((p) => p && typeof p.id === 'string' && Array.isArray(p.screenIds))
  } catch {
    console.warn('[phone-canvas] ignoring unreadable custom-project list')
    return []
  }
}

export function saveCustomProjects(projects: Project[]): void {
  safeSet(CUSTOM_KEY, JSON.stringify(projects))
}

export function allProjects(custom: Project[]): Project[] {
  return [...BUILTIN_PROJECTS, ...custom]
}

/** @deprecated retired in 3.6 — the URL hash owns the active board. Kept as
 *  no-ops so old imports fail loudly at typecheck, not silently at runtime. */
export function loadLastProject(): string | null {
  return null
}

export function saveLastProject(_id: string | null): void {
  /* no-op: route state lives in the URL hash */
}

export function loadPanelVisible(): boolean {
  const raw = safeGet(PANEL_KEY)
  return raw === null ? true : raw !== '0'
}

export function savePanelVisible(visible: boolean): void {
  safeSet(PANEL_KEY, visible ? '1' : '0')
}
