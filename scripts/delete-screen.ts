#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Permanently delete a screen (screen-trash 4.1) — the inverse of new-screen:
 *
 *   npm run delete-screen -- --id mood-calendar [--force]
 *
 * Removes:
 *   1. `project/<owner>/<name>.html` from disk
 *   2. the entry in `src/screens/manifest.ts`
 *   3. the id in the owning project's `screenIds` (builtin.ts)
 *   4. regenerates `src/screens/generated.ts` via screens:sync
 *
 * Refuses unknown ids WITHOUT writing. Refuses when the screen still has
 * nodes on a saved board unless `--force` is given — a board referencing a
 * deleted file renders nothing, so the check reads every state file under
 * project/<id>/board.json when present and refuses without --force.
 */

import { readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function usage() {
  console.log(
    [
      'Permanently delete a phone screen and its registry wiring.',
      '',
      '  npm run delete-screen -- --id <screen-id> [--force]',
      '',
      '  --id     screen id from src/screens/manifest.ts',
      '  --force  also delete while saved boards still reference the id',
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

  const [manifestSrc, builtinSrc] = await Promise.all([
    readFile(path.join(ROOT, 'src/screens/manifest.ts'), 'utf8'),
    readFile(path.join(ROOT, 'src/projects/builtin.ts'), 'utf8'),
  ])

  // locate the manifest entry — the file path is the identity on disk
  const entryMatch = manifestSrc
    .split('\n')
    .find((line) => line.includes(`id: '${id}'`) || line.includes(`id: "${id}"`))
  if (!entryMatch) fail(`unknown --id "${id}" — not in src/screens/manifest.ts`)
  const fileMatch = /file:\s*['"]([^'"]+)['"]/.exec(entryMatch)
  if (!fileMatch) fail(`entry "${id}" has no file path in manifest.ts`)
  const file = fileMatch[1]

  // board references: board.json state files, plus localStorage is runtime-only
  // (the browser cache dies with clearBoard; the file is the durable record)
  const refs = []
  try {
    const projectDir = path.join(ROOT, 'project')
    for (const pid of await readdir(projectDir)) {
      const boardJson = path.join(projectDir, pid, 'board.json')
      try {
        const raw = await readFile(boardJson, 'utf8')
        if (raw.includes(`"${id}"`)) refs.push(`project/${pid}/board.json`)
      } catch {
        /* no state file — fine */
      }
    }
  } catch {
    /* no project dir — fine */
  }
  if (!builtinSrc.includes(`'${id}'`) && !builtinSrc.includes(`"${id}"`)) {
    // id only in manifest (custom project screen) — still deletable
  }
  if (refs.length > 0 && !force) {
    fail(
      `"${id}" is still referenced by ${refs.join(', ')} — restore or drop it there first, or pass --force`,
    )
  }

  const marker = 'export const SCREEN_FILES: ScreenFile[] = ['
  const bodyStart = manifestSrc.indexOf(marker)
  if (bodyStart < 0) fail('cannot find SCREEN_FILES in manifest.ts')
  const bodyStart2 = bodyStart + marker.length
  const close = manifestSrc.indexOf(']', bodyStart2)
  if (close < 0) fail('cannot find SCREEN_FILES closing in manifest.ts')
  const kept = manifestSrc
    .slice(bodyStart2, close)
    .split('\n')
    .filter((line) => line.trim() && !line.includes(`id: '${id}'`) && !line.includes(`id: "${id}"`))
  const manifestNext =
    manifestSrc.slice(0, bodyStart2) + '\n' + kept.join('\n') + '\n]' + manifestSrc.slice(close + 1)
  const builtinNext = builtinSrc.replace(new RegExp(`,?\\s*['"]${id}['"]\\s*,?`), '')
  if (builtinNext === builtinSrc) {
    console.log(`note: "${id}" was not in builtin.ts (custom project screen?)`)
  }

  // delete order: file first is wrong here — registry first would leave a
  // file pointing at nothing on failure. Unlink the file first so a later
  // wiring failure leaves an (obvious) orphan file, never a registry
  // pointing at a missing file (which throws at startup).
  const absFile = path.join(ROOT, file)
  try {
    await unlink(absFile)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
    console.log(`note: ${file} already gone from disk`)
  }

  await writeFile(path.join(ROOT, 'src/screens/manifest.ts'), manifestNext)
  if (builtinNext !== builtinSrc) {
    await writeFile(path.join(ROOT, 'src/projects/builtin.ts'), builtinNext)
  }

  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  await promisify(execFile)(
    process.execPath,
    ['--disable-warning=ExperimentalWarning', 'scripts/gen-registry.ts'],
    { cwd: ROOT },
  )

  console.log(`deleted ${file}`)
  console.log('unwired: manifest + generated.ts + builtin.ts')
  console.log('next: npm run lint && npm run build')
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
