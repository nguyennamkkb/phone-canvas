# Spec Delta

## MODIFIED Requirements

### Requirement: Vùng cố định phải khai báo bằng từ điển vùng, không dựng tay

Dải điều hướng cố định (`.navbar` / `.navbar-float` / `.tabbar` / `.tabbar-float` / `.dock`) SHALL do **shell** dựng và định vị, nằm **ngoài** vùng cuộn, từ ruột do tác giả khai bằng slot: phần tử mang `data-slot="back"`, `data-slot="title"`, `data-slot="right"` SHALL được shell gom vào `.region-nav`; phần tử mang `data-tab` SHALL được gom vào `.region-tabs`. Màn hình SHALL NOT khai bất kỳ class band nào ở trên. Vùng do tác giả sở hữu còn lại (arrangement, dải dọc, sidebar) SHALL vẫn dùng class vùng dùng chung. Một dải flex ở mép trên hoặc mép dưới chứa phần tử tương tác mà không phải slot của shell SHALL bị coi là **vùng chưa khai báo** và báo lỗi.

#### Scenario: Tác giả khai band shell

- **WHEN** một màn chứa `<nav class="navbar">` hoặc `<div class="tabbar">` rồi chạy `npm run lint:regions`
- **THEN** gate báo lỗi tại `file:line`: band này do shell dựng, hãy khai ruột bằng `data-slot` / `data-tab`; không có màn nào được miễn trừ âm thầm

#### Scenario: Khai slot hợp lệ

- **WHEN** một màn chỉ khai `<span data-slot="title">Hôm nay</span>` và các `<button data-tab>`
- **THEN** lint xanh; documentation của shell dựng `.region-nav` với ba slot theo thứ tự `back · title · right`, và `.region-tabs` cho các `data-tab`, mỗi band nằm ngoài vùng cuộn

#### Scenario: Thanh trên dựng tay

- **WHEN** một màn mở đầu bằng `<div class="row" style="justify-content: space-between">` chứa nút và tiêu đề, không có slot nào
- **THEN** gate báo lỗi "vùng chưa khai báo" tại dòng đó, kèm mẫu HTML slot đúng để thay

#### Scenario: Ô giữ chỗ tay

- **WHEN** một dải ở mép trên của vùng nội dung dựng ô giữ chỗ (`<span style="width: 44px"></span>`) kèm ít nhất một control, và không khai slot nào
- **THEN** gate báo lỗi `region-undeclared` tại dòng đó, kèm cách sửa: khai ruột bằng `data-slot="back|title|right"` để shell dựng dải và tự canh vị trí — tác giả không còn dựng dải nên ô giữ chỗ không còn chỗ dùng

#### Scenario: Lớp vùng dùng chung tồn tại

- **WHEN** `src/screens/tokens.css` được đọc
- **THEN** có `.split`, `.pane`, `.pane-lead`, `.pane-trail`, `.rail`, `.rail-tools`, `.rail-tabs`, `.rail-item`, `.sidebar`, `.sidebar-head`, `.sidebar-item`, mỗi rule kèm HTML mẫu trong chú thích và **không** dùng `position: absolute`

### Requirement: Khung dọc chuẩn của màn phone

Màn `form: phone` SHALL tuân thủ đúng thứ tự vùng: status bar *(shell)* → dải nav *(shell)* → thân cuộn → tab bar *(shell, tuỳ chọn)* → home indicator *(shell)*. Dải nav SHALL có tối đa 3 slot (dẫn · tiêu đề · hành động), tiêu đề SHALL là **một dòng**, màn push (có điều hướng quay lại) SHALL có slot back dùng symbol chuẩn chứ không dùng chữ "Back"/"Close", và số hành động cuối SHALL ≤ 3 — phần dư đưa vào menu "More". Nội dung SHALL dùng lề 16 pt và nhịp 4/8 pt.

#### Scenario: Navbar quá tải

- **WHEN** ruột nav có 4 `<button>` ở slot phải, hoặc tiêu đề dài 2 dòng, hoặc màn push thiếu slot back
- **THEN** gate báo lỗi `file:line` cho từng vi phạm, kèm cách sửa cụ thể (bỏ về More / rút tiêu đề / thêm slot back)

#### Scenario: Màn không có navbar

- **WHEN** một màn không khai slot nav vì không điều hướng (splash, login, full-bleed ảnh)
- **THEN** hợp lệ, không cảnh báo; shell không dựng band nav khi không có `data-slot`, không ép thêm vùng giả

### Requirement: Sàn chạm 44 × 44 pt trong mọi vùng

