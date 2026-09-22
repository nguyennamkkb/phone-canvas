import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadBoard, loadCustomProjects, saveBoard, clearAllLocalState } from './storage'

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
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size
    },
  } satisfies Partial<Storage>)
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
  it('loads v1 and v2 snapshots, defaulting the removed list', () => {
    seed('pc.board.p1', JSON.stringify({ nodes: [], edges: [] }))
    expect(loadBoard('p1')).toEqual({ v: 3, nodes: [], edges: [], removed: [] })
    seed('pc.board.p2', JSON.stringify({ v: 2, nodes: [], edges: [] }))
    expect(loadBoard('p2')).toEqual({ v: 3, nodes: [], edges: [], removed: [] })
  })

  it('round-trips the removed list and drops junk in it', () => {
    saveBoard('p3', { nodes: [], edges: [], removed: ['checkin', 'entry'] })
    expect(loadBoard('p3')?.removed).toEqual(['checkin', 'entry'])
    seed('pc.board.p4', JSON.stringify({ v: 3, nodes: [], edges: [], removed: ['ok', 7, null] }))
    expect(loadBoard('p4')?.removed).toEqual(['ok'])
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

  it('writes v3 and the write survives a reload', () => {
    saveBoard('p9', { nodes: [], edges: [], removed: [] })
    expect(loadBoard('p9')).toEqual({ v: 3, nodes: [], edges: [], removed: [] })
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

describe('clearAllLocalState', () => {
  it('removes every pc.* key and leaves everything else alone', () => {
    seed('pc.board.p1', '{}')
    seed('pc.tokens.draft.p1', '{"values":{}}')
    seed('pc.tokens.theme.moodtracker', 'dark')
    seed('pc.projects.custom', '[]')
    seed('pc.ui.panelVisible', '1')
    seed('someone.elses.key', 'keep me')

    const cleared = clearAllLocalState()

    expect(cleared).toHaveLength(5)
    expect(cleared.every((k) => k.startsWith('pc.'))).toBe(true)
    expect(localStorage.getItem('pc.board.p1')).toBeNull()
    expect(localStorage.getItem('pc.tokens.draft.p1')).toBeNull()
    // a stale token draft is the one that masks an edited tokens.css file
    expect(localStorage.getItem('pc.tokens.theme.moodtracker')).toBeNull()
    expect(localStorage.getItem('someone.elses.key')).toBe('keep me')
  })

  it('is a no-op on an empty store', () => {
    expect(clearAllLocalState()).toEqual([])
  })
})
