# CaloAI — Kế hoạch đưa màn hình lên board phone-canvas

**Ngày**: 2026-09-28 · **Trạng thái**: đang thực hiện
**Project board**: `calo-ai` (thay thế toàn bộ nội dung cũ — project hiện có 0 screen)
**Nguồn duy nhất**: `docs/CaloAI/` v1.0 / 2026-09-28 (8 tài liệu, đã đọc toàn bộ).
Không bịa thông tin: mọi dòng dưới đây trace về ID gốc (WF/UC/FR/TF/spec).

## 0. Quy ước ID (lấy từ docs, không đặt lại)

- WF-001–WF-026: Wireframes §2 Screen Inventory. Lưu ý của Roadmap: Wireframes §1.3
  dùng dãy FR nội bộ riêng — số FR chuẩn duy nhất là của Functional_Requirements
  (FR-001–FR-056, 46 P0 + 10 P1; 8 NFR; 6 BR).
- UC-001–UC-022: Use_Cases §7 (17 P0 Must-Have, 3 P1 Should-Have: UC-008/017/018,
  2 P2 Nice-to-Have: UC-019/020).
- Roadmap: 19 specs, Phase 1–3 = MVP 12 tuần, P1 = 4–6 tuần, P2 chưa lên lịch.
  Promotion đã duyệt: UC-019/020 + FR-048–050 lên P1; FR-044-minimal và
  FR-028-subset vào MVP-partial.

## 1. Ánh xạ WF → screen trên board

| # | Screen id | WF | Tên màn hình | UC chính | Spec Roadmap (chủ) | Archetype / Density | Phase board |
|---|-----------|-----|--------------|----------|--------------------|--------------------|-------------|
| 1 | `splash` | WF-001 | Splash | UC-001 | `app-foundation` | Consumption / Light | A |
| 2 | `quiz` | WF-002 | Onboarding quiz | UC-001 | `onboarding-auth` | Action / Medium | A |
| 3 | `goal` | WF-003 | Goal result | UC-001 (+UC-002, UC-021) | `onboarding-auth` | Consumption / Medium | A |
| 4 | `login` | WF-004 | Login Apple/Guest | UC-002 | `onboarding-auth` | Action / Light | A |
| 5 | `home` | WF-005 | Home/Dashboard | UC-009 (+003,013,015,018) | `diary-manage` | Discovery / Dense | A |
| 6 | `camera` | WF-006 | Camera scan | UC-003 | `scan-capture` | Action / Medium | A |
| 7 | `confirm` | WF-007 | AI result confirm | UC-004 (+006) | `scan-confirm` | Action+Mgmt / Dense | A |
| 8 | `diary` | WF-012 | Diary | UC-009–014 | `diary-manage` | Management / Dense | A |
| 9 | `search` | WF-008 | Food search | UC-007 (+012,004,020) | `search-vn` | Discovery / Medium | B |
| 10 | `detail` | WF-009 | Food detail | UC-010 (+011) | `diary-manage` | Consumption / Medium | B |
| 11 | `barcode` | WF-010 | Barcode scanner | UC-005 | `barcode-logging` | Action / Light | B |
| 12 | `textvoice` | WF-011 | Text/voice log | UC-006 | `text-voice-log` | Action / Medium | B |
| 13 | `weight` | WF-013 | Weight trend | UC-015 (+016) | `weight-healthkit` | Management / Medium | B |
| 14 | `paywall` | WF-014 | Paywall | UC-021 (+017) | `paywall-monet` | Action / Medium | B |
| 15 | `settings` | WF-015 | Profile/Settings | UC-022 (+021) | `settings-account` | Management / Medium | B |
| 16 | `subscription` | WF-025 | Subscription manage | UC-021 (+022) | `paywall-monet` | Management / Light | B |
| 17 | `history` | WF-017 | History/Stats (minimal: calendar + snapshot ngày + relog, theo FR-044 MVP-partial) | UC-017 (+012) | `day-extensions` → P1 `stats-engagement` mở rộng | Management / Dense | B |
| 18 | `hkperm` | WF-020 | HealthKit permission (pre-permission sheet) | UC-016 | `weight-healthkit` | Action / Light | B |
| 19 | `pushperm` | WF-021 | Push permission (pre-permission sheet) | UC-018 | P1 `stats-engagement` | Action / Light | B |
| 20 | `deletesheet` | WF-023 | Delete confirm modal (bottom sheet + Undo toast) | UC-011 | `diary-manage` | Action / Light | B |
| 21 | `custom` | WF-016 | Custom food editor | UC-008 (+005) | P1 `food-library-plus` | Action / Medium | C |
| 22 | `fasting` | WF-018 | Fasting timer | UC-019 | P1 `fasting-coach` | Action / Medium | C |
| 23 | `coach` | WF-019 | Coach chat | UC-020 | P1 `fasting-coach` | Social / Medium | C |

