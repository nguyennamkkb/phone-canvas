# Proposal

## Why

The repo ships a complete product & design specification for **DriveTiles — CarPlay Widget Studio** at `docs/carplay-widget-mobile-ios-spec/` (16 screens, design tokens, components, flows), but the board can only present `moodtracker`. The documentation is unusable as a handoff artefact until its screens exist as real, measurable HTML on a board project.

## What Changes

- Register a new builtin project **`drivetiles`** ("DriveTiles") so it appears on the dashboard alongside `moodtracker`.
- Add `project/drivetiles/tokens.css` — the project's design system, translated from `docs/carplay-widget-mobile-ios-spec/08-design-tokens.json` (light + dark, three-block format), plus a DriveTiles component vocabulary.
- Author all **16 screens S01–S16** from `04-screen-specs.md` + `07-wireframes.md` as contract-valid HTML under `project/drivetiles/`, each wired through `new-screen` (manifest → generated → builtin `screenIds`).
- Extract byte-identical cross-screen fragments (`dt-back`, `dt-chev` glyph buttons) into `project/drivetiles/components/` entries; screen-varying structures (tab bar with per-screen active tab, preview frame, checklist/permission rows, status chip, template cards) stay inline raw per house precedent (moodtracker duplicates its tabbar the same way).
- Add any missing SF Symbol glyphs (`public/icons/` + `SYMBOLS`) and full-colour artwork (`public/images/`, house style) the screens need.
- Wire the new project's `?raw` tokens import into `src/tokens/tokens.ts` and `src/extractor/assets.ts` (and the matching vitest mock) so the token table, spec panel, and exporter resolve DriveTiles tokens.
- Opening the DriveTiles board shows every registered screen (board reconcile already auto-places project screens).

## Capabilities

### New Capabilities
- `drivetiles`: presence of the DriveTiles project on the board — its design-token system, the 16 authored screens (S01–S16), reusable components, assets, and the gates each screen must pass before handoff.

### Modified Capabilities
<!-- none — no existing spec-level requirements change -->

## Impact

- **Files added:** `project/drivetiles/*.html` (16), `project/drivetiles/tokens.css`, `project/drivetiles/components/*.html` (2), `public/images/dt-*.svg` (6), `public/icons/*.svg` (24 new glyphs).
- **Files edited:** `src/projects/builtin.ts` (new ProjectDef), `src/screens/manifest.ts` + `generated.ts` (via scripts), `src/components/manifest.ts` + generated registry, `src/tokens/tokens.ts`, `src/extractor/assets.ts`, `src/tokens/tokens.test.ts` (mock), `scripts/icons.ts` (SYMBOLS), `src/screens/icon-set.css` (generated).
- **Systems:** dashboard (new card), board (new project, auto-reconcile of 16 nodes), token table + SwiftUI token export, spec panel, `npm run export --project drivetiles`, all lint gates (`lint:tokens`, `lint:subset`, `lint:components`).
- **Not affected:** moodtracker project, board schema, extractor subset rules.
