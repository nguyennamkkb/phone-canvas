import { SCREEN_BY_ID } from '../screens'
import { BUILTIN_PROJECTS } from './builtin'
import type { ProjectDef } from './builtin'

/**
 * A project is a named board: a list of screen ids rendered as phone nodes.
 *
 * Screens stay single-source in `src/screens/manifest.ts`; a project only
 * references ids. Board layout (positions, devices, edges) is per-project
 * runtime state persisted in localStorage (see ./storage.ts), never here.
 */

export type Project = ProjectDef

export { BUILTIN_PROJECTS }

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
