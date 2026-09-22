# Surface Anti-Slop Reference

## High-risk patterns

### Card soup
Every section is wrapped in a rounded container.

### White-on-white stacking
Page, card, nested card, and control all use near-identical surfaces.

### Shadow soup
Every elevated-looking element receives a shadow.

### Gradient soup
Gradients are inserted into unrelated components simply to create visual interest.

### Decoration soup
Blobs, dots, glows, sparkles, and circles are added without a compositional purpose.

### Radius soup
Multiple unrelated radius values appear across otherwise similar components.

## Repair sequence

1. Remove unnecessary containers.
2. Remove unnecessary shadows.
3. Collapse redundant surfaces.
4. Normalize radius.
5. Normalize color roles.
6. Reintroduce one deliberate treatment if hierarchy still needs help.
