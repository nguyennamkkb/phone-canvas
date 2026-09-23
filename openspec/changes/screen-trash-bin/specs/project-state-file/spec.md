# Spec Delta

## Purpose

Persists each project's full state to a versioned JSON file so boards survive machine changes, cache clears, and long-term archival, with localStorage kept only as a runtime cache.

## ADDED Requirements

### Requirement: Project state can be exported to a file

The system SHALL be able to write a project's full state — board nodes, edges, deliberately-removed ids, trash entries, and project metadata — to a JSON file at `project/<id>/board.json` that is human-readable and safe to check into version control.

#### Scenario: Export writes a complete snapshot

- **WHEN** the user exports the active project's state
- **THEN** a JSON file is written containing its nodes, edges, removed ids, trash entries, and metadata with a format version marker

#### Scenario: Exported file is self-describing

- **WHEN** the user opens an exported state file in a text editor
- **THEN** they can identify the format version, the project it belongs to, and when it was written

### Requirement: Project state can be imported from a file

The system SHALL be able to load a previously exported state file back into the project, replacing the runtime board state, and SHALL refuse files that fail validation without touching the current state.

#### Scenario: Import restores a previous state

- **WHEN** the user imports a valid state file for the active project
- **THEN** the board shows the nodes, edges, removed set, and trash exactly as exported

#### Scenario: Import rejects a corrupt file safely

- **WHEN** the user imports a file that is not valid JSON or fails schema validation
- **THEN** the operation aborts, the current board state is unchanged, and the reason is reported

#### Scenario: Import rejects a foreign project file

- **WHEN** the user imports a state file that belongs to a different project id
- **THEN** the operation aborts unless explicitly forced, and the current board state is unchanged

### Requirement: File state is the source of truth when present

When both a state file and cached runtime data exist, the system SHALL treat the file as the source of truth on project open if it is newer, and localStorage SHALL remain only a write-through cache of what the file holds.

#### Scenario: Newer file wins on open

- **WHEN** a project is opened and its state file is newer than the cached runtime data
- **THEN** the board loads from the file

#### Scenario: No file falls back to existing behavior

- **WHEN** a project has no state file
- **THEN** the board loads exactly as it does today from cached runtime data or a fresh layout

### Requirement: State file survives cache clears and machine changes

A project whose state file is checked in or backed up SHALL be fully recoverable on another machine or after the browser cache is cleared, with nodes, positions, edges, removed set, and trash intact.

#### Scenario: Recover after cache clear

- **WHEN** the browser cache is cleared and the project is opened with its state file available
- **THEN** the board restores nodes, positions, edges, removed set, and trash from the file
