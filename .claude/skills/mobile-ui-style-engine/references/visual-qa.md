# Visual QA

## Goal

Check the rendered result, not just source code.

## Review passes

### Pass 1 — Silhouette

At thumbnail size ask:
- Is the main focal point obvious?
- Does the page feel balanced?
- Does the density fit the product?
- Is there an accidental giant empty area?

### Pass 2 — Hierarchy

Check:
- title prominence;
- primary action prominence;
- section ordering;
- secondary information suppression;
- emphasis consistency.

### Pass 3 — Rhythm

Check repeated:
- page gutters;
- vertical gaps;
- control spacing;
- section spacing;
- grid gaps.

### Pass 4 — System conformance

Compare:
- font family;
- type scale;
- semantic colors;
- radius families;
- shadows;
- controls;
- navigation.

### Pass 5 — UX/accessibility

Check:
- readable text;
- clear labels;
- adequate control hit areas;
- meaningful states;
- focus/keyboard behavior when relevant;
- reduced-motion behavior when relevant.

## Screenshot comparison

Use the closest canonical screens as style anchors.

Do not compare pixel-for-pixel when composition is intentionally different. Compare the shared visual grammar instead.

## Repair order

When something looks wrong, fix in this order:

1. composition;
2. hierarchy;
3. spacing;
4. typography;
5. surface/color;
6. details.

Do not polish shadows/icons while hierarchy is still wrong.
