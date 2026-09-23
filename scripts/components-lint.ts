#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Component lint (component-system gate).
 *
 *   npm run lint:components
 *
 * Rules:
 *   missing id   error — `<!-- @component x -->` with no component "x"
 *   cycle        error — component A includes B includes A (would not expand)
 *   unused       warn  — a component no screen and no other component references
 *
 * Messages name file:line + the fix. Only errors fail the gate.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SCREEN_FILES } from '../src/screens/manifest.ts'
import { COMPONENT_FILES } from '../src/components/manifest.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PLACEHOLDER = /<!--\s*@component\s+([a-zA-Z0-9_-]+)\s*-->/g

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length
}

function refsIn(src) {
  const out = []
  PLACEHOLDER.lastIndex = 0
  let m
  while ((m = PLACEHOLDER.exec(src)) !== null) out.push({ id: m[1], index: m.index })
  return out
}

/** every cycle reachable in the component graph, as id chains */
function findCycles(graph) {
  const cycles = []
  const state = new Map() // 0 unvisited, 1 in-stack, 2 done
  const stack = []
  const seen = new Set()

  function visit(id) {
    state.set(id, 1)
    stack.push(id)
    for (const next of graph.get(id) ?? []) {
      if (!graph.has(next)) continue
      const s = state.get(next) ?? 0
      if (s === 1) {
        const at = stack.indexOf(next)
        const cycle = [...stack.slice(at), next]
        const key = [...cycle].sort().join('|')
        if (!seen.has(key)) {
          seen.add(key)
          cycles.push(cycle)
        }
      } else if (s === 0) {
        visit(next)
      }
    }
    stack.pop()
    state.set(id, 2)
  }

  for (const id of graph.keys()) if ((state.get(id) ?? 0) === 0) visit(id)
  return cycles
}

async function main() {
  const registry = new Map(COMPONENT_FILES.map((c) => [c.id, c]))
  let errors = 0
  let warnings = 0
  const err = (file, line, msg) => {
    console.error(`error  ${file}:${line}  ${msg}`)
    errors += 1
  }
  const warn = (file, line, msg) => {
    console.warn(`warn   ${file}:${line}  ${msg}`)
    warnings += 1
  }

  const componentSrc = new Map()
  for (const c of COMPONENT_FILES) componentSrc.set(c.id, await readFile(path.join(ROOT, c.file), 'utf8'))

  // 1. every reference must resolve
  for (const screen of SCREEN_FILES) {
    const html = await readFile(path.join(ROOT, screen.file), 'utf8')
    for (const ref of refsIn(html)) {
      if (!registry.has(ref.id)) {
        err(screen.file, lineOf(html, ref.index), `@component "${ref.id}" không có trong registry (xem src/components/manifest.ts)`)
      }
    }
  }
  for (const c of COMPONENT_FILES) {
    const html = componentSrc.get(c.id)
    for (const ref of refsIn(html)) {
      if (!registry.has(ref.id)) {
        err(c.file, lineOf(html, ref.index), `@component "${ref.id}" không có trong registry (xem src/components/manifest.ts)`)
      }
    }
  }

  // 2. no cycles in the component graph
  const graph = new Map()
  for (const c of COMPONENT_FILES) {
    graph.set(c.id, refsIn(componentSrc.get(c.id)).map((r) => r.id))
  }
  for (const cycle of findCycles(graph)) {
    const file = registry.get(cycle[0])?.file ?? '(component)'
    err(file, 1, `vòng component: ${cycle.join(' → ')} — sẽ không expand được`)
  }

  // 3. unused components (warning)
  const referenced = new Set()
  for (const screen of SCREEN_FILES) {
    for (const ref of refsIn(await readFile(path.join(ROOT, screen.file), 'utf8'))) referenced.add(ref.id)
  }
  for (const c of COMPONENT_FILES) {
    for (const ref of refsIn(componentSrc.get(c.id))) referenced.add(ref.id)
  }
  for (const c of COMPONENT_FILES) {
    if (!referenced.has(c.id)) {
      warn(c.file, 1, `component "${c.id}" chưa được màn/component nào dùng`)
    }
  }

  console.log(`\n${errors} lỗi component${warnings ? `, ${warnings} cảnh báo` : ''}`)
  if (errors > 0) process.exit(1)
}

main().catch((error) => {
  console.error(`lint:components: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
