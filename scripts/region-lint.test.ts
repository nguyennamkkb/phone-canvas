import { readFile } from 'node:fs/promises'
import { beforeAll, describe, expect, it } from 'vitest'

import { describeSkip } from './region-audit.ts'
import {
  REGION_CLASSES,
  chromeViolations,
  deviceLiteralViolations,
  fileIsExempt,
  navbarViolations,
  offSwitchViolations,
  rulesOf,
  screenViolations,
  tabbarViolations,
  touchFloorViolations,
  undeclaredRegionViolations,
  type CssRule,
} from './region-rules.ts'

let tokens: string
let rules: CssRule[]

beforeAll(async () => {
  tokens = await readFile(new URL('../src/screens/tokens.css', import.meta.url), 'utf8')
  rules = rulesOf(tokens)
})

/** a screen with the repo's own wrapper shape: .screen > .body-fixed > … */
const wrap = (inner: string) => `<div class="screen"><div class="body-fixed">${inner}</div></div>`

describe('region vocabulary', () => {
  // A region may be declared as `.rail` or as `.split > .pane-lead`, so match a
  // selector TOKEN rather than the whole string.
  const declares = (cls: string) =>
    rules.some((r) => r.selector.split(/\s*[>+~]\s*/).includes(cls))

  it('declares every region class in the shared stylesheet', () => {
    const missing = REGION_CLASSES.filter((cls) => !declares(cls))
    expect(missing).toEqual([])
  })

  it('keeps every region in flow — a floating band may not be absolute', () => {
    const absolute = REGION_CLASSES.filter((cls) =>
      rules.some(
        (r) => r.selector.split(/\s*[>+~]\s*/).includes(cls) && /position\s*:\s*absolute/.test(r.body),
      ),
    )
    expect(absolute).toEqual([])
  })

  it('names every fixed region metric instead of writing the number twice', () => {
    // 44 pt and 68 pt are the two numbers that must have exactly one home
    const stray = tokens
      .split('\n')
      .map((line, i) => ({ line: i + 1, text: line }))
      .filter(({ text }) => /(44|68)px/.test(text))
      .filter(({ text }) => !/^\s*--[\w-]+:/.test(text))
    expect(stray).toEqual([])
  })
})

describe('chrome redrawn', () => {
  it('rejects a screen that draws its own status bar', () => {
    const html = wrap('<div class="statusbar"><span>9:41</span></div>')
    expect(chromeViolations(html).map((v) => v.code)).toEqual(['chrome-redrawn'])
  })

  it('rejects a screen that draws its own home indicator', () => {
    const html = wrap('<div class="home-indicator"><i></i></div>')
    expect(chromeViolations(html).map((v) => v.code)).toEqual(['chrome-redrawn'])
  })

  it('leaves a screen that declares neither alone', () => {
    expect(chromeViolations(wrap('<div class="paper-card">x</div>'))).toEqual([])
  })
})

describe('undeclared region', () => {
  it('rejects a hand-built top bar', () => {
    const html = wrap(
      '<div class="row" style="justify-content: space-between"><button class="pill-ghost">Hủy</button><span class="t-headline">Tiêu đề</span></div>',
    )
    expect(undeclaredRegionViolations(html, 'phone').map((v) => v.code)).toEqual([
      'region-undeclared',
    ])
  })

  it('rejects a hand-built split between two panes', () => {
    const html = wrap(
      '<div class="row" style="align-items: stretch"><div class="paper-card" style="flex: 1 1 0">a</div><div class="paper-card" style="flex: 2 1 0">b</div></div>',
    )
    expect(undeclaredRegionViolations(html, 'inner').map((v) => v.code)).toEqual([
      'region-undeclared',
    ])
  })

  it('accepts a declared navbar', () => {
    const html = wrap('<div class="navbar"><button class="nav-round"></button><span class="nav-title">T</span></div>')
    expect(undeclaredRegionViolations(html, 'phone')).toEqual([])
  })

  it('accepts a content card that merely holds a button', () => {
    const html = wrap('<div class="hero-card"><button class="pill-soft">5 ngày</button></div>')
    expect(undeclaredRegionViolations(html, 'phone')).toEqual([])
  })

  it('accepts a cover screen that declares its rail', () => {
    const html = wrap(
      '<div class="split"><div class="pane">nội dung</div><div class="rail"><div class="rail-tabs"><button class="rail-item"></button></div></div></div>',
    )
    expect(undeclaredRegionViolations(html, 'cover')).toEqual([])
  })

  it('does not report the same element twice when it is both edges', () => {
    const html = wrap('<div class="row"><button class="nav-round"></button><div class="row"></div></div>')
    expect(undeclaredRegionViolations(html, 'phone').length).toBe(1)
  })
})

