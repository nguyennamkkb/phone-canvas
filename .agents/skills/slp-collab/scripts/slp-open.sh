#!/usr/bin/env bash
# slp-open.sh — Open (or reopen) a peer agent in Herdr: create/reuse a tab,
# launch the engine CLI inside the pane, and bind the live pane_id into
# herdr-context/_registry/peers.json + saved_sessions.json.
#
# Used by:
#   - bootstrap.sh (cold-start or auto-restore)
#   - manual operator calls when spinning up a single peer mid-session
#
# Usage:
#   bash .agents/skills/slp-collab/scripts/slp-open.sh <peer-name>
#       [--engine <pi|omp|codex|claude|...>]
#       [--role <scout|engineer|reviewer|designer>]
#       [--cwd <path>]              # default: project root
#       [--restored]                # explicitly mark as reopen of a closed peer
#       [--auto-resume <yes|no>]    # inject mandatory role knowledge
#                                   # (+ state-resume prompt on --restored)
#                                   # default: yes
#       [--help]
#
# Idempotent:
#   - If peers.json already has the peer with a live pane_id, no-op (exit 0).
#   - If peers.json has the peer with status="closed_session", reopen it.
#   - Otherwise create a fresh tab + pane.
#
# Knowledge + auto-resume:
#   After the engine CLI launches, slp-open waits for the agent to reach
#   `idle`, then injects a mandatory knowledge prompt: read the four SLP
#   skills and load COMMON-BASELINE + the one role baseline for this peer's
#   role (slp-peer-knowledge §3). On --restored it additionally injects the
#   state-resume prompt (MEMORY.md, status.json, context-compact.md) so the
#   peer does not act on stale or lost context.
#
# Examples:
#   bash .agents/skills/slp-collab/scripts/slp-open.sh engineer-pi --engine pi --role engineer
#   bash .agents/skills/slp-collab/scripts/slp-open.sh scout-omp --engine omp --role scout --restored
#   bash .agents/skills/slp-collab/scripts/slp-open.sh scout-omp --restored --auto-resume no
#
# Exit codes:
#   0  success (created / reused / reopened)
#   1  generic failure
#   2  usage error
#   3  peer not found / could not be created
#   4  Herdr not responsive (no daemon)
#   5  engine CLI not in PATH

set -euo pipefail

# ------------------------------------------------------------------------------
# Help (must work before any precondition)
# ------------------------------------------------------------------------------
usage() {
  printf 'Usage: bash .agents/skills/slp-collab/scripts/slp-open.sh <peer-name>\n       [--engine <pi|omp|codex|claude|...>]\n       [--role <scout|engineer|reviewer|designer>]\n       [--cwd <path>]\n       [--restored] (mark as reopen of a closed peer)\n       [--auto-resume <yes|no>] (default yes; injects role knowledge + state-resume prompt)\n       [--help]\n\nOpens (or reopens) a peer agent in Herdr. Idempotent: live peers are no-op;\nclosed peers are reopened; missing peers are created fresh.\n\nExit codes: 0 ok | 1 generic | 2 usage | 3 peer | 4 herdr | 5 engine-missing\n' >&2
  exit 2
}

for arg in "$@"; do
  case "$arg" in
    -h|--help) usage ;;
  esac
done

# ------------------------------------------------------------------------------
# Resolve project root (mirror slp-send.sh / slp-close.sh)
# ------------------------------------------------------------------------------
SLP_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd -P)
CONTEXT_DIR="$SLP_ROOT/herdr-context"
REGISTRY="$CONTEXT_DIR/_registry/peers.json"
SESSIONS_CANON="$CONTEXT_DIR/saved_sessions.json"
SESSIONS_LOCAL="$CONTEXT_DIR/_registry/saved_sessions.json"
SESSIONS=""
[ -f "$SESSIONS_CANON" ] && SESSIONS="$SESSIONS_CANON"

