# Screen regions — bản đồ vùng cố định

Nguồn duy nhất cho **hình học vùng**: `src/frame/devices.ts` (safe area) +
`src/extractor/compose.ts` (ai dựng vùng nào) + `src/screens/tokens.css` (lớp
vùng dùng chung). Quy tắc hình thức lấy từ các skill `apple-design-*`; mỗi dòng
ghi nguồn. Gate kiểm: `npm run lint:regions` (tĩnh) + `npm run audit:regions`
(đo sau khi layout).

## Ranh giới shell ↔ tác giả

```
.device                              ← shell, cao CỐ ĐỊNH = device.height
├── .statusbar        (safeTop)      ← SHELL
├── .viewport         (flex: 1)      ← vùng cuộn nằm trong đây (qua .body)
│   ├── .region-nav                  ← SHELL, dựng từ [data-slot]
│   │   └── .nav-slot-back / -title / -right
│   ├── .screen                      ← markup của tác giả
│   └── .region-tabs                 ← SHELL, dựng từ [data-tab]
└── .home-indicator   (safeBottom)   ← SHELL
```

Nguồn: `src/extractor/compose.ts` (`CHROME_CSS`, `statusBarHtml`,
`homeIndicatorHtml`, `takeAttributed`) và `src/screens/tokens.css`
(`.region-nav`, `.region-tabs`).

* **KHÔNG** viết status bar, home indicator, Dynamic Island, notch trong màn.
* **KHÔNG** viết `.navbar` / `.tabbar` / `.navbar-float` / `.tabbar-float` /
  `.dock` trong màn — shell dựng band. Khai **ruột** bằng `data-slot`
  (`back` · `title` · `right`) và `data-tab`; shell xếp slot theo thứ tự chuẩn.
* Band shell nằm **trong** `.viewport` (để panel spec vẫn đo được control) nhưng
  **ngoài** `.screen`/`.body` (để không cuộn theo nội dung).
* **KHÔNG** chèn đệm giả bằng padding cứng tương đương safe area.
* Bridge chỉ duyệt phần tử **bên trong** `.viewport` (`src/extractor/bridge.js`),
  nên vùng OS (status/home) không bao giờ lọt vào spec — còn band nav/tab thì
  có, nên chúng được đặt trong `.viewport`.
* `safeBottom = 0` (iPhone SE) ⇒ không có home indicator. Không tự thêm.

### Nền dải OS phải nối liền ruột màn

`screenBgOf()` (`src/extractor/compose.ts:230-258`) đọc **longhand**
`background-color` / `background-image` trên thẻ `.screen` rồi phát lại lên
`.device`; `luminanceOf()` bật `.device.is-dark` để home bar chuyển trắng. Vì
vậy nền phải viết longhand, và dải status/home **luôn** cùng màu ruột màn.
`npm run audit:regions` in `background continuity: ok|FAIL`.

### Bẫy cascade token (đã gây vệt trắng 1 lần)

`:root` chỉ match thẻ `<html>`. `.screen` chỉ **kế thừa** token từ `<html>`
nên **luôn thua** một rule gán trực tiếp lên chính nó. Vì vậy:

* `--bg` cho `.device` (ăn theo `:root`) khai ở `:root` trong
  `project/<id>/tokens.css`;
* `--bg` cho `.screen` khai **trực tiếp** trên scope dùng nó (`.app-mood`),
  kèm một bản `:root[data-theme='dark'] .app-mood`.

Xem `project/calo-ai/tokens.css` (dòng 41-42 ghi nguyên văn bài học này).

### Khung cao cố định và vùng cuộn

`.device` cao **đúng** `Device.height` (`compose.ts` đặt `height`, không
`min-height`), nên một màn có **đúng một** vùng cuộn dọc:

* `.body` — vùng cuộn (`overflow-y: auto`). Dùng khi nội dung cao hơn khung.
* `.body-fixed` — một trang, **phải vừa khung**. Tràn khung là lỗi
  `region-overflow`, không phải thanh cuộn ngầm.

