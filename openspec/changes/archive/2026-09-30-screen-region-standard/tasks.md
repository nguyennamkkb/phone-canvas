# Tasks

Mỗi task ghi rõ cách kiểm chứng bằng lệnh hoặc hành vi quan sát được. Thứ tự là thứ tự phụ thuộc: làm xong nhóm 1 thì gate vẫn xanh, nhóm 2–3 thêm công cụ, nhóm 4–5 sửa màn, nhóm 6 chặn cứng và đóng gói.

## 1. Nền tảng: tài liệu chuẩn + vá trích dẫn hỏng

- [x] 1.1 Chụp nền số trước khi đụng gì: chạy `npm run gate`, ghi lại đúng dòng tổng kết (`0 lỗi, 0 cảnh báo` / `0 lỗi subset` / `0 lỗi component` / `Test Files 15 passed`, `Tests 110 passed`) và đếm `ls project/*/screens/*.html | wc -l` (28). verify: các con số này nằm trong `docs/screen-regions.md` mục "Nền đo" và khớp lúc kết thúc change
- [x] 1.2 Tạo `docs/screen-regions.md`: cột `# | Form factor | Vùng (thứ tự trên→dưới) | Lớp vùng | Số đo | Nguồn` cho phone / cover / inner / fold / tablet, mỗi số đo ghi nguồn (`apple-design-*` skill hoặc đường dẫn trong repo); kèm mục "Ranh giới shell ↔ tác giả" và mục "Bẫy cascade token" (`:root` chỉ match `<html>`, kế thừa luôn thua rule trực tiếp). verify: mọi số trong bảng có ô nguồn; đọc lại khớp bảng bản đồ trong `specs/screen-regions/spec.md`
- [x] 1.3 Thêm bảng tham chiếu Watch (topBarLeading/trailing, hành động chính ở bottom bar, 1 ý/màn, nhãn ≤ 3 từ, chữ phụ ≥ 11 pt) và Widget (lề 16 pt đồng tâm với bo, 1 ý/widget, chữ ≥ 11 pt, không cuộn không nhập liệu) vào cùng file. verify: mỗi dòng ghi nguồn skill tương ứng
- [x] 1.4 Vá 3 chỗ đang trích file không tồn tại: `README.md:350`, `.agents/skills/phone-canvas/SKILL.md:52`, `src/projects/projects.ts:8` → trỏ `docs/screen-regions.md`; đồng thời xử lý `src/screens/manifest.ts` (cũng đã chết) theo cùng cách. verify: `grep -rn "screen-authoring\|src/screens/manifest.ts" README.md src .agents` chỉ còn dòng ghi chú redirect nói rõ file gốc dời đi đâu
- [x] 1.5 Sửa tiêu đề "The four invariants" thành "The five invariants" (mục đang liệt kê 5) và thêm một dòng trỏ sang `docs/screen-regions.md`. verify: `grep -c "^[0-9]\." README.md` trong mục đó bằng số dòng liệt kê, và `npm run typecheck` xanh

## 2. Từ điển vùng trong `src/screens/tokens.css` (chỉ thêm, chưa đụng màn hình)

- [x] 2.1 Thêm nhóm token số đo vùng ở `:root`: `--touch-min: 44px`, `--navbar-min-h: 44px`, `--tabbar-h: 68px`, `--rail-w: 44px`, `--gutter: var(--s4)`; thay các số 44/68 viết tay trong `.navbar`, `.nav-round`, `.circle-btn.is-dashed`, `.dock`, `.tabbar-float` bằng token. verify: `grep -n "44px\|68px" src/screens/tokens.css` chỉ còn trong định nghĩa token; `npm run lint` xanh
- [x] 2.2 Thêm `.split` / `.pane` / `.pane-lead` / `.pane-trail` kèm chú thích HTML mẫu, tất cả in-flow (không `position: absolute`), `.pane` có `min-width: 0`. verify: `npm run lint:subset` xanh; comment có ví dụ dùng được như `.navbar-float` ở tokens.css:1600
- [x] 2.3 Thêm `.rail` / `.rail-tools` / `.rail-tabs` / `.rail-item` cho dải dọc: `.rail` là `.col` rộng cố định, `.rail-item` rộng cố định × cao linh hoạt ≥ `--touch-min`, `.rail-tabs` `margin-top: auto` để tab dọc xuống đáy; `.rail-tools` và `.rail-tabs` **không** tự thêm padding giữa nhóm. verify: `.rail-tabs` đẩy xuống đáy khi đặt trong `.col` cao hơn nội dung; `npm run lint` xanh
- [x] 2.4 Thêm `.sidebar` / `.sidebar-head` / `.sidebar-item` cho tablet, ghi chú trong chú thích: dành cho ≥ 4 vùng ngang hàng, thu gọn được, không đặt hành động quan trọng ở đáy. verify: `npm run lint` xanh
- [x] 2.5 Viết test cho từ điển mới trong `scripts/region-lint.test.ts` (theo quy ước vitest hiện có: `describe('<tên>')` + `it('<hành vi>')` phẳng): mỗi class vùng có trong `tokens.css`, và không class vùng nào chứa `position: absolute`. verify: `npm test` tăng số test, tất cả xanh

