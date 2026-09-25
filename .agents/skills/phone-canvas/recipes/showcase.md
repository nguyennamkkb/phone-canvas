# Recipe — showcase screen

**Use for:** a free-style catalogue screen that exhibits a project's design
vocabulary — colors, type, buttons, chips, rows, meters — each item naming its
token or class so the panel reads back exactly what an author would type.
Reference implementation: `project/caloai/c31-showcase.html`.

## Structure

```
.screen
├── .navbar                     title + one about action
└── .body                        gap s4, one section per vocabulary group
    ├── section                  .col, gap s3, padded s4 sides
    │   ├── .t-headline          section name ("Màu · Core")
    │   └── rows                 .list-row / .row of samples
    ├── …more sections…
    └── .spacer
└── .tabbar-light                optional — mirrors the app's persistent nav
```

Sections in order: **colors** (core rows, then tint chips) → **type** (one
sample per `.t-*` style, biggest first) → **buttons & chips** (primary CTA +
sample chips) → **rows & measures** (avatar row, macro + `.meter`,
`.searchbar`, `.dots`).

## Rules

1. **Name, don't print, values.** Every swatch/row shows the token or class
   name (`--accent`, `.btn-primary`) — never a literal hex in text (the token
   lint warns on `#xxx` anywhere in the file, and the panel reports the hex).
2. **Colors via style, tokens only.** `<span class="swatch" style="background:
   var(--accent)">` — `var(--*)` or nothing.
3. **Symbols must already be mapped.** Only `data-symbol` values used elsewhere
   in the project (a new glyph means `scripts/icons.ts` + `npm run icons`
   first — zero `unmappedSymbol` warnings at the end).
4. **One idea per section.** A showcase is read top to bottom; if a section
   needs a subheading, it is two sections.
5. **No tabbar on wide screens.** Phone keeps `.tabbar-light`; tablet/foldable
   variants drop it (see `screen-background.md` device notes).

## Skeleton

```html
<div class="screen">
  <header class="navbar">
    <span class="nav-title">Showcase</span>
    <button class="icon-btn" aria-label="About this catalogue"><span class="icon icon-sm" data-symbol="sparkles"></span></button>
  </header>
  <div class="body" style="gap: var(--s4)">
    <div class="col" style="gap: var(--s3); padding: 0 var(--s4)">
      <span class="t-headline">Màu · Core</span>
      <div class="list-row">
        <span class="swatch" style="background: var(--accent)"></span>
        <span class="t-subhead grow">--accent</span>
        <span class="t-footnote t-secondary">links · active</span>
      </div>
    </div>
    <div class="spacer"></div>
  </div>
</div>
```

## Verify

`npm run gate` (zero red, zero new warns) → `npm run export -- --screen
<id>` → LOOK at the PNG: icons all render, no wrapped numbers, sections
evenly spaced. A showcase with a missing glyph or a wrapped kcal is not done.
