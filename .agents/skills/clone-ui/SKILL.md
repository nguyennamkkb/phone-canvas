---
name: clone-ui
description: Read a UI screenshot (app/web screenshot, paywall, onboarding, mockup, Mobbin, Dribbble...) then break it into components and recreate it faithfully with HTML/CSS + inline SVG. Use this skill whenever the user shares a UI image and wants to clone, reproduce, redraw, rebuild it, "make it look like the image", convert a design to HTML, or asks about the spacing/colors/fonts/icons of a UI image, even when they do not explicitly say "clone". The skill forces component-by-component work with a spec card and a dedicated check loop per component, instead of building the whole screen at once.
---

# UI Clone: from image to HTML, one component at a time

## Why this process exists

Models are very good at recognizing "what this is" in an image but poor at measuring absolute pixels. Building a whole screen in one pass produces a "looks-ish" result: wrong spacing, wrong font sizes, misaligned icons, different line breaks. Three principles fix that:

1. **Measure by ratio, not by pixels.** Every size is computed as a % of screen width and then converted, because ratios can be estimated from an image fairly accurately by eye.
2. **Each component is an independent unit.** It has a spec card, is built separately, checked separately, and locked before moving to the next component. A mistake is localized immediately, and fixing it cannot break what is already right.
3. **Write it down first, code second.** Text content, colors, and sizes must live in the spec card. Code is just transcription of that card.

## Required inputs

- UI image(s) (one or more).
- **Device type** (iPhone, Android, iPad, web desktop). If the user does not say, infer it from the image (frame ratio, status bar style, system font) and state the assumption in one line.

Do not discuss frames or viewports. The build environment is already set up; only the device type is needed for unit conversion.

Conversion table by device:

| Device | Logical width (CSS px) | Common image scale |
|---|---|---|
| iPhone | 390 (or 393, 375 for small phones) | @3x |
| Android | 360 to 412 | @2.6 to @3.5 |
| iPad | 820 | @2 |
| Web desktop | 1440 | @1 |

`scale = image width / logical width`. Every measurement on the image divided by `scale` gives CSS px.

Only build the app's own interface. Skip the system status bar (time, signal, battery), the home indicator, and any annotation strips or watermarks added by the image source (e.g. "curated by Mobbin").

## Overall process

```
PHASE A. ANALYZE (no code yet)
  A1 Zone map  →  A2 Inventory  →  A3 Tokens  →  A4 Component tree

PHASE B. BUILD COMPONENT BY COMPONENT (loop, smallest to largest)
  per component: Spec card → Build alone → Self-check → Lock

PHASE C. ASSEMBLE AND COMPARE
  C1 Assemble in flow  →  C2 Ratio table  →  C3 Fix one error type at a time
```

Do not move to Phase B before Phase A is done.

---

## PHASE A. Analyze

### A1. Zone map

Split the image top-down into large zones. For each zone record: background (color, gradient, image), centered or left-aligned, in the scroll flow or fixed (bottom CTA, corner close button), and roughly what % of height it occupies.

### A2. Inventory

List every visible element, one line each with: type, text content **copied verbatim character by character** (including punctuation, currency symbols, dates, emoji), relative position, state (selected, dimmed, ticked).

Do a second pass just to catch easy-to-miss items: small footer links (Restore purchase), pagination dots, close button, faint dividers, shadows, hairline borders, overlapping elements.

With multiple images, mark components repeated across images (timeline, CTA button, toggle). Build once, parameterize content.

### A3. Tokens

Lock these before coding; every later value comes from here:

- **Colors:** background, primary text, secondary text, accent, button color, icon color. For gradients record both end colors and direction. Colors are estimated by visual feel, so mark them "approx" and use one value per role.
- **Typography:** closest font family (system: SF/Roboto; geometric: Poppins, Outfit, DM Sans; serif if slabbed). Per text level: size, weight, line-height, letter-spacing. Large headlines are usually tightened (slightly negative).
- **Shapes:** radius (buttons are usually very round, near-pill), shadow, border.
- **Spacing scale:** fold every distance into multiples of 4 or 8.

### A4. Component tree

