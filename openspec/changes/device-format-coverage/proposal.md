# Proposal

## Why

phone-canvas renders phone screens end-to-end (author → board → spec → export),
but every other form factor stops at prose: tablet has presets and rules yet no
sample screen and no authoring recipe, Watch/Widget have only reference tables
with no presets, no compose path and no gate. Anyone drawing a non-phone surface
today works without a net. Duo is explicitly out of scope here — the user guides
it separately later.

## What Changes

- Docs hygiene first: fix the stale "calo-ai keeps 5 core screens" note in
  `docs/screen-regions.md` (3 remain), add tablet authoring recipe to the
  phone-canvas skill.
- Tablet round: draw one iPad sample screen (sidebar + split per spec) in a
  scratch project, review → fix via export PNG (max ~3 rounds), then generalize
  into a reusable format (`new-screen --kind` + skill recipe, shared components
  only if a pattern emerges).
- Watch round: decide sizes first (no presets exist), then same loop — sample
  face → review → generalize.
- Widget round: decide families/sizes first, then same loop.
- Each round ends only when the gate (`npm run gate`) is green and the exported
  PNG reads correctly; the format is not declared reusable before that.

## Capabilities

### New Capabilities

- `tablet-authoring`: how a tablet screen is authored, previewed and verified
  (sample screen, recipe, and — only if the round proves it needed — generator
  kind / shared components).
- `watch-authoring`: sizes, shell/document path, gate coverage and reusable
  format for a Watch surface.
- `widget-authoring`: families, sizes, document path, gate coverage and reusable
  format for a Widget / Live Activity surface.

### Modified Capabilities

- `screen-regions`: requirements stay, but prose fixes (screen count) and any
  tablet rule proven wrong by the sample screen get revised here.
