/**
 * Dev-only bridge between the board (browser) and the element crop pipeline
 * (Node + CDP).
 *
 * The panel cannot crop an element itself: a crop is a CDP screenshot of the
 * composed document at the right device scale, and the board's own iframe is a
 * different process with a sandboxed origin (no CDP, and html2canvas would
 * measure something other than what the exporter ships). So the panel asks this
 * endpoint, which drives `scripts/export/element.ts` — the same module
 * `npm run locate` uses, so a crop taken from the board and a crop taken from
 * the CLI can never disagree.
 *
 *   POST /__pc/element/crop      → { dataUrl, clip, payload }   (thumbnail)
 *   POST /__pc/element/export    → { files, dataUrl, clip }     (handoff PNG + JSON)
 *   POST /__pc/element/children  → { files, count }             (one PNG + JSON per child)
 *   POST /__pc/element/golden    → { key, state, before, after } (compare the crop to its golden)
 *   POST /__pc/element/golden/write → { key, png, manifest }    (store the crop as the golden)
 *
 * One warm session is kept for the life of the dev server: launching Chrome and
 * binding the export site costs ~1s, and paying that per selection change would
 * make the live thumbnail useless. Requests are serialized because a CDP
 * connection is a single pipe.
 *
 * `apply: 'serve'` on purpose — a built board has no Node process to crop with,
 * and the panel says so instead of offering a button that cannot work.
 */

import type { IncomingMessage } from 'node:http'
import { join } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

import { scanProjects } from '../scan-projects.ts'
import {
  buildElementGoldenRecord,
  compareElementGolden,
  elementGoldenKey,
  loadElementGolden,
  loadManifest,
  manifestPath,
  resolveGoldenDir,
  saveElementGolden,
  saveManifest,
  upsertElementRecord,
} from './golden.ts'
import {
  elementStem,
  openElementSession,
  type ElementExportInput,
  type ElementSession,
} from './element.ts'

type Json = Record<string, unknown>

async function readJson(req: IncomingMessage): Promise<Json> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return {}
  const parsed: unknown = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('body must be a JSON object')
  }
  return parsed as Json
}

/**
 * The crop input the panel sends. Kept permissive on purpose: the panel is the
 * only caller, and a missing optional field must fall back to the module
 * default rather than 400.
 */
function inputOf(body: Json): ElementExportInput {
  const box = body.box
  if (!box || typeof box !== 'object') throw new Error('box {x,y,w,h} is required')
  const b = box as Record<string, unknown>
  for (const key of ['x', 'y', 'w', 'h'] as const) {
    if (typeof b[key] !== 'number' || !Number.isFinite(b[key])) {
      throw new Error(`box.${key} must be a finite number`)
    }
  }
  if (typeof body.screen !== 'string' || !body.screen) throw new Error('screen is required')
  const ancestors = Array.isArray(body.ancestors)
    ? (body.ancestors as unknown[]).filter((a): a is ElementExportInput['box'] => !!a && typeof a === 'object')
    : undefined
  return {
    screen: body.screen,
    box: { x: b.x as number, y: b.y as number, w: b.w as number, h: b.h as number },
    elementId: typeof body.elementId === 'string' ? body.elementId : undefined,
    ancestors,
    device: typeof body.device === 'string' ? body.device : undefined,
    theme: body.theme === 'dark' ? 'dark' : body.theme === 'light' ? 'light' : undefined,
    padPt: typeof body.padPt === 'number' ? body.padPt : undefined,
    padPct: typeof body.padPct === 'number' ? body.padPct : null,
    ancestorLevels: typeof body.ancestorLevels === 'number' ? body.ancestorLevels : undefined,
    scale: typeof body.scale === 'number' ? body.scale : undefined,
  }
}

/** serialize every request: one CDP pipe, one capture at a time */
function queue(): <T>(run: () => Promise<T>) => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve()
  return <T>(run: () => Promise<T>): Promise<T> => {
    const next = tail.then(run, run)
    tail = next.catch(() => {})
    return next
  }
}

