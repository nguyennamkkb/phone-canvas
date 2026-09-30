# Tasks

## 1. Screen exporter default

- [x] 1.1 Resolve default out dir from single `--project` to `project/<id>/exports/` in `scripts/export/cli.ts` (explicit `--out` wins; zero/multiple projects keep root `exports/`) with unit tests for the resolution, and verify the new tests pass
- [x] 1.2 Export one screen of a real project with `--project` and verify PNGs land in `project/<id>/exports/`; repeat without `--project` and verify root `exports/` behavior is unchanged

## 2. Icon exporter default + scoping

- [x] 2.1 Scope symbol scanning to the given project and default out to `project/<id>/exports/icons/` in `scripts/export-icons.ts` (explicit `--out` wins; no `--project` scans everything into `exports/icons/`) with unit tests, and verify the new tests pass
- [x] 2.2 Run `export:icons -- --project scratch-watch` and verify only that project's symbols land in its folder at 1x/2x/3x

## 3. Invisibility (git, registry, reload)

- [x] 3.1 Git-ignore `project/*/exports/`, run an export then `npm run gate`, and verify no new error comes from exported files
- [x] 3.2 Ignore the exports pattern in the dev server's file watcher and verify exporting while `dev` runs does not reload the board

## 4. Docs

- [x] 4.1 Document the layout in `README.md` (export section) and the skill tooling reference, and verify each documented command matches actual CLI `--help`
