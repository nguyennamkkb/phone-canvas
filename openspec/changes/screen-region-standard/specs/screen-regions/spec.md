# Spec Delta

## Purpose

Định nghĩa **bản đồ vùng cố định** cho mọi loại màn hình trong phone-canvas — phone, Duo cover, Duo inner, fold, tablet — gồm: vùng nào do shell sở hữu, vùng nào tác giả khai báo, từ điển class dùng chung để diễn tạt từng vùng, thứ tự và số slot của từng vùng, sàn 44 pt, luật dải dọc / nếp gập / sidebar, cách cưỡng chế bằng 2 tầng gate, và tài liệu chuẩn — để mọi màn hình tuân thủ quy chuẩn Apple theo mặc định thay vì nhớ bằng mắt.

Bản đồ vùng chuẩn (mỗi dòng là một hợp đồng quan sát được):

| Form factor | Thứ tự vùng từ trên xuống | Lớp vùng | Số đo chốt |
|---|---|---|---|
| `phone` | status bar *(shell)* → navbar → content → tab bar *(tuỳ chọn)* → home indicator *(shell)* | `.navbar` / `.navbar-float` / `.tabbar` / `.tabbar-float` | navbar ≥ 44 pt · tab bar 68 pt · lề 16 pt |
| `cover` (Duo ngoài) | status bar *(shell)* → content 1 pane → dải dọc trailing (toolbar trên, tab dọc đáy) → home indicator *(shell)* | `.row` + `.pane` + `.rail`/`.rail-tools`/`.rail-tabs` | rail rộng cố định, item cao linh hoạt ≥ 44 pt |
| `inner` (Duo mở) | status bar *(shell)* → split 2 pane (dẫn hậu) → home indicator *(shell)* | `.split` + `.pane-lead` / `.pane-trail` | pane dẫn hẹp hơn pane hậu |
| fold (Duo gập hờ) | như `inner` nhưng 2 pane 50/50, nếp gập là divider | như `inner` | mọi rect tương tác tránh dải chia |
| `tablet` | status bar *(shell)* → sidebar + split 2–3 cột → home indicator *(shell)* | `.sidebar` + `.split` + `.pane` | 1 tiêu đề trên split · pane hỗ trợ ~360 pt |

## ADDED Requirements

### Requirement: Shell sở hữu vùng OS, tác giả không được dựng lại

Vùng status bar và home indicator SHALL do shell dựng từ `Device.safeTop` / `Device.safeBottom` và đặt **ngoài** `.viewport`; markup màn hình SHALL NOT chứa element mô phỏng chúng (class/id khớp `statusbar`, `status-bar`, `homebar`, `home-indicator`, `notch`, `dynamic-island`), SHALL NOT chèn vùng đệm giả bằng padding cứng tương đương safe area, và SHALL NOT chứa chuỗi đồng hồ mô phỏng.

#### Scenario: Màn tự vẽ vùng OS

- **WHEN** một màn chứa `<div class="statusbar">` hoặc `class="home-indicator"` rồi chạy `npm run lint:regions`
- **THEN** gate báo lỗi tại `file:line` kèm hướng sửa: xoá markup, để shell lo; không có màn nào được miễn trừ âm thầm

#### Scenario: Vùng OS xuất hiện đúng một lần sau khi dựng

- **WHEN** chạy `npm run audit:regions` trên một màn bất kỳ
- **THEN** báo cáo ghi nhận đúng 1 `.statusbar` và 1 `.home-indicator`, cả hai nằm ngoài `.viewport`; màn thiết bị không có home indicator (`safeBottom = 0`) thì ghi `0`, không phải lỗi

### Requirement: Nền dải OS nối liền ruột màn hình

Nền `.device` SHALL mang đúng nền gốc dài của `.screen` (chỉ lan được `background-color` và `background-image` dạng longhand), nên dải status bar và home indicator SHALL cùng màu với ruột màn hình khi tính theo điểm ảnh. Màn nền tối SHALL làm home indicator chuyển sang trắng.

#### Scenario: Vết trắng ở safe area

- **WHEN** dựng màn có nền khác `--bg` mặc định (ví dụ nền xám Apple `#F2F2F7`) và đo pixel 3 điểm: giữa dải status, giữa ruột màn, giữa dải home indicator
- **THEN** cả 3 điểm trùng màu; `npm run audit:regions` báo `background continuity: ok`

