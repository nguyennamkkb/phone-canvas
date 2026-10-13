---
name: surface-background-design-skill
description: "Semantic surface, background treatment, depth/elevation, and anti-AI-slop QA for mobile HTML components. Use when a component looks flat, generic, overly card-based, or disconnected from the product."
---

# Surface & Background Design Skill

## Purpose

Use this skill when designing or improving mobile UI components in HTML/CSS and the component looks flat, generic, overly card-based, or visually disconnected from the product.

The skill teaches the agent to treat a component background as a **surface system**, not as a single `background-color` property.

The objective is:

> Make each component feel like it belongs to the same product while allowing different surface treatments and composition patterns.

The skill applies to:

- mobile HTML prototypes
- web-based mobile mockups
- component libraries
- design-system implementation
- screen redesigns
- existing UI refinement
- new screens with no direct visual reference

---

## Core Mental Model

Never think only in terms of:

```css
background: #ffffff;
```

Think in layers:

```text
Screen Canvas
    ↓
Section Context
    ↓
Surface
    ↓
Depth / Elevation
    ↓
Background Treatment
    ↓
Decorative Layer
    ↓
Content / Controls
```

Not every component needs every layer.

The correct design uses the **minimum number of layers necessary to establish hierarchy, meaning, and visual personality**.

---

# Operating Rules

## Rule 1 — Surface Before Decoration

WHEN a component feels visually weak:

DO:

1. inspect hierarchy
2. inspect surface contrast
3. inspect spacing
4. inspect typography
5. only then consider decoration

DON'T immediately add gradients, blobs, shadows, or illustrations.

BECAUSE decoration cannot repair weak hierarchy.

---

## Rule 2 — Do Not Turn Everything Into a Card

WHEN content can be separated using spacing or tonal contrast:

DO use:

- whitespace
- section rhythm
- tonal shifts
- dividers
- alignment

DON'T create a rounded card by default.

BECAUSE repeated cards flatten the composition and create generic AI-generated UI.

---

## Rule 3 — Stable Style, Adaptive Composition

Keep these stable across the product:

- surface palette
- semantic color roles
- radius language
- border language
- elevation language
- typography
- treatment motifs

Allow these to change according to content:

- section composition
- surface size
- layout direction
- media placement
- focal point
- density
- grouping strategy

```text
STYLE = STABLE
COMPOSITION = ADAPTIVE
```

---

## Rule 4 — Every Surface Needs a Reason

Before assigning a surface, ask:

```text
Why is this content separated?
Why does it need a surface?
Why this tone?
Why this level of elevation?
Why this treatment?
```

The answer must be one or more of:

- grouping
- interaction
- emphasis
- semantic state
- hierarchy
- focus
- navigation
- readability
- brand expression

If there is no reason, remove the surface.

---

# Surface Hierarchy

A product should have a small semantic surface vocabulary.

Recommended conceptual levels:

```text
page
section
primary
secondary
control
selected
elevated
inverse
```

Example CSS variables:

```css
:root {
  --surface-page: ...;
  --surface-section: ...;
  --surface-primary: ...;
  --surface-secondary: ...;
  --surface-control: ...;
  --surface-selected: ...;
  --surface-elevated: ...;
  --surface-inverse: ...;
}
```

Do not invent component-specific colors unless there is a documented semantic reason.

### Surface hierarchy should be perceptual

Two surfaces can differ through:

- luminance
- saturation
- warmth/coolness
- transparency
- texture
- elevation
- border treatment

They do not need to differ by introducing a completely new color.

---

# Surface Decision Matrix

Use this decision sequence for every major component.

## Level 0 — No Surface

Use when whitespace and typography already provide sufficient grouping.

Good for:

- editorial text
- section headings
- simple information blocks
- hero copy
- lightweight utility content

```text
Canvas
  title
  body
  action
```

---

## Level 1 — Tonal Surface

Use when content needs gentle grouping without looking like a card.

Examples:

- tinted section
- subtle off-white panel
- light semantic background

Best for:

- supporting information
- grouped content
- low-priority statistics
- secondary sections

---

## Level 2 — Primary Surface

Use when content behaves as a meaningful unit.

Examples:

- mood check-in
- primary settings group
- dashboard module
- interactive collection

Typical properties:

```text
solid/tonal background
medium radius
controlled padding
optional subtle border
minimal elevation
```

---

## Level 3 — Elevated Surface

Use only when the element must visually sit above surrounding content.

Examples:

- floating action
- bottom sheet
- popup
- important temporary panel

Typical properties:

```text
stronger contrast
larger elevation
possibly blur/translucency
```

Do not use this treatment for every card.

---

