import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startSite } from './site.ts'
import type { Site } from './site.ts'

let root: string
let site: Site

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'pc-site-'))
  const publicDir = path.join(root, 'public')
  await mkdir(publicDir, { recursive: true })
  await writeFile(path.join(publicDir, 'favicon.svg'), '<svg/>')
  await mkdir(path.join(root, 'project', 'app', 'assets'), { recursive: true })
  await writeFile(path.join(root, 'project', 'app', 'assets', 'hero.svg'), '<svg>hero</svg>')
  site = await startSite(new Map([['demo--reference--light', '<html>doc</html>']]), publicDir)
})

afterAll(async () => {
  await site.close()
  await rm(root, { recursive: true, force: true })
})

describe('export site', () => {
  it('serves a composed document', async () => {
    const res = await fetch(`${site.origin}/screen/demo--reference--light`)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('<html>doc</html>')
  })

  it('serves project assets at /project/<id>/assets/…', async () => {
    const res = await fetch(`${site.origin}/project/app/assets/hero.svg`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/svg+xml')
    expect(await res.text()).toBe('<svg>hero</svg>')
  })

  it('still serves the shared public/ lane', async () => {
    const res = await fetch(`${site.origin}/favicon.svg`)
    expect(res.status).toBe(200)
  })

  it('404s a missing project asset', async () => {
    const res = await fetch(`${site.origin}/project/app/assets/nope.svg`)
    expect(res.status).toBe(404)
  })

  it('does not serve screens/components as files', async () => {
    const res = await fetch(`${site.origin}/project/app/screens/home.html`)
    expect(res.status).toBe(404)
  })
})
