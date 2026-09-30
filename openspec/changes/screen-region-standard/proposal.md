# Proposal

## Why

Mỗi loại màn hình đều có các vùng cố đối định (status bar, home indicator, navbar, tab bar, dải dọc Duo, sidebar tablet) — nhưng repo chưa có quy chuẩn nào cho chúng, nên mỗi màn tự dựng một kiểu và vi phạm chỉ lộ ra bằng mắt. Đo thực tế trên repo (28 màn, 17 component):

| Vi phạm / thiếu sót đo được | Số liệu |
|---|---|
| Màn tự vẽ lại vùng OS (status bar / home indicator / notch) | **0 / 28** — ranh giới shell↔tác giả hiện đã đúng, chỉ chưa có luật giữ |
| Màn dựng vùng cố định bằng markup tay, không dùng class vùng | **21 / 28** dựng thanh trên bằng `.row` + `.nav-round`; chỉ 1 màn dùng `.navbar` |
| Lớp vùng cho Duo (dải dọc) / tablet (sidebar, split) trong `tokens.css` | **0** — `.rail`, `.pane`, `.split`, `.sidebar`, `.toolbar` không tồn tại, 3 màn Duo tự viết flex |
| Lớp tương tác khai báo khung < 44 pt trong `tokens.css` | **12** (`.icon-btn` 32, `.close-btn` 30, `.chip` 32, `.seg` 32, `.pill-soft` 32, `.pill-ghost` 38, `.tab` ≈42, `.tab-item` ≈36, `.toggle` 28h, `.chip-icon` 40, `.badge` 34, `.pill*` 26/32/38/40) |
| Dùng chúng mà không bù kích thước | `.close-btn` ×2, `.pill-soft` ×7, `components/chip-row.html` ×1 |
| Tài liệu vùng | **không có**; `docs/screen-authoring.md` bị trích ở `README.md:350`, `.agents/skills/phone-canvas/SKILL.md:52`, `src/projects/projects.ts:8` nhưng file không tồn tại |
| Bộ ba màn Duo dùng chung state | có (`520 / 730 / 1250 / 1850`, 4 destination) — nền tảng cho mẫu tham chiếu |

Ngoài ra: bản đồ vùng mới phải biết **form factor là gì** — `ScreenFile.deviceId` đã có sẵn và `formFactorOf()` đã phân loại `phone · tablet · cover · inner`, nên không cần đổi định dạng registry.

Bây giờ là lúc: vùng OS đã đúng, còn lại là **thêm từ điển vùng**, **cưỡng chế bằng gate**, và **mô tả bằng tài liệu**. Không làm thì mỗi màn Duo/tablet tiếp tục là một hợp đồng riêng.

## What Changes

- **Từ điển vùng** trong `src/screens/tokens.css`: thêm `.split` / `.pane` / `.pane-lead` / `.pane-trail` (arrangement), `.rail` / `.rail-tools` / `.rail-tabs` / `.rail-item` (dải dọc Duo), `.sidebar` / `.sidebar-item` / `.sidebar-head` (tablet), và nhóm token số đo vùng (`--touch-min`, `--navbar-min-h`, `--tabbar-h`, `--rail-w`) để mọi con số có một nguồn. Mọi rule mới **in-flow**, không `position: absolute`, mỗi rule kèm HTML mẫu như `.navbar-float`/`.tabbar-float` đã làm.
- **Tài liệu chuẩn** `docs/screen-regions.md` là nguồn duy nhất: bản đồ vùng theo form factor (phone · Duo cover · Duo inner · fold · tablet) + bảng tham chiếu Watch / Widget, mỗi dòng ghi số đo và nguồn. Vá 3 chỗ đang trích `docs/screen-authoring.md`; thêm mục vào `README.md` và recipe `regions.md` cho skill `phone-canvas`.
- **Gate 2 tầng**:
  - *Tĩnh* — script mới `scripts/region-lint.ts` (tách khỏi `subset-lint.ts` vì quy tắc vùng cần `deviceId` + `form` + danh sách lớp tương tác, không thuộc tập subset): cấm markup vùng OS, bắt **vùng chưa khai báo** (thanh trên tay với nút tròn mà không có `.navbar`), anatomy navbar (≤ 3 action, title 1 dòng, back khi push), tab bar 3–5 và cấm tab ngang ở pose cover, cấm px gắn với chiều rộng thiết bị, cấm lớp tương tác khai báo dưới 44 pt. Lỗi luôn kèm `file:line` + cách sửa; escape hatch `<!-- lint-region: off -->` bắt buộc có lý do.
  - *Đo* — script mới `scripts/region-audit.ts` dùng đúng đường ống Chrome/CDP của `scripts/export.ts` để dựng màn ở thiết bị khai báo rồi kiểm những thứ chỉ biết **sau khi layout**: mỗi vùng tương tác ≥ 44×44 pt, dải gập không có control nào, split gập hờ 50/50, thứ tự vùng, và pixel nền dải status/home khớp ruột màn.
- **Sửa token chạm**: nâng các lớp luôn là mục tiêu chạm lên ≥ 44 pt (`.close-btn`, `.pill-soft`, `.icon-btn`) và ghi lại hệ quả thị giác.
- **Migrate 28 màn theo gia đình** (Duo trio → tab bar → các thanh trên tay → kit), mỗi nhóm xuất PNG xem thật trước khi qua bước kế.
- **Bỏ giả định sai**: `duo-home-fold` và `duo-home-inner` cùng `deviceId: duo-inner`, chỉ khác tỉ lệ flex — nên luật "gập hờ 50/50" **không kiểm được bằng lint tĩnh**; nó thuộc về tầng đo.

## Capabilities

### New Capabilities

- `screen-regions`: bản đồ vùng cố định theo form factor, ranh giới sở hữu shell↔tác giả, từ điển vùng dùng chung, sàn 44 pt, luật nếp gập / dải dọc / sidebar, cưỡng chế 2 tầng, tài liệu chuẩn và bộ ba màn mẫu.

### Modified Capabilities

- (trống — `openspec/specs/` chưa có spec nào; không đổi requirement hiện hữu)

## Impact

- **Sửa/tạo**: `src/screens/tokens.css` (chỉ thêm class vùng + token số đo, không đổi rule cũ ngoài 3 lớp chạm), `scripts/region-lint.ts` + `scripts/region-audit.ts` (mới) và test của chúng, `package.json` (`lint:regions` + `audit:regions` vào `gate`), `docs/screen-regions.md` (mới), `README.md`, `.agents/skills/phone-canvas/SKILL.md` + `recipes/regions.md`, `src/projects/projects.ts` (vá trích dẫn hỏng).
- **Migrate dần**: `project/calo-ai/screens/*.html` (26), `project/foundation-kit/screens/*.html` (2), `project/foundation-kit/components/*.html` (17).
- **Không đổi**: định dạng header `<!-- pc {...} -->` (vẫn 3 khoá), `composeScreenDoc`, cấu trúc registry, định dạng export PNG, panel spec. Không thêm preset device, không thêm khoá `pose`.
- **Số nền để so**: `npm run gate` xanh, `vitest` 15 file / 110 test (sẽ tăng), 0 lỗi 3 lint.
