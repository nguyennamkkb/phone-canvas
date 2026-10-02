import { describe, expect, it } from 'vitest'

import { labelCopyText } from './nodeLabel.ts'

/**
 * Progressive-disclosure label (C, 13§5): the only logic separable from the
 * React tree — copy-text derivation. Everything else (overlay, stopPropagation,
 * expand) is structural JSX verified by the 4-op manual test.
 */
describe('labelCopyText', () => {
  it('prefixes the project when known', () => {
    expect(labelCopyText('calo-ai', 'today')).toEqual({ ref: 'calo-ai/today', label: '#calo-ai/today' })
  })

  it('falls back to bare screen id without a project', () => {
    expect(labelCopyText(undefined, 'today')).toEqual({ ref: 'today', label: '#today' })
  })
})
