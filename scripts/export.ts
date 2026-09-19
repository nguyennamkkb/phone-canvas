#!/usr/bin/env node
/**
 * Export every screen to PNG, at any device size and scale.
 *
 *   npm run export
 *   npm run export -- --screen journal-list --scale 3
 *   npm run export -- --device iphone-se --out /tmp/shots
 *
 * Zero dependencies. A phone screen is real HTML, so something has to lay it
 * out — this drives the Chrome already on the machine (or $CHROME_PATH) over
 * the DevTools protocol and never needs a build step or a running dev server.
 *
 * What you get is the screen itself: the device size, the status bar, the home
 * indicator, and the exact pixels the panel measures. The iPhone chassis you
 * see on the board is drawn by the React layer and is deliberately not included
 * — it is decoration, and it would be wrong in a handoff.
 *
 * The document is composed by `src/extractor/compose.ts`, the same module the
 * app uses, so an export can never drift from what the board shows.
 */

import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEVICES, getDevice } from '../src/frame/devices.ts'
import { SCREEN_FILES } from '../src/screens/manifest.ts'
import { composeScreenDoc } from '../src/extractor/compose.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS_DIR = path.join(ROOT, 'src/screens')
const PUBLIC_DIR = path.join(ROOT, 'public')
const STYLESHEETS = ['tokens.css', 'icons.css', 'icon-set.css']

/* --------------------------------------------------------------------- cli -- */

type Options = {
  screens: string[]
  devices: string[]
  scale: number
  out: string
}

const HELP = `
Export phone screens to PNG.

  --screen <id>    screen to export, repeatable, or "all"   (default: all)
  --device <id>    device to render at, repeatable, or "all" (default: reference)
  --scale <n>      pixel density multiplier                  (default: 2)
  --out <dir>      output directory                          (default: exports)
  --list           print available screens and devices, then exit
  --help           print this message

Examples
  npm run export
  npm run export -- --screen journal-list --scale 3
  npm run export -- --device all --out docs/shots
`.trim()

function parseArgs(argv: string[]): Options {
  const options: Options = { screens: ['all'], devices: ['reference'], scale: 2, out: 'exports' }
  const screens: string[] = []
  const devices: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => {
      const value = argv[++i]
      if (value === undefined) throw new Error(`${arg} needs a value`)
      return value
    }
    switch (arg) {
      case '--help':
      case '-h':
        console.log(HELP)
        process.exit(0)
      case '--list':
        options.screens = []
        options.devices = []
        return options
      case '--screen':
        screens.push(next())
        break
      case '--device':
        devices.push(next())
        break
      case '--scale': {
        const scale = Number(next())
        if (!Number.isFinite(scale) || scale <= 0) throw new Error('--scale must be a positive number')
        options.scale = scale
        break
      }
      case '--out':
        options.out = next()
        break
      default:
        throw new Error(`unknown option: ${arg}`)
    }
  }

  options.screens = screens.length ? screens : ['all']
  options.devices = devices.length ? devices : ['reference']
  return options
}

/* ------------------------------------------------------------- devtools io -- */

type CdpMessage = {
  id?: number
  method?: string
  params?: unknown
  result?: unknown
  error?: { message: string }
}

class Cdp {
  private readonly ws: WebSocket
  private seq = 0
  private sessionId: string | null = null
  private readonly pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >()

  constructor(ws: WebSocket) {
    this.ws = ws
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as CdpMessage
      if (typeof message.id !== 'number') return
      const slot = this.pending.get(message.id)
      if (!slot) return
      this.pending.delete(message.id)
      if (message.error) slot.reject(new Error(message.error.message))
      else slot.resolve(message.result)
    })
  }

  send<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    const id = ++this.seq
    const body: Record<string, unknown> = { id, method, params }
    if (this.sessionId) body.sessionId = this.sessionId
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject })
      this.ws.send(JSON.stringify(body))
    })
  }

  attach(sessionId: string | null): void {
    this.sessionId = sessionId
  }

  close(): void {
    this.ws.close()
  }
}

async function connect(url: string): Promise<Cdp> {
  const ws = new WebSocket(url)
  await new Promise<void>((resolve, reject) => {
    ws.addEventListener('open', () => resolve(), { once: true })
    ws.addEventListener('error', () => reject(new Error(`cannot connect to ${url}`)), { once: true })
  })
  return new Cdp(ws)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]