## 3. Tầng tĩnh — `scripts/region-lint.ts` (mới, chạy warn trước)

- [x] 3.1 Tạo `scripts/region-lint.ts` theo khuôn của `scripts/subset-lint.ts`: `scanProjects()`, `lineOf()`, thêm `npm run lint:regions` vào `package.json` **chưa** đưa vào `gate`, in `N lỗi vùng, M cảnh báo vùng`. verify: `npm run lint:regions` chạy được và in dòng tổng kết
- [x] 3.2 Rule "vùng chưa khai báo": dải flex ở mép trên/dưới chứa phần tử tương tác mà không mang class vùng. Báo kèm mẫu HTML đúng để thay. verify: trên `project/calo-ai/screens/textvoice.html` báo đúng dòng `<span style="width: 44px">`
- [x] 3.3 Rule anatomy navbar: ≤ 3 `<button>` ở slot phải, tiêu đề 1 dòng, màn push phải có nút back. verify: fixture navbar 4 action báo lỗi, navbar hợp lệ không báo
- [x] 3.4 Rule tab bar: 3–5 destination, mỗi destination có nhãn; `form: cover` (`formFactorOf(deviceId) === 'cover'`) không được có tab ngang ở đáy. verify: fixture 6 tab báo lỗi; `duo-home-cover` không báo
- [x] 3.5 Rule sàn chạm trong từ điển: class là mục tiêu chạm mà khai báo < `--touch-min` ⇒ lỗi, trừ khi vùng cha bảo đảm. verify: fixture class 32 px báo lỗi kèm kích thước
- [x] 3.6 Rule px gắn thiết bị: cấm số px bằng đúng chiều rộng/thứ tự của một preset `Device` trong markup màn. verify: fixture `width: 390px` báo lỗi; 37 dòng px cố định hiện có (`.nav-round` 44, `.circle-btn`, `.chip-icon`…) không báo
- [x] 3.7 Cổng miễn trừ: `<!-- lint-region: off -->` chỉ có hiệu lực khi có lý do ngay sau; không có lý do thì báo lỗi. verify: fixture có comment trần báo lỗi, có lý do thì tắt rule
- [x] 3.8 Test từng rule trong `scripts/region-lint.test.ts` bằng fixture HTML trong bộ nhớ (không chạm `project/`): mỗi rule ít nhất một ca fail và một ca pass. verify: `npm test` tất cả xanh
- [x] 3.9 Đưa `lint:regions` vào `gate` ở mức **warn** (không làm đỏ) và in số vi phạm còn lại. verify: `npm run gate` vẫn exit 0, dòng tổng kết ghi rõ số vi phạm vùng đang chờ migrate

## 4. Tầng đo — `scripts/region-audit.ts` (mới)

