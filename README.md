# phone-canvas

A design board that holds phone screens as **plain rectangles rendering real HTML**,
and reads the exact numbers off every element so you can write SwiftUI from them.

No device simulation, no fixed viewport, no scroll you cannot see. A screen that
needs 992pt is a 992pt-tall rectangle.

```
AI (any LLM)                    Board (React + React Flow)              Panel
─────────────                   ──────────────────────────              ─────
prompt + tokens.css   ──html──► screen node
+ authoring contract            └─ rectangle, device width
                                  └─ <iframe srcdoc>  ← runs the HTML
                                        │
                                        │ postMessage (raw capture)
                                        ▼
                                  buildSpec()  ──────────────────────►  spec table
                                  parent-side, testable                 per element
```

The `<iframe>` is the source of truth for layout. `SPEC` is the contract. The
panel is just a view of it.

---

## Run

```bash
npm install
npm run dev        # http://localhost:5273
npm run export     # every screen → exports/*.png
npm run typecheck  # tsc --noEmit
npm run build
```

## Using it

| Control | What it does |
|---|---|
| **Di chuyển** | Iframes are inert. Drag nodes, pan, zoom. Click a node to point the panel at it. |
| **Đo đạc** | Iframes receive pointer events. Hover highlights, click selects. |
| **Khung đơn giản / Khung máy** | Cosmetic only. A rectangle, or a chassis with a dynamic island. Never changes a measured number. |
| **+ Màn hình** | Clone another screen onto the board. |
| **Vừa khung** | Fit the board to the viewport. |

In the panel: pick the screen and device width for the selected node, browse the
element tree, click a row (or click the element directly in **Đo đạc** mode), and
read its spec. **Copy JSON** hands the whole screen — or just the selected
element — to an LLM.

---

## Export to PNG

```bash
npm run export                                       # every screen, @2x → exports/
npm run export -- --screen journal-list --scale 3
npm run export -- --device all --out docs/shots
npm run export -- --list
```

Zero dependencies. A screen is real HTML, so something has to lay it out — the
script drives the Chrome already on your machine (or `$CHROME_PATH`) over the
DevTools protocol. Nothing to install, no dev server, no build step.

What you get is **the screen**: the device width, the status bar, the home
indicator, and the exact pixels the panel measures. The iPhone chassis on the
board is drawn by the React layer and is deliberately excluded — it is
decoration, and it would be a lie in a handoff. The measurement bridge is left
out too, so an export carries no `data-pc-*` attributes and no hover overlay.

Height follows content, exactly as on the board: `journal-list` exports at
390×992 on the reference device, and re-wraps to 375×959 on an iPhone SE.

Both the app and the script call `src/extractor/compose.ts`, so an export cannot
drift from what the board shows.

This is the missing prerequisite for the vision loop — an LLM can now *look* at
what it built.

---

## The four invariants

These are what make the numbers trustworthy. Break one and the spec becomes
decoration.

1. **1 CSS px === 1 pt.** The iframe is always rendered at the device's natural
   size and scaled only by the canvas camera (`transform`). `getBoundingClientRect()`
   inside the iframe therefore returns points *at any zoom level*. Never add CSS
   `zoom` or a nested scale.

2. **The screen is never height-constrained.** `.device` has a `min-height`
   (so a short screen still looks like a screen, and `Spacer`-style layouts
   work) but no maximum. The bridge measures its own content and reports it up;
   the frame grows to match. Nothing is ever clipped.

3. **Safe areas are explicit regions, not insets.** The status bar and home
   indicator are real elements in the document, owned by the shell — never by
   the screen author. They map onto `.safeAreaInset`, and they are excluded from
   capture so they never pollute the spec.

4. **Raw down, interpreted up.** The bridge sends unmodified computed styles. All
   SwiftUI-facing interpretation (role inference, stack naming, color conversion,
   `lineSpacing` math) lives in `src/spec/infer.ts` on the parent side, where it
   is type-checked and editable without touching the iframe.

5. **Screens are fluid across widths.** Write every screen with token classes
   (`col`, `row`, `paper-card`, `var(--s*)`) and no hardcoded px tied to one
   device width — the same file renders at 390pt and 820pt, only spacing out.
   A layout that differs fundamentally by form factor (e.g. iPad list+detail)
   is a separate screen (`new-screen -- --device ipad-11` scaffolds one, and
   the manifest `deviceId` opens fresh boards at its width) — never `if-device`
   branches inside one HTML file.

