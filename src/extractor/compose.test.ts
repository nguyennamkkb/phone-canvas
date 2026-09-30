import { describe, expect, it } from 'vitest'
import { composeScreenDoc, screenBgOf } from './compose'
import { DEVICES, getDevice } from '../frame/devices'

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
      '<div class="body"><button data-tab>Home</button><button data-tab>Scan</button></div>' +
      '<button data-slot="right" class="pill-soft">5 ngày</button>' +
      '<button data-slot="back" aria-label="Quay lại"><span data-symbol="chevron.left"></span></button>' +
      '<span data-slot="title" class="nav-title">Hôm nay</span>' +
      '</div>',
    device,
    stylesheets: [],
  }

  it('hoists data-slot into .region-nav in back · title · right order, whatever the author wrote', () => {
    const html = composeScreenDoc(slotted)
    expect(html).toContain('<div class="region-nav">')
    const back = html.indexOf('data-slot="back"')
    const title = html.indexOf('data-slot="title"')
    const right = html.indexOf('data-slot="right"')
    expect(back).toBeGreaterThan(-1)
    expect(back).toBeLessThan(title)
    expect(title).toBeLessThan(right)
  })

  it('hoists data-tab into .region-tabs in document order', () => {
    const html = composeScreenDoc(slotted)
    expect(html).toContain('<div class="region-tabs">')
    expect(html.indexOf('>Home<')).toBeLessThan(html.indexOf('>Scan<'))
  })

  it('places the bands inside .viewport and outside .screen', () => {
    const html = composeScreenDoc(slotted)
    const viewport = html.indexOf('<div class="viewport">')
    const nav = html.indexOf('<div class="region-nav">')
    const screen = html.indexOf('<div class="screen')
    const tabs = html.indexOf('<div class="region-tabs">')
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
    const screenChunk = html.slice(html.indexOf('<div class="screen'), html.indexOf('<div class="region-tabs">'))
    expect(screenChunk).not.toContain('data-slot="back"')
    expect(screenChunk).not.toContain('data-tab')
  })

  it('keeps slot markup untouched in bare mode (component preview)', () => {
    const html = composeScreenDoc({ ...slotted, bare: true })
    expect(html).not.toContain('region-nav')
    expect(html).not.toContain('region-tabs')
    expect(html).toContain('data-slot="back"')
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