# ------------------------------------------------------------------------------
# Args
# ------------------------------------------------------------------------------
PEER=""
ENGINE=""
ROLE=""
CWD="$SLP_ROOT"
AUTO_RESUME="auto"
RESTORED="no"
[ "$#" -ge 1 ] || usage
case "$1" in
  --*) printf 'slp-open: unknown option as first positional: %s\n' "$1" >&2; usage ;;
esac
PEER="$1"; shift

while [ "$#" -gt 0 ]; do
  case "$1" in
    --engine) ENGINE="${2:-}"; [ -n "$ENGINE" ] || usage; shift 2 ;;
    --role)   ROLE="${2:-}";   [ -n "$ROLE" ]   || usage; shift 2 ;;
    --cwd)    CWD="${2:-}";    [ -n "$CWD" ]    || usage; shift 2 ;;
    --restored) RESTORED="yes"; shift ;;
    --auto-resume)
      AUTO_RESUME="${2:-}"
      case "$AUTO_RESUME" in yes|no|auto) ;; *) usage ;; esac
      shift 2 ;;
    --*) printf 'slp-open: unknown option: %s\n' "$1" >&2; usage ;;
    *) printf 'slp-open: unexpected positional arg: %s\n' "$1" >&2; usage ;;
  esac
done

# ------------------------------------------------------------------------------
# Role validation helpers.
# The peer name `<role>-<agent>` is the convention of record (slp-init §1) and
# slp-peer-knowledge requires exactly ONE Tier-1 baseline per role — there is no
# "generalist" baseline. An unrecognized role is therefore a hard error, never a
# silent fallback: a silently-generalist peer is fed the wrong knowledge contract.
# ------------------------------------------------------------------------------
VALID_ROLES="scout engineer reviewer designer"
ROLE_SOURCE=""

role_valid() {
  case "$1" in
    scout|engineer|reviewer|designer) return 0 ;;
    *) return 1 ;;
  esac
}

# Echo the role encoded in a `<role>-<agent>` peer name, or nothing.
role_from_name() {
  local prefix
  case "$1" in
    *-*) prefix="${1%%-*}" ;;
    *) return 0 ;;
  esac
  case "$prefix" in
    scout) echo scout ;;
    eng|engineer) echo engineer ;;
    rev|review|reviewer|sec|audit) echo reviewer ;;
    design|designer|des|ui) echo designer ;;
  esac
}

# Sets ROLE + ROLE_SOURCE.
# Precedence: explicit --role > VALID registry role > <role>-<agent> name prefix.
# An INVALID registry role is never trusted: it used to suppress the name parse
# entirely (because a non-empty role short-circuited the fallback), which made a
# single bad value self-perpetuating across every later open.
resolve_role() {
  local reg_role name_role
  if [ -n "$ROLE" ]; then
    ROLE_SOURCE="flag"
    return 0
  fi
  if [ -n "$PEER_RECORD" ]; then
    reg_role=$(jq -r '.role // empty' <<< "$PEER_RECORD" 2>/dev/null || true)
    if [ -n "$reg_role" ] && role_valid "$reg_role"; then
      ROLE="$reg_role"; ROLE_SOURCE="registry"
    elif [ -n "$reg_role" ]; then
      printf 'slp-open: WARNING — registry role "%s" is not one of: %s\n' "$reg_role" "$VALID_ROLES" >&2
      printf 'slp-open:           ignoring it and re-deriving from the peer name.\n' >&2
    fi
  fi
  if [ -z "$ROLE" ]; then
    name_role=$(role_from_name "$PEER")
    if [ -n "$name_role" ]; then ROLE="$name_role"; ROLE_SOURCE="name"; fi
  fi
  if [ "$ROLE_SOURCE" = "registry" ]; then
    name_role=$(role_from_name "$PEER")
    if [ -n "$name_role" ] && [ "$name_role" != "$ROLE" ]; then
      printf 'slp-open: WARNING — registry role "%s" disagrees with the peer name (implies "%s"); keeping the registry value. Rename or pass --role to settle it.\n' "$ROLE" "$name_role" >&2
    fi
  fi
  return 0
}

