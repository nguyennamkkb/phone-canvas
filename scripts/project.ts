#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Project lifecycle — the folder IS the project:
 *
 *   npm run project -- add <id> [--title "Title"]
 *   npm run project -- remove <id> [--force]
 *   npm run project -- list
 *
 * add writes `project/<id>/project.json`; screens/components/tokens/assets are
 * added by dropping files into the folder (see `npm run screen -- add`).
 * remove deletes the whole folder and refuses while a board.json lives in it,
 * unless --force. Dashboard-created (localStorage) projects have no folder and
 * are not touched here.
 */

import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { ROOT, scanProjects } from './scan-projects.ts'
import { writeBoardFreeze } from './board-freeze.ts'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function usage() {
  console.log(
    [
      'Manage projects (one folder per project).',
      '',
      '  npm run project -- add <id> [--title "Title"] [--description "…"]',
      '  npm run project -- remove <id> [--force]',
      '  npm run project -- freeze <id>              # write project/<id>/board.json layout seed',
      '  npm run project -- list',
      '',
      `  folders live in project/<id>/ — screens/, components/, tokens.css, assets/`,
    ].join('\n'),
  )
}

function fail(msg) {
  console.error(`project: ${msg}`)
  process.exit(1)
}

function parse(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      usage()
      process.exit(0)
    }
    if (a === '--force') {
      flags.force = true
      continue
    }
    if (a.startsWith('--')) {
      const v = argv[++i]
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`)
      flags[a.slice(2)] = v
      continue
    }
    positional.push(a)
  }
  return { positional, flags }
}

async function statOrNull(target) {
  try {
    return await stat(target)
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

async function add(id, flags) {
  if (!SLUG_RE.test(id)) fail(`bad id "${id}" — use kebab-case, e.g. my-app`)
  const dir = path.join(ROOT, 'project', id)
  if (await statOrNull(dir)) fail(`project/${id}/ đã tồn tại trên đĩa`)

  const meta = { title: flags.title ?? id.split('-').filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') }
  if (flags.description) meta.description = flags.description

  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'project.json'), JSON.stringify(meta, null, 2) + '\n')

  console.log(`created project/${id}/project.json`)
  console.log(`next: npm run screen -- add --project ${id} --name <slug> --title "…"`)
}

async function remove(id, force) {
  const dir = path.join(ROOT, 'project', id)
  if (!(await statOrNull(dir))) fail(`project/${id}/ không tồn tại`)

  if ((await statOrNull(path.join(dir, 'board.json'))) && !force) {
    fail(`project/${id}/board.json còn layout đã export — dùng --force nếu chắc muốn xoá cả thư mục`)
  }

  await rm(dir, { recursive: true, force: true })
  console.log(`removed project/${id}/`)
  console.log('note: browser localStorage boards prune on open (reader-side)')
}

async function list() {
  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    for (const error of errors) console.error(`error  ${error.file}  ${error.message}`)
    process.exit(1)
  }
  if (registry.projects.length === 0) {
    console.log('(chưa có dự án nào — npm run project -- add <id>)')
    return
  }
  for (const project of registry.projects) {
    console.log(`${project.id.padEnd(20)} ${project.title} (${project.screenIds.length} screens)`)
  }
  console.log(`(${registry.projects.length} project${registry.projects.length === 1 ? '' : 's'})`)
}

async function main() {
  const { positional, flags } = parse(process.argv.slice(2))
  const [cmd, id] = positional
  if (!cmd) {
    usage()
    process.exit(0)
  }
  if (cmd === 'add') {
    if (!id) fail('add needs an id')
    await add(id, flags)
    return
  }
  if (cmd === 'remove') {
    if (!id) fail('remove needs an id')
    await remove(id, Boolean(flags.force))
    return
  }
  if (cmd === 'freeze') {
    if (!id) fail('freeze needs an id')
    // board.json is a layout seed only: the board still loads localStorage
    // first and reads this file solely when no saved state exists.
    const file = await writeBoardFreeze(id).catch((e) => fail(e instanceof Error ? e.message : String(e)))
    const rel = path.relative(ROOT, file)
    console.log(`froze ${rel}`)
    console.log('note: board loads localStorage first; board.json seeds empty boards only')
    return
  }
  if (cmd === 'list') {
    await list()
    return
  }
  fail(`unknown command "${cmd}" — want: add | remove | freeze | list`)
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
