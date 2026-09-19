# Recipe — dashboard / score / stats / anything with a chart

**Use for:** a score, an overview, a stats page, a progress screen, anything that
shows a reading plus supporting cards.

## Structure

```
.screen
└── .body-fixed
    ├── .row                      identity row: avatar / back, and an overflow button
    ├── .row                      title + a range pill
    ├── .panel                    the chart
    │   ├── .chart                bars as real elements
    │   └── .chart-labels         same slot geometry as .chart
    ├── .row                      feature cards
    ├── .row-card                 a single summary row
    ├── .spacer
    └── .tabbar-light             or .tabbar-dark
```

## Two ways to draw a reading

**Bars** — seven real elements with real heights, so the spec reads the chart
instead of showing one picture of a chart:

```html
<div class="chart">
  <div class="chart-col"><div class="bar" style="height: 88%"></div></div>
  <div class="chart-col">
    <div class="tooltip">4 hours</div>
    <div class="bar is-peak" style="height: 74%"></div>
  </div>
  <!-- … -->
</div>
<div class="chart-labels">
  <div class="chart-label">Mon</div>
  <div class="chart-label is-on">Fri</div>
  <!-- … -->
</div>
```

**A ring** — one asset for the arcs, plus one `.badge` per segment placed by
coordinate in a `.ring`:

```html
<div class="ring">
  <img class="ring-arcs" src="/images/ring.svg" width="256" height="256" alt="…" />
  <div class="col" style="align-items: center">…the reading…</div>
  <span class="badge bg-sun" style="left: 50%; top: 5.625%">
    <span class="icon icon-xs" data-symbol="shield.fill"></span>
  </span>
</div>
```

## Classes

`.panel` · `.chart` · `.chart-col` · `.bar` / `.bar.is-peak` · `.tooltip` ·
`.chart-labels` / `.chart-label` · `.ring` / `.ring-arcs` / `.badge` ·
`.feature-card` · `.row-card` · `.chip-icon` · `.meter` / `.meter-seg` ·
`.tabbar-light` / `.tab-item.is-on`

## Gotchas

- **`min-width: 0` on equal-width flex items.** A column holding a tooltip
  refuses to shrink below it and widens, squeezing the rest. This is the single
  most common chart bug here — see failure mode 4.
- **Labels belong to the same slot geometry as the bars.** `.chart-label` is
  `flex: 1 1 0` for exactly that reason; a `flex: 1 1 auto` label sizes to its
  text and drifts off its column.
- **Bar heights are percentages of the column, not of the chart.** Keep the
  column's `height: 100%` or the percentages resolve against nothing.
- **A dashed reading is a `.meter` of real segments**, not a gradient. Ten
  segments means the spec can report 8/10 rather than "some yellow".
- **Ring badge positions are precomputed.** `left`/`top` are percentages of the
  ring box, from an angle clockwise from twelve o'clock:
  `left = 50 + r·sin θ`, `top = 50 − r·cos θ`. Compute them; never eyeball them,
  and never centre with a transform.
- **Verify the reading is legible in the spec**, not just on screen. If a bar's
  section reads `1 picture`, the chart is not done.
