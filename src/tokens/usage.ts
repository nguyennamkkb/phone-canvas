import { SCREEN_BY_ID } from '../screens'
import { BUILTIN_PROJECTS } from '../projects/builtin'
import { tokensOf } from './tokens'

/**
 * v2 audit: which tokens a project's screens actually reference.
 *
 * Counts direct `var(--x)` uses in screen markup only — the class vocabulary
 * (.card, .btn…) resolves its vars in css, so a token can be alive through a
 * class without appearing here. A zero here means "no screen names it
 * directly", which is still the right signal for dead-token cleanup, and a
 * name used but never defined (the old --sage-wash bug) is always an error.
 */

export type TokenUse = {
  name: string
  /** screen ids, most-used first by construction */
  screens: string[]
  count: number
}

const VAR_RE = /var\(\s*(--[a-z0-9-]+)/g

/** element-scoped or chrome vars — not design tokens, never reported */
const IGNORED = new Set(['--icon'])
const IGNORED_PREFIX = ['--device-', '--safe-', '--status-']

function screenIdsOf(projectId: string): string[] {
  const builtin = BUILTIN_PROJECTS.find((p) => p.id === projectId)
  // a custom board mixes screens from anywhere — scan everything
  const ids = builtin ? builtin.screenIds : [...SCREEN_BY_ID.keys()]
  return ids.filter((id) => SCREEN_BY_ID.has(id))
}

function isTokenVar(name: string): boolean {
  if (IGNORED.has(name)) return false
  return !IGNORED_PREFIX.some((p) => name.startsWith(p))
}

export function usageOf(projectId: string): { used: TokenUse[]; undefinedVars: TokenUse[] } {
  const known = new Set(tokensOf(projectId).map((t) => t.name))
  const counts = new Map<string, { screens: Set<string>; count: number }>()

  for (const sid of screenIdsOf(projectId)) {
    const html = SCREEN_BY_ID.get(sid)?.html ?? ''
    VAR_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = VAR_RE.exec(html)) !== null) {
      const name = m[1]
      if (!isTokenVar(name)) continue
      let e = counts.get(name)
      if (!e) {
        e = { screens: new Set(), count: 0 }
        counts.set(name, e)
      }
      e.screens.add(sid)
      e.count += 1
    }
  }

  const used: TokenUse[] = []
  const undefinedVars: TokenUse[] = []
  for (const [name, e] of counts) {
    const u: TokenUse = { name, screens: [...e.screens], count: e.count }
    if (known.has(name)) used.push(u)
    else undefinedVars.push(u)
  }
  const byCount = (a: TokenUse, b: TokenUse) => b.count - a.count
  used.sort(byCount)
  undefinedVars.sort(byCount)
  return { used, undefinedVars }
}
