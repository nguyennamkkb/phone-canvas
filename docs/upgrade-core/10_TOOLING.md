# 10 — Tooling (14 tools: core vs CLI vs AI-skill)

> Track 009 · every tool: what exists today, where, and where it should live. Rule of thumb: rendering/expansion truth → core; repo-wide checks → CLI; judgment/prose → AI-skill + human.

## Decision matrix

| # | Tool (brief §9) | Exists today | Location | Lives as | Rationale |
|---|---|---|---|---|---|
| 1 | **Project Manager** | Partial: `scripts/project.ts`, `scripts/screen.ts`, `scan-projects.ts` | `scripts/` | **CLI** (+ thin board UI read-only list) | Mutation is file-scoped and scriptable; board never writes projects directly. |
| 2 | **Screen Generator** | Yes: `scripts/new-screen.ts` (templates per form), `rename-screen.ts`, `delete-screen.ts` | `scripts/` | **CLI** | Deterministic scaffold; extend with `04` anatomy header + DNA token prefill (P1). |
| 3 | **Component Library** | Partial: `ComponentDock.tsx` (preview) + `componentUsage` | `src/components/` | **Core** (preview/use) + **CLI** (`components-lint`) | Preview must use the same `composeScreenDoc`; catalog search/filter is P1 core UI. |
| 4 | **Token Inspector** | Yes: board token table (`tokensOf`), draft store | `src/tokens/` | **Core** | Board table and spec panel must never disagree with rendering — parsed from the same CSS (`src/tokens/tokens.ts` header). CLI mirror proposed P2 (`tokens inspect --json`). |
| 5 | **Region Inspector** | Partial: SpecPanel + element tree | `src/inspect/` | **Core** | Selection mirror + ancestry already live; add region-badge overlay (which band owns this node) P1. |
| 6 | **Measurement Tool** | Yes: bridge capture + `buildSpec` + SpecPanel numbers | `src/extractor/bridge.js`, `src/spec/` | **Core** | 1px=1pt contract; move-mode `pickAt` covers measure-without-mode-switch. No second ruler. |
| 7 | **Visual Diff** | Partial: `export` PNGs, no golden store | `scripts/export/` | **CLI** (export + compare, P1) + golden store in repo | Export reuses compose+CDP; diff is pixel-compare, no new renderer. |
| 8 | **Accessibility Audit** | Partial: labelled-tab, aria rules in `region-rules.ts` | `scripts/region-rules.ts` | **CLI** (static, today) + **AI-skill** checklist (contrast intent, Dynamic Type) for what text can't prove | What is text-knowable is already gated; the rest is judgment → skill, not a fake auto-check. |
| 9 | **Responsive Audit** | Partial: `deviceLiteralViolations`, multi-device export (`--device`) | `scripts/` | **CLI** | Render each screen at every `DEVICES` width via existing export loop (P1: `--all-devices` flag). |
| 10 | **Platform Audit** | Partial: form-specific rules + measured fold/crease checks | `region-rules.ts` + `region-audit.ts` | **CLI** (today) | Rules already split static/measured correctly; add per-form report view P1. |
| 11 | **Spec Generator** | Yes: `bridge.js` + `infer.ts:buildSpec` + copy-json | `src/spec/`, `src/inspect/copy-json` | **Core** | RAW-capture/interpretation split is the testability contract — keep. IR versioning (§12) attaches here. |
| 12 | **Export** | Yes: PNG export (+ icons export) | `scripts/export.ts`, `scripts/export-icons.ts` | **CLI** | Zero-dep CDP; chassis excluded by design (decoration, wrong in handoff). |
| 13 | **Snapshot / Golden Screen** | Missing (only `output/` ad hoc) | — | **CLI** store + **Core** read badge (proposed P1) | `export --golden` writes versioned PNGs + hash record; board shows golden-vs-current badge. |
| 14 | **AI Handoff** | Missing as a tool (handbacks are the practice) | — | **AI-skill** (convention, P1) | Standardize the artifact chain from §08 (research→…→golden) as a skill checklist with file templates, not a program. |

## Build order (cheapest certainty first)

1. P1 CLI flags on existing scripts (`--screen` for lints, `--all-devices` for export, `--golden` store) — no new architecture.
2. P1 core badges (region-owner overlay, golden-vs-current) — read-only UI on proven data.
3. P2 automation (scripted interaction test, CI golden diff) — only after P1 proves the contracts stable.

Nothing here needs a new service, daemon, or build step — the repo's zero-dep CDP + pure-function precedent holds throughout.
