import type { Box, Direction, ImageSpec, RawNode, Role, SpecNode } from './types'

/* --------------------------------------------------------------- primitives */

const NONE = new Set(['', 'none', 'normal', 'auto', 'transparent', 'rgba(0, 0, 0, 0)'])

/** tags that flow inside a line of text rather than starting a new view */
const INLINE_TAGS = new Set(['span', 'b', 'i', 'em', 'strong', 'small', 'br'])

function s(v: string | number | undefined): string {
  return v === undefined || v === null ? '' : String(v)
}

function n(v: string | number | undefined): number {
  const x = typeof v === 'number' ? v : parseFloat(s(v))
  return Number.isFinite(x) ? Math.round(x * 100) / 100 : 0
}

/** `rgb(0, 122, 255)` / `rgba(0,0,0,0.5)` -> `#007AFF`. Empty when unparsable. */
export function toHex(value: string): string {
  const m = /^rgba?\(([^)]+)\)$/i.exec(value.trim())
  if (!m || !m[1]) return ''
  const parts = m[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map((p) => Number(p))
  if (parts.length < 3 || parts.slice(0, 3).some((x) => !Number.isFinite(x))) return ''
  const rgb = parts.slice(0, 3).map((x) => Math.max(0, Math.min(255, Math.round(x))))
  return '#' + rgb.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function alphaOf(value: string): number {
  const m = /^rgba?\(([^)]+)\)$/i.exec(value.trim())
  if (!m || !m[1]) return 1
  const parts = m[1].split(/[,\s/]+/).filter(Boolean)
  return parts.length > 3 ? Number(parts[3]) || 0 : 1
}

export function weightName(raw: string | number): string {
  const v = s(raw).trim().toLowerCase()
  const w = v === 'bold' ? 700 : v === 'normal' ? 400 : Number(v)
  if (!Number.isFinite(w)) return ''
  if (w >= 800) return 'heavy'
  if (w >= 700) return 'bold'
  if (w >= 600) return 'semibold'
  if (w >= 500) return 'medium'
  if (w >= 400) return 'regular'
  if (w >= 300) return 'light'
  return 'thin'
}

function weightValue(raw: string | number): number {
  const v = s(raw).trim().toLowerCase()
  if (v === 'bold') return 700
  if (v === 'normal') return 400
  const w = Number(v)
  return Number.isFinite(w) ? w : 400
}

