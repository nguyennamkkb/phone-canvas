#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Token lint (v3 gate): screens may only name defined tokens.
 *
 *   npm run lint:tokens
 *   npm run lint:tokens -- --screen <id>   (only that screen; same pattern as region-audit/export)
 *
 * Rules:
 *   error  var(--x) with no definition in the global or project tokens.css
 *          (the --sage-wash class of bug: resolves to guaranteed-invalid)
 *   error  nền .screen root sai: thiếu fallback, ảnh ngoài dự án, hoặc asset
 *          không tồn tại trong project/<id>/assets/
 *   warn   hardcoded hex/rgba colors in screen markup (prefer a token)
 *   warn   screen names a global-only color (tier rule: give the project
 *          its own semantic alias instead of borrowing the shared palette)
 *
 * Discovery comes from scripts/scan-projects.ts — the same registry the board
 * and the exporter read, so a lint can never see a different project tree.
 * Warnings never fail; errors exit 1.
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { filterByScreen, parseScreenFilter, printHelpIfRequested, reportNoScreenMatch } from './screen-filter.ts'
import { scanProjects } from './scan-projects.ts'
import { styleDefsOf } from './screen-style.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const VAR_RE = /var\(\s*(--[a-z0-9-]+)/g
const DEF_RE = /--([a-z0-9-]+)\s*:\s*[^;{}]+;/g
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g
const RGBA_RE = /rgba?\([^)]*\)/g

/** element-scoped or chrome vars — not design tokens */
const IGNORED = new Set(['--icon'])
const IGNORED_PREFIX = ['--device-', '--safe-', '--status-']

