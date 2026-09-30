# Proposal

## Why

`shell-region-defaults` (v2) đã chuyển band nav/tab về cho shell, nhưng **ruột band vẫn là bản sao ở từng màn**, và v2 để lại năm chỗ tự mâu thuẫn:

1. `scripts/new-screen.ts` vẫn sinh `<header class="navbar">` — màn mới sinh ra **đỏ ngay** khi chạy `lint:regions`.
2. `scripts/region-audit.ts` còn hai check chết: `region-order` probe `.navbar`/`.tabbar` mà compose không bao giờ phát ra nữa, `handBuilt` luôn `false`. Tầng đo **không đo hình học** của band shell.
3. `src/screens/tokens.css` còn style 12 class mà lint cấm tác giả viết (`.navbar`, `.tabbar`, `.navbar-float`, `.tabbar-float`, `.dock`, `.tab-item`, `.tab-slot`, `.tabbar-light`, `.tabbar-dark`…), tức ba họ band song song.
4. `.gemini/skills/phone-canvas/` là bản sao stale của skill, vẫn dạy `.navbar` / `.tabbar-light`.
5. Danh tính tab chỉ nằm trong chuỗi: `data-tab` là marker rỗng, "Home/Scan/Diary/Me" và `aria-label="…tab 2 trên 4"` chép tay ở từng màn, `is-active` chép tay. Đổi tab set = sửa nhiều file **và** sửa tay số thứ tự.

Hệ quả thực tế: một màn mới không thể sinh ra đúng chuẩn, và thay đổi nhỏ nhất của điều hướng (thêm/xếp lại tab) là một cuộc sửa tay nhiều màn.

Change này làm chrome của app thành **một nguồn duy nhất** theo project, cho tab một **danh tính** thay vì chuỗi, và trả nốt nợ v2 để không còn đường nào sinh ra màn phạm luật.

## What Changes

- **Chrome dùng chung theo project.** `project/<id>/components/app-nav.html` (nav push tối thiểu: back + tiêu đề) và `app-tabs.html` (bộ destination của app). Màn dùng bằng `<!-- @component app-tabs -->` và **ghi đè từng slot**: slot màn khai thắng, kể cả slot rỗng (`<span data-slot="title"></span>` = "để trống, đừng điền"); slot không khai thì ăn mặc định. Với tab (danh sách), màn khai `data-tab` thì cả danh sách của màn thắng; vừa include `app-tabs` vừa tự khai `data-tab` là **lỗi nhập nhằng**.
- **BREAKING — tab có danh tính.** `data-tab` mang **slug destination** (`data-tab="home"`), không còn marker rỗng. Màn khai `data-tab-active="diary"` trên `.screen`; shell tự gắn `is-active` + `aria-current="page"`, tự tính `aria-label` và thứ tự "tab N trên M". Thêm tab chỉ còn là sửa **một** file.
- **Hợp đồng thân màn.** Màn SHALL có đúng **một** thân `.body` (cuộn) hoặc `.body-fixed` (vừa khung).
- **Region lint phủ component.** Hiện `data-slot="titel"` hay `.navbar` nằm trong file component **lọt hoàn toàn**; luật vùng phải áp cho cả `project/*/components/*.html`.
- **`new-screen --kind root|push|modal|bare`.** Màn sinh ra đúng chuẩn ngay (slot + thân + include chrome đúng loại), kèm test chạy generator rồi lint output — generator không thể drift nữa.
- **Dọn nợ v2.** `new-screen` sinh slot thay vì `<header class="navbar">`; `region-order` sống lại và đo hình học thật của `.region-nav` / `.region-tabs` so với `.screen`; xoá `handBuilt`; gộp ba họ band còn `.region-nav` / `.region-tabs` (+ `.is-glass`) và xoá vocabulary chết khỏi `tokens.css`; xoá bản sao skill `.gemini/` (đã grep 0 tham chiếu).
- **Shell phát band có ngữ nghĩa.** `.region-nav` / `.region-tabs` là `<nav>` kèm `aria-label`, vì shell sở hữu band và tác giả không thể thêm ngữ nghĩa cho chúng.

Không đổi: định dạng header `<!-- pc {…} -->`, `.device`, cơ chế `data-slot="back|title|right"`, và mọi thứ thuộc iPad/Duo.

## Capabilities

### New Capabilities

_(không có — cơ chế này là một phần của chuẩn vùng màn hình, không phải capability mới)_

### Modified Capabilities

- `screen-regions`: bổ sung nguồn chrome dùng chung và luật ghi đè slot; danh tính tab + trạng thái active; hợp đồng "đúng một thân"; phạm vi lint phủ file component; và tiêu chí audit phải đo được hình học band do shell dựng. Đồng thời thu hẹp vocabulary band còn đúng một họ `.region-*`, và bắt buộc generator sinh ra output hợp lệ.

## Impact

- **Generator**: `scripts/new-screen.ts` (thêm `--kind`, sửa template phone), `scripts/project.ts` (không đổi hành vi).
- **Compose**: `src/extractor/compose.ts` — đổi thứ tự nhấc slot (nhấc của màn trước, expand component sau, điền slot thiếu), tính `is-active` / `aria-current` / `aria-label` cho tab, phát `<nav>` + `aria-label` cho hai band.
- **Lint**: `scripts/region-rules.ts` (slot mới, `data-tab` có giá trị, `data-tab-active` hợp lệ, một thân, phủ component), `scripts/region-lint.ts`.
- **Audit**: `scripts/region-audit.ts` — `region-order` đo `.region-nav`/`.screen`/`.region-tabs` thật; xoá probe `.navbar`/`.tabbar` và `handBuilt`.
- **CSS**: `src/screens/tokens.css` — gộp band về `.region-nav` / `.region-tabs` (+ `.is-glass`), xoá vocabulary chết và token mồ côi.
- **Nội dung**: `project/calo-ai/components/{app-nav,app-tabs}.html` (mới), 5 màn calo-ai migrate, `project/foundation-kit/` làm bản tham chiếu.
- **Test**: `compose` merge/override, `region-lint` phủ component, generator-compliance, export smoke.
- **Docs/skill**: `docs/screen-regions.md`, `.agents/skills/phone-canvas/**` (SKILL.md + recipes); xoá `.gemini/skills/phone-canvas/`.
- **OpenSpec**: change này **chỉ archive được sau khi** `screen-region-standard` rồi `shell-region-defaults` được archive theo thứ tự, vì `openspec/specs/` hiện chỉ có `.gitkeep` và delta này dùng MODIFIED/REMOVED.
