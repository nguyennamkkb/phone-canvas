# Design

## Context

Xem `proposal.md` (Why) cho động cơ và bảng số liệu. Các ràng buộc kỹ thuật quan sát được, quyết định toàn bộ cách làm:

- **Một composer duy nhất, thuần chuỗi.** `composeScreenDoc()` (`src/extractor/compose.ts:260-318`) là định nghĩa duy nhất của một tài liệu màn hình, dùng chung bởi board (`buildSrcDoc`), exporter (`scripts/export.ts:129-142`) và audit (`scripts/region-audit.ts:299-309`). Cấu trúc hiện tại là 3 dải: `.device > .statusbar + .viewport(.screen) + .home-indicator` (`compose.ts:68-111`, `293-317`). Mọi thay đổi cấu trúc **phải** nằm trong hàm này, nếu không ba đường sẽ lệch nhau.
- **Chiều cao đang mở có chủ đích, và nó xuyên qua 4 chỗ.** `compose.ts:69-74` (`min-height`), `PhoneNode.tsx:57` (`contentH = sizes[id] ?? device.height`), `bridge.js` (post `height`), `render.ts:74-75` (re-emulate theo `contentHeight`). Đổi sang cao cố định là sửa cả 4.
- **Bridge chỉ đo trong `.viewport`.** `bridge.js` scope vào `viewportEl` (`bridge.js:69,105`), nên `.statusbar`/`.home-indicator` **không** lọt vào panel spec. Đây là ràng buộc quyết định chỗ đặt dải nav/tab (xem Decision 2).
- **`screenBgOf()` đọc thẻ `.screen`.** Nó bắt tag có `class="…screen…"` (`compose.ts:165`, `230-258`) để phát nền lên `.device`. Thẻ `.screen` phải còn tồn tại và còn mang nền inline.
- **Từ điển vùng và gate 2 tầng đã có.** `region-rules.ts` (REGION_CLASSES, BAND_CLASSES, CHROME_PATTERNS, `undeclaredRegionViolations`, `navbarViolations`, `tabbarViolations`, `touchFloorViolations`), `region-lint.ts` (GUARANTEED_BY), `region-audit.ts` (PROBE, `checkScreen`, EXEMPTIONS). v2 thay **chủ sở hữu** của band chứ không bỏ cơ chế.
- **`.body` đã có sẵn nhưng chưa bao giờ cuộn.** `tokens.css:188-196` khai `overflow-y:auto`, nhưng không có ancestor bị chặn chiều cao. 7/7 màn dùng `.body-fixed` (`tokens.css:198-207`).
- **Quy ước test**: vitest, `describe('<tên>')` + `it('<hành vi>')` phẳng, fixture là object literal; test cần Chrome tự skip kèm `console.warn`. Hiện 16 file / **143 test**.
- **Đường ống đo dùng lại được**: `scripts/export/{site,cdp,render}.ts`, `evaluate()`, `waitForHeight()`, `startSite()`, `launch()`.

## Goals / Non-Goals

**Goals**

- Shell dựng dải nav (3 slot) và tab, đứng yên ngoài vùng cuộn; tác giả chỉ khai ruột.
- Khung cao cố định + **đúng một** vùng cuộn, không đổi định dạng header hay registry.
- Panel spec vẫn đọc được nội dung nav/tab (không đánh rơi khả năng spec vì band lên shell).
- Export và board cùng một sự thật: mặc định khung máy, `--full`/toggle cho toàn trang.

**Non-Goals**

- iPad sidebar và Duo rail/split **chưa** lên shell đợt này; luật của chúng giữ nguyên, chưa có màn sống.
- Không thêm khoá header `pose`/`regions`; không thêm preset device.
- Không đổi `screenBgOf`, luật dải chia/nếp gập, định dạng PNG, panel spec.
- Không cưỡng chế `position:absolute` toàn cục (ngoài phạm vi v1, giữ nguyên).

## Decisions

1. **Slot khai bằng thuộc tính `data-slot` / `data-tab`, compose hoist.**
   Tác giả viết slot ngay trong `.screen`; `composeScreenDoc` gom `[data-slot="back|title|right"]` thành `.region-nav` (xếp theo thứ tự chuẩn bất kể vị trí tác giả viết) và `[data-tab]` thành `.region-tabs`.
   *Cân nhắc khác*: (a) directive `<!-- @region nav -->` — thêm một family directive mới song song `@component`, tường minh hơn nhưng nặng và tác giả phải nhớ block; (b) khoá header `nav`/`tabs` — đổi `SCREEN_KEYS` và `derive.ts`, đúng thứ v1 đã bác (`design.md` v1 decision 3); (c) tác giả vẫn viết `.navbar` rồi compose hoist — ngược yêu cầu "khai band = lỗi" và che mất lỗi cấu trúc. → Chọn `data-slot` vì không đổi registry, không thêm directive family, và cái sai (khai band) vẫn là cái lint bắt được.

