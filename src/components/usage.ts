import { SCREEN_BY_ID } from '../screens'
import { BUILTIN_PROJECTS } from '../projects/builtin'
import { componentsOf } from './index'

/**
 * Component usage (component-system): which screens reference each component,
 * counted from `<!-- @component id -->` placeholders in screen markup — the
 * same signal the catalog shows and the lint uses to flag an unused component.
 */

export type ComponentUse = {
  id: string
  /** screen ids that reference it, in scan order */
  screens: string[]
  count: number
}

const PLACEHOLDER = /<!--\s*@component\s+([a-zA-Z0-9_-]+)\s*-->/g

function screenIdsOf(projectId: string): string[] {
  const builtin = BUILTIN_PROJECTS.find((p) => p.id === projectId)
  // a custom board mixes screens from anywhere — scan everything
  const ids = builtin ? builtin.screenIds : [...SCREEN_BY_ID.keys()]
  return ids.filter((id) => SCREEN_BY_ID.has(id))
}

/** pure core: count placeholders across screenId → markup, for a set of ids */
export function countUsage(
  sources: Record<string, string>,
  componentIds: string[],
): ComponentUse[] {
  const counts = new Map<string, { screens: string[]; count: number }>()
  for (const [screenId, html] of Object.entries(sources)) {
    PLACEHOLDER.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = PLACEHOLDER.exec(html)) !== null) {
      let entry = counts.get(m[1])
      if (!entry) {
        entry = { screens: [], count: 0 }
        counts.set(m[1], entry)
      }
      if (!entry.screens.includes(screenId)) entry.screens.push(screenId)
      entry.count += 1
    }
  }
  return componentIds.map((id) => {
    const entry = counts.get(id)
    return { id, screens: entry?.screens ?? [], count: entry?.count ?? 0 }
  })
}

export function componentUsage(projectId: string): ComponentUse[] {
  const sources: Record<string, string> = {}
  for (const sid of screenIdsOf(projectId)) sources[sid] = SCREEN_BY_ID.get(sid)?.html ?? ''
  return countUsage(sources, componentsOf(projectId).map((c) => c.id))
}
