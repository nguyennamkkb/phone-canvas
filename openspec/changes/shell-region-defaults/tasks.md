# Tasks

Mỗi task ghi rõ cách kiểm chứng. Thứ tự là thứ tự phụ thuộc: nhóm 1–2 dựng khung cố định + cuộn (gate còn xanh), nhóm 3 đưa band lên shell, nhóm 4 cập nhật gate, nhóm 5 migrate màn, nhóm 6 chặn cứng và đóng gói. Mỗi nhóm tự mang test/tài liệu của phần mình.

## 1. Khung cao cố định + một vùng cuộn

- [x] 1.1 Chụp nền trước khi đụng gì: chạy `npm run gate` ghi lại đúng dòng tổng kết (`0 lỗi vùng` / `0 lỗi vùng đo được · 7 màn` / `Test Files 16 passed`, `Tests 143 passed`) và `npm run export -- --screen home` ghi kích thước PNG (kỳ vọng `780×2122`, device 390×844) — verify: các số này xuất hiện trong mục "Nền đo" của `docs/screen-regions.md` và khớp lúc kết thúc change
- [x] 1.2 `src/extractor/compose.ts`: đổi `min-height: var(--device-h)` thành `height: var(--device-h)` cho `html, body, .device`, và cho `.viewport` thêm `overflow: hidden`; cập nhật chú thích "MINIMUM height but no maximum" thành mô hình khung cố định — verify: `npm run export -- --screen home` ra PNG cao đúng `device.height × scale` (780×1688), và `evaluate`/devtools đo `.device` = 844 pt
- [x] 1.3 `src/screens/tokens.css`: ghi rõ `.body` là vùng cuộn duy nhất và `.body-fixed` không được tràn; xoá câu "The screen is NOT height-constrained … not a scrollbar" ở khối layout primitives — verify: dựng `home` ở khung cố định thấy ruột cuộn được, nav/tab đứng yên; `npm run lint` xanh
- [x] 1.4 `scripts/export/render.ts`: thêm hàm đo trả `{ deviceHeight, contentHeight }` với `contentHeight = Math.max(device.getBoundingClientRect().height, device.scrollHeight)`, vẫn chờ `document.fonts.ready` trước khi đọc — verify: `npm run gate` xanh; gọi đo trên `home` cho `deviceHeight = 844` và `contentHeight ≈ 1061`
- [x] 1.5 `scripts/region-audit.ts`: thêm check **báo cáo** (chưa fail) `scroll` (đúng một phần tử `overflow-y:auto`, là `.body`, và `.region-nav`/`.region-tabs` không nằm trong nó) và `overflow` (`.body-fixed` có `scrollHeight > clientHeight`) — verify: `npm run audit:regions` in hai dòng `scroll:`/`overflow:`; xác nhận `home`/`diary` báo tràn đúng như thực tế (chúng cao hơn khung), `camera` không báo
- [x] 1.6 Cập nhật `docs/screen-regions.md` mục `phone` và `.agents/skills/phone-canvas/SKILL.md` hard rule 7: bỏ "screen is not height-constrained", thêm hợp đồng khung cao cố định + đúng một vùng cuộn — verify: `grep -rn "NOT height-constrained\|not height-constrained" docs src .agents` chỉ còn trong `openspec/changes/shell-region-defaults/`

## 2. Export khung máy + board cuộn trong khung

- [x] 2.1 `scripts/export/cli.ts`: thêm cờ `--full` (`Options.full`, mặc định `false`), cập nhật `HELP` và ví dụ — verify: `npm run export -- --help` liệt kê `--full`; `npm run export -- --screen home --full` chạy không lỗi
- [x] 2.2 `exportFileName()` trong `cli.ts`: thêm hậu tố `-full` khi bật chế độ toàn trang — verify: thêm/bổ sung test trong `scripts/export/cli.test.ts` cho cả hai tên (`home@2x.png` và `home-full@2x.png`) và `npm test` xanh
- [x] 2.3 `scripts/export.ts`: truyền `options.full` xuống `renderPng`; mặc định emulate ở `device.height`, `--full` emulate ở `contentHeight` (hành vi cũ) — verify: `npm run export -- --screen home` → `780×1688`; `npm run export -- --screen home --full` → `780×~2122` và tên file có `-full`
- [x] 2.4 `src/canvas/PhoneNode.tsx` + `src/styles/board.css`: node vẽ đúng khung `device.height`, iframe cuộn bên trong (`phone-screen` là viewport cố định, iframe cuộn), thêm toggle mở rộng (state cục bộ) để xem hết nội dung — verify: mở board, node `home` cao đúng 844 pt và cuộn được trong khung; bật toggle thì node cao theo toàn bộ nội dung
- [x] 2.5 `src/extractor/bridge.js`: báo cáo cả `deviceHeight` và `contentHeight` (thay/chồi thêm message `type:'height'`), để toggle mở rộng biết chiều cao thật của nội dung — verify: toggle mở rộng của node `home` cao đúng chiều cao nội dung đo được, không phải 844
- [x] 2.6 Cập nhật `README.md` (mục export) và `docs/screen-regions.md`: mô tả hai chế độ export (khung máy mặc định, `--full` toàn trang) và hành vi board (khung cố định + toggle) — verify: đọc lại khớp output thật của 2.3; recipe/README trỏ đúng lệnh

