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
})