require_valid_role() {
  if [ -z "$ROLE" ]; then
    printf 'slp-open: ERROR — cannot determine a valid role for peer "%s".\n' "$PEER" >&2
    printf '  peer naming convention: <role>-<agent> (slp-init §1), e.g. designer-opencode\n' >&2
    printf '  valid roles: %s\n' "$VALID_ROLES" >&2
    printf '  There is no "generalist" fallback: slp-peer-knowledge requires exactly\n' >&2
    printf '  ONE Tier-1 baseline and no GENERALIST-BASELINE.md exists. Fix the name or pass --role.\n' >&2
    exit 2
  fi
  if ! role_valid "$ROLE"; then
    printf 'slp-open: ERROR — invalid role "%s" (source: %s). Valid roles: %s\n' "$ROLE" "$ROLE_SOURCE" "$VALID_ROLES" >&2
    exit 2
  fi
}

# Refresh the Identity lines of a context-compact.md in place. Only the block
# slp-open generated is touched: a compact rewritten by compile_compact.sh has no
# `## Identity` section and is left alone, so compiled runtime state is never
# clobbered. This is what keeps a corrected role/engine from being permanently
# stuck behind the old write-once guard.
refresh_compact_identity() {
  local file="$1" role="$2" engine="$3" cur_role cur_engine tmp
  [ -f "$file" ] || return 0
  grep -q '^## Identity$' "$file" 2>/dev/null || return 0
  cur_role=$(sed -n 's/^- Role: //p' "$file" | head -1)
  cur_engine=$(sed -n 's/^- Engine: //p' "$file" | head -1)
  if [ "$cur_role" = "$role" ] && [ "$cur_engine" = "$engine" ]; then
    return 0
  fi
  tmp="$file.tmp.$$"
  if sed -e "s|^- Role: .*|- Role: $role|" -e "s|^- Engine: .*|- Engine: $engine|" "$file" > "$tmp"; then
    mv "$tmp" "$file"
    printf 'slp-open: refreshed identity in %s (role %s -> %s, engine %s -> %s)\n' \
      "$file" "$cur_role" "$role" "$cur_engine" "$engine" >&2
  else
    rm -f "$tmp"
    printf 'slp-open: WARNING — could not refresh %s\n' "$file" >&2
  fi
  return 0
}

# Write the resolved role/engine into the registry for an existing record.
bind_registry_identity() {
  jq --arg p "$PEER" --arg role "$ROLE" --arg eng "$ENGINE" --arg ts "$NOW" \
    '.updated_at = $ts
     | .peers[$p].role = $role
     | .peers[$p].engine = $eng' "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"
}

# ------------------------------------------------------------------------------
# Preconditions
# ------------------------------------------------------------------------------
fail() { printf 'slp-open: %s\n' "$*" >&2; exit "${EXIT_CODE:-1}"; }
EXIT_CODE=4

command -v jq >/dev/null 2>&1 || fail 'jq is required.'
command -v herdr >/dev/null 2>&1 || fail 'herdr is required (not in PATH).'

mkdir -p "$CONTEXT_DIR/_registry" "$CONTEXT_DIR/_attention" "$CONTEXT_DIR/_decisions"
[ -f "$REGISTRY" ] || fail "Registry not found: $REGISTRY"

if herdr tab list >/dev/null 2>&1; then :; else
  fail 'Herdr daemon is not responsive; cannot create tab/pane.'
