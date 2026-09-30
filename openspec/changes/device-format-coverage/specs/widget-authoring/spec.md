# Spec Delta

## Purpose

Covers how a Widget / Live Activity surface is sized, rendered and verified in phone-canvas, so widgets get the same author-to-export loop as a phone screen.

## ADDED Requirements

### Requirement: Widget families and sizes are decided and recorded

The families and sizes (and document path) used to render a widget SHALL be
decided with the user and recorded in `design.md` before any sample is drawn,
because no presets exist today.

#### Scenario: Families decided first
- **WHEN** the Widget round starts
- **THEN** `design.md` names the exact families and sizes to build against — no sample is drawn from guessed numbers

### Requirement: A sample widget passes the gate

A sample widget SHALL exist and SHALL pass both gate tiers untouched, proving
the decided families, sizes and document path work end to end.

#### Scenario: Sample passes the gate
- **WHEN** `npm run gate` runs with the sample widget present
- **THEN** no region error names the sample widget in either tier

### Requirement: A reusable Widget format exists

After the sample round, a reusable way to start a widget SHALL exist — a
documented recipe in the phone-canvas skill and, only if the round proves it
needed, a generator kind and/or shared components — such that starting a second
widget from it passes the gate with no hand fixes.

#### Scenario: Second widget from the format
- **WHEN** a new widget is created from the reusable format
- **THEN** `npm run gate` reports no region error for it before any hand edit
