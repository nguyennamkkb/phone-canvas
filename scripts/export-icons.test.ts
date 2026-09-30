import { describe, expect, it } from 'vitest'

import { SCALES, iconFileName, resolveOutDir } from './export-icons.ts'

describe('export:icons naming', () => {
  it('names <symbol>@<scale>x.png', () => {
    expect(iconFileName('house', 1)).toBe('house@1x.png')
    expect(iconFileName('chevron.left', 3)).toBe('chevron.left@3x.png')
  })

  it('covers exactly 1x/2x/3x', () => {
    expect([...SCALES]).toEqual([1, 2, 3])
  })

  it('resolves project out dir only for a single --project', () => {
    expect(resolveOutDir('/tmp/x', ['a'])).toBe('/tmp/x')
    expect(resolveOutDir(undefined, ['scratch-watch'])).toBe('project/scratch-watch/exports/icons')
    expect(resolveOutDir(undefined, [])).toBe('exports/icons')
    expect(resolveOutDir(undefined, ['a', 'b'])).toBe('exports/icons')
  })
})
