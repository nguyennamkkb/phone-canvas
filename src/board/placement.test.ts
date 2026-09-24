import { describe, expect, it } from 'vitest'
import { nextSlotX, nodeOuterWidth, rightEdge } from './placement'

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