function isTokenVar(name) {
  if (IGNORED.has(name)) return false
  return !IGNORED_PREFIX.some((p) => name.startsWith(p))
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

function isColorValue(value) {
  return /^#[0-9a-f]{3,8}$/i.test(value) || /^rgba?\(/i.test(value)
}

/** longhand background declarations off the `.screen` root tag (or null) */
function rootBackgroundOf(html) {
  const tag = /<[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*>/i.exec(html)
  if (!tag) return null
  const style = (/style\s*=\s*"([^"]*)"/i.exec(tag[0]) ?? /style\s*=\s*'([^']*)'/i.exec(tag[0]))?.[1]
  if (!style) return null
  const get = (prop) => {
    const m = new RegExp(`${prop}\\s*:\\s*([^;]*)`, 'i').exec(style)
    return m ? m[1].trim() : ''
  }
  const color = get('background-color')
  const image = get('background-image')
  if (!color && !image) return null
  return {
    index: tag.index,
    color,
    image,
    size: get('background-size'),
    position: get('background-position'),
    repeat: get('background-repeat'),
  }
}

const HELP = `
Token lint: screens may only name defined tokens.

  --screen <id>   only check that screen (default: all screens)
  --help          print this message

Examples
  npm run lint:tokens
  npm run lint:tokens -- --screen today
`.trim()

async function main() {
  const argv = process.argv.slice(2)
  if (printHelpIfRequested(argv, HELP)) return
  const only = parseScreenFilter(argv)
  const { registry, errors: registryErrors } = await scanProjects()
  let errors = registryErrors.length
  let warns = 0
  for (const error of registryErrors) console.error(`error  ${error.file}  ${error.message}`)

  // tokens defined globally, then per project (project wins / owns its aliases)
  const global = await readFile(path.join(ROOT, 'src/screens/tokens.css'), 'utf8')
  const names = new Set()
  const globalColors = new Set()
  for (const m of global.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) {
    names.add(`--${m[1]}`)
    if (isColorValue(m[0].split(':')[1].trim())) globalColors.add(`--${m[1]}`)
  }

  const projectNames = new Map()
  const projectOwnsColor = new Map()
  for (const project of registry.projects) {
    const set = new Set(names)
    const own = new Set()
    const css = registry.tokens[project.id]
    if (css) {
      for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) {
        set.add(`--${m[1]}`)
        if (isColorValue(m[0].split(':')[1].trim())) own.add(`--${m[1]}`)
      }
    }
    projectNames.set(project.id, set)
    projectOwnsColor.set(project.id, own)
  }

  const sharedImages = new Set(await readdir(path.join(ROOT, 'public/images')).catch(() => []))

  const screens = filterByScreen(registry.screens, only)
  if (only && screens.length === 0) reportNoScreenMatch('lint:tokens', only)

  for (const screen of screens) {
    const html = screen.html
    const pid = screen.projectId
    // per-screen <style> blocks (recipe screen-style.md): definitions the
    // screen carries itself join the known set — usage below stays unchanged.
    const known = new Set([...(projectNames.get(pid) ?? names), ...styleDefsOf(html)])
    // the chrome-selector guard lives in subset-lint (structural); this lint
    // only teaches the known-set so local defs stop false-positiving.
    const projectAssets = new Set(registry.assets[pid] ?? [])
    const seen = new Set()

    VAR_RE.lastIndex = 0
    let m
    while ((m = VAR_RE.exec(html)) !== null) {
      const name = m[1]
      if (!isTokenVar(name) || seen.has(name)) continue
      seen.add(name)
      if (!known.has(name)) {
        console.error(`error  ${screen.file}:${lineOf(html, m.index)}  ${name} chưa định nghĩa`)
        errors += 1
      } else if (globalColors.has(name) && !projectOwnsColor.get(pid)?.has(name)) {
        console.warn(
          `warn   ${screen.file}:${lineOf(html, m.index)}  ${name} là màu global — nên alias trong project/${pid}/tokens.css`,
        )
        warns += 1
      }
    }

    const hard = new Set()
    for (const mm of html.matchAll(HEX_RE)) hard.add(mm[0].toLowerCase())
    for (const mm of html.matchAll(RGBA_RE)) hard.add('rgba(…)')
    if (hard.size > 0) {
      console.warn(`warn   ${screen.file}  màu cứng: ${[...hard].slice(0, 5).join(', ')}${hard.size > 5 ? '…' : ''}`)
      warns += 1
    }

    // optional screen background values (recipe screen-background): the root
    // may carry longhand background-color/background-image; the color must be a
    // token (or #000 dark-stage), the image must be an existing asset of THIS
    // project (or a shared public/images file), with fixed cover geometry.
    const rootBg = rootBackgroundOf(html)
    if (rootBg) {
      const rootLine = lineOf(html, rootBg.index)
      if (rootBg.color && !/^var\(--[a-z0-9-]+\)$|^#000000$|^#000$/i.test(rootBg.color)) {
        console.error(
          `error  ${screen.file}:${rootLine}  nền .screen root phải là var(--token) hoặc #000 (đang: ${rootBg.color.slice(0, 40)})`,
        )
        errors += 1
      }
      if (rootBg.image && rootBg.image.toLowerCase() !== 'none') {
        if (!rootBg.color) {
          console.error(`error  ${screen.file}:${rootLine}  background-image trên root thiếu background-color fallback`)
          errors += 1
        }
        for (const m of rootBg.image.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
          const u = m[2].trim()
          if (u.startsWith('/images/')) {
            if (!sharedImages.has(u.slice('/images/'.length))) {
              console.error(`error  ${screen.file}:${rootLine}  ${u} không tồn tại trong public/images/`)
              errors += 1
            }
          } else if (u.startsWith(`/project/${pid}/assets/`)) {
            const rel = u.slice(`/project/${pid}/assets/`.length)
            if (!projectAssets.has(rel)) {
              console.error(`error  ${screen.file}:${rootLine}  ${u} không tồn tại trong project/${pid}/assets/`)
              errors += 1
            }
          } else {
            console.error(
              `error  ${screen.file}:${rootLine}  ảnh nền root phải là /project/${pid}/assets/<file> (hoặc /images/<file> dùng chung) — đang: ${u.slice(0, 60)}`,
            )
            errors += 1
          }
        }
        // only url(…) and bare gradients may appear — no remote/data URLs
        // (strip innermost calls first so rgba() inside a gradient survives)
        let bare = rootBg.image.replace(/url\([^)]*\)/gi, '')
        let prev = ''
        while (prev !== bare) {
          prev = bare
          bare = bare.replace(/[a-z-]+\([^()]*\)/gi, '')
        }
        bare = bare.replace(/[,;\s]/g, '')
        if (bare !== '' || /https?:|data:/i.test(rootBg.image)) {
          console.error(
            `error  ${screen.file}:${rootLine}  background-image trên root chỉ nhận url(/project/<id>/assets/…) hoặc gradient — không URL ngoài/data-URI`,
          )
          errors += 1
        }
        if (rootBg.size && !/^cover$/i.test(rootBg.size)) {
          console.error(`error  ${screen.file}:${rootLine}  ảnh nền root phải background-size: cover (để .device lan đúng)`)
          errors += 1
        }
        if (rootBg.repeat && !/^no-repeat$/i.test(rootBg.repeat)) {
          console.error(`error  ${screen.file}:${rootLine}  ảnh nền root phải background-repeat: no-repeat`)
          errors += 1
        }
      }
    }
  }

  console.log(`\n${errors} lỗi, ${warns} cảnh báo`)
  if (errors > 0) process.exit(1)
}

main().catch((error) => {
  console.error(`lint:tokens: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
