/**
 * Registry types shared by the browser registry (import.meta.glob) and the
 * Node scanner (fs). Pure on purpose: no fs, no Vite — importable from both.
 */

export type ProjectDef = {
  /** folder name under project/ — stable identity */
  id: string
  title: string
  description?: string
  screenIds: string[]
  coverId?: string
  /** set by projects created on the Dashboard (localStorage, no folder) */
  custom?: boolean
}

export type ScreenFile = {
  /** filename stem under project/<id>/screens/ — unique across all projects */
  id: string
  title: string
  /** file relative to the repo root */
  file: string
  /** owning project id (folder name) */
  projectId: string
  lightStatusBar?: boolean
  deviceId?: string
}

export type ScreenDef = ScreenFile & { html: string }

export type ComponentFile = {
  /** filename stem under project/<id>/components/ — unique within its project */
  id: string
  title: string
  /** the project that owns it — components never cross projects */
  project: string
  /** file relative to the repo root */
  file: string
}

export type ComponentDef = ComponentFile & { html: string }

/**
 * File contents keyed by repo-relative path. The browser fills this from
 * `import.meta.glob`; the Node scanner reads the same paths off disk.
 */
export type DeriveInput = {
  screens?: Record<string, string>
  components?: Record<string, string>
  /** `project/<id>/*.html` — HTML outside a lane; always an error */
  strays?: Record<string, string>
  /** repo-relative path → raw project.json */
  projectJson?: Record<string, string>
  /** repo-relative path → raw tokens.css */
  tokensCss?: Record<string, string>
  /** repo-relative asset paths (contents are not needed here) */
  assets?: string[]
}

export type DeriveError = { file: string; message: string }

export type Registry = {
  projects: ProjectDef[]
  screens: ScreenDef[]
  components: ComponentDef[]
  /** project id → tokens.css content (only projects that have the file) */
  tokens: Record<string, string>
  /** project id → asset paths relative to the project's assets/ dir, sorted */
  assets: Record<string, string[]>
}
