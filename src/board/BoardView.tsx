import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import type { Connection, Edge } from '@xyflow/react'
import { canConnect, edgeLabel, pruneEdges, withLabel } from './flow'
import { Board } from '../canvas/Board'
import { BoardContext } from '../canvas/BoardContext'
import type { CanvasMode, FrameStyle } from '../canvas/BoardContext'
import type { PhoneNodeData } from '../canvas/PhoneNode'
import type { PhoneFlowNode } from '../canvas/PhoneNode'
import type { BoardNode } from '../canvas/TokenNode'
import { TokenDock } from '../canvas/TokenDock'
import type { DockTab } from '../canvas/TokenDock'
import { useTokenTheme, useUiTheme } from '../tokens/store'
import type { ThemeMode } from '../tokens/tokens'
import { DEFAULT_DEVICE_ID, isKnownDevice } from '../frame/devices'
import { layoutRows, nextSlotX } from './placement'
import { useInspector } from '../inspect/InspectorContext'
import { SpecPanel } from '../inspect/SpecPanel'
import { SCREEN_BY_ID, useRegistryVersion } from '../screens'
import type { Project } from '../projects/projects'
import { resolveScreens } from '../projects/projects'
import {
  loadBoard,
  loadDockCollapsed,
  newTrashEntry,
  parseStateFile,
  saveBoard,
  saveDockCollapsed,
  seedBoard,
  toStateFile,
} from '../projects/storage'
import type { ArrangementRow, BoardSnapshot, TrashEntry } from '../projects/storage'
import { missingScreenIds } from './reconcile'
import { TrashDialog } from './TrashDialog'
import { ErrorBoundary } from '../shell/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const COLUMN_GAP = 120

/** board-local node identity — react-flow + the iframe token router key on it */
const counters: Record<string, number> = {}

export function nextNodeId(projectId: string): string {
  counters[projectId] = (counters[projectId] ?? 0) + 1
  return `${projectId}-n${counters[projectId]}`
}

/** default canvas device for a screen: manifest deviceId wins (iPad screens
 *  open at their own width), otherwise the phone default as before */
function deviceForScreen(screenId: string): string {
  return SCREEN_BY_ID.get(screenId)?.deviceId ?? DEFAULT_DEVICE_ID
}

function makeNode(projectId: string, screenId: string, x: number, y = 0): PhoneFlowNode | null {
  const screen = SCREEN_BY_ID.get(screenId)
  if (!screen) return null
  return {
    id: nextNodeId(projectId),
    type: 'phone',
    position: { x, y },
    data: { screenId: screen.id, deviceId: deviceForScreen(screenId) },
  }
}

/** legacy token-table node shape — board cũ có thể còn, lọc bỏ im lặng (2.2) */
type LegacyBoardNode = PhoneFlowNode | { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }

/** historical name — matches every screen node, phone or tablet (only checks type + screenId, never width) */
function isPhoneNode(n: LegacyBoardNode): n is PhoneFlowNode {
  return (
    n.type === 'phone' &&
    typeof (n.data as PhoneNodeData).screenId === 'string'
  )
}

/**
 * Zombie prune (lifecycle 002-A): a node/trash entry whose screenId left the
 * manifest (delete-screen --force, or a rename mid-flight) must not open —
 * it would render "Screen not found" and reconcile would never re-add it.
 * Pure + exported for tests: BoardView only calls this with SCREEN_BY_ID.
 */
export function pruneZombieNodes<N extends BoardNode | TrashEntry>(
  items: readonly N[],
  known: Pick<typeof SCREEN_BY_ID, 'has'>,
): N[] {
  return items.filter((it) => {
    const sid = 'screenId' in it ? (it as TrashEntry).screenId : (it as BoardNode).data.screenId
    return typeof sid === 'string' && known.has(sid)
  })
}

/**
 * Fresh board: every project screen in manifest order, one row, laid out by
 * the shared `layoutRows` rule (single row === the old `nextSlotX` cursor
 * exactly). Returns the row model too so the board keeps it going forward.
 */
