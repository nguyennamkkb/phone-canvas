---
name: slp-peer
description: Process a delegated assignment from `herdr-context/<peer>/NNN-request-*.md` as an independent peer agent. Follows bounded scope, provides technical judgment, produces structured Handback evidence, and manages atomic state transitions.
---

# SLP PEER: INDEPENDENT EXECUTION & EVIDENCE HANDBACK

## 1. Role Authority & Boundaries
Peer is an **independent technical coworker** operating within a bounded assignment.
- **Peer owns:** Technical investigation, clean bounded execution, generating verifiable proof for own mutations, updating personal long-term memory (`_state/MEMORY.md`), and honest verdict reporting (`CONFIRM`, `PARTIAL`, `CHALLENGE`, `BLOCKED`).
- **Peer DOES NOT:**
  - ❌ Manage topology or spawn other agent processes.
  - ❌ Expand scope beyond `Owned scope` (even if noticing other bugs nearby).
  - ❌ Accept project-level candidates (acceptance belongs solely to Lead).
  - ❌ Perform external effects (push/deploy/delete/spend) without explicit lease.
  - ❌ Edit files when disposition is `Reviewer`, `Scout`, or `no-write`.

For real-world handback samples across dispositions: [Handback Examples](references/HANDBACK_EXAMPLES.md).

---

## 2. Invariant Execution Rules (MUST FOLLOW)

1. **Strict Bounded Scope:** Only mutate files explicitly enumerated in `Owned scope`. Incidental bugs found outside scope MUST be reported under `## Incidental discoveries` in the handback, NOT fixed directly.
2. **Dependency Hard-Stop:** If task execution uncovers a missing prerequisite or architectural dependency $\rightarrow$ **STOP mutation immediately**, do NOT assume the missing contract, and return `Disposition: BLOCKED` with a `DEPENDENCY_REQUEST`.
3. **Repeated Failure Hard-Stop:** If an error repeats $\ge 2$ times with the same root mechanism $\rightarrow$ **STOP retrying**, do NOT apply hacky workarounds, and report `BLOCKED` with the exact missing capability/tool.
4. **No Tool Emulation:** If an assignment requires a specific tool that is unavailable, do NOT attempt to emulate it via shell scripts. Fail closed with `BLOCKED`.
5. **Fresh Timestamps Only:** Always generate fresh UTC timestamps with `date -u +%Y-%m-%dT%H:%M:%SZ` at the moment of writing artifacts. Never copy-paste timestamps from examples or previous runs.
6. **Lane Expansion Hard-Stop.** The four lanes are `NOTICE`, `MICRO`, `STANDARD`, `FULL`
   (no files: `NOTICE`/`MICRO` · file: `STANDARD` · council: `FULL`); Lead records the lane on the task. If the work is bigger than the
   assigned lane, **STOP immediately** and escalate — never silently expand:
   - a **`MICRO`** task needing >15 risk-bearing lines (insertions + modified; a verbatim-quoted
     deletion block is free), a 4th file, or any discovery/judgment → `PARTIAL: needs STANDARD`
   - a **`NOTICE`** task that turns out to need a file mutation → `PARTIAL: needs STANDARD`
   - a **`STANDARD`** task needing a second seat or an unpinnable candidate → `PARTIAL: needs FULL`

---

## 3. Step-by-Step Execution Workflow

### STEP 0 — Self-Detection, Context & Memory Carry-Forward (REQUIRED)

**Read-once rule:** in one live session you already hold carried state in conversation. Full-load (0.2–0.3) runs ONCE — first task or after `--restored`. On every later task run ONLY the fingerprint gate (0.0) after 0.1; re-read solely what changed (see [slp-state §5](../slp-state/SKILL.md)).

```bash
# 0.1 Extract identity from request path (always — cheap, no file content)
WORKER_NAME=$(echo "<request-path>" | sed -E 's|herdr-context/([^/]+)/.*|\1|')

# 0.0 Fingerprint gate (~11 lines out; every task after the first in this session)
bash .agents/skills/slp-state/scripts/state_fingerprint.sh "$WORKER_NAME"
# `fp:` token identical to recorded → skip 0.2–0.3 entirely, go to STEP 0b.
# A MEMORY sha moved Lx → Ly (y > x) → tail -n <y-x> that file only, update recorded token.
# Counters moved → re-read status.json (standing directives may have changed).
# No recorded token yet → run 0.1–0.5 in full, then record the `fp:` token.

# 0.2 Load Long-Term Memories (FIRST LOAD ONLY — gated by 0.0 afterwards)
GLOBAL_MEM="herdr-context/MEMORY.md"
PEER_MEM="herdr-context/$WORKER_NAME/_state/MEMORY.md"
[ -f "$GLOBAL_MEM" ] && cat "$GLOBAL_MEM"
[ -f "$PEER_MEM" ] && cat "$PEER_MEM"

# 0.3 Load carried operational state & compact cache (FIRST LOAD ONLY — gated by 0.0 afterwards)
STATE="herdr-context/$WORKER_NAME/_state/status.json"
COMPACT="herdr-context/$WORKER_NAME/_state/context-compact.md"
[ -f "$STATE" ] && cat "$STATE"
[ -f "$COMPACT" ] && cat "$COMPACT"

# 0.4 Read assigned role from registry
REGISTRY="herdr-context/_registry/peers.json"
[ -f "$REGISTRY" ] && jq --arg w "$WORKER_NAME" '.peers[$w] // null' "$REGISTRY"

# 0.5 Mark state as busy
bash .agents/skills/slp-state/scripts/update_state.sh start "$WORKER_NAME" "<NNN>"
```

