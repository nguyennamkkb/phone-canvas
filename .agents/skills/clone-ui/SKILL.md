---
name: clone-ui
description: Reverse-engineer a reference UI screenshot into a structured temporary spec, then implement a faithful responsive HTML/CSS recreation. Use this skill whenever the task is to clone, recreate, reproduce, or translate a UI screenshot into HTML.
---

# Clone UI Skill

## Purpose

Recreate a reference UI faithfully by separating **analysis** from **implementation**.

Core rule:

> **Do not jump from screenshot → code.**
> First inspect and spec the screenshot, save a temporary UI spec, then design/implement from that spec, then visually verify.

The goal is not to measure every pixel. The goal is to recover the **layout logic, hierarchy, visual language, and constraints** that make the reference look the way it does.

---

## Workflow

```text
REFERENCE SCREENSHOT
        ↓
1. Inspect
        ↓
2. Decompose
        ↓
3. Infer layout
        ↓
4. Extract visual system
        ↓
5. Write temporary UI spec
        ↓
6. Implement HTML/CSS
        ↓
7. Render screenshot
        ↓
8. Compare + patch
        ↓
FINAL UI
```

Never skip directly from step 1 to step 6 unless the UI is trivial.

---

# 1. Inspect the Screenshot

Read the screen from **outside → inside**.

Identify:

- canvas / aspect ratio
- device type or likely viewport
- safe areas and system UI
- major visual regions
- primary content area
- CTA/action area
- decorative areas

Do not start by listing individual icons.

### Output mindset

```text
What are the large blocks?
Where does the eye go first?
What is fixed, what flows?
What is the main action?
What establishes the visual identity?
```

---

# 2. Decompose Into Visual Regions

Break the screen into a small number of meaningful sections.

Typical structure:

```text
Screen
├── Background
├── Header
├── Hero
├── Main Content
├── Controls / Cards
├── CTA
└── Footer
```

For each region identify:

- approximate bounds
- alignment
- spacing relationship to neighboring regions
- whether it participates in normal flow
- whether it overlays another element

Prefer **semantic regions**, not tiny fragments.

### Rule

If two elements clearly belong to one visual block, spec the block first and its important children second.

---

# 3. Recover the Layout Logic

Do not copy pixel positions blindly.

Infer the constraints that most likely produced the screenshot.

Look for:

- horizontal page padding
- max-width containers
- vertical rhythm
- stacks and gaps
- centered content
- equal-width columns
- flex/grid relationships
- sticky/fixed elements
- overlays
- bottom anchoring
- scrollable content

Ask:

```text
Is this element positioned by:
- flow?
- flex?
- grid?
- container constraints?
- absolute positioning?
```

### Default preference

```text
flow > flex/grid > absolute
```

Use absolute positioning only where the visual relationship genuinely requires it, such as decorative overlays or floating badges.

---

# 4. Extract the Visual System

Capture the visual decisions that matter most.

## Typography

Estimate:

- font family/category
- hierarchy
- size
- weight
- line height
- alignment
- line wrapping behavior

Do not over-focus on exact font metrics when the family is unknown.

## Color

Identify:

- page background
- surface colors
- primary text
- secondary text
- accent
- borders
- gradients

## Shape

Identify:

- card radius
- button radius
- border thickness
- pill vs rectangular controls
- icon shape language

## Effects

Identify:

- shadow
- blur
- opacity
- glow
- gradient
- stroke

## Assets

Classify visible graphics as:

```text
CSS shape
SVG/icon
raster asset
illustration/logo
system UI
```

Do not reproduce complex artwork with unnecessary CSS.

---

# 5. Identify Information Hierarchy

This is more important than tiny spacing.

Determine:

1. What is the primary visual focus?
2. What is the secondary explanation?
3. What is interactive?
4. What is supporting/trust content?
5. What is decorative?

Example:

```text
Primary:
Hero headline + CTA

Secondary:
Supporting copy / cards

Supporting:
Trust / rating / metadata

Decorative:
Gradient / particles / illustration accents
```

The implementation should preserve this hierarchy.

---

# 6. Write a Temporary UI Spec

Before coding, create a temporary spec file.

Recommended name:

```text
ui-spec.json
```

Keep it concise but useful.

Example:

