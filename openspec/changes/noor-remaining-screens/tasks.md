# Tasks — noor-remaining-screens

Each screen task runs the full AUTHORING.md loop (inspect FS + wireframe → model → compose empty → fill → lint → export → read PNG → repair ≤3 rounds → hand off) and is done only when `npm run lint -- --screen <id>` is zero-error, the export is device-height, the PNG has been read, and deviations are stated. Canonical session values: speed `0.75×`, drill `1:1–1:7 · 5 reps · 0 s gap`, reciter Mishary Rashid Alafasy, sample verse 2:255.

## 1. Housekeeping (verify before building on it)

- [x] 1.1 Verify FS-012 (`player-full.html`), FS-014 (`repeat-controls.html`), FS-015 (`speed-control.html`) pass `npm run lint -- --screen <id>` and tick their three TODO-screens checkboxes only after `npm run gate` is green
- [x] 1.2 Vocabulary review of the audio family (`nr-transport`, `nr-seek`, `nr-stepper`, `nr-setting`) and record the canonical session values above as the copy source for Waves A–B

## 2. Wave A — Player companions (unblocks Offline estimates)

- [x] 2.1 Build FS-013 Reciter Picker (`reciter-picker.html`): full voice catalogue rows with riwaya + per-reciter download state, audition-against-current-passage, dismiss-restores-voice; verify lint clean + export + PNG read + gate green, then tick TODO
- [x] 2.2 Build FS-016 Sleep Timer (`sleep-timer.html`): fixed interval chips + off, engaged-timer readout, timer survives dismissal; verify lint clean + export + PNG read + gate green, then tick TODO

## 3. Wave B — Offline (needs the FS-013-chosen reciter)

- [x] 3.1 Build FS-018 Downloads Overview (`downloads-overview.html`): storage aggregate, per-reciter breakdown, per-entry reclamation, back changes nothing; verify lint clean + export + PNG read + gate green, then tick TODO
- [x] 3.2 Build FS-019 Select & Transfer (`downloads-select.html`): surah multi-select for one reciter, size estimate stated against that reciter, paid-capability disclosure before commit, dismissal starts nothing; verify lint clean + export + PNG read + gate green, then tick TODO

## 4. Wave C — Discovery & Library

- [x] 4.1 Build FS-022 Search Query (`search-query.html`): one-gesture entry affordance, scope selector, recent queries, query returned to caller on exit; verify lint clean + export + PNG read + gate green, then tick TODO
- [x] 4.2 Build FS-023 Search Results (`search-results.html`): ranked rows with reference + snippet, refine-returns-query-and-scope, explicit empty state; verify lint clean + export + PNG read + gate green, then tick TODO
- [x] 4.3 Build FS-025 Bookmarks List (`bookmarks-list.html`): saved verses with reference + snippet + note + colour, visit side-effect free; verify lint clean + export + PNG read + gate green, then tick TODO

## 5. Wave D — Progress (read-only; visiting writes nothing)

- [x] 5.1 Build FS-027 Khatmah (`progress-khatmah.html`): juz completion ring (linear brass track, no SVG arc), current juz, days-active, populated mid-juz figures; verify lint clean + export + PNG read + gate green, then tick TODO
- [x] 5.2 Build FS-041 History (`history-recent.html`): reverse-chronological positions (3–5 entries), tap resumes exact offset, visit leaves no trace; verify lint clean + export + PNG read + gate green, then tick TODO

## 6. Wave E — Memorization

- [x] 6.1 Build FS-028 Memorize Setup (`memorize-setup.html`): range + cue-level config, leaving begins no session; verify lint clean + export + PNG read + gate green, then tick TODO
- [x] 6.2 Build FS-029 Memorize Session (`memorize-session.html`): concealed text as brass-dot placeholders (never transparent real text), per-verse reveal, attempts recorded live, mid-reveal back disabled; verify lint clean + export + PNG read + gate green, then tick TODO

## 7. Wave F — Settings

