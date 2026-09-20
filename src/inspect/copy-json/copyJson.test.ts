import { describe, expect, it } from 'vitest'
import { PAYLOAD_VERSION, copyPayloadFor } from './copyJson'
import type { SpecNode } from '../../spec/types'

const node = { id: 'e1' } as SpecNode
const list = [node]

describe('copyPayloadFor', () => {
  it('wraps a selection with the payload version', () => {
    expect(copyPayloadFor('n1', list, node)).toEqual({
      version: PAYLOAD_VERSION,
      screen: 'n1',
      selectedElement: node,
    })
  })

  it('wraps a whole screen with the payload version', () => {
    expect(copyPayloadFor('n1', list, null)).toEqual({
      version: PAYLOAD_VERSION,
      screen: 'n1',
      elements: list,
    })
  })
})
