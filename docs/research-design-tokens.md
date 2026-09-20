# Nghiên cứu: Design System board + Variables per-project

> Ngày: 2026-09-20. Trạng thái: nghiên cứu — chưa code.
> Câu hỏi: có khả thi vẽ bảng design system / variables để tái dùng thông số,
> đồng bộ app, hiển thị ngay trên board (không ẩn như Figma), dễ nhìn dễ sửa,
> đi theo thư mục dự án?

## Verdict: KHẢ THI CAO

Kiến trúc hiện tại đã dọn sẵn 3/4 đường:

1. `composeScreenDoc()` nhận `stylesheets: string[]` theo thứ tự — chỉ cần
   chèn thêm 1 stylesheet project vào giữa là xong, không đụng invariant nào.
2. App và exporter **dùng chung** `compose.ts` — token sửa một nơi, board và
   PNG cùng đổi, không drift.
3. Đã có tiền lệ load static asset per-id: `src/screens/index.ts` (`?raw`
   imports + check thiếu thì throw). Token làm y hệt.
4. README "Next #2. Design tokens as data" đã định hướng sẵn:
   panel báo "`#007AFF` = `--accent`" thay vì hex thô.

Việc duy nhất kiến trúc hiện tại **không cho**: browser không ghi được file.
Mọi chỉnh sửa trên board chỉ sống trong localStorage + nút Download/Copy để
chép vào repo. Đây là giới hạn trung thực phải thiết kế quanh, không phải
blocker.

## Hiện trạng token

- `src/screens/tokens.css`: **1 file global** cho mọi project. Gồm 2 lớp lẫn
  lộn trong cùng `:root`: (a) vocabulary chung (spacing 4pt, radii, type
  scale iOS, layout/component classes — nên giữ chung), (b) variables theo
  theme (system colors, brand, health/learning/moodtracker/freud palettes —
  nên tách per-project).
- `src/extractor/buildSrcDoc.ts`: inject tĩnh `[tokensCss, iconsCss,
  icon-set.css]` cho mọi màn. Export (`scripts/export.ts`) đọc cùng 3 file
  từ đĩa. Hai đường này phải sửa song song — đã có pattern.
- Bridge gửi computed styles thô (hex đã resolve), `infer.ts` diễn giải ở
  parent. Nghĩa là **panel không biết token**: `#007AFF` và `var(--accent)`
  trông giống hệt nhau sau resolve. Muốn báo tên token phải tra ngược
  hex → tên ở `infer.ts` (xấp xỉ, có va chạm khi 2 token cùng giá trị).

## Thiết kế đề xuất

### 1. Single source: `project/<id>/tokens.json`

```json
{
  "colors": [
    { "name": "accent", "value": "#007AFF" },
    { "name": "sage-deep", "value": "#7C9448" }
  ],
  "spacing": { "s1": 4, "s2": 8, "s4": 16 },
  "radii": { "r-sm": 8, "r-md": 12, "r-lg": 16, "r-full": 999 },
  "type": { "t-title2": 22, "t-body": 17 }
}
```

- JSON (không phải CSS) vì UI editor parse/sửa an toàn, sinh CSS 1 chiều.
- `src/tokens/tokensToCss.ts` (pure, Node-safe, không `?raw`): JSON →
  `:root { --accent: #007AFF; … }`. App và exporter cùng gọi.
- Thứ tự compose: `[tokensCss(base), projectTokensCss(override), iconsCss,
  icon-set.css]`. Override thắng vì đứng sau. Không đổi layout → 4
  invariants nguyên vẹn.
- Khởi tạo: snapshot toàn bộ `:root` hiện tại vào 3 file (duplication có chủ
  ý, mỗi project sở hữu system của mình, zero visual diff ngày 1; curate dần).
- Custom project (user tạo từ UI): không có file → dùng defaults (clone
  onboarding) + overrides localStorage.

### 2. Load pattern (copy `screens/index.ts`)

```ts
// src/projects/tokens.ts
import onboardingRaw from '../../project/onboarding/tokens.json?raw'
// parse + validate (unknown key → bỏ qua + warn, không crash)
// missing file → throw at startup như RAW check
```

`validateTokens()`: value phải là hex/px hợp lệ, key phải `^[a-z0-9-]+$`;
lỗi thì board vẫn render bằng base (fail-soft, báo đỏ trên token board).

