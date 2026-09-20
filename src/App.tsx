import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReactFlowProvider, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import type { Connection, Edge } from '@xyflow/react'
import { Board } from './canvas/Board'
import { BoardContext } from './canvas/BoardContext'
import type { CanvasMode, FrameStyle } from './canvas/BoardContext'
import type { PhoneFlowNode, PhoneNodeData } from './canvas/PhoneNode'
import { DEFAULT_DEVICE_ID, getDevice } from './frame/devices'
import { InspectorProvider, useInspector } from './inspect/InspectorContext'
import { SpecPanel } from './inspect/SpecPanel'
import { SCREEN_BY_ID, SCREENS } from './screens'
import { Dashboard } from './projects/Dashboard'
import type { Project } from './projects/projects'
import { resolveScreens } from './projects/projects'
import {
  allProjects,
  clearBoard,
  loadBoard,
  loadCustomProjects,
  loadLastProject,
  loadPanelVisible,
  saveBoard,
  saveCustomProjects,
  saveLastProject,
  savePanelVisible,
} from './projects/storage'

const COLUMN_GAP = 120

function nodeWidth(deviceId: string): number {
  const d = getDevice(deviceId)
  return d.width + d.bezel * 2
}

// Node ids are prefixed per project so two boards never share an identity —
// react-flow + the iframe token router both key on node id.
let counters: Record<string, number> = {}