## Level 4 — Decorative / Image-Led Surface

Use when visual expression itself is part of the component's purpose.

Examples:

- hero story
- promotional module
- inspiration card
- visual result
- onboarding feature

Allowed treatments depend on Design DNA:

- image crop
- gradient
- ambient glow
- organic shape
- texture
- illustration
- color field

The treatment must support content rather than compete with it.

---

# Background Treatment System

Treat background treatments as a controlled vocabulary.

Recommended categories:

```text
1. Solid
2. Tonal
3. Gradient
4. Ambient
5. Image-led
6. Texture
7. Organic / geometric motif
8. Glass / translucent
```

Do not use all categories in a single screen.

Prefer 1–3 dominant treatment families for a product.

---

## Solid

Use for:

- stable surfaces
- dense information
- controls
- accessible text regions

Avoid creating a visually empty result by using many identical white surfaces.

---

## Tonal

Use small changes in tone to create grouping without explicit boundaries.

Example:

```css
.section {
  background: var(--surface-secondary);
}
```

Preferred when the product aesthetic is soft, editorial, calm, or minimal.

---

## Gradient

Gradient must have a job.

Valid jobs:

- direct attention
- separate foreground from background
- establish brand atmosphere
- support an image or hero
- create depth

Invalid reason:

> “It looks more modern.”

Avoid generic blue/purple SaaS gradients unless they are explicitly part of the product DNA.

Prefer:

- restrained angle
- limited stops
- controlled opacity
- semantic colors

---

## Ambient Layer

An ambient layer is a visual field that sits behind content.

Examples:

- blurred color field
- radial glow
- oversized soft shape
- low-opacity light

Use:

```css
background:
  radial-gradient(...),
  var(--surface-primary);
```

The ambient layer should become quieter toward text-heavy areas.

---

## Image-Led Surface

Use an image as part of the component composition, not merely as decoration.

Consider:

- crop
- focal point
- text legibility
- overlay
- contrast
- safe areas

Text should never depend on an image being visually calm unless the treatment explicitly guarantees readability.

---

## Texture

Texture can add materiality and reduce synthetic flatness.

Use extremely subtle texture unless the product deliberately has a tactile or illustrative aesthetic.

Avoid random noise that makes the UI look low quality.

---

## Organic / Geometric Motif

Motifs should come from the product's visual identity.

Examples:

- circles
- arcs
- waves
- organic blobs
- grid lines
- dots
- hand-drawn shapes
- branded geometry

Use them consistently enough that the user can recognize the product language.

---

## Glass / Translucency

Use only when it belongs to the product visual language and the background underneath is meaningful.

Do not add blur merely because translucent UI is fashionable.

Maintain readable contrast and avoid excessive stacking:

```text
glass
  → glass
    → glass
```

is usually a failure mode.

---

# Depth / Elevation

Depth is a semantic system.

Recommended conceptual levels:

```text
flat
subtle
raised
floating
overlay
```

Elevation can be communicated by:

- tonal contrast
- shadow
- border
- translucency
- overlap
- scale

Do not communicate every level with a shadow.

### Shadow rules

Use fewer shadows than the model's default instinct.

Good:

```css
box-shadow: 0 10px 28px rgba(...);
```

only when the component should appear raised.

Bad:

```text
page shadow
card shadow
inner-card shadow
button shadow
icon shadow
```

all at once.

---

# Border Rules

Borders are not decoration by default.

Use them when they communicate:

- containment
- separation
- focus
- selection
- input boundary
- state

When a border is not needed, test whether tonal contrast or spacing is enough.

Recommended hierarchy:

```text
No border
→ subtle border
→ state border
→ strong structural border
```

---

# Radius System

A product should use a small radius vocabulary.

Example:

```css
--radius-sm
--radius-md
--radius-lg
--radius-xl
--radius-pill
```

Do not invent new values per component.

More important than the exact pixel value is consistency of shape language.

### Avoid the AI-card signature

Do not automatically apply:

```text
border-radius: 24px
```

to every container.

Different object categories may need different geometry.

---

# Background Composition

A strong component may have multiple background layers.

Example:

```text
┌─────────────────────────────┐
│ ambient / decorative layer  │
│        ○                    │
│                             │
│  content                    │
│                             │
│  control                    │
└─────────────────────────────┘
```

The agent should think in layers:

```text
Base
  ↓
Context
  ↓
Atmosphere
  ↓
Surface
  ↓
Content
  ↓
State
```

Not every layer must exist.

---

# Component Families

Use surface strategies according to component type.

## Hero

Preferred:

- large surface or no surface
- ambient/image treatment
- strong focal point
- asymmetric composition when appropriate
- restrained controls

