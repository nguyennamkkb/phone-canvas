# CaloAI - Use Cases

**Document Version**: 1.0
**Last Updated**: 2026-09-28
**Status**: Draft
**Dependencies**: PRD.md (v1.0 / 2026-09-28), Project_Overview.md (v1.0)

## 0. Creative Decomposition Summary

### 0.1 Feature Explosion

| PRD Feature | Sub-Features Discovered | UC Candidates | Daily? | Relates To |
|-------------|------------------------|---------------|--------|------------|
| Onboarding quiz + goal | Quiz 6–8 câu, tính TDEE, macro goal, giải thích goal, bỏ qua/goal mặc định | UC-001, UC-022 | Không | Paywall, Diary |
| Auth Apple/Guest | Sign in Apple, Guest mode, đồng ý privacy, logout | UC-002 | Không | Onboarding, Settings |
| Photo scan log | Chụp/crop, gửi AI, confidence, queue offline | UC-003 | Có | Confirm, Diary |
| Confirm/edit AI | 3 mức khẩu phần, nhập grams, recalc realtime, chặn lưu khi low-conf | UC-004 | Có | Photo, Diary |
| Barcode scan | Quét UPC/EAN, DB nội bộ, fallback Nutritionix, tạo custom khi miss | UC-005 | Có | Custom food, Diary |
| Text/voice log | Parse tiếng Việt có/không dấu, voice STT, ước lượng kcal | UC-006 | Có | Confirm, Diary |
| Search món Việt + quick add | Search <500ms, recent/favorite, serving suất Việt, add 1 chạm | UC-007 | Có | Food detail, Diary |
| Custom food/recipe | Tạo món, recipe nhiều nguyên liệu, kcal/100g, dùng lại | UC-008 | Không | Search, Diary |
| Diary + macro ring | Diary theo bữa, macro ring, remaining/deficit, Health Score | UC-009 | Có | Food detail, History |
| Food detail/edit portion | Xem chi tiết, sửa serving/grams, đổi bữa, relog | UC-010 | Có | Diary, History |
| Delete log | Xóa log, confirm modal, undo ngắn | UC-011 | Có | Diary |
| Relog memory/history | Food Memory, history gợi ý, log lại 1 chạm | UC-012 | Có | Diary, History |
| Water log | Log nước ml/cốc, goal ngày, progress | UC-013 | Có | Diary, Widget |
| Exercise/steps | Log workout tay, đọc steps HealthKit, cộng calo đốt | UC-014 | Có | HealthKit, Diary |
| Weight + trend | Log cân, chart 7/30/90 ngày, delta tuần | UC-015 | Không | HealthKit, Stats |
| HealthKit sync | Xin quyền, sync 2 chiều dietary/weight/workout, background | UC-016 | Không | Weight, Exercise |
| History/stats | Lịch sử tuần/tháng, streak, xuất CSV (P1) | UC-017 | Không | Diary, Weight |
| Streaks/reminders/push/widget | Streak, nhắc bữa ≤3/ngày, widget calo hôm nay | UC-018 | Có | Diary, Settings |
| Fasting timer | Timer 16:8, cửa sổ ăn, cảnh báo carb | UC-019 | Có | Diary |
| AI coach chat | Chat theo lịch sử ăn, gợi ý bữa tiếp | UC-020 | Không | Diary, History |
| Subscribe/restore/cancel | Paywall, trial 7 ngày, verify server, restore, guide hủy | UC-021 | Không | Onboarding, Settings |
| Profile/settings/offline/delete | Goal, privacy, xóa/export, offline queue | UC-022 | Không | Mọi UC |

**Explosion Rule Check:**
- Total PRD features: 12
- Total sub-features discovered: 48 → Pass (≥ 3×12 = 36)
- Total UC candidates: 22
- Passes? Yes

### 0.2 Repetition Audit

| Action | Position 1 (Primary) | Position 2 (Contextual) | Position 3 (Discoverable) | Expression Difference |
|--------|---------------------|------------------------|--------------------------|----------------------|
| Log bữa ăn | WF-006 Camera scan (Full CTA chụp) | WF-008 Food search (Inline add 1 chạm) | WF-012 Diary (nút + mỗi bữa) | Full CTA vs inline row vs nút ngữ cảnh theo bữa |
| Sửa khẩu phần | WF-007 AI result confirm (stepper + grams) | WF-009 Food detail (inline edit serving) | — | Recalc realtime trước lưu vs edit sau lưu |
| Xóa log | WF-012 Diary (swipe xóa) | WF-009 Food detail (nút xóa) | — | Swipe nhanh vs xác nhận đầy đủ trong detail |
| Xem tiến độ ngày | WF-005 Home (macro ring) | WF-022 Widget (compact số) | WF-012 Diary (chi tiết theo bữa) | Ring trực quan vs số gọn vs bảng chi tiết |
| Log cân nặng | WF-013 Weight trend (Full CTA nhập) | WF-005 Home (inline card cân) | — | Nhập + chart đầy đủ vs quick log từ Home |
| Mở Pro/paywall | WF-014 Paywall (Full-Screen Upsell) | WF-015 Profile (Compact Row "Nâng cấp Pro") | WF-006 Camera (hết quota → upsell) | Upsell gián đoạn vs discovery vs reactive khi chạm quota |
| Log nước | WF-012 Diary (stepper cốc) | WF-005 Home (inline card nước) | — | Stepper trong ngữ cảnh bữa vs quick-tap ở Home |

**Audit Rule Check:**
- Actions with only 1 position: Không có — mọi action lặp lại đều có ≥2 vị trí.
- Justification cho single-position: UC-001 (quiz 1 lần), UC-002 (login 1 lần), UC-016 (xin quyền hệ thống 1 lần), UC-021 (paywall là đích duy nhất của billing) — bản chất single-shot, không ép thêm vị trí.

### 0.3 Screen Architecture Canvas

```
App Root
├── System: WF-001 Splash → WF-002 Onboarding quiz → WF-003 Goal result → WF-004 Login
├── Tab Home (Discovery): WF-005 Home/Dashboard, WF-013 Weight trend, WF-017 History/Stats
├── Tab Scan (Action): WF-006 Camera scan, WF-007 AI result confirm, WF-010 Barcode scanner, WF-011 Text/voice log
├── Tab Diary (Management): WF-012 Diary, WF-008 Food search, WF-009 Food detail, WF-016 Custom food editor
├── Tab More (Management): WF-015 Profile/Settings, WF-018 Fasting timer, WF-019 Coach chat, WF-025 Subscription manage
├── Modals & Overlays: WF-023 Delete confirm modal, WF-020 HealthKit permission (sheet), WF-021 Push permission (sheet)
├── System Screens: WF-014 Paywall, WF-024 Error/offline states, WF-026 Empty states
└── OS-level: WF-022 Widget (ngoài app)
```

**Screen Count:** 26 total (12 core P0 + 14 hỗ trợ/modal/system; phủ scale Medium).

### 0.4 Context Storming Highlights

| UC | First-Time User | Returning User | Power User / Edge Case |
|----|----------------|----------------|----------------------|
| UC-001 | Quiz có giải thích từng câu, goal mặc định nếu bỏ qua | Không gặp lại; đổi goal trong Settings | Đổi công thức/đơn vị, reset goal sau khi đổi cân nặng |
| UC-003 | Tip chụp (đủ sáng, top-down), quota free 3/ngày giải thích rõ | Chụp nhanh, bỏ qua tip, nhớ quota còn lại | Queue offline, chụp nhiều món 1 ảnh, retry khi AI fail |
| UC-004 | Mặc định khẩu phần "vừa", hướng dẫn sửa grams | Nhớ serving lần trước của món quen | Sửa nhiều items, split món hỗn hợp, báo AI sai |
| UC-007 | Gợi ý món phổ biến khi chưa có recent | Recent + favorite lên đầu, search không dấu | Lọc theo kcal/protein, thêm favorite hàng loạt |
| UC-009 | Empty state hướng dẫn log bữa đầu | Ring realtime, Health Score, celebration khi đạt goal | Xem lại ngày cũ, pull-to-refresh, VoiceOver đọc remaining |
| UC-016 | Sheet giải thích lợi ích trước khi xin quyền hệ thống | Sync nền im lặng, badge khi lỗi | Thu hồi quyền → degrad gracefully, sync thủ công |
| UC-021 | Paywall sau goal result, trial 7 ngày giải thích rõ | Restore khi đổi máy, upgrade/downgrade | Hủy giữa trial, refund qua Apple, receipt lỗi → retry verify |
| UC-022 | Mặc định hợp lý, privacy consent 1 lần | Đổi goal/ngôn ngữ/đơn vị nhanh | Xóa tài khoản (xác nhận 2 bước), export CSV, dùng offline dài ngày |

**Rule Check:** Mọi UC còn lại (UC-002, 005, 006, 008, 010–015, 017–020) đều có ≥2 context variation trong phần Context Variations ở §2.

---

## 1. Introduction

### 1.1 Purpose
Tài liệu này mô tả cách người dùng tương tác với CaloAI trong tình huống thực tế: 22 use cases bám PRD v1.0, mỗi UC gắn screens (WF-001–WF-026) và task flows, làm đầu vào trực tiếp cho Wireframes.md.

### 1.2 Scope
Bao phủ toàn bộ MVP (P0) và post-MVP (P1/P2) theo PRD §6: onboarding → 5 đường log (photo/barcode/text-voice/search/custom) → diary/macro → water/exercise/weight/HealthKit → paywall/settings. Ngoài scope: meal-delivery, social feed, family plan (theo PRD §6).

### 1.3 Document Conventions
- **UC-XXX**: Use Case (UC-001 đến UC-022, cố định, không thêm/bớt)
- **AF-XXX.Y**: Alternative Flow của UC-XXX
- **AC-XXX.Y**: Acceptance Criterion, viết đo được (ngưỡng số/thời gian/trạng thái)
- **WF-XXX**: Wireframe Screen (WF-001 đến WF-026, cố định)
- **TF-XXX**: Task Flow (TF-001 đến TF-007)

---

## 2. User Stories by Feature Group

### 2.1 Onboarding, Tài khoản & Mục tiêu

#### UC-001: Onboarding quiz + goal engine
**As a** người mới muốn giảm/tăng cân  
**I want** trả lời 6–8 câu hỏi để nhận mục tiêu calo/macro phù hợp  
**So that** tôi biết mỗi ngày được ăn bao nhiêu mà không cần tự tính.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- App mới cài hoặc user chưa có goal; SwiftData trống.

**Main Flow**:
1. User mở app → hệ thống hiển thị quiz 6–8 câu (tuổi, giới, chiều cao, cân nặng, mục tiêu, mức vận động, tốc độ mong muốn).
2. User trả lời từng câu (có nút Bỏ qua).
3. Hệ thống tính TDEE (Mifflin-St Jeor) và calorie/macro goal, hiển thị màn kết quả kèm giải thích.
4. User xác nhận goal → chuyển sang đăng nhập.

**Alternative Flows**:
- **[AF-001.1]**: User bỏ qua quiz → hệ thống gán goal mặc định (deficit nhẹ theo giới) và cho sửa sau trong Settings.
- **[AF-001.2]**: Số liệu nhập vô lý (cao <100cm, cân <30kg) → báo lỗi inline và chặn nút Tiếp tục đến khi sửa.

**Postconditions**:
- Goal (calo + protein/carb/fat + TDEE) được lưu local; event goal_computed được log.

**Acceptance Criteria**:
- **[AC-001.1]**: WHEN user hoàn thành câu cuối THEN hệ thống hiển thị goal trong vòng 1s.
- **[AC-001.2]**: WHEN quiz hoàn tất THEN TDEE lệch không quá 10% so với tính tay bằng Mifflin-St Jeor trên cùng input.
- **[AC-001.3]**: WHEN user chọn Bỏ qua ở bất kỳ bước nào THEN goal mặc định được gán và user vẫn vào được màn tiếp theo.
- **[AC-001.4]**: WHEN nhập số liệu ngoài khoảng sinh lý (cân 20–300kg, cao 100–230cm) THEN hiển thị lỗi trong 0.5s và chặn nút Tiếp tục.

**Screens Involved**: WF-001, WF-002, WF-003, WF-004  
**Primary Screen**: WF-002 — **Entry Point**: WF-001 Splash (user mới) — **Exit Point**: WF-004 Login

**Context Variations**:
- **First-time user**: Giải thích 1 dòng mỗi câu hỏi; thanh tiến trình; nút Bỏ qua luôn hiển thị.
- **Returning user**: Không gặp lại quiz; đổi goal trong WF-015.
- **Power user / Edge case**: Nhập đơn vị lb/inch được convert; reset goal khi cân nặng đổi >5%.

---

#### UC-002: Đăng nhập Apple / Guest
**As a** người mới sau quiz  
**I want** đăng nhập nhanh bằng Apple hoặc dùng thử dạng Guest  
**So that** dữ liệu của tôi được lưu và đồng bộ mà không mất thời gian tạo tài khoản.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- UC-001 hoàn tất (có goal, kể cả mặc định).

**Main Flow**:
1. Hệ thống hiển thị màn login: nút Sign in with Apple + nút Dùng thử (Guest) + link privacy.
2. User chọn Apple → xác thực hệ thống → tạo Supabase session.
3. Hệ thống chuyển vào Home; Guest bị giới hạn (không sync cloud, nhắc nâng cấp khi log bữa thứ 5).

**Alternative Flows**:
- **[AF-002.1]**: User hủy dialog Apple → ở lại màn login, giữ goal local, không mất dữ liệu đã nhập.
- **[AF-002.2]**: Lỗi mạng khi tạo session → báo lỗi, cho dùng tiếp offline (Guest tạm), tự retry khi online.

**Postconditions**:
- Session được lưu Keychain; user vào Home; Guest gắn cờ guest=true.

