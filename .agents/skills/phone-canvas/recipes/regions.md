# Regions — which bands a screen owes

This is a **pointer, not a copy**. The numbers and the full map live in
`docs/screen-regions.md`; if the two ever disagree, that file wins. Read it
before authoring a screen, and let `npm run gate` tell you when you drifted.

## The one rule

The shell owns the OS bands. You never draw them.

```
.device
├── .statusbar        ← injected, safeTop
├── .viewport         ← your markup goes here
│   └── .screen
└── .home-indicator   ← injected, safeBottom
```

So a screen declares the bands it owns, and nothing else:

| Form factor | Declare | Never |
|---|---|---|
| phone | `.navbar` (or `.navbar-float`) on top, `.tabbar` at the bottom | a hand-built row with round buttons in it |
| Duo cover | `.split` + `.pane`, and a trailing `.rail` (`.rail-tools` above, `.rail-tabs` bottom-aligned) | a horizontal tab bar |
| Duo inner / fold | `.split` + `.pane` (`.pane-lead` / `.pane-trail` open, plain `.pane` ×2 folded) | one edge carrying both panes' controls |
| tablet | `.sidebar` + `.split` | a sidebar with 2–3 items, a second title above the split |

## Writing one

```html
<!-- phone: the band is a region, not a row you built yourself -->
<div class="navbar" style="padding: 0">
  <button class="nav-round is-hollow" aria-label="Quay lại">
    <span class="icon icon-sm" data-symbol="chevron.left"></span>
  </button>
  <span class="nav-title">Tiêu đề</span>
  <button class="nav-round is-hollow" aria-label="Thêm">
    <span class="icon icon-sm" data-symbol="plus"></span>
  </button>
</div>
```

`padding: 0` because the screen's own gutter already insets the band. Drop it
when the band owns its inset.

```html
<!-- Duo cover: content pane + trailing rail -->
<div class="split">
  <div class="pane">…nội dung…</div>
  <div class="rail">
    <div class="rail-tools">…hành động nổi bật trước…</div>
    <div class="rail-tabs">…destination, xuống đáy…</div>
  </div>
</div>
```

## What the gate checks

`npm run gate` runs two tiers, and both fail the build:

* `lint:regions` — from the text: OS chrome redrawn, an undeclared band, navbar
  anatomy (≤ 3 actions, one-line title), tab bar 3–5 and labelled, a horizontal
  tab bar on a cover, px tied to one device, a governed class under the touch
  floor, an `off` switch with no reason.
* `audit:regions` — from the real layout in Chrome: the two OS bands exist once
  each and sit outside `.viewport`, `.device` paints what `.screen` paints,
  every interactive rect is ≥ 44 × 44, the tab bar is the last band, a folded
  split is 50/50 with nothing on the crease.

Escape hatches, both of which must be justified in writing:

* markup: `<!-- lint-region: off — lý do của bạn -->` before any element, and
  only there; a bare switch is itself an error.
* measured: an entry in `EXEMPTIONS` in `scripts/region-audit.ts`, naming the
  element and why the parent already guarantees the hit region.

## Two traps that cost real time

* **`:root` only matches `<html>`.** A token declared on `:root` is *inherited*
  by `.screen`, so it always loses to a rule that assigns it directly. Declare
  `--bg` on the scope that uses it, plus a dark twin.
* **Zero flex basis lies about the painted ratio.** `flex: 1 1 0` distributes
  space *inside* the box, so a pane's padding lands outside it and a nominal
  1:2 paints as 35:65. A percentage basis is a border-box size and stays true.
