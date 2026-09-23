import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  loadBoard,
  loadCustomProjects,
  saveBoard,
  clearAllLocalState,
  newTrashEntry,
  parseStateFile,
  toStateFile,
} from './storage'

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
    expect(loadBoard('p1')).toEqual({ v: 4, nodes: [], edges: [], removed: [], trash: [] })
    seed('pc.board.p2', JSON.stringify({ v: 2, nodes: [], edges: [] }))
    expect(loadBoard('p2')).toEqual({ v: 4, nodes: [], edges: [], removed: [], trash: [] })
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

  it('writes v4 and the write survives a reload', () => {
    saveBoard('p9', { nodes: [], edges: [], removed: [] })
    expect(loadBoard('p9')).toEqual({ v: 4, nodes: [], edges: [], removed: [], trash: [] })
  })

  it('round-trips trash entries, keeping position/device/edges/deletedAt', () => {
    const node = {
      id: 'p-n1',
      type: 'phone',
      position: { x: 120, y: 30 },
      data: { screenId: 'home', deviceId: 'iphone-15' },
    } as never
    const edges = [{ id: 'e1', source: 'p-n1', target: 'p-n2' }] as never
    const entry = newTrashEntry('home', node, edges)
    saveBoard('pt', { nodes: [], edges: [], removed: ['home'], trash: [entry] })
    const loaded = loadBoard('pt')
    expect(loaded?.trash).toHaveLength(1)
    expect(loaded?.trash[0]).toMatchObject({
      screenId: 'home',
      deletedAt: entry.deletedAt,
    })
    expect(loaded?.trash[0].node.position).toEqual({ x: 120, y: 30 })
    expect(loaded?.trash[0].node.data).toMatchObject({ screenId: 'home', deviceId: 'iphone-15' })
    expect(loaded?.trash[0].edges).toHaveLength(1)
  })

  it('drops corrupt trash entries but keeps the board', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    seed(
      'pc.board.px',
      JSON.stringify({ v: 4, nodes: [], edges: [], removed: [], trash: [{ junk: true }, 7] }),
    )
    const loaded = loadBoard('px')
    expect(loaded?.trash).toEqual([])
    expect(loaded?.removed).toEqual([])
    expect(warn).toHaveBeenCalled()
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

describe('parseStateFile', () => {
  it('round-trips a state file', () => {
    saveBoard('ps', { nodes: [], edges: [], removed: ['home'], trash: [] })
    const board = loadBoard('ps')
    expect(board).not.toBeNull()
    const raw = JSON.stringify(toStateFile('ps', board!))
    const parsed = parseStateFile(raw, 'ps')
    expect(parsed.projectId).toBe('ps')
    expect(parsed.board.removed).toEqual(['home'])
  })

  it('rejects garbage, wrong version, and foreign project without throwing raw', () => {
    expect(() => parseStateFile('not-json{{{')).toThrow()
    expect(() => parseStateFile(JSON.stringify({ v: 9 }))).toThrow()
    const raw = JSON.stringify(toStateFile('a', { v: 4, nodes: [], edges: [], removed: [], trash: [] }))
    expect(() => parseStateFile(raw, 'b')).toThrow()
  })
})

describe('imported state file beats the cache when newer (project-state-file)', () => {
  function fileFor(projectId: string, exportedAt: number, removed: string[]): void {
    const state = JSON.stringify({
      v: 1,
      projectId,
      exportedAt,
      board: { v: 4, nodes: [], edges: [], removed, trash: [] },
    })
    localStorage.setItem(`pc.statefile.${projectId}`, state)
  }

  it('loads from the file when no cache exists (cleared cache restores)', () => {
    fileFor('ps', 2000, ['home'])
    expect(loadBoard('ps')?.removed).toEqual(['home'])
  })

  it('file newer than cache wins', () => {
    saveBoard('ps', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    fileFor('ps', 9e15, ['home'])
    expect(loadBoard('ps')?.removed).toEqual(['home'])
  })

  it('cache saved after the import wins (write-through)', () => {
    fileFor('ps', 1, ['home'])
    saveBoard('ps', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    expect(loadBoard('ps')?.removed).toEqual(['journal'])
  })

  it('no file keeps today behaviour', () => {
    saveBoard('ps', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    expect(loadBoard('ps')?.removed).toEqual(['journal'])
    expect(loadBoard('empty')).toBeNull()
  })
})
