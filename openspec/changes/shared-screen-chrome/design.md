# Design

## Context

Xem `proposal.md` — Why để biết động cơ. Phần đây chỉ ghi trạng thái và ràng buộc định hình cách làm.

Điểm nối đã có sẵn, quyết định độ khó của change này:

- `composeScreenDoc` (`src/extractor/compose.ts:331`) là **hàm duy nhất** cả board lẫn exporter gọi. Mọi thay đổi ở đây tự động áp cho cả hai phía.
- `expandComponents` (`src/components/expand.ts:39`) là phép `String.replace` đệ quy thuần. Nó **không đánh dấu nguồn gốc** nội dung được chèn.
- Thứ tự hiện tại: expand component (`compose.ts:348`) → nhấc `data-slot` (`:357`) → nhấc `data-tab` (`:358`). Vì expand chạy trước, màn và component trộn vào nhau trước khi nhấc — nên chưa có luật ghi đè.
- `lint:components` **đã** báo lỗi cứng khi `@component x` không tồn tại (`scripts/components-lint.ts:96`) và khi có vòng (`:126`). Include trỏ vào file không tồn tại không phải lỗ hổng im lặng.
- `region-rules.ts` chia hai nhóm class: `SHELL_BAND_CLASSES` (tác giả viết = lỗi) và `DECLARED_BAND_CLASSES`. `.tab-item` còn nằm trong `GUARANTEED_BY`/danh sách tương tác (`:78`, `:84`).
- `openspec/specs/` hiện chỉ có `.gitkeep`: chưa có base spec nào được materialize. `screen-region-standard` (v1, 37/37) và `shell-region-defaults` (v2, 34/34) đều đã xong nhưng chưa archive.

Ràng buộc:

- `compose.ts` phải giữ **thuần** (unit-test bằng dữ liệu, không I/O).
- Tác giả không được viết class band; shell sở hữu band và mọi thứ về định vị của chúng.
- Phạm vi **phone**. iPad/Duo giữ nguyên luật cũ, không chuyển sang shell trong change này.

## Goals / Non-Goals

**Goals:**

- Chrome của một app (nav mặc định + bộ destination) sống ở **một chỗ** trong project và được màn tái sử dụng, có ghi đè từng phần.
- Danh tính tab là **dữ liệu**, không phải chuỗi chép tay: trạng thái active, `aria-label` và thứ tự do shell suy ra.
- Màn mới sinh ra **hợp lệ ngay**, và điều đó được **chứng minh bằng test**, không phải bằng niềm tin.
- Không còn thành phần nào trong repo vừa bị lint cấm vừa còn được style/đo/dạy.
- Tầng đo kiểm tra được **hình học thật** của band do shell dựng.

**Non-Goals:**

- Không tham số hoá component (không `@component nav title="…"`).
- Không component xuyên project.
- Không đổi định dạng header `<!-- pc {…} -->`, không đổi `.device`, không đổi cơ chế `data-slot="back|title|right"`.
- Không đụng band của iPad/Duo.
- Không làm glass band (`.is-glass` chỉ là chỗ giữ tên, chưa dựng).
- Không scaffold chrome tự động khi tạo project.

## Decisions

### D1. Chrome là hai component rời, theo project

`project/<id>/components/app-nav.html` và `app-tabs.html`.

Vì sao không phải một `app-shell` gộp: `camera`/`confirm`/`textvoice` **không có tab**, nên một component gộp sẽ nhét 4 tab vào chúng; tách rời cho phép chọn từng dải. Vì sao theo project chứ không toàn cục: bộ destination là của app, không phổ quát, và component xuyên project phá nguyên tắc cô lập hiện có. Vì sao không nhét vào `project.json`: đó là metadata, không phải chỗ chứa markup — sẽ mất syntax highlighting, khuôn mẫu component và lint.

**Ai dùng cái nào (đo từ 5 màn thật, không suy đoán):** `home`/`diary` có tab và nav riêng (date switcher) → chỉ include `app-tabs`. `confirm`/`textvoice` lặp **y hệt** nhau ở cặp "back = Hủy + tiêu đề" → include `app-nav` và ghi đè tiêu đề, nên markup "Hủy" chỉ còn một chỗ. `camera` có nav riêng và không tab → không include file nào. Kit `foundation-kit` giữ một bộ destination **ví dụ** trong `app-tabs.html` để copy sang project mới.

Hệ quả: một file chrome không có ai include là file chết — `camera` cố tình không include `app-nav`, và điều đó được ghi ở đây thay vì để lại một component không dùng.

### D2. Hai lượt nhấc, màn thắng từng slot

Thứ tự mới trong `composeScreenDoc`:

1. nhấc `data-slot` / `data-tab` **của màn** khỏi html;
2. `expandComponents` trên phần còn lại (component chèn mặc định của nó);
3. nhấc `data-slot` / `data-tab` từ phần đã expand, **chỉ điền slot còn thiếu**;
4. dựng `.region-nav` (thứ tự `back · title · right`) và `.region-tabs`.

