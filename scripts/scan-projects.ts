#!/usr/bin/env node
/**
 * The Node reader for the project-folder convention.
 *
 * Walks `project/` and hands the same `DeriveInput` the browser registry
 * builds from `import.meta.glob` to the same `deriveRegistry` — so export,
 * lint and CLI can never disagree with what the board shows.
 *
 *   npm run scan:projects          # print what was discovered
 */

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { deriveRegistry } from '../src/projects/derive.ts'
import type { DeriveError, DeriveInput, Registry } from '../src/projects/types.ts'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const toPosix = (p: string): string => p.split(path.sep).join('/')

async function listFiles(dir: string, ext?: string): Promise<string[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries
    .filter((entry) => entry.isFile() && (!ext || entry.name.endsWith(ext)))
    .map((entry) => path.join(dir, entry.name))
    .sort()
}

async function listDirs(dir: string): Promise<string[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort()
}

async function readOptional(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

async function walkFiles(dir: string, out: string[] = []): Promise<string[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) await walkFiles(abs, out)
    else if (entry.isFile()) out.push(abs)
  }
  return out
}

/**
 * Read `project/` under `root` and derive the registry. Returns errors instead
 * of throwing so lint/CLI can report every problem at once; the browser
 * registry throws on the same list.
 */
export async function scanProjects(
  root = ROOT,
): Promise<{ registry: Registry; errors: DeriveError[] }> {
  const screens: Record<string, string> = {}
  const components: Record<string, string> = {}
  const strays: Record<string, string> = {}
  const projectJson: Record<string, string> = {}
  const tokensCss: Record<string, string> = {}
  const assets: string[] = []

  const projectsDir = path.join(root, 'project')
  for (const id of await listDirs(projectsDir)) {
    const dir = path.join(projectsDir, id)
    const rel = (file: string) => toPosix(path.relative(root, file))

    const json = await readOptional(path.join(dir, 'project.json'))
    if (json !== null) projectJson[rel(path.join(dir, 'project.json'))] = json

    const css = await readOptional(path.join(dir, 'tokens.css'))
    if (css !== null) tokensCss[rel(path.join(dir, 'tokens.css'))] = css

    for (const file of await listFiles(dir, '.html')) strays[rel(file)] = await readFile(file, 'utf8')
    for (const file of await listFiles(path.join(dir, 'screens'), '.html'))
      screens[rel(file)] = await readFile(file, 'utf8')
    for (const file of await listFiles(path.join(dir, 'components'), '.html'))
      components[rel(file)] = await readFile(file, 'utf8')
    for (const file of (await walkFiles(path.join(dir, 'assets'))).sort()) assets.push(rel(file))
  }

  const input: DeriveInput = { screens, components, strays, projectJson, tokensCss, assets }
  return deriveRegistry(input)
}

function fail(message: string): never {
  console.error(`scan-projects: ${message}`)
  process.exit(1)
}

async function main(): Promise<void> {
  const { registry, errors } = await scanProjects()
  for (const error of errors) console.error(`error  ${error.file}  ${error.message}`)
  console.log(
    `projects: ${registry.projects.length} · screens: ${registry.screens.length} · components: ${registry.components.length}`,
  )
  for (const project of registry.projects) {
    console.log(`  ${project.id.padEnd(20)} ${project.title} (${project.screenIds.length} screens)`)
  }
  if (errors.length) process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)))
}
