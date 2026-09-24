import { DEFAULT_DEVICE_ID, getDevice } from '../frame/devices'

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
