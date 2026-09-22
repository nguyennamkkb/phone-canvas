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
import { useTokenTheme, useUiTheme } from '../tokens/store'
import type { ThemeMode } from '../tokens/tokens'
import { DEFAULT_DEVICE_ID, getDevice } from '../frame/devices'
import { useInspector } from '../inspect/InspectorContext'
import { SpecPanel } from '../inspect/SpecPanel'
import { SCREEN_BY_ID, SCREENS } from '../screens'
import type { Project } from '../projects/projects'
import { resolveScreens } from '../projects/projects'
import { loadBoard, loadDockCollapsed, saveBoard, saveDockCollapsed } from '../projects/storage'
import { missingScreenIds } from './reconcile'
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

function openingNodes(project: Project): { nodes: BoardNode[]; edges: Edge[]; removed: string[] } {
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
    if (phones.length > 0) return { nodes: phones, edges: pruneEdges(phones, saved.edges), removed: saved.removed }
  }
  return { nodes: freshNodes(project), edges: [] as Edge[], removed: [] }
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
  // focus-mode (3.3): màn đang duyệt ở 100%, null khi ở tổng quan
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)
  // xóa inline 2 bước (5.2): hỏi tại chỗ → xóa → hoàn tác nhanh trong 6s
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
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
    return {
      nodes: reconciledNodes(project, saved.nodes, saved.removed),
      edges: saved.edges,
      removed: saved.removed,
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

  useEffect(() => {
    saveBoard(project.id, { nodes, edges, removed })
  }, [project.id, nodes, edges, removed])

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
        projectId={project.id}
        projectScreenIds={projectScreenIds}
        dock={
          <TokenDock
            projectId={project.id}
            title={project.title}
            collapsed={dockCollapsed}
            onToggle={onToggleDock}
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
      </ReactFlowProvider>
    </BoardContext.Provider>
  )
}

export const BoardView = BoardViewInner