**Acceptance Criteria**:
- **[AC-002.1]**: WHEN user hoàn tất Sign in with Apple THEN Home hiển thị trong vòng 3s và session tồn tại sau kill app.
- **[AC-002.2]**: WHEN user chọn Guest THEN vào Home trong 1s mà không cần mạng.
- **[AC-002.3]**: WHEN Guest log đến bữa thứ 5 THEN hiển thị đúng 1 lần nhắc đăng nhập Apple (không chặn log).
- **[AC-002.4]**: WHEN hủy dialog Apple THEN user ở lại màn login và không mất goal đã tính.

**Screens Involved**: WF-003, WF-004, WF-005, WF-024  
**Primary Screen**: WF-004 — **Entry Point**: WF-003 Goal result — **Exit Point**: WF-005 Home

**Context Variations**:
- **First-time user**: Giải thích vì sao cần đăng nhập (đồng bộ, không mất log).
- **Returning user**: Auto-login bằng session Keychain, bỏ qua màn này.
- **Power user / Edge case**: Logout trong Settings → về màn này, dữ liệu local giữ nguyên đến khi xóa.

---

### 2.2 Log bữa ăn bằng AI & thủ công

#### UC-003: Chụp ảnh món ăn (photo scan)
**As a** người đang ăn  
**I want** chụp ảnh món ăn để biết calo trong vài giây  
**So that** tôi log bữa dưới 10 giây thay vì nhập tay 15 phút.

**Priority**: P0 — **Complexity**: High

**Preconditions**:
- User đã login (Apple/Guest); còn quota free (3 scans/ngày) hoặc Pro; có mạng (nếu offline → AF-003.2).

**Main Flow**:
1. User mở camera từ tab Scan hoặc nút + ở Home/Diary.
2. User chụp (hoặc chọn ảnh thư viện) → crop nhanh → gửi AI.
3. Hệ thống hiển thị loading + trả items (tên, grams, kcal, P/C/F) + confidence trong <5s trên 4G.
4. Hệ thống chuyển sang màn xác nhận (UC-004).

**Alternative Flows**:
- **[AF-003.1]**: Ảnh không phải đồ ăn (Vision pre-filter) → báo "Không thấy món ăn", cho chụp lại, không trừ quota.
- **[AF-003.2]**: Mất mạng → ảnh vào queue offline, báo "Sẽ phân tích khi có mạng", BackgroundTask tự xử lý.
- **[AF-003.3]**: Hết quota free → chặn scan, mở paywall kèm thông điệp quota, giữ ảnh để scan tiếp sau khi lên Pro.
- **[AF-003.4]**: AI timeout >15s → báo lỗi, cho retry giữ nguyên ảnh, không trừ quota lần fail.

**Postconditions**:
- Kết quả AI (chưa lưu) sẵn sàng cho UC-004; event scan_completed được log kèm confidence.

**Acceptance Criteria**:
- **[AC-003.1]**: WHEN ảnh hợp lệ trên mạng 4G THEN kết quả hiển thị trong 5s ở phân vị p95.
- **[AC-003.2]**: WHEN ảnh không chứa đồ ăn THEN hệ thống báo trong 2s và không trừ quota.
- **[AC-003.3]**: WHEN mất mạng lúc chụp THEN ảnh được queue trong 1s và tự phân tích khi online trở lại.
- **[AC-003.4]**: WHEN user free đã dùng 3 scans/ngày THEN lần scan thứ 4 mở paywall thay vì camera.
- **[AC-003.5]**: WHEN AI timeout quá 15s THEN hiển thị retry và quota không bị trừ.

**Screens Involved**: WF-005, WF-006, WF-007, WF-014, WF-024  
**Primary Screen**: WF-006 — **Entry Point**: Tab Scan / nút + ở Home/Diary — **Exit Point**: WF-007 AI result confirm

**Context Variations**:
- **First-time user**: Tip chụp (đủ sáng, top-down) + giải thích quota 3/ngày.
- **Returning user**: Mở camera thẳng, nhớ camera trước/sau lần trước.
- **Power user / Edge case**: Ảnh trùng (image-hash) trả cache <1s; chụp nhiều món 1 ảnh; retry giữ ảnh.

---

#### UC-004: Xác nhận / sửa kết quả AI
**As a** người vừa scan  
**I want** sửa khẩu phần trước khi lưu  
**So that** số liệu đúng với suất tôi ăn (AI không đo gram tuyệt đối).

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- UC-003 (hoặc UC-006) đã trả kết quả AI kèm confidence.

**Main Flow**:
1. Hệ thống hiển thị items + grams + kcal/P/C/F + confidence + cảnh báo nếu confidence <60%.
2. User chọn khẩu phần ít/vừa/nhiều hoặc nhập grams tay; kcal/macro recalc realtime.
3. User chọn bữa (sáng/trưa/tối/snack) → nhấn Lưu → log vào diary, macro ring cập nhật.

**Alternative Flows**:
- **[AF-004.1]**: Confidence <60% → bắt xác nhận từng item thủ công, nút Lưu disabled đến khi user chạm đủ items.
- **[AF-004.2]**: User báo "AI sai món" → chuyển sang search (WF-008) giữ nguyên ảnh để log tay.
- **[AF-004.3]**: User hủy → kết quả bị bỏ, diary không đổi.

**Postconditions**:
- MealLog được lưu SwiftData (+ queue sync); event log_saved được log; macro ring cập nhật.

**Acceptance Criteria**:
- **[AC-004.1]**: WHEN user đổi grams THEN kcal/macro recalc và hiển thị lại trong 200ms.
- **[AC-004.2]**: WHEN confidence <60% THEN nút Lưu disabled cho đến khi user xác nhận đủ 100% items.
- **[AC-004.3]**: WHEN user nhấn Lưu ở confidence ≥60% mà chưa sửa gì THEN log được lưu với serving mặc định "vừa".
- **[AC-004.4]**: WHEN user nhấn Hủy THEN không có MealLog mới nào được tạo và quay về màn trước.

**Screens Involved**: WF-007, WF-008, WF-012, WF-005  
**Primary Screen**: WF-007 — **Entry Point**: WF-006 Camera / WF-011 Text-voice — **Exit Point**: WF-012 Diary (hoặc WF-005 Home)

**Context Variations**:
- **First-time user**: Serving mặc định "vừa" + tooltip sửa grams.
- **Returning user**: Nhớ serving lần trước của món quen và gợi ý sẵn.
- **Power user / Edge case**: Sửa nhiều items cùng lúc; tách món hỗn hợp thành 2 items; undo trong 5s sau lưu.

---

#### UC-005: Quét barcode
**As a** người mua đồ đóng gói  
**I want** quét mã vạch để log nhanh  
**So that** tôi không phải nhập tay thông tin sữa, bánh, mì gói.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- User đã login; camera được cấp quyền.

**Main Flow**:
1. User mở barcode scanner → quét UPC/EAN.
2. Hệ thống tra DB nội bộ → fallback Nutritionix/DB → hiển thị kết quả + serving.
3. User xác nhận serving → lưu vào diary.

**Alternative Flows**:
- **[AF-005.1]**: Không tìm thấy mã → gợi ý tạo custom food (UC-008) giữ sẵn tên/mã vừa quét.
- **[AF-005.2]**: Từ chối quyền camera → hướng dẫn mở Settings iOS, cho chuyển sang nhập tay mã số.

**Postconditions**:
- MealLog từ barcode được lưu; mã mới được cache local.

**Acceptance Criteria**:
- **[AC-005.1]**: WHEN mã có trong DB THEN kết quả hiển thị trong 2s sau khi quét.
- **[AC-005.2]**: WHEN mã không có ở cả 2 nguồn THEN gợi ý tạo custom food trong 1s.
- **[AC-005.3]**: WHEN user từ chối quyền camera THEN màn hình hiển thị hướng dẫn mở Settings và nút nhập mã tay.
- **[AC-005.4]**: WHEN user đổi serving THEN kcal recalc trong 200ms.

**Screens Involved**: WF-010, WF-012, WF-016  
**Primary Screen**: WF-010 — **Entry Point**: Tab Scan / nút + — **Exit Point**: WF-012 Diary

**Context Variations**:
- **First-time user**: Khung ngắm + hướng dẫn giữ mã trong khung.
- **Returning user**: Nhớ serving lần trước của mã quen.
- **Power user / Edge case**: Nhập mã tay khi camera hỏng; quét liên tiếp nhiều sản phẩm.

---

#### UC-006: Log bằng text / giọng nói
**As a** người bận  
**I want** gõ hoặc nói "2 trứng + 1 chén cơm" để log  
**So that** tôi log được khi không tiện chụp ảnh.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- User đã login; voice cần quyền microphone.

**Main Flow**:
1. User gõ text (hoặc nói → STT) mô tả món + lượng.
2. Hệ thống parse món + lượng, ước lượng kcal/P/C/F (hỗ trợ tiếng Việt có dấu/không dấu).
3. Hệ thống chuyển sang màn xác nhận (như UC-004) → user sửa → lưu.

**Alternative Flows**:
- **[AF-006.1]**: Parse không hiểu món lạ → hỏi lại khoanh vùng món chưa rõ, giữ phần đã parse đúng.
- **[AF-006.2]**: Bị từ chối quyền mic → tự chuyển sang text input, giữ nguyên màn hình.

**Postconditions**:
- Kết quả parse sẵn sàng xác nhận; sau lưu giống UC-004.

**Acceptance Criteria**:
- **[AC-006.1]**: WHEN nhập "1 chen com + 2 trung" (không dấu) THEN parse đúng món + lượng trên ≥90% của 50 câu mẫu kiểm thử.
- **[AC-006.2]**: WHEN parse xong THEN màn xác nhận hiển thị trong 3s.
- **[AC-006.3]**: WHEN parse thất bại 1 phần THEN hệ thống giữ phần đúng và hỏi lại phần sai thay vì xóa hết.
- **[AC-006.4]**: WHEN ước lượng sau xác nhận THEN sai số kcal nằm trong ±20% so với DB chuẩn trên bộ test món Việt.

**Screens Involved**: WF-011, WF-007, WF-012  
**Primary Screen**: WF-011 — **Entry Point**: Tab Scan / nút + — **Exit Point**: WF-007 (xác nhận) → WF-012

**Context Variations**:
- **First-time user**: Placeholder ví dụ "Thử: 1 tô phở bò".
- **Returning user**: Gợi ý câu gần đây để dùng lại 1 chạm.
- **Power user / Edge case**: Gõ nhiều món 1 dòng; sửa text parse sai inline.

---

#### UC-007: Tìm món Việt + quick add
**As a** người Việt  
**I want** tìm "phở bò" ra ngay suất chuẩn  
**So that** tôi log món quen trong 3 chạm.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- User đã login; DB seed 500–800 món đã tải local.

**Main Flow**:
1. User mở search → gõ từ khóa (có/không dấu) → kết quả kèm kcal/suất + P/C/F.
2. User chạm món → xem detail (WF-009) hoặc quick add (+) thẳng vào bữa hiện tại.
3. Hệ thống lưu log, cập nhật macro ring.

**Alternative Flows**:
- **[AF-007.1]**: Không có kết quả → gợi ý 3 món gần nhất + nút tạo custom food.
- **[AF-007.2]**: Mất mạng → search local vẫn hoạt động đầy đủ (DB đã cache).

**Postconditions**:
- MealLog được lưu; món vừa log vào recent.

**Acceptance Criteria**:
- **[AC-007.1]**: WHEN gõ từ khóa THEN kết quả đầu tiên hiển thị trong 500ms trên iPhone 12.
- **[AC-007.2]**: WHEN gõ "pho bo" (không dấu) THEN "Phở bò" nằm trong top 3 kết quả.
- **[AC-007.3]**: WHEN search 0 kết quả THEN hiển thị gợi ý + nút tạo custom trong 1s.
- **[AC-007.4]**: WHEN quick add THEN log được lưu trong 1s mà không qua màn detail.

**Screens Involved**: WF-008, WF-009, WF-012, WF-016  
**Primary Screen**: WF-008 — **Entry Point**: Nút + / tab Diary — **Exit Point**: WF-012 Diary

**Context Variations**:
- **First-time user**: Tab "Phổ biến" khi chưa có recent.
- **Returning user**: Recent + favorite lên đầu; search nhớ bữa hiện tại.
- **Power user / Edge case**: Lọc theo kcal/protein; ghim favorite; tìm theo nguyên liệu ("ức gà").

---

#### UC-008: Tạo món custom / recipe
**As a** người nấu ăn ở nhà  
**I want** tạo món riêng và công thức nhiều nguyên liệu  
**So that** tôi log lại món nhà nấu trong 1 chạm những lần sau.

**Priority**: P1 — **Complexity**: Medium

**Preconditions**:
- User đã login; vào từ search miss, barcode miss hoặc nút + trong Diary.

**Main Flow**:
1. User nhập tên món + kcal/100g (hoặc kcal/suất) + serving mặc định.
2. Nếu là recipe: thêm ≥2 nguyên liệu từ search/DB, hệ thống cộng kcal/P/C/F.
3. User lưu → món xuất hiện trong search + favorite, dùng lại 1 chạm.

**Alternative Flows**:
- **[AF-008.1]**: Thiếu kcal → cho lưu dạng "ước lượng" gắn cờ unverified, hiển thị khoảng thay vì số tuyệt đối.
- **[AF-008.2]**: Trùng tên món có sẵn → cảnh báo trùng, cho đổi tên hoặc lưu đè bản custom.

**Postconditions**:
- CustomFood/Recipe được lưu local + sync; xuất hiện trong search.

**Acceptance Criteria**:
- **[AC-008.1]**: WHEN lưu món đủ tên + kcal THEN món xuất hiện trong search trong 1s.
- **[AC-008.2]**: WHEN recipe có ≥2 nguyên liệu THEN tổng kcal bằng tổng thành phần với sai số làm tròn ≤1 kcal.
- **[AC-008.3]**: WHEN lưu thiếu kcal THEN món gắn cờ unverified và hiển thị dạng khoảng.
- **[AC-008.4]**: WHEN nhập tên trùng món DB THEN hiển thị cảnh báo trùng trước khi lưu.

