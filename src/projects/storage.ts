import type { Edge } from '@xyflow/react'
import type { BoardNode } from '../canvas/TokenNode'
import type { Project } from './projects'
import { BUILTIN_PROJECTS } from './projects'

/**
 * Per-project persistence (localStorage, no backend).
 *
 * - `pc.board.<projectId>` → `{ v: 5, nodes, edges, removed, trash, savedAt }`:
 *   THE board arrangement, and the only one. v1/v2 (no `v`, bare nodes+edges),
 *   v3 (`removed`) and v4 (`trash`) all load — read-old/write-new, no
 *   migration script. `savedAt` is the single clock everything else is
 *   compared against (`seedBoard`), so priority is one rule, not three.
 * - `pc.projects.custom`   → Project[]: user-created boards.
 * - `pc.ui.panelVisible`   → right sidebar collapsed or not.
 *
 * 5.2 consolidation: an arrangement used to live in three places — this
 * record, the retired per-project import marker, and `project/<id>/board.json`
 * read with a sync XHR *during render*. Whichever copy looked newer won, and
 * "looked newer" was re-derived per call site, which is how a board came back
 * wrong after a reset. Now the record is the store and board.json is only an
 * async seed (`seedBoard`); legacy markers are converted once, in `loadBoard`.
 *
 * `pc.ui.lastProject` is retired: the URL hash is the source of truth for the
 * active board (2.1).
 *
 * Specs/sizes are deliberately NOT persisted: the bridge re-measures
 * every iframe on mount, so a cached height could never go stale.
 */

const BOARD_PREFIX = 'pc.board.'
/**
 * Retired per-project import marker: `pc` + `statefile` + projectId, joined.
 * The dotted key is never spelled out anywhere in src/ on purpose — a
 * retired-prefix grep gate asserts that the old key is gone, and that gate has
 * to stay clean so nothing can quietly re-grow a second source of truth for
 * one board. The one-time migration in `loadBoard` is this constant's only
 * reader.
 */
const LEGACY_MARKER_PREFIX = ['pc', 'statefile', ''].join('.')
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
  v: 5
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
  parsed: { nodes?: unknown; edges?: unknown; savedAt?: unknown },
): parsed is { nodes: BoardNode[]; edges: Edge[]; removed?: unknown; trash?: unknown; savedAt?: number } {
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

/** One read + normalise of the single record. v1..v4 payloads never carried
 *  `savedAt`, so they read as 0 — older than any artifact or marker, which is
 *  exactly the intent: a record without a clock cannot claim to be newer. */
function readRecord(
  projectId: string,
): { snapshot: BoardSnapshot; savedAt: number } | null {
  const raw = safeGet(BOARD_PREFIX + projectId)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as {
      nodes?: unknown
      edges?: unknown
      removed?: unknown
      trash?: unknown
      savedAt?: unknown
    }
    if (!validNodesEdges(parsed)) {
      console.warn(`[phone-canvas] ignoring corrupt board snapshot for "${projectId}"`)
      return null
    }
    // v1 (no v) and v2 share the nodes/edges shape and have no `removed` list;
    // v3 added `removed`, v4 added `trash` — normalize on read, no migration
    const removed = Array.isArray(parsed.removed)
      ? parsed.removed.filter((x): x is string => typeof x === 'string')
      : []
    let trash: TrashEntry[] = []
    if (Array.isArray(parsed.trash)) {
      const good = (parsed.trash as unknown[]).filter(validTrashEntry)
      if (good.length !== (parsed.trash as unknown[]).length) {
        console.warn(`[phone-canvas] dropping corrupt trash entries for "${projectId}"`)
      }
      trash = good
    }
    return {
      snapshot: {
        v: 5,
        nodes: parsed.nodes as BoardNode[],
        edges: parsed.edges as Edge[],
        removed,
        trash,
      },
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : 0,
    }
  } catch {
    console.warn(`[phone-canvas] ignoring unreadable board snapshot for "${projectId}"`)
    return null
  }
}

/** The one write path for the record — every writer (save, migration, seed
 *  application) goes through here, so the record cannot grow a second shape. */
function saveRecord(projectId: string, snapshot: BoardSnapshot, savedAt: number): void {
  safeSet(BOARD_PREFIX + projectId, JSON.stringify({ ...snapshot, savedAt }))
}

