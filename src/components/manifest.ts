/**
 * The single list of components (component-system).
 *
 * A component is a reusable HTML fragment owned by one project. Every
 * component has exactly one stable id, declared here and nowhere else. The app
 * binds each id to its `?raw` import (`src/components/index.ts`); the exporter
 * and the lint read this same list and the files off disk.
 *
 * Nothing derives an identity from a filename or from an array index — those
 * drift, and an id that moves silently overwrites another component in the
 * registry and lets two screens render different markup under one name.
 *
 * `file` is relative to the repo root. Components live next to their project:
 * `project/<id>/components/<component-id>.html`.
 *
 * A component is a *fragment*: it must not contain `.screen`/`.body`. It is
 * spliced into a screen's `.viewport` by `<!-- @component <id> -->`.
 *
 * Empty is a valid state.
 */

export type ComponentFile = {
  /** stable, unique across the whole registry, used for canvas identity */
  id: string
  /** what the catalog calls it */
  title: string
  /** the project that owns it — components never cross projects */
  project: string
  /** file relative to the repo root — the implementation, not the identity */
  file: string
}

export const COMPONENT_FILES: ComponentFile[] = [
  {
    id: 'chev',
    title: 'Chevron',
    project: 'moodtracker',
    file: 'project/moodtracker/components/chev.html',
  },
  {
    id: 'mt-tracker-row',
    title: 'Tracker row',
    project: 'moodtracker',
    file: 'project/moodtracker/components/mt-tracker-row.html',
  },
  {
    id: 'dt-back',
    title: 'DriveTiles back chevron',
    project: 'drivetiles',
    file: 'project/drivetiles/components/dt-back.html',
  },
  {
    id: 'dt-chev',
    title: 'DriveTiles disclosure chevron',
    project: 'drivetiles',
    file: 'project/drivetiles/components/dt-chev.html',
  },
]
