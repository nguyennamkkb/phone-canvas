# KNOWLEDGE LIFECYCLE — DISCOVER → LOAD → APPLY → VERIFY → EXTRACT → PROPOSE (v1.1)

> Turns "task done" into "lesson learned". Runs inside slp-peer-knowledge,
> never interferes with slp-peer execution. EXTRACT/PROPOSE are conditional.

## 1. DISCOVER — what baseline does the task need

- Read the assignment `Role` → exactly 1 primary Tier-1 file (map in SKILL.md §3).
- Read the `## Knowledge` envelope: Supplemental (≤1, Lead-named), Project Knowledge
  (exact paths), Known Unknowns, Disposition.
- Disposition ≠ new Role. `Role: ENGINEER + Disposition: AUDIT → IMPLEMENT` stays
  primary ENGINEER; the audit fragment loads only if Lead lists it.
- Ambiguous **authority/scope → BLOCKED** (SPK-10). Ambiguous **knowledge →
  CONSULT/RESEARCH first** (SPK-11); BLOCK only when safe execution is still
  impossible after consultation.

## 2. LOAD — read exactly what's allowed (SPK-03…SPK-07, SPK-20)

```bash
cat .agents/skills/slp-peer-knowledge/references/COMMON-BASELINE.md
cat .agents/skills/slp-peer-knowledge/references/<ROLE>-BASELINE.md  # exactly 1 file
# Supplemental: ONLY the file Lead named in the envelope (if any). Never self-add.
```

- Never load 2 primaries per task. Never paste full text into request/answer (path pointers).
- `>1 supplemental` = exception, requires Lead's reason in the envelope.

## 3. APPLY — knowledge must affect the task (SPK-12)

- Every `Used` knowledge needs a matching `Applied`: *which rule went into which
  decision/implementation*.
- One line: *used rule X to choose Y instead of Z*. No real effect →
  no Applied (never fabricate).

## 4. VERIFY — verify like slp-peer always does

- Output still passes the request's Required checks. Knowledge never replaces tests,
  diffs, or typechecks.

## 5. EXTRACT — only when reusable (SPK-14)

- Conditions: reusable + stable + project-relevant. Most routine tasks →
  `Discovered: none`. Never manufacture lessons to meet a quota (LESSON FACTORY).
- Format: `WHEN <context> → DO/DON'T <rule> BECAUSE <mechanism>`.
- Seen once → label `provisional`; becomes a rule only after re-verification.

## 6. PROPOSE — only when it outlives the current task (SPK-15)

- Two independent pipelines:
  - Reusable lesson → **knowledge proposal**.
  - Repeated demonstrated capability → **expertise proposal**.
- Never equate "I learned X" with "I am good at X".
- Max 1 proposal per type per task. Attach evidence `<answer-path> — <verdict>`.
- Peer writes NO confidence level, edits NO `peers.json`/global MEMORY.
- Lead at acceptance: `PROPOSED → ACCEPTED / REJECTED / DEFERRED`;
  ACCEPTED ≠ ESTABLISHED (see EVIDENCE-MODEL).
