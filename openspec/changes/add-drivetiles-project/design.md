# Design

## Context

See proposal.md — Why. The repo already has one builtin project (`moodtracker`) that demonstrates the full path: `project/<id>/tokens.css` → registered in `BUILTIN_PROJECTS` → screens in `manifest.ts` → board reconcile places them → lint/export/panel all key off the project id. DriveTiles brings a finished external spec (`docs/carplay-widget-mobile-ios-spec/`: 16 screens, `08-design-tokens.json`, components, flows) that must be converted into that same shape without touching the extractor subset or the board schema.

Constraints that shape the approach:

- `npm run new-screen` refuses a `--project` id that is not in `src/projects/builtin.ts`.
- Project tokens reach three consumers through **hardcoded `?raw` maps**: `src/tokens/tokens.ts`, `src/extractor/assets.ts` (board iframes), and a vitest mock in `src/tokens/tokens.test.ts`; the exporter reads `project/<id>/tokens.css` off disk from the manifest instead.
- The authoring contract (`docs/screen-authoring.md`) is fixed: token-only values, flex-only layout, named symbols, `.art` images.
- Board layout/edges/trash are localStorage runtime state, never repo files.

## Goals / Non-Goals

**Goals:**

- A `drivetiles` project whose token table, panel, export, and gates behave exactly like moodtracker's.
- All 16 spec screens S01–S16 authored, registered, visually verified, gate-clean.
- Repeated fragments extracted to components; every glyph/artwork nameable for SwiftUI.
- Deviations from the source documents declared in the final report.

**Non-Goals:**

- SwiftUI/Xcode implementation — the deliverable is screens + specs, the SwiftUI is derived later from the panel.
- Committing board positions/edges (runtime state; users arrange or use Xuất/Nhập).
- Rendering every alternate state in `11-state-matrix.md` (cold start, denied permissions, offline…) as separate board screens — each S01–S16 ships its primary state; state variants belong to the product spec handoff, not the board.
- V1/V2 features beyond the 16 screens (Live Drive UI, template packs, cloud sync).
- Changes to moodtracker, the extractor subset, or board schema.

## Decisions

**1. Builtin project, not a dashboard custom project.**
Custom projects (`custom: true`, localStorage) resolve no `tokens.css`, are invisible to `new-screen`, and fall outside the per-project lint ownership map. *Alternative rejected:* custom board would need the same wiring anyway, minus commit-ability.

**2. Project id `drivetiles`; screen ids mirror the spec numbers.**
`s01-splash`, `s02-welcome`, `s03-capabilities`, `s04-compat`, `s05-permissions`, `s06-home`, `s07-gallery`, `s08-template-detail`, `s09-editor`, `s10-content`, `s11-appearance`, `s12-layout`, `s13-preview`, `s14-my-widgets`, `s15-setup-guide`, `s16-settings`. The S-number prefix keeps the id unique against moodtracker and traceable to `04-screen-specs.md`. Titles read as the spec titles ("S06 · Home", …).

**3. Tokens: JSON → three-block CSS, dark palette derived.**
`08-design-tokens.json` ships one palette plus semantic references and no dark block. The project file will be hand-translated: light colors from the primitive+semantic layers (`--bg: #F7F8FA`, `--accent: #2F6BFF`, …), scales copied verbatim (spacing 4-grid, radii, type ramp incl. `carPlayPrimary/Secondary`, component metrics). The dark block is **derived** by role-flipping (background→ink, surface→elevated dark surfaces, text→light inks, accent kept with a lightened variant), because the source document defines none — this derivation is a declared deviation. A `dt-*` component vocabulary (`.dt-tabbar`, `.dt-widget-frame`, `.dt-chip-status`, …) is defined in the same file, mirroring how moodtracker owns `mt-*`.

**4. Wire the two `?raw` maps + the test mock in the same task as the tokens file.**
Adding `import drivetilesCss from '../../project/drivetiles/tokens.css?raw'` and a `drivetiles:` entry to both `PROJECT_CSS` maps; add the matching `vi.mock` in `tokens.test.ts`. Order matters: create `tokens.css` first so the import never points at a missing file (Vite fails hard).

