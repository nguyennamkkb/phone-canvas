# Design

## Context

See `proposal.md` (Why). Current state: `export` defaults `--out` to root
`exports/` and already accepts repeatable `--project` as a screen filter;
`export:icons` scans every project and writes `exports/icons/`. The registry
ignores paths matching no known pattern, so PNGs under a new folder need no
derive changes — but that must be verified, not assumed. Root `exports/` is
git-ignored; `project/*/exports/` is not yet.

## Goals / Non-Goals

**Goals:** per-project default destinations for both exporters, `--out`
precedence, git-ignore, registry invisibility, no reload loops.

**Non-Goals:** moving existing root-`exports/` files; changing filename
conventions, scales, or gate behavior; serving exports over HTTP.

## Decisions

### Resolve the default at the CLI layer, not in render code

Both exporters compute `outDir` once from (`--out` ?? single `--project` ??
root default) and pass it down. Rationale: render/site/CDP code stays
project-agnostic; one place to test. Alternative (per-screen folders inside
render) rejected — it would scatter the rule across modules.

### `export:icons` scopes symbols by project when filtered

With `--project <id>`, only that project's screens + components are scanned,
so the folder holds exactly what the project uses. Without it, today's
scan-everything stays. Rationale: a project folder containing other projects'
icons would be a lie in a handoff.

### Registry invisibility by existing ignore-path behavior

No derive change: PNGs match no path regex and stray rules only cover
top-level `.html`. Verified by a test that runs the gate after an export
(spec scenario). Alternative (explicit ignore list in derive) rejected as
dead weight unless the test fails.

### Reload safety via Vite watch ignore

PNG writes under `project/` retrigger the dev server today (it watches the
tree). The change adds the exports pattern to the server's ignored paths so
exporting mid-session does not reload the board. Verified manually: export
while `dev` runs, board stays put.

## Risks / Trade-offs

- [Risk] Some other tool globs `project/**/*` and chokes on PNGs → Mitigation:
  full `npm run gate` after implementation covers lint/scan paths; export
  smoke test covers the exporter.
- [Risk] Users relying on root `exports/` paths in docs/scripts → Mitigation:
  default without `--project` is byte-identical to today; docs updated.

## Migration Plan

None needed (additive, backward compatible). Existing root exports untouched.

## Open Questions

None — layout (`project/<id>/exports/`, `--out` wins) confirmed by the user
before planning.
