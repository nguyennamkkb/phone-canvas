import { defineConfig } from 'vite'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { generateIconSet } from './scripts/icons.ts'

/**
 * Icons are inlined into `icon-set.css` by a generator, so a glyph added to
 * `public/icons/` must be regenerated before it can render. Running it here
 * means dev and build both pick it up with no extra step.
 */
function iconSet(): Plugin {
  return {
    name: 'phone-canvas:icon-set',
    async buildStart() {
      const count = await generateIconSet()
      this.info(`icon set: ${count} glyphs`)
    },
  }
}

/**
 * Never cache anything this server hands out.
 *
 * Vite's own default is `no-cache`, which still lets the browser keep the
 * response and revalidate it with an ETag — and it marks pre-bundled deps
 * `max-age=31536000, immutable`. For an app whose whole job is "edit a file,
 * look at the result", that is the wrong trade: a stale module, a stale SVG in
 * a screen iframe, or a stale `?raw` import reads as "my change did nothing".
 *
 * `no-store` forbids storing the response at all, so the next load is a real
 * fetch. Two things are needed for that to actually hold:
 *
 *   1. it has to run *before* Vite's internal middlewares, or the static and
 *      dep-optimizer middlewares overwrite the header further down the chain;
 *   2. the header has to be made un-overridable, because those same middlewares
 *      call `res.setHeader('Cache-Control', …)` themselves.
 *
 * Dev-only: `build` output is untouched, and hashed filenames are the right
 * answer for anything actually deployed.
 */
function noStore(): Plugin {
  const block = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((_req, res, next) => {
      const setHeader = res.setHeader.bind(res)
      res.setHeader = (name: string, value: number | string | readonly string[]) => {
        // swallow any later attempt to set a cache policy
        if (String(name).toLowerCase() === 'cache-control') return res
        return setHeader(name, value)
      }
      setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      setHeader('Pragma', 'no-cache')
      setHeader('Expires', '0')
      next()
    })
  }
  return {
    name: 'phone-canvas:no-store',
    configureServer: block,
    configurePreviewServer: block,
  }
}

export default defineConfig({
  plugins: [iconSet(), noStore(), react()],
  server: { port: 5273 },
})
