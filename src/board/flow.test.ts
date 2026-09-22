import { describe, expect, it } from 'vitest'
import type { Edge } from '@xyflow/react'
import { canConnect, edgeLabel, pruneEdges, withLabel } from './flow'

const e = (id: string, source: string, target: string, data?: Record<string, unknown>): Edge =>
  ({ id, source, target, ...(data ? { data } : {}) }) as Edge

describe('canConnect', () => {
  const edges = [e('a', 'n1', 'n2')]
  it('rejects self-loops', () => {
    expect(canConnect([], { source: 'n1', target: 'n1' })).toBe(false)
  })
  it('rejects duplicate pairs', () => {
    expect(canConnect(edges, { source: 'n1', target: 'n2' })).toBe(false)
  })
  it('accepts the reverse direction as a different flow', () => {
    expect(canConnect(edges, { source: 'n2', target: 'n1' })).toBe(true)
  })
  it('rejects missing ends', () => {
    expect(canConnect([], { source: null, target: 'n1' })).toBe(false)
  })
})

describe('pruneEdges', () => {
  it('drops edges pointing at filtered nodes', () => {
    const nodes = [{ id: 'n1' }, { id: 'n2' }]
    const edges = [e('a', 'n1', 'n2'), e('b', 'n1', 'gone'), e('c', 'gone', 'n2')]
    expect(pruneEdges(nodes, edges).map((x) => x.id)).toEqual(['a'])
  })
})

describe('edge labels', () => {
  it('reads legacy unlabeled edges as undefined', () => {
    expect(edgeLabel(e('a', 'n1', 'n2'))).toBeUndefined()
  })
  it('sets and clears the label with its data', () => {
    const named = withLabel(e('a', 'n1', 'n2'), 'tab Journal')
    expect(named.label).toBe('tab Journal')
    expect(edgeLabel(named)).toBe('tab Journal')
    const cleared = withLabel(named, '  ')
    expect(cleared.label).toBeUndefined()
    expect(edgeLabel(cleared)).toBeUndefined()
  })
})
