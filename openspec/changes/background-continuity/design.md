# Design

## Context

Xem `proposal.md` cho động cơ. Trạng thái hiện tại chi phối thiết kế:

- `.device` do shell dựng trong `composeScreenDoc`; nền của nó = `background: var(--bg)` (`CHROME_CSS`) + longhand nền replay từ `.screen` root (`screenBgOf`).
- `.screen` là node của tác giả, thân trong `.viewport`, nằm **sau** band nav và **trước** band tab; nó tự vẽ nền trong hộp của mình.
- `.statusbar` / `.home-indicator` nằm **ngoài** `.viewport` trên `.device`; đều trong suốt.
- Tầng đo `audit:regions` render mỗi màn trong Chrome với `Emulation.setDeviceMetricsOverride` = khung máy, rồi đọc computed style + rect. Hiện chỉ **so chuỗi** `.device` vs `.screen`.
- Khung máy là cố định (`--device-h`); `--full` với màn bị kẹp khung cho ra cùng kích thước (đã xác nhận với `halloween-offer`).
- Nền lớn chỉ được đặt trên `.screen` root (longhand); `lint:tokens` ép `background-color` token + `cover` + `no-repeat`, và cho phép `/project/<id>/assets/<file>` hoặc `/images/<file>`.

## Goals / Non-Goals

**Goals:**
- Bất biến Nền: hai painter (`.device`, `.screen`) dùng chung một hệ toạ độ khi có `background-image`.
- Gate bắt được vi phạm bằng phép đo render, không chỉ so khai báo.
- Không đổi hợp đồng tác giả, không đổi panel/handoff.
- Dọn pin/record mồ côi `day`.

**Non-Goals:**
- Không re-model nền thành một lớp shell sở hữu riêng (phương án P2/P3 — xem "Đã cân nhắc").
- Không đụng markup màn nào; không đổi Spec IR.
- Không đổi cách tác giả viết `background-image` (longhand trên `.screen` root giữ nguyên).

## Decisions

### D1 — Neo cả hai painter vào viewport bằng `background-attachment: fixed`

Thêm `background-attachment: fixed` vào rule `.device` (`CHROME_CSS`) **và** rule `.screen` (`vocab.css`). Khi cả hai `fixed`, vùng định vị nền của cả hai là **viewport** — mặc nhiên trùng nhau, không phụ thuộc `.device` có ở gốc viewport hay không. `background-size: cover` + `background-position: center` khi đó tính trên cùng một rect cho cả hai.

- Vì sao không chỉ `fixed` ở `.screen`: nếu chỉ một bên, bất biến vẫn sống nhờ `.device` tình cờ = viewport; đối xứng hai bên làm bất biến tường minh và bền hơn.
- `background-attachment` không nằm trong danh sách cấm của subset lint; không phá handoff (panel báo `Image("…")`/`LinearGradient` từ computed `background-image`, không quan tâm attachment).
- `.screen` không cuộn (cuộn là việc của `.body`), nên `fixed` **không đổi hành vi cuộn** — chỉ đổi hệ quy chiếu.

**Đã cân nhắc:**
- *P2 — shell bỏ nền khỏi `.screen` (`.screen` trong suốt), một mình `.device` vẽ.* Sạch về mô hình nhưng `.screen` có inline nên phải `!important`/strip inline lúc compose, làm **panel mất báo cáo nền trên node `.screen`** → phải di dời sang node/bridge khác: chạm spec + handoff. Loại.
- *P3 — lớp `.screen-bg` (absolute inset:0) do shell dựng.* Cùng vấn đề "hai painter" của P2 và thêm nợ loại node khỏi cây spec. Loại.

### D2 — Giữ nguyên hợp đồng tác giả và báo cáo panel

Không thêm gì vào file màn. Fix sống ở lõi vì hợp đồng là "shell sở hữu chrome, tác giả sở hữu nội dung": tác giả không phải và không được biết gì về hệ toạ độ band.

### D3 — Gate: bất biến hình học, không decode điểm ảnh

