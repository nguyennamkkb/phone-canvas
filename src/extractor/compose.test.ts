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
})
