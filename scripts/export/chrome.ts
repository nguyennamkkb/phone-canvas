import { existsSync } from 'node:fs'

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Chromium',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]

/** Chrome already on the machine (or $CHROME_PATH) — throws when absent so smoke tests can skip. */
export function findChrome(): string {
  const found = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
  if (!found) {
    throw new Error(
      `No Chrome found. Install Google Chrome or set CHROME_PATH.\nTried:\n  ${CHROME_CANDIDATES.filter(Boolean).join('\n  ')}`,
    )
  }
  return found
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
