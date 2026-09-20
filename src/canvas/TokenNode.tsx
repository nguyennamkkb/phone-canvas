import { memo, useMemo, useState } from 'react'
import type { Node, NodeProps } from '@xyflow/react'
import { projectTokensOf } from '../tokens/tokens'
import type { ThemeMode, Token, TokenGroup } from '../tokens/tokens'
import { draftSize, useTokenDraft } from '../tokens/store'
import { usageOf } from '../tokens/usage'
import { useBoardSettings } from './BoardContext'
import type { PhoneFlowNode } from './PhoneNode'
import { TokenColorRow } from './token-table/TokenColorRow'
import { TokenSizeCell } from './token-table/TokenSizeCell'
import { TokenDraftActions } from './token-table/TokenDraftActions'

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

function TokenNodeInner({ data }: NodeProps) {
  const d = data as unknown as TokenNodeData
  const { tokenTheme } = useBoardSettings()
  const [draft, setDraft, clearDraft] = useTokenDraft(d.projectId)
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

        <TokenDraftActions
          projectId={d.projectId}
          projectTitle={d.title}
          draft={draft}
          onClear={clearDraft}
        />

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
                    <TokenColorRow
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
                    <TokenSizeCell
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
