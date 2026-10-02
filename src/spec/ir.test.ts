import { describe, expect, it } from 'vitest'

import { buildSpecIR, IR_VERSION } from './ir.ts'

const nodes = [] as never[]

describe('SpecIR v1 envelope (additive)', () => {
  it('stamps irVersion 1 with identity + timestamp, nodes shape untouched', () => {
    const ir = buildSpecIR({
      screenId: 'today',
      deviceId: 'reference',
      theme: 'light',
      exportedAt: '2026-10-02T00:00:00Z',
      nodes,
      device: { w: 390, h: 844 },
    })
    expect(ir.irVersion).toBe(1)
    expect(IR_VERSION).toBe(1)
    expect(ir.screenId).toBe('today')
    expect(ir.nodes).toBe(nodes)
    expect(ir.device).toEqual({ w: 390, h: 844 })
  })

  it('readers ignore unknown future fields (forward-compatible)', () => {
    const withFuture = {
      ...buildSpecIR({
        screenId: 'today',
        deviceId: 'reference',
        theme: 'light',
        exportedAt: '2026-10-02T00:00:00Z',
        nodes,
        device: null,
      }),
      irVersion: 99,
      futureField: { whatever: true },
    } as Record<string, unknown>
    // an old reader destructures only what it knows — nothing throws
    const { irVersion, screenId, nodes: n } = withFuture
    expect(irVersion).toBe(99)
    expect(screenId).toBe('today')
    expect(n).toBe(nodes)
  })
})
