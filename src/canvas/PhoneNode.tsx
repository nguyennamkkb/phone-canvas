import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { Node, NodeProps } from '@xyflow/react'
import { Handle, Position } from '@xyflow/react'
import { getDevice, isKnownDevice } from '../frame/devices'
import { buildSrcDoc } from '../extractor/buildSrcDoc'
import { SCREEN_BY_ID } from '../screens'
import { projectOfScreen } from '../projects/projects'
import { draftCss, useTokenDraft } from '../tokens/store'
import { useBoardSettings } from './BoardContext'
import { useInspector } from '../inspect/InspectorContext'
import { InlineConfirm } from './InlineConfirm'

export type PhoneNodeData = {
  screenId: string
  deviceId: string
}

export type PhoneFlowNode = Node<PhoneNodeData, 'phone'>

const PLAIN_RADIUS = 16

function PhoneNodeInner({ id, data }: NodeProps) {
  const d = data as unknown as PhoneNodeData
  const {
    mode,
    frameStyle,
    activeNodeId,
    deleteConfirmId,
    onRequestDelete,
    onConfirmDelete,
    onCancelDelete,
    tokenTheme,
    focusedNodeId,
    onFocusNode,
  } = useBoardSettings()
  const { registerFrame, sizes } = useInspector()
  const frameRef = useRef<HTMLIFrameElement>(null)
  // click bắt đầu ở đâu — phân biệt click đo với drag di chuyển node (3.1)
  const downPos = useRef<{ x: number; y: number } | null>(null)
  // stable per node instance: the parent uses it to route messages reliably
  const [token] = useState(() => `t${Math.random().toString(36).slice(2, 10)}`)
  // transient copy feedback for the screen id chip
  const [copiedId, setCopiedId] = useState(false)

  const selected = activeNodeId === id
  const focused = focusedNodeId === id

  const device = getDevice(d.deviceId)
  const screen = SCREEN_BY_ID.get(d.screenId)

  // The frame has no fixed height: it reports how tall its own content is and
  // the node grows to match. A long screen simply makes a long rectangle.
  const contentH = sizes[id] ?? device.height

  const projectId = screen ? (projectOfScreen(screen.id)?.id ?? undefined) : undefined
  const [draft] = useTokenDraft(projectId ?? '')
  const extraCss = useMemo(() => draftCss(draft), [draft])

  const srcDoc = useMemo(
    () =>
      screen
        ? buildSrcDoc({
            html: screen.html,
            device,
            nodeId: id,
            token,
            lightStatusBar: screen.lightStatusBar,
            projectId,
            theme: tokenTheme,
            extraCss,
          })
        : '<!doctype html><p style="font:14px system-ui;padding:24px">Screen not found</p>',
    [screen, device, id, token, projectId, tokenTheme, extraCss],
  )

  useEffect(() => {
    registerFrame(id, frameRef.current, token)
    return () => registerFrame(id, null, token)
  }, [id, registerFrame, token])

  const plain = frameStyle === 'plain'
  const bezel = plain ? 0 : device.bezel
  const radius = plain ? PLAIN_RADIUS : device.radius
  const clickThrough = mode === 'move'

  // Đo không cần đổi mode (3.1): overlay trong suốt bắt click ở move mode,
  // iframe giữ pointerEvents:none nên drag node nguyên vẹn; click chuyển
  // thành pickAt (hit-test trong iframe) thay vì bật cả iframe.
  const onOverlayPointerDown = (e: React.PointerEvent) => {
    downPos.current = { x: e.clientX, y: e.clientY }
  }

  const onOverlayClick = (e: React.MouseEvent) => {
    if (!clickThrough) return
    const down = downPos.current
    downPos.current = null
    // kéo thả di chuyển node — không phải click đo
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return
    const frame = frameRef.current
    if (!frame || !frame.contentWindow) return
    const rect = frame.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    // canvas camera scale iframe bằng transform — rect đã gồm zoom nên
    // đổi về tọa độ CSS px trong iframe (1 CSS px === 1 pt) trước khi pick
    const scale = device.width / rect.width
    const x = (e.clientX - rect.left) * scale
    const y = (e.clientY - rect.top) * scale
    frame.contentWindow.postMessage({ pc: true, type: 'pickAt', x, y, token }, '*')
    // không stopPropagation: click vẫn nổi lên ReactFlow để chọn node
  }

  return (
    <div className={`phone-node${mode === 'inspect' ? ' is-inspect' : ''}`}>
      <div
        className="phone-label"
        onDoubleClick={(e) => {
          // focus 100% từ label (3.3) — không đụng iframe nên không xung đột drag
          e.stopPropagation()
          onFocusNode?.(id)
        }}
        title="Double-click để focus 100%"
      >
        <span className="phone-label-title">{screen?.title ?? d.screenId}</span>
        <button
          type="button"
          className="phone-id"
          title={screen ? `${projectId ?? '?'}/${screen.id} · ${screen.file} (click để chép id)` : 'click để chép id'}
          onClick={(e) => {
            e.stopPropagation()
            const ref = projectId ? `${projectId}/${d.screenId}` : d.screenId
            void navigator.clipboard.writeText(ref).then(() => {
              setCopiedId(true)
              window.setTimeout(() => setCopiedId(false), 1200)
            })
          }}
        >
          {copiedId ? 'Đã chép' : `#${projectId ? `${projectId}/` : ''}${d.screenId}`}
        </button>
        <span className="phone-label-size">
          {device.width} × {Math.round(contentH)}
        </span>
        {!isKnownDevice(d.deviceId) && (
          <span
            className="phone-device-warn"
            title={`Thiết bị “${d.deviceId}” không tồn tại — đang hiển thị ở Reference`}
          >
            ⚠ device lạ
          </span>
        )}
        {deleteConfirmId === id ? (
          <InlineConfirm
            message="Xóa màn này? File HTML giữ nguyên."
            onConfirm={() => onConfirmDelete?.(id)}
            onCancel={() => onCancelDelete?.()}
          />
        ) : (
          onRequestDelete && (
            <button
              type="button"
              className="phone-delete"
              title="Xóa màn hình khỏi board (Delete)"
              onClick={(e) => {
                e.stopPropagation()
                onRequestDelete(id)
              }}
            >
              ×
            </button>
          )
        )}
      </div>

      <div
        className={`phone${plain ? ' is-plain' : ''}${selected ? ' is-selected' : ''}${focused ? ' is-focused' : ''}`}
        style={{
          width: device.width + bezel * 2,
          height: contentH + bezel * 2,
          borderRadius: radius + bezel,
          padding: bezel,
        }}
      >
        {/* núm nối flow: kéo từ núm phải sang màn khác; Board đã có onConnect (3.x) */}
        <Handle type="target" position={Position.Left} aria-label="Nối tới màn này" />
        <Handle type="source" position={Position.Right} aria-label="Nối sang màn khác" />
        <div
          className="phone-screen"
          style={{
            borderRadius: plain ? radius - 1 : device.radius,
            width: device.width,
            height: contentH,
          }}
        >
          <iframe
            ref={frameRef}
            title={screen?.title ?? id}
            srcDoc={srcDoc}
            width={device.width}
            height={contentH}
            sandbox="allow-scripts"
            style={{ pointerEvents: mode === 'inspect' ? 'auto' : 'none' }}
          />
          {clickThrough && (
            <div
              className="phone-clickthrough"
              onPointerDown={onOverlayPointerDown}
              onClick={onOverlayClick}
              title="Click để đo element — kéo để di chuyển node"
            />
          )}
          {!plain && device.island === 'dynamic' && <div className="phone-island" />}
          {!plain && device.island === 'notch' && <div className="phone-notch" />}
        </div>
      </div>
    </div>
  )
}

export const PhoneNode = memo(PhoneNodeInner)