---

## CSS → SwiftUI reference

| CSS | SwiftUI | Notes |
|---|---|---|
| `display:flex; flex-direction:column; gap:12` | `VStack(spacing: 12)` | 1:1 |
| `flex-direction:row; gap:8` | `HStack(spacing: 8)` | 1:1 |
| `align-items:flex-start` (row) | `alignment: .top` | `.center` is the default and is omitted |
| `align-items:flex-start` (column) | `alignment: .leading` | |
| `flex-grow:1` in a row parent | `.frame(maxWidth: .infinity)` | reported as `fill: width` |
| `flex-grow:1` in a column parent | `.frame(maxHeight: .infinity)` | reported as `fill: height` |
| empty flex child, grows | `Spacer()` | detected, not guessed |
| `padding:16 20` | `.padding(.horizontal, 20).padding(.vertical, 16)` | |
| `border-radius:12` | `.clipShape(RoundedRectangle(cornerRadius: 12))` | |
| `background:#F2F2F7` | `.background(Color(red:…))` | hex is precomputed in the panel |
| `border-top:1px solid …` | `.overlay(alignment:.top) { Divider() }` | reported as width + color |
| `box-shadow` | `.shadow(color:radius:x:y:)` | ⚠ one shadow per chain; stack views for more |
| `overflow-y:auto` | `ScrollView { … }` | reported as "cuộn được" on `.body` |
| `position:absolute` | `ZStack` / `.overlay` / `.background` | |
| `line-height:28` @ `22px` | `.lineSpacing(6)` | SwiftUI's `lineSpacing` is *extra* leading; the panel does `lineHeight - size` for you |
| `letter-spacing:-0.4` | `.kerning(-0.4)` | |
| `color` / `font-weight` | `.foregroundStyle` / `.font(.system(size:weight:))` | weight name (regular…bold) shown |
| `text-transform:uppercase` | `.textCase(.uppercase)` | |
| `.icon[data-symbol="magnifyingglass"]` | `Image(systemName: "magnifyingglass")` | mask + `currentColor`, so it tints |
| `<img class="art" alt="Notebook">` | `Image("Notebook")` | full-colour art, named by `alt`/`data-asset` |

Deliberately **not** supported — the extractor flags these as `Block (out of subset)`
in red rather than pretending: `display:grid`, `float`, `transform`, `clip-path`,
filters, and any layout that is not flexbox.

---

## Assets

SVGs live in `public/` and there are two lanes, because they answer two different
questions in SwiftUI.

**Icons are masks.** A monochrome glyph becomes a `.icon`, which is a CSS mask
filled with `currentColor` — so it inherits the colour of whatever it sits in,
exactly like `Image(systemName:)` inherits `foregroundStyle`:

```html
<span class="icon" data-symbol="magnifyingglass"></span>
```

That is the whole call site. The mapping lives in `scripts/icons.ts`, so the
screen names the *SF Symbol*, not a path, and the panel reports
`Image(systemName: "magnifyingglass")` plus the resolved tint. An `<img>` cannot
do this — `currentColor` inside an `<img>` resolves against the image's own
document and every icon comes out black.

Glyphs are **inlined as data URIs** by `npm run icons` rather than referenced by
URL. A mask image is a CORS-mode fetch, and a screen renders in a sandboxed
iframe with an opaque origin, so `url('/icons/x.svg')` is refused there — and a
mask that fails to load is treated as transparent black, which makes the element
*disappear* rather than fall back to anything you could see. Inlining removes
the fetch, so a glyph renders the same on the board, in an export, and on a
static host with no headers to configure.

**Art is a picture.** A logo or illustration keeps its own colours as an `<img>`,
named for the asset catalog:

```html
<img class="art" src="/images/notebook.svg" width="88" height="88" alt="Notebook" />
```

```
public/icons/    → .icon[data-symbol]  → Image(systemName:)   (inlined)
public/images/   → img.art[alt]        → Image("Name")
```

Drop a real icon set in (Lucide, Tabler, Phosphor — all MIT/ISC) by copying the
SVGs into `public/icons/` and adding one line per glyph to `SYMBOLS` in
`scripts/icons.ts`.

Inline `<svg>` still renders, but it is **nameless** — the spec can only say
`Image("…")` and you name it by hand later. The panel says so in orange.

---

## Layout

