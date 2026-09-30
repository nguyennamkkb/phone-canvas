# Tasks

## 1. Trả nợ v2: một họ band, audit sống lại, một nguồn skill

- [ ] 1.1 Gộp họ band trong `src/screens/tokens.css`: `.navbar` + `.navbar-float` → `.region-nav` (+ `.is-glass`), `.tabbar` + `.tabbar-float` + `.dock` → `.region-tabs` (+ `.is-glass`). Verify: `npm run lint:tokens` xanh và grep `^\.navbar|^\.tabbar|^\.navbar-float|^\.tabbar-float` trong file không còn rule nào.
- [ ] 1.2 Xoá vocabulary chết khỏi `tokens.css`: `.tab-item`, `.tab-item.is-on`, `.dock-item`, `.dock-item.is-on`, `.dock-plus`, `.tab-slot`, `.tab-slot.is-on`, `.tabbar-light`, `.tabbar-dark`, cùng token mồ côi (`--tabbar-h` nếu không còn dùng); dọn mục `.tab-item` trong `GUARANTEED_BY` và danh sách lớp tương tác của `scripts/region-rules.ts`. Verify: `npm run gate` xanh và grep từng tên class trên toàn repo chỉ còn trong danh sách cấm của lint hoặc ghi chú lịch sử.
- [ ] 1.3 Cập nhật fixture glass trong `scripts/export/export.test.ts` sang họ `.region-nav` / `.region-tabs` và chạy lại. Verify: `npm run test -- export` xanh, PNG glass vẫn đúng hình học.
- [ ] 1.4 Viết lại `region-order` trong `scripts/region-audit.ts` để đo `.region-nav` vs `.screen` vs `.region-tabs` (nav trên thân, tab dưới thân, cả hai ngoài phần tử cuộn); xoá probe `.navbar` / `.navbar-float` / `.tabbar` / `.tabbar-float` / `.dock` và xoá `handBuilt`. Verify: `npm run audit:regions` in `region-order: ok` cho 7 màn, và một fixture cố tình đặt sai tương quan bị bắt lỗi.
- [ ] 1.5 Xoá `.gemini/skills/phone-canvas/`. Verify: `find . -path ./node_modules -prune -o -name SKILL.md -path '*phone-canvas*' -print` chỉ còn đúng một kết quả dưới `.agents/`, và `npm run gate` vẫn xanh.
- [ ] 1.6 Cập nhật `docs/screen-regions.md` cho họ band mới: bỏ mô tả `.navbar` / `.tabbar` như vocabulary của tác giả, ghi rõ chúng chỉ còn là tên bị cấm, và `.is-glass` là chỗ giữ cho biến thể nổi. Verify: đọc lại mục band của tài liệu không còn câu nào nói tác giả viết `.navbar`; `npm run gate` xanh.

## 2. Compose: hai lượt nhấc, màn thắng từng slot, tab có danh tính

- [ ] 2.1 Trong `src/extractor/compose.ts`, đổi thứ tự `composeScreenDoc`: nhấc `data-slot` / `data-tab` của màn TRƯỚC, rồi `expandComponents`, rồi nhấc phần còn lại và chỉ điền slot còn thiếu. Verify: unit test mới — màn khai `data-slot="title"` thắng tiêu đề mặc định của component, `back` không khai thì vẫn lấy từ component.
- [ ] 2.2 Cho slot rỗng của màn (`<span data-slot="title"></span>`) thắng mặc định của component. Verify: unit test — màn có slot rỗng không nhận tiêu đề mặc định, và không có phần tử tiêu đề nào được phát ra.
- [ ] 2.3 Với `data-tab`: màn khai bất kỳ tab nào thì cả danh sách của màn thắng; màn vừa include `app-tabs` vừa tự khai `data-tab` bị coi là lỗi nhập nhằng. Verify: unit test cho cả hai ca, và ca nhập nhằng có thông báo nêu rõ chỉ được một nguồn.
- [ ] 2.4 Đổi `data-tab` sang mang slug destination; đọc `data-tab-active` trên `.screen` và tự suy ra `is-active`, `aria-current="page"`, `aria-label` và thứ tự "tab N trên M" từ vị trí thật trong bộ. Verify: unit test compose — active đúng một tab, đổi thứ tự bộ thì `aria-label` và số thứ tự đổi theo mà không sửa màn.
- [ ] 2.5 Phát `.region-nav` và `.region-tabs` dưới dạng `<nav>` kèm `aria-label`. Verify: unit test compose kiểm tag và thuộc tính; `npm run audit:regions` vẫn in `chrome: ok` và `region-order: ok` cho 7 màn.

## 3. Lint: phủ component, luật tab, hợp đồng một thân