function findChrome(): string {
  const found = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
  if (!found) {
    throw new Error(
      `No Chrome found. Install Google Chrome or set CHROME_PATH.\nTried:\n  ${CHROME_CANDIDATES.filter(Boolean).join('\n  ')}`,
    )
  }
  return found
}

type Browser = { cdp: Cdp; child: ChildProcess; profile: string }

async function launch(): Promise<Browser> {
  const executable = findChrome()
  const port = 9333 + Math.floor(Math.random() * 400)
  const profile = await mkdtemp(path.join(tmpdir(), 'phone-canvas-export-'))

  const child = spawn(
    executable,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  const deadline = Date.now() + 25_000
  let wsUrl: string | null = null
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('chrome exited before devtools was ready')
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (response.ok) {
        const info = (await response.json()) as { webSocketDebuggerUrl?: string }
        if (info.webSocketDebuggerUrl) {
          wsUrl = info.webSocketDebuggerUrl
          break
        }
      }
    } catch {
      /* not listening yet */
    }
    await sleep(120)
  }

  if (!wsUrl) {
    child.kill()
    throw new Error('timed out waiting for chrome devtools')
  }

  return { cdp: await connect(wsUrl), child, profile }
}

async function shutdown(browser: Browser): Promise<void> {
  browser.cdp.close()
  browser.child.kill()
  await rm(browser.profile, { recursive: true, force: true }).catch(() => {})
}

/* -------------------------------------------------------------------- site -- */

const MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.css': 'text/css; charset=utf-8',
}

type Site = { origin: string; close: () => Promise<void> }

/**
 * A localhost-only origin for the export.
 *
 * Screens reference assets as `/icons/search.svg`, served by Vite from
 * `public/` in the app. A document handed over with `Page.setDocumentContent`
 * lives on `about:blank`, where no absolute or relative URL can resolve — every
 * icon would silently come out blank. So the export serves the composed
 * documents *and* `public/`, and navigates to them, and asset URLs behave
 * exactly as they do on the board.
 */
async function startSite(documents: Map<string, string>): Promise<Site> {
  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname)

    if (pathname.startsWith('/screen/')) {
      const html = documents.get(pathname.slice('/screen/'.length))
      if (html === undefined) {
        res.writeHead(404).end('unknown screen')
        return
      }
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
      return
    }

    const file = path.join(PUBLIC_DIR, pathname)
    if (!file.startsWith(PUBLIC_DIR + path.sep)) {
      res.writeHead(403).end('forbidden')
      return
    }
    try {
      const body = await readFile(file)
      const type = MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream'
      res.writeHead(200, { 'content-type': type }).end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  }

  const server = createServer((req, res) => {
    void handle(req, res)
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('could not bind the export server')

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  }
}

/* ------------------------------------------------------------------ render -- */

async function evaluate(cdp: Cdp, expression: string): Promise<unknown> {
  const result = await cdp.send<{ result: { value?: unknown }; exceptionDetails?: unknown }>(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
  )
  if (result.exceptionDetails) return undefined
  return result.result.value
}

/**
 * Wait until the document has actually been laid out.
 *
 * Two traps here, both hit in practice:
 *  - the load event is not the same thing as having layout; until the browser
 *    has laid the frame out every rect is 0 and we would export nothing
 *  - webfonts land late and change wrapping, which changes the height
 * So: poll until the height is real, with fonts settled, rather than sleeping.
 */
async function waitForHeight(cdp: Cdp, timeoutMs = 15_000): Promise<number> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await evaluate(
      cdp,
      `(async () => {
         if (document.readyState !== 'complete') return -1
         if (document.fonts) await document.fonts.ready
         const device = document.querySelector('.device')
         if (!device) return -1
         return Math.ceil(device.getBoundingClientRect().height)
       })()`,
    ).catch(() => undefined)

    if (typeof value === 'number' && value > 0) return value
    await sleep(60)
  }
  throw new Error('screen never produced a layout')
}

