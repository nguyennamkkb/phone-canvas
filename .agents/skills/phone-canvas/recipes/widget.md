# Widget — glance only: no scroll, no input, no bands

This is a **pointer, not a copy**. The numbers live in `docs/screen-regions.md`
(Tham chiếu vùng Widget) and the sizes in `src/frame/devices.ts`
(`widget-small` 169×169, `widget-medium` 360×169). If they disagree with this
file, they win.

## The one rule

One widget = one idea, readable at a glance. Content must fit — an overflowing
widget is a content bug the audit reports, never a hidden scrollbar. There is
deliberately no `.body` to hide behind, no slots, no tabs: widget chrome is
**author-owned**, and the static edge check stays silent on `form: widget` by
design.

## Scaffolding

```bash
npm run screen -- add --project <id> --name <name> --title "..." --device widget-small
npm run screen -- add --project <id> --name <name> --title "..." --device widget-medium
```

`--device` records `deviceId` in the `<!-- pc -->` header and picks the widget
template (glance stack). A family is added only when a widget proves the two
insufficient — small first, like `reference` 390 does for phone.

## Shape

```html
<!-- pc {"title":"...","deviceId":"widget-small"} -->
<div class="screen" style="background-color: var(--bg); padding: var(--s3); gap: var(--s1); justify-content: center">
  <span class="t-footnote t-secondary">…eyebrow…</span>
  <div class="t-title2">…one value…</div>
  <div class="t-subhead t-secondary">…one sub-line…</div>
</div>
```

- Main text ≥ medium weight; body ≥ 11 pt; margin concentric with the
  container's own radius.
- Dynamic Type Large → AX5 must not break the fit — short strings only.
- A project that draws widgets needs its own `tokens.css` layer (the global
  set does not define product colors like `--cta`); the gate names the
  missing token with `file:line`.

## What the gate checks

- Static tier skips the undeclared-region edge check on `form: widget`;
  subset, tokens and components still apply.
- Measured tier: every interactive rect ≥ 44 × 44 (prefer no controls at
  all — widgets open the app, they do not take input), zero scrollers
  allowed, no overflow. `export -- --device widget-small|widget-medium`
  renders at native size.
