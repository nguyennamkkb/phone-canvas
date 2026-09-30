# CaloAI - Wireframes

**Version**: 1.0
**Date**: 2026-09-28
**Status**: Draft
**Nguồn**: PRD v1.0, Project_Overview v1.0 (snapshot 2026-09-28). File Use_Cases/FR chưa tồn tại nên UC-001..022 và FR-001..056 dùng theo quy ước đặt trong yêu cầu và nhóm FR suy ra từ PRD §7.

## 1. Introduction

### 1.1 Purpose
Tài liệu này mô tả trực quan 26 màn hình CaloAI (WF-001..WF-026): mục đích, vùng nội dung, layout ASCII, components, action chính, bao phủ UC/FR, states và ghi chú trợ năng. Là cơ sở cho Design, SwiftUI implementation và QA snapshot test.

### 1.2 Design Principles
- **Tốc độ**: flow chụp → log hoàn tất dưới 10 giây, tối thiểu số tap.
- **Trung thực AI**: mọi số AI đều kèm confidence và khoảng sai số, cho sửa trước khi lưu.
- **Món Việt hạng nhất**: serving mặc định theo suất Việt (tô/chén/dĩa/phần).
- **Nhất quán**: một ngôn ngữ component cho mọi flow log (scan/barcode/text/search).
- **iOS Native**: tuân thủ Apple HIG, SwiftUI NavigationStack + Tab + sheet.

### 1.3 Design System
- **Typography**: SF Pro (system font), scale theo token `${typography.scale.caption/body/headline/title}`.
- **Color Palette** (token paths, giá trị thực lấy từ file token khi Design chốt):
  - Primary: `${color.palette.primary}`
  - Secondary: `${color.palette.secondary}`
  - Success: `${color.palette.success}`
  - Warning: `${color.palette.warning}`
  - Error: `${color.palette.error}`
  - Background: `${color.palette.background}`
  - Surface: `${color.palette.surface}`
  - Text Primary: `${color.palette.textPrimary}`
  - Text Secondary: `${color.palette.textSecondary}`
- **Spacing**: lưới 8pt — `${spacing.xs/sm/md/lg/xl/xxl}`.
- **Corner Radius**: `${border.radius.sm/md/lg/xl}`.
- **Token file quy ước**: `.claude/shared/DESIGN_TOKEN_caloai.json`. Chưa có file thì giữ nguyên token paths, không hardcode màu iOS mặc định.
- **Quy ước FR dùng trong tài liệu này** (suy ra từ PRD §7, đủ 56 FR để back-trace):
  - Onboarding/Goal/Auth: FR-001 quiz 6–8 câu dưới 90s, FR-002 TDEE Mifflin-St Jeor, FR-003 calorie/macro goal + giải thích, FR-004 goal mặc định khi bỏ qua, FR-005 Sign in with Apple, FR-006 Guest + đồng ý privacy.
  - Photo Scan AI: FR-007 chụp/crop, FR-008 upload Edge + cache image-hash, FR-009 items + grams + kcal + P/C/F dưới 5s p95, FR-010 confidence + cảnh báo khi dưới 60%, FR-011 3 mức ít/vừa/nhiều, FR-012 sửa grams + recalc realtime, FR-013 human-in-the-loop (chưa xác nhận không lưu), FR-014 khoảng sai số.
  - Barcode: FR-015 quét UPC/EAN dưới 2s, FR-016 tra DB + fallback Nutritionix, FR-017 không thấy thì gợi ý custom.
  - Text/voice: FR-018 nhập tiếng Việt có/không dấu + voice, FR-019 parse món + lượng sai số chấp nhận sau xác nhận, FR-020 xác nhận trước lưu.
  - Search: FR-021 search 500–800 món dưới 500ms, FR-022 kcal/suất + P/C/F, FR-023 recent/favorite.
  - Custom food: FR-024 tạo món kcal/100g + serving, FR-025 recipe nhiều nguyên liệu, FR-026 dùng lại 1 chạm.
  - Diary/quản lý bữa: FR-027 diary theo bữa sáng/trưa/tối/snack, FR-028 macro ring consumed/remaining realtime, FR-029 Health Score, FR-030 food detail + đổi serving, FR-031 sửa log, FR-032 xóa log + undo, FR-033 relog từ history, FR-034 water log, FR-035 exercise/steps cơ bản.
  - Cân nặng/HealthKit: FR-036 weight log dưới 10s, FR-037 chart 7/30/90 ngày, FR-038 xin quyền HealthKit đúng lúc + usage string rõ, FR-039 sync 2 chiều dietary/cân/steps, FR-040 background delivery.
  - History/Streak: FR-041 history + filter, FR-042 stats tuần/tháng, FR-043 streaks + celebration, FR-044 xuất CSV.
  - Fasting/Coach: FR-045 fasting timer 16:8 + nhắc cửa sổ ăn, FR-046 cảnh báo vượt carb, FR-047 coach chat theo lịch sử ăn.
  - Monetization/Engagement: FR-048 gói tháng/năm + giá bill hiển thị to, FR-049 trial 7 ngày + verify StoreKit 2 server-side, FR-050 restore purchases, FR-051 quota free 3 scans/ngày + paywall trigger, FR-052 hướng dẫn hủy trong Settings, FR-053 push nhắc bữa tối đa 3/ngày + opt-in, FR-054 widget consumed/remaining, FR-055 offline log tay + queue scan + delta sync, FR-056 settings goal/privacy/xóa/export tài khoản.

### 1.4 External References & Fallback

| Tham chiếu ngoài | Khi có | Fallback khi thiếu |
|---|---|---|
| `ios-components` skill | Dùng định nghĩa component của skill | Dùng danh mục inline ở §4 Common Components |
| `ios-ui-ux` skill | Dùng hướng dẫn UX của skill | Dùng §5–§7 của tài liệu này |
| `mcp-figma` (Framelink) | Trích tokens/specs từ Figma | Dùng ASCII wireframes + §1.3 ở đây |
| `DESIGN_TOKEN_caloai.json` | Dùng giá trị token | Giữ token paths ở §1.3, không hardcode màu mặc định |
| File Figma | Link file thiết kế | Ghi "(chưa tạo)"; wireframes ở đây là authoritative |

---

## 2. Screen Inventory

| Screen ID | Tên màn hình | Ưu tiên | FR liên quan | UC liên quan | Status |
|---|---|---|---|---|---|
| WF-001 | Splash | P0 | FR-005, FR-006 | UC-002 | Draft |
| WF-002 | Onboarding quiz | P0 | FR-001, FR-002, FR-004 | UC-001 | Draft |
| WF-003 | Goal result | P0 | FR-002, FR-003 | UC-001 | Draft |
| WF-004 | Login (Apple/Guest) | P0 | FR-005, FR-006 | UC-002 | Draft |
| WF-005 | Home/Dashboard | P0 | FR-027, FR-028, FR-029, FR-051 | UC-009 | Draft |
| WF-006 | Camera scan | P0 | FR-007, FR-008, FR-051 | UC-003 | Draft |
| WF-007 | AI result confirm | P0 | FR-009, FR-010, FR-011, FR-012, FR-013, FR-014 | UC-004 | Draft |
| WF-008 | Food search | P0 | FR-021, FR-022, FR-023 | UC-007 | Draft |
| WF-009 | Food detail | P0 | FR-022, FR-030, FR-031 | UC-010 | Draft |
| WF-010 | Barcode scanner | P0 | FR-015, FR-016, FR-017 | UC-005 | Draft |
| WF-011 | Text/voice log | P0 | FR-018, FR-019, FR-020 | UC-006 | Draft |
| WF-012 | Diary | P0 | FR-027, FR-031, FR-032, FR-033, FR-034, FR-035 | UC-009, UC-011, UC-012, UC-013, UC-014 | Draft |
| WF-013 | Weight trend | P0 | FR-036, FR-037, FR-039 | UC-015 | Draft |
| WF-014 | Paywall | P0 | FR-048, FR-049, FR-050, FR-051 | UC-021 | Draft |
| WF-015 | Profile/Settings | P0 | FR-052, FR-056, FR-003 | UC-022 | Draft |
| WF-016 | Custom food editor | P1 | FR-024, FR-025, FR-026 | UC-008 | Draft |
| WF-017 | History/Stats | P1 | FR-041, FR-042, FR-044 | UC-017 | Draft |
| WF-018 | Fasting timer | P1 | FR-045, FR-046 | UC-019 | Draft |
| WF-019 | Coach chat | P1 | FR-047 | UC-020 | Draft |
| WF-020 | HealthKit permission | P0 | FR-038, FR-039 | UC-016 | Draft |
| WF-021 | Push permission | P1 | FR-053 | UC-018 | Draft |
| WF-022 | Widget | P1 | FR-054 | UC-018 | Draft |
| WF-023 | Delete confirm modal | P0 | FR-032 | UC-011 | Draft |
| WF-024 | Error/offline states | P0 | FR-055, FR-009 | UC-009 | Draft |
| WF-025 | Subscription manage | P0 | FR-050, FR-052, FR-049 | UC-021 | Draft |
| WF-026 | Empty states | P0 | FR-027, FR-041, FR-021 | UC-009, UC-017 | Draft |

Phân loại: P0 = MVP bắt buộc (19 screens incl. modal/states), P1 = MVP vận hành tối thiểu + P1 sớm (7 screens: WF-016..019, WF-021, WF-022), P2 = không có trong phạm vi tài liệu này (Watch, meal plan, social để bản sau).

---

## 2 bis. Screen Taxonomy

### Archetype Catalog

| Archetype | Mục đích | Layout pattern | Ưu tiên component | Engagement mặc định | Ví dụ CaloAI |
|---|---|---|---|---|---|
| Discovery | Duyệt, khám phá | Feed/scroll, visual nặng | Cards, hình, CTA inline | Pull-to-refresh, skeleton, gợi ý | WF-005 Home, WF-008 Search |
| Action | Hoàn tất 1 tác vụ | Form/CTA/progress, đơn mục đích | Fields, buttons, stepper, progress | Validation realtime, keyboard, loading trên submit | WF-002, WF-004, WF-006, WF-007, WF-010, WF-011, WF-014, WF-016 |
| Consumption | Đọc/xem nội dung | Full-bleed, chrome tối thiểu | Media, text blocks, controls gọn | Full-screen, swipe dismiss, sticky info | WF-001, WF-003, WF-009, WF-022 |
| Management | Sắp xếp, rà soát | List/dashboard, filter được | List/table, chips, search, swipe actions | Swipe actions, batch, sort, empty states | WF-012, WF-013, WF-015, WF-017, WF-024, WF-025, WF-026 |
| Social | Tương tác hội thoại | Hội thoại/micro-action | Avatar, input, bubble, gợi ý | Typing indicator, suggestion chips | WF-019 Coach chat |

