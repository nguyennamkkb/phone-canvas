---
name: slp-peer-knowledge
description: Mandatory baseline knowledge for SLP peers. Tier-0 common rules plus exactly one Tier-1 primary role baseline (scout/engineer/reviewer/designer), at most one Lead-named supplemental. Converts task experience into evidence-backed proposals; Lead alone promotes.
---

# SLP PEER KNOWLEDGE: MANDATORY ROLE BASELINE (v1.1)

## 1. Purpose & Mandatory Binding

`slp-peer-knowledge` gives every Peer a professional starting floor — orientation,
rules, output bar, and failure modes for its role. Depth = 1–2 pages per baseline.

- **MANDATORY activation** on every dispatch, same level as `slp-peer`,
  `slp-state`, `slp-collab`:

  ```text
  Skills: [slp-peer, slp-peer-knowledge, slp-state, slp-collab]
  ```

- **Mandatory activation ≠ mandatory heavy loading.** The skill always activates;
  how much loads follows the contract below. No K0–K3 complexity classification
  in v1.1 (SPK-18) — Tier-0 + Tier-1 is a few KB; the real cost is lesson
  paperwork, which is conditional (§4).

## 2. Authority & Boundaries

- **Owns:** identifying required baseline, loading ONLY permitted files, applying
  knowledge to the task, recording reusable lessons, proposing expertise updates
  with evidence.
- **Does NOT:**
  - ❌ Replace `slp-peer` (execution bound), `slp-state` (lifecycle state),
    `slp-roster` (routing + confidence), `slp-collab` (transport).
  - ❌ Promote expertise. `provisional → calibrated → established` is Lead-only
    (SPK-15). Peer proposes; Lead disposes.
  - ❌ Expand knowledge loading autonomously (SPK-07).
  - ❌ Perform external effects without explicit lease.

## 3. Tiered Loading Contract

| Tier | File | Rule |
| :--- | :--- | :--- |
| **Tier-0 — always** | `references/COMMON-BASELINE.md` | Loaded every task (SPK-03). Invariants, authority, evidence, escalation only — no domain detail |
| **Tier-1 — primary** | Exactly ONE of `SCOUT-` / `ENGINEER-` / `REVIEWER-` / `DESIGNER-BASELINE.md` | Selected by assignment Role (SPK-04) |
| **Supplemental — ≤1** | Named artifact (e.g. audit fragment, domain checklist) | ONLY when Lead names it explicitly in the envelope (SPK-05, SPK-06). Default max = 1. A 2nd requires explicit Lead exception + documented reason |
| **Tier-2 — on demand** | `KNOWLEDGE-LIFECYCLE.md`, `EVIDENCE-MODEL.md` | Only when recording a lesson or proposing expertise |

```bash
# STEP 0 addition (after slp-peer STEP 0 memory load):
cat .agents/skills/slp-peer-knowledge/references/COMMON-BASELINE.md
cat .agents/skills/slp-peer-knowledge/references/<ROLE>-BASELINE.md  # exactly one
# Supplemental: ONLY the file Lead named in ## Knowledge, if any.
```

Role → primary file map:

| Assignment `Role` | Primary file |
| :--- | :--- |
| Scout | `SCOUT-BASELINE.md` |
| Engineer | `ENGINEER-BASELINE.md` |
| Reviewer / Proof Auditor | `REVIEWER-BASELINE.md` |
| Designer | `DESIGNER-BASELINE.md` |

### 3.1 Role + Disposition (no baseline explosion)

- **Role = Peer identity** (who I am, default mandate, mutation policy).
- **Disposition = current task mode** (IMPLEMENT, AUDIT, INVESTIGATE, VERIFY,
  REVIEW, RESEARCH, DESIGN).
- A disposition NEVER creates a new baseline file (SPK-09). Example:
  `Role: ENGINEER` + `Disposition: AUDIT → IMPLEMENT` loads primary
  `ENGINEER-BASELINE` + supplemental `AUDIT-REVIEW-FRAGMENT` (only if Lead names it).
- Ambiguity in **authority/scope → MUST BLOCK** and escalate (SPK-10).
  Ambiguity in **knowledge → CONSULT/RESEARCH first** (SPK-11); BLOCK only when
  the missing knowledge prevents safe execution after consultation was tried.

### 3.2 Knowledge Envelope (what Peer expects from Lead)

Peer reads (never writes) this envelope section; Lead owns it:

```markdown
## Knowledge
### Primary — <ROLE>-BASELINE.md
### Supplemental — <named file or "none"> (+ exception reason if >1)
### Project Knowledge — <exact artifact paths, never "read everything">
### Known Unknowns — <open facts; CONSULT/RESEARCH allowed, BLOCK only if unsafe>
### Disposition — <IMPLEMENT | AUDIT | ...>
### Loading Rule — Load only the above. Do not discover unrelated knowledge.
```

## 4. Knowledge Lifecycle

Full spec: [KNOWLEDGE-LIFECYCLE.md](references/KNOWLEDGE-LIFECYCLE.md).
Evidence rules: [EVIDENCE-MODEL.md](references/EVIDENCE-MODEL.md).

```text
DISCOVER (what knowledge is relevant / explicitly provided / unknown)
  → LOAD (Tier-0 + 1 primary + ≤1 Lead-named supplemental)
  → APPLY (knowledge must affect implementation/decision, SPK-12)
  → VERIFY (slp-peer checks, as usual)
  → EXTRACT (ONLY when reusable — routine tasks MUST NOT manufacture lessons)
  → PROPOSE (ONLY when justified beyond the current task)
```

