import { describe, expect, it } from 'vitest'

import { chromeSelectorHits, styleBlocksOf, styleDefsOf } from './screen-style.ts'

describe('screen-style helper (per-screen <style> blocks)', () => {
  it('collects var definitions from the block into the known set', () => {
    const html = `<style>.today-hero { --hero-gap: var(--s2); }</style>\n<div class="today-hero" style="gap: var(--hero-gap)">x</div>`
    expect(styleDefsOf(html)).toEqual(new Set(['--hero-gap']))
  })

  it('sees defs across multiple blocks', () => {
    const html = `<style>.a { --one: 1px; }</style><style>.b { --two: 2px; }</style>`
    expect(styleDefsOf(html)).toEqual(new Set(['--one', '--two']))
  })

  it('ignores blocks and defs inside HTML comments (stripped like the lints)', () => {
    const html = `<!-- <style>.x { --ghost: 1px; }</style> -->\n<div>y</div>`
    expect(styleBlocksOf(html)).toEqual([])
    expect(styleDefsOf(html)).toEqual(new Set())
  })

  it('flags chrome selectors: .device, .statusbar, .viewport, nav bands', () => {
    const html = `<style>.device { color: red; }\n.today-x, .statusbar { color: blue; }</style>`
    const hits = chromeSelectorHits(html).map((h) => h.selector)
    expect(hits).toContain('.device')
    expect(hits).toContain('.statusbar')
    expect(hits).not.toContain('.today-x')
  })

  it('flags bare html/body rules and slot containers', () => {
    const html = `<style>body { margin: 0; }\n.nav-slot-title { color: red; }</style>`
    const hits = chromeSelectorHits(html).map((h) => h.selector)
    expect(hits).toContain('body')
    expect(hits).toContain('.nav-slot-title')
  })

  it('passes a clean per-screen block with zero hits', () => {
    const html = `<style>.zz-hero { color: var(--label); }\n.zz-hero .row { gap: var(--s2); }</style>`
    expect(chromeSelectorHits(html)).toEqual([])
  })
})