### STEP 0b — Load Role Baseline (slp-peer-knowledge, MANDATORY)
```bash
cat .agents/skills/slp-peer-knowledge/references/COMMON-BASELINE.md
# Then load EXACTLY ONE primary file matching assignment Role:
# SCOUT-BASELINE.md | ENGINEER-BASELINE.md | REVIEWER-BASELINE.md | DESIGNER-BASELINE.md
# Supplemental: ONLY the file Lead named in ## Knowledge (max 1 by default).
# Authority/scope ambiguity → BLOCKED. Knowledge ambiguity → CONSULT/RESEARCH first.
```
Contract: [slp-peer-knowledge SKILL §3](../slp-peer-knowledge/SKILL.md).

### STEP 1 — Read the Assignment
- **`STANDARD`/`FULL`**: read the full request file at `herdr-context/<WORKER_NAME>/NNN-request-*.md`.
  Inspect `## Outcome` (objective / done-when / stop-when), `## Scope` (Owned / Excluded / lease),
  and `## Verify` (the required checks).
- **`NOTICE`/`MICRO`**: there is no file — the assignment is the `slp-send.sh` message
  itself (`Task #NNN (A/…)`). It names the exact edit or command and the proof to report; `#NNN`
  is the task id you must echo in your `note` command (§4.3).
- Cross-reference with `_state/MEMORY.md` to ensure no hard constraints or quirks are violated.

### STEP 2 — Plan & Investigate
- Survey existing code (`grep_search`, `view_file`) within allowed bounds.
- If external factual clarification is needed:
  - **1 Fact, Zero/Low Impact:** Send a direct message via `slp-collab` using `bash .agents/skills/slp-collab/scripts/slp-send.sh <peer-name> "<question>"`; the script does not wait for a reply.
  - **Decision / Scope Change:** Write consultation request for Lead.

### STEP 3 — Execute & Verify
- Implement changes strictly within `Owned scope`.
- Run all checks specified in `## Required checks` (unit tests, syntax checks, diff inspections).

### STEP 4 — Update Personal Memory & Write Handback Artifact

#### 4.1 Update Personal `_state/MEMORY.md`
If this task revealed a valuable technical lesson, framework quirk, or recurring pattern, append it to `herdr-context/<WORKER_NAME>/_state/MEMORY.md` under the appropriate heading.

#### 4.2 Create the Handback Artifact — `STANDARD`/`FULL` only

`NOTICE`/`MICRO` complete with a one-line note instead (§4.3). For `STANDARD`/`FULL`, create the
file with the shared tool — it names it canonically (`<NNN>-answer-<local date>-<slug>`, slug from
the task title) and fills the header. **Never hand-name an artifact and never run `date -u` for a
filename.** Pipe the body; omit it to get the section skeleton instead.

```bash
ANSWER=$(bash .agents/skills/slp-collab/scripts/slp-send.sh answer "$WORKER_NAME" "<NNN>" <VERDICT> <<'EOF'
## Scope actually handled
- <…>
EOF
)
# prints the path and the ready-to-run `finish` line
```

The shape it writes (fill the body; the header is already correct):

```markdown
# HANDBACK NNN — <short title>

**Disposition:** <CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT>

## Scope actually handled
- <List of files/directories modified or inspected>

## Changes or findings
- <Concise bullet points with file:line citations of exact changes or findings>

## Verification and exact results
- <Command outputs, diff summaries, or test receipts matching Required checks>

## Residual risks / Unknowns
- <Assumptions that could not be verified>
- <Known risks requiring Lead decision>

## Incidental discoveries & Memory Updates
- <Issues observed outside assigned scope; left for Lead triage>
- <Key lessons appended to personal _state/MEMORY.md>

## Knowledge used / applied / impact / discovered / proposal
- **Used:** <COMMON §n + <ROLE>-BASELINE §n (+ supplemental path if Lead named one); or "none relevant">
- **Applied:** <Which rule was used, 1 line — omit (don't fabricate) if nothing influenced the task>
- **Impact:** <Chose Y instead of Z because of it, 1 line — omit if none>
- **Discovered:** <1 reusable lesson `WHEN → DO/DON'T BECAUSE` or "none">
- **Proposal:** <knowledge/expertise proposal + evidence `<answer-path> — <verdict>` or "none">
  (Never write confidence levels; Lead decides promotion. Rules: [slp-peer-knowledge EVIDENCE-MODEL](../slp-peer-knowledge/references/EVIDENCE-MODEL.md))

