import { X } from 'lucide-react'
import type { Token } from '../../tokens/tokens'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const unused = !!use && use.count === 0
  return (
    <div
      className={cn('token-cell flex items-baseline gap-2', isDraft && 'is-draft', unused && 'is-unused')}
      title={`${token.name}: ${value}${use ? `\ndùng ${use.count} chỗ · ${use.screens} màn` : ''}`}
    >
      <code className={cn('token-name min-w-0 flex-1 truncate font-mono text-xs', unused && 'opacity-45')}>{token.name}</code>
      {isDraft && (
        <Badge variant="secondary" className="shrink-0">
          nháp
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
      <Input
        className={cn('token-input h-7 w-24 px-2 font-mono text-xs', isDraft && 'border-dashed')}
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
