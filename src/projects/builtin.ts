/**
 * Built-in project definitions — plain data, no `?raw` imports.
 *
 * Kept free of Vite-only imports on purpose so `scripts/export.ts`
 * (plain Node) can import it directly. `projects.ts` adds the
 * screen-resolving helpers on top for the app.
 */

export type ProjectDef = {
  id: string
  title: string
  description?: string
  screenIds: string[]
  coverId?: string
  custom?: boolean
}

export const BUILTIN_PROJECTS: ProjectDef[] = [
  {
    id: 'moodtracker',
    title: 'Moodtracker',
    description: 'Mood journal: home',
    screenIds: ['home', 'journal', 'mood-calendar'],
  },
  {
    id: 'drivetiles',
    title: 'DriveTiles',
    description: 'CarPlay Widget Studio — 16 spec screens',
    screenIds: ['s01-splash', 's02-welcome', 's03-capabilities', 's04-compat', 's05-permissions', 's06-home', 's07-gallery', 's08-template-detail', 's09-editor', 's10-content', 's11-appearance', 's12-layout', 's13-preview', 's14-my-widgets', 's15-setup', 's16-settings'],
  },
]