async function renderPng(
  cdp: Cdp,
  url: string,
  width: number,
  height: number,
  scale: number,
): Promise<Buffer> {
  const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', {
    url: 'about:blank',
  })
  const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  cdp.attach(sessionId)

  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')

    // lay out at 1x first so we can measure the content-driven height
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    })

    await cdp.send('Page.navigate', { url })

    const contentHeight = await waitForHeight(cdp)

    // re-emulate at the exact content height * scale: the frame has no fixed
    // height, so this is the only way to capture a screen taller than the device
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: contentHeight,
      deviceScaleFactor: scale,
      mobile: false,
    })
    await sleep(80)

    const shot = await cdp.send<{ data: string }>('Page.captureScreenshot', { format: 'png' })
    return Buffer.from(shot.data, 'base64')
  } finally {
    cdp.attach(null)
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {})
  }
}

/* -------------------------------------------------------------------- main -- */

/**
 * Screen identity comes from `src/screens/manifest.ts`, never from the
 * directory listing. Scanning for `*.html` gives a second, drifting source of
 * ids: a file that exists but is not registered would export under a name the
 * board has never heard of, and a rename would silently change an id.
 */
const SCREEN_BY_ID = new Map(SCREEN_FILES.map((screen) => [screen.id, screen]))

async function listScreens(): Promise<string[]> {
  return SCREEN_FILES.map((screen) => screen.id)
}

function fail(message: string): never {
  console.error(`export: ${message}`)
  process.exit(1)
}

/** relative inside the project, absolute outside it — never a `../../..` ladder */
function display(target: string): string {
  const relative = path.relative(ROOT, target)
  return relative.startsWith('..') ? target : relative
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const allScreens = await listScreens()

  if (options.screens.length === 0 && options.devices.length === 0) {
    console.log('screens:')
    for (const screen of SCREEN_FILES) console.log(`  ${screen.id.padEnd(20)} ${screen.title}`)
    console.log('devices:')
    for (const device of DEVICES) console.log(`  ${device.id.padEnd(20)} ${device.name}`)
    return
  }

  const screens = options.screens.includes('all') ? allScreens : options.screens
  const devices = options.devices.includes('all')
    ? DEVICES.map((device) => device.id)
    : options.devices

  for (const id of screens) {
    if (!allScreens.includes(id)) fail(`unknown screen "${id}". Try --list`)
  }
  for (const id of devices) {
    if (!DEVICES.some((device) => device.id === id)) fail(`unknown device "${id}". Try --list`)
  }

  const stylesheets = await Promise.all(
    STYLESHEETS.map((name) => readFile(path.join(SCREENS_DIR, name), 'utf8')),
  )
  const outDir = path.resolve(ROOT, options.out)
  await mkdir(outDir, { recursive: true })

  // compose everything up front so the site can serve it by URL
  const documents = new Map<string, string>()
  for (const screenId of screens) {
    const screen = SCREEN_BY_ID.get(screenId)
    if (!screen) fail(`unknown screen "${screenId}". Try --list`)
    const html = await readFile(path.join(SCREENS_DIR, screen.file), 'utf8')
    for (const deviceId of devices) {
      const device = getDevice(deviceId)
      // no bridge: an export carries no measurement scaffolding
      documents.set(
        `${screenId}--${deviceId}`,
        composeScreenDoc({
          html,
          device,
          stylesheets,
          bridgeJs: null,
          lightStatusBar: screen.lightStatusBar,
        }),
      )
    }
  }

  const site = await startSite(documents)
  const browser = await launch()
  let written = 0
  try {
    for (const screenId of screens) {
      for (const deviceId of devices) {
        const device = getDevice(deviceId)
        const url = `${site.origin}/screen/${screenId}--${deviceId}`
        const png = await renderPng(browser.cdp, url, device.width, device.height, options.scale)

        const suffix = devices.length > 1 ? `-${device.id}` : ''
        const file = path.join(outDir, `${screenId}${suffix}@${options.scale}x.png`)
        await writeFile(file, png)
        written++
        // PNG IHDR: width at byte 16, height at byte 20, big-endian
        const pngWidth = png.readUInt32BE(16)
        const pngHeight = png.readUInt32BE(20)
        console.log(
          `${display(file)}  ${pngWidth}×${pngHeight}  ${(png.length / 1024).toFixed(0)} KB`,
        )
      }
    }
  } finally {
    await shutdown(browser)
    await site.close()
  }

  console.log(`\n${written} file${written === 1 ? '' : 's'} → ${display(outDir)}/`)
}

main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error))
})