function freshBoard(project: Project): { nodes: BoardNode[]; arrangement: ArrangementRow[] } {
  counters[project.id] = 0
  const ids = resolveScreens(project)
  const cells = layoutRows([ids.map((sid) => ({ deviceId: deviceForScreen(sid) }))], COLUMN_GAP)[0] ?? []
  const out: BoardNode[] = []
  ids.forEach((sid, i) => {
    const node = makeNode(project.id, sid, cells[i]?.x ?? 0, cells[i]?.y ?? 0)
    if (node) out.push(node)
  })
  return { nodes: out, arrangement: [{ screens: ids }] }
}

/**
 * Keep only rows that still name known screens (delete --force / rename drops
 * them from the manifest). Trashed screens stay in their row — a restore puts
 * the node back at its old position, and the row is only "last applied".
 */
function sanitizeRows(
  arrangement: ArrangementRow[] | undefined,
  known: Pick<typeof SCREEN_BY_ID, 'has'>,
): ArrangementRow[] | undefined {
  if (!arrangement) return undefined
  const rows = arrangement
    .map((r) => ({ ...r, screens: r.screens.filter((s) => known.has(s)) }))
    .filter((r) => r.screens.length > 0)
  return rows.length > 0 ? rows : undefined
}

/**
 * The ONE open rule for a saved arrangement, whether it came from the record
 * (`loadBoard`) or from the async freeze seed (`seedBoard`): a frozen artifact
 * handed to a different code path would open under different rules, which is
 * how the two copies drifted apart in the first place.
 *
 * `saved === null` → fresh layout.
 */
function openingNodes(
  project: Project,
  saved: BoardSnapshot | null,
): {
  nodes: BoardNode[]
  edges: Edge[]
  removed: string[]
  trash: TrashEntry[]
  arrangement: ArrangementRow[] | undefined
} {
  if (saved && saved.nodes.length > 0) {
    let max = 0
    for (const n of saved.nodes) {
      const m = /-n(\d+)$/.exec(n.id)
      if (m) max = Math.max(max, Number(m[1]))
    }
    counters[project.id] = max
    // board cũ có token node: lọc im lặng, giữ nguyên vị trí phone (2.2);
    // zombie prune (002-A): node/trash trỏ screenId đã mất khỏi manifest
    // (delete --force / rename) thì drop ở reader — browser localStorage
    // CLI không quét được nên đây là tuyến dọn duy nhất cho cache đó.
    const phones = pruneZombieNodes(
      (saved.nodes as LegacyBoardNode[]).filter(isPhoneNode),
      SCREEN_BY_ID,
    )
    const trash = pruneZombieNodes(saved.trash, SCREEN_BY_ID)
    // unknown deviceIds (hand-edited board.json / stale import): render falls
    // back to reference silently, so warn once per id instead of hiding it
    for (const id of new Set(
      [...phones.map((n) => n.data.deviceId), ...trash.map((t) => t.node.data.deviceId)],
    )) {
      if (typeof id === 'string' && !isKnownDevice(id)) {
        console.warn(`[phone-canvas] unknown device "${id}" — falling back to reference`)
      }
    }
    // Ghi nhận id đã mất để reconcile không thêm lại thứ không còn tồn tại.
    const lost = new Set<string>()
    for (const n of saved.nodes as LegacyBoardNode[]) {
      if (n.type !== 'phone') continue
      const sid = (n.data as PhoneNodeData).screenId
      if (typeof sid === 'string' && !SCREEN_BY_ID.has(sid)) lost.add(sid)
    }
    for (const t of saved.trash) if (!SCREEN_BY_ID.has(t.screenId)) lost.add(t.screenId)
    if (phones.length > 0 || lost.size > 0) {
      // toàn board là zombie (xóa hẳn màn duy nhất): trả board rỗng +
      // removed ghi nhận id đã mất — reconcile phía dưới sẽ đặt lại các
      // màn hiện tại của project, không phục sinh thứ đã mất.
      // trash còn giữ màn nào thì reconcile không thêm lại nó
      const trashed = new Set(trash.map((t) => t.screenId))
      const removed = [...new Set([...saved.removed, ...lost])].filter((id) => !trashed.has(id))
      return {
        nodes: phones,
        edges: pruneEdges(phones, saved.edges),
        removed,
        trash,
        arrangement: sanitizeRows(saved.arrangement, SCREEN_BY_ID),
      }
    }
  }
  const fresh = freshBoard(project)
  return { nodes: fresh.nodes, edges: [] as Edge[], removed: [], trash: [], arrangement: fresh.arrangement }
}

