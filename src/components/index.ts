import { COMPONENTS, COMPONENTS_BY_ID, componentMap, componentsOf } from '../projects/registry'

/**
 * App-facing component registry. Components are discovered from
 * `project/<id>/components/*.html` by `src/projects/registry.ts`.
 *
 * Vite-side only (`?raw` imports through the glob). `scripts/export.ts` reads
 * the same files off disk through `scripts/scan-projects.ts`.
 */

export type { ComponentDef, ComponentFile } from '../projects/types'
export { COMPONENTS, COMPONENTS_BY_ID, componentMap, componentsOf }