fi

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# ------------------------------------------------------------------------------
# Idempotency check 1: peer already live (pane_id non-null, no closed_session)
# ------------------------------------------------------------------------------
EXIT_CODE=3
PEER_RECORD=$(jq --arg p "$PEER" '.peers[$p] // empty' "$REGISTRY" 2>/dev/null || echo "")
if [ -n "$PEER_RECORD" ]; then
  EXISTING_PANE=$(jq -r '.pane_id // empty' <<< "$PEER_RECORD")
  EXISTING_STATUS=$(jq -r '.status // empty' <<< "$PEER_RECORD")
  if [ -n "$EXISTING_PANE" ] && [ "$EXISTING_STATUS" != "closed_session" ]; then
    # Already live: still reconcile identity before the no-op exit. This early
    # exit used to skip every check below, so a live peer could keep a stale
    # role/engine and a permanently wrong `- Role:` compact forever.
    resolve_role
    require_valid_role
    if [ -z "$ENGINE" ]; then
      ENGINE=$(jq -r '.engine // empty' <<< "$PEER_RECORD" 2>/dev/null || true)
      case "$PEER" in *-*) [ -n "$ENGINE" ] || ENGINE="${PEER#*-}" ;; esac
    fi
    ENGINE="${ENGINE:-cli}"
    cur_role=$(jq -r '.role // empty' <<< "$PEER_RECORD" 2>/dev/null || true)
    cur_engine=$(jq -r '.engine // empty' <<< "$PEER_RECORD" 2>/dev/null || true)
    if [ "$cur_role" != "$ROLE" ] || [ "$cur_engine" != "$ENGINE" ]; then
      printf 'slp-open: reconciling %s identity (role %s -> %s, engine %s -> %s)\n' \
        "$PEER" "$cur_role" "$ROLE" "$cur_engine" "$ENGINE" >&2
      bind_registry_identity
    fi
    refresh_compact_identity "$CONTEXT_DIR/$PEER/_state/context-compact.md" "$ROLE" "$ENGINE"
    printf 'slp-open: peer %s already live on pane %s (no-op).\n' "$PEER" "$EXISTING_PANE" >&2
    exit 0
  fi
fi

# ------------------------------------------------------------------------------
# Determine effective engine + role.
#   Priority: explicit --engine/--role > existing registry > parse from <role>-<agent>
#   Role is validated (resolve_role/require_valid_role) — never a silent fallback.
# ------------------------------------------------------------------------------
resolve_role
require_valid_role
if [ -z "$ENGINE" ]; then
  if [ -n "$PEER_RECORD" ]; then
    ENGINE=$(jq -r '.engine // empty' <<< "$PEER_RECORD" 2>/dev/null || true)
  fi
  case "$PEER" in *-*) [ -n "$ENGINE" ] || ENGINE="${PEER#*-}" ;; esac
fi
ENGINE="${ENGINE:-cli}"

# Role → mandatory primary knowledge baseline (slp-peer-knowledge §3).
case "$ROLE" in
  scout)    ROLE_BASELINE="SCOUT-BASELINE.md" ;;
  engineer) ROLE_BASELINE="ENGINEER-BASELINE.md" ;;
  reviewer) ROLE_BASELINE="REVIEWER-BASELINE.md" ;;
  designer) ROLE_BASELINE="DESIGNER-BASELINE.md" ;;
  *)        ROLE_BASELINE="" ;;
esac
if [ -z "$ROLE_BASELINE" ]; then
  printf 'slp-open: ERROR — role "%s" has no Tier-1 baseline mapping; refusing to open with a broken knowledge contract.\n' "$ROLE" >&2
  exit 2
fi
KNOWLEDGE_DIR=".agents/skills/slp-peer-knowledge/references"

