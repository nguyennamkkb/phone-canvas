import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { SCREEN_BY_ID } from '../screens'
import type { TrashEntry } from '../projects/storage'
import { InlineConfirm } from '../canvas/InlineConfirm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent aria-label="Thùng rác màn hình">
        <DialogHeader>
          <DialogTitle>
            Thùng rác <span className="text-muted-foreground font-normal">({trash.length})</span>
          </DialogTitle>
          {trash.length === 0 && (
            <DialogDescription>
              Thùng đang trống. Màn hình xóa khỏi board sẽ nằm ở đây.
            </DialogDescription>
          )}
        </DialogHeader>
        {trash.length > 0 && (
          <>
            <ScrollArea className="max-h-[50vh] pr-4">
              <ul className="flex flex-col gap-3">
                {ordered.map((t) => {
                  const title = SCREEN_BY_ID.get(t.screenId)?.title ?? t.screenId
                  const cmd = `npm run delete-screen -- --id ${t.screenId}`
                  return (
                    <li key={t.id} className="flex flex-col gap-2 border-b border-border pb-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium">{title}</span>
                        <span className="text-xs text-muted-foreground">{fmtTime(t.deletedAt)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore(t.id)}
                        >
                          Khôi phục
                        </Button>
                        {cmdFor === t.id ? (
                          <span className="flex flex-wrap items-center gap-2">
                            <Input readOnly value={cmd} className="h-8 w-64 font-mono text-xs" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCmd(t.screenId)}
                              title="Chép lệnh"
                            >
                              {copied ? <Check /> : <Copy />}
                              {copied ? 'Đã chép' : 'Chép lệnh'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                onDrop(t.id)
                                setCmdFor(null)
                              }}
                              title="Gỡ khỏi thùng sau khi đã chạy lệnh (file HTML đã xóa thật)"
                            >
                              Đã chạy lệnh, gỡ khỏi thùng
                            </Button>
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setCmdFor(t.id)}
                          >
                            Xóa vĩnh viễn…
                          </Button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
            <DialogFooter className="justify-start">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmEmpty(true)}
                >
                  Dọn thùng
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
