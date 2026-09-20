# Spec Delta

## Purpose

Locks the measurement and rendering behavior that the future MCP integration will depend on, so regressions in spec numbers or export output are caught by tests instead of discovered by hand.

## ADDED Requirements

### Requirement: Unit-tested measurement core

The system SHALL cover the pure measurement pipeline with tests that fail on any behavior change to role inference, geometry, or token resolution.

#### Scenario: Role inference is pinned

- **WHEN** the spec builder receives representative raw nodes (text leaf, masked icon, flex row/column, absolute-layered child, out-of-subset block)
- **THEN** each resolves to the documented role and SwiftUI shape, and the test fails if any mapping changes

#### Scenario: SwiftUI math is pinned

- **WHEN** typography and layered offsets are computed (lineSpacing, weight names, hex conversion, ZStack offsets)
- **THEN** the values match the documented formulas exactly

#### Scenario: Document composition is pinned

- **WHEN** a screen document is composed with and without the bridge, and in each theme
- **THEN** the 3-band shell, stylesheet order, node-token attributes, and theme attribute are present as specified, and export documents carry no measurement scaffolding

#### Scenario: Token resolution is pinned

- **WHEN** project and global token files are parsed in both modes
- **THEN** project values win over global ones, dark falls back to light when undefined, and computed colors resolve to the documented token names

#### Scenario: Corrupt persistence falls back safely

- **WHEN** a stored board snapshot or custom-project list is malformed
- **THEN** the app falls back to a fresh layout or an empty list without throwing, and the corrupt entry is not re-saved over good state

### Requirement: Export smoke test

The system SHALL verify end to end that at least one screen renders to a PNG of the expected pixel size.

#### Scenario: Reference export matches geometry

- **WHEN** the export pipeline renders a reference screen at the reference device and scale 1
- **THEN** the output PNG exists with the exact content-driven dimensions (width equals device width)

### Requirement: Frozen handoff outputs

The system SHALL freeze the machine-readable outputs that downstream consumers (including the future MCP integration) rely on, so any format change is a deliberate, reviewed diff.

#### Scenario: Spec JSON shape is versioned

- **WHEN** the Copy-JSON payload schema changes in any way
- **THEN** a snapshot or schema test fails, forcing the change to be acknowledged in the spec and the payload version bumped

### Requirement: Green quality gate

The system SHALL provide a single command that proves the project is healthy, and it MUST pass before any change is considered done.

#### Scenario: Gate covers all checks

- **WHEN** the author runs the gate command on a clean tree
- **THEN** typecheck, all lints, and the full test suite run in one invocation and the command exits non-zero on the first failure
