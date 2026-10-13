# Surface & Background Design Skill

A reusable agent skill for making HTML mobile interfaces feel less flat and less AI-generated.

## What it solves

- components that all look like white cards
- inconsistent backgrounds between screens
- random gradients and decoration
- excessive shadows
- nested cards
- screens that lose visual identity when no reference screen exists

## Core idea

```text
Style = stable
Composition = adaptive
```

The skill teaches the agent to use a semantic Surface System and a controlled Background Treatment vocabulary.

## Install / use

Place the `surface-background-design-skill` directory into the skill location used by your agent and make `SKILL.md` the entry point.

## Bootstrap for an existing project

Create a `Surface Inventory` from existing screenshots/screens/HTML before generating many new components.

Then store the inventory alongside the project's master design system.

## Files

- `SKILL.md` — operating rules and workflow
- `references/SURFACE-MODEL.md` — vocabulary and conceptual model
- `references/COMPONENT-MATRIX.md` — component defaults
- `references/ANTI-SLOP.md` — failure patterns and repair order
- `templates/SURFACE-TOKENS.css` — starter semantic tokens
- `templates/SURFACE-INVENTORY.md` — inventory template