export function elementTools(): Plugin {
  let session: ElementSession | null = null
  const enqueue = queue()
  // one session for the whole dev server; opened on the first request
  const open = async (server: ViteDevServer): Promise<ElementSession> => {
    if (!session) {
      server.config.logger.info('[element] warming crop session (Chrome + export site)…')
      session = await openElementSession()
    }
    return session
  }

  return {
    name: 'phone-canvas:element-tools',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.on('close', () => {
        void session?.close()
        session = null
      })

      server.middlewares.use((req, res, next) => {
        const route = (req.url ?? '').split('?')[0]
        if (!route.startsWith('/__pc/element/')) return next()
        const action = route.slice('/__pc/element/'.length)

        const send = (status: number, body: Json) => {
          res.statusCode = status
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.setHeader('cache-control', 'no-store')
          res.end(JSON.stringify(body))
        }

        void (async () => {
          try {
            if (req.method !== 'POST') return send(405, { ok: false, error: 'POST only' })
            const body = await readJson(req)
            const input = inputOf(body)
            const outDir = typeof body.outDir === 'string' ? body.outDir : undefined
            const active = await open(server)

            if (action === 'crop') {
              const result = await enqueue(() => active.crop(input))
              return send(200, {
                ok: true,
                clip: result.clip,
                payload: result.payload,
                dataUrl: `data:image/png;base64,${result.png.toString('base64')}`,
              })
            }
            if (action === 'export') {
              const result = await enqueue(() => active.export({ ...input, outDir }))
              // one crop writes exactly one PNG + one JSON; the children route
              // writes many. Both answer with a list so the panel has one shape.
              return send(200, {
                ok: true,
                files: [result.files],
                clip: result.clip,
                dataUrl: `data:image/png;base64,${result.png.toString('base64')}`,
              })
            }
            if (action === 'children') {
              const result = await enqueue(() => active.exportChildren({ ...input, outDir }))
              return send(200, { ok: true, files: result.files, count: result.count })
            }
            if (action === 'golden' || action === 'golden/write') {
              // the store for a screen lives under the project that owns it —
              // the same rule the exporter uses, resolved from the registry
              const { registry, errors } = await scanProjects()
              if (errors.length > 0) {
                throw new Error(
                  `project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`,
                )
              }
              const screen = registry.screens.find((candidate) => candidate.id === input.screen)
              if (!screen) throw new Error(`unknown screen "${input.screen}". Try --list`)

              const result = await enqueue(() => active.crop(input))
              // a golden is per element: a box that hit nothing (a gap, an
              // empty strip) has no identity to store or compare
              if (!result.element) throw new Error('nothing matched the box — no element to key a golden on')

              const stem = elementStem(result.element)
              // the pipeline's own defaults when the panel leaves them out:
              // the key has to name the same render the crop came from
              const device = input.device ?? 'reference'
              const theme = input.theme ?? 'light'
              const scale = typeof input.scale === 'number' && input.scale > 0 ? input.scale : 2

              const key = elementGoldenKey({ screen: input.screen, device, theme, stem })
              const goldenDir = resolveGoldenDir({ projects: [screen.projectId] })

              if (action === 'golden/write') {
                const record = buildElementGoldenRecord({
                  identity: { screen: input.screen, device, theme, stem, scale },
                  png: result.png,
                  payload: result.payload,
                  pngFile: `${key}.png`,
                })
                saveElementGolden(goldenDir, record, result.png)
                saveManifest(goldenDir, upsertElementRecord(loadManifest(goldenDir), record))
                return send(200, { ok: true, key, png: join(goldenDir, record.png), manifest: manifestPath(goldenDir) })
              }

              const golden = loadElementGolden(goldenDir, key)
              const verdict = compareElementGolden(golden?.record, result.png, result.payload)
              return send(200, {
                ok: true,
                key,
                state: verdict.state,
                distance: verdict.distance,
                cropMatch: verdict.cropMatch,
                specMatch: verdict.specMatch,
                // before is the stored crop, after the one just shot: the
                // side-by-side the board shows for a `lệch`
                before: golden ? `data:image/png;base64,${golden.png.toString('base64')}` : null,
                after: `data:image/png;base64,${result.png.toString('base64')}`,
              })
            }
            return send(404, { ok: false, error: `unknown action "${action}"` })
          } catch (error) {
            send(500, { ok: false, error: error instanceof Error ? error.message : String(error) })
          }
        })()
      })
    },
  }
}