Không thành screen riêng (có lý do, theo đúng docs):
- WF-022 Widget — OS-level, ngoài app (Use_Cases §4.22, Roadmap `CaloAIWidget/`).
  Không dựng trên board phone.
- WF-024 Error/offline — states phủ mọi màn (UX_Flows §5.1, §7.1): thể hiện bằng
  banner offline inline trong `diary`/`home`, không tách screen.
- WF-026 Empty states — inline theo ngữ cảnh (UX_Flows §3.5.4): `home` giữ 1 biến
  thể empty (ring rỗng + CTA "Log bữa đầu"), `history` giữ biến thể <7 ngày.

## 2. Thứ tự thực hiện (theo journeys + Roadmap order)

- **Phase A — critical path J1/TF-001** (activation: Splash→Quiz→Goal→Login→Home→
  Camera→Confirm→Diary): `splash, quiz, goal, login, home, camera, confirm, diary`.
- **Phase B — MVP còn lại** (TF-002–007, trừ P1): `search, detail, barcode,
  textvoice, weight, paywall, settings, subscription, history(minimal), hkperm,
  pushperm, deletesheet`.
- **Phase C — P1** (sau launch 4–6 tuần, theo Roadmap): `custom, fasting, coach`
  (+ mở rộng `history` lên stats-full + CSV khi tới P1).

## 3. Quyết định thiết kế board (ghi rõ để khỏi drift)

1. **Ngôn ngữ thị giác chung (bright theme, chốt 2026-09-28)**: nền trắng
   `#ffffff` + chữ espresso gần-đen + **1 accent xanh lá tươi duy nhất**
   (`--success`), chip sun vàng giữ làm điểm nhấn phụ. Thẻ dùng `--mist`
   (xám-xanh rất nhạt), hero giữ `sage-soft`. Nút Apple giữ đen (Apple HIG),
   nút Xóa giữ đỏ. Mọi screen khai `background-color` longhand ở root để
   `screenBgOf` lan nền ra dải status bar/home indicator — không còn mí trắng.
2. **Tab bar 4 tabs** theo UX_Flows §4.1: Home (WF-005) / Scan (WF-006) /
   Diary (WF-012) / Me=Profile (WF-015). Badge streak ở Home, badge quota ở Scan.
3. **Icon mới** (đúng pipeline: SVG vào `public/icons/` + `SYMBOLS` +
   `npm run icons`, không hard-code URL): `barcode`, `microphone`, `camera`,
   `wifi` (banner offline), `scale` (cân). Còn lại dùng symbol có sẵn
   (photo, timer, drop.fill, dumbbell, figure.walk, flame, sparkles…).
4. **Độ lệch khai báo trước**:
   - Viewfinder camera/barcode là khung placeholder vẽ bằng div (không có camera
     thật trên board) — ghi chú trong từng screen, không giả vờ là ảnh thật.
   - Nút "Sign in with Apple": text-only (không vẽ logo Apple), ghi lệch.
   - Số liệu mẫu (1.850 kcal, phở bò 520, 68.5 kg…) lấy đúng ví dụ trong
     Wireframes/Use_Cases Scenarios (Scenario 1: phở bò 620 kcal; WF-003 layout
     mẫu 1.850 kcal; WF-014 mẫu 699K/năm) — là dữ liệu minh họa, không phải spec.
   - Giá paywall hiển thị đúng mẫu WF-003/WF-014 trong Wireframes (Năm 699K/năm,
     Tháng 199K/tháng, trial 7 ngày) — đây là giá mẫu trong wireframe, giá thật
     do StoreKit trả về (FR-051).
5. Mỗi screen: 1 primary action đặt tên trước khi vẽ (theo phone-canvas loop);
   states bảng States của Wireframes chỉ dựng **Default** + 1 biến thể quan trọng
   nhất (ghi trong checklist từng screen), còn lại là acceptance cho SwiftUI.

## 4. Cổng nghiệm thu từng screen (phone-canvas loop)

`npm run screen -- gate` xanh (tsc + lint) · panel không `Block (out of subset)`,
không `unmappedSymbol`/`externalMask` · `npm run export` đúng chiều cao dự kiến ·
đọc PNG thật · primary action suy ra được SwiftUI từ spec.

## 5. Tiến độ

