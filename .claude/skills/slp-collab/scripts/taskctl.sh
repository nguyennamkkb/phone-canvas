#!/usr/bin/env bash
# taskctl.sh — Single CLI for the Lead task lifecycle: create/plan tasks,
# record dispatch/status/verify events, auto-regenerate DASHBOARD.md, and
# absorb peer [DONE] callbacks. Source of truth lives in
# herdr-context/_tasks/tasks.json (atomic write via kernel lock + mv .tmp).
#
# Used by:
#   - Lead, for every assignment: new/dispatch, status/verify, list/show
#   - slp-send.sh, via the [DONE] auto-update hook (callback)
#   - Manual operator calls when inspecting or importing task history
#
# Usage:
#   bash .agents/skills/slp-collab/scripts/taskctl.sh new <peer> <title> [--lane=notice|micro|standard|full] [--tags=a,b] [--deps=001,002] [--id=999] [--request=path]
#   bash .agents/skills/slp-collab/scripts/taskctl.sh plan <peer> <title> [--priority=critical|high|normal|low] [--due=YYYY-MM-DD] [--tags=a,b] [--deps=001,002] [--id=999]
#   bash .agents/skills/slp-collab/scripts/taskctl.sh promote <id> | reopen <id>
#   bash .agents/skills/slp-collab/scripts/taskctl.sh dispatch <id>
#   bash .agents/skills/slp-collab/scripts/taskctl.sh status <id> working|done|blocked|cancelled
#   bash .agents/skills/slp-collab/scripts/taskctl.sh verify <id> CONFIRM|CONFIRM_WITH_FIXES|REJECT
#   bash .agents/skills/slp-collab/scripts/taskctl.sh list [--peer=X] [--status=Y] [--tag=Z] [--sort=priority]
#   bash .agents/skills/slp-collab/scripts/taskctl.sh show <id> | dashboard [--html] | import-existing
#   bash .agents/skills/slp-collab/scripts/taskctl.sh serve [--port=8000]
#   bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard-open [--port=8901] | dashboard-stop | dashboard-status  # one-command dashboard launcher
#   bash .agents/skills/slp-collab/scripts/taskctl.sh decision <id> <existing-decision.md>
#   bash .agents/skills/slp-collab/scripts/taskctl.sh lock-acquire <name> | lock-release <name>
#   bash .agents/skills/slp-collab/scripts/taskctl.sh callback <peer> <answer-path> <verdict>
#   bash .agents/skills/slp-collab/scripts/taskctl.sh complete <id> <verdict> "<evidence>"   # NOTICE/MICRO: no handback file
#
# Lifecycle (matches the Lead pairing rule in slp-lead):
#   1. taskctl.sh new/plan  -> capture the ID, write the request path
#   2. taskctl.sh dispatch  -> record the dispatch event
#   3. slp-send.sh <peer>   -> deliver the assignment (separate transport)
#   4. taskctl.sh status/verify -> close the record before acceptance
#
# Idempotent:
#   - Mutations append events and rewrite tasks.json atomically; read-only
#     commands (list/show/dashboard) emit no events.
#   - On first run with empty tasks and existing peer state, records are
#     auto-imported idempotently; concurrent calls fail with exit 75.
#
# Examples:
#   bash .agents/skills/slp-collab/scripts/taskctl.sh new engineer-agy "Research mobile tokens" --tags=research --request=herdr-context/engineer-agy/001-request-x.md
#   bash .agents/skills/slp-collab/scripts/taskctl.sh plan engineer-codex "Ship auth" --priority=high --due=2026-09-10
#   bash .agents/skills/slp-collab/scripts/taskctl.sh dashboard
#   bash .agents/skills/slp-collab/scripts/taskctl.sh serve --port=8000   # live HTML at /DASHBOARD.html, auto-reloads on tasks.json change
#
# Exit codes:
#   0  success
#   1  generic failure
#   2  usage error
#   3  committed but dashboard render failed (retry dashboard ONLY)
#   75 concurrent owner holds the registry lock (retry after it exits)
set -euo pipefail

