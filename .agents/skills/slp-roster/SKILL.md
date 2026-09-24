---
name: slp-roster
description: Manage the shared capability registry at `herdr-context/_registry/peers.json` and resolve communication targets for Lead and Peers. Lead is the sole writer/authority; peers read for role boundaries and routing.
---

# SLP ROSTER: CAPABILITY REGISTRY & TARGET RESOLUTION

## 1. Authority & Invariant Rules
- **Location:** `herdr-context/_registry/peers.json`
- **Lead is the SOLE writer and role authority.** Peers read the registry to understand their role and resolve coordinates, but are strictly forbidden from modifying it.
- **Fail-Closed Routing:** If a task requires specialized expertise (e.g., cryptographic security review) and no matching role exists in the registry, Lead MUST report `BLOCKED` to Human rather than assigning an incompatible generalist.

Detailed role calibration and progression guidelines: [Roster Spec](references/ROSTER_SPEC.md).

---

## 2. Canonical Schema (v1)

```json
{
  "schema_version": 1,
  "updated_at": "2026-08-28T08:00:00Z",
  "Lead": {
    "logical_name": "Lead",
    "pane_id": "w1:p1",
    "updated_at": "2026-08-28T08:00:00Z"
  },
  "peers": {
    "peer-a": {
      "logical_name": "peer-a",
      "pane_id": "w1:p2",
      "role": "engineer",
      "strengths": ["SwiftUI core layout", "audio synthesis"],
      "avoid_without_review": ["security/auth"],
      "confidence": "calibrated",
      "evidence": ["001-answer-audio.md"]
    },
    "peer-b": {
      "logical_name": "peer-b",
      "pane_id": "w1:p3",
      "role": "reviewer",
      "strengths": ["adversarial security audits", "contract validation"],
      "avoid_without_review": [],
      "confidence": "established",
      "evidence": ["002-answer-auth-audit.md"]
    }
  }
}
```

---

## 3. Communication Target Resolution & Scripts

Never guess a peer's pane ID or assume Lead is named "Lead". 

### 3.1 Automation Script (`scripts/resolve_target.sh`)
To resolve target coordinates in one command:
```bash
# Resolve Lead target
bash .agents/skills/slp-roster/scripts/resolve_target.sh Lead

# Resolve Peer target
bash .agents/skills/slp-roster/scripts/resolve_target.sh scout-a
```

### 3.2 Shared Sender

All SLP messages use the shared script; callers provide registry keys rather than pane IDs:

```bash
bash .agents/skills/slp-collab/scripts/slp-send.sh scout-omp "Read the assignment file and follow it."
bash .agents/skills/slp-collab/scripts/slp-send.sh Lead "[DONE] scout-omp: <answer-path> — CONFIRM"
```

The script reads the registry, checks the live agent in the caller workspace, and sends once. No guessed target, raw-command fallback, or file polling. `resolve_target.sh` remains a read-only diagnostic helper. Lead must verify bindings after pane or agent replacement. See [slp-collab](../slp-collab/SKILL.md).

---

## 4. Role Assignment & Confidence Lifecycle

1. **Bootstrap:** When registering a new peer, set `confidence: "provisional"`.
2. **Calibration:** After a peer successfully completes an assignment with clean evidence, update `strengths` and upgrade confidence (see [references/ROSTER_SPEC.md](references/ROSTER_SPEC.md)):
   $$\text{provisional} \xrightarrow{\text{1 pass}} \text{calibrated} \xrightarrow{\ge 3 \text{ verified passes}} \text{established}$$
   Record the answer-path in `evidence`. ACCEPTED proposal ≠ ESTABLISHED —
   established needs repeated evidence + matching difficulty + consistent behavior.
   Repeated verified failure may reduce confidence or add a `restriction`
   (e.g. `ESTABLISHED + restriction: complex async state`); serious boundary
   violation → demote per [ROSTER_SPEC](references/ROSTER_SPEC.md).
   Full proposal lifecycle: [slp-peer-knowledge EVIDENCE-MODEL](../slp-peer-knowledge/references/EVIDENCE-MODEL.md).
3. **Atomic Update:** Always write `peers.json.tmp` then rename to `peers.json`.
