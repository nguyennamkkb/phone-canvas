# 09 — Quality Gates (10 tiers)

> Track 009 · every tier: what it checks, where it runs today, block/warn/review, auto vs human. Precedent: no warn mode in region gates — a warning is a future incident with a nicer name.

## Tier table

| # | Tier | Checks | Runs today (real command) | Verdict | Auto / Human |
|---|---|---|---|---|---|
| 1 | **Structural** | Screen/component discovery: kebab ids, unique screen ids, valid `pc` header JSON, known `deviceId`, cover∈project, no stray HTML, lanes-without-project | `npm run scan:projects` → `deriveRegistry` throws on any error (`src/projects/derive.ts:143`, `src/projects/registry.ts:63-66`) | **BLOCK** | Auto |
| 2 | **Token** | Every color is a token; no hardcoded hex in screens; root bg continuity; dark-mode pairs | `npm run lint:tokens` (`scripts/tokens-lint.ts`); token↔render agreement via `src/tokens/tokens.ts` (`tokenNameForColor`, `toRgba`) | **BLOCK** | Auto |
| 3 | **Component** | Every `@component` resolves; no cycle; depth ≤20; placeholder left visible on error | `npm run lint:components` (`scripts/components-lint.ts`); expansion errors surfaced (`src/components/expand.ts`) | **BLOCK** | Auto |
| 4 | **Region (static)** | No OS-chrome redraw, no shell-band redraw, slot values known, one `.body`, nav/tab anatomy, no device px, exemptions reasoned | `npm run lint:regions` (`scripts/region-lint.ts` + `region-rules.ts`: `screenViolations`/`componentViolations`/`touchFloorViolations`) | **BLOCK** | Auto |
| 5 | **Platform** | Per-form rules: cover has no horizontal tabs, tab count 3–5 + labelled, title <15ch, back-symbol on push, `.split` 50/50 on fold, nothing on crease | Static part in tier 4 (`tabbarViolations`, `navbarViolations`); measured part in tier 7 | **BLOCK** | Auto |
| 6 | **Subset / vocabulary** | Every class used exists in the stylesheet subset; no unknown tokens/vars | `npm run lint:subset` (`scripts/subset-lint.ts`) | **BLOCK** | Auto |
| 7 | **Measured (audit)** | OS bands exist once outside `.viewport`; bg continuity rendered; hit ≥44×44; tab last; one scroller; `.body-fixed` fits; band-when-slot | `npm run audit:regions` (`scripts/region-audit.ts`, Chrome CDP via `scripts/export/*`) | **BLOCK**; **SKIPPED→NOT TESTED** when no Chrome (exit 0 + loud line, precedent in file header) | Auto (needs Chrome) |
| 8 | **Visual** | Export PNGs match golden set; no unintended pixel drift | `npm run export` vs golden PNGs (proposed golden store; export itself exists: `scripts/export.ts`) | **BLOCK** on drift; new intentional change → **human review** then re-baseline | Auto compare + human approve |
| 9 | **Interaction** | Tap targets reachable in move-mode overlay; `pickAt` hit-test selects; panel↔frame selection mirrors; recapture recovers | Manual board walkthrough today (overlay logic `PhoneNode.tsx:onOverlayClick`, mirror `InspectorContext.tsx`); **proposed**: scripted CDP click test | **REVIEW** (human today) | Human (auto proposed P2) |
| 10 | **Regression** | Full `npm run gate` (lint + audit + `vitest`) green on every change; changed-after-review screens re-verified | `npm run gate` (package.json) | **BLOCK** | Auto |

## Verdict semantics

- **BLOCK** — merge/approve forbidden until green. Applies to tiers 1–8 and 10. No warn mode.
- **REVIEW** — human looks and signs (tier 9 today; tier 8 intentional-change path). Review notes cite rule codes or `CHALLENGE` with reason.
- **NOT TESTED** — tier 7 without Chrome, tier 9 unautomated parts. Must be written down in the QA receipt; never rounded up to PASS.

## Auto vs human matrix

| Auto-checkable today | Needs human today | Proposed automation (P2) |
|---|---|---|
| Tiers 1–7 (given Chrome), 10 | Tier 8 approval, tier 9 walkthrough, DNA/IA judgments | Golden PNG diff in CI, scripted `pickAt`/selection-mirror test, per-component golden PNGs |

## Gate command (single entry)

```bash
npm run gate   # lint + audit:regions + vitest
```

QA receipt must contain: command + exit code + (for audit) SKIPPED-or-clean line + list of screens re-verified after last edit. Old evidence expires on edit — re-run, don't reuse.
