import { describe, expect, it } from 'vitest'

import { clipFor, cropFor, descendantsOf, elementStem, resolvePad, unionBox, uniqueNames } from './element.ts'
import type { Box, ElementNode } from './element.ts'

const node = (over: Partial<ElementNode> = {}): ElementNode => ({
  id: 'e12',
  tag: 'div',
  parent: null,
  depth: 1,
  role: 'VStack',
  label: 'VStack',
  box: { x: 0, y: 0, w: 100, h: 50 },
  attrs: { src: '', alt: '', symbol: '', asset: '', iconSrc: '', class: '' },
  ...over,
})

const BOUNDS = { width: 390, height: 844 }

describe('resolvePad', () => {
  it('uses the fixed pad when no percentage is given', () => {
    expect(resolvePad({ x: 0, y: 0, w: 100, h: 40 }, { padPt: 24, padPct: null })).toBe(24)
  })

  it('measures a percentage against the LARGER side', () => {
    expect(resolvePad({ x: 0, y: 0, w: 200, h: 50 }, { padPt: 0, padPct: 0.1 })).toBe(20)
    expect(resolvePad({ x: 0, y: 0, w: 50, h: 200 }, { padPt: 0, padPct: 0.1 })).toBe(20)
  })

  it('lets the percentage win over the fixed pad', () => {
    expect(resolvePad({ x: 0, y: 0, w: 300, h: 120 }, { padPt: 99, padPct: 0.1 })).toBe(30)
  })

  it('never returns a negative or NaN pad', () => {
    expect(resolvePad({ x: 0, y: 0, w: 100, h: 100 }, { padPt: -5, padPct: null })).toBe(0)
    expect(resolvePad({ x: 0, y: 0, w: 100, h: 100 }, { padPt: 0, padPct: 0 })).toBe(0)
  })
})

describe('clipFor', () => {
  it('grows the box by the pad', () => {
    expect(clipFor({ x: 100, y: 200, w: 50, h: 30 }, 24, BOUNDS)).toEqual({
      x: 76,
      y: 176,
      width: 98,
      height: 78,
    })
  })

  it('clamps at the top-left corner', () => {
    expect(clipFor({ x: 5, y: 5, w: 50, h: 30 }, 24, BOUNDS)).toEqual({
      x: 0,
      y: 0,
      width: 79,
      height: 59,
    })
  })

  it('clamps at the right and bottom edges', () => {
    expect(clipFor({ x: 350, y: 800, w: 30, h: 40 }, 24, BOUNDS)).toEqual({
      x: 326,
      y: 776,
      width: 64,
      height: 68,
    })
  })

  it('never produces a clip smaller than 1px', () => {
    expect(clipFor({ x: 389, y: 843, w: 0, h: 0 }, 0, BOUNDS)).toEqual({
      x: 389,
      y: 843,
      width: 1,
      height: 1,
    })
    expect(clipFor({ x: 0, y: 0, w: 0, h: 0 }, 0, { width: 0, height: 0 })).toEqual({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    })
  })

  it('floors fractional boxes (a clip is whole pixels)', () => {
    expect(clipFor({ x: 10.6, y: 20.4, w: 50.5, h: 30.5 }, 4, BOUNDS)).toEqual({
      x: 6,
      y: 16,
      width: 59,
      height: 38,
    })
  })
})

describe('unionBox', () => {
  it('returns the box itself when there is nothing to add', () => {
    expect(unionBox({ x: 10, y: 20, w: 100, h: 50 }, [])).toEqual({ x: 10, y: 20, w: 100, h: 50 })
  })

  it('spans the box and every extra box', () => {
    const extra: Box[] = [
      { x: 0, y: 0, w: 20, h: 20 },
      { x: 150, y: 60, w: 30, h: 10 },
    ]
    expect(unionBox({ x: 10, y: 20, w: 100, h: 50 }, extra)).toEqual({ x: 0, y: 0, w: 180, h: 70 })
  })
})

describe('cropFor', () => {
  // root-first, as the bridge reports them
  const ancestors: Box[] = [
    { x: 0, y: 0, w: 390, h: 100 },
    { x: 50, y: 100, w: 290, h: 200 },
  ]
  const box: Box = { x: 100, y: 200, w: 100, h: 50 }

  it('level 0 shoots the element alone', () => {
    expect(cropFor(box, ancestors, { padPt: 10, padPct: null, ancestorLevels: 0 }, BOUNDS)).toEqual({
      x: 90,
      y: 190,
      width: 120,
      height: 70,
    })
  })

  it('level 1 adds the nearest ancestor', () => {
    expect(cropFor(box, ancestors, { padPt: 10, padPct: null, ancestorLevels: 1 }, BOUNDS)).toEqual({
      x: 40,
      y: 90,
      width: 310,
      height: 220,
    })
  })

  it('level 2 adds the whole chain', () => {
    // the union reaches y=300, and the 10pt pad grows the bottom to 310
    expect(cropFor(box, ancestors, { padPt: 10, padPct: null, ancestorLevels: 2 }, BOUNDS)).toEqual({
      x: 0,
      y: 0,
      width: 390,
      height: 310,
    })
  })

  it('resolves the pad against the union, not the element', () => {
    const square: Box = { x: 100, y: 100, w: 100, h: 100 }
    const parent: Box[] = [{ x: 0, y: 0, w: 300, h: 200 }]
    const opts = { padPt: 0, padPct: 0.1, ancestorLevels: 1 }
    // 10% of the union's larger side (300) is 30, not 10% of the square's 100
    expect(cropFor(square, parent, opts, BOUNDS)).toEqual({ x: 0, y: 0, width: 330, height: 230 })
    expect(cropFor(square, [], { ...opts, ancestorLevels: 0 }, BOUNDS)).toEqual({
      x: 90,
      y: 90,
      width: 120,
      height: 120,
    })
  })

  it('ignores levels beyond the chain it was given', () => {
    expect(cropFor(box, ancestors, { padPt: 10, padPct: null, ancestorLevels: 9 }, BOUNDS)).toEqual(
      cropFor(box, ancestors, { padPt: 10, padPct: null, ancestorLevels: 2 }, BOUNDS),
    )
  })
})

