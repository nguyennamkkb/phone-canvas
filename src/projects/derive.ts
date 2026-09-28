// `.ts` extension: the Node scanner imports this module directly (type stripping)
import { DEVICES } from '../frame/devices.ts'
import type { ComponentDef, DeriveError, DeriveInput, ProjectDef, Registry, ScreenDef } from './types'

/**
 * The whole discovery contract, in one pure function.
 *
 * A project is a folder `project/<id>/` with optional lanes:
 *
 *   project.json     → title · description · cover (screen id)
 *   tokens.css       → project override layer
 *   screens/*.html   → id = filename stem, unique across every project
 *   components/*.html→ id = filename stem, unique within the project
 *   assets/**        → referenced as /project/<id>/assets/<path>
 *
 * Plus an optional metadata header on the first line of a screen:
 *
 *   <!-- pc {"title":"Home","lightStatusBar":true,"deviceId":"ipad-11"} -->
 *
 * The browser collects the input with `import.meta.glob`; `scripts/scan-projects.ts`
 * reads the same paths off disk. Neither owns a rule — this function does.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const KNOWN_DEVICE = new Set(DEVICES.map((d) => d.id))
const SCREEN_KEYS = new Set(['title', 'lightStatusBar', 'deviceId'])
const PROJECT_KEYS = new Set(['title', 'description', 'cover'])

const SCREEN_PATH_RE = /^project\/([^/]+)\/screens\/([^/]+)\.html$/
const COMPONENT_PATH_RE = /^project\/([^/]+)\/components\/([^/]+)\.html$/
const STRAY_PATH_RE = /^project\/([^/]+)\/([^/]+)\.html$/
const PROJECT_JSON_PATH_RE = /^project\/([^/]+)\/project\.json$/
const TOKENS_PATH_RE = /^project\/([^/]+)\/tokens\.css$/
const ASSET_PATH_RE = /^project\/([^/]+)\/assets\/(.+)$/

export function titleize(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(' ')
}

type ScreenMeta = {
  title?: string
  lightStatusBar?: boolean
  deviceId?: string
}

function parseScreenHeader(html: string, file: string, errors: DeriveError[]): ScreenMeta {
  const firstLine = html.split('\n', 1)[0] ?? ''
  if (!/^<!--\s*pc\b/.test(firstLine)) return {}

  const match = /^<!--\s*pc\s+(\{.*\})\s*-->\s*$/.exec(firstLine)
  if (!match?.[1]) {
    errors.push({
      file,
      message: 'header pc phải nằm gọn trên dòng đầu: <!-- pc {"title":"…"} -->',
    })
    return {}
  }

  let raw: unknown
  try {
    raw = JSON.parse(match[1])
  } catch (error) {
    errors.push({ file, message: `header pc không phải JSON hợp lệ: ${(error as Error).message}` })
    return {}
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    errors.push({ file, message: 'header pc phải là một object JSON' })
    return {}
  }

  const meta: ScreenMeta = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!SCREEN_KEYS.has(key)) {
      errors.push({ file, message: `header pc có khoá lạ "${key}" (chỉ nhận: title, lightStatusBar, deviceId)` })
      continue
    }
    if (key === 'title') {
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push({ file, message: 'header pc: "title" phải là chuỗi không rỗng' })
        continue
      }
      meta.title = value
      continue
    }
    if (key === 'lightStatusBar') {
      if (typeof value !== 'boolean') {
        errors.push({ file, message: 'header pc: "lightStatusBar" phải là true/false' })
        continue
      }
      meta.lightStatusBar = value
      continue
    }
    if (typeof value !== 'string' || !KNOWN_DEVICE.has(value)) {
      errors.push({ file, message: `header pc: deviceId "${String(value)}" không tồn tại trong src/frame/devices.ts` })
      continue
    }
    meta.deviceId = value
  }
  return meta
}

type ProjectMeta = {
  title?: string
  description?: string
  cover?: string
}

function parseProjectJson(raw: string, file: string, errors: DeriveError[]): ProjectMeta {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (error) {
    errors.push({ file, message: `project.json không phải JSON hợp lệ: ${(error as Error).message}` })
    return {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    errors.push({ file, message: 'project.json phải là một object JSON' })
    return {}
  }

  const meta: ProjectMeta = {}
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!PROJECT_KEYS.has(key)) {
      errors.push({ file, message: `project.json có khoá lạ "${key}" (chỉ nhận: title, description, cover)` })
      continue
    }
    if (value === undefined) continue
    if (typeof value !== 'string') {
      errors.push({ file, message: `project.json: "${key}" phải là chuỗi` })
      continue
    }
    if (key === 'title') meta.title = value
    if (key === 'description') meta.description = value
    if (key === 'cover') meta.cover = value
  }
  return meta
}

export function deriveRegistry(input: DeriveInput): { registry: Registry; errors: DeriveError[] } {
  const errors: DeriveError[] = []

  const projectJson = new Map<string, ProjectMeta>()
  const tokens = new Map<string, string>()
  const assets = new Map<string, string[]>()
  const screensByProject = new Map<string, ScreenDef[]>()
  const screenFileById = new Map<string, string>()
  const componentsByProject = new Map<string, ComponentDef[]>()
  const lanes = new Map<string, Set<string>>()
  const withScreensOrJson = new Set<string>()

  const noteLane = (projectId: string, lane: string) => {
    let set = lanes.get(projectId)
    if (!set) {
      set = new Set()
      lanes.set(projectId, set)
    }
    set.add(lane)
  }

  const checkProjectId = (projectId: string, file: string) => {
    if (!SLUG_RE.test(projectId)) {
      errors.push({ file, message: `tên dự án "${projectId}" phải là kebab-case (ví dụ my-app)` })
      return false
    }
    return true
  }

  const pushScreen = (projectId: string, screen: ScreenDef) => {
    let list = screensByProject.get(projectId)
    if (!list) {
      list = []
      screensByProject.set(projectId, list)
    }
    list.push(screen)
  }

  for (const [path, raw] of Object.entries(input.projectJson ?? {})) {
    const match = PROJECT_JSON_PATH_RE.exec(path)
    if (!match) continue
    const projectId = match[1]!
    noteLane(projectId, 'project.json')
    if (!checkProjectId(projectId, path)) continue
    withScreensOrJson.add(projectId)
    projectJson.set(projectId, parseProjectJson(raw, path, errors))
  }

  for (const [path, raw] of Object.entries(input.tokensCss ?? {})) {
    const match = TOKENS_PATH_RE.exec(path)
    if (!match) continue
    const projectId = match[1]!
    noteLane(projectId, 'tokens.css')
    if (!checkProjectId(projectId, path)) continue
    tokens.set(projectId, raw)
  }

  for (const path of input.assets ?? []) {
    const match = ASSET_PATH_RE.exec(path)
    if (!match) continue
    const projectId = match[1]!
    noteLane(projectId, 'assets/')
    if (!checkProjectId(projectId, path)) continue
    let list = assets.get(projectId)
    if (!list) {
      list = []
      assets.set(projectId, list)
    }
    list.push(match[2]!)
  }

  for (const [path, html] of Object.entries(input.screens ?? {})) {
    const match = SCREEN_PATH_RE.exec(path)
    if (!match) continue
    const projectId = match[1]!
    const id = match[2]!
    noteLane(projectId, 'screens/')
    if (!checkProjectId(projectId, path)) continue
    withScreensOrJson.add(projectId)

    if (!SLUG_RE.test(id)) {
      errors.push({ file: path, message: `screen id "${id}" phải là kebab-case (ví dụ home-today)` })
      continue
    }
    const previous = screenFileById.get(id)
    if (previous) {
      errors.push({ file: path, message: `trùng screen id "${id}" với ${previous}` })
      continue
    }
    const meta = parseScreenHeader(html, path, errors)
    screenFileById.set(id, path)
    pushScreen(projectId, {
      id,
      projectId,
      file: path,
      title: meta.title ?? titleize(id),
      ...(meta.lightStatusBar !== undefined ? { lightStatusBar: meta.lightStatusBar } : {}),
      ...(meta.deviceId !== undefined ? { deviceId: meta.deviceId } : {}),
      html,
    })
  }

  for (const [path, html] of Object.entries(input.components ?? {})) {
    const match = COMPONENT_PATH_RE.exec(path)
    if (!match) continue
    const projectId = match[1]!
    const id = match[2]!
    noteLane(projectId, 'components/')
    if (!checkProjectId(projectId, path)) continue

    if (!SLUG_RE.test(id)) {
      errors.push({ file: path, message: `component id "${id}" phải là kebab-case (ví dụ stat-tile)` })
      continue
    }
    let list = componentsByProject.get(projectId)
    if (!list) {
      list = []
      componentsByProject.set(projectId, list)
    }
    if (list.some((component) => component.id === id)) {
      errors.push({ file: path, message: `trùng component id "${id}" trong dự án ${projectId}` })
      continue
    }
    list.push({ id, title: titleize(id), project: projectId, file: path, html })
  }

  for (const path of Object.keys(input.strays ?? {})) {
    const match = STRAY_PATH_RE.exec(path)
    if (!match) continue
    errors.push({
      file: path,
      message: 'HTML phải nằm trong screens/ (màn hình) hoặc components/ (component) — không đặt trực tiếp trong thư mục dự án',
    })
  }

  for (const [projectId, set] of lanes) {
    if (withScreensOrJson.has(projectId)) continue
    const where = `project/${projectId}/`
    errors.push({
      file: where,
      message: `thư mục có ${[...set].join(', ')} nhưng thiếu screens/ và project.json — thêm một screen hoặc project.json để thành dự án`,
    })
  }

  const projects: ProjectDef[] = []
  for (const projectId of [...withScreensOrJson].sort()) {
    const meta = projectJson.get(projectId) ?? {}
    const screens = (screensByProject.get(projectId) ?? []).sort((a, b) => a.id.localeCompare(b.id))
    let coverId: string | undefined
    if (meta.cover) {
      if (screens.some((screen) => screen.id === meta.cover)) coverId = meta.cover
      else
        errors.push({
          file: `project/${projectId}/project.json`,
          message: `cover "${meta.cover}" không phải screen của dự án ${projectId}`,
        })
    }
    projects.push({
      id: projectId,
      title: meta.title ?? titleize(projectId),
      ...(meta.description !== undefined ? { description: meta.description } : {}),
      screenIds: screens.map((screen) => screen.id),
      ...(coverId !== undefined ? { coverId } : {}),
    })
  }

  const screens = [...screensByProject.values()].flat().sort((a, b) => {
    if (a.projectId !== b.projectId) return a.projectId.localeCompare(b.projectId)
    return a.id.localeCompare(b.id)
  })
  const components = [...componentsByProject.values()].flat().sort((a, b) => {
    if (a.project !== b.project) return a.project.localeCompare(b.project)
    return a.id.localeCompare(b.id)
  })

  return {
    registry: {
      projects,
      screens,
      components,
      tokens: Object.fromEntries([...tokens].sort(([a], [b]) => a.localeCompare(b))),
      assets: Object.fromEntries(
        [...assets]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([projectId, list]) => [projectId, [...list].sort()]),
      ),
    },
    errors,
  }
}