Avoid:

- generic card + title + subtitle + button

---

## Metric / Statistic

Preferred:

- tonal surface
- one dominant number
- small supporting metadata
- optional micro-visualization

Avoid:

- excessive chrome

---

## List

Preferred:

- one grouped surface
- dividers or tonal row states
- compact icon treatment

Avoid:

- separate card for every row

---

## Input / Control

Preferred:

- dedicated control surface
- clear state system
- subtle geometry

Avoid:

- decorative background that weakens affordance

---

## CTA / Floating Action

Preferred:

- elevated surface
- high contrast
- deliberate placement

Avoid:

- using floating treatment for ordinary actions

---

## Informational / Empty State

Preferred:

- editorial or tonal composition
- illustration only when meaningful
- generous whitespace

Avoid:

- centered icon + card + generic button template

---

# Anti-AI-Slop Rules

Flag a design for review when it contains any of these patterns without explicit justification:

- every content block is a card
- every card is white
- every card has a shadow
- every card has the same radius
- nested cards with no hierarchy
- random gradients
- generic blue/purple glow
- decorative blobs unrelated to the brand
- excessive glassmorphism
- excessive pills
- every surface has a border
- every section has a container
- background decoration competes with primary content
- a new color is introduced for one component only
- a new radius is introduced for one component only
- decorative elements have no semantic or compositional purpose

---

# Style Drift Audit

After implementation, audit the HTML/CSS against the existing design system.

Check:

### Surface

- Does the component use an existing semantic surface?
- Is the contrast appropriate for its hierarchy?
- Is the surface necessary?

### Geometry

- Radius matches system?
- Padding matches spacing scale?
- Control dimensions match?

### Depth

- Is elevation semantically justified?
- Is the shadow language consistent?

### Background Treatment

- Is the gradient/image/ambient layer from an existing visual vocabulary?
- Does it strengthen hierarchy?
- Does it reduce readability?

### Composition

- Does this component feel like the same product?
- Does it avoid blindly copying another component?

### AI Slop

- Does it introduce generic visual tropes?
- Does it add decoration merely to appear sophisticated?

---

# Workflow

## WHEN refining an existing component

DO:

```text
Inspect existing screen
→ identify visual DNA
→ identify current surface level
→ identify hierarchy problem
→ choose minimal surface intervention
→ add treatment only if needed
→ render
→ compare
→ repair
```

DON'T:

```text
rewrite CSS from scratch
→ add more gradients
→ add more shadows
→ add more rounded cards
```

---

## WHEN creating a new component without reference

DO:

```text
1. Read Master Design System.
2. Identify product surface vocabulary.
3. Identify nearest component family.
4. Reuse existing surface tokens.
5. Decide whether the component needs no surface, tonal surface, primary surface, elevated surface, or decorative surface.
6. Choose background treatment from the existing vocabulary.
7. Compose the content.
8. Run the style-drift audit.
9. Render and visually inspect.
```

The absence of a reference should increase reliance on the design system.

It should NOT increase visual freedom.

---

# HTML/CSS Implementation Pattern

Prefer semantic classes and tokens.

Example:

```html
<section class="surface surface--primary surface--ambient">
  <div class="surface__content">
    ...
  </div>
</section>
```

```css
.surface {
  position: relative;
  overflow: hidden;
}

.surface--primary {
  background: var(--surface-primary);
  border-radius: var(--radius-lg);
}

.surface--ambient::before {
  content: "";
  position: absolute;
  inset: auto -15% -25% auto;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: var(--brand-ambient);
  opacity: .25;
  filter: blur(2px);
  pointer-events: none;
}

.surface__content {
  position: relative;
  z-index: 1;
}
```

Keep decorative layers structurally separate from content.

---

# Review Questions

Before marking a component finished, answer:

1. What is the component's hierarchy level?
2. Why does it have a surface?
3. Could spacing alone work?
4. What semantic role does the background color play?
5. Is there a depth/elevation requirement?
6. Does the decorative treatment belong to the product DNA?
7. Does the surface improve comprehension or only appearance?
8. Does it introduce a new visual rule?
9. Would this still look like the same app beside three existing screens?
10. Is any decoration removable without losing meaning?

If the answer to the last question is yes, consider removing it.

---

# Definition of Done

A component is done when:

- it has a deliberate hierarchy level
- its surface is semantically justified
- background treatment comes from an existing visual vocabulary
- radius/spacing/depth match the design system
- it does not create unnecessary card nesting
- it does not introduce random colors or effects
- content remains the visual priority
- the component feels related to existing screens
- the composition is not merely a clone of another component
- the rendered result has passed visual review
