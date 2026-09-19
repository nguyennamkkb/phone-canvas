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
 */

export type ScreenFile = {
  /** stable, unique, used for canvas identity and export filenames */
  id: string
  /** what the board and the panel call it */
  title: string
  /** file in src/screens/ — the implementation, not the identity */
  file: string
  /**
   * The screen's own background is dark where the status bar sits — a dark
   * header, or a sheet's scrim. Without this the OS chrome stays black-on-dark.
   */
  lightStatusBar?: boolean
}

export const SCREEN_FILES: ScreenFile[] = [
  { id: 'lesson-details', title: 'Lesson · Details', file: 'lesson-details.html' },
  { id: 'learning-overview', title: 'Learning · Overview', file: 'learning-overview.html' },
  { id: 'health-score', title: 'Health · Score', file: 'health-score.html' },
  { id: 'sheet-actions', title: 'Sheet · Actions', file: 'sheet-actions.html' },
  { id: 'sheet-detail', title: 'Sheet · Detail', file: 'sheet-detail.html' },
  { id: 'sheet-form', title: 'Sheet · Form', file: 'sheet-form.html' },
  { id: 'get-started', title: 'Onboarding 1 · Get Started', file: 'get-started.html' },
  { id: 'taxi-driver', title: 'Onboarding 2 · Taxi Driver', file: 'taxi-driver.html' },
  { id: 'make-success', title: 'Onboarding 3 · Make a Success', file: 'make-success.html' },
  { id: 'journal-list', title: 'Journal · List', file: 'journal-list.html' },
  { id: 'journal-detail', title: 'Journal · Detail', file: 'journal-detail.html' },
  { id: 'onboarding', title: 'Onboarding (sample)', file: 'onboarding.html' },
]
