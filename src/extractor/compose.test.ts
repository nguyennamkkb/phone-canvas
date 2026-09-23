import { describe, expect, it } from 'vitest'
import { composeScreenDoc } from './compose'
import { DEVICES } from '../frame/devices'

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
})