Vì sao không cần đánh dấu nguồn gốc: sau bước 1, slot của màn đã rời khỏi html, nên bước 3 chỉ còn thấy slot do component chèn. Không phải chèn marker `<!-- @from:id -->` rồi strip — vừa làm bẩn đầu ra vừa phải sửa `expand.ts` thuần và test của nó. Đổi thứ tự là đủ và rẻ hơn.

Luật: **màn khai slot nào thì slot đó của màn thắng, kể cả slot rỗng**; slot không khai thì lấy mặc định. Slot rỗng là cơ chế "để trống có chủ đích": `home` khai back + right mà không có tiêu đề, nếu slot rỗng không thắng thì nó sẽ bị nhét tiêu đề mặc định của component vào.

Với tab — một **danh sách**, không phải slot tên — luật khác: màn khai bất kỳ `data-tab` nào thì **cả danh sách** của màn thắng. Màn vừa include `app-tabs` vừa tự khai `data-tab` là **lỗi nhập nhằng**, không phải trường hợp được merge: hai nguồn cùng định nghĩa một danh sách thì luôn là nhầm lẫn.

Loại bỏ: ghi đè cả dải (mất khả năng giữ back mặc định mà đổi mỗi tiêu đề); include tường minh không merge (không có "ghi đè", đúng thứ yêu cầu đặt ra).

### D3. Tab có danh tính: `data-tab="<slug>"` + `data-tab-active`

`data-tab` **đổi từ marker rỗng sang mang slug destination** (`data-tab="home"`). Màn khai destination đang mở bằng `data-tab-active="diary"` trên `.screen`.

Shell suy ra: class `is-active`, `aria-current="page"`, `aria-label` (tên destination + vị trí) và thứ tự "tab N trên M". Tên destination lấy từ chính tab button trong `app-tabs.html`.

Vì sao không giữ marker rỗng: danh tính tab hiện chỉ nằm trong chuỗi `aria-label` chép tay, kèm số thứ tự phải sửa bằng tay mỗi lần thêm tab — đúng nguồn drift mà change này tồn tại để xoá. Vì sao không dùng `data-tab-index="2"`: vẫn phải sửa tay khi xếp lại tab, mà lại không nói được tab đó *là gì*.

Đây là **BREAKING** với tác giả, chấp nhận được vì chỉ 2 màn dùng `data-tab`, và lint sẽ báo lỗi kèm cách sửa.

### D4. "Đúng một thân" là luật lint, không phải shell bọc hộ

Màn SHALL có đúng một `.body` hoặc `.body-fixed`. Vì sao không để shell tự bọc `.body`: nó che mất việc màn quên khai thân, và xoá luôn khả năng diễn đạt `.body-fixed` (thân vừa khung, không cuộn) — hai chế độ này là quyết định của tác giả, không phải mặc định của shell.

### D5. Một họ band duy nhất: `.region-nav` / `.region-tabs` (+ `.is-glass`)

`.navbar` + `.navbar-float` gộp thành `.region-nav`; `.tabbar` + `.tabbar-float` + `.dock` gộp thành `.region-tabs`. Xoá hẳn khỏi `tokens.css`: `.tab-item`, `.tab-item.is-on`, `.dock-item`, `.dock-item.is-on`, `.dock-plus`, `.tab-slot`, `.tab-slot.is-on`, `.tabbar-light`, `.tabbar-dark` (grep 0/7 màn).

Tên cũ **vẫn ở lại trong `SHELL_BAND_CLASSES`**: một tác giả viết `class="navbar"` phải nhận lỗi to, chứ không phải một `div` không style (thất bại im lặng). Vì sao không xoá luôn khỏi danh sách cấm: danh sách cấm là thứ bảo vệ, không phải thứ trang trí.

Loại bỏ: giữ ba họ song song như hiện tại — tức tiếp tục style những class mà chính lint cấm viết.

### D6. `new-screen --kind` là tiện ích generator, không phải khái niệm runtime

`--kind root|push|modal|bare` đọc trực tiếp từ 5 màn thật: `root` = có tab (home, diary); `push` = nav back + tiêu đề, không tab (confirm, textvoice); `modal` = đóng + tiêu đề, không tab (camera); `bare` = không chrome. Giá trị `kind` **không xuất hiện trong file màn** — nội dung file (include gì, khai slot gì) chính là kind. Vì sao: một khoá `kind` trong file sẽ là vocabulary mới phải lint, trong khi thông tin đã hiện diện đầy đủ trong markup.

Hệ quả về an toàn: sinh màn `root`/`push` khi project chưa có `app-tabs` / `app-nav` sẽ bị `lint:components` báo lỗi `missing` kèm `file:line` — ồn ào, có cách sửa, không im lặng.

