import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { deriveRegistry } from './derive'
import { scanProjects } from '../../scripts/scan-projects.ts'

/**
 * The two readers must agree: the browser feeds `deriveRegistry` from
 * `import.meta.glob`, the Node scanner feeds it from disk. This pins the
 * scanner's half against a literal input built the way the globs build it.
 */

let root: string

const PROJECT_JSON = JSON.stringify({ title: 'My App', description: 'Parity', cover: 'home' })
const TOKENS = ':root { --accent: #111; }'
const HOME = '<!-- pc {"title":"Home · Today","lightStatusBar":true} -->\n<div class="screen"></div>'
const ABOUT = '<div class="screen"></div>'
const STAT_TILE = '<div class="card"></div>'

async function put(rel: string, content: string): Promise<void> {
  const abs = path.join(root, rel)
  await mkdir(path.dirname(abs), { recursive: true })
  await writeFile(abs, content)
}

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'pc-parity-'))
  await put('project/my-app/project.json', PROJECT_JSON)
  await put('project/my-app/tokens.css', TOKENS)
  await put('project/my-app/screens/home.html', HOME)
  await put('project/my-app/screens/about.html', ABOUT)
  await put('project/my-app/components/stat-tile.html', STAT_TILE)
  await put('project/my-app/assets/hero.svg', '<svg/>')
  await put('project/my-app/assets/nested/logo.svg', '<svg/>')
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('scanProjects — parity với derive', () => {
  it('scanner fs và input literal cho cùng registry', async () => {
    const scanned = await scanProjects(root)
    const literal = deriveRegistry({
      projectJson: { 'project/my-app/project.json': PROJECT_JSON },
      tokensCss: { 'project/my-app/tokens.css': TOKENS },
      screens: {
        'project/my-app/screens/home.html': HOME,
        'project/my-app/screens/about.html': ABOUT,
      },
      components: { 'project/my-app/components/stat-tile.html': STAT_TILE },
      assets: ['project/my-app/assets/hero.svg', 'project/my-app/assets/nested/logo.svg'],
    })

    expect(scanned.errors).toEqual([])
    expect(scanned.errors).toEqual(literal.errors)
    expect(scanned.registry).toEqual(literal.registry)
    expect(scanned.registry.projects[0]).toMatchObject({ id: 'my-app', title: 'My App', coverId: 'home' })
    expect(scanned.registry.assets).toEqual({
      'my-app': ['hero.svg', 'nested/logo.svg'],
    })
  })

  it('root không có project/ → registry rỗng, không lỗi', async () => {
    const { registry, errors } = await scanProjects(path.join(root, 'nowhere'))
    expect(errors).toEqual([])
    expect(registry).toEqual({ projects: [], screens: [], components: [], tokens: {}, assets: {} })
  })
})
