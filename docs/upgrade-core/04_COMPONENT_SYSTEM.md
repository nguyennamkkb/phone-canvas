# 04 — Component System

> Track 009 ARCH & DELIVERY · research-only · anchors to real code, no refactor proposed as code.

## 1. Where components live today (observed)

| Mechanism | File | Rule |
|---|---|---|
| Project components | `project/<id>/components/*.html`, id = filename stem, unique **within** project | `src/projects/derive.ts` (component lane), `src/projects/registry.ts:21-27` (glob) |
| Inclusion | `<!-- @component <id> -->` placeholder | `src/components/expand.ts:25` `PLACEHOLDER` |
| Expansion | Pure recursive string replace, `MAX_DEPTH=20`, missing/cycle/depth → error + placeholder left as comment | `src/components/expand.ts:34-74` `expandComponents` |
| Expansion order | Screen `data-slot` lifted **first**, then components expanded to fill only what the screen left open; tabs list-wise winner (screen wins whole list) | `src/extractor/compose.ts` (`composeScreenDoc`, bare vs shell path) |
| Usage stats | Per-project component usage counts | `src/components/usage.ts:52` `componentUsage` |
| Component lint | Refs, cycles | `scripts/components-lint.ts:31,40` (`refsIn`, `findCycles`) |
| Board dock | Component catalog preview (`bare` mode, no chrome) | `src/components/ComponentDock.tsx`, `compose.ts` `bare` option |

Key invariant to preserve: expansion is **pure and single-defined** — board and exporter call the same `composeScreenDoc`, so they cannot drift. Any future component system must keep one expansion function, not two.

## 2. Semantic levels

```text
Primitive → Pattern → Component → Section → Screen
```

| Level | Definition | Today | Example |
|---|---|---|---|
| **Primitive** | One HTML element + one CSS class, no layout opinion | Icon glyph (`.icon` + `data-symbol`), `.pill`, `.chip` | `<i class="icon" data-symbol="star.fill">` |
| **Pattern** | 2–5 primitives in a fixed arrangement, no slots | `.action-row`, `.stat-tile` internals | icon + label + chevron row |
| **Component** | Named file in `components/`, may carry `data-slot`/`data-tab` content, self-contained style via tokens only | `components/*.html` | `tab-chrome`, `stat-tile` |
| **Section** | Full-width band inside `.body`, owns its heading + content, never owns nav/tab/chrome | Screen fragment with `.section` | settings group, card list |
| **Screen** | `.screen` root + header `<!-- pc {...} -->` + exactly one `.body`/`.body-fixed` | `project/<id>/screens/*.html` | `home-today` |

Rules:

1. A lower level never references an upper level (component never includes a screen).
2. Only **Component** and above may declare `data-slot`/`data-tab` hosts; Primitive/Pattern never do (they are *content*, the shell lifts them).
3. A Component's style may use **only** tokens (`var(--*)`) + its own classes — no device px, enforced today by `deviceLiteralViolations` (`scripts/region-rules.ts`) and `subset-lint`.
4. Sections never declare bands the shell owns (`.region-nav/.region-tabs/.navbar/.tabbar/.dock` → `region-shell-owned` violation).

## 3. Anatomy template (11 items — required for every Component)

```markdown
# <Name> (`components/<id>.html`)
1. **Name** — kebab-case id = filename stem.
2. **Purpose** — one sentence: what job, for whom.
3. **Anatomy** — DOM skeleton with classes (copy-pasteable).
4. **Variants** — exhaustive list (e.g. `is-active`, `is-dark`); each variant is a class, never a fork.
5. **States** — default / pressed / disabled / loading / empty; which state is *unrepresentable* in static HTML (loading skeletons OK, pressed is not — reviewer checks).
6. **Tokens** — every `var(--*)` used, with fallback behavior when project overrides it.
7. **Allowed regions** — which bands may host it: nav-slot (back/title/right), tab list, `.body`, `.rail`, `.sidebar`, sheet. Anything else → `region-undeclared`.
8. **Platform adaptations** — per form factor (see §5): what changes on cover/inner/watch/widget, what is forbidden (e.g. no horizontal tab list on cover → `cover-horizontal-tabbar`).
9. **Interaction** — tap target size (≥44pt, `touch-floor` rule), what it does on tap (navigates? toggles? opens sheet?), backed by audit measurement not author claim.
10. **Accessibility** — label source (`aria-label` vs visible text vs `data-symbol` label), contrast pair, Dynamic-Type behavior (wraps? truncates?).
11. **Do / Don't + Examples** — one correct snippet, one incorrect snippet with the rule code it trips (e.g. `region-shell-owned`).
```