## 3. Shell dựng dải nav + tab từ slot

- [x] 3.1 `src/extractor/compose.ts`: gom `[data-slot="back|title|right"]` thành `.region-nav` (thứ tự chuẩn bất kể vị trí tác giả viết) và `[data-tab]` thành `.region-tabs`, chèn **trong** `.viewport` bao quanh `.screen`; khi không có slot thì không dựng band — verify: compose một fixture có slot và kiểm DOM ra đúng `.viewport > .region-nav + .screen + .region-tabs`
- [x] 3.2 `src/extractor/compose.test.ts`: thêm test cho (a) slot hoist đúng thứ tự `back · title · right` dù tác giả viết lộn xộn, (b) không slot → không có `.region-nav`/`.region-tabs`, (c) `screenBgOf` vẫn đọc được nền trên thẻ `.screen`, (d) `.region-nav`/`.region-tabs` nằm trong `.viewport` nhưng ngoài `.screen` — verify: `npm test` xanh, số test tăng
- [x] 3.3 `src/screens/tokens.css`: thêm `.region-nav` (`flex: 0 0 auto`, row, `justify-content: space-between`, `min-height: var(--navbar-min-h)`, lề 16 pt) và `.region-tabs` (`flex: 0 0 auto`, `height: var(--tabbar-h)`), cùng class slot ruột (`.nav-back`/`.nav-title`/`.nav-right` nếu cần) — verify: `npm run lint` và `npm run lint:components` xanh
- [x] 3.4 `scripts/region-audit.ts`: thêm check `shell-band` — band tồn tại đúng khi có slot/tab, nằm trong `.viewport`, và **ngoài** phần tử cuộn — verify: `npm run audit:regions` in dòng `shell-band: ok` cho 5 màn calo-ai sau migrate; trước migrate thì ghi rõ màn còn dựng tay
- [x] 3.5 Cập nhật `docs/screen-regions.md` (mục ranh giới shell↔author + bản đồ phone: 5 dải), `.agents/skills/phone-canvas/recipes/regions.md` và hard rule 6 của `SKILL.md` (shell sở hữu cả dải nav/tab; tác giả khai `data-slot`/`data-tab`) — verify: recipe chỉ trỏ `docs/screen-regions.md` và không copy lại bảng số đo; đọc lại khớp DOM thật của 3.1

## 4. Gate v2 — lint tĩnh + audit đo

- [x] 4.1 `scripts/region-rules.ts`: thêm `SHELL_BAND_CLASSES` (navbar/navbar-float/tabbar/tabbar-float/dock), chuyển chúng ra khỏi `BAND_CLASSES`, và thay `chromeViolations` bằng `shellBandViolations` (mã `region-shell-owned`, message chỉ cách khai slot) — verify: fixture màn chứa `<nav class="navbar">` báo lỗi `region-shell-owned`; fixture chỉ có `data-slot` không báo
- [x] 4.2 `navbarViolations` trong `region-rules.ts`: đọc ruột slot thay vì `.navbar` — đếm action trong `[data-slot="right"]` ≤ 3, tiêu đề trong `[data-slot="title"]` < 15 ký tự, màn push phải có `[data-slot="back"]` dùng symbol chuẩn — verify: fixture 4 action trong slot phải báo lỗi; fixture hợp lệ không báo
- [x] 4.3 `tabbarViolations` trong `region-rules.ts`: đếm và kiểm nhãn trên `[data-tab]` (3–5, mỗi tab có icon + nhãn), giữ luật cấm tab ngang ở `form: cover` — verify: fixture 6 `data-tab` báo lỗi; fixture 4 tab có nhãn không báo
- [x] 4.4 `region-rules.ts`: thêm rule `region-slot-unknown` — `data-slot` ngoài tập `back|title|right`, hoặc `data-slot`/`data-tab` không có nội dung — verify: fixture `data-slot="titel"` báo lỗi kèm gợi ý đúng
- [x] 4.5 `undeclaredRegionViolations` + `screenViolations` trong `region-rules.ts`: đổi thông điệp thành "dải dựng tay ở mép — dùng `data-slot`/`data-tab`", cập nhật aggregator theo bộ rule mới — verify: fixture dải flex chứa nút ở mép trên không có slot báo `region-undeclared` với message mới
- [x] 4.6 `scripts/region-lint.test.ts`: cập nhật 32 fixture hiện có sang chủ sở hữu mới và thêm fixture cho `region-shell-owned`, `region-slot-unknown`, anatomy slot — verify: `npm test` xanh, không còn fixture nào giả định tác giả được khai `.navbar`
- [x] 4.7 Cập nhật danh sách mã lỗi trong header `scripts/region-lint.ts` và mục "gate kiểm gì" của `docs/screen-regions.md` — verify: mọi mã lỗi rule mới xuất hiện trong cả hai chỗ; `npm run lint:regions` in bảng breakdown đúng mã mới

