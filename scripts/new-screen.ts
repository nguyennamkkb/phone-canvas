#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Scaffold a new screen:
 *
 *   npm run new-screen -- --project <project-id> --name my-screen --title "My Screen"
 *
 * Writes `project/<project>/screens/<name>.html` from a contract-valid
 * template. The registry is the folder itself — there is nothing else to wire:
 * the board sees the file on the next reload and `npm run export` reads it
 * immediately.
 *
 * Refuses bad input (unknown project, bad slug, duplicate id, existing file)
 * WITHOUT writing.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { scanProjects } from './scan-projects.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function usage() {
  console.log(
    [
      'Scaffold a new phone screen.',
      '',
      '  npm run new-screen -- --project <id> --name <slug> --title "Title" [--kind push] [--dark] [--device ipad-11]',
      '',
      '  --project  project folder id (see npm run project -- list)',
      '  --name     kebab-case screen id, unique across all screens',
      '  --title    board/panel title',
      '  --kind     chrome shape; the screen is born passing lint:',
      '               root   has a tab bar, owns its nav     (needs app-tabs)',
      '               push   back + title, no tab bar        (default)',
      '               modal  cancel + title, no tab bar      (needs app-nav)',
      '               bare   no chrome at all (splash, full-bleed)',
      '  --dark     mark lightStatusBar (dark hero under the status bar)',
      '  --device   device preset id (see src/frame/devices.ts); ipad-* screens',
      '             get a 2-column template + a header deviceId so new boards',
      '             open them at the right width. Default: reference phone.',
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

/** optional metadata header — the only place a screen declares its own title */
function header(title, dark, deviceId) {
  const meta = { title }
  if (dark) meta.lightStatusBar = true
  if (deviceId) meta.deviceId = deviceId
  return `<!-- pc ${JSON.stringify(meta)} -->\n`
}

/**
 * The phone templates, one per chrome shape.
 *
 * `kind` is a generator convenience, NOT a concept the screen declares: what
 * ends up in the file — which slots it writes, which component it includes —
 * is the only evidence of its shape. Every template is born passing
 * `lint:regions`, which is the point: a new screen used to be born red.
 */
function phoneTemplate(title, themeClass, kind, firstSlug) {
  // `--title` is the board label and may be long; the nav title slot must be
  // one short line (`navbar-title-long` fails at 15 characters). Use the real
  // title when it fits, otherwise a placeholder the author has to edit — a
  // scaffold that can be born red is the defect this template exists to fix.
  const navTitle = title.length < 15 ? title : 'Tiêu đề'
  const body = (band, pad) => `  <div class="${band}" style="${pad}">
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
  </div>`

  if (kind === 'bare') {
    // no band at all: splash, login, full-bleed image
    return `<div class="screen${themeClass}" style="background-color: var(--bg)">
${body('body-fixed', 'padding: var(--s4) var(--s5); gap: var(--s4)')}
</div>
`
  }

  const open = `<div class="screen${themeClass}" style="background-color: var(--bg)">`
  const nav =
    kind === 'root'
      ? // the root screen owns its nav (switchers, streak, settings) and takes
        // the destination list from the project
        `  <span data-slot="title" class="nav-title">${navTitle}</span>

`
      : kind === 'modal'
        ? // cancel-and-title is the project's modal nav, so it lives in one file
          `  <span data-slot="title" class="nav-title">${navTitle}</span>
  <!-- @component app-nav -->

`
        : `  <button data-slot="back" aria-label="Quay lại">
    <span class="icon icon-sm" data-symbol="chevron.left"></span>
  </button>
  <span data-slot="title" class="nav-title">${navTitle}</span>

`
  const closed = kind === 'root' ? `\n  <!-- @component app-tabs -->\n</div>\n` : `</div>\n`
  const rootAttr = kind === 'root' ? ` data-tab-active="${firstSlug}"` : ''
  const head = kind === 'root' ? open.replace('">', `"${rootAttr}>`) : open
  return `${head}
${nav}${body('body', 'padding: var(--s4) var(--s5); gap: var(--s4)')}${closed}`
}

function template(title, themeClass, deviceId, kind, firstSlug) {
  if (deviceId && deviceId.startsWith('ipad')) {
    // iPad template: list + detail side by side, token classes only — no px.
    // Flex ratios are unitless so the same file stays fluid on any device width.
    // No band classes: the shell owns nav/tab bands on every form factor, so a
    // hand-built `.navbar` here would fail lint:regions.
    return `<div class="screen${themeClass}">
  <span data-slot="title" class="nav-title">${title}</span>
  <div class="body" style="padding: var(--s4) var(--s5); gap: var(--s4)">
    <div class="row" style="gap: var(--s4); align-items: stretch">
      <div class="paper-card" style="flex: 1 1 0; min-width: 0; gap: var(--s2)">
        <div class="t-headline">Danh sách</div>
        <div class="row" style="justify-content: space-between">
          <span class="t-subhead">Mục mẫu một</span>
          <span class="chip">Mới</span>
        </div>
        <div class="row" style="justify-content: space-between">
          <span class="t-subhead">Mục mẫu hai</span>
          <span class="chip">Xem</span>
        </div>
      </div>
      <div class="paper-card" style="flex: 2 1 0; min-width: 0; gap: var(--s2)">
        <div class="t-title2">Chi tiết</div>
        <p class="t-subhead t-secondary">Chọn một mục bên trái để xem chi tiết ở đây.</p>
        <div class="spacer"></div>
        <button class="btn btn-primary btn-block">Tiếp tục</button>
      </div>
    </div>
  </div>
</div>
`
  }
  return phoneTemplate(title, themeClass, kind, firstSlug)
}

/** per-project theme class hook — no project opts into one today */
function themeClass(_projectId) {
  return ''
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
  const { project, name, title, dark, device } = o
  if (!project || !name || !title) {
    usage()
    fail('missing --project, --name or --title')
  }
  if (!SLUG_RE.test(name)) {
    fail(`bad --name "${name}" — use kebab-case, e.g. my-screen`)
  }
  // --device is validated BEFORE any write (refuse-without-writing): ids come
  // from src/frame/devices.ts so the CLI can never invent a device the board,
  // NodePicker and export do not know. Absent = reference phone.
  let deviceId = null
  if (device) {
    const devicesSrc = await readFile(path.join(ROOT, 'src/frame/devices.ts'), 'utf8')
    const known = new Set([...devicesSrc.matchAll(/id: '([a-z0-9-]+)'/g)].map((m) => m[1]))
    if (!known.has(device)) {
      fail(`unknown --device "${device}" — valid: ${[...known].join(' | ')}`)
    }
    if (device !== 'reference') deviceId = device
  }

  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    fail(`project registry có lỗi — sửa trước:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }
  if (!registry.projects.some((p) => p.id === project)) {
    const ids = registry.projects.map((p) => p.id).join(' | ') || '(chưa có dự án nào)'
    fail(`unknown --project "${project}" — valid: ${ids}\n  tạo dự án mới: npm run project -- add <id>`)
  }
  if (registry.screens.some((s) => s.id === name)) {
    fail(`id "${name}" đã tồn tại (screen id unique toàn cục)`)
  }

  // --kind picks the chrome shape. It is a generator convenience, not a concept
  // the screen declares: the file's own slots and includes are the evidence.
  const KINDS = ['root', 'push', 'modal', 'bare']
  const kind = o.kind ?? 'push'
  if (!KINDS.includes(kind)) {
    fail(`unknown --kind "${kind}" — valid: ${KINDS.join(' | ')}`)
  }

  // A kind that reuses the project's chrome needs that chrome to exist, and a
  // `root` screen needs a real destination to point `data-tab-active` at.
  // Refuse BEFORE writing: a scaffold that fails lint is what this replaces.
  const isIpad = deviceId !== null && deviceId.startsWith('ipad')
  const needs = !isIpad && (kind === 'root' || kind === 'modal') ? `app-${kind === 'root' ? 'tabs' : 'nav'}` : null
  const chrome = new Map(
    registry.components.filter((c) => c.project === project).map((c) => [c.id, c.html]),
  )
  if (needs && !chrome.has(needs)) {
    fail(
      `--kind ${kind} cần project/${project}/components/${needs}.html nhưng chưa có.\n` +
        `  tạo nó trước (xem project/calo-ai/components/ làm mẫu), hoặc dùng --kind push | bare`,
    )
  }
  const destinations = chrome.has('app-tabs') ? slugsIn(chrome.get('app-tabs')) : []
  if (!isIpad && kind === 'root' && destinations.length === 0) {
    fail(
      `--kind root cần ít nhất một destination trong project/${project}/components/app-tabs.html\n` +
        `  thêm một \`data-tab="<slug>"\` vào đó trước, hoặc dùng --kind push | bare`,
    )
  }

  const file = `project/${project}/screens/${name}.html`
  const absFile = path.join(ROOT, file)
  try {
    await readFile(absFile, 'utf8')
    fail(`${file} already exists on disk`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }

  await mkdir(path.dirname(absFile), { recursive: true })
  await writeFile(
    absFile,
    header(title, dark, deviceId) +
      template(title, themeClass(project), deviceId, kind, destinations[0] ?? ''),
  )

  console.log(`created ${file}`)
  console.log(`kind: ${isIpad ? '(ipad template)' : kind}`)
  if (!isIpad && kind !== 'bare' && title.length >= 15) {
    console.log(
      'note: --title dài ≥ 15 ký tự nên slot nav dùng placeholder "Tiêu đề" — sửa thành tiêu đề thật, một dòng và ngắn',
    )
  }
  console.log(`board: màn xuất hiện ngay khi reload (không cần đăng ký)`)
  console.log('next: npm run lint && npm run build')
}

/** the destination slugs a chrome component declares, in document order */
function slugsIn(html) {
  const out = []
  for (const m of html.matchAll(/\bdata-tab\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    const slug = (m[1] ?? m[2] ?? m[3] ?? '').trim()
    if (slug) out.push(slug)
  }
  return out
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
