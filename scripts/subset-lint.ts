#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Subset lint (4.3 gate): screens must stay inside the SwiftUI-mappable subset.
 *
 *   npm run lint:subset
 *
 * Rules (error, exit 1):
 *   banned layout  display:grid | float: | transform: | clip-path: | filter:
 *                  (position:absolute is allowed — composite graphics use it;
 *                  bridge/infer reads it as ZStack + offset)
 *   nameless art   inline <svg> in screen markup (use .icon[data-symbol] or img.art)
 *   un-symbolled   class="... icon ..." without a data-symbol attribute
 *   unknown token  var(--x) with no definition (same rule as lint:tokens error)
 *   root-bg        background-image outside the `.screen` root, or shorthand
 *                  url()/gradient on the root (compose only replays longhand)
 *
 * Messages name file:line + the fix. Warnings (hardcoded colors) stay in
 * lint:tokens — this gate only fails on structural violations.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SCREEN_FILES } from '../src/screens/manifest.ts'
import { COMPONENT_FILES } from '../src/components/manifest.ts'
import { BUILTIN_PROJECTS } from '../src/projects/builtin.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const BANNED = [
  { re: /display\s*:\s*grid/i, what: 'display:grid — dùng flex .row/.col (VStack/HStack)' },
  { re: /float\s*:\s*(left|right)/i, what: 'float — dùng flex layout' },
  { re: /(^|[^-\w])transform\s*:/gim, what: 'transform — spec đọc sai box; composite graphic dùng left/top % + margin âm' },
  { re: /clip-path\s*:/i, what: 'clip-path — ngoài subset, extractor báo Block' },
  { re: /filter\s*:/i, what: 'filter — ngoài subset (lưu ý: đây cũng bắt -webkit-filter nếu có)' },
]

const VAR_RE = /var\(\s*(--[a-z0-9-]+)/g
const DEF_RE = /--([a-z0-9-]+)\s*:\s*[^;{}]+;/g
const IGNORED = new Set(['--icon'])
const IGNORED_PREFIX = ['--device-', '--safe-', '--status-']

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

async function definedVars() {
  const global = await readFile(path.join(ROOT, 'src/screens/tokens.css'), 'utf8')
  const names = new Set()
  for (const m of global.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) names.add(`--${m[1]}`)
  const perProject = new Map()
  for (const p of BUILTIN_PROJECTS) {
    const set = new Set(names)
    try {
      const css = await readFile(path.join(ROOT, 'project', p.id, 'tokens.css'), 'utf8')
      for (const m of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DEF_RE)) set.add(`--${m[1]}`)
    } catch { /* no project file */ }
    perProject.set(p.id, set)
  }
  return { names, perProject }
}

function isTokenVar(name) {
  if (IGNORED.has(name)) return false
  return !IGNORED_PREFIX.some((p) => name.startsWith(p))
}

async function main() {
  const { names, perProject } = await definedVars()
  const ownerOf = new Map()
  for (const p of BUILTIN_PROJECTS) for (const sid of p.screenIds) ownerOf.set(sid, p.id)

  let errors = 0
  const err = (file, line, msg) => {
    console.error(`error  ${file}:${line}  ${msg}`)
    errors += 1
  }

  // screens and components share the subset: both render inside a screen, so a
  // banned layout or an un-symbolled glyph in a component is the same defect.
  const targets = [
    ...SCREEN_FILES.map((s) => ({ file: s.file, project: ownerOf.get(s.id) })),
    ...COMPONENT_FILES.map((c) => ({ file: c.file, project: c.project })),
  ]

  for (const target of targets) {
    const html = await readFile(path.join(ROOT, target.file), 'utf8')
    const known = (target.project && perProject.get(target.project)) || names

    // 1. banned layout declarations (skip HTML comments so docs in comments don't fail)
    const stripped = html.replace(/<!--[\s\S]*?-->/g, (c) => '\n'.repeat(c.split('\n').length - 1))
    for (const { re, what } of BANNED) {
      const m = re.exec(stripped)
      if (m) err(target.file, lineOf(stripped, m.index), what)
    }

    // 2. inline <svg> — nameless art
    for (const m of html.matchAll(/<svg[\s>]/gi)) {
      err(target.file, lineOf(html, m.index), 'inline <svg> — không có tên cho Image("…"); dùng <span class="icon" data-symbol="…"> hoặc <img class="art">')
    }

    // 3. .icon glyph without data-symbol — only the exact `icon` class token
    // counts (chip-icon / icon-btn / icon-btn-soft are containers, not glyphs)
    for (const m of html.matchAll(/<[^>]*class="[^"]*"[^>]*>/gi)) {
      const cm = /class="([^"]*)"/i.exec(m[0])
      if (!cm) continue
      const classes = cm[1].split(/\s+/)
      if (!classes.includes('icon')) continue
      if (!/data-symbol\s*=\s*"/i.test(m[0])) {
        err(target.file, lineOf(html, m.index), '.icon thiếu data-symbol — spec không nói được tên SF Symbol')
      }
    }

    // 4. unknown var(--x)
    VAR_RE.lastIndex = 0
    let vm
    const seen = new Set()
    while ((vm = VAR_RE.exec(html)) !== null) {
      const name = vm[1]
      if (!isTokenVar(name) || seen.has(name)) continue
      seen.add(name)
      if (!known.has(name)) err(target.file, lineOf(html, vm.index), `${name} chưa định nghĩa (resolves to guaranteed-invalid)`)
    }

    // 5. optional screen background discipline (recipe screen-background):
    //    background-image lives ONLY on the `.screen` root, written longhand,
    //    because compose replays exactly those two longhands onto `.device`.
    //    Plain `background:` colors/gradients elsewhere (e.g. thumbnails) pass.
    const isComponent = COMPONENT_FILES.some((c) => c.file === target.file)
    const rootMatch = /<[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*>/i.exec(html)
    if (isComponent) {
      for (const m of html.matchAll(/background-image\s*:/gi)) {
        err(target.file, lineOf(html, m.index), 'background-image trong component — nền ảnh chỉ được đặt trên .screen root của màn hình')
      }
    } else if (rootMatch) {
      const rootTag = rootMatch[0]
      const short = /background\s*:\s*([^;]*)/gi
      let sm
      while ((sm = short.exec(rootTag)) !== null) {
        // `background-color:` also matches the `background` prefix — skip it
        if (sm[0].trim().toLowerCase().startsWith('background-')) continue
        if (/url\s*\(|gradient\s*\(/i.test(sm[1])) {
          err(target.file, lineOf(html, rootMatch.index), 'nền ảnh/gradient trên .screen root phải dùng longhand background-image + background-color (để compose lan ra .device)')
        }
      }
      const rest = html.slice(0, rootMatch.index) + html.slice(rootMatch.index + rootTag.length)
      for (const m of rest.matchAll(/background-image\s*:/gi)) {
        const orig = m.index < rootMatch.index ? m.index : m.index + rootTag.length
        err(target.file, lineOf(html, orig), 'background-image ngoài .screen root — nền ảnh chỉ được đặt trên root của màn hình')
      }
    }
  }

  console.log(`\n${errors} lỗi subset`)
  if (errors > 0) process.exit(1)
}

main().catch((error) => {
  console.error(`lint:subset: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
