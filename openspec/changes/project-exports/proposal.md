# Proposal

## Why

Exports land in a shared root `exports/` folder, disconnected from the project
they belong to; with tablet/Watch/widget surfaces multiplying files per screen,
finding and handing off one project's shots gets harder every round.

## What Changes

- `npm run export -- --project <id>` defaults its output to
  `project/<id>/exports/` (created on demand); without `--project` the root
  `exports/` stays as today. Explicit `--out` always wins over both.
- `npm run export:icons -- --project <id>` defaults to
  `project/<id>/exports/icons/`; without `--project` it stays `exports/icons/`.
- `project/*/exports/` is git-ignored (same as root `exports/`), invisible to
  the registry (no new derive rules — unknown paths are already ignored), and
  does not trigger dev-server reload loops.
- Docs (`README` export section + tooling skill reference) describe the layout.

## Capabilities

### New Capabilities

- `project-exports`: per-project export destination resolution for screens and
  icons (defaults, `--out` precedence, git-ignore, registry invisibility).

### Modified Capabilities

(none — no existing spec covers export destinations.)

## Impact

- `scripts/export/cli.ts` (default-out resolution), `scripts/export-icons.ts`
  (same), `.gitignore`, `README.md` + skill tooling docs.
- No changes to compose, registry/derive, gate tiers, or board code.