### Screen Taxonomy Assignment Table

| WF-ID | Tên | Primary | Secondary | Density | Key behaviors |
|---|---|---|---|---|---|
| WF-001 | Splash | Consumption | — | Light | Tự dismiss, logo, spinner |
| WF-002 | Onboarding quiz | Action | Discovery | Medium | Step 1/7, Skip, validation |
| WF-003 | Goal result | Consumption | Action | Medium | Số TDEE animated, CTA tiếp |
| WF-004 | Login | Action | — | Light | Apple button, guest, consent |
| WF-005 | Home/Dashboard | Discovery | Management | Dense | Ring, pull-refresh, quick log |
| WF-006 | Camera scan | Action | — | Medium | Viewfinder, chụp, preview |
| WF-007 | AI result confirm | Action | Management | Dense | Confidence, stepper, save gate |
| WF-008 | Food search | Discovery | — | Medium | Search realtime, recent |
| WF-009 | Food detail | Consumption | Action | Medium | Sticky CTA log, serving stepper |
| WF-010 | Barcode scanner | Action | — | Light | Viewfinder, beep, fallback |
| WF-011 | Text/voice log | Action | — | Medium | Parse preview, mic, confirm |
| WF-012 | Diary | Management | — | Dense | Section bữa, swipe edit/delete |
| WF-013 | Weight trend | Management | Discovery | Medium | Chart 7/30/90, stepper kg |
| WF-014 | Paywall | Action | Discovery | Medium | So sánh gói, trial, purchase |
| WF-015 | Profile/Settings | Management | — | Medium | Grouped list, toggle, danger zone |
| WF-016 | Custom food editor | Action | — | Medium | Form kcal/100g, save draft |
| WF-017 | History/Stats | Management | Discovery | Dense | Filter chips, bar chart |
| WF-018 | Fasting timer | Action | Management | Medium | Vòng timer, start/stop |
| WF-019 | Coach chat | Social | — | Medium | Bubble, suggestion chips, input |
| WF-020 | HealthKit permission | Action | — | Light | Lợi ích, system sheet |
| WF-021 | Push permission | Action | — | Light | Lợi ích, skip, system sheet |
| WF-022 | Widget | Consumption | — | Light | Glance số, deep link |
| WF-023 | Delete confirm modal | Action | — | Light | Cảnh báo, destructive CTA |
| WF-024 | Error/offline states | Management | — | Light | Banner, retry, queue |
| WF-025 | Subscription manage | Management | Action | Medium | Trạng thái gói, restore, cancel |
| WF-026 | Empty states | Management | — | Light | Minh họa, CTA tạo dữ liệu |

---

## 3. Screen Sections

### 3.1 WF-001 Splash

**Archetype**: Consumption | **Density**: Light
**Source UC**: UC-002 | **Source FR**: FR-005, FR-006
**User Intent**: "Tôi muốn app mở nhanh và đưa tôi đúng chỗ (onboarding hay home)."

#### Visual Hierarchy
1. Logo + tên CaloAI (trung tâm, thấy đầu tiên).
2. Tagline "Chụp 1 tấm là biết calo" (phụ, dưới logo).
3. Spinner/check-session (nhỏ, đáy màn hình).

#### Required Features (from FR)
- Check session (Apple/Guest) và cờ onboarding để điều hướng (FR-005, FR-006).
- Cold launch dưới 1.5s, không kẹt quá 2s ở splash.

#### UX Enhancements
- Tự dismiss khi session xong, không cần tap; fade 0.25s.
- Giữ splash tối giản, không CTA để tránh tap nhầm.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: status bar      │ ← system (44pt top)
│ ZONE A: logo + tagline  │ ← VStack center, fills
│ ZONE B: spinner         │ ← bottom safe area
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│                         │
│       [Logo CaloAI]     │ ← ZONE A
│  "Chụp 1 tấm là biết   │
│         calo"           │
│                         │
│        (spinner)        │ ← ZONE B
└─────────────────────────┘
```

#### Components
- Logo → BrandLogo (asset §8). Spinner → ProgressSpinner. Không dùng button.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Mở lạnh, session hợp lệ | Logo + spinner 0.5–1s rồi vào Home |
| First Visit | Chưa onboarding | Vào WF-002 sau splash |
| Returning | Đã login | Vào WF-005 |
| Loading | Check session chậm | Spinner + giữ logo, timeout 3s |
| Offline | Không mạng lần đầu | Vào app ở chế độ local, banner offline ở Home |
| Error | SwiftData corrupt hiếm | Màn lỗi + nút Thử lại (dẫn WF-024) |
| Dark Mode | Hệ dark | Logo variant sáng trên nền tối |

#### User Flow
- Entry: app launch. Exit: WF-002 (mới) / WF-004 (chưa login) / WF-005 (đã login). Transition: crossfade.

---

### 3.2 WF-002 Onboarding quiz

**Archetype**: Action (Secondary: Discovery) | **Density**: Medium
**Source UC**: UC-001 | **Source FR**: FR-001, FR-002, FR-004
**User Intent**: "Tôi muốn trả lời vài câu hỏi nhanh để nhận mục tiêu calo phù hợp."

#### Visual Hierarchy
1. Progress "Bước X/7" + thanh tiến trình (trên cùng).
2. Câu hỏi + option cards (vùng chính, dễ tap).
3. CTA Tiếp tục + Bỏ qua (đáy, cố định).

#### Required Features (from FR)
- Quiz 6–8 câu: mục tiêu, giới tính, tuổi, cao, cân, mức vận động, tốc độ mong muốn (FR-001).
- Hoàn thành dưới 90s; Bỏ qua được, goal mặc định hợp lý (FR-004).

#### UX Enhancements
- Mỗi bước 1 câu, vuốt/tap chọn là tự sang bước sau với câu single-choice; numeric dùng stepper + keyboard số.
- Validate inline: chưa chọn thì CTA mờ; haptic nhẹ khi chọn.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: progress + Skip │ ← toolbar 44pt
│ ZONE A: câu hỏi         │ ← top, compact
│ ZONE B: options/inputs  │ ← scroll, fills
│ ZONE B: CTA Tiếp tục    │ ← bottom fixed 50pt+safe
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ Bước 3/7 ▓▓▓░░░   [Bỏ qua]│ ← ZONE D
│ Bạn vận động thế nào?   │ ← ZONE A
│ ┌─────────────────────┐ │
│ │ ○ Ít (văn phòng)    │ │ ← ZONE B
│ │ ● Vừa (3-4 buổi/tuần)│ │
│ │ ○ Nhiều (5+ buổi)   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │      [Tiếp tục]     │ │ ← CTA
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Progress → QuizProgress (bar + label). Cards → OptionCard (radio). CTA → BtnPrimary. Skip → BtnText.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Trả lời giữa quiz | Câu hỏi + options + CTA theo validity |
| First step | Bước 1 | Không có Back, chỉ Bỏ qua |
| Validating | Chưa chọn/numeric sai | CTA disabled, hint đỏ dưới field |
| Numeric input | Tuổi/cao/cân | Keyboard số + stepper, đơn vị kg/cm |
| Skipped | Tap Bỏ qua | Confirm nhẹ rồi dùng goal mặc định |
| Loading | Tính TDEE cuối quiz | Spinner trên CTA 1s rồi sang WF-003 |
| Error | Nhập số vô lý (cao 250cm) | Hint "Kiểm tra lại" + giữ CTA disabled |

#### User Flow
- Entry: WF-001 (mới). Exit: WF-003 (xong/bỏ qua). Transition: slide ngang giữa các bước.

---

### 3.3 WF-003 Goal result

**Archetype**: Consumption (Secondary: Action) | **Density**: Medium
**Source UC**: UC-001 | **Source FR**: FR-002, FR-003
**User Intent**: "Tôi muốn thấy mục tiêu calo/macro của mình và hiểu nó từ đâu ra."

#### Visual Hierarchy
1. Số calorie goal lớn (hero, animated count-up).
2. 3 macro P/C/F (hàng ngang dưới hero).
3. Giải thích TDEE ngắn + CTA Bắt đầu.

#### Required Features (from FR)
- TDEE theo Mifflin-St Jeor, calorie goal + protein/carb/fat goal + 1–2 câu giải thích (FR-002, FR-003).

#### UX Enhancements
- Count-up số calo khi vào màn; macro bar minh họa tỉ lệ; link "Cách tính?" mở giải thích.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: hero calorie    │ ← top 40%
│ ZONE B: macro row       │ ← compact
│ ZONE C: giải thích      │ ← scroll ngắn
│ ZONE B: CTA Bắt đầu     │ ← bottom fixed
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│  Mục tiêu của bạn       │
│      [ 1.850 kcal ]     │ ← ZONE A hero
│  P 120g | C 200g | F 55g│ ← ZONE B
│  TDEE 2.300 − deficit   │
│  450 để giảm ~0.5kg/tuần│ ← ZONE C
│ ┌─────────────────────┐ │
│ │     [Bắt đầu]       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Hero → GoalHeroNumber (count-up). Macro → MacroRow (3 ô). CTA → BtnPrimary. Link → BtnText.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Tính xong goal | Full layout + CTA |
| Loading | Đang tính TDEE | Skeleton số + spinner 1s |
| Default-goal | Bỏ qua quiz | Badge "Mục tiêu mặc định" + gợi ý chỉnh ở Settings |
| Aggressive-goal | Deficit quá sâu | Cảnh báo "Mức giảm nhanh, cân nhắc" + vẫn cho tiếp |
| Error | Thiếu dữ liệu quiz | Dùng defaults + hint, không crash |
| Offline | Không mạng | Tính local bình thường, không banner chặn |
| Dynamic Type | Chữ lớn | Hero co lại, macro xếp dọc |

#### User Flow
- Entry: WF-002. Exit: WF-004 (login) rồi WF-005. Transition: push/modal sang login.

---

### 3.4 WF-004 Login (Apple/Guest)

**Archetype**: Action | **Density**: Light
**Source UC**: UC-002 | **Source FR**: FR-005, FR-006
**User Intent**: "Tôi muốn đăng nhập nhanh bằng Apple hoặc dùng thử mà không kẹt."

#### Visual Hierarchy
1. Lợi ích ngắn (đồng bộ + bảo mật).
2. Nút Sign in with Apple (CTA chính).
3. Dùng thử không đăng nhập + đồng ý privacy (phụ).

#### Required Features (from FR)
- Sign in with Apple chính + Guest giới hạn + checkbox/link privacy consent (FR-005, FR-006).

#### UX Enhancements
- Apple sheet hệ thống; Guest ghi rõ giới hạn (3 scans/ngày, không sync); lỗi hủy Apple sheet thì ở lại màn, không báo lỗi ồn.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: logo + lợi ích  │ ← top
│ ZONE B: Apple + Guest   │ ← middle
│ ZONE C: privacy links   │ ← bottom
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [Logo] Đồng bộ an toàn  │
│ ┌─────────────────────┐ │
│ │   Sign in w/ Apple │ │ ← 50pt
│ └─────────────────────┘ │
│ [Dùng thử không TK]     │
│ Điều khoản · Privacy    │
└─────────────────────────┘
```

