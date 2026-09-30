# Design

## Context

Xem `proposal.md` (Why) và bảng số liệu ở đó. Những ràng buộc kỹ thuật quan sát được trong repo, quyết định toàn bộ cách thiết kế:

- **Chrome vùng OS đã đúng**: `src/extractor/compose.ts` dựng `.device > .statusbar + .viewport + .home-indicator` từ `Device.safeTop/safeBottom`; `bridge.js` chỉ duyệt phần tử **bên trong** `.viewport` nên vùng OS không lọt vào spec. 0/28 màn vi phạm. Nền dải OS nối liền ruột màn là cơ chế `screenBgOf()` — chỉ đọc **longhand** `background-color` / `background-image` trên thẻ `.screen` rồi phát lại lên `.device`, kèm `luminanceOf()` để home bar chuyển trắng khi nền tối.
- **Form factor đã suy ra được**: header `<!-- pc {"title":…,"lightStatusBar":…,"deviceId":…} -->` (`src/projects/derive.ts`, `SCREEN_KEYS` chỉ nhận 3 khoá này) → `ScreenFile.deviceId` → `formFactorOf()` trả `phone | tablet | cover | inner`. Board có thể override `deviceId` theo từng node (`src/board/BoardView.tsx`), nên lint chỉ phủ được device **khai báo**.
- **`fold` không phân biệt được bằng mã nguồn**: `duo-home-fold` và `duo-home-inner` cùng `deviceId:"duo-inner"`, khác nhau ở tỉ lệ `flex: 2 1 0` → `1 1 0` và việc bỏ `.band.is-sun`.
- **Từ điển vùng chưa có mảng Duo/tablet**: `.split`, `.pane`, `.rail`, `.sidebar`, `.toolbar` **0 lần dùng**; `.navbar` dùng 1 lần (component `foundation-kit/components/navbar.html`), `.tabbar` 3 lần, `.tabbar-float` 1 lần, `.navbar-float` 0 lần. 21/28 màn tự dựng thanh trên bằng `.row` + `.nav-round`.
- **Token số đo đang rải rác**: `tokens.css` dùng `--s1..--s10` (4/8/12/16/20/24/32/40) và `--r-sm..--r-full`; 44 pt xuất hiện rải rác (`.navbar` `min-height: 44px`, `.nav-round` 44×44, `.circle-btn.is-dashed` 44×44) và 68 pt xuất hiện ở `.dock` + `.tabbar-float`. Không có token cho số đo vùng.
- **Quy ước test**: vitest, file `<module>.test.ts` đặt cạnh mã, `describe('<tên hàm>')` + `it('<câu hành vi>')` phẳng, không `.each`/`.skip`/`.only`, fixture là object literal; test cần Chrome thì tự skip kèm `console.warn('skip: no Chrome on this machine')`. Hiện 15 file / **110 test**.
- **Đường ống dựng sẵn có thể dùng lại**: `scripts/export.ts` chỉ là file nối; `scripts/export/{cli,cdp,site,render}.ts` đã có sẵn `startSite(documents)` + `launch()` + `renderPng()`. `npm run gate` = `typecheck` → `lint:tokens` → `lint:subset` → `lint:components` → `vitest`. Ba script lint chung `scanProjects()`, chung `lineOf()`, chung `IGNORED_PREFIX = ['--device-','--safe-','--status-']`.

## Goals / Non-Goals

- **Goals**: một từ điển vùng dùng chung đủ để diễn tạt mọi form factor; mọi vi phạm tĩnh và hình học đều đỏ ở `npm run gate` với cách sửa; tài liệu chuẩn là nguồn duy nhất, không còn đường dẫn chết; bộ ba màn Duo làm mẫu.
- **Non-Goals**: không thêm preset device; không thêm khoá header `pose`/`regions`; không dựng bề mặt Watch/Widget (chỉ bảng tham chiếu trong tài liệu); không đổi định dạng export PNG, panel spec, hay cấu trúc registry; không sinh code SwiftUI; không cưỡng chế `position:absolute` toàn cục (nền tảng đã cho phép vì đọc thành ZStack + offset).

