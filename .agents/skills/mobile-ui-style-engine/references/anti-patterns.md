# AI Slop / Style Drift Anti-Patterns

## Generic defaults

Flag when introduced without project evidence:

- generic purple/blue gradient;
- excessive glassmorphism;
- soft shadow on every card;
- every control rendered as a pill;
- every surface rendered as a card;
- oversized centered hero heading;
- decorative badges everywhere;
- tiny eyebrow labels with no semantic value;
- random emoji/decorative icons;
- arbitrary pastel palette.

## Structural sameness

Flag:

- same hero on every screen;
- same three-card section repeated across unrelated screens;
- same CTA block copied everywhere;
- same centered layout used regardless of content;
- same image treatment despite different content hierarchy.

## Token explosion

Flag:

```text
Too many colors
Too many radii
Too many spacing values
Too many font sizes
Too many shadow recipes
```

A healthy design system has intentional families, not a unique token for every element.

## Style drift

Flag when a new screen introduces:

- a different visual era;
- different icon semantics;
- different surface depth;
- different type personality;
- unrelated illustration language.

## False positives

Do not flag a pattern solely because it is fashionable or common.

The test is:

```text
Is it supported by the product's visual grammar?
Does it improve this screen's actual task?
Is it repeated or intentionally introduced at system level?
```
