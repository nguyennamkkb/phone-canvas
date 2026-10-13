# Design DNA Reference

## Purpose

Turn existing visual evidence into a compact, reusable model that another screen can inherit.

## Evidence hierarchy

Prefer evidence in this order:

1. Repeated behavior across canonical screens.
2. Existing shared tokens/components.
3. Repeated patterns across screenshots.
4. Single-screen observations.
5. Generic design-system assumptions.

Never allow generic defaults to override project-specific evidence.

## DNA extraction template

```markdown
# Product Design DNA

## Identity
- Personality:
- Mood:
- Density:
- Visual character:
- Primary user context:

## Color
| Role | Token | Observed usage |
|---|---|---|
| Background | | |
| Surface | | |
| Elevated surface | | |
| Primary text | | |
| Secondary text | | |
| Accent | | |
| Positive | | |
| Warning | | |
| Error | | |

## Typography
- Family:
- Display:
- Title:
- Body:
- Caption:
- Weight conventions:
- Line-height conventions:

## Geometry
- Page gutter:
- Spacing scale:
- Control height:
- Radius families:
- Border thickness:

## Depth
- Surface hierarchy:
- Shadow behavior:
- Blur/glass behavior:

## Components
- Navigation:
- Buttons:
- Cards:
- Inputs:
- Chips:
- Tabs:
- Lists:
- Sheets:
- Feedback:

## Composition
- Header grammar:
- Hero grammar:
- Section rhythm:
- Content grouping:
- CTA grammar:
- Bottom controls:

## Signature motifs
1.
2.
3.
4.

## Avoid
- 
```

## Strong vs weak DNA

Weak:

```text
blue background
rounded cards
nice typography
```

Strong:

```text
Accent color is reserved for high-intent actions and selected states.
Cards use tonal separation rather than prominent borders.
The title scale is intentionally oversized relative to body copy.
Primary actions use compact controls with restrained rounding.
```

The strong version explains behavior and relationships, so a model can generalize to an unseen screen.
