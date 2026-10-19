/**
 * board.json freeze writer — `npm run project -- freeze <id>`.
 *
 * Writes `project/<id>/board.json` in the exact `ProjectStateFile` shape
 * (`{v:1, projectId, exportedAt, board:{v:5, nodes, edges, removed, trash}}`)
 * that `parseStateFile` in `src/projects/storage.ts` already validates — so
 * the loader needs no new parser, no new semantics. The artifact is a SEED for
 * `seedBoard`, which opens it only when no record exists or the artifact is
 * newer; the previous artifact is kept as `board.json.bak` before each write.
 *
 * Positions use the SAME rule the board uses (`layoutRows` over
 * `nodeOuterWidth`/`nodeOuterHeight` from `src/board/placement.ts`,
 * gap 120 = BoardView's COLUMN_GAP). No duplicated placement math.
 * This writer never touches localStorage, reconcile, or flow.
 *
 * Rows (board-arrangement):
 *   --order a,b,c        place these screens first, in this order
 *   --row-size N         cut the order into rows of N (last row shorter)
 *   --rows "a,b;c,d"     explicit rows (`;` splits rows, `,` splits screens)
 *   --row-names "A;B"    optional group label per row (index-aligned)
 *   --sort alpha         manifest order is the default; alpha keeps the old
 *                        single-row alphabetical output
 *   --dry-run            print rows + coordinates, write nothing
 *
 * Screens not named by --order/--rows are appended after, in manifest order.
 * Unknown ids fail before anything is written (no file, no .bak touch).
 */

import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { scanProjects } from './scan-projects.ts'
import { chunkRows, layoutRows } from '../src/board/placement.ts'

export const FREEZE_GAP = 120

export function resolveBoardPath(projectId: string, root = process.cwd(), outDir?: string): string {
  const file = 'board.json'
  if (outDir) return path.join(outDir, `${projectId}-${file}`)
  return path.join(root, 'project', projectId, file)
}
/** parse --rows "a,b;c,d" (also accepts newlines as row separators) */
export function parseRowsFlag(flag: string): string[][] {
  return flag
    .split(/[;\n]/)
    .map((row) =>
      row
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    )
    .filter((row) => row.length > 0)
}

export type FreezeOptions = {
  root?: string
  outDir?: string
  /** explicit first-order; unlisted screens append after in manifest order */
  order?: string[]
  /** cut the order into rows of N */
  rowSize?: number
  /** explicit rows; unlisted screens append as one final row */
  rows?: string[][]
  /** group label per row, index-aligned (missing → unnamed, extra ignored) */
  rowNames?: string[]
  /** default manifest; alpha restores the pre-arrangement output */
  sort?: 'manifest' | 'alpha'
  /** print rows + coordinates, write nothing */
  dryRun?: boolean
}

/**
 * Freeze one project's board: every screen id with its row position.
 * Throws on unknown project, unknown screen id, or registry errors —
 * never writes an empty board and never writes on validation failure.
 */
export async function writeBoardFreeze(projectId: string, options: FreezeOptions = {}): Promise<string> {
  const root = options.root ?? process.cwd()
  const { registry, errors } = await scanProjects(root)
  if (errors.length > 0) {
    throw new Error(`project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
  }
  const project = registry.projects.find((p) => p.id === projectId)
  const screens = registry.screens.filter((s) => s.projectId === projectId)
  if (screens.length === 0 && !project) {
    throw new Error(`unknown project "${projectId}"`)
  }
  const byId: Record<string, (typeof screens)[number] | undefined> = Object.fromEntries(screens.map((s) => [s.id, s]))
  // default order is the manifest (what a fresh board shows); alpha is opt-in
  const manifestOrder = (project?.screenIds ?? screens.map((s) => s.id)).filter((id) => byId[id] !== undefined)
  const listed = [...(options.rows ?? []).flat(), ...(options.order ?? [])]
  const unknown = listed.filter((id) => byId[id] === undefined)
  if (unknown.length > 0) {
    throw new Error(`unknown screen id(s) for project "${projectId}": ${[...new Set(unknown)].join(', ')}`)
  }
  if (options.rowSize !== undefined && (!Number.isInteger(options.rowSize) || options.rowSize < 1)) {
    throw new Error(`--row-size must be an integer >= 1 (got ${String(options.rowSize)})`)
  }

  const base = options.sort === 'alpha' ? [...manifestOrder].sort((a, b) => a.localeCompare(b)) : manifestOrder
  const rest = base.filter((id) => !listed.includes(id))
  let rows: string[][]
  if (options.rows && options.rows.length > 0) {
    rows = [...options.rows.map((r) => [...r])]
    if (rest.length > 0) rows.push(rest)
  } else if (options.order && options.order.length > 0) {
    const ordered = [...options.order, ...rest]
    rows = options.rowSize ? chunkRows(ordered, options.rowSize) : [ordered]
  } else if (options.rowSize) {
    rows = chunkRows(base, options.rowSize)
  } else {
    rows = [base]
  }

  const names = options.rowNames ?? []
  const cells = layoutRows(
    rows.map((row) => row.map((id) => ({ deviceId: byId[id]?.deviceId ?? 'reference' }))),
    FREEZE_GAP,
  )
  const nodes: { id: string; type: string; position: { x: number; y: number }; data: { screenId: string; deviceId: string } }[] = []
  let n = 0
  rows.forEach((row, ri) => {
    row.forEach((id, ci) => {
      const deviceId = byId[id]?.deviceId ?? 'reference'
      const pos = cells[ri]?.[ci] ?? { x: 0, y: 0 }
      nodes.push({
        id: `${projectId}-n${++n}`,
        type: 'phone',
        position: pos,
        data: { screenId: id, deviceId },
      })
    })
  })
  const arrangement = rows.map((screens, i) => (names[i] ? { name: names[i], screens } : { screens }))
  const freeze = {
    v: 1,
    projectId,
    exportedAt: Date.now(),
    board: { v: 5, nodes, edges: [], removed: [], trash: [], arrangement },
  }

  if (options.dryRun) {
    for (let i = 0; i < rows.length; i++) {
      const label = names[i] ? ` [${names[i]}]` : ''
      console.log(`row ${i + 1}${label}: ${(rows[i] ?? []).join(', ')}`)
      for (const node of nodes.filter((x) => (rows[i] ?? []).includes(x.data.screenId))) {
        console.log(`  ${node.data.screenId}: x=${node.position.x} y=${node.position.y}`)
      }
    }
    return ''
  }
  const file = resolveBoardPath(projectId, root, options.outDir)
  await mkdir(path.dirname(file), { recursive: true })
  await backupPrevious(file)
  await writeFile(file, `${JSON.stringify(freeze, null, 2)}\n`)
  return file
}

/**
 * Design rollback (5.2): the artifact this run is about to replace survives as
 * `<file>.bak`, so re-freezing a bad arrangement is one `mv` away from being
 * undone. Best-effort by contract — a first freeze has nothing to back up and
 * an unreadable/quota-locked file must never fail the freeze itself, which is
 * the actual deliverable. Applies to `--out` mode too: same path, same rule.
 */
async function backupPrevious(file: string): Promise<void> {
  try {
    await copyFile(file, `${file}.bak`)
  } catch {
    /* nothing to roll back to — the freeze still goes through */
  }
}
