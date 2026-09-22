#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Scaffold a new screen (4.1–4.2):
 *
 *   npm run new-screen -- --project moodtracker --name my-screen --title "My Screen"
 *
 * Writes `project/<id>/<name>.html` from a contract-valid template, then wires:
 *   1. `src/screens/manifest.ts` — SCREEN_FILES entry
 *   2. `src/screens/generated.ts` — regenerated `?raw` registry (via screens:sync)
 *   3. `src/projects/builtin.ts` — append id to the owning project's screenIds
 *
 * Refuses bad input (unknown project, bad slug, duplicate id) WITHOUT writing.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function usage() {
  console.log(
    [
      'Scaffold a new phone screen.',
      '',
      '  npm run new-screen -- --project <id> --name <slug> --title "Title" [--dark]',
      '',
      '  --project  builtin project id (moodtracker)',
      '  --name     kebab-case screen id, unique across all screens',
      '  --title    board/panel title',
      '  --dark     mark lightStatusBar (dark hero under the status bar)',
    ].join('\n'),
  )
}

function args(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      usage()
      process.exit(0)
    }
    if (a === '--dark') {
      out.dark = true
      continue
    }
    if (a.startsWith('--')) {
      const v = argv[++i]
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`)
      out[a.slice(2)] = v
      continue
    }
    throw new Error(`unknown argument: ${a}`)
  }
  return out
}

function template(title, themeClass) {
  return `<div class="screen${themeClass}">
  <header class="navbar">
    <span class="nav-title">${title}</span>
    <button class="icon-btn" aria-label="Close">
      <span class="icon icon-sm" data-symbol="xmark"></span>
    </button>
  </header>
  <div class="body" style="padding: var(--s4) var(--s5); gap: var(--s4)">
    <div class="col" style="gap: var(--s2)">
      <div class="t-title2">Tiêu đề màn hình</div>
      <p class="t-subhead t-secondary">Một dòng mô tả ngắn cho màn này.</p>
    </div>
    <div class="paper-card" style="gap: var(--s2)">
      <div class="t-headline">Thẻ nội dung</div>
      <div class="row" style="justify-content: space-between">
        <span class="t-subhead">Hàng mẫu</span>
        <span class="chip">Nhãn</span>
      </div>
    </div>
    <div class="spacer"></div>
    <button class="btn btn-primary btn-block">Tiếp tục</button>
  </div>
</div>
`
}

/** project theme class: moodtracker screens opt into the warm theme */
function themeClass(projectId) {
  return projectId === 'moodtracker' ? ' app-mood' : ''
}

function fail(msg) {
  console.error(`new-screen: ${msg}`)
  process.exit(1)
}

async function main() {
  let o
  try {
    o = args(process.argv.slice(2))
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
  const { project, name, title, dark } = o
  if (!project || !name || !title) {
    usage()
    fail('missing --project, --name or --title')
  }
  if (!SLUG_RE.test(name)) {
    fail(`bad --name "${name}" — use kebab-case, e.g. my-screen`)
  }

  const [manifestSrc, builtinSrc] = await Promise.all([
    readFile(path.join(ROOT, 'src/screens/manifest.ts'), 'utf8'),
    readFile(path.join(ROOT, 'src/projects/builtin.ts'), 'utf8'),
  ])

  if (!builtinSrc.includes(`id: '${project}'`)) {
    const ids = [...builtinSrc.matchAll(/id: '([a-z-]+)'/g)].map((m) => m[1]).join(' | ')
    fail(`unknown --project "${project}" — valid: ${ids}`)
  }
  if (manifestSrc.includes(`id: '${name}'`) || manifestSrc.includes(`id: "${name}"`)) {
    fail(`id "${name}" already exists in src/screens/manifest.ts`)
  }

  const file = `project/${project}/${name}.html`
  const absFile = path.join(ROOT, file)
  try {
    await readFile(absFile, 'utf8')
    fail(`${file} already exists on disk`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }

  // 0. write the HTML first so a later wiring failure leaves a visible file,
  //    never a registry pointing at nothing
  await mkdir(path.dirname(absFile), { recursive: true })
  await writeFile(absFile, template(title, themeClass(project)))

  // 1. manifest entry — insert into SCREEN_FILES, empty list included
  const marker = 'export const SCREEN_FILES: ScreenFile[] = ['
  const open = manifestSrc.indexOf(marker)
  if (open < 0) fail('cannot find SCREEN_FILES in manifest.ts')
  const bodyStart = open + marker.length
  const close = manifestSrc.indexOf(']', bodyStart)
  if (close < 0) fail('cannot find SCREEN_FILES closing in manifest.ts')
  const statusProp = dark ? ', lightStatusBar: true' : ''
  const manifestEntry = `  { id: '${name}', title: '${title.replace(/'/g, "\\'")}', file: '${file}'${statusProp} },\n`
  const body = manifestSrc.slice(bodyStart, close)
  const manifestNext =
    manifestSrc.slice(0, bodyStart) +
    '\n' +
    manifestEntry +
    body.trimStart() +
    ']' +
    manifestSrc.slice(close + 1)
  await writeFile(path.join(ROOT, 'src/screens/manifest.ts'), manifestNext)

  // 2. regenerate the ?raw registry from the manifest (single source of truth).
  // index.ts only re-exports generated.ts — never hand-edit the generated file.
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  await promisify(execFile)(
    process.execPath,
    ['--disable-warning=ExperimentalWarning', 'scripts/gen-registry.ts'],
    { cwd: ROOT },
  )

  // 3. append to owning project's screenIds
  const screenIdsAnchor = new RegExp(`(id: '${project}'[\\s\\S]*?screenIds: \\[[\\s\\S]*?)(\\])`)
  const m = screenIdsAnchor.exec(builtinSrc)
  if (!m) fail(`cannot find screenIds for project "${project}" in builtin.ts`)
  const listText = m[1]
  const needsComma = /'[^']*'\s*$/.test(listText) && !/,\s*$/.test(listText)
  // an empty list takes no separator: `[]` → `['a']`, not `[ 'a']`
  const sep = /\[\s*$/.test(listText) ? '' : needsComma ? ', ' : ' '
  const builtinNext = builtinSrc.replace(screenIdsAnchor, `${m[1]}${sep}'${name}'$2`)
  await writeFile(path.join(ROOT, 'src/projects/builtin.ts'), builtinNext)

  console.log(`created ${file}`)
  console.log(`wired: manifest + generated.ts + builtin.ts [${project}]`)
  console.log('next: npm run lint && npm run build')
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
