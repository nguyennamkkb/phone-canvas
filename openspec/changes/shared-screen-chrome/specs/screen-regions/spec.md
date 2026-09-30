# Spec Delta

## MODIFIED Requirements

### Requirement: Vùng cố định phải khai báo bằng từ điển vùng, không dựng tay

Dải điều hướng cố định (`.navbar` / `.navbar-float` / `.tabbar` / `.tabbar-float` / `.dock`) SHALL do **shell** dựng và định vị, nằm **ngoài** vùng cuộn, từ ruột do tác giả khai bằng slot: phần tử mang `data-slot="back"`, `data-slot="title"`, `data-slot="right"` SHALL được shell gom vào `.region-nav`; phần tử mang `data-tab="<destination>"` SHALL được gom vào `.region-tabs`. Màn hình SHALL NOT khai bất kỳ class band nào ở trên. Vùng do tác giả sở hữu còn lại (arrangement, dải dọc, sidebar) SHALL vẫn dùng class vùng dùng chung. Một dải flex ở mép trên hoặc mép dưới chứa phần tử tương tác mà không phải slot của shell SHALL bị coi là **vùng chưa khai báo** và báo lỗi.

Ruột band SHALL có thể đến từ hai nguồn: khai trực tiếp trong màn, hoặc từ component dùng chung của project qua `<!-- @component app-nav -->` / `<!-- @component app-tabs -->`. Khi cả hai nguồn cùng khai một slot, **bản của màn SHALL thắng**; slot màn không khai SHALL lấy mặc định của component. Một slot rỗng do màn khai (`<span data-slot="title"></span>`) SHALL được coi là "để trống có chủ đích" và SHALL chặn mặc định của component. Với `data-tab` — một danh sách chứ không phải slot tên — nếu màn khai bất kỳ `data-tab` nào thì **cả danh sách của màn SHALL thắng**; màn vừa include `app-tabs` vừa tự khai `data-tab` SHALL bị coi là lỗi nhập nhằng.

#### Scenario: Tác giả khai band shell

- **WHEN** một màn chứa `<nav class="navbar">` hoặc `<div class="tabbar">` rồi chạy `npm run lint:regions`
- **THEN** gate báo lỗi tại `file:line`: band này do shell dựng, hãy khai ruột bằng `data-slot` / `data-tab`; không có màn nào được miễn trừ âm thầm

#### Scenario: Khai slot hợp lệ

- **WHEN** một màn chỉ khai `<span data-slot="title">Hôm nay</span>` và các `<button data-tab="home">`
- **THEN** lint xanh; shell dựng `.region-nav` với ba slot theo thứ tự `back · title · right`, và `.region-tabs` cho các `data-tab`, mỗi band nằm ngoài vùng cuộn

#### Scenario: Thanh trên dựng tay

- **WHEN** một màn mở đầu bằng `<div class="row" style="justify-content: space-between">` chứa nút và tiêu đề, không có slot nào
- **THEN** gate báo lỗi "vùng chưa khai báo" tại dòng đó, kèm mẫu HTML slot đúng để thay

#### Scenario: Ô giữ chỗ tay

- **WHEN** một dải ở mép trên của vùng nội dung dựng ô giữ chỗ (`<span style="width: 44px"></span>`) kèm ít nhất một control, và không khai slot nào
- **THEN** gate báo lỗi `region-undeclared` tại dòng đó, kèm cách sửa: khai ruột bằng `data-slot="back|title|right"` để shell dựng dải và tự canh vị trí — tác giả không còn dựng dải nên ô giữ chỗ không còn chỗ dùng

#### Scenario: Lớp vùng dùng chung tồn tại

- **WHEN** `src/screens/tokens.css` được đọc
- **THEN** có `.split`, `.pane`, `.pane-lead`, `.pane-trail`, `.rail`, `.rail-tools`, `.rail-tabs`, `.rail-item`, `.sidebar`, `.sidebar-head`, `.sidebar-item`, mỗi rule kèm HTML mẫu trong chú thích và **không** dùng `position: absolute`

#### Scenario: Ruột band đến từ component dùng chung

- **WHEN** một màn chỉ chứa `<!-- @component app-tabs -->` và khai `data-tab-active="home"`, không tự khai `data-tab` nào
- **THEN** lint xanh; shell dựng `.region-tabs` từ bộ destination trong `app-tabs.html`, và màn không phải chép lại danh sách destination

#### Scenario: Màn thắng từng slot

