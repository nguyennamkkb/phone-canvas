import { describe, expect, it, vi } from 'vitest'
import { activeTabOf, composeScreenDoc, screenBgOf } from './compose'
import * as legacy from './compose.legacy'
import { DEVICES, getDevice } from '../frame/devices'
import { SCREENS, componentMap } from '../projects/registry'

const device = DEVICES[0]

describe('composeScreenDoc', () => {
  it('builds the 3-band shell in stylesheet order', () => {
    const html = composeScreenDoc({
      html: '<div class="screen"></div>',
      device,
      stylesheets: ['/* tokens */', '/* icons */'],
    })
    expect(html).toContain('<div class="statusbar"')
    expect(html).toContain('<div class="viewport"><div class="screen"></div></div>')
    expect(html).toContain('home-indicator')
    const a = html.indexOf('/* tokens */')
    const b = html.indexOf('/* icons */')
    expect(a).toBeGreaterThan(-1)
    expect(b).toBeGreaterThan(a)
  })

  it('omits the bridge for exports and inlines it for the app', () => {
    const clean = composeScreenDoc({ html: '', device, stylesheets: [], bridgeJs: null })
    expect(clean).not.toContain('data-pc-id')
    expect(clean).not.toContain('<script>')
    const live = composeScreenDoc({
      html: '',
      device,
      stylesheets: [],
      bridgeJs: 'var x = 1;',
      nodeId: 'n1',
      token: 't1',
    })
    expect(live).toContain('<script>var x = 1;</script>')
    expect(live).toContain('data-node-id="n1"')
    expect(live).toContain('data-node-token="t1"')
  })

  it('sets the dark theme attribute only in dark mode', () => {
    expect(composeScreenDoc({ html: '', device, stylesheets: [], theme: 'dark' })).toContain(
      'data-theme="dark"',
    )
    expect(composeScreenDoc({ html: '', device, stylesheets: [], theme: 'light' })).not.toContain(
      'data-theme',
    )
  })

  it('expands @component placeholders into the viewport', () => {
    const html = composeScreenDoc({
      html: '<div><!-- @component tab --></div>',
      device,
      stylesheets: [],
      components: { tab: '<nav class="tab">Home</nav>' },
    })
    expect(html).toContain('<div class="viewport"><div><nav class="tab">Home</nav></div></div>')
    expect(html).not.toContain('@component')
  })

  it('drops the OS chrome in bare mode (component preview)', () => {
    const html = composeScreenDoc({ html: '<div></div>', device, stylesheets: [], bare: true })
    expect(html).toContain('class="device is-bare"')
    expect(html).not.toContain('<div class="statusbar"')
    expect(html).not.toContain('<div class="home-indicator">')
  })

  it('produces an identical document for identical inputs (app/export parity)', () => {
    const args = {
      html: '<div><!-- @component tab --></div>',
      device,
      stylesheets: ['/* tokens */'],
      components: { tab: '<nav class="tab">Home</nav>' },
      theme: 'light' as const,
    }
    expect(composeScreenDoc(args)).toBe(composeScreenDoc({ ...args }))
  })

  it('composes the iPad shell at tablet width with the viewport meta intact', () => {
    const ipad = getDevice('ipad-11')
    expect(ipad.width).toBe(820)
    const html = composeScreenDoc({ html: '<div class="screen"></div>', device: ipad, stylesheets: [] })
    expect(html).toContain('--device-w: 820px')
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">')
    expect(html).toContain('<div class="statusbar"')
  })
})

