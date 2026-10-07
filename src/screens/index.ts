import { SCREEN_BY_ID, SCREENS, useRegistryVersion } from '../projects/registry'
/**
 * App-facing screen registry. The screens themselves are discovered from
 * `project/<id>/screens/*.html` by `src/projects/registry.ts` — this module
 * only keeps the names the rest of the app already imports.
 */

export type { ScreenDef, ScreenFile } from '../projects/types'
export { SCREEN_BY_ID, SCREENS, useRegistryVersion }
