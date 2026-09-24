#!/usr/bin/env bash
# slp-close.sh — Gracefully close a peer agent: close its Herdr tab/pane,
# mark it inactive in registry + saved_sessions, and PRESERVE all state,
# handback artifacts, and long-term memory under herdr-context/<peer>/.
#
# Scope options:
#   --soft   Close tab/pane but keep the peer entry in registry as closed_session.
#            Default behavior. Resumable later via bootstrap.sh.
#   --hard   Also delete herdr-context/<peer>/ and remove the peer entry entirely.
#            NOT reversible without backup.
#
# Usage:
#   bash .agents/skills/slp-collab/scripts/slp-close.sh <peer-name> [--soft|--hard] [--force]
#   bash .agents/skills/slp-collab/scripts/slp-close.sh --help
#
# Examples:
#   bash .agents/skills/slp-collab/scripts/slp-close.sh engineer-pi
#   bash .agents/skills/slp-collab/scripts/slp-close.sh engineer-pi --soft
#   bash .agents/skills/slp-collab/scripts/slp-close.sh scout-omp --hard --force
#
# Exit codes:
#   0  success
#   1  generic failure
#   2  usage error
#   3  peer not found in registry
#   4  peer already closed (no-op unless --force)
#   5  Herdr command failure
#   6  preconditions missing (jq/herdr/env)

set -euo pipefail

# ------------------------------------------------------------------------------
# Help (must work even without Herdr env / before any precondition)
# ------------------------------------------------------------------------------
usage() {
  printf 'Usage: bash .agents/skills/slp-collab/scripts/slp-close.sh <peer-name> [--soft|--hard] [--force]\n       bash .agents/skills/slp-collab/scripts/slp-close.sh --help\n\nModes:\n  --soft   (default) Close tab/pane; keep registry entry as closed_session.\n                  State preserved; resumable via bootstrap.sh.\n  --hard   Also delete herdr-context/<peer>/ and remove registry entry.\n                  Not reversible without backup.\n  --force  Re-run close on a peer that already has closed_at set.\n\nExit codes: 0 ok | 1 generic | 2 usage | 3 not-found | 4 already-closed | 5 herdr | 6 preconditions\n' >&2
  exit 2
}

# First non-option arg check for --help / -h to print usage cleanly.
for arg in "$@"; do
  case "$arg" in
    -h|--help) usage ;;
  esac
done

# ------------------------------------------------------------------------------
# Resolve project root BEFORE any precondition that depends on it.
# Mirrors slp-send.sh: scripts/<skill>/scripts/slp-*.sh → 4 levels up.
# ------------------------------------------------------------------------------
SLP_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd -P)
REGISTRY="$SLP_ROOT/herdr-context/_registry/peers.json"
SESSIONS="$SLP_ROOT/herdr-context/saved_sessions.json"  # canonical path
PEER_DIR_TPL="$SLP_ROOT/herdr-context"

# Compatibility: this workspace uses saved_sessions.json inside _registry/
[ -f "$SESSIONS" ] || SESSIONS="$SLP_ROOT/herdr-context/_registry/saved_sessions.json"

# ------------------------------------------------------------------------------
# Args & mode
# ------------------------------------------------------------------------------
PEER=""
MODE="soft"
FORCE="no"

[ "$#" -ge 1 ] || usage

# If the first token starts with --, it's an unknown option (peer must come first).
case "$1" in
  --*) printf 'slp-close: unknown option: %s\n' "$1" >&2; usage ;;
esac

PEER="$1"; shift

while [ "$#" -gt 0 ]; do
  case "$1" in
    --soft) MODE="soft" ;;
    --hard) MODE="hard" ;;
    --force) FORCE="yes" ;;
    --*) printf 'slp-close: unknown option: %s\n' "$1" >&2; usage ;;
    *) printf 'slp-close: unexpected positional arg: %s\n' "$1" >&2; usage ;;
  esac
  shift
done

PEER_DIR="$PEER_DIR_TPL/$PEER"

# ------------------------------------------------------------------------------
# Preconditions (env / tools / registry)
# ------------------------------------------------------------------------------
fail() { printf 'slp-close: %s\n' "$*" >&2; exit "${EXIT_CODE:-1}"; }
EXIT_CODE=6

[ "${HERDR_ENV:-}" = 1 ] || fail 'Run inside a Herdr-managed pane (HERDR_ENV=1 required).'
[ -n "${HERDR_WORKSPACE_ID:-}" ] || fail 'Missing HERDR_WORKSPACE_ID.'
command -v jq >/dev/null 2>&1 || fail 'jq is required.'
command -v herdr >/dev/null 2>&1 || fail 'herdr is required.'

[ -f "$REGISTRY" ] || fail "Registry not found: $REGISTRY"

