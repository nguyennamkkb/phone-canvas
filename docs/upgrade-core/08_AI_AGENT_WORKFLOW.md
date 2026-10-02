# 08 — AI Agent Workflow (6 lanes)

> Track 009 · binds to `06_PROJECT_WORKFLOW.md` steps and `09_QUALITY_GATES.md` tiers. No code changes.

## 1. Lanes and step ownership

```text
Research → Product/UX → Designer → Core/Platform → QA → Reviewer
```

| Lane | Workflow steps | Reads | Writes | Must never |
|---|---|---|---|---|
| Research | 1 | brief, web, existing `docs/` | `research.md` | invent product scope; touch `project/`, `src/`, `scripts/` |
| Product/UX | 2–4 | `research.md` | `product.md`, `ia.md`, `platform.md` | write screens/components/tokens; approve own IA (needs human at step 4) |
| Designer | 5–10, 13 | DNA, `04` anatomy, components, tokens | `project/<id>/**` (screens, components, tokens.css, assets) | edit `src/`, `scripts/`, other projects; add tokens without `lint:tokens`; build whole screen before first audit |
| Core/Platform | 6-scaffold, 15, tooling | everything (read) | `src/**`, `scripts/**`, shared CSS, `board.json` freeze | change expansion/slot semantics without migration note; silence a lint rule to make a screen pass |
| QA | 11 | screens, components, lints, Chrome | violation reports, `GOLDEN.md` drafts | fix screens directly (report, don't patch); mark PASS on SKIPPED measured audit |
| Reviewer | 12, 14 | board, export PNGs, reports | review notes, golden sign-off | approve with red gate; approve own design work (second pair of eyes required) |

Lease model mirrors SLP: Designer holds a **write lease on `project/<id>/` only**; Core/Platform holds the **sole write lease on `src/`+`scripts/`** (single-writer rule). QA/Reviewer/Research are **no-write** on product paths (findings → report, never silent-fix).

## 2. Screen construction loop (Designer, per-section — not per-screen)

```text
Define (one section) → Wire structure → Apply components → Apply tokens
→ Platform adaptation → Automated audit (scoped) → Fix → next section
→ … → full-screen audit → Accessibility review → Visual review → Approve
```

- Scoped audit during construction: `npx tsx scripts/region-lint.ts --screen <id>`-style single-screen run (audit script already supports `--screen`; lint runs whole-project — P1: add `--screen` flag to lints).
- Full `npm run gate` only when all sections are assembled. Rationale (from brief §8): catching `region-body-escaped` on section 1 beats catching it after 8 sections.
- A section that passes scoped audit and later breaks after a sibling lands → the *sibling* is the suspect (bisect by stashing sections, same as code bisect).

## 3. Triggers (when each lane must act)

| Trigger | Who acts | Action |
|---|---|---|
| New brief arrives | Research | produce `research.md`; BLOCKED if brief lacks users + tasks (ask, don't guess) |
| `research.md` accepted | Product/UX | steps 2–4; any scope change after step 4 → human re-approval |
| DNA approved + tokens green | Designer | steps 7–10; may start Region Setup (8) in parallel with Component Setup (7) — different files |
| `region-lint` red on a screen | Designer | fix in owned scope; repeated same-code failure ≥2× → STOP, escalate (missing capability, not hackaround) |
| `audit:regions` SKIPPED (no Chrome) | QA | record `NOT TESTED (measured)`; unit-covered mechanism (`screenBgOf` etc.) still asserted via vitest |
| Gate green + board ready | Reviewer | visual review on export PNGs at 3×; notes cite rule codes or `CHALLENGE` with reason |
| Reviewer approves all screens | Human + Reviewer | step 14 golden; freeze (15) by Core/Platform |
| New device/form requested | Core/Platform | add preset to `devices.ts` + `KNOWN_DEVICE` flows automatically (`derive.ts:25`); screens opt in via header `deviceId` |
| Core change proposed (expansion, slots, tokens pipeline) | Core/Platform | migration note first (what breaks, which screens, re-verify plan); Designer screens re-run gate after |

## 4. Context passing (no silent loss between lanes)

Each handoff is a **file, not a chat message**:

| Handoff | Artifact | Consumer reads |
|---|---|---|
| Research → Product | `research.md` | users, tasks, platform norms |
| Product → Designer | `product.md` + `ia.md` + `platform.md` + `design-dna.md` | what to build, where, for which form |
| Designer → QA | screens + `screen-plan.md` per screen (sections, components used) | what to check, what changed |
| QA → Designer | violation list (`file:line` + rule code + fix) | what to fix, exactly where |
| QA → Reviewer | gate receipt (command + exit code + SKIPPED notes) + export PNGs | what is proven, what is NOT TESTED |
| Reviewer → Human | notes + golden candidate set | decision package |
| Any lane → any lane (question) | consultation note (question, options, recommendation, blocker?/non-blocker?) | — reply in same file, never in a side channel |

Rule: if it isn't in the artifact, the next lane must assume it doesn't exist (no "I told you in chat"). This is the file-first discipline that keeps multi-agent work deterministic.

## 5. Anti-omission checklist (Designer, before handing to QA)

- [ ] Every screen has `<!-- pc {...} -->` header, valid JSON, known `deviceId` (`derive.ts` header rules).
- [ ] Every `data-tab` list has a matching `data-tab-active` on `.screen`, slug exists (`region-tab-active-*`).
- [ ] No screen declares shell bands or OS chrome (`region-shell-owned`, `chrome-redrawn`).
- [ ] Every `@component` id resolves (`components-lint`); no cycle.
- [ ] Every screen color is a token (`tokens-lint`); every class used exists (`subset-lint`).
- [ ] Exemptions (`lint-region: off`) all carry reasons (`region-off-without-reason`).
- [ ] Changed-since-last-green screens re-ran the gate (evidence expiry).

## 6. Evidence and decision records

- Gate receipt = command + exit code + digest (same bar as engineer handback `Verification`).
- Decisions (DNA choice, platform cut, core change, golden approval) → one `DECISIONS.md` entry each: date, decider, options, reason, reversible?/irreversible?. Irreversible decisions (freeze, core semantic change) require human sign-off; reversible ones need reviewer sign-off only.
- Agent self-promotion is forbidden: a lane that "learned" something proposes it with the answer-path as evidence; promotion is a human/lead decision (same rule as SLP SPK-15).
