# 12 — Migration Plan (Current → Target without breaking workflow)

> Track 009 · covers brief §12 deliverable + §14 A–G relevant to ARCH/IR/TOOLING/MIGRATION. Sibling tracks own platform rules, region system, DNA, screen workflow, goldens detail.

## A. Current State (what is good, what is missing, risks)

**Good (keep):** single `composeScreenDoc` definition shared by board/export/audit; pure `deriveRegistry` + fail-closed registry; RAW bridge + testable `buildSpec`; static/measured region gate split with no-warn discipline; zero-dep Chrome CDP export; per-node token message routing; `@component` pure expansion.

**Missing:** canonical IR/versioning (spec schema is implicit TS types, no version); component anatomy standard; golden store; `--screen` scoped lints; `board.json` freeze artifact (board lives in localStorage only); AI handoff convention as a tool; per-form report views.

**Risks:** board localStorage goes stale across machines (mitigated by reconcile+zombie prune, but not portable); audit SKIPPED without Chrome can be misread as PASS; slot/tab contract changes have no migration-note discipline; no pixel-regression net.

## B. Target State

phone-canvas becomes a **UI engineering OS**: screens are versioned documents over a canonical IR; every agent lane has a file-artifact contract; `npm run gate` is the single quality truth; goldens make regressions visible; core changes ship with migration notes. Form-factor coverage (phone/tablet/cover/inner/watch/widget) is rule-backed, not folklore.

## C. Gap Analysis (Current → Target)

| Gap | Current | Target | Doc |
|---|---|---|---|
| IR versioning | TS types only, unversioned | `Spec IR v1` schema + version field + changelog | §12 App. |
| Component standard | Files + lint, no anatomy | 11-item anatomy + ownership table | `04` |
| Scoped checking | `--screen` only on audit | All lints accept `--screen` | `10` tool 2/7 |
| Golden regression | Ad-hoc `output/` | Versioned golden store + board badge | `10` tools 7/13 |
| Freeze portability | localStorage | `project/<id>/board.json` committed | `06` step 15 |
| Handoff convention | Practice, unwritten | AI-handoff skill + templates | `08` |

## D. Priority P0 / P1 / P2

- **P0 (workflow protection, no behavior change):** freeze the gate as-is (`npm run gate` documented as the truth — done in `09`); `board.json` freeze export (portability without changing reconcile); golden store directory + `export --golden` (additive).
- **P1 (standardization, additive):** `04` anatomy enforced in review; `--screen` on all lints; `--all-devices` export; region-owner overlay + golden badge (read-only UI); AI-handoff skill templates; Spec IR v1 schema doc + `version` field on payload (additive, readers ignore unknown fields).
- **P2 (automation, after P1 proves stable):** CI golden diff; scripted interaction test (`pickAt`/mirror/recapture); per-component goldens; component props (`data-*` defaults) spec.

## E. Migration order (never break the current workflow)

1. **Document first** (this set: `04/06/08/09/10/12`) — zero code, reviewable by humans.
2. **Additive CLI** (`--screen`, `--all-devices`, `--golden`) — old commands behave identically; new flags opt-in.
3. **Read-only UI** (badges/overlays) — no mutation paths, can't break board.
4. **Freeze artifact** (`board.json`) — written alongside localStorage, never instead of it, until two projects prove round-trip.
5. **IR version field** — additive; old readers ignore it; bump only with a migration note + re-verified goldens.
6. **Enforcement** (anatomy required, handoff skill mandatory) — last, after tools make compliance cheap.

Each step ships only while `npm run gate` stays green on all existing projects — the gate is both the guard and the proof.

## F. Operating Model (new project intake)

```text
Lead receives brief → opens Research lane → artifacts flow per §08 handoff table
→ Designer builds per §06 steps (human gates at scope/platform/DNA)
→ QA gates every change (gate receipt per change, evidence expires on edit)
→ Reviewer + human approve → Core/Platform freezes (screens + board.json + goldens)
→ project is read-only until a new task reopens it
```

One project = one Designer write lease at a time (single-writer). Core changes never ride along with project work — separate task, migration note, all projects re-gated after.

## G. Example walkthrough (habit-tracker "New App" → Golden approval)

1. **Research:** competitor habit apps via webbridge snapshots → `research.md` (streaks, reminders, stats are the jobs).
2. **Product:** `product.md` (V1: today + stats, no social), **IA:** 4 tabs (Today·Stats·Add·Settings), **Platform:** phone V1, widget V2 (`platform.md`).
3. **DNA:** warm paper bg, SF Pro, sage accent, 12px corners, 4pt spacing rhythm → human approves.
4. **Tokens:** `project/habit/tokens.css` (`--bg`, `--sage-*`, dark pairs) → `lint:tokens` green.
5. **Components:** `stat-tile`, `streak-dot`, `tab-chrome` with 11-item headers → `lint:components` green.
6. **Regions:** slots `back/title/right` + 4 `data-tab` + `data-tab-active="today"` → `lint:regions` green.
7. **Screens:** `today`, `stats`, `add`, `settings` built section-by-section with scoped audits → full `gate` green.
8. **QA→Review:** violation list empty; export 3× PNGs; reviewer notes 2 nits (title length, one unlabelled tab) → fixed → re-gated.
9. **Golden:** `export --golden` stores 4 PNGs + hashes; human signs `GOLDEN.md`; Core/Platform freezes `board.json`. Project read-only.

## Appendix — Spec IR v1 (sketch, additive to `src/spec/types.ts`)

```ts
type SpecIR = {
  irVersion: 1;                 // new, additive
  screenId: string; deviceId: string; theme: 'light' | 'dark';
  exportedAt: string;           // UTC, fresh per export
  nodes: SpecNode[];            // today's shape, unchanged
  device: { w: number; h: number } | null;
}
```

Versioning rule: minor additions (new optional fields) never bump; renames/removals bump `irVersion` + ship a migration note + re-verify all goldens. Readers ignore unknown fields (forward-compatible by construction).