## Decisions

1. **Cưỡng chế 2 tầng: lint tĩnh + audit đo.**
   Phần quan trọng nhất của quy chuẩn vùng là **hình học**: khung 44 pt đo thật, dải chia của nếp gập, tỉ lệ 50/50, pixel nền dải OS, thứ tự vùng. Không cái nào suy ra được từ văn bản màn hình. Ngược lại, các lỗi "vùng chưa khai báo", "navbar 4 action", "tab 6 mục", "px gắn chiều rộng thiết bị" thì đọc tĩnh rẻ và chính xác hơn.
   *Cân nhắc khác*: (a) chỉ đo — bỏ được rule cấu trúc nhưng phải chạy Chrome cho mọi vòng sửa, và nhiều lỗi bắt được muộn; (b) chỉ tĩnh — không thể hứa sàn 44 pt và luật nếp gập, tức là mất đúng thứ quy chuẩn này sinh ra; (c) đo trong `bridge.js` — bridge đã đo rect nhưng nó chạy trong iframe của app, không có khả năng assert, và sẽ biến gate phụ thuộc UI. → Chọn 2 tầng.

2. **`scripts/region-audit.ts` tái dùng nguyên vẹn `scripts/export/{site,cdp,render}.ts`.**
   Không thêm dependency, không cần dev server, không cần build. Audit chỉ khác export ở chỗ nó **giữ** rect và style đo được thay vì ghi PNG, rồi assert. → quyết định phụ: `gate` chạy cả audit; khi máy không có Chrome thì audit tự skip in dòng `SKIPPED` đậm đúng như tiền lệ `scripts/export/export.test.ts:40-45` (đánh đổi: CI không có Chrome thì tầng đo không chạy, phải bù bằng unit test cho `screenBgOf`).

3. **Form factor suy ra, không khai báo.** Dùng `formFactorOf(screen.deviceId)`; không thêm khoá mới vào `SCREEN_KEYS`.
   *Cân nhắc khác*: thêm `regions`/`pose` vào header để tác giả tự khai → registry format đổi, `derive.ts` + `derive.test.ts` + mọi nơi đọc header phải theo, và tác giả có thể khai sai (nằm ngoài sự kiểm soát). Suy ra từ `deviceId` đã có sẵn, đã được validate, và không thể sai. *Hệ quả được chấp nhận*: lint phủ device **khai báo**, không phủ device override theo node trên board — ghi rõ trong tài liệu, và audit dựng đúng device khai báo nên vẫn bắt được hình học sai.

4. **`fold` không phải device và không phải khoá header.** Nó là một tỉ lệ 1:1 của cùng `duo-inner`.
   *Cân nhắc khác*: thêm `pose` để lint biết màn nào là pose gập. Không được: tỉ lệ 1:1 không suy ra đáng tin từ flex tùy ý (`flex: 1 1 0` vs `width: 50%` vs `flex-basis`), còn thứ **cần** kiểm — không có control nào trên dải chia — lại là hình học, thuộc tầng đo. Thêm `pose` chỉ khi board cần một chip riêng cho pose; ghi vào Open Questions. → Luật fold thuộc tầng đo, không thuộc lint tĩnh.

5. **Lỗi là "vùng chưa khai báo", không phải "anatomy sai".**
   21/28 màn không dùng `.navbar`; nếu chỉ kiểm màn đã dùng class vùng thì 21 màn không bao giờ được kiểm — quy chuẩn rỗng. Nên luật là: một dải flex ở mép trên/dưới chứa phần tử tương tác mà không mang class vùng ⇒ lỗi, kèm mẫu HTML đúng. Mẫu thật đã có sẵn để test: `project/calo-ai/screens/textvoice.html:4-8` dựng 3 slot tay kèm `<span style="width: 44px"></span>` chừa chỗ.

