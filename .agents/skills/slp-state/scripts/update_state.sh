#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SLP State Transition Script
# Atomic lifecycle state operations on herdr-context/<peer>/_state/status.json
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../../../" && pwd)"

usage() {
  cat << 'HELP'
Usage: update_state.sh <action> [arguments...]

Actions:
  start <peer> <task_id>
      Transition to "busy", assign current_task and current_task_started_at.

  done <peer> <task_id> <answer_path> <summary>
      Transition to "idle", update last_task, last_answer_path,
      last_answer_summary, and auto-compile context-compact.md.
      State only — no notification. Use for a non-completion handback
      (e.g. Disposition BLOCKED) or when you must notify separately.

  finish <peer> <task_id> <answer_path> <verdict> <summary>
      The one-command completion duty: validates the handback, transitions
      to "idle" (same as done), then notifies Lead with the canonical
      "[DONE] <peer>: <answer_path> — <VERDICT>" callback so the task
      registry/dashboard update without the caller assembling that string.
      verdict: CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT

  note <peer> <task_id> <verdict> "<evidence>"
      Completion for a NOTICE/MICRO task: no handback file exists, so
      the evidence travels inline. Transitions to "idle", appends ONE line to
      _state/tasklog.md (so `taskctl.sh sync` can still reconcile the task), then
      sends "[DONE] <peer>: #<task_id> <VERDICT> — <evidence>".
      Same verdict set as finish.

  idle <peer>
      Transition to "idle", reset current_task = null.

  constraint <peer> <do|do_not> "<text>"
      Add a norm to known_constraints.do or known_constraints.do_not.

  risk <peer> "<text>"
      Add a risk to known_risks.

  question <peer> <task_id> "<text>"
      Add an open question to open_questions.

Examples:
  bash .agents/skills/slp-state/scripts/update_state.sh start engineer-agy 024
  bash .agents/skills/slp-state/scripts/update_state.sh done engineer-agy 024 "herdr-context/engineer-agy/024-answer.md" "Finished convert screen"
  bash .agents/skills/slp-state/scripts/update_state.sh finish engineer-agy 024 "herdr-context/engineer-agy/024-answer.md" CONFIRM "Finished convert screen"
  bash .agents/skills/slp-state/scripts/update_state.sh note engineer-agy 025 CONFIRM "grepped X -> 0; 2 files, +6/-3; build SUCCESS"

Fingerprint (cheap staleness check, see slp-state SKILL.md §5):
  bash .agents/skills/slp-state/scripts/state_fingerprint.sh engineer-agy

Note: every mutating action below also prints a fresh fingerprint on
success — record it and skip re-reading unchanged state later.
HELP
  exit 1
}

