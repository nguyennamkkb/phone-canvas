import { useCallback, useMemo, useState } from 'react'
import { projectTokensOf } from '../tokens/tokens'
import type { ThemeMode, Token, TokenGroup } from '../tokens/tokens'
import { draftSize, useTokenDraft } from '../tokens/store'
import { usageOf } from '../tokens/usage'
import { loadDockCoachSeen, saveDockCoachSeen } from '../projects/storage'
import { useBoardSettings } from './BoardContext'
import { TokenColorRow } from './token-table/TokenColorRow'
import { TokenSizeCell } from './token-table/TokenSizeCell'
import { TokenDraftActions } from './token-table/TokenDraftActions'
import { ComponentDock } from '../components/ComponentDock'

export type DockTab = 'tokens' | 'components'

export type TokenDockProps = {
  projectId: string
  title: string
  collapsed: boolean
  onToggle: () => void
  /** design-system dock: which table is showing (component-system 4.3) */
  tab: DockTab
  onTabChange: (tab: DockTab) => void
}

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

/**
 * Dock trái (2.1) — "design system" của project: hai bảng Tokens và Components
 * (component-system 4.3). Render ngoài canvas nên không lọt vào
 * fit-view/minimap và không bị kéo lạc.
 */
export function TokenDock({
  projectId,
  title,
  collapsed,
  onToggle,
  tab,
  onTabChange,
}: TokenDockProps) {
  const { tokenTheme } = useBoardSettings()
  const [draft, setDraft, clearDraft] = useTokenDraft(projectId)
  const [copiedVal, setCopiedVal] = useState<string | null>(null)
  const [coachVisible, setCoachVisible] = useState<boolean>(() => !loadDockCoachSeen())

  const dismissCoach = useCallback(() => {
    saveDockCoachSeen()
    setCoachVisible(false)
  }, [])

  const tokens = useMemo(() => projectTokensOf(projectId), [projectId])
  const { used, undefinedVars } = useMemo(() => usageOf(projectId), [projectId])
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

  if (collapsed) {
    return (
      <aside className="token-dock is-collapsed" aria-label="Design tokens (đang thu gọn)">
        <button
          type="button"
          className="token-dock-expand"
          onClick={() => {
            dismissCoach()
            onToggle()
          }}
          title="Hiện bảng tokens"
          aria-label="Hiện bảng tokens"
        >
          ◈
        </button>
        <span className="token-dock-vertical" title={`${tokens.length} biến${nDraft > 0 ? ` · ${nDraft} nháp` : ''}`}>
          Design
        </span>
        {coachVisible && (
          <div className="token-dock-coach" role="status">
            Bảng tokens dời ra đây — bấm ◈ để mở.
            <button type="button" className="token-dock-coach-close" onClick={dismissCoach} aria-label="Đã hiểu">
              ×
            </button>
          </div>
        )}
      </aside>
    )
  }

  return (
    <aside className="token-dock" aria-label={`Design system · ${title}`}>
      <div
        className="token-frame token-dock-frame"
        style={{ ['--frame-accent' as string]: PROJECT_ACCENT[projectId] ?? '#007aff' }}
      >
        <div className="token-accent" />
        <header className="token-head">
          <span className="token-dot" />
          <span className="token-head-text">
            <span className="token-title">{title}</span>
            <span className="token-sub">
              {tab === 'tokens'
                ? `Design tokens · ${tokens.length} biến${nDraft > 0 ? ` · ${nDraft} nháp` : ''}`
                : 'Components · bảng component của dự án'}
            </span>
          </span>
          <button
            type="button"
            className="token-dock-collapse"
            onClick={onToggle}
            title="Thu gọn bảng design system"
            aria-label="Thu gọn bảng design system"
          >
            «
          </button>
        </header>

        <div className="dock-tabs" role="tablist" aria-label="Bảng design system">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'tokens'}
            className={tab === 'tokens' ? 'is-on' : ''}
            onClick={() => onTabChange('tokens')}
          >
            Tokens
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'components'}
            className={tab === 'components' ? 'is-on' : ''}
            onClick={() => onTabChange('components')}
          >
            Components
          </button>
        </div>

        {tab === 'components' ? (
          <ComponentDock projectId={projectId} theme={tokenTheme} />
        ) : (
          <>
            <TokenDraftActions
              projectId={projectId}
              projectTitle={title}
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
          </>
        )}
      </div>
    </aside>
  )
}
