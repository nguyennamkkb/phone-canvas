import { describe, expect, it } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scanProjects } from './scan-projects.ts'
import { parseStateFile } from '../src/projects/storage.ts'
import { resolveBoardPath, writeBoardFreeze } from './board-freeze.ts'

// RED-first contract (fails until board-freeze.ts exists):
// freeze writer reuses scan-projects discovery + placement math,
// writes project/<id>/board.json with screen ids + positions.
describe('board freeze writer', () => {
  it('writes board.json with every screen id + a position', async () => {
    const { registry, errors } = await scanProjects()
    expect(errors).toEqual([])
    const project = registry.screens.length > 0 ? registry.screens[0]!.projectId : 'scratch-widget'
    const file = await writeBoardFreeze(project, { root: process.cwd() })
    expect(file).toBe(resolveBoardPath(project, process.cwd()))
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
    await rm(file)
  })

  it('x positions never overlap: each node starts past the previous right edge', async () => {
    // frank-sound mixes widths? use two smallest real projects for coverage
    for (const projectId of ['scratch-widget', 'scratch-watch']) {
      const dir = mkdtempSync(join(tmpdir(), 'freeze-rt-'))
      void dir
      const file = await writeBoardFreeze(projectId, { root: process.cwd(), outDir: tmpdir() })
      const parsed = parseStateFile(await readFile(file, 'utf8'), projectId)
      const xs = parsed.board.nodes.map((n) => n.position.x)
      const sorted = [...xs].sort((a: number, b: number) => a - b)
      expect(xs).toEqual(sorted)
      expect(new Set(xs).size).toBe(xs.length)
      await rm(file)
    }
  })

  it('refuses unknown projects instead of writing an empty board', async () => {
    await expect(writeBoardFreeze('no-such-project', { root: process.cwd() })).rejects.toThrow()
  })
})

describe('board.json is ignored by the registry', () => {
  it('a stray board.json does not break scanProjects', async () => {
    const { errors } = await scanProjects()
    expect(errors).toEqual([])
    const probe = join(process.cwd(), 'project/scratch-widget/board.json')
    await writeFile(probe, JSON.stringify({ v: 1, projectId: 'scratch-widget', exportedAt: 1, nodes: [] }))
    try {
      const res = await scanProjects()
      expect(res.errors).toEqual([])
    } finally {
      await rm(probe, { force: true })
    }
  })
})