### D7. Audit `region-order` sống lại, đo band thật

`region-order` được viết lại để đo `.region-nav` vs `.screen` vs `.region-tabs`, thay vì probe `.navbar`/`.tabbar` không còn tồn tại. Bất biến kiểm được: `nav.bottom ≤ screen.top`, `tabs.top ≥ screen.bottom`, và cả hai nằm ngoài phần tử cuộn. Xoá `handBuilt` (luôn `false`) và các probe `.navbar` / `.navbar-float` / `.tabbar` / `.tabbar-float` / `.dock`.

Vì sao không xoá luôn `region-order`: nó là check **duy nhất** chứng minh shell đã định vị đúng thứ tự các dải. Bỏ nó là bỏ tầng đo của chính bất biến mà v2 dựng ra.

### D8. Luật vùng áp cho cả file component

`slotViolations`, `shellBandViolations`, luật `data-tab` / `data-tab-active` chạy trên `project/*/components/*.html`, không chỉ trên màn. Vì sao: sau change này một phần ruột band nằm trong component, nên nếu chỉ lint màn thì đó là lỗ hổng mới do chính change này tạo ra. Lỗi phải báo `file:line` của **file component**.

### D9. Shell phát band có ngữ nghĩa

`.region-nav` và `.region-tabs` được phát ra dưới dạng `<nav>` kèm `aria-label`. Vì sao không để tác giả: tác giả không sở hữu band và không thể gắn ngữ nghĩa cho nó; ngữ nghĩa của một vùng shell-owned là trách nhiệm của shell. CSS hiện tại chọn theo class nên đổi tag không phá style — được kiểm bằng audit và PNG.

### D10. Skill còn một nguồn

Xoá `.gemini/skills/phone-canvas/` (thư mục thật, không symlink, grep 0 tham chiếu toàn repo). `.agents/skills/phone-canvas/` là nguồn duy nhất.

### D11. Một capability, không tạo capability mới

Delta nằm trong `screen-regions`. Vì sao: cơ chế này mô tả cách **ruột band được tạo ra** và band được định vị — cùng một chủ thể với chuẩn vùng. Một capability `shared-screen-chrome` riêng sẽ là near-duplicate phải giữ đồng bộ mãi mãi.

## Risks / Trade-offs

- **`data-tab` đổi từ marker sang có giá trị là breaking cho tác giả** → chỉ 2 màn dùng; migrate trong cùng change; lint báo lỗi kèm mẫu sửa; docs và recipe cập nhật cùng lúc.
- **Xoá 12 class khỏi `tokens.css` có thể làm rơi style ở nơi chưa thấy** → đã grep 0/7 màn cho từng class; các chỗ còn nhắc là fixture test và comment lịch sử, sẽ cập nhật trong cùng change; export PNG so lại trước/sau.
- **Đổi `<div>` → `<nav>` cho band có thể đổi layout** → CSS chọn theo class, không theo tag; kiểm bằng `chrome` + `region-order` + PNG 7 màn.
- **Test generator phải ghi file** → dùng thư mục tạm và dọn sau; test không được để lại rác trong `project/`.
- **Delta dùng MODIFIED nên chỉ archive được sau khi v1 và v2 được archive** → thực hiện archive theo thứ tự trước khi archive change này (xem Migration Plan).
- **Slot rỗng thắng có thể bị dùng như "quên điền"** → lint chỉ coi slot rỗng là hợp lệ khi màn **cũng** khai slot khác trong cùng dải; nếu không, đó là dải rỗng vô nghĩa.
- **`app-tabs` lệch khỏi điều hướng thật của app** → lint bắt `data-tab-active` trỏ tới destination có thật; một màn khai active không tồn tại là lỗi cứng.

## Migration Plan

1. Archive `screen-region-standard` (v1) → materialize `openspec/specs/screen-regions/spec.md`.
2. Archive `shell-region-defaults` (v2) → áp delta v2 lên base. Sau bước này base spec phản ánh đúng trạng thái v2.
3. Implement theo `tasks.md`; gate xanh ở từng nhóm.
4. Migrate 5 màn `calo-ai` sang chrome dùng chung; dựng `app-nav` / `app-tabs` tham chiếu trong `foundation-kit`.
5. Xuất PNG cả 7 màn, so với ảnh trước change.

Rollback: revert commit theo nhóm; không có migration dữ liệu, không có trạng thái lưu trữ nào phải hoàn tác.

## Open Questions

- Bộ destination tham chiếu của `foundation-kit` nên gồm những mục nào? Trả lời lúc migrate; không đổi spec, approach hay task breakdown.
- Có nên scaffold `app-nav` / `app-tabs` tự động trong `npm run project -- add` không? Hiện chọn **không** (xem Non-Goals); nếu sau này thấy cần thì là một change riêng, không đổi cấu trúc của change này.
