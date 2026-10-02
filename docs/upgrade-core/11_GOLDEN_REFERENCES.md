# 11 — Golden References

Track 008 · designer research-only (KHÔNG code). Bộ screen chuẩn từng platform (§12 brief) để: kiểm layout engine, kiểm component, kiểm visual consistency, kiểm regression, benchmark AI-generated UI.

## 1. Nguyên tắc golden

- Mỗi golden = 1 screen thật trong repo + snapshot PNG (`npm run export`) + spec JSON (Copy JSON) + bản ghi rule-pass (`lint` + `audit` xanh).
- Golden vỡ (đổi số sau sửa core) = regression signal, không phải "ảnh cũ" — sửa core cho xanh lại, hoặc Lead accept mới thay golden (decision record).
- Golden che logo vẫn nhận ra project (DNA test, xem `05`).

## 2. Bộ golden đề xuất (từ repo hiện có)

| Platform | Screen | Vì sao chuẩn | Kiểm gì |
|---|---|---|---|
| phone | `calo-ai/stats` | đủ section (segmented, summary, chart, log list), đúng contract slot/tab/scroller (`stats.html`) | layout engine, component reuse, visual |
| phone | `calo-ai/food-detail` | detail + art asset + CTA | asset lane, CTA contrast |
| phone | `calo-ai/settings` | form/row density | density, touch floor rows |
| phone | `frank-sound/player` | media + dark-first (không khối dark trùng) | dark dẫn xuất, background continuity |
| Duo cover | (tạo mới `--device duo-cover`) | rail 44 + cấm tab ngang — hiện không còn màn Duo sống trong repo | region rail, D1 |
| Duo inner/fold | (tạo mới `--device duo-inner`) | split 1:2 / 50-50 + dải cấm — fixture chỉ còn trong test | D2/D3, division-band |
| tablet | `scratch-tablet/library` | sidebar + split | T1–T4 |
| watch | `scratch-watch/activity` (+heart/timer/weather) | 1 ý/màn, glanceable | A1–A6 |
| widget | `scratch-widget/today` (+battery/calendar/forecast) | 1 ý, không cuộn/nhập | W1–W5 |

## 3. Cách dùng (5 mục đích brief §12)

| Mục đích | Quy trình | Tool |
|---|---|---|
| Layout engine | render golden mọi device trong Phụ lục A của `02`, so số với snapshot | `export` + diff ảnh/số |
| Component | đổi component dùng chung → re-render mọi golden dùng nó, diff | board + `export` |
| Visual consistency | che-logo test + so palette/radius với DNA | mắt + `05` gate |
| Regression | mỗi change core chạy golden set, vỡ = block | `gate` (mở rộng) |
| Benchmark AI | screen AI-gen so side-by-side với golden cùng loại (xem `07` B5) | compare view + rule-pass rate |

## 4. Chuẩn approve golden mới (từ `07` bước 12)

`lint` + `audit` xanh → A11y pass (contrast, Dynamic Type, VoiceOver order) → DNA check (`05` §4) → multi-device snapshot (phone bắt buộc; tablet/watch/widget nếu platform đó) → Lead/human accept → freeze vào bảng §2.