#### Components
- Auth → AppleSignInButton (system). Guest → BtnSecondary. Links → BtnText (mở Safari/modal).

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Chưa login | Full layout |
| Loading | Đang verify Apple | Spinner trên nút, disable cả hai |
| Cancelled | User hủy Apple sheet | Ở lại màn, không toast lỗi |
| Network error | Verify fail | Banner "Không kết nối" + Thử lại |
| Guest mode | Dùng thử | Badge Guest ở Profile, giới hạn scan |
| Existing session | Đã login trước | Auto-skip màn này từ Splash |
| VoiceOver | Đọc màn | Label rõ "Đăng nhập bằng Apple" |

#### User Flow
- Entry: WF-003 / WF-001. Exit: WF-020 (HealthKit) hoặc WF-005 / WF-014 (paywall trial). Transition: modal dismiss → push.

---

### 3.5 WF-005 Home/Dashboard (trọng tâm)

**Archetype**: Discovery (Secondary: Management) | **Density**: Dense
**Source UC**: UC-009 | **Source FR**: FR-027, FR-028, FR-029, FR-051
**User Intent**: "Tôi muốn mở app là biết ngay hôm nay còn được ăn bao nhiêu và log bữa tiếp trong 1 chạm."

#### Visual Hierarchy
1. Macro ring + consumed/remaining kcal (hero, lớn nhất, trên cùng).
2. Quick log hàng (Chụp/Tìm/Barcode/Text) — 4 nút tròn dưới hero.
3. Bữa hôm nay (sáng/trưa/tối/snack) + Health Score + streak (feed dưới).

#### Required Features (from FR)
- Vòng macro realtime consumed/remaining/deficit theo goal (FR-028); diary tóm tắt theo bữa (FR-027); Health Score (FR-029); hết quota free thì nút Chụp dẫn paywall (FR-051).

#### UX Enhancements
- Pull-to-refresh sync; skeleton ring khi load; celebration nhẹ khi đạt goal; date pager Hôm nay + nút lịch; quota badge "Còn X scans" cho free.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav + ngày      │ ← toolbar 44pt: date pager, streak, settings
│ ZONE A: macro ring hero │ ← ~220pt, sticky top
│ ZONE B: quick log row   │ ← 4 nút 64pt, horizontal
│ ZONE C: bữa + score     │ ← scroll LazyVStack
│ ZONE D: Tab bar         │ ← 49pt+safe: Home/Scan/Diary/Profile
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ < 27/09/2026 >  🔥5  [⚙]│ ← ZONE D
│   ┌───────────────┐     │
│   │  (ring) 1.250 │     │ ← ZONE A: consumed
│   │  còn 600 kcal │     │   P/C/F mini bars
│   └───────────────┘     │
│ [📷][🔍][bar][✏️]       │ ← ZONE B quick log
│ Sáng: phở bò 520 ···   │ ← ZONE C meal rows
│ Trưa: — [+ Thêm]        │
│ Health Score 82 [?]     │
│ [Home][Scan][Diary][Me] │ ← Tab
└─────────────────────────┘
```

#### Layout Variants
- Variant B — Ngày mới chưa log: ring rỗng 0 kcal + card CTA "Log bữa đầu" dẫn WF-006; bữa hiện "—".
- Variant C — Hết quota free: nút Chụp có badge khóa, tap mở WF-014 thay vì WF-006.

#### Components
- Ring → MacroRing (progress + kcal + P/C/F bars). QuickLog → QuickLogRow (4 IconButton). MealRow → FoodRow (§4). Score → HealthScoreCard. Tab → TabStandard.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Đã log 1+ bữa | Ring theo số thật + meal rows |
| First Visit | Ngày đầu, chưa log | Variant B + coachmark "Chụp bữa đầu" |
| Loading | Mở app/sync | Skeleton ring + shimmer rows |
| Goal reached | Đạt calorie goal | Confetti nhẹ + streak +1 |
| Over goal | Vượt deficit | Ring đỏ/cảnh báo + gợi ý nhẹ, không trách |
| Offline | Không mạng | Số local + banner "Offline — số local" |
| Quota hết | Free đủ 3 scans | Nút Chụp khóa + badge, tap → WF-014 |
| Error | Sync fail | Banner retry, số local vẫn hiện |

#### User Flow
- Entry: WF-001/WF-004/WF-020/tab. Exit: WF-006/WF-008/WF-010/WF-011 (quick log), WF-012 (xem diary), WF-015 (settings). Transition: tab switch, sheet cho scan.

---

### 3.6 WF-006 Camera scan (trọng tâm)

**Archetype**: Action | **Density**: Medium
**Source UC**: UC-003 | **Source FR**: FR-007, FR-008, FR-051
**User Intent**: "Tôi muốn giơ máy lên, chụp 1 tấm là xong, không chỉnh sửa lằng nhằng."

#### Visual Hierarchy
1. Viewfinder camera full-bleed (chiếm đa số màn hình).
2. Nút chụp lớn trung tâm đáy + nút thư viện/đèn flash (hỗ trợ).
3. Tip "Đặt món vào khung" + quota badge (phụ, overlay).

#### Required Features (from FR)
- Chụp/crop ảnh món (FR-007); upload qua Edge + cache image-hash (FR-008); free hết quota thì chặn trước khi chụp, dẫn paywall (FR-051).

#### UX Enhancements
- Khung gợi ý oval/chữ nhật; tap-to-focus; preview 1s với Chụp lại/Dùng ảnh; nén dưới 1MB trước upload; haptic khi chụp.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: top bar         │ ← đóng, flash, quota badge
│ ZONE A: viewfinder      │ ← full-bleed camera
│ ZONE B: tip overlay     │ ← trên nút chụp
│ ZONE B: shutter row     │ ← bottom 110pt+safe
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [×]  Còn 2 scans   [⚡] │ ← ZONE D
│ ┌─────────────────────┐ │
│ │                     │ │
│ │    (viewfinder)     │ │ ← ZONE A
│ │   ┌─ ─ ─ ─ ─┐      │ │
│ │   │  đặt món │      │ │
│ └─────────────────────┘ │
│ Chụp rõ cả tô/chén      │ ← tip
│ [album]  ( ○ )   [lật]  │ ← shutter row
└─────────────────────────┘
```

#### Layout Variants
- Variant B — Preview sau chụp: ảnh tĩnh + [Chụp lại] + [Dùng ảnh →] sang WF-007.

#### Components
- Camera → ScanViewfinder (AVFoundation). Shutter → ShutterButton (80pt). Overlay → QuotaBadge, TipLabel. Album → PhotoPickerButton.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Camera sẵn sàng | Viewfinder live + shutter active |
| Permission denied | Chưa cấp camera | Minh họa + nút Mở Cài đặt hệ thống |
| Quota hết | Free đủ 3 scans | Shutter khóa + CTA "Lên Pro" → WF-014 |
| Capturing | Vừa tap chụp | Freeze frame 300ms + haptic |
| Preview | Xem lại ảnh | Variant B, chọn Dùng ảnh/Chụp lại |
| Uploading | Gửi Edge | Progress "Đang phân tích…" rồi sang WF-007 |
| Offline | Không mạng | Cho chụp, queue scan + gợi ý log tay (WF-011) |
| Error | Camera fail | Thông báo + nút Thử lại |

#### User Flow
- Entry: WF-005 tab Scan / quick log. Exit: WF-007 (Dùng ảnh), WF-014 (hết quota). Transition: full-screen modal, push sang confirm.

---

### 3.7 WF-007 AI result confirm (trọng tâm)

**Archetype**: Action (Secondary: Management) | **Density**: Dense
**Source UC**: UC-004 | **Source FR**: FR-009, FR-010, FR-011, FR-012, FR-013, FR-014
**User Intent**: "Tôi muốn kiểm tra AI đoán đúng không, sửa khẩu phần 1 chạm rồi lưu."

#### Visual Hierarchy
1. Ảnh món + tổng kcal + confidence badge (top, quyết định trust).
2. Danh sách items AI (mỗi dòng: tên + grams stepper + kcal + sửa/xóa).
3. Mức khẩu phần ít/vừa/nhiều + chọn bữa + CTA Lưu (đáy cố định).

#### Required Features (from FR)
- Items + grams + kcal + P/C/F + confidence từng món (FR-009, FR-010); 3 mức khẩu phần (FR-011); sửa grams recalc realtime (FR-012); chưa xác nhận không cho lưu (FR-013); khoảng sai số khi nguồn yếu (FR-014); confidence dưới 60% cảnh báo + bắt nhập tay.

