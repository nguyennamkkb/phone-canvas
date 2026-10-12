import { describe, expect, it } from 'vitest'

import { DRIFT_ROW_CAP, diffSpecs, driftCounts } from './compare.ts'
import type { SpecNode } from '../../spec/types.ts'

const node = (over: Partial<SpecNode>): SpecNode =>
  ({
    id: 'e0',
    tag: 'div',
    parent: null,
    depth: 0,
    role: 'VStack',
    swiftUiShape: 'VStack(spacing: 12)',
    label: 'VStack',
    text: '',
    box: { x: 0, y: 0, w: 100, h: 20 },
    layout: { direction: 'column', gap: 12, justify: '', align: '', selfAlign: '', wrap: false, layer: false },
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

const typo = (over: Partial<NonNullable<SpecNode['typography']>>) => ({
  family: 'Inter',
  size: 14,
  weight: 500,
  weightName: 'medium',
  lineHeight: 20,
  lineSpacing: 6,
  tracking: 0,
  align: 'left',
  transform: 'none',
  color: 'rgb(0, 0, 0)',
  colorHex: '#000000',
  ...over,
})

/**
 * A two-level tree: VStack > Text ("Monthly"). The flat list keeps its nesting
 * in `parent`/`depth`, exactly like the bridge ships it.
 */
const tree = (text: string, gap: number, role: SpecNode['role'] = 'Text'): SpecNode[] => [
  node({ id: 'a0', depth: 0, role: 'VStack', label: 'VStack', layout: { ...node({}).layout, gap } }),
  node({
    id: 'a1',
    parent: 'a0',
    depth: 1,
    role,
    label: 'Text · "Monthly"',
    text,
    typography: typo({}),
  }),
]

describe('diffSpecs', () => {
  it('reports nothing for identical trees', () => {
    expect(diffSpecs(tree('Monthly', 12), tree('Monthly', 12))).toEqual([])
  })

  it('reports one row for a single-field gap drift, with both values and the breadcrumb', () => {
    const rows = diffSpecs(tree('Monthly', 12), tree('Monthly', 16))
    expect(rows).toEqual([
      // the card's spacing drifted 12 → 16; the Text child is untouched
      { kind: 'gap', path: 'VStack', a: '12', b: '16' },
    ])
  })

  it('walks ancestors for the path: VStack > Text · "Monthly"', () => {
    const a = [
      node({ id: 'a0', role: 'VStack', label: 'VStack' }),
      node({ id: 'a1', parent: 'a0', role: 'HStack', label: 'HStack' }),
      node({ id: 'a2', parent: 'a1', role: 'Text', label: 'Text · "Monthly"', text: 'Monthly' }),
    ]
    const b = [...a.slice(0, 2), node({ ...a[2]!, id: 'b2', text: 'Yearly', label: 'Text · "Monthly"' })]
    expect(diffSpecs(a, b)).toEqual([
      { kind: 'text', path: 'VStack > HStack > Text · "Monthly"', a: 'Monthly', b: 'Yearly' },
    ])
  })

  it('emits one role row for a role mismatch and still compares the numeric fields', () => {
    const a = tree('Monthly', 12, 'Text')
    const b = tree('Monthly', 16, 'Button')
    // rows stay in document order: the parent's gap reads before the child's role
    expect(diffSpecs(a, b)).toEqual([
      { kind: 'gap', path: 'VStack', a: '12', b: '16' },
      { kind: 'role', path: 'VStack > Text · "Monthly"', a: 'Text', b: 'Button' },
    ])
  })

  it('handles different tree lengths without crashing: one role row per unpaired node', () => {
    const a = tree('Monthly', 12)
    const b = [...tree('Monthly', 12), node({ id: 'b9', depth: 0, role: 'Circle', label: 'Circle' })]
    expect(diffSpecs(a, b)).toEqual([
      { kind: 'role', path: 'Circle', a: null, b: 'Circle' },
    ])
    expect(diffSpecs(b, a)).toEqual([
      { kind: 'role', path: 'Circle', a: 'Circle', b: null },
    ])
  })

  it('ignores rounding noise below 1 decimal (12 vs 12.04)', () => {
    const a = tree('Monthly', 12)
    const b = tree('Monthly', 12.04)
    expect(diffSpecs(a, b)).toEqual([])
    // …but 12.06 rounds to 12.1 and is real drift
    expect(diffSpecs(a, tree('Monthly', 12.06))).toEqual([
      { kind: 'gap', path: 'VStack', a: '12', b: '12.1' },
    ])
  })

  it('reports text drift, and never a row when both sides are blank', () => {
    expect(diffSpecs(tree('Monthly', 12), tree('Yearly', 12))).toEqual([
      { kind: 'text', path: 'VStack > Text · "Monthly"', a: 'Monthly', b: 'Yearly' },
    ])
    expect(diffSpecs(tree('   ', 12), tree('', 12))).toEqual([])
  })

  it('treats a field present on one side only as drift, but two absent fields as equal', () => {
    const noType = tree('Monthly', 12)
    noType[1] = node({ ...noType[1]!, typography: null })
    expect(diffSpecs(noType, tree('Monthly', 12))).toEqual([
      { kind: 'fontSize', path: 'VStack > Text · "Monthly"', a: null, b: '14' },
      { kind: 'fontWeight', path: 'VStack > Text · "Monthly"', a: null, b: '500' },
      { kind: 'lineHeight', path: 'VStack > Text · "Monthly"', a: null, b: '20' },
      { kind: 'letterSpacing', path: 'VStack > Text · "Monthly"', a: null, b: '0' },
      { kind: 'color', path: 'VStack > Text · "Monthly"', a: null, b: '#000000' },
    ])
    // both containers carry no typography at all → silence
    expect(diffSpecs([node({ id: 'a0' })], [node({ id: 'b0' })])).toEqual([])
  })

  it('compares box, padding, radius and background as single composite rows', () => {
    const a = [
      node({
        id: 'a0',
        role: 'Capsule',
        label: 'Capsule',
        padding: { top: 12, right: 12, bottom: 12, left: 12 },
      }),
    ]
    const b = [
      node({
        id: 'b0',
        role: 'Capsule',
        label: 'Capsule',
        box: { x: 0, y: 0, w: 120, h: 20 },
        padding: { top: 12, right: 16, bottom: 12, left: 16 },
        surface: {
          ...node({}).surface,
          backgroundHex: '#ffffff',
          backgroundAlpha: 1,
          radius: 8,
        },
      }),
    ]
    expect(diffSpecs(a, b)).toEqual([
      { kind: 'box', path: 'Capsule', a: '100 × 20', b: '120 × 20' },
      { kind: 'padding', path: 'Capsule', a: 'all 12', b: 'top 12 right 16 bottom 12 left 16' },
      { kind: 'radius', path: 'Capsule', a: '0', b: '8' },
      { kind: 'background', path: 'Capsule', a: null, b: '#ffffff' },
    ])
  })

  it('caps its output at DRIFT_ROW_CAP rows', () => {
    const many = (gap: number) =>
      Array.from({ length: DRIFT_ROW_CAP + 50 }, (_, i) =>
        node({ id: `n${i}`, role: 'HStack', label: `HStack ${i}`, layout: { ...node({}).layout, gap } }),
      )
    expect(diffSpecs(many(12), many(16))).toHaveLength(DRIFT_ROW_CAP)
  })
})

describe('driftCounts', () => {
  it('orders by frequency, ties by the canonical kind order', () => {
    expect(
      driftCounts([
        { kind: 'text', path: 'Text', a: 'a', b: 'b' },
        { kind: 'gap', path: 'VStack', a: '12', b: '16' },
        { kind: 'gap', path: 'HStack', a: '8', b: '12' },
        { kind: 'padding', path: 'VStack', a: 'all 12', b: 'all 16' },
        { kind: 'gap', path: 'Block', a: '4', b: '6' },
        { kind: 'text', path: 'Text 2', a: 'c', b: 'd' },
      ]),
    ).toEqual([
      { kind: 'gap', count: 3 },
      { kind: 'text', count: 2 },
      { kind: 'padding', count: 1 },
    ])
  })

  it('breaks a full tie by the canonical kind order, not by insertion order', () => {
    // inserted text → radius → padding; canonical order is gap, padding, radius, text
    expect(
      driftCounts([
        { kind: 'text', path: 'Text', a: 'a', b: 'b' },
        { kind: 'radius', path: 'Capsule', a: '8', b: '12' },
        { kind: 'padding', path: 'VStack', a: 'all 12', b: 'all 16' },
        { kind: 'gap', path: 'HStack', a: '8', b: '12' },
      ]).map((c) => c.kind),
    ).toEqual(['gap', 'padding', 'radius', 'text'])
  })

  it('is empty for no rows', () => {
    expect(driftCounts([])).toEqual([])
    expect(driftCounts(diffSpecs(tree('Monthly', 12), tree('Monthly', 12)))).toEqual([])
  })
})
