# SLP ROSTER SPECIFICATION & ROLE CALIBRATION
> Detailed reference for managing the capability roster and calibrating role confidence

---

## 1. Role Confidence Scale (Confidence Progression)

| Confidence level | Meaning | Authority & tasking |
| :--- | :--- | :--- |
| **`provisional`** | Freshly registered, no witnessed evidence in this repo yet. | Only small tasks, surveys (`no-write`), or tasks with independent review. |
| **`calibrated`** | Completed $\ge 1$ successful delivery task with clear evidence. | May take independent bounded-scope tasks inside proven strengths. |
| **`established`** | Completed $\ge 3$ complex tasks, passed all verification, caused no regression. | May take critical modules or serve as a Reviewer/Architect Council seat. |

---

## 2. Roster Adjustment Rules (Lead Only)

- After each successful Handback $\rightarrow$ Lead updates the `evidence` field in `peers.json` with the answer file link. ACCEPTED proposal ≠ ESTABLISHED: established needs repeated evidence + matching difficulty + consistent behavior (see [slp-peer-knowledge EVIDENCE-MODEL](../slp-peer-knowledge/references/EVIDENCE-MODEL.md)).
- If a peer repeatedly violates boundaries or introduces errors $\rightarrow$ Lead demotes confidence to `provisional` or adds an entry to `avoid_without_review`. Repeated verified failure in a sub-area may instead add a `restriction` (e.g. `ESTABLISHED + restriction: complex async state`) without full demote.
