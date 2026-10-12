import { describe, expect, it } from 'vitest'
import { chunkRows, layoutRows, nextSlotX, nodeOuterHeight, nodeOuterWidth, rightEdge, ROW_GAP } from './placement'

const GAP = 120
// reference outer = 390 + 12*2 = 414 · ipad-11 outer = 820 + 16*2 = 852

describe('board column placement (mixed device widths)', () => {
  it('lays phone + iPad + phone out with no overlaps', () => {
    const phone = { position: { x: 0 }, data: { deviceId: 'reference' } }
    expect(nextSlotX([phone], GAP)).toBe(414 + GAP)
    const pad = { position: { x: 414 + GAP }, data: { deviceId: 'ipad-11' } }
    expect(nextSlotX([phone, pad], GAP)).toBe(414 + GAP + 852 + GAP)
  })

  it('starts an empty board at x 0', () => {
    expect(nextSlotX([], GAP)).toBe(0)
    expect(rightEdge([])).toBe(0)
  })

  it('falls back to the default device for unknown ids', () => {
    expect(nodeOuterWidth('nope')).toBe(nodeOuterWidth('reference'))
  })

  it('uses the rightmost edge, not the leftmost max — a wide node never gets covered', () => {
    const wide = { position: { x: 100 }, data: { deviceId: 'ipad-11' } }
    const narrow = { position: { x: 200 }, data: { deviceId: 'reference' } }
    // max left edge is 200, but the wide node reaches 100 + 852 = 952
    expect(rightEdge([wide, narrow])).toBe(100 + 852)
    expect(nextSlotX([wide, narrow], GAP)).toBe(100 + 852 + GAP)
  })
})

describe('board row arrangement (layoutRows)', () => {
  it('lays one row left-to-right with no overlaps, mixed widths', () => {
    const rows = layoutRows([[{ deviceId: 'reference' }, { deviceId: 'ipad-11' }, { deviceId: 'reference' }]], GAP)
    expect(rows).toHaveLength(1)
    const [a, b, c] = rows[0] ?? []
    // reference outer = 414 · ipad-11 outer = 852
    expect(a).toEqual({ x: 0, y: 0 })
    expect(b).toEqual({ x: 414 + GAP, y: 0 })
    expect(c).toEqual({ x: 414 + GAP + 852 + GAP, y: 0 })
  })

  it('stacks a second row below the tallest node of the first, restarting x at 0', () => {
    const rows = layoutRows(
      [[{ deviceId: 'reference' }], [{ deviceId: 'iphone-se' }, { deviceId: 'reference' }]],
      GAP,
    )
    expect(rows).toHaveLength(2)
    // reference outer height = 844 + 12*2 = 868
    const expectedY = nodeOuterHeight('reference') + ROW_GAP
    expect(rows[1]?.[0]).toEqual({ x: 0, y: expectedY })
    expect(rows[1]?.[1]?.y).toBe(expectedY)
    expect(rows[1]?.[1]?.x).toBeGreaterThan(rows[1]?.[0]?.x ?? 0)
  })

  it('is deterministic and skips empty rows', () => {
    const input = [[{ deviceId: 'reference' }], [], [{ deviceId: 'ipad-11' }]]
    expect(layoutRows(input, GAP)).toEqual(layoutRows(input, GAP))
    expect(layoutRows(input, GAP)).toHaveLength(2)
  })

  it('chunkRows cuts evenly, last row shorter, and rejects size < 1', () => {
    expect(chunkRows([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(() => chunkRows([1], 0)).toThrow()
  })
})
