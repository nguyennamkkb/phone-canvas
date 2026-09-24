# RECONCILE & ACCEPTANCE BAR — Turn output into accept/reject

> Use at STEP 4. This file is the **verification bar**, not a methodology replacement.
> Sources of truth: [COUNCIL_AND_RECONCILE](COUNCIL_AND_RECONCILE.md) (8 axes + template)
> and the doctrine's 5-layer acceptance.

## 1. Role split (no duplication)

- **COUNCIL_AND_RECONCILE.md** = decision methodology: neutral brief → sealed
  first-view → 8 axes → decision record. Answers: *how to think with many options?*
- **This file** = verification bar: what to check in received output before accepting?
  Answers: *is it enough to close?*

## 2. Reconcile Bar (strongest proof wins, no voting)

- [ ] Do all lanes start from the same factual base? (Premise)
- [ ] Does the winning option have falsifiable proof (a refuting test/experiment)?
- [ ] Do rejected options carry explicit falsifying evidence, not vibes?
- [ ] Is minority dissent kept for re-evaluation when assumptions change?
- [ ] Was Lead's preference hidden before first-view?

Any miss → RECONCILE THEATER, redo a narrow reconcile round.

## 3. Acceptance Bar (per-layer, no blanket PASS)

```
SOURCE:    PASS | BLOCKED | NOT TESTED (+ commit/test evidence)
ARTIFACT:  PASS | BLOCKED | NOT TESTED (+ digest)
INSTALLED: PASS | BLOCKED | NOT TESTED (+ version/bytes)
LIVE:      PASS | BLOCKED | NOT TESTED (+ health/provenance)
JOURNEY:   PASS | BLOCKED | NOT TESTED (+ E2E outcome)
```

- Untouched layers stay NOT TESTED/UNKNOWN/BLOCKED.
- Candidate changed after review → old evidence expires, re-verify.
- **`MICRO` lane:** the handback claims Layer `SOURCE` only (SOURCE PASS requires: `git diff --numstat` ≤3 files, ≤15 risk-bearing lines — deletions free — + target lines match the spec + build wrapper SUCCESS). Layers 2–5 stay `NOT TESTED` — no separate verify round is dispatched. The evidence arrives inline and is stored on the task (`.evidence`), mirrored in the peer's `_state/tasklog.md`.
- **`NOTICE` lane:** no file was mutated, so there is no layer to claim — the reported command output is the artifact. Verify the claim against the transcript, nothing more.
- **`FULL` lane:** acceptance is the 8-axis reconcile plus a decision record; a single seat's `CONFIRM` is not acceptance.

## 4. Decision Confidence (recorded with the decision)

```markdown
## Decision Confidence
- **Confidence:** HIGH | MEDIUM | LOW
- **Reason:** <evidence held: 2 scout reports + current code...>
- **Missing Proof:** <what's still missing, e.g. prototype performance benchmark>
```
