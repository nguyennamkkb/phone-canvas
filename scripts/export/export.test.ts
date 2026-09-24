import { describe, expect, it } from 'vitest'
import { findChrome } from './chrome.ts'
import { parseArgs } from './cli.ts'

describe('export cli', () => {
  it('parses screen/device/scale/out flags', () => {
    expect(parseArgs(['--screen', 'home', '--scale', '3', '--out', '/tmp/x'])).toMatchObject({
      screens: ['home'],
      scale: 3,
      out: '/tmp/x',
    })
  })

  it('rejects unknown flags and bad scales', () => {
    expect(() => parseArgs(['--nope'])).toThrow()
    expect(() => parseArgs(['--scale', '0'])).toThrow()
  })
})

describe('export smoke (needs Chrome)', () => {
  it('glass chrome measures bit-identically with backdrop-filter on/off', async () => {
    // Item 4 proof: backdrop-filter runs after layout, so bridge pickAt/sizes
    // must read the same pt whether glass is on or off. Toggles ONLY the
    // filter property on identical boxes (the .glass border is normal box
    // model, like .paper-card's, and is not what this compares).
    let chrome: string
    try {
      chrome = findChrome()
    } catch {
      console.warn('skip: no Chrome on this machine')
      return
    }
    expect(chrome.length).toBeGreaterThan(0)

    const { launch, shutdown } = await import('./cdp.ts')
    const { startSite } = await import('./site.ts')
    const { renderPng, waitForHeight } = await import('./render.ts')
    const { composeScreenDoc } = await import('../../src/extractor/compose.ts')
    const { getDevice } = await import('../../src/frame/devices.ts')
    const { readFile } = await import('node:fs/promises')
    const path = await import('node:path')

    const root = path.resolve(__dirname, '..', '..')
    const device = getDevice('reference')
    const shared = await Promise.all(
      ['tokens.css', 'icons.css', 'icon-set.css'].map((n) =>
        readFile(path.join(root, 'src/screens', n), 'utf8'),
      ),
    )
    const html = `<div class="screen">
      <header class="navbar-float" data-m="nav"><span class="nav-title">Glass proof</span><span class="chip">chip</span></header>
      <div class="body" style="gap: var(--s3)">
        <div class="paper-card glass" data-m="card">
          <div class="row" data-m="row"><span class="t-headline grow">Row one</span><span class="t-subhead">12</span></div>
          <div class="row" data-m="row2"><span class="t-headline grow">Row two</span><span class="t-subhead">34</span></div>
        </div>
        <div class="meter" data-m="meter"><span class="meter-seg is-on"></span><span class="meter-seg is-on"></span><span class="meter-seg is-on"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span></div>
        <div class="chart" data-m="chart"><div class="chart-col"><div class="bar" style="height: 120px"></div></div><div class="chart-col"><div class="bar is-peak" style="height: 160px"></div></div><div class="chart-col"><div class="bar" style="height: 90px"></div></div></div>
      </div>
      <nav class="tabbar-float" data-m="tab"><span class="tab-item is-on">A</span><span class="tab-item">B</span></nav>
    </div>`
    const docs = new Map([
      ['glass-proof--reference--light', composeScreenDoc({ html, device, stylesheets: shared, bridgeJs: null })],
    ])
    const site = await startSite(docs, path.join(root, 'public'))
    const browser = await launch()
    try {
      const { targetId } = await browser.cdp.send<{ targetId: string }>('Target.createTarget', { url: 'about:blank' })
      const { sessionId } = await browser.cdp.send<{ sessionId: string }>('Target.attachToTarget', { targetId, flatten: true })
      browser.cdp.attach(sessionId)
      const evalJs = async (expression: string): Promise<unknown> => {
        const out = await browser.cdp.send<{ result: { value?: unknown }; exceptionDetails?: unknown }>(
          'Runtime.evaluate',
          { expression, awaitPromise: true, returnByValue: true },
        )
        if (out.exceptionDetails) throw new Error('evaluate failed')
        return out.result.value
      }
      try {
        await browser.cdp.send('Page.enable')
        await browser.cdp.send('Runtime.enable')
        await browser.cdp.send('Emulation.setDeviceMetricsOverride', {
          width: device.width,
          height: device.height,
          deviceScaleFactor: 1,
          mobile: false,
        })
        await browser.cdp.send('Page.navigate', { url: `${site.origin}/screen/glass-proof--reference--light` })
        await waitForHeight(browser.cdp)

        const snapshot = () =>
          evalJs(
            `[...document.querySelectorAll('[data-m]')].map((el) => {
               const r = el.getBoundingClientRect()
               const cs = getComputedStyle(el)
               const round = (n) => Math.round(n * 1000) / 1000
               return { m: el.dataset.m, x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height), bf: cs.backdropFilter || cs.webkitBackdropFilter || 'none' }
             })`,
          )

        const before = (await snapshot()) as Array<Record<string, unknown>>
        expect(before.length).toBeGreaterThan(0)

        // kill ONLY the filter, on exactly the elements that have one —
        // nav + card + tab carry backdrop-filter; rows/meter/chart are the
        // surrounding-geometry witnesses. Count the kills: vacuous is a fail.
        const killed = (await evalJs(
          `(() => {
             let n = 0
             document.querySelectorAll('[data-m]').forEach((el) => {
               const cs = getComputedStyle(el)
               if ((cs.backdropFilter || cs.webkitBackdropFilter || 'none') !== 'none') {
                 el.style.backdropFilter = 'none'
                 el.style.webkitBackdropFilter = 'none'
                 n++
               }
             })
             void document.body.offsetHeight
             return n
           })()`,
        )) as number
        expect(killed).toBe(3)
        const after = (await snapshot()) as Array<Record<string, unknown>>
        // geometry only: bf legitimately differs (that IS the toggle)
        const geom = (rows: Array<Record<string, unknown>>) =>
          rows.map(({ m, x, y, w, h }) => ({ m, x, y, w, h }))
        expect(geom(after)).toEqual(geom(before))
      } finally {
        browser.cdp.attach(null)
        await browser.cdp.send('Target.closeTarget', { targetId }).catch(() => {})
      }

      // export side: glass doc renders at exact device geometry, not a scaffold
      const png = await renderPng(
        browser.cdp,
        `${site.origin}/screen/glass-proof--reference--light`,
        device.width,
        device.height,
        1,
      )
      expect(png.readUInt32BE(16)).toBe(device.width)
      expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(device.height)
      expect(png.length).toBeGreaterThan(15000)
    } finally {
      await shutdown(browser)
      await site.close()
    }
  }, 60_000)
  it('renders one reference screen to content-driven PNG geometry', async () => {
    let chrome: string
    try {
      chrome = findChrome()
    } catch {
      console.warn('skip: no Chrome on this machine')
      return
    }
    expect(chrome.length).toBeGreaterThan(0)

    const { SCREEN_FILES } = await import('../../src/screens/manifest.ts')
    const screen = SCREEN_FILES[0]
    if (!screen) {
      console.warn('skip: no screens registered yet')
      return
    }
    const { launch, shutdown } = await import('./cdp.ts')
    const { startSite } = await import('./site.ts')
    const { renderPng } = await import('./render.ts')
    const { composeScreenDoc } = await import('../../src/extractor/compose.ts')
    const { getDevice } = await import('../../src/frame/devices.ts')
    const { readFile, mkdir } = await import('node:fs/promises')
    const path = await import('node:path')

    const root = path.resolve(__dirname, '..', '..')
    const device = getDevice('reference')
    const shared = await Promise.all(
      ['tokens.css', 'icons.css', 'icon-set.css'].map((n) =>
        readFile(path.join(root, 'src/screens', n), 'utf8'),
      ),
    )
    const html = await readFile(path.join(root, screen.file), 'utf8')
    const docs = new Map([
      ['smoke--reference--light', composeScreenDoc({ html, device, stylesheets: shared, bridgeJs: null })],
    ])
    const site = await startSite(docs, path.join(root, 'public'))
    const browser = await launch()
    try {
      const png = await renderPng(
        browser.cdp,
        `${site.origin}/screen/smoke--reference--light`,
        device.width,
        device.height,
        1,
      )
      // width is always the device width. Height follows content: >= the device
      // height, and never clipped below it. A screen that needs more grows.
      expect(png.readUInt32BE(16)).toBe(device.width)
      expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(device.height)
      await mkdir('/tmp/shots-smoke', { recursive: true })
    } finally {
      await shutdown(browser)
      await site.close()
    }
  }, 60_000)

  it('renders one screen at iPad width to exactly 820px (scale 1)', async () => {
    let chrome: string
    try {
      chrome = findChrome()
    } catch {
      console.warn('skip: no Chrome on this machine')
      return
    }
    expect(chrome.length).toBeGreaterThan(0)

    const { SCREEN_FILES } = await import('../../src/screens/manifest.ts')
    const screen = SCREEN_FILES[0]
    if (!screen) {
      console.warn('skip: no screens registered yet')
      return
    }
    const { launch, shutdown } = await import('./cdp.ts')
    const { startSite } = await import('./site.ts')
    const { renderPng } = await import('./render.ts')
    const { composeScreenDoc } = await import('../../src/extractor/compose.ts')
    const { getDevice } = await import('../../src/frame/devices.ts')
    const { readFile } = await import('node:fs/promises')
    const path = await import('node:path')

    const root = path.resolve(__dirname, '..', '..')
    const device = getDevice('ipad-11')
    expect(device.width).toBe(820)
    const shared = await Promise.all(
      ['tokens.css', 'icons.css', 'icon-set.css'].map((n) =>
        readFile(path.join(root, 'src/screens', n), 'utf8'),
      ),
    )
    const html = await readFile(path.join(root, screen.file), 'utf8')
    const docs = new Map([
      ['smoke--ipad-11--light', composeScreenDoc({ html, device, stylesheets: shared, bridgeJs: null })],
    ])
    const site = await startSite(docs, path.join(root, 'public'))
    const browser = await launch()
    try {
      const png = await renderPng(
        browser.cdp,
        `${site.origin}/screen/smoke--ipad-11--light`,
        device.width,
        device.height,
        1,
      )
      expect(png.readUInt32BE(16)).toBe(820)
      expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(device.height)
    } finally {
      await shutdown(browser)
      await site.close()
    }
  }, 60_000)
})
