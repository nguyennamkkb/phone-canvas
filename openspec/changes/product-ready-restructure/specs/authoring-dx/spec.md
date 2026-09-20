# Spec Delta

## Purpose

Makes creating a new phone screen a single reliable command instead of a multi-step manual edit across three files, so authors (human or agent) cannot forget a wiring step.

## ADDED Requirements

### Requirement: One-command screen scaffolding

The system SHALL provide a single command that creates a new screen file from the authoring contract and wires it into every registry the app and exporter read.

#### Scenario: Scaffold a screen end to end

- **WHEN** the author runs the scaffold command with a project id, a slug, and a title
- **THEN** a contract-valid starter HTML file exists under `project/<id>/`, the screen id is registered for the app, the exporter lists it, and the owning project's board includes it

#### Scenario: Scaffold rejects bad input with guidance

- **WHEN** the project id is unknown, the slug is malformed, or the id already exists
- **THEN** the command fails without writing anything and prints the valid projects and the naming rule

### Requirement: Single-source screen registry

The system SHALL keep screen identity in exactly one source of truth so adding a screen cannot drift between the board, the panel, and the exporter.

#### Scenario: No double registration

- **WHEN** a new screen is added by any means (scaffold or hand-written)
- **THEN** the author edits at most one file beyond the HTML itself, and a missing entry fails fast at startup (board) or with a named error (exporter) rather than rendering a blank frame

### Requirement: Authoring lint gates violations

The system SHALL reject screen markup that violates the authoring contract at development time, with messages that name the file, the line, and the fix.

#### Scenario: Banned CSS is caught

- **WHEN** a screen uses `display:grid`, `transform`, `float`, a non-token color, or a `.icon` without `data-symbol`
- **THEN** the lint fails and the message points at the offending file and construct, referencing the contract rule

#### Scenario: Lint is part of the default gate

- **WHEN** the author runs the standard lint command
- **THEN** typecheck, token lint, and subset lint all run, and the command exits non-zero on any violation