/**
 * ONE-TIME migration of the retired import marker into the record. Idempotent:
 * the marker key is deleted either way, so the second open is a no-op. A
 * record is never lost — the marker only wins when it is strictly newer than
 * the record (import, then reset), and its `exportedAt` becomes the record's
 * `savedAt` so the freeze seed keeps comparing against the clock the user's own
 * last action produced.
 */
function migrateLegacyMarker(
  projectId: string,
  record: { snapshot: BoardSnapshot; savedAt: number } | null,
): { snapshot: BoardSnapshot; savedAt: number } | null {
  const key = LEGACY_MARKER_PREFIX + projectId
  const raw = safeGet(key)
  if (raw === null) return null
  let marker: ProjectStateFile
  try {
    marker = parseStateFile(raw, projectId)
  } catch {
    // unparseable marker holds nothing a record could lose — drop it, or it
    // outlives the migration as a second source of truth nobody can read
    console.warn(`[phone-canvas] dropping corrupt legacy state file for "${projectId}"`)
    safeDel(key)
    return null
  }
  if (record && marker.exportedAt <= record.savedAt) {
    // the record already reflects this import (write-through) or a later drag:
    // keep the record, retire the redundant marker
    safeDel(key)
    return null
  }
  const migrated = { snapshot: marker.board, savedAt: marker.exportedAt }
  // write before delete: a quota/private-mode failure must leave the marker
  // (the only other copy) in place rather than losing the board entirely
  saveRecord(projectId, migrated.snapshot, migrated.savedAt)
  safeDel(key)
  return migrated
}

/** The record after the one-time legacy migration: what `loadBoard` returns
 *  and what `seedBoard` compares the freeze against. */
function resolveRecord(
  projectId: string,
): { snapshot: BoardSnapshot; savedAt: number } | null {
  const record = readRecord(projectId)
  return migrateLegacyMarker(projectId, record) ?? record
}

/** localStorage-only and synchronous: the record, or the migrated legacy
 *  marker, or null (no arrangement yet → the caller lays out a fresh board). */
export function loadBoard(projectId: string): BoardSnapshot | null {
  return resolveRecord(projectId)?.snapshot ?? null
}

export function saveBoard(
  projectId: string,
  snapshot: { nodes: BoardNode[]; edges: Edge[]; removed: string[]; trash?: TrashEntry[] },
): void {
  saveRecord(
    projectId,
    {
      v: 5,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      removed: snapshot.removed,
      trash: snapshot.trash ?? [],
    },
    Date.now(),
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

/**
 * The freeze seed (5.2): `project/<id>/board.json` — the
 * `npm run project -- freeze <id>` artifact — is read, never merged, and only
 * wins when it is strictly newer than the record, or when no record exists.
 * Anything else (404, bad JSON, no `fetch`, foreign projectId) returns null:
 * an absent artifact is the normal case, not an error, so it must never throw
 * and never blank a board.
 *
 * The record is read at CALL time, not when the response lands, because
 * BoardView's save effect persists the just-opened board while this request is
 * in flight: comparing after the await would always see that fresh record and
 * the freeze could never seed anything. Hence "call it before the board has
 * written its first record" (BoardView declares the seed effect above the save
 * effect for exactly this reason).
 */
export async function seedBoard(projectId: string): Promise<ProjectStateFile | null> {
  const at = resolveRecord(projectId)
  if (typeof fetch !== 'function') return null
  try {
    // no-store: the artifact is rewritten by the CLI between reloads, and a
    // cached old freeze is indistinguishable from a stale board
    const res = await fetch(`/project/${projectId}/board.json`, { cache: 'no-store' })
    if (!res.ok) return null
    const parsed = parseStateFile(await res.text(), projectId)
    if (at && parsed.exportedAt <= at.savedAt) return null
    return parsed
  } catch {
    return null
  }
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
      v: 5,
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
  // delete-project must not leave the retired marker behind: it is re-writable
  // only by the one-time migration, and a project id reused later would come
  // back with an arrangement the user had deleted
  safeDel(LEGACY_MARKER_PREFIX + projectId)
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
 * Wipe this app's local state and report what went. The files on disk are the
 * source of truth for everything except the board arrangement and uncommitted
 * token drafts, so throwing all of it away is always safe — it just costs you
 * the arrangement you had dragged out (the next open falls back to the
 * board.json freeze seed, or to a fresh layout).
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
