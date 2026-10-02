# Regions — which bands a screen owes

This is a **pointer, not a copy**. The numbers and the full map live in
`openspec/specs/screen-regions` (migration notes in
`docs/upgrade-core/02_PLATFORM_RULES.md` + `03_REGION_SYSTEM.md`; spacing
vars in `src/screens/tokens.css`, sizes in `src/frame/devices.ts`); if the
two ever disagree, the spec wins. Read it before authoring a screen, and let
`npm run gate` tell you when you drifted.

## The one rule

The shell owns the bands. You never draw them — not the OS bands, and not the
nav or tab bar either. You declare slot **content**, and the shell places it.

```
.device                     ← fixed at the device height
├── .statusbar              ← shell, safeTop
├── .viewport               ← the only scrollable area, via `.body`
│   ├── .region-nav         ← shell, built from [data-slot]
│   ├── .screen             ← your markup (the body band)
│   └── .region-tabs        ← shell, built from [data-tab="<slug>"]
└── .home-indicator         ← shell, safeBottom
```

So a screen declares slot content (phone) or an arrangement (iPad/Duo):

| Form factor | Declare | Never |
|---|---|---|
| phone | `data-slot="back\|title\|right"`, `data-tab="<slug>"` on the tab buttons, `data-tab-active="<slug>"` on `.screen` | `.region-nav` / `.region-tabs`, or the v1 names `.navbar` / `.tabbar` / `.navbar-float` / `.tabbar-float` / `.dock` |
| Duo cover | `.split` + `.pane`, and a trailing `.rail` (`.rail-tools` above, `.rail-tabs` bottom-aligned) | a horizontal tab bar |
| Duo inner / fold | `.split` + `.pane` (`.pane-lead` / `.pane-trail` open, plain `.pane` ×2 folded) | one edge carrying both panes' controls |
| tablet | `.sidebar` + `.split` | a sidebar with 2–3 items, a second title above the split |

## Writing one

```html
<!-- phone: slots, whatever order you like — the shell lays them out -->
<div class="screen" data-tab-active="home" style="background-color: var(--bg)">
  <button data-slot="back" aria-label="Quay lại">
    <span class="icon icon-sm" data-symbol="chevron.left"></span>
  </button>
  <span data-slot="title" class="nav-title">Hôm nay</span>
  <button data-slot="right" class="pill-soft">5 ngày</button>

  <div class="body" style="padding: var(--s4); gap: var(--s3)">
    …nội dung; `.body` cuộn, `.body-fixed` thì phải vừa khung…
  </div>

  <!-- the destination list lives in the project, not in this file -->
  <!-- @component app-tabs -->
</div>
```

The `back · title · right` order is the shell's, not yours. No nav? Declare no
slot and the shell builds no band — correct for splash / full-bleed.

## How the shell lays the nav out (you do not)

Three slot divs are always rendered (empty = balancer), and the two sides
are `flex: 1` each — so the title's midpoint is the bar's midpoint even when
a side is missing or wider than the other. A title that still overflows
truncates with an ellipsis instead of sliding under a button.

* Bare text/icons in `back`/`right` are auto-wrapped by `compose.ts` into a
  44 pt `.shell-nav-btn` — write a plain `<span data-slot="right">…</span>`
  and it still taps. Anything already a button (or containing one) and the
  `title` slot are never wrapped.
* The band floor is 44 pt (`--navbar-min-h: 44px` in `src/screens/tokens.css`),
  so a 44 pt control never sticks out of it — a collapsed band used to break
  the measured audit.
* Modal chrome comes from `components/app-nav.html`: a visible `pill-ghost`
  **Hủy** button plus an overridable `title` slot. Do not restyle it per
  screen; override the slot.

**Do not write `is-active` or `aria-label` on a tab.** Write the slug
(`data-tab="diary"`) in the project's `components/app-tabs.html`, and name the
open one once, on `.screen` (`data-tab-active="diary"`). The shell derives the
active marker, `aria-current="page"`, the label and the "tab N trên M" position
from the real order of the list — so reordering or adding a destination touches
one file, not every screen.

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
  hand (`region-shell-owned`), an unknown/empty slot (`region-slot-unknown`), a
  missing or wrong open destination (`region-tab-active-*`), a destination list
  with two sources (`region-tab-source`), a screen without exactly one content
  band (`region-body-missing` / `-many` / `-escaped`), nav SLOT anatomy
  (≤ 3 actions, one-line title, back on a push), tab bar 3–5 and labelled, a
  horizontal tab bar on a cover, px tied to one device, a governed class under
  the touch floor, an `off` switch with no reason. The same rules run over
  `project/*/components/*.html`, because chrome content lives in components too.
* `audit:regions` — from the real layout in Chrome: the two OS bands exist once
  each and sit outside `.viewport`, `.device` paints what `.screen` paints,
  exactly one scroller with the bands outside it, the bands are in the right
  order around the content (`.region-order`), `.body-fixed` that fits, every
  interactive rect is ≥ 44 × 44, a folded split is 50/50 with nothing on the
  crease.

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
