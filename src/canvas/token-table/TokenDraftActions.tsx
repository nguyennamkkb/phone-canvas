import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { draftSize, promoteCss } from '../../tokens/store'
import type { TokenDraft } from '../../tokens/store'
import { swiftUITokens } from '../../tokens/swiftui'
import { Button } from '@/components/ui/button'

export type DraftActionsProps = {
  projectId: string
  projectTitle: string
  draft: TokenDraft
  onClear: () => void
}

/** Copy-CSS / SwiftUI / clear-draft buttons with transient copy feedback */
export function TokenDraftActions({ projectId, projectTitle, draft, onClear }: DraftActionsProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const nDraft = draftSize(draft)

  const copyText = (text: string, what: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(what)
      window.setTimeout(() => setCopied((c) => (c === what ? null : c)), 1600)
    })
  }

  return (
    <div className="token-actions flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        className="token-btn"
        disabled={nDraft === 0}
        title={
          nDraft === 0
            ? 'Sửa một biến trên bảng rồi chép CSS vào project/<id>/tokens.css'
            : 'Chép CSS để dán vào project/<id>/tokens.css (promote nháp thành file)'
        }
        onClick={() => copyText(promoteCss(draft), 'css')}
      >
        {copied === 'css' ? <Check /> : <Copy />}
        {copied === 'css' ? 'Đã chép!' : `Copy CSS${nDraft > 0 ? ` (${nDraft})` : ''}`}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="token-btn"
        title="Chép extension SwiftUI (Color + Spacing) của project này"
        onClick={() => copyText(swiftUITokens(projectId, projectTitle), 'swift')}
      >
        {copied === 'swift' ? <Check /> : <Copy />}
        {copied === 'swift' ? 'Đã chép!' : 'SwiftUI'}
      </Button>
      {nDraft > 0 && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="token-btn is-danger"
          onClick={onClear}
          title="Xóa mọi nháp, về lại file"
        >
          Bỏ nháp
        </Button>
      )}
    </div>
  )
}