- **WHEN** `app-nav.html` khai `data-slot="back"` và `data-slot="title"`, còn màn A khai `<span data-slot="title">Xác nhận món</span>` và màn B khai `<span data-slot="title"></span>`
- **THEN** ở màn A tiêu đề của màn thắng tiêu đề mặc định; ở màn B slot rỗng thắng nên không tiêu đề nào được điền; cả hai màn vẫn nhận `back` từ component

#### Scenario: Hai nguồn cùng định nghĩa danh sách tab

- **WHEN** một màn vừa chứa `<!-- @component app-tabs -->` vừa tự khai `<button data-tab="home">`
- **THEN** gate báo lỗi `file:line` nói rõ danh sách tab chỉ được có một nguồn, để tránh hai định nghĩa song song

### Requirement: Khung dọc chuẩn của màn phone

Màn `form: phone` SHALL tuân thủ đúng thứ tự vùng: status bar *(shell)* → dải nav *(shell)* → thân cuộn → tab bar *(shell, tuỳ chọn)* → home indicator *(shell)*. Dải nav SHALL có tối đa 3 slot (dẫn · tiêu đề · hành động), tiêu đề SHALL là **một dòng**, màn push (có điều hướng quay lại) SHALL có slot back dùng symbol chuẩn chứ không dùng chữ "Back"/"Close", và số hành động cuối SHALL ≤ 3 — phần dư đưa vào menu "More". Nội dung SHALL dùng lề 16 pt và nhịp 4/8 pt.

Màn SHALL có **đúng một** thân nội dung, là `.body` (cuộn, cho nội dung dài hơn khung) hoặc `.body-fixed` (vừa khung). Phần tử nội dung nằm trực tiếp trong `.screen` ngoài hai class này SHALL bị coi là **vùng chưa khai báo**. Hai band do shell dựng SHALL được phát ra dưới dạng `<nav>` kèm `aria-label`: tác giả không sở hữu band nên không thể và không phải gắn ngữ nghĩa cho chúng.

#### Scenario: Navbar quá tải

- **WHEN** ruột nav có 4 `<button>` ở slot phải, hoặc tiêu đề dài 2 dòng, hoặc màn push thiếu slot back
- **THEN** gate báo lỗi `file:line` cho từng vi phạm, kèm cách sửa cụ thể (bỏ về More / rút tiêu đề / thêm slot back)

#### Scenario: Màn không có navbar

- **WHEN** một màn không khai slot nav vì không điều hướng (splash, login, full-bleed ảnh)
- **THEN** hợp lệ, không cảnh báo; shell không dựng band nav khi không có `data-slot`, không ép thêm vùng giả

#### Scenario: Đúng một thân

- **WHEN** một màn khai hai thân `.body` / `.body-fixed`, hoặc thả nội dung trực tiếp vào `.screen` mà không có thân nào
- **THEN** gate báo lỗi `file:line` nêu rõ màn phải có đúng một thân, kèm cách chọn: `.body` khi nội dung dài hơn khung, `.body-fixed` khi nội dung vừa khung

#### Scenario: Band có ngữ nghĩa

- **WHEN** dựng một màn có khai nav hoặc tab
- **THEN** `.region-nav` và `.region-tabs` được phát ra là `<nav>` và mỗi band có `aria-label`; không màn nào phải tự khai thêm ngữ nghĩa cho band

### Requirement: Tab bar 3–5 destination, nhãn luôn hiện

Tab bar SHALL có 3–5 destination, mỗi destination SHALL có icon **và** nhãn, icon dạng filled, badge chỉ dành cho thông tin khẩn. Mỗi destination SHALL có một **slug** ổn định khai bằng `data-tab="<slug>"`; slug là danh tính của destination, không phải chuỗi hiển thị. Màn SHALL khai destination đang mở bằng `data-tab-active="<slug>"` trên `.screen`. Chọn hiện tại SHALL được giữ nguyên khi đổi form factor (phone ↔ dải dọc Duo ↔ sidebar tablet). Ở form factor rộng, tab bar SHALL thành sidebar; ở form factor hẹp, sidebar SHALL thu về tab bar mà không mất chức năng. `aria-label` của từng tab và thứ tự "tab N trên M" SHALL do shell suy ra từ bộ destination, không do tác giả chép tay.

#### Scenario: Quá 5 tab

- **WHEN** một tab bar khai báo 6 destination
- **THEN** gate báo lỗi và chỉ đường thoát: gộp vào More ở hẹp, hoặc chuyển sang sidebar ở rộng

#### Scenario: Thiếu nhãn

