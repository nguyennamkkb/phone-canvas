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
import { DEFAULT_DEVICE_ID, getDevice } from '../frame/devices'
import { useInspector } from '../inspect/InspectorContext'
import { SpecPanel } from '../inspect/SpecPanel'
import { SCREEN_BY_ID, SCREENS } from '../screens'
import type { Project } from '../projects/projects'
import { resolveScreens } from '../projects/projects'
import {
  loadBoard,
  loadDockCollapsed,
  newTrashEntry,
  parseStateFile,
  saveBoard,
  saveDockCollapsed,
  saveImportedStateFile,
  toStateFile,
} from '../projects/storage'
import type { TrashEntry } from '../projects/storage'
import { missingScreenIds } from './reconcile'
import { TrashDialog } from './TrashDialog'
import { ErrorBoundary } from '../shell/ErrorBoundary'

const COLUMN_GAP = 120

/** board-local node identity — react-flow + the iframe token router key on it */
const counters: Record<string, number> = {}

export function nextNodeId(projectId: string): string {
  counters[projectId] = (counters[projectId] ?? 0) + 1
  return `${projectId}-n${counters[projectId]}`
}

function nodeWidth(deviceId: string): number {
  return getDevice(deviceId).width + getDevice(deviceId).bezel * 2
}

function makeNode(projectId: string, screenId: string, x: number): PhoneFlowNode | null {
  const screen = SCREEN_BY_ID.get(screenId)
  if (!screen) return null
  return {
    id: nextNodeId(projectId),
    type: 'phone',
    position: { x, y: 0 },
    data: { screenId: screen.id, deviceId: DEFAULT_DEVICE_ID },
  }
}

/** legacy token-table node shape — board cũ có thể còn, lọc bỏ im lặng (2.2) */
type LegacyBoardNode = PhoneFlowNode | { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }

function isPhoneNode(n: LegacyBoardNode): n is PhoneFlowNode {
  return (
    n.type === 'phone' &&
    typeof (n.data as PhoneNodeData).screenId === 'string' &&
    SCREEN_BY_ID.has((n.data as PhoneNodeData).screenId)
  )
}

function freshNodes(project: Project): BoardNode[] {
  counters[project.id] = 0
  let x = 0
  const out: BoardNode[] = []
  for (const sid of resolveScreens(project)) {
    const node = makeNode(project.id, sid, x)
    if (node) {
      out.push(node)
      x += nodeWidth(DEFAULT_DEVICE_ID) + COLUMN_GAP
    }
  }
  return out
}

function openingNodes(project: Project): {
  nodes: BoardNode[]
  edges: Edge[]
  removed: string[]
  trash: TrashEntry[]
} {
  const saved = loadBoard(project.id)
  if (saved && saved.nodes.length > 0) {
    let max = 0
    for (const n of saved.nodes) {
      const m = /-n(\d+)$/.exec(n.id)
      if (m) max = Math.max(max, Number(m[1]))
    }
    counters[project.id] = max
    // board cũ có token node: lọc im lặng, giữ nguyên vị trí phone (2.2)
    const phones = (saved.nodes as LegacyBoardNode[]).filter(isPhoneNode)
    if (phones.length > 0) {
      // trash còn giữ màn nào thì reconcile không thêm lại nó
      const trashed = new Set(saved.trash.map((t) => t.screenId))
      const kept = saved.removed.filter((id) => !trashed.has(id))
      return {
        nodes: phones,
        edges: pruneEdges(phones, saved.edges),
        removed: saved.removed,
        trash: saved.trash.filter((t) => !kept.includes(t.screenId) || true),
      }
    }
  }
  return { nodes: freshNodes(project), edges: [] as Edge[], removed: [], trash: [] }
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
): BoardNode[] {
  const missing = missingScreenIds(
    resolveScreens(project),
    nodes.map((n) => n.data.screenId),
    removed,
  )
  if (missing.length === 0) return nodes
  const out = [...nodes]
  let right = out.reduce((max, n) => Math.max(max, n.position.x), 0)
  for (const screenId of missing) {
    const node = makeNode(project.id, screenId, right === 0 ? 0 : right + nodeWidth(DEFAULT_DEVICE_ID) + COLUMN_GAP)
    if (!node) continue
    right = node.position.x
    out.push(node)
  }
  return out
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
    const saved = openingNodes(project)
    const trashedIds = saved.trash.map((t) => t.screenId)
    return {
      nodes: reconciledNodes(project, saved.nodes, [...saved.removed, ...trashedIds]),
      edges: saved.edges,
      removed: saved.removed,
      trash: saved.trash,
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

  useEffect(() => {
    saveBoard(project.id, { nodes, edges, removed, trash })
  }, [project.id, nodes, edges, removed, trash])

  // xuất/nhập trạng thái — browser không ghi được vào repo nên đi qua file
  const handleExportState = useCallback(() => {
    const stateFile = toStateFile(project.id, { v: 4, nodes, edges, removed, trash })
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(stateFile, null, 2)], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.id}-board.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [project.id, nodes, edges, removed, trash])

  const handleImportState = useCallback(
    async (file: File) => {
      try {
        const stateFile = parseStateFile(await file.text(), project.id)
        saveImportedStateFile(stateFile)
        // write-through: cache bằng đúng nội dung file, rồi reload để board đọc lại
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

  const projectScreenIds = useMemo(() => resolveScreens(project), [project])

  const onAddScreen = useCallback(
    (screenId?: string) => {
      const id = nextNodeId(project.id)
      const pool = projectScreenIds.length > 0 ? projectScreenIds : SCREENS.map((s) => s.id)
      setNodes((ns) => {
        let sid = screenId
        if (!sid) {
          const onBoard = (s: string) => ns.some((n) => n.data.screenId === s)
          // flow-core 3.1: hết màn thì thôi — không nhân bản lén
          sid = pool.find((s) => !onBoard(s))
          if (!sid) return ns
        }
        if (!SCREEN_BY_ID.has(sid)) return ns
        onTrackScreen(project.id, sid)
        const right = ns.reduce((max, n) => Math.max(max, n.position.x), 0)
        const node: PhoneFlowNode = {
          id,
          type: 'phone',
          position: { x: ns.length === 0 ? 0 : right + nodeWidth(DEFAULT_DEVICE_ID) + COLUMN_GAP, y: 0 },
          data: { screenId: sid, deviceId: DEFAULT_DEVICE_ID },
        }
        return [...ns, node]
      })
    },
    [project.id, projectScreenIds, onTrackScreen, setNodes],
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
        <div className="board-error" role="alert">
          <div className="board-empty-title">Board gặp lỗi</div>
          <p>
            Giao diện bảng vẽ vừa vấp. Bố cục đã lưu của bạn vẫn còn trong bộ nhớ trình duyệt.
          </p>
          <button type="button" className="dash-btn" onClick={retry}>
            Thử mở lại board
          </button>{' '}
          <button type="button" className="ghost" onClick={onBack}>
            Về Dashboard
          </button>
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
        onAddScreen={onAddScreen}
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
        projectScreenIds={projectScreenIds}
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
