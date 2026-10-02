import { describe, expect, it } from 'vitest'

import { screenViolations } from './region-rules.ts'
import { filterByScreen, parseScreenFilter, printHelpIfRequested } from './screen-filter.ts'

const screens = [
  { id: 'home', projectId: 'demo' },
  { id: 'settings', projectId: 'demo' },
]

describe('parseScreenFilter', () => {
  it('returns null without the flag (check all — default unchanged)', () => {
    expect(parseScreenFilter([])).toBeNull()
  })

  it('returns the id after --screen', () => {
    expect(parseScreenFilter(['--screen', 'home'])).toBe('home')
  })

  it('ignores a missing value (check all, same as region-audit)', () => {
    expect(parseScreenFilter(['--screen'])).toBeNull()
  })

  it('ignores a flag-like value (check all, never treat --help as an id)', () => {
    expect(parseScreenFilter(['--screen', '--help'])).toBeNull()
  })
})

describe('printHelpIfRequested', () => {
  it('prints help and exits 0 on --help (never treats it as a screen id)', () => {
    const logs: string[] = []
    const exits: number[] = []
    const help = 'usage: lint --screen <id>'
    expect(printHelpIfRequested(['--screen', '--help'], help, { log: (s: string) => void logs.push(s), exit: (c: number) => void exits.push(c) as never })).toBe(true)
    expect(logs).toEqual([help])
    expect(exits).toEqual([0])
  })

  it('returns false without a help flag (normal run continues)', () => {
    expect(printHelpIfRequested(['--screen', 'today'], 'help', { log: () => {}, exit: () => undefined as never })).toBe(false)
    expect(printHelpIfRequested([], 'help', { log: () => {}, exit: () => undefined as never })).toBe(false)
  })
})

describe('end-to-end: filter hides another screen’s defect (region rules)', () => {
  // one clean screen + one with a shell-owned band; selecting the clean one
  // must yield zero violations even though the other screen is defective
  const clean = '<div class="screen"><div class="body"></div></div>'
  const broken = '<div class="screen"><div class="region-nav">x</div><div class="body"></div></div>'
  const items = [
    { id: 'ok-screen', html: clean },
    { id: 'bad-screen', html: broken },
  ]
  const violationsFor = (id: string | null) =>
    filterByScreen(items, id).flatMap((s) => screenViolations({ html: s.html, form: 'phone', deviceWidths: [] }))

  it('selecting the clean screen passes while unfiltered fails', () => {
    expect(violationsFor('ok-screen')).toEqual([])
    expect(violationsFor(null).length).toBeGreaterThan(0)
  })
})

describe('filterByScreen', () => {
  it('keeps everything without a filter (default behavior unchanged)', () => {
    expect(filterByScreen(screens, null)).toEqual(screens)
  })

  it('keeps only the selected screen, so another screen’s error cannot fail the run', () => {
    // 'home' carries the defect; selecting 'settings' must hide it entirely
    expect(filterByScreen(screens, 'settings')).toEqual([{ id: 'settings', projectId: 'demo' }])
  })

  it('matches nothing for an unknown id (caller must exit 1)', () => {
    expect(filterByScreen(screens, 'nope')).toEqual([])
  })
})
