# KB3 — kế hoạch dựng (9 file · 8 bước)

Nguồn: `docs/onboarding/kb3-showcase-social-proof-exit-offer.md`.
DNA: KB1 (`project/smartscreen`) giữ nguyên — chất riêng KB3 nằm ở bố cục từng màn.

Đã chốt (2026-10-12): 9 hãng như doc · m4 checklist cá nhân hoá (bỏ thanh % + "latency") ·
[X] trễ 3s như KB1 · gói Năm + Tuần · copy tạm của doc duyệt cả 3.
Cập nhật (2026-10-13): **bỏ màn 8** — Claim ở m7 mở thẳng sheet thanh toán Apple (bước 8
của phễu = sheet hệ thống, không phải màn app; tiến trình 9 đoạn giữ nguyên);
dòng "then renews" chuyển về m7 (m7 tự gánh 3.1.2); note m6 thành 2 dòng căn giữa (bỏ icon khiên).

| # | Screen | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | kb3-m1-intro | ✅ dựng xong | ảnh THẬT `ob_hero_problem_agitation` (896×1200, public/images) — chip 6″/65″ |
| 2 | kb3-m2-brand | ✅ dựng xong | lưới 2 cột 9 hãng giãn đầy khung; "Other" tràn hàng |
| 3 | kb3-m3-features | ✅ dựng xong | 4 thẻ giãn đều; chọn 2 (Whiteboard + Photo) theo m4 |
| 4 | kb3-m4-setup | ✅ dựng xong | vòng tiến trình 4 phần tư (3/4) + 3 dòng tick theo quiz |
| 5a | kb3-m5-permission | ✅ dựng xong | ảnh KB1 + MỘT chip Local Network (bỏ chip Photos của KB1) |
| 5b | kb3-m5-scan | ✅ dựng xong | radar KB1; Samsung lên đầu; có Continue; variant từ chối quyền ở comment |
| 6 | kb3-m6-paywall | ✅ dựng xong | social proof thay lưới quyền lợi; [X] trễ 3s; Năm + Tuần; fit khung 844 (slack ~8pt) |
| 7 | kb3-m7-exit-offer | ✅ dựng xong | vé KB1-M7b; đỏ chỉ ở tag/50%/đồng hồ; Claim → sheet StoreKit; có dòng renews |
| — | ~~kb3-m8-discount-applied~~ | 🗑 đã bỏ 2026-10-13 | khung vé hạ từ tokens.css về style cục bộ của m7 |
| 9 | kb3-m9-tips | ✅ dựng xong | ảnh THẬT `ob_hero_tips` (1376×768, public/images) |

Gate mỗi màn: `lint:tokens` · `lint:subset` · `lint:regions` → `npm run export` → đọc PNG → sửa.
Kết thúc: `npm run gate` + `npm run golden:check`.

Giá luôn `$—.——` (TODO: price — StoreKit).

## Kết quả gate (2026-10-13, sau khi bỏ m8 + sửa m6)

- `npm run gate`: **lint xanh** · `audit:regions` **0 lỗi vùng đo được / 96 màn** · vitest **430 test pass (33 file)**.
- `npm run golden:check`: 4 pin, 0 failed (không pin màn nào của KB3).
- `npm run scan:projects`: `smartscreen-kb3 — SmartCast · KB3`; board boot 200 OK.
- Spot spec: m1 hero `Image("ob_hero_problem_agitation") 342×456`; m6 CTA `Button 342×56`,
  foot `VStack 390×194` — 0 Block / 0 unmappedSymbol / 0 externalMask.
- PNG: `project/smartscreen-kb3/exports/` — 9 màn × 780×1688 (@2x, khung reference 390×844).

## Việc còn lại khi có dữ liệu thật

1. Giá thật từ StoreKit thay `$—.——` (m6 plans + note, m7 was/now/renews).
2. Số liệu social proof (4.8 · 5M · review) → remote config; cần kiểm chứng trước khi ship (Guideline 2.3.1/5.6).
3. Exit "one-time" phải thật là một-lần (không hiện lại mỗi lần mở Paywall) — logic phía app.
4. Hai ảnh hero đã có trong `public/images/`; master nằm ở `project/smartscreen-kb3/assets/`.
