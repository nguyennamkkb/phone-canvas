# Recipe — bottom sheet

**Use for:** a modal that slides up over the current screen — an action menu, a
detail preview, a short form, a filter panel.

## Structure

```
.screen                            background = the SHEET's colour
└── .body-fixed
    ├── .scrim                     fixed, full device, dims everything behind
    ├── .spacer                    pushes the sheet to the floor
    └── .sheet-panel
        ├── .row                   the grabber, centred by its own row
        ├── .sheet-head            title + .close-btn
        ├── …content…
        └── .cta-bar               primary action, or .btn Cancel
```

## Classes

`.scrim` · `.sheet-panel` · `.grabber` · `.sheet-head` · `.close-btn` ·
`.action-row` / `.is-danger` · `.text-field` · `.segmented-light` + `.seg` /
`.is-on` · `.chip` / `.is-active` · `.cta-bar` · `.btn-dark` · `.btn` ·
`.nav-round.is-hollow`

## Skeleton

```html
<div class="screen" style="background: var(--bg-elevated)">
  <div class="body-fixed">
    <div class="scrim"></div>
    <div class="spacer"></div>

    <div class="sheet-panel">
      <div class="row" style="justify-content: center">
        <i class="grabber"></i>
      </div>

      <div class="sheet-head">
        <div class="t-section">Entry options</div>
        <button class="close-btn" aria-label="Close">
          <span class="icon icon-xs" data-symbol="xmark"></span>
        </button>
      </div>

      <div class="col" style="gap: 0">
        <button class="action-row">
          <span class="icon icon-sm" data-symbol="pencil"></span>
          <span class="grow">Edit entry</span>
          <span class="icon icon-xs" data-symbol="chevron.right"
                style="color: var(--label-3)"></span>
        </button>
        <button class="action-row is-danger">
          <span class="icon icon-sm" data-symbol="trash"></span>
          <span class="grow">Delete</span>
        </button>
      </div>

      <button class="btn">Cancel</button>
    </div>
  </div>
</div>
```

## Gotchas

- **The screen's own background must match the sheet.** The shell ends the
  content band above the home indicator, so without this the band under the
  sheet reads as page background instead of the panel.
- **`.scrim` is `fixed`, not `absolute`.** The status bar and home indicator are
  siblings of the screen, so a layer inside the content band cannot reach them.
  A fixed layer resolves against the device viewport and dims the OS chrome the
  way a real sheet does.
- **`.sheet-panel` is `position: relative` for painting order**, not for
  positioning. The scrim is a positioned element; without this the panel would
  be painted under it.
- **Centre the grabber with a row, not a transform.** `transform` is invisible to
  the layout engine and the spec would report the wrong box.
- **Keep the status bar dark.** A 40% scrim over a light screen lands around
  `#999`; black chrome is ~5.3:1 there and white is ~1.8:1. `lightStatusBar` in
  the manifest is for genuinely dark screens, not for sheets.
- **Size follows content.** Action sheets are short, form sheets are tall. If a
  sheet lands on 844 by accident rather than by content, you probably padded it
  to fit rather than designing it.
- **A sheet is a screen too.** It gets the full loop: lint, export, look, hand
  off. The spec for an `.action-row` is as much a deliverable as any other row.