#### Scenario: Token nền đặt sai chỗ

- **WHEN** một project khai báo `--bg` chỉ ở `:root` trong khi `.app-mood` (rule trực tiếp) lại gán `--bg` khác
- **THEN** dải OS lệch màu ruột màn và audit đỏ; quy tắc sửa là khai báo trực tiếp trên scope dùng nó, không qua `:root` kế thừa

### Requirement: Vùng cố định phải khai báo bằng từ điển vùng, không dựng tay

Mọi vùng cố định do tác giả sở hữu (navbar, tab bar, dải dọc, sidebar, split, thanh hành động đáy) SHALL được viết bằng class vùng dùng chung. Một dải flex ở mép trên hoặc mép dưới chứa phần tử tương tác mà không mang class vùng SHALL bị coi là **vùng chưa khai báo** và báo lỗi.

#### Scenario: Thanh trên dựng tay

- **WHEN** một màn mở đầu bằng `<div class="row" style="justify-content: space-between">` chứa nút và tiêu đề, không có `.navbar`
- **THEN** gate báo lỗi "vùng chưa khai báo" tại dòng đó, kèm mẫu HTML đúng để thay; đây là lỗi ở 21/28 màn hiện tại

#### Scenario: Ô giữ chỗ tay

- **WHEN** một vùng trên dùng `<span style="width: 44px"></span>` để chừa slot phải cho tiêu đề
- **THEN** gate báo lỗi và chỉ ra `.navbar` vốn đã có `justify-content: space-between` nên không cần ô giữ chỗ

#### Scenario: Lớp vùng dùng chung tồn tại

- **WHEN** `src/screens/tokens.css` được đọc
- **THEN** có `.split`, `.pane`, `.pane-lead`, `.pane-trail`, `.rail`, `.rail-tools`, `.rail-tabs`, `.rail-item`, `.sidebar`, `.sidebar-head`, `.sidebar-item`, mỗi rule kèm HTML mẫu trong chú thích và **không** dùng `position: absolute`

### Requirement: Khung dọc chuẩn của màn phone

Màn `form: phone` SHALL tuân thủ đúng thứ tự vùng: navbar → content → tab bar (tuỳ chọn) → home indicator. Navbar SHALL có tối đa 3 slot (dẫn · tiêu đề · hành động), tiêu đề SHALL là **một dòng**, màn push (có điều hướng quay lại) SHALL có nút back ở slot dẫn dùng symbol chuẩn chứ không dùng chữ "Back"/"Close", và số hành động cuối SHALL ≤ 3 — phần dư đưa vào menu "More". Nội dung SHALL dùng lề 16 pt và nhịp 4/8 pt.

#### Scenario: Navbar quá tải

- **WHEN** một navbar chứa 4 `<button>` ở slot phải, hoặc tiêu đề dài 2 dòng, hoặc không có nút back ở màn push
- **THEN** gate báo lỗi `file:line` cho từng vi phạm, kèm cách sửa cụ thể (bỏ về More / rút tiêu đề / thêm `.nav-round` back)

#### Scenario: Màn không có navbar

- **WHEN** một màn không có navbar vì không điều hướng (splash, login, full-bleed ảnh)
- **THEN** hợp lệ, không cảnh báo; quy chuẩn cho phép bỏ vùng, không ép thêm vùng giả

### Requirement: Tab bar 3–5 destination, nhãn luôn hiện

Tab bar SHALL có 3–5 destination, mỗi destination SHALL có icon **và** nhãn, icon dạng filled, badge chỉ dành cho thông tin khẩn. Chọn hiện tại SHALL được giữ nguyên khi đổi form factor (phone ↔ dải dọc Duo ↔ sidebar tablet). Ở form factor rộng, tab bar SHALL thành sidebar; ở form factor hẹp, sidebar SHALL thu về tab bar mà không mất chức năng.

#### Scenario: Quá 5 tab

- **WHEN** một tab bar khai báo 6 destination
- **THEN** gate báo lỗi và chỉ đường thoát: gộp vào More ở hẹp, hoặc chuyển sang sidebar ở rộng

#### Scenario: Thiếu nhãn

