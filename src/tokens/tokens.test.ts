import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cssOf = (rel: string): string => readFileSync(join(here, rel), 'utf8')

vi.mock('../screens/tokens.css?raw', () => ({ default: cssOf('../screens/tokens.css') }))
vi.mock('../../project/moodtracker/tokens.css?raw', () => ({ default: cssOf('../../project/moodtracker/tokens.css') }))

const { tokenNameForColor, tokensOf } = await import('./tokens')

describe('tokensOf', () => {
  it('lets project values win over global ones', () => {
    const names = tokensOf('moodtracker').map((t) => t.name)
    expect(names).toContain('--sage-deep')
    // project file defines its own --accent; global --accent must not shadow it
    const accent = tokensOf('moodtracker').find((t) => t.name === '--accent')
    expect(accent?.light).toBe('#9ab068')
  })

  it('falls back dark to light when undefined', () => {
    const spacing = tokensOf('moodtracker').find((t) => t.name === '--s3')
    expect(spacing?.dark).toBe(spacing?.light)
  })
})

describe('tokenNameForColor', () => {
  it('resolves a computed color to the first matching token in each mode', () => {
    // several project tokens share values by design (--label-2 aliases --clay),
    // so the contract is first-match in token order, per mode
    expect(tokenNameForColor('moodtracker', 'rgb(138, 117, 106)', 'light')).toBe('--label-2')
    expect(tokenNameForColor('moodtracker', 'rgb(181, 163, 151)', 'dark')).toBe('--label-2')
  })

  it('returns null for non-token colors', () => {
    expect(tokenNameForColor('moodtracker', 'rgb(1, 2, 3)')).toBeNull()
  })
})
