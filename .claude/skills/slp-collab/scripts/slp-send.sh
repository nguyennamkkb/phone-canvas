#!/usr/bin/env bash
# Shared SLP peer<->Lead I/O:
#   - transport: send a message into a live pane (no queue/retry/state mutation)
#   - artifacts:  create the canonical request/answer file, both sides
#
# Usage:
#   bash slp-send.sh <Lead|peer-name> "message"
#   bash slp-send.sh request <peer> <NNN|auto> "<title>" [--lane=standard|full] [--lease=<v>] [--origin=<v>] [--topic=slug] [--force] [--body-file=F]
#   bash slp-send.sh answer  <peer> <NNN> <VERDICT>      [--topic=slug] [--force] [--body-file=F]
#
# The artifact subcommands are handled BEFORE the transport preconditions: writing
# a file needs neither herdr, nor the registry, nor the task lock. That is what
# lets a Peer run them. Branching is unambiguous because a peer name is always
# <role>-<agent> with a fixed role set, so `request`/`answer` can never be one.
set -euo pipefail

fail() { printf 'slp-send: %s\n' "$*" >&2; exit 1; }

if [ "$#" -lt 2 ]; then
  printf 'Usage: bash .agents/skills/slp-collab/scripts/slp-send.sh <Lead|peer-name> "message"\n' >&2
  printf '       bash .agents/skills/slp-collab/scripts/slp-send.sh request <peer> <NNN|auto> "<title>" [options]\n' >&2
  printf '       bash .agents/skills/slp-collab/scripts/slp-send.sh answer  <peer> <NNN> <VERDICT> [options]\n' >&2
  exit 2
fi

SLP_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd -P)

# ------------------------------------------------------------------------------
# Artifact creation (request / answer). No herdr, no registry, no lock.
# ------------------------------------------------------------------------------
ARTIFACT_KIND=''; CONTEXT_DIR="$SLP_ROOT/herdr-context"

# Vietnamese titles are the norm; transliterate to ASCII so a filename never
# carries diacritics or (worse) a `date -u` timestamp with `T` and `:`.
slugify() {
  printf '%s' "$1" | python3 -c '
import sys, unicodedata, re
s = unicodedata.normalize("NFKD", sys.stdin.read()).encode("ascii", "ignore").decode()
s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
print(s[:50].strip("-"))'
}

artifact_path() {
  # $1 peer, $2 NNN, $3 slug  -> <ctx>/<peer>/<NNN>-<kind>-<local date>-<slug>.md
  printf '%s/%s/%s-%s-%s-%s.md' "$CONTEXT_DIR" "$1" "$2" "$ARTIFACT_KIND" "$(date +%F)" "$3"
}

next_task_id() {
  # `auto` is for the documented order: create the request FIRST, then `taskctl
  # new --id=NNN` (auto-bind links it). With no ledger yet, start at 001.
  local db="$CONTEXT_DIR/_tasks/tasks.json"
  [ -f "$db" ] || { printf '001'; return 0; }
  jq -r '[.tasks | keys[] | select(test("^[0-9]+$")) | tonumber] | (max // 0) + 1' "$db" \
    | awk '{printf "%03d", $1}'
}

task_field() {  # $1 NNN, $2 jq path (e.g. .lane) -> value or empty
  local db="$CONTEXT_DIR/_tasks/tasks.json"
  [ -f "$db" ] || return 0
  jq -r --arg id "$1" ".tasks[\$id]$2 // empty" "$db" 2>/dev/null || true
}

