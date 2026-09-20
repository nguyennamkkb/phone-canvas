import { memo, useMemo, useState } from 'react'
import type { Node, NodeProps } from '@xyflow/react'
import { projectTokensOf, toRgba } from '../tokens/tokens'
import type { ThemeMode, Token, TokenGroup } from '../tokens/tokens'
import { draftSize, promoteCss, useTokenDraft } from '../tokens/store'
import { usageOf } from '../tokens/usage'
import { swiftUITokens } from '../tokens/swiftui'
import { useBoardSettings } from './BoardContext'
import type { PhoneFlowNode } from './PhoneNode'

export type TokenNodeData = {
  projectId: string
  title: string
}

export type TokenFlowNode = Node<TokenNodeData, 'token'>

/** everything that can sit on a project board */
export type BoardNode = PhoneFlowNode | TokenFlowNode

const PROJECT_ACCENT: Record<string, string> = {
  'mood-core': '#7c9448',
  freud: '#f47f42',
  onboarding: '#9d8ff0',
}

const GROUPS: Array<{ id: TokenGroup; title: string }> = [
  { id: 'color', title: 'Màu · sáng / tối' },
  { id: 'spacing', title: 'Khoảng cách' },
  { id: 'radius', title: 'Bo góc' },
  { id: 'type', title: 'Chữ' },
]

function rgbaToHex(v: [number, number, number, number]): string {
  const h = (x: number) => Math.round(x).toString(16).padStart(2, '0')
  return `#${h(v[0])}${h(v[1])}${h(v[2])}`
}

function ColorRow({
  token,
  draftLight,
  draftDark,
  use,
  theme,
  onPick,
  onRevert,
  copied,
  onCopy,
}: {
  token: Token
  draftLight?: string
  draftDark?: string
  use?: { count: number; screens: number }
  theme: ThemeMode
  onPick: (value: string) => void
  onRevert: () => void
  copied: boolean
  onCopy: (text: string) => void
}) {
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

function SizeCell({
  token,
  value,
  use,
  onCommit,
  onRevert,
}: {
  token: Token
  value: string
  use?: { count: number; screens: number }
  onCommit: (value: string) => void
  onRevert: () => void
}) {
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

function TokenNodeInner({ data }: NodeProps) {
  const d = data as unknown as TokenNodeData
  const { tokenTheme } = useBoardSettings()
  const [draft, setDraft, clearDraft] = useTokenDraft(d.projectId)
  const [copied, setCopied] = useState<string | null>(null)
  const [copiedVal, setCopiedVal] = useState<string | null>(null)

  const tokens = useMemo(() => projectTokensOf(d.projectId), [d.projectId])
  const { used, undefinedVars } = useMemo(() => usageOf(d.projectId), [d.projectId])
  const useByName = useMemo(() => {
    const m = new Map<string, { count: number; screens: number }>()
    for (const u of used) m.set(u.name, { count: u.count, screens: u.screens.length })
    return m
  }, [used])

  const eff = (t: Token, mode: ThemeMode): string =>
    draft.values[t.name]?.[mode] ?? (mode === 'dark' ? t.dark : t.light)

  const flash = (what: string) => {
    setCopied(what)
    window.setTimeout(() => setCopied((c) => (c === what ? null : c)), 1600)
  }

  const copyText = (text: string, what: string) => {
    void navigator.clipboard.writeText(text).then(() => flash(what))
  }

  const copyVal = (name: string, text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedVal(name)
      window.setTimeout(() => setCopiedVal((c) => (c === name ? null : c)), 1200)
    })
  }

  const nDraft = draftSize(draft)

  return (
    <div className="token-node">
      <div
        className="token-frame nodrag"
        style={{ ['--frame-accent' as string]: PROJECT_ACCENT[d.projectId] ?? '#007aff' }}
      >
        <div className="token-accent" />
        <header className="token-head">
          <span className="token-dot" />
          <span className="token-head-text">
            <span className="token-title">{d.title}</span>
            <span className="token-sub">
              Design tokens · {tokens.length} biến{nDraft > 0 ? ` · ${nDraft} nháp` : ''}
            </span>
          </span>
        </header>

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
            onClick={() => copyText(swiftUITokens(d.projectId, d.title), 'swift')}
          >
            {copied === 'swift' ? 'Đã chép!' : 'SwiftUI'}
          </button>
          {nDraft > 0 && (
            <button type="button" className="token-btn is-danger" onClick={clearDraft} title="Xóa mọi nháp, về lại file">
              Bỏ nháp
            </button>
          )}
        </div>

        {undefinedVars.length > 0 && (
          <details className="token-section is-warn" open>
            <summary>
              <span>Chưa định nghĩa</span>
              <span className="token-count">{undefinedVars.length}</span>
            </summary>
            {undefinedVars.map((u) => (
              <div className="token-row" key={u.name} title={`dùng ở: ${u.screens.join(', ')}`}>
                <code className="token-name">{u.name}</code>
                <span className="token-val">
                  {u.count} chỗ · {u.screens.length} màn
                </span>
              </div>
            ))}
          </details>
        )}

        {GROUPS.map((g) => {
          const list = tokens.filter((t) => t.group === g.id)
          if (list.length === 0) return null
          return (
            <details className="token-section" key={g.id} open={g.id === 'color'}>
              <summary>
                <span>{g.title}</span>
                <span className="token-count">{list.length}</span>
              </summary>
              {g.id === 'color' ? (
                <div className="token-colors">
                  {list.map((t) => (
                    <ColorRow
                      key={t.name}
                      token={t}
                      draftLight={draft.values[t.name]?.light}
                      draftDark={draft.values[t.name]?.dark}
                      use={useByName.get(t.name) ?? { count: 0, screens: 0 }}
                      theme={tokenTheme}
                      onPick={(v) => setDraft(t.name, tokenTheme, v)}
                      onRevert={() => {
                        setDraft(t.name, 'light', '')
                        setDraft(t.name, 'dark', '')
                      }}
                      copied={copiedVal === t.name}
                      onCopy={(text) => copyVal(t.name, text)}
                    />
                  ))}
                </div>
              ) : (
                <div className="token-grid">
                  {list.map((t) => (
                    <SizeCell
                      key={t.name}
                      token={t}
                      value={eff(t, 'light')}
                      use={useByName.get(t.name) ?? { count: 0, screens: 0 }}
                      onCommit={(v) => setDraft(t.name, 'light', v.trim())}
                      onRevert={() => setDraft(t.name, 'light', '')}
                    />
                  ))}
                </div>
              )}
            </details>
          )
        })}
      </div>
    </div>
  )
}

export const TokenNode = memo(TokenNodeInner)
