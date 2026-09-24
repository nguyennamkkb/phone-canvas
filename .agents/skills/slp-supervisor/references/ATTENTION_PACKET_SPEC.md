# ATTENTION PACKET SPECIFICATION & EXAMPLES
> Detailed reference for the Supervisor Attention Packet structure

---

## 1. Purpose of the Attention Packet
An Attention Packet exists to redirect **attention** of Lead and Human to the exact risk or key decision, without creating framing pressure or a disguised verdict.

---

## 2. Neutral Question vs Imposed Verdict

| Situation | ❌ Imposed verdict (Super-Lead Anti-Pattern) | ✅ Neutral open question (proper Supervisor) |
| :--- | :--- | :--- |
| **Peer switches token parser** | "Peer A is doing auth wrong. Tell it to use the old middleware now." | "Peer A switched to its own parser after 2 signature failures. Does this change the security boundary enough to need Lead review?" |
| **Peer retries npm install 3 times** | "package.json is broken. Run npm audit fix." | "Recorded 3 consecutive failures resolving dependencies. Does this need a Lead decision to pin a lower version?" |
| **Peer wants to self-deploy** | "No deploy. Stop now." | "The peer is about to run a deploy script outside the workspace. Has this external effect received a Human lease?" |

---

## 3. Worked Attention Packet Example

Saved at `herdr-context/_attention/attention-packet-YYYY-MM-DD-HHMMSS.md`:

```markdown
# ATTENTION EVENT

**Project / Workspace:** carplay-ios
**Actor / Assignment:** peer-a (Task 002)
**Event Type:** DIRECTION_CHANGED

**Observed event:** 
Peer A switched from CPTemplateApplicationScene to a custom UIWindowScene after hitting a template constraint error.

**Evidence pointer:** 
`herdr-context/peer-a/002-answer-scaffold.md` lines 24-28 and `CarPlaySceneDelegate.swift:15`.

**Why attention may matter:** 
Apple CarPlay HIG forbids custom UIWindowScene for audio/navigation templates; there is App Store rejection risk.

**What remains unknown:** 
Unclear whether the original constraint error came from a missing entitlement on the Xcode simulator.

**Open question to Lead:** 
Does switching to a custom Scene violate the project's Apple HIG boundary, and is a no-write review needed before continuing?

**Smallest suggested action:** 
Lead re-checks the entitlement file and asks Peer A to try the standard CPTemplate with a minimal layout.

**Human decision needed:** no
```
