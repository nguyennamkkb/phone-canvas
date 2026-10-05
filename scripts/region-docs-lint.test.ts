import { describe, expect, it } from 'vitest'

import { docViolations } from './region-docs-lint.ts'

const codes = (text: string) => docViolations(text).map((v) => v.code)

describe('region-docs lint', () => {
  it('flags bare 44/68/16 pt numbers (touch floor / tab bar / gutter)', () => {
    expect(codes('every control renders ≥ 44 × 44 pt')).toContain('docs-region-pt')
    expect(codes('the tab bar is 68 pt tall')).toContain('docs-region-pt')
    expect(codes('content uses a 16 pt gutter')).toContain('docs-region-pt')
  })

  it('flags touch rects, split ratios and the destination range', () => {
    expect(codes('every rect is ≥ 44 × 44')).toContain('docs-region-rect')
    expect(codes('a folded split is 50/50')).toContain('docs-region-ratio')
    expect(codes('declared 1:2 but painted 41:59')).toContain('docs-region-ratio')
    expect(codes('tab bar 3–5 and labelled')).toContain('docs-region-tabs')
  })

  it('flags device sizes in pt or WxH form', () => {
    expect(codes('boards open at 820 pt')).toContain('docs-region-device')
    expect(codes('390×844 means it fits')).toContain('docs-region-device')
    expect(codes('`390 × 863` content height')).toContain('docs-region-device')
  })

  it('passes on linked prose with no restated numbers', () => {
    expect(docViolations('the touch floor lives in `openspec/specs/screen-regions/`')).toEqual([])
    expect(docViolations('sizes in `src/frame/devices.ts`; rules in the spec')).toEqual([])
  })

  it('a keep marker excuses a line about what a tier checks', () => {
    expect(docViolations('audit guards 44 pt targets <!-- lint-docs: keep -->')).toEqual([])
    expect(docViolations('44 pt targets without a marker')).not.toEqual([])
  })

  it('ignores lookalikes: times, contrast, type sizes, tokens, grid', () => {
    expect(docViolations('trailing text `09:12`')).toEqual([])
    expect(docViolations('black chrome is ~5.3:1 there')).toEqual([])
    expect(docViolations('headline at `700 48px`')).toEqual([])
    expect(docViolations('padding `var(--s4)`')).toEqual([])
    expect(docViolations('on the 4/8 pt grid')).toEqual([])
  })

  it('reports 1-based line numbers', () => {
    expect(docViolations('clean line\ntab bar 68 pt here')).toEqual([
      { line: 2, code: 'docs-region-pt', hit: '68 pt', fix: expect.any(String) },
    ])
  })
})
