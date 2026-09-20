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
    id: 'onboarding',
    title: 'Onboarding',
    description: 'Splash + 7 màn giới thiệu đầu app',
    screenIds: [
      'splash',
      'onb-hello',
      'onb-checkin',
      'onb-insights',
      'onb-search',
      'onb-remind',
      'onb-listen',
      'onb-watch',
    ],
    coverId: 'onb-hello',
  },
  {
    id: 'mood-core',
    title: 'Mood Core',
    description: 'Luồng chính: home, check-in, journal, insights',
    screenIds: ['home', 'checkin', 'checkin-ladder', 'checkin-cards', 'checkin-dial', 'checkin-words', 'checkin-slider', 'insights', 'history', 'journal', 'entry', 'profile'],
    coverId: 'home',
  },
  {
    id: 'freud',
    title: 'Freud',
    description: 'Score, dashboard, mood stats',
    screenIds: ['freud-score', 'freud-home', 'mood-stats'],
    coverId: 'freud-home',
  },
]
