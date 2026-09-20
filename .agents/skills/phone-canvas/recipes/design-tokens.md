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
  /* every color above, redefined for dark — no exceptions */
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

Three blocks, in that order: light colors, dark colors, scales. A color with
no dark entry silently falls back to its light value — that is a bug, not a
default. Scales have no mode and are never duplicated in the dark block.

## Naming

- Surfaces and text first: `--bg`, `--bg-grouped`, `--label`, `--accent`.
  Screens should only ever name these.
- Palette after: `--sage`, `--ember-soft`, `--mood-1`… Raw material the
  semantic layer is built from, not screen vocabulary.
- New token: add light + dark + (if sized) nothing — sizes are modeless.
  One line per mode, alphabetical inside its group, same order in both blocks
  so a missing dark value is visible at a glance.

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
2. Never edit `src/screens/tokens.css` for an app color — that file is shared
   fallback (spacing, type, iOS system colors), not your system.
3. The token list is flat. No `--p-` primitive tier, no aliases of aliases;
   the file is short enough to read whole.
4. Copy is plain text. No glyphs in names, values, or feedback strings.
