# 06 — Project Workflow (Research → Freeze, 15 steps)

> Track 009 · each step: Input / Owner / Tool / Output / Gate / Next. Tools are real scripts that exist today unless marked **(proposed)**.

## Step table

| # | Step | Input | Owner | Tool | Output | Gate | Next |
|---|---|---|---|---|---|---|---|
| 1 | **Research** | App idea, competitor screens | Research agent | webbridge snapshot, `docs/CaloAI` precedent | `research.md` (users, tasks, platform norms) | Human: problem worth solving? | 2 |
| 2 | **Product Definition** | `research.md` | Product/UX agent | product brief template **(proposed)** | `product.md` (JTBD, scope in/out, success metric) | Human: scope frozen? | 3 |
| 3 | **Information Architecture** | `product.md` | Product/UX agent | IA map (screens × destinations) | `ia.md` (screen list, tab set, nav depths) | Structural: ≤5 tabs, push depth ≤3 | 4 |
| 4 | **Platform Strategy** | `ia.md` | Product/UX agent | `src/frame/devices.ts` (`formFactorOf`), §5 table in `04_COMPONENT_SYSTEM.md` | `platform.md` (per-screen form + adaptations) | Human: which forms V1? | 5 |
| 5 | **Design DNA** | `platform.md`, references | Designer agent | `05_DESIGN_DNA.md` (other track) | `design-dna.md` (10 axes: visual/typo/color/surface/corner/spacing/icon/motion/density/interaction) | Human: DNA approved? | 6 |
| 6 | **Token Setup** | `design-dna.md` | Designer agent | `project/tokens.css`, `npm run lint:tokens` (`scripts/tokens-lint.ts`) | `project/<id>/tokens.css` (light + `:root[data-theme=dark]`) | Auto-block: tokens-lint clean | 7 |
| 7 | **Component Setup** | DNA + `04` anatomy template | Designer agent | `components/*.html`, `npm run lint:components` | components with 11-item anatomy in file header comment | Auto-block: components-lint (refs, cycles); human: anatomy review | 8 |
| 8 | **Region Setup** | IA + platform.md | Designer agent | `data-slot`/`data-tab` hosts, `npm run lint:regions` | screen skeletons (slots + `.body`, no content) | Auto-block: region-lint static | 9 |
| 9 | **Screen Planning** | skeletons | Designer agent | `npm run new-screen`-style scaffold (exists: `scripts/new-screen.ts`) | per-screen plan (sections list, components per section) | Structural: one `.body`, slot values known | 10 |
| 10 | **UI Construction** | screen plan + components + tokens | Designer agent | screen HTML authoring, board preview (`BoardView.tsx`), `ComponentDock.tsx` | `project/<id>/screens/*.html` | Per-section build (never whole-screen-then-check; see §08 loop) | 11 |
| 11 | **Validation** | built screens | QA agent | `npm run lint` (tokens+subset+components+regions) + `npm run audit:regions` (measured, Chrome CDP) | violation list with `file:line` + fix | Auto-block: `npm run gate` green | 12 |
| 12 | **Review** | green gate + board | Reviewer agent + human | visual board review, `npm run export` PNGs, `scripts/locate.ts` | review notes (rule codes or `CHALLENGE`) | Human: approve or request changes | 13 |
| 13 | **Fix** | review notes | Designer agent | same as 10, scoped to notes only | amended screens | Changed screens re-run step 11 (old evidence expires) | 12/14 |
| 14 | **Golden Approval** | reviewed screens | Human + Reviewer | `npm run export --scale 3` → `output/` golden PNGs, versioned | golden set + `GOLDEN.md` record (screen, device, export hash) | Human sign-off per screen | 15 |
| 15 | **Freeze** | golden set | Core/Platform agent | `scan:projects` clean, board saved (`loadBoard/saveBoard` localStorage per project), tag | frozen `project/<id>/` + golden PNGs; change requires new task | Regression: any later diff vs golden must explain itself | (new task) |

## Loop discipline (binds to §08 agent workflow)

- Steps 10→11→12→13 are the **inner loop**; steps 1→5 are the **outer loop** (redoing DNA invalidates tokens/components/screens — expensive, hence human gates at 2/4/5).
- Never skip forward: a screen built before its Region Setup (step 8) will trip `region-undeclared`/`region-shell-owned` — the gate catches it, but the rework is the author's fault, logged as process violation.
- Evidence from step 11 is per-run and expires on edit (same rule as engineer handback: candidate changed after review → re-verify).

## Operating notes

- `npm run gate` = `lint` + `audit:regions` + `vitest` — the single command QA runs; any red is BLOCKED, no warn mode (precedent: `scripts/region-lint.ts` header — "a rule that only warns is a rule nobody has to satisfy").
- Chrome-missing → audit prints loud SKIPPED + exit 0 (precedent in `scripts/region-audit.ts` header); QA must note `NOT TESTED (measured)` in that case, never claim PASS.
- Board persistence is per-project localStorage (`BoardView.tsx:109,257`); Freeze must additionally commit the board JSON to the repo (proposed: `project/<id>/board.json` export) so goldens survive machine changes.