# ------------------------------------------------------------------------------
# Lookup peer
# ------------------------------------------------------------------------------
EXIT_CODE=3
PEER_RECORD=$(jq -e --arg p "$PEER" '.peers[$p] // empty' "$REGISTRY") \
  || fail "Peer '$PEER' not found in registry."

PANE_ID=$(jq -r '.pane_id // empty' <<< "$PEER_RECORD")
CLOSED_AT=$(jq -r '.closed_at // empty' <<< "$PEER_RECORD")
PEER_STATUS=$(jq -r '.status // empty' <<< "$PEER_RECORD")

# ------------------------------------------------------------------------------
# Idempotency: only block when pane truly gone AND status says closed.
# If bootstrap reattached the peer (pane_id non-null), treat as live.
# ------------------------------------------------------------------------------
EXIT_CODE=4
if [ -n "$CLOSED_AT" ] && [ -z "$PANE_ID" ] && [ "$PEER_STATUS" = "closed_session" ] && [ "$FORCE" != "yes" ]; then
  printf 'slp-close: peer %s is already closed at %s. Use --force to proceed.\n' \
    "$PEER" "$CLOSED_AT" >&2
  exit 4
fi

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# ------------------------------------------------------------------------------
# Find the tab that hosts the peer's pane (workspace-scoped)
# ------------------------------------------------------------------------------
EXIT_CODE=5
TAB_ID=""
if [ -n "$PANE_ID" ]; then
  PANE_LIST=$(herdr pane list 2>&1) || fail "herdr pane list failed: $PANE_LIST"
  TAB_ID=$(jq -r --arg pane "$PANE_ID" --arg ws "$HERDR_WORKSPACE_ID" '
    [ .result.panes[]?
      | select(.pane_id == $pane and .workspace_id == $ws)
      | .tab_id ]
    | .[0] // empty
  ' <<< "$PANE_LIST")
fi

# ------------------------------------------------------------------------------
# Close the tab (if still live)
# ------------------------------------------------------------------------------
if [ -n "$TAB_ID" ]; then
  CLOSE_OUT=$(herdr tab close "$TAB_ID" 2>&1) || fail "herdr tab close $TAB_ID failed: $CLOSE_OUT"
  printf 'slp-close: closed tab %s (hosting pane %s)\n' "$TAB_ID" "$PANE_ID" >&2
else
  printf 'slp-close: peer pane not live (already detached). Proceeding with registry update.\n' >&2
fi

# ------------------------------------------------------------------------------
# Update registry: peer entry stays but marked closed_session
# ------------------------------------------------------------------------------
EXIT_CODE=1
jq --arg p "$PEER" --arg ts "$NOW" --arg mode "$MODE" '
  .updated_at = $ts
  | .peers[$p].pane_id = null
  | .peers[$p].closed_at = $ts
  | .peers[$p].close_mode = $mode
  | .peers[$p].status = "closed_session"
' "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"

# ------------------------------------------------------------------------------
# Update saved_sessions.json (preserve entry for future bootstrap restore)
# ------------------------------------------------------------------------------
if [ -f "$SESSIONS" ]; then
  jq --arg p "$PEER" --arg ts "$NOW" --arg mode "$MODE" '
    .updated_at = $ts
    | .sessions |= map(
        if .name == $p
        then . + {pane_id: null, status: "closed", closed_at: $ts, close_mode: $mode}
        else . end)
  ' "$SESSIONS" > "$SESSIONS.tmp" && mv "$SESSIONS.tmp" "$SESSIONS"
fi

# ------------------------------------------------------------------------------
# Optional: hard mode — also remove peer directory and registry entry
# ------------------------------------------------------------------------------
if [ "$MODE" = "hard" ]; then
  if [ -d "$PEER_DIR" ]; then
    rm -rf "$PEER_DIR" || fail "Failed to remove $PEER_DIR"
    printf 'slp-close: --hard removed %s\n' "$PEER_DIR" >&2
  fi
  jq --arg p "$PEER" --arg ts "$NOW" '
    .updated_at = $ts
    | del(.peers[$p])
  ' "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"
  if [ -f "$SESSIONS" ]; then
    jq --arg p "$PEER" --arg ts "$NOW" '
      .updated_at = $ts
      | .sessions |= map(select(.name != $p))
    ' "$SESSIONS" > "$SESSIONS.tmp" && mv "$SESSIONS.tmp" "$SESSIONS"
  fi
fi

# ------------------------------------------------------------------------------
# Done
# ------------------------------------------------------------------------------
if [ "$MODE" = "hard" ]; then
  printf 'slp-close: HARD-closed peer %s (registry removed, state deleted)\n' "$PEER" >&2
else
  printf 'slp-close: SOFT-closed peer %s (state preserved, resumable via bootstrap.sh)\n' "$PEER" >&2
fi
exit 0