import tokensCss from '../screens/tokens.css?raw'
import iconsCss from '../screens/icons.css?raw'
import iconSetCss from '../screens/icon-set.css?raw'
import moodtrackerTokens from '../../project/moodtracker/tokens.css?raw'
import { componentMap } from '../components'

/**
 * Browser-side asset assembly, shared by the board iframes and the component
 * catalog. Vite-only (`?raw`): `scripts/export.ts` reads the same files off disk
 * instead, through the manifests.
 *
 * Stylesheet order is the contract: shared tokens → icons → project tokens →
 * draft overrides, so a project can override a global name and a draft previews
 * over everything.
 */

/** project override stylesheets, keyed by project id */
const PROJECT_CSS: Record<string, string> = {
  moodtracker: moodtrackerTokens,
}

export function stylesheetsFor(projectId?: string, extraCss?: string | null): string[] {
  const out = [tokensCss, iconsCss, iconSetCss]
  const projectCss = projectId ? PROJECT_CSS[projectId] : null
  if (projectCss) out.push(projectCss)
  if (extraCss) out.push(extraCss)
  return out
}

/** id → html map for a project's components (what compose expands against) */
export function componentsFor(projectId?: string): Record<string, string> {
  return projectId ? componentMap(projectId) : {}
}
