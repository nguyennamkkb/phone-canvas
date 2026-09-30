# Tablet — one screen per layout, shell does not own the bands (yet)

This is a **pointer, not a copy**. The numbers live in `docs/screen-regions.md`
(`tablet` section) and the requirement in the `screen-regions` spec
("Tablet — sidebar + split, thu gọn được về tab bar"). If they disagree with
this file, they win.

## The one rule

Phone bands are shell-owned; **tablet bands are author-owned**. You draw the
sidebar and the split yourself, with the shared region classes — and the gate
checks the geometry, not who built it.

## Scaffolding

```bash
npm run screen -- add --project <id> --name <name> --title "..." --device ipad-11
```

`--device ipad-11` records `deviceId` in the `<!-- pc -->` header so fresh
boards open at 820 pt. A layout that differs fundamentally from the phone
version is a **separate screen** (invariant #5) — never `if-device` branches
in one file. Only spacing changes → keep one fluid file (token classes,
unitless flex).

## Shape

```html
<!-- pc {"title":"...","deviceId":"ipad-11"} -->
<div class="screen" style="background-color: var(--bg)">
  <div class="sidebar">
    <div class="sidebar-head">…brand / search…</div>
    <div class="sidebar-item is-active">…≥ 4 sibling destinations…</div>
    …
  </div>
  <div class="split">
    <div class="pane">…list…</div>
    <div class="pane">…detail (placeholder when empty, never a bare column)…</div>
  </div>
</div>
```

- Sidebar is for **4+** peer destinations (2–3 → segmented/tab bar instead);
  exactly **one** title sits above the split; the detail pane is never empty
  without a placeholder.
- The sidebar collapses (keeps selection, never hidden by default) and never
  holds important info or actions at its bottom.
- A narrow window falls back to tab bar + 1 column without changing data.

## What the gate checks

- Static tier skips body-band rules outside `form: phone`; nav/tab anatomy,
  slot values and the 44 pt floor still apply.
- Measured tier: sidebar/split geometry, one scroller at most, bands outside
  it. A collapsed band that lets a 44 pt control stick out fails — same lesson
  as the phone nav floor.
- `export -- --device ipad-11` renders at 820 pt; `--device` always keeps the
  `-<device>` filename suffix so phone and tablet shots never overwrite.
