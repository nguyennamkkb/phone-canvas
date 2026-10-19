# Proposal

## Why

Khi một màn có **ảnh nền hoặc gradient**, nền bị **vẽ hai lần ở hai hệ toạ độ khác nhau**: `composeScreenDoc` replay longhand nền của `.screen` lên `.device` (để dải status/home nối liền), nhưng `.screen` vẫn tự vẽ nền trong hộp của chính nó — hộp này thấp hơn `.device` đúng bằng band nav và bị đẩy xuống dưới safeTop. Với màu đặc hai lần vẽ trùng nhau nên vô hại; với ảnh/gradient thì `cover`/`center` tính theo hai hộp khác nhau, sinh **seam** ngay đáy band nav (đo được: `halloween-offer` và `family-plan` nhảy màu Δ≈20 RGB tại y = 119 pt = safeTop 59 + nav 60).

Tệ hơn, **gate không bắt được**: `audit:regions` check `background` chỉ so *chuỗi computed style* `.device` vs `.screen`, mà hai bên báo cùng một chuỗi — nên gate xanh suốt thời gian seam tồn tại. Cần một bất biến ở lõi và một phép đo render để seam không thể tái phát âm thầm.

## What Changes

- **Bất biến Nền ở lõi:** khi `.screen` root có `background-image`, vùng định vị nền của `.device` và `.screen` phải **trùng nhau**. Bảo đảm bằng cách neo **cả hai** vào viewport (`background-attachment: fixed`) trong shell CSS — không dựa vào việc `.device` tình cờ nằm ở gốc viewport.
- **Không đổi hợp đồng tác giả:** nền vẫn khai longhand trên `.screen` root (`background-color` token + `background-image` + `cover/center/no-repeat`) đúng như `lint:tokens` đang ép. Không màn nào phải sửa.
- **Gate đo render mới:** `audit:regions` bổ sung luật hình học — hai painter phải **dùng chung vùng định vị nền**; sai → finding `background` kèm hai attachment/rect. Giữ nguyên check so-giá-trị cũ.
- **Golden thực thi:** pin element `screen` cho `halloween-offer` để `golden:check` tự soát nền liền mạch trong CI.
- **Dọn pin/record mồ côi:** xoá pin `day`/`day-cell.is-on` và record `day--reference--light@2x` (màn `day` không còn tồn tại) — `golden:check` hiện FAIL vì lý do này.
- **Tài liệu:** cập nhật `docs/screen-regions.md` và recipe `screen-background.md` (ghi cơ chế; cách tác giả viết không đổi).

## Capabilities

### New Capabilities

- Không có.

### Modified Capabilities

- `screen-regions`: Requirement *"Nền dải OS nối liền ruột màn hình"* mở rộng thành **bất biến Nền** cho cả dải OS **lẫn band nav/tab** (hai painter phải chung một hệ toạ độ), kèm scenario và phép đo render mới trong tầng đo của gate.

## Impact

- `src/screens/vocab.css` — rule `.screen`: `background-attachment: fixed`.
- `src/extractor/compose.ts` — `CHROME_CSS`, rule `.device`: `background-attachment: fixed` (longhand sau `background` shorthand).
- `scripts/region-audit.ts` — `Probe`/`PROBE` thêm `backgroundAttachment` + rect `.device`/`.screen`/viewport; thêm luật trong `checkScreen`; export hàm kiểm nền thuần để unit-test không cần Chrome.
- `scripts/golden-check.ts` — thêm pin `halloween-offer`/`screen`; xoá pin `day`.
- `goldens/goldens.json`, `goldens/day-reference@2x.png` — xoá record + ảnh mồ côi.
- `.agents/skills/phone-canvas/recipes/screen-background.md`, `docs/screen-regions.md` — ghi cơ chế/bất biến.
- Test: `src/extractor/compose.test.ts`, `scripts/region-audit.test.ts`.

## Quyết định đã chốt với user

- Không sửa màn nào; fix sống ở lõi (shell CSS + gate + tài liệu).
- Giữ và hoàn thiện bản vá `.screen` đang có trong working tree (thay vì revert làm lại).
- Golden `halloween-offer` **được kiểm tự động** (thêm pin), không chỉ ghi tham chiếu.
