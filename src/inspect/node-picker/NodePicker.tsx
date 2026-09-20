import { DEVICES } from '../../frame/devices'
import { SCREENS } from '../../screens'
import type { PhoneNodeData } from '../../canvas/PhoneNode'

export type NodePickerProps = {
  nodeId: string
  screenId: string
  deviceId: string
  onPatchNode: (id: string, patch: Partial<PhoneNodeData>) => void
  onDeleteNode: (id: string) => void
}

/** screen + device selectors and the remove-from-board action for one node */
export function NodePicker({ nodeId, screenId, deviceId, onPatchNode, onDeleteNode }: NodePickerProps) {
  return (
    <div className="section node-picker">
      <div className="picker-row">
        <span className="field-key">Màn hình</span>
        <select value={screenId} onChange={(e) => onPatchNode(nodeId, { screenId: e.target.value })}>
          {SCREENS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <div className="picker-row">
        <span className="field-key">Thiết bị</span>
        <select value={deviceId} onChange={(e) => onPatchNode(nodeId, { deviceId: e.target.value })}>
          {DEVICES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="picker-row">
        <span className="field-key">Màn này</span>
        <button
          type="button"
          className="ghost danger"
          onClick={() => onDeleteNode(nodeId)}
          title="Xóa màn hình khỏi board (Delete)"
        >
          Xóa khỏi board
        </button>
      </div>
    </div>
  )
}