- [ ] 3.1 Siết `data-tab` phải có giá trị slug trong `scripts/region-rules.ts`; cập nhật `region-slot-unknown` cho khớp. Verify: `scripts/region-lint.test.ts` có ca `data-tab` rỗng bị báo lỗi kèm `file:line` và mẫu sửa.
- [ ] 3.2 Thêm luật `data-tab-active`: màn có tab phải khai đúng một, và slug phải có thật trong bộ destination của project. Verify: ba ca test — thiếu, khai hai, trỏ slug lạ — mỗi ca báo lỗi nêu slug sai và bộ hợp lệ.
- [ ] 3.3 Chạy `slotViolations`, `shellBandViolations` và luật tab trên `project/*/components/*.html`, không chỉ file màn. Verify: test fixture là một file component chứa `data-slot="titel"` và một file chứa `class="navbar"` — cả hai báo lỗi với `file:line` của chính file component.
- [ ] 3.4 Thêm luật "đúng một thân": màn phải có đúng một `.body` hoặc `.body-fixed`, nội dung nằm trực tiếp trong `.screen` là lỗi. Verify: test fixture cho ca thiếu thân và ca hai thân; `npm run lint:regions` trên 7 màn hiện có vẫn xanh.
- [ ] 3.5 Cập nhật bảng "Gate kiểm gì" trong `docs/screen-regions.md` với các luật mới và phạm vi phủ component. Verify: mỗi luật mới trong lint có đúng một dòng tương ứng trong bảng, và `npm run lint:regions` báo lỗi kèm gợi ý sửa như bảng mô tả.

## 4. Chrome của calo-ai và migrate 5 màn

- [ ] 4.1 Tạo `project/calo-ai/components/app-tabs.html` với 4 destination slug (`home`, `scan`, `diary`, `me`), mỗi tab có icon và nhãn; tạo `app-nav.html` với `data-slot="back"` (symbol chuẩn) và `data-slot="title"`. Verify: `npm run lint:components` và `npm run lint:regions` xanh; board preview được từng component.
- [ ] 4.2 Migrate `home` và `diary` sang `<!-- @component app-tabs -->` + `data-tab-active`, bỏ 4 nút tab chép tay ở mỗi màn. Verify: `npm run gate` xanh, `npm run export -- --screen home` và `--screen diary` ra PNG khung máy khớp bản trước.
- [ ] 4.3 Migrate `confirm` và `textvoice` sang `<!-- @component app-nav -->`, ghi đè tiêu đề bằng slot của màn (giữ nhãn "Hủy" ở slot back). Verify: gate xanh, PNG khung máy của hai màn khớp bản trước.
- [ ] 4.4 Migrate `camera`: giữ nav riêng, không include `app-tabs` vì màn không có tab. Verify: gate xanh, `npm run audit:regions -- --screen camera` không báo band tab, PNG khớp bản trước.
- [ ] 4.5 Dựng `app-nav` / `app-tabs` tham chiếu trong `project/foundation-kit/components/` làm mẫu copy cho project mới. Verify: gate xanh và `foundation-showcase` vẫn dựng đúng.
- [ ] 4.6 Ghi mục "Chrome dùng chung" vào `docs/screen-regions.md` và recipe `.agents/skills/phone-canvas/recipes/regions.md`: hai file, luật ghi đè từng slot, cách khai `data-tab-active`. Verify: đọc recipe dựng lại được một màn tab theo đúng mô tả mà không cần đọc mã nguồn.

## 5. Generator sinh màn hợp lệ

- [ ] 5.1 Thêm `--kind root|push|modal|bare` cho `scripts/new-screen.ts`, sinh slot + thân đúng chuẩn và include chrome đúng loại; bỏ hẳn `<header class="navbar">` khỏi template phone và iPad. Verify: chạy `npm run new-screen` cho cả 4 kind vào một project, sau đó `npm run lint:regions` không lỗi nào.
- [ ] 5.2 Thêm test compliance: sinh màn cho từng kind vào thư mục tạm, chạy lint trên output, dọn sạch sau khi chạy. Verify: vitest xanh và không còn file rác trong `project/` sau khi test kết thúc.
- [ ] 5.3 Cập nhật phần scaffold trong `.agents/skills/phone-canvas/SKILL.md` và recipe liên quan để mô tả `--kind`. Verify: mọi lệnh `new-screen` được viết trong skill chạy đúng như viết.

## 6. Tích hợp

- [ ] 6.1 Chạy `npm run gate` trên toàn repo và xác nhận cả bốn tầng lint, `audit:regions` và vitest đều xanh. Verify: exit code 0, không còn check nào bị bỏ qua hoặc luôn-xanh.
- [ ] 6.2 Export cả 7 màn ở chế độ khung máy và `--full`, rồi so bằng mắt với bản trước change. Verify: PNG khung máy đúng kích thước thiết bị, `--full` dài hơn khung, và không màn nào lệch so với ảnh trước.
- [ ] 6.3 Chạy `openspec validate shared-screen-chrome --strict`. Verify: valid, và delta không làm rơi scenario nào của base spec.