- **WHEN** một destination chỉ có icon, không nhãn
- **THEN** gate báo lỗi tại destination đó

#### Scenario: Giữ selection khi đổi form factor

- **WHEN** cùng một bộ destination được dựng ở `reference` và ở `duo-inner`
- **THEN** destination đang chọn là cùng một mục, kiểu dấu selected giống nhau

#### Scenario: Điểm active do shell suy ra

- **WHEN** một màn khai `data-tab-active="diary"` và bộ destination nằm trong `app-tabs.html`
- **THEN** tab ứng với slug `diary` nhận `is-active` và `aria-current="page"`, các tab khác không; `aria-label` và số thứ tự đúng theo vị trí thật trong bộ, kể cả sau khi bộ được xếp lại

#### Scenario: Active trỏ sai đích

- **WHEN** `data-tab-active` trỏ tới slug không có trong bộ destination, hoặc một màn có tab mà không khai `data-tab-active`, hoặc khai nhiều hơn một
- **THEN** gate báo lỗi `file:line` nêu slug sai và bộ destination hợp lệ của project

### Requirement: Cưỡng chế 2 tầng, lỗi luôn kèm cách sửa

`npm run gate` SHALL chạy cả tầng tĩnh và tầng đo vùng. Lỗi SHALL báo `file:line` (tầng tĩnh) hoặc selector + khung đo được (tầng đo) **kèm cách sửa**; gate SHALL fail với exit code khác 0. Tầng đo SHALL kiểm thêm: dải nav và tab nằm ngoài vùng cuộn, đúng **một** vùng cuộn, thân `.body-fixed` không tràn khung, và **hình học của band do shell dựng** — dải nav nằm trên thân, tab bar nằm dưới thân. Luật vùng SHALL áp cho cả file component (`project/*/components/*.html`), không chỉ file màn. Cơ chế miễn trừ duy nhất là comment `<!-- lint-region: off -->` ngay trong file màn, phải kèm lý do, và danh sách miễn trừ của tầng đo phải khai báo tập trung.

#### Scenario: Vi phạm tĩnh

- **WHEN** một màn cố tình khai `.navbar` rồi chạy `npm run gate`
- **THEN** gate dừng ở tầng tĩnh với lỗi có `file:line` và câu hướng sửa, exit code ≠ 0

#### Scenario: Vi phạm hình học

- **WHEN** mọi luật tĩnh xanh nhưng một control nằm trên dải chia của màn fold
- **THEN** tầng đo báo lỗi với selector, rect đo được và tên vùng, exit code ≠ 0

#### Scenario: Thân một trang tràn khung

- **WHEN** mọi luật tĩnh xanh nhưng nội dung `.body-fixed` cao hơn khung thiết bị
- **THEN** tầng đo báo lỗi `region-overflow` với selector và chiều cao đo được, hướng dẫn chuyển sang `.body` (cuộn) hoặc rút nội dung, exit code ≠ 0

#### Scenario: Band nằm trong vùng cuộn

- **WHEN** dải nav hoặc tab bar có rect nằm bên trong phần tử cuộn
- **THEN** tầng đo báo lỗi nêu rõ band và vùng chứa, vì band phải đứng yên ngoài vùng cuộn như iPhone

#### Scenario: Miễn trừ không lý do

- **WHEN** một file chứa `<!-- lint-region: off -->` mà không có lý do ngay sau
- **THEN** gate báo lỗi yêu cầu viết lý do; comment không bị xem là miễn trừ

#### Scenario: Luật vùng áp cho component

- **WHEN** một file trong `project/*/components/` chứa `data-slot="titel"`, hoặc `class="navbar"`, rồi chạy `npm run lint:regions`
- **THEN** gate báo lỗi kèm `file:line` của chính file component đó, không im lặng bỏ qua vì đó không phải file màn

#### Scenario: Tầng đo kiểm hình học band shell

- **WHEN** dải nav hoặc tab bar do shell dựng bị đặt sai tương quan với thân — nav nằm dưới thân, hoặc tab nằm trên thân
- **THEN** tầng đo báo lỗi kèm selector và rect đo được của từng band, exit code ≠ 0

### Requirement: Tài liệu chuẩn là nguồn duy nhất, không còn trích dẫn hỏng

