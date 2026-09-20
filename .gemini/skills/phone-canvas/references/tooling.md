# Tooling

## Commands

```bash
npm run dev        # board at http://localhost:5273
npm run export     # every screen → exports/<id>@2x.png
npm run export -- --screen lesson-details --scale 3
npm run export -- --device all --out docs/shots
npm run export -- --list          # ids, titles, devices
npm run icons      # regenerate src/screens/icon-set.css from public/icons/
npm run typecheck  # tsc --noEmit — run it before claiming anything works
```

`npm run build` runs the icon generator first, so a stale glyph set cannot ship.
The dev server runs it on start too.

## The board

| Control | Effect |
|---|---|
| **Di chuyển** | iframes are inert; drag, pan, zoom. Click a node to point the panel at it. |
| **Đo đạc** | iframes take pointer events; hover highlights, click selects an element. |
| **Khung đơn giản / Khung máy** | cosmetic only — never changes a measured number |
| **+ Màn hình** | clone the next screen onto the board |
| **Vừa khung** | fit the board |

The panel's **Copy JSON** hands the selected element, or the whole screen, to
whatever you want to write the SwiftUI.

## Where things live

```
src/screens/manifest.ts     the single list of screens: id, title, file
src/screens/index.ts        binds the manifest to ?raw imports; throws on a duplicate id
src/screens/tokens.css      spacing, colour, type, and the component vocabulary
src/screens/icons.css       base .icon rules (hand-written)
src/screens/icon-set.css    GENERATED — do not edit
src/screens/<name>.html     the screens
src/extractor/bridge.js     runs INSIDE the iframe: capture, hover, click, height
src/extractor/compose.ts    stylesheets + chrome + screen + bridge → one document
src/spec/infer.ts           the only place that knows about SwiftUI
src/canvas/nodeId.ts        node identity (a counter, never derived from a screen)
scripts/icons.ts            icon generator + the SF Symbol → file map
scripts/export.ts           screens → PNG via Chrome over CDP, zero deps
public/icons/               monochrome glyphs
public/images/              full-colour art
```

## Adding a screen

1. Write `src/screens/<name>.html`
2. Add one line to `SCREEN_FILES` in `src/screens/manifest.ts`
3. Add the matching `?raw` import and one line to `RAW` in `src/screens/index.ts`
   — it throws at startup if you forget

## Icons

Monochrome and tintable → `.icon` + `data-symbol`:

```html
<span class="icon" data-symbol="book.fill"></span>
<span class="icon icon-sm" data-symbol="chevron.left"></span>   <!-- 20 -->
<span class="icon icon-xs" data-symbol="checkmark"></span>      <!-- 16 -->
<span class="icon icon-lg" data-symbol="star"></span>           <!-- 28 -->
```

A glyph is a **CSS mask** filled with `currentColor`, so it inherits the colour of
whatever it sits in — `Image(systemName:)` inheriting `foregroundStyle`. Sizes are
24 / 20 / 16 / 28; anything else needs a token, not an inline width.

To add one: copy the SVG into `public/icons/`, add the symbol and file to
`SYMBOLS` in `scripts/icons.ts`, run `npm run icons`. The generator inlines each
glyph as a data URI — see failure mode 1 for why it cannot be a URL.

## Art

Full-colour illustration → `<img class="art" src="/images/x.svg" width=".." height=".." alt="..">`.
Always set `width`, `height` and `alt`; `alt` or `data-asset` becomes the asset
catalogue name in the spec (`alt="Notebook"` → `Image("Notebook")`).

The drawing house style is in `docs/screen-authoring.md`.

## Verifying without a browser

The exporter is the fastest objective check and it needs no dev server:

```bash
npm run export -- --screen <id> --out /tmp/check --scale 2
```

It prints the real pixel size of each file. 390×844 means the screen fits the
reference device exactly; anything else is a content-driven height and should be
a decision, not a surprise.

To measure geometry rather than eyeball it, decode the PNG (PIL is available)
and scan a line — this is how a mis-sized chart column was found:

```py
from PIL import Image
im = Image.open('x.png').convert('RGB'); px = im.load()
# find runs of non-background pixels along a scanline, compare widths and pitch
```

## Gotchas

- The **panel and the board can disagree with your intent, never with the
  render**. If the spec looks wrong, the HTML is wrong.
- **Restart the dev server** after changing `vite.config.ts` or anything in
  `scripts/`; HMR does not cover it.
- The board is **in-memory**. A reload resets it to the nine registered screens.
- `npm run typecheck` covers `src/` and `scripts/`. It is cheap; run it.
