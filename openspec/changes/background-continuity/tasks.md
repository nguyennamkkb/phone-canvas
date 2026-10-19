# Tasks

## 1. Lõi vẽ — neo hai painter vào viewport

- [ ] 1.1 `src/extractor/compose.ts` — `CHROME_CSS`, rule `.device`: thêm `background-attachment: fixed;` **sau** `background: var(--bg);` (longhand sau shorthand) — verify: thêm ca vào `src/extractor/compose.test.ts` khẳng định document compose chứa rule `.device` với `background-attachment: fixed`, test xanh
- [ ] 1.2 `src/screens/vocab.css` — rule `.screen`: hoàn thiện dòng `background-attachment: fixed` (giữ bản vá hiện có) + comment hợp đồng trỏ về bất biến — verify: test đọc `src/screens/vocab.css` khẳng định `.screen` có dòng này; `npm run lint:subset` xanh
- [ ] 1.3 Cập nhật `docs/screen-regions.md` và `.agents/skills/phone-canvas/recipes/screen-background.md`: ghi cơ chế/bất biến (nền là một lớp full-bleed; band status/nav/tab nổi trong suốt; **cách tác giả viết không đổi**) — verify: `npm run lint:regions-docs` xanh; đọc doc thấy câu mô tả bất biến

## 2. Gate đo render

- [ ] 2.1 `scripts/region-audit.ts` — mở rộng `type Probe` + `PROBE`: thêm `backgroundAttachment` của `.device`/`.screen`, `rect(.device)`, `rect(.screen)`, và kích thước viewport — verify: chạy `npm run audit:regions -- --screen halloween-offer`, probe chạy không lỗi và đọc được các field mới
- [ ] 2.2 Tách hàm thuần `backgroundFindings(probe)` và **export** nó; `checkScreen` gọi hàm này; luật D3 (khi có `background-image`: `(attDevice==='fixed' && attScreen==='fixed') || rect(.device)≡rect(.screen)`) — verify: `scripts/region-audit.test.ts` phủ ba ca — cùng hệ (cả `fixed`) → xanh; lệch (`scroll` một bên) → finding `background`; vẫn giữ check so-giá-trị cũ
- [ ] 2.3 Chạy tầng đo trên toàn bộ màn — verify: `npm run audit:regions` in `background: ok`, 0 lỗi vùng đo được

## 3. Golden + dọn mồ côi

- [ ] 3.1 Ghi element golden `region-nav` cho `halloween-offer` (pad mặc định 24 pt đã làm crop vắt qua đáy band nav) — verify: `npm run export -- --golden --element region-nav --screen halloween-offer` tạo record; xuất PNG crop và **nhìn** thấy crop vắt qua ranh giới band/thân (nửa trên nền `.device`, nửa dưới nền `.screen`)
- [ ] 3.2 Thêm pin `{ screen: 'halloween-offer', element: 'region-nav', why: … }` vào `scripts/golden-check.ts`; ghi record cấp màn `npm run export -- --golden --screen halloween-offer` (nhãn khớp/lệch trên board) — verify: `npm run golden:check` báo pin mới `ok`
- [ ] 3.3 Xoá pin `{screen:'day', element:'day-cell.is-on'}` trong `scripts/golden-check.ts`; xoá record `day--reference--light@2x` trong `goldens/goldens.json` và file `goldens/day-reference@2x.png` — verify: `npm run golden:check` 0 FAIL; `grep -rn "day-cell" scripts goldens` rỗng

## 4. Tích hợp

- [ ] 4.1 Chạy toàn bộ gate — verify: `npm run gate` xanh (lint + `audit:regions` + vitest)
- [ ] 4.2 Export và nhìn màn thật — verify: `npm run export -- --screen halloween-offer`; điểm ảnh các cột không bị nội dung phủ **khớp ảnh gốc** (diff 0) qua cả dải status và band nav; nhìn PNG không seam
- [ ] 4.3 Kiểm chứng gate bắt được seam — verify: tạm gỡ `background-attachment: fixed` khỏi `.screen`, chạy `npm run audit:regions -- --screen halloween-offer` → đỏ với `check: background`; khôi phục lại
