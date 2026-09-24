---
name: slp-collab
description: Send SLP assignments, callbacks, consultations, and attention notices through the shared slp-send.sh wrapper. Also open (slp-open.sh) and close (slp-close.sh) peer agents gracefully. Single-source task lifecycle via taskctl.sh.
---

# SLP communication

The shared sender lives only in this skill's `scripts/` directory. All Lead, Peer, and Supervisor messages use it. Run these commands from the project root:

```bash
bash .agents/skills/slp-collab/scripts/slp-send.sh engineer-codex "Read herdr-context/engineer-codex/001-request-YYYY-MM-DD-topic.md and follow it."
bash .agents/skills/slp-collab/scripts/slp-send.sh Lead "[DONE] engineer-codex: herdr-context/engineer-codex/001-answer-YYYY-MM-DD-topic.md — CONFIRM"
```

Use `Lead` or an exact key in `peers.json` under `peers`. To contact Supervisor, Lead first registers it as a named entry under `peers`. The script resolves the registered pane, checks that it hosts a recognized agent in the caller's Herdr workspace, rejects blocked/unknown targets, then calls `herdr pane run` once. Do not send SLP messages with raw Herdr commands or guess pane IDs.

**Peer completion calls go through `update_state.sh finish`,** not a hand-written send: the peer runs
`bash .agents/skills/slp-state/scripts/update_state.sh finish <peer> <NNN> <answer> <verdict> "<summary>"`,
which does the state transition and then sends the canonical `[DONE]` message through this sender. The `[DONE]` callback hook, its regex, and the taskctl contract below are unchanged — `finish` only guarantees the message is well-formed.

Lead remains responsible for keeping the registry bound to the intended agent; a live pane check does not prove its occupant has not changed. A target may be working when receiving a callback. Assignment availability and scope checks remain the caller's responsibility.

Pass the message as one quoted argument. Prefer single quotes for literal text containing `$`, backticks, or double quotes. Request/answer files, completion sequence, and role boundaries remain unchanged. Council seats still communicate through Lead.

On a nonzero exit, report the error; do not silently skip the message, guess another target, or retry automatically. If transport fails after input may have been sent, delivery is uncertain: verify before sending again. Preserve existing artifacts and task state for reconciliation. A successful send is not proof of receipt or task completion.

No inbox, ACK, queue, daemon, or polling is added. [Sender](scripts/slp-send.sh).

## Opening a peer agent

Use `slp-open.sh` to spin up (or reopen) a peer in Herdr without bypassing the shared transport layer:

```bash
bash .agents/skills/slp-collab/scripts/slp-open.sh engineer-pi --engine pi --role engineer
bash .agents/skills/slp-collab/scripts/slp-open.sh scout-omp --restored   # reopen a closed peer
```

- Creates (or reuses) a Herdr tab labelled `<peer-name>`, launches the engine CLI inside the pane, binds the live `pane_id` into `peers.json`, and writes/refreshes `saved_sessions.json`.
- **Validates the role (no silent fallback).** Only `scout|engineer|reviewer|designer` are accepted; the `<role>-<agent>` name prefix is the convention of record, so an invalid registry `role` is ignored with a warning, re-derived from the name, and repaired. An unusable name or `--role` **fails closed (exit 2)** — a peer whose role cannot be resolved is never opened with a broken knowledge contract.
- **Reconciles identity even on a no-op open.** A peer that is already live still gets its registry `role`/`engine` repaired and its compact's `## Identity` block refreshed if they drifted, so a corrected role reaches the peer instead of being stuck behind a write-once file. A compact produced by `compile_compact.sh` (no `## Identity` block) is left untouched.
- Initializes `herdr-context/<peer>/_state/{status.json, context-compact.md, MEMORY.md}` if missing.
- **Idempotent**: a peer already live is a no-op (exit 0); a peer in `closed_session` state is reopened (pass `--restored` to tag it explicitly).
- Flags `--engine` and `--role` are optional; both are inferred from the existing registry entry, then from the `<role>-<agent>` name pattern.
- `--restored` is REQUIRED when reopening a `closed_session` peer (marks `restored_at`, adds the state-resume prompt). Without it the open is fresh: the peer still gets the mandatory knowledge prompt, but no `_state/` resume instruction.
- Every open (fresh or `--restored`) injects a MANDATORY KNOWLEDGE prompt after the engine reaches `idle`: the peer reads the four SLP skills plus `slp-peer-knowledge` `COMMON-BASELINE.md` and the one `<ROLE>-BASELINE.md` for its role. On `--restored` it also injects the RESUME BOOTSTRAP: the peer reads its `_state/` then replies in-pane AND sends Lead `"[RESUMED] <peer>: ..."`. Lead waits for that message instead of polling. Engine quirks (`pi`/`omp` need Enter, `codex` needs `--yolo`): see [slp-init §5](../slp-init/SKILL.md).
- Exit codes: `0` ok, `1` generic, `2` usage, `3` peer, `4` Herdr not responsive, `5` engine binary missing.

