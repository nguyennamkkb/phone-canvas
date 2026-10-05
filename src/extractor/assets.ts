import coreCss from '../screens/core.css?raw'
import palettesCss from '../screens/palettes.css?raw'
import vocabCss from '../screens/vocab.css?raw'
import iconsCss from '../screens/icons.css?raw'
import iconSetCss from '../screens/icon-set.css?raw'

import { componentMap } from '../components'
import { tokensCssFor } from '../projects/registry'

/**
 * Browser-side asset assembly, shared by the board iframes and the component
 * catalog. Vite-only (`?raw`): `scripts/export.ts` reads the same files off disk
 * instead, through the manifests.
 *
 * Stylesheet order is the contract: core scales → palettes → component
 * vocabulary → icons → project tokens → draft overrides, so a project can
 * override a global name and a draft previews over everything.
 */

export function stylesheetsFor(projectId?: string, extraCss?: string | null): string[] {
  const out = [coreCss, palettesCss, vocabCss, iconsCss, iconSetCss]
  const projectCss = projectId ? tokensCssFor(projectId) : null
  if (projectCss) out.push(projectCss)
  if (extraCss) out.push(extraCss)
  return out
}

/** id → html map for a project's components (what compose expands against) */
export function componentsFor(projectId?: string): Record<string, string> {
  return projectId ? componentMap(projectId) : {}
}