/**
 * A saved board is the only thing here that persists, and therefore the only
 * thing that can go quietly stale: add a screen to the manifest and a board
 * saved before it existed will never show it. Reloading does not help — there
 * is nothing being fetched. So the board reconciles on open and places every
 * project screen that is neither on the board nor deliberately removed.
 */
function reconciledNodes(
  project: Project,
  nodes: BoardNode[],
  removed: string[],
  arrangement: ArrangementRow[] | undefined,
): { nodes: BoardNode[]; arrangement: ArrangementRow[] | undefined } {
  const missing = missingScreenIds(
    resolveScreens(project),
    nodes.map((n) => n.data.screenId),
    removed,
  )
  if (missing.length === 0) return { nodes, arrangement }
  // màn mới vào hàng cuối của model đã lưu (drag cũ không xếp lại); chưa có
  // model thì hàng cuối chính là toàn board — tương đương hành vi cũ (y = 0).
  const rows = arrangement && arrangement.length > 0
    ? arrangement.map((r) => ({ ...r, screens: [...r.screens] }))
    : [{ screens: [] as string[] }]
  const last = rows[rows.length - 1] ?? { screens: [] as string[] }
  const out = [...nodes]
  for (const screenId of missing) {
    const rowNodes = out.filter((n) => last.screens.includes(n.data.screenId))
    const anchor = rowNodes.length > 0 ? rowNodes : out
    const x = nextSlotX(anchor, COLUMN_GAP)
    const y = anchor.length > 0 ? Math.max(...anchor.map((n) => n.position.y)) : 0
    const node = makeNode(project.id, screenId, x, y)
    if (!node) continue
    out.push(node)
    last.screens.push(screenId)
  }
  return { nodes: out, arrangement: rows }
}

export type BoardViewProps = {
  project: Project
  panelVisible: boolean
  onTogglePanel: () => void
  onBack: () => void
  onTrackScreen: (projectId: string, screenId: string) => void
  onUntrackScreen: (projectId: string, screenId: string) => void
}