2. **Dải nav/tab nằm trong `.viewport`, ngoài `.screen`; statusbar/home-indicator vẫn ngoài `.viewport`.**
   Cấu trúc v2:
   ```
   .device (height: var(--device-h))
   ├── .statusbar                 flex:0 0 auto   SHELL
   ├── .viewport                  flex:1 1 auto; min-height:0; overflow:hidden
   │   ├── .region-nav            flex:0 0 auto   SHELL (từ [data-slot])
   │   ├── .screen                flex:1 1 auto; min-height:0  (tác giả)
   │   │    └── .body { overflow-y:auto }   ← VÙNG CUỘN DUY NHẤT
   │   └── .region-tabs           flex:0 0 auto   SHELL (từ [data-tab])
   └── .home-indicator            flex:0 0 auto   SHELL
   ```
   *Vì sao không đặt band ở cấp `.device`*: `bridge.js` chỉ đo trong `.viewport`, nên band đặt ngoài `.viewport` sẽ **rớt khỏi panel spec** — không còn click vào nút nav để lấy spec SwiftUI. Đặt band trong `.viewport` nhưng ngoài `.screen`/`.body` giữ được cả hai: band đứng yên (không nằm trong phần tử cuộn) mà vẫn được spec. *Hệ quả*: check `chrome` của audit vẫn chỉ áp cho `.statusbar`/`.home-indicator`; thêm check mới "band ngoài vùng cuộn".

3. **`.device` cao cố định; `.body` là vùng cuộn; `.body-fixed` không được tràn.**
   `compose.ts` đổi `min-height: var(--device-h)` → `height: var(--device-h)` cho `html/body/.device`, và `.viewport { overflow: hidden }`. Chuỗi flex giải ra chiều cao hữu hạn nên `.body { overflow-y:auto }` cuộn thật.
   *Cân nhắc khác*: cuộn ở `.screen` thay vì `.body` — mất mô hình "middle band" mà SwiftUI map thẳng (`.frame(maxHeight:.infinity)`), và không phân biệt được màn một trang. Giữ `.body` / `.body-fixed` như cũ. *Hệ quả có chủ đích*: `.body-fixed` cao hơn khung sẽ bị **cắt**, nên tầng đo thêm `region-overflow`; đây là lỗi, không phải cuộn ngầm.

4. **Đo chiều cao nội dung tách khỏi chiều cao khung.**
   `waitForHeight` hiện trả `.device` bounding height (`render.ts:22-40`). Khi khung cố định, số đó luôn = `device.height`. Thêm hàm đo `{ deviceHeight, contentHeight }` với `contentHeight = Math.max(device.getBoundingClientRect().height, device.scrollHeight)`.
   `renderPng` nhận thêm tham số chế độ: mặc định emulate ở `device.height`; `--full` emulate ở `contentHeight` (hành vi cũ). `PhoneNode` dùng `contentHeight` chỉ khi node ở trạng thái mở rộng.

5. **Export/board: một cờ, hai chế độ, tên file phân biệt.**
   `cli.ts` thêm `--full` (`Options.full`, mặc định `false`). `exportFileName` thêm hậu tố `-full` khi bật. Board thêm toggle mở rộng trên node (state cục bộ trong `PhoneNode`, không cần đổi `BoardContext`).
   *Vì sao không luôn xuất hai bản*: gấp đôi số file `exports/` cho một nhu cầu thỉnh thoảng; cờ tường minh rẻ hơn.

6. **Lint v2: band shell vào danh sách "shell sở hữu", không bỏ cơ chế.**
   `navbar`/`navbar-float`/`tabbar`/`tabbar-float`/`dock` chuyển từ `BAND_CLASSES` sang một hằng mới `SHELL_BAND_CLASSES`, và `chromeViolations` mở rộng thành "khai class shell sở hữu = lỗi" (message riêng, mã `region-shell-owned`). `REGION_CLASSES` giữ nguyên (arrangement/rail/sidebar còn của tác giả). `undeclaredRegionViolations` đổi thông điệp: dải flex ở mép chứa control mà **không phải slot** → "dùng `data-slot`, không dựng tay". `navbarViolations` đổi nguồn dữ liệu: thay vì tìm `.navbar`, nó áp anatomy lên **ruột slot** (đếm `[data-slot="right"]` / phần tử trong đó, tiêu đề trong `[data-slot="title"]`, back trong `[data-slot="back"]`). `tabbarViolations` tương tự đọc `[data-tab]`.
   *Cân nhắc khác*: giữ `.navbar` và chỉ thêm slot như một lựa chọn → hai đường làm một việc, đúng thứ v1 decision 5 đã bác.