# ------------------------------------------------------------------------------
# Ensure registry entry exists (or refresh closed_session → live)
# ------------------------------------------------------------------------------
if [ -z "$PEER_RECORD" ]; then
  # Fresh register: pick canonical strengths/avoid by role
  STRENGTHS='["task execution"]'
  AVOID="[]"
  case "$ROLE" in
    scout) STRENGTHS='["architecture exploration", "spec audit", "framework research"]'; AVOID='["code mutation"]' ;;
    engineer) STRENGTHS='["core implementation", "unit testing", "refactoring"]' ;;
    reviewer) STRENGTHS='["code review", "adversarial security audit", "contract verification"]'; AVOID='["code mutation"]' ;;
    designer) STRENGTHS='["wireframe design", "ASCII UI mapping", "HIG compliance"]'; AVOID='["code mutation"]' ;;
  esac
  jq --arg p "$PEER" --arg role "$ROLE" --arg eng "$ENGINE" --arg ts "$NOW" --argjson str "$STRENGTHS" --argjson avoid "$AVOID" \
    '.updated_at = $ts
     | .peers[$p] = {
         "logical_name": $p,
         "role": $role,
         "engine": $eng,
         "pane_id": "unknown",
         "mandatory_skills": ["slp-peer", "slp-peer-knowledge", "slp-state", "slp-collab"],
         "strengths": $str,
         "avoid_without_review": $avoid,
         "confidence": "provisional",
         "evidence": []
       }' "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"
  printf 'slp-open: registered %s (role=%s, engine=%s)\n' "$PEER" "$ROLE" "$ENGINE" >&2
else
  # Update existing entry's role/engine if explicitly provided
  bind_registry_identity
fi

# ------------------------------------------------------------------------------
# Herdr: check for an existing live tab/pane matching the peer label
# ------------------------------------------------------------------------------
EXIT_CODE=4
CURRENT_TABS_JSON=$(herdr tab list 2>/dev/null || echo '{}')
CURRENT_PANES_JSON=$(herdr pane list 2>/dev/null || echo '{}')

EXISTING_PANE_ID=$(echo "$CURRENT_PANES_JSON" | jq -r --arg lbl "$PEER" '.result.panes[]? | select(.label == $lbl) | .pane_id' 2>/dev/null | head -1 || true)

if [ -z "$EXISTING_PANE_ID" ]; then
  EXISTING_TAB_ID=$(echo "$CURRENT_TABS_JSON" | jq -r --arg lbl "$PEER" '.result.tabs[]? | select(.label == $lbl) | .tab_id' 2>/dev/null | head -1 || true)
  if [ -n "$EXISTING_TAB_ID" ]; then
    EXISTING_PANE_ID=$(echo "$CURRENT_PANES_JSON" | jq -r --arg tid "$EXISTING_TAB_ID" '.result.panes[]? | select(.tab_id == $tid) | .pane_id' 2>/dev/null | head -1 || true)
  fi
fi
# Multi-project guard: Herdr tab labels are global across workspaces, so a
# same-named tab in another project MUST NOT be reused. Verify the matched
# pane lives under $CWD; otherwise force fresh tab creation in this workspace.
if [ -n "$EXISTING_PANE_ID" ]; then
  EXISTING_PANE_CWD=$(echo "$CURRENT_PANES_JSON" | jq -r --arg pid "$EXISTING_PANE_ID" '.result.panes[]? | select(.pane_id == $pid) | (.cwd // .foreground_cwd // empty)' 2>/dev/null | head -1 || true)
  if [ -z "$EXISTING_PANE_CWD" ] || [ "$(realpath "$EXISTING_PANE_CWD" 2>/dev/null || echo "$EXISTING_PANE_CWD")" != "$(realpath "$CWD" 2>/dev/null || echo "$CWD")" ]; then
    printf 'slp-open: existing pane %s lives in %s (not %s); creating fresh tab in this workspace\n' "$EXISTING_PANE_ID" "${EXISTING_PANE_CWD:-unknown}" "$CWD" >&2
    EXISTING_PANE_ID=""
  fi
fi

