import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export type InlineConfirmProps = {
  /** dòng hỏi ngắn, ví dụ "Xóa màn này? File HTML giữ nguyên." */
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Một pattern xóa duy nhất (5.2): hỏi + xác nhận tại chỗ, thay
 * `window.confirm`. Không chọn gì sau 6s thì tự hủy (coi như Hủy).
 */
export function InlineConfirm({
  message,
  confirmLabel = 'Xóa',
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
}: InlineConfirmProps) {
  useEffect(() => {
    const t = window.setTimeout(onCancel, 6000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span
      role="alertdialog"
      aria-label={message}
      className="inline-flex flex-wrap items-center gap-2"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <span className="text-sm">{message}</span>
      <Button type="button" size="sm" variant="destructive" onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
    </span>
  )
}
