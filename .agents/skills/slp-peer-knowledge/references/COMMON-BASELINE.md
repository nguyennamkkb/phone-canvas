# COMMON BASELINE — All roles (Tier 0, always load)

> Orientation + shared rules. Every Peer reads this file first, then opens exactly 1 Tier-1 file for its role.

## 1. Mandate

- Working language: Markdown artifacts (`NNN-request`, `NNN-answer`, decision record, MEMORY).
- Every claim must trace to: file, line, command output, or answer-path. No verbal claims.
- Separate **Observed** (read/ran/seen) vs **Inferred** (reasoned, guessed). Never mix.

## 2. Core Knowledge (checklist)

- [ ] Read the assignment envelope correctly: `## Outcome` (objective / done-when / stop-when), `## Scope` (Owned / Excluded / lease), `## Verify` (required checks).
- [ ] Read `_state/MEMORY.md` + `context-compact.md` to avoid violating old constraints — ONCE per session; on later tasks run `state_fingerprint.sh` and re-read (tailing deltas) only on sha change.
- [ ] All timestamps **inside** an artifact are fresh UTC: `date -u +%Y-%m-%dT%H:%M:%SZ`. Never copy sample timestamps. A **filename** date is different: it is the local date (`date +%F`) and the artifact tool writes it — never build an artifact name yourself, never use `date -u` for one.
- [ ] All findings cited as `file:line` (e.g. `AudioEngine.swift:42`).
- [ ] Complete the task in the shape its lane requires: **`NOTICE`/`MICRO`** → no file; ONE evidence line via `update_state.sh note` (§4). **`STANDARD`** → handback file: Disposition + Scope + Changes/Findings + Verification + Residuals + Incidental + Sentinel. **`FULL`** → same as `STANDARD`, one handback per council seat. Lanes are **no files: `NOTICE`/`MICRO` · file: `STANDARD` · council: `FULL`**.

## 3. Method Steps

1. Identify Role/Disposition in the request → open exactly 1 Tier-1 file (scout/engineer/reviewer/designer).
2. Cross-check Owned scope vs MEMORY constraints before acting.
3. Work inside bounds; record evidence as you go (don't reconstruct it at the end).
4. Complete per lane: **`NOTICE`/`MICRO`** → one evidence line via `update_state.sh note` (no file); **`STANDARD`/`FULL`** → write the handback + `Knowledge used / discovered / proposal` section (per SKILL.md §5). For `NOTICE`/`MICRO`, skip the Knowledge section unless knowledge changed the outcome (SPK-21).

## 4. Output Template (minimum)

```markdown
**Disposition:** CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT
## Scope actually handled — <files/dirs touched or read>
## Changes or findings — <bullets + file:line>
## Verification and exact results — <real command + output>
## Residual risks / Unknowns — <what is unverified, who decides>
## Incidental discoveries — <seen out of scope, do NOT fix>
## Terminal sentinel — TASK_COMPLETE | BLOCKED: <reason>
```

**`NOTICE`/`MICRO` minimum — no file, one line:**

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note "$WORKER_NAME" "<NNN>" CONFIRM "<evidence>"
# MICRO      : <path>:<line> what changed · numstat totals · proof receipt (rg/build)
# pure delete: <path>:<range> removed · rg <symbol> -> 0 · build receipt
# NOTICE     : <exact command> -> exit <code>, <output>
```
`note` appends that line to `_state/tasklog.md` (the append-only record `taskctl.sh sync` reads
if the `[DONE]` message is lost) and sends the `[DONE]` callback. If the evidence does not fit
in one line, the task was not a `NOTICE`/`MICRO` lane → `PARTIAL: needs STANDARD`.

Finish with the one-command completion duty — `finish` for `STANDARD`/`FULL` (writes/validates the handback file),
`note` for `NOTICE`/`MICRO` (no file):
```bash
bash .agents/skills/slp-state/scripts/update_state.sh finish "$WORKER_NAME" "<NNN>" "<answer-path>" CONFIRM "<summary>"
bash .agents/skills/slp-state/scripts/update_state.sh note   "$WORKER_NAME" "<NNN>" CONFIRM "<evidence>"
```

## 5. Verification Bar

- Never report `done` via chat/`idle`. Only `TASK_COMPLETE` when artifacts + checks satisfy the request.
- Untouched layers stay `NOT TESTED` / `UNKNOWN` / `BLOCKED`. Never round up to PASS.
- `BLOCKED` / `CHALLENGE` / `DEPENDENCY_REQUEST` are valid handbacks, not failures.

## 6. Boundaries & Hard-Stops (override schedule pressure)

1. **Scope:** mutate only `Owned scope`. Out-of-scope bugs → Incidental, don't fix.
2. **Missing prerequisite / new dependency** → STOP, return `BLOCKED + DEPENDENCY_REQUEST`. Never guess a replacement contract.
3. **Error repeating ≥2 times with the same mechanism** → STOP, no hacky workarounds, report the missing capability.
4. **Missing tool** → fail closed `BLOCKED`. Never emulate via another shell/API.
5. **No-write lease** (scout/reviewer/designer) → never edit project files. Finding → report it, don't fix silently.
6. **External effects** (push/deploy/delete/spend/send message) → DENIED unless the lease says so. Violation = Human decision missing.

## 7. Common Failure Modes

- Fabricating a contract when the spec is vague → write UNKNOWN + ask Lead.
- Mixing inference into fact → label every inference `Inferred`.
- Stuffing full docs/baselines into request/answer → use path pointers only.
- Self-claiming expertise without evidence → propose with answer-path only; Lead decides promotion.
