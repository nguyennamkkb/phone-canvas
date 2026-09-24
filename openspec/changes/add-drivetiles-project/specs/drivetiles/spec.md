# Spec Delta

## Purpose

The DriveTiles project presents the CarPlay Widget Studio product spec (`docs/carplay-widget-mobile-ios-spec/`) as a first-class board project: a token-governed design system, all 16 screens authored as contract-valid HTML, reusable components and named assets — measurable to SwiftUI through the spec panel and exportable as PNGs.

## ADDED Requirements

### Requirement: DriveTiles is a registered project
The system SHALL list a builtin project with id `drivetiles` and title `DriveTiles` on the dashboard alongside existing projects, with a screen count equal to the number of registered DriveTiles screens.

#### Scenario: Dashboard shows the project
- **WHEN** the dashboard loads
- **THEN** a DriveTiles card is present and reports 16 screens once all screens are registered

#### Scenario: Board opens with every screen
- **WHEN** the DriveTiles project board is opened for the first time (no saved layout)
- **THEN** all 16 registered screens appear as phone nodes, placed automatically by board reconcile

#### Scenario: Screens added later appear on open
- **WHEN** a DriveTiles screen is registered after a board layout was saved
- **THEN** opening the board places the new screen without disturbing existing node positions or edges

### Requirement: DriveTiles owns a complete design-token system
The project SHALL define its design system in `project/drivetiles/tokens.css`, translated from `08-design-tokens.json`: light colors, dark colors (`:root[data-theme='dark']`, every color redefined), then mode-invariant scales (spacing, radii, typography, component metrics). Every color a DriveTiles screen names MUST be defined in this file or the shared global stylesheet.

#### Scenario: Token table resolves DriveTiles tokens
- **WHEN** the DriveTiles board is open and the token table is visible
- **THEN** the table lists the project's own tokens with light and dark values, and the Sáng/Tối switch flips every DriveTiles iframe

#### Scenario: Undefined token fails the gate
- **WHEN** a DriveTiles screen names `var(--x)` where `--x` is defined nowhere
- **THEN** `npm run lint:tokens` exits non-zero and reports the file and line

#### Scenario: Missing dark value is an authoring bug
- **WHEN** a color token exists in `:root` but not in the dark block
- **THEN** dark mode renders the light value (fallback) and the token file is corrected before completion — the completed system defines dark values for every color

#### Scenario: Spec panel names tokens
- **WHEN** an element on a DriveTiles screen is selected in the panel
- **THEN** its resolved colors are reported as token names, not raw hex

### Requirement: All sixteen screens are authored and registered
The project SHALL contain one HTML screen per spec screen S01–S16 (`04-screen-specs.md`), each authored within the screen-authoring contract (single `.screen` root, token-only values, `.icon` + `data-symbol` glyphs, `<img class="art">` artwork, no banned CSS), registered in the screen manifest, and listed in the project's `screenIds`.

#### Scenario: Every spec screen exists
- **WHEN** the manifest is read
- **THEN** 16 DriveTiles screen ids exist, one per S01–S16, each mapping to `project/drivetiles/<name>.html`

#### Scenario: Screens respect content and structure of their spec
- **WHEN** a DriveTiles screen is rendered
- **THEN** it shows the purpose, primary action, and content sections that `04-screen-specs.md` defines for its S-number (e.g. S06 shows greeting + setup-status chip + current-widget hero + `+ New Widget` + recent templates + tab bar)

#### Scenario: Screens are not height-clipped
- **WHEN** a screen's content is taller than the reference device
- **THEN** the frame grows to the content height; no content is hidden at 844pt

### Requirement: Every DriveTiles screen passes the handoff gates
Before the change is complete, each DriveTiles screen SHALL pass, with no red rows or warnings: the spec panel reports no `Block (out of subset)` nodes, no `unmappedSymbol`, and no `externalMask`; `npm run gate` is green.

#### Scenario: Clean panel per screen
- **WHEN** each of the 16 screens is selected on the board and its spec is read
- **THEN** the panel shows zero Block rows and zero unmapped/external-mask warnings

#### Scenario: Full gate green
- **WHEN** `npm run gate` runs
- **THEN** typecheck, `lint:tokens`, `lint:subset`, `lint:components`, and vitest all pass

### Requirement: Byte-identical cross-screen fragments are components
Markup that repeats byte-identically across two or more DriveTiles screens (single-glyph buttons `dt-back`, `dt-chev`) SHALL be extracted to `project/drivetiles/components/` with a manifest entry and included via `@component`, so `npm run lint:components` reports no errors and the catalog lists the project's components. Structures that vary per screen (tab bar active tab, preview-frame content, row copy, chip state) stay inline raw per house precedent.

#### Scenario: Shared fragments live in one place
- **WHEN** two DriveTiles screens contain the same byte-identical fragment
- **THEN** the fragment exists once as a component and both screens reference it by id

#### Scenario: Component gate clean
- **WHEN** `npm run lint:components` runs
- **THEN** there are no missing-id or cycle errors for DriveTiles components

### Requirement: Assets are nameable for SwiftUI
Every glyph on a DriveTiles screen SHALL be `<span class="icon" data-symbol="…">` with the symbol present in the generated icon set (added via `public/icons/` + `SYMBOLS` when missing); every illustration SHALL be `<img class="art">` with `width`, `height`, and `alt`. No inline `<svg>`, no emoji, no hand-written `--icon: url(…)`.

#### Scenario: New symbol wired once
- **WHEN** a screen needs a symbol not yet in the icon set
- **THEN** its SVG exists in `public/icons/`, one `SYMBOLS` entry maps it, and `npm run icons` regenerates the set

#### Scenario: Export renders assets
- **WHEN** `npm run export -- --project drivetiles` runs
- **THEN** all 16 PNGs are produced at intended dimensions and every glyph and image is visible in the output

### Requirement: DriveTiles screens verify visually against their spec
Each DriveTiles screen SHALL be exported to PNG, inspected, and compared against `04-screen-specs.md` / `07-wireframes.md`; deviations from the reference documentation (drawn stand-in artwork, approximated details) MUST be stated in the change's final report rather than silently approximated.

#### Scenario: Export height matches intent
- **WHEN** a screen is exported
- **THEN** its pixel height equals the intended height, or the difference is explained by content-driven layout

#### Scenario: Deviations are declared
- **WHEN** the final handoff is reported
- **THEN** any artwork drawn as a stand-in or detail changed from the spec is listed explicitly
