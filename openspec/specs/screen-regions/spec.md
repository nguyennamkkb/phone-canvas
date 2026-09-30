# screen-regions Specification

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

## Requirements

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
