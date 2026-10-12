import { DEFAULT_DEVICE_ID, getDevice } from '../frame/devices.ts'

/**
 * Column math for board nodes with mixed device widths (phone + iPad).
 *
 * Placement is by right edge, not by left-edge max: a wide iPad node placed
 * earlier reaches further right than a narrow phone node placed after it, so
 * `max(position.x) + width(new)` would stack the next node on top of the iPad.
 * For uniform phone boards this reduces to the old cursor exactly.
 */

/** minimal node shape for column math — no react-flow import, no cycles */
export type ColumnNode = {
  position: { x: number }
  data: { deviceId?: string }
}

/** outer canvas width of one node: screen plus chassis on both sides */
export function nodeOuterWidth(deviceId?: string): number {
  const d = getDevice(deviceId ?? DEFAULT_DEVICE_ID)
  return d.width + d.bezel * 2
}

/** outer canvas height of one node: screen plus chassis top/bottom */
export function nodeOuterHeight(deviceId?: string): number {
  const d = getDevice(deviceId ?? DEFAULT_DEVICE_ID)
  return d.height + d.bezel * 2
}

/** vertical gap between two arrangement rows — wider than the column gap
 *  so two stacked node labels never touch (phone 390 wide vs tablet 820). */
export const ROW_GAP = 160

/** right edge of the rightmost node (0 when the board is empty) */
export function rightEdge(nodes: ColumnNode[]): number {
  return nodes.reduce(
    (max, n) => Math.max(max, n.position.x + nodeOuterWidth(n.data.deviceId)),
    0,
  )
}

/** x for the next node appended to the row — never overlaps a wider sibling */
export function nextSlotX(nodes: ColumnNode[], gap: number): number {
  if (nodes.length === 0) return 0
  return rightEdge(nodes) + gap
}

/**
 * Arrange rows of cells into absolute canvas positions.
 *
 * Pure + deterministic: same rows + same deviceIds → same coordinates on
 * every machine. Each row restarts at x = 0 and uses the single-row
 * `nextSlotX` rule for its cells; the next row starts below the tallest
 * node of the row above plus `gapY`. Callers map cells back to nodes.
 */
export function layoutRows(
  rows: { deviceId?: string }[][],
  gapX: number,
  gapY: number = ROW_GAP,
): { x: number; y: number }[][] {
  const out: { x: number; y: number }[][] = []
  let y = 0
  for (const row of rows) {
    if (row.length === 0) continue
    const cells: { x: number; y: number }[] = []
    const placed: ColumnNode[] = []
    let rowH = 0
    for (const cell of row) {
      const x = nextSlotX(placed, gapX)
      cells.push({ x, y })
      placed.push({ position: { x }, data: { deviceId: cell.deviceId } })
      rowH = Math.max(rowH, nodeOuterHeight(cell.deviceId))
    }
    out.push(cells)
    y += rowH + gapY
  }
  return out
}

/** cut a flat ordered list into rows of at most `size` (last row shorter) */
export function chunkRows<T>(items: readonly T[], size: number): T[][] {
  if (!Number.isFinite(size) || size < 1) throw new Error(`row-size must be >= 1 (got ${String(size)})`)
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}
