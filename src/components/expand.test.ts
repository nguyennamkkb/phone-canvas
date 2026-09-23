import { describe, expect, it } from 'vitest'
import { expandComponents } from './expand'

const C = {
  tab: '<nav class="tab">Home</nav>',
  card: '<div class="card"><!-- @component tab --></div>',
  a: '<!-- @component b -->',
  b: '<!-- @component a -->',
}

describe('expandComponents', () => {
  it('replaces a placeholder with the component html', () => {
    const { html, errors } = expandComponents('<div><!-- @component tab --></div>', C)
    expect(html).toBe('<div><nav class="tab">Home</nav></div>')
    expect(errors).toEqual([])
  })

  it('expands nested components', () => {
    const { html, errors } = expandComponents('<!-- @component card -->', C)
    expect(html).toBe('<div class="card"><nav class="tab">Home</nav></div>')
    expect(errors).toEqual([])
  })

  it('leaves html without placeholders untouched', () => {
    const src = '<div class="plain">hi</div>'
    expect(expandComponents(src, C).html).toBe(src)
  })

  it('reports a missing id and keeps the placeholder', () => {
    const src = '<!-- @component nope -->'
    const { html, errors } = expandComponents(src, C)
    expect(html).toBe(src)
    expect(errors).toEqual([{ kind: 'missing', id: 'nope' }])
  })

  it('reports a cycle without hanging, and de-dupes the error', () => {
    const { html, errors } = expandComponents('<!-- @component a -->', C)
    expect(errors.filter((e) => e.kind === 'cycle')).toHaveLength(1)
    // the cycle point is left as a comment; the outer chain is expanded
    expect(html).toContain('<!-- @component a -->')
  })

  it('stops past the depth limit', () => {
    // self-including chain: each level is a fresh id so it is not a cycle
    const deep: Record<string, string> = {}
    for (let i = 0; i < 30; i++) deep[`c${i}`] = `<!-- @component c${i + 1} -->`
    deep.c30 = '<b>end</b>'
    const { errors } = expandComponents('<!-- @component c0 -->', deep)
    expect(errors.some((e) => e.kind === 'depth')).toBe(true)
  })
})
