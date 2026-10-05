import { describe, expect, it } from 'vitest'

import { goldenStatusFor, ownerOf } from './badges.ts'
import type { SpecNode } from '../spec/types.ts'

const node = (over: Partial<SpecNode>): SpecNode =>
  ({
    id: 'e0',
    tag: 'div',
    parent: null,
    depth: 0,
    role: 'Text',
    swiftUiShape: 'Text',
    label: 'Text',
    text: '',
    box: { x: 0, y: 0, w: 100, h: 20 },
    layout: { direction: 'none', gap: 0, justify: '', align: '', selfAlign: '', wrap: false, layer: false },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    size: { w: 100, h: 20, grow: 0, fillWidth: false, fillHeight: false },
    typography: null,
    image: null,
    surface: {
      background: '',
      backgroundHex: '',
      backgroundAlpha: 0,
      backgroundImage: '',
      backgroundKind: 'color',
      radius: 0,
      borderWidth: 0,
      borderColor: '',
      borderHex: '',
      shadow: '',
    },
    scrollable: false,
    ...over,
  }) as SpecNode

describe('ownerOf', () => {
  it('names shell bands before content (nav slot wins over text)', () => {
    // a title-slot host is shell chrome even though it holds text
    expect(ownerOf(node({ tag: 'span' }), { slot: 'title' })).toBe('nav')
  })

  it('names tab destinations', () => {
    expect(ownerOf(node({ tag: 'button' }), { tab: true })).toBe('tab')
  })

  it('names component placeholders', () => {
    expect(ownerOf(node({ tag: 'div' }), { component: true })).toBe('component')
  })

  it('falls back to content for plain nodes', () => {
    expect(ownerOf(node({ tag: 'div', role: 'VStack' }), {})).toBe('content')
  })

  it('names status/home chrome (measured outside the viewport)', () => {
    expect(ownerOf(node({ tag: 'div' }), { chrome: 'status' })).toBe('status')
    expect(ownerOf(node({ tag: 'div' }), { chrome: 'home' })).toBe('shell')
  })
})

describe('goldenStatusFor', () => {
  const rec = { sha256: 'abc', width: 390, height: 844 }
  it('reports missing when no manifest or no record', () => {
    expect(goldenStatusFor(null, 'today', rec).state).toBe('missing')
    expect(goldenStatusFor({ records: {} }, 'today', rec).state).toBe('missing')
  })

  it('matches on sha256, mismatches otherwise (dims never decide)', () => {
    expect(goldenStatusFor({ records: { today: { ...rec, sha256: 'abc' } } }, 'today', rec).state).toBe('match')
    const r = goldenStatusFor({ records: { today: { ...rec, sha256: 'xyz' } } }, 'today', rec)
    expect(r.state).toBe('mismatch')
  })

  it('never throws on a corrupt manifest (missing, not error)', () => {
    expect(goldenStatusFor('garbage' as never, 'today', rec).state).toBe('missing')
  })

  it('matches on perceptual hash within threshold even when sha256 differs', () => {
    const stored = { ...rec, sha256: 'os-a-bytes', phash: 'ffffffffffffffff' }
    // one bit flipped: AA-level noise, still khớp
    const current = { ...rec, sha256: 'os-b-bytes', phash: 'ffffffffffffff7f' }
    const r = goldenStatusFor({ records: { today: stored } }, 'today', current)
    expect(r.state).toBe('match')
    expect(r.label).toBe('khớp golden')
  })

  it('mismatches when the perceptual distance exceeds the threshold', () => {
    const stored = { ...rec, sha256: 'before', phash: '0000000000000000' }
    const current = { ...rec, sha256: 'after', phash: 'ffffffffffffffff' }
    const r = goldenStatusFor({ records: { today: stored } }, 'today', current)
    expect(r.state).toBe('mismatch')
    expect(r.label).toBe('lệch golden')
  })

  it('falls back to sha256-only verdict when either side has no phash', () => {
    const stored = { ...rec, sha256: 'before', phash: 'ffffffffffffffff' }
    const noPhash = { ...rec, sha256: 'after' }
    expect(goldenStatusFor({ records: { today: stored } }, 'today', noPhash).state).toBe('mismatch')
    expect(goldenStatusFor({ records: { today: noPhash } }, 'today', { ...rec, sha256: 'other', phash: 'ffffffffffffffff' }).state).toBe('mismatch')
  })

  it('treats malformed phash hex as mismatch, never throws', () => {
    const stored = { ...rec, sha256: 'before', phash: 'not-hex!!' }
    const current = { ...rec, sha256: 'after', phash: 'ffffffffffffffff' }
    expect(goldenStatusFor({ records: { today: stored } }, 'today', current).state).toBe('mismatch')
  })
})
