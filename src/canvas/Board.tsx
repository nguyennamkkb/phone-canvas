import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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
import type { BoardNode } from './TokenNode'
import type { BoardSettings } from './BoardContext'
import type { CanvasMode, FrameStyle } from './BoardContext'
import { useInspector } from '../inspect/InspectorContext'
import { SCREEN_BY_ID, SCREENS } from '../screens'
import { hrefFor } from '../shell/useHashRoute'

const nodeTypes = { phone: PhoneNode } as unknown as NodeTypes

export type BoardProps = {
  /** active-node + mode + theme state, owned by BoardView (3.1) */
  settings: BoardSettings
  nodes: BoardNode[]
  edges: Edge[]
  /** inspector panel element — rendered as canvas sibling in .app, overlay under the narrow breakpoint (2.4) */
  panel: ReactNode
  /** token dock trái (2.1) — ngoài canvas nên không lọt vào fit/minimap */
  dock?: ReactNode
  projectTitle: string
  screenCount: number
  onNodesChange: OnNodesChange<BoardNode>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onSelectNode: (id: string | null) => void
  onModeChange: (mode: CanvasMode) => void
  onFrameStyleChange: (style: FrameStyle) => void
  onAddScreen: (screenId?: string) => void
  onBack: () => void
  onTogglePanel: () => void
  /** screen id đang focus 100% (3.3) — null khi ở tổng quan */
  focusedNodeId: string | null
  onFocusNode: (id: string) => void
  onExitFocus: () => void
  /** màn vừa xóa còn hoàn tác được (5.2) — null khi hết hạn */
  undoTitle: string | null
  onUndo: () => void
  projectId: string
  /** màn của project hiện tại — dropdown mặc định chỉ liệt kê chừng này (5.3) */
  projectScreenIds: string[]
}