**5. Author screens with the standard loop, batched by recipe archetype.**
Onboarding recipe: S02–S04 (+S01 splash as a special case: logo, mark, loading ring, no CTA). S05 permissions rows. Dashboard: S06. List recipe: S07 gallery grid (2-col via nested rows, no CSS grid), S14 widget rows, S16 settings groups. Editor family: S09 canvas + S10 content + S11 appearance + S12 layout (shared canvas/inspector vocabulary, inline per screen). S08 template detail (modal destination, stacked screen). S13 preview matrix with device tabs. S15 checklist. Each screen: scaffold → fill fully at once (never leave a registered screen empty) → panel lint → export → look → ≤3 repair rounds.

**6. Components only for byte-identical cross-screen fragments; house-precedent inline otherwise.**
Components are static (no props), so the only fragments that survive byte-identical across screens are single-glyph buttons: `dt-back` (chevron.left, editor/detail/preview/setup navbars) and `dt-chev` (chevron.right, list-row disclosures). Everything else varies per screen and stays inline raw: the 4-tab bar (active tab differs — moodtracker duplicates its tabbar raw in all 3 screens, same precedent), the CarPlay preview frame (content differs), checklist/permission/template rows (copy differs), status chip (state differs). Registered in `src/components/manifest.ts` + `npm run components:sync`. *Alternative rejected:* a `dt-tabbar` with wrapper-class active variants — novel pattern, no house precedent; raw duplication with correct active tab matches moodtracker exactly.

**7. Assets: audit first, extend `SYMBOLS` once.**
Diffed the needed symbol list against existing entries: 26 gaps, all added in one batch — `gear`, `car`, `location`, `photo`, `cloud.sun`, `text.quote`, `hourglass`, `timer`, `ruler`, `eye`, `list.bullet`, `textformat`, `paintbrush`, `square.grid.2x2`, `circle.lefthalf.filled`, `crop`, `text.alignleft/center/right`, `hand.raised`, `speaker.wave.2`, `arrow.triangle.2.circlepath`, `questionmark.circle`, `lock` (24 new SVG files; `slider.horizontal.3`, `calendar`, `chevron.*`, `house`, `plus`, `folder` already present). `npm run icons` run once → 72 glyphs. Artwork (`dt-mark`, `dt-hero`, `dt-cap-time/photo/trip`, `dt-setup`) drawn new under `public/images/` following house drawing conventions (300×300 viewBox, round caps, commented geometry) but with DriveTiles' own blue-tile motif — the docs carry text descriptions only, no reference images. Declared as stand-in artwork in the final report.

**8. Board display needs zero code.**
`reconciledNodes` in `src/board/BoardView.tsx` already places every registered project screen that is missing from the saved layout. Opening the project after registration satisfies "hiện toàn bộ màn hình lên board". Users can add flow edges manually or via export/import; committing a layout is out of scope (decision 0/non-goals).

**9. Verification gate per screen and for the change.**
Per screen: panel clean + `npm run export -- --screen <id>` + open the PNG. Per change: `npm run gate`, `npm run export -- --project drivetiles`, browser pass on `http://localhost:5273` (dashboard card, board render, token table, Sáng/Tối, panel Copy JSON).

## Risks / Trade-offs

- [Derived dark palette diverges from source doc] → Derivation rules documented in the tokens file header; declared as deviation; light mode is the source of truth for handoff.
- [16 screens × repair rounds is the bulk of the work] → Batch by archetype; components first so tabbar/preview-frame are solved once; bound repair to ~3 rounds/screen, report unresolved items rather than declaring false done.
- [New symbols missing at author time break glyphs silently (`unmappedSymbol`)] → Symbol audit (decision 7) happens **before** screen filling, not after.
- [`.body` scroll vs intended 844 heights on dense screens (S09 editor, S16 settings)] → Measure via export output, not by eye; content-driven height >844 is acceptable when the screen is genuinely long (S14/S16), and will be noted.
- [Vitest mock forgotten → red gate late] → Tokens wiring task (4) is atomic: file + both maps + mock + `npm run gate` before any screen work.
- [Static components tempt copy-paste drift] → `lint:components` warns on unused and errors on missing; run it inside every gate pass.
