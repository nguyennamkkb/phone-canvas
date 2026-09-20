import { useState } from 'react'
import { draftSize, promoteCss } from '../../tokens/store'
import type { TokenDraft } from '../../tokens/store'
import { swiftUITokens } from '../../tokens/swiftui'

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
    <div className="token-actions">
      <button
        type="button"
        className="token-btn"
        disabled={nDraft === 0}
        title={
          nDraft === 0
            ? 'Sửa một biến trên bảng rồi chép CSS vào project/<id>/tokens.css'
            : 'Chép CSS để dán vào project/<id>/tokens.css (promote nháp thành file)'
        }
        onClick={() => copyText(promoteCss(draft), 'css')}
      >
        {copied === 'css' ? 'Đã chép!' : `Copy CSS${nDraft > 0 ? ` (${nDraft})` : ''}`}
      </button>
      <button
        type="button"
        className="token-btn"
        title="Chép extension SwiftUI (Color + Spacing) của project này"
        onClick={() => copyText(swiftUITokens(projectId, projectTitle), 'swift')}
      >
        {copied === 'swift' ? 'Đã chép!' : 'SwiftUI'}
      </button>
      {nDraft > 0 && (
        <button type="button" className="token-btn is-danger" onClick={onClear} title="Xóa mọi nháp, về lại file">
          Bỏ nháp
        </button>
      )}
    </div>
  )
}
