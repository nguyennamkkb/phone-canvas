import { describe, expect, it } from 'vitest'
import { countUsage } from './usage'

describe('countUsage', () => {
  it('counts placeholders per screen and per component', () => {
    const sources = {
      home: '<div><!-- @component tab --><!-- @component tab --></div>',
      journal: '<!-- @component tab --><!-- @component row -->',
    }
    const use = countUsage(sources, ['tab', 'row', 'ghost'])
    expect(use).toEqual([
      { id: 'tab', screens: ['home', 'journal'], count: 3 },
      { id: 'row', screens: ['journal'], count: 1 },
      { id: 'ghost', screens: [], count: 0 },
    ])
  })

  it('reports zero for screens that use no component', () => {
    const use = countUsage({ home: '<div>plain</div>' }, ['tab'])
    expect(use).toEqual([{ id: 'tab', screens: [], count: 0 }])
  })
})