function nextNodeId(projectId: string): string {
  counters[projectId] = (counters[projectId] ?? 0) + 1
  return `${projectId}-n${counters[projectId]}`
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

function freshNodes(project: Project): PhoneFlowNode[] {
  counters[project.id] = 0
  let x = 0
  const out: PhoneFlowNode[] = []
  for (const sid of resolveScreens(project)) {
    const node = makeNode(project.id, sid, x)
    if (node) {
      out.push(node)
      x += nodeWidth(DEFAULT_DEVICE_ID) + COLUMN_GAP
    }
  }
  return out
}

function slug(title: string): string {
  const s = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  return s || `project-${Date.now().toString(36)}`
}

/* ------------------------------------------------------------ board view -- */

function BoardView({
  project,
  panelVisible,
  onTogglePanel,
  onBack,
  onTrackScreen,
  onUntrackScreen,
}: {
  project: Project
  panelVisible: boolean
  onTogglePanel: () => void
  onBack: () => void
  /** record an added screen into a custom project's screenIds (count/cover stay true) */
  onTrackScreen: (projectId: string, screenId: string) => void
  /** forget a removed screen once its last instance is gone */
  onUntrackScreen: (projectId: string, screenId: string) => void
}) {
  const [mode, setMode] = useState<CanvasMode>('move')
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('plain')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const opening = useMemo(() => {
    const saved = loadBoard(project.id)
    if (saved && saved.nodes.length > 0) {
      // resume the counter so new ids never collide with restored ones
      let max = 0
      for (const n of saved.nodes) {
        const m = /-n(\d+)$/.exec(n.id)
        if (m) max = Math.max(max, Number(m[1]))
      }
      counters[project.id] = max
      // drop nodes whose screen no longer exists (renamed file, etc.)
      const nodes = saved.nodes.filter((n) => SCREEN_BY_ID.has(n.data.screenId))
      return { nodes, edges: saved.edges }
    }
    const nodes = freshNodes(project)
    return { nodes, edges: [] as Edge[] }
  }, [project])

  const [nodes, setNodes, onNodesChange] = useNodesState<PhoneFlowNode>(opening.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(opening.edges)

  // persist layout (debounced by React batching — save on every change is fine
  // for boards of tens of nodes)
  useEffect(() => {
    saveBoard(project.id, { nodes, edges })
  }, [project.id, nodes, edges])

  const onDeleteNode = useCallback(
    (id: string) => {
      const target = nodes.find((n) => n.id === id)
      setNodes((ns) => ns.filter((n) => n.id !== id))
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id))
      setSelectedNodeId((sel) => (sel === id ? null : sel))
      // custom project: forget the screen once its last instance is gone,
      // so the card count/cover stay true
      if (target) {
        const last = !nodes.some((n) => n.id !== id && n.data.screenId === target.data.screenId)
        if (last) onUntrackScreen(project.id, target.data.screenId)
      }
    },
    [nodes, project.id, onUntrackScreen, setNodes, setEdges],
  )

  // Delete/Backspace removes the selected screen — never while typing
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

  const boardSettings = useMemo(
    () => ({ mode, frameStyle, activeNodeId: selectedNodeId, panelVisible, onDeleteNode }),
    [mode, frameStyle, selectedNodeId, panelVisible, onDeleteNode],
  )

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )

  const onPatchNode = useCallback(
    (id: string, patch: Partial<PhoneNodeData>) => {
      setNodes((ns) =>
        ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      )
    },
    [setNodes],
  )

  const projectScreenIds = useMemo(() => resolveScreens(project), [project])

  const onAddScreen = useCallback(
    (screenId?: string) => {
      const id = nextNodeId(project.id)
      // an empty (custom) project has no list to cycle — fall back to all screens
      const pool = projectScreenIds.length > 0 ? projectScreenIds : SCREENS.map((s) => s.id)
      setNodes((ns) => {
        let sid = screenId
        if (!sid) {
          // prefer the first project screen not already on the board,
          // otherwise cycle through the project list
          sid = pool.find((s) => !ns.some((n) => n.data.screenId === s)) ?? pool[ns.length % pool.length]
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
    <BoardContext.Provider value={boardSettings}>
      {/* remount flow per project so fitView/minimap never bleed across boards */}
      <ReactFlowProvider key={project.id}>
        <div className={`app${panelVisible ? '' : ' is-panel-hidden'}`}>
          <div className="canvas-area">
            <Board
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
            />
          </div>
          {panelVisible && (
            <SpecPanel
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onPatchNode={onPatchNode}
              onDeleteNode={onDeleteNode}
            />
          )}
        </div>
      </ReactFlowProvider>
    </BoardContext.Provider>
  )
}

/* ------------------------------------------------------------------ app -- */

export function App() {
  const [custom, setCustom] = useState<Project[]>(() => loadCustomProjects())
  const [activeId, setActiveId] = useState<string | null>(() => loadLastProject())
  const [panelVisible, setPanelVisible] = useState<boolean>(() => loadPanelVisible())

  const projects = useMemo(() => allProjects(custom), [custom])
  const active = projects.find((p) => p.id === activeId) ?? null

  const togglePanel = useCallback(() => {
    setPanelVisible((v) => {
      savePanelVisible(!v)
      return !v
    })
  }, [])

  // Cmd/Ctrl+. toggles the right sidebar from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        togglePanel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePanel])

  const openProject = useCallback((id: string) => {
    setActiveId(id)
    saveLastProject(id)
  }, [])

  const closeProject = useCallback(() => {
    setActiveId(null)
    saveLastProject(null)
  }, [])

  const createProject = useCallback(
    (title: string) => {
      const id = slug(title)
      const finalId = projects.some((p) => p.id === id) ? `${id}-${Date.now().toString(36)}` : id
      const project: Project = { id: finalId, title: title.trim(), screenIds: [], custom: true }
      const next = [...custom, project]
      setCustom(next)
      saveCustomProjects(next)
      openProject(finalId)
    },
    [custom, projects, openProject],
  )

  // remember screens added to a custom project so its card count/cover stay true
  const trackScreen = useCallback(
    (projectId: string, screenId: string) => {
      setCustom((prev) => {
        if (!prev.some((p) => p.id === projectId)) return prev
        const next = prev.map((p) =>
          p.id === projectId && !p.screenIds.includes(screenId)
            ? { ...p, screenIds: [...p.screenIds, screenId] }
            : p,
        )
        saveCustomProjects(next)
        return next
      })
    },
    [],
  )

  // forget screens removed from a custom project so its card count/cover stay true
  const untrackScreen = useCallback(
    (projectId: string, screenId: string) => {
      setCustom((prev) => {
        if (!prev.some((p) => p.id === projectId)) return prev
        const next = prev.map((p) =>
          p.id === projectId
            ? { ...p, screenIds: p.screenIds.filter((s) => s !== screenId) }
            : p,
        )
        saveCustomProjects(next)
        return next
      })
    },
    [],
  )

  const deleteProject = useCallback(
    (id: string) => {
      const next = custom.filter((p) => p.id !== id)
      setCustom(next)
      saveCustomProjects(next)
      clearBoard(id)
      if (activeId === id) closeProject()
    },
    [custom, activeId, closeProject],
  )

  return (
    <InspectorProvider>
      {active ? (
        <BoardView
          key={active.id}
          project={active}
          panelVisible={panelVisible}
          onTogglePanel={togglePanel}
          onBack={closeProject}
          onTrackScreen={trackScreen}
          onUntrackScreen={untrackScreen}
        />
      ) : (
        <div className="app app-dashboard">
          <Dashboard
            projects={projects}
            onOpen={openProject}
            onCreate={createProject}
            onDelete={deleteProject}
          />
        </div>
      )}
    </InspectorProvider>
  )
}

// re-export for InspectorProvider internals that clear per-board state
export function useInspectorSelectionReset() {
  const { select } = useInspector()
  useEffect(() => {
    select(null)
  }, [select])
}