function BoardViewInner({
  project,
  panelVisible,
  onTogglePanel,
  onBack,
  onTrackScreen,
  onUntrackScreen,
}: BoardViewProps) {
  const [mode, setMode] = useState<CanvasMode>('move')
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('plain')
  const [tokenTheme, setTokenTheme] = useTokenTheme(project.id)
  const [, setUiTheme] = useUiTheme()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(() => loadDockCollapsed(project.id))
  // design-system dock: Tokens | Components (component-system 4.3)
  const [dockTab, setDockTab] = useState<DockTab>('tokens')
  // focus-mode (3.3): màn đang duyệt ở 100%, null khi ở tổng quan
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)
  // xóa inline 2 bước (5.2): hỏi tại chỗ → xóa → hoàn tác nhanh trong 6s
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [trashOpen, setTrashOpen] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  // hoàn tác xóa: node mang theo edge bị cắt cùng, edge lẻ đứng một mình
  const [undone, setUndone] = useState<
    | { kind: 'node'; node: PhoneFlowNode; screenId: string; edges: Edge[] }
    | { kind: 'edge'; edge: Edge }
    | null
  >(null)
  const undoTimer = useRef<number | undefined>(undefined)
  const { select } = useInspector()

  const opening = useMemo(() => {
    const saved = openingNodes(project, loadBoard(project.id))
    const trashedIds = saved.trash.map((t) => t.screenId)
    const rec = reconciledNodes(project, saved.nodes, [...saved.removed, ...trashedIds], saved.arrangement)
    return {
      nodes: rec.nodes,
      edges: saved.edges,
      removed: saved.removed,
      trash: saved.trash,
      arrangement: rec.arrangement,
    }
  }, [project])
  const [nodes, setNodes, onNodesChange] = useNodesState<BoardNode>(opening.nodes)
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState<Edge>(opening.edges)
  // edge đang chọn (click dây nối) — ReactFlow báo qua select change
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const onEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChangeBase>[0]) => {
      onEdgesChangeBase(changes)
      for (const c of changes) {
        if (c.type === 'select') setSelectedEdgeId(c.selected ? c.id : null)
      }
    },
    [onEdgesChangeBase],
  )
  // màn đã bị gỡ khỏi board: giữ lại để lần mở sau không tự thêm về
  const [removed, setRemoved] = useState<string[]>(opening.removed)
  // thùng rác per-project: snapshot node + edges bị cắt, newest cuối
  const [trash, setTrash] = useState<TrashEntry[]>(opening.trash)
  // model hàng áp dụng lần cuối — drag tay đổi nodes chứ không đổi model
  const [arrangement, setArrangement] = useState<ArrangementRow[] | undefined>(opening.arrangement)

  // Freeze seed (5.2): `project/<id>/board.json` — the `npm run project --
  // freeze` artifact — opens the board ONLY when the record does not already
  // own it (seedBoard decides, one rule: exportedAt > savedAt, or no record).
  // Declared BEFORE the save effect on purpose: that effect writes the record
  // as soon as the board opens, so a seed called after it would always see a
  // record newer than the artifact and could never seed anything. The winner
  // lands through the same prune + reconcile rules as a record read, in one
  // batched update, so a normal reload (record wins → null) repaints nothing.
  useEffect(() => {
    let superseded = false
    void seedBoard(project.id).then((file) => {
      if (superseded || !file) return
      const seeded = openingNodes(project, file.board)
      const trashedIds = seeded.trash.map((t) => t.screenId)
      const rec = reconciledNodes(project, seeded.nodes, [...seeded.removed, ...trashedIds], seeded.arrangement)
      setNodes(rec.nodes)
      setArrangement(rec.arrangement)
      setEdges(seeded.edges)
      setRemoved(seeded.removed)
      setTrash(seeded.trash)
    })
    return () => {
      superseded = true
    }
  }, [project, setNodes, setEdges])

  useEffect(() => {
    saveBoard(project.id, { nodes, edges, removed, trash, arrangement })
  }, [project.id, nodes, edges, removed, trash, arrangement])

  // Live registry sync: a project file added/edited/removed on disk resyncs
  // the mounted board — prune zombie nodes, drop their edges, place new
  // screens — without a page reload. Same rules as openingNodes/reconcile,
  // but deliberately-removed (removed[]) and trashed screens stay off.
  // `registryVersion` only retriggers this; the maps are read fresh each run.
  const registryVersion = useRegistryVersion()
  useEffect(() => {
    const known = SCREEN_BY_ID
    const lost = new Set<string>()
    for (const n of nodes) {
      if (!known.has(n.data.screenId)) lost.add(n.data.screenId)
    }
    for (const t of trash) {
      if (!known.has(t.screenId)) lost.add(t.screenId)
    }
    const keptNodes = lost.size === 0 ? nodes : nodes.filter((n) => known.has(n.data.screenId))
    const keptTrash = lost.size === 0 ? trash : trash.filter((t) => known.has(t.screenId))
    const trashedIds = new Set(keptTrash.map((t) => t.screenId))
    const nextRemoved = [...new Set([...removed, ...lost])].filter((id) => !trashedIds.has(id))
    const saneArrangement = lost.size === 0 ? arrangement : sanitizeRows(arrangement, known)
    const rec = reconciledNodes(project, keptNodes, [...nextRemoved, ...trashedIds], saneArrangement)
    const nextNodes = rec.nodes
    const nextArrangement = rec.arrangement
    const nextEdges = lost.size === 0 ? edges : pruneEdges(nextNodes, edges)
    if (
      keptNodes.length !== nodes.length ||
      nextNodes.length !== keptNodes.length ||
      keptTrash.length !== trash.length ||
      nextRemoved.length !== removed.length ||
      nextEdges.length !== edges.length ||
      nextArrangement !== saneArrangement
    ) {
      setNodes(nextNodes)
      setEdges(nextEdges)
      setTrash(keptTrash)
      setRemoved(nextRemoved)
      if (nextArrangement !== saneArrangement) setArrangement(nextArrangement)
    }
  }, [registryVersion, project, nodes, edges, removed, trash, arrangement])

  // xuất/nhập trạng thái — browser không ghi được vào repo nên đi qua file
  const handleExportState = useCallback(() => {
    const stateFile = toStateFile(project.id, { v: 5, nodes, edges, removed, trash, arrangement })
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(stateFile, null, 2)], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.id}-board.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [project.id, nodes, edges, removed, trash, arrangement])

  const handleImportState = useCallback(
    async (file: File) => {
      try {
        const stateFile = parseStateFile(await file.text(), project.id)
        // write-through into the ONE store, then reload so the board reads it
        // back. No marker is written any more: the record's `savedAt` (now) is
        // newer than the freeze, which is exactly what protects the import.
        saveBoard(project.id, stateFile.board)
        window.location.reload()
      } catch (e) {
        alert(e instanceof Error ? e.message : String(e))
      }
    },
    [project.id],
  )

  const onRequestDelete = useCallback((id: string) => {
    setConfirmDeleteId(id)
  }, [])

  const onCancelDelete = useCallback(() => {
    setConfirmDeleteId(null)
  }, [])

  const onConfirmDelete = useCallback(
    (id: string) => {
      const target = nodes.find((n) => n.id === id)
      if (!target) {
        setConfirmDeleteId(null)
        return
      }
      const snapshot: PhoneFlowNode = {
        ...target,
        data: { ...target.data },
        position: { ...target.position },
      }
      const screenId = target.data.screenId
      const cutEdges = edges.filter((e) => e.source === id || e.target === id)
      setNodes((ns) => ns.filter((n) => n.id !== id))
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id))
      setSelectedNodeId((sel) => (sel === id ? null : sel))
      setFocusedNodeId((f) => (f === id ? null : f))
      setConfirmDeleteId(null)
      select(null)
      const last = !nodes.some((n) => n.id !== id && n.data.screenId === screenId)
      if (last) {
        onUntrackScreen(project.id, screenId)
        setRemoved((r) => (r.includes(screenId) ? r : [...r, screenId]))
      }
      // vào thùng rác thay vì biến mất — nhớ vị trí + edges để restore 1:1
      setTrash((t) => [...t, newTrashEntry(screenId, snapshot, cutEdges)])
      // hoàn-tác-nhanh: giữ snapshot 6s, hết hạn thì thôi
      window.clearTimeout(undoTimer.current)
      setUndone({ kind: 'node', node: snapshot, screenId, edges: cutEdges })
      undoTimer.current = window.setTimeout(() => setUndone(null), 6000)
    },
    [nodes, project.id, onUntrackScreen, setNodes, setEdges, select],
  )

  const onDeleteEdge = useCallback(
    (id: string) => {
      const target = edges.find((e) => e.id === id)
      if (!target) return
      setEdges((es) => es.filter((e) => e.id !== id))
      setSelectedEdgeId((sel) => (sel === id ? null : sel))
      window.clearTimeout(undoTimer.current)
      setUndone({ kind: 'edge', edge: { ...target } })
      undoTimer.current = window.setTimeout(() => setUndone(null), 6000)
    },
    [edges, setEdges],
  )

  const onRestoreTrash = useCallback(
    (entryId: string) => {
      const entry = trash.find((t) => t.id === entryId)
      if (!entry) return
      onTrackScreen(project.id, entry.screenId)
      setRemoved((r) => r.filter((s) => s !== entry.screenId))
      setTrash((t) => t.filter((x) => x.id !== entryId))
      setNodes((ns) => (ns.some((n) => n.id === entry.node.id) ? ns : [...ns, entry.node]))
      setEdges((es) => {
        const ids = new Set(es.map((e) => e.id))
        return [...es, ...entry.edges.filter((e) => !ids.has(e.id))]
      })
      setSelectedNodeId(entry.node.id)
    },
    [trash, project.id, onTrackScreen, setNodes, setEdges],
  )

  // gỡ entry khỏi thùng nhưng giữ `removed` — màn vẫn ở ngoài board
  const onDropTrashEntry = useCallback((entryId: string) => {
    setTrash((t) => t.filter((x) => x.id !== entryId))
  }, [])

  // dọn sạch thùng — file HTML thật do script delete-screen xóa (dialog hiện lệnh)
  const onEmptyTrash = useCallback(() => {
    setTrash([])
  }, [])

  const onUndoDelete = useCallback(() => {
    const last = undone
    if (!last) return
    window.clearTimeout(undoTimer.current)
    setUndone(null)
    if (last.kind === 'edge') {
      setEdges((es) => (es.some((e) => e.id === last.edge.id) ? es : [...es, last.edge]))
      setSelectedEdgeId(last.edge.id)
      return
    }
    onTrackScreen(project.id, last.screenId)
    setRemoved((r) => r.filter((s) => s !== last.screenId))
    setNodes((ns) => (ns.some((n) => n.id === last.node.id) ? ns : [...ns, last.node]))
    setEdges((es) => {
      const ids = new Set(es.map((e) => e.id))
      return [...es, ...last.edges.filter((e) => !ids.has(e.id))]
    })
    setSelectedNodeId(last.node.id)
  }, [undone, project.id, onTrackScreen, setNodes, setEdges])

  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      // click dây nối đã xả chọn node (Board.onEdgeClick) nên ưu tiên edge
      if (selectedEdgeId) {
        e.preventDefault()
        onDeleteEdge(selectedEdgeId)
        return
      }
      if (selectedNodeId) {
        e.preventDefault()
        onRequestDelete(selectedNodeId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNodeId, selectedEdgeId, onRequestDelete, onDeleteEdge])

  // focus đi đôi với select để inspector bám theo màn đang duyệt (3.3)
  const onFocusNode = useCallback((id: string) => {
    setFocusedNodeId(id)
    setSelectedNodeId(id)
  }, [])

  const onExitFocus = useCallback(() => {
    setFocusedNodeId(null)
  }, [])

  // board toggle đổi cả iframe (per-project) lẫn app chrome toàn cục (5.1)
  const onBoardThemeChange = useCallback(
    (mode: ThemeMode) => {
      setTokenTheme(mode)
      setUiTheme(mode)
    },
    [setTokenTheme, setUiTheme],
  )

  const settings = useMemo(
    () => ({
      mode,
      frameStyle,
      activeNodeId: selectedNodeId,
      panelVisible,
      deleteConfirmId: confirmDeleteId,
      onRequestDelete,
      onConfirmDelete,
      onCancelDelete,
      tokenTheme,
      onTokenThemeChange: onBoardThemeChange,
      focusedNodeId,
      onFocusNode,
    }),
    [mode, frameStyle, selectedNodeId, panelVisible, confirmDeleteId, onRequestDelete, onConfirmDelete, onCancelDelete, tokenTheme, onBoardThemeChange, focusedNodeId, onFocusNode],
  )

  // flow-core 1.1: chặn tự vòng và trùng cặp trước khi addEdge
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => (canConnect(eds, connection) ? addEdge(connection, eds) : eds)),
    [setEdges],
  )

  // flow-core 2.3: double-click dây nối để đặt/sửa nhãn component nguồn
  const onEdgeLabel = useCallback(
    (id: string) => {
      const target = edges.find((e) => e.id === id)
      if (!target) return
      const next = window.prompt('Nút nào dẫn sang màn này? (để trống để xóa nhãn)', edgeLabel(target) ?? '')
      if (next === null) return
      setEdges((es) => es.map((e) => (e.id === id ? withLabel(e, next) : e)))
    },
    [edges, setEdges],
  )

  const onPatchNode = useCallback(
    (id: string, patch: Partial<PhoneNodeData>) => {
      setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)))
    },
    [setNodes],
  )

  useEffect(() => {
    setDockCollapsed(loadDockCollapsed(project.id))
  }, [project.id])

  const onToggleDock = useCallback(() => {
    setDockCollapsed((v) => {
      saveDockCollapsed(project.id, !v)
      return !v
    })
  }, [project.id])

  // flow-core 1.2: edge đời cũ có data.flow mà thiếu label vẫn hiện nhãn
  const viewEdges = useMemo(
    () =>
      edges.map((e) => {
        const name = edgeLabel(e)
        return name && e.label !== name ? { ...e, label: name } : e
      }),
    [edges],
  )

  const screenTitleOf = useCallback(
    (nodeId: string) => {
      const n = nodes.find((x) => x.id === nodeId)
      return n ? (SCREEN_BY_ID.get(n.data.screenId)?.title ?? n.data.screenId) : nodeId
    },
    [nodes],
  )

  const undoTitle =
    !undone
      ? null
      : undone.kind === 'edge'
        ? `liên kết ${screenTitleOf(undone.edge.source)} → ${screenTitleOf(undone.edge.target)}`
        : (SCREEN_BY_ID.get(undone.screenId)?.title ?? undone.screenId)
  const undoSuffix = undone?.kind === 'edge' ? ' — các màn giữ nguyên.' : ' — file HTML giữ nguyên.'

  return (
    <BoardContext.Provider value={settings}>
      {/* remount flow per project so fitView/minimap never bleed across boards */}
      <ReactFlowProvider key={project.id}>
        <ErrorBoundary
      fallback={(retry) => (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6" role="alert">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Board gặp lỗi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Giao diện bảng vẽ vừa vấp. Bố cục đã lưu của bạn vẫn còn trong bộ nhớ trình duyệt.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="button" onClick={retry}>
                Thử mở lại board
              </Button>
              <Button type="button" variant="ghost" onClick={onBack}>
                Về Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    >
      <Board
        settings={settings}
        nodes={nodes}
        edges={viewEdges}
        projectTitle={project.title}
        screenCount={nodes.length}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeLabel={onEdgeLabel}
        onSelectNode={setSelectedNodeId}
        onModeChange={setMode}
        onFrameStyleChange={setFrameStyle}
        onBack={onBack}
        onTogglePanel={onTogglePanel}
        focusedNodeId={focusedNodeId}
        onFocusNode={onFocusNode}
        onExitFocus={onExitFocus}
        undoTitle={undoTitle}
        undoSuffix={undoSuffix}
        onUndo={onUndoDelete}
        trashCount={trash.length}
        onOpenTrash={() => setTrashOpen(true)}
        onExportState={handleExportState}
        onImportState={() => importInputRef.current?.click()}
        projectId={project.id}
        dock={
          <TokenDock
            projectId={project.id}
            title={project.title}
            collapsed={dockCollapsed}
            onToggle={onToggleDock}
            tab={dockTab}
            onTabChange={setDockTab}
          />
        }
        panel={
          panelVisible ? (
            <SpecPanel
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onPatchNode={onPatchNode}
              deleteConfirmId={confirmDeleteId}
              onRequestDelete={onRequestDelete}
              onConfirmDelete={onConfirmDelete}
              onCancelDelete={onCancelDelete}
              onFocusScreen={onFocusNode}
              onClosePanel={onTogglePanel}
            />
          ) : null
        }
        />
        </ErrorBoundary>
        {trashOpen && (
          <TrashDialog
            trash={trash}
            onRestore={(id) => {
              onRestoreTrash(id)
              setTrashOpen(false)
            }}
            onDrop={onDropTrashEntry}
            onEmpty={onEmptyTrash}
            onClose={() => setTrashOpen(false)}
          />
        )}
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleImportState(f)
            e.target.value = ''
          }}
        />
      </ReactFlowProvider>
    </BoardContext.Provider>
  )
}

export const BoardView = BoardViewInner