describe('composeScreenDoc · shell-owned bands (v2)', () => {
  const slotted = {
    html:
      '<div class="screen" style="background-color: var(--bg)">' +
      '<div class="body"><button data-tab="home" class="tab">Home</button><button data-tab="scan" class="tab">Scan</button></div>' +
      '<button data-slot="right" class="pill-soft">5 ngày</button>' +
      '<button data-slot="back" aria-label="Quay lại"><span data-symbol="chevron.left"></span></button>' +
      '<span data-slot="title" class="nav-title">Hôm nay</span>' +
      '</div>',
    device,
    stylesheets: [],
  }

  it('hoists data-slot into .region-nav in back · title · right order, whatever the author wrote', () => {
    const html = composeScreenDoc(slotted)
    expect(html).toContain('<nav class="region-nav"')
    const back = html.indexOf('data-slot="back"')
    const title = html.indexOf('data-slot="title"')
    const right = html.indexOf('data-slot="right"')
    expect(back).toBeGreaterThan(-1)
    expect(back).toBeLessThan(title)
    expect(title).toBeLessThan(right)
  })

  it('hoists data-tab into .region-tabs in document order', () => {
    const html = composeScreenDoc(slotted)
    expect(html).toContain('<nav class="region-tabs"')
    expect(html.indexOf('>Home<')).toBeLessThan(html.indexOf('>Scan<'))
  })

  it('places the bands inside .viewport and outside .screen', () => {
    const html = composeScreenDoc(slotted)
    const viewport = html.indexOf('<div class="viewport">')
    const nav = html.indexOf('<nav class="region-nav"')
    const screen = html.indexOf('<div class="screen')
    const tabs = html.indexOf('<nav class="region-tabs"')
    expect(viewport).toBeLessThan(nav)
    expect(nav).toBeLessThan(screen)
    expect(screen).toBeLessThan(tabs)
  })

  it('builds no bands when the screen declares no slot', () => {
    const html = composeScreenDoc({
      html: '<div class="screen"><div class="body"></div></div>',
      device,
      stylesheets: [],
    })
    expect(html).not.toContain('region-nav')
    expect(html).not.toContain('region-tabs')
  })

  it('lifts slot content out of .screen and leaves the root background intact', () => {
    const html = composeScreenDoc(slotted)
    // the root background is still replayed onto .device (screenBgOf ran on the
    // post-lift markup, which keeps the `.screen` root tag)
    expect(html).toContain('style="background-color: var(--bg);"')
    const screenChunk = html.slice(html.indexOf('<div class="screen'), html.indexOf('<nav class="region-tabs"'))
    expect(screenChunk).not.toContain('data-slot="back"')
    expect(screenChunk).not.toContain('data-tab=')
  })

  it('keeps slot markup untouched in bare mode (component preview)', () => {
    const html = composeScreenDoc({ ...slotted, bare: true })
    expect(html).not.toContain('region-nav')
    expect(html).not.toContain('region-tabs')
    expect(html).toContain('data-slot="back"')
  })
})