Mọi phần tử tương tác SHALL render ra khung ≥ 44 × 44 pt, kể cả phần tử nằm trong dải nav và tab do shell dựng. Lớp tương tác dùng làm mục tiêu chạm trong vùng cố định SHALL khai báo ≥ 44 pt trong `tokens.css`, trừ khi vùng cha đã bảo đảm. Lớp luôn là mục tiêu chạm nhưng nhỏ hơn 44 pt (`.close-btn`, `.pill-soft`, `.icon-btn`) SHALL được nâng lên ≥ 44 pt.

#### Scenario: Lớp khai báo nhỏ hơn sàn

- **WHEN** một lớp trong `tokens.css` là mục tiêu chạm và khai báo chiều cao/dài < 44 px
- **THEN** `npm run lint:regions` báo lỗi "mục tiêu chạm dưới sàn" kèm kích thước đang khai báo

#### Scenario: Chạm đo được sau khi dựng

- **WHEN** `npm run audit:regions` dựng một màn và tìm phần tử tương tác có khung < 44 × 44 pt, trong đó có phần tử nằm trong `.region-nav` / `.region-tabs`
- **THEN** báo cáo liệt kê từng phần tử kèm selector, kích thước đo được và vùng chứa nó; phần tử nằm trong danh sách miễn trừ thì bỏ qua, ngoài danh sách thì gate đỏ

#### Scenario: Miễn trừ phải có lý do

- **WHEN** một phần tử cần miễn trừ sàn chạm
- **THEN** mục miễn trừ bắt buộc có chuỗi lý do; miễn trừ không lý do bị coi là không tồn tại

### Requirement: Cưỡng chế 2 tầng, lỗi luôn kèm cách sửa

`npm run gate` SHALL chạy cả tầng tĩnh và tầng đo vùng. Lỗi SHALL báo `file:line` (tầng tĩnh) hoặc selector + khung đo được (tầng đo) **kèm cách sửa**; gate SHALL fail với exit code khác 0. Tầng đo SHALL kiểm thêm: dải nav và tab nằm ngoài vùng cuộn, đúng **một** vùng cuộn, và thân `.body-fixed` không tràn khung. Cơ chế miễn trừ duy nhất là comment `<!-- lint-region: off -->` ngay trong file màn, phải kèm lý do, và danh sách miễn trừ của tầng đo phải khai báo tập trung.

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

### Requirement: Tài liệu chuẩn là nguồn duy nhất, không còn trích dẫn hỏng

`docs/screen-regions.md` SHALL là nguồn duy nhất của bản đồ vùng, chứa bản đồ theo form factor, hợp đồng shell↔tác giả của v2 (dải nav/tab do shell, slot `data-slot` / `data-tab`), hợp đồng cao cố định + cuộn, hai chế độ export, phạm vi hiện hành (phone trước; iPad/Duo giữ luật nhưng chưa lên shell), và bảng tham chiếu Watch/Widget; mỗi dòng số đo SHALL ghi nguồn. `README.md`, skill `phone-canvas` và mã nguồn SHALL trỏ tới đúng đường dẫn tồn tại.

#### Scenario: Trích dẫn hỏng

- **WHEN** tìm mọi tham chiếu tới `docs/screen-authoring.md` và `src/screens/manifest.ts` trong repo
- **THEN** không còn tham chiếu chết; hoặc đã sửa sang đường dẫn có thật, hoặc còn lại một dòng ghi chú redirect nói rõ file gốc đã dời đi đâu

#### Scenario: Bề mặt mới

- **WHEN** một bề mặt Watch, Widget hoặc form factor mới được đề xuất
- **THEN** thiết kế phải đối chiếu được từng dòng với bảng tham chiếu trong tài liệu (vùng, margin, cỡ chữ ≥ 11 pt, touch ≥ 44 pt) trước khi dựng; nếu bổ sung form factor mới thì phải thêm hàng vào bản đồ vùng và có preset `Device.form` tương ứng

#### Scenario: Tài liệu khớp hành vi

- **WHEN** đọc `docs/screen-regions.md` sau v2
- **THEN** nó mô tả đúng cấu trúc 5 dải, slot `data-slot` / `data-tab`, chế độ export mặc định/`--full`, và không còn câu "the screen is NOT height-constrained"

## ADDED Requirements

### Requirement: Màn cao cố định với đúng một vùng cuộn

