# Recipe — list / browse / settings / search results

**Use for:** an inbox, a feed, a settings screen, search results, any screen that
is rows under a header.

## Structure

```
.screen
├── data-slot="back|title|right"   shell builds .region-nav from these
├── .body                          SCROLLS — the ONE scroll region
│   └── .list
│       └── .list-row              × N
│           ├── .avatar / .chip-icon
│           ├── .grow.col          title + subtitle
│           └── trailing text / icon
└── data-tab-active on .screen     which destination is open
```

`.bottom-cta` (optional, in-flow action bar) sits inside the content band.

## Classes

`.nav-title` · `.icon-btn` · `.body` · `.body-fixed` · `.list` · `.list-row` ·
`.avatar` · `.chip-icon` · `.grow` · `.spacer` · `.tab` · `.bottom-cta`

## Skeleton

```html
<div class="screen">
  <span data-slot="title" class="nav-title">Inbox</span>
  <button data-slot="right" class="icon-btn" aria-label="Search">
    <span class="icon icon-sm" data-symbol="magnifyingglass"></span>
  </button>

  <div class="body">
    <div class="list">
      <div class="list-row">
        <span class="avatar bg-violet-tint">M</span>
        <div class="grow col" style="gap: 2px">
          <div class="t-headline">Title</div>
          <div class="t-subhead t-secondary">Subtitle</div>
        </div>
        <div class="t-footnote t-secondary">09:12</div>
      </div>
      <!-- more rows -->
    </div>
  </div>

  <!-- the destination list is the project's: components/app-tabs.html -->
  <!-- @component app-tabs -->
</div>
  <!-- more tabs -->
</div>
```

## Gotchas

- **`.body` is the scroll region** and it is the *only* thing that scrolls. The
  nav and tab bands are built by the shell, outside `.body`.
- **The frame is the device height; the list scrolls inside it.** Do not cut
  rows to fit 844 — let `.body` scroll. `.body-fixed` is only for a page that
  actually fits; one that overflows fails `audit:regions`.
- **Variable content, fixed geometry.** Titles up to two lines, times always the
  same width. If a row's trailing element changes width, the layout breathes in
  a way a real list never does.
- **Give `.grow` a `min-width: 0`.** It already has one — do not remove it, or a
  long title will push the trailing element off the row.