describe('composeScreenDoc · shared chrome', () => {
  const components = {
    'app-nav':
      '<button data-slot="back" aria-label="Quay lại"><span data-symbol="chevron.left"></span></button>' +
      '<span data-slot="title" class="nav-title">Tiêu đề mặc định</span>',
    'app-tabs':
      '<button data-tab="home" class="tab">Home</button>' +
      '<button data-tab="diary" class="tab">Diary</button>',
  }
  const compose = (html: string) => composeScreenDoc({ html, device, stylesheets: [], components })

  it('emits both bands as <nav> with a label, so the author never names them', () => {
    const html = compose(
      '<div class="screen"><div class="body"></div>' +
        '<span data-slot="title">Hôm nay</span><button data-tab="home" class="tab">Home</button></div>',
    )
    expect(html).toContain('<nav class="region-nav" aria-label="Điều hướng">')
    expect(html).toContain('<nav class="region-tabs" aria-label="Thanh tab">')
  })

  it('lets the screen win a slot the component also declares', () => {
    const html = compose(
      '<div class="screen"><div class="body"></div>' +
        '<span data-slot="title">Xác nhận món</span><!-- @component app-nav --></div>',
    )
    expect(html).toContain('Xác nhận món')
    expect(html).not.toContain('Tiêu đề mặc định')
    // the slot the screen did not declare still comes from the component
    expect(html).toContain('data-slot="back"')
  })

  it('treats an empty screen slot as a deliberate blank that blocks the default', () => {
    const html = compose(
      '<div class="screen"><div class="body"></div>' +
        '<span data-slot="title"></span><!-- @component app-nav --></div>',
    )
    expect(html).toContain('<div class="nav-slot-title">')
    expect(html).not.toContain('Tiêu đề mặc định')
  })

  it('fills the whole nav from the component when the screen declares none', () => {
    const html = compose('<div class="screen"><div class="body"></div><!-- @component app-nav --></div>')
    expect(html).toContain('<div class="nav-slot-back">')
    expect(html).toContain('<div class="nav-slot-title">')
    expect(html).toContain('Tiêu đề mặc định')
  })

  it('names several slots on one element, in either separator style', () => {
    const spaced = compose(
      '<div class="screen"><div class="body"></div><span data-slot="back title" class="nav-title">Cả hai</span></div>',
    )
    expect(spaced).toContain('<div class="nav-slot-back">')
    expect(spaced).toContain('<div class="nav-slot-title">')
    const piped = compose(
      '<div class="screen"><div class="body"></div><span data-slot="back|title" class="nav-title">Cả hai</span></div>',
    )
    expect(piped).toContain('<div class="nav-slot-back">')
    expect(piped).toContain('<div class="nav-slot-title">')
  })

  it('derives the active tab, aria-current and the label from data-tab-active', () => {
    const html = compose(
      '<div class="screen" data-tab-active="diary"><div class="body"></div><!-- @component app-tabs --></div>',
    )
    const band = html.slice(html.indexOf('<nav class="region-tabs"'), html.indexOf('</nav>'))
    const first = band.slice(0, band.indexOf('</button>') + 9)
    const second = band.slice(band.indexOf('<button', band.indexOf('</button>')))
    expect(first).not.toContain('is-active')
    expect(first).toContain('aria-label="Home, tab 1 trên 2"')
    expect(second).toContain('is-active')
    expect(second).toContain('aria-current="page"')
    expect(second).toContain('aria-label="Diary, tab 2 trên 2"')
  })

  it('omits any active marker when the screen declares no data-tab-active', () => {
    const html = compose('<div class="screen"><div class="body"></div><!-- @component app-tabs --></div>')
    expect(html).not.toContain('is-active')
    expect(html).not.toContain('aria-current')
  })

  it("lets the screen's own tab list win the whole list over the component's", () => {
    const html = compose(
      '<div class="screen"><div class="body"></div>' +
        '<!-- @component app-tabs --><button data-tab="me" class="tab">Me</button></div>',
    )
    expect(html).toContain('>Me<')
    expect(html).not.toContain('>Diary<')
  })

  it('expands components in bare mode without building a band', () => {
    const html = composeScreenDoc({
      html: '<div class="screen"><div class="body"></div><!-- @component app-nav --></div>',
      device,
      stylesheets: [],
      components,
      bare: true,
    })
    expect(html).toContain('Tiêu đề mặc định')
    expect(html).not.toContain('region-nav')
  })
})

describe('screenBgOf (optional screen background)', () => {
  it('returns empty for a plain screen root', () => {
    expect(screenBgOf('<div class="screen"></div>')).toEqual({ style: '', isDark: false })
    expect(screenBgOf('<div class="screen" style="--mood: var(--mood-4)">x</div>')).toEqual({
      style: '',
      isDark: false,
    })
  })

  it('replays a token background-color onto the device', () => {
    expect(screenBgOf('<div class="screen" style="background-color: var(--sage-soft)">x</div>')).toEqual(
      { style: 'background-color: var(--sage-soft);', isDark: false },
    )
  })

  it('replays an image with fixed cover geometry plus its fallback color', () => {
    const bg = screenBgOf(
      '<div class="screen" style="background-color: var(--bg); background-image: url(/images/pattern.svg); background-size: cover">x</div>',
    )
    expect(bg.style).toContain('background-color: var(--bg);')
    expect(bg.style).toContain('background-image: url(/images/pattern.svg);')
    expect(bg.style).toContain('background-size: cover;')
    expect(bg.style).toContain('background-position: center;')
    expect(bg.style).toContain('background-repeat: no-repeat;')
    expect(bg.isDark).toBe(false)
  })

  it('flags a dark literal fallback so the home bar flips white', () => {
    const bg = screenBgOf('<div class="screen" style="background-color: #000">x</div>')
    expect(bg.isDark).toBe(true)
    const html = composeScreenDoc({ html: '<div class="screen" style="background-color: #000"></div>', device, stylesheets: [] })
    expect(html).toContain('class="device is-dark"')
    expect(html).toContain('style="background-color: #000;"')
    expect(html).toContain('.device.is-dark .home-indicator i')
  })

  it('replays a token background onto .device so the OS strips do not seam', () => {
    // The regression this pins: a screen whose ground is a token (calo-ai sets
    // --bg on .app-mood, the grey Apple ground) leaves .device on the project
    // default unless compose replays the declaration. The audit measures the
    // same thing in a browser, but it skips without one — so this is the test
    // that still runs everywhere.
    const html = composeScreenDoc({
      html: '<div class="screen" style="background-color: var(--bg)">x</div>',
      device,
      stylesheets: [],
    })
    expect(html).toContain('style="background-color: var(--bg);"')
    expect(html.indexOf('class="device"')).toBeLessThan(html.indexOf('class="statusbar'))
  })

  it('ignores shorthand background (lint forces longhand for image designs)', () => {
    expect(screenBgOf('<div class="screen" style="background: #000">x</div>')).toEqual({
      style: '',
      isDark: false,
    })
  })

  it('unquotes url() so the device attribute stays quoteless', () => {
    const bg = screenBgOf(
      '<div class="screen" style=\'background-image: url("/images/a.svg")\'>x</div>',
    )
    expect(bg.style).toContain('url(/images/a.svg)')
  })

  it('rejects unsafe values rather than breaking the device tag', () => {
    expect(screenBgOf('<div class="screen" style=\'background-color: x" onload="y\'>x</div>')).toEqual({
      style: '',
      isDark: false,
    })
  })

  it('leaves the device tag untouched when there is no root background', () => {
    const html = composeScreenDoc({ html: '<div class="screen"></div>', device, stylesheets: [] })
    expect(html).toContain('<div class="device"')
    expect(html).not.toContain('class="device is-dark"')
  })
})

