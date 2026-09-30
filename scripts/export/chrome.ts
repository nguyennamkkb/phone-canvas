import { existsSync } from 'node:fs'

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Chromium',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]

/**
 * Chrome already on the machine (or $CHROME_PATH) — throws when absent so smoke
 * tests can skip.
 *
 * An explicit `$CHROME_PATH` is authoritative: if it is set but wrong, that is
 * a mistake worth reporting, and silently falling through to some other
 * browser would make `CHROME_PATH=/nonexistent` look like a successful run.
 */
export function findChrome(): string {
  const override = process.env.CHROME_PATH
  if (override) {
    if (existsSync(override)) return override
    throw new Error(`$CHROME_PATH is set to "${override}", which does not exist.`)
  }
  const found = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
  if (!found) {
    throw new Error(
      `No Chrome found. Install Google Chrome or set CHROME_PATH.\nTried:\n  ${CHROME_CANDIDATES.filter(Boolean).join('\n  ')}`,
    )
  }
  return found
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