- **WHEN** một destination chỉ có icon, không nhãn
- **THEN** gate báo lỗi tại destination đó

#### Scenario: Giữ selection khi đổi form factor

- **WHEN** cùng một bộ destination được dựng ở `reference` và ở `duo-inner`
- **THEN** destination đang chọn là cùng một mục, kiểu dấu selected giống nhau

### Requirement: Sàn chạm 44 × 44 pt trong mọi vùng

Mọi phần tử tương tác nằm trong `.viewport` SHALL render ra khung ≥ 44 × 44 pt. Lớp tương tác dùng làm mục tiêu chạm trong vùng cố định SHALL khai báo ≥ 44 pt trong `tokens.css`, trừ khi vùng cha đã bảo đảm (ví dụ `.tabbar-float` cao 68 pt nâng `.tab-item`). Lớp luôn là mục tiêu chạm nhưng nhỏ hơn 44 pt (`.close-btn`, `.pill-soft`, `.icon-btn`) SHALL được nâng lên ≥ 44 pt.

#### Scenario: Lớp khai báo nhỏ hơn sàn

- **WHEN** một lớp trong `tokens.css` là mục tiêu chạm và khai báo chiều cao/dài < 44 px
- **THEN** `npm run lint:regions` báo lỗi "mục tiêu chạm dưới sàn" kèm kích thước đang khai báo

#### Scenario: Chạm đo được sau khi dựng

- **WHEN** `npm run audit:regions` dựng một màn và tìm phần tử tương tác có khung < 44 × 44 pt
- **THEN** báo cáo liệt kê từng phần tử kèm selector, kích thước đo được và vùng chứa nó; phần tử nằm trong danh sách miễn trừ thì bỏ qua, ngoài danh sách thì gate đỏ

#### Scenario: Miễn trừ phải có lý do

- **WHEN** một phần tử cần miễn trừ sàn chạm
- **THEN** mục miễn trừ bắt buộc có chuỗi lý do; miễn trừ không lý do bị coi là không tồn tại

### Requirement: Dải dọc Duo — rail trailing, đúng thứ tự, tab dọc đáy

Ở `form: cover` và `inner` landscape, vùng điều hướng dọc SHALL nằm ở **cạnh trailing** và SHALL giữ **cùng cạnh vật lý** khi chuyển từ cover sang inner (không nhảy sang cạnh trái). Rail SHALL theo thứ tự: điều hướng chính (Back/Close) ở trên cùng → hành động nổi bật (Done) → nhóm còn lại giữ thứ tự gốc; khoảng cách giữa nhóm do hệ thống quyết định, tác giả SHALL NOT tự cộng padding giữa các nhóm. Item dọc SHALL ưu tiên symbol (chiều rộng cố định, chiều cao linh hoạt) và mỗi item SHALL có cả title lẫn symbol. Ở `cover`, tab bar SHALL là **dọc, bottom-aligned** trong cùng dải; màn `cover` SHALL NOT có tab bar ngang ở đáy.

#### Scenario: Cover còn tab ngang

- **WHEN** một màn `deviceId: duo-cover` chứa `<nav class="tabbar">` ngang ở đáy
- **THEN** gate báo lỗi và chỉ cách chuyển 4 destination lên `.rail-tabs`

#### Scenario: Thứ tự rail sai

- **WHEN** rail đặt hành động nổi bật lên trên nút Back/Close
- **THEN** gate báo lỗi thứ tự; nếu muốn thứ tự khác thì phải dùng `<!-- lint-region: off -->` kèm lý do

#### Scenario: Khoảng cách tay giữa các nhóm

- **WHEN** tác giả thêm `padding`/`gap` cố định giữa các nhóm trong rail
- **THEN** gate báo lỗi: khoảng cách là trách nhiệm của hệ thống, tự đặt sẽ vỡ khi không gian thay đổi

### Requirement: Duo inner — arrangement ngoài navigation, mỗi pane giữ control của nó

Màn `inner` SHALL dùng split 2 pane với pane dẫn hẹp hơn pane hậu khi mở phẳng, và navigation SHALL **không** nằm bên trong arrangement. Mỗi pane SHALL giữ control của chính nó trên cạnh ngoài của pane (pane dẫn: đỉnh pane; pane hậu: mép phải); **không** gộp mọi control của cả màn lên một cạnh. Pane hậu được chọn có placeholder khi rỗng, không để cột trống trơn.