## Terminal sentinel
- `TASK_COMPLETE` or `BLOCKED: <exact reason>`
```
*(See full templates: [references/HANDBACK_EXAMPLES.md](references/HANDBACK_EXAMPLES.md))*

#### 4.3 `NOTICE` / `MICRO` completion — NO handback file

A `NOTICE`/`MICRO` task has **no answer file**: Lead's request was a message, so your completion is a
message too. Put the evidence in ONE line and run:

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note "$WORKER_NAME" "<NNN>" CONFIRM "<one-line evidence>"
```

That transitions `_state/` to idle, appends the line to `_state/tasklog.md` (so a missed `[DONE]`
can still be reconciled by `taskctl.sh sync`), and sends `[DONE] <peer>: #<NNN> CONFIRM — <evidence>`.

What the one line must contain, by kind:

- **`MICRO` (small write):** `<path>:<line>` what changed · `git diff --numstat` totals ·
  the build/proof receipt. Example:
  `JournalListView.swift:44 removed dailyPromptCard call site; 71/73 numstat; rg dailyPromptCard -> 0; xcodebuild -> BUILD SUCCEEDED`
- **Pure deletion:** `<path>:<line-range>` what was removed · `rg <symbol>` repo-wide → 0 · build receipt.
- **`NOTICE` (no write):** the exact command and its exit/output.
  Example: `slp-send.sh Lead "[MSG] ..." -> exit 0, delivered`

If it does not fit in one line, it is **not** a `NOTICE`/`MICRO` task → `PARTIAL: needs STANDARD` and let Lead
re-dispatch with a real envelope. Do not write a handback file for these lanes; do not skip the
`note` command.

---

## 5. Completion Sequence & Callback Invariants (ONE command, DO NOT SKIP)

A task is complete only when the evidence exists **and** `_state/` **and** Lead's
task record all reflect it. The completion command depends on the lane:

```text
NOTICE / MICRO                         STANDARD / FULL
[1. _state/MEMORY.md if a lesson]      [1. _state/MEMORY.md if a lesson]   (conditional)
              ↓                                      ↓
[2. (no file)]                         [2. Write Handback File (NNN-answer-...)]
              ↓                                      ↓
[3. update_state.sh note <peer>        [3. update_state.sh finish <peer> <NNN>
     <NNN> <VERDICT> "<evidence>"]         <answer> <VERDICT> "<summary>"]
         ↳ state → idle, 1 line into             ↳ validates the handback, state → idle,
           _state/tasklog.md, canonical              compact refreshed, canonical [DONE]
           [DONE] callback to Lead                   callback to Lead
```

### Script Execution (the normal path — one command):
```bash
NNN="<NNN>"
WORKER_NAME="<peer-name>"
VERDICT="CONFIRM"        # CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT
SUMMARY="<One-line concise summary of handback verdict>"

# 1. Create the answer file. The tool names it (local date + slug), fills the header,
#    and prints the exact `finish` line to run. Body from stdin.
ANSWER_PATH=$(bash .agents/skills/slp-collab/scripts/slp-send.sh answer "$WORKER_NAME" "$NNN" "$VERDICT" <<'EOF'
## Scope actually handled
- <…>
EOF
)

# 2. Complete (or paste the line the tool printed).
bash .agents/skills/slp-state/scripts/update_state.sh finish "$WORKER_NAME" "$NNN" "$ANSWER_PATH" "$VERDICT" "$SUMMARY"
```

**`NOTICE`/`MICRO` use `note` instead** — there is no answer file to write or validate
(slp-peer §4.3):

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note "$WORKER_NAME" "$NNN" "$VERDICT" "<one-line evidence>"
```

`finish` validates the handback (must contain `**Disposition:**` or `## Terminal sentinel`), rejects an unknown verdict, and **builds the `[DONE]` message itself** — so the callback format cannot drift. If the send fails it says so and the state update still stands; retry only the notification command it prints.

The verdict is your **assessment of the artifact**, not the task's status: any of the five
(`CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT`) means you finished, so the task
is recorded `done`. Lead accepts it separately — that never overwrites what you reported.

### When NOT to use `finish`/`note`
`BLOCKED` is not a completion verdict (the task must be closed as blocked by Lead). For `NOTICE`/`MICRO` use
`update_state.sh done <peer> <NNN> "" "<reason>"`, then the `[BLOCKED]` message:
```bash
bash .agents/skills/slp-state/scripts/update_state.sh done "$WORKER_NAME" "$NNN" "$ANSWER_PATH" "$SUMMARY"
bash .agents/skills/slp-collab/scripts/slp-send.sh Lead "[BLOCKED] $WORKER_NAME: $ANSWER_PATH — BLOCKED: <reason>"
```
Use `done` alone whenever you must notify Lead separately (blocked, dependency request, council reply).

*Rule: Never close a parent task while a blocking consultation is still pending!*

*`NOTICE`/`MICRO` lanes:* step 1 is skipped unless a genuinely reusable lesson exists (routine execution is not a lesson). Step 2 is just the one-line evidence from §4.3 — no handback file. Both `finish` and `note` do the compact refresh — never run `compile_compact.sh` manually.
