import { SCREEN_FILES } from './manifest'
import type { ScreenFile } from './manifest'

/**
 * Vite needs every `?raw` import to be static, so the binding from id to markup
 * is written out here. The manifest stays the single source of identity; this
 * file only resolves it.
 *
 * Adding a screen:
 *   1. write `src/screens/<name>.html`
 *   2. add the entry to SCREEN_FILES in ./manifest.ts
 *   3. add its `?raw` import below and one line to RAW
 *
 * Step 3 is not optional — the check under RAW throws at startup if it is
 * missing, rather than rendering a blank frame.
 */

import splash from './splash.html?raw'
import onboardingWelcome from './onboarding-welcome.html?raw'
import onboardingCheckin from './onboarding-checkin.html?raw'
import onboardingInsights from './onboarding-insights.html?raw'
import onboardingReminder from './onboarding-reminder.html?raw'
import home from './home.html?raw'
import checkin from './checkin.html?raw'
import insights from './insights.html?raw'
import history from './history.html?raw'
import journal from './journal.html?raw'
import entry from './entry.html?raw'
import profile from './profile.html?raw'

const RAW: Record<string, string> = {
  splash,
  'onboarding-welcome': onboardingWelcome,
  'onboarding-checkin': onboardingCheckin,
  'onboarding-insights': onboardingInsights,
  'onboarding-reminder': onboardingReminder,
  home,
  checkin,
  insights,
  history,
  journal,
  entry,
  profile,
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
