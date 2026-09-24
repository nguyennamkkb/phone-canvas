#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SLP State Fingerprint Script
# Cheap staleness check (~11 lines out) so agents skip re-reading unchanged
# state files. Read-once rule: full-load state files ONCE per session, then
# run this gate on every later task and compare ONLY the `fp:` token.
# Re-read solely what the table in slp-state SKILL.md §5 prescribes.
# Read-only: never writes. Exit 0 even when files are MISSING (diagnostic).
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <peer-name> [workspace-root]" >&2
  echo "Example: bash .agents/skills/slp-state/scripts/state_fingerprint.sh engineer-pi" >&2
  echo "Run from the project root, or pass it explicitly as \$2." >&2
  exit 1
fi

PEER="$1"
WORKSPACE_ROOT="${2:-$(cd "$SCRIPT_DIR/../../../../" && pwd)}"
CTX="$WORKSPACE_ROOT/herdr-context"
PEER_DIR="$CTX/$PEER"
STATE_FILE="$PEER_DIR/_state/status.json"
PEER_MEM="$PEER_DIR/_state/MEMORY.md"
COMPACT="$PEER_DIR/_state/context-compact.md"
GLOBAL_MEM="$CTX/MEMORY.md"
REGISTRY="$CTX/_registry/peers.json"

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Hash tool: sha256sum and `shasum -a 256` produce IDENTICAL digests, so FPs
# compare equal across Linux/macOS. Anything else is refused on purpose —
# a weaker/different hash would false-report "changed" across machines.
HASH_CMD=""
if command -v sha256sum >/dev/null 2>&1; then
  HASH_CMD="sha256sum"
elif command -v shasum >/dev/null 2>&1; then
  HASH_CMD="shasum -a 256"
fi

# Short hash of one file. Always echoes exactly one token, never fails:
# MISSING = absent · NOHASH = present but unhashable (gating degraded).
_short_hash() {
  if [ ! -f "$1" ]; then
    echo "MISSING"
    return 0
  fi
  if [ -n "$HASH_CMD" ]; then
    # shellcheck disable=SC2086
    $HASH_CMD "$1" 2>/dev/null | awk '{print substr($1,1,8)}' || echo "NOHASH"
  else
    echo "NOHASH"
  fi
  return 0
}

_line_count() {
  if [ ! -f "$1" ]; then
    echo "0"
    return 0
  fi
  wc -l < "$1" 2>/dev/null | tr -d ' ' || echo "0"
  return 0
}

# Liveness + directive counters straight from status.json (no full re-read
# needed to check availability or standing-directive drift). Missing or
# unparseable state is reported, never hidden.
STATE_VAL="unknown"
LAST_VAL="none"
TASK_VAL="none"
C_CON="?"
C_RISK="?"
C_Q="?"
if [ -f "$STATE_FILE" ] && command -v jq >/dev/null 2>&1; then
  STATE_VAL=$(jq -r '.state // "unknown"' "$STATE_FILE" 2>/dev/null || echo "unparseable")
  LAST_VAL=$(jq -r '.last_task // "none"' "$STATE_FILE" 2>/dev/null || echo "?")
  TASK_VAL=$(jq -r '.current_task // "none"' "$STATE_FILE" 2>/dev/null || echo "?")
  C_CON=$(jq -r '((.known_constraints.do // []) | length) + ((.known_constraints.do_not // []) | length)' "$STATE_FILE" 2>/dev/null || echo "?")
  C_RISK=$(jq -r '(.known_risks // []) | length' "$STATE_FILE" 2>/dev/null || echo "?")
  C_Q=$(jq -r '(.open_questions // []) | length' "$STATE_FILE" 2>/dev/null || echo "?")
elif [ ! -f "$STATE_FILE" ]; then
  STATE_VAL="no-state-dir"
fi

# Answer inventory: count + highest NNN (covers "any new file?" with no read).
# NNN is numeric (`^[0-9]+-answer`) so numbering past 999 keeps working.
ANS_COUNT=0
ANS_LATEST="none"
if [ -d "$PEER_DIR" ]; then
  ANS_COUNT=$( (ls "$PEER_DIR" 2>/dev/null | grep -cE '^[0-9]+-answer' || true) | tr -d ' ')
  ANS_LATEST=$( (ls "$PEER_DIR" 2>/dev/null | grep -E '^[0-9]+-answer' || true) | grep -oE '^[0-9]+' | sort -n | tail -1 || true)
  [ -z "$ANS_LATEST" ] && ANS_LATEST="none"
fi

H_STATUS=$(_short_hash "$STATE_FILE");   N_STATUS=$(_line_count "$STATE_FILE")
H_PMEM=$(_short_hash "$PEER_MEM");       N_PMEM=$(_line_count "$PEER_MEM")
H_COMPACT=$(_short_hash "$COMPACT");     N_COMPACT=$(_line_count "$COMPACT")
H_GMEM=$(_short_hash "$GLOBAL_MEM");     N_GMEM=$(_line_count "$GLOBAL_MEM")
H_REG=$(_short_hash "$REGISTRY")

L1="state: $STATE_VAL | last: $LAST_VAL | task: $TASK_VAL | constraints:$C_CON risks:$C_RISK questions:$C_Q"
L2="status.json: $H_STATUS L$N_STATUS"
L3="_state/MEMORY.md: $H_PMEM L$N_PMEM"
L4="context-compact.md: $H_COMPACT L$N_COMPACT"
L5="MEMORY.md: $H_GMEM L$N_GMEM"
L6="peers.json: $H_REG"
L7="answers: $ANS_COUNT latest=$ANS_LATEST"

# Stable compare token: hash of the content lines ONLY (no timestamp), so two
# runs are byte-comparable. Fail-safe: any NOHASH (or no hash tool at all)
# forces a unique WEAK token that can never match → full re-read, never a
# false "unchanged".
STABLE=$(printf '%s\n' "$L1" "$L2" "$L3" "$L4" "$L5" "$L6" "$L7")
case "$STABLE" in
  *NOHASH*)
    FP="WEAK-$$"
    ;;
  *)
    if [ -n "$HASH_CMD" ]; then
      # shellcheck disable=SC2086
      FP=$(printf '%s' "$STABLE" | $HASH_CMD 2>/dev/null | awk '{print substr($1,1,8)}' || echo "WEAK-$$")
    else
      FP="WEAK-$$"
    fi
    ;;
esac

echo "FP $PEER @ $NOW"
echo "fp: $FP"
if [ -d "$CTX" ]; then
  echo "root: $WORKSPACE_ROOT"
else
  echo "root: $WORKSPACE_ROOT (NO herdr-context HERE — pass the project root as \$2; this is NOT a deletion)"
fi
echo "$L1"
echo "$L2"
echo "$L3"
echo "$L4"
echo "$L5"
echo "$L6"
echo "$L7"