7. **Audit v2: thêm 3 check đo được.**
   `chrome` (giữ), `background` (giữ), `region-order` (giữ), `division-band` (giữ) + mới: `scroll` (đúng một phần tử `overflow-y:auto` và đó là `.body`; `.region-nav`/`.region-tabs` không nằm trong nó), `overflow` (`.body-fixed` có `scrollHeight > clientHeight` → lỗi), `shell-band` (nav/tab tồn tại đúng khi có slot/tab, và nằm trong `.viewport` nhưng ngoài vùng cuộn).
   *Vì sao "đúng một scroller"*: nhiều vùng cuộn lồng nhau là lỗi Apple hay gặp và không suy ra được từ văn bản; đo mới biết.

8. **Scope phone trước, Duo/tablet giữ nguyên.**
   Không đụng `.split`/`.rail`/`.sidebar` đợt này. `docs/screen-regions.md` ghi rõ phone là form factor đã lên shell; Duo/tablet giữ luật nhưng chưa có màn sống lẫn chưa lên shell. Requirement "bộ ba màn Duo là mẫu" bị REMOVED (màn đã xoá) và thay bằng "màn phone lõi là mẫu".

9. **Thứ tự archive: v1 trước, v2 sau.**
   Delta của change này dùng `## MODIFIED`/`## REMOVED` nhắm capability `screen-regions`, mà `openspec/specs/` hiện trống (v1 chưa archive). `openspec validate` xanh nhưng `openspec archive` sẽ từ chối cho tới khi `screen-region-standard` được archive để tạo spec gốc. Đây là **điều kiện tiên quyết**, không phải tuỳ chọn.

## Risks / Trade-offs

- [Risk] Band lên shell làm rớt khả năng spec nav/tab → Mitigation: Decision 2 đặt band trong `.viewport`; thêm task kiểm bằng cách click một nút nav trên board và xác nhận panel spec hiện spec.
- [Risk] `.body-fixed` bị cắt âm thầm ở màn hiện có (7/7 đang dùng `.body-fixed`) → Mitigation: audit `region-overflow` chạy trên mọi màn ngay từ bước 1, và bước migrate xem PNG từng màn trước khi qua bước sau.
- [Risk] Đổi `min-height`→`height` phá các màn cao hơn khung mà chưa migrate → Mitigation: làm bước 1–2 (khung + đo) trước, bật `region-overflow` ở mức báo cáo, migrate xong mới chặn cứng (giống chiến lược warn→error của v1).
- [Risk] `data-slot` là chuỗi tự do, tác giả gõ sai (`data-slot="titel"`) thì slot biến mất âm thầm → Mitigation: lint báo `data-slot` không thuộc `back|title|right`, và `data-tab` rỗng thì báo; audit `shell-band` báo khi có `data-slot` mà không dựng được `.region-nav`.
- [Risk] `render.ts` đổi sang đo `scrollHeight` có thể sai khi chưa layout xong → Mitigation: `waitForHeight` vẫn chờ fonts + layout rồi mới đọc `scrollHeight`, và giữ nguyên ngưỡng poll.
- [Risk] Archive v2 trước khi archive v1 sẽ bị từ chối → Mitigation: ghi rõ ở Decision 9 và trong tasks bước cuối.
- [Risk] Board đổi sang khung cố định làm khó soi màn dài → Mitigation: toggle mở rộng (Decision 5).

## Migration Plan

1. **Khung cố định + một vùng cuộn + audit `overflow`/`scroll` (báo cáo, chưa đỏ)**: `compose.ts`, `tokens.css`, `render.ts` đo hai chiều cao. Gate vẫn xanh.
2. **Export `--full` + board toggle + khung cố định**: `cli.ts`, `export.ts`, `PhoneNode.tsx`, `board.css`.
3. **Shell dựng band + slot**: `compose.ts` gom `[data-slot]`/`[data-tab]`, `tokens.css` thêm class slot + band.
4. **Lint/audit v2**: đổi chủ sở hữu band, anatomy slot, 3 check đo mới; cập nhật fixture test.
5. **Migrate 7 màn + 2 component kit**: bỏ `.navbar`/`.tabbar`, khai slot; `home`/`diary` chuyển `.body`; xem PNG từng màn.
6. **Chặn cứng + docs**: bật error, xoá đường báo cáo, viết lại `docs/screen-regions.md`, recipe, README.

Rollback: bỏ `npm run export` mặc định khung máy (đổi mặc định về `--full`) và tắt `region-overflow`; các class slot/band là thêm mới nên màn cũ vẫn chạy. Không có di trú dữ liệu.

## Open Questions

- Có nên đưa tiếp `.rail` (Duo) và `.sidebar` (tablet) lên shell ở đợt sau không? Đợt này chừa chỗ trong cấu trúc `.viewport`; quyết định khi có bề mặt Duo/tablet thật.
- Sticky/glass: `.navbar-float`/`.tabbar-float` hiện in-flow (v1). Khi band do shell dựng, có nên cho phép một biến thể "band trong suốt nổi trên nội dung cuộn" không, và nếu có thì đo `division-band`/`overflow` ảnh hưởng thế nào? Chưa cần cho v2 phone.