6. **Bổ sung class vùng, không sửa cách dựng.**
   Thêm `.split`, `.pane`, `.pane-lead`, `.pane-trail`, `.rail`, `.rail-tools`, `.rail-tabs`, `.rail-item`, `.sidebar`, `.sidebar-head`, `.sidebar-item` — mỗi rule kèm HTML mẫu trong chú thích như `.navbar-float` (tokens.css:1600-1602) và `.tabbar-float` (1621-1623) đã làm, đều **in-flow**, không `position:absolute` (khớp `scrim` note tokens.css:957-962 và invariant 5 "màn fluid qua mọi chiều rộng"). `.rail-item` chiều rộng cố định / chiều cao linh hoạt, symbol-first, có cả title. `.rail-tools` để trên, `.rail-tabs` bottom-aligned — hai vùng con không tự thêm padding giữa nhóm, theo luật "khoảng cách là của hệ thống" của dải dọc.
   *Cân nhắc khác*: để mỗi màn Duo tự viết flex như hiện tại → mỗi màn một hợp đồng, đúng thứ quy chuẩn này sinh ra để diệt; và extractor không có tên để gọi vùng khi đọc spec.

7. **Sàn 44 pt cưỡng chế hai chỗ, và sửa token chứ không sửa từng màn.**
   Tầng tĩnh: một lớp **là mục tiêu chạm** mà khai báo < 44 px là lỗi, trừ khi vùng cha bảo đảm (`.tabbar-float` 68 pt nâng `.tab-item`). Tầng đo: đo rect từng phần tử tương tác. Không thể lint tĩnh "dùng class X mà không bù", vì `height:auto; padding: var(--s3)` là bù hợp lệ và không phân biệt được bằng regex.
   Hệ quả thị giác: `.close-btn` 30→44, `.pill-soft` 32→44, `.icon-btn` 32→44 làm màn rộng ra thật, nên phải xem PNG sau mỗi gia đình màn. Đây là thay đổi **có chủ đích**, không phải hệ quả phụ — ghi vào tài liệu để người sau không "sửa lại cho gọn".

8. **Bật rule theo hai pha để không chặn ngõ cụt.**
   21/28 màn vi phạm ngay khi bật error. Pha 1: rule vào với mức **warn** + dòng đếm `N vi phạm vùng`; task migrate cuối đổi từng rule sang **error** và xoá đường warn. Còn lại sẽ là một gate nửa vời; nên phải xoá hẳn chứ không để lâu.
   *Cân nhắc khác*: bật error ngay kèm fixer message — chặn mọi việc khác của repo cho tới khi migrate 21 màn. Pha 2 đã được viết thành task nên không phải nợ ngầm.

9. **Một nơi duy nhất cho quy tắc miễn trừ của tầng đo.**
   Danh sách tập trung trong script audit, mỗi mục có lý do; lint tĩnh dùng `<!-- lint-region: off -->` ngay trong file. Không dùng `# lint-ignore` trần vì đó là nợ ngầm không ai đọc.

10. **`docs/screen-regions.md` là nguồn duy nhất; recipe skill chỉ trỏ.**
    Repo đang trích `docs/screen-authoring.md` ở `README.md:350`, `.agents/skills/phone-canvas/SKILL.md:52`, `src/projects/projects.ts:8` — file không tồn tại. Tài liệu vùng lấp đúng chỗ trống đó. Recipe `regions.md` trong skill là **con trỏ + ví dụ ngắn**, không copy bảng, để không có hai bảng lệch nhau.

11. **Bẫy cascade token: khai báo trực tiếp trên scope dùng nó.**
    `:root` chỉ match `<html>`; `.screen` kế thừa token từ `<html>` nên **luôn thua** một rule gán trực tiếp trên chính nó. Vì vậy `--bg` phải khai ở `:root` (cho `.device`) và ở `.app-mood` (cho `.screen`), mỗi bản kèm dark. Ghi nguyên văn bài học này vào tài liệu vùng và vào recipe design-tokens, vì nó chính là nguyên nhân vệt trắng safe area.

12. **Migrate theo gia đình, mỗi nhóm xem PNG trước khi qua bước sau.**
    Thứ tự: trio Duo (đã là mẫu) → `home` + `diary` (tab bar) → 21 thanh trên tay → kit. Không big-bang. Mỗi nhóm kết thúc bằng `npm run export` + xem ảnh + `npm run gate`.