#### Scenario: Control gộp một cạnh

- **WHEN** một màn inner đặt control của cả hai pane lên cùng mép phải
- **THEN** gate báo lỗi, hướng dẫn đưa control của pane dẫn lên đỉnh pane dẫn

#### Scenario: Pane rỗng

- **WHEN** pane hậu không có nội dung
- **THEN** màn hình hiển thị placeholder của pane, không phải khoảng trống

### Requirement: Fold — dải chia là vùng cấm, split cân 50/50

Khi gập một phần, dải chia (nếp gập) là vùng dành riêng: **không** phần tử tương tác, chữ, hay ô lưới nào được phép nằm trong đó; nội dung cuộn được phép đi qua. Split SHALL cân 50/50. Lưới SHALL giữ lề ngoài, **tăng** khoảng cách quanh nếp gập, và dùng số cột **chẵn** khi có dải chia. Vì `duo-home-inner` và `duo-home-fold` cùng khai báo `deviceId: duo-inner` và chỉ khác tỉ lệ flex, luật này **chỉ kiểm được sau khi dựng**, không kiểm được bằng lint tĩnh.

#### Scenario: Control nằm trên nếp gập

- **WHEN** `npm run audit:regions` dựng màn fold và tìm phần tử tương tác có rect cắt qua dải chia ở giữa màn hình
- **THEN** báo lỗi nêu rõ phần tử và khoảng lấn vào dải, hướng dẫn dời ra mép ngoài của pane

#### Scenario: Split không cân

- **WHEN** tỉ lệ hai pane ở màn fold lệch quá ±2% so với 50/50
- **THEN** báo lỗi "split chưa cân" kèm hai số đo

### Requirement: Continuity giữa các pose

Cùng một state SHALL hiển thị giống nhau ở cover, inner và fold: cùng dữ liệu, cùng destination đang chọn, cùng độ sâu điều hướng, cùng số đo nghiệp vụ. Chuyển pose SHALL NOT reset về Home, mất đường điều hướng, mất selection, hoặc reset vị trí cuộn. Màn inner chỉ được **thêm tối đa một tầng** thông tin so với cover.

#### Scenario: State lệch giữa ba pose

- **WHEN** đối chiếu `duo-home-cover`, `duo-home-inner`, `duo-home-fold`
- **THEN** ba màn cùng dữ liệu (`520 / 730 / 1250 / 1850`), cùng 4 destination, cùng destination đang chọn; chỉ khác cách bày (1 pane · 2 pane lệch · 2 pane 50/50)

#### Scenario: Thêm quá một tầng

- **WHEN** một màn inner lộ thêm hai tầng điều hướng so với cover
- **THEN** đánh dấu vi phạm continuity, yêu cầu gộp lại

### Requirement: Tablet — sidebar + split, thu gọn được về tab bar

Màn `form: tablet` SHALL dùng sidebar leading + split 2–3 cột thay vì phóng to UI phone, với **một** tiêu đề duy nhất đặt trên split. Sidebar dành cho ≥ 4 vùng ngang hàng (2–3 vùng thì dùng segmented/tab bar); sidebar SHALL thu gọn được, giữ selection, không ẩn mặc định, và không đặt thông tin hay hành động quan trọng ở đáy. Cột chi tiết rỗng SHALL có placeholder. Cửa sổ hẹp SHALL thu về tab bar + 1 cột mà không đổi chức năng.

#### Scenario: Sidebar cho 2 mục

- **WHEN** một màn tablet đặt sidebar chỉ 2 mục
- **THEN** gate báo lỗi và chỉ ra lựa chọn đúng: segmented control hoặc tab bar

#### Scenario: Thu gọn cửa sổ

- **WHEN** màn tablet ở regular bị thu xuống compact
- **THEN** sidebar thành tab bar, split còn 1 cột, chức năng và selection giữ nguyên

### Requirement: Glass nổi luôn in-flow và giữ tương phản

Vùng nổi có vật liệu kính (`.navbar-float`, `.tabbar-float`) SHALL là phần tử **trong luồng** (in-flow), có lề cạnh 16 pt, tab bar cao 68 pt, và SHALL nổi lên trên nội dung cuộn chứ không phải nằm trong nó. Nội dung nằm dưới kính SHALL đủ tương phản khi kính mờ và khi Reduce Transparency bật.

