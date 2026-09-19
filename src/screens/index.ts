import { SCREEN_FILES } from './manifest'
import type { ScreenFile } from './manifest'

import getStarted from './get-started.html?raw'
import healthScore from './health-score.html?raw'
import journalDetail from './journal-detail.html?raw'
import journalList from './journal-list.html?raw'
import learningOverview from './learning-overview.html?raw'
import lessonDetails from './lesson-details.html?raw'
import makeSuccess from './make-success.html?raw'
import onboarding from './onboarding.html?raw'
import sheetActions from './sheet-actions.html?raw'
import sheetDetail from './sheet-detail.html?raw'
import sheetForm from './sheet-form.html?raw'
import taxiDriver from './taxi-driver.html?raw'

/**
 * Vite needs the `?raw` imports to be static, so the binding from id to markup
 * is written out here. The manifest stays the single source of identity; this
 * file only resolves it.
 */
const RAW: Record<string, string> = {
  'lesson-details': lessonDetails,
  'learning-overview': learningOverview,
  'health-score': healthScore,
  'sheet-actions': sheetActions,
  'sheet-detail': sheetDetail,
  'sheet-form': sheetForm,
  'get-started': getStarted,
  'taxi-driver': taxiDriver,
  'make-success': makeSuccess,
  'journal-list': journalList,
  'journal-detail': journalDetail,
  onboarding,
}

export type ScreenDef = ScreenFile & { html: string }

export const SCREENS: ScreenDef[] = SCREEN_FILES.map((entry) => {
  const html = RAW[entry.id]
  if (html === undefined) {
    throw new Error(
      `screen "${entry.id}" is in src/screens/manifest.ts but has no ?raw import in src/screens/index.ts`,
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
