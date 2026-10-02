# Watch — one face, one idea, no scroll

This is a **pointer, not a copy**. The numbers live in
`openspec/specs/screen-regions` (Tham chiếu vùng Watch) and the sizes in
`src/frame/devices.ts` (`watch-45` = 45mm · 198×242 pt, the single
reference). If they disagree with this file, they win.

## The one rule

One face = one idea, glanceable. No scrolling, no text entry, no tab bar:
a top bar, one hero metric, one bottom-bar action. Watch chrome is
**author-owned** — the static edge check stays silent on `form: watch` by
design, and the measured audit still guards 44 pt targets and overflow.

## Scaffolding

```bash
npm run screen -- add --project <id> --name <name> --title "..." --device watch-45
```

`--device watch-45` records `deviceId` in the `<!-- pc -->` header and picks
the watch template (top bar + metric + action). A second size is added only
when a face proves the reference insufficient — one reference keeps the
export/audit matrix small, mirroring what `reference` 390 does for phone.

## Shape

```html
<!-- pc {"title":"...","deviceId":"watch-45"} -->
<div class="screen" style="background-color: var(--bg); padding: var(--s3) var(--s4); gap: var(--s1)">
  <div class="row" style="justify-content: space-between; align-items: center">
    <span class="t-footnote t-secondary">9:41</span>
    <span class="t-footnote t-secondary">…context…</span>
  </div>
  <div class="col" style="flex: 1 1 auto; min-height: 0; gap: 0; align-items: center; justify-content: center">
    <div class="t-large">…one value…</div>
    <div class="t-subhead t-secondary">…its unit…</div>
  </div>
  <button class="btn btn-primary btn-block">…the one action…</button>
</div>
```

- Lề ngang 16 pt (`--s4`) vì mép cong ăn nội dung; lề dọc 12 pt (`--s3`).
- The action fills the bottom bar at full width, ≥ 44 pt tall.
- Everything must fit 242 pt: nothing scrolls, so an overflowing face is a
  content bug the audit reports, not a hidden scrollbar.

## What the gate checks

- Static tier skips the undeclared-region edge check on `form: watch`;
  subset, tokens and components still apply.
- Measured tier: every interactive rect ≥ 44 × 44, zero scrollers allowed,
  no overflow. `export -- --device watch-45` renders at 198 pt.
