import { useEffect, useState } from 'react'
import { useInspector } from './InspectorContext'
import { useBoardSettings } from '../canvas/BoardContext'
import type { PhoneNodeData } from '../canvas/PhoneNode'
import type { BoardNode } from '../canvas/TokenNode'
import { projectOfScreen } from '../projects/projects'
import { tokenNameForColor } from '../tokens/tokens'
import { SpecDetail } from './spec-detail/SpecDetail'
import { ElementTree } from './element-tree/ElementTree'
import { NodePicker } from './node-picker/NodePicker'
import { copyPayloadFor, copyPayloadText } from './copy-json/copyJson'

export type SpecPanelProps = {
  nodes: BoardNode[]
  selectedNodeId: string | null
  onPatchNode: (id: string, patch: Partial<PhoneNodeData>) => void
  onDeleteNode: (id: string) => void
  /** close the overlay panel on narrow viewports (2.4) — no-op on desktop */
  onClosePanel?: () => void
}



export function SpecPanel({ nodes, selectedNodeId, onPatchNode, onDeleteNode, onClosePanel }: SpecPanelProps) {
  const { specs, selection, select, selected, requestRecapture } = useInspector()
  const { tokenTheme } = useBoardSettings()
  const found = nodes.find((n) => n.id === selectedNodeId) ?? null
  // the token table is reference, never a spec target
  const node = found && found.type === 'phone' ? found : null
  const projectId = node ? (projectOfScreen(node.data.screenId)?.id ?? '') : ''
  const lookup = (raw: string) => tokenNameForColor(projectId, raw, tokenTheme)
  const specList = node ? (specs[node.id] ?? []) : []

  const hasSpec = specList.length > 0
  // spec timeout (2.3): a node mounted but silent is stuck, not loading
  const [timedOutIds, setTimedOutIds] = useState<Record<string, boolean>>({})
  const nodeTimedOut = node ? timedOutIds[node.id] === true : false

  useEffect(() => {
    if (!node || hasSpec) return
    const id = node.id
    setTimedOutIds((prev) => (prev[id] ? prev : { ...prev, [id]: false }))
    const t = window.setTimeout(() => {
      setTimedOutIds((prev) => ({ ...prev, [id]: true }))
    }, 8000)
    return () => window.clearTimeout(t)
  }, [node, hasSpec])

  const copySpec = () => {
    void navigator.clipboard.writeText(copyPayloadText(copyPayloadFor(selectedNodeId, specList, selected)))
  }

  return (
    <aside className="panel">
      <header className="panel-head">
        <h2>
          Thông số <span className="muted">SwiftUI</span>
        </h2>
        <span style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="ghost panel-close" onClick={onClosePanel} title="Đóng panel">
            Đóng ✕
          </button>
          <button type="button" className="ghost" onClick={copySpec} disabled={!hasSpec}>
            Copy JSON
          </button>
        </span>
      </header>

      <div className="panel-body">
        {!node && (
          <p className="empty">
            Chọn một màn hình trên bảng (chế độ <b>Di chuyển</b>), rồi bật <b>Đo đạc</b> và
            click vào từng phần tử.
          </p>
        )}

        {node && (
          <NodePicker
            nodeId={node.id}
            screenId={node.data.screenId}
            deviceId={node.data.deviceId}
            onPatchNode={onPatchNode}
            onDeleteNode={onDeleteNode}
          />
        )}

        {node && !hasSpec && !nodeTimedOut && <p className="empty">Đang đọc DOM…</p>}

        {node && !hasSpec && nodeTimedOut && (
          <div className="empty">
            <p>
              Không đọc được DOM của màn này sau 8 giây — iframe có thể bị chặn hoặc bridge
              chưa chạy.
            </p>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setTimedOutIds((prev) => ({ ...prev, [node.id]: false }))
                requestRecapture(node.id)
              }}
            >
              Thử đọc lại
            </button>
          </div>
        )}

        {hasSpec && node && (
          <>
            <ElementTree specList={specList} selection={selection} nodeId={node.id} onPick={select} />
            {selected ? (
              <SpecDetail node={selected} lookup={lookup} />
            ) : (
              <p className="empty">
                Chọn một dòng trong cây, hoặc bật <b>Đo đạc</b> rồi click trực tiếp vào màn
                hình.
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