New components without all 11 items fail review (human gate, §09). The template lives as a file scaffold — extend `scripts/new-screen.ts`'s template approach, don't invent a second generator.

## 4. Core vs project ownership

| Belongs to **core** (`src/`, `scripts/`, shared CSS) | Belongs to **project** (`project/<id>/`) |
|---|---|
| Expansion engine (`expand.ts`), slot syntax (`slotNames`), shell bands (`.region-nav/.region-tabs`), chrome CSS | Component *files* and their markup |
| Region vocabulary (`.split/.pane/.rail/.sidebar`, `REGION_CLASSES`), shell-band ban list (`SHELL_BAND_CLASSES`) | Which components a screen uses, in what order |
| Touch floor (`--touch-min:44`, `TOUCH_CLASSES`), device-literal ban, off-switch discipline | Project tokens (`tokens.css` override layer), component visual skin |
| Lint/audit rules (`region-rules.ts`, `*-lint.ts`, `region-audit.ts`) | Exemptions (`lint-region: off` **with reason**) — project-scoped, never global |
| Icon pipeline (`scripts/icons.ts` inlining → data URI; `icon-set.css`) | `data-symbol`/`data-asset` *choices* per screen |
| Screen scaffold (`new-screen.ts` templates) | Screen content |

Decision rule: if two projects would copy-paste it, it is a core candidate; if it carries brand meaning (color philosophy, corner language), it stays in the project. Promotion project→core requires evidence from ≥2 projects + a lint rule that pins its contract (same bar as expertise promotion: propose with evidence, Lead decides).

## 5. Platform adaptations

Source of truth for form factors: `src/frame/devices.ts` (`form`: phone/tablet/cover/inner/watch/widget; `formFactorOf`, `formChip`).

| Form | Component constraints |
|---|---|
| phone | Full vocabulary. Tab list 3–5, labelled (`tabbar-too-many/unlabelled`). |
| tablet | Prefer `.sidebar`/`.split` over bottom tabs for ≥3 destinations; panes share width 50/50 on fold (`split balance` audit). |
| cover (narrow) | **No horizontal bottom tab bar** (`cover-horizontal-tabbar`); destinations → vertical `.rail-tabs`. Title <15 chars. Max 2 trailing actions. |
| inner (wide/short) | Two-pane `.split` default; nothing interactive on the crease (`division band` audit). |
| watch | Chrome is author-owned (static region rules stay silent by design); touch ≥44pt still audited by measurement; short interactions, large controls, scroll-first. |
| widget | Author-owned chrome; glanceable: one number + one label max per component; no interaction beyond tap-through. |

A component that cannot adapt declares `data-form-exclude="<form>"` (proposed, not implemented) — explicit exclusion beats silent breakage; the lint then fails any screen that hosts it on an excluded form.

## 6. What changes vs what stays

- **Stays:** `@component` syntax, pure expansion, single `composeScreenDoc`, screen-wins ordering, `bare` catalog preview.
- **Add (P1):** anatomy template as scaffold + review checklist; core/project ownership table as `docs/` policy; `data-form-exclude` + lint (small, additive).
- **Add (P2):** versioned component API (props via `data-*` attributes with defaults — needs a spec first); visual regression per component (golden PNG per `components/*.html` via export pipeline reuse).
- **Never:** a second expansion engine, a runtime JS component framework inside screens, props via JS evaluation in the iframe (breaks the pure/static-audit contract).
