# Spec → SwiftUI

The panel is the deliverable. Its `swiftUiShape` line is one line you can copy;
the rest of the fields are there for the cases where that line is not enough.

## What the panel reports

| Field | Means |
|---|---|
| `swiftUiShape` | the container or leaf this node becomes, with spacing, alignment and offset already resolved |
| **Khung** x/y, w×h | the element's box, in points, measured from the top-left of the **device screen** (status bar included) |
| **Layout** hướng · spacing · justify · align-items · align-self · wrap | flex properties, resolved |
| **Layout** layer | placed by coordinate — read the shape's `.offset(x:y:)` |
| **Padding** | the four insets, zero ones omitted |
| **Kích thước** flex-grow · fill | `fill: width` means `.frame(maxWidth: .infinity)` |
| **Chữ** font · size · weight · line-height · lineSpacing · tracking · align · color | typography, already converted |
| **Icon / ảnh** loại · nguồn · SF Symbol · asset · tint | the name to use, and the colour it inherits |
| **Nền & viền** background · radius · border · shadow | the surface |
| **Nội dung** | the literal text |

## The mapping

| Panel says | SwiftUI |
|---|---|
| `VStack(spacing: 12)` | `VStack(spacing: 12)` |
| `VStack(spacing: 8, alignment: .leading)` | `VStack(alignment: .leading, spacing: 8)` |
| `HStack(spacing: 8, alignment: .top)` | `HStack(alignment: .top, spacing: 8)` |
| `ScrollView { VStack(spacing: 8) }` | exactly that |
| `ZStack` | `ZStack { … }` |
| `ZStack.offset(x: 12, y: -30)` | a child of a `ZStack`, with `.offset(x: 12, y: -30)` |
| `Text` | `Text("…")` with `.font` / `.foregroundStyle` / `.lineSpacing` / `.kerning` |
| `Image(systemName: "shield.fill")` | exactly that, plus `.foregroundStyle(tint)` |
| `Image("OnboardingReach")` | exactly that — the name came from `data-asset` |
| `Button` | `Button { } label: { … }` |
| `Spacer()` | `Spacer()` |
| `Circle().fill(…)` / `Capsule()` / `Rectangle()` | exactly that |
| **Padding** `all 16` | `.padding(16)` |
| **Padding** `top 12 right 16 bottom 12 left 16` | `.padding(.horizontal, 16).padding(.vertical, 12)` |
| **Kích thước** `fill: width` | `.frame(maxWidth: .infinity)` |
| **Chữ** size 17 · weight semibold | `.font(.system(size: 17, weight: .semibold))` |
| **Chữ** lineSpacing 5 | `.lineSpacing(5)` |
| **Chữ** tracking −0.4 | `.kerning(-0.4)` |
| **Chữ** color `#3C3C43` | `Color(red: 0.235, green: 0.235, blue: 0.263)` — or your token |
| **Nền** radius 16 | `.clipShape(RoundedRectangle(cornerRadius: 16))` |
| **Nền** border 1pt `#E5E5E5` | `.overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(…), lineWidth: 1))` |
| **Nền** shadow | `.shadow(color:radius:x:y:)` |

## The lossy places — say so, do not paper over them

- **`lineSpacing` is already converted.** SwiftUI's `lineSpacing` is *extra*
  leading, not total line height; the panel does `lineHeight − size` for you.
  Do not subtract again.
- **One shadow per chain.** CSS takes a list; SwiftUI does not. Overlapping
  shadows need stacked views.
- **`.offset` does not affect layout.** A layered child sits on top of its
  siblings wherever you put it — nothing reflows around it. That is usually what
  the design wants; when it is not, the container is wrong.
- **`align-self`** has no direct equivalent; it becomes an alignment on the
  parent or a `.frame(alignment:)`.
- **Colour is a hex, not a token.** If the screen uses a design token, map it
  back before writing SwiftUI — `--violet` is `#8B5CF6`, and the codebase almost
  certainly has a name for it.
- **A `Text` that is several `Text`s.** A paragraph with a coloured run comes
  back as one `Text` node with a `Text` child. In SwiftUI that is `+`:
  `Text("… ") + Text("28%").foregroundStyle(.red) + Text(" …")`.

## Writing it, in practice

The spec is a **table, not codegen** — this tool deliberately does not emit
SwiftUI. Read the tree top-down, write the outer container first, then its
children, taking each number from its row. The tree indentation *is* the nesting;
you do not have to infer it.

For a whole screen, use **Copy JSON** and hand it to yourself as reference while
writing, or paste it to a model with this document attached.
