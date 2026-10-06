import { Check, Copy, X } from 'lucide-react'
import { toRgba } from '../../tokens/tokens'
import type { ThemeMode, Token } from '../../tokens/tokens'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const unused = !!use && use.count === 0
  const current = toRgba(theme === 'dark' ? dark : light)
  const pickerValue = current ? rgbaToHex(current) : '#000000'

  return (
    <div
      className={cn('token-row flex items-center gap-2', isDraft && 'is-draft', unused && 'is-unused')}
      title={`${token.name}\nsáng: ${light}\ntối: ${dark}${use ? `\ndùng ${use.count} chỗ · ${use.screens} màn` : ''}`}
    >
      <span className="token-swatch relative shrink-0" style={{ background: `linear-gradient(90deg, ${light} 50%, ${dark} 50%)` }}>
        <input
          type="color"
          className="token-picker absolute inset-0 h-full w-full cursor-pointer opacity-0"
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
      <code className={cn('token-name min-w-0 flex-1 truncate font-mono text-xs', unused && 'opacity-45')}>{token.name}</code>
      {isDraft && (
        <Badge variant="secondary" className="shrink-0">
          nháp
        </Badge>
      )}
      {unused && (
        <Badge variant="outline" className="shrink-0 font-normal">
          chưa dùng
        </Badge>
      )}
      {isDraft && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="token-x h-6 w-6 shrink-0"
          title="Bỏ nháp biến này"
          aria-label={`Bỏ nháp biến ${token.name}`}
          onClick={onRevert}
        >
          <X />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="token-val is-copy h-6 shrink-0 gap-1 px-1.5 font-mono text-xs"
        title="Click để chép mã màu"
        onClick={() => onCopy(theme === 'dark' ? dark : light)}
      >
        {copied ? <Check /> : <Copy />}
        {copied ? 'Đã chép' : theme === 'dark' ? dark : light}
      </Button>
    </div>
  )
}
