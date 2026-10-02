/**
 * Progressive-disclosure label helper (C, 13§5): projected copy text.
 * Pure derivation — pinned by `nodeLabel.test.ts`. Kept OUT of the test file
 * so the app bundle never imports `vitest` (which breaks vite dev).
 */
export function labelCopyText(
  projectId: string | undefined,
  screenId: string,
): { ref: string; label: string } {
  const ref = projectId ? `${projectId}/${screenId}` : screenId
  return { ref, label: `#${ref}` }
}
