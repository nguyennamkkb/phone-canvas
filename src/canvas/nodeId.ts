/**
 * Canvas node identity.
 *
 * A node is an *instance* of a screen, not the screen itself: the board can
 * hold the same screen twice. So a node id must never be derived from the
 * screen id — `n-journal-list` and `n-journal-list-9` look unique until the
 * add-a-screen index happens to repeat, and react-flow then sees two nodes with
 * one identity. It does not throw; it renders the wrong screen.
 *
 * A monotonic counter is unique by construction and stays unique for the life
 * of the session, which is exactly the guarantee react-flow needs.
 */

let counter = 0

export function nextNodeId(): string {
  counter += 1
  return `node-${counter}`
}
