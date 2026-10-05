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
npm run export                                       # every screen, device frame @2x → exports/
npm run export -- --project calo-ai                  # that project's screens → project/calo-ai/exports/
npm run export -- --screen my-screen --scale 3
npm run export -- --screen my-screen --full          # whole page, not the frame
npm run export -- --device all --out docs/shots
npm run export -- --all-devices --golden           # every width in DEVICES + golden store
npm run export -- --list
npm run export:icons -- --project calo-ai            # that project's glyphs → project/calo-ai/exports/icons/
```

Zero dependencies. A screen is real HTML, so something has to lay it out — the
script drives the Chrome already on your machine (or `$CHROME_PATH`) over the
DevTools protocol, falling back to the Playwright-pinned Chromium
(`chromium-1243` in the ms-playwright cache) on machines with no Chrome —
every run logs which source it used (`[chrome] source=…`). Nothing to install,
no dev server, no build step.

What you get is **the screen**: the device width, the status bar, the home
indicator, and the exact pixels the panel measures. The iPhone chassis on the
board is drawn by the React layer and is deliberately excluded — it is
decoration, and it would be a lie in a handoff. The measurement bridge is left
out too, so an export carries no `data-pc-*` attributes and no hover overlay.

The default export is **the device frame**, exactly `device.height × scale` —
the reference device (sizes in `src/frame/devices.ts`) at 2x. A longer screen
`.body`, so the frame is what the phone actually shows. Pass `--full` to capture
the whole page instead (the pre-v2 behaviour); the file then keeps a `-full`
suffix (`home-full@2x.png`) so frame and full-page never overwrite each other.
The board matches: a node is drawn at the device height and scrolls inside, with
an expand toggle that shows the whole screen at once.

`--all-devices` renders every screen at every width in `DEVICES` (shorthand
for `--device all`). `--golden` additionally writes versioned PNGs plus a
sha256 + perceptual-hash (dHash) record per render into the golden store —
`project/<id>/goldens/` for a single `--project`, else `goldens/`
(`goldens.json` manifest; the hash covers PNG bytes only, so an identical
re-run keeps the same hash). The badge compares byte-exact first, then falls
back to the perceptual distance (Hamming ≤ 4 still reads as `khớp`), so the
same commit stays green across OS font/AA differences. Both flags are
off by default and plain exports never touch the store.

Both the app and the script call `src/extractor/compose.ts`, so an export cannot
drift from what the board shows.

This is the missing prerequisite for the vision loop — an LLM can now *look* at
what it built.

---

## Locate a component

```bash
npm run locate -- --screen my-screen --x 195 --y 640
npm run locate -- --screen my-screen --x 195 --y 640 --pad 32 --scale 2 --device iphone-se --theme dark
```

Point (`--x/--y`) is in points from the device top-left — the same space the
panel reports. Output is two files: `<screen>-locate-<x>x<y>@<scale>x.png`
(the element's region with padding) and `<screen>-locate-<x>x<y>.json`
(the element's spec in Copy-JSON shape, plus ancestors and the point).
A point on the status bar or empty area reports `miss` and still shoots
a square around the point.

Same guarantees as export: the document is composed by
`src/extractor/compose.ts`, captured by the real `bridge.js`, interpreted
by `src/spec/infer.ts` — locate reuses all three instead of owning a rule.

---

## The five invariants

These are what make the numbers trustworthy. Break one and the spec becomes
decoration.

1. **1 CSS px === 1 pt.** The iframe is always rendered at the device's natural
   size and scaled only by the canvas camera (`transform`). `getBoundingClientRect()`
   inside the iframe therefore returns points *at any zoom level*. Never add CSS
   `zoom` or a nested scale.

2. **The frame is fixed and the body scrolls.** `.device` is exactly the device
   height. A screen has **one** vertical scroller: `.body` for content taller
   than the frame, `.body-fixed` for a page that fits — and a `.body-fixed` that
   overflows is an error the measured audit reports, not a hidden scrollbar.

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
   device width — the same file renders at phone and tablet widths (sizes in
   `src/frame/devices.ts`), only spacing out. A layout that differs fundamentally
   by form factor (e.g. iPad list+detail) is a separate screen (`new-screen -- --device ipad-11` scaffolds one, and
   its header `deviceId` opens fresh boards at that width) — never `if-device`
   branches inside one HTML file.

Invariants 3 and 5 are the region contract in practice: which band every screen
owes, and who owns it. The full map — phone, Duo cover/inner/fold, tablet, plus
the Watch and Widget reference tables — is in
[`openspec/specs/screen-regions/`](openspec/specs/screen-regions/), and it is enforced by
`npm run lint:regions` (static) and `npm run audit:regions` (measured).

---

## Screen regions

Every screen owes the same fixed bands, and **the shell owns all of them** —
the OS bands *and* the nav/tab bands. You never draw a status bar, home
indicator, navbar or tab bar; `compose.ts` places them. What you declare is the
band's **content** (phone) or an arrangement (iPad/Duo):

| Form factor | You declare |
|---|---|
| phone | nav content (`data-slot="back\|title\|right"`) + tab buttons (`data-tab`) + a `.body` / `.body-fixed` content band |
| Duo cover | `.split` + `.pane`, and a trailing `.rail` (`.rail-tools` above, `.rail-tabs` bottom-aligned, no horizontal tab bar) |
| Duo inner | `.split` + `.pane-lead` / `.pane-trail`; mỗi pane giữ control của nó trên cạnh ngoài của pane |
| Duo fold | hai `.pane` bằng nhau; nếp gập là vùng cấm, không control nào trên dải chia |
| tablet | `.sidebar` + `.split` nhiều cột; một tiêu đề duy nhất trên split |

Measures for every row — band heights, the touch floor, gutters, split ratios,
destination ranges — live in
[`openspec/specs/screen-regions/`](openspec/specs/screen-regions/); the table
above states structure only.

Only the **phone** bands are shell-owned today; the Duo/tablet arrangements stay
author-owned until that form factor ships. The nav band is built inside
`.viewport` but outside the scrolling `.screen`, so it stays put while the
content scrolls — and the spec panel can still measure its controls.

Content uses the spec gutter on the 4/8 pt grid, and every interactive element
meets the touch floor in
[`openspec/specs/screen-regions/`](openspec/specs/screen-regions/) — which also
holds the per-form-factor reasoning and the Watch / Widget reference tables.

Two tiers enforce it, and both fail `npm run gate`:

```bash
npm run lint:regions    # from the text: shell-owned band, unknown slot, nav/tab anatomy, device px, touch floor
npm run lint:regions-docs  # docs link openspec/specs/screen-regions/, never restate its numbers
npm run audit:regions   # from the real layout in Chrome: 44 pt rects, one scroller, overflow, shell bands, 50/50 fold, background seam <!-- lint-docs: keep -->

