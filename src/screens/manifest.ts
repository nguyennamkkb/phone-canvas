/**
 * The single list of screens.
 *
 * Every screen has exactly one stable id, declared here and nowhere else. The
 * app binds each id to its `?raw` import (`src/screens/index.ts`); the exporter
 * reads this same list and the files off disk (`scripts/export.ts`).
 *
 * Nothing derives an identity from a filename or from an array index. Those
 * drift: rename a file, reorder the list, and the id moves — and an id that
 * moves silently overwrites another screen in the registry, drops it from the
 * board, and lets two canvas nodes claim the same identity.
 *
 * This file is plain data on purpose, so Node can import it directly and there
 * is no second copy to keep in sync.
 *
 * Screens live in per-project folders at the repo root (`project/<id>/`);
 * `file` is relative to the repo root. Shared stylesheets (`tokens.css`,
 * `icons.css`, `icon-set.css`) stay in `src/screens/`.
 *
 * Empty is a valid state. The board opens with no screens, and says so.
 */

export type ScreenFile = {
  /** stable, unique, used for canvas identity and export filenames */
  id: string
  /** what the board and the panel call it */
  title: string
  /** file relative to the repo root — the implementation, not the identity */
  file: string
  /**
   * The screen's own background is dark where the status bar sits — a dark
   * header, or a sheet's scrim. Without this the OS chrome stays black-on-dark.
   */
  lightStatusBar?: boolean
}

export const SCREEN_FILES: ScreenFile[] = [
  { id: 'splash', title: 'Splash', file: 'project/onboarding/splash.html', lightStatusBar: false },
  { id: 'onb-hello', title: 'Onboarding 1 · Hello', file: 'project/onboarding/onb-hello.html' },
  { id: 'onb-checkin', title: 'Onboarding 2 · Check in', file: 'project/onboarding/onb-checkin.html' },
  { id: 'onb-insights', title: 'Onboarding 3 · Patterns', file: 'project/onboarding/onb-insights.html' },
  { id: 'onb-search', title: 'Onboarding 4 · Search', file: 'project/onboarding/onb-search.html' },
  { id: 'onb-remind', title: 'Onboarding 5 · Reminders', file: 'project/onboarding/onb-remind.html' },
  { id: 'onb-listen', title: 'Onboarding 6 · Listen', file: 'project/onboarding/onb-listen.html' },
  { id: 'onb-watch', title: 'Onboarding 7 · Watch', file: 'project/onboarding/onb-watch.html' },
  { id: 'home', title: 'Home · Today', file: 'project/mood-core/home.html' },
  { id: 'checkin', title: 'Check in', file: 'project/mood-core/checkin.html' },
  { id: 'checkin-ladder', title: 'Check-in · Ladder', file: 'project/mood-core/checkin-ladder.html' },
  { id: 'checkin-cards', title: 'Check-in · Cards', file: 'project/mood-core/checkin-cards.html' },
  { id: 'checkin-dial', title: 'Check-in · Dial', file: 'project/mood-core/checkin-dial.html' },
  { id: 'checkin-words', title: 'Check-in · Words', file: 'project/mood-core/checkin-words.html' },
  { id: 'checkin-slider', title: 'Check-in · Slider', file: 'project/mood-core/checkin-slider.html' },
  { id: 'insights', title: 'Insights', file: 'project/mood-core/insights.html' },
  { id: 'history', title: 'History', file: 'project/mood-core/history.html' },
  { id: 'journal', title: 'Journal', file: 'project/mood-core/journal.html' },
  { id: 'entry', title: 'Entry', file: 'project/mood-core/entry.html' },
  { id: 'profile', title: 'Profile', file: 'project/mood-core/profile.html' },
  { id: 'freud-score', title: 'Freud · Score', file: 'project/freud/freud-score.html' },
  { id: 'freud-home', title: 'Freud · Dashboard', file: 'project/freud/freud-home.html' },
  { id: 'mood-stats', title: 'Freud · Mood Stats', file: 'project/freud/mood-stats.html' },
]
