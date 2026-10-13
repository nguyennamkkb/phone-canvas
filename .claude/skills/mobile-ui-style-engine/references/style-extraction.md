# Style Extraction Procedure

## Input sources

Use any available combination of:

- screenshots;
- existing HTML;
- CSS;
- design tokens;
- component files;
- images/icons;
- browser-rendered screens.

## Extraction procedure

### Step 1 — Find repetition

Identify values and patterns repeated across multiple screens.

### Step 2 — Separate token from coincidence

A value is more likely a real system token when it:

- appears repeatedly;
- appears across multiple screen families;
- maps to a semantic role;
- is already defined centrally.

### Step 3 — Identify hierarchy

Do not capture values without relationships.

Example:

```text
surface-primary < surface-elevated
text-primary > text-secondary > text-tertiary
primary action > secondary action
```

### Step 4 — Identify signature motifs

Find a few traits that make the product recognizable.

### Step 5 — Identify outliers

Mark suspicious one-off patterns as legacy/outlier until verified.

### Step 6 — Write the Design DNA

Update:

```text
MASTER.md
COMPONENTS.md
PATTERNS.md
anti-patterns.md
```

### Step 7 — Validate the memory

Use the extracted Design DNA to mentally reconstruct a screen you already know.

If the resulting description would produce a visibly different style, the Design DNA is too weak.