Trong `checkScreen`, khi `.screen` root có `background-image`:
- Lấy `backgroundAttachment` của `.device`/`.screen` + `rect(.device)`/`rect(.screen)` + viewport.
- Yêu cầu `(attDevice === 'fixed' && attScreen === 'fixed')` **hoặc** `rect(.device) ≡ rect(.screen)`.
- Sai → finding `check: 'background'` kèm hai attachment/rect + cách sửa.

**Vì sao không so điểm ảnh ở tầng này:** một seam và một biến thiên tự nhiên của ảnh khó phân biệt nếu không decode ảnh nguồn; phép so bất biến rẻ, tất định, và mã hoá **đúng** nguyên nhân gốc. So-giá-trị cũ vẫn giữ làm lưới an toàn thứ hai.

Hàm kiểm nền được **export** (thuần, nhận `probe`) để unit-test không cần Chrome.

### D4 — Golden CI cho `halloween-offer`

- Element pin cấu trúc `region-nav` (`--element region-nav`) **pin được**, và đường element của `npm run export` **luôn pad `ELEMENT_PAD_PT = 24`** (`scripts/export.ts`). Với `halloween-offer`, crop đo được là `clip 0,35 390×108pt`: 35..119 là nền do `.device` vẽ (đáy status + band nav) và 119..143 là nền do `.screen` vẽ — tức crop **mặc nhiên vắt qua** ranh giới. Seam làm đổi crop hash → CI đỏ. Không cần cờ padding mới (CLI `export` không có `--pad-pct`).
- Ghi thêm record cấp màn (`--golden --screen halloween-offer`) cho nhãn *khớp/lệch golden* trên board (tham chiếu thị giác toàn khung).

**Đã cân nhắc:** `--element device` / `--element viewport` = shell chrome **không** pin được (đã kiểm); `--element screen` khớp `.body-fixed`, crop bắt đầu **dưới** seam nên không phủ được ranh giới. Vì vậy chọn `region-nav` (pad mặc định 24 pt đã đủ vắt qua ranh giới).

### D5 — Dọn mồ côi `day`

Màn `day` không còn tồn tại (không `day-cell` ở đâu trong repo). Xoá pin `{screen:'day', element:'day-cell.is-on'}` trong `golden-check.ts`, record `day--reference--light@2x` trong `goldens/goldens.json`, và `goldens/day-reference@2x.png`. Không có gì để trỏ lại.

## Risks / Trade-offs

- [`background-attachment: fixed` neo theo viewport, không theo khung máy nếu `.device` lệch viewport] → D1 neo **cả hai** nên hai painter vẫn chung viewport; gate D3 kiểm và sẽ đỏ nếu ai đó phá; audit render bằng `setDeviceMetricsOverride` = khung máy.
- [`fixed` hành xử khác nhau giữa engine/ngữ cảnh iframe-sandbox] → board và export dùng **cùng** `composeScreenDoc`; D3 đo render trong Chrome (cả đường board-với-device-metrics lẫn export), golden D4 khoá điểm ảnh.
- [Element golden `region-nav` + pad có thể mong manh nếu vị trí nút/band đổi] → Đây là **lưới bổ sung**; lưới chính là D3 (chạy mọi màn, tất định). Kiểm bằng mắt crop một lần trong task để chắc crop vắt qua ranh giới.
- [Record cấp màn không có CLI check thoát mã ≠ 0 hôm nay] → D4 dùng record chỉ làm tham chiếu board; thực thi nằm ở D3 + element pin. (Mở rộng tooling để check record cấp màn là Non-Goal.)

## Migration Plan

1. Thêm `background-attachment: fixed` cho `.device` (`compose.ts`) và `.screen` (`vocab.css`) — thay đổi thuần cộng thêm.
2. Thêm luật + field probe trong `region-audit.ts`; export hàm kiểm nền; thêm unit-test.
3. Thêm pin `halloween-offer`/`region-nav` + record cấp màn; ghi golden.
4. Xoá pin/record/ảnh `day`.
5. Cập nhật `docs/screen-regions.md` + recipe; đồng bộ main spec khi archive.

Rollback: revert 5 mục trên; không có migration dữ liệu, không đổi file màn, nên rollback an toàn tuyệt đối.

## Open Questions

Không có — các nhánh ảnh hưởng tới task đã chốt ở trên.
