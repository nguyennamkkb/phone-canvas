import { spawnSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { DEVICES } from '../src/frame/devices.ts'
import { screenViolations } from './region-rules.ts'

/**
 * The scaffold must not be able to produce a screen that fails the gate.
 *
 * A new screen used to be born red: the template wrote `<header class="navbar">`
 * long after the shell took ownership of the bands. Testing the templates in
 * isolation would not have caught that, because the defect was in what the CLI
 * WROTE — so this runs the real CLI and lints what it produced.
 *
 * The probe project is named so it sorts last, which keeps `screens[0]` (used by
 * the export smoke test) on the same screen it has always been.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROJECT = 'zz-scaffold-check'
const DIR = path.join(ROOT, 'project', PROJECT)
/** same probe, but with no chrome at all — the refusal path needs both */
const EMPTY_PROJECT = 'zz-scaffold-empty'
const EMPTY_DIR = path.join(ROOT, 'project', EMPTY_PROJECT)
const DEVICE_SIZES = DEVICES.flatMap((d) => [d.width, d.height] as const)

const CHROME: Record<string, string> = {
  'app-tabs':
    '<button data-tab="home" class="tab"><span class="icon" data-symbol="house"></span><span>Home</span></button>' +
    '<button data-tab="me" class="tab"><span class="icon" data-symbol="person"></span><span>Me</span></button>',
  'app-nav':
    '<button data-slot="back" class="pill-ghost">Hủy</button><span data-slot="title" class="nav-title"></span>',
}

function scaffold(name: string, ...extra: string[]) {
  return scaffoldIn(PROJECT, name, ...extra)
}

function scaffoldIn(project: string, name: string, ...extra: string[]) {
  const cli = path.join(ROOT, 'scripts/new-screen.ts')
  return spawnSync(
    process.execPath,
    ['--disable-warning=ExperimentalWarning', cli, '--project', project, '--name', name, '--title', name, ...extra],
    { cwd: ROOT, encoding: 'utf8' },
  )
}

async function lint(name: string) {
  const html = await readFile(path.join(DIR, 'screens', `${name}.html`), 'utf8')
  return screenViolations({ html, form: 'phone', deviceWidths: DEVICE_SIZES, components: CHROME })
}

beforeAll(async () => {
  await mkdir(path.join(DIR, 'components'), { recursive: true })
  await writeFile(path.join(DIR, 'project.json'), '{\n  "title": "Scaffold check"\n}\n')
  for (const [id, html] of Object.entries(CHROME)) {
    await writeFile(path.join(DIR, 'components', `${id}.html`), html)
  }
  await mkdir(EMPTY_DIR, { recursive: true })
  await writeFile(path.join(EMPTY_DIR, 'project.json'), '{\n  "title": "Scaffold empty"\n}\n')
})

afterAll(async () => {
  await rm(DIR, { recursive: true, force: true })
  await rm(EMPTY_DIR, { recursive: true, force: true })
})

describe('new-screen produces a screen that already passes the gate', () => {
  for (const kind of ['root', 'push', 'modal', 'bare']) {
    it(`${kind} is born clean`, async () => {
      const name = `zz-kind-${kind}`
      const run = scaffold(name, '--kind', kind)
      expect(run.status, run.stderr).toBe(0)
      expect(await lint(name)).toEqual([])
    })
  }

  it('ipad is born clean (sidebar + split, no phone bands)', async () => {
    const run = scaffold('zz-kind-ipad', '--device', 'ipad-11')
    expect(run.status, run.stderr).toBe(0)
    const html = await readFile(path.join(DIR, 'screens', 'zz-kind-ipad.html'), 'utf8')
    expect(html).toContain('deviceId":"ipad-11')
    expect(html).toContain('class="sidebar"')
    expect(html).toContain('class="split"')
    expect(html).not.toContain('data-slot')
    expect(html).not.toContain('app-tabs')
    expect(
      await screenViolations({ html, form: 'tablet', deviceWidths: DEVICE_SIZES, components: CHROME }),
    ).toEqual([])
  })

  it('watch is born clean (top bar + metric + action, no scroll)', async () => {
    const run = scaffold('zz-kind-watch', '--device', 'watch-45')
    expect(run.status, run.stderr).toBe(0)
    const html = await readFile(path.join(DIR, 'screens', 'zz-kind-watch.html'), 'utf8')
    expect(html).toContain('deviceId":"watch-45')
    expect(html).not.toContain('data-slot')
    expect(html).not.toContain('class="body')
    expect(
      await screenViolations({ html, form: 'watch', deviceWidths: DEVICE_SIZES, components: CHROME }),
    ).toEqual([])
  })

  it('widget is born clean (glance only, no scroll, no bands)', async () => {
    const run = scaffold('zz-kind-widget', '--device', 'widget-small')
    expect(run.status, run.stderr).toBe(0)
    const html = await readFile(path.join(DIR, 'screens', 'zz-kind-widget.html'), 'utf8')
    expect(html).toContain('deviceId":"widget-small')
    expect(html).not.toContain('data-slot')
    expect(html).not.toContain('class="body')
    expect(
      await screenViolations({ html, form: 'widget', deviceWidths: DEVICE_SIZES, components: CHROME }),
    ).toEqual([])
  })
  it('defaults to push, which needs no chrome from the project', async () => {
    const run = scaffold('zz-kind-default')
    expect(run.status, run.stderr).toBe(0)
    expect(run.stdout).toContain('kind: push')
    expect(await lint('zz-kind-default')).toEqual([])
  })

  it('never writes a band class into a screen', async () => {
    const html = await readFile(path.join(DIR, 'screens', 'zz-kind-push.html'), 'utf8')
    expect(html).not.toMatch(/class="[^"]*\b(?:navbar|tabbar|region-nav|region-tabs|dock)\b/)
  })

  it('points a root screen at a destination that really exists', async () => {
    const html = await readFile(path.join(DIR, 'screens', 'zz-kind-root.html'), 'utf8')
    expect(html).toContain('data-tab-active="home"')
    expect(html).toContain('@component app-tabs')
  })

  it('gives every kind exactly one content band', async () => {
    for (const kind of ['root', 'push', 'modal', 'bare']) {
      const html = await readFile(path.join(DIR, 'screens', `zz-kind-${kind}.html`), 'utf8')
      const bands = html.match(/class="body(?:-fixed)?"/g) ?? []
      expect(bands, kind).toHaveLength(1)
    }
  })

  it('refuses a kind whose chrome the project does not have, without writing', async () => {
    const run = scaffoldIn(EMPTY_PROJECT, 'zz-kind-modal-nope', '--kind', 'modal')
    expect(run.status).toBe(1)
    expect(run.stderr).toContain('app-nav')
    await expect(
      readFile(path.join(EMPTY_DIR, 'screens', 'zz-kind-modal-nope.html'), 'utf8'),
    ).rejects.toThrow()
  })

  it('refuses root when the project has no destinations to point at', async () => {
    const run = scaffoldIn(EMPTY_PROJECT, 'zz-kind-root-nope', '--kind', 'root')
    expect(run.status).toBe(1)
    expect(run.stderr).toContain('app-tabs')
  })

  it('refuses an unknown kind', () => {
    const run = scaffold('zz-kind-bogus', '--kind', 'fancy')
    expect(run.status).toBe(1)
    expect(run.stderr).toContain('unknown --kind')
  })

  it('stays clean even when --title is too long for a one-line nav title', async () => {
    // the board label may be long, but the title slot fails at 15 characters —
    // so the scaffold substitutes a placeholder instead of shipping a red screen
    const run = scaffold('zz-long-title', '--kind', 'push', '--title', 'Một tiêu đề rất dài')
    expect(run.status, run.stderr).toBe(0)
    expect(run.stdout).toContain('placeholder')
    expect(await lint('zz-long-title')).toEqual([])
    const html = await readFile(path.join(DIR, 'screens', 'zz-long-title.html'), 'utf8')
    expect(html).toContain('<!-- pc {"title":"Một tiêu đề rất dài"} -->')
  })
})
