import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'

const MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.css': 'text/css; charset=utf-8',
}

export type Site = { origin: string; close: () => Promise<void> }

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
export async function startSite(
  documents: Map<string, string>,
  publicDir: string,
): Promise<Site> {
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

    const file = path.join(publicDir, pathname)
    if (!file.startsWith(publicDir + path.sep)) {
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
