# Composition Grammar

## Principle

A product should be visually consistent without every screen using the same skeleton.

```text
STYLE = constrained
COMPOSITION = contextual
```

## Screen composition questions

Before layout, answer:

1. What is the user's one primary goal?
2. What must be seen first?
3. What can be progressively disclosed?
4. Which content deserves visual weight?
5. What is the dominant interaction?
6. What should remain available while scrolling?
7. What state changes the composition?

## Common mobile archetypes

### Dashboard
Favor fast orientation and multiple entry points.

### Browse / discovery
Favor scanning, grouping, filters, and content density appropriate to the task.

### Detail
Favor a clear reading order and one dominant action.

### Creation / editor
Favor focus, tool discoverability, undo/redo, and limited competing controls.

### Settings
Favor predictable rows, hierarchy, and low visual noise.

### Paywall
Favor benefit hierarchy, pricing clarity, trust, and explicit actions; do not invent decorative patterns that distract from decision-critical information.

## Avoid layout cloning

Two screens should not be considered consistent merely because both are:

```text
header + title + cards + button
```

Instead preserve:

- hierarchy;
- spacing rhythm;
- component language;
- surface logic;
- visual focal behavior.

Then choose the composition that serves the screen's actual purpose.
