import { describe, expect, it } from 'vitest'
import { missingScreenIds } from './reconcile'
import { pruneZombieNodes } from './BoardView'
import type { BoardNode } from '../canvas/TokenNode'
import type { TrashEntry } from '../projects/storage'

describe('missingScreenIds', () => {
  const project = ['splash', 'home', 'checkin', 'insights']

  it('appends project screens the board has never placed', () => {
    // the exact failure: a board saved when the project had two screens
    expect(missingScreenIds(project, ['splash', 'home'], [])).toEqual(['checkin', 'insights'])
  })

  it('keeps a deliberately removed screen off the board', () => {
    expect(missingScreenIds(project, ['splash', 'home'], ['checkin'])).toEqual(['insights'])
  })

  it('adds nothing when the board already covers the project', () => {
    expect(missingScreenIds(project, project, [])).toEqual([])
  })

  it('ignores screens on the board that the project no longer lists', () => {
    // a node for a screen that left the manifest is the caller's problem,
    // not a reason to append it back
    expect(missingScreenIds(project, [...project, 'old-screen'], [])).toEqual([])
  })

  it('preserves project order so appended nodes read left to right', () => {
    expect(missingScreenIds(project, [], [])).toEqual(project)
  })
})

describe('pruneZombieNodes (002-A)', () => {
  const known = new Set(['home', 'journal'])
  const node = (screenId: string): BoardNode =>
    ({ id: `p-${screenId}`, type: 'phone', position: { x: 0, y: 0 }, data: { screenId, deviceId: 'reference' } }) as BoardNode
  const trash = (screenId: string): TrashEntry =>
    ({ id: `t-${screenId}`, screenId, node: node(screenId), edges: [], deletedAt: 1 }) as TrashEntry

  it('drops nodes whose screenId left the manifest, keeps the rest in place', () => {
    const nodes = [node('home'), node('ghost'), node('journal')]
    expect(pruneZombieNodes(nodes, known).map((n) => n.data.screenId)).toEqual(['home', 'journal'])
  })

  it('drops trash entries pointing at a deleted id', () => {
    const entries = [trash('home'), trash('ghost')]
    expect(pruneZombieNodes(entries, known).map((t) => t.screenId)).toEqual(['home'])
  })
})
