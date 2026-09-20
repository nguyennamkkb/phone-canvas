# Recipe — onboarding / welcome / primer

**Use for:** a first-run screen, a feature intro, a permission primer, a
multi-step welcome flow.

## Structure

```
.screen
└── .body-fixed                    not scrollable; pushes the footer to the floor
    ├── .art-block                 the illustration band
    ├── .col                       copy
    │   ├── h1.t-display           headline, wraps to two lines
    │   └── p.t-subhead.t-secondary
    ├── .spacer
    └── .row                       pager left, actions right
        ├── .dots  (3 × .dot, one .is-filled)
        └── .sq-btn  +  .sq-btn.is-dark
```

## Classes

`.art-block` (384 tall, centred) · `.t-display` (48/52) · `.t-subhead` ·
`.dots` + `.dot` / `.dot.is-filled` · `.sq-btn` / `.sq-btn.is-dark` (52 square,
radius 16).

## Skeleton

```html
<div class="screen">
  <div class="body-fixed" style="padding-top: var(--s10); padding-bottom: var(--s4)">
    <div class="art-block">
      <img class="art" src="/images/onboarding-x.svg"
           data-asset="OnboardingX" width="384" height="384" alt="…" />
    </div>

    <div class="col" style="gap: var(--s3); padding: 0 var(--s8)">
      <h1 class="t-display">Headline that wraps</h1>
      <p class="t-subhead t-secondary">Two or three lines of supporting copy.</p>
    </div>

    <div class="spacer"></div>

    <div class="row" style="justify-content: space-between; padding: 0 var(--s8)">
      <div class="dots">
        <i class="dot is-filled"></i><i class="dot"></i><i class="dot"></i>
      </div>
      <div class="row" style="gap: var(--s5)">
        <button class="sq-btn" aria-label="Back">
          <span class="icon icon-sm" data-symbol="arrow.left"></span>
        </button>
        <button class="sq-btn is-dark" aria-label="Next">
          <span class="icon icon-sm" data-symbol="arrow.right"></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

## Gotchas

- **The headline size is load-bearing.** The copy wraps the way the reference
  does only at a particular size against a particular width. If it will not
  break where it should, measure the string rather than guessing:
  `ctx.font = '700 48px …'; ctx.measureText(s).width` against the content width.
  Two points of font size is the difference between one line and two.
- **A pager is not a progress bar.** Same-size dots: `.dot` + `.is-filled`.
  `.dot.is-active` elongates and is a different pattern — do not mix them.
- **The illustration is usually the one thing you cannot reproduce.** If you draw
  a stand-in, keep the box, the origin and the visual weight, and say in your
  final response that the artwork is a placeholder.
- Height should land on 844. If it does not, the copy or the band is too tall —
  measure, do not shrink the headline to make it fit.
