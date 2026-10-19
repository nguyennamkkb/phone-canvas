import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { backgroundFindings, describeMissingChrome } from './region-audit.ts'
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

const rect = (x: number, y: number, w: number, h: number) => ({ x, y, w, h })
const bgProbe = () => ({
  paint: {
    device: 'rgb(1,1,1)', screen: 'rgb(1,1,1)',
    deviceImage: 'url("/a.png")', screenImage: 'url("/a.png")',
    deviceAttachment: 'fixed', screenAttachment: 'fixed',
  },
  bgGeom: { device: rect(0, 0, 390, 844), screen: rect(0, 59, 390, 785), viewport: { w: 390, h: 844 } },
})

describe('backgroundFindings (nền chung một hệ toạ độ)', () => {
  it('passes when both painters anchor to the viewport', () => {
    expect(backgroundFindings('x', bgProbe())).toEqual([])
  })

  it('flags two coordinate spaces when only one painter is viewport-anchored', () => {
    const probe = bgProbe()
    const out = backgroundFindings('x', { ...probe, paint: { ...probe.paint, screenAttachment: 'scroll' } })
    expect(out.some((f) => f.check === 'background' && f.detail.includes('hai hệ toạ độ'))).toBe(true)
  })

  it('passes when rects are equal even without fixed anchoring', () => {
    const probe = bgProbe()
    const out = backgroundFindings('x', {
      paint: { ...probe.paint, deviceAttachment: 'scroll', screenAttachment: 'scroll' },
      bgGeom: { ...probe.bgGeom, screen: rect(0, 0, 390, 844) },
    })
    expect(out).toEqual([])
  })

  it('ignores a screen with no background image', () => {
    const probe = bgProbe()
    const out = backgroundFindings('x', {
      ...probe,
      paint: { ...probe.paint, deviceImage: 'none', screenImage: 'none', screenAttachment: 'scroll' },
    })
    expect(out).toEqual([])
  })

  it('keeps the value mismatch check', () => {
    const probe = bgProbe()
    expect(backgroundFindings('x', { ...probe, paint: { ...probe.paint, screen: 'rgb(2,2,2)' } })
      .some((f) => f.check === 'background')).toBe(true)
  })
})