- [ ] 7.1 Build FS-031 Settings Root (`settings-root.html`): grouped index of all eight config/disclosure contexts, writes nothing; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 7.2 Build FS-034 Appearance (`settings-appearance.html`): theme + text size + Reduce Motion with live reader preview, applies on selection; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 7.3 Build FS-036 Privacy Dashboard (`privacy-dashboard.html`): stored / sent / requested facts, zero actions; verify lint clean + export + PNG read + gate green, then tick TODO

## 8. Wave G — Commerce + Widget (last: F9 gate + out-of-app surface)

- [ ] 8.1 Build FS-038 Subscription Plans (`subscription-plans.html`): plan comparison with FS-doc placeholder tiers (flagged as the stated deviation), entitlement state, restore path, single-gesture dismissal; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 8.2 Build FS-039 Purchase Confirmation (`purchase-confirmation.html`): StoreKit outcome, receipt state, restore action — pushed from FS-038, buys nothing itself; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 8.3 Build FS-040 Daily Verse Widget (`daily-verse-widget.html`): glanceable verse at reference width, non-scrollable, whole-surface tap deep-links the reader; verify lint clean + export + PNG read + gate green, then tick TODO

## 9. Wave H — Player dead-end fillers + Word inspector (all P0)

- [ ] 9.1 Build FS-017 Queue Builder (`queue-builder.html`): continuous-play queue across surahs/reciters, reorder + removal, empty state disables next with reason; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 9.2 Build FS-021 Output Route Picker (`output-route.html`): speaker/headphones/AirPlay/CarPlay rows, applies on selection, dismiss keeps playback; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 9.3 Build FS-007 Word Inspector (`word-inspector.html`): tapped word's transliteration + translation + root over the reader passage, dismiss restores offset; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 9.4 Verify FS-011 Now Playing Bar against `reader-mushaf.html`'s shipped component (transport, reference, progress, repeat indicator, hide-when-empty) and fix drift only — no new file; verify gate green, then tick TODO

## 10. Wave I — Library refinements

- [ ] 10.1 Build FS-026 Bookmark Editor (`bookmark-editor.html`, P0): one bookmark's note + highlight colour + reference, exit-without-save changes nothing; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 10.2 Build FS-020 Download Detail (`download-detail.html`, P1): one transfer's progress + failure reason + retry in place, back never cancels silently; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 10.3 Build FS-024 Search Filters (`search-filters.html`, P1): surah scope + translation language, applied pair visible on results, re-run explicit; verify lint clean + export + PNG read + gate green, then tick TODO

## 11. Wave J — Settings completion + reference

- [ ] 11.1 Build FS-032 Language (`settings-language.html`, P0): app language + default translation, saved content untouched; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 11.2 Build FS-033 Audio & Data (`settings-audio-data.html`, P0): bitrate + data saver (real bound, not a label) + cache size; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 11.3 Build FS-035 Notifications (`settings-notifications.html`, P0): enable/disable + one daily-reminder time, off-means-off; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 11.4 Build FS-037 Sync (`settings-sync.html`, P0): CloudKit toggle + storage state, disabling freezes cloud and keeps local; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 11.5 Build FS-044 Help & About (`help-about.html`, P1): version, sources, rights, support, privacy-policy location, zero actions; verify lint clean + export + PNG read + gate green, then tick TODO
- [ ] 11.6 Build FS-030 Memorize Stats (`memorize-stats.html`, P2): attempts + reveals + time for one practice range, records nothing itself; verify lint clean + export + PNG read + gate green, then tick TODO

## 12. Wave close-out

- [ ] 12.1 Vocabulary review: graduate any per-screen `<style>` reused by ≥2 screens into `tokens.css` with dark twins, add contrast pairs to `verify_tokens.py`, and verify `python3 docs/Noor/references/verify_tokens.py` reports 0 failures
- [ ] 12.2 Full verification: `npm run gate` green (lint + audit:regions + vitest), `docs/Noor/TODO-screens.md` extended with Waves H–J ticked file-backed (28 → 42 shipped screens; FS-011 verified in place), and run `openspec validate --change noor-remaining-screens` clean