#### UX Enhancements
- Confidence badge màu (xanh/vàng/đỏ); stepper ±10g; vuốt xóa item; recalc debounce 200ms; nút "Thêm món" mở search; cảnh báo low-confidence inline, không alert chặn trừ khi toàn bộ dưới ngưỡng.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav             │ ← Hủy, "Xác nhận", sửa ảnh
│ ZONE A: photo + tổng    │ ← thumb 72pt + kcal + badge
│ ZONE B: items list      │ ← scroll, fills
│ ZONE B: portion + meal  │ ← segmented + meal picker
│ ZONE B: CTA Lưu         │ ← bottom fixed 50pt+safe
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [Hủy] Xác nhận      [📷]│
│ [img] Phở bò ~520 kcal  │
│  Confidence 82% [●●●○]  │ ← ZONE A
│ ┌─────────────────────┐ │
│ │ Bánh phở 200g 180kcal│ │ ← item row
│ │ [-] 200g [+]    [×] │ │
│ │ Thịt bò 120g 250kcal │ │
│ └─────────────────────┘ │
│ Ít ○  Vừa ●  Nhiều ○    │ ← portion
│ Bữa: [Trưa ▾] [+Thêm món]│
│ ┌─────────────────────┐ │
│ │ [Lưu vào nhật ký]   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Layout Variants
- Variant B — Low confidence (<60%): banner vàng "AI chưa chắc — kiểm tra grams giúp mình" + CTA Lưu mờ cho tới khi user chạm vào ít nhất 1 stepper (đánh dấu đã review).

#### Components
- Badge → ConfidenceBadge (§4: high/med/low). ItemRow → FoodRow editable (stepper + delete). Portion → PortionSegmented (3 mức). Meal → MealPicker. CTA → BtnPrimary (disabled tới khi confirm).

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Confidence ≥60% | Full layout, CTA active sau review |
| Analyzing | Chờ AI | Skeleton items + shimmer 2–4s |
| Low-confidence | <60% | Variant B + bắt review tay |
| Editing grams | Đổi stepper/nhập tay | Recalc kcal/macro realtime |
| Item removed | Xóa hết items | CTA disabled + gợi ý Thêm món/log tay |
| Offline | Rớt mạng giữa chừng | Giữ kết quả, banner retry gửi lại |
| Save success | Lưu xong | Toast + về WF-005/WF-012, ring cập nhật |
| Save error | Ghi SwiftData fail | Alert retry, giữ nguyên màn hình |

#### User Flow
- Entry: WF-006 (Dùng ảnh) / WF-011 (parse xong). Exit: WF-005/WF-012 (Lưu), WF-008 (Thêm món), WF-006 (chụp lại). Transition: push từ scan, dismiss về home sau lưu. TF: TF-003→TF-004.

---

### 3.8 WF-008 Food search

**Archetype**: Discovery | **Density**: Medium
**Source UC**: UC-007 | **Source FR**: FR-021, FR-022, FR-023
**User Intent**: "Tôi muốn gõ 'phở bò' là ra ngay suất chuẩn để log 1 chạm."

#### Visual Hierarchy
1. Search bar (top, focus đầu).
2. Recent/Favorite chips (dưới search).
3. Kết quả rows (kcal/suất + P/C/F rút gọn).

#### Required Features (from FR)
- Search 500–800 món dưới 500ms (FR-021); kcal/suất + P/C/F mỗi dòng (FR-022); recent + favorite + custom foods (FR-023).

#### UX Enhancements
- Debounce 150ms, gõ không dấu vẫn ra; swipe favorite; skeleton rows khi load.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav + search    │ ← toolbar + .searchable
│ ZONE C: recent chips    │ ← horizontal scroll 44pt
│ ZONE B: results list    │ ← fills, LazyVStack
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [<] [🔍 phở bò________] │
│ [Gần đây][♥ Yêu thích]  │
│ ┌─────────────────────┐ │
│ │ Phở bò (tô) 520kcal │ │
│ │ Cơm tấm 650kcal  [＋]│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Search → SearchBar (voice optional). Chips → ChipFilter. Rows → FoodRow + QuickAddButton.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Có query + kết quả | List rows + quick add |
| Idle | Chưa gõ | Recent + favorite + gợi ý món Việt |
| Loading | Đang search | Skeleton 3 rows |
| No results | Không món | Minh họa + "Tạo món custom" → WF-016 |
| Offline | Không mạng | Kết quả local cache + badge offline |
| Error | Search fail | Retry inline, giữ query |
| VoiceOver | Đọc list | "Phở bò, 520 kilocalo, nút thêm" |

#### User Flow
- Entry: WF-005/WF-007/WF-012. Exit: WF-009 (tap row), log nhanh (tap +), WF-016 (tạo mới).

---

### 3.9 WF-009 Food detail

**Archetype**: Consumption (Secondary: Action) | **Density**: Medium
**Source UC**: UC-010 | **Source FR**: FR-022, FR-030, FR-031
**User Intent**: "Tôi muốn xem rõ món này bao nhiêu calo trước khi quyết định log."

#### Visual Hierarchy
1. Tên món + ảnh/thumb + kcal/suất.
2. Macro bars P/C/F + nguồn DB.
3. Serving stepper + chọn bữa + CTA Log.

#### Required Features (from FR)
- Kcal/suất + P/C/F + nguồn (FR-022); đổi serving recalc (FR-030); log vào bữa (FR-031).

#### UX Enhancements
- Sticky CTA đáy; serving presets (0.5/1/1.5 suất) + nhập grams; nguồn "Viện DD/USDA" tăng trust.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: title + kcal    │ ← top
│ ZONE C: macro + nguồn   │ ← middle
│ ZONE B: serving + meal  │ ← form
│ ZONE B: CTA Log         │ ← bottom fixed
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [<] Phở bò            ♥ │
│ 1 tô ~ 520 kcal         │
│ P 25g ▓▓░░ C 70g F 15g  │
│ Nguồn: VN DB v1 [?]     │
│ Suất [-] 1.0 [+] Bữa[▾] │
│ ┌─────────────────────┐ │
│ │ [Log vào nhật ký]   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Macro → MacroRow. Stepper → ServingStepper. CTA → BtnPrimary. Favorite → FavoriteToggle.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Món có đủ số | Full layout |
| Loading | Fetch detail | Skeleton macro |
| Approx | Nguồn yếu | "Khoảng 450–600" thay vì số tuyệt đối |
| Serving changed | Đổi suất | Recalc kcal/macro realtime |
| Offline | Không mạng | Cache + badge offline |
| Error | Không tải được | Retry + về search |
| Favorited | Đã ♥ | Badge ở WF-008 recent |

#### User Flow
- Entry: WF-008/WF-017. Exit: WF-012/WF-005 (sau log), WF-016 (sửa custom).

---

### 3.10 WF-010 Barcode scanner

**Archetype**: Action | **Density**: Light
**Source UC**: UC-005 | **Source FR**: FR-015, FR-016, FR-017
**User Intent**: "Tôi muốn quét mã vạch đồ đóng gói là log được ngay."

#### Visual Hierarchy
1. Viewfinder + khung quét (chính).
2. Kết quả nhanh (tên + kcal/serving) hiện dạng bottom sheet.
3. Fallback tạo custom khi không thấy (phụ).

#### Required Features (from FR)
- Quét UPC/EAN dưới 2s (FR-015); tra DB + fallback Nutritionix (FR-016); không thấy → gợi ý custom (FR-017).

#### UX Enhancements
- Beep + haptic khi bắt mã; nhập mã tay khi camera mờ; sheet kết quả có stepper serving + CTA Log.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav + flash     │ ← top 44pt
│ ZONE A: viewfinder      │ ← fills
│ ZONE B: result sheet    │ ← bottom sheet khi có KQ
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [×] Quét mã vạch   [⚡] │
│ ┌─────────────────────┐ │
│ │  ┌───────────┐      │ │
│ │  │ barcode   │ beep │ │
│ └─────────────────────┘ │
│ ┌─ sheet ─────────────┐ │
│ │ Sữa TH 180ml 110kcal│ │
│ │ [-] 1 [+] [Log]     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Scanner → BarcodeViewfinder. Sheet → ResultSheet (serving + CTA). Fallback → BtnText "Tạo món mới".

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Đang quét | Viewfinder live |
| Found | Thấy mã | Sheet kết quả + beep |
| Not found | Không DB | Sheet "Không tìm thấy" + CTA tạo custom → WF-016 |
| Manual entry | Camera mờ | Field nhập mã tay |
| Permission denied | Không camera | Hướng dẫn mở Settings |
| Offline | Không mạng | Tra local trước, queue lookup |
| Error | Lookup fail | Retry trong sheet |

#### User Flow
- Entry: WF-005/WF-012. Exit: WF-012 (sau log), WF-016 (tạo custom).

---

### 3.11 WF-011 Text/voice log

**Archetype**: Action | **Density**: Medium
**Source UC**: UC-006 | **Source FR**: FR-018, FR-019, FR-020
**User Intent**: "Tôi muốn gõ hoặc nói '2 trứng + 1 chén cơm' là log được."

#### Visual Hierarchy
1. Ô nhập text + nút mic (chính).
2. Preview parse (món + lượng + kcal ước tính).
3. CTA Xác nhận (đáy).

#### Required Features (from FR)
- Nhập tiếng Việt có/không dấu + voice (FR-018); parse món + lượng, ước lượng sau xác nhận (FR-019); xác nhận trước lưu (FR-020).

#### UX Enhancements
- Ví dụ placeholder món Việt; mic có waveform + xin quyền; parse realtime khi dừng gõ 500ms.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav             │ ← Hủy + tiêu đề
│ ZONE B: input + mic     │ ← top form
│ ZONE B: parse preview   │ ← list fills
│ ZONE B: CTA Xác nhận    │ ← bottom fixed
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [Hủy] Gõ / Nói món ăn   │
│ ┌──────────────────┐[🎙]│
│ │2 trứng+1 chén cơm│    │
│ └──────────────────┘    │
│ ✓ Trứng gà 2 quả 140kcal│
│ ✓ Cơm trắng 1 chén 200  │
│ ┌─────────────────────┐ │
│ │ [Xác nhận →]        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Input → TextLogField (multiline). Mic → VoiceButton (waveform). Preview → ParsedRow. CTA → BtnPrimary.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Đang nhập | Preview cập nhật realtime |
| Parsing | Đang parse | Skeleton 2 rows |
| Parsed | Parse xong | Preview + CTA active |
| Ambiguous | Món mơ hồ ("1 tô") | Chip hỏi lại "Tô phở hay bún bò?" |
| Mic denied | Không quyền mic | Chỉ cho gõ tay + hướng dẫn |
| Offline | Không mạng | Parse local đơn giản, queue AI parse |
| Error | Parse fail | Giữ text + gợi ý sửa/log tay |