#### Scenario: Kính đặt absolute

- **WHEN** một vùng kính dùng `position: absolute` để trôi
- **THEN** gate báo lỗi: vùng nổi phải in-flow để không che nội dung và không làm sai phép đo

#### Scenario: Reduce Transparency

- **WHEN** bật nền đục thay cho kính mờ
- **THEN** nhãn tab và tiêu đề vẫn đọc được; tương phản chữ ≥ 4.5:1, chữ lớn ≥ 3:1

### Requirement: Cưỡng chế 2 tầng, lỗi luôn kèm cách sửa

`npm run gate` SHALL chạy cả tầng tĩnh và tầng đo vùng. Lỗi SHALL báo `file:line` (tầng tĩnh) hoặc selector + khung đo được (tầng đo) **kèm cách sửa**; gate SHALL fail với exit code khác 0. Cơ chế miễn trừ duy nhất là comment `<!-- lint-region: off -->` ngay trong file màn, phải kèm lý do, và danh sách miễn trừ của tầng đo phải khai báo tập trung.

#### Scenario: Vi phạm tĩnh

- **WHEN** một màn cố tình vi phạm anatomy navbar rồi chạy `npm run gate`
- **THEN** gate dừng ở tầng tĩnh với lỗi có `file:line` và câu hướng sửa, exit code ≠ 0

#### Scenario: Vi phạm hình học

- **WHEN** mọi luật tĩnh xanh nhưng một control nằm trên dải chia của màn fold
- **THEN** tầng đo báo lỗi với selector, rect đo được và tên vùng, exit code ≠ 0

#### Scenario: Miễn trừ không lý do

- **WHEN** một file chứa `<!-- lint-region: off -->` mà không có lý do ngay sau
- **THEN** gate báo lỗi yêu cầu viết lý do; comment không bị xem là miễn trừ

### Requirement: Tài liệu chuẩn là nguồn duy nhất, không còn trích dẫn hỏng

`docs/screen-regions.md` SHALL là nguồn duy nhất của bản đồ vùng, chứa bản đồ theo form factor và bảng tham chiếu Watch/Widget; mỗi dòng số đo SHALL ghi nguồn. `README.md`, skill `phone-canvas` và mã nguồn SHALL trỏ tới đúng đường dẫn tồn tại.

#### Scenario: Trích dẫn hỏng

- **WHEN** tìm mọi tham chiếu tới `docs/screen-authoring.md` và `src/screens/manifest.ts` trong repo
- **THEN** không còn tham chiếu chết; hoặc đã sửa sang đường dẫn có thật, hoặc còn lại một dòng ghi chú redirect nói rõ file gốc đã dời đi đâu

#### Scenario: Bề mặt mới

- **WHEN** một bề mặt Watch, Widget hoặc form factor mới được đề xuất
- **THEN** thiết kế phải đối chiếu được từng dòng với bảng tham chiếu trong tài liệu (vùng, margin, cỡ chữ ≥ 11 pt, touch ≥ 44 pt) trước khi dựng; nếu bổ sung form factor mới thì phải thêm hàng vào bản đồ vùng và có preset `Device.form` tương ứng

### Requirement: Bộ ba màn Duo là mẫu tham chiếu

`duo-home-cover`, `duo-home-inner`, `duo-home-fold` của `calo-ai` SHALL là hiện thân chuẩn: cover 1 pane + rail dọc, inner split lệch, fold split 50/50, cùng state, và SHALL pass **cả hai** tầng gate. Mọi màn Duo mới SHALL copy cấu trúc vùng của bộ ba này thay vì tự phát minh.

#### Scenario: Gate trên mẫu

- **WHEN** chạy `npm run gate` sau khi bật cả hai tầng
- **THEN** cả ba màn xanh; `npm run audit:regions` in ra `cover: 1 pane + rail`, `inner: split 1:2`, `fold: split 50/50, division band clear`

#### Scenario: Dùng mẫu làm khuôn

- **WHEN** một màn Duo mới được tạo
- **THEN** cấu trúc vùng của nó khớp một trong ba mẫu, và lint tĩnh không báo lỗi cấu trúc vùng
