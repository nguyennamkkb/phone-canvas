import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cssOf = (rel: string): string => readFileSync(join(here, rel), 'utf8')

vi.mock('../screens/tokens.css?raw', () => ({ default: cssOf('../screens/tokens.css') }))
vi.mock('../../project/onboarding/tokens.css?raw', () => ({ default: cssOf('../../project/onboarding/tokens.css') }))
vi.mock('../../project/mood-core/tokens.css?raw', () => ({ default: cssOf('../../project/mood-core/tokens.css') }))
vi.mock('../../project/freud/tokens.css?raw', () => ({ default: cssOf('../../project/freud/tokens.css') }))

const { tokenNameForColor, tokensOf } = await import('./tokens')

describe('tokensOf', () => {
  it('lets project values win over global ones', () => {
    const names = tokensOf('mood-core').map((t) => t.name)
    expect(names).toContain('--sage-deep')
    // project file defines its own --accent; global --accent must not shadow it
    const accent = tokensOf('mood-core').find((t) => t.name === '--accent')
    expect(accent?.light).toBe('#7c9448')
  })

  it('falls back dark to light when undefined', () => {
    const spacing = tokensOf('mood-core').find((t) => t.name === '--s3')
    expect(spacing?.dark).toBe(spacing?.light)
  })
})

describe('tokenNameForColor', () => {
  it('resolves a computed color to the first matching token in each mode', () => {
    // several project tokens share values by design (--label-2 aliases --clay),
    // so the contract is first-match in token order, per mode
    expect(tokenNameForColor('mood-core', 'rgb(138, 122, 110)', 'light')).toBe('--label-2')
    expect(tokenNameForColor('mood-core', 'rgb(191, 174, 158)', 'dark')).toBe('--label-2')
  })

  it('returns null for non-token colors', () => {
    expect(tokenNameForColor('mood-core', 'rgb(1, 2, 3)')).toBeNull()
  })
})
