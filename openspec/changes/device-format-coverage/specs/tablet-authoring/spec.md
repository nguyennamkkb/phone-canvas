# Spec Delta

## Purpose

Covers how a tablet screen is authored, previewed and verified in phone-canvas, so drawing for iPad stops being an untested translation of prose into HTML.

## ADDED Requirements

### Requirement: A sample iPad screen proves the rules usable

A sample tablet screen with a leading sidebar and a 2-column split SHALL exist
and SHALL pass both gate tiers untouched, demonstrating that the `tablet`
requirements in `screen-regions` can actually be built.

#### Scenario: Sample passes the gate
- **WHEN** `npm run gate` runs with the sample screen present
- **THEN** no region error names the sample screen in either tier

### Requirement: A reusable tablet format exists

After the sample round, a reusable way to start a tablet screen SHALL exist —
a documented recipe in the phone-canvas skill and, only if the round proves it
needed, a generator kind and/or shared components — such that scaffolding a
second tablet screen from it passes the gate with no hand fixes.

#### Scenario: Second screen from the format
- **WHEN** a new tablet screen is created from the reusable format
- **THEN** `npm run gate` reports no region error for it before any hand edit