Vì khung bị chặn chiều cao, con trực tiếp của `.body` / `.body-fixed` được đặt
`flex-shrink: 0` (`tokens.css`) — nếu để co được thì chúng bị **bóp** thay vì
tràn: `.btn` (khai 58 pt) từng đo còn **39 pt** trong `confirm` vì bị shrink, và
sàn chạm 44 pt bắt được đúng lỗi đó. `.screen` và `.body-fixed` dùng
`overflow: hidden` (không phải `overflow-x: hidden`) vì CSS tự nâng `overflow-y`
thành `auto` khi một chiều là `hidden` — màn sẽ bị tính nhầm là một scroller.

Nguồn: `src/extractor/compose.ts` (`CHROME_CSS`), `src/screens/tokens.css`
(`.screen`, `.body`, `.body-fixed`), `scripts/region-audit.ts` (check
`scroll` / `overflow`).

**Export và board cùng một sự thật.** `npm run export` mặc định chụp **đúng
khung máy** (`device.height × scale`); `npm run export -- --full` chụp toàn
trang và giữ hậu tố `-full` để hai chế độ không ghi đè nhau. Trên board, node
cao đúng khung và cuộn bên trong; nút mở rộng (⤢) cho xem hết nội dung. Bridge
báo cả `deviceHeight` và `contentHeight` (`= khung + phần tràn`), nên nút mở
rộng và `--full` cho cùng một con số.

## Bản đồ vùng theo form factor