function familyName(raw: string): string {
  if (!raw) return ''
  if (/sf\s*pro|apple-system|system-ui|blinkmacsystemfont/i.test(raw)) return 'SF Pro'
  return (raw.split(',')[0] ?? '').replace(/["']/g, '').trim()
}

function directionOf(css: Record<string, string | number>): Direction {
  const d = s(css.display)
  if (d !== 'flex' && d !== 'inline-flex') return 'none'
  return s(css.flexDirection) === 'row' ? 'row' : 'column'
}

/** a masked glyph is an icon: it carries a shape, not a picture */
function isMasked(css: Record<string, string | number>): boolean {
  const mask = s(css.maskImage)
  return mask !== '' && mask !== 'none'
}

/** `url("https://…/icons/search.svg")` -> the url */
function urlOf(value: string): string {
  const match = /url\((['"]?)([^'")]+)\1\)/.exec(value)
  return match?.[2] ?? ''
}

/** `https://…/icons/search.svg?x=1` -> `search.svg` */
function fileName(url: string): string {
  const path = url.split(/[?#]/)[0] ?? ''
  return path.split('/').pop() ?? ''
}

/**
 * Turn an <img> or a masked glyph into the thing SwiftUI actually needs: a name.
 *
 * A design that ships a nameless picture is not finished — `Image(systemName:)`
 * needs a symbol and `Image(_:)` needs an asset. So prefer the author's
 * `data-symbol` / `data-asset`, fall back to the file name, and say `inline`
 * when the design has left us a raw <svg> we cannot name at all.
 */
function imageOf(raw: RawNode, role: Role): ImageSpec | null {
  if (role !== 'Image') return null

  const masked = isMasked(raw.css)
  // an inlined glyph is a data URI, so the file name comes from --icon-src
  const src = raw.attrs.iconSrc || (masked ? urlOf(s(raw.css.maskImage)) : raw.attrs.src)
  const file = fileName(src)
  const symbol = raw.attrs.symbol
  const assetName = raw.attrs.asset || (file ? file.replace(/\.[^.]+$/, '') : '')

  // a mask fetched from a URL is refused by a sandboxed iframe's opaque origin,
  // and a mask that fails to load renders nothing at all — worth saying out loud
  const maskUrl = masked ? urlOf(s(raw.css.maskImage)) : ''
  const externalMask = masked && maskUrl !== '' && !maskUrl.startsWith('data:')

  // a symbol with no mask is a symbol that is not in the generated set: the
  // element then paints its whole background and reads as a solid square
  const unmappedSymbol = symbol !== '' && !masked

  const kind: ImageSpec['kind'] =
    raw.tag === 'svg' ? 'inline' : symbol ? 'symbol' : masked ? 'symbol' : 'asset'

  return {
    kind,
    source: raw.tag === 'svg' ? 'inline <svg>' : file || '—',
    url: src.startsWith('data:') ? '' : src,
    symbol,
    asset: assetName,
    tint: masked ? s(raw.css.color) : '',
    tintHex: masked ? toHex(s(raw.css.color)) : '',
    label: raw.attrs.alt || raw.attrs.symbol || assetName,
    externalMask,
    unmappedSymbol,
  }
}

/* ------------------------------------------------------------------- role -- */

function visibleSurface(css: Record<string, string | number>): boolean {
  const bg = s(css.backgroundColor)
  const hasBg = bg !== '' && !NONE.has(bg)
  const hasBorder = n(css.borderTopWidth) > 0 || n(css.borderBottomWidth) > 0
  const hasImage = s(css.backgroundImage) !== '' && s(css.backgroundImage) !== 'none'
  return hasBg || hasBorder || hasImage
}

function roleOf(raw: RawNode): Role {
  const { css, tag, childCount, textLength } = raw

  if (tag === 'svg' || tag === 'img') return 'Image'
  if (tag === 'button') return 'Button'

  const isLeaf = childCount === 0
  if (isLeaf && textLength > 0) return 'Text'

  if (isLeaf) {
    // an icon is a shape with a mask on it — checked before the shape rules,
    // otherwise every glyph reads as a Circle or a Rectangle. A declared
    // data-symbol counts too: it says what the element is *meant* to be even
    // when the mask is missing, which is a defect the panel should name.
    if (isMasked(css) || raw.attrs.symbol) return 'Image'

    // a leaf with a visible surface and no flex is a decorative shape, not an
    // out-of-subset layout — it maps to Circle / Capsule / Rectangle
    if (visibleSurface(css)) {
      const tiny = Math.min(raw.box.w, raw.box.h)
      const rounded = n(css.borderTopLeftRadius) >= tiny / 2 - 0.5
      if (rounded && Math.abs(raw.box.w - raw.box.h) < 1) return 'Circle'
      if (rounded) return 'Capsule'
      return 'Rectangle'
    }
    if (n(css.flexGrow) >= 1) return 'Spacer'
  }

  const dir = directionOf(css)
  if (dir === 'none') return 'Block'
  return dir === 'row' ? 'HStack' : 'VStack'
}

/* ------------------------------------------------------------------ shape -- */

function alignmentOf(role: Role, alignItems: string): string {
  if (role === 'HStack') {
    if (alignItems === 'flex-start') return '.top'
    if (alignItems === 'flex-end') return '.bottom'
    if (alignItems === 'baseline' || alignItems === 'first baseline') return '.firstTextBaseline'
    // HStack's own default is already .center — never restate it
    return ''
  }
  if (role === 'VStack') {
    if (alignItems === 'flex-start') return '.leading'
    if (alignItems === 'flex-end') return '.trailing'
    return ''
  }
  return ''
}

function shapeOf(
  role: Role,
  dir: Direction,
  gap: number,
  alignItems: string,
  scrollable: boolean,
  image: ImageSpec | null,
  offset: { dx: number; dy: number } | null,
): string {
  switch (role) {
    case 'VStack':
    case 'HStack': {
      const align = alignmentOf(role, alignItems)
      const inner = `${role}(spacing: ${gap}${align ? `, alignment: ${align}` : ''})`
      const base = scrollable ? `ScrollView { ${inner} }` : inner
      return offset ? `${base}.offset(x: ${offset.dx}, y: ${offset.dy})` : base
    }
    case 'ZStack':
      return offset ? `ZStack.offset(x: ${offset.dx}, y: ${offset.dy})` : 'ZStack'
    case 'Text':
      return 'Text'
    case 'Image':
      if (!image) return 'Image'
      if (image.kind === 'symbol') {
        return image.symbol ? `Image(systemName: "${image.symbol}")` : 'Image(systemName: "…")'
      }
      if (image.kind === 'asset') return `Image("${image.asset || '…'}")`
      return 'Image("…")  // inline SVG — export it as an asset'
    case 'Button':
      return 'Button'
    case 'Spacer':
      return 'Spacer()'
    case 'Circle':
      return 'Circle().fill(…)'
    case 'Capsule':
      return 'Capsule().fill(…)'
    case 'Rectangle':
      return 'Rectangle().fill(…) / Divider()'
    default:
      return dir === 'none' ? 'Block (out of subset)' : 'Stack'
  }
}

/* ------------------------------------------------------------------ build -- */

function labelOf(role: Role, raw: RawNode): string {
  const source = raw.ownText || raw.text
  const t = source.length > 34 ? source.slice(0, 34) + '…' : source
  return t ? `${role} · “${t}”` : role
}

/** flexbox's `normal` is `flex-start`; say what it actually does. */
function justifyName(value: string): string {
  if (value === 'normal' || value === 'start') return 'flex-start'
  if (value === 'end') return 'flex-end'
  return value
}

/** `auto` is the initial value and carries no information. */
function selfAlignName(value: string): string {
  return value === 'auto' ? '' : value
}

export function buildSpec(nodes: RawNode[]): SpecNode[] {
  const byId = new Map(nodes.map((x) => [x.id, x]))

  // a container that positions any child by coordinate is a ZStack, whatever
  // its own display value says — this is the only honest way to read a chart
  const zstackParents = new Set<string>()
  for (const node of nodes) {
    const pos = s(node.css.position)
    if ((pos === 'absolute' || pos === 'fixed') && node.parent) zstackParents.add(node.parent)
  }

  // a block whose only children are inline is still one Text — the <span> is a
  // styled run, not a separate view
  const inlineOnly = new Map<string, boolean>()
  for (const node of nodes) {
    if (!node.parent) continue
    const isInline = INLINE_TAGS.has(node.tag)
    const prev = inlineOnly.get(node.parent)
    inlineOnly.set(node.parent, prev === undefined ? isInline : prev && isInline)
  }

  return nodes.map((raw) => {
    const css = raw.css
    const declared = roleOf(raw)
    const isInlineText = raw.textLength > 0 && inlineOnly.get(raw.id) === true
    const role: Role = zstackParents.has(raw.id)
      ? 'ZStack'
      : declared === 'Block' && isInlineText
        ? 'Text'
        : declared
    const image = imageOf(raw, declared)
    const dir = directionOf(css)
    const gap = n(css.gap)
    const alignItems = s(css.alignItems)
    const justifyContent = s(css.justifyContent)
    const scrollable =
      raw.scroll.y || ['auto', 'scroll', 'overlay'].includes(s(css.overflowY))

    const parent = raw.parent ? byId.get(raw.parent) : undefined
    const parentDir = parent ? directionOf(parent.css) : 'none'
    const grow = n(css.flexGrow)
    const filling = grow >= 1
    const fillHeight = filling && parentDir === 'column'
    const fillWidth = filling && parentDir === 'row'

    const padTop = n(css.paddingTop)
    const padRight = n(css.paddingRight)
    const padBottom = n(css.paddingBottom)
    const padLeft = n(css.paddingLeft)

    const hasText = raw.textLength > 0 && (raw.childCount === 0 || isInlineText)
    const fontSize = n(css.fontSize)
    const lineHeight = n(css.lineHeight)
    const color = s(css.color)

    const bg = s(css.backgroundColor)
    const borderWidth = Math.max(n(css.borderTopWidth), n(css.borderBottomWidth))
    const borderColor = n(css.borderTopWidth) > 0 ? s(css.borderTopColor) : s(css.borderBottomColor)
    const shadow = s(css.boxShadow)
    const radius = n(css.borderTopLeftRadius)

    const box: Box = {
      x: raw.box.x,
      y: raw.box.y,
      w: raw.box.w,
      h: raw.box.h,
    }

    // a layered child is placed by coordinate: report where it sits relative
    // to its container, which is the number `.offset(x:y:)` actually takes
    const layer = ['absolute', 'fixed'].includes(s(css.position))
    const offset =
      layer && parent
        ? {
            dx: Math.round((box.x - parent.box.x) * 100) / 100,
            dy: Math.round((box.y - parent.box.y) * 100) / 100,
          }
        : null

    return {
      id: raw.id,
      tag: raw.tag,
      parent: raw.parent,
      depth: raw.depth,
      role,
      swiftUiShape: shapeOf(role, dir, gap, alignItems, scrollable, image, offset),
      label: labelOf(role, raw),
      text: raw.text,
      box,
      layout: {
        direction: dir,
        gap,
        justify: justifyName(justifyContent),
        align: alignItems,
        selfAlign: selfAlignName(s(css.alignSelf)),
        wrap: s(css.flexWrap) === 'wrap' || s(css.flexWrap) === 'wrap-reverse',
        layer,
      },
      padding: { top: padTop, right: padRight, bottom: padBottom, left: padLeft },
      size: {
        w: box.w,
        h: box.h,
        grow,
        fillWidth,
        fillHeight,
      },
      typography: hasText
        ? {
            family: familyName(s(css.fontFamily)),
            size: fontSize,
            weight: weightValue(css.fontWeight),
            weightName: weightName(css.fontWeight),
            lineHeight,
            lineSpacing: Math.max(0, Math.round((lineHeight - fontSize) * 100) / 100),
            tracking: n(css.letterSpacing),
            align: s(css.textAlign),
            transform: s(css.textTransform),
            color,
            colorHex: toHex(color),
          }
        : null,
      image,
      surface: {
        background: bg,
        backgroundHex: toHex(bg),
        backgroundAlpha: alphaOf(bg),
        radius,
        borderWidth,
        borderColor,
        borderHex: toHex(borderColor),
        shadow,
      },
      scrollable,
    }
  })
}
