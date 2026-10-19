# Design — noor-remaining-screens

## Context

12 Noor screens ship under `project/noor/screens/`, governed by `docs/Noor/AUTHORING.md` (the 9-step phone-canvas loop, both gates) and the VD-001 token system in `project/noor/tokens.css` (warm cream canvas, forest-green primary, brass as the only warm text hue, no card borders, typography roles). The audio domain already pre-declared shared components (`nr-transport`, `nr-seek`, `nr-stepper`, `nr-setting`) because FS-012…FS-016 compose the same four controls. Each of the 16 remaining screens has a frozen FS spec (`docs/Noor/feature-screens/FS-NNN-*.md`) plus a wireframe section (`docs/Noor/wireframes/NN-*.md`). See proposal.md for why; see `specs/noor/*/spec.md` for the behaviour contracts.

## Goals / Non-Goals

- **Goals:** every wave lands as hand-verified HTML (lint + export + PNG read + gate) in dependency order; shared vocabulary grows only where ≥2 screens need the same control; TODO ticks stay verified-never-assumed.
- **Non-Goals:** no new navigation model (reader stays root, no tab bar — D6); no board-core changes (`src/`, `scripts/`); no re-spec of frozen FS docs (delta specs here summarise behaviour, FS remains the build source of truth).

## Decisions

1. **Wave order = dependency, not number.** Player companions (013/016) before Offline (018/019) before the rest — the size estimate on FS-019 is stated *against* the FS-013-chosen reciter, and commerce (038) goes last because F9 must describe capabilities that already exist. *Alternative (numeric FS order):* rejected — it would build the transfer screen before the reciter it estimates against.
2. **Reuse the audio vocabulary, extend by variant.** 013/016 compose `nr-setting` rows + `nr-transport`/`nr-stepper` verbatim (proven on FS-012/014/015). New controls (timer chips on 016, plan cards on 038, juz ring on 027) ship as per-screen `<style>` first and graduate to `tokens.css` only if a second screen needs them. *Alternative (declare all upfront):* rejected — tokens.css already warns that pre-declaring five screens' components in one place caused near-identical rules to fight.
3. **FS-029 concealment without transform/filter.** Hidden text must not leak through selection or layout: render concealed verses as brass-dot placeholders (`nr-mark`-family glyphs on the ambient plane), never as transparent/blurred real text (`filter`/`opacity` tricks are out of subset and leak via copy). *Alternative (masked real text):* rejected — subset gate forbids it and VoiceOver would read answers aloud.
4. **FS-040 widget as a board screen, not WidgetKit.** The board authors HTML; the widget screen is composed at the reference width with the same tokens, marked non-scrollable, non-interactive (tap target is the whole surface). Native sizing is a handoff note, not a board construct.
5. **FS-011 is verified, not built.** The Now Playing bar already ships inside `reader-mushaf.html`; its task reads the FS-011 doc against the shipped component (transport glyph, reference, progress, repeat indicator, hide-when-empty) and fixes drift only — no new file.
6. **FS-039 renders the sheet outcome, never a live StoreKit sheet.** The board cannot transact; the screen shows receipt state + restore action with FS-doc copy, flagged as the stated deviation like FS-038's tiers.
5. **Read-only screens render real content, not empty states.** 027/041/036 show populated figures (khatmah at a mid-juz position, 3–5 history entries, concrete stored/sent/requested facts) because FS specs require visiting to write nothing — an empty state would suggest the screen itself is the recorder.

## Risks / Trade-offs

- [Risk] Five screens stating values "matching siblings" (speed 0.75×, drill 1:1–1:7) drift when one screen re-renders → Mitigation: tasks pin the canonical values per wave; Wave A first so later waves copy from built files, not from memory.
- [Risk] New per-screen `<style>` blocks accumulate into a shadow system → Mitigation: each wave ends with a vocabulary review task; graduation to tokens.css needs a second consumer.
- [Risk] FS-038 pricing/entitlement copy is product truth the board cannot verify → Mitigation: render with clearly-marked placeholder tiers from the FS doc and flag as the one deviation in reporting.
- [Risk] 114-surah and 604-page lists (022/023 contexts) overflow the frame → Mitigation: `.nr-scroll` single-scroller pattern from AUTHORING §3; export height check per screen.

## Migration Plan

Additive only: new files under `project/noor/screens/` + optional token additions with dark twins. Rollback = delete the screen file (round-trips byte-identical per `delete-screen`). No migration, no flag.

## Open Questions

- FS-038's real tier prices and entitlement identifiers live outside the docs — render with FS-doc placeholders and confirm with the product owner before handoff (does not change specs, approach, or tasks).
