# KNOWLEDGE RISK — Find unknowns/risks before assigning work

> Use at STEP 1–2, before writing the envelope. 5 axes + 1 amplifier.
> No K0–K3 classification, no ceremony — just a 5-line checklist.

## 1. Five Axes (quick per-task assessment)

| Axis | Question |
| :--- | :--- |
| **Scope** | How many modules/owners does the task touch? |
| **Irreversibility** | How costly to reverse (1 commit vs migration)? |
| **Novelty** | Has the team done this domain before? |
| **Blast Radius** | Who is affected if wrong (1 screen vs billing/auth/data)? |
| **Uncertainty** | How many assumptions unverified? |

Distinguishing example: *change 1 billing line* = high risk (blast radius);
*100 straightforward UI lines* = low risk. Never judge by "5-minute estimate".

## 2. Dependency Sensitivity (risk amplifier, not a standalone score)

- Extra question: *does this decision lock downstream work?*
  (navigation architecture → locks view structure, routing, state, tests).
- Local change that locks downstream = high risk, needs research/decision first.

## 3. Output (write into the envelope)

- High-risk axis → matching Required checks / supplemental / council.
- Unknowns → `Known Unknowns` + explicit CONSULT/RESEARCH grant (BLOCK only when unsafe).