Every lint also takes `--screen <id>` to check one screen while building
(`npm run lint:regions -- --screen today`) — same pattern as `export`/`audit`.
Without the flag the behavior is unchanged (all screens).
```

The measured tier is the one that earns its keep: it caught a split that
declared 1:2 and painted 41:59, a tab item that was 38 pt inside a 68 pt bar, <!-- lint-docs: keep -->
and a 58 pt button squashed to 39 pt once the frame stopped growing. None is
visible by eye.

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
named for the asset catalog. Project art lives in the project folder and is
referenced by an absolute URL; `public/images/` stays for art shared across
projects:

```html
<img class="art" src="/project/my-app/assets/hero.svg" width="88" height="88" alt="Hero" />
<img class="art" src="/images/logo.svg" width="40" height="40" alt="Logo" />
```

```
public/icons/          → .icon[data-symbol] → Image(systemName:)   (inlined)
project/<id>/assets/   → img.art[alt]       → Image("Name")        (own project)
public/images/         → img.art[alt]       → Image("Name")        (shared)
```

A screen may only reference its own project's assets; the lint flags a
cross-project URL or a missing file.

Drop a real icon set in (Lucide, Tabler, Phosphor — all MIT/ISC) by copying the
SVGs into `public/icons/` and adding one line per glyph to `SYMBOLS` in
`scripts/icons.ts`.

Inline `<svg>` still renders, but it is **nameless** — the spec can only say
`Image("…")` and you name it by hand later. The panel says so in orange.

---

## Layout

```
project/                    one folder per project — the registry itself
└─ <project>/
   ├─ project.json          optional: title · description · cover
   ├─ tokens.css            optional: project override layer
   ├─ screens/*.html        id = filename · unique across projects
   ├─ components/*.html     id = filename · scoped to the project · opens with an 11-item `<!-- @anatomy … -->` header (lint:components BLOCKS when missing; `new-screen -- --component` scaffolds one)
   └─ assets/**             served at /project/<id>/assets/…

scripts/
├─ scan-projects.ts       Node reader for the same convention (export · lint · CLI)
└─ export.ts              screens → PNG, via Chrome over CDP, zero deps

public/
├─ icons/                 monochrome glyphs → .icon → Image(systemName:)
└─ images/                shared full-colour art → .art → Image("Name")

src/
├─ canvas/
│  ├─ Board.tsx           React Flow board + toolbar
│  ├─ BoardContext.ts     mode · frame style · active node
│  └─ PhoneNode.tsx       one screen = one node (rectangle + iframe)
├─ frame/devices.ts       width + safe areas (the only device data that matters)
├─ screens/
│  ├─ tokens.css          spacing, colour, type — the styling vocabulary
│  ├─ icons.css           glyph → SF Symbol → file
│  └─ index.ts            app-facing screen registry (reads the project folders)
├─ projects/
│  ├─ types.ts            registry types (pure, shared app + Node)
│  ├─ derive.ts           the whole folder convention, one pure function
│  ├─ registry.ts         browser reader: import.meta.glob → derive
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

The folder **is** the registry — there is nothing to wire and no codegen:

```bash
npm run project -- add my-app                                        # once per project
npm run screen -- add --project my-app --name my-screen --title "My Screen"
```

That writes `project/my-app/screens/my-screen.html` (or just write the file
yourself — the board sees any `*.html` dropped in `screens/`). `npm run screen
-- add` also runs the gate: tsc + lint.

A screen id is its filename stem (globally unique); optional metadata goes on
the first line: `<!-- pc {"title":"Home","lightStatusBar":true} -->`. Tokens are
`project/<id>/tokens.css`, components `project/<id>/components/*.html`, assets
`project/<id>/assets/*` — all discovered from the same folder.

Tablet screens and the device model are documented in `docs/devices.md`
(`new-screen -- --device ipad-11` scaffolds a 2-column screen).

To rename a screen id (file + on-disk boards, one shot):

```bash
npm run rename-screen -- --id <old> --to <new>
```

It refuses unknown/duplicate ids without writing; browser boards prune on
open (reader-side) — there is nothing to rescan from the CLI.

To remove a screen (its HTML file; nothing else to clean up):

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
  (content-driven height preserved across 1x/2x/3x scales), no
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
   lint from `openspec/specs/screen-regions/` gating each round.
2. **Design tokens as data** — lift `tokens.css` into a token file the panel can
   report against ("`#007AFF` = `--accent`"), instead of raw hex.
3. **Per-element notes** — the spec becomes a handoff document, not a readout.
