# SLP HANDBACK EXAMPLES & DISPOSITIONS
> Reference for standard Peer Handback templates across 4 Dispositions

---

## 1. The Dispositions

| Disposition | When to use |
| :--- | :--- |
| **`CONFIRM`** | Task fully complete, all checks pass, no blocking risks. |
| **`CONFIRM_WITH_FIXES`** | Direction correct and usable, but the listed findings must be closed before it is settled. |
| **`PARTIAL`** | Mostly complete, but some edges remain unverified or need further review. |
| **`CHALLENGE`** | Found Lead's initial assumption wrong, or the current solution will cause a serious failure. |
| **`REJECT`** | Does not meet the contract and cannot with bounded edits. |

`CONFIRM | CONFIRM_WITH_FIXES | PARTIAL | CHALLENGE | REJECT` are the five completion verdicts
`update_state.sh finish` accepts. Their one meaning: **the peer finished the task**, so the task
is recorded `done` — the verdict is the peer's assessment of the *artifact*, which Lead accepts
separately (`taskctl.sh verify`). `BLOCKED` is not among them: it is the outcome "I could not do
this" and uses the `update_state.sh done` + `[BLOCKED]` path, which leaves the task `blocked`.

Rework after acceptance is `taskctl.sh reopen <id>` → `pending` → `dispatch`; a new task is only
needed when the work itself changes.

---

## 2. Worked Handback Example (Task 001 — Scout Architecture)

```markdown
# HANDBACK 001 — CarPlay iOS Architecture Baseline

**Disposition:** CONFIRM

## Scope actually handled
- Read and analyze `spec/PDR-carplay-ios.md`
- Survey CarPlay SceneDelegate and CPTemplateApplicationScene requirements

## Changes or findings
- Confirm CarPlay requires a dedicated `CPTemplateApplicationSceneDelegate`, separate from the iPhone `UIWindowSceneDelegate`.
- Audio Engine needs `AVAudioSessionCategoryPlayback` configured with `.mixWithOthers` for NowPlaying.
- Navigation needs the `com.apple.developer.carplay-maps` entitlement declared.

## Verification and exact results
- Cross-checked 100% of Phase 1 PDR requirements against the Apple CarPlay HIG 2026.
- Confirmed the MapTemplate supports all POI buttons and Search intents.

## Residual risks / Unknowns
- [HIGH] Needs Human to confirm whether the Apple Developer Account has Apple-approved CarPlay Entitlement.
- [MEDIUM] Check latency on wireless CarPlay connections.

## Incidental discoveries
- The PDR mentions Vehicle Data (Phase 2) without specifying whether vendors support OBD-II or CarPlay native telemetry.

## Terminal sentinel
- `TASK_COMPLETE`
```

---

## 3. `NOTICE`/`MICRO` Example (Task 031 — 1-line fix) — ONE LINE, NO FILE

*(`NOTICE`/`MICRO` lanes. Lead's request was a message; the completion is a message. Based on
a real 1-line legibility fix. The old form of this example was a 15-line handback file — these
lanes delete that file entirely.)*

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note engineer-x 031 CONFIRM \
  "JournalEntryCard.swift:31 .foregroundColor(emotionColor) -> LGColor.textPrimary (hue kept at :26/:12); xcodebuild --scheme feelie -> BUILD SUCCEEDED"
```

That appends to `_state/tasklog.md` and sends `[DONE] engineer-x: #031 CONFIRM — <that line>`.

## 4. `NOTICE`/`MICRO` Escalation (lane expansion)

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note engineer-x NNN PARTIAL \
  "needs STANDARD: the fix also requires <path>, which is outside the `MICRO` ask; stopped before mutating"
```

These lanes never silently expand. Escalate with one line and let Lead re-dispatch — `NOTICE`/`MICRO` → `STANDARD` is
`PARTIAL: needs STANDARD`, `STANDARD` → `FULL` is `PARTIAL: needs FULL`.

---

## 5. `NOTICE`/`MICRO` Pure-Deletion Example (any number of lines)

*(Deleting a block quoted verbatim in the message is a `NOTICE`/`MICRO` task: reversible, no new state. This is the
task that used to be dispatched as STANDARD and answered with a 35-line handback file.)*

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note engineer-pi 008 CONFIRM \
  "JournalListView.swift:255-301 dailyPromptCard + call site :44 + MARK removed; rg dailyPromptCard -> 0; xcodebuild --scheme feelie -> BUILD SUCCEEDED; file already carried unrelated uncommitted changes"
```

## 6. `NOTICE` Example (no file mutation)

```bash
bash .agents/skills/slp-state/scripts/update_state.sh note designer-opencode 005 CONFIRM \
  "slp-send.sh Lead \"[MSG] designer-opencode: role=designer engine=opencode state=busy — online.\" -> exit 0, delivered"
```