- [x] 4.1 Dựng `scripts/region-audit.ts` tái dùng `startSite` / `launch` / `renderPng` từ `scripts/export/*`: compose mỗi màn ở **device khai báo** (mặc định `reference` nếu không khai), đo rect mọi phần tử trong `.viewport` cùng computed style cần thiết. verify: chạy được, in bảng `screen | region | selector | w×h`
- [x] 4.2 Assert vùng OS: đúng 1 `.statusbar` + 1 `.home-indicator`, cả hai nằm ngoài `.viewport`; `safeBottom = 0` thì ghi 0, không phải lỗi. verify: trên `home` in `chrome: ok`
- [x] 4.3 Assert nền dải OS: lấy `getComputedStyle` của `.statusbar`/`.home-indicator`/`.screen` và so với pixel thật trong ảnh dựng; phát hiện vệt trắng. verify: trên `home` in `background continuity: ok`; bỏ `--bg` ở `.app-mood` thì phải đỏ (kiểm bằng cách tạm dựng lại từ bản cũ rồi hoàn tác)
- [x] 4.4 Assert sàn 44 × 44: liệt kê phần tử tương tác dưới sàn kèm selector + kích thước + vùng; có danh sách miễn trừ tập trung trong script, mỗi mục bắt buộc có lý do. verify: in ra `.close-btn` và `.pill-soft` là ứng viên sửa; sau task 4.6 phải rỗng
- [x] 4.5 Assert thứ tự vùng và tỉ lệ: `.navbar` là vùng đầu tiên, `.tabbar` là vùng cuối; với màn fold đo hai `.pane` và so 50/50 (dung sai ±3%). verify: trio Duo in `cover: 1 pane + rail`, `inner: split 1:2`, `fold: split 50/50`
- [x] 4.6 Assert dải chia: với màn fold, không phần tử tương tác nào có rect cắt qua dải chia ở giữa màn; báo rõ phần tử và khoảng lấn. verify: trio Duo in `division band clear`
- [x] 4.7 Khi máy không có Chrome: tự skip in dòng `SKIPPED` đậm, exit 0 (đúng tiền lệ `scripts/export/export.test.ts:40-45`). verify: chạy với `CHROME_PATH=/nonexistent` vẫn exit 0 và in SKIPPED
- [x] 4.8 Đưa `audit:regions` vào `gate`; `screenBgOf` có unit test riêng trong `src/extractor/compose.test.ts` để cơ chế lan nền vẫn được bảo vệ khi không có Chrome. verify: `npm run gate` xanh, `npm test` tăng số test

## 5. Migrate màn hình theo gia đình (mỗi nhóm xem PNG trước khi đi tiếp)

- [x] 5.1 Trio Duo chuyển sang `.split` / `.pane` / `.rail` / `.rail-tools` / `.rail-tabs`, giữ nguyên state `520 / 730 / 1250 / 1850` và 4 destination. verify: `npm run export -- --screen duo-home-cover --device duo-cover` rồi **xem PNG**; audit in đúng 3 dòng ở task 4.5
- [x] 5.2 `home` + `diary`: tab bar về `.tabbar` chuẩn 3–5, bỏ bù kích thước tay, giữ destination đang chọn. verify: export rồi xem PNG cả hai; `lint:regions` không báo tab
- [x] 5.3 Nâng `.close-btn` 30→44, `.pill-soft` 32→44, `.icon-btn` 32→44 (dùng `--touch-min`), xuất PNG **trước/sau** cho `barcode`, `deletesheet`, `camera` và trio Duo để đối chiếu hệ quả thị giác. verify: ảnh sau không phá bố cục; audit task 4.4 không còn ứng viên
- [x] 5.4 Chuyển 21 màn đang dựng thanh trên tay sang `.navbar` (xoá ô giữ chỗ tay, bỏ `justify-content: space-between` thừa). Danh sách đầy đủ lấy từ cảnh báo của task 3.2 sau khi bật. verify: `npm run lint:regions` không còn cảnh báo "vùng chưa khai báo"; mỗi màn có PNG xem qua
- [x] 5.5 `foundation-showcase` + `alert-demo` về từ điển vùng mới; 17 component của kit không cần sửa trừ khi lint báo. verify: export kit, xem PNG, `npm run lint:components` không cảnh báo mới
- [x] 5.6 Cả repo: `npm run gate` xanh với số test đã tăng, `npm run audit:regions` in `chrome: ok`, `background continuity: ok`, `division band clear`, và **0** vi phạm vùng. verify: dán nguyên output hai lệnh vào `docs/screen-regions.md` mục "Nền đo"

## 6. Chặn cứng và đóng gói

- [x] 6.1 Chuyển từng rule của `lint:regions` từ warn sang **error** khi số vi phạm còn lại bằng 0, và **xoá hẳn** đường warn. verify: `npm run gate` exit 0; cố tình thêm tab ngang vào một màn cover thì gate đỏ
- [x] 6.2 Thêm `.agents/skills/phone-canvas/recipes/regions.md` làm **con trỏ** + ví dụ ngắn cho từng form factor, và đăng ký trong bảng `## Recipes` của `SKILL.md`. verify: recipe không copy lại bảng số đo (chỉ dẫn tới `docs/screen-regions.md`); SKILL.md dẫn recipe tới đúng file
- [x] 6.3 Thêm mục `## Screen regions` vào `README.md` giữa `## The five invariants` và `## CSS → SwiftUI reference`, tóm tắt bản đồ vùng và trỏ tài liệu. verify: đọc lại khớp bảng trong `specs/screen-regions/spec.md`
- [x] 6.4 `openspec validate screen-region-standard` và `openspec status --change screen-region-standard` báo hợp lệ, 4/4 artifact; mọi task trong file này đã tick. verify: hai lệnh in kết quả thành công
