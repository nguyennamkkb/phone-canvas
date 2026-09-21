import { SCREEN_FILES } from './manifest'
import type { ScreenFile } from './manifest'
import { rawFor } from './generated'

/**
 * Single source of truth is manifest.ts; html comes from generated.ts
 * (run `npm run screens:sync` after editing the manifest).
 */

export type ScreenDef = ScreenFile & { html: string }

export const SCREENS: ScreenDef[] = SCREEN_FILES.map((entry) => {
  const html = rawFor(entry.id)
  if (html === undefined) {
    throw new Error(
      `screen "${entry.id}" is in src/screens/manifest.ts but missing in src/screens/generated.ts — run npm run screens:sync`,
    )
  }
  return { ...entry, html }
})

// A duplicate id would silently drop a screen from the map and hand two canvas
// nodes the same identity. Refuse to start instead of half-working.
const seen = new Set<string>()
for (const screen of SCREENS) {
  if (seen.has(screen.id)) {
    throw new Error(`duplicate screen id "${screen.id}" in src/screens/manifest.ts`)
  }
  seen.add(screen.id)
}

export const SCREEN_BY_ID = new Map(SCREENS.map((screen) => [screen.id, screen]))
