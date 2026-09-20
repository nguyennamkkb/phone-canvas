import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { findChrome, sleep } from './chrome.ts'

type CdpMessage = {
  id?: number
  method?: string
  params?: unknown
  result?: unknown
  error?: { message: string }
}

export class Cdp {
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

export async function connect(url: string): Promise<Cdp> {
  const ws = new WebSocket(url)
  await new Promise<void>((resolve, reject) => {
    ws.addEventListener('open', () => resolve(), { once: true })
    ws.addEventListener('error', () => reject(new Error(`cannot connect to ${url}`)), { once: true })
  })
  return new Cdp(ws)
}

export type Browser = { cdp: Cdp; child: ChildProcess; profile: string }

export async function launch(): Promise<Browser> {
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

export async function shutdown(browser: Browser): Promise<void> {
  browser.cdp.close()
  browser.child.kill()
  await rm(browser.profile, { recursive: true, force: true }).catch(() => {})
}