## Risks / Trade-offs

- [Risk] Heuristic lint "vùng chưa khai báo" báo nhầm màn không có vùng thật (ví dụ màn full-bleed ảnh với một `.row` trang trí ở trên cùng) → Mitigation: chỉ báo khi dải flex ở mép trên **và** chứa phần tử tương tác (`button`, `[role=button]`, `.nav-round`, `.icon-btn`, `.pill*`, `.close-btn`, `.tab`) **và** cao ≤ 80 px; phần tử trang trí không bị đụng; cổng thoát `<!-- lint-region: off -->` kèm lý do.
- [Risk] Nâng `.icon-btn` 32→44 phá 3 màn Duo đã cân tay → Mitigation: nâng trước, xuất PNG trio + `home` xem trước/sau, nếu xấu thì giữ 32 px và chuyển sang chỉ audit đo (nhưng **không** hạ yêu cầu dưới 44).
- [Risk] Audit cần Chrome nên `gate` trên máy không có Chrome bỏ sót tầng đo → Mitigation: tự skip in dòng `SKIPPED` đậm, và `screenBgOf` có unit test riêng nên cơ chế lan nền vẫn được bảo vệ không cần Chrome.
- [Risk] Audit chạy 28 màn × 1 thiết bị làm `gate` chậm hơn → Mitigation: chỉ device khai báo, không `--all`; đo được trong vài giây với đường ống export sẵn có; nếu chậm thì tách `gate:full` nhưng **không** bỏ khỏi `gate`.
- [Risk] `docs/screen-regions.md` trở thành tài liệu chết sau vài tháng → Mitigation: mỗi rule lint trong message trích dẫn mục tương ứng của tài liệu, nên đọc message là ra tài liệu cần mở.
- [Risk] Luật tỉ lệ 50/50 với dung sai ±2% dễ bị sai số làm tròn subpixel → Mitigation: đo bằng `getBoundingClientRect()` trên chính hai `.pane`, dung sai nới lên ±3% nếu có lỗi giả.

## Migration Plan

1. **Nền tảng, không đụng màn hình**: từ điển vùng + token số đo + `docs/screen-regions.md` + vá trích dẫn hỏng. Gate vẫn xanh.
2. **Audit đo**: dựng + assert. Báo cáo liệt kê vi phạm, gate chưa đỏ (in cảnh báo có số đếm).
3. **Rule tĩnh ở mức warn**: vùng chưa khai báo, navbar, tab bar, cover, px thiết bị, token dưới sàn. Gate xanh, in đếm.
4. **Sửa token chạm + xem PNG**: nâng 3 lớp, đối chiếu trước/sau.
5. **Migrate theo gia đình**, mỗi nhóm xuất ảnh xem thật.
6. **Chuyển warn → error từng rule** khi số vi phạm còn lại bằng 0; xoá đường warn.
7. **Đóng gói tài liệu**: recipe skill + mục README.

Rollback: tất cả là file thêm/sửa tương thích ngược — bỏ `package.json` hook và tắt các rule (`lint:regions` khỏi `gate`) là quay lại trạng thái trước mà không cần hoàn tác màn hình. Màn hình đã migrate sang `.navbar`/`.rail` vẫn chạy đúng vì các class cũ không đổi nghĩa.

## Open Questions

- Có cần khoá `pose` cho chip trên board (cover / open / fold) không? Chưa cần: `formChip()` đã đủ 4 nhãn, và thêm khoá header lúc này là tối ưu sớm. Mở lại khi board thật sự cần phân biệt hai màn cùng `deviceId`.
- Có nên đưa rail dọc vào `.device` (shell sở hữu, giống status bar) không? Chưa: dải dọc là chrome của app chứ không phải của hệ thống, và phải đo được như mọi phần tử khác để spec đọc đúng; nếu sau này muốn shell dựng thì mở `.device` thêm một dải và bỏ `.rail` khỏi màn hình.
- Watch/Widget có cần preset `Device` riêng không? Ngoài phạm vi; khi nào dựng bề mặt thật thì thêm preset + `form` mới cùng lúc.
