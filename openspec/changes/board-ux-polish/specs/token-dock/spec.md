# Spec Delta

## Purpose

Frees the design-token table from the canvas so it stops shrinking phone screens in fit-view and stops polluting the minimap, while keeping every editing behavior intact.

## ADDED Requirements

### Requirement: Token table lives in a left dock

The system SHALL render the project's token table as a collapsible left dock panel instead of a React Flow canvas node.

#### Scenario: Dock edits like the old table

- **WHEN** the user edits a token, previews a draft, copies CSS, or copies the SwiftUI extension from the dock
- **THEN** every behavior matches the former canvas table (draft badge, revert, copy feedback, undefined-vars warning)

#### Scenario: Dock collapses and stays out of the minimap

- **WHEN** the user collapses the dock
- **THEN** the canvas gains the full width, and the dock never appears in the minimap or the fit-view computation

### Requirement: Boards without the table node still load

The system SHALL open boards saved with the legacy token-table node without errors, silently dropping that node.

#### Scenario: Legacy board migrates silently

- **WHEN** a board saved before this change loads
- **THEN** phone layout is preserved, no error surfaces, and the tokens appear in the dock instead
