# Failure modes

Every entry here is a bug that was found by running the tool, not by reading it.
They share one property that makes them expensive: **they do not throw.** The
screen renders something wrong, or nothing, and looks like a design mistake
rather than a code mistake.

Read this before debugging anything visual.

---

## 1. An icon that vanishes

**Symptom.** A glyph is simply not there. Not a square, not a wrong icon — the
space is empty and the layout is otherwise correct.

**Cause.** The mask points at a **URL** instead of an inlined data URI. A CSS
`mask-image` is fetched in **CORS mode** — unlike an `<img>`, which is a no-cors
fetch. A screen renders inside a sandboxed iframe with an **opaque origin**, so
`url('/icons/x.svg')` is a cross-origin request the browser refuses. And per the
masking spec, a mask that fails to load is treated as **transparent black**: the
element is fully masked out and disappears.

**Why the export looked fine.** `scripts/export.ts` serves the document from the
same origin as the assets, so the fetch is same-origin and succeeds. An icon bug
that only appears on the board is this one.

**Fix.** Never write `style="--icon: url(…)"`. Add the glyph to `SYMBOLS` in
`scripts/icons.ts` and run `npm run icons`; the generator inlines it. Since core-upgrade 1.1, composeScreenDoc also inlines any remaining external mask URL at compose time (iconMasksFor() in src/extractor/assets.ts + inlineIconMasks() in src/extractor/compose.ts, board path only) — so a stray URL degrades to a slightly larger srcdoc instead of a vanished glyph. The generator remains the primary path; the compose-time inline is the safety net.

**Guard.** The panel reports `externalMask` in orange.

---

## 2. An icon that is a solid square

**Symptom.** The glyph renders as a filled rectangle in the current colour.

**Cause.** `data-symbol="book.fill"` names a symbol that is not in the generated
set, so `--icon` is undefined, so no mask is applied — and the element paints its
whole `background-color`.

**Why it is easy to miss.** The typo is invisible in the markup (`book` vs
`book.fill` both look right), and the result looks like a deliberate shape.

**Fix.** Add the symbol to `SYMBOLS`, or correct the attribute.

**Guard.** The panel reports `unmappedSymbol` in orange, and the node still reads
as an `Image` so the spec tells you what it *should* have been.

---

## 3. Colour that will not change

**Symptom.** An icon is always black (or always one colour) no matter what
`color` you set on it or its parent.

**Cause.** It is an `<img>`, not a `.icon`. `currentColor` inside an `<img>`
resolves against the image's own document, so it comes out black.

**Fix.** Monochrome and tintable → `.icon`. Full-colour art → `<img class="art">`.
The two lanes are not interchangeable.

---

## 4. A flex column that is wider than the others

**Symptom.** In a row of equal columns, one is visibly wider and the rest are
squeezed. Classic in a bar chart whose peak bar carries a label.

**Cause.** A flex item defaults to `min-width: auto`, which means it **refuses to
shrink below its content**. A column holding a tooltip gets a minimum width of
the tooltip, and `flex: 1 1 0` cannot override that.

**Fix.** `min-width: 0` on any flex item that must share space equally.

**Related.** The mirror image: a row of labels where each is `flex: 1 1 auto`
sizes to its text, so the centres drift out from under their columns. Labels
belong to the same slot geometry as the thing they label — use the same class
with the same flex basis.

---

## 5. `Block (out of subset)` on a layout that is not a layout

**Cause.** An element with `display: block` — usually a bare `<div>` wrapper that
exists only to carry padding. It has no flex meaning, so it has no stack meaning.

**Fix.** Use `.inset` (a flex column with no gap) for a pure padding wrapper, or
push the padding onto the child. Never leave a bare `<div>` in a screen.

**Not a false positive.** If the panel says `Block`, the SwiftUI for that node is
genuinely underivable. Fix the markup.

---

## 6. A `<div>` with a `<span>` in it reported as a container

**Cause.** The extractor used to treat any element with element children as a
container. But a div holding text plus a styled span is **one `Text` with a
styled run**, not a stack.

**Status.** Fixed — a board whose only children are inline tags now reads as
`Text`, and reports its typography. If you see it again, the child is not a
`<span>`, `<b>`, `<i>`, `<em>`, `<strong>`, `<small>` or `<br>`.

---

## 7. Coordinates that do not match the picture

**Cause.** `transform: translate(-50%, -50%)` to centre an absolutely positioned
child. A transform is applied after layout, so `getBoundingClientRect()` inside
the measuring bridge is taken from a box the browser believes is somewhere else.

**Fix.** Centre with a negative half-size margin:
`margin: -17px 0 0 -17px` for a 34px element. It is part of layout, so it is
measured correctly.

---

## 8. The height is wrong and the panel says so

**Symptom.** `npm run export` produces a PNG that is not the height you intended.

