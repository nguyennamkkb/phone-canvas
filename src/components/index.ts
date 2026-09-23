import { COMPONENT_FILES } from './manifest'
import type { ComponentFile } from './manifest'
import { rawFor } from './generated'

/**
 * Component registry (component-system). Single source of truth is
 * manifest.ts; html comes from generated.ts (`npm run components:sync` after
 * editing the manifest).
 *
 * Vite-side only (`?raw` imports). `scripts/export.ts` must not import this —
 * it reads the same files off disk through `manifest.ts`.
 */

export type ComponentDef = ComponentFile & { html: string }

export const COMPONENTS: ComponentDef[] = COMPONENT_FILES.map((entry) => {
  const html = rawFor(entry.id)
  if (html === undefined) {
    throw new Error(
      `component "${entry.id}" is in src/components/manifest.ts but missing in src/components/generated.ts — run npm run components:sync`,
    )
  }
  return { ...entry, html }
})

// A duplicate id would silently drop a component from the map and let two
// screens render different markup under one name. Refuse to start instead.
const seen = new Set<string>()
for (const component of COMPONENTS) {
  if (seen.has(component.id)) {
    throw new Error(`duplicate component id "${component.id}" in src/components/manifest.ts`)
  }
  seen.add(component.id)
}

export const COMPONENTS_BY_ID = new Map(COMPONENTS.map((component) => [component.id, component]))

/** components owned by a project, in manifest order */
export function componentsOf(projectId: string): ComponentDef[] {
  return COMPONENTS.filter((component) => component.project === projectId)
}

/**
 * The id → html map `composeScreenDoc` expands `@component` against. Scoped to
 * one project: components never cross projects, so a foreign reference reads
 * as missing rather than silently resolving.
 */
export function componentMap(projectId: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const component of componentsOf(projectId)) out[component.id] = component.html
  return out
}