export function Board({
  settings,
  nodes,
  edges,
  panel,
  dock,
  projectTitle,
  screenCount,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onModeChange,
  onFrameStyleChange,
  onAddScreen,
  onBack,
  onTogglePanel,
  focusedNodeId,
  onFocusNode,
  onExitFocus,
  undoTitle,
  onUndo,
  projectId,
  projectScreenIds,
}: BoardProps) {
  const { mode, frameStyle, panelVisible, tokenTheme, onTokenThemeChange } = settings
  const { fitView, setCenter, getNode } = useReactFlow()
  const { sizes } = useInspector()
  const nodesInitialized = useNodesInitialized()
  const didFit = useRef(false)
  const mountTime = useRef(Date.now())
  const refitTimer = useRef<number | undefined>(undefined)
  const [pick, setPick] = useState('')
  // dropdown thêm-màn (5.3): mặc định màn của project, opt-in mới thấy tất cả
  const [showAllScreens, setShowAllScreens] = useState(false)
  const scopedIds = projectScreenIds.length > 0 ? projectScreenIds : SCREENS.map((s) => s.id)
  const [copiedLink, setCopiedLink] = useState(false)
  // toolbar compaction (board-layout): nhóm phụ gộp vào ⋯ khi board-wrap hẹp.
  // Đo wrapper chứ không đo window — bật/tắt panel đổi ngang canvas mà window không đổi.
  const wrapRef = useRef<HTMLDivElement>(null)
  const [toolbarCompact, setToolbarCompact] = useState(false)

  const copyBoardLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}${hrefFor({ view: 'board', projectId })}`
    void navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1600)
    })
  }, [projectId])
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      setToolbarCompact(w > 0 && w < 720)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // fit-view frames phone screens only (1.2) — token-dock (2.1) nằm ngoài
  // canvas nên mặc nhiên không lọt vào phép tính fit/minimap
  const phoneNodes = nodes
  const phoneNodesKey = phoneNodes.map((n) => n.id).join(',')

  // react-flow measures nodes asynchronously; fitting before that is a no-op
  useEffect(() => {
    if (!nodesInitialized || didFit.current) return
    didFit.current = true
    void fitView({ nodes: phoneNodes, padding: 0.12, duration: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized, fitView])

  // node heights are estimates until iframes report in — refit (debounced)
  // while sizes settle, but never after 8s so manual framing is untouched
  useEffect(() => {
    if (!didFit.current) return
    if (Date.now() - mountTime.current > 8000) return
    window.clearTimeout(refitTimer.current)
    refitTimer.current = window.setTimeout(() => {
      void fitView({ nodes: phoneNodes, padding: 0.12, duration: 200 })
    }, 300)
    return () => window.clearTimeout(refitTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, fitView])

  // canvas chrome speaks Vietnamese (1.3) — Controls ships English titles,
  // so relabel them in place; phone nodes are untouched
  useEffect(() => {
    const labels: Array<[string, string]> = [
      ['zoomin', 'Phóng to'],
      ['zoomout', 'Thu nhỏ'],
      ['fitview', 'Vừa khung'],
    ]
    for (const [kind, text] of labels) {
      const el = document.querySelector(`.react-flow__controls-${kind}`)
      if (el) {
        el.setAttribute('title', text)
        el.setAttribute('aria-label', text)
      }
    }
  }, [])

  const handleFit = useCallback(() => {
    if (focusedNodeId) onExitFocus()
    void fitView({ nodes: phoneNodes, padding: 0.12, duration: 320 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView, phoneNodesKey, focusedNodeId, onExitFocus])

  // focus-mode (3.3): center a screen at 100% — animated on entry,
  // instant while sizes settle so the screen stays centered as it grows
  const centerNode = useCallback(
    (id: string, animated: boolean) => {
      const n = getNode(id)
      if (!n) return false
      const w = (n.measured?.width ?? 400) as number
      const h = (n.measured?.height ?? 800) as number
      void setCenter(n.position.x + w / 2, n.position.y + h / 2, {
        zoom: 1,
        duration: animated ? 320 : 0,
      })
      return true
    },
    [getNode, setCenter],
  )

  useEffect(() => {
    if (focusedNodeId) centerNode(focusedNodeId, true)
  }, [focusedNodeId, centerNode])

  useEffect(() => {
    if (focusedNodeId) centerNode(focusedNodeId, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes])

  const orderedIds = useCallback(() => {
    return [...phoneNodes].sort((a, b) => a.position.x - b.position.x).map((n) => n.id)
  }, [phoneNodes])

  const stepFocus = useCallback(
    (dir: 1 | -1) => {
      if (!focusedNodeId) return
      const ids = orderedIds()
      const i = ids.indexOf(focusedNodeId)
      if (i < 0 || ids.length === 0) return
      const next = ids[(i + dir + ids.length) % ids.length] as string
      onSelectNode(next)
      onFocusNode(next)
    },
    [focusedNodeId, orderedIds, onSelectNode, onFocusNode],
  )

  const exitFocusToFit = useCallback(() => {
    onExitFocus()
    void fitView({ nodes: phoneNodes, padding: 0.12, duration: 320 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExitFocus, fitView, phoneNodesKey])

  // Esc exits one thing at a time: focus first, then measure mode (3.2);
  // arrows walk screens while focused (3.3). Never hijacks typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'SELECT' ||
          t.tagName === 'TEXTAREA' ||
          t.isContentEditable)
      )
        return
      if (e.key === 'Escape') {
        if (focusedNodeId) {
          e.preventDefault()
          exitFocusToFit()
          return
        }
        if (mode === 'inspect') {
          e.preventDefault()
          onModeChange('move')
        }
        return
      }
      if (focusedNodeId && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault()
        stepFocus(e.key === 'ArrowRight' ? 1 : -1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusedNodeId, mode, onModeChange, stepFocus, exitFocusToFit])

  return (
    <div className="app" data-theme={tokenTheme}>
      {dock}
      <div className="board-wrap" ref={wrapRef}>
      <div className="board">
      <ReactFlow<BoardNode>
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
        fitViewOptions={{ padding: 0.12, includeHiddenNodes: false }}
        minZoom={0.1}
        maxZoom={2.5}
        proOptions={{ hideAttribution: false }}
        onNodeClick={(_, node) => {
          onSelectNode(node.id)
          // đang focus mà click sang màn khác thì bám theo (3.3)
          if (focusedNodeId && node.id !== focusedNodeId) onFocusNode(node.id)
        }}
        onPaneClick={() => onSelectNode(null)}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#d4d4d8" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => '#007aff'}
          maskColor="rgba(244,244,245,0.75)"
          style={{ width: 140, height: 96 }}
        />
      </ReactFlow>

      <div className={toolbarCompact ? 'toolbar is-compact' : 'toolbar'}>
        <div className="toolbar-group">
          <button type="button" className="tool tool-back" onClick={onBack} title="Về Dashboard">
            ←
          </button>
          <span className="toolbar-project" title={`${screenCount} màn hình`}>
            {projectTitle}
          </span>
          <button
            type="button"
            className="tool tool-icon tool-link"
            onClick={copyBoardLink}
            title="Chép link board"
          >
            {copiedLink ? '✓' : '⧉'}
          </button>
          {copiedLink && <span className="toolbar-copied">Đã chép</span>}
          <span className="toolbar-count">{screenCount}</span>
        </div>

        <span className="toolbar-sep" />

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

        <div className="toolbar-optional">
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

        <div className="segmented" title="Chế độ màu của cả board (sáng/tối theo project tokens.css)">
          <button
            type="button"
            className={tokenTheme === 'light' ? 'is-on' : ''}
            onClick={() => onTokenThemeChange?.('light')}
          >
            Sáng
          </button>
          <button
            type="button"
            className={tokenTheme === 'dark' ? 'is-on' : ''}
            onClick={() => onTokenThemeChange?.('dark')}
          >
            Tối
          </button>
        </div>
        </div>
        <details className="toolbar-more">
          <summary className="tool tool-icon" title="Tùy chọn thêm">
            ⋯
          </summary>
          <div className="toolbar-more-body">
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
            <div className="segmented" title="Chế độ màu của cả board (sáng/tối theo project tokens.css)">
              <button
                type="button"
                className={tokenTheme === 'light' ? 'is-on' : ''}
                onClick={() => onTokenThemeChange?.('light')}
              >
                Sáng
              </button>
              <button
                type="button"
                className={tokenTheme === 'dark' ? 'is-on' : ''}
                onClick={() => onTokenThemeChange?.('dark')}
              >
                Tối
              </button>
            </div>
          </div>
        </details>

        <span className="toolbar-sep" />

        <select
          className="tool tool-select tool-select-compact"
          value={pick}
          onChange={(e) => {
            const id = e.target.value
            if (id === '__all') {
              setShowAllScreens(true)
              setPick('')
            } else if (id === '__project') {
              setShowAllScreens(false)
              setPick('')
            } else if (id) {
              onAddScreen(id)
              setPick('')
            }
          }}
          title="Thêm màn hình cụ thể"
        >
          <option value="">+ Màn hình</option>
          {showAllScreens ? (
            <>
              <option value="__project">Chỉ màn của project…</option>
              {SCREENS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </>
          ) : (
            <>
              {scopedIds.map((sid) => {
                const s = SCREEN_BY_ID.get(sid)
                return s ? (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ) : null
              })}
              <option value="__all">Tất cả {SCREENS.length} màn…</option>
            </>
          )}
        </select>
        <button
          type="button"
          className="tool"
          onClick={() => onAddScreen()}
          disabled={SCREENS.length === 0}
          title="Thêm màn tiếp theo của dự án"
        >
          +
        </button>
        <button type="button" className="tool tool-icon" onClick={handleFit} title="Vừa khung (F)">
          ⤢
        </button>

        <span className="toolbar-sep" />

        <button
          type="button"
          className="tool tool-icon"
          onClick={onTogglePanel}
          title={panelVisible ? 'Ẩn panel (Cmd/Ctrl+.)' : 'Hiện panel (Cmd/Ctrl+.)'}
        >
          {panelVisible ? '→' : '←'}
        </button>
      </div>

      {screenCount === 0 && (
        <div className="board-empty board-empty-overlay">
          <div className="board-empty-title">Bảng đang trống</div>
          <p>
            Chọn một màn trong ô <code>+ Màn hình</code> để thêm vào dự án này, hoặc chạy{' '}
            <code>npm run new-screen -- --project &lt;dự-án&gt; --name &lt;tên&gt;</code> để dựng
            màn mới từ mẫu đúng contract.
          </p>
          <p className="board-empty-note">
            Chưa chắc cách dựng? Hỏi agent — skill <code>phone-canvas</code> có sẵn quy trình và
            các mẫu màn hình.
          </p>
        </div>
      )}
      </div>
      {focusedNodeId ? (
        <div className="hint-bar" role="status">
          Focus 100% · <b>←/→</b> chuyển màn · <b>Esc</b> về tổng quan
        </div>
      ) : (
        mode === 'inspect' && (
          <div className="hint-bar" role="status">
            Đo đạc: click element để xem spec · kéo để di chuyển canvas · <b>Esc</b> về Di chuyển
          </div>
        )
      )}
      {undoTitle && (
        <div className={`undo-bar${focusedNodeId || mode === 'inspect' ? ' has-hint' : ''}`} role="status">
          Đã xóa “{undoTitle}” — file HTML giữ nguyên.
          <button type="button" className="undo-btn" onClick={onUndo}>
            Hoàn tác
          </button>
        </div>
      )}
      </div>
      {panel}
  </div>
  )
}
