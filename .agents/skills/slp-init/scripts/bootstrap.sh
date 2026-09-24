#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SLP Workspace Bootstrap — thin wrapper that resolves the peer list, then
# delegates every Herdr/registry/_state mutation to slp-open.sh. This script
# itself contains NO raw Herdr CLI calls (see slp-open.sh for transport).
#
# Resolution order for TARGET_PEERS:
#   1. Positional CLI args (e.g. "engineer-pi reviewer-claude").
#   2. herdr-context/_registry/saved_sessions.json (auto-restore).
#   3. herdr-context/_registry/peers.json (re-activate existing peers).
#   4. Default baseline: scout-omp + engineer-codex (cold-start only).
#
# Then for each resolved peer, invoke:
#   bash .agents/skills/slp-collab/scripts/slp-open.sh <peer> [--restored]
# Flags are derived from existing registry entries (or name parsing) so the
# wrapper doesn't duplicate policy logic.
# ==============================================================================

# scripts/<skill>/scripts/bootstrap.sh → up 4 levels to reach project root
# (same as slp-send.sh / slp-close.sh in slp-collab/scripts/).
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
SLP_ROOT=$(cd -- "$SCRIPT_DIR/../../../.." && pwd -P)
CONTEXT_DIR="$SLP_ROOT/herdr-context"
REGISTRY="$CONTEXT_DIR/_registry/peers.json"
SESSIONS_CANON="$CONTEXT_DIR/saved_sessions.json"
SESSIONS_LOCAL="$CONTEXT_DIR/_registry/saved_sessions.json"
SESSIONS=""
GLOBAL_MEMORY="$CONTEXT_DIR/MEMORY.md"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

OPEN_SCRIPT="$SLP_ROOT/.agents/skills/slp-collab/scripts/slp-open.sh"

echo "==> [1/5] Ensuring SLP directory hierarchy & Global MEMORY.md..."
mkdir -p "$CONTEXT_DIR/_registry" "$CONTEXT_DIR/_attention" "$CONTEXT_DIR/_decisions"

# Pick whichever saved_sessions.json exists in this workspace.
[ -f "$SESSIONS_CANON" ] && SESSIONS="$SESSIONS_CANON"
if [ -z "$SESSIONS" ] && [ -f "$SESSIONS_LOCAL" ]; then SESSIONS="$SESSIONS_LOCAL"; fi

if [ ! -f "$GLOBAL_MEMORY" ]; then
  cat > "$GLOBAL_MEMORY" <<EOF
# Global Project Memory
> Shared long-term memory of the whole project. Every agent (Lead and Peers) must read it before acting.

## 1. Core Architecture & Stack Invariants
- (Initialized on $NOW)

## 2. Discovered Framework & SDK Quirks
- (No framework quirks recorded yet)