describe('ensureNavButton (nav slot auto-wrap)', () => {
  const doc = (inner: string) =>
    composeScreenDoc({
      html: `<div class="screen"><div class="body">${inner}</div></div>`,
      device,
      stylesheets: [],
    })

  it('bọc chữ/icon trần ở slot back/right thành nút shell', () => {
    const html = doc(
      '<span data-slot="right" class="t-footnote">1.250/1.850 kcal</span>' +
        '<span data-slot="back"><span class="icon" data-symbol="chevron.left"></span></span>',
    )
    expect(html).toContain(
      '<button type="button" class="shell-nav-btn"><span data-slot="right" class="t-footnote">1.250/1.850 kcal</span></button>',
    )
    expect(html).toContain('data-symbol="chevron.left"></span></span></button>')
  })

  it('giữ nguyên nút tác giả viết và không bọc title', () => {
    const html = doc(
      '<button data-slot="right" class="nav-round" aria-label="Chụp"><span class="icon"></span></button>' +
        '<span data-slot="title" class="t-headline">Xác nhận món</span>',
    )
    expect(html).not.toContain('shell-nav-btn"><button')
    expect(html).toContain('<div class="nav-slot-title"><span data-slot="title" class="t-headline">Xác nhận món</span></div>')
  })

  it('không bọc lồng khi ruột đã có control', () => {
    const html = doc(
      '<div data-slot="right" class="row"><button class="pill-soft" aria-label="Streak">5 ngày</button></div>',
    )
    expect(html).not.toContain('shell-nav-btn')
    expect(html).toContain('<div class="nav-slot-right"><div data-slot="right" class="row">')
  })
})

