#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Remove a screen — one file, inside its project folder:
 *
 *   npm run delete-screen -- --id <screen-id> [--force]
 *
 * Deletes `project/<owner>/screens/<id>.html`. There is no manifest entry to
 * edit and no codegen to run. Refuses when any on-disk `project/<id>/board.json`
 * still references the screen — pass `--force` to delete anyway. Browser
 * localStorage boards prune on open (reader-side).
 */

import { readFile, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { scanProjects } from './scan-projects.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function usage() {
  console.log(
    [
      'Delete a screen (its HTML file only).',
      '',
      '  npm run delete-screen -- --id <screen-id> [--force]',
      '',
      '  --id     screen id (filename stem under project/<id>/screens/)',
      '  --force  delete even when an on-disk board.json still references it',
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
    if (a === '--force') {
      out.force = true
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

function fail(msg) {
  console.error(`delete-screen: ${msg}`)
  process.exit(1)
}

/** how a parsed board/state file references a screen id */
function boardRefs(parsed, id) {
  const refs = []
  const board = parsed && typeof parsed === 'object' && parsed.board ? parsed.board : parsed
  if (!board || typeof board !== 'object') return refs
  if (Array.isArray(board.nodes)) {
    for (const n of board.nodes) if (n?.data?.screenId === id) refs.push('node')
  }
  if (Array.isArray(board.removed) && board.removed.includes(id)) refs.push('removed')
  if (Array.isArray(board.trash)) {
    for (const t of board.trash) {
      if (t?.screenId === id || t?.node?.data?.screenId === id) refs.push('trash')
    }
  }
  return refs
}

async function main() {
  let o
  try {
    o = args(process.argv.slice(2))
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e))
  }
  const { id, force } = o
  if (!id) {
    usage()
    fail('missing --id')
  }

  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    fail(`project registry có lỗi — sửa trước:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }
  const screen = registry.screens.find((s) => s.id === id)
  if (!screen) fail(`unknown --id "${id}" — không có screen nào tên này`)

  // board.json files are per project folder; a custom board may reference a
  // screen from any project, so scan them all.
  const references = []
  try {
    for (const pid of await readdir(path.join(ROOT, 'project'))) {
      const p = path.join(ROOT, 'project', pid, 'board.json')
      let raw
      try {
        raw = await readFile(p, 'utf8')
      } catch {
        continue
      }
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch {
        references.push(`project/${pid}/board.json (unreadable JSON — kiểm tra tay)`)
        continue
      }
      const refs = boardRefs(parsed, id)
      if (refs.length > 0) references.push(`project/${pid}/board.json (${refs.join(', ')})`)
    }
  } catch {
    /* no project dir — fine */
  }

  if (references.length > 0 && !force) {
    fail(
      `${id} còn được board tham chiếu:\n  ${references.join('\n  ')}\n  dùng --force nếu chắc muốn xoá`,
    )
  }

  await unlink(path.join(ROOT, screen.file))
  console.log(`removed ${screen.file}`)
  console.log(`project: ${screen.projectId} (không cần sửa registry nào)`)
  if (references.length > 0) console.log(`note: bỏ qua tham chiếu trong ${references.join(', ')} (--force)`)
  console.log('note: browser localStorage boards prune on open (reader-side)')
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