# ------------------------------------------------------------------------------
# Create a fresh tab if no existing pane matches
# ------------------------------------------------------------------------------
if [ -z "$EXISTING_PANE_ID" ]; then
  TAB_RES=$(herdr tab create --label "$PEER" --cwd "$CWD" --no-focus 2>/dev/null || true)
  PANE_ID=$(echo "$TAB_RES" | jq -r '.result.root_pane.pane_id // empty' 2>/dev/null || true)
  if [ -z "$PANE_ID" ]; then
    printf 'slp-open: herdr tab create returned no pane_id. Response: %s\n' "$TAB_RES" >&2
    fail 'could not create Herdr tab'
  fi
  printf 'slp-open: created tab (pane %s) for %s\n' "$PANE_ID" "$PEER" >&2
else
  PANE_ID="$EXISTING_PANE_ID"
  printf 'slp-open: reusing existing pane %s for %s\n' "$PANE_ID" "$PEER" >&2
fi

# ------------------------------------------------------------------------------
# Launch engine CLI inside the pane (best effort)
# ------------------------------------------------------------------------------
EXIT_CODE=5
if command -v "$ENGINE" >/dev/null 2>&1; then
  # codex supports --yolo to auto-approve bash commands; required for
  # auto-resume to send Lead notification without sandbox dialog blocking.
  # Other engines don't accept --yolo so we use it conditionally.
  if [ "$ENGINE" = "codex" ]; then
    herdr pane send-text "$PANE_ID" "$ENGINE --yolo"$'\n' 2>/dev/null || true
  else
    herdr pane send-text "$PANE_ID" "$ENGINE"$'\n' 2>/dev/null || true
  fi
  printf 'slp-open: launched engine %s in pane %s\n' "$ENGINE" "$PANE_ID" >&2
else
  printf 'slp-open: engine %s not in PATH; pane left ready for manual launch.\n' "$ENGINE" >&2
fi
# ------------------------------------------------------------------------------
# Mandatory knowledge injection (+ state resume on --restored).
#   Every opened peer MUST load its role knowledge before acting
#   (slp-peer-knowledge §1/§3): Tier-0 COMMON-BASELINE + exactly ONE Tier-1
#   role baseline. Restored peers additionally read their _state/ so context
#   is not lost across reopen.
# ------------------------------------------------------------------------------
# Effective AUTO_RESUME: explicit value wins; otherwise inject for every peer.
if [ "$AUTO_RESUME" = "auto" ]; then AUTO_RESUME="yes"; fi

if [ "$AUTO_RESUME" = "yes" ]; then
  # ROLE_BASELINE is guaranteed non-empty (require_valid_role + the mapping
  # assertion above), so the prompt always names a real Tier-1 baseline.
  ROLE_BASELINE_LINE="- $KNOWLEDGE_DIR/$ROLE_BASELINE"
  KNOWLEDGE_PROMPT=$(cat <<KNOW_EOF
MANDATORY KNOWLEDGE — read these files before responding to Lead (contract: slp-peer-knowledge):
- .agents/skills/slp-peer/SKILL.md
- .agents/skills/slp-peer-knowledge/SKILL.md
- .agents/skills/slp-state/SKILL.md
- .agents/skills/slp-collab/SKILL.md
- $KNOWLEDGE_DIR/COMMON-BASELINE.md
$ROLE_BASELINE_LINE
Load Tier-0 + exactly ONE Tier-1 role baseline + any Lead-named supplemental. Do NOT expand knowledge loading on your own.
KNOW_EOF
)

  if [ "$RESTORED" = "yes" ]; then
    STATE_PROMPT=$(cat <<RESUME_EOF
RESUME BOOTSTRAP — your peer state is on disk. Read these in order before responding to Lead:
1. herdr-context/$PEER/_state/MEMORY.md (long-term memory + skills protocol)
2. herdr-context/$PEER/_state/status.json (canonical state machine — current_task, last_task, last_answer_path)
3. herdr-context/$PEER/_state/context-compact.md (recap of last task)

Then perform TWO actions in this exact order:
(A) Reply in this pane with one line: 'Resumed. Last task NNN = TITLE, STATE. Ready.'
(B) Send Lead an explicit notification by running:
    bash .agents/skills/slp-collab/scripts/slp-send.sh Lead "[RESUMED] $PEER: last_task=NNN, state=STATE. Ready for next task."

Do NOT start any new work yet. Wait for Lead to dispatch.
RESUME_EOF
)
  else
    STATE_PROMPT="You have no prior task state. Do NOT start any work on your own. Wait for Lead's Assignment Envelope, which names the request file and any supplemental knowledge to load."
  fi

  BOOTSTRAP_PROMPT="$KNOWLEDGE_PROMPT