artifact_main() {
  command -v jq >/dev/null 2>&1 || fail 'jq is required (task lookup).'
  command -v python3 >/dev/null 2>&1 || fail 'python3 is required (filename slug).'

  local peer='' nnn='' title='' verdict='' lane='' lease='' origin='' topic='' force='no' body_file=''
  local arg body path rel slug existing_lane existing_title sentinel
  [ "$#" -ge 2 ] || fail "$ARTIFACT_KIND requires <peer> and a task id (or 'auto')"
  peer="$1"; nnn="$2"; shift 2
  case "$peer" in ''|*[!A-Za-z0-9._-]*) fail "invalid peer name: $peer";; esac
  case "$nnn" in auto|'') nnn=$(next_task_id) ;; esac
  [[ "$nnn" =~ ^[0-9]{3,}$ ]] || fail "task id must have at least three digits: $nnn"

  if [ "$ARTIFACT_KIND" = request ]; then
    [ "$#" -ge 1 ] || fail 'request requires a title'
    case "$1" in --*) fail 'request requires a title as the third argument' ;; esac
    title="$1"; shift
  else
    [ "$#" -ge 1 ] || fail 'answer requires a verdict'
    case "$1" in --*) fail 'answer requires a verdict as the third argument' ;; esac
    verdict=$(printf '%s' "$1" | tr '[:lower:]' '[:upper:]'); shift
    case "$verdict" in
      CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;;
      *) fail "invalid verdict: $verdict (CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT)";;
    esac
  fi

  while [ "$#" -gt 0 ]; do case "$1" in
    --lane=*)   lane=${1#*=} ;;
    --lease=*)  lease=${1#*=} ;;
    --origin=*) origin=${1#*=} ;;
    --topic=*)  topic=${1#*=} ;;
    --force)    force=yes ;;
    --body-file=*) body_file=${1#*=} ;;
    *) fail "unknown option: $1" ;;
  esac; shift; done
  case "$lease" in *'|'*) fail 'lease must be one line without "|"' ;; esac
  case "$origin" in *'|'*) fail 'origin must not contain "|"' ;; esac
  case "$title" in
    *'"'*) fail 'title must not contain a double quote (it is quoted in the printed next command)' ;;
  esac
  [ -z "$body_file" ] || [ -f "$body_file" ] || fail "body file not found: $body_file"

  # Lane rules: NOTICE/MICRO have no artifact at all — that is their whole point.
  existing_lane=$(task_field "$nnn" .lane)
  [ -n "$lane" ] || lane="$existing_lane"
  if [ "$ARTIFACT_KIND" = request ] && [ -z "$lane" ]; then
    fail 'request needs --lane=standard|full (the task does not exist yet, so the lane cannot be read from the ledger)'
  fi
  case "$lane" in
    ''|standard|full) ;;
    notice|micro)
      fail "lane $lane writes no file — dispatch a message and complete with 'update_state.sh note' (see slp-collab)" ;;
    *) fail "invalid lane: $lane (standard|full)";;
  esac
  existing_title=$(task_field "$nnn" .title)

  if [ "$ARTIFACT_KIND" = answer ]; then
    # The peer already has the task; the ledger holds the title.
    [ -n "$title" ] || title="$existing_title"
    [ -n "$title" ] || title=$(sed -n '/^# /{s/^# [0-9]* — //;p;q;}' "$CONTEXT_DIR/$peer/$nnn"-request-*.md 2>/dev/null || true)
  fi
  [ -n "$title" ] || fail 'no title available: pass the title (request) or make sure the task/request exists (answer)'

  [ -n "$topic" ] || topic=$(slugify "$title")
  [ -n "$topic" ] || fail "title '$title' produced an empty slug; pass --topic="

  path=$(artifact_path "$peer" "$nnn" "$topic")
  [ -e "$path" ] && [ "$force" != yes ] && fail "artifact already exists: $path (use --force to overwrite)"
  mkdir -p -- "$(dirname -- "$path")"

  if [ -n "$body_file" ]; then
    body=$(cat -- "$body_file")
  elif [ ! -t 0 ]; then
    body=$(cat)
  else
    body=''
  fi

  if [ "$ARTIFACT_KIND" = request ]; then
    {
      printf '# %s — %s\n' "$nnn" "$title"
      printf 'Lane: %s · lease: %s · origin: %s\n' \
        "$(printf '%s' "$lane" | tr '[:lower:]' '[:upper:]')" "${lease:-<lease>}" "${origin:-<origin>}"
      printf '\n'
      if [ -n "$body" ]; then printf '%s\n' "$body"
      else
        cat <<'REQ_SKEL'
## Outcome
- <objective, 1 sentence> · Done when: <observable criteria> · Stop when: <what returns BLOCKED>

## Scope
- Owned: <exact files/dirs, ONE WRITER ONLY> · Excluded: <forbidden paths> · External effects: <DENIED | authorized list>

## Knowledge
- Primary: <ROLE>-BASELINE.md · Supplemental: none · Disposition: <IMPLEMENT|REVIEW|…>
- Project: <exact artifact paths> · Known unknowns: <open facts>

## Verify
- <exact commands + the results to report>

## Done
- Write the answer, then `update_state.sh finish` — it builds the `[DONE]` callback.
REQ_SKEL
      fi
    } > "$path"
  else
    {
      printf '# HANDBACK %s — %s\n\n' "$nnn" "$title"
      printf '**Disposition:** %s\n\n' "$verdict"
      if [ -n "$body" ]; then printf '%s\n' "$body"
      else
        cat <<'ANS_SKEL'
## Scope actually handled
- <files/dirs touched or read>

## Changes or findings
- <bullets + file:line>

## Verification and exact results
- <real command + output>

## Terminal sentinel
- `TASK_COMPLETE`
ANS_SKEL
      fi
    } > "$path"
    if ! grep -qE '^## Terminal sentinel' "$path"; then
      printf '\n## Terminal sentinel\n- `TASK_COMPLETE`\n' >> "$path"
    fi
  fi

  rel="herdr-context/$peer/$(basename -- "$path")"
  printf '%s\n' "$rel"
  if [ "$ARTIFACT_KIND" = request ]; then
    printf 'next: bash .agents/skills/slp-collab/scripts/taskctl.sh new %s "%s" --id=%s --lane=%s\n' \
      "$peer" "$title" "$nnn" "$lane" >&2
  else
    printf 'next: bash .agents/skills/slp-state/scripts/update_state.sh finish %s %s %s %s "<summary>"\n' \
      "$peer" "$nnn" "$rel" "$verdict" >&2
  fi
}