- Lesson format: `WHEN <context> → DO/DON'T <rule> BECAUSE <mechanism>`.
  Single-occurrence lesson = `provisional` until re-verified.
- Lesson pipeline ≠ expertise pipeline: a reusable lesson → knowledge proposal;
  repeated demonstrated capability → expertise proposal. Never equate
  "I learned X" with "I am good at X".

## 5. Completion Contract (Handback Addition)

Append to the standard `slp-peer` handback (do not replace any section).
`Applied` + `Impact` are REQUIRED when knowledge actually influenced the task;
omit (don't fabricate) when nothing was relevant.

**`NOTICE`/`MICRO` lanes (SPK-21):** omit the whole section unless knowledge actually influenced the task. Never emit `Used: ... / Discovered: none / Proposal: none` boilerplate for a mechanical edit.

```markdown
## Knowledge used / applied / impact / discovered / proposal
- **Used:** COMMON §<n> + <ROLE>-BASELINE §<n> (+ supplemental path if any)
- **Applied:** <which rule/checklist was used, 1 line>
- **Impact:** <chose Y instead of Z because of it, 1 line>
- **Discovered:** <1 reusable lesson or "none">
- **Proposal:** <knowledge or expertise proposal + evidence `<answer-path> — <verdict>` or "none">
  (Peer NEVER writes confidence levels; Lead decides promotion)
```

Then follow the normal 5-step completion sequence
(MEMORY → answer → `update_state.sh done` → compact → `[DONE]` via `slp-send.sh`).

`herdr-context/` is gitignored by design (solo). Proposals there are **ephemeral
runtime hints**, not durable records. Durable promotion (MEMORY.md, peers.json
evidence) is Lead's decision at acceptance.

## 6. Rules (SPK-01…SPK-20)

- **SPK-01** — `slp-peer-knowledge` is mandatory for every Peer.
- **SPK-02** — Mandatory activation does not imply mandatory heavy loading.
- **SPK-03** — Tier-0 COMMON is always loaded.
- **SPK-04** — Exactly one Primary Role Baseline is loaded.
- **SPK-05** — At most one Supplemental Knowledge artifact by default.
- **SPK-06** — Supplemental MUST be explicitly named by Lead.
- **SPK-07** — Peer MUST NOT autonomously expand knowledge loading.
- **SPK-08** — Role defines identity; Disposition defines task mode.
- **SPK-09** — Disposition does not create a new Role Baseline.
- **SPK-10** — Authority or scope ambiguity MUST BLOCK.
- **SPK-11** — Knowledge ambiguity SHOULD CONSULT/RESEARCH before BLOCK.
- **SPK-12** — Knowledge must be applied, not merely listed.
- **SPK-13** — Handback MUST distinguish Used / Applied / Impact / Discovered / Proposal — except the `NOTICE`/`MICRO` lanes, which omit the whole section unless knowledge actually influenced the task (SPK-21).
- **SPK-14** — Extract is conditional; routine tasks MUST NOT manufacture lessons.
- **SPK-15** — Peer may PROPOSE expertise changes but MUST NOT PROMOTE them.
- **SPK-16** — Answer artifacts are evidence sources; expertise is derived state.
- **SPK-17** — Repeated verified failure may reduce confidence or add restriction.
- **SPK-18** — No K0–K3 classification is required in v1.1.
- **SPK-19** — No engine-specific skill taxonomy (Codex/Pi/OMP read the same skill).
- **SPK-20** — No artifact is loaded solely because it exists.
- **SPK-21** — `NOTICE`/`MICRO` lanes: Tier-0 + 1 primary still load as usual, but the completion omits the whole `Knowledge used / ...` section unless knowledge changed the outcome. Routine spec-execution is not a lesson (see SPK-14).
- **SPK-22** — The role MUST be one of `scout | engineer | reviewer | designer`. There is no `generalist` role and no `GENERALIST-BASELINE.md`; a role that cannot be resolved is a hard error at open time (`slp-open.sh` exit 2), never a silent downgrade to "load COMMON only" (which would violate SPK-04).

## 7. Anti-Patterns (forbidden)

| # | Anti-pattern | Meaning |
| :--- | :--- | :--- |
| 1 | KNOWLEDGE DUMP | Load everything "to be safe" |
| 2 | KNOWLEDGE THEATER | List `Used` without Applied/Impact |
| 3 | LESSON FACTORY | Manufacture a lesson per task |
| 4 | SELF-PROMOTION | Self-raise expertise/confidence |
| 5 | AUTHORITY BLEED | Open knowledge outside the envelope |
| 6 | ROLE EXPLOSION | New baseline per disposition |
| 7 | SUPPLEMENTAL CREEP | Self-add beyond the named supplemental |
| 8 | KNOWLEDGE BLOCKING | BLOCK on a small missing fact instead of CONSULT/RESEARCH first |
| 9 | KNOWLEDGE BYPASS | Ignore Lead-named knowledge, substitute personal assumption |
| 10 | KNOWLEDGE POLLUTION | Push speculative/one-off details into reusable knowledge |
| 11 | EVIDENCE OVERCLAIM | Claim capability from Used/Discovered without Applied/Impact/Verification |
| 12 | ENGINE COUPLING | Fork skill content per engine |
