import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cssOf = (rel: string): string => readFileSync(join(here, rel), 'utf8')

vi.mock('../screens/tokens.css?raw', () => ({ default: cssOf('../screens/tokens.css') }))

const { tokenNameForColor, tokensOf } = await import('./tokens')

describe('tokensOf', () => {
  it('reads the shared vocabulary for any board id', () => {
    const names = tokensOf('anyboard').map((t) => t.name)
    expect(names).toContain('--s3')
    expect(names).toContain('--danger')
    expect(tokensOf('anyboard').find((t) => t.name === '--s3')?.light).toBe('12px')
  })

  it('falls back dark to light when a token defines no dark value', () => {
    const spacing = tokensOf('anyboard').find((t) => t.name === '--s3')
    expect(spacing?.dark).toBe(spacing?.light)
  })
})

describe('tokenNameForColor', () => {
  it('resolves a computed color to the first matching token', () => {
    expect(tokenNameForColor('anyboard', 'rgb(255, 59, 48)', 'light')).toBe('--danger')
  })

  it('returns null for non-token colors', () => {
    expect(tokenNameForColor('anyboard', 'rgb(1, 2, 3)')).toBeNull()
  })
})
