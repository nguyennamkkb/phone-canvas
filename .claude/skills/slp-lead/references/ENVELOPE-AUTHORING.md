# ENVELOPE AUTHORING — Turn decisions into assignment contracts

> Use at STEP 2. Lead writes `## Knowledge` so each Peer opens only its own knowledge.

## 1. Template (2-line header + the fields below; a missing field is DISPATCH THEATER)

> **Create the file with the tool, not by hand:**
> `slp-send.sh request <peer> auto "<title>" --lane=standard --lease="…" --origin="…"` writes
> `herdr-context/<peer>/<NNN>-request-<local date>-<slug>.md`, fills the header below, and takes
> the body on stdin (or writes the section skeleton). Never hand-name an artifact, never use
> `date -u` for a filename.

```markdown
# NNN — <short title>
Lane: <STANDARD|FULL> · lease: <no-write | write: <exact paths> | DENIED> · origin: <Human <ref> | review <NNN>#<ID> | MEMORY §n>

## Outcome
- <objective, 1 sentence> · Done when: <observable criteria> · Stop when: <what returns BLOCKED>

## Scope
- Owned: <exact files/dirs, ONE WRITER ONLY> · Excluded: <forbidden paths> · External effects: <DENIED | authorized list>
- Pin: <base commit> + `git diff <base> -- <paths> | shasum -a 256` = <hex>  ← REQUIRED when the candidate is UNCOMMITTED

## Knowledge
- Primary: <SCOUT-|ENGINEER-|REVIEWER-|DESIGNER-BASELINE.md per Role> · Supplemental: <file or none> · Disposition: <IMPLEMENT|AUDIT|INVESTIGATE|VERIFY|REVIEW|RESEARCH|DESIGN>
- Project: <exact artifact paths, NEVER "read the whole project"> · Known unknowns: <open facts; CONSULT/RESEARCH allowed, BLOCK only when unsafe>
- Loading rule: load only the above. Do not discover unrelated knowledge.

## Verify
- <exact commands + the results to report>

## Done
- Write `<answer-path>`, then `update_state.sh finish` (it builds the `[DONE]` callback — never hand-write it).
```

**Lane groups.** Four lanes, three ceremony levels: **A = `NOTICE` + `MICRO`** (message-only —
no request file, no handback file), **B = `STANDARD`** (this template + a handback file),
**C = `FULL`** (this template per council seat + reconcile). Pick the lowest lane whose gates
hold; if unsure, go one level UP. Groups make the "how much paperwork" question trivial to
answer and are the only thing you need to remember: **no files: `NOTICE`/`MICRO` · file: `STANDARD` · council: `FULL`.**

**Header rule:** the header carries ONLY what cannot be derived. This file is only written for
B and C — an A task has no envelope file at all ("## 3" and "## 4" define the message instead). Peer, role, engine and
date are already in the path (`<peer>/NNN-request-YYYY-MM-DD-*.md`), the filename and
`tasks.json` — do not restate them. There is no Identity block: `Parent: Lead` and the four
`Skills:` are constants, and the tool already injects the skills + role knowledge
(`slp-open`). Lane/lease/origin is the one line that must be explicit.

**Pin rule:** a base commit hash does not pin a dirty working tree, and `--numstat` does not
prove content (the same `+71/−73` can be a different patch). When the candidate is uncommitted,
the digest is the pin.