case "${1:-}" in
  request|answer)
    ARTIFACT_KIND="$1"; shift
    artifact_main "$@"
    exit 0
    ;;
esac

# Transport path: exactly one target and one message.
[ "$#" -eq 2 ] || fail 'send takes exactly two arguments: <Lead|peer-name> "message"'
command -v jq >/dev/null 2>&1 || fail 'jq is required.'
command -v herdr >/dev/null 2>&1 || fail 'herdr is required.'

REGISTRY="$SLP_ROOT/herdr-context/_registry/peers.json"
[ -f "$REGISTRY" ] || fail "Registry not found: $REGISTRY"

[ "${HERDR_ENV:-}" = 1 ] || {
  # Auto-detect: outside a Herdr pane, try to infer context from the Herdr CLI.
  if herdr workspace list >/dev/null 2>&1; then
    export HERDR_ENV=1
  else
    fail 'Run inside a Herdr-managed pane.'
  fi
}
if [ -z "${HERDR_WORKSPACE_ID:-}" ]; then
  # Fall back to the first workspace, else the Lead pane_id prefix in the registry.
  DETECTED_WS=$(herdr workspace list 2>/dev/null | jq -r '.result.workspaces[0].workspace_id // .result.workspaces[0].id // empty' 2>/dev/null || true)
  if [ -z "$DETECTED_WS" ]; then
    DETECTED_WS=$(jq -r '.Lead.pane_id // empty' "$REGISTRY" 2>/dev/null | cut -d: -f1 || true)
  fi
  if [ -n "$DETECTED_WS" ]; then
    export HERDR_WORKSPACE_ID="$DETECTED_WS"
  else
    fail 'Missing HERDR_WORKSPACE_ID.'
  fi
fi
TARGET="$1"
MESSAGE="$2"
PANE=$(jq -er --arg target "$TARGET" '
  (if $target == "Lead" then .Lead else .peers[$target] end)
  | .pane_id | select(type == "string" and length > 0)
' "$REGISTRY") || fail "Missing or invalid registry target: $TARGET"
# Herdr IDs are opaque (for example w7:pR); validate against live data below.

LIVE=$(herdr agent list) || fail 'Cannot read live Herdr agents; nothing sent.'
MATCH=$(jq -ce --arg pane "$PANE" --arg workspace "$HERDR_WORKSPACE_ID" '
  [.result.agents[] | select(.pane_id == $pane and .workspace_id == $workspace)]
  | select(length == 1) | .[0]
' <<< "$LIVE") || fail "No unique live agent for $TARGET at $PANE in this workspace. Ask Lead to verify registry."
AGENT_STATUS=$(jq -r '.agent_status // "unknown"' <<< "$MATCH")
case "$AGENT_STATUS" in
  idle|done|working) ;;
  *) fail "Target $TARGET is $AGENT_STATUS; nothing sent." ;;
esac

# Keep the existing SLP transport; message is one literal argument, never eval'd.
# Herdr output/exit status are returned unchanged. Success is not a task ACK.
if herdr pane run "$PANE" "$MESSAGE"; then
  status=$?
else
  status=$?
  exit "$status"
fi

