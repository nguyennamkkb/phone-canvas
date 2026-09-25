#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Component lint (component-system gate).
 *
 *   npm run lint:components
 *
 * Rules:
 *   missing id   error — `<!-- @component x -->` with no component "x" in the
 *                        owning project (components never cross projects)
 *   cycle        error — component A includes B includes A (would not expand)
 *   unused       warn  — a component no screen and no other component references
 *
 * Discovery comes from scripts/scan-projects.ts, so component ids are scoped
 * to their project exactly like the board scopes them. Messages name file:line
 * + the fix. Only errors fail the gate.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { scanProjects } from './scan-projects.ts'

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

/** every cycle reachable in one project's component graph, as id chains */
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
  const { registry, errors: registryErrors } = await scanProjects()
  let errors = registryErrors.length
  let warnings = 0
  for (const error of registryErrors) console.error(`error  ${error.file}  ${error.message}`)

  const err = (file, line, msg) => {
    console.error(`error  ${file}:${line}  ${msg}`)
    errors += 1
  }
  const warn = (file, line, msg) => {
    console.warn(`warn   ${file}:${line}  ${msg}`)
    warnings += 1
  }

  const componentIdsOf = (projectId) =>
    new Set(registry.components.filter((c) => c.project === projectId).map((c) => c.id))

  // 1. every reference must resolve inside its own project
  for (const screen of registry.screens) {
    const ids = componentIdsOf(screen.projectId)
    for (const ref of refsIn(screen.html)) {
      if (!ids.has(ref.id)) {
        err(
          screen.file,
          lineOf(screen.html, ref.index),
          `@component "${ref.id}" không có trong project/${screen.projectId}/components/`,
        )
      }
    }
  }
  for (const component of registry.components) {
    const ids = componentIdsOf(component.project)
    for (const ref of refsIn(component.html)) {
      if (!ids.has(ref.id)) {
        err(
          component.file,
          lineOf(component.html, ref.index),
          `@component "${ref.id}" không có trong project/${component.project}/components/`,
        )
      }
    }
  }

  // 2. no cycles in each project's component graph
  const projects = new Set([...registry.screens.map((s) => s.projectId), ...registry.components.map((c) => c.project)])
  for (const projectId of projects) {
    const graph = new Map()
    for (const component of registry.components) {
      if (component.project !== projectId) continue
      graph.set(component.id, refsIn(component.html).map((r) => r.id))
    }
    for (const cycle of findCycles(graph)) {
      const file = registry.components.find((c) => c.project === projectId && c.id === cycle[0])?.file ?? `project/${projectId}/`
      err(file, 1, `vòng component: ${cycle.join(' → ')} — sẽ không expand được`)
    }
  }

  // 3. unused components (warning), per project
  const referenced = new Map()
  const note = (projectId, id) => {
    let set = referenced.get(projectId)
    if (!set) {
      set = new Set()
      referenced.set(projectId, set)
    }
    set.add(id)
  }
  for (const screen of registry.screens) for (const ref of refsIn(screen.html)) note(screen.projectId, ref.id)
  for (const component of registry.components) for (const ref of refsIn(component.html)) note(component.project, ref.id)
  for (const component of registry.components) {
    if (!referenced.get(component.project)?.has(component.id)) {
      warn(component.file, 1, `component "${component.id}" chưa được màn/component nào dùng`)
    }
  }

  console.log(`\n${errors} lỗi component${warnings ? `, ${warnings} cảnh báo` : ''}`)
  if (errors > 0) process.exit(1)
}

main().catch((error) => {
  console.error(`lint:components: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
