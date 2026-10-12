# Proposal

## Why

Noor's reader root and bootstrap flow are built (12 screens), but the app has no way to choose a voice, keep audio offline, find a verse, save one, track a khatmah, memorise, configure itself, or sustain itself — the 16 remaining feature screens are the app beyond the reading room. Building them in dependency order (player companions first, commerce last) keeps every wave verifiable against something real instead of inventing transport, estimates, or entitlements from nothing.

## What Changes

- **Wave A — Audio companions (2 screens):** `FS-013` Reciter Picker (voice catalogue with riwaya, audition, per-reciter download state), `FS-016` Sleep Timer (interval selection, engaged-timer readout). Both push from the shipped FS-012 player.
- **Wave B — Offline (2 screens):** `FS-018` Downloads Overview (storage aggregate, per-reciter breakdown, reclamation), `FS-019` Select & Transfer (surah/reciter multi-select with size estimate stated against the FS-013-chosen reciter, paid-capability disclosure before commit).
- **Wave C — Discovery & Library (3 screens):** `FS-022` Search Query (entry + scope selector + recents), `FS-023` Search Results (ranked list with reference + snippet, refine-returns-query), `FS-025` Bookmarks List (saved verses with reference, snippet, note, colour).
- **Wave D — Progress (2 screens):** `FS-027` Khatmah (juz completion ring, current juz, days-active — read-only, visiting writes nothing), `FS-041` History (reverse-chronological reading positions, read-only).
- **Wave E — Memorization (2 screens):** `FS-028` Memorize Setup (range + cue-level config, begins nothing on exit), `FS-029` Memorize Session (concealed-text self-test with per-verse reveal, attempts recorded as they happen).
- **Wave F — Settings (3 screens):** `FS-031` Settings Root (grouped index, writes nothing), `FS-034` Appearance (theme + text size + Reduce Motion with live preview, applies on selection), `FS-036` Privacy Dashboard (stored / sent / requested, read-only, zero actions).
- **Wave G — Commerce + Widget (3 screens):** `FS-038` Subscription Plans (plan comparison, entitlement state, single-gesture dismissal), `FS-039` Purchase Confirmation (StoreKit sheet, receipt state, restore action — pushed from FS-038), `FS-040` Daily Verse Widget (glanceable surface, no nav stack, tap deep-links the reader).
- **Wave H — Player dead-end fillers + Word inspector (4 screens, all P0):** `FS-017` Queue Builder (continuous-play queue the player-full queue row opens), `FS-021` Output Route Picker (CarPlay/AirPlay/headphone routes the player-full output row opens), `FS-007` Word Inspector (tap-a-word transliteration/translation/root over FS-005), `FS-011` Now Playing Bar — already shipped as a component inside `reader-mushaf.html`; this task verifies it against its FS doc rather than building anew.
- **Wave I — Library refinements (3 screens):** `FS-026` Bookmark Editor (P0 — note, highlight colour, reference editing for one bookmark), `FS-020` Download Detail (P1 — per-transfer progress, retry, failure reason), `FS-024` Search Filters (P1 — surah scope + translation-language filters for FS-023).
- **Wave J — Settings completion + reference (7 screens):** `FS-032` Language (P0), `FS-033` Audio & Data (P0 — bitrate, data saver, cache), `FS-035` Notifications (P0), `FS-037` Sync (P0 — CloudKit toggle + storage state), `FS-044` Help & About (P1 — version, sources, rights), `FS-039` Purchase Confirmation (P0 — StoreKit sheet, receipt, restore; pushed from FS-038), `FS-030` Memorize Stats (P2 — attempts/reveals/time for a practice range).
- **Housekeeping:** tick the TODO-screens checkboxes for the three already-built-but-unticked screens (`FS-012`, `FS-014`, `FS-015`) after gate verification.

## Capabilities

### New Capabilities

- `noor/player-companions`: choosing a reciter voice and bounding a listening session with a timer — the two player sub-contexts every other audio screen assumes (FS-013, FS-016).
- `noor/offline-library`: owning device space for recitation audio — aggregate figures, per-reciter breakdown, selection with cost stated before commit (FS-018, FS-019).
- `noor/search`: entering a query and working a result set — the app's only text-find path (FS-022, FS-023).
- `noor/library`: the user's durable artefacts — saved verses with notes (FS-025).
- `noor/progress`: answering "how far" and "where was I" without writing on visit (FS-027, FS-041).
- `noor/memorization`: configuring and running a concealed-text recall session (FS-028, FS-029).
- `noor/settings`: one reachable configuration region plus appearance-with-preview and a read-only privacy statement (FS-031, FS-034, FS-036).
- `noor/sustain`: the paid-capability decision and the out-of-app glanceable entry (FS-038, FS-039, FS-040).
- `noor/player-routes`: the two player sub-contexts the shipped player-full rows already open — continuous-play queue and output routing (FS-017, FS-021).
- `noor/study`: tap-a-word inspection over the reader (FS-007).
- `noor/library-edit`: editing one saved bookmark (FS-026).
- `noor/offline-detail`: per-transfer progress, retry, failure reason (FS-020).
- `noor/search-filters`: surah scope + translation-language filters (FS-024).
- `noor/settings-complete`: the four remaining settings contexts — language, audio & data, notifications, sync (FS-032, FS-033, FS-035, FS-037).
- `noor/reference`: static help & about (FS-044) and memorize stats for a practice range (FS-030).

FS-042/043 are deferred per BRIEF-step4 and excluded. FS-011 ships as a component inside `reader-mushaf.html` and is verified, not built.

### Modified Capabilities

(none — `openspec/specs/` covers board infrastructure only; no existing requirement changes.)

## Impact

- **Adds:** 16 HTML screens under `project/noor/screens/`, possible 1–2 shared token/vocab additions in `project/noor/tokens.css` (timer chips, plan cards) with dark twins + contrast pairs in `verify_tokens.py`.
- **Touches:** `docs/Noor/TODO-screens.md` (checkbox ticks only, verified-never-assumed).
- **Does not touch:** board core (`src/`, `scripts/`), other projects, `openspec/specs/` main specs.
- **Gate per screen:** `npm run lint -- --screen <id>` zero errors, `npm run export` dimensions correct, PNG visually reviewed, `npm run gate` green before the checkbox ticks.