#### User Flow
- Entry: WF-005/WF-012. Exit: WF-007 (xác nhận chi tiết) hoặc lưu thẳng → WF-012.

---

### 3.12 WF-012 Diary (trọng tâm)

**Archetype**: Management | **Density**: Dense
**Source UC**: UC-009, UC-011, UC-012, UC-013, UC-014 | **Source FR**: FR-027, FR-031, FR-032, FR-033, FR-034, FR-035
**User Intent**: "Tôi muốn thấy cả ngày ăn gì theo từng bữa, sửa/xóa/log lại dễ dàng."

#### Visual Hierarchy
1. Tổng ngày + macro ring mini + date pager (top sticky).
2. Sections bữa Sáng/Trưa/Tối/Snack + Nước + Vận động (list chính).
3. Swipe actions sửa/xóa + nút log lại ở history (tương tác hàng).

#### Required Features (from FR)
- Diary theo bữa (FR-027); sửa log (FR-031); xóa + undo (FR-032); relog từ history 1 chạm (FR-033); water log (FR-034); exercise/steps (FR-035).

#### UX Enhancements
- Swipe trái xóa, swipe phải sửa; undo toast 5s sau xóa; water stepper nhanh + goal 2L; exercise row đọc steps từ HealthKit; pull-to-refresh; tổng kcal header cập nhật realtime khi sửa.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav + date pager│ ← < Hôm nay > + tổng kcal
│ ZONE B: meal sections   │ ← grouped list fills
│ ZONE D: Tab bar         │ ← Home/Scan/Diary/Profile
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ < Hôm nay > 1.250/1.850 │
│ ▼ SÁNG 520 kcal         │
│ │ Phở bò 520   [sửa][×] │ ← swipe row
│ ▼ TRƯA —         [+Thêm]│
│ ▼ NƯỚC ▓▓▓░░ 1.2/2L [+250ml]│
│ ▼ VẬN ĐỘNG 3.200 bước   │
│ [Home][Scan][Diary][Me] │
└─────────────────────────┘
```

#### Layout Variants
- Variant B — Xem ngày cũ: header ngày quá khứ + banner "Chỉ xem", vẫn cho relog sang hôm nay.

#### Components
- Sections → MealSection (header + rows). Rows → FoodRow (swipe edit/delete). Water → WaterStepper. Exercise → ExerciseRow. Toast → UndoToast.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Có logs hôm nay | Sections đầy đủ + tổng realtime |
| Empty day | Chưa log bữa nào | Xem WF-026 inline + CTA chụp |
| Loading | Mở diary/sync | Skeleton 4 section headers |
| Editing | Swipe sửa | Mở WF-009/WF-016 với dữ liệu cũ |
| Deleted | Vừa xóa | Toast "Đã xóa — Hoàn tác 5s" |
| Past day | Xem hôm qua | Banner chỉ xem + nút relog |
| Offline | Không mạng | Dữ liệu SwiftData local + badge |
| Sync error | Sync fail | Banner retry, giữ list local |

#### User Flow
- Entry: tab Diary, WF-005, WF-007 (sau lưu). Exit: WF-009 (sửa), WF-023 (xóa), WF-008/WF-006 (thêm), WF-017 (xem history). TF: TF-009→TF-012.

---

### 3.13 WF-013 Weight trend

**Archetype**: Management (Secondary: Discovery) | **Density**: Medium
**Source UC**: UC-015 | **Source FR**: FR-036, FR-037, FR-039
**User Intent**: "Tôi muốn log cân nhanh và thấy trend tuần có xuống không."

#### Visual Hierarchy
1. Số cân hiện tại + delta tuần (hero).
2. Chart 7/30/90 ngày (trung tâm).
3. Log cân stepper + lịch sử gần đây.

#### Required Features (from FR)
- Log cân dưới 10s (FR-036); chart 7/30/90 (FR-037); đồng bộ HealthKit 2 chiều (FR-039).

#### UX Enhancements
- Stepper ±0.1kg + keyboard số; range picker segmented; trend line + average; nhắc cân hàng tuần.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: hero cân        │ ← top compact
│ ZONE C: chart           │ ← ~200pt
│ ZONE B: log + history   │ ← fills
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [<] Cân nặng            │
│ 68.5 kg  (−0.8/tuần)    │
│ [7D ●][30D][90D]        │
│ ┌─ chart ─────────────┐ │
│ │  ╲╲___╲___          │ │
│ └─────────────────────┘ │
│ [-] 68.5kg [+] [Lưu]    │
└─────────────────────────┘
```

#### Components
- Chart → WeightChart (Swift Charts). Stepper → WeightStepper. Range → SegmentedControl.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Có ≥2 điểm | Chart + delta |
| Single point | Mới 1 lần cân | Chart ẩn, hiện số + CTA cân tiếp |
| Empty | Chưa cân | Empty state + CTA (dẫn WF-026 style) |
| Loading | Sync HealthKit | Skeleton chart |
| Conflict | HealthKit khác local | Ưu tiên mới nhất + badge nguồn |
| Offline | Không mạng | Lưu local, badge chờ sync |
| Error | Ghi HealthKit fail | Toast retry, giữ số local |

#### User Flow
- Entry: WF-005/WF-015/tab. Exit: WF-015 (settings đơn vị kg). Nhập xong ở lại màn + toast.

---

### 3.14 WF-014 Paywall (trọng tâm)

**Archetype**: Action (Secondary: Discovery) | **Density**: Medium
**Source UC**: UC-021 | **Source FR**: FR-048, FR-049, FR-050, FR-051
**User Intent**: "Tôi muốn hiểu rõ giá thực trả, trial và cách hủy trước khi mua."

#### Visual Hierarchy
1. Headline giá trị Pro + giá bill thực tế lớn (thấy đầu tiên, minh bạch).
2. So sánh Free vs Pro + trial 7 ngày (quyết định).
3. CTA Mua gói Năm/Tháng + Restore + links hủy (đáy).

#### Required Features (from FR)
- Giá bill hiển thị to cho monthly/yearly (FR-048); trial 7 ngày + verify StoreKit 2 server-side (FR-049); restore (FR-050); trigger khi hết quota 3 scans/ngày (FR-051).

#### UX Enhancements
- Gói Năm preselect + badge "Tiết kiệm 75%"; giá/mo quy đổi nhỏ dưới giá bill; không dark pattern: nút Đóng rõ, trial/hủy mô tả 1 dòng; skeleton giá khi StoreKit chưa load; purchase loading trên CTA.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: close + restore │ ← [×] Đóng, Restore top
│ ZONE A: headline + bill │ ← giá năm lớn
│ ZONE C: compare table   │ ← Free vs Pro rows
│ ZONE B: plan picker+CTA │ ← bottom fixed
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [×]            [Restore]│
│ CaloAI Pro — scan không │
│ giới hạn                │
│ ┌─────────────────────┐ │
│ │ Năm ● 699K/năm      │ │ ← preselect
│ │ (58K/tháng) 7d trial│ │
│ │ Tháng ○ 199K/tháng  │ │
│ └─────────────────────┘ │
│ ✓ Unlimited scan ✓ Coach│
│ Trial 7d, hủy trong Cài │
│ đặt. Giá đã gồm VAT.    │
│ ┌─────────────────────┐ │
│ │ [Bắt đầu trial 7 ngày]│
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Layout Variants
- Variant B — Hết quota trigger: thêm dòng "Bạn đã dùng 3/3 scans hôm nay" trên headline để nêu lý do.

#### Components
- PlanCard → PaywallCard (§4: selected/unselected). CTA → BtnPrimary (purchase). Links → CancelGuideLink, TermsLink. Badge → TrialBadge.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Giá load xong | Full layout, Năm preselect |
| Loading prices | StoreKit pending | Skeleton 2 plan cards, CTA disabled |
| Trial eligible | Chưa trial | CTA "Bắt đầu trial 7 ngày" |
| Trial used | Đã trial | CTA "Mua ngay", không nhắc trial |
| Purchasing | Đang mua | Spinner trên CTA + disable Đóng |
| Success | Verify server OK | Dismiss + toast Pro + mở tính năng |
| Purchase failed | Hủy/lỗi | Ở lại + lỗi cụ thể (không trừ tiền nếu hủy) |
| Offline | Không mạng | CTA disabled + "Cần mạng để mua" |

#### User Flow
- Entry: onboarding (sau WF-004), hết quota, WF-015/WF-025. Exit: dismiss về WF-005, WF-025 (quản lý gói). Transition: modal sheet, success dismiss + confetti nhẹ.

---

### 3.15 WF-015 Profile/Settings

**Archetype**: Management | **Density**: Medium
**Source UC**: UC-022 | **Source FR**: FR-052, FR-056, FR-003
**User Intent**: "Tôi muốn chỉnh goal, quyền, privacy và xóa tài khoản ở một chỗ."

#### Visual Hierarchy
1. Header tài khoản (avatar/email/gói Pro).
2. Groups: Mục tiêu, Sức khỏe, Thông báo, Privacy, Hỗ trợ.
3. Danger zone Xóa/Export (đáy, tách biệt).

#### Required Features (from FR)
- Sửa goal (FR-003); hướng dẫn hủy sub (FR-052); xóa/export tài khoản (FR-056).

