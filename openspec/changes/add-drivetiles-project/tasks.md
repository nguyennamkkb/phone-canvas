# Tasks

## 1. Project registration + design tokens

- [x] 1.1 Add builtin project `{ id: 'drivetiles', title: 'DriveTiles', description, screenIds: [] }` to `src/projects/builtin.ts` and verify `openspec`/typecheck unaffected (`npm run typecheck` green)
- [x] 1.2 Create `project/drivetiles/tokens.css` from `08-design-tokens.json`: light block (semantic surfaces/text/accent/status + palette), derived dark block (`:root[data-theme='dark']`, every color redefined), mode-invariant scales (spacing, radii, type incl. carPlay sizes, component metrics) — verify three-block order matches `recipes/design-tokens.md`
- [x] 1.3 Add the `dt-*` component-vocabulary classes to the same tokens file (tabbar, widget frame, status chip, section title, CTA) and verify no literal values (`grep -E '[0-9]+px|#[0-9a-f]{3,6}'` shows only token definitions)
- [x] 1.4 Wire `?raw` import + `drivetiles` entry into `PROJECT_CSS` in `src/tokens/tokens.ts` and `src/extractor/assets.ts`, add matching `vi.mock` in `src/tokens/tokens.test.ts`, then verify `npm run typecheck && npm test` green
- [x] 1.5 Verify the dashboard shows a DriveTiles card with 0 screens (`npm run dev` → http://localhost:5273)

## 2. Assets: symbols + artwork

- [x] 2.1 Audit needed SF Symbols for S01–S16 against `SYMBOLS` in `scripts/icons.ts` — 26 gaps found and recorded in design.md decision 7 (`gear`, `car`, `location`, `photo`, `cloud.sun`, `text.quote`, `hourglass`, `timer`, `ruler`, `eye`, `list.bullet`, `textformat`, `paintbrush`, `square.grid.2x2`, `circle.lefthalf.filled`, `crop`, `text.alignleft/center/right`, `hand.raised`, `speaker.wave.2`, `arrow.triangle.2.circlepath`, `questionmark.circle`, `lock`; `slider.horizontal.3`, `calendar`, `house`, `plus`, `folder`, `chevron.*` already present)
- [x] 2.2 Add every missing SVG to `public/icons/` + one `SYMBOLS` line each, run `npm run icons`, and verify `src/screens/icon-set.css` contains each new `data-symbol` rule
- [x] 2.3 Draw DriveTiles artwork under `public/images/` per spec descriptions (`dt-mark` brand mark for S01/S02, `dt-hero` car-display + widget tiles for S02, `dt-cap-time/photo/trip` capability illustrations for S03, `dt-setup` phone→car visual for S15) following house drawing conventions — render verification rides with each screen's export PNG inspection (tasks 5.x/6.3), which shows every artwork in situ

## 3. Scaffold the 16 screens

- [ ] 3.1 Run `npm run new-screen` for all 16 ids (`s01-splash`, `s02-welcome`, `s03-capabilities`, `s04-compat`, `s05-permissions`, `s06-home`, `s07-gallery`, `s08-template-detail`, `s09-editor`, `s10-content`, `s11-appearance`, `s12-layout`, `s13-preview`, `s14-my-widgets`, `s15-setup-guide`, `s16-settings`) with spec titles, and verify manifest lists 16 drivetiles entries, `generated.ts` regenerated, `builtin.ts screenIds` has 16 ids, `npm run lint` green
- [ ] 3.2 Open the DriveTiles board and verify all 16 scaffold nodes auto-place via reconcile with no console errors

## 4. Shared components

- [ ] 4.1 Create `project/drivetiles/components/dt-back.html` (chevron.left glyph button for editor/detail/preview/setup navbars) + `dt-chev.html` (chevron.right disclosure glyph for list rows) with one manifest entry each, `npm run components:sync`, and verify `lint:components` green and the Components dock lists them
- [ ] 4.2 Reference both components from the first screens that need them and verify the expanded markup renders — tab bar (per-screen active tab), preview frame, checklist/permission/template rows stay inline raw per house precedent (design.md decision 6)
- [ ] 4.3 Final sweep: verify `lint:components` reports no missing-id/cycle errors and no unused-component warnings for shipped components

## 5. Author the screens (per skill loop: compose → fill → lint → export → look → repair)

- [ ] 5.1 Author S01 splash (logo, product mark, loading ring; no CTA) and verify panel clean + exported PNG inspected at intended height
- [ ] 5.2 Author S02 welcome (hero art, "Your drive. Your glance.", CTA `Create my first widget`, secondary `Maybe later`) per onboarding recipe and verify panel clean + PNG inspected
- [ ] 5.3 Author S03 capabilities (3 cards: Time/Weather, Photo/Quote, Trip/Location; CTA `Continue`) and verify panel clean + PNG inspected
- [ ] 5.4 Author S04 CarPlay compatibility (4 explanation sections; CTA `Check setup`) and verify panel clean + PNG inspected
- [ ] 5.5 Author S05 permissions (3 rows: Location/Photos/Notifications with why + state + CTA; no permission wall) and verify panel clean + PNG inspected
- [ ] 5.6 Author S06 home/dashboard (greeting, status chip, current-widget hero with Edit/Preview/Use as default, `+ New Widget`, recent templates row, tabbar) per dashboard recipe and verify panel clean + PNG inspected
- [ ] 5.7 Author S07 gallery (search field, category chips, 2-column template cards with badges, filters) and verify panel clean + PNG inspected
- [ ] 5.8 Author S08 template detail (large preview, name/description, supported data, update behavior, CarPlay-ready badge, Customize/Use template CTAs, favorite/share) and verify panel clean + PNG inspected
- [ ] 5.9 Author S09 editor canvas (top bar Back/name/Save, CarPlay-shaped preview with grid-safe area, toolbar Content/Typography/Appearance/Layout/Preview, inspector) and verify panel clean + PNG inspected
- [ ] 5.10 Author S10 content editor (data-block rows Time…Location with on/off, source, format, refresh, fallback) and verify panel clean + PNG inspected
- [ ] 5.11 Author S11 appearance editor (theme/accent/emphasis/font/radius/icon/crop/contrast controls + 6 presets) and verify panel clean + PNG inspected
- [ ] 5.12 Author S12 layout editor (alignment, metric placement, spacing, text scale, safe-area preview + validation guidance rows) and verify panel clean + PNG inspected
- [ ] 5.13 Author S13 preview/device matrix (iPhone/CarPlay/StandBy/Lock Screen tabs, black-context CarPlay preview, checklist, Save / Back to editor) and verify panel clean + PNG inspected
- [ ] 5.14 Author S14 my-widgets (filter chips All/Favorites/Recent/Templates, item rows with preview/name/edited/default/favorite, actions) per list recipe and verify panel clean + PNG inspected
- [ ] 5.15 Author S15 setup guide (5-step checklist, Open CarPlay Settings, troubleshooting) and verify panel clean + PNG inspected
- [ ] 5.16 Author S16 settings/diagnostics (section groups per `03-information-architecture.md`, diagnostics panel rows) and verify panel clean + PNG inspected

## 6. Verification gates

- [ ] 6.1 Run `npm run gate` and verify typecheck + lint:tokens + lint:subset + lint:components + vitest all pass with zero errors
- [ ] 6.2 Run `npm run export -- --project drivetiles` and verify 16 PNGs exist; record each pixel height and confirm every height is intended (844 or explained content-driven)
- [ ] 6.3 Open every exported PNG and compare against `04-screen-specs.md`/`07-wireframes.md`; run ≤3 repair rounds on the highest-severity visual problem each round, re-exporting after fixes
- [ ] 6.4 In the browser, select each of the 16 screens on the board and verify the panel shows zero red `Block` rows, zero `unmappedSymbol`, zero `externalMask`, and token-named colors
- [ ] 6.5 Toggle Sáng/Tối on the DriveTiles board and verify every iframe flips with no unstyled screen
- [ ] 6.6 Verify `Copy JSON` on S06's primary action (`+ New Widget`) yields a spec from which the SwiftUI button is directly derivable
