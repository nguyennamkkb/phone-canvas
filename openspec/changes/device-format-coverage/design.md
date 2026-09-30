# Design

## Context

See `proposal.md` (Why) for motivation. Current state shaping the approach:

- Phone is fully wired: shell-owned bands (`compose.ts`), measured gate, sample
  screens, generator kinds, skill recipes.
- Tablet has device presets (`ipad-11`, `ipad-mini`) and spec requirements
  (sidebar + split) but zero sample screens, zero recipes, zero generator
  support — the rules have never been built against.
- Watch/Widget have only prose reference tables in `docs/screen-regions.md`;
  no presets, no document path, no gate coverage.
- Duo (`duo-cover`/`duo-inner`, fold rules, continuity) is frozen — the user
  guides it separately. Nothing here touches Duo behavior.

## Goals / Non-Goals

**Goals:**

- Every covered form factor ends with the same loop phone has: author →
  board → spec → export, all green on `npm run gate`.
- Reusable formats derived from proven samples, never declared upfront.

**Non-Goals:**

- No shell-owned tablet/Watch/Widget bands in this change unless a sample
  round proves hand-authoring cannot satisfy the gate — the default is
  author-owned arrangements under existing rules.
- No Duo work of any kind.
- No changes to the phone loop, phone presets, or the two gate tiers'
  architecture (new probes only if a round requires them).

## Decisions

### Sample-first, generalize-after (per round)

Each round draws one real screen in a scratch project before creating any
reusable format. Rationale: tablet rules are unproven prose — encoding them
into a generator kind first risks ossifying a wrong contract. The iPhone kinds
(`push`/`modal`/…) work because they distill shapes that already shipped.

### Gate stays unified and surface-aware, never forked

Verified against the code: the static tier already exempts non-phone forms
from body-band rules (`bodyBandViolations` returns early), and the measured
audit only fails on *more than one* scroller or bands inside a scroller — a
surface with zero scrollers passes today. New surface probes (if a sample
round needs any) SHALL extend `lint:regions` / `audit:regions` in place.
Rationale: one gate is the project's core invariant — a second gate doubles
every future rule change. Alternative (per-surface gates) rejected.

### Board needs no new work

`PhoneNode` renders any `Device` size generically (frame + srcdoc + bridge),
so tablet/Watch/widget surfaces render without board changes; mixed-size
placement limits are already documented in `docs/devices.md`. Each round
verifies its sample on the live board as part of review. Alternative (a
dedicated surface node type) rejected — no evidence it is needed.

### Shared surface profile only on repetition

If the second surface repeats machinery from the first (presets shape,
document path, gate probes), that round extracts a shared profile; until
then, per-surface rules. Rationale: same rule-of-three as recipe-first —
abstraction before repetition ossifies guesses. The evaluation itself is a
task in group 5, with its decision recorded here.

> RESOLVED 2026-09-30 (task 5.4): no extraction. What repeated — preset rows,
> one template branch and one guard term per surface — is already table-driven
> where it matters: the `form` field on `Device` is the surface profile (it
> drives lint form-gating, the board chip and `export --device`). Three small
> branches do not justify an abstraction; revisit if a fourth surface adds
> another branch and guard term.

### Reusable format defaults to recipe, not code

A round's output is a skill recipe first; a `new-screen --kind` and shared
components only if the sample exposes a repeating shape. Rationale: kinds and
shared chrome are maintenance surface — justified only by repetition.
Alternative (kinds upfront for all three factors) was rejected as speculative.

### Watch/Widget sizes decided at round start, with the user

No presets exist and the repo holds no source of truth for them (see
`docs/screen-regions.md` "Số đo KHÔNG có trong nguồn"). Guessing sizes into
`devices.ts` would bake wrong numbers where the gate treats them as truth.
Each round opens by recording exact sizes in this file's Open Questions
resolution — the specs require it before any sample is drawn.

### Review loop is export-PNG based, bounded

Create → `npm run export` → human reads the PNG → fix, max ~3 rounds per
sample; still moving after that means stopping and stating the blocker.
Rationale: matches the skill's verified loop and keeps review observable
without a live board session.

## Risks / Trade-offs

- [Risk] Tablet rules as written may be unbuildable or ugly → Mitigation:
  the round is explicitly allowed to revise `screen-regions` requirements;
  the spec delta for that exists.
- [Risk] The Watch pt model may not fit the iframe 1:1 assumption
  (`1 CSS px === 1 pt`) → Mitigation: decided at round start; if it breaks,
  the round scopes a compose document-path decision instead of forcing pixels.
- [Risk] Widgets do not scroll, breaking the one-scroller assumption behind
  `.body` → Mitigation: same as above — document-path decision at round start.
- [Risk] Three sequential rounds take a while → Mitigation: accepted; rounds
  are independent after this plan, and each lands its own tests/docs so
  stopping mid-way still leaves usable artifacts (per task grouping).

## Migration Plan

Additive only: new sample screens (scratch projects, deletable), new skill
recipes, possibly new generator kinds/presets. No existing screen, preset, or
gate behavior changes except the `screen-regions` prose/spec fixes named in
the delta. Rollback of an unfinished round is deleting its scratch screens.

## Open Questions

- Reusable-format shape per round: `--kind` + recipe, or recipe + shared
  components, or recipe only? Deferrable to each round's end — tasks 2.4/3.3/4.3
  accept any combination, and the choice does not alter earlier tasks.
- Watch sizes and document path — RESOLVED 2026-09-30: single 45mm reference,
  198×242 pt (396×484 px ÷ 2), user-confirmed. Document path: standard compose
  document at that size (1 CSS px === 1 pt holds; no special path unless the
  sample round proves otherwise).
- Widget families, sizes and document path — RESOLVED 2026-09-30: Small
  169×169 pt + Medium 360×169 pt (user-confirmed via selection). Document path:
  standard compose document at those sizes; widgets do not scroll and take no
  input — content must fit, overflow is a content bug.