**Screens Involved**: WF-016, WF-008, WF-012  
**Primary Screen**: WF-016 — **Entry Point**: Search miss / barcode miss / nút + — **Exit Point**: WF-008 Search (món mới dùng được ngay)

**Context Variations**:
- **First-time user**: Form rút gọn (tên + kcal + serving), recipe để sau.
- **Returning user**: Nhân bản món custom cũ để sửa nhanh.
- **Power user / Edge case**: Recipe 10+ nguyên liệu; sửa custom sau khi DB cập nhật; xóa custom không ảnh hưởng log cũ.

---

### 2.3 Nhật ký, macro & quản lý bữa

#### UC-009: Xem diary + vòng macro
**As a** người dùng hằng ngày  
**I want** thấy cả ngày đã ăn bao nhiêu và còn lại bao nhiêu  
**So that** tôi quyết định bữa tiếp theo ăn gì.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- User đã có goal (UC-001); có thể chưa có log nào (empty state).

**Main Flow**:
1. User mở Home/Diary → hệ thống hiển thị macro ring (consumed/remaining/deficit) + Health Score + log theo bữa sáng/trưa/tối/snack.
2. User chuyển ngày (hôm qua/hôm nay) → số liệu recalc theo log ngày đó.
3. Đạt goal ngày → celebration + cập nhật streak.

**Alternative Flows**:
- **[AF-009.1]**: Chưa có log nào → empty state + CTA "Log bữa đầu" (WF-026).
- **[AF-009.2]**: Ăn vượt goal → ring đỏ + thông báo deficit âm, không chặn log thêm.

**Postconditions**:
- User nắm remaining; event xem diary phục vụ engagement tracking.

**Acceptance Criteria**:
- **[AC-009.1]**: WHEN mở Home có cache THEN macro ring render trong 1s.
- **[AC-009.2]**: WHEN chuyển ngày THEN số liệu ngày đó hiển thị trong 1s.
- **[AC-009.3]**: WHEN chưa có log THEN empty state hiển thị CTA log bữa đầu thay vì ring trống.
- **[AC-009.4]**: WHEN consumed vượt goal THEN remaining hiển thị số âm màu cảnh báo trong 0.5s.
- **[AC-009.5]**: WHEN VoiceOver bật THEN remaining + macro được đọc thành câu hoàn chỉnh.

**Screens Involved**: WF-005, WF-012, WF-026  
**Primary Screen**: WF-005 (tổng quan) / WF-012 (chi tiết bữa) — **Entry Point**: Tab bar sau login — **Exit Point**: WF-006/008/009/011 (log tiếp) hoặc WF-013/017 (tiến độ)

**Context Variations**:
- **First-time user**: Empty state hướng dẫn log bữa đầu; giải thích Health Score.
- **Returning user**: Ring realtime sau mỗi lần lưu; celebration khi đạt goal.
- **Power user / Edge case**: Xem ngày cũ bất kỳ; pull-to-refresh; Dynamic Type lớn không vỡ layout.

---

#### UC-010: Xem / sửa chi tiết món (food detail, portion)
**As a** người đã log  
**I want** sửa serving, đổi bữa, xem chi tiết dinh dưỡng món  
**So that** log sai vẫn sửa được mà không cần xóa làm lại.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- Đã có ít nhất 1 MealLog trong diary/history.

**Main Flow**:
1. User chạm món trong diary → màn detail hiển thị kcal/P/C/F + serving + bữa + ảnh (nếu có).
2. User sửa grams/serving hoặc chuyển bữa → kcal recalc realtime → Lưu.
3. Diary + macro ring cập nhật.

**Alternative Flows**:
- **[AF-010.1]**: Món từ AI low-conf cũ → cho thay bằng món DB (re-link) giữ nguyên grams.
- **[AF-010.2]**: Món thuộc ngày cũ → cho sửa nhưng gắn cờ "đã sửa sau 24h" cho analytics accuracy.

**Postconditions**:
- MealLog cập nhật (updated_at mới); sync queue có bản mới.

**Acceptance Criteria**:
- **[AC-010.1]**: WHEN đổi grams THEN kcal recalc trong 200ms.
- **[AC-010.2]**: WHEN chuyển bữa THEN món biến mất khỏi bữa cũ và xuất hiện ở bữa mới trong 1s.
- **[AC-010.3]**: WHEN sửa log ngày cũ THEN cờ edited_late được gắn và sync lên server.
- **[AC-010.4]**: WHEN re-link món AI sang DB THEN grams giữ nguyên và kcal tính lại theo DB.

**Screens Involved**: WF-009, WF-012, WF-008  
**Primary Screen**: WF-009 — **Entry Point**: Chạm món trong WF-012/WF-017 — **Exit Point**: WF-012 Diary

**Context Variations**:
- **First-time user**: Nút sửa to, ít field.
- **Returning user**: Vuốt stepper nhanh; copy món sang ngày khác.
- **Power user / Edge case**: Sửa hàng loạt nhiều món; xem nguồn kcal (DB/AI/custom).

---

#### UC-011: Xóa log
**As a** người log nhầm  
**I want** xóa bữa đã log  
**So that** số liệu ngày đúng trở lại.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- Đã có MealLog; user là chủ log.

**Main Flow**:
1. User vuốt xóa trong diary (hoặc nút Xóa trong detail) → modal xác nhận (WF-023).
2. User xác nhận → log bị xóa, macro ring cập nhật, toast + Undo 5s.

**Alternative Flows**:
- **[AF-011.1]**: User chọn Undo trong 5s → log khôi phục nguyên trạng.
- **[AF-011.2]**: Xóa khi offline → xóa local ngay, queue sync delete khi online.

**Postconditions**:
- MealLog bị xóa (soft-delete sync); ring cập nhật.

**Acceptance Criteria**:
- **[AC-011.1]**: WHEN xác nhận xóa THEN log biến mất và ring cập nhật trong 0.5s.
- **[AC-011.2]**: WHEN nhấn Undo trong 5s THEN log khôi phục đủ grams/bữa/ảnh.
- **[AC-011.3]**: WHEN hủy modal THEN không có gì thay đổi.
- **[AC-011.4]**: WHEN xóa offline THEN thao tác xong trong 0.5s local và sync khi online.

**Screens Involved**: WF-012, WF-009, WF-023  
**Primary Screen**: WF-012 — **Entry Point**: Swipe trong diary / nút Xóa ở detail — **Exit Point**: WF-012 Diary

**Context Variations**:
- **First-time user**: Modal giải thích xóa ảnh hưởng ring.
- **Returning user**: Swipe nhanh + Undo.
- **Power user / Edge case**: Xóa nhiều món 1 lúc (edit mode); khôi phục sau 5s thì phải log lại tay.

---

#### UC-012: Log lại từ memory / history (relog)
**As a** người hay ăn món quen  
**I want** log lại món đã ăn trước đây trong 1 chạm  
**So that** tôi không phải scan/search lại mỗi ngày.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- User có history ≥1 log (hoặc Food Memory từ Pro).

**Main Flow**:
1. User mở recent/history trong search hoặc diary → chạm relog (↻) ở món/ngày cũ.
2. Hệ thống copy log sang bữa hiện tại (giữ grams, cho sửa nhanh) → lưu.

**Alternative Flows**:
- **[AF-012.1]**: Món gốc đã bị xóa khỏi DB → dùng snapshot kcal lúc log, gắn cờ "giá trị cũ".
- **[AF-012.2]**: Relog cả ngày cũ → copy toàn bộ meals sang hôm nay, báo tổng món đã copy.

**Postconditions**:
- MealLog mới được tạo (không overwrite bản cũ).

**Acceptance Criteria**:
- **[AC-012.1]**: WHEN relog 1 món THEN log mới xuất hiện trong diary trong 1s.
- **[AC-012.2]**: WHEN relog món có snapshot cũ THEN cờ giá trị cũ hiển thị rõ.
- **[AC-012.3]**: WHEN relog cả ngày THEN đúng 100% số món được copy và báo tổng cho user.
- **[AC-012.4]**: WHEN free user THEN relog cơ bản (recent 7 ngày) hoạt động không cần Pro.

**Screens Involved**: WF-012, WF-008, WF-017  
**Primary Screen**: WF-012 — **Entry Point**: Recent/history/diary — **Exit Point**: WF-012 Diary

**Context Variations**:
- **First-time user**: Gợi ý relog sau khi log món đầu 2 ngày liên tiếp.
- **Returning user**: Recent 7 ngày + "Ăn lại hôm qua" 1 chạm.
- **Power user / Edge case**: Relog cả tuần mẫu; Pro có Food Memory gợi ý theo giờ ăn.

---

### 2.4 Nước, vận động, cân nặng & HealthKit

#### UC-013: Log nước
**As a** người theo dõi hydrat hóa  
**I want** log lượng nước uống hằng ngày  
**So that** tôi biết mình đã đủ 2 lít chưa.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- User đã login; goal nước mặc định 2000ml (sửa được trong Settings).

**Main Flow**:
1. User chạm +1 cốc (250ml) ở card nước (Home) hoặc stepper trong Diary.
2. Hệ thống cộng dồn, cập nhật progress; đủ goal → tick hoàn thành.

**Alternative Flows**:
- **[AF-013.1]**: User nhập ml tay (chai 500ml) → cộng đúng số nhập.
- **[AF-013.2]**: Qua ngày mới → reset về 0, lưu history hôm qua.

**Postconditions**:
- WaterLog ngày hiện tại cập nhật; widget (nếu có) refresh.

**Acceptance Criteria**:
- **[AC-013.1]**: WHEN chạm +1 cốc THEN tổng cập nhật trong 200ms.
- **[AC-013.2]**: WHEN nhập ml tay ngoài khoảng 0–5000ml THEN báo lỗi và không cộng.
- **[AC-013.3]**: WHEN đủ goal THEN tick hoàn thành hiển thị trong 0.5s.
- **[AC-013.4]**: WHEN sang ngày mới THEN water reset 0 và hôm qua còn xem được trong history.

**Screens Involved**: WF-005, WF-012, WF-022  
**Primary Screen**: WF-005 (card nước) — **Entry Point**: Home/Diary — **Exit Point**: Home/Diary (ở lại màn)

**Context Variations**:
- **First-time user**: Giải thích goal 2000ml mặc định.
- **Returning user**: Nhớ cỡ cốc lần trước (250/350/500ml).
- **Power user / Edge case**: Undo 1 chạm khi cộng nhầm; đổi goal nước trong Settings.

---

#### UC-014: Log vận động / bước chân
**As a** người tập luyện  
**I want** ghi workout và thấy bước chân mỗi ngày  
**So that** calo đốt được cộng vào ngân sách ăn.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- User đã login; steps cần quyền HealthKit (hoặc nhập tay nếu từ chối).

**Main Flow**:
1. User nhập workout tay (loại + phút) → hệ thống ước tính calo đốt; hoặc steps tự đọc từ HealthKit.
2. Hệ thống cộng calo đốt vào remaining, hiển thị trong diary/Home.

**Alternative Flows**:
- **[AF-014.1]**: Từ chối HealthKit → nhập steps tay, vẫn cộng calo theo công thức.
- **[AF-014.2]**: Workout trùng từ HealthKit sync → dedupe theo thời gian, không cộng đôi.

**Postconditions**:
- ExerciseLog lưu; remaining ngày tăng tương ứng.

**Acceptance Criteria**:
- **[AC-014.1]**: WHEN nhập workout 30 phút chạy 70kg THEN calo đốt nằm trong ±15% bảng MET chuẩn.
- **[AC-014.2]**: WHEN steps HealthKit về THEN diary cập nhật trong 5 phút (background delivery).
- **[AC-014.3]**: WHEN workout trùng (cùng khung giờ ±5 phút) THEN chỉ tính 1 lần, không cộng đôi.
- **[AC-014.4]**: WHEN từ chối HealthKit THEN nhập tay vẫn cộng calo bình thường.

**Screens Involved**: WF-005, WF-012, WF-020  
**Primary Screen**: WF-012 (section vận động) — **Entry Point**: Diary/Home — **Exit Point**: Diary/Home

**Context Variations**:
- **First-time user**: Gợi ý bật HealthKit để tự đếm bước.
- **Returning user**: Workout templates (chạy 30', gym 60') 1 chạm.
- **Power user / Edge case**: Sửa/xóa workout; xem nguồn (tay/HealthKit); tắt cộng calo đốt trong Settings.

---

#### UC-015: Log cân nặng + xem trend
**As a** người giảm cân  
**I want** log cân và thấy trend tuần  
**So that** tôi biết mình có đang đi đúng hướng không.

**Priority**: P0 — **Complexity**: Low

**Preconditions**:
- User đã login; có cân (nhập tay hoặc từ HealthKit).

**Main Flow**:
1. User nhập cân (kg) → lưu <10s → chart 7/30/90 ngày cập nhật + delta tuần.
2. Cân mới về qua HealthKit → tự thêm điểm vào chart.

**Alternative Flows**:
- **[AF-015.1]**: Nhập lệch >5% so với lần trước → cảnh báo xác nhận ("Bạn có nhập nhầm?").
- **[AF-015.2]**: Chưa đủ 2 điểm → chart hiển thị điểm đơn + gợi ý cân đều.

**Postconditions**:
- WeightHistory thêm điểm; goal calo có thể gợi ý chỉnh khi cân đổi >5%.

**Acceptance Criteria**:
- **[AC-015.1]**: WHEN nhập cân THEN chart cập nhật trong 1s.
- **[AC-015.2]**: WHEN cân lệch >5% lần trước THEN cảnh báo xác nhận hiện trước khi lưu.
- **[AC-015.3]**: WHEN chuyển tab 7/30/90 ngày THEN chart render lại trong 1s.
- **[AC-015.4]**: WHEN cân từ HealthKit về THEN tự thêm điểm trong 5 phút mà không cần mở app.

**Screens Involved**: WF-013, WF-005, WF-020  
**Primary Screen**: WF-013 — **Entry Point**: Card cân ở Home / tab tiến độ — **Exit Point**: WF-013 (xem trend) hoặc WF-017

