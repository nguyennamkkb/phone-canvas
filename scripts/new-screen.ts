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
import { renderAnatomyHeader } from './component-anatomy.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function usage() {
  console.log(
    [
      'Scaffold a new phone screen.',
      '',
      '  npm run new-screen -- --project <id> --name <slug> --title "Title" [--kind push] [--dark] [--device ipad-11]',
      '  npm run new-screen -- --project <id> --component <slug> --title "Title"   (scaffold a component with its @anatomy header)',
      '',
      '  --component  component id (kebab-case): writes components/<slug>.html instead of',
      '               screens/<slug>.html, with the 11-item @anatomy header prefilled and',
      '               DNA tokens of the template pre-listed (lint:components passes at birth)',
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
    // iPad template: leading sidebar + title + 2-pane split, proven by the
    // scratch-tablet/library sample (change device-format-coverage). Token
    // classes only — no px. Tablet bands are author-owned (the shell only
    // owns phone bands), so sidebar/split are drawn here, never a phone
    // nav/tab: no data-slot, no app-tabs include.
    return `<div class="screen${themeClass}" style="background-color: var(--bg); flex-direction: row">
  <div class="sidebar" style="padding: var(--s4) var(--s3)">
    <div class="sidebar-head">Danh mục</div>
    <button class="sidebar-item is-active" aria-current="page" aria-label="Mục một">
      <span class="icon icon-sm" data-symbol="square.grid.2x2"></span>
      <span>Mục một</span>
    </button>
    <button class="sidebar-item" aria-label="Mục hai">
      <span class="icon icon-sm" data-symbol="clock"></span>
      <span>Mục hai</span>
    </button>
    <button class="sidebar-item" aria-label="Mục ba">
      <span class="icon icon-sm" data-symbol="star"></span>
      <span>Mục ba</span>
    </button>
    <button class="sidebar-item" aria-label="Mục bốn">
      <span class="icon icon-sm" data-symbol="gear"></span>
      <span>Mục bốn</span>
    </button>
  </div>
  <div class="col" style="flex: 1 1 auto; min-width: 0; gap: 0">
    <div class="t-title2" style="padding: var(--s4) var(--s4) var(--s2)">${title}</div>
    <div class="split" style="flex: 1 1 auto; min-height: 0; padding: 0 var(--s4) var(--s4); gap: var(--s4)">
      <div class="pane-lead paper-card" style="gap: var(--s2)">
        <div class="t-headline">Danh sách</div>
        <div class="t-subhead t-secondary">Các mục của ngăn dẫn hiện ở đây.</div>
      </div>
      <div class="pane-trail paper-card" style="gap: var(--s2); align-items: center; justify-content: center">
        <div class="t-title3">Ngăn chi tiết</div>
        <div class="t-subhead t-secondary">Placeholder — không để cột trống trơn.</div>
        <button class="btn btn-primary">Tiếp tục</button>
      </div>
    </div>
  </div>
</div>
`
  }
  if (deviceId && deviceId.startsWith('watch')) {
    // Watch template: top bar + one metric + bottom-bar action, no scroll.
    // Proven by scratch-watch/heart (change device-format-coverage). No slots,
    // no tabs: watch chrome is author-owned, and a scroller-less surface must
    // not inherit the phone body.
    return `<div class="screen${themeClass}" style="background-color: var(--bg); padding: var(--s3) var(--s4); gap: var(--s1)">
  <div class="row" style="justify-content: space-between; align-items: center">
    <span class="t-footnote t-secondary">9:41</span>
    <span class="t-footnote t-secondary">${title}</span>
  </div>
  <div class="col" style="flex: 1 1 auto; min-height: 0; gap: 0; align-items: center; justify-content: center">
    <div class="t-large">–</div>
    <div class="t-subhead t-secondary">thay bằng một số thật</div>
  </div>
  <button class="btn btn-primary btn-block">Thay bằng hành động chính</button>
</div>
`
  }
  if (deviceId && deviceId.startsWith('widget')) {
    // Widget template: glance content only — no scroll, no input, no bands.
    // Proven by scratch-widget/today (change device-format-coverage). An
    // overflowing widget is a content bug, so there is deliberately no body
    // to hide behind; keep every child inside 169 pt of height.
    return `<div class="screen${themeClass}" style="background-color: var(--bg); padding: var(--s4); gap: var(--s1); justify-content: center">
  <span class="t-footnote t-secondary">${title}</span>
  <div class="t-title2">Thay bằng một số thật</div>
  <div class="t-subhead t-secondary">thay bằng một dòng phụ</div>
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
  if (!project || !title || (!name && !o.component)) {
    usage()
    fail('missing --project, --title and --name (or --component)')
  }
  // component scaffold: same gate, cheaper default — a component is born
  // with its @anatomy header so lint:components passes at birth.
  if (o.component) {
    await scaffoldComponent(project, o.component, title)
    return
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
  const isWatch = deviceId !== null && deviceId.startsWith('watch')
  const isWidget = deviceId !== null && deviceId.startsWith('widget')
  const nonPhone = isIpad || isWatch || isWidget
  const needs = !nonPhone && (kind === 'root' || kind === 'modal') ? `app-${kind === 'root' ? 'tabs' : 'nav'}` : null
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
  if (!nonPhone && kind === 'root' && destinations.length === 0) {
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
  console.log(`kind: ${isIpad ? '(ipad template)' : isWatch ? '(watch template)' : isWidget ? '(widget template)' : kind}`)
  if (!nonPhone && kind !== 'bare' && title.length >= 15) {
    console.log(
      'note: --title dài ≥ 15 ký tự nên slot nav dùng placeholder "Tiêu đề" — sửa thành tiêu đề thật, một dòng và ngắn',
    )
  }
  console.log(`board: màn xuất hiện ngay khi reload (không cần đăng ký)`)
  console.log('next: npm run lint && npm run build')
}

/** scaffold a component: header + minimal body, born passing lint:components.
 * DNA-token prefill: the template body only uses global spacing/radius vars,
 * so the header pre-lists exactly the vars the body names — the lint's
 * tokens cross-check (every body var listed) holds without author edits. */
async function scaffoldComponent(project, slug, title) {
  if (!SLUG_RE.test(slug)) {
    fail(`bad --component "${slug}" — use kebab-case, e.g. stat-tile`)
  }
  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    fail(`project registry có lỗi — sửa trước:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }
  if (!registry.projects.some((p) => p.id === project)) {
    fail(`unknown --project "${project}" — tạo trước: npm run project -- add <id>`)
  }
  if (registry.components.some((c) => c.project === project && c.id === slug)) {
    fail(`component "${slug}" đã tồn tại trong project/${project}/components/`)
  }
  const file = `project/${project}/components/${slug}.html`
  const absFile = path.join(ROOT, file)
  try {
    await readFile(absFile, 'utf8')
    fail(`${file} already exists on disk`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }
  const body = [
    '<div class="col" style="gap: var(--s2)">',
    `  <div class="t-headline">${title}</div>`,
    '  <div class="t-subhead t-secondary">Thay bằng nội dung thật.</div>',
    '</div>',
    '',
  ].join('\n')
  const headerText = renderAnatomyHeader({
    name: slug,
    purpose: `${title}: mo ta 1 cau cong viec cua component.`,
    anatomy: 'div.col > div.t-headline + div.t-subhead',
    variants: 'khong co — them is-* khi can bien the that',
    states: 'default; pressed/loading khong bieu dien trong HTML tinh',
    tokens: '--s2',
    regions: 'body; khong dung trong nav/tab-list',
    platforms: 'phone ok; watch/widget rut gon khi can',
    interaction: 'khong tuong tac — the hien thi (sua khi them nut that)',
    a11y: 'tieu de la text that; them aria-label khi co hanh dong',
    examples: 'dung: text that + token; sai: de placeholder',
  })
  await mkdir(path.dirname(absFile), { recursive: true })
  await writeFile(absFile, headerText + body)
  console.log(`created ${file}`)
  console.log('anatomy: header 11 muc da prefill — sua noi dung + tokens cho khop body that')
  console.log('next: npm run lint:components')
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