describe('elementStem', () => {
  it('prefers data-asset', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, asset: 'plan-card', symbol: 'x' } }))).toBe('plan-card')
  })

  it('falls back to data-symbol', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, symbol: 'chevron.left' } }))).toBe('chevron-left')
  })

  it('falls back to the icon file, then the image file', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, iconSrc: 'public/icons/star.fill.svg' } }))).toBe('star-fill')
    expect(elementStem(node({ attrs: { ...node().attrs, src: '/project/app/assets/Hero Image.png' } }))).toBe(
      'hero-image',
    )
  })

  it('falls back to the element class before the capture id', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, class: 'pw-card fp-plan is-best' } }))).toBe('pw-card')
    expect(elementStem(node({ attrs: { ...node().attrs, class: 'grow pw-card ss-cell' } }))).toBe('pw-card')
    expect(elementStem(node({ attrs: { ...node().attrs, class: 'col' } }))).toBe('col')
  })

  it('keeps the capture id when there is no class', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, class: '' } }))).toBe('e12')
    expect(elementStem(node({ attrs: { ...node().attrs, class: '   ' } }))).toBe('e12')
  })

  it('still lets data-asset win over the class', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, asset: 'plan-card', class: 'pw-card' } }))).toBe('plan-card')
  })

  it('sanitises a class the same way', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, class: 'Pw-Card' } }))).toBe('pw-card')
    expect(elementStem(node({ attrs: { ...node().attrs, class: 'pw-card/hero v2' } }))).toBe('pw-card-hero')
    expect(elementStem(node({ attrs: { ...node().attrs, class: 'Thẻ-Ưu-Đãi' } }))).toBe('the-uu-dai')
    expect(elementStem(node({ attrs: { ...node().attrs, class: '***' } }))).toBe('e12')
  })

  it('falls back to the bridge id', () => {
    expect(elementStem(node())).toBe('e12')
  })

  it('falls back to role + index', () => {
    expect(elementStem(node({ id: '', role: 'VStack' }), 3)).toBe('vstack-3')
    expect(elementStem(node({ id: '', role: 'HStack' }))).toBe('hstack-1')
  })

  it('sanitises spaces, slashes, dots and unicode to ASCII kebab-case', () => {
    expect(elementStem(node({ attrs: { ...node().attrs, asset: 'plan card / v2' } }))).toBe('plan-card-v2')
    expect(elementStem(node({ attrs: { ...node().attrs, asset: 'Nút mua' } }))).toBe('nut-mua')
    expect(elementStem(node({ attrs: { ...node().attrs, asset: 'Đơn hàng' } }))).toBe('don-hang')
    expect(elementStem(node({ attrs: { ...node().attrs, asset: 'planCard' } }))).toBe('plan-card')
    expect(elementStem(node({ attrs: { ...node().attrs, asset: '***' } }))).toBe('e12')
  })
})

describe('descendantsOf', () => {
  const nodes = [
    node({ id: 'a', parent: null, depth: 0 }),
    node({ id: 'b', parent: 'a', depth: 1 }),
    node({ id: 'c', parent: 'b', depth: 2 }),
    node({ id: 'd', parent: 'a', depth: 1 }),
    node({ id: 'e', parent: null, depth: 0 }),
  ]

  it('returns every nested descendant in document order, never itself', () => {
    expect(descendantsOf(nodes, 'a').map((n) => n.id)).toEqual(['b', 'c', 'd'])
  })

  it('scopes to the subtree it was asked about', () => {
    expect(descendantsOf(nodes, 'b').map((n) => n.id)).toEqual(['c'])
    expect(descendantsOf(nodes, 'd')).toEqual([])
  })

  it('follows the parent link, not the array position', () => {
    const orphan = [node({ id: 'x', parent: 'gone' })]
    expect(descendantsOf(orphan, 'a')).toEqual([])
    expect(descendantsOf(orphan, 'gone').map((n) => n.id)).toEqual(['x'])
  })
})

describe('uniqueNames', () => {
  it('keeps distinct stems untouched', () => {
    expect(uniqueNames(['pw-cta', 'pw-card', 'ss-num'])).toEqual(['pw-cta', 'pw-card', 'ss-num'])
    expect(uniqueNames([])).toEqual([])
  })

  it('suffixes a repeated stem in document order, never dropping a file', () => {
    // five `pw-card` siblings all ask for the same class-based stem
    expect(uniqueNames(['pw-card', 'pw-card', 'pw-card', 'pw-card', 'pw-card'])).toEqual([
      'pw-card',
      'pw-card-2',
      'pw-card-3',
      'pw-card-4',
      'pw-card-5',
    ])
  })

  it('keeps a name that already looks suffixed apart from the generated one', () => {
    expect(uniqueNames(['pw-card', 'pw-card-2', 'pw-card'])).toEqual(['pw-card', 'pw-card-2', 'pw-card-3'])
  })

  it('is pure: the same batch always yields the same names', () => {
    const stems = ['row', 'row', 'col']
    expect(uniqueNames(stems)).toEqual(uniqueNames(stems))
    expect(stems).toEqual(['row', 'row', 'col'])
  })
})
