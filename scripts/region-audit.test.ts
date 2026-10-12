import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { describeMissingChrome } from './region-audit.ts'
import { SCREENS } from '../src/projects/registry'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const run = promisify(execFile)

type Failed = { code: number; stdout: string; stderr: string }

/** run the real CLI and hand back its failure, never throwing on a non-zero exit */
async function runAudit(args: string[], env: NodeJS.ProcessEnv): Promise<Failed> {
  try {
    const ok = await run(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', path.join(ROOT, 'scripts/region-audit.ts'), ...args],
      { cwd: ROOT, env: { ...process.env, ...env } },
    )
    return { code: 0, stdout: ok.stdout, stderr: ok.stderr }
  } catch (error) {
    const failed = error as Failed
    return { code: failed.code, stdout: failed.stdout ?? '', stderr: failed.stderr ?? '' }
  }
}

describe('describeMissingChrome', () => {
  it('states the failure, why it matters, and every way to fix it', () => {
    const text = describeMissingChrome('$CHROME_PATH is set to "/nope", which does not exist.').join(
      '\n',
    )
    expect(text).toContain('MISSING CHROME')
    expect(text).toContain('/nope')
    expect(text).toContain('sàn chạm 44 pt')
    // the three remedies: install Chrome, point CHROME_PATH, install the pinned Chromium
    expect(text).toContain('CHROME_PATH=')
    expect(text).toContain('playwright install chromium')
    // and that the red gate is the point, not an accident
    expect(text).toContain('xanh giả')
  })
})

describe('audit:regions without a browser (2.2/2.3)', () => {
  it('exits 1 with the fix printed, and measures nothing', async () => {
    const screen = SCREENS[0]
    expect(screen).toBeDefined()
    const failed = await runAudit(
      ['--screen', screen!.id],
      // an explicit but wrong CHROME_PATH is authoritative: resolveChrome reports
      // it instead of falling through to whatever browser the machine happens to
      // have, so the failure is deterministic on every machine
      { CHROME_PATH: path.join(ROOT, 'no-such-browser', 'chrome') },
    )

    expect(failed.code).toBe(1)
    expect(failed.stderr).toContain('MISSING CHROME')
    expect(failed.stderr).toContain('no-such-browser')
    expect(failed.stderr).toContain('CHROME_PATH=')
    // it aborted before measuring: no pose line, no result summary
    expect(failed.stdout).not.toContain('lỗi vùng đo được')
    expect(failed.stdout).not.toContain('[chrome] source=')
  })

  it('still names an unknown screen instead of blaming the browser', async () => {
    const failed = await runAudit(['--screen', 'khong-co-man-nay'], {})
    expect(failed.code).toBe(1)
    expect(failed.stderr).toContain('no screen matched')
    expect(failed.stderr).not.toContain('MISSING CHROME')
  })
})