$STATE_PROMPT"

  # Poll up to 15s for the engine to register as idle (not 'starting' / unknown).
  DEADLINE=$(( $(date +%s) + 15 ))
  READY="no"
  while [ "$(date +%s)" -lt "$DEADLINE" ]; do
    CUR_STATUS=$(herdr agent list 2>/dev/null \
      | jq -r --arg pane "$PANE_ID" '.result.agents[]? | select(.pane_id == $pane) | .agent_status // "unknown"' \
      2>/dev/null | head -1 || echo "unknown")
    case "$CUR_STATUS" in
      idle|done) READY="yes"; break ;;
    esac
    sleep 1
  done

  if [ "$READY" = "yes" ]; then
    if herdr pane run "$PANE_ID" "$BOOTSTRAP_PROMPT" >/dev/null 2>&1; then
      # Engine-specific quirks for auto-submit.
      # - pi / omp / cline: TUI buffers input — need explicit Enter to submit.
      # - codex: handled earlier with --yolo at launch time.
      # - agy / claude / opencode2: auto-process after inject.
      case "$ENGINE" in
        pi|omp|cline)
          herdr pane send-keys "$PANE_ID" ENTER >/dev/null 2>&1 || true
          printf 'slp-open: sent Enter to %s pane %s\n' "$ENGINE" "$PANE_ID" >&2
          ;;
      esac
    else
      printf 'slp-open: WARNING — failed to inject knowledge/bootstrap prompt into %s\n' "$PANE_ID" >&2
    fi
  else
    printf 'slp-open: WARNING — pane %s did not reach idle within 15s; skipped knowledge/bootstrap inject\n' "$PANE_ID" >&2
  fi
fi


# ------------------------------------------------------------------------------
# Bind pane_id into registry + clear closed_session markers + update saved_sessions
# ------------------------------------------------------------------------------
EXIT_CODE=1
jq --arg p "$PEER" --arg pane "$PANE_ID" --arg ts "$NOW" --arg restored "${RESTORED:-no}" \
  '.updated_at = $ts
   | .peers[$p].pane_id = $pane
   | .peers[$p].updated_at = $ts
   | .peers[$p] |= with_entries(select(.key | IN("closed_at", "close_mode", "status") | not))
   | if $restored == "yes" then .peers[$p].restored_at = $ts else . end' \
  "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"

if [ -n "$SESSIONS" ]; then
  jq --arg p "$PEER" --arg pane "$PANE_ID" --arg role "$ROLE" --arg eng "$ENGINE" --arg ts "$NOW" --arg restored "${RESTORED:-no}" '
    .updated_at = $ts
    | .sessions |= (
        (map(select(.name != $p)))
        + [{
            "name": $p,
            "role": $role,
            "engine": $eng,
            "pane_id": $pane,
            "status": (if $restored == "yes" then "restored" else "open" end),
            (if $restored == "yes" then "restored_at" else "opened_at" end): $ts
          }]
      )' \
    "$SESSIONS" > "$SESSIONS.tmp" && mv "$SESSIONS.tmp" "$SESSIONS"
fi

