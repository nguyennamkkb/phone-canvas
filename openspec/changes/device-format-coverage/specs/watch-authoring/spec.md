# Spec Delta

## Purpose

Covers how a Watch surface is sized, rendered and verified in phone-canvas, so a watch face gets the same author-to-export loop as a phone screen.

## ADDED Requirements

### Requirement: Watch sizes are decided and recorded

The sizes (and document path) used to render a Watch surface SHALL be decided
with the user and recorded in `design.md` before any sample is drawn, because
no presets exist today.

#### Scenario: Sizes decided first
- **WHEN** the Watch round starts
- **THEN** `design.md` names the exact sizes to build against — no sample is drawn from guessed numbers

### Requirement: A sample Watch face passes the gate

A sample Watch surface SHALL exist and SHALL pass both gate tiers untouched,
proving the decided sizes and document path work end to end.

#### Scenario: Sample passes the gate
- **WHEN** `npm run gate` runs with the sample face present
- **THEN** no region error names the sample face in either tier

### Requirement: A reusable Watch format exists

After the sample round, a reusable way to start a Watch surface SHALL exist —
a documented recipe in the phone-canvas skill and, only if the round proves it
needed, a generator kind and/or shared components — such that starting a second
face from it passes the gate with no hand fixes.

#### Scenario: Second face from the format
- **WHEN** a new Watch surface is created from the reusable format
- **THEN** `npm run gate` reports no region error for it before any hand edit
