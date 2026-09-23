import { useState } from 'react'
import { SCREEN_BY_ID } from '../screens'
import type { TrashEntry } from '../projects/storage'
import { InlineConfirm } from '../canvas/InlineConfirm'

export type TrashDialogProps = {
  trash: TrashEntry[]
  onRestore: (entryId: string) => void
  onDrop: (entryId: string) => void
  onEmpty: () => void
  onClose: () => void
}

function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(ts)
  }
}

export function TrashDialog({ trash, onRestore, onDrop, onEmpty, onClose }: TrashDialogProps) {
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  // entry đang xem lệnh xóa vĩnh viễn — browser không xóa được file nên hiện lệnh
  const [cmdFor, setCmdFor] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  // newest first
  const ordered = [...trash].reverse()

  const copyCmd = (screenId: string) => {
    const cmd = `npm run delete-screen -- --id ${screenId}`
    void navigator.clipboard
      .writeText(cmd)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => setCopied(false))
  }

  return (
    <div className="trash-overlay" role="dialog" aria-label="Thùng rác màn hình" onClick={onClose}>
      <div className="trash-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="trash-head">
          <b>Thùng rác</b>
          <span className="muted">({trash.length})</span>
          <button type="button" className="tool tool-icon" onClick={onClose} title="Đóng">
            ✕
          </button>
        </div>
        {trash.length === 0 ? (
          <p className="trash-empty">Thùng đang trống. Màn hình xóa khỏi board sẽ nằm ở đây.</p>
        ) : (
          <>
            <ul className="trash-list">
              {ordered.map((t) => {
                const title = SCREEN_BY_ID.get(t.screenId)?.title ?? t.screenId
                return (
                  <li key={t.id} className="trash-item">
                    <div className="trash-meta">
                      <span className="trash-title">{title}</span>
                      <span className="muted">{fmtTime(t.deletedAt)}</span>
                    </div>
                    <div className="trash-actions">
                      <button type="button" className="dash-btn" onClick={() => onRestore(t.id)}>
                        Khôi phục
                      </button>
                      {cmdFor === t.id ? (
                        <span className="trash-cmd">
                          <code>npm run delete-screen -- --id {t.screenId}</code>
                          <button
                            type="button"
                            className="tool"
                            onClick={() => copyCmd(t.screenId)}
                            title="Chép lệnh"
                          >
                            {copied ? '✓' : '⧉'}
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => {
                              onDrop(t.id)
                              setCmdFor(null)
                            }}
                            title="Gỡ khỏi thùng sau khi đã chạy lệnh (file HTML đã xóa thật)"
                          >
                            Đã chạy lệnh, gỡ khỏi thùng
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="ghost trash-danger"
                          onClick={() => setCmdFor(t.id)}
                        >
                          Xóa vĩnh viễn…
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="trash-foot">
              {confirmEmpty ? (
                <InlineConfirm
                  message={`Dọn sạch ${trash.length} màn? File HTML xóa thật qua script.`}
                  confirmLabel="Dọn sạch"
                  onConfirm={() => {
                    onEmpty()
                    setConfirmEmpty(false)
                  }}
                  onCancel={() => setConfirmEmpty(false)}
                />
              ) : (
                <button
                  type="button"
                  className="ghost trash-danger"
                  onClick={() => setConfirmEmpty(true)}
                >
                  Dọn thùng
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
