import { cp, readdir } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { generateIconSet } from './scripts/icons.ts'
import { scanProjects } from './scripts/scan-projects.ts'

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
/**
 * A registry error must fail the build, not only the browser runtime: the
 * board derives its registry at module evaluation (import.meta.glob), so a
 * broken folder would otherwise ship and throw only when a user opens it.
 * Same rules, same derive — `scripts/scan-projects.ts`.
 */
function registryGuard(): Plugin {
  return {
    name: 'phone-canvas:registry-guard',
    apply: 'build',
    async buildStart() {
      const { errors } = await scanProjects()
      if (errors.length > 0) {
        this.error(
          ['project registry có lỗi:', ...errors.map((e) => `  ${e.file}: ${e.message}`)].join('\n'),
        )
      }
    },
  }
}

/**
 * The dev half of the same guard: an open page gets Vite's error overlay, and
 * a fresh page load gets a 500 naming the file instead of a blank board. The
 * check reruns whenever anything under `project/` is added, removed or edited.
 */
function registryGuardDev(): Plugin {
  return {
    name: 'phone-canvas:registry-guard-dev',
    apply: 'serve',
    configureServer(server) {
      let errors: Array<{ file: string; message: string }> = []

      const format = () =>
        ['project registry có lỗi:', ...errors.map((e) => `  ${e.file}: ${e.message}`)].join('\n')

      const refresh = async (notify: boolean) => {
        errors = (await scanProjects()).errors
        if (notify && errors.length > 0) {
          server.ws.send({ type: 'error', err: { message: format(), stack: '' } })
        }
      }

      void refresh(false)
      const onProjectFile = (file: string) => {
        if (file.includes(`${path.sep}project${path.sep}`)) void refresh(true)
      }
      server.watcher.on('add', onProjectFile)
      server.watcher.on('unlink', onProjectFile)
      server.watcher.on('change', onProjectFile)

      server.middlewares.use((req, res, next) => {
        const isPage = req.headers.accept?.includes('text/html')
        if (errors.length === 0 || !isPage) return next()
        res.statusCode = 500
        res.setHeader('content-type', 'text/plain; charset=utf-8')
        res.end(format())
      })
    },
  }
}

/**
 * Project assets are referenced by URL (`/project/<id>/assets/…`) and served
 * straight off the repo in dev and in export. A static build has no repo to
 * serve from, so copy each project's assets into `dist/project/…` after the
 * bundle is written — the URL stays identical everywhere.
 */
function projectAssets(): Plugin {
  let outDir = ''
  return {
    name: 'phone-canvas:project-assets',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const projectsDir = path.join(import.meta.dirname, 'project')
      for (const id of await readdir(projectsDir).catch(() => [])) {
        if (id.startsWith('.')) continue
        try {
          await cp(path.join(projectsDir, id, 'assets'), path.join(outDir, 'project', id, 'assets'), {
            recursive: true,
          })
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
        }
      }
    },
  }
}

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
  plugins: [iconSet(), registryGuard(), registryGuardDev(), projectAssets(), noStore(), react()],
  server: { port: 5273 },
})
