#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Rename a screen id atomically — the missing middle of the lifecycle:
 *
 *   npm run rename-screen -- --id <old> --to <new>
 *
 * Moves the id across:
 *   1. `project/<owner>/<old>.html` → `project/<owner>/<new>.html` (fs rename)
 *   2. the whole entry line in `src/screens/manifest.ts` (id + file; any
 *      extra props like lightStatusBar/deviceId ride along untouched)
 *   3. the quoted id in `src/projects/builtin.ts` (screenIds, coverId, …)
 *   4. regenerates `src/screens/generated.ts` via screens:sync
 *   5. every `project/<id>/board.json` on disk: node data.screenId,
 *      removed[], trash screenIds (trash entry `id` prefix follows)
 *
 * Refuses bad input (unknown old id, bad/duplicate new slug, dest file
 * exists) WITHOUT writing. Writes happen last with rollback: any failure
 * mid-write restores every file touched so far — never a half rename.
 *
 * Browser localStorage boards are NOT scannable from a CLI — they are
 * pruned reader-side on open (BoardView pruneZombieNodes, 002-A).
 */

import { readFile, readdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function usage() {
  console.log(
    [
      'Rename a screen id across file, manifest, builtin, boards.',
      '',
      '  npm run rename-screen -- --id <old> --to <new>',
      '',
      '  --id   existing screen id from src/screens/manifest.ts',
      '  --to   new kebab-case id, unique across all screens',
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

function fail(msg) {
  console.error(`rename-screen: ${msg}`)
  process.exit(1)
}

const quoted = (src, id) => src.includes(`'${id}'`) || src.includes(`"${id}"`)

/** targeted rewrite of one parsed board/state file; returns { next, touched, trash } */
function retargetBoard(parsed, oldId, newId) {
  let touched = 0
  let trash = 0
  const board = parsed && typeof parsed === 'object' && parsed.board ? parsed.board : parsed
  if (!board || typeof board !== 'object') return { changed: false, trash: 0 }
  const fixNode = (n) => {
    if (n && n.data && n.data.screenId === oldId) {
      n.data.screenId = newId
      touched++
    }
  }
  if (Array.isArray(board.nodes)) board.nodes.forEach(fixNode)
  if (Array.isArray(board.removed)) {
    board.removed = board.removed.map((x) => {
      if (x === oldId) {
        touched++
        return newId
      }
      return x
    })
  }
  if (Array.isArray(board.trash)) {
    for (const t of board.trash) {
      if (t && t.screenId === oldId) {
        t.screenId = newId
        touched++
        trash++
      }
      if (t && typeof t.id === 'string' && t.id.startsWith(`${oldId}-`)) {
        t.id = `${newId}${t.id.slice(oldId.length)}`
      }
      if (t && t.node) fixNode(t.node)
    }
  }
  return { changed: touched > 0, trash }
}

async function main() {
  let o
  try {
    o = args(process.argv.slice(2))
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
  const { id, to } = o
  if (!id || !to) {
    usage()
    fail('missing --id or --to')
  }
  if (id === to) fail('old and new ids are the same — nothing to do')
  if (!SLUG_RE.test(to)) fail(`bad --to "${to}" — use kebab-case, e.g. my-screen`)

  const manifestPath = path.join(ROOT, 'src/screens/manifest.ts')
  const builtinPath = path.join(ROOT, 'src/projects/builtin.ts')
  const [manifestSrc, builtinSrc] = await Promise.all([
    readFile(manifestPath, 'utf8'),
    readFile(builtinPath, 'utf8'),
  ])

  // ---- validate everything BEFORE writing anything ----
  const lines = manifestSrc.split('\n')
  const hits = lines.filter((l) => l.includes(`id: '${id}'`) || l.includes(`id: "${id}"`))
  if (hits.length === 0) fail(`unknown --id "${id}" — not in src/screens/manifest.ts`)
  if (hits.length > 1) fail(`id "${id}" matches ${hits.length} manifest lines — refusing to guess`)
  const entryLine = hits[0]
  const fileMatch = /file:\s*['"]([^'"]+)['"]/.exec(entryLine)
  if (!fileMatch) fail(`entry "${id}" has no file path in manifest.ts`)
  const oldFile = fileMatch[1]
  const newFile = path.join(path.dirname(oldFile), `${to}.html`).replace(/\\/g, '/')

  if (quoted(manifestSrc, to) || quoted(builtinSrc, to)) {
    fail(`--to "${to}" already exists — pick an unused id`)
  }
  const oldAbs = path.join(ROOT, oldFile)
  const newAbs = path.join(ROOT, newFile)
  try {
    await readFile(oldAbs, 'utf8')
  } catch (e) {
    if (e.code === 'ENOENT') fail(`${oldFile} missing on disk — manifest points at nothing, fix that first`)
    throw e
  }
  try {
    await readFile(newAbs, 'utf8')
    fail(`${newFile} already exists on disk`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }

  let owner = null
  for (const m of builtinSrc.matchAll(/id: '([a-z-]+)'[\s\S]*?screenIds: \[([\s\S]*?)\]/g)) {
    if (m[2].includes(`'${id}'`) || m[2].includes(`"${id}"`)) {
      owner = m[1]
      break
    }
  }

  // scan on-disk boards (exported state files users keep at project/<id>/board.json)
  const boards = []
  const skipped = []
  try {
    for (const pid of await readdir(path.join(ROOT, 'project'))) {
      const p = path.join(ROOT, 'project', pid, 'board.json')
      let raw
      try {
        raw = await readFile(p, 'utf8')
      } catch {
        continue // no state file — fine
      }
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        skipped.push(`project/${pid}/board.json (unreadable JSON, left alone)`)
        continue
      }
      const before = JSON.stringify(parsed)
      const { changed, trash } = retargetBoard(parsed, id, to)
      if (changed) boards.push({ path: p, rel: `project/${pid}/board.json`, next: JSON.stringify(parsed, null, 2) + '\n', trash, before })
    }
  } catch {
    /* no project dir — fine */
  }

  // ---- compute new contents (still no writes) ----
  const quote = entryLine.includes(`id: '${id}'`) ? "'" : '"'
  const manifestNext = manifestSrc.replace(
    entryLine,
    entryLine.replace(`id: ${quote}${id}${quote}`, `id: ${quote}${to}${quote}`).replace(oldFile, newFile),
  )
  if (manifestNext === manifestSrc) fail('internal: manifest rewrite produced no change')
  const builtinNext = builtinSrc.split(`'${id}'`).join(`'${to}'`).split(`"${id}"`).join(`"${to}"`)

  // ---- write with rollback ----
  const restored = []
  const restore = async () => {
    const errors = []
    try {
      await rename(newAbs, oldAbs)
      restored.push('html back')
    } catch (e) {
      errors.push(`html: ${e.code ?? e.message}`)
    }
    for (const [p, content] of restoredFiles) {
      try {
        await writeFile(p, content)
        restored.push(path.relative(ROOT, p))
      } catch (e) {
        errors.push(`${path.relative(ROOT, p)}: ${e.message}`)
      }
    }
    return errors
  }
  const restoredFiles = []
  try {
    await rename(oldAbs, newAbs)
    restoredFiles.push([manifestPath, manifestSrc])
    await writeFile(manifestPath, manifestNext)
    if (builtinNext !== builtinSrc) {
      restoredFiles.push([builtinPath, builtinSrc])
      await writeFile(builtinPath, builtinNext)
    }
    for (const b of boards) {
      restoredFiles.push([b.path, await readFile(b.path, 'utf8')])
      await writeFile(b.path, b.next)
    }
  } catch (e) {
    const errors = await restore()
    fail(
      `write failed (${e instanceof Error ? e.message : String(e)}); rollback ${errors.length === 0 ? 'complete' : 'PARTIAL: ' + errors.join('; ')}`,
    )
  }

  // regenerate the ?raw registry from the manifest (same mechanism as new-screen)
  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  try {
    await promisify(execFile)(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', 'scripts/gen-registry.ts'],
      { cwd: ROOT },
    )
  } catch (e) {
    fail(
      `renamed ${oldFile} -> ${newFile} and rewired manifest/builtin/boards, but screens:sync failed — run it manually: ${e instanceof Error ? e.message : String(e)}`,
    )
  }

  const trashTotal = boards.reduce((n, b) => n + b.trash, 0)
  console.log(`renamed ${oldFile} -> ${newFile}`)
  console.log(
    `wired: manifest + generated.ts + builtin.ts${owner ? ` [${owner}]` : ' (not in builtin — custom project screen?)'}`,
  )
  console.log(
    boards.length > 0
      ? `boards: ${boards.map((b) => b.rel).join(', ')} rewritten`
      : 'boards: none on disk referenced the old id',
  )
  if (trashTotal > 0) console.log(`trash: ${trashTotal} entr${trashTotal === 1 ? 'y' : 'ies'} retargeted`)
  for (const s of skipped) console.log(`note: ${s}`)
  console.log('note: browser localStorage boards prune on open (reader-side) — no CLI action needed')
  console.log('next: npm run screen -- gate (or: npm run lint && npm test)')
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