[Opener](scripts/slp-open.sh).

## Closing a peer agent

Use `slp-close.sh` to take a peer offline without losing its durable state:

```bash
bash .agents/skills/slp-collab/scripts/slp-close.sh engineer-codex
bash .agents/skills/slp-collab/scripts/slp-close.sh engineer-codex --hard --force   # full wipe (irreversible)
```

- Default mode is `--soft`: closes the Herdr tab hosting the peer's pane, marks the registry entry `closed_session` (pane_id cleared, `closed_at` recorded), and keeps `herdr-context/<peer>/` plus `saved_sessions.json` so `slp-open.sh --restored` (or `bootstrap.sh`) can reattach the peer later.
- `--hard` additionally removes the peer's directory and drops its entry from `peers.json` / `saved_sessions.json`. Not reversible without backup.
- `--force` overrides idempotency when the peer is already marked closed (useful after a stale Herdr restart).
- Exit codes: `0` ok, `1` generic, `2` usage, `3` peer not found, `4` already closed, `5` Herdr failure, `6` preconditions missing (must run inside a Herdr pane with `jq` available).

[Closer](scripts/slp-close.sh).

## Artifact Files (slp-send.sh request / answer)

**Never hand-name a request or answer file, and never run `date -u` to build one.** The shared
tool owns the name and the header — the same script both sides already run for messaging:

```bash
bash .agents/skills/slp-collab/scripts/slp-send.sh request <peer> <NNN|auto> "<title>" \
  [--lane=standard|full] [--lease=<v>] [--origin=<v>] [--topic=slug] [--force] [--body-file=F]
bash .agents/skills/slp-collab/scripts/slp-send.sh answer  <peer> <NNN> <VERDICT> \
  [--topic=slug] [--force] [--body-file=F]
```

- Name: `herdr-context/<peer>/<NNN>-{request|answer}-<YYYY-MM-DD>-<slug>.md`. The date is the
  **local** date (`date +%F`), not a UTC timestamp; the slug is derived from the title
  (Unicode transliterated to ASCII, so `Mở suy ngẫm` → `mo-suy-ngam`).
- Header is filled for you (`# NNN — <title>` + `Lane/lease/origin`, or `# HANDBACK NNN — <title>`
  + `**Disposition:** <VERDICT>`). Pipe the body on stdin, or pass `--body-file=`, or omit both to
  get the section skeleton. An answer gets `## Terminal sentinel` appended if the body lacks it.
- `auto` picks the next free `NNN` by reading `tasks.json` (read-only).
- It **refuses** to create a file for a `NOTICE`/`MICRO` task — those lanes are message-only
  (use `update_state.sh note`), it refuses to overwrite an existing artifact without `--force`,
  and it requires a real verdict.
- Neither subcommand needs herdr, the registry or the task lock, so a Peer can run them.
- Each run prints the path plus the next command: `taskctl.sh new … --id=NNN --lane=…` for a
  request (auto-bind then links it, so no `--request=`), or the ready `update_state.sh finish …`
  line for an answer.

## Task Management (taskctl.sh)

Use `taskctl.sh` as the single CLI for Lead task lifecycle. Source of truth: `herdr-context/_tasks/tasks.json` (atomic write via lock + `mv .tmp`). Derived view: `herdr-context/_tasks/DASHBOARD.md` (auto-regenerated after every mutation).

**Request-path binding:** `new` binds the task↔artifact link automatically — an explicit `--request=` wins, otherwise the single conventional `herdr-context/<peer>/<ID>-request-*.md` is bound (2+ matches → warning, left empty). Prefer creating the request with `slp-send.sh request` **first** and then `taskctl.sh new … --id=NNN`, so the auto-bind does the linking and `--request=` is never hand-typed.

**Reconciliation:** `taskctl.sh sync` marks tasks done from their answer files using the same resolution ladder as `callback` — exact answer path → exact request path → basename → this peer's active task whose `source_id`/`id` matches the `NNN` in the filename. It sets `verdict` (from `**Disposition:**`) and `callback_recorded`, is idempotent, and ignores artifacts with no matching task. Run it when a peer's `[DONE]` callback may have been missed (format drift, transport failure, killed session) — this is the repair path for a stale `dispatched` row.

