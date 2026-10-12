# Design Tokens

Each project owns its design system in one file: `project/<id>/tokens.css`.
The board renders it as the token table (always visible, left of the screens);
the spec panel resolves colors back to token names; `npm run lint:tokens`
gates it. There is no other source of color.

## File format

```css
:root {
  /* surfaces + text first (semantic), palette after */
  --bg: #faf8f5;
  --accent: #7c9448;
  --sage-soft: #e3ead0;
  --mood-1: #d6543f;
}

:root[data-theme='dark'] {
  /* ONLY the tokens whose value actually changes in dark */
  --bg: #1e1712;
  --accent: #9db06c;
}

/* shared scales live here too (project-owned, never read global) */
:root {
  --s1: 4px; /* ... 4pt grid */
  --r-sm: 8px; /* ... */
  --t-body: 17px; /* ... */
}
```

Three blocks, in that order: light colors, dark colors, scales. **The base
block is the complete set; the dark block is a diff.** `:root[data-theme='dark']`
inherits everything from `:root`, so a token that does not change in dark must
not appear there at all — a dark declaration with the same value as its base is
copy-paste, and `lint:tokens` fails it (`dark-copy`). A token declared *only* in
dark is worse: light mode silently loses it, and that is `dark-orphan`. Scales
have no mode and never appear in the dark block.

So a color with no dark entry is the normal case, not a bug — it keeps its light
value, which is what a mode-neutral token should do. The lint that used to demand
a twin for every light token is gone (core-upgrade 5.1): it was the rule that
forced whole-block duplication.

## Naming

- Surfaces and text first: `--bg`, `--bg-grouped`, `--label`, `--accent`.
  Screens should only ever name these.
- Palette after: `--sage`, `--ember-soft`, `--mood-1`… Raw material the
  semantic layer is built from, not screen vocabulary.
- New token: one line in the base block, plus a dark override **only if the dark
  value differs**. Sizes are modeless. Keep the same order in both blocks so a
  real override is visible at a glance.

## Working on the board

- **See** — the token table sits left of the screens with light/dark swatches,
  spacing, radii, type. It reads the file; it is never edited directly.
- **Try** — click a swatch (color picker for the active Sáng/Tối mode) or type
  a size. This writes a *draft* (localStorage), previews instantly in every
  iframe, and marks the row. The file is untouched.
- **Keep** — `Copy CSS` on the table, paste into `project/<id>/tokens.css`
  (or hand the block to the agent). `Bỏ nháp` throws the draft away.
- **Audit** — each row says where it is used (`52 chỗ · 7 màn`). Zero means
  dead: delete it from the file. `Chưa định nghĩa` is always an error — a
  screen names something that does not exist and renders transparent.
- **Modes** — the Sáng/Tối switch flips the whole board. Check both before
  calling a token done.
- **Hand off** — the `SwiftUI` button copies a `Color` + `Spacing` extension
  generated from the project file. Regenerate after editing; never hand-edit.

## Lint

`npm run lint:tokens` (also inside `npm run lint`):

- **error** — `var(--x)` with no definition. The screen renders wrong and the
  author is not told. Fix the file, not the screen.
- **warn** — hardcoded `#fff` / `rgba(…)` in screen markup; a global-only
  color where the project should define its own alias.

## Hard rules

1. Screens name semantic tokens. Palette names in markup are a smell.
2. Never edit `src/screens/core.css` / `palettes.css` / `vocab.css` for an app color — those files are shared
   fallback (spacing, type, iOS system colors), not your system.
3. The token list is flat. No `--p-` primitive tier, no aliases of aliases;
   the file is short enough to read whole.
4. Copy is plain text. No glyphs in names, values, or feedback strings.
