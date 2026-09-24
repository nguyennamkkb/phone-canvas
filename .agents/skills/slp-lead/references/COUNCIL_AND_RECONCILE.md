# SEALED COUNCIL & RECONCILIATION PLAYBOOK
> Detailed reference for Lead when running a sealed Council and closing technical decisions

---

## 1. When to Convene a Council?
- Hard-to-reverse architecture change.
- Security, authorization, or owning-boundary change.
- Third-party integration with large blast-radius risk.
- Domain exploration entirely new to the team.

---

## 2. Sealed First-View Protocol

```
[Lead: Neutral question + shared brief]
                    ↓
   ┌────────────────┼────────────────┐
   ↓                ↓                ↓
[Scout]       [Architect]       [Reviewer]
(Fresh Session)(Fresh Session)  (Fresh Session)
(no-write)     (no-write)       (no-write)
   ↓                ↓                ↓
[Report A]     [Report B]       [Report C]
(Sealed)       (Sealed)         (Sealed)
   └────────────────┬────────────────┘
                    ↓
[Lead: Reconcile on 8 axes -> Decision Record + Dissent]
```

---

## 3. The 8-Axis Reconcile Matrix

| Evaluation axis | Lead check question |
| :--- | :--- |
| **1. Premise** | Do all lanes start from the same factual base? |
| **2. Mechanism** | What mechanism does the proposed solution rely on? |
| **3. Boundary** | Does the proposal sit in the correct owning layer? |
| **4. Failure Modes** | What would make this solution collapse or fail? |
| **5. Reversibility** | What does it cost to turn back or roll back if this direction is wrong? |
| **6. Evidence** | Which data is observed fact (*Observed*), which is inference (*Inferred*)? |
| **7. Authority** | Who has the highest authority to close this trade-off? |
| **8. Proof** | Which experiment / unit test could prove or refute the option? |

---

## 4. Complete Decision Record Template
Save at `herdr-context/_decisions/NNN-<topic>.md`:

```markdown
# DECISION RECORD NNN — <Topic>

- **Decision:** <Selected technical decision>
- **Decision Owner:** Lead (<Lead name>)
- **Scope Impacted:** <Affected modules/files>

## Why Selected
- <Observed evidence and superior technical argument>

## Rejected Alternatives
- **Option B:** <Rejection reason and potential failure mechanism>
- **Option C:** <Rejection reason>

## Dissent & Unresolved Unknowns
- <Minority reviewer view retained as evaluation basis if assumptions change>

## Required Proof before Mutation
- <Canary test or required test condition before granting a write lease>
```