`.device` SHALL cao đúng bằng `Device.height` (không `min-height`), và mỗi màn phone SHALL có **đúng một** vùng cuộn dọc. Thân `.body` SHALL là vùng cuộn đó; status bar, dải nav, tab bar và home indicator SHALL nằm ngoài nó và không cuộn theo. Thân `.body-fixed` SHALL vừa trong khung: nếu nội dung cao hơn khung thì đó là lỗi, không phải cuộn ngầm.

#### Scenario: Thân cuộn như iPhone thật

- **WHEN** dựng một màn có `.body` với nội dung cao hơn khung thiết bị
- **THEN** dải nav và tab bar vẫn ở nguyên vị trí ở hai mép, chỉ ruột `.body` cuộn; `.device` đo được đúng `Device.height`

#### Scenario: Nhiều hơn một vùng cuộn

- **WHEN** một màn khai hai phần tử cùng `overflow-y: auto`
- **THEN** tầng đo báo lỗi "nhiều hơn một vùng cuộn" kèm selector từng vùng

#### Scenario: Thân một trang tràn

- **WHEN** một màn dùng `.body-fixed` mà nội dung cao hơn khung
- **THEN** tầng đo báo lỗi `region-overflow`; màn phải chuyển sang `.body` hoặc rút nội dung

### Requirement: Export khung máy mặc định, `--full` toàn trang

`npm run export` SHALL mặc định chụp **đúng khung thiết bị** (`device.width × device.height`), nội dung dài hơn khung bị cuộn/khuất. Cờ `--full` SHALL chụp toàn bộ chiều dài nội dung (hành vi cũ). Tên file của bản `--full` SHALL phân biệt được với bản khung máy.

#### Scenario: Export mặc định

- **WHEN** chạy `npm run export -- --screen home`
- **THEN** PNG cao đúng `device.height × scale` (ví dụ 390×844 ở scale 2 → 780×1688), không phải 780×2122

#### Scenario: Export toàn trang

- **WHEN** chạy `npm run export -- --screen home --full`
- **THEN** PNG cao bằng toàn bộ nội dung và tên file có hậu tố phân biệt, để hai chế độ không ghi đè nhau

### Requirement: Board cuộn trong khung, có toggle mở rộng

Node trên board SHALL vẽ đúng khung `Device.height`; iframe bên trong SHALL cuộn được để cho cảm giác như thiết bị thật. Node SHALL có toggle mở rộng để xem hết nội dung mà không cần export.

#### Scenario: Khung cố định trên board

- **WHEN** board hiển thị một màn có nội dung cao hơn khung
- **THEN** node cao đúng `Device.height`, ruột cuộn được bên trong, dải nav/tab đứng yên

#### Scenario: Toggle mở rộng

- **WHEN** người dùng bật toggle mở rộng trên một node
- **THEN** node cao theo toàn bộ nội dung để xem hết, tắt toggle thì trở về khung thiết bị

### Requirement: Màn phone lõi là mẫu tham chiếu

Bộ màn phone lõi của `calo-ai` — `home`, `camera`, `textvoice`, `confirm`, `diary` — SHALL là hiện thân chuẩn của v2: dải nav và tab do shell dựng từ slot, thân cuộn bằng `.body` khi nội dung dài hơn khung. Mọi màn phone mới SHALL theo cấu trúc này thay vì tự phát minh.

#### Scenario: Gate trên mẫu

- **WHEN** chạy `npm run gate` sau v2
- **THEN** cả 5 màn xanh ở cả hai tầng; `npm run audit:regions` in ra `chrome: ok`, `scroll: ok`, `overflow: ok`

#### Scenario: Dùng mẫu làm khuôn

- **WHEN** một màn phone mới được tạo
- **THEN** cấu trúc vùng của nó dùng slot `data-slot` / `data-tab` và không khai `.navbar` / `.tabbar`, và lint tĩnh không báo lỗi cấu trúc vùng

## REMOVED Requirements

### Requirement: Bộ ba màn Duo là mẫu tham chiếu

**Reason**: Ba màn `duo-home-cover` / `duo-home-inner` / `duo-home-fold` đã bị xoá ngày 30/09/2026 khi `calo-ai` thu gọn còn 5 màn lõi, nên không thể là mẫu tham chiếu sống; luật Duo vẫn còn nhưng chỉ được kiểm bằng fixture.

**Migration**: Dùng `### Requirement: Màn phone lõi là mẫu tham chiếu` (màn `calo-ai` 5 màn). Khi dựng lại bề mặt Duo, tạo lại một màn `--device duo-inner` và bổ sung mẫu tương ứng; luật rail/split vẫn nguyên trong `docs/screen-regions.md`.
