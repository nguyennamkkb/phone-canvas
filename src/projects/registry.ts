import { deriveRegistry } from './derive'
import type { ComponentDef, DeriveInput, ProjectDef, ScreenDef } from './types'

/**
 * The browser reader for the project-folder convention.
 *
 * `import.meta.glob` is the whole watcher: Vite re-evaluates these globs when
 * a file is added or removed under `project/`, so the board follows the disk
 * without a restart, a codegen run, or a hand-maintained manifest.
 *
 * `scripts/scan-projects.ts` reads the same tree off disk through the same
 * `deriveRegistry` — neither side owns a rule.
 */

const screenFiles = import.meta.glob('/project/*/screens/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const componentFiles = import.meta.glob('/project/*/components/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** `project/<id>/*.html` only — `*` is one path segment, so lanes never match */
const strayFiles = import.meta.glob('/project/*/*.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const projectJsonFiles = import.meta.glob('/project/*/project.json', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const tokensCssFiles = import.meta.glob('/project/*/tokens.css', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** glob keys are root-absolute (`/project/…`); derive paths are repo-relative */
function withoutLeadingSlash(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [file, content] of Object.entries(files)) out[file.replace(/^\//, '')] = content
  return out
}

export function buildRegistryInput(): DeriveInput {
  return {
    screens: withoutLeadingSlash(screenFiles),
    components: withoutLeadingSlash(componentFiles),
    strays: withoutLeadingSlash(strayFiles),
    projectJson: withoutLeadingSlash(projectJsonFiles),
    tokensCss: withoutLeadingSlash(tokensCssFiles),
  }
}

const { registry, errors } = deriveRegistry(buildRegistryInput())

if (errors.length > 0) {
  throw new Error(
    ['project registry có lỗi:', ...errors.map((error) => `  ${error.file}: ${error.message}`)].join('\n'),
  )
}

export const PROJECTS: ProjectDef[] = registry.projects
export const SCREENS: ScreenDef[] = registry.screens
export const SCREEN_BY_ID = new Map(registry.screens.map((screen) => [screen.id, screen]))
export const COMPONENTS: ComponentDef[] = registry.components
export const COMPONENTS_BY_ID = new Map(registry.components.map((component) => [component.id, component]))

/** components owned by a project, in manifest order */
export function componentsOf(projectId: string): ComponentDef[] {
  return COMPONENTS.filter((component) => component.project === projectId)
}

/** the id → html map `composeScreenDoc` expands `@component` against */
export function componentMap(projectId: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const component of componentsOf(projectId)) out[component.id] = component.html
  return out
}

/** project override stylesheet, when the project ships one */
export function tokensCssFor(projectId: string): string | undefined {
  return registry.tokens[projectId]
}

/** asset paths relative to `project/<id>/assets/`, for lint and tooling */
export function assetsOf(projectId: string): string[] {
  return registry.assets[projectId] ?? []
}
