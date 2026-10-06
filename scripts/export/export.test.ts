import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { PLAYWRIGHT_CHROMIUM_VERSION, findChrome, playwrightChromiumPath, resolveChrome } from './chrome.ts'
import { exportFileName, parseArgs } from './cli.ts'

describe('chrome resolution ($CHROME_PATH → local → Playwright pinned)', () => {
  it('pins one Playwright Chromium version for CI', () => {
    expect(PLAYWRIGHT_CHROMIUM_VERSION).toBe('chromium-1243')
  })

  it('resolves the machine Chrome as source=local on this dev box', () => {
    const previous = process.env.CHROME_PATH
    delete process.env.CHROME_PATH
    try {
      const resolved = resolveChrome()
      expect(resolved.source).toBe('local')
      expect(existsSync(resolved.path)).toBe(true)
      expect(findChrome()).toBe(resolved.path)
    } finally {
      if (previous !== undefined) process.env.CHROME_PATH = previous
    }
  })

  it('treats the Playwright cache binary as an explicit $CHROME_PATH (source=env)', () => {
    const pinned = playwrightChromiumPath()
    if (!pinned) {
      console.warn('skip: no pinned Chromium in cache')
      return
    }
    expect(existsSync(pinned as string)).toBe(true)
    const previous = process.env.CHROME_PATH
    process.env.CHROME_PATH = pinned as string
    try {
      expect(resolveChrome()).toEqual({ path: pinned, source: 'env' })
    } finally {
      if (previous !== undefined) process.env.CHROME_PATH = previous
      else delete process.env.CHROME_PATH
    }
  })

  it('throws on a wrong $CHROME_PATH instead of silently falling through', () => {
    const previous = process.env.CHROME_PATH
    process.env.CHROME_PATH = '/nonexistent-chrome-binary'
    try {
      expect(() => resolveChrome()).toThrow('$CHROME_PATH')
    } finally {
      if (previous !== undefined) process.env.CHROME_PATH = previous
      else delete process.env.CHROME_PATH
    }
  })
})

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

  it('marks explicitly named devices so filenames keep their suffix', () => {
    expect(parseArgs(['--screen', 'home']).explicitDevices).toBe(false)
    expect(parseArgs(['--screen', 'home', '--device', 'ipad-11']).explicitDevices).toBe(true)
    expect(parseArgs(['--device', 'all']).explicitDevices).toBe(true)
  })

  it('names files without a device suffix only for the implicit default', () => {
    expect(exportFileName('home', 'reference', 'light', 2, false)).toBe('home@2x.png')
    expect(exportFileName('home', 'ipad-11', 'light', 2, true)).toBe('home-ipad-11@2x.png')
    expect(exportFileName('home', 'reference', 'light', 2, true)).toBe('home-reference@2x.png')
    expect(exportFileName('home', 'ipad-11', 'dark', 3, true)).toBe('home-ipad-11-dark@3x.png')
  })

  it('keeps a -full suffix so frame and full-page exports never overwrite', () => {
    expect(exportFileName('home', 'reference', 'light', 2, false, true)).toBe('home-full@2x.png')
    expect(exportFileName('home', 'ipad-11', 'light', 2, true, true)).toBe('home-ipad-11-full@2x.png')
    expect(exportFileName('home', 'reference', 'dark', 3, false, true)).toBe('home-full-dark@3x.png')
  })

  it('parses --full as a boolean capture mode', () => {
    expect(parseArgs(['--screen', 'home']).full).toBe(false)
    expect(parseArgs(['--screen', 'home', '--full']).full).toBe(true)
  })

  it('defaults --out into the project folder for a single --project', () => {
    expect(parseArgs(['--project', 'calo-ai']).out).toBe('project/calo-ai/exports')
    expect(parseArgs(['--project', 'calo-ai', '--out', '/tmp/x']).out).toBe('/tmp/x')
    expect(parseArgs([]).out).toBe('exports')
    expect(parseArgs(['--project', 'a', '--project', 'b']).out).toBe('exports')
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
      ['core.css', 'palettes.css', 'vocab.css', 'icons.css', 'icon-set.css'].map((n) =>
        readFile(path.join(root, 'src/screens', n), 'utf8'),
      ),
    )
    const html = `<div class="screen">
      <header class="region-nav is-glass" data-m="nav"><span class="nav-title">Glass proof</span><span class="chip">chip</span></header>
      <div class="body" style="gap: var(--s3)">
        <div class="paper-card glass" data-m="card">
          <div class="row" data-m="row"><span class="t-headline grow">Row one</span><span class="t-subhead">12</span></div>
          <div class="row" data-m="row2"><span class="t-headline grow">Row two</span><span class="t-subhead">34</span></div>
        </div>
        <div class="meter" data-m="meter"><span class="meter-seg is-on"></span><span class="meter-seg is-on"></span><span class="meter-seg is-on"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span><span class="meter-seg"></span></div>
        <div class="chart" data-m="chart"><div class="chart-col"><div class="bar" style="height: 120px"></div></div><div class="chart-col"><div class="bar is-peak" style="height: 160px"></div></div><div class="chart-col"><div class="bar" style="height: 90px"></div></div></div>
      </div>
      <nav class="region-tabs is-glass" data-m="tab"><span class="tab is-active">A</span><span class="tab">B</span></nav>
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
  it('captures the device frame by default and the full page with --full', async () => {
    let chrome: string
    try {
      chrome = findChrome()
    } catch {
      console.warn('skip: no Chrome on this machine')
      return
    }
    expect(chrome.length).toBeGreaterThan(0)

    const { scanProjects } = await import('../scan-projects.ts')
    const screen = (await scanProjects()).registry.screens[0]
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
    const device = getDevice('reference')
    const shared = await Promise.all(
      ['core.css', 'palettes.css', 'vocab.css', 'icons.css', 'icon-set.css'].map((n) =>
        readFile(path.join(root, 'src/screens', n), 'utf8'),
      ),
    )
    const html = screen.html
    const docs = new Map([
      ['smoke--reference--light', composeScreenDoc({ html, device, stylesheets: shared, bridgeJs: null })],
    ])
    const site = await startSite(docs, path.join(root, 'public'))
    const browser = await launch()
    try {
      const frame = await renderPng(
        browser.cdp,
        `${site.origin}/screen/smoke--reference--light`,
        device.width,
        device.height,
        1,
      )
      // v2 default: exactly the device frame (`.device` is height-fixed)
      expect(frame.readUInt32BE(16)).toBe(device.width)
      expect(frame.readUInt32BE(20)).toBe(device.height)

      const full = await renderPng(
        browser.cdp,
        `${site.origin}/screen/smoke--reference--light`,
        device.width,
        device.height,
        1,
        true,
      )
      // --full un-clips: never shorter than the frame, taller when it overflows
      expect(full.readUInt32BE(16)).toBe(device.width)
      expect(full.readUInt32BE(20)).toBeGreaterThanOrEqual(device.height)
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

    const { scanProjects } = await import('../scan-projects.ts')
    const screen = (await scanProjects()).registry.screens[0]
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
      ['core.css', 'palettes.css', 'vocab.css', 'icons.css', 'icon-set.css'].map((n) =>
        readFile(path.join(root, 'src/screens', n), 'utf8'),
      ),
    )
    const html = screen.html
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
