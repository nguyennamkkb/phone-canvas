import { describe, expect, it } from 'vitest'

import { BRIDGE_VERSION, isRawNode, isRawPayload } from './validate.ts'

const node = {
  id: 'e0',
  tag: 'div',
  parent: null,
  depth: 0,
  text: 'hi',
  textLength: 2,
  ownText: 'hi',
  childCount: 0,
  box: { x: 0, y: 0, w: 100, h: 20 },
  scroll: { x: false, y: false },
  attrs: { src: '', alt: '', symbol: '', asset: '', iconSrc: '' },
  css: { display: 'block', fontSize: 16 },
}

const base = { pc: true, v: BRIDGE_VERSION, nodeId: 'n1', token: 't1' }

describe('isRawPayload — valid bridge traffic passes through', () => {
  it('accepts a full spec payload', () => {
    expect(isRawPayload({ ...base, type: 'spec', nodes: [node], device: { w: 390, h: 844 } })).toBe(true)
  })

  it('accepts spec nodes with only the fields the parent reads', () => {
    const minimal = { id: 'e1', tag: 'span', parent: 'e0', box: { x: 1, y: 2, w: 3, h: 4 }, css: {} }
    expect(isRawNode(minimal)).toBe(true)
    expect(isRawPayload({ ...base, type: 'spec', nodes: [minimal] })).toBe(true)
  })

  it('accepts height and select payloads', () => {
    expect(isRawPayload({ ...base, type: 'height', value: 844, content: 1200 })).toBe(true)
    expect(isRawPayload({ ...base, type: 'select', id: 'e0' })).toBe(true)
    expect(isRawPayload({ ...base, type: 'select', id: null })).toBe(true)
  })

  it('accepts ready', () => {
    expect(isRawPayload({ ...base, type: 'ready' })).toBe(true)
  })
})

describe('isRawPayload — malformed payloads are dropped', () => {
  it('rejects missing nodes / non-array nodes', () => {
    expect(isRawPayload({ ...base, type: 'spec' })).toBe(false)
    expect(isRawPayload({ ...base, type: 'spec', nodes: 'e0' })).toBe(false)
    expect(isRawPayload({ ...base, type: 'spec', nodes: null })).toBe(false)
  })

  it('rejects nodes missing box or css', () => {
    const { box: _b, ...noBox } = node
    const { css: _c, ...noCss } = node
    expect(isRawPayload({ ...base, type: 'spec', nodes: [noBox] })).toBe(false)
    expect(isRawPayload({ ...base, type: 'spec', nodes: [noCss] })).toBe(false)
  })

  it('rejects wrong node field types', () => {
    expect(isRawNode({ ...node, id: 7 })).toBe(false)
    expect(isRawNode({ ...node, parent: 7 })).toBe(false)
    expect(isRawNode({ ...node, box: { x: 0, y: 0, w: '100', h: 20 } })).toBe(false)
    expect(isRawNode({ ...node, box: { x: 0, y: 0, w: NaN, h: 20 } })).toBe(false)
    expect(isRawNode({ ...node, css: [] })).toBe(false)
    expect(isRawNode(null)).toBe(false)
  })

  it('rejects one bad node among good ones', () => {
    expect(isRawPayload({ ...base, type: 'spec', nodes: [node, { id: 'e1' }] })).toBe(false)
  })

  it('rejects wrong body types per message type', () => {
    expect(isRawPayload({ ...base, type: 'height', value: '844', content: 1200 })).toBe(false)
    expect(isRawPayload({ ...base, type: 'height', value: 844 })).toBe(false)
    expect(isRawPayload({ ...base, type: 'select', id: 7 })).toBe(false)
    expect(isRawPayload({ ...base, type: 'select' })).toBe(false)
  })

  it('rejects wrong or missing version', () => {
    expect(isRawPayload({ ...base, v: 2, type: 'ready' })).toBe(false)
    expect(isRawPayload({ ...base, v: '1', type: 'ready' })).toBe(false)
    const { v: _v, ...noV } = { ...base, type: 'ready' }
    expect(isRawPayload(noV)).toBe(false)
  })

  it('rejects bad routing fields and unknown types', () => {
    expect(isRawPayload({ ...base, pc: false, type: 'ready' })).toBe(false)
    expect(isRawPayload({ ...base, nodeId: 7, type: 'ready' })).toBe(false)
    expect(isRawPayload({ ...base, token: null, type: 'ready' })).toBe(false)
    expect(isRawPayload({ ...base, type: 'selectFromPanel', id: 'e0' })).toBe(false)
    expect(isRawPayload({ ...base, type: 'recapture' })).toBe(false)
    expect(isRawPayload(null)).toBe(false)
    expect(isRawPayload('pc')).toBe(false)
    expect(isRawPayload([])).toBe(false)
  })
})
