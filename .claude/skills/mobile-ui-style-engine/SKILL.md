---
name: mobile-ui-style-engine
description: "Design-memory and visual-consistency skill for generating mobile HTML UI that belongs to an existing product style, especially when no direct reference screen exists. Use before creating or materially redesigning mobile screens. Extracts Design DNA, reuses component/composition grammar, creates a screen design contract, enforces style lock, detects AI-slop/style drift, and requires rendered visual QA before completion."
---

# Mobile UI Style Engine

## Mission

Generate **new mobile HTML screens that feel like the same product** even when there is no direct reference screen.

The core rule is:

> **STYLE stays stable. COMPOSITION may adapt.**

This skill is a design-memory and enforcement layer, not a generic "make it beautiful" prompt.

---

## Operating Principles

### 1. Extract before generating

WHEN the project contains existing screens, screenshots, CSS, or components:
- inspect them before inventing a new visual language;
- identify recurring tokens, component grammar, composition grammar, and signature motifs;
- record findings in the project's design memory.

DON'T:
- start coding a new screen immediately;
- infer style from a single component when multiple references exist;
- treat each screen as an independent design exercise.

BECAUSE:
- isolated generation causes style drift and inconsistent screen families.

### 2. Design memory is the source of truth

WHEN a project has no formal design system:
- create or update `design-system/MASTER.md`;
- use semantic tokens and rules, not only raw CSS values;
- preserve rationale where it explains an important choice.

DON'T:
- make the current prompt the only place where style exists;
- rely on model memory across turns;
- create a new visual language because the screen type is new.

### 3. Reuse before inventing

WHEN a new UI element is needed, follow this order:

1. Reuse an existing component.
2. Compose existing primitives.
3. Create a variant of an existing component.
4. Introduce a new component family only with explicit justification.

A new component family must not silently introduce a new radius, shadow, border, color family, typography scale, or interaction language.

### 4. Stable style, adaptive composition

Keep stable:
- color roles;
- typography family and hierarchy;
- spacing rhythm;
- geometry language;
- component grammar;
- icon language;
- surface/depth treatment;
- interaction affordance language;
- signature motifs.

Allow adaptation in:
- content hierarchy;
- section order;
- grid/list composition;
- focal point;
- density where task demands it;
- screen archetype;
- image ratio/cropping where appropriate.

DON'T copy the same page template and merely replace content.

### 5. Render before declaring success

WHEN the environment can render HTML:
- render at the target mobile viewport;
- inspect the actual result;
- compare it against the design memory and nearby screen references;
- repair visual drift;
- render again after meaningful fixes.

Functional correctness is not visual correctness.

---

# Standard Workflow

## Phase 0 — Decide whether the skill applies

Use this skill for:
- new mobile HTML screens;
- redesigns of existing screens;
- flows where visual consistency matters;
- projects with multiple screens/components;
- screens that have no direct reference but must fit an existing product.

Do not use it as the only skill for:
- backend implementation;
- arbitrary desktop websites;
- pure content editing.

---

## Phase 1 — Project reconnaissance

Inspect:
- existing HTML files;
- CSS files and CSS variables;
- reusable components/partials;
- icons/images and their treatment;
- screenshots/reference images;
- navigation patterns;
- modal/sheet patterns;
- existing design-system files.

Prioritize representative screens:
- home/dashboard;
- content-heavy screen;
- settings/profile;
- primary creation/action flow;
- paywall or monetization screen when present.

Output internally:

```text
PROJECT VISUAL INVENTORY
- Screens inspected:
- Shared CSS/tokens found:
- Reusable components found:
- Distinct screen families:
- Strong recurring motifs:
- Known inconsistencies:
- Unknowns requiring conservative decisions:
```

If the project already has `design-system/MASTER.md`, treat it as authoritative but verify it against the current implementation. Update stale rules before using them for a new screen.

---

# Phase 2 — Extract Design DNA

Create or update:

```text
design-system/
├── MASTER.md
├── COMPONENTS.md
├── PATTERNS.md
└── anti-patterns.md
```

## MASTER.md must capture

### Identity
- product personality;
- emotional tone;
- visual era/reference direction;
- density: airy / balanced / dense;
- degree of ornamentation;
- editorial vs utility vs playful vs technical character.

### Color
Record semantic roles rather than only hex values:

```text
background
surface-primary
surface-secondary
surface-elevated
text-primary
text-secondary
text-tertiary
border-subtle
accent
accent-pressed
success
warning
error
```

Also document:
- where accent is allowed;
- maximum contrast/saturation behavior;
- light/dark relationships if applicable;
- colors that are intentionally NOT used.

