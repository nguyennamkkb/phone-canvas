---
name: slp-state
description: Manage per-peer durable lifecycle state (`_state/status.json`), compact context cache (`_state/context-compact.md`), and long-term memory (`_state/MEMORY.md`). Ensures atomic updates, carries forward constraints/risks/open questions, and synchronizes handback summaries.
---

# SLP STATE: DURABLE LIFECYCLE, COMPACT CACHE & LONG-TERM MEMORY

## 1. Philosophy & 3 Pillars of State (`_state/`)
Institutional memory is durably recorded in `herdr-context/<peer>/_state/` across 3 distinct pillars:

```
herdr-context/<peer>/_state/
├── status.json          # [Pillar 1] Machine-readable canonical lifecycle state (Single Source of Truth)
├── context-compact.md   # [Pillar 2] Short-term cache (<= 5 KB) summarizing last 5 handbacks
└── MEMORY.md            # [Pillar 3] Long-term personal institutional memory (lessons, patterns, quirks)
```

- **Atomic Operations Only:** Never perform direct in-place writes to `status.json`. ALWAYS write to `.tmp` first, then atomically rename (`mv`).
- **Cache vs Canonical State:**
  - `status.json`: Machine-readable canonical state.
  - `context-compact.md`: Model/Human-readable cache ($\le 5$ KB). Never write primary state directly to the compact file.
- **Zero Secrets:** Never write credentials, API keys, or raw authentication tokens into state, compact, or memory files.

---

## 2. Canonical Schema (v1)

`herdr-context/<peer>/_state/status.json`:
```json
{
  "schema_version": 1,
  "peer": "<name>",
  "tier": 1,
  "state": "idle",
  "current_task": null,
  "current_task_started_at": null,
  "last_task": "001",
  "last_completed_at": "2026-08-28T08:00:00Z",
  "last_answer_path": "herdr-context/<peer>/001-answer-YYYY-MM-DD-<topic>.md",
  "last_answer_summary": "CONFIRM: Refactored audio pipeline without latency regression",
  "queue_depth": 0,
  "pending": [],
  "known_risks": [
    "[HIGH] AudioEngine.swift:42 buffer underrun when switching output devices"
  ],
  "known_constraints": {
    "do": [
      "Use CheckInPipeline as single writer for journal mutations",
      "Validate entitlement keys before keychain read"
    ],
    "do_not": [
      "Persist raw chat tokens to SQLite",
      "Emulate missing tool calls with shell fallbacks"
    ]
  },
  "open_questions": [
    {
      "question": "Migrate core storage to App Group container in next sprint?",
      "raised_in": "001",
      "raised_at": "2026-08-28T08:00:00Z"
    }
  ]
}
```

---

## 3. Automation Scripts (`scripts/`)

### 3.1 Initialize Fresh Peer State & Memory
Sets up a new peer's state directory with `status.json`, `context-compact.md`, and `_state/MEMORY.md`:
```bash
bash .agents/skills/slp-state/scripts/init_peer.sh <peer-name> [workspace-root]
```

### 3.2 Update Lifecycle State (Canonical Tool: `update_state.sh`)
Standardized, atomic lifecycle transitions and state updates on `herdr-context/<peer>/_state/status.json`:

```bash
# 1. Start a task (busy, current_task, started_at)
bash .agents/skills/slp-state/scripts/update_state.sh start <peer> <task_id>

# 2. Complete a task (idle, last_task, last_completed_at, last_answer_path, last_answer_summary)
#    *Auto-compiles context-compact.md*
bash .agents/skills/slp-state/scripts/update_state.sh done <peer> <task_id> <answer_path> "<summary>"

# 2b. Complete AND notify Lead in one command (the normal completion duty).
#     Validates the handback, does everything `done` does, then sends the
#     canonical "[DONE] <peer>: <answer_path> — <VERDICT>" callback so the task
#     registry/dashboard update — the caller never assembles that string.
bash .agents/skills/slp-state/scripts/update_state.sh finish <peer> <task_id> <answer_path> <verdict> "<summary>"

# 3. Safely reset to idle (clear current_task)
bash .agents/skills/slp-state/scripts/update_state.sh idle <peer>

# 4. Add a norm to known_constraints (auto deduplicate)
bash .agents/skills/slp-state/scripts/update_state.sh constraint <peer> <do|do_not> "<text>"

# 5. Record a risk in known_risks (auto deduplicate)
bash .agents/skills/slp-state/scripts/update_state.sh risk <peer> "<text>"

# 6. Add an open question to open_questions ({question, raised_in, raised_at})
bash .agents/skills/slp-state/scripts/update_state.sh question <peer> <task_id> "<text>"
```

