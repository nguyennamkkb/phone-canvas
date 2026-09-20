import type { Token } from '../../tokens/tokens'

export type SizeCellProps = {
  token: Token
  value: string
  use?: { count: number; screens: number }
  onCommit: (value: string) => void
  onRevert: () => void
}

/** one editable spacing/radius/type token cell — blur or Enter commits */
export function TokenSizeCell({ token, value, use, onCommit, onRevert }: SizeCellProps) {
  const isDraft = value !== token.light
  return (
    <div
      className={`token-cell${isDraft ? ' is-draft' : ''}${use && use.count === 0 ? ' is-unused' : ''}`}
      title={`${token.name}: ${value}${use ? `\ndùng ${use.count} chỗ · ${use.screens} màn` : ''}`}
    >
      <code className="token-name">{token.name}</code>
      {isDraft && (
        <button type="button" className="token-x" title="Bỏ nháp biến này" onClick={onRevert}>
          ×
        </button>
      )}
      <input
        className="token-input"
        key={`${token.name}:${value}`}
        defaultValue={value}
        aria-label={token.name}
        onBlur={(e) => {
          if (e.target.value !== value) onCommit(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
      />
    </div>
  )
}
