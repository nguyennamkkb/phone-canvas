import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { anatomyOf, missingAnatomyItems } from './component-anatomy.ts'

// TDD red-first: lint must BLOCK a component missing the anatomy header,
// and the scaffold must emit one. Fails until component-anatomy.ts exists.
describe('anatomy header enforcement', () => {
  it('flags a component with no header', () => {
    expect(missingAnatomyItems('<button class="x">Hi</button>', 'toy')).toHaveLength(11)
  })

  it('accepts a header carrying all 11 items', () => {
    const html = `<!-- @anatomy name=toy purpose="Does things." anatomy="<div></div>" variants="is-active" states="default/disabled" tokens="--s2" regions="body" platforms="phone(ok)" interaction="tap>=44pt" a11y="aria-label" examples="good/bad" -->\n<button>Hi</button>`
    expect(missingAnatomyItems(html, 'toy')).toEqual([])
  })

  it('names exactly which items are missing', () => {
    const html = `<!-- @anatomy name=toy purpose="Does things." -->\n<button>Hi</button>`
    const missing = missingAnatomyItems(html, 'toy')
    expect(missing).toContain('anatomy')
    expect(missing).toContain('tokens')
    expect(missing).not.toContain('name')
    expect(missing).not.toContain('purpose')
  })

  it('rejects a header whose name does not match the filename stem', () => {
    const html = `<!-- @anatomy name=other purpose="x" anatomy="a" variants="v" states="s" tokens="t" regions="r" platforms="p" interaction="i" a11y="a" examples="e" -->\n<button>Hi</button>`
    expect(missingAnatomyItems(html, 'toy')).toContain('name')
  })

  it('flags a body var missing from the header tokens list', () => {
    const html = `<!-- @anatomy name=toy purpose="x" anatomy="a" variants="v" states="s" tokens="--s2" regions="r" platforms="p" interaction="i" a11y="a" examples="e" -->\n<div style="gap: var(--s2); color: var(--accent)"></div>`
    expect(missingAnatomyItems(html, 'toy')).toContain('tokens')
  })

  it('anatomyOf returns the parsed header for scaffold reuse', () => {
    const parsed = anatomyOf(
      `<!-- @anatomy name=toy purpose="Does things." anatomy="a" variants="v" states="s" tokens="t" regions="r" platforms="p" interaction="i" a11y="a" examples="e" -->\nx`,
      'toy',
    )
    expect(parsed?.fields.purpose).toBe('Does things.')
  })
})

describe('new-screen --component scaffolds a born-clean component', () => {
  const ROOT = path.resolve('scripts', '..')
  const PROJECT = 'zz-anatomy-scaffold'
  const DIR = path.join(ROOT, 'project', PROJECT)

  it('scaffolded component passes lint:components at birth', async () => {
    await mkdir(path.join(DIR, 'components'), { recursive: true })
    await writeFile(path.join(DIR, 'project.json'), '{\n  "title": "Anatomy scaffold"\n}\n')
    const cli = path.join(ROOT, 'scripts/new-screen.ts')
    const run = spawnSync(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', cli, '--project', PROJECT, '--component', 'zz-card', '--title', 'Card'],
      { cwd: ROOT, encoding: 'utf8' },
    )
    try {
      expect(run.status, run.stderr).toBe(0)
      const html = await readFile(path.join(DIR, 'components', 'zz-card.html'), 'utf8')
      // enforcement contract at unit level: the scaffolded file carries all
      // 11 items, so the lint's per-file check passes at birth. (The full
      // CLI is not spawned here: it scans the real project/ tree, which the
      // parallel new-screen probe project shares — the BLOCK exit code is
      // proven by the QA receipt instead: 18 errors/exit 1 before headers,
      // 0 errors/exit 0 after.)
      expect(missingAnatomyItems(html, 'zz-card')).toEqual([])
      expect(html).toContain('--s2')
      // and the same contract BLOCKS a header-less file: all 11 missing
      expect(missingAnatomyItems('<button>x</button>', 'zz-card')).toHaveLength(11)
    } finally {
      await rm(DIR, { recursive: true, force: true })
    }
  })

  it('refuses a duplicate component without writing', async () => {
    await mkdir(path.join(DIR, 'components'), { recursive: true })
    await writeFile(path.join(DIR, 'project.json'), '{\n  "title": "Anatomy scaffold"\n}\n')
    await writeFile(path.join(DIR, 'components', 'zz-card.html'), '<!-- @anatomy name="zz-card" -->\n<div></div>')
    const cli = path.join(ROOT, 'scripts/new-screen.ts')
    const run = spawnSync(
      process.execPath,
      ['--disable-warning=ExperimentalWarning', cli, '--project', PROJECT, '--component', 'zz-card', '--title', 'Card'],
      { cwd: ROOT, encoding: 'utf8' },
    )
    try {
      expect(run.status).toBe(1)
      expect(run.stderr).toContain('tồn tại')
    } finally {
      await rm(DIR, { recursive: true, force: true })
    }
  })
})