- [x] Đọc toàn bộ 8 docs CaloAI (PRD 648 + FR 626 + UC 1629 + UX 467 + Roadmap 535
      + Overview 209 + Wireframes 1803 + Index 54 dòng).
- [x] Viết file kế hoạch này.
- [x] Icon mới: barcode, microphone, camera, wifi, scale, minus (78 glyphs).
- [x] Phase A: `splash` ✓, `quiz` ✓, `goal` ✓, `login` ✓, `home` ✓, `camera` ✓, `confirm` ✓, `diary` ✓ (lint 0/0, PNG đã đọc từng màn, đúng chuẩn mobile-ux: target ≥44, 1 primary, green zone).
- [x] Phase B: `search` ✓, `detail` ✓, `barcode` ✓, `textvoice` ✓, `weight` ✓, `paywall` ✓, `settings` ✓, `subscription` ✓, `history` ✓, `hkperm` ✓, `pushperm` ✓, `deletesheet` ✓ (lint 0/0, PNG đã đọc từng màn).
- [x] Phase C (P1): `custom` ✓, `fasting` ✓, `coach` ✓ (lint 0/0, PNG đã đọc từng màn).
- [x] Tổng duyệt: `npm run gate` xanh (lint 0 lỗi/0 cảnh báo, subset 0, component 0, 110 tests pass) · 23 screens trong registry · coverage 26/26 WF (23 screens + WF-022 Widget OS-level + WF-024/WF-026 inline, theo §1 bảng trên).
- [x] Audit component (mobile-ui-style-engine, 2026-09-28): sự cố gốc — 6 class thiếu
  `border: 0` nên viền button mặc định của trình duyệt hiện lên (nặng nhất ở
  segmented picker): `.seg, .chip, .tab, .searchbar, .text-field, .row-card`
  (sửa trong `src/screens/tokens.css`) + `.seg.is-on` thêm bóng nổi kiểu iOS 26.
  Các họ còn lại đạt nguyên trạng: buttons/pills (cao ≥44), cards, toggle
  (bật = accent), meter/chart/bubble, sheet, tabbar, typography, icons.
- [x] Card-Based Lot 0 — nền card (2026-09-28): 1 bán kính nhẹ duy nhất
  `--r-lg` (20px) cho mọi thẻ (`paper/row/hero/band/panel`,
  override trong `project/calo-ai/tokens.css`); tách bằng mặt tông iOS
  (grouped fill, không viền, không bóng); `panel` trắng-trên-trắng chuyển
  sang grouped fill. Verify: lint 0/0, export home/detail/settings, đọc PNG.
- [x] Card-Based Lot 1 — `home` (4 quick action gom vào 1 `paper-card`,
  thêm tiêu đề nhóm "Bữa hôm nay", gap thẻ s3), `diary` (5 buổi thành 5
  `paper-card` nhóm, header trong thẻ, nội dung dùng `row` thường —
  hết lồng thẻ; body gap về s4). Verify: lint 0/0, export + đọc PNG 2 màn.
- [x] Card-Based Lot 2 — `search, detail, confirm, history, weight`
  (3 subagent song song, verify lint 0/0 + export + đọc PNG từng màn):
  gom recents/results vào nhóm, `detail` hết card-trong-card (inner thành
  action-row), `confirm` gom thành phần, `history` thẻ tuần + thẻ ngày,
  `weight` panel chart chuyển paper-card.
- [x] Card-Based Lot 3 — `camera, barcode, textvoice, custom, fasting, coach`:
  viewfinder thành 1 thẻ tông (bỏ radius literal 32px), barcode hết lồng thẻ
  trong sheet, textvoice/custom gom input+suggestion/form vào nhóm
  (text-field nền trắng trên thẻ grouped), fasting timer vào hero-card,
  coach giữ bubble + nhịp s4/s3. Verify tương tự.
- [x] Card-Based Lot 4 — `splash, quiz, goal, login, paywall, subscription,
  hkperm, pushperm, deletesheet`: quiz/paywall gom options thành 1 nhóm
  action-row (selected = fill bo trong, 1 vòng sửa), hkperm/pushperm gom
  "Bạn được gì", splash/login vào hero-card, subscription đạt nguyên trạng.
  Lệch chuẩn cho phép: nhóm action-row dùng gap 0 (flush theo settings),
  nhóm plain-row dùng gap s2 — không thẻ-lồng-thẻ ở mọi màn.
- [x] Tổng duyệt Card-Based: `npm run gate` xanh (lint 0/0, subset 0,
  component 0, 110 tests pass) + spot-check PNG detail/fasting/quiz.
