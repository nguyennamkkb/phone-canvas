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
import { ArrowLeft, Check, ChevronsLeft, ChevronsRight, Link2, Maximize2, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { PhoneNode } from './PhoneNode'
import type { BoardNode } from './TokenNode'
import type { BoardSettings } from './BoardContext'
import type { CanvasMode, FrameStyle } from './BoardContext'
import { useInspector } from '../inspect/InspectorContext'
import { SCREEN_BY_ID, SCREENS } from '../screens'
import { hrefFor } from '../shell/useHashRoute'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  /** flow-core 2.3: double-click dây nối để đặt nhãn component nguồn */
  onEdgeLabel: (edgeId: string) => void
  onBack: () => void
  onTogglePanel: () => void
  /** screen id đang focus 100% (3.3) — null khi ở tổng quan */
  focusedNodeId: string | null
  onFocusNode: (id: string) => void
  onExitFocus: () => void
  /** màn vừa xóa còn hoàn tác được (5.2) — null khi hết hạn */
  undoTitle: string | null
  /** flow-core: hậu tố khác nhau cho xóa node vs xóa edge */
  undoSuffix?: string
  onUndo: () => void
  projectId: string
  /** màn của project hiện tại — dropdown mặc định chỉ liệt kê chừng này (5.3) */
  projectScreenIds: string[]
  /** thùng rác per-project — badge + dialog (screen-trash) */
  trashCount: number
  onOpenTrash: () => void
  /** xuất/nhập state file (project-state-file) */
  onExportState: () => void
  onImportState: () => void
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
  onEdgeLabel,
  onAddScreen,
  onBack,
  onTogglePanel,
  focusedNodeId,
  onFocusNode,
  onExitFocus,
  undoSuffix,
  undoTitle,
  onUndo,
  projectId,
  projectScreenIds,
  trashCount,
  onOpenTrash,
  onExportState,
  onImportState,
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
  // toolbar compaction: nhóm phụ gộp vào ⋯ khi topbar hẹp (đo chính topbar).
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

  // fit-view frames screen nodes only (phone + tablet) — token-dock (2.1)
  // nằm ngoài canvas nên mặc nhiên không lọt vào phép tính fit/minimap
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
  // so relabel them in place; screen nodes (phone + tablet) are untouched
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
    <div className="app app-board" data-theme={tokenTheme}>
      <div ref={wrapRef} className={cn('topbar relative z-10 flex flex-wrap items-center gap-2 px-3 py-2')}>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={onBack} title="Về Dashboard" aria-label="Về Dashboard">
                <ArrowLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Về Dashboard</TooltipContent>
          </Tooltip>
          <span className="text-[13px] font-semibold tracking-tight" title={`${screenCount} màn hình`}>
            {projectTitle}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copyBoardLink}
                title="Chép link board"
                aria-label="Chép link board"
              >
                {copiedLink ? <Check /> : <Link2 />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chép link board</TooltipContent>
          </Tooltip>
          {copiedLink && <Badge variant="secondary">Đã chép</Badge>}
          <Badge variant="secondary">{screenCount}</Badge>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <div role="group" aria-label="Chế độ" className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
          <Button
            type="button"
            variant={mode === 'move' ? 'secondary' : 'ghost'}
            size="sm"
            data-state={mode === 'move' ? 'on' : 'off'}
            aria-pressed={mode === 'move'}
            onClick={() => onModeChange('move')}
          >
            Di chuyển
          </Button>
          <Button
            type="button"
            variant={mode === 'inspect' ? 'secondary' : 'ghost'}
            size="sm"
            data-state={mode === 'inspect' ? 'on' : 'off'}
            aria-pressed={mode === 'inspect'}
            onClick={() => onModeChange('inspect')}
          >
            Đo đạc
          </Button>
        </div>

        {!toolbarCompact && (
        <div className="contents">
        <div role="group" aria-label="Kiểu khung" className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
          <Button
            type="button"
            variant={frameStyle === 'plain' ? 'secondary' : 'ghost'}
            size="sm"
            data-state={frameStyle === 'plain' ? 'on' : 'off'}
            aria-pressed={frameStyle === 'plain'}
            onClick={() => onFrameStyleChange('plain')}
          >
            Khung đơn giản
          </Button>
          <Button
            type="button"
            variant={frameStyle === 'device' ? 'secondary' : 'ghost'}
            size="sm"
            data-state={frameStyle === 'device' ? 'on' : 'off'}
            aria-pressed={frameStyle === 'device'}
            onClick={() => onFrameStyleChange('device')}
          >
            Khung máy
          </Button>
        </div>

        <div role="group" aria-label="Chế độ màu" title="Chế độ màu của cả board (sáng/tối theo project tokens.css)" className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5">
          <Button
            type="button"
            variant={tokenTheme === 'light' ? 'secondary' : 'ghost'}
            size="sm"
            data-state={tokenTheme === 'light' ? 'on' : 'off'}
            aria-pressed={tokenTheme === 'light'}
            onClick={() => onTokenThemeChange?.('light')}
          >
            Sáng
          </Button>
          <Button
            type="button"
            variant={tokenTheme === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            data-state={tokenTheme === 'dark' ? 'on' : 'off'}
            aria-pressed={tokenTheme === 'dark'}
            onClick={() => onTokenThemeChange?.('dark')}
          >
            Tối
          </Button>
        </div>
        </div>
        )}
        {toolbarCompact && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" title="Tùy chọn thêm" aria-label="Tùy chọn thêm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Kiểu khung</DropdownMenuLabel>
            <DropdownMenuItem data-state={frameStyle === 'plain' ? 'on' : 'off'} onSelect={() => onFrameStyleChange('plain')}>
              Khung đơn giản
            </DropdownMenuItem>
            <DropdownMenuItem data-state={frameStyle === 'device' ? 'on' : 'off'} onSelect={() => onFrameStyleChange('device')}>
              Khung máy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Chế độ màu</DropdownMenuLabel>
            <DropdownMenuItem data-state={tokenTheme === 'light' ? 'on' : 'off'} onSelect={() => onTokenThemeChange?.('light')}>
              Sáng
            </DropdownMenuItem>
            <DropdownMenuItem data-state={tokenTheme === 'dark' ? 'on' : 'off'} onSelect={() => onTokenThemeChange?.('dark')}>
              Tối
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        <Separator orientation="vertical" className="h-5" />

        <Select
          value={pick}
          onValueChange={(id) => {
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
        >
          <SelectTrigger className="h-8 w-auto text-xs" title="Thêm màn hình cụ thể" aria-label="Thêm màn hình cụ thể">
            <SelectValue placeholder="+ Màn hình" />
          </SelectTrigger>
          <SelectContent>
            {showAllScreens ? (
              <>
                <SelectItem value="__project">Chỉ màn của project…</SelectItem>
                {SCREENS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </>
            ) : (
              <>
                {scopedIds.map((sid) => {
                  const s = SCREEN_BY_ID.get(sid)
                  return s ? (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ) : null
                })}
                <SelectItem value="__all">Tất cả {SCREENS.length} màn…</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onAddScreen()}
              disabled={SCREENS.length === 0}
              title="Thêm màn tiếp theo của dự án"
              aria-label="Thêm màn tiếp theo của dự án"
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Thêm màn tiếp theo của dự án</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" onClick={handleFit} title="Vừa khung (F)" aria-label="Vừa khung (F)">
              <Maximize2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Vừa khung (F)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenTrash}
              title={trashCount > 0 ? `Thùng rác (${trashCount} màn)` : 'Thùng rác (trống)'}
              aria-label={trashCount > 0 ? `Thùng rác (${trashCount} màn)` : 'Thùng rác (trống)'}
            >
              <Trash2 />
              {trashCount > 0 && <Badge variant="secondary">{trashCount}</Badge>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{trashCount > 0 ? `Thùng rác (${trashCount} màn)` : 'Thùng rác (trống)'}</TooltipContent>
        </Tooltip>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onExportState}
          title="Xuất trạng thái board ra file board.json"
        >
          Xuất
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onImportState}
          title="Nhập trạng thái từ file board.json"
        >
          Nhập
        </Button>

        <Separator orientation="vertical" className="h-5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onTogglePanel}
              title={panelVisible ? 'Ẩn panel (Cmd/Ctrl+.)' : 'Hiện panel (Cmd/Ctrl+.)'}
              aria-label={panelVisible ? 'Ẩn panel (Cmd/Ctrl+.)' : 'Hiện panel (Cmd/Ctrl+.)'}
            >
              {panelVisible ? <ChevronsRight /> : <ChevronsLeft />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{panelVisible ? 'Ẩn panel (Cmd/Ctrl+.)' : 'Hiện panel (Cmd/Ctrl+.)'}</TooltipContent>
        </Tooltip>
      </div>

      <div className="board-main">
        {dock}
        <div className="board-wrap">
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
        elementsSelectable
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
        // click dây nối xả chọn node để Delete ưu tiên edge (flow-core 2.2)
        onEdgeClick={() => onSelectNode(null)}
        onEdgeDoubleClick={(_, edge) => onEdgeLabel(edge.id)}
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

      {screenCount === 0 && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-10 w-full max-w-md -translate-x-1/2 px-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bảng đang trống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                Chọn một màn trong ô <code>+ Màn hình</code> để thêm vào dự án này, hoặc chạy{' '}
                <code>npm run new-screen -- --project &lt;dự-án&gt; --name &lt;tên&gt;</code> để
                dựng màn mới từ mẫu đúng contract.
              </p>
              <p>
                Chưa chắc cách dựng? Hỏi agent — skill <code>phone-canvas</code> có sẵn quy trình
                và các mẫu màn hình.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
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
          Đã xóa “{undoTitle}”{undoSuffix ?? ' — file HTML giữ nguyên.'}
          <Button type="button" variant="outline" size="sm" onClick={onUndo}>
            Hoàn tác
          </Button>
        </div>
      )}
          </div>
        </div>
        {panel}
      </div>
    </div>
  )
}
