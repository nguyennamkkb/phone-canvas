import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

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
 * Playwright-pinned Chromium revision every CI machine installs. Bump in one
 * place; `playwrightChromiumPath()` derives the binary path from it.
 */
export const PLAYWRIGHT_CHROMIUM_VERSION = 'chromium-1243'

/** Where `findChrome` ended up: explicit env, machine install, or CI fallback. */
export type ChromeSource = 'env' | 'local' | 'playwright'

export type ResolvedChrome = { path: string; source: ChromeSource }

/**
 * Playwright's cached Chromium binary for this OS, or null when it was
 * never downloaded here. Layout inside the version dir differs per OS:
 * macOS ships a `.app` bundle, Linux a `chrome-linux/` tree.
 */
export function playwrightChromiumPath(version = PLAYWRIGHT_CHROMIUM_VERSION): string | null {
  const cache =
    process.platform === 'darwin'
      ? join(homedir(), 'Library', 'Caches', 'ms-playwright')
      : process.platform === 'win32'
        ? join(homedir(), 'AppData', 'Local', 'ms-playwright')
        : join(homedir(), '.cache', 'ms-playwright')
  const rel =
    process.platform === 'darwin'
      ? join(version, 'chrome-mac-arm64', 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing')
      : process.platform === 'win32'
        ? join(version, 'chrome-win', 'chrome.exe')
        : join(version, 'chrome-linux', 'chrome')
  // Rosetta/Intel macs keep an x64 build next to the arm64 one.
  const candidates =
    process.platform === 'darwin' && process.arch === 'x64'
      ? [
          join(
            cache,
            version,
            'chrome-mac-x64',
            'Google Chrome for Testing.app',
            'Contents',
            'MacOS',
            'Google Chrome for Testing',
          ),
          join(cache, rel),
        ]
      : [join(cache, rel)]
  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

/**
 * `$CHROME_PATH` → machine Chrome → Playwright pinned Chromium. Pure
 * resolution (no logging); `findChrome` below is the logging entry point
 * every exporter calls.
 *
 * An explicit `$CHROME_PATH` is authoritative: if it is set but wrong, that
 * is a mistake worth reporting, and silently falling through to some other
 * browser would make `CHROME_PATH=/nonexistent` look like a successful run.
 */
export function resolveChrome(): ResolvedChrome {
  const override = process.env.CHROME_PATH
  if (override) {
    if (existsSync(override)) return { path: override, source: 'env' }
    throw new Error(`$CHROME_PATH is set to "${override}", which does not exist.`)
  }
  const found = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate))
  if (found) return { path: found, source: 'local' }
  const pinned = playwrightChromiumPath()
  if (pinned) return { path: pinned, source: 'playwright' }
  throw new Error(
    `No Chrome found. Install Google Chrome or set CHROME_PATH.\nTried:\n  ${CHROME_CANDIDATES.filter(Boolean).join('\n  ')}\n  Playwright ${PLAYWRIGHT_CHROMIUM_VERSION} (missing from the ms-playwright cache)`,
  )
}

/**
 * Chrome already on the machine (or $CHROME_PATH), Playwright pinned
 * Chromium as the CI fallback — throws when absent so smoke tests can skip.
 * Logs the winning source on every run so CI logs show which binary rendered.
 */
export function findChrome(): string {
  const resolved = resolveChrome()
  console.log(`[chrome] source=${resolved.source} path=${resolved.path}`)
  return resolved.path
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