#### Safe Guarantees & Edge Case Resilience:
- **Atomic File Write:** Writes to `$STATE.tmp.$$` and atomically renames (`mv`).
- **Trap Cleanup:** If any failure occurs, temporary files are immediately removed (`trap 'rm -f ...' EXIT INT TERM`). Original `status.json` is preserved untouched.
- **Empty Value Guard:** Empty arguments (`""`) are rejected with non-zero exit code.
- **Null-Safety Coalescing:** Safely handles missing/null arrays (`known_constraints`, `known_risks`, `open_questions`) without jq errors.
- **Special Characters Safe:** Arguments are passed via `jq --arg`, safely handling multiline summaries, single/double quotes, `$VAR`, backticks, emojis, and unicode/Vietnamese diacritics.

#### `finish` — the completion duty in one command (fail-closed guards)
`finish` exists so the end-of-task duty cannot be half-done or mistyped:
1. **Verdict whitelist** — `CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT`; anything else (including `BLOCKED`, which is not a completion) fails closed with instructions.
2. **Handback must exist** — resolved against the workspace root and the peer dir, same candidate order as `taskctl callback`.
3. **Handback must declare itself** — requires `**Disposition:**` or `## Terminal sentinel`; otherwise it refuses to mark the task complete.
4. **Path must be whitespace-free** — the `[DONE]` callback regex matches one non-space token, so a spaced path would silently leave the dashboard stale; `finish` fails early instead.
5. **State before transport** — the state transition and compact refresh always happen first, so a send failure never loses the state update; it exits non-zero and prints the exact notification command to retry.
6. **Message built by the tool** — `finish` composes `[DONE] <peer>: <answer_path> — <VERDICT>` itself, so the callback format cannot drift (this is the class of bug that previously required a manual CALLBACK REPAIR).

### 3.3 Compile Compact Context Cache
Regenerates `_state/context-compact.md` after a completed task:
```bash
bash .agents/skills/slp-state/scripts/compile_compact.sh <peer-name> [workspace-root]
```

### 3.4 Fingerprint Gate (staleness check)
Cheap pre-read check so agents skip re-reading unchanged files (full rule: §5). Compare ONLY the `fp:` token between runs:
```bash
bash .agents/skills/slp-state/scripts/state_fingerprint.sh <peer-name> [workspace-root]
```

---

## 4. State Operation Rules (update_state.sh is Required)

> **Rule:** Never modify `status.json` manually with text editors or raw scripts. Always use `update_state.sh` to ensure schema integrity and automatic cache synchronization.

> **`NOTICE`/`MICRO` lanes:** `update_state.sh start` + `update_state.sh note` only — no handback file. `note` appends one evidence line to `_state/tasklog.md` (the reconcile source for `taskctl.sh sync`) and sends the `[DONE]` callback. Do NOT append to `_state/MEMORY.md` unless a genuinely reusable lesson exists (routine execution is not a lesson). Lanes are **no files: `NOTICE`/`MICRO` · file: `STANDARD` · council: `FULL`**. `compile_compact.sh` runs automatically inside `note`/`finish`/`done` — never invoke it manually.

If writing custom extensions or debugging, follow the exact atomic patterns implemented in `update_state.sh`:

### 4.1 Task Start
```bash
bash .agents/skills/slp-state/scripts/update_state.sh start "$PEER" "$NNN"
```

### 4.2 Task Completion
```bash
# Sets idle, updates last_task, last_completed_at, last_answer_path, last_answer_summary,
# and automatically invokes compile_compact.sh
bash .agents/skills/slp-state/scripts/update_state.sh done "$PEER" "$NNN" "$ANSWER_PATH" "$SUMMARY"
```