describe('composeScreenDoc · parse5 parser (core-hardening §2)', () => {
  const compose = (html: string) => composeScreenDoc({ html, device, stylesheets: [] })
  const driftPoints = (fn: () => void): string[] => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      fn()
      return warn.mock.calls.map((args) => String(args[0]))
    } finally {
      warn.mockRestore()
    }
  }

  it('lifts unquoted attributes, keeping the author bytes verbatim', () => {
    const Moral = driftPoints(() => {
      const html = compose(
        '<div class=screen><div class=body></div><span data-slot=title class=nav-title>Hi</span></div>',
      )
      expect(html).toContain(
        '<div class="nav-slot-title"><span data-slot=title class=nav-title>Hi</span></div>',
      )
    })
    expect(Moral).toEqual([])
  })

  it('reads `>` inside a quoted value as text, not markup', () => {
    const Moral = driftPoints(() => {
      const html = compose(
        '<div class="screen"><div class="body"></div><span data-slot="title" title="a>b">T</span></div>',
      )
      expect(html).toContain('<div class="nav-slot-title"><span data-slot="title" title="a>b">T</span></div>')
    })
    expect(Moral).toEqual([])
  })

  it('lifts nested same-tag elements as one outer unit', () => {
    const Moral = driftPoints(() => {
      const html = compose(
        '<div class="screen"><div class="body"></div><div data-slot="title"><div class="inner">deep</div></div></div>',
      )
      expect(html).toContain(
        '<div class="nav-slot-title"><div data-slot="title"><div class="inner">deep</div></div></div>',
      )
    })
    expect(Moral).toEqual([])
  })

  it('ignores a slot-looking element inside a comment (legacy lifted the ghost)', () => {
    const commented =
      '<div class="screen"><div class="body"></div><!-- <span data-slot="title">Ghost</span> -->' +
      '<span data-slot="title">Real</span></div>'
    expect(legacy.takeAttributed(commented, 'data-slot').items).toHaveLength(2)
    const Moral = driftPoints(() => {
      const html = compose(commented)
      // the comment stays verbatim in the viewport body — it is simply not a
      // slot, so the nav band must only carry the real element
      const nav = html.slice(html.indexOf('<nav class="region-nav"'), html.indexOf('</nav>'))
      expect(nav).toContain('>Real<')
      expect(nav).not.toContain('Ghost')
    })
    expect(Moral.some((w) => w.includes('data-slot:screen'))).toBe(true)
  })

  it('keeps an unclosed non-void carrier instead of dropping its slot', () => {
    const html =
      '<div class="screen"><div class="body"></div>' +
      '<svg viewBox="0 0 10 10"><path data-slot="right" d="M0 0h10"></svg>' +
      '<span data-slot="title">T</span></div>'
    // `<path>` is not a void tag: the regex hunted a `</path>` that never
    // comes and silently dropped the slot
    expect(legacy.takeAttributed(html, 'data-slot').items).toHaveLength(1)
    const Moral = driftPoints(() => {
      const doc = compose(html)
      expect(doc).toContain('<div class="nav-slot-right"><button type="button" class="shell-nav-btn">')
      expect(doc).toContain('<path data-slot="right" d="M0 0h10">')
    })
    expect(Moral.some((w) => w.includes('data-slot:screen'))).toBe(true)
  })

  it('reads data-tab-active off .screen, not out of a comment', () => {
    const html =
      '<!-- data-tab-active="ghost" -->' +
      '<div class="screen" data-tab-active="diary"><div class="body"></div>' +
      '<button data-tab="diary" class="tab">Diary</button></div>'
    expect(activeTabOf(html)).toBe('diary')
    const Moral = driftPoints(() => {
      expect(activeTabOf(html)).toBe('diary')
    })
    expect(Moral.some((w) => w.includes('activeTabOf'))).toBe(true)
  })

  it('derives tab labels without comment markup', () => {
    const Moral = driftPoints(() => {
      const html = compose(
        '<div class="screen" data-tab-active="a"><div class="body"></div>' +
          '<button data-tab="a" class="tab">A<!-- <div> --></button>' +
          '<button data-tab="b" class="tab">B</button></div>',
      )
      // the comment rides along verbatim inside the lifted tab — but the
      // derived label must read the DOM text, not the comment markup
      const firstTab = html.slice(html.indexOf('<nav class="region-tabs"'), html.indexOf('</nav>'))
      const label = /<button[^>]*aria-label="([^"]*)"/.exec(firstTab)?.[1]
      expect(label).toBe('A, tab 1 trên 2')
    })
    expect(Moral.some((w) => w.includes('decorateTabs'))).toBe(true)
  })

  it('finds the .screen root however its class is quoted', () => {
    expect(screenBgOf("<div class='screen' style='background-color: #000'>x</div>")).toEqual({
      style: 'background-color: #000;',
      isDark: true,
    })
    expect(screenBgOf('<div class=screen style="background-color: #000">x</div>').isDark).toBe(true)
    const Moral = driftPoints(() => {
      screenBgOf("<div class='screen' style='background-color: #000'>x</div>")
    })
    expect(Moral.some((w) => w.includes('screenBgOf'))).toBe(true)
  })
})

describe('composeScreenDoc · byte-identical on every current screen', () => {
  it('composes all registered screens with zero parser drift', () => {
    expect(SCREENS.length).toBeGreaterThan(0)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      for (const screen of SCREENS) {
        composeScreenDoc({
          html: screen.html,
          device,
          stylesheets: [],
          components: componentMap(screen.projectId),
        })
      }
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })
})