**Context Variations**:
- **First-time user**: Giải thích cân buổi sáng chính xác nhất; goal cân mục tiêu.
- **Returning user**: Nhắc cân hằng tuần nếu 7 ngày chưa log.
- **Power user / Edge case**: Xóa điểm cân sai; đổi đơn vị kg/lb; xem trung bình tuần thay vì điểm lẻ.

---

#### UC-016: Đồng bộ HealthKit
**As a** người dùng iPhone  
**I want** đồng bộ workout/steps/cân nặng 2 chiều  
**So that** tôi không phải nhập liệu trùng giữa Apple Health và CaloAI.

**Priority**: P0 — **Complexity**: High

**Preconditions**:
- Thiết bị có HealthKit (iPhone thật); user đến đúng thời điểm xin quyền (sau login).

**Main Flow**:
1. Hệ thống hiện sheet giải thích lợi ích → xin quyền hệ thống (đọc steps/workout/weight, ghi dietary energy/macros).
2. User cho phép → sync lần đầu + bật background observer → ghi dietary sau mỗi log bữa.

**Alternative Flows**:
- **[AF-016.1]**: User từ chối 1 phần → app chạy degrad (phần cho phép vẫn sync), nhắc lại 1 lần sau 7 ngày.
- **[AF-016.2]**: Sync fail (lỗi HealthKit) → retry exponential 3 lần, báo badge im lặng, không crash.

**Postconditions**:
- HK sync active; dietary energy/macros được ghi sau mỗi log_saved.

**Acceptance Criteria**:
- **[AC-016.1]**: WHEN user cho phép THEN sync lần đầu xong trong 10s và diary/weight có dữ liệu Health.
- **[AC-016.2]**: WHEN user từ chối THEN app vẫn dùng đầy đủ bằng nhập tay, không chặn flow nào.
- **[AC-016.3]**: WHEN log bữa mới THEN dietary được ghi vào HealthKit trong 5s.
- **[AC-016.4]**: WHEN sync fail 3 lần THEN hiển thị badge lỗi im lặng và không crash app.
- **[AC-016.5]**: WHEN kiểm tra privacy THEN không có dữ liệu HealthKit raw nào được upload lên server.

**Screens Involved**: WF-020, WF-005, WF-013, WF-012  
**Primary Screen**: WF-020 — **Entry Point**: Sau login / Settings — **Exit Point**: WF-005 Home

**Context Variations**:
- **First-time user**: Sheet giải thích từng loại quyền bằng tiếng Việt rõ ràng.
- **Returning user**: Sync nền im lặng; quản lý quyền trong Settings.
- **Power user / Edge case**: Thu hồi quyền ở iOS → app phát hiện và chuyển nhập tay; nút sync thủ công.

---

### 2.5 Lịch sử, nhắc nhở, fasting & coach

#### UC-017: Xem history / stats
**As a** người muốn thấy tiến bộ dài hạn  
**I want** xem lịch sử tuần/tháng và thống kê trung bình  
**So that** tôi biết chế độ ăn có hiệu quả không.

**Priority**: P1 — **Complexity**: Medium

**Preconditions**:
- User có log ≥1 ngày; Pro mở stats sâu (free xem 7 ngày gần nhất).

**Main Flow**:
1. User mở History/Stats → xem calendar + trung bình calo/tuần + chart cân + streak.
2. User chạm ngày cũ → xem diary read-only ngày đó + relog (UC-012).

**Alternative Flows**:
- **[AF-017.1]**: Free chạm stats quá 7 ngày → upsell Pro 1 lần, vẫn cho xem 7 ngày.
- **[AF-017.2]**: Ngày trống (không log) → hiển thị "chưa log" thay vì số 0 gây hiểu lầm.

**Postconditions**:
- User nắm trend; có thể relog từ ngày cũ.

**Acceptance Criteria**:
- **[AC-017.1]**: WHEN mở Stats có cache THEN màn hình render trong 1s.
- **[AC-017.2]**: WHEN free xem quá 7 ngày THEN upsell hiện 1 lần và 7 ngày gần nhất vẫn xem được.
- **[AC-017.3]**: WHEN ngày không có log THEN hiển thị "chưa log" chứ không phải 0 kcal.
- **[AC-017.4]**: WHEN chạm ngày cũ THEN diary ngày đó mở trong 1s kèm nút relog.

**Screens Involved**: WF-017, WF-012, WF-014  
**Primary Screen**: WF-017 — **Entry Point**: Tab tiến độ — **Exit Point**: WF-012 (ngày cũ) hoặc WF-014 (upsell)

**Context Variations**:
- **First-time user**: Chưa có history → empty state + giải thích sau 7 ngày sẽ có stats.
- **Returning user**: So sánh tuần này vs tuần trước tự động.
- **Power user / Edge case**: Xuất CSV (Pro); lọc theo bữa; xem trung bình động 7 ngày.

---

#### UC-018: Streaks, nhắc bữa, push & widget
**As a** người bận dễ quên log  
**I want** được nhắc log bữa và thấy streak mỗi ngày  
**So that** tôi duy trì chuỗi và không bỏ cuộc sau 1 tuần.

**Priority**: P1 — **Complexity**: Medium

**Preconditions**:
- User opt-in push (WF-021); widget cần iOS 17 + Pro (bản free xem cơ bản).

**Main Flow**:
1. Hệ thống gửi nhắc theo giờ bữa (timezone user, ≤3/ngày); log đủ bữa → streak +1.
2. Widget hiển thị consumed/remaining hôm nay, deep-link vào app khi chạm.

**Alternative Flows**:
- **[AF-018.1]**: User tắt push → nhắc trong app (badge Home), streak vẫn tính.
- **[AF-018.2]**: Mất 1 ngày log → streak reset, hiển thị động viên + best streak giữ lại.

**Postconditions**:
- Streak cập nhật; push đã lên lịch 3 khung/ngày.

**Acceptance Criteria**:
- **[AC-018.1]**: WHEN log đủ 3 bữa/ngày THEN streak +1 trong 1s và hiển thị celebration.
- **[AC-018.2]**: WHEN push bật THEN số lượng ≤3/ngày và đúng timezone user.
- **[AC-018.3]**: WHEN chạm widget THEN app mở đúng màn Home trong 2s (deep-link).
- **[AC-018.4]**: WHEN tắt push THEN không còn notification nào trong 24h và badge in-app vẫn hoạt động.

**Screens Involved**: WF-005, WF-021, WF-022, WF-017  
**Primary Screen**: WF-005 (streak hiển thị) — **Entry Point**: Push/widget/tab — **Exit Point**: WF-006/008/011 (log bữa được nhắc)

**Context Variations**:
- **First-time user**: Xin push sau log bữa đầu (đúng lúc), giải thích lợi ích streak.
- **Returning user**: Giờ nhắc tự học theo giờ log thực tế.
- **Power user / Edge case**: Tùy chỉnh giờ từng bữa; tắt nhắc cuối tuần; nhiều widget size.

---

#### UC-019: Fasting timer (nhịn ăn gián đoạn)
**As a** người theo 16:8  
**I want** bấm giờ fasting và thấy cửa sổ ăn  
**So that** tôi không ăn lố giờ mà vẫn log calo bình thường.

**Priority**: P2 — **Complexity**: Medium

**Preconditions**:
- User bật fasting trong Settings/More (Pro); có goal ngày.

**Main Flow**:
1. User chọn plan 16:8 → Start fast → timer đếm + hiển thị giờ được ăn.
2. Hết giờ → push "đến cửa sổ ăn" → user log bữa như thường; log ngoài giờ → cảnh báo nhẹ.
3. End fast → tổng kết giờ + calo trong cửa sổ.

**Alternative Flows**:
- **[AF-019.1]**: User quên end → timer tự end sau 24h, gắn cờ ước lượng.
- **[AF-019.2]**: Đổi plan giữa chừng → timer reset, hỏi xác nhận trước.

**Postconditions**:
- Fasting session được lưu; stats fasting vào WF-017.

**Acceptance Criteria**:
- **[AC-019.1]**: WHEN start fast THEN timer chạy và hiển thị giờ kết thúc chính xác đến phút.
- **[AC-019.2]**: WHEN đến cửa sổ ăn THEN push gửi trong vòng 5 phút quanh mốc giờ.
- **[AC-019.3]**: WHEN log bữa ngoài cửa sổ fast THEN cảnh báo nhẹ hiện nhưng vẫn cho lưu.
- **[AC-019.4]**: WHEN timer quá 24h chưa end THEN tự end và gắn cờ ước lượng.

**Screens Involved**: WF-018, WF-012, WF-005  
**Primary Screen**: WF-018 — **Entry Point**: Tab More / Home card — **Exit Point**: WF-012 (log bữa trong cửa sổ)

**Context Variations**:
- **First-time user**: Giải thích 16:8 + preset phổ biến.
- **Returning user**: Nhớ plan lần trước, start 1 chạm.
- **Power user / Edge case**: Custom plan (18:6, 20:4); lịch sử fast 30 ngày; pause timer khi ốm.

---

#### UC-020: AI coach chat
**As a** người cần định hướng ăn uống  
**I want** hỏi coach AI theo lịch sử ăn của mình  
**So that** tôi biết bữa tiếp theo nên ăn gì.

**Priority**: P2 — **Complexity**: High

**Preconditions**:
- User Pro; có history ≥3 ngày để coach có ngữ cảnh.

**Main Flow**:
1. User mở coach chat → hỏi ("Tối nay ăn gì còn đủ protein?").
2. Coach trả lời dựa trên remaining + history + goal, kèm gợi ý món Việt cụ thể.
3. User chạm gợi ý → deep-link sang search/log món đó.

**Alternative Flows**:
- **[AF-020.1]**: Chưa đủ history → coach trả lời generic + gợi ý log thêm 3 ngày.
- **[AF-020.2]**: Hỏi ngoài dinh dưỡng (medical) → từ chối khéo + disclaimer không thay thế bác sĩ.

**Postconditions**:
- Hội thoại lưu local; gợi ý món có thể log 1 chạm.

**Acceptance Criteria**:
- **[AC-020.1]**: WHEN hỏi có đủ history THEN câu trả lời trích đúng remaining hôm nay (sai số 0).
- **[AC-020.2]**: WHEN chạm gợi ý món THEN mở search với từ khóa món đó trong 1s.
- **[AC-020.3]**: WHEN hỏi medical (bệnh, thuốc) THEN disclaimer hiện trong mọi câu trả lời loại này.
- **[AC-020.4]**: WHEN mất mạng THEN chat báo offline và giữ lịch sử cũ đọc được.

**Screens Involved**: WF-019, WF-008, WF-012  
**Primary Screen**: WF-019 — **Entry Point**: Tab More — **Exit Point**: WF-008 (gợi ý món) hoặc ở lại chat

**Context Variations**:
- **First-time user**: Câu hỏi gợi ý sẵn 3 mẫu.
- **Returning user**: Coach nhớ món ghét/thích từ history.
- **Power user / Edge case**: Xóa lịch sử chat; tắt coach dùng rule-based; báo câu trả lời sai.

---

### 2.6 Monetization & tài khoản

#### UC-021: Đăng ký Pro / restore / hủy
**As a** người dùng free chạm giới hạn  
**I want** hiểu rõ giá, dùng thử 7 ngày và hủy dễ dàng  
**So that** tôi trả tiền mà không sợ bị "gài" billing.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- User đến paywall (sau goal, hết quota, hoặc từ Settings); StoreKit 2 khả dụng.

**Main Flow**:
1. Hệ thống hiện paywall: giá bill thực tế cỡ lớn (tháng/năm) + trial 7 ngày + so sánh free/Pro + restore.
2. User chọn gói → xác nhận Apple → server verify receipt → mở Pro (unlimited scan).
3. User xem/hủy trong Settings qua guide link sang App Store subscriptions.

**Alternative Flows**:
- **[AF-021.1]**: Verify server fail → giữ free, báo lỗi, cho retry, không trừ tiền oan (đối chiếu Apple).
- **[AF-021.2]**: User đã mua trên máy khác → Restore khôi phục Pro trong 5s.
- **[AF-021.3]**: User đóng paywall → về màn trước, nhắc lại tối đa 1 lần/ngày.

**Postconditions**:
- Entitlement Pro lưu local + server; event subscription_started được log.

**Acceptance Criteria**:
- **[AC-021.1]**: WHEN mở paywall THEN giá bill (VD 29.99$/năm) hiển thị cỡ chữ ≥2x mô tả và ghi rõ trial 7 ngày.
- **[AC-021.2]**: WHEN mua thành công THEN Pro mở trong 5s sau verify server.
- **[AC-021.3]**: WHEN verify fail THEN user giữ free, thấy nút retry và không bị trừ quyền đã có.
- **[AC-021.4]**: WHEN nhấn Restore THEN Pro khôi phục trong 5s nếu receipt hợp lệ.
- **[AC-021.5]**: WHEN đóng paywall THEN quay về màn trước và không bị hỏi lại quá 1 lần/ngày.

**Screens Involved**: WF-014, WF-025, WF-015, WF-006  
**Primary Screen**: WF-014 — **Entry Point**: Sau goal / hết quota / Settings — **Exit Point**: WF-005 (Pro mở) hoặc màn trước (đóng)

**Context Variations**:
- **First-time user**: Paywall sau goal result kèm trial giải thích rõ.
- **Returning user**: Restore khi đổi máy; upgrade tháng→năm giữ ngày trial còn lại.
- **Power user / Edge case**: Hủy giữa trial vẫn dùng Pro hết trial; refund qua Apple; receipt lỗi → retry verify thủ công.

---

#### UC-022: Profile / settings / offline / xóa tài khoản
**As a** chủ tài khoản  
**I want** chỉnh goal, xem privacy, dùng offline và xóa tài khoản khi muốn  
**So that** tôi kiểm soát dữ liệu và app của mình.

**Priority**: P0 — **Complexity**: Medium