**Completion duty = `finish`, not two commands.** Use `finish` (state + Lead notification) for every normal completion; use `done` alone only when you must notify Lead separately (BLOCKED / dependency request / council reply):
```bash
bash .agents/skills/slp-state/scripts/update_state.sh finish "$PEER" "$NNN" "$ANSWER_PATH" "$VERDICT" "$SUMMARY"
```

### 4.3 Safe Null-Coalescing JQ Expressions (Under the Hood)
```bash
# Atomic update with process-isolated temp file and signal traps
local tmp="$STATE.tmp.$$"
trap 'rm -f "$tmp"' EXIT INT TERM
jq "$jq_expr" "$@" "$STATE" > "$tmp" && mv "$tmp" "$STATE"
trap - EXIT INT TERM

# Constraint (with deduplication and null safe coalescing)
'(.known_constraints // {}) as $c | .known_constraints = $c | .known_constraints[$type] = (((.known_constraints[$type] // []) + [$text]) | unique)'

# Risk (with deduplication)
'.known_risks = (((.known_risks // []) + [$text]) | unique)'

# Question (object append)
'.open_questions = ((.open_questions // []) + [{"question": $text, "raised_in": $task_id, "raised_at": $now}])'
```

---

## 5. Fingerprint-Gated Reads (read-once rule — token saver)

A full STEP-0 load (global MEMORY + peer MEMORY + status.json + compact + registry ≈ 250 measured lines) costs ~3000 tokens. In a live session the agent already holds all of it in conversation — re-`cat`-ing every task is pure waste.

**Full-load ONCE per session** (first task, or after `--restored`): read everything per `slp-peer` STEP 0, then record the `fp:` token from `state_fingerprint.sh`.

**Every later task: run ONLY the fingerprint gate** (`state_fingerprint.sh <peer>`, ~11 lines out) **and compare ONLY the `fp:` token** — never diff the whole output (the `@ timestamp` line always moves):

| Gate result | Do |
| :--- | :--- |
| `fp:` token identical to recorded | Skip ALL re-reads. Your in-conversation copy is current. |
| Token differs, only `state/last/task` moved (status.json sha moved, everything else same) | Take the new facts from the FP line itself. No file read. |
| `constraints/risks/questions` counters moved | Re-read `status.json` — standing directives may have changed. Never skip this: constraints carry Human orders. |
| Only `context-compact.md` sha moved | Expected noise (regenerated on every `done`). NOT a re-read trigger. |
| A MEMORY sha changed `Lx → Ly` (y > x), nothing else | Read ONLY the delta: `tail -n <y-x> <file>` (MEMORY files are append-only by convention). Update recorded token. If you suspect an in-place rewrite (not pure growth), full-read that file instead — tailing misses edited old lines. |
| A sha changed but line count shrank or stayed | Full re-read that file (rewrite happened, not append). Rare. |
| `MISSING` at a valid root | Fresh peer → `init_peer.sh`; deleted state → report `BLOCKED`. |
| `root:` says NO herdr-context HERE | Wrong root — pass the project root explicitly. NOT a deletion, never report BLOCKED for this. |
| `fp: WEAK-*` | No SHA-256 tool — gating is off. Full-read. (Nearly unreachable: Linux and macOS both ship one.) |
| `answers: N latest=MMM` advanced | A new artifact exists — read the new answer file itself, not the whole `_state/`. |

**Mandatory full re-read triggers (never gate):** session start, `--restored` reopen, FP references files you never loaded, or any authority/scope ambiguity — when in doubt, read, don't gate.

**Run from the project root** (or pass it as `$2`): the script resolves `herdr-context/` from its own location, which is correct for project-level installs (`.agents/`, `.claude/`, `.opencode/`, `.trae/`).

**Writer side is free:** every `update_state.sh` mutation prints a fresh FP trailer — record the new `fp:` token, no extra command. Your own MEMORY appends need no re-read (you wrote them; they're in conversation).

**Lead side:** same rule for `herdr-context/MEMORY.md` + `_registry/peers.json` (full read once per session, fingerprint gate afterwards) and for peer state before dispatch/acceptance. The peer's *answer file* is always read in full — it is new evidence, not carried state.