### Typography
Record:
- font families;
- weights;
- display/title/body/caption scale;
- line-height rules;
- letter spacing where relevant;
- alignment preferences;
- truncation/wrapping behavior.

### Geometry
Record:
- spacing scale;
- page gutters;
- section gaps;
- common control heights;
- corner-radius families;
- border thickness;
- divider behavior;
- max content width if applicable.

### Depth and surfaces
Describe:
- flat vs tonal hierarchy;
- border vs shadow usage;
- shadow recipes;
- blur/glass treatment;
- image overlays;
- elevation hierarchy.

### Components
For each reusable family:
- purpose;
- anatomy;
- variants;
- states;
- allowed sizing;
- forbidden deviations.

### Composition grammar
Document recurring patterns such as:
- header structure;
- hero treatment;
- section title rhythm;
- list rhythm;
- grid rhythm;
- CTA placement;
- sticky controls;
- bottom navigation;
- sheet/modal composition.

### Signature motifs
Capture 3–8 highly recognizable recurring traits. Examples:

```text
- oversized editorial title
- asymmetrical image crops
- tinted secondary surfaces
- compact rounded controls
- icon-inset inside circular soft surfaces
```

Signature motifs should be used deliberately, not on every component.

### Anti-patterns
Explicitly list project-specific visual mistakes.

---

# Phase 3 — Classify the new screen

Before coding, identify the screen archetype:

```text
landing / dashboard
browse / discovery
list / feed
search / results
detail
creation / editor
selection / picker
settings / preferences
profile
empty state
onboarding
paywall / monetization
modal / sheet
success / completion
error / recovery
```

Then identify:
- primary user goal;
- primary content hierarchy;
- primary action;
- secondary actions;
- state complexity;
- likely scroll behavior;
- likely information density.

The archetype determines composition. The Design DNA determines visual language.

---

# Phase 4 — Create a Screen Design Contract

Do this before generating the final HTML.

Template:

```markdown
# Screen Design Contract

## Purpose
[What the user is trying to accomplish]

## Archetype
[screen archetype]

## Style inheritance
- Typography: [MASTER rules]
- Color: [MASTER rules]
- Geometry: [MASTER rules]
- Surfaces: [MASTER rules]
- Components: [reused families]
- Signature motifs: [1–3 relevant motifs]

## Composition
- Primary focal point:
- Header/navigation:
- Main content structure:
- Primary CTA:
- Secondary actions:
- Bottom/sticky behavior:
- Scroll behavior:

## Allowed novelty
- [new composition pattern only if needed]
- [new content arrangement only if justified]

## Forbidden novelty
- new color family
- new typography family
- new radius family
- unrelated shadow language
- duplicate component family
- generic gradient/pill/card treatment without product precedent

## States
- loading
- empty
- populated
- error
- disabled
- pressed/selected, where applicable
```

If there is no direct reference screen, explicitly state which existing screens/patterns are being used as the closest style anchors.

---

# Phase 5 — Generate HTML

## HTML/CSS rules

Prefer:
- CSS variables for semantic tokens;
- reusable classes/components;
- predictable DOM structure;
- mobile-first responsive CSS;
- safe-area awareness where relevant;
- accessible semantic elements;
- explicit states;
- content-driven sizing rather than arbitrary fixed heights.

Keep visual values centralized.

Example:

```css
:root {
  --color-bg: ...;
  --color-surface: ...;
  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-accent: ...;

  --space-1: ...;
  --space-2: ...;
  --space-3: ...;
  --space-4: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;

  --shadow-surface: ...;
}
```

Do not scatter arbitrary literals through the screen when an existing token applies.

---

# Phase 6 — Style Lock / Drift Audit

After implementation, inspect the HTML/CSS for unauthorized visual decisions.

## Hard drift checks

Flag:
- colors outside semantic palette without justification;
- new font family;
- new arbitrary font sizes;
- new arbitrary spacing values that break the project scale;
- new radius values outside the geometry system;
- new shadows with a different visual character;
- excessive borders;
- new gradient family without precedent;
- duplicated component families;
- new icon style inconsistent with existing icons;
- inconsistent control heights;
- inconsistent page gutters;
- inconsistent navigation patterns.

## Soft drift checks

Ask:
- Does hierarchy feel expressed in the same way?
- Does whitespace have the same rhythm?
- Is density comparable for the same task class?
- Does the same product personality come through?
- Are signature motifs used coherently?
- Is this visually related without becoming a copy?

---

# Phase 7 — Anti-AI-Slop Audit

Reject or repair patterns such as:

