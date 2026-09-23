import type { Edge } from '@xyflow/react'
import type { BoardNode } from '../canvas/TokenNode'
import type { Project } from './projects'
import { BUILTIN_PROJECTS } from './projects'

/**
 * Per-project persistence (localStorage, no backend).
 *
 * - `pc.board.<projectId>` → { nodes, edges, removed }: layout survives reload.
 *   v3 added `removed`; v1/v2 read fine, so there is still no migration script.
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
const STATE_FILE_PREFIX = 'pc.statefile.'
const CUSTOM_KEY = 'pc.projects.custom'
const PANEL_KEY = 'pc.ui.panelVisible'
const DOCK_PREFIX = 'pc.ui.dock.'

/**
 * Every key this app owns starts with this. All of it is rebuildable, and none
 * of it arrives over HTTP — which is why a stale entry is so confusing: the
 * screen keeps rendering the old board or an uncommitted token draft, and
 * reloading changes nothing because there is nothing to re-fetch.
 */
const KEY_PREFIX = 'pc.'

export type TrashEntry = {
  /** unique per deletion, e.g. `home-1727000000000-a1b2` */
  id: string
  screenId: string
  /** node snapshot at delete time — restore puts it back 1:1 */
  node: BoardNode
  /** edges cut by the deletion — restore re-attaches them */
  edges: Edge[]
  deletedAt: number
}

export type BoardSnapshot = {
  v: 4
  nodes: BoardNode[]
  edges: Edge[]
  /**
   * Screen ids deliberately taken off this board. Without it, reconciliation
   * on open would put back every screen the user deleted.
   */
  removed: string[]
  /** per-project trash — newest entry last */
  trash: TrashEntry[]
}

