import { describe, expect, it } from 'vitest'
import { backgroundKindOf, buildSpec, toHex, weightName } from './infer'
import type { RawNode } from './types'

const baseCss = {
  display: 'block',
  position: 'static',
  flexDirection: 'column',
  flexBasis: 'auto',
  flexWrap: 'nowrap',
  justifyContent: 'normal',
  alignItems: 'stretch',
  alignSelf: 'auto',
  textAlign: 'start',
  textTransform: 'none',
  whiteSpace: 'normal',
  textOverflow: 'clip',
  color: 'rgb(0, 0, 0)',
  backgroundColor: 'rgba(0, 0, 0, 0)',
  backgroundImage: 'none',
  backgroundSize: 'auto',
  backgroundPosition: '0% 0%',
  backgroundRepeat: 'repeat',
  borderTopColor: 'rgb(0, 0, 0)',
  borderBottomColor: 'rgb(0, 0, 0)',
  borderTopStyle: 'none',
  boxShadow: 'none',
  maskImage: 'none',
  overflowY: 'visible',
  overflowX: 'visible',
  fontFamily: '-apple-system, sans-serif',
  gap: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  fontSize: 17,
  fontWeight: 400,
  lineHeight: 22,
  letterSpacing: 0,
  flexGrow: 0,
  flexShrink: 1,
  borderTopWidth: 0,
  borderBottomWidth: 0,
  borderTopLeftRadius: 0,
  opacity: 1,
}

function raw(over: Partial<RawNode> & { css?: Record<string, string | number> }): RawNode {
  return {
    id: 'e0',
    tag: 'div',
    parent: null,
    depth: 0,
    text: '',
    textLength: 0,
    ownText: '',
    childCount: 1,
    box: { x: 0, y: 0, w: 100, h: 40 },
    scroll: { x: false, y: false },
    attrs: { src: '', alt: '', symbol: '', asset: '', iconSrc: '' },
    ...over,
    css: { ...baseCss, ...(over.css ?? {}) },
  }
}

describe('toHex', () => {
  it('converts rgb() to uppercase hex', () => {
    expect(toHex('rgb(0, 122, 255)')).toBe('#007AFF')
  })

  it('converts rgba() ignoring alpha', () => {
    expect(toHex('rgba(60, 60, 67, 0.6)')).toBe('#3C3C43')
  })

  it('returns empty for unparsable values', () => {
    expect(toHex('red')).toBe('')
    expect(toHex('')).toBe('')
  })
})

describe('weightName', () => {
  it('maps numeric and keyword weights', () => {
    expect(weightName(700)).toBe('bold')
    expect(weightName('bold')).toBe('bold')
    expect(weightName(400)).toBe('regular')
    expect(weightName('garbage')).toBe('')
  })
})

describe('buildSpec roles', () => {
  it('reads a text leaf as Text', () => {
    const [s] = buildSpec([raw({ id: 'e0', tag: 'p', childCount: 0, text: 'Hi', textLength: 2, ownText: 'Hi' })])
    expect(s.role).toBe('Text')
    expect(s.swiftUiShape).toBe('Text')
  })

  it('reads flex row/column as HStack/VStack with gap', () => {
    const [row, col] = buildSpec([
      raw({ id: 'e0', css: { display: 'flex', flexDirection: 'row', gap: 12 } }),
      raw({ id: 'e1', css: { display: 'flex', flexDirection: 'column', gap: 8 } }),
    ])
    expect(row.role).toBe('HStack')
    expect(row.swiftUiShape).toBe('HStack(spacing: 12)')
    expect(col.role).toBe('VStack')
  })

  it('reads a masked glyph as a symbol Image', () => {
    const [s] = buildSpec([
      raw({
        id: 'e0',
        tag: 'span',
        childCount: 0,
        css: { maskImage: 'url("data:image/svg+xml,abc")', color: 'rgb(0, 122, 255)' },
        attrs: { src: '', alt: '', symbol: 'magnifyingglass', asset: '', iconSrc: 'search.svg' },
      }),
    ])
    expect(s.role).toBe('Image')
    expect(s.swiftUiShape).toBe('Image(systemName: "magnifyingglass")')
    expect(s.image?.tintHex).toBe('#007AFF')
  })

  it('flags an external mask URL and an unmapped symbol', () => {
    const [ext, unmapped] = buildSpec([
      raw({
        id: 'e0',
        tag: 'span',
        childCount: 0,
        css: { maskImage: 'url("/icons/x.svg")' },
        attrs: { src: '', alt: '', symbol: 'x', asset: '', iconSrc: '' },
      }),
      raw({
        id: 'e1',
        tag: 'span',
        childCount: 0,
        attrs: { src: '', alt: '', symbol: 'nope', asset: '', iconSrc: '' },
      }),
    ])
    expect(ext.image?.externalMask).toBe(true)
    expect(unmapped.image?.unmappedSymbol).toBe(true)
  })

  it('reads an absolutely-positioned parent as ZStack with offsets', () => {
    const spec = buildSpec([
      raw({ id: 'e0', css: { display: 'flex', flexDirection: 'column' }, box: { x: 0, y: 0, w: 256, h: 256 } }),
      raw({ id: 'e1', parent: 'e0', tag: 'span', childCount: 0, text: 'B', textLength: 1, ownText: 'B', css: { position: 'absolute' }, box: { x: 128, y: 10, w: 34, h: 34 } }),
    ])
    expect(spec[0].role).toBe('ZStack')
    expect(spec[1].layout.layer).toBe(true)
  })

  it('reads a non-flex container as Block (out of subset)', () => {
    const [s] = buildSpec([raw({ id: 'e0', css: { display: 'grid' } })])
    expect(s.role).toBe('Block')
    expect(s.swiftUiShape).toBe('Block (out of subset)')
  })

  it('computes lineSpacing as lineHeight minus size', () => {
    const [s] = buildSpec([
      raw({ id: 'e0', tag: 'p', childCount: 0, text: 'T', textLength: 1, ownText: 'T', css: { fontSize: 22, lineHeight: 28 } }),
    ])
    expect(s.typography?.lineSpacing).toBe(6)
  })
})

describe('backgroundKindOf (optional screen background)', () => {
  it('classifies computed background-image values', () => {
    expect(backgroundKindOf('none')).toBe('none')
    expect(backgroundKindOf(undefined)).toBe('color')
    expect(backgroundKindOf('url("/images/a.svg")')).toBe('image')
    expect(backgroundKindOf('linear-gradient(90deg, red, blue)')).toBe('gradient')
  })

  it('reports image and gradient backgrounds on the surface', () => {
    const [img, grad, flat] = buildSpec([
      raw({ id: 'e0', css: { backgroundImage: 'url("/images/a.svg")' } }),
      raw({ id: 'e1', css: { backgroundImage: 'linear-gradient(150deg, rgb(185, 140, 240), rgb(139, 92, 246))' } }),
      raw({ id: 'e2' }),
    ])
    expect(img.surface.backgroundKind).toBe('image')
    expect(img.surface.backgroundImage).toBe('url("/images/a.svg")')
    expect(grad.surface.backgroundKind).toBe('gradient')
    expect(flat.surface.backgroundKind).toBe('none')
    expect(flat.surface.backgroundImage).toBe('')
  })
})
