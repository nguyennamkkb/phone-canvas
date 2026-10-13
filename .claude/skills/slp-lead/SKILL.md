---
name: slp-lead
description: Orchestrate project execution, task delegation, Council arbitration, reconciliation, and acceptance in Herdr. Use when Human assigns a goal, when delegating tasks to peers via Assignment Envelopes, or when reconciling multiple independent viewpoints.
---

# SLP LEAD: PROJECT EXECUTION & BINDING ARBITER

> **RULE — TASK LIFECYCLE PAIRING (REQUIRED):** every `slp-send.sh` dispatch
> MUST be paired with a `taskctl.sh` record in this exact order:
> `taskctl.sh new` → `taskctl.sh dispatch` → `slp-send.sh <peer>`.
> When a peer reports `[DONE]`, the callback has already recorded completion;
> Lead records acceptance with `taskctl.sh verify <id> <verdict>` (idempotent).
> `slp-send.sh` only delivers messages; `taskctl.sh` owns the project memory.
> Details: [STEP 3](#step-3--atomic-dispatch--yield-control-no-polling),
> [STEP 4](#step-4--reactive-wakeup--acceptance-verification).

## 1. Role Authority & Boundaries
Lead is the **sole brain and binding arbiter** of the execution plane.
- **Lead owns:** Problem framing, long-term global memory curation (`MEMORY.md`), smallest useful topology, capability routing, mandatory skill binding, single-writer moving scope assignment, dependency arbitration, candidate integration, and engineering acceptance within Human lease.
- **HARD PROHIBITIONS:**
  - ❌ **ANTI-SOLO RULE:** Lead MUST NEVER impersonate a Peer to write code, write deliverables, or create `NNN-answer-*.md` files in the same process/session.
  - ❌ **NO POLLING / BUSY-WAIT (NO POLLING INVARIANT):** Lead MUST NEVER run `sleep` loops, check files continuously, or poll status while waiting for a Peer. After dispatch, Lead **MUST STOP CALLING TOOLS** (end the turn). The system is fully *Event-Driven* — the Peer will automatically call `bash .agents/skills/slp-collab/scripts/slp-send.sh` to wake Lead with results!
  - ❌ Pre-solve tasks or inject biased opinions into independent decision lanes.
  - ❌ Implement material code changes while simultaneously self-accepting them.
  - ❌ Exceed owner-only boundaries retained by Human (push/deploy/delete/spend).

Detailed council rules and 8-axis reconcile matrix: [Council & Reconciliation Playbook](references/COUNCIL_AND_RECONCILE.md).

Lead knowledge checklists (load ONE per step, never peer baselines in full):
[LEAD-COMMON](references/LEAD-COMMON.md) · [FRAMING-DECOMPOSITION](references/FRAMING-DECOMPOSITION.md) ·
[KNOWLEDGE-RISK](references/KNOWLEDGE-RISK.md) · [ENVELOPE-AUTHORING](references/ENVELOPE-AUTHORING.md) ·
[RECONCILE-ACCEPTANCE](references/RECONCILE-ACCEPTANCE.md) · [PROMOTION-MEMORY](references/PROMOTION-MEMORY.md).

---

## 2. Pre-Flight Delegation Invariants (REQUIRED BEFORE DELEGATION)

Before writing any assignment envelope or pinging a peer, Lead MUST verify:
1. **Target Availability:** The selected peer is in `state == "idle"` (verified via `_state/status.json`). Never assign a new task to a `busy` peer without user confirmation.
2. **Physical Process Separation:** Task MUST be dispatched to an external pane/process via `bash .agents/skills/slp-collab/scripts/slp-send.sh`. If no peer exists, Lead MUST report `BLOCKED: Awaiting peer execution` instead of self-executing.
3. **Skill Mention:** Assignment envelopes & dispatch prompts MUST specify the required skills: `slp-peer`, `slp-peer-knowledge`, `slp-state`, `slp-collab`.
4. **Pure Asynchronous Dispatch (No Polling):** Lead sends the assignment with explicit callback coordinates, then immediately yields control.
5. **Single-Writer Moving Scope:** No other active peer has write permissions on the same files/directories. If two tasks touch the same module, serialize them.
6. **No-Write Enforcement:** If assigning a `Reviewer`, `Scout`, or `Designer` role, verify that the runtime environment strictly enforces `no-write` (read-only lease).
7. **Candidate State Pinned:** Record the exact commit hash **plus the patch digest**
   (`git diff <base> -- <paths> | shasum -a 256`) before delegation. A hash alone does not pin a
   dirty working tree, and a `--numstat` count does not prove the content is unchanged.

---

## 3. Step-by-Step Workflow

### STEP 0 — Discover Peers & Resolve Targets
```bash
# Resolve coordinates using slp-roster script
bash .agents/skills/slp-roster/scripts/resolve_target.sh scout-omp
```

### STEP 1 — Intake, Memory Check & Topology Selection
- **Lead baseline (REQUIRED):** read [LEAD-COMMON](references/LEAD-COMMON.md) +
  [FRAMING-DECOMPOSITION](references/FRAMING-DECOMPOSITION.md) + [KNOWLEDGE-RISK](references/KNOWLEDGE-RISK.md).
  Write a Decomposition Record when SPLIT or in doubt.
- **Read Global Long-Term Memory (REQUIRED, once per session):**
  Full-read `herdr-context/MEMORY.md` on your first task (or after restart) to ensure newly framed tasks respect established architecture patterns and hard invariants. On later tasks run `bash .agents/skills/slp-state/scripts/state_fingerprint.sh <peer>`-class gating instead — re-read (tailing deltas) ONLY on sha change; your in-conversation copy is current by default (see [slp-state §5](../slp-state/SKILL.md)).
- **One-Sentence Problem Statement:**
  > *"For [person/system], achieve [outcome] within [boundary], because [impact], without [excluded effect]."*
- **Lane Rule (classify first — before topology):** four lanes, three ceremony levels.
  **no files: `NOTICE`/`MICRO` · file: `STANDARD` · council: `FULL`.** Pick the lowest lane whose gates hold; **if unsure, go
  one level UP.** Record it on the task with `--lane=` so the ledger and dashboard show it.
  - **A — `NOTICE`** (no file mutated): a directed message, handshake/connectivity check,
    policy acknowledgement, or consult answer. Message + task record only.
  - **A — `MICRO`** (small write): ALL of — risk-bearing lines (insertions + modified) ≤15
    across ≤3 files, no new file (deleting a block quoted verbatim is free), no new
    token/schema/API/export format, reversible with one command, every edit fully specified
    (no discovery), and the work is the literal application of an already-approved decision
    (`NNN-answer §MFk`, an accepted finding `§MAJOR-k|MINOR-k`, or a direct Human instruction).
    Message + task record only ([ENVELOPE-AUTHORING §3](references/ENVELOPE-AUTHORING.md)).
  - **B — `STANDARD`**: clear scope, single writer, but it needs investigation, design
    judgment, or touches a contract surface. → full envelope **file** + handback **file**.
  - **C — `FULL`**: ANY of new architecture/contract surface, irreversible, cannot be a single
    writer, or ≥2 peers needed. → envelope per council seat (2–3 lanes) + 8-axis reconcile
    ([ENVELOPE-AUTHORING §5](references/ENVELOPE-AUTHORING.md)); + Supervisor across workspaces.
  - **A lanes write no files:** no request file, no answer file. The dispatch *message* is the
    envelope and `update_state.sh note` is the handback. This is the token-saving lane — but
    the lane is a **paper** lane, not an authority lane: **every lane dispatches to a Peer pane.
    ANTI-SOLO (§1) is unchanged.**
  - **Escalate, never expand:** `NOTICE`/`MICRO` → `STANDARD` (`PARTIAL: needs STANDARD`), `STANDARD` → `FULL` (`PARTIAL: needs FULL`). The peer may
    escalate upward at any time; Lead is the one who classifies.
- **Topology Rule (Smallest Useful Topology):**
  - Small, local, reversible MICRO task $\rightarrow$ **1 Delivery Peer** (single round trip).
  - Clear scope, 1 writer $\rightarrow$ **Lead + 1 Delivery Peer**.
  - New domain, critical architecture, large blast radius $\rightarrow$ **Lead + Sealed Council (2-3 Lanes)**.
  - Long-running project, multiple workspaces $\rightarrow$ **Lead + Supervisor**.

### STEP 2 — Construct Assignment Envelope
- **`MICRO`/`NOTICE`** → **write NO file.** The dispatch message at STEP 3 carries the
  envelope ([ENVELOPE-AUTHORING §3](references/ENVELOPE-AUTHORING.md) / [§4](references/ENVELOPE-AUTHORING.md)):
  the ask, the exact edit or command, and the proof to report. `#NNN` must be in it.
- **`STANDARD` / `FULL`** → create the file with `slp-send.sh request`, which names it canonically
  and fills the 2-line header; then fill the body per [ENVELOPE-AUTHORING §1](references/ENVELOPE-AUTHORING.md)
  (Outcome / Scope / Knowledge / Verify / Done). For `FULL`, one envelope per council seat.
  **Never hand-name an artifact and never run `date -u` for a filename** — the date part is the
  local date and the tool owns it.
**`STANDARD`/`FULL` only** — the tool creates and names the request file:

```markdown
# NNN — <short title>
Lane: <STANDARD|FULL> · lease: <no-write | write: <exact paths> | DENIED> · origin: <Human <ref> | review <NNN>#<ID> | MEMORY §n>

## Outcome
- <objective, 1 sentence> · Done when: <observable criteria> · Stop when: <what returns BLOCKED>

## Scope
- Owned: <exact files/dirs permitted to mutate — ONE WRITER ONLY> · Excluded: <forbidden paths> · External effects: <DENIED | authorized list>

## Knowledge
- Primary: <SCOUT- | ENGINEER- | REVIEWER- | DESIGNER-BASELINE.md per Role> · Supplemental: <Lead-named file or "none"; max 1 by default, 2nd needs exception + reason> · Disposition: <IMPLEMENT | AUDIT | INVESTIGATE | VERIFY | REVIEW | RESEARCH | DESIGN>
- Project: <exact artifact paths, never "read everything"> · Known unknowns: <open facts; Peer may CONSULT/RESEARCH, BLOCK only if unsafe>
- Loading rule: load only the above. Do not discover unrelated knowledge.
  (Contract: [slp-peer-knowledge §3](../slp-peer-knowledge/SKILL.md))

## Verify
- <e.g. focused tests, diff verification, typecheck — the exact commands and the results to report>

## Done
- Create the answer with `slp-send.sh answer <peer> <NNN> <VERDICT>` (it names the file and prints
  the ready `finish` line), then run `update_state.sh finish` — it builds the `[DONE]` callback
  itself; never hand-name the file and never hand-write the callback. (Acceptance owner: Lead.)
```

**Do NOT restate what the path already says.** Peer, role, engine, date and the four
`Skills:` are derivable from `<peer>/NNN-request-YYYY-MM-DD-*.md`, the registry and
`tasks.json`, and `slp-open` already injects the skills + role knowledge. There is no
Identity block: the header is exactly the 2 lines above.

### STEP 3 — Atomic Dispatch & Yield Control (NO POLLING)

> **Task lifecycle pairing (REQUIRED):** every `slp-send.sh` dispatch MUST
> have a matching `taskctl.sh` record, in this exact order:
>
> 1. `taskctl.sh new <peer> "<title>"` → captures ID, writes request path.
> 2. `taskctl.sh dispatch <id>` → records dispatch event.
> 3. `slp-send.sh <peer> "..."` → delivers the assignment.
>
> Rationale: `slp-send.sh` delivers the message; `taskctl.sh` owns the
> project memory. Without the task record, `DASHBOARD.md` goes stale and
> the next Lead session cannot reconstruct who is doing what.

Lead sends a concise dispatch naming the skills and callback instructions, then **STOPS CALLING TOOLS** to yield to the Peer:

```bash
# 1. Create the request file (prints the path; names it <NNN>-request-<local date>-<slug>).
#    Body comes from stdin — omit it to get the section skeleton instead.
REQ_PATH=$(bash .agents/skills/slp-collab/scripts/slp-send.sh request "<peer>" auto "<short title>" \
  --lane=standard --lease="write: <paths>" --origin="<Human | review NNN#ID | MEMORY §n>" <<'EOF'
## Outcome
- <…>
EOF
)

# 2. Record the task. Auto-bind finds the request file that now exists, so no --request= needed.
ID=$(bash .agents/skills/slp-collab/scripts/taskctl.sh new "<peer>" "<short title>" --lane=standard)
bash .agents/skills/slp-collab/scripts/taskctl.sh dispatch "$ID"

# 2. Send the dispatch to the Peer pane (skill names + role knowledge are already injected by slp-open)
#    NOTICE/MICRO: the message IS the envelope — carry #ID, the exact edit, and the proof to report.
bash .agents/skills/slp-collab/scripts/slp-send.sh "<peer>" "Read $REQ_PATH, follow it. Complete with update_state.sh finish — it writes the [DONE] callback."

if [ "$?" -ne 0 ]; then
  echo "BLOCKED: Dispatch failed; run taskctl.sh status $ID blocked, then reconcile before retrying." >&2
  exit 1
fi

# 3. STOP CALLING ANY MORE TOOLS. WAIT FOR THE PEER WAKE-UP MESSAGE.
#
# Peer busy-state (`status.json`: busy/current_task) is owned by the peer's
# own completion sequence — Lead never writes it directly. (Direct jq edits
# to peer state are forbidden; they create the dual-source-of-truth drift
# that stale dashboards came from.)
```

**`NOTICE`/`MICRO` dispatch (no files at all — the message is the envelope):**

```bash
ID=$(bash .agents/skills/slp-collab/scripts/taskctl.sh new "<peer>" "<short title>" --lane=micro)
bash .agents/skills/slp-collab/scripts/taskctl.sh dispatch "$ID"
bash .agents/skills/slp-collab/scripts/slp-send.sh "<peer>" "Task #$ID (MICRO). <ask>
Edit — <path>:<line>
old: <exact old text>
new: <exact new text>
Proof — rg <symbol> . -> 0; <build wrapper> -> SUCCESS
Done — bash .agents/skills/slp-state/scripts/update_state.sh note <peer> $ID CONFIRM \"<one-line evidence>\""
```

`--lane=notice` for a no-write A task (same shape, no `Edit`; `Proof` = the output to report).

### STEP 4 — Reactive Wakeup & Acceptance Verification

> **Close the task record:** the peer's `[DONE]` callback already records
> `task.completed` + `.verdict` (the peer's assessment of the artifact) in
> `tasks.json` through the `slp-send.sh` best-effort hook, and a handback that is
> a completion verdict closes the task `done` — a review that returns findings is
> a *finished* task, not a blocked one.
> Lead then records acceptance **once** with `taskctl.sh verify <id> <verdict>`;
> it writes `.acceptance`/`.accepted_at` and **never overwrites `.verdict`**, so
> the peer's assessment survives. Re-accepting with the same verdict is a no-op.
> Then check `herdr-context/_tasks/DASHBOARD.md` (columns `Verdict (peer)` and
> `Accepted`) before acceptance.
> **Rework is `reopen`, never `blocked`:** when acceptance is not `CONFIRM` and the
> artifact must change, `taskctl.sh reopen <id>` returns the task to `pending` for a
> re-dispatch; `blocked` is reserved for a peer that could not finish.
> **Hook missed? Reconcile, don't re-send:** the answer file is proof the peer
> finished even when its callback never arrived (format drift, transport
> failure, killed session). Run `taskctl.sh sync` — it resolves the task from
> its answer file through the same ladder `callback` uses, restores `.verdict`
> from the handback, is idempotent, and touches nothing else. A row still
> `dispatched` while `NNN-answer-*.md` exists is a missed callback, not an
> unfinished task — never trust a chat message or `idle` status alone.
When the Peer completes, it automatically runs `bash .agents/skills/slp-collab/scripts/slp-send.sh Lead "[DONE] ..."` to wake Lead.
Lead reads the Answer file and checks the 5 layers of truth (*5-Layer Truth Separation*).

**State re-read rule:** the answer file is always read in full (it is new evidence). Peer `MEMORY.md` / `status.json` / `context-compact.md` / registry are re-read ONLY on fingerprint mismatch — in-session copies are current by default (see [slp-state §5](../slp-state/SKILL.md)).

**`NOTICE`/`MICRO` acceptance (no separate verify task, and no file to read):** the evidence arrives inline
in the `[DONE]` message and is stored on the task (`.evidence`, mirrored in the peer's
`_state/tasklog.md`). For `NOTICE` the reported output *is* the artifact — check it against the
transcript. For `MICRO` Lead machine-checks the diff instead of dispatching a verify Peer:
`git diff --numstat` shows ≤3 files with ≤15 risk-bearing lines (deletions free), the target lines
read the specified code, and the build receipt is SUCCESS. Then `taskctl.sh verify <id> <verdict>` once.
Bar: [RECONCILE-ACCEPTANCE](references/RECONCILE-ACCEPTANCE.md) (verification bar;
methodology stays in [COUNCIL_AND_RECONCILE](references/COUNCIL_AND_RECONCILE.md)).
Record Decision Confidence (HIGH/MEDIUM/LOW + missing proof) in the decision record.

### STEP 5 — Promote High-Value Lessons to Global MEMORY.md
Distill per [PROMOTION-MEMORY](references/PROMOTION-MEMORY.md) bar
(reusable + stable + project-wide + verified). Below bar → stays peer-local.
On *Acceptance*, if the Peer Handback surfaces a project-wide lesson/rule, Lead **copies/distills it into `herdr-context/MEMORY.md`** so the whole team benefits.

### STEP 5b — Evaluate Knowledge / Expertise Proposals (slp-peer-knowledge)
If the handback contains a `Knowledge used / applied / impact / discovered / proposal`
section, Lead resolves each proposal as `PROPOSED → ACCEPTED / REJECTED / DEFERRED`:
- Verify Applied/Impact is concrete (chose Y instead of Z), not a mere file list.
- ACCEPTED ≠ ESTABLISHED: promotion follows `provisional → calibrated (≥1 pass) →
  established (≥3 pass)` per [slp-roster](../slp-roster/SKILL.md); record evidence
  as the answer-path.
- Repeated verified failure may reduce confidence or add a restriction
  (e.g. `ESTABLISHED + restriction: complex async state`) instead of full demote.
- Evidence rules: [slp-peer-knowledge EVIDENCE-MODEL](../slp-peer-knowledge/references/EVIDENCE-MODEL.md).

---

## 4. Sealed Council & Reconciliation Rules

When evaluating high-impact architecture, security, or divergence:
1. **Zero Pre-Framing:** Send identical neutral briefs to all seats. Do NOT disclose Lead's preferred outcome.
2. **First-View Isolation (Clean Sessions):** Peers MUST NOT read each other's directories or answer drafts until all seats have completed their first view.
3. **No Direct Inter-Seat Pings:** All clarifications or cross-examinations MUST be routed through Lead.
4. **Reconcile Matrix (8 Axes):** Lead evaluates seats on *Premise, Mechanism, Boundary, Failure Modes, Reversibility, Evidence, Authority, Proof*. (See [references/COUNCIL_AND_RECONCILE.md](references/COUNCIL_AND_RECONCILE.md)).
5. **No Majority Voting:** Consensus without evidence is invalid. Lead chooses the solution with strongest falsifiable proof and documents dissent.

---

## 5. Acceptance Invariants & 5-Layer Truth Separation

Lead MUST NOT issue acceptance based on a chat message or status `idle` alone. Acceptance requires:

```
[Layer 1] Source Accepted    -> Code diff clean, focused tests exit 0.
[Layer 2] Artifact Qualified -> Build artifacts match checksums/hashes.
[Layer 3] Installed Candidate-> Target environment verified running exact version.
[Layer 4] Live Runtime       -> Daemon/API health check & provenance confirmed.
[Layer 5] User Journey       -> End-to-end user workflow validated.
```

### Layered Status Report Template:
```text
SOURCE:      PASS (commit abc1234, unit test pass)
ARTIFACT:    PASS (digest sha256:..., assets verified)
INSTALLED:   BLOCKED (active peer prevents daemon restart)
LIVE:        NOT TESTED
RESIDUAL:    Must await Human approval for daemon restart
```
*Rule: Never report a blanket PASS. Any untargeted layer must remain NOT TESTED, UNKNOWN, or BLOCKED.*

*`MICRO` lane:* the handback claims Layer 1 (SOURCE) only. Layers 2–5 stay `NOT TESTED` unless the same round's evidence covers them. This is scoping, not a weaker bar — the same rule above applies.
*`NOTICE` lane:* no layer is claimed — no file was mutated. The reported command output is the artifact.

---

## 6. Break-Before-Make on Lead Replacement
If Lead is replaced or transferred:
1. **Freeze:** Freeze all ongoing peer delegations.
2. **Revoke:** Revoke the old Lead binding in `_registry/peers.json`.
3. **Checkpoint:** Capture state snapshot and unresolved tasks.
4. **Activate:** Register and activate new Lead identity.
5. **Reconcile:** New Lead audits all active artifacts and open assignments.
6. **Resume:** Re-enable write leases.
