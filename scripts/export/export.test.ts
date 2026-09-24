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