**Meaning.** The frame is content-driven. A frame matching the reference
device exactly (sizes in `src/frame/devices.ts`) means it fits; anything over
means the content is taller than the device and the frame grew. Sometimes that
is correct (a long list should be tall). Often it means 40 points of padding you did not intend.

**Method.** Do not adjust by eye. Export, read the PNG's height from the
exporter's own output, change one section, export again. Two rounds is normal.

---

## 9. The bridge captured nothing

**Symptom.** (Historical — fixed.) The panel sat on "Đang đọc DOM…" forever.

**Cause.** Capture ran on the `load` event, which fires long before the parent
page has laid the iframe out. Until layout happens every rect is `0`, so the
capture was empty.

**What it means for you.** The bridge now waits for a real measured height and
retries. If a screen ever shows no spec, the iframe has no layout at all — check
that the node has a size and that `srcDoc` was built.

---

## 10. Two nodes claiming one identity

**Symptom.** Adding a screen makes an existing one render the wrong content.

**Cause.** Node ids derived by string concatenation from a screen id plus an
index. It looks unique until the index repeats, and react-flow does not throw on
a duplicate id — it renders the wrong node.

**Fix.** `src/canvas/nodeId.ts` mints ids from a counter. A node is an *instance*
of a screen; its identity must never be derived from the screen's.

**Same class of bug, same fix.** A screen's identity is its filename stem under
`project/<id>/screens/`, and that is the only place it is written. The board
reads the folder through `import.meta.glob`, and lint/export/CLI read it off
disk through `scripts/scan-projects.ts` — both call the same `deriveRegistry`,
which throws on a duplicate id, so the two can never disagree. (There used to
be a hand-maintained `src/screens/manifest.ts` and a codegen step; both are
gone, which is what removed this whole failure class.)

---

## 11. An expanded node that still cuts its content

**Symptom.** The node label shows the content height but
the bottom of the screen is cut off and `.body` still scrolls.

**Cause (two stacked).** Growing the iframe is not enough — the document
inside is still fixed at `--device-h`, so `.viewport` clamps and `.body`
keeps scrolling. And the override that grows it must beat `CHROME_CSS`,
which is emitted *after* `extraCss` in `composeScreenDoc`: same specificity
means the later block wins, so the override needs `!important`.

**How it was found.** The bridge settles it: after expanding, a `height`
post with `value` (inner document) below `content` (true height) means the
inner document never grew. `value === content` is the done condition.

**Fix.** `src/canvas/PhoneNode.tsx` layers
`html, body, .device { height: <contentH>px !important; }` into `extraCss`
when expanded. Do not "fix" it by editing `CHROME_CSS` heights — that would
change frame mode too.

---

## 12. Parallel test workers racing on the same files

**Symptom.** Two probe suites pass alone, fail together — one's cleanup
deletes files the other's assertions still need (`ENOENT project/zz-…/project.json`
while another worker's `import.meta.glob` transform reads the tree). Flaky,
order-dependent, green on re-run.

**Cause.** Vitest runs test files in parallel workers by default. Suites
that write into the same directory race each other — and the victims are the
readers: `src/projects/registry.ts` globs the whole `project/` tree, so a
suite that scaffolds a probe project in the repo breaks every other suite
that is mid-transform.

**Fix.** Give each suite its own `mkdtemp` root (`scripts/export/golden.test.ts`
is the pattern) and pass it to the CLI under test — `scripts/new-screen.ts`
takes `--root <dir>` for exactly this. Never "fix" it by reordering tests, and
do not reach for `fileParallelism: false`: the flag was removed deliberately
(core-upgrade 5.3) because it taxed the whole suite for one pair of races.
`project/` is read-only for the duration of a test run.

---

## 13. A script that imports without its extension

**Symptom.** `vite` dev works, but `node scripts/x.ts` (any lint/export CLI)
fails to resolve a relative import.

**Cause.** Node ESM requires the extension: `from '../src/frame/devices.ts'`,
not `from '../src/frame/devices'` (see `scripts/export.ts`). Vite resolves
extensionless paths; Node does not — so the failure only appears outside
the dev server.

**Fix.** Always write the `.ts` extension in script-relative imports. `tsc`
and vitest tolerate both; Node tolerates exactly one.

---

## 14. An empty board that ignores its seed file

**Symptom.** `project/<id>/board.json` exists (written by
`npm run project -- freeze <id>`), but a fresh board opens with the default
layout instead of the frozen one.

**Cause.** The seed is applied only when it is **newer** than the saved record
(`exportedAt > savedAt`) or when no record exists at all — a board you have
already dragged around wins, by design. `seedBoard()` (`src/projects/storage.ts`)
fetches the file once per project on mount; a 404, unreadable JSON, or a
`projectId` that does not match is `null` and never an error.

