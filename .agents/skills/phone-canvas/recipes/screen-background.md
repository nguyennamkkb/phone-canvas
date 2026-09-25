# Recipe — screen background (optional)

**Use for:** giving ONE screen its own background — a token color, an asset
picture from `public/images/`, or a full dark stage. Screens without a root
background keep the project's `--bg`; this recipe is opt-in per screen.

## Why longhand, why root-only

The status bar and home indicator live OUTSIDE the screen on `.device`
(`src/extractor/compose.ts`). `composeScreenDoc` replays the root's
**longhand** `background-color` + `background-image` onto `.device` so the two
chrome strips continue the screen instead of showing the default `--bg` as a
seam. Shorthand `background:` is invisible to that replay — the lints below
enforce longhand for image designs.

`background-image` is allowed ONLY on the `.screen` root. Containers inside
keep flat token colors; a picture inside the layout is `<img class="art">`,
not a CSS background.

## The three modes (copy-paste the root line)

```html
<!-- 1. token color -->
<div class="screen" style="background-color: var(--sage-soft)">

<!-- 2. asset picture: fallback color + fixed geometry, always all four -->
<div class="screen" style="background-color: var(--bg); background-image: url(/images/moodtracker-pattern.svg); background-size: cover; background-position: center; background-repeat: no-repeat">

<!-- 3. dark stage (camera, carplay): literal black + manifest flag -->
<div class="screen" style="background-color: #000">
<!-- + src/screens/manifest.ts entry: lightStatusBar: true -->
```

Rules:

1. Color must be `var(--token)` — `#000` is the only literal allowed.
2. Image must be `/images/<file that exists in public/images/>`. No remote
   URLs, no data-URIs.
3. An image REQUIRES a `background-color` fallback (shows while loading, and
   paints the chrome strips).
4. Geometry is fixed: `cover` / `center` / `no-repeat`. Anything else fails
   lint, because `.device` replays exactly this geometry.
5. Dark screens set `lightStatusBar: true` so the status text stays readable;
   the home bar flips white automatically (`is-dark`).
6. Review both themes: `npm run export -- --screen <id>` renders light AND
   dark — look at both PNGs. One picture serves both modes.

## Limits

* The background lives in the screen FILE, so every board node with that
  screen id changes together. Two different backgrounds for the same content
  means two screens (`npm run new-screen` a clone).
* The panel reports the picture as `Image("…")` (name it via `data-asset`
  thinking: which catalog asset would this be?) and gradients as
  `LinearGradient` text — you write the SwiftUI by hand from there.

## Verify

`npm run gate` (subset + tokens lints name the file:line on violation),
then export + LOOK at the PNG: no seam at the status/home strips, text still
contrasts, height unchanged (a background never changes layout).