#### UX Enhancements
- Grouped list iOS chuẩn; toggle push/HealthKit mở permission tương ứng; confirm riêng cho xóa.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav             │ ← "Cài đặt"
│ ZONE A: account header  │ ← compact
│ ZONE B: grouped list    │ ← fills scroll
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ Cài đặt                 │
│ [A] user@mail · Pro >   │
│ Mục tiêu 1.850 kcal >   │
│ HealthKit [○] Push [●]  │
│ Hủy gói (hướng dẫn) >   │
│ Xuất dữ liệu · Xóa TK   │
└─────────────────────────┘
```

#### Components
- List → SettingsGroup (toggle/chevron). Header → AccountHeader. Danger → DestructiveButton.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Đã login | Full groups |
| Guest | Chưa login | Banner "Nâng cấp Apple login" |
| Pro | Đang sub | Row gói + link WF-025 |
| Revoked perm | Tắt quyền hệ thống | Toggle off + nút mở Settings |
| Deleting | Xóa TK | Confirm 2 bước + loading |
| Exporting | Xuất CSV | Progress + share sheet |
| Offline | Không mạng | Ẩn restore/xóa remote, báo rõ |

#### User Flow
- Entry: tab Profile. Exit: WF-003 (sửa goal), WF-020/WF-021 (quyền), WF-025 (gói), WF-023 style (xóa).

---

### 3.16 WF-016 Custom food editor

**Archetype**: Action | **Density**: Medium
**Source UC**: UC-008 | **Source FR**: FR-024, FR-025, FR-026
**User Intent**: "Tôi muốn tạo món nhà nấu một lần rồi dùng lại mãi."

#### Visual Hierarchy
1. Tên món + serving (top form).
2. Kcal/100g + P/C/F (fields số).
3. Nguyên liệu recipe (optional) + CTA Lưu.

#### Required Features (from FR)
- Tạo món kcal/100g + serving (FR-024); recipe nhiều nguyên liệu (FR-025); dùng lại 1 chạm ở search (FR-026).

#### UX Enhancements
- Auto-save draft; validate kcal>0; recipe cộng dồn kcal tự động; duplicate từ món có sẵn.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav             │ ← Hủy + Lưu
│ ZONE B: form            │ ← scroll fills
│ ZONE B: recipe list     │ ← add rows
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [Hủy] Món mới      [Lưu]│
│ Tên: Gà kho gừng        │
│ 1 serving = [_]g        │
│ kcal/100g [_] P[_] C[_] │
│ + Thêm nguyên liệu      │
└─────────────────────────┘
```

#### Components
- Fields → NumberField (đơn vị). Recipe → RecipeRow (search + grams). CTA → NavSaveButton.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Nhập mới | CTA disabled tới khi đủ tên+kcal |
| Validating | Số âm/thiếu | Hint đỏ dưới field |
| Recipe mode | Có nguyên liệu | Tổng kcal auto + cho override |
| Editing | Sửa món cũ | Prefill + nút xóa món |
| Draft | Thoát giữa chừng | Lưu draft, mở lại hỏi tiếp tục |
| Offline | Không mạng | Lưu local, sync sau |
| Saved | Lưu xong | Toast + về search/diary |

#### User Flow
- Entry: WF-008 (không KQ), WF-010 (barcode lạ), WF-012. Exit: WF-008/WF-009 (dùng ngay).

---

### 3.17 WF-017 History/Stats

**Archetype**: Management (Secondary: Discovery) | **Density**: Dense
**Source UC**: UC-017 | **Source FR**: FR-041, FR-042, FR-044
**User Intent**: "Tôi muốn xem tuần này ăn có đều không và log lại món cũ nhanh."

#### Visual Hierarchy
1. Range picker Tuần/Tháng + avg kcal (top).
2. Bar chart kcal/ngày (giữa).
3. History list + relog 1 chạm.

#### Required Features (from FR)
- History + filter theo bữa/loại (FR-041); stats tuần/tháng avg + adherence (FR-042); xuất CSV (FR-044, P1).

#### UX Enhancements
- Tap bar xem chi tiết ngày; filter chips; relog swipe; export CSV qua share sheet.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav + range     │ ← segmented
│ ZONE C: chart           │ ← ~180pt
│ ZONE B: history list    │ ← fills
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ Lịch sử [Tuần●][Tháng]  │
│ TB 1.720 kcal · đạt 5/7 │
│ ┌─ bars ──────────────┐ │
│ │ ▂▅▃█▅▂▅            │ │
│ └─────────────────────┘ │
│ 26/09 Phở bò 520 [Log↺] │
└─────────────────────────┘
```

#### Components
- Chart → StatsBarChart. Chips → FilterChips. Row → HistoryRow (relog button). Export → ExportButton.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Có dữ liệu tuần | Chart + list |
| Empty | User mới | Empty state (WF-026) |
| Filtered-empty | Filter không KQ | "Không món nào" + xóa filter |
| Loading | Tổng hợp stats | Skeleton chart |
| Pro-locked | Stats sâu free | Card khóa + CTA paywall |
| Offline | Không mạng | Local history + badge |
| Exporting | Xuất CSV | Progress + share sheet |

#### User Flow
- Entry: WF-012/WF-015. Exit: WF-012 (relog/ngày chi tiết), WF-014 (mở khóa Pro).

---

### 3.18 WF-018 Fasting timer

**Archetype**: Action (Secondary: Management) | **Density**: Medium
**Source UC**: UC-019 | **Source FR**: FR-045, FR-046
**User Intent**: "Tôi muốn bấm giờ nhịn 16:8 và biết khi nào được ăn."

#### Visual Hierarchy
1. Vòng timer + đếm ngược (hero).
2. Preset 12:12/14:10/16:8/18:6 + Start/Stop.
3. Cảnh báo carb khi log trong cửa sổ ăn (liên kết diary).

#### Required Features (from FR)
- Timer 16:8 + nhắc cửa sổ ăn (FR-045); cảnh báo vượt carb khi log bữa (FR-046).

#### UX Enhancements
- Live Activity + thông báo khi hết giờ; pause/stop có confirm; lịch sử fasting tuần.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: timer ring      │ ← hero ~200pt
│ ZONE B: presets + CTA   │ ← segmented + button
│ ZONE C: history         │ ← compact list
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ Nhịn ăn gián đoạn       │
│   (ring) 06:12:33 còn   │
│ [12:12][14:10][16:8●]   │
│ ┌─────────────────────┐ │
│ │ [Kết thúc sớm]      │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Ring → FastingRing (countdown). Presets → SegmentedControl. CTA → BtnPrimary/Destructive.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Đang fasting | Đếm ngược realtime |
| Idle | Chưa bắt đầu | Preset + CTA Bắt đầu |
| Eating window | Tới giờ ăn | Banner + thông báo + CTA kết thúc |
| Done | Hoàn thành | Celebration + lưu lịch sử |
| Stopped | Dừng sớm | Confirm + lưu partial |
| Pro-locked | Free | Xem nhưng timer Pro mới đầy đủ |
| Offline | Không mạng | Timer local bình thường |

#### User Flow
- Entry: WF-005/tab. Exit: WF-012 (log bữa mở cửa sổ ăn), WF-014 (mở khóa).

---

### 3.19 WF-019 Coach chat

**Archetype**: Social | **Density**: Medium
**Source UC**: UC-020 | **Source FR**: FR-047
**User Intent**: "Tôi muốn hỏi coach AI theo đúng lịch sử ăn của mình."

#### Visual Hierarchy
1. Lịch sử bubble (AI + user, chính).
2. Suggestion chips ("Sao chững cân?", "Gợi ý tối nay").
3. Ô nhập + gửi (đáy cố định).

#### Required Features (from FR)
- Coach trả lời dựa trên lịch sử ăn/goal (FR-047); disclaimer không phải tư vấn y tế.

#### UX Enhancements
- Typing indicator; chips theo ngữ cảnh; cite bữa cụ thể ("trưa nay 650 kcal"); giới hạn free 5 msg/ngày.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav + limit     │ ← quota badge Pro
│ ZONE B: bubbles         │ ← scroll fills
│ ZONE B: chips + input   │ ← bottom fixed
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ Coach AI          [Pro] │
│ 🤖 Trưa nay bạn ăn khá  │
│    nhiều tinh bột…      │
│              [Sao vậy?] │
│ [Chững cân?][Tối ăn gì?]│
│ ┌──────────────────┐[↑] │
│ │Nhập câu hỏi…     │    │
│ └──────────────────┘    │
└─────────────────────────┘
```

#### Components
- Bubbles → ChatBubble (AI/user). Chips → SuggestionChips. Input → ChatInput (send 44pt).

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Có hội thoại | Bubbles + chips |
| First Visit | Chưa chat | Greeting + 3 chips gợi ý |
| Typing | AI đang trả lời | Indicator + disable gửi |
| Limit free | Hết 5 msg | Card khóa + CTA Pro |
| Offline | Không mạng | Input disabled + banner |
| Error | AI fail | Bubble lỗi + Thử lại |
| Disclaimer | Luôn hiện | Dòng nhỏ "Không phải tư vấn y tế" |

#### User Flow
- Entry: WF-005/WF-012/WF-017. Exit: WF-014 (hết limit), WF-012 (xem bữa được cite).

---

### 3.20 WF-020 HealthKit permission

**Archetype**: Action | **Density**: Light
**Source UC**: UC-016 | **Source FR**: FR-038, FR-039
**User Intent**: "Tôi muốn hiểu vì sao app cần dữ liệu sức khỏe trước khi bấm Cho phép."

#### Visual Hierarchy
1. Minh họa lợi ích (sync workout/cân/steps).
2. Bullet quyền cụ thể (đọc/ghi gì).
3. CTA Cho phép + Bỏ qua.

#### Required Features (from FR)
- Xin quyền đúng lúc + usage string rõ (FR-038); sync 2 chiều dietary (FR-039).

