/**
 * board.json freeze writer — `npm run project -- freeze <id>`.
 *
 * Writes `project/<id>/board.json` in the exact `ProjectStateFile` shape
 * (`{v:1, projectId, exportedAt, board:{v:4, nodes, edges, removed, trash}}`)
 * that `parseStateFile` in `src/projects/storage.ts` already validates — so
 * the loader needs no new parser, no new semantics.
 *
 * Positions use the SAME rule the board uses (`nextSlotX` over
 * `nodeOuterWidth` from `src/board/placement.ts`, gap 120 = BoardView's
 * COLUMN_GAP). No duplicated placement math. This writer never touches
 * localStorage, reconcile, or flow.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { scanProjects } from './scan-projects.ts'
import { nextSlotX } from '../src/board/placement.ts'

export const FREEZE_GAP = 120

export function resolveBoardPath(projectId: string, root = process.cwd(), outDir?: string): string {
  const file = 'board.json'
  if (outDir) return path.join(outDir, `${projectId}-${file}`)
  return path.join(root, 'project', projectId, file)
}

/**
 * Freeze one project's board: every screen id with its column position.
 * Throws on unknown project or registry errors — never writes an empty board.
 */
export async function writeBoardFreeze(
  projectId: string,
  options: { root?: string; outDir?: string } = {},
): Promise<string> {
  const root = options.root ?? process.cwd()
  const { registry, errors } = await scanProjects(root)
  if (errors.length > 0) {
    throw new Error(`project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }
  const screens = registry.screens.filter((s) => s.projectId === projectId)
  if (screens.length === 0 && !registry.projects.some((p) => p.id === projectId)) {
    throw new Error(`unknown project "${projectId}"`)
  }
  const sorted = [...screens].sort((a, b) => a.id.localeCompare(b.id))
  const nodes = []
  const placed: { position: { x: number }; data: { deviceId?: string } }[] = []
  let n = 0
  for (const screen of sorted) {
    const deviceId = screen.deviceId ?? 'reference'
    const x = nextSlotX(placed, FREEZE_GAP)
    placed.push({ position: { x }, data: { deviceId } })
    nodes.push({
      id: `${projectId}-n${++n}`,
      type: 'phone',
      position: { x, y: 0 },
      data: { screenId: screen.id, deviceId },
    })
  }
  const freeze = {
    v: 1,
    projectId,
    exportedAt: Date.now(),
    board: { v: 4, nodes, edges: [], removed: [], trash: [] },
  }
  const file = resolveBoardPath(projectId, root, options.outDir)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(freeze, null, 2)}\n`)
  return file
}
