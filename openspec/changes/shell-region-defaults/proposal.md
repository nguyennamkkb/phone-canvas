# Proposal

## Why

Chuẩn vùng v1 (`screen-region-standard`, commit `afb3d00`) đặt **mọi dải cố định vào tay tác giả** và để `.device` cao **mở**. Hệ quả đo được trên repo hiện tại (7 màn: 5 `calo-ai` + 2 `foundation-kit`):

| Hiện trạng | Số liệu / nguồn |
|---|---|
| Shell chỉ sở hữu 2 dải OS | `.device > .statusbar + .viewport + .home-indicator` (`src/extractor/compose.ts:68-111`) |
| Màn tự khai navbar/tabbar trong `.body-fixed` | **7 / 7** — không màn nào dùng slot hay band do shell dựng |
| Màn dùng `.body` (cuộn) | **0 / 7** — tất cả `.body-fixed`; `.body` khai `overflow-y:auto` (`tokens.css:188-196`) nhưng **không bao giờ cuộn được** |
| PNG là toàn bộ nội dung, không phải khung máy | `scripts/export/render.ts:74-75` re-emulate theo `contentHeight`; `home@2x.png` = **780×2122** trong khi device `reference` chỉ 390×844 |
| Board cao theo nội dung | `src/canvas/PhoneNode.tsx:57` `contentH = sizes[id] ?? device.height` |

Nghĩa là: mỗi màn vẫn phải tự dựng lại navbar/tabbar (nay còn bị lint bắt buộc phải khai), và **không bao giờ thấy hành vi cuộn của iPhone thật** — `docs/screen-regions.md` còn ghi thẳng *"The screen is NOT height-constrained … a 2000pt-tall rectangle, not a scrollbar"* (`tokens.css:171-174`).

Bây giờ là lúc: vùng đã có từ điển dùng chung và gate 2 tầng, nên **nâng dải điều hướng lên shell** và **bật khung cao cố định + cuộn** là bước tự nhiên. Đây đúng là hướng mà Open Question #2 của v1 đã chỉ: *"nếu sau này muốn shell dựng thì mở `.device` thêm một dải và bỏ `.rail` khỏi màn hình"* (`design.md:86`).

## What Changes

- **BREAKING — shell sở hữu dải điều hướng.** `.navbar` / `.tabbar` / `.navbar-float` / `.tabbar-float` / `.dock` do shell dựng và định vị; tác giả khai một trong các class này trong màn là **lỗi**. Tác giả khai **ruột** bằng slot: `data-slot="back|title|right"` (đi vào `.region-nav`) và `data-tab` (đi vào `.region-tabs`). Không đổi định dạng header `<!-- pc {…} -->` (vẫn 3 khoá) — slot nằm trong body.
- **BREAKING — màn cao cố định + một vùng cuộn.** `.device` dùng `height` (không còn `min-height`); `.body` cuộn thật; `.body-fixed` **không được tràn** khung (lỗi đo được nếu tràn). Nav/tabbar đứng yên ngoài vùng cuộn, đúng như iPhone.
- **Export khung máy mặc định.** `npm run export` chụp đúng `device.width × device.height`; `--full` mới chụp toàn trang; file phân biệt bằng hậu tố `-full`.
- **Board cuộn trong khung.** Node vẽ đúng khung `device.height`, iframe cuộn bên trong, kèm toggle mở rộng xem hết nội dung.
- **Gate v2.** Tĩnh: tác giả khai band shell = lỗi; anatomy slot (≤ 3 action phải, title 1 dòng, push có back). Đo: band ngoài vùng cuộn, đúng **một** scroller, `.body-fixed` không tràn.
- **Thu hẹp scope: phone trước.** iPad sidebar và Duo rail/split **giữ nguyên luật đã có** nhưng chưa lên shell đợt này; chừa sẵn chỗ trong DOM. Bỏ yêu cầu "bộ ba màn Duo là mẫu tham chiếu" (3 màn đó đã xoá 30/09/2026), thay bằng màn phone lõi làm mẫu.

## Capabilities

### New Capabilities

- (không có)

### Modified Capabilities

- `screen-regions`: dải điều hướng chuyển từ tác giả sang shell qua slot (`data-slot` / `data-tab`); màn cao cố định với đúng một vùng cuộn; export khung máy + `--full`; gate 2 tầng cập nhật theo sở hữu mới; bỏ yêu cầu "bộ ba màn Duo là mẫu tham chiếu" (màn đã xoá) và thay bằng màn phone lõi.

## Impact

- **Sửa**: `src/extractor/compose.ts` (cấu trúc 5 dải, gom slot, `height` cố định), `src/screens/tokens.css` (`.body` cuộn, slot class, band shell), `src/canvas/PhoneNode.tsx` + `src/styles/board.css` (khung cố định + cuộn + toggle), `scripts/export.ts` + `scripts/export/{cli,render}.ts` (cờ `--full`, đo content height), `scripts/region-rules.ts` + `scripts/region-lint.ts` + `scripts/region-lint.test.ts` + `scripts/region-audit.ts` (luật v2), `docs/screen-regions.md`, `.agents/skills/phone-canvas/{SKILL.md,recipes/regions.md}`, `README.md`.
- **Migrate**: `project/calo-ai/screens/*.html` (5 màn), `project/foundation-kit/screens/*.html` (2 màn) + `project/foundation-kit/components/navbar.html`, `tabbar.html`.
- **Không đổi**: định dạng header `<!-- pc {…} -->` (3 khoá), cấu trúc registry (`src/projects/*`), `screenBgOf` / nền dải OS, luật Duo/tablet (chỉ đổi chủ sở hữu trong tương lai), panel spec, không thêm preset device.
- **Số nền để so**: `npm run gate` xanh, `vitest` 16 file / **143 test**, `npm run audit:regions` in `0 lỗi vùng đo được · 7 màn`.