#### UX Enhancements
- Pre-permission giải thích trước system sheet; Bỏ qua không chặn app; nếu deny thì hướng dẫn bật lại.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: illustration    │ ← top
│ ZONE B: bullets         │ ← middle
│ ZONE B: CTA + Skip      │ ← bottom
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│   [Minh họa HealthKit]  │
│ • Đọc bước chân/workout │
│ • Ghi calo bữa ăn       │
│ ┌─────────────────────┐ │
│ │   [Cho phép]        │ │
│ └─────────────────────┘ │
│ [Để sau]                │
└─────────────────────────┘
```

#### Components
- Art → PermissionArt. Bullets → BenefitList. CTA → BtnPrimary. Skip → BtnText.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Chưa hỏi | Full giải thích + CTA |
| System sheet | Đang hỏi iOS | Chờ kết quả sheet |
| Granted | Đồng ý | Toast + sync lần đầu → WF-005 |
| Denied | Từ chối | Ở lại app + tip bật lại ở Settings |
| Partial | Chỉ cho 1 phần | Badge "Thiếu quyền" ở Profile |
| Offline | Không mạng | Vẫn xin quyền local bình thường |
| Re-ask | Mở lại từ Settings | Nút mở Settings hệ thống |

#### User Flow
- Entry: sau WF-004 / từ WF-015. Exit: WF-005 (hoặc WF-021 push). Không chặn khi skip.

---

### 3.21 WF-021 Push permission

**Archetype**: Action | **Density**: Light
**Source UC**: UC-018 | **Source FR**: FR-053
**User Intent**: "Tôi muốn chọn có nhận nhắc log bữa hay không, không bị ép."

#### Visual Hierarchy
1. Lợi ích nhắc bữa/streak (minh họa nhỏ).
2. Tần suất mẫu (sáng/trưa/tối, tối đa 3/ngày).
3. CTA Bật + Để sau.

#### Required Features (from FR)
- Opt-in rõ, tần suất tối đa 3/ngày theo timezone (FR-053); không upsell agresif.

#### UX Enhancements
- Time picker nhanh sau khi bật; tắt 1 chạm ở Settings; preview nội dung thông báo mẫu.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: art + benefit   │ ← top
│ ZONE B: schedule sample │ ← middle
│ ZONE B: CTA + Skip      │ ← bottom
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│  Đừng quên log bữa nhé  │
│  Sáng 8h · Trưa 12h     │
│ ┌─────────────────────┐ │
│ │ [Bật nhắc nhở]      │ │
│ └─────────────────────┘ │
│ [Để sau]                │
└─────────────────────────┘
```

#### Components
- Art → PermissionArt. Schedule → NotifySample. CTA → BtnPrimary. Skip → BtnText.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Chưa hỏi | Full layout |
| Granted | Đồng ý | Mở time picker + lưu |
| Denied | Từ chối | Không hỏi lại, tip ở Settings |
| Customized | Chọn giờ | Lưu timezone + tần suất |
| Quiet hours | Giờ đêm | Không gửi, tôn trọng hệ thống |
| Offline | Không mạng | Vẫn lưu preference local |
| Re-ask | Từ Settings | Nút mở Settings hệ thống |

#### User Flow
- Entry: sau WF-020 / từ WF-015. Exit: WF-005. Skip an toàn.

---

### 3.22 WF-022 Widget

**Archetype**: Consumption | **Density**: Light
**Source UC**: UC-018 | **Source FR**: FR-054
**User Intent**: "Tôi muốn liếc màn hình chính là biết hôm nay còn bao nhiêu."

#### Visual Hierarchy
1. Số remaining kcal (lớn nhất, đọc 1s).
2. Ring/progress mini + streak.
3. Deep link tap mở app (toàn widget là 1 nút).

#### Required Features (from FR)
- Hiển thị consumed/remaining hôm nay, refresh Timeline (FR-054); tap mở WF-005.

#### UX Enhancements
- 3 size: small (số), medium (số + bữa), large (số + macro); placeholder khi chưa login; lock screen widget P1.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: số remaining    │ ← hero
│ ZONE B: progress/streak │ ← phụ
└─────────────────────────┘
```

#### Layout
```
Small:            Medium:
┌────────┐  ┌──────────────────┐
│ còn 600│  │ còn 600 │(ring) │
│ kcal 🔥5│  │ Sáng ✓ Trưa —   │
└────────┘  └──────────────────┘
```

#### Components
- Widget → CaloWidgetView (small/medium/large). DeepLink → home/diary/scan.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Có dữ liệu | Số + ring thật |
| Empty | Chưa log | "Chưa log — tap để chụp" |
| Locked | Chưa login | Placeholder + tap mở login |
| Stale | Quá hạn timeline | Số mờ + "Mở app để cập nhật" |
| Pro teaser | Free | Đầy đủ số, không khóa |
| Dark/tint | Chế độ hệ thống | Màu semantic theo §7 |
| Error | Sync fail | Giữ số cũ + timestamp |

#### User Flow
- Entry: iOS Home (ngoài app). Exit: tap → WF-005 (deep link bữa/scan).

---

### 3.23 WF-023 Delete confirm modal

**Archetype**: Action | **Density**: Light
**Source UC**: UC-011 | **Source FR**: FR-032
**User Intent**: "Tôi muốn chắc mình không xóa nhầm bữa đã log."

#### Visual Hierarchy
1. Tên món + kcal sẽ xóa (ngữ cảnh).
2. Cảnh báo ảnh hưởng tổng ngày.
3. Nút Xóa (destructive) + Hủy.

#### Required Features (from FR)
- Confirm trước xóa destructive + undo 5s sau xóa (FR-032).

#### UX Enhancements
- Bottom sheet thay vì alert khi có context dài; Hủy là default focus; haptic medium khi xóa.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: context         │ ← tên món + kcal
│ ZONE B: Xóa/Hủy         │ ← 2 buttons
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ Xóa "Phở bò 520 kcal"?  │
│ Tổng ngày giảm còn 730. │
│ ┌─────────────────────┐ │
│ │ [Xóa]      [Hủy]    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Modal → ConfirmSheet (destructive). CTA → BtnDestructive + BtnSecondary.

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Xóa 1 món | Full modal |
| Batch | Xóa nhiều | "Xóa 3 món (1.100 kcal)?" |
| Deleting | Đang xóa | Spinner trên nút Xóa |
| Deleted | Xong | Dismiss + Undo toast |
| Offline | Không mạng | Xóa local + queue sync |
| Protected | Món đang sync | Vẫn xóa local, note sync sau |
| VoiceOver | Đọc modal | "Xác nhận xóa, nút Hủy" |

#### User Flow
- Entry: swipe/delete ở WF-012/WF-013/WF-016. Exit: về màn gọi + toast undo.

---

### 3.24 WF-024 Error/offline states

**Archetype**: Management | **Density**: Light
**Source UC**: UC-009 | **Source FR**: FR-055, FR-009
**User Intent**: "Khi lỗi/mất mạng, tôi vẫn log tay được và biết khi nào sync lại."

#### Visual Hierarchy
1. Banner trạng thái (offline/error) trên mọi màn list.
2. Queue scan chờ gửi (số lượng).
3. Nút Thử lại + gợi ý log tay.

#### Required Features (from FR)
- Offline log tay + xem history local (FR-055); scan AI queue khi có mạng; sync delta (FR-008/FR-009).

#### UX Enhancements
- Banner không chặn nội dung; queue badge ở Home; auto-retry khi online; log lỗi error_occurred cho dashboard.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: status banner   │ ← top, dưới nav
│ ZONE B: queue + retry   │ ← inline card
│ ZONE B: fallback CTA    │ ← log tay
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ ⚠ Offline — dùng số local│ ← banner
│ 2 scans chờ gửi [Gửi lại]│
│ [Log tay thay thế →]    │
└─────────────────────────┘
```

#### Components
- Banner → OfflineBanner/ErrorBanner. Card → SyncQueueCard. CTA → BtnSecondary (log tay).

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Offline | Mất mạng | Banner + full local |
| Queueing | Có scans chờ | Badge số + auto-retry |
| Syncing | Vừa online | Progress "Đang đồng bộ…" |
| Synced | Xong | Toast + ẩn banner |
| AI fail | Scan lỗi | Card lỗi + gợi ý chụp lại/log tay |
| Server error | 5xx/quota | Lỗi cụ thể + retry sau |
| Conflict | Local vs remote | Last-write-wins + giữ bản local note |

#### User Flow
- Entry: bất kỳ màn nào khi rớt mạng/lỗi. Exit: retry thành công → về màn gốc; log tay → WF-011.

---

### 3.25 WF-025 Subscription manage

**Archetype**: Management (Secondary: Action) | **Density**: Medium
**Source UC**: UC-021 | **Source FR**: FR-050, FR-052, FR-049
**User Intent**: "Tôi muốn xem gói đang dùng, gia hạn/hủy ở đâu."

#### Visual Hierarchy
1. Trạng thái gói (Pro/năm, ngày gia hạn).
2. Nút Quản lý/Hủy (mở Apple Subscriptions) + Restore.
3. Lịch sử trial/bill + hỗ trợ.

#### Required Features (from FR)
- Restore purchases (FR-050); hướng dẫn hủy trong Settings (FR-052); hiển thị trial/bill rõ (FR-049).

#### UX Enhancements
- Deep link `apps.apple.com/account/subscriptions`; copy trạng thái verify server; FAQ refund ngắn.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE D: nav             │ ← "Gói đăng ký"
│ ZONE A: status card     │ ← top
│ ZONE B: actions         │ ← manage/restore
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│ [<] Gói đăng ký         │
│ Pro Năm · gia hạn 28/10 │
│ Trial 7d đã dùng        │
│ [Quản lý / Hủy gói]     │
│ [Restore purchases]     │
└─────────────────────────┘
```

#### Components
- Card → SubscriptionCard (status + dates). Buttons → BtnSecondary (manage), BtnText (restore/FAQ).

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Default | Đang Pro | Full + ngày gia hạn |
| Expired | Hết hạn | Badge Free + CTA mua lại → WF-014 |
| Trial | Trong trial | Đếm ngày còn lại + note trừ tiền |
| Restoring | Đang restore | Spinner + disable nút |
| Restored | Xong | Toast + cập nhật trạng thái |
| Cancelled | Đã hủy | Vẫn Pro tới hết chu kỳ + note |
| Offline | Không mạng | Ẩn restore, hiện trạng thái cache |

#### User Flow
- Entry: WF-015/WF-014. Exit: Apple Subscriptions (ngoài app), WF-014 (mua lại).

---

### 3.26 WF-026 Empty states

**Archetype**: Management | **Density**: Light
**Source UC**: UC-009, UC-017 | **Source FR**: FR-027, FR-041, FR-021
**User Intent**: "Khi chưa có dữ liệu, tôi biết phải làm gì tiếp trong 1 chạm."

#### Visual Hierarchy
1. Minh họa nhẹ + câu giải thích 1 dòng.
2. CTA chính theo ngữ cảnh (Chụp/Search/Cân).
3. Link phụ (xem hướng dẫn/bỏ qua).

#### Required Features (from FR)
- Empty cho diary ngày mới (FR-027), history user mới (FR-041), search không KQ (FR-021) — mỗi nơi 1 CTA đúng.

#### UX Enhancements
- Không dùng empty chung chung; CTA mở đúng flow; first-time có coachmark; illustration nhất quán style.

#### Content Zones Map
```
┌─────────────────────────┐
│ ZONE A: art + text      │ ← center
│ ZONE B: CTA             │ ← dưới art
└─────────────────────────┘
```

#### Layout
```
┌─────────────────────────┐
│    (minh họa tô phở)    │
│ Hôm nay chưa log bữa nào│
│ ┌─────────────────────┐ │
│ │ [Chụp bữa đầu]      │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