**Preconditions**:
- User đã login (một số mục cần mạng: sync, xóa server).

**Main Flow**:
1. User mở Profile/Settings: tài khoản, goal, đơn vị, ngôn ngữ, thông báo, privacy, subscription, xóa/export.
2. User đổi goal/đơn vị → áp dụng ngay cho diary; offline → log tay + xem history bình thường, queue sync.
3. User yêu cầu xóa tài khoản → xác nhận 2 bước → xóa local + server + ảnh (theo TTL 90 ngày).

**Alternative Flows**:
- **[AF-022.1]**: Đổi goal giữa ngày → hỏi áp dụng từ hôm nay hay ngày mai.
- **[AF-022.2]**: Xóa tài khoản khi offline → queue yêu cầu, thực thi khi online, báo trạng thái pending.
- **[AF-022.3]**: Export dữ liệu → tạo CSV logs + cân nặng, share sheet trong 10s.

**Postconditions**:
- Settings persist; nếu xóa: session hết hiệu lực, dữ liệu server bị xóa xác nhận.

**Acceptance Criteria**:
- **[AC-022.1]**: WHEN đổi đơn vị kg→lb THEN toàn bộ số cân hiển thị đổi trong 1s.
- **[AC-022.2]**: WHEN offline THEN log tay + xem history hoạt động đầy đủ, scan AI báo queue.
- **[AC-022.3]**: WHEN xác nhận xóa 2 bước THEN dữ liệu local xóa trong 3s và server xác nhận trong 24h.
- **[AC-022.4]**: WHEN export THEN file CSV tạo xong trong 10s với đủ logs 90 ngày gần nhất.
- **[AC-022.5]**: WHEN đổi goal giữa ngày THEN hỏi áp dụng hôm nay/mai trước khi recalc ring.

**Screens Involved**: WF-015, WF-024, WF-025, WF-026  
**Primary Screen**: WF-015 — **Entry Point**: Tab More / avatar — **Exit Point**: WF-015 (ở lại) hoặc WF-004 (sau xóa/logout)

**Context Variations**:
- **First-time user**: Settings mặc định hợp lý, ít mục gây rối.
- **Returning user**: Đổi nhanh goal/ngôn ngữ/đơn vị; xem subscription tại chỗ.
- **Power user / Edge case**: Dùng offline dài ngày rồi sync delta; xóa từng ảnh món; xem version DB + app.

---

## 2 bis. Feature Expression Matrix

| UC ID | Primary Screen | Primary Expression | Secondary Screen | Secondary Expression | Context Trigger | Expression Difference |
|-------|---------------|-------------------|------------------|---------------------|-----------------|----------------------|
| UC-003 | WF-006 Camera | Full CTA chụp (high-intent) | WF-005 Home | Inline Action nút + mở camera | User đang ở Home muốn log nhanh | Full camera vs nút gọn; intent thực thi vs khởi phát |
| UC-003 | WF-006 Camera | Full CTA chụp | WF-012 Diary | Nút + ngữ cảnh theo bữa | User thiếu bữa cụ thể trong diary | Chụp tự do vs chụp gán sẵn bữa; density đầy đủ vs tối giản |
| UC-004 | WF-007 Confirm | Stepper + grams recalc realtime | WF-009 Detail | Inline edit serving sau lưu | Sửa trước lưu vs sửa sau lưu | Timing proactive vs reactive; CTA Lưu vs Lưu thay đổi |
| UC-007 | WF-008 Search | Full search + quick add row | WF-012 Diary | Nút + mở search gán bữa | User ở diary thiếu bữa | Khám phá (browse) vs thực thi (add vào bữa); density cao vs 1 nút |
| UC-009 | WF-005 Home | Macro ring trực quan | WF-022 Widget | Compact số consumed/remaining | User không mở app | Visual ring vs text số; tần suất realtime vs refresh hệ thống |
| UC-009 | WF-005 Home | Macro ring trực quan | WF-012 Diary | Bảng chi tiết theo bữa | User muốn biết món nào gây vượt | Tổng quan vs chi tiết; intent xem vs quản lý |
| UC-011 | WF-012 Diary | Swipe Action xóa nhanh | WF-009 Detail | Nút xóa + modal xác nhận | User đang xem chi tiết món | Swipe tốc độ vs xác nhận an toàn; power user vs first-time |
| UC-013 | WF-005 Home | Inline card +1 cốc | WF-012 Diary | Stepper trong section nước | User đang review diary | Quick-tap vs stepper chính xác; density tối thiểu vs vừa |
| UC-015 | WF-013 Weight | Full CTA nhập + chart | WF-005 Home | Inline card cân quick-log | User ở Home sau 1 tuần chưa cân | Đầy đủ chart vs 1 số + nút; intent phân tích vs ghi nhanh |
| UC-021 | WF-014 Paywall | Full-Screen Upsell giá bill lớn | WF-015 Profile | Compact Row "Nâng cấp Pro" | User khám phá settings | Gián đoạn high-intent vs discovery thụ động |
| UC-021 | WF-014 Paywall | Full-Screen Upsell | WF-006 Camera | Reactive upsell khi hết quota | User chạm trần free | Chủ động xem vs bị chặn đúng lúc cần |
| UC-010 | WF-009 Detail | Inline Expand serving editor | WF-012 Diary | Long-Press Menu (sửa/xóa/relog) | Power user thao tác nhanh | Đầy đủ field vs menu 3 lựa chọn; intent quản lý chi tiết vs tốc độ |
| UC-012 | WF-012 Diary | Nút relog ngữ cảnh bữa | WF-008 Search | Tab Recent 1 chạm | User tìm món quen | Ngữ cảnh bữa vs ngữ cảnh tìm kiếm; intent lặp lại vs khám phá |
| UC-006 | WF-011 Text/voice | Full input + STT | WF-007 Confirm | Inline sửa sau parse | Parse xong cần hiệu chỉnh | Nhập tự do vs hiệu chỉnh có cấu trúc |

---

## 3. Use Case to Screen Mapping

### 3.1 UC → Screen Matrix

| UC ID | UC Name | Screens Involved | Primary Screen | Entry | Exit |
|-------|---------|-------------------|---------------|-------|------|
| UC-001 | Onboarding quiz + goal | WF-001, WF-002, WF-003, WF-004 | WF-002 | WF-001 Splash (user mới) | WF-004 Login |
| UC-002 | Sign in Apple / Guest | WF-003, WF-004, WF-005, WF-024 | WF-004 | WF-003 Goal result | WF-005 Home |
| UC-003 | Photo scan | WF-005, WF-006, WF-007, WF-014, WF-024 | WF-006 | Tab Scan / nút + | WF-007 Confirm |
| UC-004 | Confirm / edit AI | WF-007, WF-008, WF-012, WF-005 | WF-007 | WF-006 / WF-011 | WF-012 Diary |
| UC-005 | Barcode | WF-010, WF-012, WF-016 | WF-010 | Tab Scan / nút + | WF-012 Diary |
| UC-006 | Text / voice log | WF-011, WF-007, WF-012 | WF-011 | Tab Scan / nút + | WF-007 → WF-012 |
| UC-007 | Search món Việt + quick add | WF-008, WF-009, WF-012, WF-016 | WF-008 | Nút + / tab Diary | WF-012 Diary |
| UC-008 | Custom food / recipe | WF-016, WF-008, WF-012 | WF-016 | Search miss / barcode miss | WF-008 Search |
| UC-009 | Diary + macro ring | WF-005, WF-012, WF-026 | WF-005 / WF-012 | Tab bar sau login | WF-006/008/009/011 |
| UC-010 | Food detail / edit portion | WF-009, WF-012, WF-008 | WF-009 | Chạm món trong diary | WF-012 Diary |
| UC-011 | Delete log | WF-012, WF-009, WF-023 | WF-012 | Swipe / nút Xóa | WF-012 Diary |
| UC-012 | Relog memory / history | WF-012, WF-008, WF-017 | WF-012 | Recent / history | WF-012 Diary |
| UC-013 | Water log | WF-005, WF-012, WF-022 | WF-005 | Home / Diary | Ở lại màn |
| UC-014 | Exercise / steps | WF-005, WF-012, WF-020 | WF-012 | Diary / Home | Diary / Home |
| UC-015 | Weight + trend | WF-013, WF-005, WF-020 | WF-013 | Card cân / tab tiến độ | WF-013 / WF-017 |
| UC-016 | HealthKit sync | WF-020, WF-005, WF-013, WF-012 | WF-020 | Sau login / Settings | WF-005 Home |
| UC-017 | History / stats | WF-017, WF-012, WF-014 | WF-017 | Tab tiến độ | WF-012 / WF-014 |
| UC-018 | Streaks / push / widget | WF-005, WF-021, WF-022, WF-017 | WF-005 | Push / widget / tab | WF-006/008/011 |
| UC-019 | Fasting timer | WF-018, WF-012, WF-005 | WF-018 | Tab More / Home card | WF-012 Diary |
| UC-020 | AI coach chat | WF-019, WF-008, WF-012 | WF-019 | Tab More | WF-008 / ở lại chat |
| UC-021 | Subscribe / restore / cancel | WF-014, WF-025, WF-015, WF-006 | WF-014 | Sau goal / hết quota / Settings | WF-005 / màn trước |
| UC-022 | Profile / settings / offline / delete | WF-015, WF-024, WF-025, WF-026 | WF-015 | Tab More / avatar | WF-015 / WF-004 |

### 3.2 Screen → UC Coverage

| Screen | UCs Covered | Primary UC | Secondary UCs | Screen Purpose |
|--------|------------|------------|---------------|----------------|
| WF-001 Splash | UC-001 | UC-001 | — | Check session, định tuyến mới/cũ trong 1.5s |
| WF-002 Onboarding quiz | UC-001 | UC-001 | — | Thu thập input tính goal <90s |
| WF-003 Goal result | UC-001, UC-002, UC-021 | UC-001 | UC-002, UC-021 | Hiển thị TDEE/goal + cầu nối sang login/paywall |
| WF-004 Login | UC-002 | UC-002 | UC-001 | Đăng nhập Apple/Guest + privacy consent |
| WF-005 Home/Dashboard | UC-009, UC-003, UC-013, UC-014, UC-015, UC-018 | UC-009 | UC-003, 013, 014, 015, 018 | Tổng quan ngày: ring + bữa + nước + cân + streak |
| WF-006 Camera scan | UC-003, UC-021 | UC-003 | UC-021 (hết quota) | Chụp/crop/gửi AI, cửa ngõ log <10s |
| WF-007 AI result confirm | UC-004, UC-006 | UC-004 | UC-006 | Xác nhận/sửa khẩu phần, human-in-the-loop |
| WF-008 Food search | UC-007, UC-012, UC-004, UC-020 | UC-007 | UC-004, 012, 020 | Tìm món Việt <500ms + recent + quick add |
| WF-009 Food detail | UC-010, UC-011 | UC-010 | UC-011 | Chi tiết + sửa serving/chuyển bữa/xóa |
| WF-010 Barcode scanner | UC-005 | UC-005 | UC-008 (miss) | Quét UPC/EAN <2s + fallback |
| WF-011 Text/voice log | UC-006 | UC-006 | UC-004 | Nhập/nói món Việt có/không dấu |
| WF-012 Diary | UC-009, UC-010, UC-011, UC-012, UC-014 | UC-009 | UC-010, 011, 012, 014 | Nhật ký theo bữa + quản lý log + vận động |
| WF-013 Weight trend | UC-015, UC-016 | UC-015 | UC-016 | Nhập cân + chart 7/30/90 + delta tuần |
| WF-014 Paywall | UC-021, UC-017 | UC-021 | UC-017 (upsell stats) | Giá bill rõ + trial 7 ngày + restore |
| WF-015 Profile/Settings | UC-022, UC-021 | UC-022 | UC-021 | Goal/đơn vị/privacy/xóa/export/cancel guide |
| WF-016 Custom food editor | UC-008, UC-005 | UC-008 | UC-005 | Tạo món/recipe + kcal/100g |
| WF-017 History/Stats | UC-017, UC-012, UC-015 | UC-017 | UC-012, UC-015 | Calendar + trung bình tuần + streak |
| WF-018 Fasting timer | UC-019 | UC-019 | UC-009 | Timer 16:8 + cửa sổ ăn + cảnh báo |
| WF-019 Coach chat | UC-020 | UC-020 | UC-007 | Hỏi đáp theo history + gợi ý món |
| WF-020 HealthKit permission | UC-016, UC-014, UC-015 | UC-016 | UC-014, UC-015 | Giải thích + xin quyền hệ thống đúng lúc |
| WF-021 Push permission | UC-018 | UC-018 | — | Opt-in nhắc bữa ≤3/ngày |
| WF-022 Widget | UC-018, UC-009, UC-013 | UC-018 | UC-009, UC-013 | Calo hôm nay ngoài app + deep-link |
| WF-023 Delete confirm modal | UC-011 | UC-011 | — | Xác nhận xóa + Undo 5s |
| WF-024 Error/offline states | UC-003, UC-002, UC-022, UC-020 | UC-003 | UC-002, 020, 022 | Queue offline + lỗi AI/sync + retry |
| WF-025 Subscription manage | UC-021, UC-022 | UC-021 | UC-022 | Trạng thái gói + guide hủy Apple + restore |
| WF-026 Empty states | UC-009, UC-017, UC-022 | UC-009 | UC-017, UC-022 | CTA log đầu / giải thích stats / offline hint |

---

## 4. Screen-Context Use Cases

### 4.1 WF-001 Splash
**Archetype**: Consumption — **Density**: Light — **Source UCs**: UC-001
**User Intent**: "Mở app là vào việc ngay, không chờ."
**Primary Action**: Chờ khởi tạo (tự động định tuyến mới → quiz, cũ → Home).
**Secondary**: — **Entry**: App launch — **Exit**: WF-002 (mới) / WF-005 (cũ).
**States**: Cold start <1.5s hiện logo; session hết hạn → WF-004; crash recovery → về màn trước.