fail() { printf 'taskctl: %s\n' "$*" >&2; exit 1; }
setup() {
  CONTEXT_DIR=${CONTEXT_DIR:-herdr-context}
  TASK_DIR="$CONTEXT_DIR/_tasks"
  TASKCTL_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
  DB="$TASK_DIR/tasks.json"
  REGISTRY="$CONTEXT_DIR/_registry/peers.json"
  command -v jq >/dev/null || fail 'jq is required'
  command -v python3 >/dev/null || fail 'python3 with standard-library fcntl is required'
  mkdir -p "$TASK_DIR/locks"
  OWN_LOCK=''; TMP=''
  trap cleanup EXIT
  trap 'exit 130' INT
  trap 'exit 143' TERM
}
acquire_lock() {
  local file=$1
  # Bash retains the open file description after Python exits. The kernel lock
  # lasts until FD 9 (and its inherited copies) closes; never unlink this inode.
  exec 9>> "$file"
  if python3 - "$$" <<'PY'
import fcntl, os, sys
try:
    fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    sys.exit(75)
os.ftruncate(9, 0)
os.write(9, (sys.argv[1] + '\n').encode())
PY
  then return 0; else exec 9>&-; return 1; fi
}
release_lock() {
  # Closing the owner FD releases the kernel lock; stale file contents are inert.
  exec 9>&-
}
cleanup() {
  [ -z "${TMP:-}" ] || rm -f -- "$TMP"
  [ -z "${OWN_LOCK:-}" ] || release_lock "$OWN_LOCK" || true
}
lock_registry() {
  if ! acquire_lock "$TASK_DIR/locks/tasks.lock"; then
    printf 'taskctl: busy; no changes (retry command after current owner exits)\n' >&2
    exit 75
  fi
  OWN_LOCK="$TASK_DIR/locks/tasks.lock"
}
validate() {
  jq -e '
    (.version | IN(2,3)) and (.tasks | type == "object") and (.events | type == "array")
    and all(.tasks | to_entries[]; .key == .value.id and
      (.value.peer | type == "string") and (.value.title | type == "string") and
      (.value.status | IN("upcoming","pending","dispatched","working","done","blocked","cancelled")) and
      (.value.priority // "normal" | IN("critical","high","normal","low")) and
      (.value.due_at // "" | type == "string") and
      (.value.deps | type == "array") and (.value.tags | type == "array"))
  ' >/dev/null
}
load_db() {
  [ ! -e "$DB" ] || [ -f "$DB" ] || fail 'tasks.json must be a regular file'
  # Existing v2 registries retain their version and records; only fresh DBs use v3.
  if [ -f "$DB" ]; then DATA=$(cat "$DB"); else DATA='{"version":3,"tasks":{},"events":[]}'; fi
  validate <<< "$DATA" || fail 'invalid tasks.json; refusing to overwrite'
  # Auto-import: on first load with empty tasks, scan per-peer state for history.
  # Idempotent — if any task already exists, skip. If no per-peer state, no-op.
  if [ -z "$(jq -r '.tasks | length' <<< "$DATA" 2>/dev/null)" ] || [ "$(jq -r '.tasks | length' <<< "$DATA" 2>/dev/null)" = "0" ]; then
    if [ -f "$REGISTRY" ] && command -v find >/dev/null 2>&1; then
      peer_count=$(jq -r '.peers | keys | length' "$REGISTRY" 2>/dev/null || echo 0)
      if [ "$peer_count" -gt 0 ]; then
        # Check if any peer has historical state to import.
        has_history=0
        for state_file in "$CONTEXT_DIR"/*/_state/status.json; do
          [ -f "$state_file" ] || continue
          has_history=1
          break
        done
        if [ "$has_history" = 1 ]; then
          # Re-import using current DATA. import_existing updates DATA in place.
          import_existing || true
          # Persist imported DATA to tasks.json + render dashboard.
          TMP=$(mktemp "$TASK_DIR/tasks.json.tmp.XXXXXX") || true
          if [ -n "$TMP" ]; then
            printf '%s\n' "$DATA" > "$TMP" || true
            if jq -e . "$TMP" >/dev/null 2>&1; then
              [ -f "$DB" ] && cp -p -- "$DB" "$TASK_DIR/tasks.json.bak" 2>/dev/null || true
              mv -- "$TMP" "$DB" || true
            else
              rm -f -- "$TMP" || true
            fi
          fi
          render_dashboard >/dev/null 2>&1 || true
        fi
      fi
    fi
  fi
}
transform() { DATA=$(jq "$@" <<< "$DATA") || fail 'jq failed; registry unchanged'; }
now() { date -u +%Y-%m-%dT%H:%M:%SZ; }
# Shared list/dashboard key: undated tasks follow dated tasks of equal priority.
PRIORITY_SORT='def priority_key: [({critical:0,high:1,normal:2,low:3}[.priority // "normal"] // 2), (if (.due_at // "") == "" then "9999" else .due_at end), (.created_at // "")];'
event() {
  local type=$1 id=$2 extra=${3:-'{}'} stamp
  stamp=$(now)
  transform --arg type "$type" --arg id "$id" --arg at "$stamp" --arg actor "${TASK_ACTOR:-lead}" --argjson extra "$extra" '
    .events += [({seq: ((.events | length) + 1), type:$type, task_id:$id, at:$at, actor:$actor} + $extra)]
    | .updated_at = $at'
}
next_id() {
  local number
  number=$(jq '[.tasks | keys[] | select(test("^[0-9]+$")) | tonumber] | (max // 0) + 1' <<< "$DATA")
  printf -v ID '%03d' "$number"
}
require_task() { jq -e --arg id "$1" '.tasks | has($id)' <<< "$DATA" >/dev/null || fail "unknown task: $1"; }
role_for() { jq -er --arg peer "$1" '.peers[$peer].role | select(type == "string")' "$REGISTRY" || fail "unregistered peer: $1"; }
# Handback verdict -> task status. A completion verdict means the PEER finished
# the task, so the task is done; anything else (BLOCKED, unparseable) means it
# did not. This is task completion, NOT Lead's assessment: the peer's `.verdict`
# and Lead's `.acceptance` are separate fields, so a PARTIAL *review* is a
# finished task, and acceptance never overwrites what the peer reported.
status_for_handback() {
  case "$1" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) printf 'done' ;; *) printf 'blocked' ;; esac
}
# Canonical artifact path = the form the per-peer glob produces, so records
# written by different commands compare equal (and the dashboard can relativize
# them). Absolute inputs are folded back onto the workspace context dir; anything
# not under it is returned unchanged.
canonical_path() {
  local ctx="$1" peer="$2" file="$3" marker
  case "$file" in
    "$ctx/$peer/"*) printf '%s' "$file"; return ;;
    "")             printf '%s' "$file"; return ;;
  esac
  marker=$(basename -- "$ctx")/"$peer"/
  case "$file" in
    *"$marker"*) printf '%s/%s/%s' "$ctx" "$peer" "${file#*"$marker"}" ;;
    *)           printf '%s' "$file" ;;
  esac
}
# Task id for an answer artifact: exact answer > exact request > basename > this
# peer's single active task carrying the filename NNN. First non-empty tier wins;
# an ambiguous tier or an ambiguous result resolves to nothing (fail closed).
# Shared by callback + sync so the ladder cannot drift between them.
resolve_task_id() {
  jq -r --arg p "$1" --arg a "$2" --arg r "$3" --arg b "$4" --arg s "$5" '
    [.tasks[] | select(.peer==$p)] as $t |
    [$t[] | select(.answer_path==$a)] as $A |
    [$t[] | select($r != "" and .request_path==$r)] as $R |
    [$t[] | select((.answer_path|split("/")|last)==$b)] as $B |
    ( if   ($A|length)>0 then $A
      elif ($R|length)>0 then $R
      elif ($B|length)>0 then $B
      else [$t[] | select((.source_id // .id)==$s and (.status|IN("pending","dispatched","working","blocked")))] end )
    | unique_by(.id) | if length == 1 then .[0].id else empty end' <<< "$DATA"
}
# Close a NOTICE/MICRO task from an inline evidence note (no handback file). Shared by
# the `complete` command and the tasklog reconcile so the two cannot drift.
apply_complete() {
  local id="$1" v="$2" e="$3" status stamp
  status=$(status_for_handback "$v")
  stamp=$(now)
  transform --arg id "$id" --arg v "$v" --arg e "$e" --arg status "$status" --arg at "$stamp" '
    .tasks[$id] |= (.status=$status | .verdict=$v | .evidence=$e
      | .completed_at=(if $status=="done" then (.completed_at // $at) else null end)
      | .callback_recorded=true)'
}
# Reconcile NOTICE/MICRO tasks from each peer's append-only _state/tasklog.md. Such a
# task has no handback file, so without this a lost [DONE] message would strand
# it with nothing for `sync` to scan.
sync_tasklog() {
  local peer log nnn verdict _ts evidence found status
  shopt -s nullglob
  for peer in $(jq -r '.peers | keys[]' "$REGISTRY"); do
    log="$CONTEXT_DIR/$peer/_state/tasklog.md"
    [ -f "$log" ] || continue
    while IFS='|' read -r nnn verdict _ts evidence; do
      nnn=$(printf '%s' "$nnn" | tr -d '[:space:]')
      verdict=$(printf '%s' "$verdict" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')
      evidence=$(printf '%s' "$evidence" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
      case "$nnn" in ''|*[!0-9]*) continue ;; esac
      case "$verdict" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;; *) continue ;; esac
      [ -n "$evidence" ] || evidence='(no note)'
      found=$(jq -r --arg p "$peer" --arg id "$nnn" '
        [.tasks | to_entries[] | select(.value.peer==$p and ((.value.source_id // .key)==$id))]
        | if length == 1 then .[0].key else empty end' <<< "$DATA")
      [ -n "$found" ] || continue
      status=$(status_for_handback "$verdict")
      if jq -e --arg id "$found" --arg v "$verdict" --arg e "$evidence" --arg status "$status" \
           '.tasks[$id] | .status==$status and .verdict==$v and .evidence==$e' <<< "$DATA" >/dev/null; then continue; fi
      apply_complete "$found" "$verdict" "$evidence"
      event task.synced "$found" "$(jq -nc --arg src tasklog --arg v "$verdict" '{source:$src,verdict:$v}')"
    done < "$log"
  done
}
commit() {
  validate <<< "$DATA" || fail 'candidate validation failed'
  [ ! -e "$DB.bak" ] || [ -f "$DB.bak" ] || fail 'tasks.json.bak must be a regular file'
  TMP=$(mktemp "$TASK_DIR/tasks.json.tmp.XXXXXX")
  printf '%s\n' "$DATA" > "$TMP"
  if [ -f "$DB" ]; then cp -p -- "$DB" "$DB.bak"; fi
  mv -- "$TMP" "$DB"; TMP=''
  # Registry lock remains held through the dashboard renders.
  if ! render_dashboard; then
    printf 'taskctl: registry committed; dashboard failed. Retry dashboard ONLY.\n' >&2
    exit 3
  fi
  # HTML overview is best-effort: a render failure warns but never fails the commit.
  if ! render_html_best_effort; then
    printf 'taskctl: WARNING — HTML dashboard render failed\n' >&2
  fi
}
usage() {
  cat <<'HELP'
Usage: taskctl.sh new <peer> <title> [--lane=notice|micro|standard|full] [--tags=a,b] [--deps=001,002] [--id=999] [--request=path]
       taskctl.sh plan <peer> <title> [--priority=critical|high|normal|low] [--due=YYYY-MM-DD] [--tags=a,b] [--deps=001,002] [--id=999]
       taskctl.sh promote <id> | reopen <id>
       taskctl.sh dispatch <id>
       taskctl.sh status <id> working|done|blocked|cancelled
       taskctl.sh verify <id> CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT   # acceptance
       taskctl.sh list [--peer=X] [--status=Y] [--tag=Z] [--lane=L] [--sort=priority]
       taskctl.sh show <id> | sync | dashboard [--html] | import-existing
       taskctl.sh serve [--port=8000]
       taskctl.sh dashboard-open [--port=8901] | dashboard-stop | dashboard-status
       taskctl.sh decision <id> <existing-decision.md>
       taskctl.sh lock-acquire <name> | lock-release <name>
       taskctl.sh callback <peer> <answer-path> <verdict>
       taskctl.sh complete <id> <verdict> "<evidence>"   # NOTICE/MICRO: no handback file
CONTEXT_DIR isolates a workspace. Mutations return 75 if busy, 3 if committed but
rendering failed. Reads/regen emit no events. Named locks belong to caller PPID
(or TASK_LOCK_OWNER_PID); acquire/release them from the same living shell.
Dispatch records an event only; it does not send assignments.
HELP
}
import_record() {
  local peer=$1 source=$2 answer=$3 request=$4 title=$5 status=$6 started=$7 completed=$8 verdict=$9 key=${10} role stamp
  ID=$(jq -r --arg key "$key" '.tasks[] | select(.import_key == $key) | .id' <<< "$DATA")
  if [ -n "$ID" ]; then
    # Enrich only previously unknown verdicts; never overwrite a CLI decision.
    if [ -n "$verdict" ] && jq -e --arg id "$ID" '.tasks[$id].verdict == null' <<< "$DATA" >/dev/null; then
      transform --arg id "$ID" --arg v "$verdict" --arg status "$status" --arg completed "$completed" '
        .tasks[$id] |= (.verdict=$v | if .status=="blocked" then .status=$status |
          .completed_at=(if $completed=="" then null else $completed end) else . end)'
      event task.import_enriched "$ID"
    fi
    return
  fi
  role=$(role_for "$peer"); next_id; stamp=$(now)
  transform --arg id "$ID" --arg peer "$peer" --arg source "$source" --arg answer "$answer" --arg request "$request" \
    --arg title "$title" --arg status "$status" --arg started "$started" --arg completed "$completed" \
    --arg verdict "$verdict" --arg role "$role" --arg key "$key" --arg at "$stamp" '
    .tasks[$id] = {id:$id, source_id:$source, peer:$peer, role:$role, title:$title, status:$status,
      priority:"normal",due_at:"",created_at:$at, started_at:(if $started == "" then null else $started end),
      completed_at:(if $completed == "" then null else $completed end),
      request_path:$request, answer_path:$answer, tags:["imported"], deps:[], import_key:$key,
      verdict:(if $verdict == "" then null else $verdict end)}'
  event task.imported "$ID" "$(jq -nc --arg peer "$peer" --arg key "$key" '{peer:$peer,import_key:$key}')"
}
import_existing() {
  local peer file base source request title verdict status started completed state last current found key
  shopt -s nullglob
  for peer in $(jq -r '.peers | keys[]' "$REGISTRY"); do
    state='{}'
    if [ -f "$CONTEXT_DIR/$peer/_state/status.json" ]; then state=$(jq -e . "$CONTEXT_DIR/$peer/_state/status.json"); fi
    last=$(jq -r '.last_answer_path // empty' <<< "$state")
    for file in "$CONTEXT_DIR/$peer/"[0-9][0-9][0-9]-answer-*.md; do
      base=${file##*/}; source=${base%%-*}
      request=${file/-answer-/-request-}; [ -f "$request" ] || request=''
      title=$(sed -n '/^# /{s/^# //;p;q;}' "$file"); title=${title:-$base}
      if [ -n "$request" ]; then
        title=$(sed -n '/^# /{s/^# //;p;q;}' "$request"); title=${title:-$base}
      fi
      verdict=$(sed -n '/^\*\*Disposition:\*\*/{s/^\*\*Disposition:\*\*[[:space:]]*//;p;q;}' "$file" | awk '{print $1}')
      if [ -z "$verdict" ]; then
        verdict=$(awk '/^## Verdict/{v=1;next} v && /^## /{exit} v && /^- \*\*(CONFIRM|CONFIRM_WITH_FIXES|REJECT)\*\*/{gsub(/\*/, "", $2);print $2;exit}' "$file")
      fi
      case "$verdict" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;; *) verdict='' ;; esac
      status=$(status_for_handback "$verdict")
      started=''; completed=''
      if [ "$last" = "$file" ]; then
        completed=$(jq -r '.last_completed_at // empty' <<< "$state")
      fi
      [ "$status" = done ] || completed=''
      import_record "$peer" "$source" "$file" "$request" "$title" "$status" "$started" "$completed" "$verdict" "answer:$file"
    done
    # Runtime-only tasks: preserve exact answer identity, never merge by local NNN alone.
    for key in last current; do
      if [ "$key" = last ]; then
        source=$(jq -r '.last_task // empty' <<< "$state"); file=$last
        status=done; started=''; completed=$(jq -r '.last_completed_at // empty' <<< "$state")
      else
        source=$(jq -r '.current_task // empty' <<< "$state"); file=''
        started=$(jq -r '.current_task_started_at // empty' <<< "$state"); completed=''
        status=$(jq -r '.state // "pending"' <<< "$state")
        case "$status" in working|busy) status=working;; blocked) ;; *) status=pending;; esac
      fi
      [ -n "$source" ] || continue
      if [ "$key" = last ] && [ -n "$file" ] && jq -e --arg p "$peer" --arg a "$file" 'any(.tasks[]; .peer == $p and .answer_path == $a)' <<< "$DATA" >/dev/null; then continue; fi
      request=''
      for found in "$CONTEXT_DIR/$peer/${source:0:3}-request-"*.md; do
        if [ -n "$request" ]; then request=''; break; fi
        request=$found
      done
      # A resumed task can have a BLOCKED handback with the same request: runtime wins.
      found=$(jq -r --arg p "$peer" --arg r "$request" '[.tasks[] | select(.peer == $p and $r != "" and .request_path == $r)] | if length == 1 then .[0].id else empty end' <<< "$DATA")
      if [ "$key" = current ] && [ -n "$found" ]; then
        if jq -e --arg id "$found" --arg status "$status" --arg started "$started" '.tasks[$id] | .status==$status and .started_at==$started and .completed_at==null' <<< "$DATA" >/dev/null; then continue; fi
        transform --arg id "$found" --arg status "$status" --arg started "$started" '.tasks[$id] |= (.status=$status | .started_at=$started | .completed_at=null)'
        event task.runtime_imported "$found"
      else
        import_record "$peer" "$source" "$file" "$request" "Imported $peer task $source" "$status" "$started" "$completed" '' "runtime:$peer:$source:$request"
      fi
    done
  done
}
# Reconcile existing tasks against on-disk NNN-answer-*.md handbacks: mark the
# matching task done and record the parsed verdict. Idempotent; only touches
# tasks that already exist (import-existing owns discovery of new ones).
sync_tasks() {
  local peer file request verdict found stamp base source status
  shopt -s nullglob
  for peer in $(jq -r '.peers | keys[]' "$REGISTRY"); do
    for file in "$CONTEXT_DIR/$peer/"[0-9][0-9][0-9]-answer-*.md; do
      request=${file/-answer-/-request-}; [ -f "$request" ] || request=''
      base=${file##*/}; source=${base%%-*}
      file=$(canonical_path "$CONTEXT_DIR" "$peer" "$file")
      request=$(canonical_path "$CONTEXT_DIR" "$peer" "$request")
      verdict=$(sed -n '/^\*\*Disposition:\*\*/{s/^\*\*Disposition:\*\*[[:space:]]*//;p;q;}' "$file" | awk '{print $1}')
      if [ -z "$verdict" ]; then
        verdict=$(awk '/^## Verdict/{v=1;next} v && /^## /{exit} v && /^- \*\*(CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT)\*\*/{gsub(/\*/, "", $2);print $2;exit}' "$file")
      fi
      verdict=$(printf '%s' "$verdict" | tr '[:lower:]' '[:upper:]')
      case "$verdict" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;; *) verdict='' ;; esac
      # Ladder is shared with `callback` (resolve_task_id) so the two cannot drift.
      found=$(resolve_task_id "$peer" "$file" "$request" "$base" "$source")
      [ -n "$found" ] || continue
      status=$(status_for_handback "$verdict")
      # Unchanged only when BOTH the completion state and the peer verdict already
      # match — the handback owns `.verdict`, so a stale/wrong value is repaired
      # here instead of being frozen by a status-only check.
      if jq -e --arg id "$found" --arg status "$status" --arg v "$verdict" \
           '.tasks[$id].status==$status and (($v=="") or .tasks[$id].verdict==$v)' <<< "$DATA" >/dev/null; then continue; fi
      stamp=$(now)
      transform --arg id "$found" --arg a "$file" --arg v "$verdict" --arg status "$status" --arg at "$stamp" '
        .tasks[$id] |= (.answer_path=$a | .status=$status
          | .completed_at=(if $status=="done" then (.completed_at // $at) else null end)
          | .verdict=(if $v=="" then .verdict else $v end)
          | .callback_recorded=true)'
      event task.synced "$found" "$(jq -nc --arg path "$file" '{answer_path:$path}')"
    done
  done
}
# Caller holds the registry lock; the subshell isolates renderer state and failures.
render_html_best_effort() {
  # Best-effort HTML overview: shares the registry lock, never writes partial
  # output, mirrors the render_dashboard unchanged detection.
  local html_out="$TASK_DIR/DASHBOARD.html" html_tmp
  html_tmp=$(mktemp "$TASK_DIR/DASHBOARD.html.tmp.XXXXXX") || return 1
  DB_PATH="$DB" REGISTRY_PATH="$REGISTRY" DEC_DIR="$CONTEXT_DIR/_decisions" WS_NAME="$(basename "$PWD")" \
    python3 "$TASKCTL_DIR/render_html.py" > "$html_tmp" || { rm -f -- "$html_tmp"; return 1; }
  if [ -f "$html_out" ] && cmp -s "$html_tmp" "$html_out"; then
    rm -f -- "$html_tmp"
    printf 'DASHBOARD: unchanged %s\n' "$html_out" >&2
  else
    mv -- "$html_tmp" "$html_out" || return 1
    printf 'DASHBOARD: wrote %s\n' "$html_out" >&2
  fi
}
render_dashboard() (
trap cleanup EXIT
OUTPUT="$TASK_DIR/DASHBOARD.md"
[ ! -e "$OUTPUT" ] || [ -f "$OUTPUT" ] || fail 'DASHBOARD.md must be a regular file'
[ -f "$DB" ] || fail 'tasks.json missing; run taskctl.sh import-existing or new'
validate < "$DB" || fail 'invalid tasks.json'
PEERS=$(jq '.peers | length' "$REGISTRY") || exit 1
DECISIONS='[]'
shopt -s nullglob
for file in "$CONTEXT_DIR/_decisions/"*.md; do
  DECISIONS=$(jq -c --arg file "$file" '. + [$file]' <<< "$DECISIONS") || exit 1
done
TMP=$(mktemp "$TASK_DIR/DASHBOARD.md.tmp.XXXXXX") || exit 1
jq -r --arg workspace "$(basename "$PWD")" --argjson peers "$PEERS" --argjson decisions "$DECISIONS" --arg context "$CONTEXT_DIR" '
  def cell: tostring | gsub("&";"&amp;") | gsub("<";"&lt;") | gsub(">";"&gt;") |
    gsub("\\|";"&#124;") | gsub("`";"&#96;") | gsub("\\[";"&#91;") | gsub("\\]";"&#93;") | gsub("[\r\n]";" ");
  def nominal:  # strip everything up to and including the workspace context dir
    . as $p | ($p | index($context + "/")) as $i | if $i == null then $p else $p[$i:] end;
  def link:
    . as $p | if $p == null or $p == "" then "—" else
      ($p|nominal) as $n |
      (if ($n|startswith($context + "/")) then "../" + ($n|ltrimstr($context + "/"))
       elif ($n|startswith("/")) then $n else "../../" + $n end) as $href |
      "[" + ($n|cell) + "](" + ($href|split("/")|map(@uri)|join("/")) + ")" end;
  # ISO 8601 UTC → Vietnam time (UTC+7) compact format dd/mm HH:MM.
  # Returns "unknown" if input is null/empty/non-ISO. TZ-independent: fromdateiso8601
  # returns UTC seconds regardless of $TZ, so the +7h offset is reliable on any host.
  def to_vn:
    if . == null or . == "" then "unknown" else
      try (fromdateiso8601 + (7*3600) | strftime("%d/%m %H:%M"))
      catch "unknown" end;
  def row: "| " + (map(cell) | join(" | ")) + " |";
  def taskrow: "| " + ([.id,((.lane // "—")|ascii_upcase),.title,.peer,.status,((.deps // [])|join(", "))]|map(cell)|join(" | ")) + " | " + (.request_path|link) + " |";
  def priority_key: [({critical:0,high:1,normal:2,low:3}[.priority // "normal"] // 2), (if (.due_at // "") == "" then "9999" else .due_at end), (.created_at // "")];
  . as $db | [.tasks[]] as $tasks |
  "**Updated (Vietnam time):** " + (.updated_at // "unknown" | to_vn),
  "**Workspace:** " + ($workspace|cell),
  "**Peers tracked:** \($peers)",
  (if any($tasks[]; .status=="upcoming") then
    "## Upcoming (priority order)", "", "| Priority | ID | Title | Peer | Due (VN) | Tags |", "|---|---|---|---|---|---|",
    ($tasks|map(select(.status=="upcoming"))|sort_by(priority_key)[]|
      [((.priority // "normal")|ascii_upcase|.[0:3]),.id,.title,.peer,(.due_at|to_vn),((.tags // [])|join(", "))]|row), ""
   else empty end),
  (if ($tasks|map(select(.status!="upcoming" and .status!="done" and .status!="cancelled"))|length) > 0 then
    "## Active Tasks", "", "| ID | Lane | Title | Peer | Status | Dependencies | Request |", "|---|---|---|---|---|---|---|",
    ($tasks|sort_by(.id)[]|select(.status!="upcoming" and .status!="done" and .status!="cancelled")|taskrow), ""
   else empty end),
  "## Recently Completed (latest 20)", "", "| ID | Lane | Title | Peer | Completed (VN) | Verdict (peer) | Accepted | Evidence / Answer |", "|---|---|---|---|---|---|---|---|",
  ($tasks|map(select(.status=="done"))|sort_by([(.completed_at // ""),.id])|reverse|.[0:20][]|
    "| " + ([.id,((.lane // "—")|ascii_upcase),.title,.peer,(.completed_at // "unknown" | to_vn),(.verdict // "—"),(.acceptance // "—")]|map(cell)|join(" | ")) + " | " + (if (.answer_path // "") != "" then (.answer_path|link) else ((.evidence // "—")|cell) end) + " |"), "",
  (if any($tasks[]; (.deps|length)>0) then
    "## Dependency Graph", "", "Task → prerequisites (ASCII):", "", "```text",
    ($tasks[]|select((.deps|length)>0)|(.id|cell) + " -> " + (.deps|map(cell)|join(", "))), "```", ""
   else empty end),
  "## Recent Events (latest 20)", "", "| Sequence | VN Time | Event | Task | Actor | Detail |", "|---|---|---|---|---|---|",
  (.events[-20:]|reverse[]|[.seq,(.at // "unknown" | to_vn),.type,(.task_id // ""),(.actor // ""),(.verdict // .status // .path // .lock // "")]|row), "",
  "## Decisions", "",
  (($decisions + [$tasks[]|(.decisions // [])[]])|unique[]|"- " + link), ""
' "$DB" > "$TMP" || exit 1
if [ -f "$OUTPUT" ] && cmp -s "$TMP" "$OUTPUT"; then
  printf 'DASHBOARD: unchanged %s\n' "$OUTPUT" >&2
else
  mv -- "$TMP" "$OUTPUT" || exit 1; TMP=''
  printf 'DASHBOARD: wrote %s\n' "$OUTPUT" >&2
fi
)
taskctl_main() {
  [ "$#" -gt 0 ] || { usage; exit 2; }
  local command=$1; shift
  case "$command" in help|--help|-h) usage; return;; esac
  setup
  lock_registry
  if [ "$command" = dashboard-open ] || [ "$command" = dashboard-stop ] || [ "$command" = dashboard-status ]; then
    port=8901
    for option in "$@"; do case "$option" in
      --port=*) port=${option#*=};;
      *) fail "unknown option: $option";;
    esac; done
    case "$port" in ''|*[!0-9]*) fail "invalid port: $port";; esac
    find_live_dashboard() {
      pgrep -f "http\.server" 2>/dev/null | while read -r pid; do
        args=$(ps -p "$pid" -o args= 2>/dev/null || true)
        if echo "$args" | grep -qE 'http\.server [0-9]+'; then
          echo "$args" | sed -nE 's/.*http\.server ([0-9]+).*/\1/p'
        fi
      done | head -1
    }
    case "$command" in
      dashboard-stop)
        # Only kill a server WE spawned (PID recorded in .dashboard.pid).
        # Other http.server processes (e.g. hub-managed 'tasks-real') are left alone.
        if [ -f "$TASK_DIR/.dashboard.pid" ]; then
          pid=$(cat "$TASK_DIR/.dashboard.pid" 2>/dev/null || true)
          if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            printf 'taskctl: stopped dashboard server (pid %s)\n' "$pid"
          else
            printf 'taskctl: no live dashboard server (stale pid %s)\n' "$pid"
          fi
          rm -f -- "$TASK_DIR/.dashboard.pid"
        else
          live=$(find_live_dashboard || true)
          if [ -n "$live" ]; then
            printf 'taskctl: dashboard running on port %s but not owned by taskctl (use hub to stop)\n' "$live"
          else
            printf 'taskctl: no dashboard server running\n'
          fi
        fi
        return
        ;;
      dashboard-status)
        live=$(find_live_dashboard || true)
        owned=""
        if [ -f "$TASK_DIR/.dashboard.pid" ]; then
          pid=$(cat "$TASK_DIR/.dashboard.pid" 2>/dev/null || true)
          if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            owned=" (owned by taskctl)"
          fi
        fi
        if [ -n "$live" ]; then
          printf 'taskctl: live on http://127.0.0.1:%s/DASHBOARD.html%s\n' "$live" "$owned"
        else
          printf 'taskctl: no dashboard server running\n'
        fi
        return
        ;;
    esac
    # command == dashboard-open
    live=$(find_live_dashboard || true)
    if [ -n "$live" ]; then
      if [ "$live" != "$port" ]; then
        printf 'taskctl: dashboard already live on port %s (ignoring --port=%s)\n' "$live" "$port"
      else
        printf 'taskctl: dashboard already live on port %s\n' "$live"
      fi
      printf 'taskctl: http://127.0.0.1:%s/DASHBOARD.html\n' "$live"
      for opener in open xdg-open; do
        if command -v "$opener" >/dev/null 2>&1; then
          "$opener" "http://127.0.0.1:$live/DASHBOARD.html" >/dev/null 2>&1 || true
          break
        fi
      done
      return
    fi
    printf 'taskctl: starting server on port %s (Ctrl-C to stop)\n' "$port"
    # Persist the PID so `dashboard-stop` can kill only this server,
    # leaving other http.server processes (e.g. hub-managed 'tasks-real') untouched.
    printf '%s\n' "$$" > "$TASK_DIR/.dashboard.pid"
    exec python3 -m http.server "$port" --bind 127.0.0.1 --directory "$TASK_DIR"
  fi
  if [ "$command" = serve ]; then
    port=8000
    for option in "$@"; do case "$option" in
      --port=*) port=${option#*=};;
      *) fail "unknown option: $option";;
    esac; done
    case "$port" in ''|*[!0-9]*) fail "invalid port: $port";; esac
    render_dashboard
    render_html_best_effort
    # Release the registry lock before serving: the server only reads files,
    # so holding the write lock would block every concurrent mutation.
    release_lock "$OWN_LOCK" || true
    OWN_LOCK=''
    printf 'taskctl: serving %s at http://127.0.0.1:%s/DASHBOARD.html (Ctrl-C to stop)\n' "$TASK_DIR" "$port" >&2
    exec python3 -m http.server "$port" --bind 127.0.0.1 --directory "$TASK_DIR"
  fi
  if [ "$command" = dashboard ]; then
    if [ "${1:-}" = --html ]; then
      shift
      [ "$#" -eq 0 ] || fail 'dashboard --html takes no arguments'
      render_html_best_effort; return
    fi
    [ "$#" -eq 0 ] || fail 'dashboard takes no arguments'
    render_dashboard
    render_html_best_effort; return
  fi
  load_db
  local ID='' peer title role tags='' deps='' request='' option status verdict stamp path extra before source matches owner name priority='normal' due='' sort='' base context_abs answer candidate fname prefix lane=''
  before=$DATA
  case "$command" in
    new|plan)
      [ "$#" -ge 2 ] || fail "$command requires peer and title"
      peer=$1; title=$2; shift 2; [ -n "$title" ] || fail 'empty title'; role=$(role_for "$peer")
      for option in "$@"; do case "$option" in
        --tags=*) tags=${option#*=};; --deps=*) deps=${option#*=};; --id=*) ID=${option#*=};;
        --request=*) [ "$command" = new ] || fail "unknown option: $option"; request=${option#*=};;
        --lane=*) [ "$command" = new ] || fail "unknown option: $option"; lane=${option#*=};;
        --priority=*) [ "$command" = plan ] || fail "unknown option: $option"; priority=${option#*=};;
        --due=*) [ "$command" = plan ] || fail "unknown option: $option"; due=${option#*=};;
        *) fail "unknown option: $option";; esac; done
      case "$priority" in critical|high|normal|low) ;; *) fail "invalid priority: $priority";; esac
      case "$lane" in ''|notice|micro|standard|full) ;; *) fail "invalid lane: $lane (notice|micro|standard|full)";; esac
      if [ -n "$due" ]; then
        [[ "$due" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || fail "invalid due date: $due"
        python3 - "$due" <<'PY' || fail "invalid due date: $due"
import datetime, sys
try:
    datetime.date.fromisoformat(sys.argv[1])
except ValueError:
    sys.exit(1)
PY
        due="${due}T00:00:00Z"
      fi
      [ -n "$ID" ] || next_id
      [[ "$ID" =~ ^[0-9]{3,}$ ]] || fail 'id must have at least three digits'
      if jq -e --arg id "$ID" '.tasks | has($id)' <<< "$DATA" >/dev/null; then fail "task exists: $ID"; fi
      # Bind the request path: an explicit --request wins; otherwise auto-bind
      # the single conventional request file. Keeps the task<->artifact link
      # populated so callback/sync can resolve task identity without guessing.
      if [ -z "$request" ]; then
        local -a _reqs=()
        shopt -s nullglob
        _reqs=("$CONTEXT_DIR/$peer/$ID"-request-*.md)
        shopt -u nullglob
        if [ "${#_reqs[@]}" -eq 1 ]; then
          request=${_reqs[0]}
        elif [ "${#_reqs[@]}" -gt 1 ]; then
          printf 'taskctl: WARNING — %d request files match %s-request-*; pass --request explicitly\n' "${#_reqs[@]}" "$ID" >&2
        fi
      fi
      extra=$(jq -nc --arg deps "$deps" --arg tags "$tags" '{deps:($deps|split(",")|map(select(length>0))|unique),tags:($tags|split(",")|map(select(length>0))|unique)}')
      jq -e --argjson x "$extra" '.tasks as $t | all($x.deps[]; . as $id | $t | has($id))' <<< "$DATA" >/dev/null || fail 'unknown dependency'
      stamp=$(now)
      status=pending; [ "$command" != plan ] || status=upcoming
      transform --arg id "$ID" --arg peer "$peer" --arg role "$role" --arg title "$title" --arg at "$stamp" --arg request "$request" --argjson x "$extra" --arg status "$status" --arg priority "$priority" --arg due "$due" --arg lane "$lane" '
        .tasks[$id] = ({id:$id,peer:$peer,role:$role,title:$title,lane:$lane,status:$status,priority:$priority,due_at:$due,created_at:$at,
          started_at:null,completed_at:null,request_path:$request,answer_path:""} + $x)'
      if [ "$command" = plan ]; then
        event task.planned "$ID" "$(jq -nc --arg priority "$priority" --arg due "$due" '{priority:$priority,due_at:$due}')"
      else event task.new "$ID"; fi
      printf '%s\n' "$ID";;
    promote)
      [ "$#" -eq 1 ] || fail 'promote requires task id'
      ID=$1; require_task "$ID"
      status=$(jq -r --arg id "$ID" '.tasks[$id].status' <<< "$DATA")
      [ "$status" = upcoming ] || fail "can only promote from upcoming (current: $status)"
      transform --arg id "$ID" '.tasks[$id].status="pending"'
      event task.promoted "$ID";;
    reopen)
      # Rework path for a closed task (e.g. a review accepted with fixes, or a
      # rejected handback). Blocked is NOT the way back: it means the peer could
      # not finish. The prior verdict/acceptance stay on the record as history.
      [ "$#" -eq 1 ] || fail 'reopen requires task id'
      ID=$1; require_task "$ID"
      status=$(jq -r --arg id "$ID" '.tasks[$id].status' <<< "$DATA")
      case "$status" in done|blocked|cancelled) ;; *) fail "can only reopen a closed task (current: $status)";; esac
      stamp=$(now)
      transform --arg id "$ID" --arg at "$stamp" '
        .tasks[$id] |= (.status="pending" | .completed_at=null | .callback_recorded=false)'
      event task.reopened "$ID" "$(jq -nc --arg previous "$status" '{previous_status:$previous}')";;
    dispatch|status|verify|decision)
      [ "$#" -ge 1 ] || fail "$command requires task id"; ID=$1; shift; require_task "$ID"
      case "$command" in
        dispatch)
          [ "$#" -eq 0 ] || fail 'dispatch takes only id'
          jq -e --arg id "$ID" '.tasks[$id].status | IN("pending","blocked")' <<< "$DATA" >/dev/null || fail 'dispatch requires pending or blocked task'
          transform --arg id "$ID" '.tasks[$id].status="dispatched"'; event task.dispatched "$ID";;
        status)
          [ "$#" -eq 1 ] || fail 'status requires new status'; status=$1
          case "$status" in working|done|blocked|cancelled) ;; *) fail 'invalid status';; esac
          if jq -e --arg id "$ID" --arg status "$status" '.tasks[$id].status==$status' <<< "$DATA" >/dev/null; then
            printf 'TASKS: unchanged\n'; return
          fi
          stamp=$(now)
          transform --arg id "$ID" --arg status "$status" --arg at "$stamp" '
            .tasks[$id] |= (.status=$status | if $status=="working" then .started_at=(.started_at // $at) | .completed_at=null
              elif $status=="done" or $status=="cancelled" then .completed_at=$at else .completed_at=null end)'
          case "$status" in working) option=task.started;; done) option=task.completed;; *) option=task.$status;; esac
          event "$option" "$ID" "$(jq -nc --arg status "$status" '{status:$status}')";;
        verify)
          [ "$#" -eq 1 ] || fail 'verify requires verdict'; verdict=$1
          case "$verdict" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;; *) fail 'invalid verdict';; esac
          # Acceptance is Lead's ruling on the handback, kept in its OWN field:
          # `.verdict` stays whatever the peer reported. Re-ruling with the same
          # acceptance is a no-op, so re-confirming a landed callback is free.
          # Status is untouched — it records whether the peer finished the task.
          if jq -e --arg id "$ID" --arg v "$verdict" '.tasks[$id].acceptance == $v' <<< "$DATA" >/dev/null; then
            printf 'TASKS: unchanged\n'; return
          fi
          stamp=$(now)
          transform --arg id "$ID" --arg v "$verdict" --arg at "$stamp" '
            .tasks[$id] |= (.acceptance=$v | .accepted_at=$at)'
          event task.verified "$ID" "$(jq -nc --arg verdict "$verdict" '{verdict:$verdict, acceptance:$verdict}')";;
        decision)
          [ "$#" -eq 1 ] || fail 'decision requires path'; path=$1
          [ -f "$path" ] && [[ "$path" = *.md ]] || fail 'decision must be an existing Markdown file'
          transform --arg id "$ID" --arg p "$path" '.tasks[$id].decisions = ((.tasks[$id].decisions // []) + [$p] | unique)'
          event task.decision "$ID" "$(jq -nc --arg path "$path" '{path:$path}')";;
      esac;;
    list)
      peer=''; status=''; tags=''; lane=''
      for option in "$@"; do case "$option" in --peer=*) peer=${option#*=};; --status=*) status=${option#*=};; --tag=*) tags=${option#*=};; --lane=*) lane=${option#*=};; --sort=*) sort=${option#*=}; [ "$sort" = priority ] || fail "invalid sort: $sort";; *) fail "unknown filter: $option";; esac; done
      jq --arg peer "$peer" --arg status "$status" --arg tag "$tags" --arg lane "$lane" --arg sort "$sort" "$PRIORITY_SORT"'
        [.tasks[] | select(($peer=="" or .peer==$peer) and ($status=="" or .status==$status) and ($lane=="" or (.lane // "")==$lane) and ($tag=="" or (.tags|index($tag))!=null))]
        | if $sort=="priority" then sort_by(priority_key) else . end' <<< "$DATA"; return;;
    show)
      [ "$#" -eq 1 ] || fail 'show requires id'; require_task "$1"; jq --arg id "$1" '.tasks[$id]' <<< "$DATA"; return;;
    import-existing)
      [ "$#" -eq 0 ] || fail 'import-existing takes no arguments'; import_existing;;
    sync)
      [ "$#" -eq 0 ] || fail 'sync takes no arguments'; sync_tasks; sync_tasklog;;
    callback)
      [ "$#" -eq 3 ] || fail 'callback requires peer, answer path, verdict'
      peer=$1; path=$2; verdict=$3; role=$(role_for "$peer")
      # Tolerate transport wrapping (quotes/backticks) and normalize the verdict.
      path=$(printf '%s' "$path" | tr -d "\"'\`")
      verdict=$(printf '%s' "$verdict" | tr -d "\"'\`" | tr '[:lower:]' '[:upper:]')
      case "$verdict" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;; *) fail "invalid callback verdict: $verdict";; esac
      # Resolve relative paths against the workspace root and the peer directory.
      context_abs=$(cd -- "$CONTEXT_DIR" 2>/dev/null && pwd -P) || context_abs=$CONTEXT_DIR
      answer=''
      for candidate in "$path" "$CONTEXT_DIR/$path" "$CONTEXT_DIR/$peer/$path"; do
        if [ -f "$candidate" ]; then answer=$candidate; break; fi
      done
      [ -n "$answer" ] || fail "callback answer does not exist: $path"
      # Path must belong to callback peer + match NNN-answer-*.md pattern.
      # bash 3.2 on macOS has quirks with [[ pattern matching, use grep -E for
      # portable, reliable char-class + glob combinations.
      answer_abs=$(cd -- "$(dirname -- "$answer")" && pwd -P)/$(basename -- "$answer")
      prefix="$context_abs/$peer/"
      [ "${answer_abs#$prefix}" != "$answer_abs" ] || fail 'answer must belong to callback peer'
      fname="${answer_abs#$prefix}"
      echo "$fname" | grep -Eq '^[0-9]+-answer-.+\.md$' || fail 'answer must belong to callback peer'
      # Store the canonical (CONTEXT_DIR-relative) form, never the absolute one:
      # the glob-driven ladder and the dashboard both expect this shape.
      path=$(canonical_path "$CONTEXT_DIR" "$peer" "$answer_abs")
      source=${fname%%-*}
      base=$fname
      # Shared ladder (resolve_task_id): exact answer > exact request > basename >
      # one active peer/local-ID candidate. Ambiguity fails closed.
      request=$(canonical_path "$CONTEXT_DIR" "$peer" "${path/-answer-/-request-}")
      ID=$(resolve_task_id "$peer" "$path" "$request" "$base" "$source")
      case "$ID" in ''|*[!0-9]*) fail 'callback task identity missing or ambiguous; bind request path first';; esac
      status=$(status_for_handback "$verdict")
      # Idempotent on the handback identity, NOT on the verdict: `.verdict` is the
      # peer's assessment and this command owns it, so a replayed callback (or a
      # `sync` after Lead's acceptance) re-records it. Without this, a verdict
      # overwritten by an earlier tool can never be restored from the handback.
      if jq -e --arg id "$ID" --arg a "$path" --arg status "$status" \
           '.tasks[$id] | .answer_path==$a and .status==$status and .callback_recorded==true' <<< "$DATA" >/dev/null; then
        printf 'CALLBACK: already logged %s\n' "$ID"; return
      fi
      stamp=$(now)
      transform --arg id "$ID" --arg a "$path" --arg v "$verdict" --arg status "$status" --arg at "$stamp" '
        .tasks[$id] |= (.answer_path=$a | .status=$status
          | .completed_at=(if $status=="done" then (.completed_at // $at) else null end)
          | .verdict=$v | .callback_recorded=true)'
      # ONE event per completion. The verdict travels with it; Lead's `verify`
      # (acceptance) records a separate event and never rewrites `.verdict`.
      extra=$(jq -nc --arg peer "$peer" --arg verdict "$verdict" --arg path "$path" --arg status "$status" '{peer:$peer,verdict:$verdict,answer_path:$path,status:$status}')
      event task.completed "$ID" "$extra";;
    complete)
      # NOTICE/MICRO completion: no handback file exists, so the evidence
      # travels inline and is stored on the task itself. Idempotent on
      # (verdict, evidence) so a replayed [DONE] is harmless.
      [ "$#" -ge 2 ] || fail 'complete requires task id and verdict'
      ID=$1; shift
      verdict=$(printf '%s' "$1" | tr -d "\"'\`" | tr '[:lower:]' '[:upper:]'); shift
      evidence="${1:-}"; [ -n "$evidence" ] || fail 'complete requires a one-line evidence note'
      [ "$#" -le 1 ] || fail 'complete takes at most one evidence note'
      require_task "$ID"
      case "$verdict" in CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;; *) fail "invalid verdict: $verdict";; esac
      status=$(status_for_handback "$verdict")
      if jq -e --arg id "$ID" --arg v "$verdict" --arg e "$evidence" --arg status "$status" \
           '.tasks[$id] | .status==$status and .verdict==$v and .evidence==$e and .callback_recorded==true' <<< "$DATA" >/dev/null; then
        printf 'COMPLETE: already logged %s\n' "$ID"; return
      fi
      apply_complete "$ID" "$verdict" "$evidence"
      extra=$(jq -nc --arg verdict "$verdict" --arg status "$status" --arg evidence "$evidence" '{verdict:$verdict,status:$status,evidence:$evidence,lane_a:true}')
      event task.completed "$ID" "$extra";;
    lock-acquire|lock-release)
      [ "$#" -eq 1 ] || fail 'lock command requires name'; name=$1
      [[ "$name" =~ ^[a-zA-Z0-9_-]+$ ]] || fail 'invalid lock name'
      owner=${TASK_LOCK_OWNER_PID:-$PPID}; [[ "$owner" =~ ^[0-9]+$ ]] && [ "$owner" -gt 1 ] || fail 'invalid lock owner'
      kill -0 "$owner" 2>/dev/null || fail 'lock owner is not alive'
      # Persistent named leases belong to a living caller, not this short CLI.
      # Their metadata and audit event commit together under the kernel lock.
      option=$(jq -r --arg name "$name" '.named_locks[$name].owner // empty' <<< "$DATA")
      if [ "$command" = lock-acquire ]; then
        if [ -n "$option" ] && kill -0 "$option" 2>/dev/null; then fail 'named lock held'; fi
        transform --arg name "$name" --arg owner "$owner" '.named_locks[$name]={owner:$owner}'
      else
        [ "$option" = "$owner" ] || fail 'named lock belongs to another process or does not exist'
        transform --arg name "$name" 'del(.named_locks[$name])'
      fi
      event "$command" '' "$(jq -nc --arg name "$name" --arg owner "$owner" '{lock:$name,owner:$owner}')";;
    *) usage >&2; fail "unknown command: $command";;
  esac
  if [ "$DATA" = "$before" ] && [ -f "$DB" ]; then printf 'TASKS: unchanged\n'; return; fi
  commit
}
if [ "${BASH_SOURCE[0]}" = "$0" ]; then taskctl_main "$@"; fi