if [ $# -lt 2 ]; then
  usage
fi

ACTION="$1"
PEER="$2"
STATE="$WORKSPACE_ROOT/herdr-context/$PEER/_state/status.json"

if [ ! -f "$STATE" ]; then
  echo "❌ Error: State file not found at $STATE" >&2
  exit 1
fi

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

atomic_update() {
  local jq_expr="$1"
  shift
  local tmp="$STATE.tmp.$$"
  trap 'rm -f "$tmp"' EXIT INT TERM
  if jq "$jq_expr" "$@" "$STATE" > "$tmp"; then
    mv "$tmp" "$STATE"
    trap - EXIT INT TERM
  else
    rm -f "$tmp"
    trap - EXIT INT TERM
    echo "❌ Error: Failed to execute atomic JSON update" >&2
    return 1
  fi
}

# Shared completion transition: idle + last_task/answer/summary + compact
# refresh. Used by both `done` (state only) and `finish` (state + notify) so
# the two can never drift.
do_done() {
  local task_id="$1" answer_path="$2" summary="$3"
  atomic_update \
    '.state = "idle"
     | .current_task = null
     | .current_task_started_at = null
     | .last_task = $task_id
     | .last_completed_at = $now
     | .last_answer_path = $ans
     | .last_answer_summary = $sum' \
    --arg task_id "$task_id" \
    --arg ans "$answer_path" \
    --arg sum "$summary" \
    --arg now "$NOW"
  echo "✔ [$PEER] State transitioned to IDLE (last_task: $task_id)"

  # Auto-update context-compact.md
  if [ -f "$SCRIPT_DIR/compile_compact.sh" ]; then
    bash "$SCRIPT_DIR/compile_compact.sh" "$PEER" "$WORKSPACE_ROOT"
  fi
}

case "$ACTION" in
  start)
    if [ $# -lt 3 ] || [ -z "${3:-}" ]; then
      echo "❌ Usage: $0 start <peer> <task_id>" >&2
      exit 1
    fi
    TASK_ID="$3"
    atomic_update \
      '.state = "busy" | .current_task = $task_id | .current_task_started_at = $now' \
      --arg task_id "$TASK_ID" \
      --arg now "$NOW"
    echo "✔ [$PEER] State transitioned to BUSY (task: $TASK_ID)"
    ;;

  done)
    if [ $# -lt 5 ] || [ -z "${3:-}" ] || [ -z "${4:-}" ] || [ -z "${5:-}" ]; then
      echo "❌ Usage: $0 done <peer> <task_id> <answer_path> <summary>" >&2
      exit 1
    fi
    do_done "$3" "$4" "$5"
    ;;

  finish)
    if [ $# -lt 6 ] || [ -z "${3:-}" ] || [ -z "${4:-}" ] || [ -z "${5:-}" ] || [ -z "${6:-}" ]; then
      echo "❌ Usage: $0 finish <peer> <task_id> <answer_path> <verdict> <summary>" >&2
      exit 1
    fi
    TASK_ID="$3"
    ANSWER_ARG="$4"
    VERDICT="$(printf '%s' "$5" | tr '[:lower:]' '[:upper:]')"
    SUMMARY="$6"

    # 1. Verdict must be a completion verdict the [DONE] callback accepts.
    #    BLOCKED is deliberately rejected: it is not a completion, so the task
    #    must be closed as blocked by Lead instead (taskctl.sh status <id> blocked).
    case "$VERDICT" in
      CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;;
      BLOCKED)
        echo "❌ Error: BLOCKED is not a completion verdict." >&2
        echo "   Write the handback, run '$0 done $PEER $TASK_ID <answer> <summary>'," >&2
        echo "   then notify Lead with a [BLOCKED] message; Lead closes the task as blocked." >&2
        exit 1
        ;;
      *)
        echo "❌ Error: invalid verdict '$5' (expected CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT)" >&2
        exit 1
        ;;
    esac

    # 2. Resolve the handback file (same candidate order as taskctl callback).
    ANSWER=''
    for candidate in "$ANSWER_ARG" "$WORKSPACE_ROOT/$ANSWER_ARG" "$WORKSPACE_ROOT/herdr-context/$PEER/$ANSWER_ARG"; do
      if [ -f "$candidate" ]; then ANSWER="$candidate"; break; fi
    done
    if [ -z "$ANSWER" ]; then
      echo "❌ Error: answer file not found: $ANSWER_ARG" >&2
      echo "   Looked at: $ANSWER_ARG | $WORKSPACE_ROOT/$ANSWER_ARG | $WORKSPACE_ROOT/herdr-context/$PEER/$ANSWER_ARG" >&2
      exit 1
    fi

    # 3. Minimum-duty guard: a handback must declare itself before completion.
    if ! grep -qE '^\*\*Disposition:\*\*|^## Terminal sentinel' "$ANSWER"; then
      echo "❌ Error: '$ANSWER' has no '**Disposition:**' line or '## Terminal sentinel' section." >&2
      echo "   Write the handback file before finishing (see slp-peer §4)." >&2
      exit 1
    fi

    # 4. The [DONE] callback regex matches a single non-space token as path.
    case "$ANSWER" in
      "$WORKSPACE_ROOT"/*) MSG_PATH="${ANSWER#"$WORKSPACE_ROOT"/}" ;;
      *) MSG_PATH="$ANSWER" ;;
    esac
    case "$MSG_PATH" in
      *[[:space:]]*)
        echo "❌ Error: answer path contains whitespace ('$MSG_PATH'); the [DONE] callback cannot match it." >&2
        exit 1
        ;;
    esac

    # 5. State FIRST — a transport failure must never lose the state update.
    do_done "$TASK_ID" "$MSG_PATH" "$SUMMARY"

    # 6. Then the canonical notification, built here so its format cannot drift.
    SEND_SCRIPT="$SCRIPT_DIR/../../slp-collab/scripts/slp-send.sh"
    if [ -f "$SEND_SCRIPT" ]; then
      if bash "$SEND_SCRIPT" Lead "[DONE] $PEER: $MSG_PATH — $VERDICT"; then
        echo "✔ [$PEER] Lead notified: [DONE] $MSG_PATH — $VERDICT"
      else
        echo "⚠️  [$PEER] State updated, but the Lead notification FAILED — the task record may be stale." >&2
        echo "    Retry only the notification:" >&2
        echo "    bash .agents/skills/slp-collab/scripts/slp-send.sh Lead \"[DONE] $PEER: $MSG_PATH — $VERDICT\"" >&2
        exit 1
      fi
    else
      echo "⚠️  [$PEER] State updated, but slp-send.sh was not found at $SEND_SCRIPT — Lead NOT notified." >&2
      echo "    Notify manually: bash .agents/skills/slp-collab/scripts/slp-send.sh Lead \"[DONE] $PEER: $MSG_PATH — $VERDICT\"" >&2
      exit 1
    fi
    ;;

  note)
    if [ $# -lt 5 ] || [ -z "${3:-}" ] || [ -z "${4:-}" ] || [ -z "${5:-}" ]; then
      echo "❌ Usage: $0 note <peer> <task_id> <verdict> \"<evidence>\"" >&2
      exit 1
    fi
    TASK_ID="$3"
    VERDICT="$(printf '%s' "$4" | tr '[:lower:]' '[:upper:]')"
    EVIDENCE="$5"
    case "$VERDICT" in
      CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT) ;;
      *) echo "❌ Error: invalid verdict '$4' (expected CONFIRM|CONFIRM_WITH_FIXES|PARTIAL|CHALLENGE|REJECT)" >&2; exit 1 ;;
    esac
    case "$EVIDENCE" in
      *'|'*) echo "❌ Error: evidence must not contain '|' (it is a tasklog field separator)." >&2; exit 1 ;;
    esac

    # NOTICE/MICRO keep no answer file. The append-only tasklog is what lets
    # `taskctl.sh sync` reconcile the task if the [DONE] message is lost.
    TASKLOG="$WORKSPACE_ROOT/herdr-context/$PEER/_state/tasklog.md"
    if [ ! -f "$TASKLOG" ]; then
      printf '# Task log — %s\n> Append-only, one line per NOTICE/MICRO completion: `NNN | VERDICT | ISO-8601 | evidence`\n' "$PEER" > "$TASKLOG"
    fi
    printf '%s | %s | %s | %s\n' "$TASK_ID" "$VERDICT" "$NOW" "$EVIDENCE" >> "$TASKLOG"

    # State FIRST — a transport failure must never lose the state update.
    do_done "$TASK_ID" "" "$EVIDENCE"

    # Then the canonical notification, built here so its format cannot drift.
    SEND_SCRIPT="$SCRIPT_DIR/../../slp-collab/scripts/slp-send.sh"
    MSG="[DONE] $PEER: #$TASK_ID $VERDICT — $EVIDENCE"
    if [ ! -f "$SEND_SCRIPT" ]; then
      echo "⚠️  [$PEER] State updated, but slp-send.sh was not found at $SEND_SCRIPT — Lead NOT notified." >&2
      echo "    Notify manually: bash .agents/skills/slp-collab/scripts/slp-send.sh Lead \"$MSG\"" >&2
      exit 1
    fi
    if bash "$SEND_SCRIPT" Lead "$MSG"; then
      echo "✔ [$PEER] Lead notified: $MSG"
    else
      echo "⚠️  [$PEER] State updated, but the Lead notification FAILED — the task record may be stale." >&2
      echo "    Retry only the notification:" >&2
      echo "    bash .agents/skills/slp-collab/scripts/slp-send.sh Lead \"$MSG\"" >&2
      exit 1
    fi
    ;;

  idle)
    atomic_update \
      '.state = "idle" | .current_task = null | .current_task_started_at = null'
    echo "✔ [$PEER] State transitioned to IDLE"
    ;;

  constraint)
    if [ $# -lt 4 ] || [ -z "${3:-}" ] || [ -z "${4:-}" ]; then
      echo "❌ Usage: $0 constraint <peer> <do|do_not> <text>" >&2
      exit 1
    fi
    TYPE="$3"
    TEXT="$4"
    if [ "$TYPE" != "do" ] && [ "$TYPE" != "do_not" ]; then
      echo "❌ Error: Type must be 'do' or 'do_not'" >&2
      exit 1
    fi
    atomic_update \
      '(.known_constraints // {}) as $c | .known_constraints = $c | .known_constraints[$type] = (((.known_constraints[$type] // []) + [$text]) | unique)' \
      --arg type "$TYPE" \
      --arg text "$TEXT"
    echo "✔ [$PEER] Added constraint to '\''$TYPE'\'': $TEXT"
    ;;

  risk)
    if [ $# -lt 3 ] || [ -z "${3:-}" ]; then
      echo "❌ Usage: $0 risk <peer> <text>" >&2
      exit 1
    fi
    TEXT="$3"
    atomic_update \
      '.known_risks = (((.known_risks // []) + [$text]) | unique)' \
      --arg text "$TEXT"
    echo "✔ [$PEER] Added risk: $TEXT"
    ;;

  question)
    if [ $# -lt 4 ] || [ -z "${3:-}" ] || [ -z "${4:-}" ]; then
      echo "❌ Usage: $0 question <peer> <task_id> <text>" >&2
      exit 1
    fi
    TASK_ID="$3"
    TEXT="$4"
    atomic_update \
      '.open_questions = ((.open_questions // []) + [{"question": $text, "raised_in": $task_id, "raised_at": $now}])' \
      --arg text "$TEXT" \
      --arg task_id "$TASK_ID" \
      --arg now "$NOW"
    echo "✔ [$PEER] Added open question for task $TASK_ID"
    ;;

  *)
    echo "❌ Unknown action: $ACTION" >&2
    usage
    ;;
esac

# Emit a fresh fingerprint so the caller can record it and skip re-reading
# unchanged state later (see state_fingerprint.sh + slp-state SKILL.md §5).
# Gated + failure-proof: never fails the state transition itself.
if [ -f "$SCRIPT_DIR/state_fingerprint.sh" ]; then
  bash "$SCRIPT_DIR/state_fingerprint.sh" "$PEER" "$WORKSPACE_ROOT" 2>/dev/null || true
fi
