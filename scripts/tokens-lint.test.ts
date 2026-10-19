import { describe, expect, it } from 'vitest'

import {
  backgroundGeometryErrors,
  darkBlockViolations,
  leftoverHardColors,
  noLiteralViolations,
  parseModeVars,
  tokenColorName,
} from './tokens-lint.ts'

const ENTRIES: Array<[string, string]> = [
  ['--card', '#ffffff'],
  ['--bg', '#ffffff'],
  ['--label', '#000000'],
]

describe('backgroundGeometryErrors', () => {
  const bg = (over: Partial<Record<'image' | 'size' | 'position' | 'repeat', string>> = {}) => ({
    image: 'url(/project/x/assets/a.png)',
    size: 'cover',
    position: 'center',
    repeat: 'no-repeat',
    ...over,
  })

  it('accepts the mandated geometry', () => {
    expect(backgroundGeometryErrors(bg())).toEqual([])
  })

  it('ignores a screen with no root background image', () => {
    expect(backgroundGeometryErrors(bg({ image: 'none' }))).toEqual([])
  })

  it('requires background-position: center (otherwise .screen offsets against .device)', () => {
    expect(backgroundGeometryErrors(bg({ position: 'top' })).join(' ')).toContain('position: center')
    expect(backgroundGeometryErrors(bg({ position: '' })).join(' ')).toContain('position: center')
  })

  it('requires cover and no-repeat', () => {
    expect(backgroundGeometryErrors(bg({ size: 'contain' })).join(' ')).toContain('size: cover')
    expect(backgroundGeometryErrors(bg({ repeat: 'repeat' })).join(' ')).toContain('repeat: no-repeat')
  })
})

describe('parseModeVars', () => {
  it('splits light vars from every dark block, keeping file lines', () => {
    const css = `:root {\n  --bg: #ffffff;\n}\n:root[data-theme='dark'] {\n  --bg: #000000;\n}\n`
    const { light, dark, ownTwin, darkRootDecls } = parseModeVars(css)
    expect(light.get('--bg')).toMatchObject({ value: '#ffffff', line: 2 })
    expect(dark.get('--bg')).toMatchObject({ value: '#000000', line: 5 })
    expect(ownTwin.size).toBe(0)
    expect(darkRootDecls).toEqual([{ name: '--bg', value: '#000000', line: 5, combined: false }])
  })

  it('measures lines against the original text, not the comment-masked copy', () => {
    // the mask blanks a whole comment including its newlines, so a line taken
    // from it drifts by the number of comment lines above the declaration
    const css = `/* two\n   comment lines */\n:root {\n  --bg: #ffffff;\n}\n:root[data-theme='dark'] {\n  --bg: #ffffff;\n}\n`
    const { rootLight, darkRootDecls } = parseModeVars(css)
    expect(rootLight.get('--bg')?.line).toBe(4)
    expect(darkRootDecls[0]?.line).toBe(7)
  })

  it('treats a combined :root + dark rule as its own twin', () => {
    const css = `:root,\n:root[data-theme='dark'] {\n  --paper: #faf8f5;\n}\n`
    const { light, dark, ownTwin } = parseModeVars(css)
    expect(light.has('--paper')).toBe(true)
    expect(dark.has('--paper')).toBe(true)
    expect(ownTwin.has('--paper')).toBe(true)
  })

  it('counts scoped dark rules as twins', () => {
    const css = `:root {\n  --bg: #f2f2f7;\n}\n:root[data-theme='dark'] .app-mood {\n  --bg: #101418;\n}\n`
    const { dark } = parseModeVars(css)
    expect(dark.get('--bg')?.value).toBe('#101418')
  })
})

describe('tokenColorName', () => {
  it('names the first matching token, so project aliases win ties', () => {
    expect(tokenColorName(ENTRIES, '#ffffff')).toBe('--card')
    expect(tokenColorName(ENTRIES, 'rgb(0, 0, 0)')).toBe('--label')
  })

  it('returns null for colors with no token and for non-colors', () => {
    expect(tokenColorName(ENTRIES, '#010203')).toBeNull()
    expect(tokenColorName(ENTRIES, 'var(--s4)')).toBeNull()
  })
})

const SCREEN = (style: string) => `<div class="screen"><style>${style}</style></div>`

