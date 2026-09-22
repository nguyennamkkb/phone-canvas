import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The week chart is the one place on home where two attributes encode the same
 * fact: the class carries the level (colour) and the inline style carries it
 * again as a height. Nothing in CSS ties them together — a stale class or a
 * hand-edited pixel still exports a chart that looks plausible while saying one
 * thing in colour and another in size. And a level the ramp has no rule for
 * renders a *transparent* bar, which reads as "no data", not as a bug.
 *
 * So this is the check that fails instead of the chart lying quietly.
 */

const HOME = 'project/moodtracker/home.html'
const TOKENS = 'project/moodtracker/tokens.css'

/** level 1..5 → the drawn height */
const heightFor = (level: number): number => 20 + (level - 1) * 12

describe('home — week chart', () => {
  const html = readFileSync(HOME, 'utf8')
  const css = readFileSync(TOKENS, 'utf8')
  const bars = [...html.matchAll(/is-(\d)" style="height: (\d+)px"/g)].map((m) => ({
    level: Number(m[1]),
    height: Number(m[2]),
  }))

  it('draws as many days as its pill claims', () => {
    expect(html).toContain('Mood · 7 days')
    expect(bars).toHaveLength(7)
  })

  it('agrees with itself — the coloured level and the drawn height match', () => {
    for (const bar of bars) {
      expect(bar.height).toBe(heightFor(bar.level))
    }
  })

  it('every level is one the ramp can actually colour', () => {
    for (const { level } of bars) {
      expect(level).toBeGreaterThanOrEqual(1)
      expect(level).toBeLessThanOrEqual(5)
      expect(css).toContain(`.mt-week-bar.is-${level} {`)
    }
  })
})
