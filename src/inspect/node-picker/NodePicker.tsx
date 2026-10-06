import { DEVICES } from '../../frame/devices'
import { SCREENS } from '../../screens'
import type { PhoneNodeData } from '../../canvas/PhoneNode'
import { InlineConfirm } from '../../canvas/InlineConfirm'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type NodePickerProps = {
  nodeId: string
  screenId: string
  deviceId: string
  onPatchNode: (id: string, patch: Partial<PhoneNodeData>) => void
  deleteConfirmId: string | null
  onRequestDelete: (id: string) => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
}

/** screen + device selectors and the remove-from-board action for one node */
export function NodePicker({
  nodeId,
  screenId,
  deviceId,
  onPatchNode,
  deleteConfirmId,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: NodePickerProps) {
  return (
    <div className="section node-picker">
      <div className="picker-row">
        <span className="field-key">Màn hình</span>
        <Select value={screenId} onValueChange={(v) => onPatchNode(nodeId, { screenId: v })}>
          <SelectTrigger aria-label="Màn hình">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCREENS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="picker-row">
        <span className="field-key">Thiết bị</span>
        <Select value={deviceId} onValueChange={(v) => onPatchNode(nodeId, { deviceId: v })}>
          <SelectTrigger aria-label="Thiết bị">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEVICES.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="picker-row">
        <span className="field-key">Màn này</span>
        {deleteConfirmId === nodeId ? (
          <InlineConfirm
            message="Xóa màn này? File HTML giữ nguyên."
            onConfirm={() => onConfirmDelete(nodeId)}
            onCancel={onCancelDelete}
          />
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="ghost danger text-destructive hover:text-destructive"
            onClick={() => onRequestDelete(nodeId)}
            title="Xóa màn hình khỏi board (Delete)"
          >
            Xóa khỏi board
          </Button>
        )}
      </div>
    </div>
  )
}
