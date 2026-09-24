#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SLP Target Resolution Script
# Resolves logical name and pane ID for Lead or a Peer from _registry/peers.json
# ==============================================================================

if [ $# -lt 1 ]; then
  echo "Usage: $0 <target-name> [workspace-root]"
  echo "Example: $0 Lead"
  echo "Example: $0 scout-a"
  exit 1
fi

TARGET="$1"
WORKSPACE_ROOT="${2:-$(pwd)}"
REGISTRY="$WORKSPACE_ROOT/herdr-context/_registry/peers.json"

if [ ! -f "$REGISTRY" ]; then
  echo "Error: Registry not found at $REGISTRY"
  exit 1
fi

if [ "$TARGET" = "Lead" ]; then
  NAME=$(jq -r '.Lead.logical_name // empty' "$REGISTRY")
  PANE=$(jq -r '.Lead.pane_id // empty' "$REGISTRY")
else
  NAME=$(jq -r --arg p "$TARGET" '.peers[$p].logical_name // empty' "$REGISTRY")
  PANE=$(jq -r --arg p "$TARGET" '.peers[$p].pane_id // empty' "$REGISTRY")
fi

echo "TARGET=$TARGET"
echo "LOGICAL_NAME=$NAME"
echo "PANE_ID=$PANE"
