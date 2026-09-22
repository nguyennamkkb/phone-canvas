/**
 * Which project screens a saved board is missing.
 *
 * A board snapshot is the arrangement you dragged out, and it is the only
 * thing in this app that persists. That makes it the one thing that can go
 * quietly stale: add a screen to `manifest.ts` and a board saved before that
 * screen existed will never show it — reloading changes nothing, because
 * nothing is being fetched. It is not a cache, and no amount of hard-reloading
 * fixes it.
 *
 * So a board reconciles against its project on open. Deletion is the reason
 * this needs a list rather than a set difference: a screen you deliberately
 * took off the board must stay off, otherwise the next open puts it back.
 *
 * Pure on purpose — the placement of the appended nodes is the caller's job.
 */
export function missingScreenIds(
  projectScreenIds: readonly string[],
  onBoard: Iterable<string>,
  removed: Iterable<string>,
): string[] {
  const present = new Set(onBoard)
  const gone = new Set(removed)
  return projectScreenIds.filter((id) => !present.has(id) && !gone.has(id))
}
