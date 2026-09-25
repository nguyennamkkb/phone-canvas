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
      '  npm run new-screen -- --project <id> --name <slug> --title "Title" [--dark] [--device ipad-11]',
      '',
      '  --project  project folder id (see npm run project -- list)',
      '  --name     kebab-case screen id, unique across all screens',
      '  --title    board/panel title',
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

function template(title, themeClass, deviceId) {
  if (deviceId && deviceId.startsWith('ipad')) {
    // iPad template: list + detail side by side, token classes only — no px.
    // Flex ratios are unitless so the same file stays fluid on any device width.
    return `<div class="screen${themeClass}">
  <header class="navbar">
    <span class="nav-title">${title}</span>
    <button class="icon-btn" aria-label="Close">
      <span class="icon icon-sm" data-symbol="xmark"></span>
    </button>
  </header>
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

  const file = `project/${project}/screens/${name}.html`
  const absFile = path.join(ROOT, file)
  try {
    await readFile(absFile, 'utf8')
    fail(`${file} already exists on disk`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }

  await mkdir(path.dirname(absFile), { recursive: true })
  await writeFile(absFile, header(title, dark, deviceId) + template(title, themeClass(project), deviceId))

  console.log(`created ${file}`)
  console.log(`board: màn xuất hiện ngay khi reload (không cần đăng ký)`)
  console.log('next: npm run lint && npm run build')
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
