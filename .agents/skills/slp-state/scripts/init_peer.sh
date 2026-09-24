#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SLP Peer State & Memory Initializer Script
# Initializes:
# 1. herdr-context/<peer>/_state/MEMORY.md (Long-term personal memory)
# 2. herdr-context/<peer>/_state/status.json (Canonical state)
# 3. herdr-context/<peer>/_state/context-compact.md (Compact cache)
# ==============================================================================

if [ $# -lt 1 ]; then
  echo "Usage: $0 <peer-name> [workspace-root]"
  exit 1
fi

PEER="$1"
WORKSPACE_ROOT="${2:-$(pwd)}"
PEER_DIR="$WORKSPACE_ROOT/herdr-context/$PEER"
DIR="$PEER_DIR/_state"
MEMORY_FILE="$DIR/MEMORY.md"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$DIR"

# 1. Initialize Long-Term Memory (_state/MEMORY.md)
if [ ! -f "$MEMORY_FILE" ]; then
  cat > "$MEMORY_FILE" <<EOF
# Long-Term Memory — $PEER
> Long-term memory of $PEER. Automatically accumulates experience, patterns, and lessons after each task.

## 1. Discovered Framework & SDK Quirks
- (None recorded yet)

## 2. Hard Invariants & Lessons Learned
- (None recorded yet)

## 3. Recurring Patterns & Workarounds
- (None recorded yet)

## 4. Key Personal Achievements
- (Initialized on $NOW)
EOF
  echo "✔ Successfully initialized long-term memory for $PEER at $MEMORY_FILE"
fi

# 2. Initialize canonical status.json
if [ ! -f "$DIR/status.json" ]; then
  cat > "$DIR/status.json" <<EOF
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
  "known_constraints": {
    "do": [],
    "do_not": []
  },
  "open_questions": []
}
EOF
  echo "✔ Successfully initialized state for $PEER at $DIR/status.json"
fi

# 3. Initialize minimal context-compact.md
if [ ! -f "$DIR/context-compact.md" ]; then
  cat > "$DIR/context-compact.md" <<EOF
# Peer Compact — $PEER
**Generated:** $NOW
**Tier:** 1
**State:** idle

## Identity
- Name: $PEER
- Tier: 1

## Current State
- state: idle
- current_task: none
- last_completed: none
- last_summary: none

## Recurring Constraints
**DO:**
- none

**DO NOT:**
- none

## Recent Handbacks
- (No completed tasks yet)

## Active Risks
- none

## Open Questions
- none

---
*Initialized by slp-state. Source of truth remains status.json and handback artifacts.*
EOF
  echo "✔ Successfully initialized cache for $PEER at $DIR/context-compact.md"
fi
