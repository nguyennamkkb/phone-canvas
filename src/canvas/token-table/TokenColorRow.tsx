import { toRgba } from '../../tokens/tokens'
import type { ThemeMode, Token } from '../../tokens/tokens'

function rgbaToHex(v: [number, number, number, number]): string {
  const h = (x: number) => Math.round(x).toString(16).padStart(2, '0')
  return `#${h(v[0])}${h(v[1])}${h(v[2])}`
}

export type ColorRowProps = {
  token: Token
  draftLight?: string
  draftDark?: string
  use?: { count: number; screens: number }
  theme: ThemeMode
  onPick: (value: string) => void
  onRevert: () => void
  copied: boolean
  onCopy: (text: string) => void
}

/** one editable color token row: picker edits the active theme, value click copies */
export function TokenColorRow({
  token,
  draftLight,
  draftDark,
  use,
  theme,
  onPick,
  onRevert,
  copied,
  onCopy,
}: ColorRowProps) {
  const light = draftLight ?? token.light
  const dark = draftDark ?? token.dark
  const isDraft = draftLight !== undefined || draftDark !== undefined
  const current = toRgba(theme === 'dark' ? dark : light)
  const pickerValue = current ? rgbaToHex(current) : '#000000'

  return (
    <div
      className={`token-row${isDraft ? ' is-draft' : ''}${use && use.count === 0 ? ' is-unused' : ''}`}
      title={`${token.name}\nsáng: ${light}\ntối: ${dark}${use ? `\ndùng ${use.count} chỗ · ${use.screens} màn` : ''}`}
    >
      <span className="token-swatch" style={{ background: `linear-gradient(90deg, ${light} 50%, ${dark} 50%)` }}>
        <input
          type="color"
          className="token-picker"
          value={pickerValue}
          title={`Đổi ${token.name} (${theme === 'dark' ? 'tối' : 'sáng'})`}
          onChange={(e) => {
            // the picker has no alpha — keep the current one when translucent
            const alpha = current ? current[3] : 1
            const hex = e.target.value
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            onPick(alpha >= 1 ? hex : `rgba(${r}, ${g}, ${b}, ${alpha})`)
          }}
        />
      </span>
      <code className="token-name">{token.name}</code>
      {isDraft && (
        <button type="button" className="token-x" title="Bỏ nháp biến này" onClick={onRevert}>
          ×
        </button>
      )}
      <button
        type="button"
        className="token-val is-copy"
        title="Click để chép mã màu"
        onClick={() => onCopy(theme === 'dark' ? dark : light)}
      >
        {copied ? 'Đã chép' : theme === 'dark' ? dark : light}
      </button>
    </div>
  )
}