```
scripts/
└─ export.ts              screens → PNG, via Chrome over CDP, zero deps

public/
├─ icons/                 monochrome glyphs → .icon → Image(systemName:)
└─ images/                full-colour art   → .art  → Image("Name")

src/
├─ canvas/
│  ├─ Board.tsx           React Flow board + toolbar
│  ├─ BoardContext.ts     mode · frame style · active node
│  └─ PhoneNode.tsx       one screen = one node (rectangle + iframe)
├─ frame/devices.ts       width + safe areas (the only device data that matters)
├─ project/               one folder per project, each holds its screens
│  └─ moodtracker/        tokens.css + *.html (see docs/moodtracker-plan.md)
├─ screens/
│  ├─ tokens.css          spacing, colour, type — the styling vocabulary
│  ├─ icons.css           glyph → SF Symbol → file
│  ├─ index.ts            screen registry (the app; the exporter reads the manifest)
│  └─ manifest.ts         id · title · file (file is relative to repo root)
├─ projects/
│  ├─ builtin.ts          project definitions (Node-safe, used by exporter)
│  ├─ projects.ts         resolve/cover/count helpers (app)
│  ├─ storage.ts          per-project boards + custom projects (localStorage)
│  └─ Dashboard.tsx       project picker: grid, search, + Dự án
├─ extractor/
│  ├─ bridge.js           runs INSIDE the iframe: capture, hover, click, height
│  ├─ compose.ts          stylesheets + chrome + screen + bridge → one document
│  └─ buildSrcDoc.ts      the browser adapter for compose.ts
├─ spec/
│  ├─ types.ts            RawNode (wire) and SpecNode (interpreted)
│  └─ infer.ts            the only place that knows about SwiftUI
└─ inspect/
   ├─ InspectorContext.tsx  message routing, specs, sizes, selection
   └─ SpecPanel.tsx         the tree + the spec table
```

## Adding a screen

1. Write `project/<project>/my-screen.html` — see `docs/screen-authoring.md`.
2. Register it in `src/screens/manifest.ts` (`file` is relative to repo root), then run
   `npm run screens:sync` to regenerate `src/screens/generated.ts`.
3. Add its id to the project's `screenIds` in `src/projects/builtin.ts`.

Or let `npm run new-screen` do all three (or `npm run screen -- add ...` —
same thing plus the auto-gate: screens:sync + tsc + lint).

To rename a screen id (file + manifest + builtin + on-disk boards, one shot):

```bash
npm run rename-screen -- --id <old> --to <new>
```

It refuses unknown/duplicate ids without writing; browser boards prune on
open (reader-side) — there is nothing to rescan from the CLI.

To remove a screen (its HTML file plus all registry wiring) — handy for trash:

```bash
npm run delete-screen -- --id <screen-id>
```

It refuses if any saved board still references the id; pass `--force` to ignore that.

One entry for the whole lifecycle (`add | rename | remove | list | gate`):

```bash
npm run screen -- --help
```

The authoring contract is what you hand an LLM. It is the difference between
HTML that maps cleanly to SwiftUI and HTML that does not.

---

## Verified

Checked against a running instance, not assumed:

- capture: 45–69 elements per screen, 37 computed properties each
- content height reported and honoured (a screen needing 992pt gets 992pt)
- click inside a sandboxed screen → `select` → correct element id
- element tree, spec table, `Copy JSON`
- both frame styles, `fitView`, pan/zoom
- export: 9/9 screen × device combinations, exact pixel sizes
  (390×992 @1x, 780×1984 @2x, 1125×2001 @3x), content-driven height, no
  scaffolding in the output
- assets resolve in both a sandboxed srcdoc preview and an export: masked icons
  tint from `currentColor` (`Image(systemName: "magnifyingglass")`, tint
  `#007AFF`), `<img>` art keeps its own colours (`Image("notebook")`)

Three real bugs were found by running it, not by reading it: react-flow clearing
the node selection a second after you pick one; a `WindowProxy` identity check
that silently dropped every message from a sandboxed iframe; and a capture that
ran before the iframe had been laid out, reporting an empty spec.

Not yet covered: SwiftUI code generation (out of scope by choice), multi-screen
flows as edges, and persistence — the board is in-memory.

## Next

1. **Authoring loop** — prompt → screen → export → critique → patch, with the
   lint from `docs/screen-authoring.md` gating each round.
2. **Design tokens as data** — lift `tokens.css` into a token file the panel can
   report against ("`#007AFF` = `--accent`"), instead of raw hex.
3. **Per-element notes** — the spec becomes a handoff document, not a readout.