#### Components
- Art → EmptyArt (diary/history/search/weight variants). CTA → BtnPrimary (contextual).

#### States
| State | Context | Layout/Behavior |
|---|---|---|
| Diary empty | Ngày mới | CTA Chụp bữa đầu → WF-006 |
| History empty | User mới | CTA xem diary + tip log 3 bữa |
| Search empty | Không KQ | CTA tạo custom → WF-016 |
| Weight empty | Chưa cân | CTA log cân → WF-013 |
| Filtered empty | Filter không KQ | Nút xóa filter |
| Offline empty | Không mạng + không cache | Text offline + CTA log tay |
| Pro empty | Stats khóa | CTA mở khóa → WF-014 |

#### User Flow
- Entry: inline trong WF-005/WF-012/WF-013/WF-017/WF-008. Exit: CTA dẫn đúng flow tạo dữ liệu.

---

## 4. Common Components

### 4.1 Navigation
- TabStandard: 4 tabs Home (house), Scan (camera.viewfinder, trung tâm nổi), Diary (book), Profile (person). Badge streak ở Home, badge quota ở Scan. Chi tiết theo `ios-components` skill.
- NavStandard: Back + Title + trailing action (Edit/Save/Settings). Toolbar 44pt, large title chỉ ở Home/Diary.
- SheetFlow: scan → confirm → success dùng sheet/modal full-screen; paywall/permission/delete dùng sheet medium; result sheet barcode dùng bottom sheet.

### 4.2 Core UI Elements
- BtnPrimary: CTA chính 50pt, full-width trừ 32pt padding, disabled mờ khi form invalid (WF-002/WF-007/WF-011/WF-016). BtnSecondary: viền, cho Guest/log tay. BtnDestructive: đỏ, chỉ ở WF-023 + danger zone WF-015. BtnText: link/hủy/bỏ qua.
- MacroRing: vòng tiến trình + số consumed/remaining + 3 mini bars P/C/F; variant hero 220pt (WF-005) và mini header (WF-012). Hỗ trợ VoiceOver đọc "Đã nạp 1.250 trên 1.850 kilocalo".
- FoodRow: thumb 40pt + tên + grams/serving + kcal + trailing quick-add/stepper; swipe leading Sửa, trailing Xóa; dùng ở WF-005/WF-007/WF-008/WF-012/WF-017.
- ConfidenceBadge: 3 mức high (≥80% xanh) / med (60–79% vàng) / low (<60% đỏ) + label %; low bắt review tay ở WF-007.
- ServingStepper/WeightStepper/WaterStepper: stepper ± kèm field số, touch 44pt, đơn vị g/kg/ml/suất Việt.
- PaywallCard: plan card selected/unselected + giá bill lớn + giá/mo quy đổi + TrialBadge; preselect Năm.
- PermissionSheet: art + benefit bullets + CTA + Skip; dùng chung WF-020/WF-021.
- SearchBar/ChipFilter/SegmentedControl/ChatBubble/Chart (Swift Charts)/UndoToast/OfflineBanner: theo `ios-components` skill, không đặc tả inline.

### 4.3 Feedback Components
- Alert hệ thống: chỉ cho destructive/xóa tài khoản và lỗi nghiêm trọng; còn lại dùng inline banner + toast.
- ConfirmSheet (WF-023): destructive có context kcal + Hủy default; toast Undo 5s sau mọi xóa.
- BottomSheet: barcode result, meal picker, date picker; partial → medium, vuốt đóng.
- Toast/Snackbar: lưu thành công, sync xong, restore xong; 2s tự ẩn, có action khi cần (Hoàn tác).
- Skeleton/Shimmer: ring, rows, chart, plan cards — hình khớp layout thật để tránh nhảy layout.

---

## 5. Responsive Design

### 5.1 Device Support
- iPhone SE 375pt (min): quick log 4 nút co 56pt, macro ring 180pt, chart cuộn ngang khi cần.
- iPhone 14/15 390–393pt (chính): mọi số đo trong §3 theo mốc này.
- Pro Max 430pt: meal rows hiện thêm P/C/F inline, chart rộng full.
- iPad 768pt+ (sau MVP): Home/Diary 2 cột (ring + list), search master-detail; không bắt buộc ở bản 1.0.

### 5.2 Orientation
- Portrait là chính cho toàn bộ 26 screens ở MVP.
- Landscape: hỗ trợ xem chart WF-013/WF-017 xoay ngang ở bản sau; camera WF-006/WF-010 giữ portrait ở 1.0.

### 5.3 Adaptive Layout
- SwiftUI Layout (VStack/HStack/LazyVStack) + safeAreaInset cho CTA đáy và Tab bar; tôn trọng safe area notch/Dynamic Island.
- Scroll chỉ ở Zone B/C; Zone D nav và CTA đáy cố định; bàn phím không che CTA (ignoresSafeAreaKeyboard + toolbar Done).
- Dynamic Type (xem §6.2): layout co giãn bằng minHeight thay vì height cứng, trừ shutter 80pt và CTA 50pt giữ tối thiểu.

---

## 6. Accessibility

### 6.1 VoiceOver
- Mọi button có label động từ: macro ring đọc "Đã nạp X trên Y kilocalo, còn Z"; FoodRow đọc "tên, grams, kcal, nút sửa/xóa"; ConfidenceBadge đọc "độ chắc chắn 82 phần trăm".
- Thứ tự đọc: nav → hero số → actions → list; modal WF-023 focus vào tiêu đề + nút Hủy trước.
- Ảnh món trang trí ẩn khỏi rotor; chart có mô tả text thay thế (delta tuần, trung bình).

### 6.2 Dynamic Type
- Text 11–34pt co giãn; ở cỡ XXXL: macro hero xếp dọc, meal row xuống 2 dòng, segmented presets cuộn ngang.
- QA bắt buộc: WF-005/WF-007/WF-012 không vỡ layout và CTA đáy vẫn thấy ở cỡ chữ lớn nhất.

### 6.3 Color Contrast
- Text/biểu đồ đạt WCAG AA 4.5:1; interactive 3:1; hỗ trợ Increase Contrast: confidence low dùng icon + chữ kèm màu, không chỉ màu.
- Ring/chart có pattern/label số, không mã hóa thông tin chỉ bằng màu.

### 6.4 Touch Targets
- Tối thiểu 44x44pt mọi nút; khuyến nghị 48pt; CTA chính 50pt; shutter 80pt; stepper nút 44pt.
- Khoảng cách giữa các target swipe/sửa/xóa tối thiểu 8pt; toast Undo cao 48pt dễ tap.

---

## 7. Dark Mode

- Dùng semantic colors qua tokens (`background/surface/textPrimary`), không hardcode hex sáng/tối.
- Cards/sheets dùng surface elevated + viền hairline thay vì shadow nặng ở dark.
- Viewfinder scan giữ tối tự nhiên; overlay tip/badge đảm bảo contrast trên ảnh tối.
- Chart/ring: gridline và text secondary chuyển sang variant dark; confidence colors giữ hue nhưng giảm saturation để đủ contrast.
- Ảnh minh họa empty/permission có 2 variant light/dark; logo splash có bản sáng trên nền tối.
- QA: chụp snapshot WF-005/WF-007/WF-012/WF-014 ở cả 2 mode trước release.

---

## 8. Design Assets

### 8.1 Icons
- SF Symbols ưu tiên: camera.viewfinder, barcode.viewfinder, magnifyingglass, mic, book, person, flame (streak), drop (nước), figure.walk, scale.3d, bell, chart.bar, clock, bubble.left, heart, plus, trash, checkmark.
- Custom (nếu cần): logo CaloAI, macro ring, tô phở empty art — SVG/PDF vector, 24pt grid, stroke 1.5pt, variant light/dark.

### 8.2 Images
- Ảnh món: nén dưới 1MB trước upload, thumbnail local cho diary/history; @2x/@3x cho art tĩnh; lazy load rows; placeholder shimmer khi tải.
- Empty/permission art: 1 style minh họa phẳng, local asset, có bản dark.

### 8.3 Animations
- Spring 0.3s damping 0.7 cho select/stepper/sheet; fade 0.25s cho splash/quiz step; count-up 0.8s cho goal hero và macro ring; confetti nhẹ khi đạt goal/done fasting.
- Giảm chuyển động khi bật Reduce Motion: tắt confetti/count-up, giữ fade.

### 8.4 SwiftUI Style Files
- Ánh xạ implementation: `.claude/shared/Styles/AppColors.swift` (color roles từ tokens), `AppFonts.swift` (typography scale), `AppSpacing.swift` (8pt rhythm).
- Component dùng lại: MacroRing, FoodRow, ConfidenceBadge, PaywallCard, PermissionSheet, QuickLogRow, UndoToast, OfflineBanner — mỗi component 1 file View + snapshot test cho diary/paywall/confirm.

---

## 9. Figma Integration

- **Design file**: link file Figma CaloAI sẽ được Design cập nhật tại đây (chưa có — Design bổ sung sau) — khi chưa có, ASCII wireframes trong §3 là authoritative.
- **Design Tokens**: export variables Figma → `.claude/shared/DESIGN_TOKEN_caloai.json`, map sang AppColors/AppFonts/AppSpacing trước khi code.
- **Component Library**: dựng components §4 trong Figma (BtnPrimary, MacroRing, FoodRow, ConfidenceBadge, PaywallCard, PermissionSheet) rồi đối chiếu snapshot SwiftUI.
- **Screen Specs**: mỗi WF-XXX có 1 frame Figma tương ứng (WF-005/007/012/014 ưu tiên); dùng `mcp-figma` skill (Framelink) để trích specs khi file sẵn sàng, fallback về §3 khi chưa có.

---

**Document Version**: 1.0
**Last Updated**: 2026-09-28
**Status**: Draft
**Dependencies**: PRD.md, Project_Overview.md







