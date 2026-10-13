---
name: slp-init
description: Bootstrap, initialize, and kickoff a new project workspace for SLP orchestration in Herdr. Contains the complete end-to-end Project Kickoff Playbook (Intake -> Bootstrap -> Architecture -> Delivery) and automated scripts to initialize the `herdr-context/` hierarchy.
---

# SLP INIT: WORKSPACE BOOTSTRAP, ENGINE SELECTION & TAB AUTOMATION

> **RULE — TASK DASHBOARD (REQUIRED):** every assignment dispatch MUST be mirrored in the task registry. Order: `taskctl.sh new` → `taskctl.sh dispatch`
> → `slp-send.sh <peer>`. No task record means `DASHBOARD.md` goes stale and the next session loses track. Details: [§7](#7-task-dashboard-for-lead-taskctlsh).

## Overview
Use `slp-init` when:
- **Starting a brand new project:** Ask Human for backend agent engines (`omp`, `codex`, `pi`, `opencode2`, `claude`, etc.), auto-create Herdr tabs, and launch agents.
- **Resuming an existing project:** Auto-restore exact saved sessions, verify active panes, and reconnect without overwriting historical state.
- **Onboarding dynamic peers:** Register specialized agents on the fly (e.g. `designer-omp`, `sec-codex`).

Detailed kickoff playbook: [Project Kickoff Playbook](references/PROJECT_KICKOFF_PLAYBOOK.md).

---

## 1. Engine Selection & Naming Standard: `<role>-<agent>`

To maintain strict visibility and control over what engine runs what role, **all peers MUST be named as `<role>-<agent>`**:

> **The role is validated, not guessed.** `slp-open.sh` accepts only `scout`, `engineer`, `reviewer`, `designer`. The name prefix is the convention of record; a registry `role` outside that set is ignored, re-derived from the name, warned about, and repaired. A name with no valid prefix (e.g. `opencode2`, `helper-x`) or `--role` that is not one of the four **fails closed (exit 2)** — there is no `generalist` fallback, because `slp-peer-knowledge` requires exactly one Tier-1 baseline and no `GENERALIST-BASELINE.md` exists. Fix the name, or pass `--role`.

| Role Prefix | Allowed Actions | Engine Suffix Examples | Standard Peer Name |
| :--- | :--- | :--- | :--- |
| `scout-` | `no-write` (Research, spec audit, HIG) | `omp`, `codex`, `pi`, `claude` | `scout-omp`, `scout-codex` |
| `engineer-` | `write-bounded` (Code implementation, tests) | `codex`, `pi`, `opencode2`, `agy` | `engineer-codex`, `engineer-pi` |
| `reviewer-` | `no-write` (Security review, contract audit) | `pi`, `claude`, `codex` | `reviewer-pi`, `reviewer-claude` |
| `designer-` | `no-write` (Wireframes, UX flow) | `omp`, `claude` | `designer-omp`, `designer-claude` |

---

## 2. Automated Multi-Agent Setup (`scripts/bootstrap.sh`)

### 2.1 Fresh Setup

Lead asks Human and passes the chosen `<role>-<agent>` pairs:

```bash
bash .agents/skills/slp-init/scripts/bootstrap.sh scout-omp engineer-codex reviewer-pi
```

**Architecture (post-refactor):** `bootstrap.sh` is a thin wrapper. It only:
1. Resolves the peer list (CLI args → `saved_sessions.json` → `peers.json` → defaults).
2. Ensures the `herdr-context/` skeleton (`_registry/`, `_attention/`, `_decisions/`, `MEMORY.md`).
3. **Delegates every per-peer operation** — Herdr tab creation, engine launch, registry binding, `_state/` init, `saved_sessions.json` update — to [slp-open.sh](../slp-collab/SKILL.md#opening-a-peer-agent).
4. Prints the final topology summary.

All Herdr CLI transport lives in `slp-open.sh` (sibling of `slp-send.sh` and `slp-close.sh` under `slp-collab/scripts/`); `bootstrap.sh` itself contains zero raw `herdr` calls. This guarantees the same transport rules apply to peer setup, messaging, and teardown.

### 2.2 Instant Auto-Restore (When Reopening Workspace)

When reopening an existing project:

```bash
bash .agents/skills/slp-init/scripts/bootstrap.sh
```

*Effect:* Reads `_registry/saved_sessions.json`, calls `slp-open.sh` for each saved peer with `--restored` if the session was closed. Live peers are no-op, closed peers are reopened, and 100% of historical state (`_state/`, handback artifacts, MEMORY.md) is preserved.

To open/close a single peer without re-bootstrapping the whole workspace:

```bash
bash .agents/skills/slp-collab/scripts/slp-open.sh engineer-pi --engine pi --role engineer
bash .agents/skills/slp-collab/scripts/slp-close.sh engineer-pi --soft
```

---

## 3. 4-Phase Kickoff Summary

For complete step-by-step guidance, refer to [references/PROJECT_KICKOFF_PLAYBOOK.md](references/PROJECT_KICKOFF_PLAYBOOK.md):

```
Phase 1: Intake & Engine Selection
├── One-sentence Problem Statement
├── Review PDR/Spec in spec/
└── Ask Human for Agent Engines (omp, codex, pi, etc.)

Phase 2: Automated Bootstrap & Pane Setup
├── Run scripts/bootstrap.sh <role>-<agent>...
└── Script delegates to slp-open.sh (one transport for setup, send, close)

Phase 3: Architecture Discovery (Scout Lane: no-write)
├── Task 001 for scout-<agent> (dispatched via bash .agents/skills/slp-collab/scripts/slp-send.sh)
└── Lead creates 001-architecture-baseline.md

Phase 4: Vertical Slicing & Delivery Dispatch
├── Task 002 for engineer-<agent> (dispatched via bash .agents/skills/slp-collab/scripts/slp-send.sh)
└── Activate slp-supervisor monitoring
```

---

## 4. Invariant Guarantees
- **Never Solo:** Lead NEVER self-executes peer tasks; all tasks are dispatched to live Herdr panes.
- **Zero Configuration Drift:** Pane IDs are tracked in real-time in `_registry/peers.json`.
- **Single Transport Layer:** All Herdr CLI calls — open, send, close — go through `slp-collab/scripts/`. Raw `herdr` commands are not used outside this layer. (See [§6](#6-stale-pane_id-registry-drift--lead-warning) for known drift caveat.)

## 5. Knowledge Injection & Auto-Resume Contract

**Every open — fresh or `--restored`** — injects a MANDATORY KNOWLEDGE prompt once the engine reaches `idle`: the peer must read the four SLP skills plus `slp-peer-knowledge/references/COMMON-BASELINE.md` and the single `<ROLE>-BASELINE.md` matching its role (scout/engineer/reviewer/designer). Fresh peers are told to wait for Lead's dispatch; they get no `_state/` resume.

When reopening a peer via `slp-open.sh <peer> --restored`, the script additionally:

1. Launches the engine CLI inside a fresh Herdr tab/pane.
2. Polls up to 15s for the engine to register as `idle` (not `starting` / `unknown`).
3. Injects a fixed **RESUME BOOTSTRAP** prompt into the pane. The prompt explicitly asks the peer to perform TWO actions, in order:

   - **(A) Reply in this pane** with one line: `Resumed. Last task NNN = TITLE, STATE. Ready.`
   - **(B) Send Lead an explicit notification** by running:

     ```bash
     bash .agents/skills/slp-collab/scripts/slp-send.sh Lead "[RESUMED] <peer-name>: last_task=<NNN>, state=<idle|done>. Ready for next task."
     ```

4. **Lead MUST NOT poll** with `herdr pane read` / `hub jobs` / `sleep` — the Lead pane receives the `[RESUMED]` notification automatically once the peer completes step (B). The notification is the contract that proves the peer has read its `_state/` and is ready to accept new work.

### 5.1 Verified engines (as of 2026-09-06)
| Engine | CLI version | Resume behavior | TUI echo of prompt | Auto-submit |
|---|---|---|---|---|
| `agy` (Antigravity CLI) | 1.1.27 (Gemini 3.8 Flash) | ✓ reads `_state/`, sends `[RESUMED]` to Lead | CLI banner only, prompt scrolls out of visible area | ✓ |
| `claude` (Claude Code) | v2.1.261 | ✓ explicit "Resumed. ... IDLE. Ready." + sends `[RESUMED]` | full prompt + reply visible | ✓ |
| `pi` | v0.84.3 | ✓ reads `_state/`, sends `[RESUMED]` to Lead | TUI scrolls prompt out of visible area | **needs Enter** (handled by `slp-open.sh` auto-`send-keys`) |
| `omp` (Oh My Pi / OpenCode) | v18.0.3 | ✓ reads `_state/`, sends `[RESUMED]` to Lead | full banner + `[Paste #N, +N lines]` indicator visible | **needs Enter** (handled by `slp-open.sh` auto-`send-keys`) |
| `codex` (OpenAI Codex) | v0.153.4 (gpt-6-astra medium), YOLO mode | ✓ reads `_state/`, sends `[RESUMED]` to Lead (auto-approved by YOLO) | full prompt + reply visible | **needs YOLO mode enabled** (one-time setup; otherwise Lead must `send-keys p` per task) |

> **Engine quirk (pi, omp):** both TUIs buffer stdin input — `herdr pane run` injects the RESUME_PROMPT text but does not auto-submit it. `slp-open.sh` auto-sends an `ENTER` keypress to the pane immediately after the inject for engine=`pi` or engine=`omp`. The other engines (`agy`, `claude`, `opencode2`) auto-process the injected prompt and do not need this fallback.
> **Engine quirk (codex):** codex CLI has a security sandbox that prompts "Would you like to run the following command? ... (y / p / esc)" for bash commands outside its allowlist. With **YOLO mode enabled** (banner shows `permissions: YOLO mode`), codex auto-approves without prompting — verified working for auto-resume flow. Without YOLO, Lead must respond with `p` via `herdr pane send-keys <pane> p` per command (approval does not persist across sessions). To enable YOLO: pass `--yolo` flag when launching codex CLI (one-time setup).

### 5.2 Disabling knowledge / auto-resume injection

Use `--auto-resume no` to skip the mandatory knowledge prompt (and the RESUME BOOTSTRAP when `--restored`) on reopen:

```bash
bash .agents/skills/slp-collab/scripts/slp-open.sh engineer-pi --restored --auto-resume no
```

Use this only when you want to drive the peer manually after reopen (rare). Default is `auto-resume=yes` for every open: fresh peers load role knowledge only; `--restored` peers also resume `_state/`.

---

## 6. Stale `pane_id` Registry Drift — Lead Warning

>`_registry/peers.json` may contain `pane_id` values that point to dead Herdr panes from a previous session. The root cause is that earlier `slp-close.sh` versions (or manual registry edits) left `pane_id` non-null after closing the underlying tab. Today's `slp-close.sh` correctly sets `pane_id = null` on `--soft` close, but historical drift persists.

### Symptom

`slp-open.sh <peer> --restored` reports `slp-open: peer <peer> already live on pane <X> (no-op).` even though `herdr pane list` shows no such pane. The script's idempotency check trusts `pane_id != null` in the registry without re-verifying against `herdr pane list`.

### Lead remediation

Before calling `slp-open.sh --restored`, if you suspect drift, run:

```bash
# 1. Inspect live panes
herdr pane list

# 2. If the registry's pane_id for your target peer does NOT appear in the live list, clear it:
jq --arg p "<peer-name>" '(.peers[$p] | del(.closed_at, .close_mode, .status) | .pane_id = null) as $r | .peers[$p] = $r' \
  herdr-context/_registry/peers.json > /tmp/peers.tmp \
&& mv /tmp/peers.tmp herdr-context/_registry/peers.json

# 3. Now slp-open will create a fresh tab instead of no-op'ing.
HERDR_ENV=1 HERDR_WORKSPACE_ID=<workspace> bash .agents/skills/slp-collab/scripts/slp-open.sh <peer> --restored
```


### Open follow-up (not yet fixed)

`slp-open.sh` idempotency check should be hardened to query `herdr pane list` and verify the stored `pane_id` is still live before no-op'ing. Tracked for next skill patch.

---

## 7. Task Dashboard for Lead (taskctl.sh)

Every assignment dispatch MUST be mirrored in the central task registry so
the Lead pane always shows who is doing what. Single entry point:

```bash
bash .agents/skills/slp-collab/scripts/taskctl.sh new <peer> "<title>" [--tags=t1,t2] [--deps=001,002] [--request=path]
bash .agents/skills/slp-collab/scripts/taskctl.sh dispatch <id>
bash .agents/skills/slp-collab/scripts/taskctl.sh status <id> working|done|blocked|cancelled
bash .agents/skills/slp-collab/scripts/taskctl.sh verify <id> CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT  # acceptance (kept apart from the peer's verdict)
bash .agents/skills/slp-collab/scripts/taskctl.sh reopen <id>   # closed task -> pending (rework)
bash .agents/skills/slp-collab/scripts/taskctl.sh list [--peer=X] [--status=Y] [--tag=Z] [--sort=priority]
bash .agents/skills/slp-collab/scripts/taskctl.sh sync   # reconcile done from answer files (missed-callback repair)
```

Source of truth: `herdr-context/_tasks/tasks.json` (atomic write via lock + `mv .tmp`).
Derived view: `herdr-context/_tasks/DASHBOARD.md` — auto-regenerated after
every mutation; Active Tasks section is hidden when empty. On first run with
empty tasks and existing peer state, records are auto-imported idempotently.
Peer `[DONE]` callbacks auto-update the registry through a best-effort hook
in `slp-send.sh` (see `slp-collab` skill).