Arrange the inventory into a small-to-large tree and number the build order:

```
Level 1 (leaves):  icon, text, badge, dots, divider
Level 2 (joined):  button, pill/toggle, timeline row, card
Level 3 (blocks):  header/hero, timeline list, price table, bottom CTA bar
Level 4 (screen):  assemble the blocks
```

Build from level 1 up. This is the Phase B order.

---

## PHASE B. Build one component at a time

For **each** component, run exactly four steps.

### B1. Spec card (written before coding)

Fill in this card for the component. Any box not yet known gets "estimated" plus the basis.

```
ID:              e.g. timeline-row
Type:            text | button | icon | illustration | card | layout...
Content:         verbatim
Position:        bbox as % of screen width / % of screen height (x, y, w, h)
Size:            w × h in CSS px (scale already divided)
Alignment:       against which anchor (screen left edge, parent icon center...)
Colors:          from tokens
Typography:      size / weight / line-height / letter-spacing / line count
Shape:           radius, shadow, border
State:           default / selected / dimmed
Build technique: CSS | SVG-icon | SVG-illustration | placeholder
Easy to get wrong: e.g. "line break after 'reminder that your'"
```

### B2. Build alone

Build that component by itself, on a flat background, at its real width in the screen. No dependency on other components. Use values from the spec card and tokens, no new values.

### B3. Self-check with a fixed list

Do not check by "looks fine" feeling. Answer each question yes/no:

1. Is the text verbatim?
2. Do line count and break positions match the image?
3. Does the component w:h ratio match the image (within 5%)?
4. Does the distance from the component edge to its anchor match?
5. Do color, radius, shadow match the tokens?
6. Is the state (selected, dimmed, ticked) correct?

Any "no" gets fixed right here, then re-checked. If a render tool is available, screenshot the build and place it next to a crop of the source image region.

### B4. Lock

Write "locked" and do not touch this component again unless Phase C points at a specific defect. Only then move to the next component.

---

## Measuring from an image

Applies when filling in the spec card.

- **Reference anchor:** screen width = 100%. Measure everything in % then multiply by the logical width. Example: a button 88% wide on a 390 screen is about 343px.
- **Font size:** measure the distance between two consecutive lines (baseline to baseline), divide by scale for line-height; font size is usually line-height divided by 1.2 to 1.5. Cross-check with cap height (cap-height ≈ 0.7 × font size). For large headlines, compare the text line width against screen width to lock the size.
- **Line breaks:** the best evidence of a text block's width. If the image breaks after word X, set `max-width` so the next word does not fit. For headlines, use `<br>` or a narrower `max-width` to force the exact break.
- **Common iPhone reference values:** CTA button height 50 to 56, screen side margin 16 to 24, action icon 24, minimum touch target 44, icon inside a circle about 45 to 55% of the circle diameter.
- **Alignment:** find shared axes. Example: the centers of timeline circles sit on one vertical line, the left edges of text blocks on another. Build with one shared value, never eyeball each one.
- **Even spacing:** if three rows look equally spaced, use one value for all three.

---

## Decision table: CSS or SVG

| Element | Use | Reason |
|---|---|---|
| All text runs | HTML text | Text in SVG scales poorly, hard to select |
| Button, pill, toggle, card, divider | CSS | Radius, shadow, states easy to tweak |
| Gradient, drop shadow | CSS | |
| Vertical timeline bar, progress bar | CSS (gradient div) | It is a rounded rectangle |
| Tilted card, layered stack | CSS `transform: rotate` | Keeps inner text as HTML |
| Pagination dots, single dots | CSS | |
| Small simple icons (lock, bell, star, X, check, arrow) | **Inline SVG** | Need crisp strokes and curves |
| Mascot, character illustration (sun, globe) | **Inline SVG** | Many layered shapes |
| Decorative curved background (mountains, clouds, waves, curved header bottom) | **Inline SVG** as background layer | Needs paths |
| Scattered texture (confetti, stars, dots) | **Inline SVG** | Many small shapes, free positions |
| Brand logo | Simple approx SVG or color block + letter | Do not over-detail |
| Real photos, product shots | Same-size placeholder in dominant color | Cannot be drawn in SVG |

