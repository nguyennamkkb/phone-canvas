# Design skills → board adapter

The design skills in `.agents/skills/` were written for generic HTML/React
output. On this board only the constrained subset maps to SwiftUI. When they
disagree, **this file wins** — it is the more specific contract.

| Skill says | On the board, write instead | Why |
|---|---|---|
| Tailwind utilities (`flex gap-4 p-6 …`) — `mobile-app-ui-design` | Vocabulary classes (`.row` `.col` `.grow` `.spacer` `.inset` `.body`) + `var(--s*)` tokens | Arbitrary utilities have no stack meaning; the panel reports `Block (out of subset)`. See `references/failure-modes.md` §5. |
| Lucide / inline `<svg>` icons — `mobile-app-ui-design` | `.icon[data-symbol]` + one line in `SYMBOLS` (`scripts/icons.ts`) + `npm run icons` | Inline SVG is nameless in the spec; a mask URL vanishes in the sandboxed iframe (failure mode 1). Never hand-write `style="--icon: url(…)"`. |
| Emoji for icons/illustration — `mobile-app-ui-design` | The SF symbol that does the job | Hard rule 8: emoji do not map to SwiftUI. |
| Recharts / chart libraries — `mobile-app-ui-design` | CSS flex bars with `min-width: 0` on equal columns; labels share the slot geometry of what they label | Failure mode 4: default `min-width: auto` breaks equal sharing and the painted ratio lies. |
| `backdrop-blur` glassmorphism anywhere — `mobile-app-ui-design` | Glass only on floating chrome (nav, tab bar, sheets); never to position content | Glass runs after layout so it is unmeasured — floating content with it reports the wrong box. Rule lives in `src/screens/tokens.css` header. |
| Baseline width 375 px — `mobile-app-ui-design` | Fluid layout at the board's reference width, no hardcoded px tied to one device <!-- lint-docs: keep --> | Invariant 5: the same file renders at every width in `src/frame/devices.ts`. |
| Section padding 80–96 px, card padding 24–32 px — `mobile-app-ui-design` | Project gutter + spacing scale (`var(--s*)`), relationships by multiples | Content-driven PNG height (failure mode 8): hundreds of px of padding show up as a taller export, not as air. |
| Micro-animations, transitions, `transform`, `filter` — `mobile-app-ui-design` | Static layout; motion is a SwiftUI-side decision | A transform is invisible to the layout engine and the spec reports the wrong box (failure mode 7); `filter`/`clip-path` are `Block (out of subset)`. |
| Hardcoded hex / 60-30-10 by eye — `mobile-app-ui-design` | Semantic tokens; `npm run lint:tokens` fails unknown values | The panel reports hex, but the handoff maps it back to a token (`references/spec-to-swiftui.md` § lossy places). |
| Max 4 sizes / 2 weights, 8-pt grid, thumb-zone CTA, empty/error/loading states — `mobile-app-ui-design`, Apple skills, fundamentals | Keep as-is | Compatible with the board; no translation needed. |

## Reading order (precedence)

1. New screen in an existing product → `mobile-ui-style-engine` first (extract Design DNA from `project/<id>/tokens.css` + sibling screens).
2. Number audits (touch, type, contrast, timing) → `apple-design-iphone` (or form-factor sibling) + `mobile-ux-fundamentals`.
3. Reference image to reproduce → `clone-ui`, then pass the result through this adapter before lint.
4. Anything above conflicts with this file → this file wins.
