import { useCallback, useMemo, useState } from 'react'
import { ReactFlowProvider, addEdge, useEdgesState, useNodesState } from '@xyflow/react'
import type { Connection, Edge } from '@xyflow/react'
import { Board } from './canvas/Board'
import { BoardContext } from './canvas/BoardContext'
import type { CanvasMode, FrameStyle } from './canvas/BoardContext'
import type { PhoneFlowNode, PhoneNodeData } from './canvas/PhoneNode'
import { nextNodeId } from './canvas/nodeId'
import { DEFAULT_DEVICE_ID, getDevice } from './frame/devices'
import { InspectorProvider } from './inspect/InspectorContext'
import { SpecPanel } from './inspect/SpecPanel'
import { SCREENS } from './screens'
import type { ScreenDef } from './screens'

const COLUMN_GAP = 120

function nodeWidth(deviceId: string): number {
  const d = getDevice(deviceId)
  return d.width + d.bezel * 2
}

function makeNode(id: string, screen: ScreenDef, x: number): PhoneFlowNode {
  return {
    id,
    type: 'phone',
    position: { x, y: 0 },
    data: { screenId: screen.id, deviceId: DEFAULT_DEVICE_ID },
  }
}

function initialNodes(): PhoneFlowNode[] {
  let x = 0
  return SCREENS.map((screen) => {
    const node = makeNode(nextNodeId(), screen, x)
    x += nodeWidth(DEFAULT_DEVICE_ID) + COLUMN_GAP
    return node
  })
}

export function App() {
  const [mode, setMode] = useState<CanvasMode>('move')
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('plain')
  // useMemo, not a bare call: the id counter must advance once for the board,
  // not once per render
  const openingBoard = useMemo(() => initialNodes(), [])
  const [nodes, setNodes, onNodesChange] = useNodesState<PhoneFlowNode>(openingBoard)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // a fresh object here would re-render every node on every app render
  const boardSettings = useMemo(
    () => ({ mode, frameStyle, activeNodeId: selectedNodeId }),
    [mode, frameStyle, selectedNodeId],
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

  const onAddScreen = useCallback(() => {
    // the id is minted outside the updater: a state updater must stay pure, and
    // react may run it twice
    const id = nextNodeId()
    setNodes((ns) => {
      const screen = SCREENS[ns.length % SCREENS.length]!
      const right = ns.reduce((max, n) => Math.max(max, n.position.x), 0)
      return [...ns, makeNode(id, screen, right + nodeWidth(DEFAULT_DEVICE_ID) + COLUMN_GAP)]
    })
  }, [setNodes])

  return (
    <BoardContext.Provider value={boardSettings}>
      <InspectorProvider>
        <ReactFlowProvider>
          <div className="app">
            <div className="canvas-area">
              <Board
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectNode={setSelectedNodeId}
                onModeChange={setMode}
                onFrameStyleChange={setFrameStyle}
                onAddScreen={onAddScreen}
              />
            </div>
            <SpecPanel
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onPatchNode={onPatchNode}
            />
          </div>
        </ReactFlowProvider>
      </InspectorProvider>
    </BoardContext.Provider>
  )
}
