import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scanProjects } from './scan-projects.ts'
import { parseStateFile } from '../src/projects/storage.ts'
import { parseRowsFlag, resolveBoardPath, writeBoardFreeze } from './board-freeze.ts'

// RED-first contract (fails until board-freeze.ts exists):
// freeze writer reuses scan-projects discovery + placement math,
// writes project/<id>/board.json with screen ids + positions.
//
// Every write goes through `outDir` into a mkdtemp dir: board.json is written
// INTO a project dir, and the real project/ is read (globs in
// src/projects/registry.ts, scan-projects) by other workers for the whole
// parallel run — a writer there is the one thing that can break them.
let outDir: string

beforeAll(() => {
  outDir = mkdtempSync(join(tmpdir(), 'board-freeze-'))
})

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true })
})

describe('board freeze writer', () => {
  it('writes board.json with every screen id + a position', async () => {
    const { registry, errors } = await scanProjects()
    expect(errors).toEqual([])
    const project = registry.screens.length > 0 ? registry.screens[0]!.projectId : 'scratch-widget'
    const file = await writeBoardFreeze(project, { root: process.cwd(), outDir })
    expect(file).toBe(resolveBoardPath(project, process.cwd(), outDir))
    // the default (no outDir) rule still lands in the project dir; asserted
    // without writing, since the real project/ is read-only here
    expect(resolveBoardPath(project, '/tree')).toBe(join('/tree', 'project', project, 'board.json'))
    const raw = JSON.parse(await readFile(file, 'utf8'))
    // exact ProjectStateFile shape the loader validates — no new parser
    const parsed = parseStateFile(JSON.stringify(raw), project)
    expect(parsed.projectId).toBe(project)
    expect(parsed.board.nodes.length).toBeGreaterThan(0)
    for (const n of parsed.board.nodes) {
      expect(typeof n.data.screenId).toBe('string')
      expect(typeof n.position.x).toBe('number')
      expect(typeof n.position.y).toBe('number')
      expect(typeof n.data.deviceId).toBe('string')
    }
    const ids = new Set(parsed.board.nodes.map((n) => n.data.screenId))
    const expected = registry.screens.filter((s) => s.projectId === project).map((s) => s.id)
    expect([...ids].sort()).toEqual([...expected].sort())
    // the rollback copy lives next to it — this test must not leave either one
    await rm(file, { force: true })
    await rm(`${file}.bak`, { force: true })
  })

  it('x positions never overlap: each node starts past the previous right edge', async () => {
    // use two smallest real projects for coverage
    for (const projectId of ['widget-lab', 'watch-lab']) {
      const dir = mkdtempSync(join(tmpdir(), 'freeze-rt-'))
      const file = await writeBoardFreeze(projectId, { root: process.cwd(), outDir: dir })
      const parsed = parseStateFile(await readFile(file, 'utf8'), projectId)
      const xs = parsed.board.nodes.map((n) => n.position.x)
      const sorted = [...xs].sort((a: number, b: number) => a - b)
      expect(xs).toEqual(sorted)
      expect(new Set(xs).size).toBe(xs.length)
      await rm(dir, { recursive: true, force: true })
    }
  })

  it('keeps the previous artifact as <file>.bak before overwriting it', async () => {
    // tmp outDir: the rollback copy is a write-path concern, not a repo one
    const dir = mkdtempSync(join(tmpdir(), 'freeze-bak-'))
    const file = await writeBoardFreeze('widget-lab', { root: process.cwd(), outDir: dir })
    const first = await readFile(file, 'utf8')
    // nothing to roll back to on a first freeze — and that is not an error
    await expect(readFile(`${file}.bak`, 'utf8')).rejects.toThrow()

    await writeBoardFreeze('widget-lab', { root: process.cwd(), outDir: dir })
    expect(await readFile(`${file}.bak`, 'utf8')).toBe(first)
    // every run snapshots the immediately previous artifact
    expect(await readFile(file, 'utf8')).not.toBe(first)
    await rm(dir, { recursive: true, force: true })
  })

  it('refuses unknown projects instead of writing an empty board', async () => {
    await expect(writeBoardFreeze('no-such-project', { root: process.cwd() })).rejects.toThrow()
  })
})

