import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ReactFlowProvider, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import type { Connection, Edge } from '@xyflow/react'
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

function openingNodes(project: Project): { nodes: BoardNode[]; edges: Edge[] } {
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
    if (phones.length > 0) return { nodes: phones, edges: saved.edges }
  }
  return { nodes: freshNodes(project), edges: [] as Edge[] }
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
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(() => loadDockCollapsed())
  // focus-mode (3.3): màn đang duyệt ở 100%, null khi ở tổng quan
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)
  // xóa inline 2 bước (5.2): hỏi tại chỗ → xóa → hoàn tác nhanh trong 6s
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [undone, setUndone] = useState<{ node: PhoneFlowNode; screenId: string } | null>(null)
  const undoTimer = useRef<number | undefined>(undefined)
  const { select } = useInspector()

  const opening = useMemo(() => openingNodes(project), [project])
  const [nodes, setNodes, onNodesChange] = useNodesState<BoardNode>(opening.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(opening.edges)

  useEffect(() => {
    saveBoard(project.id, { nodes, edges })
  }, [project.id, nodes, edges])

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
      setNodes((ns) => ns.filter((n) => n.id !== id))
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id))
      setSelectedNodeId((sel) => (sel === id ? null : sel))
      setFocusedNodeId((f) => (f === id ? null : f))
      setConfirmDeleteId(null)
      select(null)
      const last = !nodes.some((n) => n.id !== id && n.data.screenId === screenId)
      if (last) onUntrackScreen(project.id, screenId)
      // hoàn-tác-nhanh: giữ snapshot 6s, hết hạn thì thôi
      window.clearTimeout(undoTimer.current)
      setUndone({ node: snapshot, screenId })
      undoTimer.current = window.setTimeout(() => setUndone(null), 6000)
    },
    [nodes, project.id, onUntrackScreen, setNodes, setEdges, select],
  )

  const onUndoDelete = useCallback(() => {
    const last = undone
    if (!last) return
    window.clearTimeout(undoTimer.current)
    setUndone(null)
    onTrackScreen(project.id, last.screenId)
    setNodes((ns) => (ns.some((n) => n.id === last.node.id) ? ns : [...ns, last.node]))
    setSelectedNodeId(last.node.id)
  }, [undone, project.id, onTrackScreen, setNodes])

  useEffect(() => () => window.clearTimeout(undoTimer.current), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault()
        onRequestDelete(selectedNodeId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNodeId, onRequestDelete])

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

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
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
          sid = pool.find((s) => !onBoard(s)) ?? pool[ns.length % pool.length]
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

  const onToggleDock = useCallback(() => {
    setDockCollapsed((v) => {
      saveDockCollapsed(!v)
      return !v
    })
  }, [])

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
        edges={edges}
        projectTitle={project.title}
        screenCount={nodes.length}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectNode={setSelectedNodeId}
        onModeChange={setMode}
        onFrameStyleChange={setFrameStyle}
        onAddScreen={onAddScreen}
        onBack={onBack}
        onTogglePanel={onTogglePanel}
        focusedNodeId={focusedNodeId}
        onFocusNode={onFocusNode}
        onExitFocus={onExitFocus}
        undoTitle={undone ? (SCREEN_BY_ID.get(undone.screenId)?.title ?? undone.screenId) : null}
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