### 4.2 WF-002 Onboarding quiz
**Archetype**: Action — **Density**: Medium — **Source UCs**: UC-001
**User Intent**: "Trả lời vài câu để app hiểu tôi cần bao nhiêu calo."
**Primary Action**: Trả lời câu hỏi hiện tại (CTA Tiếp tục).
**Secondary**: Bỏ qua quiz; quay lại câu trước; xem giải thích câu hỏi.
**Entry**: WF-001 — **Exit**: WF-003 Goal result.
**States**: First-time (giải thích + progress 1/7); quay lại sửa câu cũ giữ đáp án; bỏ qua → goal mặc định.

### 4.3 WF-003 Goal result
**Archetype**: Consumption — **Density**: Medium — **Source UCs**: UC-001, UC-002, UC-021
**User Intent**: "Biết con số mục tiêu của mình và bắt đầu dùng."
**Primary Action**: Xác nhận goal (CTA Bắt đầu).
**Secondary**: Sửa goal; xem cách tính TDEE; mở paywall trial.
**Entry**: WF-002 — **Exit**: WF-004 Login (mặc định) / WF-014 (trial ngay).
**States**: Tính xong <1s hiện số + macro; goal mặc định (bỏ qua) gắn cờ; chỉnh tay recalc realtime.

### 4.4 WF-004 Login
**Archetype**: Action — **Density**: Light — **Source UCs**: UC-002
**User Intent**: "Đăng nhập 1 chạm để không mất dữ liệu."
**Primary Action**: Sign in with Apple.
**Secondary**: Dùng thử Guest; đọc privacy policy.
**Entry**: WF-003 — **Exit**: WF-005 Home.
**States**: Lần đầu (giải thích lợi ích); hủy dialog Apple ở lại màn; lỗi mạng cho Guest tạm.

### 4.5 WF-005 Home / Dashboard
**Archetype**: Discovery — **Density**: Dense — **Source UCs**: UC-009, UC-003, UC-013, UC-014, UC-015, UC-018
**User Intent**: "Hôm nay tôi còn được ăn bao nhiêu, liếc là biết."
**Primary Action**: Xem macro ring + remaining (mặc định khi mở).
**Secondary**: Nút + log bữa; card nước +1 cốc; card cân quick-log; streak; mở diary/weight.
**Entry**: Login / tab Home / deep-link widget/push — **Exit**: WF-006/008/010/011 (log), WF-012 (diary), WF-013 (cân).
**States**: Có data (ring đầy đủ + celebration khi đạt); empty (CTA log bữa đầu); vượt goal (ring đỏ số âm); offline (cache + banner); VoiceOver đọc remaining.

### 4.6 WF-006 Camera scan
**Archetype**: Action — **Density**: Medium — **Source UCs**: UC-003, UC-021
**User Intent**: "Chụp 1 tấm là biết calo."
**Primary Action**: Chụp ảnh món ăn.
**Secondary**: Chọn ảnh thư viện; crop lại; bật/tắt flash.
**Entry**: Tab Scan / nút + — **Exit**: WF-007 (có kết quả) / WF-014 (hết quota).
**States**: Lần đầu (tip chụp); hết quota (upsell giữ ảnh); offline (queue); ảnh non-food (báo + chụp lại); timeout (retry).

### 4.7 WF-007 AI result confirm
**Archetype**: Management — **Density**: Dense — **Source UCs**: UC-004, UC-006
**User Intent**: "Kiểm tra AI đoán đúng không rồi mới lưu."
**Primary Action**: Lưu vào nhật ký (CTA Lưu).
**Secondary**: Đổi ít/vừa/nhiều; nhập grams; chọn bữa; báo AI sai; hủy.
**Entry**: WF-006 / WF-011 — **Exit**: WF-012 Diary / WF-008 (AI sai).
**States**: Confidence cao (Lưu enabled); low-conf <60% (Lưu disabled đến khi chạm đủ items); recalc realtime <200ms; hủy bỏ kết quả.

### 4.8 WF-008 Food search
**Archetype**: Discovery — **Density**: Medium — **Source UCs**: UC-007, UC-012, UC-004, UC-020
**User Intent**: "Tìm món quen ra ngay để log 3 chạm."
**Primary Action**: Tìm kiếm (gõ → kết quả <500ms).
**Secondary**: Quick add (+); mở detail; tab Recent/Phổ biến; tạo custom.
**Entry**: Nút + / diary / coach gợi ý — **Exit**: WF-009 (detail) / WF-012 (quick add) / WF-016 (tạo mới).
**States**: Có recent (lên đầu); 0 kết quả (gợi ý + tạo custom); offline (search local đủ); relog tab cho món lặp.

### 4.9 WF-009 Food detail
**Archetype**: Consumption — **Density**: Medium — **Source UCs**: UC-010, UC-011
**User Intent**: "Xem món này bao nhiêu calo và sửa nếu sai."
**Primary Action**: Sửa serving/grams và lưu thay đổi.
**Secondary**: Chuyển bữa; re-link sang món DB; xóa món; xem nguồn kcal.
**Entry**: Chạm món trong diary/history/search — **Exit**: WF-012 Diary.
**States**: Món DB (đủ P/C/F); món AI cũ (cho re-link); log ngày cũ (cờ edited_late); xóa cần modal WF-023.

### 4.10 WF-010 Barcode scanner
**Archetype**: Action — **Density**: Light — **Source UCs**: UC-005
**User Intent**: "Quét mã là log xong đồ đóng gói."
**Primary Action**: Quét mã UPC/EAN.
**Secondary**: Nhập mã tay; xác nhận serving; tạo custom khi miss.
**Entry**: Tab Scan / nút + — **Exit**: WF-012 (lưu) / WF-016 (miss).
**States**: Thấy mã <2s; miss (gợi ý custom); mất quyền camera (hướng dẫn Settings + nhập tay).

### 4.11 WF-011 Text / voice log
**Archetype**: Action — **Density**: Medium — **Source UCs**: UC-006
**User Intent**: "Nói/gõ 1 câu là log được khi không tiện chụp."
**Primary Action**: Nhập mô tả món (gõ hoặc nói).
**Secondary**: Nghe lại STT; sửa text; dùng câu gần đây.
**Entry**: Tab Scan / nút + — **Exit**: WF-007 (xác nhận parse).
**States**: Text rỗng (placeholder ví dụ); STT đang nghe; parse fail 1 phần (giữ đúng hỏi sai); mất quyền mic (rớt về text).

### 4.12 WF-012 Diary
**Archetype**: Management — **Density**: Dense — **Source UCs**: UC-009, UC-010, UC-011, UC-012, UC-014
**User Intent**: "Quản lý mọi thứ đã ăn hôm nay theo từng bữa."
**Primary Action**: Xem log theo bữa sáng/trưa/tối/snack.
**Secondary**: Nút + mỗi bữa; swipe xóa; chạm sửa; relog; log workout; stepper nước.
**Entry**: Tab Diary / từ Home / ngày cũ ở history — **Exit**: WF-009 (detail) / WF-008 (thêm món) / WF-006 (scan).
**States**: Đủ bữa (đầy đủ section); thiếu bữa (CTA +); ngày cũ (read-only + relog); vượt goal (cảnh báo); offline (local đủ).

### 4.13 WF-013 Weight trend
**Archetype**: Consumption — **Density**: Medium — **Source UCs**: UC-015, UC-016
**User Intent**: "Cân nặng của tôi đang xuống hay lên?"
**Primary Action**: Nhập cân nặng hôm nay.
**Secondary**: Chuyển tab 7/30/90 ngày; xem delta tuần; xóa điểm sai; đổi kg/lb.
**Entry**: Card cân Home / tab tiến độ — **Exit**: WF-017 (stats) / ở lại xem trend.
**States**: Đủ điểm (chart + delta); <2 điểm (gợi ý cân đều); nhập lệch >5% (cảnh báo); điểm từ HealthKit (badge nguồn).

### 4.14 WF-014 Paywall
**Archetype**: Action — **Density**: Medium — **Source UCs**: UC-021, UC-017
**User Intent**: "Trả bao nhiêu, được gì, hủy thế nào — rõ ràng hãy mua."
**Primary Action**: Chọn gói + bắt đầu trial 7 ngày.
**Secondary**: So sánh free/Pro; restore; đọc điều khoản; đóng.
**Entry**: Sau goal / hết quota / Settings / stats lock — **Exit**: WF-005 (mua xong) / màn trước (đóng).
**States**: Trial eligible (giá bill to + trial); đã từng trial (giá trực tiếp); verify fail (retry); đóng (nhắc lại ≤1/ngày).

### 4.15 WF-015 Profile / Settings
**Archetype**: Management — **Density**: Medium — **Source UCs**: UC-022, UC-021
**User Intent**: "Chỉnh mọi thứ thuộc về tôi và dữ liệu của tôi."
**Primary Action**: Sửa goal / đơn vị / ngôn ngữ (áp dụng ngay).
**Secondary**: Quản lý subscription; privacy; export CSV; xóa tài khoản; logout.
**Entry**: Tab More / avatar — **Exit**: Ở lại / WF-004 (logout/xóa) / WF-025 (gói).
**States**: Online đủ mục; offline (ẩn sync/xóa server, báo pending); đổi goal giữa ngày (hỏi hôm nay/mai).

### 4.16 WF-016 Custom food editor
**Archetype**: Action — **Density**: Medium — **Source UCs**: UC-008, UC-005
**User Intent**: "Tạo món nhà nấu 1 lần, dùng mãi mãi."
**Primary Action**: Lưu món custom / recipe.
**Secondary**: Thêm nguyên liệu recipe; nhập kcal/100g; đổi serving mặc định.
**Entry**: Search miss / barcode miss / nút + — **Exit**: WF-008 (dùng ngay).
**States**: Đủ kcal (lưu chuẩn); thiếu kcal (cờ unverified); trùng tên (cảnh báo); recipe (tổng auto ≤1 kcal sai số).

### 4.17 WF-017 History / Stats
**Archetype**: Consumption — **Density**: Medium — **Source UCs**: UC-017, UC-012, UC-015
**User Intent**: "Cả tuần qua tôi ăn có kỷ luật không?"
**Primary Action**: Xem calendar + trung bình calo/tuần.
**Secondary**: Chạm ngày cũ (relog); xem streak; xuất CSV (Pro); so sánh tuần.
**Entry**: Tab tiến độ — **Exit**: WF-012 (ngày cũ) / WF-014 (upsell).
**States**: Đủ 7+ ngày (stats đầy); <7 ngày (empty + giải thích); free quá 7 ngày (upsell 1 lần); ngày trống ("chưa log").

### 4.18 WF-018 Fasting timer (P1)
**Archetype**: Action — **Density**: Medium — **Source UCs**: UC-019
**User Intent**: "Tôi đang fast được mấy tiếng, bao giờ được ăn?"
**Primary Action**: Start / End fast.
**Secondary**: Đổi plan 16:8/18:6/20:4; xem lịch sử fast; log bữa trong cửa sổ.
**Entry**: Tab More / Home card — **Exit**: WF-012 (log bữa).
**States**: Đang fast (đếm + giờ ăn); cửa sổ ăn (push + CTA log); quên end >24h (tự end + cờ); log ngoài giờ (cảnh báo nhẹ).

### 4.19 WF-019 Coach chat (P1)
**Archetype**: Social — **Density**: Medium — **Source UCs**: UC-020
**User Intent**: "Tối nay ăn gì để vừa đủ protein mà không lố calo?"
**Primary Action**: Hỏi coach (nhập câu hỏi).
**Secondary**: Chạm gợi ý món (deep-link search); xem 3 câu mẫu; xóa lịch sử chat.
**Entry**: Tab More — **Exit**: WF-008 (gợi ý món) / ở lại chat.
**States**: Đủ history (trả lời theo remaining); thiếu history (generic + gợi ý log); hỏi medical (disclaimer); offline (đọc cũ).

### 4.20 WF-020 HealthKit permission
**Archetype**: Action — **Density**: Light — **Source UCs**: UC-016
**User Intent**: "Cho app đọc gì, để được gì?"
**Primary Action**: Mở dialog quyền hệ thống.
**Secondary**: Bỏ qua (dùng tay); đọc giải thích từng quyền.
**Entry**: Sau login / Settings — **Exit**: WF-005 Home.
**States**: Lần đầu (sheet lợi ích); từ chối 1 phần (degrad + nhắc sau 7 ngày); đã cấp (không hiện lại).

### 4.21 WF-021 Push permission
**Archetype**: Action — **Density**: Light — **Source UCs**: UC-018
**User Intent**: "Nhắc tôi log bữa, đừng spam."
**Primary Action**: Cho phép thông báo (mở dialog iOS).
**Secondary**: Bỏ qua; tùy chỉnh giờ nhắc sau.
**Entry**: Sau log bữa đầu / Settings — **Exit**: WF-005 Home.
**States**: Pre-permission (giải thích ≤3/ngày); đã cho phép (chọn giờ bữa); từ chối (badge in-app thay thế).

### 4.22 WF-022 Widget
**Archetype**: Consumption — **Density**: Light — **Source UCs**: UC-018, UC-009, UC-013
**User Intent**: "Không mở app vẫn biết hôm nay còn bao nhiêu."
**Primary Action**: Xem consumed/remaining (chạm → deep-link Home).
**Secondary**: Đổi size widget (small/medium).
**Entry**: Màn hình chính iOS — **Exit**: WF-005 Home (deep-link <2s).
**States**: Đã log (số realtime); chưa log (empty + CTA); Pro (đủ macro) vs free (calo cơ bản).

### 4.23 WF-023 Delete confirm modal
**Archetype**: Action — **Density**: Light — **Source UCs**: UC-011
**User Intent**: "Chắc chắn muốn xóa chứ?"
**Primary Action**: Xác nhận xóa.
**Secondary**: Hủy; Undo 5s sau xóa (toast).
**Entry**: Swipe/nút Xóa — **Exit**: WF-012 (đã xóa) / màn trước (hủy).
**States**: Xóa 1 món; xóa nhiều (edit mode, hiện tổng); offline (xóa local + queue).

