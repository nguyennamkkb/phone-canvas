import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { Node, NodeProps } from '@xyflow/react'
import { getDevice } from '../frame/devices'
import { buildSrcDoc } from '../extractor/buildSrcDoc'
import { SCREEN_BY_ID } from '../screens'
import { useBoardSettings } from './BoardContext'
import { useInspector } from '../inspect/InspectorContext'

export type PhoneNodeData = {
  screenId: string
  deviceId: string
}

export type PhoneFlowNode = Node<PhoneNodeData, 'phone'>

const PLAIN_RADIUS = 16

function PhoneNodeInner({ id, data }: NodeProps) {
  const d = data as unknown as PhoneNodeData
  const { mode, frameStyle, activeNodeId, onDeleteNode } = useBoardSettings()
  const { registerFrame, sizes } = useInspector()
  const frameRef = useRef<HTMLIFrameElement>(null)
  // stable per node instance: the parent uses it to route messages reliably
  const [token] = useState(() => `t${Math.random().toString(36).slice(2, 10)}`)

  const selected = activeNodeId === id

  const device = getDevice(d.deviceId)
  const screen = SCREEN_BY_ID.get(d.screenId)

  // The frame has no fixed height: it reports how tall its own content is and
  // the node grows to match. A long screen simply makes a long rectangle.
  const contentH = sizes[id] ?? device.height

  const srcDoc = useMemo(
    () =>
      screen
        ? buildSrcDoc({
            html: screen.html,
            device,
            nodeId: id,
            token,
            lightStatusBar: screen.lightStatusBar,
          })
        : '<!doctype html><p style="font:14px system-ui;padding:24px">Screen not found</p>',
    [screen, device, id, token],
  )

  useEffect(() => {
    registerFrame(id, frameRef.current, token)
    return () => registerFrame(id, null, token)
  }, [id, registerFrame, token])

  const plain = frameStyle === 'plain'
  const bezel = plain ? 0 : device.bezel
  const radius = plain ? PLAIN_RADIUS : device.radius

  return (
    <div className="phone-node">
      <div className="phone-label">
        <span className="phone-label-title">{screen?.title ?? d.screenId}</span>
        <span className="phone-label-size">
          {device.width} × {Math.round(contentH)}
        </span>
        {onDeleteNode && (
          <button
            type="button"
            className="phone-delete"
            title="Xóa màn hình khỏi board (Delete)"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteNode(id)
            }}
          >
            ×
          </button>
        )}
      </div>

      <div
        className={`phone${plain ? ' is-plain' : ''}${selected ? ' is-selected' : ''}`}
        style={{
          width: device.width + bezel * 2,
          height: contentH + bezel * 2,
          borderRadius: radius + bezel,
          padding: bezel,
        }}
      >
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
          {!plain && device.island === 'dynamic' && <div className="phone-island" />}
          {!plain && device.island === 'notch' && <div className="phone-notch" />}
        </div>
      </div>
    </div>
  )
}

export const PhoneNode = memo(PhoneNodeInner)
