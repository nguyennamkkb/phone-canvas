# Spec Delta

## Purpose

Defines where exported files go so every project's shots live with that project, while keeping full backward compatibility for existing commands.

## ADDED Requirements

### Requirement: Screen export defaults into the project folder

When `export` runs with exactly one `--project <id>`, output files SHALL go to
`project/<id>/exports/` (created on demand) unless `--out` is given. With zero
or multiple `--project` values, output SHALL go to `--out` (default `exports/`)
exactly as today.

#### Scenario: Single project export
- **WHEN** `npm run export -- --project calo-ai`
- **THEN** PNGs land in `project/calo-ai/exports/`, not root `exports/`

#### Scenario: Explicit out wins
- **WHEN** `npm run export -- --project calo-ai --out /tmp/shots`
- **THEN** PNGs land in `/tmp/shots/`

#### Scenario: No project keeps old behavior
- **WHEN** `npm run export` runs without `--project`
- **THEN** PNGs land in root `exports/` exactly as before

### Requirement: Icon export follows the same rule

When `export:icons` runs with exactly one `--project <id>`, icons SHALL go to
`project/<id>/exports/icons/` unless `--out` is given; otherwise `exports/icons/`
as today. Only symbols used by that project's screens + components are exported
when `--project` is given.

#### Scenario: Project-scoped icons
- **WHEN** `npm run export:icons -- --project scratch-watch`
- **THEN** `project/scratch-watch/exports/icons/` holds that project's symbols at 1x/2x/3x, and no other project's symbols

### Requirement: Export folders stay out of git and the registry

`project/*/exports/` SHALL be git-ignored, SHALL NOT appear as registry errors,
and SHALL NOT trigger dev-server reloads when files are written during export.

#### Scenario: Export then gate
- **WHEN** a project export runs and then `npm run gate` runs
- **THEN** the gate reports no new error caused by files under `exports/`
