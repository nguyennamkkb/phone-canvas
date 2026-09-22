# Component Grammar

## Goal

Maintain a recognizable component language while allowing screen-specific composition.

## Component inventory

For each family record:

```text
Name
Purpose
Anatomy
Variants
States
Sizing
Spacing
Radius
Color roles
Do
Don't
```

## Reuse ladder

```text
existing component
    ↓
composition of primitives
    ↓
component variant
    ↓
new family (exception)
```

## Component consistency checks

A component family should not silently vary in:

- corner radius;
- internal padding;
- control height;
- typography;
- icon placement;
- border treatment;
- shadow behavior;
- selected/pressed state.

## Variants

Prefer semantic variants:

```text
button-primary
button-secondary
button-destructive
```

over visually accidental variants:

```text
button-blue
button-dark
button-rounded
```

## New family justification

Require a short note:

```text
Why existing family cannot express this:
What interaction/information difference requires it:
Which Master DNA rules it inherits:
```
