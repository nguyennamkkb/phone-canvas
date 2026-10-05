import { describe, expect, it } from 'vitest'

import { shouldAccept, shouldCountDrop } from './route.ts'

const SELF = 'http://board.test'
const entry = { token: 't1' }
const spec = { pc: true, v: 1, nodeId: 'n1', token: 't1', type: 'spec', nodes: [] }

describe('shouldAccept — routing gate', () => {
  it('accepts a valid payload from the registered frame', () => {
    expect(shouldAccept(entry, spec, SELF, SELF)).toBe(true)
  })

  it('ignores foreign origins', () => {
    expect(shouldAccept(entry, spec, 'https://evil.test', SELF)).toBe(false)
  })

  it('ignores wrong tokens and unknown frames', () => {
    expect(shouldAccept({ token: 'other' }, spec, SELF, SELF)).toBe(false)
    expect(shouldAccept(undefined, spec, SELF, SELF)).toBe(false)
  })

  it('ignores malformed payloads even from the right frame', () => {
    const bad = { ...spec, nodes: [{ id: 'e0' }] }
    expect(shouldAccept(entry, bad, SELF, SELF)).toBe(false)
  })
})

describe('shouldCountDrop — visible drops vs silent ignores', () => {
  it('counts malformed payloads from an authenticated frame', () => {
    const bad = { ...spec, nodes: [{ id: 'e0' }] }
    expect(shouldCountDrop(entry, bad, SELF, SELF)).toBe(true)
  })

  it('counts wrong-version payloads that still carry the right token', () => {
    const stale = { ...spec, v: 2 }
    expect(shouldCountDrop(entry, stale, SELF, SELF)).toBe(true)
  })

  it('never counts foreign origins, wrong tokens, or non-bridge traffic', () => {
    const bad = { ...spec, nodes: [{ id: 'e0' }] }
    expect(shouldCountDrop(entry, bad, 'https://evil.test', SELF)).toBe(false)
    expect(shouldCountDrop({ token: 'other' }, bad, SELF, SELF)).toBe(false)
    expect(shouldCountDrop(undefined, bad, SELF, SELF)).toBe(false)
    expect(shouldCountDrop(entry, { type: 'spec' }, SELF, SELF)).toBe(false)
    expect(shouldCountDrop(entry, null, SELF, SELF)).toBe(false)
  })

  it('does not count valid payloads', () => {
    expect(shouldCountDrop(entry, spec, SELF, SELF)).toBe(false)
  })
})
