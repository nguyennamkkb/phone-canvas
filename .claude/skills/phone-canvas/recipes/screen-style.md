# Per-screen `<style>` block

One-off styling a screen carries itself, instead of appending everything to the
project `tokens.css`.

## Rule

- **One `<style>` block**, on the first lines of the screen file, right after
  the `<!-- pc {...} -->` header comment.
- **Selectors prefixed with the screen id**: `.today-hero`, `.today-hero .row`
  — never bare names (`.card`) that could collide with other screens or tokens.
- **Never target shell chrome**: `.device`, `.statusbar`, `.home-indicator`,
  `.viewport`, `.region-nav`, `.region-tabs`, `.shell-nav-btn`, `.nav-slot-*`,
  `.sb-*` — the subset lint errors on these (`lint:subset`, guard shared with
  `lint:tokens` via `scripts/screen-style.ts`).
- Custom properties defined in the block (`--today-gap: …`) count as defined
  for `lint:tokens` / `lint:subset` — but the block does **not** exempt you
  from the subset: `display:grid`, `transform`, `filter` … inside the block
  still error, same as markup.
- Values still prefer tokens: use `var(--s2)`, `var(--label)` inside the block.
  Hardcoded colors warn, same as markup.
- Components (`components/*.html`) may carry a block under the same rules; a
  var the component body uses must still be listed in its `@anatomy tokens=`
  header (`lint:components`) — the header is the manifest, the block is the
  definition.

## Shape

```html
<!-- pc {"title":"Lịch sử"} -->
<style>
.today-hero { --today-gap: var(--s2); }
.today-hero .row { gap: var(--today-gap); }
</style>
<div class="screen" data-tab-active="diary">
  <div class="today-hero">…</div>
</div>
```

Why this works: each screen renders as its own document (`composeScreenDoc`),
so the block is scoped to that screen for free; the SwiftUI spec reads resolved
computed styles, never class names — nothing is dropped at handoff.
