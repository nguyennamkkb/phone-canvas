import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReactFlowProvider, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import type { Connection, Edge } from '@xyflow/react'
import { Board } from '../canvas/Board'
import { BoardContext } from '../canvas/BoardContext'
import type { CanvasMode, FrameStyle } from '../canvas/BoardContext'
import type { PhoneNodeData } from '../canvas/PhoneNode'
import type { PhoneFlowNode } from '../canvas/PhoneNode'
import type { BoardNode } from '../canvas/TokenNode'
import { useTokenTheme } from '../tokens/store'
import { DEFAULT_DEVICE_ID, getDevice } from '../frame/devices'
import { useInspector } from '../inspect/InspectorContext'
import { SpecPanel } from '../inspect/SpecPanel'
import { SCREEN_BY_ID, SCREENS } from '../screens'
import type { Project } from '../projects/projects'
import { resolveScreens } from '../projects/projects'
import { loadBoard, saveBoard } from '../projects/storage'
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

const TOKEN_NODE_W = 340

function tokenNode(project: Project): BoardNode {
  return {
    id: `${project.id}-tokens`,
    type: 'token',
    position: { x: -(TOKEN_NODE_W + COLUMN_GAP), y: 0 },
    data: { projectId: project.id, title: project.title },
  }
}

/** a saved board from before tokens existed gains the table, kept left of all screens */
function withTokenNode(project: Project, nodes: BoardNode[]): BoardNode[] {
  const phones = nodes.filter((n) => n.type === 'phone')
  const table = tokenNode(project)
  if (phones.length > 0) {
    const minX = Math.min(...phones.map((n) => n.position.x))
    table.position = { x: minX - TOKEN_NODE_W - COLUMN_GAP, y: 0 }
  }
  return [table, ...phones]
}

function freshNodes(project: Project): BoardNode[] {
  counters[project.id] = 0
  let x = 0
  const out: BoardNode[] = [tokenNode(project)]
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
    const phones = saved.nodes.filter(
      (n) => n.type === 'phone' && SCREEN_BY_ID.has(n.data.screenId),
    )
    return { nodes: withTokenNode(project, phones), edges: saved.edges }
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { select } = useInspector()

  const opening = useMemo(() => openingNodes(project), [project])
  const [nodes, setNodes, onNodesChange] = useNodesState<BoardNode>(opening.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(opening.edges)

  useEffect(() => {
    saveBoard(project.id, { nodes, edges })
  }, [project.id, nodes, edges])

  const onDeleteNode = useCallback(
    (id: string) => {
      const target = nodes.find((n) => n.id === id)
      if (!target || target.type !== 'phone') return
      const title = SCREEN_BY_ID.get(target.data.screenId)?.title ?? target.data.screenId
      if (!window.confirm(`Xóa màn hình "${title}" khỏi board? File html giữ nguyên.`)) return
      const screenId = target.data.screenId
      setNodes((ns) => ns.filter((n) => n.id !== id))
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id))
      setSelectedNodeId((sel) => (sel === id ? null : sel))
      select(null)
      const last = !nodes.some(
        (n) => n.id !== id && n.type === 'phone' && n.data.screenId === screenId,
      )
      if (last) onUntrackScreen(project.id, screenId)
    },
    [nodes, project.id, onUntrackScreen, setNodes, setEdges, select],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault()
        onDeleteNode(selectedNodeId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNodeId, onDeleteNode])

  const settings = useMemo(
    () => ({
      mode,
      frameStyle,
      activeNodeId: selectedNodeId,
      panelVisible,
      onDeleteNode,
      tokenTheme,
      onTokenThemeChange: setTokenTheme,
    }),
    [mode, frameStyle, selectedNodeId, panelVisible, onDeleteNode, tokenTheme, setTokenTheme],
  )

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )

  const onPatchNode = useCallback(
    (id: string, patch: Partial<PhoneNodeData>) => {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === id && n.type === 'phone' ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      )
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
          const onBoard = (s: string) =>
            ns.some((n) => n.type === 'phone' && n.data.screenId === s)
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
        screenCount={nodes.filter((n) => n.type === 'phone').length}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectNode={setSelectedNodeId}
        onModeChange={setMode}
        onFrameStyleChange={setFrameStyle}
        onAddScreen={onAddScreen}
        onBack={onBack}
        onTogglePanel={onTogglePanel}
        panel={
          panelVisible ? (
            <SpecPanel
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onPatchNode={onPatchNode}
              onDeleteNode={onDeleteNode}
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
