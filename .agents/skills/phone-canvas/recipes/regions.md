# Regions — which bands a screen owes

This is a **pointer, not a copy**. The numbers and the full map live in
`docs/screen-regions.md`; if the two ever disagree, that file wins. Read it
before authoring a screen, and let `npm run gate` tell you when you drifted.

## The one rule

The shell owns the bands. You never draw them — not the OS bands, and not the
nav or tab bar either. You declare slot **content**, and the shell places it.

```
.device                     ← fixed at the device height
├── .statusbar              ← shell, safeTop
├── .viewport               ← the only scrollable area, via `.body`
│   ├── .region-nav         ← shell, built from [data-slot]
│   ├── .screen             ← your markup (the body band)
│   └── .region-tabs        ← shell, built from [data-tab]
└── .home-indicator         ← shell, safeBottom
```

So a screen declares slot content (phone) or an arrangement (iPad/Duo):

| Form factor | Declare | Never |
|---|---|---|
| phone | `data-slot="back\|title\|right"`, `data-tab` on the tab buttons | `.navbar` / `.tabbar` / `.navbar-float` / `.tabbar-float` / `.dock` |
| Duo cover | `.split` + `.pane`, and a trailing `.rail` (`.rail-tools` above, `.rail-tabs` bottom-aligned) | a horizontal tab bar |
| Duo inner / fold | `.split` + `.pane` (`.pane-lead` / `.pane-trail` open, plain `.pane` ×2 folded) | one edge carrying both panes' controls |
| tablet | `.sidebar` + `.split` | a sidebar with 2–3 items, a second title above the split |

## Writing one

```html
<!-- phone: slots, whatever order you like — the shell lays them out -->
<div class="screen" style="background-color: var(--bg)">
  <button data-slot="back" aria-label="Quay lại">
    <span class="icon icon-sm" data-symbol="chevron.left"></span>
  </button>
  <span data-slot="title" class="nav-title">Hôm nay</span>
  <button data-slot="right" class="pill-soft">5 ngày</button>

  <div class="body" style="padding: var(--s4); gap: var(--s3)">
    …nội dung; `.body` cuộn, `.body-fixed` thì phải vừa khung…
  </div>

  <button data-tab class="tab is-on">…icon + nhãn…</button>
</div>
```

The `back · title · right` order is the shell's, not yours. `data-tab` sits at
the bottom in document order. No nav? Declare no slot and the shell builds no
band — correct for splash / full-bleed.

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

* `lint:regions` — from the text: OS chrome redrawn, a shell-owned band drawn by
  hand (`region-shell-owned`), an unknown/empty slot (`region-slot-unknown`), nav
  SLOT anatomy (≤ 3 actions, one-line title, back on a push), tab bar 3–5 and
  labelled, a horizontal tab bar on a cover, px tied to one device, a governed
  class under the touch floor, an `off` switch with no reason.
* `audit:regions` — from the real layout in Chrome: the two OS bands exist once
  each and sit outside `.viewport`, `.device` paints what `.screen` paints,
  exactly one scroller with the bands outside it, `.body-fixed` that fits,
  every interactive rect is ≥ 44 × 44, the tab bar is the last band, a folded
  split is 50/50 with nothing on the crease.

Escape hatches, both of which must be justified in writing:

* markup: `<!-- lint-region: off — lý do của bạn -->` before any element, and
  only there; a bare switch is itself an error.
* measured: an entry in `EXEMPTIONS` in `scripts/region-audit.ts`, naming the
  element and why the parent already guarantees the hit region.

## Three traps that cost real time

* **`:root` only matches `<html>`.** A token declared on `:root` is *inherited*
  by `.screen`, so it always loses to a rule that assigns it directly. Declare
  `--bg` on the scope that uses it, plus a dark twin.
* **Zero flex basis lies about the painted ratio.** `flex: 1 1 0` distributes
  space *inside* the box, so a pane's padding lands outside it and a nominal
  1:2 paints as 35:65. A percentage basis is a border-box size and stays true.
* **A shrinking child squashes, it does not overflow.** The frame is height-fixed,
  so `.body` / `.body-fixed` set `flex-shrink: 0` on their children. A fixed-height
  `.btn` measured 39 pt (not 58) before that rule — the touch floor caught it.