# Buffered-TUI quirk (pi/omp/cline hold `pane run` text in input buffer;
# claude verified 2026-09-09, cline 2026-09-07): resolve the target engine via
# registry → live agent → <role>-<engine> name parse, then nudge with ENTER.
# Best-effort only: must not change delivery exit code.
if [ "$TARGET" != Lead ]; then
  target_engine=$(jq -r --arg target "$TARGET" '.peers[$target].engine // empty' "$REGISTRY" 2>/dev/null || true)
  if [ -z "$target_engine" ]; then
    target_engine=$(jq -r --arg pane "$PANE" '.result.agents[]? | select(.pane_id == $pane) | .engine // .agent // empty' <<< "$LIVE" 2>/dev/null | head -1 || true)
  fi
  if [ -z "$target_engine" ]; then
    case "$TARGET" in
      *-pi|*-omp|*-cline|*-claude) target_engine="${TARGET##*-}" ;;
    esac
  fi
  case "$target_engine" in
    pi|omp|cline|claude) herdr pane send-keys "$PANE" ENTER >/dev/null 2>&1 || true ;;
  esac
fi

# Auto-update task dashboard on peer completion callbacks.
# Two [DONE] shapes are recognized:
#   STANDARD/FULL: "[DONE] <peer>: <answer-path> — <verdict>"  -> taskctl.sh callback
#   NOTICE/MICRO : "[DONE] <peer>: #<NNN> <verdict> — <note>"  -> taskctl.sh complete
# Best-effort only: transport already succeeded; a logging failure must not
# break delivery semantics or change the exit code.
if [ "$TARGET" = Lead ]; then
  taskctl_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
  verdicts='CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT'
  if [ -x "$taskctl_dir/taskctl.sh" ]; then
    if done_line=$(printf '%s' "$MESSAGE" | grep -oE "^\[DONE\] [A-Za-z0-9._-]+: #[0-9]+ ($verdicts|$(printf '%s' "$verdicts" | tr '[:upper:]' '[:lower:]')) — .+$" 2>/dev/null); then
      # NOTICE/MICRO: no handback file; the task id and the evidence travel inline.
      done_id=$(printf '%s' "$done_line" | sed -E 's/^\[DONE\] [A-Za-z0-9._-]+: #([0-9]+) .*$/\1/')
      done_verdict=$(printf '%s' "$done_line" | sed -E "s/^\[DONE\] [A-Za-z0-9._-]+: #[0-9]+ ($verdicts|$(printf '%s' "$verdicts" | tr '[:upper:]' '[:lower:]')) — .*$/\1/" | tr '[:lower:]' '[:upper:]')
      done_note=$(printf '%s' "$done_line" | sed -E 's/^\[DONE\] [A-Za-z0-9._-]+: #[0-9]+ [A-Za-z_]+ — //')
      (cd -- "$SLP_ROOT" && HERDR_ENV=1 HERDR_WORKSPACE_ID="${HERDR_WORKSPACE_ID:-}" \
        bash "$taskctl_dir/taskctl.sh" complete "$done_id" "$done_verdict" "$done_note" >/dev/null 2>&1) \
        && printf 'slp-send: dashboard updated for task %s (NOTICE/MICRO)\n' "$done_id" >&2 \
        || printf 'slp-send: WARNING — dashboard update failed for task %s\n' "$done_id" >&2
    elif done_line=$(printf '%s' "$MESSAGE" | grep -oE "^\[DONE\] [A-Za-z0-9._-]+: [^ ]+ — ($verdicts|$(printf '%s' "$verdicts" | tr '[:upper:]' '[:lower:]'))$" 2>/dev/null); then
      done_peer=$(printf '%s' "$done_line" | sed -E 's/^\[DONE\] ([A-Za-z0-9._-]+): .*$/\1/')
      done_path=$(printf '%s' "$done_line" | sed -E 's/^\[DONE\] [A-Za-z0-9._-]+: ([^ ]+) — .*$/\1/' | tr -d "\"'\`")
      done_verdict=$(printf '%s' "$done_line" | sed -E 's/^\[DONE\] [A-Za-z0-9._-]+: [^ ]+ — ([A-Za-z_]+)$/\1/' | tr '[:lower:]' '[:upper:]')
      (cd -- "$SLP_ROOT" && HERDR_ENV=1 HERDR_WORKSPACE_ID="${HERDR_WORKSPACE_ID:-}"         bash "$taskctl_dir/taskctl.sh" callback "$done_peer" "$done_path" "$done_verdict" >/dev/null 2>&1)         && printf 'slp-send: dashboard updated for %s\n' "$done_peer" >&2         || printf 'slp-send: WARNING — dashboard update failed for %s\n' "$done_peer" >&2
    fi
  fi
fi
exit "$status"
