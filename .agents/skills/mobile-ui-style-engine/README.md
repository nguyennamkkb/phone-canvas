# Mobile UI Style Engine

A reusable agent skill for generating mobile HTML screens that remain visually consistent with an existing product.

## What it solves

Generic UI generation often works like this:

```text
new request → model invents a layout → generic UI
```

This skill changes the workflow to:

```text
existing product
    ↓
Design DNA / component grammar / composition grammar
    ↓
new screen design contract
    ↓
HTML implementation
    ↓
style-drift + anti-slop audit
    ↓
rendered visual QA
    ↓
repair
```

## Install

Copy the `mobile-ui-style-engine` folder into the skills directory used by your coding agent.

The only required entry point is:

```text
mobile-ui-style-engine/SKILL.md
```

The rest of the folder is progressive-disclosure reference material and templates.

## Recommended project integration

Create:

```text
design-system/
├── MASTER.md
├── COMPONENTS.md
├── PATTERNS.md
├── anti-patterns.md
└── screens/
```

Start by running the skill in **bootstrap mode** against the project's existing screens/screenshots. Then use it for every new screen.

## Core rule

```text
STYLE = stable
COMPOSITION = adaptive
```

The skill should make a new screen feel like the same product without forcing every screen into the same template.