### 3. Hiển thị TRÊN board: node type `tokens`

Không phải phone, là card trắng phẳng (giống dashboard card, không chassis):

```
┌ Design Tokens · mood-core ────── [Reset] [Copy CSS] [↓ JSON]
│ COLORS  ■ accent #007AFF  ■ sage-deep #7C9448 … (click = copy SwiftUI)
│ SPACING ▬ 4 ▬▬ 8 ▬▬▬ 16 …   RADII  8 12 16 ∞   TYPE  Aa 22 / Aa 17
└ Sửa hex trực tiếp → cả board live-sync
```

- Vị trí: node đầu board (`x = -width-gap`), pinned (drag được nhưng có nút
  "Ghim" reset vị trí?). Không xóa được (ẩn nút ×), không tính vào count.
- Mỗi swatch click → copy `Color("accent")` + hex; mỗi hex click → inline
  input sửa → `localStorage pc.tokens.<id>` → `PhoneNode.srcDoc` rebuild
  (thêm `tokensCss` vào deps `useMemo`) → **mọi iframe project đó repaint
  cùng lúc**: đây chính là "đồng bộ app".
- Exporter vẫn dùng file (không đọc localStorage) → divergence có chủ ý,
  UI báo chấm xanh "có override chưa lưu" + nút Download để chép vào repo.

### 4. Panel: hex → tên token (nối vào Next #2 của README)

- `buildSpec(nodes, tokenTable?)`: `toHex(bg)` → tra bảng → panel hiện
  "`--sage-deep` · `#7C9448`" và gợi ý `.background(Color("sage-deep"))`.
- Va chạm (2 token cùng hex): liệt kê cả hai, ưu tiên token project trước
  base. Xấp xỉ nhưng trung thực — panel ghi rõ "tra ngược, có thể sai khi
  trùng giá trị".

### 5. Vòng đời sửa token (trung thực với giới hạn browser)

```
board edit → localStorage override → live preview ✅
           → [Download tokens.json] → user chép vào project/<id>/ → reload là file thật
           → [Copy CSS/SwiftUI] → paste sang Xcode
```

Không giả vờ "save vào repo" được. Nút Download là hợp đồng rõ ràng.

## Rủi ro & cách chặn

| Rủi ro | Chặn |
|---|---|
| Override localStorage lệch file export | Chấm xanh "unsaved", export luôn từ file, README ghi rõ |
| Hex trùng tên (tra ngược sai) | Panel liệt kê mọi match + disclaimer |
| Token mới user đặt nhưng screens chưa dùng | Không sao — board hiện cả unused (mờ đi), khuyến khích dọn |
| Custom project không có tokens.json | Defaults + overrides, nút Download tạo file lần đầu |
| `?raw` json import thiếu khi thêm project mới | Copy check của `index.ts`: throw at startup, message rõ |
| Phá 4 invariants | Chỉ đổi giá trị var, không đổi cấu trúc/layer — bridge/infer không đụng |

## Phases

- **P1 — Data + layering (0.5 ngày)**: `tokens.json` ×3 (snapshot `:root`),
  `src/tokens/tokensToCss.ts` + validate, `src/projects/tokens.ts` (`?raw`
  map), `buildSrcDoc({projectTokensCss})` + export đọc JSON. Không UI mới.
  Nghiệm thu: board + export **pixel-identical** với hiện tại.
- **P2 — Hiển thị (1 ngày)**: node `tokens` trên board (swatch/spacing/radii/
  type, copy hex + SwiftUI), panel tra ngược tên token. Nghiệm thu: nhìn
  board đọc được toàn bộ variables của project.
- **P3 — Sửa + sync (1 ngày)**: inline edit hex, localStorage overrides,
  live repaint mọi node, dot unsaved, Download JSON + Copy CSS/SwiftUI.
  Nghiệm thu: đổi `--accent` → mọi màn project đó đổi màu ngay, reload giữ
  (localStorage), export sau khi chép file khớp board.

## Câu hỏi mở (cần bạn chốt trước khi code)

1. P1 snapshot full `:root` vào 3 file (an toàn, trùng lặp) hay curate ngay
   mỗi project chỉ giữ palette nó dùng (gọn, rủi ro sót var → phải rà soát)?
2. Có cần light/dark 2 bộ variables không, hay 1 bộ như hiện tại?
3. Node tokens có cho kéo/xóa không, hay pinned cứng đầu board?
