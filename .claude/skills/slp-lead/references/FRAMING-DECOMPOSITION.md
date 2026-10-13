# FRAMING & DECOMPOSITION — Turn goals into a reasoned task graph

> Use at STEP 1 (Intake). Checklist + split rules + 2 worked examples +
> a Decomposition Record forcing Lead to write *why split / why keep*.

## 1. Decision Checklist (8 items before dispatch)

- [ ] **One-sentence problem:** *For [who], achieve [what] within [which bounds], because [impact],
      without [what's excluded].*
- [ ] **Independent outcome:** does this task have exactly 1 observable outcome?
- [ ] **Boundary:** owned/excluded scope + mutation policy clear?
- [ ] **Dependencies:** which prerequisites don't exist → separate branch?
- [ ] **Unknowns:** which unknowns need research BEFORE build?
- [ ] **Risk:** run KNOWLEDGE-RISK before locking topology.
- [ ] **Ownership:** exactly 1 writer per moving scope?
- [ ] **Acceptance:** required checks + which layers to verify?

## 2. Decomposition Rules (split on any of 5)

1. Task holds >1 independent outcome → split.
2. Task crosses independent ownership → split.
3. Task needs an undecided architecture decision → research/decide first, build later.
4. Task needs >1 supplemental knowledge → split, or exception with reason.
5. Build task contains a scout-grade unknown → separate discovery.

## 3. Topology (smallest sufficient)

- **`NOTICE`** (no file mutation — message/handshake/policy ack/consult · `MICRO`: ≤15 risk-bearing lines, ≤3 files, deletions free, fully specified, reversible) → Lead + 1 Peer, single round trip, **no files** (see [ENVELOPE-AUTHORING §3](ENVELOPE-AUTHORING.md)).
- **`STANDARD`** (clear scope, 1 writer, but needs investigation/judgment) → Lead + 1 Peer, envelope + handback files.
- **`FULL`** (new architecture/contract, irreversible, cannot be a single writer, or ≥2 peers) → Lead + Sealed Council (2–3 lanes) + reconcile (see [ENVELOPE-AUTHORING §5](ENVELOPE-AUTHORING.md)).
The Lane Rule in `slp-lead` STEP 1 owns the classification; this section only picks the topology that matches it.
- New architecture / hard to reverse / large blast radius → Lead + Council (2–3 lanes).
- Long-running, many workspaces → + Supervisor.

> Note: "1 direct session" in older revisions means **1 Peer session** (Lead dispatches to a Peer pane), never Lead self-executing. ANTI-SOLO holds at every lane.

## 4. Worked Examples

### Ex 1 — "Implement subscription paywall" → SPLIT

| Task | Role | Why split |
| :--- | :--- | :--- |
| A. Research StoreKit behavior | SCOUT | Undecided knowledge (rules 3, 5) |
| B. Paywall UX flow | DESIGNER | Independent outcome (rule 1) |
| C. Subscription implementation | ENGINEER | Depends on A + B |
| D. Acceptance / verification | Lead | Owner acceptance, never delegated |

### Ex 2 — "Audit auth then fix bug" → KEEP (1 task, hybrid disposition)

- Role: ENGINEER, Disposition: `AUDIT → IMPLEMENT`, supplemental: audit fragment.
- Why KEEP: same scope, same writer; audit is a mode, not a new role.

## 5. Decomposition Record (write on SPLIT or when unsure)

```markdown
### Candidate Task — <name>
### Independent Outcomes — 1. ... 2. ...
### Dependencies — ...
### Unknowns — ...
### Ownership — ...
### Split Decision — KEEP | SPLIT
### Why — ...
### Resulting Tasks — ...
```
