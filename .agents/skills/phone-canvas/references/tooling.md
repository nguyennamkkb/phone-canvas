# Tooling

## Commands

```bash
npm run dev        # board at http://localhost:5273
npm run build      # icon generator first, then vite build — stale glyphs cannot ship
npm run typecheck  # tsc --noEmit — run it before claiming anything works
npm run lint       # gate: typecheck + lint:tokens + lint:subset + lint:components + lint:regions
npm run lint:tokens | lint:subset | lint:components | lint:regions   # one tier; every lint takes --screen <id> (scripts/screen-filter.ts)
npm test           # vitest run
npm run gate       # lint + audit:regions + test — the full integrity gate (matches package.json)
npm run screen -- add --project <id> --name <n> --title "..."      # lifecycle: add (+ auto-gate)
npm run screen -- rename --id <old> --to <new>                   # lifecycle: rename (+ auto-gate)
npm run screen -- remove --id <screen-id> [--force]              # lifecycle: remove (+ auto-gate)
npm run screen -- list [--project <id>]                          # ids + titles + owners (read-only)
npm run screen -- gate                                           # tsc + lint
npm run new-screen -- --project <id> --name <name> --title "..." [--kind push]   # alias: same as screen -- add
npm run rename-screen -- --id <old> --to <new>                   # alias: same as screen -- rename
npm run delete-screen -- --id <screen-id> [--force]                # alias: same as screen -- remove
npm run export     # every screen → exports/<id>@2x.png
npm run export -- --project <id>   # that project's screens → project/<id>/exports/
npm run export -- --screen lesson-details --scale 3
npm run export -- --all-devices --out docs/shots   # every width in DEVICES (README shorthand: --device all)
npm run export -- --all-devices --golden           # + versioned PNGs + sha256 records (scripts/export/golden.ts)
npm run export -- --device ipad-11 --full --theme dark   # --full = whole page, --theme = light|dark
npm run export -- --list          # ids, titles, devices
npm run locate -- --screen my-screen --x 195 --y 640 [--pad 32 --scale 2 --device iphone-se --theme dark]
npm run project -- freeze <id>   # write project/<id>/board.json seed (scripts/board-freeze.ts)
npm run scan:projects            # print the registry both readers see (scripts/scan-projects.ts)
npm run preview                  # vite preview (static host, no rewrite rules needed)
npm run export:icons -- --project <id>   # that project's glyphs → project/<id>/exports/icons/
npm run icons      # regenerate src/screens/icon-set.css from public/icons/
```

`npm run delete-screen -- --id <id>` removes the HTML file and unwires the
screen from manifest + builtin + generated registry. If any saved board still
references the id it aborts — pass `--force` to override. The permanent delete
is a script; the browser never writes into the repo (export/import use the
download / file-picker flow instead).

`npm run rename-screen -- --id <old> --to <new>` moves the id across file +
whole manifest entry line (extra props ride along) + builtin + on-disk
board.json files (nodes, removed, trash) with rollback on write failure.
Browser localStorage boards prune reader-side on open (BoardView
pruneZombieNodes) — no CLI rescan exists, by design.

`npm run new-screen` does the same wiring in reverse. Add → remove stays
symmetric — a round-trip must leave the repo byte-identical.

`npm run screen -- <add|rename|remove|list|gate>` is the one entry for all of
the above: add/rename/remove delegate to the same scripts, print files
changed + boards/trash touched, then auto-run the gate (tsc +
lint). The `new-screen` / `delete-screen` / `rename-screen` aliases stay so
old habits keep working.

## The board

| Control | Effect |
|---|---|
| **Di chuyển** | iframes are inert; drag, pan, zoom. Click a node to point the panel at it. |
| **Đo đạc** | iframes take pointer events; hover highlights, click selects an element. |
| **Khung đơn giản / Khung máy** | cosmetic only — never changes a measured number |
| **⤢ / ⤡** | expand the node to the full content height — the iframe *and* the inner document grow together (an `extraCss` override, `!important` so it beats `CHROME_CSS`), then the bridge re-measures and it converges. If an expanded node still cuts content, see failure mode 11. |
| **🗑** | open the per-project trash dialog (badge = count) |
| **Xuất** | download `project-id-board.json` (`{ v: 1, projectId, exportedAt, board }`) |
| **Nhập** | upload a previously exported `.json` — validates version/projectId/schema, then reloads |

Each node carries a two-row vertical label (`src/canvas/PhoneNode.tsx`,
`docs/upgrade-core/13_NODE_LABEL_PROPOSAL.md` — never wider than the node,
so ids ellipsis instead of squeezing controls):

- **Row 1** — title · `#project/screen` (click to copy) · `W × H` · golden badge (`khớp` / `lệch` / `chưa có golden`, read-only — `src/inspect/badges.ts`) · **×** delete (always visible, right-aligned).
- **Row 2** — copy-id · form chip (phone is chipless) · **⤢ Mở rộng / ⤡ Thu về** toggle.

Owner badges (`src/inspect/badges.ts:ownerOf`) name the band that owns the
selected node — shell bands (status/nav/tab) win over content, so chrome is
never misread as content.

The panel's **Copy JSON** hands the selected element, or the whole screen, to
whatever you want to write the SwiftUI.

### Trash (per-project)

Delete a screen from the board → it moves to the trash, not to disk. The
Trash dialog lists newest-first with **Khôi phục** / **Xóa vĩnh viễn** / **Dọn thùng**.

- **Khôi phục** puts the node back at its old position and re-attaches edges.
- **Xóa vĩnh viễn** shows `npm run delete-screen -- --id <id>` + a copy button —
  the browser never deletes repo files; run the script (with `--force` if boards
  still reference it).