# ------------------------------------------------------------------------------
# Init per-peer _state/ (delegates to slp-state if available, else inline)
# ------------------------------------------------------------------------------
PEER_STATE_DIR="$CONTEXT_DIR/$PEER/_state"
PEER_MEMORY="$PEER_STATE_DIR/MEMORY.md"
PEER_STATUS="$PEER_STATE_DIR/status.json"
PEER_COMPACT="$PEER_STATE_DIR/context-compact.md"

mkdir -p "$PEER_STATE_DIR"

if [ ! -f "$PEER_MEMORY" ]; then
  cat > "$PEER_MEMORY" <<EOF
# Long-Term Memory — $PEER
> Long-term memory of $PEER. Automatically accumulates experience, patterns, and lessons after each task.

## Mandatory Skills & Protocols
- \`.agents/skills/slp-peer/SKILL.md\`
- \`.agents/skills/slp-peer-knowledge/SKILL.md\`
- \`.agents/skills/slp-state/SKILL.md\`
- \`.agents/skills/slp-collab/SKILL.md\`

## 1. Discovered Framework & SDK Quirks
- (None recorded yet)

## 2. Hard Invariants & Lessons Learned
- (None recorded yet)

## 3. Recurring Patterns & Workarounds
- (None recorded yet)

## 4. Key Personal Achievements
- (Initialized on $NOW)
EOF
  printf 'slp-open: initialized %s\n' "$PEER_MEMORY" >&2
fi

if [ ! -f "$PEER_STATUS" ]; then
  cat > "$PEER_STATUS" <<EOF
{
  "schema_version": 1,
  "peer": "$PEER",
  "tier": 1,
  "state": "idle",
  "current_task": null,
  "current_task_started_at": null,
  "last_task": null,
  "last_completed_at": null,
  "last_answer_path": null,
  "last_answer_summary": null,
  "queue_depth": 0,
  "pending": [],
  "known_risks": [],
  "known_constraints": {"do": [], "do_not": []},
  "open_questions": []
}
EOF
  printf 'slp-open: initialized %s\n' "$PEER_STATUS" >&2
fi

if [ ! -f "$PEER_COMPACT" ]; then
  cat > "$PEER_COMPACT" <<EOF
# Peer Compact — $PEER
**Generated:** $NOW
**Tier:** 1
**State:** idle

## Identity
- Name: $PEER
- Role: $ROLE
- Engine: $ENGINE
- Mandatory Skills: [slp-peer, slp-peer-knowledge, slp-state, slp-collab]

## Current State
- state: idle
- current_task: none
- last_completed: none
- last_summary: none

## Recurring Constraints
**DO:** none
**DO NOT:** none

## Recent Handbacks
- (No completed tasks yet)

## Active Risks
- none

## Open Questions
- none

---
*Initialized by slp-open.sh. Source of truth remains status.json and handback artifacts.*
EOF
  printf 'slp-open: initialized %s\n' "$PEER_COMPACT" >&2
else
  # Not write-once: a corrected role/engine must reach the peer. Only the
  # slp-open identity block is touched (a compiled compact is left alone).
  refresh_compact_identity "$PEER_COMPACT" "$ROLE" "$ENGINE"
fi

# Report the resolved identity + its source on every real open, so a wrong role
# is visible in the log instead of only inside the injected prompt.
printf 'slp-open: identity %s → role=%s (source=%s), engine=%s, baseline=%s\n' \
  "$PEER" "$ROLE" "$ROLE_SOURCE" "$ENGINE" "$ROLE_BASELINE" >&2

# ------------------------------------------------------------------------------
# Done
# ------------------------------------------------------------------------------
ACTION="opened"
[ "${RESTORED:-no}" = "yes" ] && ACTION="restored"
printf 'slp-open: %s peer %s (pane=%s, role=%s, engine=%s)\n' "$ACTION" "$PEER" "$PANE_ID" "$ROLE" "$ENGINE" >&2
exit 0