```bash
# Mutations (auto-regen dashboard)
bash .agents/skills/slp-collab/scripts/taskctl.sh new <peer> "<title>" [--tags=t1,t2] [--deps=001,002] [--request=path]
bash .agents/skills/slp-collab/scripts/taskctl.sh dispatch <id>
bash .agents/skills/slp-collab/scripts/taskctl.sh status <id> working|done|blocked|cancelled
bash .agents/skills/slp-collab/scripts/taskctl.sh verify <id> CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT  # acceptance
bash .agents/skills/slp-collab/scripts/taskctl.sh reopen <id>   # closed -> pending (rework)
bash .agents/skills/slp-collab/scripts/taskctl.sh decision <id> <decision-path>
bash .agents/skills/slp-collab/scripts/taskctl.sh callback <peer> <answer-path> <verdict>  # auto-called by the slp-send.sh [DONE] hook; run manually only on hook-miss

# Reads
bash .agents/skills/slp-collab/scripts/taskctl.sh list [--peer=X] [--status=Y] [--tag=Z]
bash .agents/skills/slp-collab/scripts/taskctl.sh show <id>
bash .agents/skills/slp-collab/scripts/taskctl.sh sync   # reconcile done from answer files (missed-callback repair)

# Dashboard render (explicit; always renders both Markdown and HTML)
bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard
bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard --html   # HTML only

# HTML overview: open herdr-context/_tasks/DASHBOARD.html in a browser.
# Single file, zero CDN. Stat cards + Kanban (Upcoming/Working/Blocked/Done)
# + Peer x Status matrix (click a cell to filter) + sortable table + events.
# Filters persist in the URL hash (#peer=..&status=..&sort=priority).
# Lock is released before serving, so concurrent mutations (new task,
# status change) keep working while it runs. The page polls tasks.json
# every 2s and reloads on change. See "Opening the task dashboard" below
# for the one-command launcher (dashboard-open / -status / -stop).
#
# bash .agents/skills/slp-collab/scripts/taskctl.sh serve [--port=8000]
## Opening the task dashboard

`taskctl.sh` also owns the one-command launcher for the live HTML view:

```bash
bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard-open [--port=8901]
bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard-status
bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard-stop
```

- `dashboard-open` checks for any live dashboard server; if one is already running it just prints its URL and (best-effort) opens it in the user's browser via `xdg-open`/`open`. Otherwise it spawns `python3 -m http.server` rooted at `herdr-context/_tasks/`.
- `dashboard-stop` ONLY kills a server that THIS command spawned (PID recorded in `herdr-context/_tasks/.dashboard.pid`). Other `http.server` processes (e.g. hub-managed `tasks-real`) are reported as external and left alone — stop them through hub instead.
- `dashboard-status` reports the live URL and whether it is owned by this taskctl instance.
- The page polls `tasks.json` every 2s and reloads on change; no manual refresh.


# Locks
bash .agents/skills/slp-collab/scripts/taskctl.sh lock-acquire <name>
bash .agents/skills/slp-collab/scripts/taskctl.sh lock-release <name>

# Backward-compat import
bash .agents/skills/slp-collab/scripts/taskctl.sh import-existing
```

### `NOTICE` / `MICRO` convention — no files

Lanes: **no files: `NOTICE`/`MICRO` · file: `STANDARD` · council: `FULL`.** These two lanes write **no request file and
no handback file** — the dispatch message is the envelope and `update_state.sh note` is the
handback. Same lifecycle, recorded with `--lane=`:

```bash
bash .agents/skills/slp-collab/scripts/taskctl.sh new <peer> "<title>" --lane=micro   # or --lane=notice
bash .agents/skills/slp-collab/scripts/taskctl.sh dispatch <id>
# ...Lead sends ONE slp-send.sh message carrying "Task #<id> ... Proof ... Done — update_state.sh note ..."
# ...peer runs: update_state.sh note <peer> <id> CONFIRM "<one-line evidence>"
#    -> 1 line appended to <peer>/_state/tasklog.md + "[DONE] <peer>: #<id> CONFIRM — <evidence>"
#    -> slp-send.sh hook calls `taskctl complete <id> <verdict> "<evidence>"`
# ...Lead:
bash .agents/skills/slp-collab/scripts/taskctl.sh verify <id> CONFIRM   # acceptance; idempotent; once
#   MICRO  -> machine-check the diff (numstat + target lines + build receipt)
#   NOTICE -> check the reported command output
```

No separate verify task is dispatched for them. `list --lane=micro` / `--lane=notice` filters it.
If the `[DONE]` message is lost, `taskctl.sh sync` reconciles these lanes from each peer's
`_state/tasklog.md` — that append-only log is the only artifact such a task leaves behind.
Do not add `status <id> done` — the callback already recorded completion.

`verify` records **acceptance** (`.acceptance`/`.accepted_at`) and never rewrites the peer's
`.verdict`, so the dashboard shows both (`Verdict (peer)` and `Accepted`). To send an accepted
task back for changes, `taskctl.sh reopen <id>` → `pending` → `dispatch`; do not use `blocked`
for rework — it means the peer could not finish.

[Task Control](scripts/taskctl.sh).