Form factor **suy ra** từ `deviceId` qua `formFactorOf()` — không khai báo
thêm, không branch `if-device` trong HTML (invariant #5).

### `phone` — `reference`, `iphone-16-pro`, `iphone-se`, `appstore-67`

| # | Vùng (trên→dưới) | Ai sở hữu | Lớp | Số đo | Nguồn |
|---|---|---|---|---|---|
| 1 | status bar | shell | `.statusbar` | cao = `safeTop` (59 / 62 / 20 / 0) · lề ngang `--safe-x` = 28 có island, 16 không | `src/frame/devices.ts`, `compose.ts:300-307` |
| 2 | dải nav | **shell** (ruột do tác giả khai) | `.region-nav` ← `data-slot="back\|title\|right"` | cao tối thiểu 44 pt · lề 16 pt · tối đa 3 slot | `.region-nav` tokens.css · 44 pt: apple-design-iphone/references/SPECS.md |
| 3 | content | tác giả | `.body` (cuộn — vùng cuộn **duy nhất**) hoặc `.body-fixed` (1 trang, phải vừa khung) | lề 16 pt, nhịp 4/8 pt | apple-design-iphone/SKILL.md · `.body` tokens.css:188-196 |
| 4 | tab bar (tuỳ chọn) | **shell** (ruột do tác giả khai) | `.region-tabs` ← `data-tab` | cao 68 pt · 3–5 destination · icon **+** nhãn | 68 pt: apple-design-iphone/references/SPECS.md, COMPONENTS.md · 3–5: apple-design-iphone/SKILL.md |
| 5 | home indicator | shell | `.home-indicator` | cao = `safeBottom` (34 / 34 / 0 / 0) | `src/frame/devices.ts` |

Navbar: tiêu đề **< 15 ký tự** để chừa chỗ cho control
(apple-design-iphone/references/COMPONENTS.md); **≤ 3** action ở slot cuối,
phần dư vào menu More (apple-design-iphone/SKILL.md); nút back dùng symbol
chuẩn, **không** dùng chữ "Back"/"Close"
(apple-design-iphone/references/COMPONENTS.md). Nút tròn `.nav-round` 44×44 là
điểm chuẩn duy nhất trong từ điển (tokens.css:684-698).

Màn không điều hướng (splash, login, full-bleed) **được phép** không khai slot
nav — shell không dựng band, không ép thêm vùng giả.

### `cover` — `duo-cover` 466×678 (Duo ngoài, dùng khi gập)

| # | Vùng | Ai sở hữu | Lớp | Số đo | Nguồn |
|---|---|---|---|---|---|
| 1 | status bar | shell | `.statusbar` | `safeTop` 44 | `devices.ts` |
| 2 | content 1 pane | tác giả | `.row` > `.pane` | lề 16 pt | apple-design-iphone-duo/SKILL.md |
| 3 | dải dọc trailing | tác giả | `.rail` > `.rail-tools` + `.rail-tabs` | rộng cố định `--rail-w` 44 · item cao linh hoạt ≥ 44 pt | apple-design-iphone-duo/references/VERTICAL-BARS.md |
| 4 | home indicator | shell | `.home-indicator` | `safeBottom` 24 | `devices.ts` |

* Thứ tự trong dải dọc: **điều hướng chính (Back/Close) ở trên cùng → hành động
  nổi bật (Done) → nhóm còn lại giữ thứ tự gốc**
  (apple-design-iphone-duo/references/VERTICAL-BARS.md).
* **KHÔNG tự thêm padding/gap giữa các nhóm** — hệ thống chịu trách nhiệm khoảng
  cách (cùng nguồn). Đây là một luật của `lint:regions`.
* Item dọc ưu tiên **symbol** (chiều rộng cố định, chiều cao linh hoạt); mỗi
  item phải có **cả title lẫn symbol** (cùng nguồn).
* Tab bar ở cover là **dọc, bottom-aligned** trong cùng dải, 3–5 mục
  (apple-design-iphone-duo/SKILL.md).
* **Cấm** tab ngang ở đáy ở pose cover (luật của `lint:regions`).

### `inner` — `duo-inner` 890×626 (Duo mở, ngang)

| # | Vùng | Ai sở hữu | Lớp | Số đo | Nguồn |
|---|---|---|---|---|---|
| 1 | status bar | shell | `.statusbar` | `safeTop` 24 | `devices.ts` |
| 2 | split 2 pane | tác giả | `.split` > `.pane-lead` + `.pane-trail` | pane dẫn **hẹp hơn** pane hậu | apple-design-iphone-duo/references/POSES.md |
| 3 | home indicator | shell | `.home-indicator` | `safeBottom` 20 | `devices.ts` |

* Arrangement nằm **ngoài** navigation container; navigation container không
  được nằm bên trong arrangement
  (apple-design-iphone-duo/references/ARRANGEMENTS.md).
* **Mỗi pane giữ control của chính nó** trên cạnh ngoài của pane — không gộp
  mọi control của cả màn lên một cạnh
  (apple-design-iphone-duo/references/IMAGES.md, Mail trên Duo).
* Split dùng cho main–detail không được che nhau; overlay dùng cho foreground
  (cùng nguồn).
* Dải dọc giữ **cùng cạnh vật lý** với cover khi chuyển pose ⇒ liền mạch
  (apple-design-iphone-duo/references/VERTICAL-BARS.md).
* Pane hậu rỗng phải có **placeholder** (apple-design-ipad/SKILL.md).

### fold — `duo-inner` ở tỉ lệ 1:1 (Duo gập một phần)

Fold **không phải device**: hai màn Duo (mở phẳng và gập một phần) cùng khai
báo `deviceId: duo-inner`, chỉ khác tỉ lệ flex. Vì vậy luật fold **không kiểm
được bằng lint tĩnh** — `audit:regions` đo.

> **Không còn màn Duo nào trong repo** (xem "Nền đo"): 30/09/2026 calo-ai thu
> gọn còn 5 màn lõi. Bảng luật dưới đây vẫn là chuẩn, và
> `scripts/region-lint.test.ts` vẫn kiểm bằng fixture — chỉ là không còn ví dụ
> sống. Tạo lại một màn `--device duo-inner` là luật có hiệu lực ngay.

| Luật | Nguồn |
|---|---|
| Dải chia (nếp gập) là vùng dành riêng: **không** control, chữ, hay ô lưới nào nằm trong đó; nội dung cuộn **được** đi qua | apple-design-iphone-duo/references/RESERVED-REGIONS.md |
| Split tự cân **50/50** khi gập | apple-design-iphone-duo/references/RESERVED-REGIONS.md |
| Lưới giữ lề ngoài, **tăng** khoảng cách quanh nếp, dùng số cột **chẵn** khi có dải chia | apple-design-iphone-duo/references/RESERVED-REGIONS.md, references/POSES.md |
| Nội dung cuộn **không** được displace liên tục (cuộn đã tự giữ liên tục) | apple-design-iphone-duo/references/RESERVED-REGIONS.md |
| Book fold: alert/menu dời sang nửa trailing | apple-design-iphone-duo/references/RESERVED-REGIONS.md |
| Dải chia chỉ **có** khi gập một phần; mở phẳng thì `width = 0` | apple-design-iphone-duo/references/RESERVED-REGIONS.md |

### `tablet` — `ipad-11` 820×1180, `ipad-mini` 744×1133

| # | Vùng | Ai sở hữu | Lớp | Số đo | Nguồn |
|---|---|---|---|---|---|
| 1 | status bar | shell | `.statusbar` | `safeTop` 24 | `devices.ts` |
| 2 | sidebar leading | tác giả | `.sidebar` > `.sidebar-head` + `.sidebar-item` | dành cho **≥ 4** vùng ngang hàng | apple-design-ipad/SKILL.md |
| 3 | split 2–3 cột | tác giả | `.split` > `.pane` | 2–3 cột; cột hỗ trợ ~360 pt; cột tối thiểu ưu tiên 500 pt | apple-design-ipad/SKILL.md, references/SPECS.md · ~360 pt: tablet-ux-fundamentals/references/ADAPTIVE-LAYOUT.md |
| 4 | home indicator | shell | `.home-indicator` | `safeBottom` 20 | `devices.ts` |

* **Một** tiêu đề duy nhất đặt trên split
  (apple-design-ipad/references/COMPONENTS.md).
* Sidebar thu gọn được, giữ selection, **không ẩn mặc định**; không đặt thông tin
  hay hành động quan trọng ở đáy sidebar
  (apple-design-ipad/references/COMPONENTS.md).
* 2–3 mục thì **không** dùng sidebar — dùng segmented hoặc tab bar
  (apple-design-ipad/SKILL.md).
* Sidebar ↔ tab bar là **morph theo chiều rộng**, không phải hai màn khác nhau
  (apple-design-ipad/references/NAVIGATION-SIDEBAR-TABS.md).
* Cửa sổ hẹp (compact) thu về tab bar + 1 cột, không mất chức năng
  (apple-design-ipad/SKILL.md).
* Glyph: tab bar ưu tiên **filled**, sidebar ưu tiên **outlined**
  (apple-design-ipad/references/NAVIGATION-SIDEBAR-TABS.md).

### Continuity giữa các pose

Cùng một state, cùng dữ liệu, cùng destination đang chọn, cùng độ sâu điều
hướng; chuyển pose **không** reset về Home, không mất đường điều hướng,
selection hay vị trí cuộn; màn inner chỉ **thêm tối đa một tầng** thông tin.
Nguồn: apple-design-iphone-duo/references/CONTINUITY-AND-SCENES.md,
apple-design-iphone-duo/SKILL.md.

## Gate kiểm gì

`npm run gate` chạy hai tầng, cả hai đều fail build.

**Tĩnh — `npm run lint:regions`** (CLI `scripts/region-lint.ts`, luật ở
`scripts/region-rules.ts`):

| Mã | Nghĩa |
|---|---|
| `chrome-redrawn` | màn vẽ lại dải OS (status bar / home indicator / island) |
| `region-shell-owned` | màn dựng dải nav/tab mà shell đã dựng |
| `region-slot-unknown` | `data-slot` sai tên / thiếu giá trị, hoặc `data-tab` rỗng |
| `region-undeclared` | dải cố định ở mép dựng tay, không slot/class vùng |
| `navbar-too-many-actions` · `navbar-title-long` · `navbar-back-missing` | anatomy slot nav |
| `tabbar-too-many` · `tabbar-unlabelled` · `cover-horizontal-tabbar` | `data-tab`: 3–5, có nhãn, không ngang ở cover |
| `touch-floor` | lớp tương tác khai dưới sàn trong `tokens.css` |
| `device-literal` | số px gắn kích thước một thiết bị |
| `region-off-without-reason` | `lint-region: off` không kèm lý do |

**Đo — `npm run audit:regions`** (`scripts/region-audit.ts`, đo sau layout
trong Chrome):

| Check | Nghĩa |
|---|---|
| `chrome` | đúng 1 `.statusbar` + 1 `.home-indicator`, cả hai ngoài `.viewport` |
| `background` | `.device` sơn đúng nền của `.screen` |
| `hit-region` | mọi rect tương tác ≥ 44×44 pt |
| `region-order` | tab bar không nằm trên nav |
| `division-band` | không control nào trên dải chia của màn fold |
| `scroll` | đúng một vùng cuộn, và band ngoài nó |
| `overflow` | `.screen` / `.body-fixed` không tràn khung |
| `shell-band` | band tồn tại khi có slot, nằm trong `.viewport`, ngoài vùng cuộn |

## Sàn chạm

| Luật | Số đo | Nguồn |
|---|---|---|
| Vùng chạm tối thiểu | **44 × 44 pt** (visionOS 60 × 60) | apple-design-iphone/references/SPECS.md, COMPONENTS.md |
| Tâm cách nhau | **≥ 60 pt** | cùng nguồn |
| Nút ≥ 60 pt | thêm **4 pt** padding để hover không dính nhau | apple-design-iphone/references/SPECS.md |
| Vùng chạm ≠ kích thước glyph | icon nhỏ vẫn được nếu vùng chạm nở ra | mobile-ux-fundamentals/references/TOUCH-AND-TARGETS.md |
| Tương phản | chữ ≥ 4.5:1, chữ lớn/UI ≥ 3:1 | mobile-ux-fundamentals/SKILL.md |

Vùng chạm là **hình học sau layout** ⇒ `audit:regions` đo rect thật;
`lint:regions` chỉ kiểm khai báo trong `tokens.css` (một lớp là mục tiêu chạm
mà khai báo < 44 px là lỗi, trừ khi vùng cha đã bảo đảm).

## Kính nổi

`.navbar-float` / `.tabbar-float` từng là band nổi **do tác giả dựng**. Từ v2
chúng thuộc nhóm **shell sở hữu** (`SHELL_BAND_CLASSES`) nên màn không được
khai nữa; shell dựng band đặc (`.region-nav` / `.region-tabs`) và biến thể kính
trong suốt là **việc để lại** (xem Open Questions của change
`shell-region-defaults`). Khi làm, band vẫn phải **in-flow**, lề cạnh 16 pt, tab
cao 68 pt, và nội dung dưới kính đủ tương phản khi bật Reduce Transparency.
Nguồn: `tokens.css`, apple-design-iphone-duo/SKILL.md,
mobile-ux-fundamentals/SKILL.md. `.scrim` dùng `fixed` (không phải `absolute`)
để phủ được cả vùng OS — `tokens.css`.

## Tham chiếu vùng Watch (chưa dựng, dùng để ràng buộc bề mặt mới)

| Vùng / luật | Số đo | Nguồn |
|---|---|---|
| Thanh trên | `topBarLeading` + `topBarTrailing`; thêm nút phải thì đồng hồ tự dồn giữa | apple-design-watch/references/NAVIGATION-AND-LAYOUT.md |
| Hành động chính | ở **bottom bar**, làm to bằng `controlSize` | cùng nguồn |
| Một ý | 1 màn = 1 ý, ≤ 3 dòng chính | apple-design-watch/SKILL.md |
| Nhãn | ≤ 3 từ; một giá trị / một trạng thái mỗi bề mặt | apple-design-watch/SKILL.md |
| Chữ phụ | ≥ 11 pt | apple-design-watch/SKILL.md |
| Độ sâu điều hướng | ≤ 2 tầng; không có tab bar | apple-design-watch/SKILL.md |
| Lưới | lưới hệ thống theo độ cong + `scenePadding`, **không** padding tay | apple-design-watch/references/NAVIGATION-AND-LAYOUT.md |
| Chạm | ≥ 44 × 44 pt; tránh mép cong | apple-design-watch/SKILL.md |

## Tham chiếu vùng Widget / Live Activity (chưa dựng)

| Vùng / luật | Số đo | Nguồn |
|---|---|---|
| Lề | **16 pt**, **đồng tâm với bo** của container; bo Dynamic Island 44 pt | apple-design-widget/SKILL.md, references/SPECS.md |
| Chữ | ≥ 11 pt (nhỏ hơn thì nhiều người không đọc nổi); thông tin chính ≥ medium weight | apple-design-widget/references/SPECS.md |
| Một ý | 1 widget = 1 ý; phải liếc là đủ | apple-design-widget/SKILL.md |
| Hành vi | **không** cuộn, **không** nhập liệu; cập nhật theo timeline | apple-design-widget/SKILL.md |
| Dynamic Type | hỗ trợ Large → AX5 | apple-design-widget/references/COMPONENTS.md |

## Số đo KHÔNG có trong nguồn (đừng bịa)

Ghi lại để người sau không trích nhầm:

* **Không** có bảng safe area theo thiết bị trong bất kỳ skill `apple-design-*`
  nào — safe area của repo lấy từ `src/frame/devices.ts`.
* Dòng "inset nội dung chính 60 pt trên/dưới, 80 pt hai bên" xuất hiện **giống
  hệt nhau** trong skill iPhone, iPad và watch kể cả trên mặt watch 40 mm — đó là
  một dòng diễn giải sai, **không dùng làm số đo**.
* "Tab bar mép trên cách đỉnh 46 pt" **mâu thuẫn** với "tab bar cao 68 pt" trong
  cùng câu, và lặp y hệt ở 3 file — chỉ chép "nguồn nói vậy", không dùng làm sự
  kiện bố cục.
* Không có cỡ chữ nào cho status bar / nav title / tab label trong skill nào.

## Nền đo

Số đo chặn change, để biết việc gì vừa xảy ra:

| Mốc | Giá trị |
|---|---|
| `npm run gate` trước change | `0 lỗi, 0 cảnh báo` · `0 lỗi subset` · `0 lỗi component` |
| `vitest` trước change | 15 file / **110** test passed |
| Số màn hình | **28** (`project/*/screens/*.html`) |
| Màn tự vẽ vùng OS | **0 / 28** |
| Màn dựng thanh trên tay (không `.navbar`) | **21 / 28** |
| Lớp tương tác khai báo < 44 pt | **12** |

### Sau khi áp dụng `screen-region-standard`

| Mốc | Trước | Sau |
|---|---|---|
| `npm run lint:regions` | *(không có)* | `0 lỗi vùng` |
| `npm run audit:regions` | *(không có)* | `0 lỗi vùng đo được · 28 màn` |
| `vitest` | 15 file / 110 test | 16 file / **143** test |
| Màn dựng thanh trên tay | 21 / 28 | **0 / 28** |
| Vùng chạm dưới sàn (đo được) | 47 | **0** |

Output thật của `npm run gate`:

```
0 lỗi, 0 cảnh báo          (lint:tokens)
0 lỗi subset               (lint:subset)
0 lỗi component            (lint:components)
0 lỗi vùng                 (lint:regions)
  chrome: ok
  background: ok
  region-order: ok
  division-band: ok
0 lỗi vùng đo được · 28 màn · sàn chạm 44×44
 Test Files  16 passed (16)
      Tests  143 passed (143)
```

### Cập nhật 30/09/2026 — thu gọn bộ màn calo-ai

Theo yêu cầu, calo-ai giữ lại **5 màn lõi** để test chức năng chính:

| Màn | Vai trò trong vòng lặp lõi |
|---|---|
| `home` | hub: tổng calo hôm nay, bữa ăn, streak, đổi ngày |
| `camera` | log bằng ảnh — AI nhận món |
| `textvoice` | log bằng chữ/giọng nói, có xem trước "AI hiểu như sau" |
| `confirm` | human-in-the-loop: sửa/xác nhận kết quả AI trước khi lưu |
| `diary` | vòng lặp: log đã ghi theo ngày |

21 màn còn lại đã xoá (đã backup ngoài git). Từ đây:

* `npm run audit:regions` chạy trên **7 màn** (5 calo-ai + 2 foundation-kit),
  không phải 28 — các số ở cột "Sau" bên trên là nền đo lúc change hoàn tất.
* `.split` / `.rail` / `.sidebar` / `.pane` hiện **không màn nào dùng** nữa;
  luật của chúng vẫn đúng nhưng chỉ còn được kiểm bằng fixture trong
  `scripts/region-lint.test.ts`. Muốn có ví dụ sống lại thì tạo một màn với
  `--device duo-inner`.

Ba lỗi thật mà tầng đo bắt được, đã sửa — ghi lại vì chúng không thấy được bằng mắt:

1. `.paper-card` khai `flex: 0 0 auto` và nằm **sau** trong stylesheet, nên
   `.pane-lead` thua cascade — split 1:2 thực tế hoá 41:59. Sửa bằng child
   combinator `.split > .pane-lead`.
2. Với `flex-basis: 0`, phần padding của pane được cộng **ngoài** phần flex
   chia, nên 1:2 vẽ ra 35:65. Sửa bằng flex-basis phần trăm (border-box).
3. `.tabbar-float` **không** giãn con mà chỉ canh giữa, nên `.tab-item` chỉ
   38 pt trong thanh 68 pt — giả định "vùng cha bảo đảm" ở `GUARANTEED_BY` là
   sai, đã bỏ và cho `.tab-item` tự khai sàn.

Cùng kiểu, một rule của chính gate cũng sai và đã có test hồi quy: `/height:/`
không neo cũng khớp `line-height: 13px`, báo nhầm vùng chạm 13 pt.

### Nền đo v2 — `shell-region-defaults`

Chụp trước khi đổi khung cao cố định (đối chiếu ở cuối change):

| Mốc | Giá trị |
|---|---|
| `npm run gate` | `0 lỗi, 0 cảnh báo` · `0 lỗi subset` · `0 lỗi component` · `0 lỗi vùng` |
| `npm run audit:regions` | `chrome: ok` · `background: ok` · `region-order: ok` · `division-band: ok` · `0 lỗi vùng đo được · 7 màn` |
| `vitest` | 16 file / **143** test passed |
| Số màn hình | **7** (5 `calo-ai` + 2 `foundation-kit`) |
| `npm run export -- --screen home` | **780×2122** (toàn bộ nội dung, device `reference` 390×844) |

Kỳ vọng sau v2: `home` export ra **780×1688** (khung máy) ở mặc định, còn
`home@2x.png --full` vẫn 780×2122.

**Sau v2** — output thật của `npm run gate`:

```
0 lỗi, 0 cảnh báo          (lint:tokens)
0 lỗi subset
0 lỗi component
0 lỗi vùng
  chrome: ok
  background: ok
  region-order: ok
  division-band: ok
  scroll: ok
  overflow: ok
  shell-band: ok
0 lỗi vùng đo được · 7 màn · sàn chạm 44×44
 Test Files  16 passed (16)
      Tests  160 passed (160)
```

`npm run export -- --screen home`: mặc định **780×1688** (khung máy), `--full`
**780×2122** (toàn trang). Nav/tab của cả 7 màn do shell dựng; `.navbar` /
`.tabbar` / `.navbar-float` / `.tabbar-float` / `.dock` đã rời khỏi màn hình và
thành `SHELL_BAND_CLASSES`.

Hai phát hiện mới mà v2 bắt được, ghi lại vì mắt không thấy:

1. **Con co lại thì bị bóp, không tràn.** Khung cao cố định làm `.btn` (khai 58
   pt) đo còn **39 pt** trong `confirm`; `.body` / `.body-fixed` nay đặt
   `flex-shrink: 0` cho con trực tiếp. Sàn chạm 44 pt bắt đúng lỗi này.
2. **`overflow-x: hidden` tự nâng `overflow-y` thành `auto`.** `.screen` và
   `.body-fixed` bị tính nhầm là scroller; sửa thành `overflow: hidden` và luật
   "đúng một vùng cuộn" mới đọc đúng.