## 5. Migrate màn (mỗi màn xem PNG trước khi qua màn kế)

- [x] 5.1 `project/calo-ai/screens/home.html` + `diary.html`: bỏ `.navbar`/`.tabbar`, khai `[data-slot]`/`[data-tab]`, chuyển thân `.body-fixed` → `.body` (cuộn) — verify: `npm run export -- --screen home` và `--screen diary` rồi **xem PNG**; `npm run lint:regions` và `npm run audit:regions` xanh cho cả hai
- [x] 5.2 `project/calo-ai/screens/camera.html`: khai nav slot, giữ `.bottom-cta` (không phải tab) — verify: export + xem PNG; audit `overflow: ok` (camera không được tràn)
- [x] 5.3 `project/calo-ai/screens/confirm.html` + `textvoice.html`: khai nav slot; dùng `.body` nếu nội dung cao hơn khung, giữ `.body-fixed` nếu vừa khung — verify: export + xem PNG cả hai; audit không báo `region-overflow`
- [x] 5.4 `project/foundation-kit`: chuyển 2 màn showcase và 2 component `navbar.html`/`tabbar.html` sang mô hình slot (hoặc bỏ component nav/tab nếu shell lo hoàn toàn) — verify: `npm run export -- --project foundation-kit` + xem PNG; `npm run lint:components` không cảnh báo mới
- [x] 5.5 Cả repo: `npm run gate` xanh với số test đã tăng; `npm run audit:regions` in `0 lỗi vùng đo được · 7 màn`, `chrome: ok`, `background: ok`, `region-order: ok`, `scroll: ok`, `overflow: ok`, `shell-band: ok` — verify: dán nguyên output hai lệnh vào `docs/screen-regions.md` mục "Nền đo" và khớp số nền ở task 1.1

## 6. Chặn cứng + đóng gói

- [x] 6.1 Chuyển `region-overflow`, `scroll` và `shell-band` từ báo cáo sang **hard fail** trong `scripts/region-audit.ts`, xoá đường báo cáo — verify: `npm run gate` exit 0; cố tình để một `.body-fixed` tràn khung thì gate đỏ kèm selector + chiều cao
- [x] 6.2 Đọc lại toàn bộ `docs/screen-regions.md` khớp hành vi v2 (5 dải, slot, cuộn, export, phạm vi phone-first; Duo/tablet chưa lên shell) — verify: không còn câu nào mô tả tác giả sở hữu `.navbar`/`.tabbar` hay "height-constrained"; mỗi số đo có ô nguồn
- [x] 6.3 Cập nhật `README.md` mục "Screen regions" và `## The five invariants` nếu bị ảnh hưởng (invariant "safe areas explicit" giữ; bổ sung dòng về khung cao cố định + cuộn) — verify: `npm run typecheck` xanh; đọc README khớp bảng trong `specs/screen-regions/spec.md`
- [x] 6.4 `openspec validate shell-region-defaults --strict` và `openspec status --change shell-region-defaults` báo hợp lệ, 4/4 artifact, mọi task trong file này đã tick — verify: hai lệnh in kết quả thành công
- [x] 6.5 Xác nhận điều kiện archive (thiết kế Decision 9): delta dùng `MODIFIED`/`REMOVED` nên `screen-region-standard` phải được archive **trước** để tạo spec gốc `openspec/specs/screen-regions/` — verify: `openspec list --specs` có `screen-regions` trước khi chạy `openspec archive shell-region-defaults`; nếu chưa, archive v1 trước