describe('navbar anatomy', () => {
  it('rejects more than three actions', () => {
    const html = `<header class="navbar">${'<button class="nav-round"></button>'.repeat(4)}</header>`
    expect(navbarViolations(html).map((v) => v.code)).toEqual(['navbar-too-many-actions'])
  })

  it('rejects a title of 15 characters or more', () => {
    const html = '<header class="navbar"><span class="nav-title">Một tiêu đề rất dài</span></header>'
    expect(navbarViolations(html).map((v) => v.code)).toEqual(['navbar-title-long'])
  })

  it('rejects a push screen whose back is not a standard symbol', () => {
    const html =
      '<header class="navbar"><button aria-label="Quay lại"><span class="icon" data-symbol="arrow.uturn.backward"></span></button></header>'
    expect(navbarViolations(html).map((v) => v.code)).toEqual(['navbar-back-missing'])
  })

  it('accepts a navbar with three actions and a short title', () => {
    const html = `<header class="navbar"><span class="nav-title">Ngắn</span>${'<button class="nav-round"></button>'.repeat(3)}</header>`
    expect(navbarViolations(html)).toEqual([])
  })
})

describe('tab bar', () => {
  it('rejects more than five destinations', () => {
    const html = `<nav class="tabbar">${'<button class="tab"><span>H</span></button>'.repeat(6)}</nav>`
    expect(tabbarViolations(html, 'phone').map((v) => v.code)).toContain('tabbar-too-many')
  })

  it('rejects a destination with no label', () => {
    const html = '<nav class="tabbar"><button class="tab"><span class="icon" data-symbol="house"></span></button></nav>'
    expect(tabbarViolations(html, 'phone').map((v) => v.code)).toEqual(['tabbar-unlabelled'])
  })

  it('accepts the repo shape — icon plus a visible label', () => {
    const html = `<nav class="tabbar">${'<button class="tab"><span class="icon" data-symbol="house"></span><span>Home</span></button>'.repeat(4)}</nav>`
    expect(tabbarViolations(html, 'phone')).toEqual([])
  })

  it('rejects a horizontal tab bar on the cover pose', () => {
    const html = '<nav class="tabbar"><button class="tab"><span>Home</span></button></nav>'
    expect(tabbarViolations(html, 'cover').map((v) => v.code)).toEqual([
      'cover-horizontal-tabbar',
    ])
  })

  it('accepts a cover pose that puts its destinations on the rail', () => {
    const html =
      '<div class="rail"><div class="rail-tabs"><button class="rail-item"><span>Home</span></button></div></div>'
    expect(tabbarViolations(html, 'cover')).toEqual([])
  })
})

describe('touch floor', () => {
  it('rejects a governed class declared under 44 px', () => {
    const css = '.close-btn { width: 30px; height: 30px; }'
    expect(touchFloorViolations(css, 44, {}).map((v) => v.message)).toEqual([
      expect.stringContaining('.close-btn khai báo 30px'),
    ])
  })

  it('accepts a class at exactly 44 px', () => {
    const css = '.icon-btn { width: 44px; height: 44px; }'
    expect(touchFloorViolations(css, 44, {})).toEqual([])
  })

  it('does not mistake line-height for height', () => {
    // an unanchored /height:/ matches inside `line-height: 13px` and once
    // reported a 13 px hit region for a class that was already legal
    const css = '.tab-item { min-height: 44px; line-height: 13px; }'
    expect(touchFloorViolations(css, 44, {})).toEqual([])
  })

  it('honours a parent that guarantees the hit region', () => {
    const css = '.toggle { width: 48px; height: 28px; }'
    expect(touchFloorViolations(css, 44, {})).toHaveLength(1)
    expect(touchFloorViolations(css, 44, { '.toggle': '.action-row is 46px' })).toEqual([])
  })
})

describe('device literal', () => {
  it('rejects px equal to a device width', () => {
    expect(deviceLiteralViolations('<div style="width: 390px"></div>', [390, 844])).toHaveLength(1)
  })

  it('accepts a component-local fixed size', () => {
    expect(deviceLiteralViolations('<div style="width: 44px"></div>', [390, 844])).toEqual([])
  })
})

describe('exemption', () => {
  it('rejects an off switch with no reason', () => {
    expect(offSwitchViolations('<div><!-- lint-region: off --></div>').map((v) => v.code)).toEqual([
      'region-off-without-reason',
    ])
  })

  it('accepts an off switch that states a reason', () => {
    const html = '<!-- lint-region: off — app tự dựng overlay của riêng mình -->'
    expect(offSwitchViolations(html)).toEqual([])
  })

  it('silences every rule when the switch is declared before any element', () => {
    const html = `<!-- pc {"title":"X"} -->\n<!-- lint-region: off — cố ý vẽ vùng OS để minh hoạ -->\n<div class="screen"><div class="statusbar"></div></div>`
    expect(fileIsExempt(html)).toBe(true)
    expect(screenViolations({ html, form: 'phone', deviceWidths: [390] })).toEqual([])
  })

  it('does not treat a mid-file switch as a file exemption', () => {
    const html = `<div class="screen"><div class="body-fixed"><div class="row" style="justify-content: space-between"><button class="nav-round"></button></div></div></div>\n<!-- lint-region: off — lý do -->`
    expect(fileIsExempt(html)).toBe(false)
    expect(screenViolations({ html, form: 'phone', deviceWidths: [390] }).map((v) => v.code)).toEqual(
      ['region-undeclared'],
    )
  })
})

describe('audit without a browser', () => {
  it('says loudly that geometry was NOT checked, and names the fallback test', () => {
    const lines = describeSkip('No Chrome found.')
    expect(lines.join('\n')).toContain('SKIPPED')
    expect(lines.join('\n')).toContain('CHƯA được kiểm')
    expect(lines.join('\n')).toContain('compose.test.ts')
  })
})