```text
- generic purple/blue SaaS styling without product reason
- arbitrary gradients
- card-inside-card nesting without hierarchy purpose
- excessive pill controls
- identical corner radii on every element
- excessive soft shadows
- random glassmorphism
- decorative icons with no semantic purpose
- tiny eyebrow labels added everywhere
- centered everything
- giant headings with weak content hierarchy
- repeated identical content sections
- large empty space used instead of composition
- meaningless badges
- inconsistent icon metaphors
- one-off colors
- one-off illustration styles
- copying the same page skeleton for every screen
```

Important:

> Not every rounded card or gradient is bad. It becomes a failure when it is unsupported by the product's visual grammar or used as a generic AI default.

---

# Phase 8 — Render and Visual QA

Render at realistic mobile dimensions, ideally at least:

```text
375 × 812
390 × 844
430 × 932
```

Also test landscape/iPad only when the product supports it.

Review in this order:

1. Silhouette and composition.
2. Visual hierarchy.
3. Spacing rhythm.
4. Typography.
5. Color and surface hierarchy.
6. Component consistency.
7. States and interaction affordances.
8. Accessibility/readability.
9. Anti-slop/style drift.

Prefer comparing screenshots side-by-side with the closest existing screen family.

When a visual mismatch is found, fix the **systemic cause** before patching the individual element.

Example:

BAD:
```text
"This card feels too round" → change one card from 20px to 16px.
```

BETTER:
```text
The screen introduced a radius outside the project's geometry family.
Reuse --radius-md and verify other components using the same family.
```

---

# Phase 9 — Final Consistency Gate

Do not declare the screen complete until all are true:

```text
[ ] Screen purpose is clear.
[ ] Screen archetype is identified.
[ ] Design DNA was consulted.
[ ] Existing components were reused where applicable.
[ ] No unexplained new visual family was introduced.
[ ] Composition is appropriate to the task.
[ ] Visual hierarchy is intentional.
[ ] Mobile spacing/gutters are coherent.
[ ] Typography follows the system.
[ ] Color roles follow the system.
[ ] States are represented where needed.
[ ] No obvious AI-slop patterns remain.
[ ] Actual rendered HTML was reviewed.
[ ] Major visual drift was repaired.
```

---

# Rules for No-Reference Screens

This is the most important operating mode.

WHEN no direct reference exists:

```text
1. Read MASTER.md.
2. Identify the closest screen archetype.
3. Inspect 2–3 related existing screens.
4. Reuse their visual grammar, not their exact layout.
5. Build a Screen Design Contract.
6. Generate a composition appropriate to the new content.
7. Run Style Lock + Anti-Slop Audit.
8. Render and compare with the product's visual language.
```

DON'T:

```text
No reference
→ model creativity
→ generic UI template
```

Instead:

```text
No reference
→ design memory
→ related patterns
→ existing component grammar
→ content-driven composition
→ new screen
```

---

# Handling Existing Inconsistency

Real projects may already contain inconsistent screens.

Do not blindly copy the most recent screen.

Instead classify references as:

```text
canonical
acceptable
legacy
outlier
```

Prefer patterns repeated across multiple high-quality screens.

When two patterns conflict:
- prefer the one used by more canonical screens;
- prefer the one represented in the design system;
- avoid expanding the inconsistency;
- record unresolved ambiguity instead of inventing a third pattern.

---

# Decision Heuristics

### New component vs variant

Use a variant when:
- anatomy is the same;
- interaction model is the same;
- semantic purpose is similar.

Create a new family only when:
- the information hierarchy is materially different;
- reuse would harm usability;
- the component cannot be composed reasonably from existing primitives;
- the visual treatment can still inherit the same Design DNA.

### New color

A new color is allowed only when:
- it has a semantic/product reason;
- existing roles cannot express the state;
- it is recorded in the design system.

### New radius

A new radius is allowed only when:
- geometry requires a distinct semantic family;
- existing radius tokens cannot preserve the intended hierarchy.

### New illustration/icon style

A new visual asset style should be treated as a product-level decision, not a screen-level improvisation.

---

# Output Expectations

When asked to create a screen, the agent should normally produce:

```text
1. Brief Screen Design Contract.
2. Implementation.
3. Visual QA findings.
4. Final corrections.
5. One concise note describing any intentional deviation from the Design DNA.
```

Do not write a long design essay before implementation. The design contract should be compact and actionable.

---

# Progressive Disclosure

Keep `SKILL.md` as the operating layer.

Read supporting references only when needed:

- `references/design-dna.md` → extracting or reviewing a design system;
- `references/component-grammar.md` → defining/reusing components;
- `references/composition-grammar.md` → designing a screen with no direct reference;
- `references/visual-qa.md` → screenshot/render review;
- `references/anti-patterns.md` → anti-AI-slop audit;
- `references/style-extraction.md` → bootstrap from screenshots/existing HTML.