```json
{
  "screen": {
    "type": "paywall",
    "viewport": "mobile"
  },
  "layout": {
    "pagePadding": 32,
    "sectionGap": 24,
    "contentFlow": "vertical"
  },
  "regions": [
    {
      "id": "header",
      "role": "intro",
      "layout": "flow",
      "alignment": "left"
    },
    {
      "id": "main-card",
      "role": "primary-content",
      "layout": "flow"
    },
    {
      "id": "cta",
      "role": "primary-action",
      "layout": "bottom"
    }
  ],
  "visual": {
    "background": "purple-to-white gradient",
    "cardRadius": "large",
    "buttonStyle": "pill",
    "contrast": "high"
  }
}
```

### Spec should answer

```text
WHAT exists?
WHERE is it?
HOW is it laid out?
WHAT is visually important?
WHAT constraints should implementation preserve?
```

It should not become a giant pixel dump.

---

# 7. Move From Spec to Design

After the temporary UI spec is complete, use it as the source of truth for the recreation.

The next stage is to **design/rebuild the interface**, not to spend time documenting implementation details.

The spec should guide:

- hierarchy
- composition
- component placement
- spacing relationships
- typography hierarchy
- color relationships
- visual emphasis
- asset placement
- responsive intent

Do not reinterpret the design unless the reference itself is ambiguous.

---

# 8. Responsive Intent

Treat the screenshot as evidence of a design system, not as a fixed coordinate map.

Infer how the composition should behave when the viewport changes:

- what remains anchored
- what expands or contracts
- what wraps
- what stays centered
- what moves with the content
- what belongs to the safe area
- what is decorative versus structural

Capture these decisions in the temporary spec.

---

# 9. Visual Verification

After the interface is recreated, compare the result against the reference.

Check in this order:

```text
1. Overall composition
2. Major region positions
3. Component proportions
4. Information hierarchy
5. Typography scale and wrapping
6. Spacing rhythm
7. Colors and gradients
8. Shapes and visual effects
9. Asset scale and placement
10. Minor details
```

Fix structural differences before cosmetic differences.

---

# 10. Temporary Review

When the recreation is not close enough, create or update:

```text
visual-review.md
```

Keep the review focused on meaningful differences.

Example:

```text
# Visual Review

## Composition
- Hero occupies too much vertical space.

## Hierarchy
- Primary CTA does not have enough visual emphasis.

## Geometry
- Main card is too narrow.

## Typography
- Heading wraps differently from the reference.

## Visual
- Background gradient transition is too low.

## Assets
- Illustration has too little visual weight.
```

The review should explain:

```text
what is different
→ why it likely matters
→ what part of the design should change
```

---

# What NOT To Do

## Don't

- jump directly from screenshot to final design
- turn the screenshot into a giant list of pixel coordinates
- over-focus on tiny measurements before understanding composition
- invent hidden functionality
- redesign the interface while trying to clone it
- treat one screenshot size as the complete responsive specification
- spend time documenting low-value implementation details

## Do

- analyze from large regions to smaller elements
- preserve information hierarchy
- infer relationships and constraints
- identify the visual language
- separate structural elements from decorative elements
- create a temporary spec before reconstruction
- visually compare the recreation with the reference
- refine the largest mismatches first

---

# Decision Rules

### WHEN the screenshot is complex
DO divide it into a small number of meaningful visual regions before reconstruction.

### WHEN several elements clearly belong together
DO model them as one visual component with important children.

### WHEN a relationship is obvious
DO describe the relationship, not just the coordinates.

Example:

```text
CTA:
- aligned with page content
- visually dominant
- anchored near the bottom action zone
```

rather than only:

```text
CTA:
- x = ...
- y = ...
```

### WHEN an exact asset is unavailable
DO identify it as an asset dependency and preserve its intended visual role, scale, and prominence.

### WHEN text wraps differently
DO investigate available width, typography hierarchy, and layout constraints.

### WHEN the result feels "correct" but does not look like the reference
DO revisit composition, hierarchy, geometry, and visual language before touching minor details.

### WHEN multiple screenshots belong to the same product
DO identify recurring patterns and extract shared design tokens/components into the design system.

---

# Minimal Quality Gate

Before considering the clone complete:

```text
[ ] Major regions match the reference
[ ] Composition and hierarchy are preserved
[ ] Important spacing relationships are consistent
[ ] Typography hierarchy is believable
[ ] Major colors/gradients are close
[ ] Shapes and visual language are consistent
[ ] Important assets are correctly identified and placed
[ ] Responsive intent is documented
[ ] The recreation has been visually compared with the reference
[ ] The largest mismatches have been corrected
```

# Principle

A good UI clone is not a screenshot converted into coordinates.

It is:

```text
visual evidence
→ layout model
→ temporary UI specification
→ implementation
→ rendered evidence
→ correction
```

Recover the **design logic** first. Then reproduce the pixels that matter.
