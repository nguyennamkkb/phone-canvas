import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const vocab = readFileSync(join(here, 'vocab.css'), 'utf8')

describe('vocab.css .screen', () => {
  it('anchors the screen background to the viewport (fixed), matching .device', () => {
    const rule = /\.screen\s*\{[^}]*\}/.exec(vocab)?.[0] ?? ''
    expect(rule).toMatch(/background-attachment:\s*fixed/)
  })
})
