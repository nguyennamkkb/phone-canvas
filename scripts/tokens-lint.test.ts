import { describe, expect, it } from 'vitest'

import {
  darkTwinViolations,
  noLiteralViolations,
  parseModeVars,
  tokenColorName,
} from './tokens-lint.ts'

const ENTRIES: Array<[string, string]> = [
  ['--card', '#ffffff'],
  ['--bg', '#ffffff'],
  ['--label', '#000000'],
]

describe('parseModeVars', () => {
  it('splits light vars from every dark block, keeping file lines', () => {
    const css = `:root {\n  --bg: #ffffff;\n}\n:root[data-theme='dark'] {\n  --bg: #000000;\n}\n`
    const { light, dark, ownTwin } = parseModeVars(css)
    expect(light.get('--bg')).toMatchObject({ value: '#ffffff', line: 2 })
    expect(dark.get('--bg')).toMatchObject({ value: '#000000', line: 5 })
    expect(ownTwin.size).toBe(0)
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

describe('darkTwinViolations', () => {
  it('fails a light color with no dark twin, naming file:line and the fix', () => {
    const css = `:root {\n  --cta: #007aff;\n}\n:root[data-theme='dark'] {\n  --other: #000;\n}\n`
    const found = darkTwinViolations('demo', css)
    expect(found).toHaveLength(1)
    expect(found[0]?.message).toBe(
      `project/demo/tokens.css:2  --cta thiếu dark twin — thêm vào :root[data-theme='dark']`,
    )
  })

  it('ignores scoped element vars, which never join :root dark switching', () => {
    const css = `:root {\n  --bg: #fff;\n}\n.screen {\n  --faint: rgba(0, 0, 0, 0.5);\n}\n:root[data-theme='dark'] {\n  --bg: #000;\n}\n`
    expect(darkTwinViolations('demo', css)).toEqual([])
  })

  it('passes twins, own-twins, non-colors, and single-mode projects', () => {
    const twinned = `:root {\n  --cta: #007aff;\n  --gap: 8px;\n}\n:root[data-theme='dark'] {\n  --cta: #0a84ff;\n}\n`
    expect(darkTwinViolations('demo', twinned)).toEqual([])
    const ownTwin = `:root,\n:root[data-theme='dark'] {\n  --paper: #ffffff;\n}\n`
    expect(darkTwinViolations('demo', ownTwin)).toEqual([])
    const singleMode = `:root {\n  --bg: #0a0618;\n}\n`
    expect(darkTwinViolations('demo', singleMode)).toEqual([])
  })

  it('honors the allowlist for documented exceptions', () => {
    const css = `:root {\n  --separator: rgba(60, 60, 67, 0.21);\n}\n:root[data-theme='dark'] {\n  --bg: #000;\n}\n`
    expect(darkTwinViolations('scratch-widget', css)).toEqual([])
    expect(darkTwinViolations('other', css)).toHaveLength(1)
  })
})