describe('noLiteralViolations', () => {
  it('flags color/spacing/radius literals with the token fix hint', () => {
    const html = SCREEN(`.a {\n  color: #ffffff;\n  padding: 16px;\n  border-radius: 12px;\n}`)
    const found = noLiteralViolations(html, 'project/x/screens/y.html', ENTRIES)
    expect(found.map((v) => v.message)).toEqual([
      'project/x/screens/y.html:2  màu cứng #ffffff — dùng var(--card)',
      'project/x/screens/y.html:3  padding cứng 16px — dùng var(--s4)',
      'project/x/screens/y.html:4  border-radius cứng 12px — dùng var(--r-md)',
    ])
  })

  it('flags literals inside style="" attributes with file lines', () => {
    const html = `<div class="screen">\n<span style="color: #000000"></span>\n</div>`
    const found = noLiteralViolations(html, 'f.html', ENTRIES)
    expect(found).toHaveLength(1)
    expect(found[0]?.message).toContain('f.html:2')
    expect(found[0]?.message).toContain('var(--label)')
  })

  it('leaves tokenized, bespoke-geometry, and token-less values alone', () => {
    const html = SCREEN([
      '.a { color: var(--card); }',
      '.b { font-size: 19px; line-height: 24px; letter-spacing: -0.4px; }',
      '.c { width: 52px; gap: 2px; padding: 0; }',
      '.d { --local: #ffffff; color: var(--local); }',
      '.e { width: calc(100% - 16px); }',
      '.f { color: #010203; }',
      '/* padding: 16px in a comment is not a declaration */',
    ].join('\n'))
    expect(noLiteralViolations(html, 'f.html', ENTRIES)).toEqual([])
  })
})

describe('leftoverHardColors', () => {
  it('ignores definition-sites but still flags the same value at a use-site', () => {
    const definedOnly = SCREEN(':root { --gp-paper: #fbf8ff; } .a { color: var(--gp-paper); }')
    expect(leftoverHardColors(definedOnly)).toEqual([])
    const reused = SCREEN(':root { --gp-paper: #fbf8ff; } .a { color: #fbf8ff; }')
    expect(leftoverHardColors(reused)).toEqual(['#fbf8ff'])
  })

  it('flags rgba use-sites while ignoring rgba in definitions', () => {
    const html = SCREEN(':root { --shadow: 0 5px 14px rgba(53, 67, 113, 0.09); } .a { box-shadow: 0 5px 14px rgba(53, 67, 113, 0.09); }')
    expect(leftoverHardColors(html)).toEqual(['rgba(…)'])
  })
})


describe('darkBlockViolations', () => {
  it('flags a dark token repeating its base :root value, naming both lines and the fix', () => {
    const css = `:root {\n  --bg: #ffffff;\n  --cta: #007aff;\n}\n:root[data-theme='dark'] {\n  --bg: #ffffff;\n  --cta: #0a84ff;\n}\n`
    const found = darkBlockViolations('demo', css)
    expect(found).toHaveLength(1)
    expect(found[0]?.message).toBe(
      `project/demo/tokens.css:6  --bg trùng base :root:2 — xoá khỏi dark, giữ ở base`,
    )
  })

  it('treats a whitespace-only difference as the same value', () => {
    const css = `:root {\n  --shadow: 0 1px 2px rgba(0, 0, 0, 0.1);\n}\n:root[data-theme='dark'] {\n  --shadow:  0 1px 2px    rgba(0, 0, 0, 0.1);\n}\n`
    expect(darkBlockViolations('demo', css)).toHaveLength(1)
  })

  it('flags a dark-only token: the base :root never declares it', () => {
    const css = `:root {\n  --bg: #ffffff;\n}\n:root[data-theme='dark'] {\n  --bg: #101418;\n  --ink: #f4f4f8;\n}\n`
    const found = darkBlockViolations('demo', css)
    expect(found).toHaveLength(1)
    expect(found[0]?.message).toBe(
      `project/demo/tokens.css:6  --ink chỉ có ở dark, thiếu base :root — thêm vào base rồi để dark override`,
    )
  })

  it('passes real overrides, combined rules, scoped dark rules, and single-mode files', () => {
    const overrides = `:root {\n  --bg: #ffffff;\n}\n:root[data-theme='dark'] {\n  --bg: #101418;\n}\n`
    expect(darkBlockViolations('demo', overrides)).toEqual([])
    // one declaration shared by both modes is not a copy to delete
    const combined = `:root,\n:root[data-theme='dark'] {\n  --paper: #ffffff;\n}\n`
    expect(darkBlockViolations('demo', combined)).toEqual([])
    // scoped dark rules legitimately re-declare tokens for one element, even
    // when the value happens to match base
    const scoped = `:root {\n  --bg: #f2f2f7;\n}\n:root[data-theme='dark'] .app-mood {\n  --bg: #f2f2f7;\n}\n`
    expect(darkBlockViolations('demo', scoped)).toEqual([])
    const singleMode = `:root {\n  --bg: #0a0618;\n}\n`
    expect(darkBlockViolations('demo', singleMode)).toEqual([])
  })
})
