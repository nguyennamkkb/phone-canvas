#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Rename a screen id — all inside its project folder:
 *
 *   npm run rename-screen -- --id <old> --to <new>
 *
 *   1. `project/<owner>/screens/<old>.html` → `…/<new>.html` (fs rename)
 *   2. every `project/<id>/board.json` on disk: node data.screenId,
 *      removed[], trash screenIds (trash entry `id` prefix follows)
 *
 * Refuses bad input (unknown old id, bad/duplicate new slug, dest file
 * exists) WITHOUT writing. Writes happen last with rollback: any failure
 * mid-write restores every file touched so far — never a half rename.
 *
 * No manifest, no generated registry, no codegen — the folder is the registry.
 * Browser localStorage boards are NOT scannable from a CLI — they are
 * pruned reader-side on open (BoardView pruneZombieNodes).
 */

import { readFile, readdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { scanProjects } from './scan-projects.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function usage() {
  console.log(
    [
      'Rename a screen id (file + on-disk boards, inside the project folder).',
      '',
      '  npm run rename-screen -- --id <old> --to <new>',
      '',
      '  --id   existing screen id (from project/<id>/screens/)',
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

/** targeted rewrite of one parsed board/state file; returns { changed, trash } */
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

  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    fail(`project registry có lỗi — sửa trước:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }

  // ---- validate everything BEFORE writing anything ----
  const screen = registry.screens.find((s) => s.id === id)
  if (!screen) fail(`unknown --id "${id}" — không có screen nào tên này`)
  if (registry.screens.some((s) => s.id === to)) fail(`--to "${to}" đã tồn tại — chọn id khác`)

  const oldFile = screen.file
  const newFile = path.join(path.dirname(oldFile), `${to}.html`).replace(/\\/g, '/')
  const oldAbs = path.join(ROOT, oldFile)
  const newAbs = path.join(ROOT, newFile)
  try {
    await readFile(newAbs, 'utf8')
    fail(`${newFile} already exists on disk`)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
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
      const { changed, trash } = retargetBoard(parsed, id, to)
      if (changed) {
        boards.push({
          path: p,
          rel: `project/${pid}/board.json`,
          next: JSON.stringify(parsed, null, 2) + '\n',
          trash,
        })
      }
    }
  } catch {
    /* no project dir — fine */
  }

  // ---- write with rollback ----
  const restoredFiles = []
  const restore = async () => {
    const errors = []
    try {
      await rename(newAbs, oldAbs)
    } catch (e) {
      errors.push(`html: ${e.code ?? e.message}`)
    }
    for (const [p, content] of restoredFiles) {
      try {
        await writeFile(p, content)
      } catch (e) {
        errors.push(`${path.relative(ROOT, p)}: ${e.message}`)
      }
    }
    return errors
  }
  try {
    await rename(oldAbs, newAbs)
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

  const trashTotal = boards.reduce((n, b) => n + b.trash, 0)
  console.log(`renamed ${oldFile} -> ${newFile}`)
  console.log(`project: ${screen.projectId} (không cần sửa registry nào)`)
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
