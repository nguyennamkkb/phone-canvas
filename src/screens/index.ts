import { SCREEN_FILES } from './manifest'
import type { ScreenFile } from './manifest'

/**
 * Vite needs every `?raw` import to be static, so the binding from id to markup
 * is written out here. The manifest stays the single source of identity; this
 * file only resolves it.
 *
 * Adding a screen:
 *   1. write `project/<project>/<name>.html`
 *   2. add the entry to SCREEN_FILES in ./manifest.ts
 *   3. add its `?raw` import below and one line to RAW
 *
 * Step 3 is not optional — the check under RAW throws at startup if it is
 * missing, rather than rendering a blank frame.
 */

import splash from '../../project/onboarding/splash.html?raw'
import onbHello from '../../project/onboarding/onb-hello.html?raw'
import onbCheckin from '../../project/onboarding/onb-checkin.html?raw'
import onbInsights from '../../project/onboarding/onb-insights.html?raw'
import onbSearch from '../../project/onboarding/onb-search.html?raw'
import onbRemind from '../../project/onboarding/onb-remind.html?raw'
import onbListen from '../../project/onboarding/onb-listen.html?raw'
import onbWatch from '../../project/onboarding/onb-watch.html?raw'
import home from '../../project/mood-core/home.html?raw'
import checkin from '../../project/mood-core/checkin.html?raw'
import insights from '../../project/mood-core/insights.html?raw'
import history from '../../project/mood-core/history.html?raw'
import journal from '../../project/mood-core/journal.html?raw'
import entry from '../../project/mood-core/entry.html?raw'
import profile from '../../project/mood-core/profile.html?raw'
import freudScore from '../../project/freud/freud-score.html?raw'
import freudHome from '../../project/freud/freud-home.html?raw'
import moodStats from '../../project/freud/mood-stats.html?raw'

const RAW: Record<string, string> = {
  splash,
  'onb-hello': onbHello,
  'onb-checkin': onbCheckin,
  'onb-insights': onbInsights,
  'onb-search': onbSearch,
  'onb-remind': onbRemind,
  'onb-listen': onbListen,
  'onb-watch': onbWatch,
  home,
  checkin,
  insights,
  history,
  journal,
  entry,
  profile,
  'freud-score': freudScore,
  'freud-home': freudHome,
  'mood-stats': moodStats,
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