describe('board freeze rows (board-arrangement)', () => {
  it('--order + --row-size cut two rows in the given order, leftovers appended', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'freeze-rows-'))
    const { registry } = await scanProjects()
    const manifest = registry.projects.find((p) => p.id === 'noor')?.screenIds ?? []
    expect(manifest.length).toBeGreaterThan(3)
    const [first, second] = manifest
    const file = await writeBoardFreeze('noor', {
      root: process.cwd(),
      outDir: dir,
      order: [second!, first!],
      rowSize: 2,
      rowNames: ['nhom-1'],
    })
    const parsed = parseStateFile(await readFile(file, 'utf8'), 'noor')
    // first row follows --order, not the manifest
    expect(parsed.board.nodes[0]?.data.screenId).toBe(second)
    expect(parsed.board.nodes[1]?.data.screenId).toBe(first)
    const rows = parsed.board.arrangement ?? []
    expect(rows[0]).toEqual({ name: 'nhom-1', screens: [second, first] })
    // every project screen still present exactly once, rows cover all
    expect(rows.flatMap((r) => r.screens).sort()).toEqual([...manifest].sort())
    // second row restarts x at 0 and sits below the first
    const y1 = parsed.board.nodes[0]?.position.y ?? -1
    const y2 = parsed.board.nodes[2]?.position.y ?? -1
    expect(parsed.board.nodes[2]?.position.x).toBe(0)
    expect(y2).toBeGreaterThan(y1)
    await rm(dir, { recursive: true, force: true })
  })

  it('--rows places explicit groups and --dry-run writes nothing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'freeze-explicit-'))
    const { registry } = await scanProjects()
    const manifest = registry.projects.find((p) => p.id === 'noor')?.screenIds ?? []
    const [a, b, c] = manifest
    const file = await writeBoardFreeze('noor', {
      root: process.cwd(),
      outDir: dir,
      rows: parseRowsFlag(`${a},${b};${c}`),
      rowNames: ['mot', 'hai'],
    })
    const parsed = parseStateFile(await readFile(file, 'utf8'), 'noor')
    // unlisted screens append as one final row after the explicit ones
    expect(parsed.board.arrangement?.slice(0, 2)).toEqual([
      { name: 'mot', screens: [a, b] },
      { name: 'hai', screens: [c] },
    ])
    expect(parseRowsFlag('x,y\nz')).toEqual([['x', 'y'], ['z']])
    const before = await readFile(file, 'utf8')
    await writeBoardFreeze('noor', { root: process.cwd(), outDir: dir, rows: [[a!]], dryRun: true })
    expect(await readFile(file, 'utf8')).toBe(before)
    await rm(dir, { recursive: true, force: true })
  })

  it('unknown screen ids fail before anything is written', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'freeze-bad-'))
    await expect(
      writeBoardFreeze('noor', { root: process.cwd(), outDir: dir, order: ['no-such-screen'] }),
    ).rejects.toThrow('no-such-screen')
    await expect(
      writeBoardFreeze('noor', { root: process.cwd(), outDir: dir, rows: [['splash', 'no-such-screen']] }),
    ).rejects.toThrow('no-such-screen')
    await rm(dir, { recursive: true, force: true })
  })

  it('default order follows the manifest in one row', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'freeze-default-'))
    const { registry } = await scanProjects()
    const manifest = registry.projects.find((p) => p.id === 'noor')?.screenIds ?? []
    const file = await writeBoardFreeze('noor', { root: process.cwd(), outDir: dir })
    const parsed = parseStateFile(await readFile(file, 'utf8'), 'noor')
    expect(parsed.board.nodes.map((n) => n.data.screenId)).toEqual(manifest)
    expect(parsed.board.arrangement).toEqual([{ screens: manifest }])
    await rm(dir, { recursive: true, force: true })
  })
})

describe('board.json is ignored by the registry', () => {
  it('a stray board.json does not break scanProjects', async () => {
    // a private tree: this probe drops board.json INTO a project dir, and the
    // real project/ is read (globs + scan-projects) by other workers for the
    // whole parallel run — dropping a file there is itself the race
    const root = mkdtempSync(join(tmpdir(), 'board-freeze-stray-'))
    try {
      const dir = join(root, 'project', 'widget-lab')
      await mkdir(join(dir, 'screens'), { recursive: true })
      await writeFile(join(dir, 'project.json'), '{ "title": "Widget lab" }\n')
      await writeFile(join(dir, 'screens', 'home.html'), '<div class="screen"></div>\n')
      await writeFile(
        join(dir, 'board.json'),
        JSON.stringify({ v: 1, projectId: 'widget-lab', exportedAt: 1, nodes: [] }),
      )
      const res = await scanProjects(root)
      expect(res.errors).toEqual([])
      expect(res.registry.projects.map((p) => p.id)).toEqual(['widget-lab'])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
