/**
 * Shared `--screen <id>` filter for the lint CLIs.
 *
 * Same semantics as `scripts/region-audit.ts` (the precedent): the flag is
 * additive — without it every screen is checked, exactly as before. A missing
 * or flag-like value also checks everything, so `--screen` can never silently
 * select nothing; an unknown-but-present id matches nothing and the caller
 * exits 1 loudly instead of printing a green zero.
 */

export function parseScreenFilter(argv: string[]): string | null {
  const i = argv.indexOf('--screen')
  if (i < 0) return null
  const value = argv[i + 1]
  if (value === undefined || value.startsWith('--')) return null
  return value
}

export function filterByScreen<T extends { id: string }>(items: readonly T[], only: string | null): T[] {
  if (!only) return [...items]
  return items.filter((item) => item.id === only)
}

/**
 * `--help` handling for the lint CLIs. The shared parser deliberately treats
 * a flag-like value as "no filter" (same as region-audit), so without this
 * `--screen --help` would check everything instead of printing help. Call it
 * first in main(); when it returns true the caller must return immediately.
 * Injectable log/exit keep it unit-testable without killing vitest.
 */
export function printHelpIfRequested(
  argv: string[],
  help: string,
  io: { log: (s: string) => void; exit: (code: number) => never } = { log: console.log, exit: (c) => process.exit(c) },
): boolean {
  if (!argv.includes('--help') && !argv.includes('-h')) return false
  io.log(help)
  io.exit(0)
  return true
}

/** loud failure for an unknown id — a green zero would be a lie */
export function reportNoScreenMatch(tool: string, only: string): never {
  console.error(`${tool}: no screen matched ${only}`)
  process.exit(1)
}
