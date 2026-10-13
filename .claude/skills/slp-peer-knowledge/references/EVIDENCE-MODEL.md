# EVIDENCE MODEL — Answer = source, Expertise = derived (v1.1)

> Single source of truth. Never create a second knowledge record.

## 1. Chain

```text
NNN-answer (+ verification output)
  → Evidence (answer-path + verdict CONFIRM/PARTIAL/CHALLENGE/BLOCKED)
  → Proposal (Peer: PROPOSED, in the handback)
  → Lead evaluation → ACCEPTED / REJECTED / DEFERRED
  → Promotion (Lead writes MEMORY.md / peers.json evidence)
```

## 2. Rules

1. **Answer is the source.** A proposal without evidence (`<answer-path> — <verdict>`)
   is worthless; Lead ignores it.
2. **Peer never self-certifies.** Ban `I am expert / Strong in X`.
   Write only `Completed <task> → evidence <path> → suggest <area>`.
3. **Lead is the sole promoter.** `provisional → calibrated (≥1 pass) →
   established (≥3 pass)` per `slp-roster`. ACCEPTED ≠ ESTABLISHED:
   ACCEPTED acknowledges sufficient evidence; ESTABLISHED needs repeated evidence +
   matching difficulty + consistent behavior.
4. **Two directions.** Repeated verified failure → Lead lowers confidence or adds a
   **restriction** (e.g. `ESTABLISHED + restriction: complex async state`)
   instead of wiping all expertise. Serious boundary violation →
   demote per `slp-roster`.
5. **`herdr-context/` is ephemeral** (gitignored by design, solo). Proposals there
   are runtime hints. Durable record = MEMORY.md + peers.json after Lead promotion.
6. **Fail closed:** vague evidence (unclear answer/verdict) → REJECTED, never guessed.

## 3. Sample proposal (in the handback)

```markdown
## Knowledge used / applied / impact / discovered / proposal
- **Used:** COMMON §6 + ENGINEER §3 (minimal diff, file:line citations)
- **Applied:** state-ownership rule — async state stays in the ViewModel
- **Impact:** chose ViewModel ownership over local View state because it survives navigation
- **Discovered:** WHEN wireless CarPlay test → DON'T conclude from a single pass BECAUSE latency variance is high (provisional)
- **Proposal:** carplay-audio-baseline + evidence `herdr-context/engineer-x/002-answer-...md — CONFIRM`
```

Tasks with no relevant knowledge → write `Used: none relevant`, skip Applied/Impact
(never fabricate to fill the form).

## 4. Lead verify checklist (Lead uses, Peer reads to understand the bar)

- [ ] Answer-path exists, verdict matches disposition?
- [ ] Applied/Impact concrete (chose Y instead of Z), not just a list of files read?
- [ ] Real verification output (command + exit code)?
- [ ] Lesson has context + mechanism (not a slogan)? Single occurrence → provisional?
- [ ] Promotion/restriction conditions met per roster (pass count + difficulty)?
