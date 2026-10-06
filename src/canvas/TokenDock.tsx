import { useCallback, useMemo, useState } from 'react'
import { ChevronsLeft, ChevronDown, PanelLeftOpen, X } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

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
      <aside className="token-dock is-collapsed flex flex-col items-center gap-2 py-2" aria-label="Design tokens (đang thu gọn)">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="token-dock-expand"
              onClick={() => {
                dismissCoach()
                onToggle()
              }}
              aria-label="Hiện bảng tokens"
            >
              <PanelLeftOpen />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Hiện bảng tokens</TooltipContent>
        </Tooltip>
        <span className="token-dock-vertical" title={`${tokens.length} biến${nDraft > 0 ? ` · ${nDraft} nháp` : ''}`}>
          Design
        </span>
        {coachVisible && (
          <div className="token-dock-coach rounded-md border bg-popover p-2 text-xs shadow-md" role="status">
            Bảng tokens dời ra đây — bấm ◈ để mở.
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="token-dock-coach-close h-6 w-6"
              onClick={dismissCoach}
              aria-label="Đã hiểu"
            >
              <X />
            </Button>
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
        <header className="token-head flex items-center gap-2">
          <span className="token-dot" />
          <span className="token-head-text flex min-w-0 flex-1 flex-col">
            <span className="token-title truncate text-sm font-semibold">{title}</span>
            <span className="token-sub truncate text-xs text-muted-foreground">
              {tab === 'tokens'
                ? `Design tokens · ${tokens.length} biến${nDraft > 0 ? ` · ${nDraft} nháp` : ''}`
                : 'Components · bảng component của dự án'}
            </span>
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="token-dock-collapse h-8 w-8 shrink-0"
                onClick={onToggle}
                aria-label="Thu gọn bảng design system"
              >
                <ChevronsLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Thu gọn bảng design system</TooltipContent>
          </Tooltip>
        </header>

        <div className="dock-tabs flex gap-1" role="tablist" aria-label="Bảng design system">
          <Button
            type="button"
            role="tab"
            aria-selected={tab === 'tokens'}
            variant={tab === 'tokens' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(tab === 'tokens' && 'is-on')}
            onClick={() => onTabChange('tokens')}
          >
            Tokens
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={tab === 'components'}
            variant={tab === 'components' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(tab === 'components' && 'is-on')}
            onClick={() => onTabChange('components')}
          >
            Components
          </Button>
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
              <Collapsible defaultOpen className="token-section is-warn">
                <CollapsibleTrigger className="group flex w-full items-center gap-2 py-1 text-left text-sm font-medium text-destructive">
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=closed]:-rotate-90" />
                  <span>Chưa định nghĩa</span>
                  <Badge variant="destructive" className="token-count ml-auto">
                    {undefinedVars.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {undefinedVars.map((u) => (
                    <div className="token-row flex items-center gap-2" key={u.name} title={`dùng ở: ${u.screens.join(', ')}`}>
                      <code className="token-name min-w-0 flex-1 truncate font-mono text-xs text-destructive">{u.name}</code>
                      <span className="token-val shrink-0 text-xs text-muted-foreground">
                        {u.count} chỗ · {u.screens.length} màn
                      </span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {GROUPS.map((g) => {
              const list = tokens.filter((t) => t.group === g.id)
              if (list.length === 0) return null
              return (
                <Collapsible defaultOpen={g.id === 'color'} className="token-section" key={g.id}>
                  <CollapsibleTrigger className="group flex w-full items-center gap-2 py-1 text-left text-sm font-medium">
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=closed]:-rotate-90" />
                    <span>{g.title}</span>
                    <Badge variant="secondary" className="token-count ml-auto">
                      {list.length}
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
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
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </>
        )}
      </div>
    </aside>
  )
}