**Fix.** This is a precedence rule, not a bug: clear the board's saved state
(`localStorage` key `pc.board.<projectId>`) to see the freeze again, or re-run
`npm run project -- freeze <id>` to make the artifact newer. Do not "fix" it by
forcing the file to win — a dragged arrangement is the user's work.

Note the old shape of this failure mode: the seed used to be read with a
**synchronous XHR on the render path**, so anything without sync XHR silently
lost it. That read is gone (core-upgrade 5.2) — there is now one store
(`pc.board.<id>`, v5) and one async seed step.

---

## 15. An inspector that never reads anything (sandboxed origin)

**Symptom.** The panel sits on "Đang đọc DOM…" forever, the tree never appears,
`Copy JSON` stays disabled, and nothing is logged. Every screen on the board
behaves the same way.

**Cause.** A `sandbox="allow-scripts"` iframe (no `allow-same-origin`) has an
**opaque origin**, so `event.origin` for every `postMessage` it sends is the
string `"null"` — never the parent's origin. An accept gate that compares
`event.origin` against `window.location.origin` therefore rejects **every**
message the bridge sends, silently, because a rejected message is indistinguishable
from one that was never sent.

**Fix.** The per-frame **token** is what authenticates a message (random per
node, present only in that node's srcdoc); the origin check only has to reject
strangers, so it accepts the board's own origin **or** the opaque `"null"`
(`originAllowed()` in `src/inspect/route.ts`). Probe it before trusting a gate:
`<iframe sandbox="allow-scripts" srcdoc="<script>parent.postMessage({p:1},'*')</script>">`
reports `"null"`; the same srcdoc without `sandbox` reports the parent origin.

**Why it survived review.** Reading the code suggested "srcdoc inherits the
parent origin" (true without `sandbox`), and every unit test passed an explicit
origin — the bug only existed in a real browser. Any messaging gate must be
verified by running it.

---

## 16. Writing a file reloads the whole board

**Symptom.** You click **Xuất element này** / **Ghi golden** and the board
flashes: selection gone, panel back to "Click một màn hình trên bảng". It reads
as "the button did nothing".

**Cause.** Generated output lands inside the tree Vite watches for the registry
globs (`project/<id>/exports/`, `project/<id>/goldens/`, `project/<id>/board.json`),
so Vite invalidates `src/projects/registry.ts` and reloads the page. A dev
plugin's own watcher guard does not stop it — Vite's glob invalidation is a
separate mechanism.

**Fix.** Keep generated output out of the watcher:
`server.watch.ignored: ['**/project/*/exports/**', '**/project/*/goldens/**', '**/project/*/board.json']`
in `vite.config.ts`, and ignore the same paths in `registryGuardDev`'s
`onProjectFile`. Both halves are needed.

---

## 17. A golden that stays green when the element changed

**Symptom.** You change an element's CSS (a corner radius, a border), run
`npm run golden:check`, and it reports `khớp` — the crop hash cannot see it.

**Cause.** The crop comparison falls back to a **perceptual** dHash (Hamming ≤ 4),
and a symmetric change (all four corners, a mirrored gradient) can leave the
gradient hash unchanged. The pixels did move; the coarse hash did not.

**Fix.** The element golden carries a **spec digest** as well: a canonical,
geometry-free projection of the measured spec (style, typography, surface,
radius, text — measured boxes and capture ids dropped, because those shift with
OS fonts). `--element-check` and `npm run golden:check` fail on **either** half
moving, and print which one (`crop khớp, spec lệch`). When you add a new golden
comparison, check both halves — a hash that only sees pixels is not a review.

---

## 18. A crop that keeps a neighbour's overlay

**Symptom.** You select an element, export it, and a chip / badge / label that
lives *beside* it in the markup shows up inside the PNG, floating over the edge of
what you wanted. Nothing throws — the crop just looks wrong.

**Cause.** An element crop is a **region screenshot** (CDP `Page.captureScreenshot`
with a clip), not a subtree render: everything *painted* inside the region lands in
the file, siblings included. In `kb1-m6-casting` the chip floats at the top of
`.ob-hero` while the TV starts below it, so the chip's lower edge overlaps the TV's
own box — correct markup, contaminated image.

**Fix.** Paint the overlay out for the shot: `--hide ".ob-float"` (repeatable) on
`npm run locate`, or the panel's **ẩn** field before **Xuất element này**. The rule
is `visibility: hidden !important`, never `display: none`: the clip is measured
**before** the hide, so a reflow would move the element out from under its own
clip. The spec/JSON is measured first too, so hiding changes pixels only.

**Guard.** The rule is cleared in a `finally` — the Chrome session is warm and
serves many crops in a row, so a leaked rule would quietly follow every later shot.
A crop made with `--hide` compares `lệch` against a golden stored without it, which
is the honest verdict: a different render.
