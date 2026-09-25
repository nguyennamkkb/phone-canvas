import { PROJECTS, SCREEN_BY_ID } from './registry'
import type { ProjectDef } from './types'

/**
 * A project is a named board: a list of screen ids rendered as phone nodes.
 *
 * Projects and their screens come from the project folders (see
 * `./registry.ts` and `docs/screen-authoring.md`); this module only adds the
 * resolving helpers the app uses on top of that registry. Board layout
 * (positions, devices, edges) is per-project runtime state persisted in
 * localStorage (see ./storage.ts), never here.
 */

export type Project = ProjectDef

export const BUILTIN_PROJECTS = PROJECTS

/** drop unknown ids so a renamed screen never breaks a whole project */
export function resolveScreens(project: Project): string[] {
  return project.screenIds.filter((id) => SCREEN_BY_ID.has(id))
}

/** builtin project that owns a screen, or null (custom projects own none yet) */
export function projectOfScreen(screenId: string): Project | null {
  return BUILTIN_PROJECTS.find((p) => p.screenIds.includes(screenId)) ?? null
}

export function coverOf(project: Project): string | null {
  const ids = resolveScreens(project)
  if (ids.length === 0) return null
  if (project.coverId && ids.includes(project.coverId)) return project.coverId
  return ids[0] ?? null
}

export function countOf(project: Project): number {
  return resolveScreens(project).length
}
