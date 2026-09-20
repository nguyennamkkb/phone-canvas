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
`scripts/icons.ts` and run `npm run icons`; the generator inlines it.

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

**Meaning.** The frame is content-driven. `844` means it fits the reference
device exactly; anything over means the content is taller than the device and the
frame grew. Sometimes that is correct (a long list should be tall). Often it
means 40 points of padding you did not intend.

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

**Same class of bug, same fix.** Screen ids come from `src/screens/manifest.ts`
and nowhere else. The registry throws on a duplicate id, and the exporter reads
the manifest instead of scanning the directory, so the two can never disagree.
