# Recipe — list / browse / settings / search results

**Use for:** an inbox, a feed, a settings screen, search results, any screen that
is rows under a header.

## Structure

```
.screen
└── .body-fixed
    ├── .navbar                    title left, actions right
    ├── .body                      SCROLLS — flex: 1, overflow-y: auto
    │   └── .list
    │       └── .list-row          × N
    │           ├── .avatar / .chip-icon
    │           ├── .grow.col      title + subtitle
    │           └── trailing text / icon
    ├── .bottom-cta                optional, sticky
    └── .tabbar                    optional
```

## Classes

`.navbar` · `.nav-title` · `.icon-btn` · `.body` · `.list` · `.list-row` ·
`.avatar` · `.chip-icon` · `.grow` · `.spacer` · `.tabbar` + `.tab` ·
`.bottom-cta`

## Skeleton

```html
<div class="screen">
  <header class="navbar">
    <div class="nav-title">Inbox</div>
    <button class="icon-btn" aria-label="Search">
      <span class="icon icon-sm" data-symbol="magnifyingglass"></span>
    </button>
  </header>

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

  <nav class="tabbar">
    <div class="tab is-active">
      <span class="icon" data-symbol="book"></span>
      <span>Entries</span>
    </div>
    <!-- more tabs -->
  </nav>
</div>
```

## Gotchas

- **`.body` is the scroll region** and it is the *only* thing that scrolls. The
  navbar and the tab bar are siblings of it, not children.
- **A long list makes a long screen.** That is correct — the frame grows. Do not
  cut rows to force 844.
- **Variable content, fixed geometry.** Titles up to two lines, times always the
  same width. If a row's trailing element changes width, the layout breathes in
  a way a real list never does.
- **Give `.grow` a `min-width: 0`.** It already has one — do not remove it, or a
  long title will push the trailing element off the row.