### 4.24 WF-024 Error / offline states
**Archetype**: Consumption — **Density**: Light — **Source UCs**: UC-003, UC-002, UC-022, UC-020
**User Intent**: "Có lỗi thì cho tôi biết phải làm gì tiếp."
**Primary Action**: Retry / mở queue offline.
**Secondary**: Chuyển log tay; xem trạng thái sync; báo lỗi.
**Entry**: Bất kỳ flow nào fail — **Exit**: Về flow gốc sau retry.
**States**: Mất mạng (queue + banner); AI fail (retry giữ ảnh); sync fail (badge im lặng); verify fail (retry billing).

### 4.25 WF-025 Subscription manage
**Archetype**: Management — **Density**: Light — **Source UCs**: UC-021, UC-022
**User Intent**: "Gói của tôi còn bao lâu, hủy ở đâu?"
**Primary Action**: Xem trạng thái gói + ngày gia hạn.
**Secondary**: Guide hủy qua App Store; restore; đổi gói.
**Entry**: WF-015 / WF-014 — **Exit**: WF-015.
**States**: Trial (đếm ngày còn lại); Pro active; hết hạn (về free + upsell); receipt lỗi (retry verify).

### 4.26 WF-026 Empty states
**Archetype**: Consumption — **Density**: Light — **Source UCs**: UC-009, UC-017, UC-022
**User Intent**: "Màn trống thì chỉ tôi bước đầu tiên."
**Primary Action**: CTA theo ngữ cảnh (Log bữa đầu / Quét món đầu).
**Secondary**: Xem món mẫu; bỏ qua.
**Entry**: Lần đầu mở Home/Diary/Stats — **Exit**: WF-006/008/011 (log đầu).
**States**: Ngày đầu (CTA log); stats <7 ngày (giải thích); offline (hint xem cache).

---

## 5. Task Flows

### 5.1 TF-001: Onboarding → log bữa đầu (activation)
**Trigger**: Cài app lần đầu. **Referenced UCs**: UC-001, UC-002, UC-003, UC-004, UC-009. **Referenced Screens**: WF-001, WF-002, WF-003, WF-004, WF-005, WF-006, WF-007, WF-012.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-001 (UC-001) | Mở app | Check session → user mới → quiz | — |
| 2 | WF-002 (UC-001) | Trả lời 6–8 câu | Tính TDEE + goal | Bỏ qua? → goal mặc định (AF-001.1) |
| 3 | WF-003 (UC-001) | Xác nhận goal | Lưu goal local | Mua trial luôn? → WF-014 (TF-005) |
| 4 | WF-004 (UC-002) | Sign in Apple / Guest | Tạo session → Home | Hủy Apple? → ở lại, giữ goal |
| 5 | WF-005 (UC-009) | Thấy empty state | Hiện CTA log bữa đầu | — |
| 6 | WF-006 (UC-003) | Chụp món trưa | AI trả kết quả <5s | Non-food/offline/hết quota? → AF-003.x |
| 7 | WF-007 (UC-004) | Sửa serving → Lưu | MealLog lưu, ring cập nhật | Low-conf? → bắt chạm đủ items |

**Recovery Paths**:
- Mất mạng ở bước 4 → Guest tạm + retry khi online → WF-005.
- AI fail ở bước 6 → retry giữ ảnh / chuyển text-search → WF-011/WF-008.
**Alternative Paths**:
- Bỏ quiz → goal mặc định → vẫn log được bữa đầu.
- Guest → nhắc Apple ở bữa thứ 5 (không chặn).

### 5.2 TF-002: Chụp ảnh → lưu bữa (photo→save)
**Trigger**: Đến bữa ăn, user mở Scan. **Referenced UCs**: UC-003, UC-004, UC-009. **Referenced Screens**: WF-005, WF-006, WF-007, WF-012, WF-014, WF-024.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-005 (UC-009) | Chạm + / tab Scan | Mở camera (nhớ quota còn lại) | Hết quota? → WF-014 (TF-005) |
| 2 | WF-006 (UC-003) | Chụp + crop | Gửi AI, loading | Offline? → queue (AF-003.2) |
| 3 | WF-007 (UC-004) | Kiểm tra items, sửa grams | Recalc <200ms | Low-conf? → chạm đủ items |
| 4 | WF-007 (UC-004) | Chọn bữa → Lưu | MealLog lưu, event log_saved | AI sai? → WF-008 giữ ảnh |
| 5 | WF-012 (UC-009) | Xem diary cập nhật | Ring + remaining mới | Đạt goal? → celebration + streak |

**Recovery Paths**:
- Timeout >15s → retry giữ ảnh, không trừ quota → WF-006.
- Hủy ở WF-007 → về WF-005, diary unchanged.

### 5.3 TF-003: Quét barcode → lưu (barcode→save)
**Trigger**: Dùng đồ đóng gói. **Referenced UCs**: UC-005, UC-008, UC-009. **Referenced Screens**: WF-010, WF-012, WF-016.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-010 (UC-005) | Quét mã | Tra DB <2s | Miss? → WF-016 (AF-005.1) |
| 2 | WF-010 (UC-005) | Xác nhận serving | Recalc kcal <200ms | — |
| 3 | WF-012 (UC-009) | Lưu → xem diary | Ring cập nhật | Mất quyền camera? → nhập tay |

**Recovery Paths**:
- Miss cả 2 nguồn → tạo custom giữ mã → dùng được ngay → WF-008.
- Từ chối camera → hướng dẫn Settings + nhập mã tay.

### 5.4 TF-004: Log cân → xem trend (weight→trend)
**Trigger**: Cân buổi sáng / 7 ngày chưa log (nhắc). **Referenced UCs**: UC-015, UC-016, UC-017. **Referenced Screens**: WF-005, WF-013, WF-020, WF-017.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-005 (UC-015) | Chạm card cân | Mở WF-013 | HealthKit có điểm mới? → auto-add |
| 2 | WF-013 (UC-015) | Nhập cân → Lưu | Chart + delta tuần <1s | Lệch >5%? → cảnh báo xác nhận |
| 3 | WF-013 (UC-015) | Chuyển tab 7/30/90 | Render lại <1s | <2 điểm? → gợi ý cân đều |
| 4 | WF-017 (UC-017) | Xem stats tổng | So sánh tuần + streak | Cân đổi >5%? → gợi ý chỉnh goal |

**Recovery Paths**:
- Nhập sai → xóa điểm → chart tính lại → WF-013.
- HealthKit chưa cấp → WF-020 xin quyền / nhập tay.

### 5.5 TF-005: Paywall → trial → Pro (paywall→trial)
**Trigger**: Hết quota / sau goal / Settings. **Referenced UCs**: UC-021, UC-003. **Referenced Screens**: WF-014, WF-025, WF-005, WF-006.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-014 (UC-021) | Xem giá bill + trial 7 ngày | Hiện so sánh free/Pro | Đóng? → về màn trước (≤1 nhắc/ngày) |
| 2 | WF-014 (UC-021) | Chọn gói → xác nhận Apple | Verify server → mở Pro <5s | Verify fail? → retry, giữ free |
| 3 | WF-005 (UC-021) | Dùng unlimited scan | Quota bỏ chặn | Đổi máy? → Restore <5s (WF-025) |

**Recovery Paths**:
- Verify fail → giữ free + retry → không mất quyền cũ.
- Hủy giữa trial → dùng Pro hết trial → về free, log tay vẫn đủ.

### 5.6 TF-006: Text/voice + search → lưu (log thay thế)
**Trigger**: Không tiện chụp. **Referenced UCs**: UC-006, UC-007, UC-004, UC-010. **Referenced Screens**: WF-011, WF-007, WF-008, WF-009, WF-012.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-011 (UC-006) | Gõ/nói món | Parse <3s (có/không dấu) | Parse fail? → giữ đúng hỏi sai |
| 2 | WF-007 (UC-004) | Sửa → Lưu | MealLog lưu | Hoặc rẽ WF-008 search món chuẩn |
| 3 | WF-008 (UC-007) | Tìm + quick add | Lưu <1s, vào recent | 0 kết quả? → WF-016 custom |
| 4 | WF-009 (UC-010) | Sửa serving sau lưu (nếu cần) | Recalc + sync | Sai hẳn? → xóa (WF-023) + log lại |

**Recovery Paths**:
- Mất mic → rớt về text giữ màn; mất mạng → search local vẫn đủ.

### 5.7 TF-007: Xem tiến độ → duy trì streak (retention loop)
**Trigger**: Cuối ngày / push nhắc / mở widget. **Referenced UCs**: UC-009, UC-018, UC-013, UC-017. **Referenced Screens**: WF-022, WF-005, WF-021, WF-012, WF-017.

| Step | Screen | User Action | System Response | Decision Point |
|------|--------|-------------|-----------------|----------------|
| 1 | WF-022 (UC-018) | Chạm widget / push | Deep-link Home <2s | Tắt push? → badge in-app |
| 2 | WF-005 (UC-009) | Xem remaining + streak | Ring + card nước/cân | Thiếu bữa? → CTA log (TF-002/006) |
| 3 | WF-012 (UC-009) | Log nốt bữa + nước | Đủ 3 bữa → streak +1 | Vượt goal? → cảnh báo, vẫn lưu |
| 4 | WF-017 (UC-017) | Cuối tuần xem stats | So sánh tuần, best streak | Muốn sâu hơn? → Pro stats (TF-005) |

**Recovery Paths**:
- Mất 1 ngày → streak reset + động viên, best streak giữ lại.
- Widget stale → mở app refresh <2s.

---

## 5 bis. Sub-Flows & Micro-Interactions

### SF-001: Đổi khẩu phần recalc realtime
**Parent Screen**: WF-007 — **Source UC**: UC-004
**Trigger**: User chạm ít/vừa/nhiều hoặc nhập grams.
**Purpose**: Thấy ngay kcal đổi theo suất, tin tưởng số liệu trước khi lưu.

| Step | Component | User Action | System Response | Micro-State | Haptic |
|------|-----------|-------------|-----------------|-------------|--------|
| 1 | Segment ít/vừa/nhiều | Chạm mức | Grams + kcal/macro đổi | Selected | Light |
| 2 | Field grams | Nhập số | Recalc <200ms, cảnh báo nếu >1000g | Typing | None |
| 3 | Nút Lưu | Chạm Lưu | Lưu + toast + ring cập nhật | Success | Medium |

**Visual Transition**: Số kcal crossfade 0.2s; segment pill trượt spring.
**Recovery**: Nhập grams vô lý (>2000g) → chặn + gợi ý khoảng; Hủy bỏ mọi thay đổi.

### SF-002: Swipe xóa + Undo trong diary
**Parent Screen**: WF-012 — **Source UC**: UC-011
**Trigger**: Vuốt trái row món ăn.
**Purpose**: Xóa nhầm vẫn cứu được trong 5s mà không cần log lại.

| Step | Component | User Action | System Response | Micro-State | Haptic |
|------|-----------|-------------|-----------------|-------------|--------|
| 1 | Row món | Vuốt trái | Hiện nút Xóa đỏ | Revealed | Light |
| 2 | Nút Xóa / modal WF-023 | Chạm Xóa → xác nhận | Xóa + toast Undo 5s | Deleted | Medium |
| 3 | Toast Undo | Chạm Undo | Khôi phục nguyên trạng | Restored | Light |

**Visual Transition**: Row trượt ra 0.25s; toast trượt từ dưới lên, tự ẩn sau 5s.
**Recovery**: Hết 5s không Undo → xóa chốt + queue sync; xóa offline sync sau.

### SF-003: Cộng nước +1 cốc
**Parent Screen**: WF-005 — **Source UC**: UC-013
**Trigger**: Chạm nút + ở card nước.
**Purpose**: Log nước 1 chạm không rời Home.

| Step | Component | User Action | System Response | Micro-State | Haptic |
|------|-----------|-------------|-----------------|-------------|--------|
| 1 | Nút + cốc | Chạm | +250ml, progress bar đầy dần | Increment | Light |
| 2 | Progress card | Đủ 2000ml | Tick hoàn thành + confetti nhẹ | Complete | Medium |

**Visual Transition**: Progress bar fill 0.3s ease-out; tick scale-in spring.
**Recovery**: Cộng nhầm → chạm - (hoặc Undo) trừ lại ngay.

### SF-004: Chuyển ngày trong diary
**Parent Screen**: WF-012 — **Source UC**: UC-009
**Trigger**: Vuốt ngang date strip hoặc chạm ngày.
**Purpose**: Xem/sửa ngày cũ nhanh, relog tiện.

| Step | Component | User Action | System Response | Micro-State | Haptic |
|------|-----------|-------------|-----------------|-------------|--------|
| 1 | Date strip | Vuốt/chạm ngày | Load log ngày đó <1s | Loading → Loaded | Light |
| 2 | List bữa | Xem (read-only nếu ngày cũ) | Hiện nút relog | Browsing | None |

**Visual Transition**: List crossfade 0.2s; date pill highlight trượt theo.
**Recovery**: Ngày trống → empty "chưa log" + nút copy hôm qua.

---

## 6. Scenarios

### 6.1 Happy Path Scenarios

#### Scenario 1: UC-003 + UC-004 — Chụp phở bò buổi trưa
**Actor**: Nhân viên văn phòng (persona giảm cân). **Goal**: Log bữa trưa dưới 10 giây.
**Steps**:
1. Mở tab Scan, chụp tô phở bò.
2. AI trả 3 items (bánh phở 200g, bò 100g, nước dùng) + confidence 82% trong 4s.
3. User giữ "vừa", chọn bữa trưa, nhấn Lưu.
4. Diary hiện +620 kcal, ring còn 880 kcal.
**Expected Outcome**: MealLog lưu, remaining chính xác, mất 9 giây.

