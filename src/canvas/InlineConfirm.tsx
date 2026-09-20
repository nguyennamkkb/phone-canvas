import { useEffect } from 'react'

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
      className="inline-confirm"
      role="alertdialog"
      aria-label={message}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <span className="inline-confirm-msg">{message}</span>
      <button type="button" className="inline-confirm-yes" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="inline-confirm-no" onClick={onCancel}>
        {cancelLabel}
      </button>
    </span>
  )
}
