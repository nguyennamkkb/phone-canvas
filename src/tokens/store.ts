import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from './tokens'

/**
 * Board-side token state (v2): a draft override layer + the board color mode.
 *
 * The file on disk stays the source of truth — the draft only previews.
 * Promoting is "Copy CSS" on the token table, then paste into
 * project/<id>/tokens.css (by hand or by agent). No backend, nothing to sync.
 *
 * Both hooks no-op on an empty project id (custom boards resolve none yet).
 */

export type DraftValues = Record<string, { light?: string; dark?: string }>
export type TokenDraft = { values: DraftValues }

const DRAFT_PREFIX = 'pc.tokens.draft.'
const THEME_PREFIX = 'pc.tokens.theme.'
const EVENT = 'pc:tokens'

const EMPTY: TokenDraft = { values: {} }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode — board just becomes session-only */
  }
}

function notify(projectId: string): void {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: projectId }))
}

function useProjectEvent(projectId: string, reload: () => void): void {
  useEffect(() => {
    if (!projectId) return
    const onEvent = (e: Event) => {
      if ((e as CustomEvent).detail === projectId) reload()
    }
    window.addEventListener(EVENT, onEvent)
    return () => window.removeEventListener(EVENT, onEvent)
  }, [projectId, reload])
}

export function loadDraft(projectId: string): TokenDraft {
  if (!projectId) return EMPTY
  const d = read<TokenDraft>(DRAFT_PREFIX + projectId, EMPTY)
  return d && typeof d.values === 'object' ? d : EMPTY
}

/** set one token value for one mode (value '' clears that cell) */
export function useTokenDraft(projectId: string): [TokenDraft, (name: string, mode: ThemeMode, value: string) => void, () => void] {
  const [draft, setDraft] = useState<TokenDraft>(() => loadDraft(projectId))
  const reload = useCallback(() => setDraft(loadDraft(projectId)), [projectId])
  useProjectEvent(projectId, reload)

  const set = useCallback(
    (name: string, mode: ThemeMode, value: string) => {
      if (!projectId) return
      const next: TokenDraft = {
        values: { ...loadDraft(projectId).values },
      }
      const cell = { ...(next.values[name] ?? {}) }
      if (value) cell[mode] = value
      else delete cell[mode]
      if (Object.keys(cell).length > 0) next.values[name] = cell
      else delete next.values[name]
      write(DRAFT_PREFIX + projectId, next)
      setDraft(next)
      notify(projectId)
    },
    [projectId],
  )

  const clear = useCallback(() => {
    if (!projectId) return
    try {
      localStorage.removeItem(DRAFT_PREFIX + projectId)
    } catch {
      /* ignore */
    }
    setDraft(EMPTY)
    notify(projectId)
  }, [projectId])

  return [draft, set, clear]
}

export function loadTheme(projectId: string): ThemeMode {
  if (!projectId) return 'light'
  return read<ThemeMode>(THEME_PREFIX + projectId, 'light') === 'dark' ? 'dark' : 'light'
}

export function useTokenTheme(projectId: string): [ThemeMode, (mode: ThemeMode) => void] {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme(projectId))
  const reload = useCallback(() => setTheme(loadTheme(projectId)), [projectId])
  useProjectEvent(projectId, reload)

  const set = useCallback(
    (mode: ThemeMode) => {
      if (!projectId) return
      write(THEME_PREFIX + projectId, mode)
      setTheme(mode)
      notify(projectId)
    },
    [projectId],
  )

  return [theme, set]
}

/**
 * Draft as css, layered after everything (wins over .app-mood too:
 * equal specificity, later in source order).
 */
export function draftCss(draft: TokenDraft): string | null {
  const light: string[] = []
  const dark: string[] = []
  for (const [name, cell] of Object.entries(draft.values)) {
    if (cell.light) light.push(`${name}: ${cell.light};`)
    if (cell.dark) dark.push(`${name}: ${cell.dark};`)
  }
  const out: string[] = []
  if (light.length > 0) out.push(`:root{${light.join('')}}`)
  if (dark.length > 0) out.push(`:root[data-theme='dark']{${dark.join('')}}`)
  return out.length > 0 ? out.join('\n') : null
}

/** css block to paste into project/<id>/tokens.css when promoting a draft */
export function promoteCss(draft: TokenDraft): string {
  const light: string[] = []
  const dark: string[] = []
  for (const [name, cell] of Object.entries(draft.values)) {
    if (cell.light) light.push(`  ${name}: ${cell.light};`)
    if (cell.dark) dark.push(`  ${name}: ${cell.dark};`)
  }
  const out: string[] = []
  if (light.length > 0) out.push(`:root {\n${light.join('\n')}\n}`)
  if (dark.length > 0) out.push(`:root[data-theme='dark'] {\n${dark.join('\n')}\n}`)
  return out.join('\n\n')
}

export function draftSize(draft: TokenDraft): number {
  return Object.keys(draft.values).length
}
