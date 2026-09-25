/** What the iframe ships up: raw, uninterpreted. */
export type RawNode = {
  id: string
  tag: string
  parent: string | null
  depth: number
  text: string
  textLength: number
  ownText: string
  childCount: number
  box: { x: number; y: number; w: number; h: number }
  scroll: { x: boolean; y: boolean }
  attrs: {
    src: string
    alt: string
    /** SF Symbol name, from `data-symbol` */
    symbol: string
    /** asset-catalog name, from `data-asset` */
    asset: string
    /** original icon file, from `--icon-src` (the mask itself is a data URI) */
    iconSrc: string
  }
  css: Record<string, string | number>
}

export type RawPayload = {
  nodes: RawNode[]
  device: { w: number; h: number } | null
}

/* -------------------------------------------------------------------------- */

export type Direction = 'row' | 'column' | 'none'

export type Role =
  | 'VStack'
  | 'HStack'
  | 'ZStack'
  | 'Text'
  | 'Image'
  | 'Button'
  | 'Spacer'
  | 'Circle'
  | 'Capsule'
  | 'Rectangle'
  | 'Block'

export type Box = { x: number; y: number; w: number; h: number }
export type Edges = { top: number; right: number; bottom: number; left: number }

/**
 * How a glyph or picture should be written in SwiftUI.
 *
 * `symbol` — a tintable monochrome glyph (a `.icon`), named as an SF Symbol.
 * `asset`  — full-colour art (`<img>`), named as an asset-catalog entry.
 * `inline` — a raw inline `<svg>`: drawable, but nameless until it is exported.
 */
export type ImageSpec = {
  kind: 'symbol' | 'asset' | 'inline'
  /** what the design uses now: a file name, or `inline <svg>` */
  source: string
  /** resolved asset URL, when there is one */
  url: string
  /** SF Symbol name — the thing SwiftUI actually needs */
  symbol: string
  /** asset-catalog name for full-colour art */
  asset: string
  /** a masked glyph inherits `currentColor`; that is the tint to reproduce */
  tint: string
  tintHex: string
  /** `alt`, if the author supplied one */
  label: string
  /**
   * The mask is a URL rather than an inlined data URI. A sandboxed iframe's
   * opaque origin refuses that fetch and the glyph renders as nothing at all,
   * so this is a defect the panel should state rather than let you discover.
   */
  externalMask: boolean
  /**
   * `data-symbol` names a glyph the generated set does not contain. The mask is
   * never applied, so the element paints its full background and the icon shows
   * up as a solid square — the loudest of the silent failures.
   */
  unmappedSymbol: boolean
}

export type SpecNode = {
  id: string
  tag: string
  parent: string | null
  depth: number
  role: Role
  /** one-line SwiftUI-shaped shape, e.g. `VStack(spacing: 12)` */
  swiftUiShape: string
  /** human label for lists, e.g. `Text · "Morning pages"` */
  label: string
  text: string
  box: Box
  layout: {
    direction: Direction
    gap: number
    justify: string
    align: string
    selfAlign: string
    wrap: boolean
    /** placed by coordinate rather than by flow — maps to ZStack + .offset */
    layer: boolean
  }
  padding: Edges
  size: {
    w: number
    h: number
    /** flex-grow >= 1 — the child expands along its parent's main axis */
    grow: number
    fillWidth: boolean
    fillHeight: boolean
  }
  typography: {
    family: string
    size: number
    weight: number
    weightName: string
    lineHeight: number
    /** SwiftUI `.lineSpacing()` = lineHeight - size, floored at 0 */
    lineSpacing: number
    tracking: number
    align: string
    transform: string
    color: string
    colorHex: string
  } | null
  image: ImageSpec | null
  surface: {
    background: string
    backgroundHex: string
    backgroundAlpha: number
    /**
     * Optional screen background (recipe): the computed `background-image`.
     * 'color' = flat fill (or none), 'image' = url(...) asset, 'gradient' =
     * a CSS gradient the panel reports as text for a hand-written
     * LinearGradient. Empty when the bridge predates the background keys.
     */
    backgroundImage: string
    backgroundKind: 'color' | 'image' | 'gradient' | 'none'
    radius: number
    borderWidth: number
    borderColor: string
    borderHex: string
    shadow: string
  }
  scrollable: boolean
}
