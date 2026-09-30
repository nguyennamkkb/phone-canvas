# Tasks

## 1. Docs hygiene (no code)

- [x] 1.1 Fix the stale "calo-ai keeps 5 core screens" note in `docs/screen-regions.md` to 3 and verify by reading the section back
- [x] 1.2 Add a tablet authoring recipe to the phone-canvas skill (`.agents/skills/phone-canvas/recipes/`) pointing at the spec map and verify the skill's recipe table lists it

## 2. Tablet round (presets + rules already exist)

- [x] 2.1 Draw one iPad sample screen (sidebar + 2-col split, `deviceId: ipad-11`) in a scratch project and verify it renders on the board
- [x] 2.2 Review → fix via `npm run export` PNG until it reads correctly (max ~3 rounds; stop and state blockers if still moving) and verify `npm run gate` is green
- [x] 2.3 Revise any `screen-regions` tablet requirement the sample proved wrong and verify the spec diff is minimal
- [x] 2.4 Generalize into a reusable format (`new-screen --kind` and/or shared components + skill recipe, with unit tests for any new code) and verify by scaffolding a second tablet screen from it that passes the gate untouched
- [x] 2.5 Verify the sample on the live board (mixed-size placement sane, expand toggle converges) and decide the scratch project's fate (promote or delete)

## 3. Watch round (no presets — decide sizes first)

- [x] 3.1 Decide Watch sizes/document path with the user and verify the decision is recorded in `design.md`
- [x] 3.2 Draw one sample Watch face, review → fix via export PNG, and verify `npm run gate` is green
- [x] 3.3 Extend lint/audit probes for the Watch surface only if the sample needs it (in place, no forked gate; with unit tests) and verify the sample on the live board
- [x] 3.4 Generalize into a reusable Watch format (with unit tests for any new code) and verify by starting a second face from it that passes the gate untouched

## 4. Widget round (no presets — decide families first)
- [x] 4.1 Decide Widget families/sizes/document path with the user and verify the decision is recorded in `design.md`
- [x] 4.2 Draw one sample widget, review → fix via export PNG, and verify `npm run gate` is green
- [x] 4.3 Extend lint/audit probes for the Widget surface only if the sample needs it (in place, no forked gate; with unit tests) and verify the sample on the live board
- [x] 4.4 Generalize into a reusable Widget format (with unit tests for any new code) and verify by starting a second widget from it that passes the gate untouched

## 5. Integration

- [x] 5.1 Run the full `npm run gate` across all projects and verify zero errors
- [x] 5.2 Update the phone-canvas skill (loop, recipes table, tooling) for the new formats and verify each new `--kind`/recipe is reachable from `SKILL.md`
- [x] 5.3 Remove scratch projects (or promote kept samples) and verify `git status` shows no stray screens
- [x] 5.4 Evaluate extracting a shared surface profile across the three rounds, record the decision in `design.md`, and verify the record names what repeated (or why nothing did)
