import { useCallback, useEffect, useRef } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useNodesInitialized,
  useReactFlow,
} from '@xyflow/react'
import type { Edge, NodeTypes, OnConnect, OnEdgesChange, OnNodesChange } from '@xyflow/react'
import { PhoneNode } from './PhoneNode'
import type { PhoneFlowNode } from './PhoneNode'
import { useBoardSettings } from './BoardContext'
import type { CanvasMode, FrameStyle } from './BoardContext'
import { SCREENS } from '../screens'

const nodeTypes = { phone: PhoneNode } as unknown as NodeTypes

export type BoardProps = {
  nodes: PhoneFlowNode[]
  edges: Edge[]
  onNodesChange: OnNodesChange<PhoneFlowNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onSelectNode: (id: string | null) => void
  onModeChange: (mode: CanvasMode) => void
  onFrameStyleChange: (style: FrameStyle) => void
  onAddScreen: () => void
}

export function Board({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onModeChange,
  onFrameStyleChange,
  onAddScreen,
}: BoardProps) {
  const { mode, frameStyle } = useBoardSettings()
  const { fitView } = useReactFlow()
  const nodesInitialized = useNodesInitialized()
  const didFit = useRef(false)

  // react-flow measures nodes asynchronously; fitting before that is a no-op
  useEffect(() => {
    if (!nodesInitialized || didFit.current) return
    didFit.current = true
    void fitView({ padding: 0.12, duration: 0 })
  }, [nodesInitialized, fitView])

  const handleFit = useCallback(() => {
    void fitView({ padding: 0.12, duration: 320 })
  }, [fitView])

  return (
    <div className="board">
      <ReactFlow<PhoneFlowNode>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodesDraggable={mode === 'move'}
        nodesConnectable={mode === 'move'}
        elementsSelectable={false}
        selectionOnDrag={false}
        panOnDrag
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#d4d4d8" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => (n.type === 'phone' ? '#007aff' : '#a1a1aa')}
          maskColor="rgba(244,244,245,0.75)"
          style={{ width: 140, height: 96 }}
        />
      </ReactFlow>

      <div className="toolbar">
        <div className="segmented">
          <button
            type="button"
            className={mode === 'move' ? 'is-on' : ''}
            onClick={() => onModeChange('move')}
          >
            Di chuyển
          </button>
          <button
            type="button"
            className={mode === 'inspect' ? 'is-on' : ''}
            onClick={() => onModeChange('inspect')}
          >
            Đo đạc
          </button>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={frameStyle === 'plain' ? 'is-on' : ''}
            onClick={() => onFrameStyleChange('plain')}
          >
            Khung đơn giản
          </button>
          <button
            type="button"
            className={frameStyle === 'device' ? 'is-on' : ''}
            onClick={() => onFrameStyleChange('device')}
          >
            Khung máy
          </button>
        </div>

        <button
          type="button"
          className="tool"
          onClick={onAddScreen}
          disabled={SCREENS.length === 0}
        >
          + Màn hình
        </button>
        <button type="button" className="tool" onClick={handleFit}>
          Vừa khung
        </button>
      </div>

      {nodes.length === 0 && (
        <div className="board-empty">
          <div className="board-empty-title">Bảng đang trống</div>
          <p>
            Viết <code>src/screens/&lt;tên&gt;.html</code>, khai báo một dòng trong{' '}
            <code>src/screens/manifest.ts</code>, rồi thêm import <code>?raw</code> và một dòng
            trong <code>RAW</code> ở <code>src/screens/index.ts</code>.
          </p>
          <p className="board-empty-note">
            Chưa chắc cách dựng? Hỏi agent — skill <code>phone-canvas</code> có sẵn quy trình và
            các mẫu màn hình.
          </p>
        </div>
      )}
    </div>
  )
}
