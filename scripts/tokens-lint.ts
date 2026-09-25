#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Token lint (v3 gate): screens may only name defined tokens.
 *
 *   npm run lint:tokens
 *
 * Rules:
 *   error  var(--x) with no definition in the global or project tokens.css
 *          (the --sage-wash class of bug: resolves to guaranteed-invalid)
 *   warn   hardcoded hex/rgba colors in screen markup (prefer a token)
 *   warn   screen names a global-only color (tier rule: give the project
 *          its own semantic alias instead of borrowing the shared palette)
 *
 * Warnings never fail; errors exit 1.
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

import { SCREEN_FILES } from '../src/screens/manifest.ts'
import { BUILTIN_PROJECTS } from '../src/projects/builtin.ts'

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

async function definedVars() {
  const global = await readFile(path.join(ROOT, 'src/screens/tokens.css'), 'utf8')
  const names = new Set()
  const globalColors = new Set()
  for (const m of global.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) {
    names.add(`--${m[1]}`)
    if (/^#[0-9a-f]{3,8}$/i.test(m[0].split(':')[1].trim()) || /^rgba?\(/i.test(m[0].split(':')[1].trim())) {
      globalColors.add(`--${m[1]}`)
    }
  }
  const projectNames = new Map()
  for (const p of BUILTIN_PROJECTS) {
    const set = new Set(names)
    try {
      const css = await readFile(path.join(ROOT, 'project', p.id, 'tokens.css'), 'utf8')
      for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) set.add(`--${m[1]}`)
    } catch {
      /* no project file — global only */
    }
    projectNames.set(p.id, set)
  }
  return { names, globalColors, projectNames }
}

// Tier rule: a global color used by a screen warns unless the project file
// redefines it (its own semantic alias). Warnings never fail; errors exit 1.

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

async function main() {
  const { names, globalColors, projectNames } = await definedVars()
  let imageSet = new Set()
  try {
    imageSet = new Set(await readdir(path.join(ROOT, 'public/images')))
  } catch {
    /* no images dir — every url() errors below */
  }
  const projectOwnsColor = new Map()
  for (const p of BUILTIN_PROJECTS) {
    const own = new Set()
    try {
      const css = await readFile(path.join(ROOT, 'project', p.id, 'tokens.css'), 'utf8')
      for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) {
        const value = m[0].split(':')[1]
        if (/^#[0-9a-f]{3,8}$/i.test(value.trim()) || /^rgba?\(/i.test(value.trim())) own.add(`--${m[1]}`)
      }
    } catch {
      /* ignore */
    }
    projectOwnsColor.set(p.id, own)
  }
  const ownerOf = new Map()
  for (const p of BUILTIN_PROJECTS) for (const sid of p.screenIds) ownerOf.set(sid, p.id)

  let errors = 0
  let warns = 0

  for (const screen of SCREEN_FILES) {
    const file = path.join(ROOT, screen.file)
    const html = await readFile(file, 'utf8')
    const pid = ownerOf.get(screen.id)
    const known = (pid && projectNames.get(pid)) || names
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
      } else if (pid && globalColors.has(name) && !projectOwnsColor.get(pid)?.has(name)) {
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
    // may carry longhand background-color/background-image; values must be a
    // token (or #000 dark-stage), an existing /images/ asset, with a fallback
    // color and fixed cover geometry. Screens without a root background skip.
    const rootBg = rootBackgroundOf(html)
    if (rootBg) {
      const rootLine = lineOf(html, rootBg.index)
      if (rootBg.color && !/^var\(--[a-z0-9-]+\)$|^#000000$|^#000$/i.test(rootBg.color)) {
        console.error(`error  ${screen.file}:${rootLine}  nền .screen root phải là var(--token) hoặc #000 (đang: ${rootBg.color.slice(0, 40)})`)
        errors += 1
      }
      if (rootBg.image && rootBg.image.toLowerCase() !== 'none') {
        if (!rootBg.color) {
          console.error(`error  ${screen.file}:${rootLine}  background-image trên root thiếu background-color fallback`)
          errors += 1
        }
        for (const m of rootBg.image.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
          const u = m[2].trim()
          if (!u.startsWith('/images/')) {
            console.error(`error  ${screen.file}:${rootLine}  ảnh nền root phải là /images/<file có sẵn> (đang: ${u.slice(0, 60)})`)
            errors += 1
          } else if (!imageSet.has(u.slice('/images/'.length))) {
            console.error(`error  ${screen.file}:${rootLine}  ${u} không tồn tại trong public/images/`)
            errors += 1
          }
        }
        // only url(/images/…) and bare gradients may appear — no remote/data URLs
        // (strip innermost calls first so rgba() inside a gradient survives)
        let bare = rootBg.image.replace(/url\([^)]*\)/gi, '')
        let prev = ''
        while (prev !== bare) {
          prev = bare
          bare = bare.replace(/[a-z-]+\([^()]*\)/gi, '')
        }
        bare = bare.replace(/[,;\s]/g, '')
        if (bare !== '' || /https?:|data:/i.test(rootBg.image)) {
          console.error(`error  ${screen.file}:${rootLine}  background-image trên root chỉ nhận url(/images/…) hoặc gradient — không URL ngoài/data-URI`)
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

  // screens directory listing sanity: every project html registered?
  const registered = new Set(SCREEN_FILES.map((s) => s.file))
  for (const p of BUILTIN_PROJECTS) {
    let files = []
    try {
      files = (await readdir(path.join(ROOT, 'project', p.id))).filter((f) => f.endsWith('.html'))
    } catch {
      /* ignore */
    }
    for (const f of files) {
      const rel = `project/${p.id}/${f}`
      if (!registered.has(rel)) {
        console.warn(`warn   ${rel} chưa khai báo trong manifest — board không thấy`)
        warns += 1
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