### Where SVG sits in the screen

- **Icon:** in normal flow, inside the parent element (usually a circle centered with flex). Icon size and color come from the spec, color uses `currentColor`.
- **Illustration and decor:** a separate layer, `position: absolute` inside the hero block, positioned by % of that block, under the text (low `z-index`). Text and buttons always on top.
- **Background transition curve:** SVG at the hero block bottom, colored like the content background below to form a seamless curved edge.
- **Confetti and texture:** one SVG covering the block, each shape placed by viewBox coordinates. Keep sparse, never covering text.

### How to draw one SVG

1. Fix the illustration region bounding box; the width/height ratio sets the `viewBox`.
2. Decompose back to front (background → halo ring → body → face details → highlight → decorations).
3. Reduce each layer to basic shapes (`circle`, `ellipse`, `rect`, simple `path`). Use `path` only for free curves.
4. Record center coordinates and radii as % of the bounding box before writing.
5. Colors from tokens. One flat color or one two-stop gradient per layer, no extra effects.
6. Place at the right position and compare scale against the source image immediately (at B3), not at the end.

Detail level: stop when the shape is recognizable at its real display size. Skip details smaller than a few px.

---

## Per-component notes

Use as extra hints for the "Easy to get wrong" box in the spec card.

- **CTA button:** height, radius (pill or medium), shadow or border or neither, text color, text weight. A bottom-fixed button sits outside the scroll region with bottom padding.
- **Toggle / segmented control:** track background, selected part color and position, padding between track and selection, unselected text dimmer.
- **Vertical timeline:** circle centers aligned; connector runs between circles and often gradients or recolors near the end; bold title over dimmer description; even gaps between steps. Connector sits under circles (z-index), never crossing through them.
- **Icon in a circle:** circle diameter, icon size, circle background, icon color.
- **Tilted card:** rotation angle, shadow, stacking order, part hidden by another card.
- **Illustrated hero header:** block height, background, curved bottom edge, close button position vs edge.
- **Pagination dots:** active dot usually longer or bolder.
- **Price plan / package:** big bold price, small dim sub text, currency symbol and unit (/month, /year) verbatim.
- **Secondary links (Restore purchase, Terms):** small size, link color, centered or following the main column.

---

## PHASE C. Assemble and compare

### C1. Assemble in flow

Assemble locked components per the zone map. Order: background and blocks → in-flow sections (flex/grid, no `position: absolute` for the main layout) → fixed bottom block → illustration and decor layers. Reuse spacing from tokens instead of eyeballing.

### C2. Comparison ratio table

Pick about 8 to 12 landmarks (headline, CTA button, first and last icons, last text baseline, close button, illustration). For each record `x / width` and `y / height` in the source image and in the build, then compare. Under 1.5% off is a pass. If a screenshot tool is available, place the build next to the source image.

### C3. Fix one error type at a time

Each round fixes **one** error type only, in this order:

1. Layout: block positions and sizes
2. Typography: font size, weight, line breaks
3. Colors and gradients
4. Radius, shadow, border
5. SVG: position, scale, detail

A defect in a locked component unlocks exactly that component, fixed per its spec card, re-checked with B3, re-locked. Stop when within a few px of the source image.

---

## Common mistakes

- Building the whole screen in one pass then comparing, so errors pile onto errors.
- Guessing text instead of copying verbatim (wrong dates, prices, missing punctuation).
- Placing each element with made-up numbers instead of the spacing scale and shared axes.
- Ignoring the source image's line breaks.
- Using SVG for text or for layout.
- Over-detailing the illustration while the basics (buttons, text) are less accurate.
- Adding elements not in the image (borders, shadows, extra sections).
- Changing already-correct values on every fix round.

## How to report when done

Reply briefly: one assumption line (device, closest font chosen), the list of components with significant estimates (if any), and the final product. Do not paste the intermediate tables unless the user asks.

## Prohibitions

- No code before Phase A is done.
- No building a component without a spec card.
- No moving to a new component before the current one passes B3.
- No color or spacing values outside the locked tokens and scale.
- No building the system status bar, home indicator, or image-source watermarks.