- **Dọn thùng** empties the trash.

Trash is part of the board snapshot (v4) and persists across reloads.

### State file (export/import)

The board layout is persisted in localStorage. To move a board between machines
or recover from a wiped cache:

1. **Export** — click **Xuất**; download `project-id-board.json`.
2. **Import** — click **Nhập**, pick the file. It validates:
   - `v === 1`, matching `projectId`, valid `nodes/edges/removed/trash` shape.
   - On failure the file is rejected with an alert and the current state is untouched.
3. After import the board reloads from the file; the cache is the write-through
   copy, and the file wins on the next open as long as it is newer.

### Frozen seed (`project/<id>/board.json`)

`npm run project -- freeze <id>` writes a board snapshot in the exact
`ProjectStateFile` shape `parseStateFile` validates (`scripts/board-freeze.ts`,
`src/projects/storage.ts`) — positions use the same `nextSlotX` rule as the
board (gap 120). An empty board with no saved state reads it as a seed
(render-path read; never touches localStorage, reconcile, or flow). It seeds,
it never replaces Xuất/Nhập.

## Where things live

```
project/<project>/screens/<name>.html    the screens — the file IS the entry
                                        (title/lightStatusBar/deviceId come from
                                        its first-line <!-- pc {...} --> header)
src/projects/derive.ts        one rule set for both readers: validates ids, headers
src/projects/registry.ts      browser reader (import.meta.glob over project/)
scripts/scan-projects.ts      Node reader: the same deriveRegistry, off disk
src/screens/core.css         spacing, region metrics, type (layer 1 of 3)
src/screens/palettes.css      colour palettes (layer 2 of 3)
src/screens/vocab.css         component vocabulary (layer 3 of 3)
src/screens/icons.css        base .icon rules (hand-written)
src/screens/icon-set.css     GENERATED — do not edit
src/projects/storage.ts      localStorage keys, board snapshot v4, trash, state-file marker
src/board/TrashDialog.tsx    per-project trash UI
src/extractor/bridge.js      runs INSIDE the iframe: capture, hover, click, height
src/extractor/compose.ts     stylesheets + chrome + screen + bridge → one document
src/spec/infer.ts            the only place that knows about SwiftUI
src/canvas/nodeId.ts         node identity (a counter, never derived from a screen)
scripts/icons.ts             icon generator + the SF Symbol → file map
scripts/export.ts            screens → PNG via Chrome over CDP, zero deps
scripts/new-screen.ts        create a screen from a contract-valid template
scripts/rename-screen.ts     rename a screen id (rollback on failure)
scripts/delete-screen.ts     permanently remove a screen
scripts/screen.ts            unified entry: add|rename|remove|list|gate (+ auto-gate)
scripts/screen-filter.ts     shared --screen <id> filter for the lint CLIs
scripts/export/cli.ts        export flags (--screen/--project/--device/--all-devices/--golden/--full/--theme)
scripts/export/golden.ts     golden store (goldens.json manifest + versioned PNGs + sha256)
scripts/board-freeze.ts      project -- freeze: board.json seed writer
scripts/component-anatomy.ts 11-item @anatomy header (lint:components BLOCKS when missing)
src/spec/ir.ts               Spec IR v1 envelope builder (irVersion)
src/inspect/badges.ts        owner + golden badges (pure, read-only)
openspec/specs/screen-regions/ region contract (spec) + docs/upgrade-core/02,03 (migration notes)
public/icons/                monochrome glyphs
public/images/               full-colour art
```

There is no manifest to hand-maintain and no codegen step: a screen is a file
under `project/<id>/screens/`, and `import.meta.glob` is the watcher.

## Adding a screen

**Quick way (recommended):**

```bash
npm run screen -- add --project <id> --name <name> --title "..."
```

(prefer the unified entry — it auto-runs the gate after. `npm run new-screen`
is the same script without the gate.)

This writes `project/<project>/screens/<name>.html` and nothing else — the
file's first line is its entry:

```html
<!-- pc {"title":"Home","lightStatusBar":true,"deviceId":"ipad-11"} -->
```

Those three keys are the whole header (see `SCREEN_KEYS` in
`src/projects/derive.ts`); any other key is a registry error, and an unknown
`deviceId` is rejected too. A round-trip (`new-screen` →
`delete-screen --id <name> --force`) must leave the repo byte-identical.

**Manual way** (or to understand the wiring):

1. Write `project/<project>/screens/<name>.html` with its `<!-- pc {...} -->` header
2. Nothing else. The board follows the disk via `import.meta.glob`; lint, export
   and the CLI read the same tree through `scripts/scan-projects.ts`

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

The drawing house style is in `openspec/specs/screen-regions` (migration notes:
`docs/upgrade-core/02_PLATFORM_RULES.md`).

## Verifying without a browser

The exporter is the fastest objective check and it needs no dev server:

```bash
npm run export -- --screen <id> --out /tmp/check --scale 2
```

It prints the real pixel size of each file. A size matching the reference
device exactly (sizes in `src/frame/devices.ts`) means the screen fits;
anything else is a content-driven height and should be
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
- The board **persists in localStorage** across reloads (including trash).
  A hard cache wipe + an imported state file restores the board.
- `npm run typecheck` covers `src/` and `scripts/`. It is cheap; run it.
- `npm run delete-screen` refuses if saved boards still reference the id
  (use `--force` to override). Files are only removed by the script — the
  browser never writes into the repo.
- The `.body` scrollbar is hidden shell-wide (board, export, locate) by
  `CHROME_CSS` — scrolling still works, and no measured number changes
  (audit/spec read `scrollHeight`, not scrollbar pixels). Do not re-add
  scrollbar styling per screen.
