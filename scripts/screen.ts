#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Unified screen lifecycle entry (002-C):
 *
 *   npm run screen -- add|rename|remove|list ... | gate
 *   npm run screen -- --help
 *
 * Thin dispatcher over the three lifecycle scripts — add (new-screen),
 * rename (rename-screen), remove (delete-screen) — plus list (manifest
 * + owning project, no writes) and gate (screens:sync + tsc + lint,
 * the auto-verify remove/rename/add run). npm aliases new-screen /
 * delete-screen / rename-screen stay as the stable habit path.
 */

import { execFile } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = promisify(execFile)

const CMDS = {
  add: 'scripts/new-screen.ts',
  rename: 'scripts/rename-screen.ts',
  remove: 'scripts/delete-screen.ts',
}

function usage() {
  console.log(
    [
      'Manage phone screens (one entry for the whole lifecycle).',
      '',
      '  npm run screen -- add --project <id> --name <slug> --title "Title" [--dark] [--device <id>]',
      '  npm run screen -- rename --id <old> --to <new>',
      '  npm run screen -- remove --id <screen-id> [--force]',
      '  npm run screen -- list [--project <id>]',
      '  npm run screen -- gate',
      '',
      '  add     scaffold a screen (same as npm run new-screen)',
      '  rename  rename a screen id (same as npm run rename-screen)',
      '  remove  delete a screen (same as npm run delete-screen)',
      '  list    ids + titles + owners from the manifest (read-only)',
      '  gate    screens:sync + tsc --noEmit + lint (auto-runs after add/rename/remove)',
    ].join('\n'),
  )
}

function fail(msg) {
  console.error(`screen: ${msg}`)
  process.exit(1)
}

async function pass(cmd, args) {
  try {
    const { stdout, stderr } = await run(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', CMDS[cmd], ...args],
      { cwd: ROOT },
    )
    if (stdout) process.stdout.write(stdout)
    if (stderr) process.stderr.write(stderr)
  } catch (e) {
    if (e.stdout) process.stdout.write(e.stdout)
    if (e.stderr) process.stderr.write(e.stderr)
    else console.error(e instanceof Error ? e.message : String(e))
    process.exit(typeof e.code === 'number' ? e.code : 1)
  }
}

async function list(filterProject) {
  const { SCREEN_FILES } = await import('../src/screens/manifest.ts')
  const { BUILTIN_PROJECTS } = await import('../src/projects/builtin.ts')
  const ownerOf = (id) =>
    (BUILTIN_PROJECTS.find((p) => p.screenIds.includes(id)) ?? {}).id ?? '(custom)'
  const rows = SCREEN_FILES.filter((s) => !filterProject || ownerOf(s.id) === filterProject)
  if (filterProject && !BUILTIN_PROJECTS.some((p) => p.id === filterProject)) {
    const ids = BUILTIN_PROJECTS.map((p) => p.id).join(' | ')
    fail(`unknown --project "${filterProject}" — valid: ${ids}`)
  }
  for (const s of rows) console.log(`${s.id}\t${s.title}\t${ownerOf(s.id)}\t${s.file}`)
  console.log(`(${rows.length} screen${rows.length === 1 ? '' : 's'})`)
}

async function gate() {
  const runOne = async (label, fn) => {
    process.stdout.write(`gate: ${label} …\n`)
    try {
      const { stdout, stderr } = await fn()
      if (stdout) process.stdout.write(stdout)
      if (stderr) process.stderr.write(stderr)
      process.stdout.write(`gate: ${label} OK\n`)
    } catch (e) {
      if (e.stdout) process.stdout.write(e.stdout)
      if (e.stderr) process.stderr.write(e.stderr)
      fail(`${label} FAILED — fix above, nothing was hidden`)
    }
  }
  // node scripts keep the --disable-warning flag where node understands it;
  // tsc resolves the repo-local bin on PATH (no hardcoded node_modules path).
  await runOne('screens:sync', () =>
    run(process.execPath, ['--disable-warning=ExperimentalWarning', 'scripts/gen-registry.ts'], { cwd: ROOT }),
  )
  await runOne('tsc --noEmit', () => run('npx', ['--yes', 'tsc', '--noEmit'], { cwd: ROOT }))
  await runOne('lint', () => run('npm', ['run', 'lint', '--silent'], { cwd: ROOT }))
  process.stdout.write('gate: all green\n')
}

async function main() {
  const argv = process.argv.slice(2)
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    usage()
    process.exit(0)
  }
  const [cmd, ...rest] = argv
  if (cmd === 'add' || cmd === 'rename' || cmd === 'remove') {
    await pass(cmd, rest)
    console.log('---')
    await gate()
    return
  }
  if (cmd === 'list') {
    let project = null
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '--project') {
        project = rest[++i]
        if (!project || project.startsWith('--')) fail('--project needs a value')
      } else fail(`unknown argument: ${rest[i]}`)
    }
    await list(project)
    return
  }
  if (cmd === 'gate') {
    if (rest.length > 0) fail(`gate takes no arguments (got: ${rest.join(' ')})`)
    await gate()
    return
  }
  fail(`unknown command "${cmd}" — want: add | rename | remove | list | gate`)
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)))
