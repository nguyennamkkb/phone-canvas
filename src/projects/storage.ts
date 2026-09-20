import type { Edge } from '@xyflow/react'
import type { PhoneFlowNode } from '../canvas/PhoneNode'
import type { Project } from './projects'
import { BUILTIN_PROJECTS } from './projects'

/**
 * Per-project persistence (localStorage, no backend).
 *
 * - `pc.board.<projectId>` → { nodes, edges }: layout survives reload.
 * - `pc.projects.custom`   → Project[]: user-created boards.
 * - `pc.ui.lastProject`    → reopen where you left off.
 * - `pc.ui.panelVisible`   → right sidebar collapsed or not.
 *
 * Specs/sizes are deliberately NOT persisted: the bridge re-measures
 * every iframe on mount, so a cached height could never go stale.
 */

const BOARD_PREFIX = 'pc.board.'
const CUSTOM_KEY = 'pc.projects.custom'
const LAST_KEY = 'pc.ui.lastProject'
const PANEL_KEY = 'pc.ui.panelVisible'

export type BoardSnapshot = {
  nodes: PhoneFlowNode[]
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

export function loadBoard(projectId: string): BoardSnapshot | null {
  const raw = safeGet(BOARD_PREFIX + projectId)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as BoardSnapshot
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return null
    // minimal shape check — a corrupt entry falls back to fresh layout
    if (!parsed.nodes.every((n) => n && typeof n.id === 'string' && n.data)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveBoard(projectId: string, snapshot: BoardSnapshot): void {
  safeSet(BOARD_PREFIX + projectId, JSON.stringify(snapshot))
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
    return []
  }
}

export function saveCustomProjects(projects: Project[]): void {
  safeSet(CUSTOM_KEY, JSON.stringify(projects))
}

export function allProjects(custom: Project[]): Project[] {
  return [...BUILTIN_PROJECTS, ...custom]
}

export function loadLastProject(): string | null {
  return safeGet(LAST_KEY)
}

export function saveLastProject(id: string | null): void {
  if (id) safeSet(LAST_KEY, id)
  else safeDel(LAST_KEY)
}

export function loadPanelVisible(): boolean {
  const raw = safeGet(PANEL_KEY)
  return raw === null ? true : raw !== '0'
}

export function savePanelVisible(visible: boolean): void {
  safeSet(PANEL_KEY, visible ? '1' : '0')
}