`docs/screen-regions.md` SHALL là nguồn duy nhất của bản đồ vùng, chứa bản đồ theo form factor, hợp đồng shell↔tác giả (dải nav/tab do shell, slot `data-slot` / `data-tab`), **chrome dùng chung** (`app-nav` / `app-tabs`, luật ghi đè từng slot) và **danh tính tab** (`data-tab` / `data-tab-active` chỉ điểm active), hợp đồng cao cố định + cuộn, hai chế độ export, phạm vi hiện hành (phone trước; iPad/Duo giữ luật nhưng chưa lên shell), và bảng tham chiếu Watch/Widget; mỗi dòng số đo SHALL ghi nguồn. `README.md`, skill `phone-canvas` và mã nguồn SHALL trỏ tới đúng đường dẫn tồn tại. Tri thức về chuẩn vùng SHALL tồn tại ở **một** bản skill duy nhất trong repo.

#### Scenario: Trích dẫn hỏng

- **WHEN** tìm mọi tham chiếu tới `docs/screen-authoring.md` và `src/screens/manifest.ts` trong repo
- **THEN** không còn tham chiếu chết; hoặc đã sửa sang đường dẫn có thật, hoặc còn lại một dòng ghi chú redirect nói rõ file gốc đã dời đi đâu

#### Scenario: Bề mặt mới

- **WHEN** một bề mặt Watch, Widget hoặc form factor mới được đề xuất
- **THEN** thiết kế phải đối chiếu được từng dòng với bảng tham chiếu trong tài liệu (vùng, margin, cỡ chữ ≥ 11 pt, touch ≥ 44 pt) trước khi dựng; nếu bổ sung form factor mới thì phải thêm hàng vào bản đồ vùng và có preset `Device.form` tương ứng

#### Scenario: Tài liệu khớp hành vi

- **WHEN** đọc `docs/screen-regions.md` sau change này
- **THEN** nó mô tả đúng cấu trúc 5 dải, slot `data-slot` / `data-tab`, nguồn chrome dùng chung và luật ghi đè, danh tính tab và `data-tab-active`, chế độ export mặc định/`--full`, và không còn câu "the screen is NOT height-constrained"

#### Scenario: Một nguồn skill

- **WHEN** tìm mọi bản sao của skill `phone-canvas` trong repo
- **THEN** chỉ còn một cây thư mục, và không bản sao nào còn dạy `.navbar` / `.tabbar` / `.tabbar-light` như cách viết hợp lệ

## ADDED Requirements

### Requirement: Màn mới sinh ra hợp lệ

`npm run new-screen` SHALL sinh màn bằng slot (`data-slot` / `data-tab`) và thân `.body` / `.body-fixed`, SHALL NOT sinh `.navbar` / `.tabbar`. Cờ `--kind` SHALL chọn đúng dạng chrome: `root` (có tab), `push` (nav back + tiêu đề, không tab), `modal` (đóng + tiêu đề, không tab), `bare` (không chrome). Giá trị `kind` SHALL NOT xuất hiện trong file màn — nội dung file là bằng chứng duy nhất về dạng chrome của nó. Màn sinh ra SHALL xanh ở cả hai tầng mà không cần sửa tay.

#### Scenario: Sinh màn rồi lint

- **WHEN** chạy `npm run new-screen` cho từng `--kind` vào một project rồi `npm run lint:regions`
- **THEN** không lỗi nào ở bất kỳ kind nào

#### Scenario: Include trỏ vào chrome chưa có

- **WHEN** một màn include `app-tabs` nhưng project chưa có file component đó
- **THEN** `npm run lint:components` báo lỗi kèm `file:line` của dòng include, không im lặng bỏ qua

### Requirement: Một họ band duy nhất trong vocabulary

Band do shell dựng SHALL chỉ có một họ tên: `.region-nav` và `.region-tabs`, cộng biến thể `.is-glass` khi cần. `tokens.css` SHALL NOT style bất kỳ class band nào khác và SHALL NOT còn định nghĩa của vocabulary đã chết. Tên band cũ SHALL vẫn nằm trong danh sách cấm của lint, để tác giả viết `.navbar` nhận lỗi to thay vì một phần tử không style.

#### Scenario: Class bị cấm mà còn style

- **WHEN** đọc `src/screens/tokens.css`
- **THEN** không còn rule nào style `.navbar`, `.navbar-float`, `.tabbar`, `.tabbar-float`, `.dock`, `.tab-item`, `.tab-slot`, `.tabbar-light`, `.tabbar-dark`

#### Scenario: Viết tên band cũ

- **WHEN** một màn hoặc một component chứa `class="navbar"` rồi chạy `npm run lint:regions`
- **THEN** gate báo lỗi `file:line` nói band do shell dựng, dù class đó không còn CSS nào
