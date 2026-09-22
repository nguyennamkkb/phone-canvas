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
    screenIds: ['home'],
  },
]