#### Scenario 2: UC-001 + UC-002 — Bạn mới từ TikTok
**Actor**: Nữ 25 tuổi, lần đầu dùng. **Goal**: Có goal và log bữa đầu trong 24h.
**Steps**:
1. Trả lời 7 câu quiz trong 70s → goal 1600 kcal/ngày.
2. Sign in with Apple trong 3s.
3. Chụp cơm tấm → xác nhận → lưu bữa đầu.
**Expected Outcome**: Activation hoàn tất (onboarding + first log), event goal_computed + log_saved.

#### Scenario 3: UC-015 — Theo dõi cân 4 tuần
**Actor**: Nam gym tăng cơ. **Goal**: Thấy trend cân + đủ protein.
**Steps**:
1. Nhập cân 68.5kg mỗi sáng thứ 2.
2. Mở WF-013 tab 30 ngày → delta +1.2kg, đường trung bình đi lên.
3. Protein/ngày trên ring đạt 150g nhờ relog ức gà.
**Expected Outcome**: Chart + delta đúng, goal giữ nguyên (chưa đổi >5%).

#### Scenario 4: UC-021 — Lên Pro khi hết quota
**Actor**: User free ngày thứ 3. **Goal**: Scan không giới hạn.
**Steps**:
1. Scan thứ 4 bị chặn → paywall hiện giá 29.99$/năm + trial 7 ngày rõ ràng.
2. Chọn gói năm → verify server → Pro mở trong 4s.
3. Quay lại scan ảnh đang giữ → lưu thành công.
**Expected Outcome**: Entitlement Pro active, subscription_started logged.

### 6.2 Edge Case Scenarios

#### Scenario 5: AF-003.2 — Chụp dưới hầm gửi xe mất mạng
**Actor**: User đang offline. **Context**: Không có 4G/Wifi.
**Steps**:
1. Chụp cơm gà → app queue ảnh trong 1s, báo "Sẽ phân tích khi có mạng".
2. User log tay text tạm để không quên.
3. Có mạng → BackgroundTask phân tích, báo push kết quả.
**Expected Outcome**: Không mất bữa nào; 2 log dedupe theo giờ (user giữ 1, xóa 1).

#### Scenario 6: AF-004.1 — Lẩu thập cẩm confidence 45%
**Actor**: User ăn lẩu. **Context**: AI không chắc món hỗn hợp.
**Steps**:
1. AI trả 5 items + cảnh báo đỏ "độ chắc chắn thấp".
2. Nút Lưu disabled; user chạm từng item xác nhận/sửa.
3. Đủ 5/5 → Lưu enabled → lưu với cờ low-conf.
**Expected Outcome**: Không có log auto sai; accuracy sau confirm đạt ±20%.

#### Scenario 7: AF-021.1 — Verify receipt fail sau khi trừ tiền
**Actor**: User vừa mua Pro. **Context**: Server timeout khi verify.
**Steps**:
1. Apple trừ tiền nhưng verify fail → app giữ free, hiện "Đang xác minh — không mất tiền oan" + nút Thử lại.
2. User retry → verify OK → Pro mở.
**Expected Outcome**: Không double-charge; entitlement đúng sau retry; support có log để đối chiếu.

#### Scenario 8: AF-015.1 + AF-022.2 — Nhập cân nhầm + xóa tài khoản offline
**Actor**: Power user. **Context**: Nhập 688kg thay vì 68.8kg lúc offline.
**Steps**:
1. App cảnh báo lệch >5% → user vẫn lỡ tay lưu.
2. User xóa điểm sai → chart tính lại ngay.
3. User yêu cầu xóa tài khoản khi offline → queue pending, thực thi khi online trong 24h.
**Expected Outcome**: Chart đúng sau xóa điểm; tài khoản xóa xác nhận khi online.

### 6.3 Persona-Based Scenarios

#### Scenario 9: Chị văn phòng giảm 5kg (persona 1)
**Actor**: Nữ 28 tuổi, cơm văn phòng. **Goal**: Giảm 5kg trong 3 tháng.
**Steps**:
1. Quiz → deficit 1600 kcal; chụp cơm văn phòng mỗi trưa.
2. Tối xem ring còn 400 → ăn nhẹ sữa chua thay vì trà sữa (coach gợi ý).
3. Cân mỗi sáng thứ 2 → delta -0.4kg/tuần; streak 21 ngày.
**Expected Outcome**: -4.8kg sau 12 tuần; D30 active; trial→paid gói năm.

#### Scenario 10: Anh gym đủ protein (persona 2)
**Actor**: Nam 24 tuổi, tập 4 buổi/tuần. **Goal**: 160g protein/ngày.
**Steps**:
1. Relog ức gà + trứng mỗi sáng 1 chạm; scan cơm tối.
2. HealthKit tự cộng steps + workout; ring protein theo dõi realtime.
3. Cuối tuần stats: trung bình 155g protein, cân +0.8kg/tháng.
**Expected Outcome**: Đạt 95%+ ngày đủ protein; giữ Pro vì Food Memory.

#### Scenario 11: Chị keto + 16:8 (persona 3)
**Actor**: Nữ 33 tuổi, low-carb. **Goal**: Giữ carb <50g + đúng cửa sổ ăn.
**Steps**:
1. Start fast 20h → timer báo 12h trưa được ăn.
2. Log bún bò (bỏ bún) → app cảnh báo carb 38g tiệm cận ngưỡng.
3. Tối coach gợi ý salad ức gà 12g carb → chốt ngày 50g.
**Expected Outcome**: Đúng cửa sổ 6/7 ngày; carb trong ngưỡng; dùng fasting (P1) + coach (P1).

---

## 7. Use Case Priorities

### 7.1 Must-Have (MVP — P0)
| ID | Use Case | Priority | Complexity | Primary Screen |
|----|----------|----------|------------|----------------|
| UC-001 | Onboarding quiz + goal | P0 | Medium | WF-002 |
| UC-002 | Sign in Apple / Guest | P0 | Low | WF-004 |
| UC-003 | Photo scan | P0 | High | WF-006 |
| UC-004 | Confirm / edit AI | P0 | Medium | WF-007 |
| UC-005 | Barcode | P0 | Low | WF-010 |
| UC-006 | Text / voice log | P0 | Medium | WF-011 |
| UC-007 | Search món Việt + quick add | P0 | Medium | WF-008 |
| UC-009 | Diary + macro ring | P0 | Medium | WF-005 / WF-012 |
| UC-010 | Food detail / edit portion | P0 | Low | WF-009 |
| UC-011 | Delete log | P0 | Low | WF-012 |
| UC-012 | Relog memory / history | P0 | Low | WF-012 |
| UC-013 | Water log | P0 | Low | WF-005 |
| UC-014 | Exercise / steps | P0 | Medium | WF-012 |
| UC-015 | Weight + trend | P0 | Low | WF-013 |
| UC-016 | HealthKit sync | P0 | High | WF-020 |
| UC-021 | Subscribe / restore / cancel | P0 | Medium | WF-014 |
| UC-022 | Profile / settings / offline / delete | P0 | Medium | WF-015 |

### 7.2 Should-Have (Post-MVP — P1)
| ID | Use Case | Priority | Complexity | Primary Screen |
|----|----------|----------|------------|----------------|
| UC-008 | Custom food / recipe | P1 | Medium | WF-016 |
| UC-017 | History / stats | P1 | Medium | WF-017 |
| UC-018 | Streaks / reminders / push / widget | P1 | Medium | WF-005 |

### 7.3 Nice-to-Have (Future — P2)
| ID | Use Case | Priority | Complexity | Primary Screen |
|----|----------|----------|------------|----------------|
| UC-019 | Fasting timer | P2 | Medium | WF-018 |
| UC-020 | AI coach chat | P2 | High | WF-019 |

---

## 8. User Journey Map

```
Persona Giảm cân (chị văn phòng):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Quiz + goal │ -> │ Chụp bữa   │ -> │ Xem ring    │ -> │ Cân tuần    │ -> │ Lên Pro     │
│ (UC-001)    │    │ (UC-003/04) │    │ (UC-009)    │    │ (UC-015)    │    │ (UC-021)    │
│ WF-002/003  │    │ WF-006/007  │    │ WF-005      │    │ WF-013      │    │ WF-014      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │ log 2+ bữa/ngày (loop) ↑         │ streak + push (UC-018) giữ chân │

Persona Gym tăng cơ:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Search+relog│ -> │ Health sync │ -> │ Protein ring│ -> │ Stats tháng │
│ (UC-007/12) │    │ (UC-016)    │    │ (UC-009/14) │    │ (UC-017)    │
│ WF-008      │    │ WF-020      │    │ WF-005/012  │    │ WF-017      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘

Persona Keto/IF:
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Fasting     │ -> │ Log + carb  │ -> │ Coach gợi ý │ -> │ Streak fast │
│ (UC-019)    │    │ (UC-006/09) │    │ (UC-020)    │    │ (UC-018)    │
│ WF-018      │    │ WF-011/005  │    │ WF-019      │    │ WF-005      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 9. Screen-Intent Summary

| Screen (WF-ID) | Screen Name | Archetype | Density | User Intent | Primary Action | Secondary Actions | Key UCs |
|----------------|-------------|-----------|---------|-------------|----------------|-------------------|---------|
| WF-001 | Splash | Consumption | Light | "Mở app là vào việc ngay" | Chờ định tuyến tự động | — | UC-001 |
| WF-002 | Onboarding quiz | Action | Medium | "Trả lời vài câu để có goal" | Trả lời câu hỏi | Bỏ qua, quay lại, giải thích | UC-001 |
| WF-003 | Goal result | Consumption | Medium | "Biết con số mục tiêu của mình" | Xác nhận goal | Sửa goal, xem cách tính, trial | UC-001, UC-002, UC-021 |
| WF-004 | Login | Action | Light | "Đăng nhập 1 chạm" | Sign in with Apple | Guest, privacy | UC-002 |
| WF-005 | Home/Dashboard | Discovery | Dense | "Còn được ăn bao nhiêu, liếc là biết" | Xem macro ring + remaining | Log bữa, +nước, quick cân, streak | UC-009, UC-003, UC-013, UC-015, UC-018 |
| WF-006 | Camera scan | Action | Medium | "Chụp 1 tấm là biết calo" | Chụp ảnh món | Chọn thư viện, crop, flash | UC-003, UC-021 |
| WF-007 | AI result confirm | Management | Dense | "Kiểm tra AI rồi mới lưu" | Lưu vào nhật ký | Đổi serving, grams, bữa, báo sai | UC-004, UC-006 |
| WF-008 | Food search | Discovery | Medium | "Tìm món quen 3 chạm" | Tìm kiếm | Quick add, detail, recent, custom | UC-007, UC-012, UC-004, UC-020 |
| WF-009 | Food detail | Consumption | Medium | "Xem và sửa món đã log" | Sửa serving và lưu | Chuyển bữa, re-link, xóa | UC-010, UC-011 |
| WF-010 | Barcode scanner | Action | Light | "Quét mã là xong" | Quét mã | Nhập tay, serving, custom | UC-005 |
| WF-011 | Text/voice log | Action | Medium | "Nói 1 câu là log được" | Nhập mô tả món | STT, câu gần đây | UC-006 |
| WF-012 | Diary | Management | Dense | "Quản lý mọi bữa hôm nay" | Xem log theo bữa | Thêm/sửa/xóa/relog, workout | UC-009, UC-010, UC-011, UC-012, UC-014 |
| WF-013 | Weight trend | Consumption | Medium | "Cân đang xuống hay lên" | Nhập cân hôm nay | Đổi 7/30/90, delta, xóa điểm | UC-015, UC-016 |
| WF-014 | Paywall | Action | Medium | "Giá rõ thì mới mua" | Chọn gói + trial | So sánh, restore, đóng | UC-021, UC-017 |
| WF-015 | Profile/Settings | Management | Medium | "Mọi thứ thuộc về tôi" | Sửa goal/đơn vị/ngôn ngữ | Subscription, export, xóa, logout | UC-022, UC-021 |
| WF-016 | Custom food editor | Action | Medium | "Tạo món nhà 1 lần dùng mãi" | Lưu món/recipe | Thêm nguyên liệu, kcal/100g | UC-008, UC-005 |
| WF-017 | History/Stats | Consumption | Medium | "Cả tuần ăn có kỷ luật không" | Xem calendar + trung bình | Relog ngày cũ, CSV, so sánh | UC-017, UC-012, UC-015 |
| WF-018 | Fasting timer | Action | Medium | "Bao giờ được ăn" | Start/End fast | Đổi plan, lịch sử | UC-019 |
| WF-019 | Coach chat | Social | Medium | "Tối nay nên ăn gì" | Hỏi coach | Gợi ý món, mẫu hỏi, xóa chat | UC-020 |
| WF-020 | HealthKit permission | Action | Light | "Cho đọc gì để được gì" | Mở dialog quyền | Bỏ qua, giải thích | UC-016 |
| WF-021 | Push permission | Action | Light | "Nhắc log, đừng spam" | Cho phép thông báo | Bỏ qua, chỉnh giờ | UC-018 |
| WF-022 | Widget | Consumption | Light | "Không mở app vẫn biết" | Xem remaining | Đổi size | UC-018, UC-009 |
| WF-023 | Delete confirm modal | Action | Light | "Chắc chắn muốn xóa" | Xác nhận xóa | Hủy, Undo 5s | UC-011 |
| WF-024 | Error/offline states | Consumption | Light | "Lỗi thì làm gì tiếp" | Retry / mở queue | Log tay, trạng thái sync | UC-003, UC-002, UC-022 |
| WF-025 | Subscription manage | Management | Light | "Gói còn bao lâu, hủy ở đâu" | Xem trạng thái gói | Guide hủy, restore, đổi gói | UC-021, UC-022 |
| WF-026 | Empty states | Consumption | Light | "Chỉ tôi bước đầu tiên" | CTA theo ngữ cảnh | Món mẫu, bỏ qua | UC-009, UC-017, UC-022 |

---

**Document Version**: 1.0
**Last Updated**: 2026-09-28
**Status**: Draft
**Dependencies**: PRD.md (v1.0), Project_Overview.md (v1.0)