export function newTrashEntry(screenId: string, node: BoardNode, edges: Edge[]): TrashEntry {
  return {
    id: `${screenId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    screenId,
    node: {
      ...node,
      data: { ...node.data },
      position: { ...node.position },
    },
    edges: edges.map((e) => ({ ...e })),
    deletedAt: Date.now(),
  }
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

function validNodesEdges(
  parsed: { nodes?: unknown; edges?: unknown },
): parsed is { nodes: BoardNode[]; edges: Edge[]; removed?: unknown; trash?: unknown } {
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) return false
  // minimal shape check — a corrupt entry falls back to fresh layout
  return (parsed.nodes as unknown[]).every((n) => n !== null && typeof n === 'object' && typeof (n as { id?: unknown }).id === 'string' && 'data' in (n as object))
}

function validTrashEntry(e: unknown): e is TrashEntry {
  if (!e || typeof e !== 'object') return false
  const t = e as Record<string, unknown>
  if (typeof t.id !== 'string' || typeof t.screenId !== 'string') return false
  if (typeof t.deletedAt !== 'number') return false
  if (!t.node || typeof t.node !== 'object') return false
  const n = t.node as Record<string, unknown>
  if (typeof n.id !== 'string' || !n.data || typeof n.data !== 'object') return false
  if (!n.position || typeof n.position !== 'object') return false
  if (!Array.isArray(t.edges)) return false
  return true
}

export function loadBoard(projectId: string): BoardSnapshot | null {
  const file = importedStateFile(projectId)
  const raw = safeGet(BOARD_PREFIX + projectId)
  if (!raw) return file ? file.board : null
  try {
    const rawParsed = JSON.parse(raw) as {
      nodes?: unknown
      edges?: unknown
      removed?: unknown
      trash?: unknown
      savedAt?: number
    }
    const cacheSavedAt = rawParsed.savedAt ?? 0
    if (!validNodesEdges(rawParsed)) {
      console.warn(`[phone-canvas] ignoring corrupt board snapshot for "${projectId}"`)
      return file ? file.board : null
    }
    if (file && file.exportedAt > cacheSavedAt) return file.board
    const parsed = rawParsed
    // v1 (no v) and v2 share the nodes/edges shape and have no `removed` list;
    // v3 added `removed`, v4 added `trash` — normalize on read, no migration
    const removed = Array.isArray(parsed.removed)
      ? parsed.removed.filter((x: unknown): x is string => typeof x === 'string')
      : []
    let trash: TrashEntry[] = []
    if (Array.isArray(parsed.trash)) {
      const good = (parsed.trash as unknown[]).filter(validTrashEntry)
      if (good.length !== (parsed.trash as unknown[]).length) {
        console.warn(`[phone-canvas] dropping corrupt trash entries for "${projectId}"`)
      }
      trash = good
    }
    return { v: 4, nodes: parsed.nodes as BoardNode[], edges: parsed.edges as Edge[], removed, trash }
  } catch {
    console.warn(`[phone-canvas] ignoring unreadable board snapshot for "${projectId}"`)
    return file ? file.board : null
  }
}

export function saveBoard(
  projectId: string,
  snapshot: { nodes: BoardNode[]; edges: Edge[]; removed: string[]; trash?: TrashEntry[] },
): void {
  safeSet(
    BOARD_PREFIX + projectId,
    JSON.stringify({
      v: 4,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      removed: snapshot.removed,
      trash: snapshot.trash ?? [],
      savedAt: Date.now(),
    }),
  )
}

/* ------------------------------------------------- project state file -- */

export type ProjectStateFile = {
  v: 1
  projectId: string
  exportedAt: number
  board: BoardSnapshot
}

export function toStateFile(projectId: string, board: BoardSnapshot): ProjectStateFile {
  return { v: 1, projectId, exportedAt: Date.now(), board }
}

/* imported file marker — survives clearBoard so a cleared cache still restores */
function importedStateFile(projectId: string): ProjectStateFile | null {
  const raw = safeGet(STATE_FILE_PREFIX + projectId)
  if (!raw) return null
  try {
    return parseStateFile(raw, projectId)
  } catch {
    console.warn(`[phone-canvas] ignoring corrupt imported state file for "${projectId}"`)
    return null
  }
}

export function saveImportedStateFile(file: ProjectStateFile): void {
  safeSet(STATE_FILE_PREFIX + file.projectId, JSON.stringify(file))
}

/** validate an imported board.json — throws on any problem, never partial */
function validBoardSnapshot(b: unknown): b is BoardSnapshot {
  if (!b || typeof b !== 'object') return false
  const s = b as Record<string, unknown>
  if (!Array.isArray(s.nodes) || !Array.isArray(s.edges)) return false
  if (s.removed !== undefined && !Array.isArray(s.removed)) return false
  if (s.trash !== undefined && !Array.isArray(s.trash)) return false
  if (Array.isArray(s.trash) && !(s.trash as unknown[]).every(validTrashEntry)) return false
  return true
}

export function parseStateFile(raw: string, expectedProjectId?: string): ProjectStateFile {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('File không phải JSON hợp lệ.')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('File trạng thái không đúng định dạng.')
  const p = parsed as Record<string, unknown>
  if (p.v !== 1) throw new Error(`Phiên bản state file không hỗ trợ (v=${String(p.v)}).`)
  if (typeof p.projectId !== 'string' || !p.projectId) throw new Error('File thiếu projectId.')
  if (expectedProjectId && p.projectId !== expectedProjectId) {
    throw new Error(`File của project "${p.projectId}", không phải "${expectedProjectId}".`)
  }
  if (typeof p.exportedAt !== 'number') throw new Error('File thiếu exportedAt.')
  if (!validBoardSnapshot(p.board)) throw new Error('Phần board trong file không hợp lệ.')
  const b = p.board as BoardSnapshot
  return {
    v: 1,
    projectId: p.projectId as string,
    exportedAt: p.exportedAt as number,
    board: {
      v: 4,
      nodes: b.nodes,
      edges: b.edges,
      removed: Array.isArray(b.removed)
        ? (b.removed as unknown[]).filter((x): x is string => typeof x === 'string')
        : [],
      trash: Array.isArray(b.trash) ? (b.trash as TrashEntry[]).filter(validTrashEntry) : [],
    },
  }
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

/** Token rail gọn/mở theo từng project (board-layout). Mặc định gọn để canvas thoáng. */
export function loadDockCollapsed(projectId: string): boolean {
  return safeGet(DOCK_PREFIX + projectId) !== '0'
}

export function saveDockCollapsed(projectId: string, collapsed: boolean): void {
  safeSet(DOCK_PREFIX + projectId, collapsed ? '1' : '0')
}

/** Coach-mark giới thiệu rail mới: hiện đúng một lần cho tới khi đóng. */
const DOCK_COACH_KEY = 'pc.ui.dockCoachSeen'

export function loadDockCoachSeen(): boolean {
  return safeGet(DOCK_COACH_KEY) === '1'
}

export function saveDockCoachSeen(): void {
  safeSet(DOCK_COACH_KEY, '1')
}

/**
 * Wipe this app's local state and report what went. The file on disk is the
 * source of truth for everything except board layout and uncommitted token
 * drafts, so throwing all of it away is always safe — it just costs you the
 * arrangement you had dragged out.
 */
export function clearAllLocalState(): string[] {
  const doomed: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(KEY_PREFIX)) doomed.push(key)
    }
    for (const key of doomed) localStorage.removeItem(key)
  } catch {
    /* private mode — there is nothing to clear */
  }
  return doomed
}