## 3. Lessons Learned & Hard Prohibitions
- \`[Single Writer]\`: each module has exactly 1 write owner at a time.
- \`[No Solo Lead]\`: Lead never writes code or deliverables directly; must dispatch to a Peer's own Herdr pane.
- \`[Mandatory Skills]\`: every Peer follows 4 skills: \`slp-peer\`, \`slp-peer-knowledge\`, \`slp-state\`, \`slp-collab\`.
- \`[Mandatory Knowledge]\`: before acting, every Peer loads \`slp-peer-knowledge\` Tier-0 COMMON-BASELINE + exactly one Tier-1 role baseline (\`SCOUT\`/\`ENGINEER\`/\`REVIEWER\`/\`DESIGNER\`-BASELINE.md) matching its role.

## 4. Key Accepted Decisions
- (No decisions recorded yet)
EOF
  echo "    ✔ Initialized Global Project MEMORY.md"
else
  echo "    ℹ Preserved existing Global Project MEMORY.md"
fi

[ -f "$OPEN_SCRIPT" ] || { printf 'slp-init: required transport missing: %s\n' "$OPEN_SCRIPT" >&2; exit 1; }

# ------------------------------------------------------------------------------
# Resolve TARGET_PEERS (CLI args > saved_sessions > peers.json > default)
# ------------------------------------------------------------------------------
TARGET_PEERS=()

if [ "$#" -gt 0 ]; then
  TARGET_PEERS=("$@")
  echo "    → Target peers specified via arguments: ${TARGET_PEERS[*]}"
elif [ -n "$SESSIONS" ]; then
  SAVED=$(jq -r '.sessions[].name // empty' "$SESSIONS" 2>/dev/null || true)
  if [ -n "$SAVED" ]; then
    while IFS= read -r peer; do
      [ -n "$peer" ] && TARGET_PEERS+=("$peer")
    done <<< "$SAVED"
    echo "    → Auto-restoring existing saved sessions: ${TARGET_PEERS[*]}"
  fi
elif [ -f "$REGISTRY" ]; then
  REG_PEERS=$(jq -r '.peers | keys[] // empty' "$REGISTRY" 2>/dev/null || true)
  if [ -n "$REG_PEERS" ]; then
    while IFS= read -r peer; do
      [ -n "$peer" ] && TARGET_PEERS+=("$peer")
    done <<< "$REG_PEERS"
    echo "    → Re-activating existing peers from registry: ${TARGET_PEERS[*]}"
  fi
fi

if [ "${#TARGET_PEERS[@]}" -eq 0 ]; then
  TARGET_PEERS=("scout-omp" "engineer-codex")
  echo "    → Defaulting to baseline peers: ${TARGET_PEERS[*]}"
fi

# ------------------------------------------------------------------------------
# Ensure registry file skeleton exists
# ------------------------------------------------------------------------------
echo "==> [2/5] Initializing / Synchronizing _registry/peers.json..."
if [ ! -f "$REGISTRY" ]; then
  cat > "$REGISTRY" <<EOF
{
  "schema_version": 1,
  "updated_at": "$NOW",
  "Lead": {
    "logical_name": "Lead",
    "engine": "lead-cli",
      "pane_id": "${HERDR_PANE_ID:-w1:p1}",
    "updated_at": "$NOW"
  },
  "peers": {}
}
EOF
  echo "    ✔ Initialized _registry/peers.json skeleton"
fi

# ------------------------------------------------------------------------------
# Delegate per-peer setup to slp-open.sh
# ------------------------------------------------------------------------------
echo "==> [3/5] Delegating peer setup to slp-open.sh..."
for PEER in "${TARGET_PEERS[@]}"; do
  RESTORED_FLAG=()
  if [ -n "$SESSIONS" ]; then
    SAVED_STATUS=$(jq -r --arg p "$PEER" '.sessions[]? | select(.name == $p) | .status // empty' "$SESSIONS" 2>/dev/null || echo "")
    case "$SAVED_STATUS" in
      closed|restored) RESTORED_FLAG=(--restored) ;;
    esac
  fi
  if [ "${#RESTORED_FLAG[@]}" -eq 0 ] && [ -f "$REGISTRY" ]; then
    REG_STATUS=$(jq -r --arg p "$PEER" '.peers[$p].status // empty' "$REGISTRY" 2>/dev/null || echo "")
    [ "$REG_STATUS" = "closed_session" ] && RESTORED_FLAG=(--restored)
  fi

  # bash 3.2 (macOS) errors on "$arr[@]" for an empty array under `set -u`.
  bash "$OPEN_SCRIPT" "$PEER" ${RESTORED_FLAG[@]+"${RESTORED_FLAG[@]}"} || true
done

# ------------------------------------------------------------------------------
# Final summary
# ------------------------------------------------------------------------------
echo "==> [4/5] Final Validation & Live Coordinates..."
if [ -f "$REGISTRY" ]; then
  echo "✅ SLP Multi-Agent Topology & Long-Term Memory are READY!"
  echo
  echo "Active Peer Registry, Live Panes & Mandatory Skills:"
  jq -r '.peers | to_entries[] | "  • \(.key) [role=\(.value.role), engine=\(.value.engine)] -> pane: \(.value.pane_id) | skills: [slp-peer, slp-peer-knowledge, slp-state, slp-collab]"' "$REGISTRY"
  echo
  echo "📚 Each peer was asked to load COMMON-BASELINE + its own <ROLE>-BASELINE (slp-peer-knowledge)."
  echo
  echo "⚠️  ORCHESTRATION INVARIANT: Lead must NEVER self-execute tasks. Dispatch all assignments to the live panes above!"
fi
exit 0
