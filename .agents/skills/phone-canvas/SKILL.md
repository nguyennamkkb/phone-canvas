---
name: phone-canvas
description: Design, build, verify, and hand off phone screens on the phone-canvas board — author a screen as constrained HTML/CSS, render it in an iPhone frame, read per-element specs off the live DOM for SwiftUI, and export screens to PNG. Use when asked to create or change a phone screen in this project, to turn a screenshot or mockup into a screen ("tái hiện màn hình này", "dựng màn hình này lên canvas"), to add or fix an icon or illustration asset, to export screens to images, or to produce SwiftUI specs from a design. Covers the CSS subset, the icon and illustration pipelines, the export-and-look verification loop, and the known silent failure modes.
---

# Phone Canvas

The board holds phone screens as **real HTML** inside a sandboxed iframe, measures
every element off the live DOM, and reports the numbers you need to write SwiftUI.

Two artefacts matter, and they are not the same thing:

- **the screen** — `project/<project>/<name>.html`, what you author
- **the spec** — what the panel reads off it, and the actual deliverable

A screen that looks right but reports `Block (out of subset)` is **not finished**.
A screen with a clean spec that looks wrong is **not finished either**. Both
gates, every time.

## The loop

Every screen is made the same way. Steps 3 and 6 are the ones people skip and
then pay for.

1. **Inspect** — read `src/screens/manifest.ts`, the project's own
   `project/<id>/tokens.css` (its design system — see
   `recipes/design-tokens.md`), and two or three existing screens. A new
   screen joins a design system; it does not invent one.
2. **Model** — before any markup, write down: purpose, primary action, primary
   information, persistent controls, what scrolls. If you cannot name the
   primary action, you do not understand the screen yet.
3. **Compose** — build the skeleton and render it *empty* first. Get the bands
   right (nav / body / bottom) before a single piece of content.
4. **Fill** — vocabulary class first, tokens for every value, assets last.
5. **Lint** — read the panel. Zero red `Block` warnings, zero unmapped symbols,
   zero external masks. See `references/failure-modes.md`.
6. **Measure** — `npm run export`. Check the PNG dimensions. The height is
   content-driven: if it is not the height you intended, something is too tall
   or too short, and you find it by measuring, never by guessing.
7. **Look** — actually read the exported PNG. Compare it against the intent or
   the reference. Numbers cannot tell you a layout reads wrong.
8. **Repair** — fix the highest-severity problem, re-export, look again. Bound it
   to ~3 rounds; if you are still moving, say what is unresolved rather than
   declaring done.
9. **Hand off** — the panel is the deliverable. Read the tree, `Copy JSON`, and
   write the SwiftUI from `references/spec-to-swiftui.md`.

## Read these when the loop sends you there

| | |
|---|---|
| `docs/screen-authoring.md` (repo) | **The contract.** The CSS subset, the token vocabulary, banned constructs. Read before authoring anything. |
| `references/tooling.md` | Commands, the board's modes, the icon pipeline, the generator. |
| `references/failure-modes.md` | The silent failures. An icon that vanished, a column that widened, a spec that lied. |
| `references/spec-to-swiftui.md` | What the panel reports and the SwiftUI it maps to. |
| `recipes/*.md` | Screen archetypes: onboarding, list, dashboard. |

## Project workflows

These are the commands an agent runs to manage the project itself (screens,
board state, verification) — separate from the screen-authoring loop above.

### Screen lifecycle (one entry)

```bash
npm run screen -- add --project <id> --name <name> --title "..." [--device <id>]
npm run screen -- rename --id <old> --to <new>
npm run screen -- remove --id <screen-id> [--force]
npm run screen -- list [--project <id>]
npm run screen -- gate                # screens:sync + tsc + lint, auto-runs after add/rename/remove
```

Old habits keep working — thin aliases over the same scripts:

```bash
npm run new-screen -- --project <id> --name <name> --title "..."
npm run rename-screen -- --id <old> --to <new>
npm run delete-screen -- --id <screen-id> [--force]
npm run screens:sync          # regenerate generated.ts after manual manifest edits
```

- `new-screen` writes the HTML file, inserts the manifest entry, regenerates
  `generated.ts`, and adds the id to `builtin.ts`. Round-trip with
  `delete-screen` must leave the repo byte-identical.
- `rename-screen` moves the id across file + whole manifest entry line
  (extra props ride along) + builtin ids + on-disk board.json files
  (nodes, removed, trash) with rollback on write failure. Browser
  localStorage boards prune reader-side on open — no CLI rescan.
