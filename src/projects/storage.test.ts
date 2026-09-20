import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadBoard, loadCustomProjects, saveBoard } from './storage'

/** storage.ts guards every access with try/catch, so a minimal stub suffices */
function installLocalStorage(): void {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
    clear: () => store.clear(),
  } satisfies Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>)
}

function seed(key: string, value: string): void {
  localStorage.setItem(key, value)
}

beforeEach(() => {
  installLocalStorage()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('loadBoard', () => {
  it('loads v1 and v2 snapshots', () => {
    seed('pc.board.p1', JSON.stringify({ nodes: [], edges: [] }))
    expect(loadBoard('p1')).toEqual({ v: 2, nodes: [], edges: [] })
    seed('pc.board.p2', JSON.stringify({ v: 2, nodes: [], edges: [] }))
    expect(loadBoard('p2')).toEqual({ v: 2, nodes: [], edges: [] })
  })

  it('returns null for corrupt snapshots without throwing', () => {
    seed('pc.board.bad1', 'not-json{{{')
    seed('pc.board.bad2', JSON.stringify({ nodes: 'nope', edges: [] }))
    seed('pc.board.bad3', JSON.stringify({ nodes: [{ noId: true }], edges: [] }))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(loadBoard('bad1')).toBeNull()
    expect(loadBoard('bad2')).toBeNull()
    expect(loadBoard('bad3')).toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  it('writes v2 and the write survives a reload', () => {
    saveBoard('p9', { nodes: [], edges: [] })
    expect(loadBoard('p9')).toEqual({ v: 2, nodes: [], edges: [] })
  })
})

describe('loadCustomProjects', () => {
  it('returns [] for garbage without throwing', () => {
    seed('pc.projects.custom', '[[[broken')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(loadCustomProjects()).toEqual([])
    expect(warn).toHaveBeenCalled()
  })
})
