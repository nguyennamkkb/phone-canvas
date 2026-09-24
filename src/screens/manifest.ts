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
  /**
   * Default canvas device for this screen (an id in src/frame/devices.ts,
   * e.g. 'ipad-11'). Fresh boards open the node at this width via
   * deviceForScreen; per-node changes in NodePicker still win afterwards.
   * Optional on purpose: absent means the phone default, so every existing
   * entry stays valid and lifecycle scripts must carry this field through
   * whole-entry moves (rename) rather than rebuilding entries without it.
   */
  deviceId?: string
}

export const SCREEN_FILES: ScreenFile[] = [
  { id: 's16-settings', title: 'S16 · Settings', file: 'project/drivetiles/s16-settings.html' },
  { id: 's15-setup', title: 'S15 · Setup Guide', file: 'project/drivetiles/s15-setup.html' },
  { id: 's14-my-widgets', title: 'S14 · My Widgets', file: 'project/drivetiles/s14-my-widgets.html' },
  { id: 's13-preview', title: 'S13 · Preview', file: 'project/drivetiles/s13-preview.html' },
  { id: 's12-layout', title: 'S12 · Layout', file: 'project/drivetiles/s12-layout.html' },
  { id: 's11-appearance', title: 'S11 · Appearance', file: 'project/drivetiles/s11-appearance.html' },
  { id: 's10-content', title: 'S10 · Content', file: 'project/drivetiles/s10-content.html' },
  { id: 's09-editor', title: 'S09 · Editor', file: 'project/drivetiles/s09-editor.html' },
  { id: 's08-template-detail', title: 'S08 · Template Detail', file: 'project/drivetiles/s08-template-detail.html' },
  { id: 's07-gallery', title: 'S07 · Gallery', file: 'project/drivetiles/s07-gallery.html' },
  { id: 's06-home', title: 'S06 · Home', file: 'project/drivetiles/s06-home.html' },
  { id: 's05-permissions', title: 'S05 · Permissions', file: 'project/drivetiles/s05-permissions.html' },
  { id: 's04-compat', title: 'S04 · Compatibility', file: 'project/drivetiles/s04-compat.html' },
  { id: 's03-capabilities', title: 'S03 · Capabilities', file: 'project/drivetiles/s03-capabilities.html' },
  { id: 's02-welcome', title: 'S02 · Welcome', file: 'project/drivetiles/s02-welcome.html' },
  { id: 's01-splash', title: 'S01 · Splash', file: 'project/drivetiles/s01-splash.html', lightStatusBar: true },
  { id: 'mood-calendar', title: 'Mood Calendar', file: 'project/moodtracker/mood-calendar.html' },
{ id: 'journal', title: 'Journal', file: 'project/moodtracker/journal.html' },
{ id: 'home', title: 'Home · Today', file: 'project/moodtracker/home.html' },
]