- `delete-screen` removes the file and unwires the screen. Without `--force`
  it aborts if any saved board still references the id.
- All three refuse bad input without writing; `--force` overrides board-references checks.
- Every command prints files changed + boards/trash touched; via `screen --`
  the gate (screens:sync + tsc + lint) runs automatically after.
- iPad: `new-screen -- --device ipad-11` scaffolds a 2-column template and
  records `deviceId` in the manifest so fresh boards open it at 820pt.
  Write screens fluid (token classes, no px per width); a fundamentally
  different tablet layout is a separate screen, never `if-device` in one file.

### Board state: trash & export/import

- **Trash** is per-project. Deleting a screen from the board moves it to the
  trash dialog (🗑 badge). Restore puts it back at the old position with edges.
  Emptying the trash and permanent delete (`delete-screen --force`) are the two
  ways to remove it from disk.
- **Export** (`Xuất` button) downloads `project-id-board.json`
  (`{ v: 1, projectId, exportedAt, board }`).
- **Import** (`Nhập` button) validates the file (version, projectId, schema).
  Invalid → alert, current state untouched. Valid → write-through cache + reload.

### Verification gate

Run before claiming any board change works:

```bash
npm run gate        # lint + typecheck + lint:tokens + lint:subset + lint:components + vitest
```

Or step by step: `npm run typecheck && npm run lint && npm test`.

The board also boots via `npm run dev` — open http://localhost:5273 and
confirm no runtime errors in the console.

### Verify with the browser

Use the live board to confirm observable behavior:

1. Open the project; confirm all registered screens render.
2. Create via `new-screen`, delete to trash (confirm the 🗑 badge updates),
   restore (confirm position + edges), then `delete-screen --force` (confirm
   the file is gone and registry clean — grep the id).
3. Export → import the downloaded file → confirm board + trash restored.

## Hard rules

1. **One container per idea.** Reach for `.row`, `.col`, `.grow`, `.spacer`
   before writing CSS. Every container you add becomes a `VStack`/`HStack` in the
   output — spacer-only divs are noise someone has to read past in SwiftUI.
2. **Tokens, never literals.** No `13px`, no `#333`. If a value has no token, the
   design system is missing a token — add it there, not inline in the screen.
3. **Icons are declared once.** Drop the SVG in `public/icons/`, add one line to
   `SYMBOLS` in `scripts/icons.ts`, run `npm run icons`. Never hand-write
   `style="--icon: url(…)"`. See failure mode 1.
4. **Full-colour art is `<img class="art">`**; a monochrome glyph is `.icon`.
   Getting this backwards is why icons come out black.
5. **Coordinates only inside a composite graphic.** `position: absolute` is legal
   in `.ring` / `.card-assistant`-style containers and nowhere else, and never
   with `transform: translate(-50%,-50%)` — a transform is invisible to the
   layout engine and the spec will report the wrong box.
6. **The shell owns the safe areas.** Never write a status bar or home indicator;
   `src/extractor/compose.ts` injects both.
7. **The screen is not height-constrained.** Design the whole thing. Nothing is
   clipped at 844 — a screen that needs 1200 points becomes a 1200-point
   rectangle.
8. **No emoji.** They do not map to SwiftUI. Use the symbol that does.
9. **State the deviation.** When you cannot match a reference — artwork you had
   to draw, an icon set you only approximated, a detail you chose to change —
   say so plainly in your final response. Silent approximation is the one thing
   that makes this tool untrustworthy.

## Completion threshold

Do not report a screen as done while any of these is true:

- the panel shows a red `Block (out of subset)` row
- an `unmappedSymbol` or `externalMask` warning is present
- a glyph is an inline `<svg>` — it has no name and cannot be handed off
- the exported height is not the height you intended, and you have not explained
  why
- you have not looked at the exported PNG
- the SwiftUI for the primary action is not derivable from the spec
- `npm run lint:tokens` reports an error

## Recipes

Pick the closest archetype before starting; each one names its structure and the
classes it uses.

| Screen | Recipe |
|---|---|
| welcome / intro / permission primer | `recipes/onboarding.md` |
| browse, inbox, settings, search results | `recipes/list-screen.md` |
| score, stats, overview, anything with a chart | `recipes/dashboard.md` |
| modal action menu, preview, short form, filter | `recipes/bottom-sheet.md` |
| new project palette, token edit, dark mode, handoff | `recipes/design-tokens.md` |