**No-write lease:** `Excluded` must still except the peer's OWN `_state/`. `update_state.sh
finish` writes `status.json` / `context-compact.md`, and that is the mandated completion
command — not a lease violation, and not a reason for the peer to skip it.

## 2. Rules

1. **Primary matches Role.** Hybrid dispositions (`AUDIT → IMPLEMENT`) don't change Role —
   borrow a fragment as supplemental, never mint a new baseline.
   The out-of-browser `RESEARCH` disposition (via the `kimi-webbridge` skill) belongs to Scout
   (see [SCOUT-BASELINE](../slp-peer-knowledge/references/SCOUT-BASELINE.md) §1/§3b);
   the envelope must state browser permission + read-only vs lease limits.
2. **Supplemental ≤1 by default.** Need more → split the task (decomposition pressure),
   except with a recorded reason.
3. **Exact project paths** (`_decisions/004-*.md`, `docs/*.md`), never whole directories.
4. **Known Unknowns ≠ failure.** State explicitly whom the Peer may consult / what to research.
5. **Never paste reference content** into the envelope. Envelopes carry decisions,
   not textbooks.
6. Read MEMORY.md + registry + old answers BEFORE writing (anti DISPATCH THEATER).

## 3. MICRO (write, ≤3 files / ≤15 risk-bearing lines) — MESSAGE ONLY

> Use ONLY when all gates hold (decided at STEP 1): **M1 risk-bearing lines ≤15** (count
> *insertions + modified*; **deleting** a block quoted verbatim in the message is free) across
> **≤3 files**, no new file · **M2** no new token/schema/API/copy/export format · **M3**
> reversible with one command (`git checkout -- <paths>`) · **M4** every edit fully specified
> below, no discovery needed · **M5** the work is the literal application of an already-approved
> decision — a spec item (`NNN-answer §MFk`), an accepted review finding
> (`NNN-answer §MAJOR-k|MINOR-k`), or a direct Human instruction.
> **A missing field is DISPATCH THEATER.** Not for research, audit, design, or anything needing
> discovery — that is B.

**There is no envelope file.** Dispatch is ONE `slp-send.sh` message; the peer's completion is
ONE `update_state.sh note` (no handback file). The `#NNN` in the message is what ties the reply
to the task record, so it is mandatory.

```text
Task #NNN (`MICRO`). <one-line ask>
Edit — <path>:<line>
old: <exact old text>
new: <exact new text>
Proof — <exact commands whose output closes it: `rg <symbol> .` → 0, `<build wrapper>` → SUCCESS>
Done — bash .agents/skills/slp-state/scripts/update_state.sh note <peer> NNN CONFIRM "<one-line evidence>"
```

**Pure deletion (still `MICRO`, any number of lines):** replace `Edit` with the block to remove,
quoted verbatim, plus `Proof — rg <symbol> repo-wide → 0` so "unused" is not assumed.

**Escalate — if it needs >15 risk-bearing lines, a 4th file, or any discovery → STOP, return
`PARTIAL: needs STANDARD`.** Never silently expand.

## 4. NOTICE (no file mutation, ≤8 lines) — MESSAGE ONLY

> Tasks that change no file at all: directed messages, handshake/connectivity checks, policy
> acknowledgements, consult answers. A file (envelope or handback) is pure waste here.

```text
Task #NNN (`NOTICE`). <the single action: exact command to run / message to send / rule to acknowledge>
Proof — <the output to report verbatim: exit code + the relevant line(s)>
Done — bash .agents/skills/slp-state/scripts/update_state.sh note <peer> NNN CONFIRM "<that output>"
```

**Escalate — a NOTICE task that turns out to need a file mutation is no longer file-less → STOP, return
`PARTIAL: needs STANDARD`.**

## 5. FULL (architecture / irreversible / multi-peer) — council

> Gate: **any** of (a) new architecture or contract surface, (b) irreversible or hard to revert,
> (c) cannot be a single writer, (d) needs ≥2 peers. Otherwise it is `STANDARD`.

- **Dispatch:** one §1 envelope **per seat**, **zero pre-framing** — the brief is identical for
  every seat, word for word, with Lead's preferred outcome excluded. Pin the candidate (base +
  digest) and state the exact question each seat must answer.
- **Answer:** one handback per seat ([slp-peer §4.2](../slp-peer/SKILL.md)).
- **Acceptance:** Lead reconciles over the **8 axes** ([COUNCIL_AND_RECONCILE](COUNCIL_AND_RECONCILE.md)),
  records a decision (`taskctl.sh decision <id> <path>`), and never resolves by majority vote —
  the strongest falsifiable proof wins, dissent is documented.
- **Supervisor:** add when the program spans workspaces/sessions (C3).

**Escalate — if a `STANDARD` task needs a second seat or its candidate cannot be pinned → STOP, return
`PARTIAL: needs FULL`.**
