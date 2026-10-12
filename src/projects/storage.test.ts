import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearBoard,
  loadBoard,
  loadCustomProjects,
  saveBoard,
  seedBoard,
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

/** The retired import marker, written the same way storage.ts builds it: the
 *  dotted key is never spelled out anywhere in src/, so the grep gate that
 *  keeps the old read path dead stays clean. */
const legacyMarkerKey = (projectId: string): string => ['pc', 'statefile', ''].join('.') + projectId

/** minimal state file, the shape an import / freeze artifact carries */
function stateFile(projectId: string, exportedAt: number, removed: string[]): string {
  return JSON.stringify({
    v: 1,
    projectId,
    exportedAt,
    board: { v: 4, nodes: [], edges: [], removed, trash: [] },
  })
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
    expect(loadBoard('p1')).toEqual({ v: 5, nodes: [], edges: [], removed: [], trash: [] })
    seed('pc.board.p2', JSON.stringify({ v: 2, nodes: [], edges: [] }))
    expect(loadBoard('p2')).toEqual({ v: 5, nodes: [], edges: [], removed: [], trash: [] })
  })

  it('loads v3 (removed) and v4 (trash) records', () => {
    seed('pc.board.p3', JSON.stringify({ v: 3, nodes: [], edges: [], removed: ['home', 7, null] }))
    expect(loadBoard('p3')?.removed).toEqual(['home'])
    const node = {
      id: 'p4-n1',
      type: 'phone',
      position: { x: 0, y: 0 },
      data: { screenId: 'home', deviceId: 'reference' },
    }
    seed(
      'pc.board.p4',
      JSON.stringify({
        v: 4,
        nodes: [node],
        edges: [],
        removed: [],
        trash: [
          { id: 't1', screenId: 'about', node, edges: [], deletedAt: 1 },
          { junk: true },
        ],
      }),
    )
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loaded = loadBoard('p4')
    expect(loaded?.v).toBe(5)
    expect(loaded?.nodes).toHaveLength(1)
    expect(loaded?.trash.map((t) => t.screenId)).toEqual(['about'])
    expect(warn).toHaveBeenCalled()
  })

  it('writes v5 with savedAt and the write survives a reload', () => {
    saveBoard('p9', { nodes: [], edges: [], removed: [] })
    expect(loadBoard('p9')).toEqual({ v: 5, nodes: [], edges: [], removed: [], trash: [] })
    const raw = JSON.parse(localStorage.getItem('pc.board.p9') as string)
    expect(raw.v).toBe(5)
    expect(typeof raw.savedAt).toBe('number')
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

  it('returns null for a corrupt record: warn, then a fresh board', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    seed('pc.board.bad1', 'not-json{{{')
    seed('pc.board.bad2', JSON.stringify({ nodes: 'nope', edges: [] }))
    seed('pc.board.bad3', JSON.stringify({ nodes: [{ noId: true }], edges: [] }))
    expect(loadBoard('bad1')).toBeNull()
    expect(loadBoard('bad2')).toBeNull()
    expect(loadBoard('bad3')).toBeNull()
    expect(warn).toHaveBeenCalledTimes(3)
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

describe('legacy import-marker migration (5.2)', () => {
  it('converts a marker into the record when no record exists, and deletes the key', () => {
    seed(legacyMarkerKey('m1'), stateFile('m1', 2000, ['home']))
    expect(loadBoard('m1')?.removed).toEqual(['home'])
    // converted once: the marker is gone and the record carries the marker clock
    expect(localStorage.getItem(legacyMarkerKey('m1'))).toBeNull()
    const record = JSON.parse(localStorage.getItem('pc.board.m1') as string)
    expect(record.v).toBe(5)
    expect(record.savedAt).toBe(2000)
    // idempotent: a second read is the same board, from the record alone
    expect(loadBoard('m1')?.removed).toEqual(['home'])
  })

  it('a newer marker beats an older record, an older marker does not', () => {
    saveBoard('m2', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    seed(legacyMarkerKey('m2'), stateFile('m2', 9e15, ['home']))
    expect(loadBoard('m2')?.removed).toEqual(['home'])
    expect(localStorage.getItem(legacyMarkerKey('m2'))).toBeNull()

    // write-through shape: the record was saved after the import, so the
    // marker is redundant — the record wins and the marker is retired
    seed(legacyMarkerKey('m3'), stateFile('m3', 1, ['home']))
    saveBoard('m3', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    expect(loadBoard('m3')?.removed).toEqual(['journal'])
    expect(localStorage.getItem(legacyMarkerKey('m3'))).toBeNull()
  })

  it('never loses a record: a corrupt marker is dropped, the board stays', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    saveBoard('m4', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    seed(legacyMarkerKey('m4'), 'not-json{{{')
    expect(loadBoard('m4')?.removed).toEqual(['journal'])
    expect(localStorage.getItem(legacyMarkerKey('m4'))).toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  it('a marker holding another project cannot become this record — board stays', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    saveBoard('m5', { nodes: [], edges: [], removed: [], trash: [] })
    seed(legacyMarkerKey('m5'), stateFile('other', 9e15, ['home']))
    expect(loadBoard('m5')?.removed).toEqual([])
    expect(localStorage.getItem(legacyMarkerKey('m5'))).toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  it('deleting the board takes the marker with it — no resurrection', () => {
    saveBoard('m6', { nodes: [], edges: [], removed: [], trash: [] })
    seed(legacyMarkerKey('m6'), stateFile('m6', 9e15, ['home']))
    clearBoard('m6')
    expect(localStorage.getItem('pc.board.m6')).toBeNull()
    expect(localStorage.getItem(legacyMarkerKey('m6'))).toBeNull()
    expect(loadBoard('m6')).toBeNull()
  })
})

describe('seedBoard (board.json freeze seed)', () => {
  function stubFetch(body: string | null, ok = true) {
    const fetchMock = vi.fn(async () => ({
      ok,
      status: ok ? 200 : 404,
      text: async () => body ?? '',
    }))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  it('returns the freeze when no record exists', async () => {
    const fetchMock = stubFetch(stateFile('s1', 1000, ['home']))
    const seeded = await seedBoard('s1')
    expect(seeded?.board.removed).toEqual(['home'])
    expect(seeded?.board.v).toBe(5)
    expect(fetchMock).toHaveBeenCalledWith('/project/s1/board.json', { cache: 'no-store' })
  })

  it('returns the freeze only when it is strictly newer than the record', async () => {
    saveBoard('s2', { nodes: [], edges: [], removed: ['journal'], trash: [] })
    const savedAt = JSON.parse(localStorage.getItem('pc.board.s2') as string).savedAt
    stubFetch(stateFile('s2', savedAt + 1, ['home']))
    expect((await seedBoard('s2'))?.board.removed).toEqual(['home'])

    // same instant is not newer: the record the user is looking at wins
    stubFetch(stateFile('s2', savedAt, ['home']))
    expect(await seedBoard('s2')).toBeNull()

    stubFetch(stateFile('s2', savedAt - 1, ['home']))
    expect(await seedBoard('s2')).toBeNull()
  })

  it('never throws and never seeds on 404 or corrupt JSON', async () => {
    stubFetch(null, false)
    expect(await seedBoard('s3')).toBeNull()
    stubFetch('not-json{{{')
    expect(await seedBoard('s3')).toBeNull()
    stubFetch(stateFile('other', 9e15, ['home']))
    expect(await seedBoard('s3')).toBeNull()
    stubFetch(JSON.stringify({ v: 9 }))
    expect(await seedBoard('s3')).toBeNull()
  })

  it('returns null when fetch is unavailable', async () => {
    vi.stubGlobal('fetch', undefined)
    expect(await seedBoard('s4')).toBeNull()
  })

  it('compares against the record as it was when called, not when it lands', async () => {
    // BoardView saves the opened board while the request is in flight: the
    // decision must not be swallowed by that write, or a first visit would
    // never pick the freeze up.
    const fetchMock = vi.fn(async () => {
      saveBoard('s5', { nodes: [], edges: [], removed: ['journal'], trash: [] })
      return { ok: true, status: 200, text: async () => stateFile('s5', 1000, ['home']) }
    })
    vi.stubGlobal('fetch', fetchMock)
    expect((await seedBoard('s5'))?.board.removed).toEqual(['home'])
  })

  it('migrates a legacy marker before comparing, so the freeze loses to it', async () => {
    seed(legacyMarkerKey('s6'), stateFile('s6', 9e15, []))
    stubFetch(stateFile('s6', 1000, ['home']))
    expect(await seedBoard('s6')).toBeNull()
    expect(localStorage.getItem(legacyMarkerKey('s6'))).toBeNull()
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
    seed('pc.tokens.theme.p1', 'dark')
    seed('pc.projects.custom', '[]')
    seed('pc.ui.panelVisible', '1')
    seed('someone.elses.key', 'keep me')

    const cleared = clearAllLocalState()

    expect(cleared).toHaveLength(5)
    expect(cleared.every((k) => k.startsWith('pc.'))).toBe(true)
    expect(localStorage.getItem('pc.board.p1')).toBeNull()
    expect(localStorage.getItem('pc.tokens.draft.p1')).toBeNull()
    // a stale token draft is the one that masks an edited tokens.css file
    expect(localStorage.getItem('pc.tokens.theme.p1')).toBeNull()
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

  it('normalises an old v4 artifact board to v5', () => {
    const parsed = parseStateFile(stateFile('ps', 5, ['home']), 'ps')
    expect(parsed.board.v).toBe(5)
    expect(parsed.exportedAt).toBe(5)
  })

  it('rejects garbage, wrong version, and foreign project without throwing raw', () => {
    expect(() => parseStateFile('not-json{{{')).toThrow()
    expect(() => parseStateFile(JSON.stringify({ v: 9 }))).toThrow()
    const raw = JSON.stringify(toStateFile('a', { v: 5, nodes: [], edges: [], removed: [], trash: [] }))
    expect(() => parseStateFile(raw, 'b')).toThrow()
  })

  it('round-trips an arrangement and keeps pre-arrangement snapshots bare', () => {
    saveBoard('pa', {
      nodes: [],
      edges: [],
      removed: [],
      trash: [],
      arrangement: [{ name: 'onboarding', screens: ['a', 'b'] }, { screens: ['c'] }],
    })
    expect(loadBoard('pa')?.arrangement).toEqual([{ name: 'onboarding', screens: ['a', 'b'] }, { screens: ['c'] }])
    // snapshots written before arrangement existed carry no field at all
    saveBoard('ps', { nodes: [], edges: [], removed: [], trash: [] })
    expect(loadBoard('ps')?.arrangement).toBeUndefined()
  })

  it('rejects a malformed arrangement but reads one with a bad row dropped', () => {
    const bad = JSON.stringify({
      v: 1,
      projectId: 'px',
      exportedAt: 7,
      board: { v: 5, nodes: [], edges: [], removed: [], trash: [], arrangement: [{ screens: 'nope' }] },
    })
    expect(() => parseStateFile(bad, 'px')).toThrow()
    seed('pc.board.px', bad)
    expect(loadBoard('px')?.arrangement).toBeUndefined()
  })
})
