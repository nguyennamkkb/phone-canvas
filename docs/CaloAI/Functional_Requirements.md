# CaloAI - Functional Requirements

**Version**: 1.0
**Date**: 2026-09-28
**Status**: Draft (đồng bộ PRD v1.0 / Overview v1.0)
**Dependencies**: PRD.md, Project_Overview.md (UC-001..UC-022, WF-001..WF-026 theo quy ước dự án)

## 1. Introduction

### 1.1 Purpose
Tài liệu này đặc tả WHAT hệ thống phải làm: biến nhu cầu người dùng (UC-001..UC-022) thành yêu cầu kiểm thử được cho thiết kế và implementation. Mỗi FR trace về ≥1 UC.

### 1.2 Scope
Bao phủ toàn bộ MVP (log đa đường + diary + weight + HealthKit + paywall + vận hành tối thiểu) và backlog P1 (custom/recipe, stats sâu, fasting, coach). Ngoài scope: meal-delivery, social/groups, family plan, Watch (theo PRD §6).

### 1.3 Document Conventions
- **FR-XXX**: Functional Requirement (ID giữ nguyên, không renumber)
- **NFR-XXX**: Non-Functional Requirement; **BR-XXX**: Business Rule
- **Priority**: P0 (MVP) / P1 (post-MVP) / P2 (future)
- Mỗi FR có: mô tả đo được + UC parent + WF liên quan + priority kèm lý do + AC testable

---

## 2. Functional Requirements

### 2.1 Onboarding / Goal / Auth (UC-001, UC-002)

#### FR-001: Onboarding quiz lối sống/mục tiêu
- **UC**: UC-001 | **WF**: WF-002 | **Priority**: P0 (quyết định activation ≥60%)
- **Mô tả**: Quiz 6–8 câu (tuổi, giới, chiều cao, cân nặng, mục tiêu, mức vận động) hoàn thành trong <90s, cho phép Skip.
- **AC**: WHEN user mới mở app THEN quiz hiện trong <1s; IF Skip THEN dùng goal mặc định hợp lý và cho sửa sau.

#### FR-002: Goal engine TDEE + macro
- **UC**: UC-001 | **WF**: WF-003 | **Priority**: P0 (đầu ra cốt lõi của onboarding)
- **Mô tả**: Tính TDEE bằng Mifflin-St Jeor, sai số ±10% so với giá trị chuẩn cùng input; sinh calorie goal + protein/carb/fat goal theo mục tiêu (giảm/giữ/tăng cân).
- **AC**: WHEN quiz hoàn thành THEN goal hiện trong <1s; IF input biên (BMI <14 hoặc >50) THEN chặn và báo nhập lại.

#### FR-003: Hiển thị goal + giải thích
- **UC**: UC-001 | **WF**: WF-003 | **Priority**: P0 (user phải hiểu số của mình)
- **Mô tả**: Màn goal hiển thị TDEE, calorie goal, macro goal kèm 1–2 câu giải thích cách tính; nút sửa lại quiz.
- **AC**: WHEN goal được tính THEN đủ 4 số (TDEE, kcal, P/C/F) + nút Xác nhận; IF user sửa quiz THEN goal recalc realtime.

#### FR-004: Sign in with Apple
- **UC**: UC-002 | **WF**: WF-004 | **Priority**: P0 (auth chính, bắt buộc App Review)
- **Mô tả**: Đăng nhập Apple hoàn thành <5s khi mạng ổn, lưu user vào Keychain + đồng ý privacy trước khi vào Home.
- **AC**: WHEN đăng nhập thành công THEN vào Home trong <1s; IF hủy giữa chừng THEN ở lại màn login, không tạo tài khoản rác.

#### FR-005: Guest mode giới hạn
- **UC**: UC-002 | **WF**: WF-004 | **Priority**: P0 (cho activation không ma sát)
- **Mô tả**: Dùng thử không tài khoản với dữ liệu chỉ local; nhắc đăng nhập khi chạm quota Pro hoặc đổi máy.
- **AC**: WHEN chọn Guest THEN vào Home không cần mạng; IF guest chạm tính năng Pro THEN hiện paywall kèm giữ dữ liệu local.

#### FR-006: Splash routing session/onboarding
- **UC**: UC-001, UC-002 | **WF**: WF-001 | **Priority**: P0 (cửa ngõ mọi session)
- **Mô tả**: Splash check session + cờ onboarding trong <1.5s cold start, điều hướng đúng: quiz / login / home.
- **AC**: WHEN user đã onboard + login THEN vào Home; IF session hết hạn THEN về login; IF crash giữa quiz THEN mở lại đúng bước dở.

### 2.2 Scan pipeline AI (UC-003, UC-004)

#### FR-007: Chụp/crop + nén ảnh
- **UC**: UC-003 | **WF**: WF-006 | **Priority**: P0 (đầu vào của wedge snap-to-log)
- **Mô tả**: Chụp hoặc chọn ảnh, crop vuông/chuẩn món, nén <1MB trước upload; báo lỗi camera/quyền rõ ràng.
- **AC**: WHEN ảnh >1MB THEN nén xuống <1MB giữ nhận diện được; IF từ chối quyền camera THEN hiện hướng dẫn mở Settings.

#### FR-008: Edge proxy → Gemini primary / GPT-4o-mini fallback
- **UC**: UC-003 | **WF**: WF-006 | **Priority**: P0 (trái tim pipeline, giấu key server-side)
- **Mô tả**: Ảnh đi qua Supabase Edge Function (giấu AI key, rate-limit), gọi Gemini 2.5 Flash primary; timeout 12s thì fallback GPT-4o-mini 1 lần.
- **AC**: WHEN primary timeout THEN fallback tự động; IF cả 2 fail THEN trả lỗi AI + nút thử lại/log tay.

#### FR-009: Kết quả JSON items + confidence
- **UC**: UC-003 | **WF**: WF-007 | **Priority**: P0 (đầu ra AI phải có cấu trúc)
- **Mô tả**: Mỗi scan trả danh sách items (tên, grams ước lượng, kcal, P/C/F) + confidence 0–100% từng item; ưu tiên map món Việt từ RAG DB.
- **AC**: WHEN AI trả về THEN đủ 6 trường/item; IF thiếu trường THEN coi như fail và fallback/log tay.

#### FR-010: Confidence <60% bắt nhập tay
- **UC**: UC-004 | **WF**: WF-007 | **Priority**: P0 (chống số liệu rác, bài học Cal AI)
- **Mô tả**: Item có confidence <60% bị gắn cờ đỏ, không cho lưu auto; user phải sửa grams/chọn lại món mới lưu được.
- **AC**: WHEN conf <60% THEN banner cảnh báo + khóa nút Lưu; IF user sửa xong THEN mở khóa Lưu.

#### FR-011: Confirm 3 mức khẩu phần + grams tay
- **UC**: UC-004 | **WF**: WF-007 | **Priority**: P0 (human-in-the-loop giữ sai số ±20%)
- **Mô tả**: Mỗi item có 3 mức ít/vừa/nhiều (0.7x/1x/1.3x suất chuẩn Việt) + ô nhập grams; kcal/macro recalc realtime <100ms.
- **AC**: WHEN đổi mức/grams THEN số recalc ngay; IF grams ≤0 hoặc >2000 THEN báo lỗi validation.

#### FR-012: Không lưu khi chưa xác nhận
- **UC**: UC-004 | **WF**: WF-007 | **Priority**: P0 (nguyên tắc trung thực AI)
- **Mô tả**: Nút Lưu chỉ enable sau khi user đã xem và xác nhận từng item; thoát giữa chừng lưu nháp confirm, không ghi vào diary.
- **AC**: WHEN chưa xác nhận đủ items THEN nút Lưu disable; IF thoát THEN nháp giữ 24h, diary không đổi.

#### FR-013: Cache theo image-hash
- **UC**: UC-003 | **WF**: WF-006 | **Priority**: P0 (chặn cost AI phình khi scale)
- **Mô tả**: Hash ảnh (perceptual) tra cache 30 ngày; ảnh trùng trả kết quả cached <500ms không gọi AI.
- **AC**: WHEN chụp lại ảnh đã scan THEN kết quả <500ms + nhãn "đã lưu trước đây"; IF ảnh khác >ngưỡng THEN gọi AI mới.

#### FR-014: Queue offline + p95 <5s
- **UC**: UC-003 | **WF**: WF-006, WF-024 | **Priority**: P0 (scan cần mạng nhưng không được mất bữa)
- **Mô tả**: Mất mạng thì ảnh + metadata vào hàng đợi BackgroundTask, sync khi online; scan online p95 <5s trên 4G.
- **AC**: WHEN offline THEN queue thành công + hiện "sẽ phân tích khi có mạng"; WHEN online p95 THEN đo <5s từ chụp tới kết quả.

### 2.3 Barcode (UC-005)

#### FR-015: Quét UPC/EAN <2s
- **UC**: UC-005 | **WF**: WF-010 | **Priority**: P0 (đường log đồ đóng gói nhanh nhất)
- **Mô tả**: Scanner nhận UPC-A/EAN-13 trong <2s ở ánh sáng thường, rung + âm xác nhận khi bắt mã.
- **AC**: WHEN mã rõ THEN bắt trong <2s; IF tối/mờ THEN hiện khung hướng dẫn + nút nhập tay mã số.

#### FR-016: Tra DB nội bộ + fallback Nutritionix/Edamam
- **UC**: UC-005 | **WF**: WF-010 | **Priority**: P0 (DB Tây do đối tác, DB Việt tự build)
- **Mô tả**: Tra DB nội bộ trước (<500ms), miss thì fallback Nutritionix/Edamam qua Edge; ghi nguồn hiển thị cho user.
- **AC**: WHEN có trong DB THEN kết quả <1s kèm nguồn; IF cả 2 miss THEN chuyển FR-017.

#### FR-017: Miss barcode → gợi ý custom food
- **UC**: UC-005 | **WF**: WF-010, WF-016 | **Priority**: P0 (không để user cụt flow)
- **Mô tả**: Không tìm thấy mã thì hiện bottom-sheet: tạo custom food với mã vạch prefill + gợi ý món gần đúng theo tên.
- **AC**: WHEN miss THEN sheet hiện trong <1s với mã đã điền; IF user tạo THEN món mới gắn barcode để lần sau trúng.

#### FR-018: Xác nhận serving barcode → lưu
- **UC**: UC-005 | **WF**: WF-010 | **Priority**: P0 (serving gói khác suất tươi)
- **Mô tả**: Cho chọn serving (gói/cái/100g) với kcal recalc realtime, xác nhận 1 chạm lưu vào bữa hiện tại.
- **AC**: WHEN đổi serving THEN kcal recalc ngay; WHEN lưu THEN diary cập nhật trong <500ms.

### 2.4 Text / Voice tiếng Việt (UC-006)

#### FR-019: Nhập text món + lượng
- **UC**: UC-006 | **WF**: WF-011 | **Priority**: P0 (đường log rẻ nhất, không tốn AI vision)
- **Mô tả**: Ô nhập chấp nhận "2 trứng + 1 chén cơm", parse tên món + lượng trong <1s, hỗ trợ có dấu/không dấu.
- **AC**: WHEN nhập "2 trung + 1 chen com" THEN parse đúng 2 items; IF không parse được THEN gợi ý search thay vì báo lỗi cộc.

#### FR-020: Voice tiếng Việt
- **UC**: UC-006 | **WF**: WF-011 | **Priority**: P0 (log khi đang ăn/nấu, tay bận)
- **Mô tả**: Ghi âm ≤30s, speech-to-text tiếng Việt (có/không dấu), hiển thị transcript để sửa trước khi parse.
- **AC**: WHEN nói rõ THEN transcript đúng ≥90% từ phổ biến; IF ồn/không nghe rõ THEN báo thử lại + giữ bản ghi.

#### FR-021: Parse → ước lượng ±20% sau xác nhận
- **UC**: UC-006 | **WF**: WF-011 | **Priority**: P0 (cam kết accuracy sau human-confirm)
- **Mô tả**: Map món parse được vào VN DB, ước lượng kcal/P/C/F; món lạ gắn cờ "ước tính" và hiển thị khoảng thay vì số tuyệt đối.
- **AC**: WHEN món có trong DB THEN sai số ±20% sau xác nhận; IF món lạ THEN hiển thị khoảng (VD 300–400 kcal).

#### FR-022: Xác nhận text/voice trước lưu
- **UC**: UC-006 | **WF**: WF-007, WF-011 | **Priority**: P0 (nhất quán human-in-the-loop mọi đường log)
- **Mô tả**: Kết quả parse đi qua màn confirm chung (3 mức + grams tay như FR-011) trước khi ghi diary.
- **AC**: WHEN parse xong THEN sang confirm trong <500ms; IF user hủy THEN không ghi diary, giữ transcript 24h.

### 2.5 Search món Việt (UC-007)

#### FR-023: Search <500ms trên 500–800 món seed
- **UC**: UC-007 | **WF**: WF-008 | **Priority**: P0 (món Việt là công dân hạng nhất)
- **Mô tả**: Tìm theo tên có/không dấu, debounce 200ms, trả kết quả <500ms trên DB seed 500–800 món có kiểm duyệt.
- **AC**: WHEN gõ "pho bo" THEN "phở bò" trong top 3 <500ms; IF 0 kết quả THEN gợi ý custom food + text log.

#### FR-024: Kcal/suất + P/C/F theo suất Việt
- **UC**: UC-007 | **WF**: WF-008, WF-009 | **Priority**: P0 (suất tô/chén/dĩa, không phải cup/oz)
- **Mô tả**: Mỗi kết quả hiện kcal/suất chuẩn (tô/chén/dĩa/cái) + P/C/F + nguồn (Viện DD/USDA) hoặc nhãn "ước tính".
- **AC**: WHEN món có nguồn THEN hiện tên nguồn; IF thiếu nguồn THEN hiện khoảng kcal (BR-006).

#### FR-025: Món gần đây (recent)
- **UC**: UC-007 | **WF**: WF-008 | **Priority**: P0 (log lại bữa quen <3s)
- **Mô tả**: Lưu 20 món/log gần nhất theo user, hiện đầu màn search khi ô tìm trống.
- **AC**: WHEN mở search trống THEN recent hiện <300ms; IF xóa 1 recent THEN mất ngay, không ảnh hưởng diary.

#### FR-026: Món yêu thích (favorite)
- **UC**: UC-007 | **WF**: WF-008 | **Priority**: P1 (tiện ích, không chặn activation)
- **Mô tả**: Ghim/bỏ ghim món yêu thích (tối đa 50), tab riêng trong search, sync theo tài khoản.
- **AC**: WHEN ghim THEN vào tab Favorite ngay; IF quá 50 THEN báo và gợi ý bỏ ghim món cũ.

#### FR-027: Quick-add 1 chạm
- **UC**: UC-007 | **WF**: WF-008 | **Priority**: P0 (đường log nhanh thứ hai sau scan)
- **Mô tả**: Nút "+" trên mỗi dòng search lưu suất chuẩn vào bữa hiện tại, undo trong 5s.
- **AC**: WHEN chạm "+" THEN diary cập nhật <500ms + snackbar Undo; IF chạm Undo THEN rollback đúng món đó.

### 2.6 Custom food / Recipe (UC-008)

#### FR-028: Tạo custom food
- **UC**: UC-008 | **WF**: WF-016 | **Priority**: P1 (PRD backlog #12, phục vụ barcode-miss)
- **Mô tả**: Tạo món riêng với tên, kcal/100g (hoặc /suất), P/C/F, serving mặc định; validate số dương.
- **AC**: WHEN lưu hợp lệ THEN dùng được ngay trong search; IF kcal ≤0 THEN chặn + báo lỗi.

#### FR-029: Tạo recipe nhiều nguyên liệu
- **UC**: UC-008 | **WF**: WF-016 | **Priority**: P1 (người nấu ăn cần, không chặn MVP)
- **Mô tả**: Gộp ≥2 nguyên liệu (từ DB/custom) + tổng grams, tự tính kcal/suất, lưu số suất chia được.
- **AC**: WHEN thêm/bớt nguyên liệu THEN tổng recalc realtime; IF <2 nguyên liệu THEN gợi ý dùng custom food.

#### FR-030: Dùng lại custom/recipe 1 chạm
- **UC**: UC-008 | **WF**: WF-008, WF-016 | **Priority**: P1 (giá trị lặp lại của công sức tạo)
- **Mô tả**: Custom/recipe xuất hiện trong search + recent, log lại 1 chạm như FR-027; sửa/xóa chỉ ảnh hưởng log tương lai.
- **AC**: WHEN log lại THEN <500ms vào diary; IF xóa custom THEN log cũ giữ nguyên tên + số.

### 2.7 Diary / Detail / Delete / Relog (UC-009–UC-012)

#### FR-031: Diary theo bữa + macro ring realtime
- **UC**: UC-009 | **WF**: WF-005, WF-012 | **Priority**: P0 (màn hình quay lại 3–4 lần/ngày)
- **Mô tả**: Diary nhóm sáng/trưa/tối/snack, vòng macro ring cập nhật <500ms sau mỗi log/sửa/xóa.
- **AC**: WHEN lưu món THEN ring + list cập nhật <500ms; IF chưa có bữa nào THEN hiện empty state + CTA chụp ảnh (WF-026).

#### FR-032: Consumed / remaining / deficit + Health Score
- **UC**: UC-009 | **WF**: WF-005 | **Priority**: P0 (trả lời "còn được ăn bao nhiêu")
- **Mô tả**: Hiển thị đã nạp, còn lại, thâm hụt so với goal + Health Score ngày (0–100 từ cân bằng macro + đủ bữa).
- **AC**: WHEN vượt goal THEN remaining đỏ + cảnh báo nhẹ; IF thiếu dữ liệu THEN Score hiện "—" thay vì số bịa.

#### FR-033: Food detail
- **UC**: UC-010 | **WF**: WF-009 | **Priority**: P0 (nơi user hiểu món mình ăn)
- **Mô tả**: Chi tiết món: ảnh, kcal, P/C/F, grams/serving, nguồn, confidence (nếu từ AI), lịch sử log món này.
- **AC**: WHEN mở từ diary/search THEN render <1s với cache; IF món AI THEN hiện confidence + nút báo sai.

#### FR-034: Sửa log đã lưu
- **UC**: UC-010 | **WF**: WF-009, WF-012 | **Priority**: P0 (sửa sai là hành vi hàng ngày)
- **Mô tả**: Sửa grams/serving/bữa của log bất kỳ trong 30 ngày; diary + ring recalc ngay; giữ vết updated_at cho sync.
- **AC**: WHEN sửa THEN diary cập nhật <500ms; IF sửa log đã sync HealthKit THEN ghi đè giá trị mới lên HealthKit.

#### FR-035: Xóa log + modal xác nhận
- **UC**: UC-011 | **WF**: WF-023, WF-012 | **Priority**: P0 (xóa nhầm phải cứu được)
- **Mô tả**: Vuốt/xóa hiện modal xác nhận (WF-023), xóa xong có Undo 5s; xóa khỏi HealthKit đã ghi nếu có.
- **AC**: WHEN xác nhận xóa THEN biến mất <300ms; IF Undo THEN khôi phục đúng vị trí bữa cũ.

#### FR-036: Relog từ history
- **UC**: UC-012 | **WF**: WF-012, WF-017 | **Priority**: P0 (bữa lặp lại chiếm đa số)
- **Mô tả**: Từ diary ngày cũ/history, log lại 1 món hoặc cả bữa vào hôm nay 1 chạm, cho đổi bữa đích.
- **AC**: WHEN relog cả bữa THEN đủ items vào bữa đích; IF món gốc đã bị xóa khỏi DB THEN dùng snapshot số đã lưu.

### 2.8 Water / Exercise (UC-013, UC-014)

#### FR-037: Water log + goal ngày
- **UC**: UC-013 | **WF**: WF-005 | **Priority**: P0 (MVP scope PRD §6, giữ chân nhẹ)
- **Mô tả**: Log nước theo cốc 250ml (tùy chỉnh 100–1000ml), goal mặc định 2000ml/ngày (sửa được), progress trên Home.
- **AC**: WHEN chạm +1 cốc THEN cập nhật ngay; IF vượt goal THEN hiện chúc mừng, không chặn log thêm.

#### FR-038: Exercise log tay
- **UC**: UC-014 | **WF**: WF-005 | **Priority**: P0 (đốt bao nhiêu để trừ vào remaining)
- **Mô tả**: Log bài tập (loại, phút, cường độ) → ước tính kcal tiêu hao, cộng vào ngân sách ngày.
- **AC**: WHEN lưu bài 30 phút THEN kcal burn hiện + remaining tăng tương ứng; IF nhập >600 phút THEN cảnh báo xác nhận.

#### FR-039: Steps/workout từ HealthKit
- **UC**: UC-014, UC-016 | **WF**: WF-005, WF-020 | **Priority**: P0 (tự động, không nhập tay)
- **Mô tả**: Đọc steps + workouts hôm nay qua HealthKit (sau consent), quy đổi kcal burn hiển thị cùng log tay, tránh double-count.
- **AC**: WHEN có cả log tay + HealthKit trùng giờ THEN chỉ tính 1 lần + nhãn nguồn; IF chưa cấp quyền THEN ẩn phần này, không báo lỗi.

### 2.9 Weight / HealthKit 2 chiều (UC-015, UC-016)

#### FR-040: Weight log <10s
- **UC**: UC-015 | **WF**: WF-013 | **Priority**: P0 (vòng feedback giảm cân)
- **Mô tả**: Nhập cân (kg, 1 số lẻ) + tự động stamp thời gian, lưu <10s kể cả offline.
- **AC**: WHEN nhập 30–300kg THEN lưu ngay; IF ngoài khoảng THEN chặn + gợi ý kiểm tra đơn vị.

#### FR-041: Chart trend 7/30/90 ngày
- **UC**: UC-015 | **WF**: WF-013 | **Priority**: P0 (thấy tiến độ mới ở lại)
- **Mô tả**: Biểu đồ đường + trung bình tuần, chuyển tab 7/30/90 ngày render <1s, hiện delta so với kỳ trước.
- **AC**: WHEN <2 điểm dữ liệu THEN hiện gợi ý log thêm thay vì chart rỗng; WHEN đủ data THEN delta ±kg chính xác 1 số lẻ.

#### FR-042: HealthKit đọc workouts/weight/steps
- **UC**: UC-016 | **WF**: WF-020 | **Priority**: P0 (đồng bộ Apple là lợi thế iOS)
- **Mô tả**: Xin quyền đúng lúc (khi vào tính năng, usage string rõ), đọc workouts/weight/steps qua observer query + background delivery.
- **AC**: WHEN user cho phép THEN sync lần đầu <10s; IF từ chối THEN app chạy đủ không Health, nhắc lại tối đa 1 lần/tuần.

#### FR-043: HealthKit ghi dietary + weight
- **UC**: UC-016 | **WF**: WF-020 | **Priority**: P0 (ghi để Watch/app khác thấy)
- **Mô tả**: Ghi dietaryEnergy/protein/carbs/fat theo từng log + weight khi log cân; xóa/sửa log thì cập nhật bản ghi tương ứng, không upload raw HealthKit lên server.
- **AC**: WHEN lưu bữa THEN ghi HealthKit <3s nền; IF ghi fail THEN retry 3 lần rồi bỏ qua, không chặn diary.

### 2.10 History / Streaks / Push / Widget (UC-017, UC-018)

#### FR-044: History xem lại theo ngày
- **UC**: UC-017 | **WF**: WF-017 | **Priority**: P0 (xem offline là cam kết MVP)
- **Mô tả**: Lướt lịch theo ngày, xem diary snapshot bất kỳ ngày nào <1s từ SwiftData local.
- **AC**: WHEN chọn ngày cũ THEN render <1s offline; IF ngày chưa có log THEN empty state + nút relog hôm nay ngược lại.

#### FR-045: Stats tuần/tháng + xuất CSV
- **UC**: UC-017 | **WF**: WF-017 | **Priority**: P1 (phân tích sâu để sau retention ổn)
- **Mô tả**: Tổng kcal trung bình, adherence bữa, trend macro theo tuần/tháng; xuất CSV qua share-sheet.
- **AC**: WHEN đủ ≥7 ngày data THEN stats hiện; IF xuất CSV THEN file đúng UTF-8 + mở được bằng Numbers/Excel.

#### FR-046: Streaks + push nhắc bữa
- **UC**: UC-018 | **WF**: WF-005, WF-021 | **Priority**: P1 (retention, nhưng opt-in rõ)
- **Mô tả**: Streak ngày log đủ ≥2 bữa; push nhắc theo timezone, ≤3/ngày, opt-in sau onboarding, tắt 1 chạm.
- **AC**: WHEN log đủ THEN streak +1 và animation; IF user tắt THEN dừng toàn bộ trong 24h; push không bao giờ upsell agresif.

#### FR-047: Widget calo hôm nay
- **UC**: UC-018 | **WF**: WF-022 | **Priority**: P1 (iện diện màn hình chính)
- **Mô tả**: Widget small/medium hiện consumed/remaining hôm nay, refresh khi log mới (Timeline), deep-link vào Home/Diary.
- **AC**: WHEN log bữa THEN widget cập nhật trong <5 phút; IF chưa log THEN hiện goal + CTA mở app.

### 2.11 Fasting / Coach P1 (UC-019, UC-020)

#### FR-048: Fasting timer 16:8
- **UC**: UC-019 | **WF**: WF-018 | **Priority**: P1 (persona keto/IF, sau MVP)
- **Mô tả**: Timer 16:8 tùy chỉnh (14:10/18:6/20:4), start/stop, nhắc mở/đóng cửa sổ ăn, trạng thái persisted khi kill app.
- **AC**: WHEN hết giờ nhịn THEN push nhắc ăn; IF kill app THEN timer vẫn đúng giờ khi mở lại.

#### FR-049: Cảnh báo vượt carb trong fasting
- **UC**: UC-019 | **WF**: WF-018, WF-007 | **Priority**: P1 (gộp carb + fasting là gap đối thủ)
- **Mô tả**: Khi log bữa vượt ngưỡng carb/ngày user đặt (mặc định 50g keto), banner cảnh báo + gợi ý món thay thế ít carb.
- **AC**: WHEN vượt ngưỡng THEN cảnh báo trước khi lưu (vẫn cho lưu); IF tắt keto THEN không hiện.

#### FR-050: Coach chat theo lịch sử ăn
- **UC**: UC-020 | **WF**: WF-019 | **Priority**: P1 (không đua Noom ở MVP)
- **Mô tả**: Chat AI trả lời dựa trên 7 ngày log gần nhất (RAG local), từ chối tư vấn y khoa chẩn đoán, gắn disclaimer.
- **AC**: WHEN hỏi "sao tôi chững cân" THEN trả lời có dẫn số liệu log thật; IF hỏi bệnh lý THEN từ chối + gợi ý gặp bác sĩ.

### 2.12 Paywall / Settings / Offline (UC-021, UC-022)

#### FR-051: Paywall giá minh bạch
- **UC**: UC-021 | **WF**: WF-014 | **Priority**: P0 (release-blocker App Review)
- **Mô tả**: Hiện giá bill thực tế cỡ lớn cho monthly/yearly, kỳ hạn, điều khoản trial/hủy, link privacy + terms; không dark pattern.
- **AC**: WHEN mở paywall THEN giá bill + kỳ hạn đọc được không cần scroll; IF thiếu giá server THEN không hiện nút mua.

#### FR-052: Trial 7 ngày + restore
- **UC**: UC-021 | **WF**: WF-014 | **Priority**: P0 (công thức trust sau vụ Cal AI)
- **Mô tả**: Trial 7 ngày cả 2 gói (Default ASSUMPTION PRD §14), nút Restore hoạt động, hết trial tự chuyển paid hoặc về free đúng entitlement.
- **AC**: WHEN mua THEN receipt verify trước khi mở Pro; WHEN restore THEN entitlement đúng trong <5s.

#### FR-053: Verify StoreKit 2 server-side
- **UC**: UC-021 | **WF**: WF-014 | **Priority**: P0 (chống receipt fraud)
- **Mô tả**: Mọi transaction verify qua App Store Server API ở Edge Function, cache entitlement 24h, webhook refund → hạ Pro.
- **AC**: WHEN receipt giả THEN từ chối + log fraud; WHEN refund THEN entitlement Pro thu hồi trong 24h.

#### FR-054: Free quota 3 scans/ngày + upsell đúng mực
- **UC**: UC-021 | **WF**: WF-006, WF-014 | **Priority**: P0 (cân bằng activation vs monetization)
- **Mô tả**: Free 3 AI scans/ngày (Default ASSUMPTION), đếm reset 0h local; hết quota hiện paywall nhưng log tay/search/barcode vẫn đầy đủ.
- **AC**: WHEN hết quota THEN scan thứ 4 mở paywall; IF lên Pro giữa ngày THEN quota mở ngay không cần restart.

#### FR-055: Settings + xóa/export tài khoản
- **UC**: UC-022 | **WF**: WF-015, WF-025 | **Priority**: P0 (xóa tài khoản là bắt buộc Review)
- **Mô tả**: Sửa goal, đơn vị, ngôn ngữ VI/EN, quản lý subscription (hướng dẫn hủy), xuất dữ liệu (JSON/CSV), xóa tài khoản 2 bước xóa cả server.
- **AC**: WHEN xóa THEN tài khoản + dữ liệu server xóa trong 30 ngày, local xóa ngay; WHEN export THEN file tải về trong <10s.

#### FR-056: Offline log tay + xem history
- **UC**: UC-022 | **WF**: WF-024, WF-017 | **Priority**: P0 (offline-first là quyết định kiến trúc)
- **Mô tả**: Offline vẫn log tay/search local/xem history/cân nước; SwiftData source-of-truth, delta sync khi online, conflict last-write-wins theo updated_at.
- **AC**: WHEN offline THEN banner "đang offline" + mọi thao tác tay thành công; WHEN online lại THEN sync xong trong <30s, không mất log.

---

### 2 bis. Component Behavior Matrix

| FR ID | Component | Screen (WF) | Context | Behavior Difference |
|-------|-----------|------------|---------|--------------------|
| FR-011/012/022 | Confirm sheet (mức + grams + Lưu) | WF-007 AI confirm | Sau scan AI, có confidence | Hiện confidence/item + cờ đỏ conf<60%, khóa Lưu tới khi xác nhận |
| FR-022 | Confirm sheet (mức + grams + Lưu) | WF-011 Text/voice | Sau parse text/voice | Ẩn confidence, hiện transcript gốc thu gọn; còn lại giống WF-007 |
| FR-017 | Tạo custom từ barcode-miss | WF-010 Barcode | Quét miss | Bottom-sheet với mã vạch prefill + gợi ý món gần đúng |
| FR-028 | Tạo custom độc lập | WF-016 Custom editor | Từ search/settings | Form đầy đủ (tên, kcal, P/C/F, serving, ảnh), không prefill barcode |
| FR-024 | Dòng kết quả món | WF-008 Search | List nhiều món | Dòng gọn: tên + kcal/suất + nút "+" quick-add |
| FR-024/033 | Chi tiết món | WF-009 Food detail | 1 món | Đầy đủ P/C/F, nguồn, serving picker, nút Log, lịch sử log |
| FR-031 | Macro ring + tổng ngày | WF-005 Home | Tổng quan | Ring lớn + consumed/remaining + streak + CTA scan |
| FR-031 | List theo bữa | WF-012 Diary | Quản lý bữa | Nhóm sáng/trưa/tối/snack + swipe edit/delete/relog từng dòng |
| FR-034/035 | Edit/Delete log | WF-012 Diary | Từ diary | Swipe-action nhanh, modal xóa WF-023, Undo 5s |
| FR-034 | Edit log | WF-009 Food detail | Từ detail | Form serving/grams/bữa đầy đủ, recalc realtime |
| FR-036 | Relog | WF-012 Diary | Từ ngày cũ | Picker bữa đích hôm nay, log 1 chạm cả bữa |
| FR-036 | Relog | WF-017 History | Từ lịch sử xa | Snapshot số đã lưu, cảnh báo nếu món gốc đổi DB |
| FR-039 | Kcal burn | WF-005 Home | Tổng ngày | Con số gộp (tay + HealthKit, dedup) trong remaining |
| FR-042/043 | HealthKit consent | WF-020 Permission | Xin quyền | Giải thích lợi ích + usage string, nút Mở Settings khi deny |
| FR-046 | Streak | WF-005 Home | Hiển thị | Badge 🔥 + số ngày, animation khi +1 |
| FR-055 | Quản lý sub | WF-015 Settings | Hậu mãi | Hướng dẫn hủy Apple, trạng thái trial/paid, nút Restore |
| FR-055 | Xóa/export | WF-025 Sub manage | Dữ liệu | 2 bước xác nhận xóa + nút export JSON/CSV |

---

### 2 ter. Context-Dependent Behaviors

| FR ID | Context | Trigger | Behavior Change |
|-------|---------|---------|----------------|
| FR-001 | User mới hoàn toàn | Lần mở đầu | Quiz full 6–8 câu + giải thích lợi ích mỗi bước |
| FR-001 | User cài lại/quay lại | Đã có goal cũ | Prefill đáp án cũ, cho "giữ goal cũ" 1 chạm |
| FR-002 | Input thường | Giá trị trong khoảng | Tính + chuyển màn goal <1s |
| FR-002 | Input biên (BMI<14/>50) | Giá trị nguy hiểm | Chặn, báo kiểm tra lại, gợi ý gặp chuyên gia, không tính goal |
| FR-003 | Goal tự động | Từ quiz | Hiện TDEE + công thức + nút Xác nhận |
| FR-003 | Goal sửa tay (Settings) | User đổi target | Hiện cảnh báo nếu deficit >25% TDEE, yêu cầu xác nhận 2 lần |
| FR-004 | Mạng ổn | Login Apple | Xong <5s, vào Home |
| FR-004 | User hủy Apple sheet | Giữa chừng | Ở lại login, gợi ý Guest, không tạo tài khoản rác |
| FR-005 | Guest chạm quota | Scan thứ 4 | Paywall + đảm bảo dữ liệu local không mất khi nâng cấp |
| FR-005 | Guest xóa app | Cài lại | Mất toàn bộ local, onboarding lại từ đầu (báo trước khi dùng Guest) |
| FR-006 | Session hợp lệ | Mở app | Splash <1.5s → Home, preload diary hôm nay |
| FR-006 | Crash giữa quiz | Mở lại | Resume đúng bước dở + giữ đáp án đã trả lời |
| FR-007 | Đủ sáng | Chụp thường | Chụp → crop → nén <1MB → gửi |
| FR-007 | Bị từ chối camera | Quyền deny | Dùng ảnh thư viện + nút hướng dẫn mở Settings |
| FR-008 | Primary OK | Gemini trả <12s | Dùng kết quả primary, log latency |
| FR-008 | Primary timeout | >12s | Fallback GPT-4o-mini 1 lần; cả 2 fail → lỗi + nút thử lại/log tay, giữ ảnh |
| FR-009 | Map được VN DB | Món quen | Hiện tên Việt + suất chuẩn + confidence cao |
| FR-009 | Món lạ | Không map được | Gắn "ước tính", hiện khoảng kcal, gợi ý sửa tay |
| FR-010 | conf ≥60% | AI chắc | Cho lưu sau xác nhận thường |
| FR-010 | conf <60% | AI không chắc | Cờ đỏ + khóa Lưu + bắt sửa grams/chọn lại món |
| FR-011 | Đổi mức/grams | User chỉnh | Recalc kcal/macro realtime <100ms |
| FR-011 | Grams vô lý (≤0/>2000) | Validation fail | Báo lỗi inline, giữ giá trị cũ, không recalc |
| FR-012 | Chưa xác nhận đủ | Thiếu item | Nút Lưu disable + tooltip "còn X món chưa xác nhận" |
| FR-012 | Thoát giữa chừng | User back | Lưu nháp confirm 24h, diary không thay đổi |
| FR-013 | Ảnh trùng hash | Rescan | Trả cached <500ms + nhãn "đã lưu trước đây", không tốn cost AI |
| FR-013 | Ảnh mới | Hash lạ | Gọi AI mới + lưu cache 30 ngày |
| FR-014 | Online 4G | Scan thường | Kết quả p95 <5s |
| FR-014 | Offline | Mất mạng | Queue ảnh + metadata (BackgroundTask), báo "sẽ phân tích khi có mạng" |
| FR-015 | Ánh sáng đủ | Quét thường | Bắt mã <2s + rung xác nhận |
| FR-015 | Tối/mờ | Không bắt được | Khung hướng dẫn + bật đèn flash + nút nhập tay mã số |
| FR-016 | Có trong DB nội bộ | Hit | Kết quả <1s kèm nguồn VN DB |
| FR-016 | Miss nội bộ | Không có | Fallback Nutritionix/Edamam qua Edge, ghi nguồn ngoại |
| FR-017 | Miss toàn bộ | Không mã nào có | Bottom-sheet tạo custom với mã prefill + gợi ý gần đúng |
| FR-017 | User bỏ qua sheet | Hủy | Về scanner giữ lịch sử mã vừa quét để thử lại |
| FR-018 | Đổi serving | User chỉnh | Kcal recalc realtime theo gói/cái/100g |
| FR-018 | Lưu | Xác nhận | Ghi bữa hiện tại, diary cập nhật <500ms |
| FR-019 | Parse được | Text rõ | Hiện items + lượng <1s, sang confirm |
| FR-019 | Không parse được | Text mơ hồ | Gợi ý search/custom thay vì lỗi cộc, giữ text đã gõ |
| FR-020 | Nói rõ | STT tốt | Transcript ≥90% từ phổ biến, cho sửa trước parse |
| FR-020 | Ồn/không nghe rõ | STT kém | Báo thử lại + giữ bản ghi, gợi ý gõ tay |
| FR-021 | Món có trong DB | Hit | Số ±20% sau xác nhận |
| FR-021 | Món lạ | Miss | Hiển thị khoảng kcal + nhãn "ước tính" |
| FR-022 | Parse xong | Có kết quả | Sang confirm chung <500ms |
| FR-022 | User hủy | Thoát | Không ghi diary, giữ transcript 24h |
| FR-023 | Gõ có/không dấu | "pho bo" | "phở bò" top 3 <500ms |
| FR-023 | 0 kết quả | Từ lạ | Gợi ý tạo custom + chuyển text log, giữ từ khóa |
| FR-024 | Món có nguồn | Viện DD/USDA | Hiện tên nguồn dưới kcal |
| FR-024 | Món thiếu nguồn | Chưa kiểm duyệt | Hiện khoảng kcal (BR-006) + nhãn "ước tính" |
| FR-025 | Ô tìm trống | Mở search | Recent 20 món hiện <300ms |
| FR-025 | Xóa recent | Vuốt xóa | Mất ngay khỏi list, diary không đổi |
| FR-027 | Chạm "+" | Quick-add | Diary <500ms + snackbar Undo 5s |
| FR-027 | Hết free quota + Pro-only | (nếu món Pro) | Chặn + paywall thay vì lưu (không áp dụng món thường) |
| FR-031 | Có log | Ngày thường | Ring + list bữa realtime <500ms |
| FR-031 | Trống | Ngày mới/user mới | Empty state + CTA chụp ảnh (WF-026) |
| FR-032 | Vượt goal | Ăn quá | Remaining đỏ + cảnh báo nhẹ, không khóa log |
| FR-032 | Thiếu dữ liệu | Ngày trống | Health Score "—", không bịa số |
| FR-033 | Mở từ diary | Log đã lưu | Hiện số đã lưu + nút Sửa/Xóa/Relog |
| FR-033 | Món từ AI | Có confidence | Thêm confidence + nút "báo sai món" để cải thiện DB |
| FR-034 | Sửa log thường | Trong 30 ngày | Recalc diary <500ms, stamp updated_at |
| FR-034 | Sửa log đã sync HealthKit | Có bản ghi HK | Ghi đè giá trị mới lên HealthKit nền |
| FR-035 | Xác nhận xóa | Modal WF-023 | Xóa <300ms + Undo 5s + xóa bản ghi HealthKit |
| FR-035 | Undo trong 5s | Đổi ý | Khôi phục đúng bữa/vị trí cũ |
| FR-036 | Món gốc còn hiệu lực | Relog thường | Log 1 chạm cả bữa vào bữa đích |
| FR-036 | Món gốc đổi/xóa khỏi DB | DB version mới | Dùng snapshot số đã lưu + nhãn "công thức cũ" |
| FR-037 | Log thường | +1 cốc 250ml | Cập nhật ngay trên Home |
| FR-037 | Vượt goal 2000ml | Uống nhiều | Chúc mừng, vẫn cho log thêm không giới hạn |
| FR-038 | Log hợp lệ | ≤600 phút | Kcal burn cộng vào remaining ngay |
| FR-038 | Log vô lý | >600 phút | Cảnh báo xác nhận lại trước khi lưu |
| FR-039 | Trùng tay + HealthKit | Cùng khung giờ | Chỉ tính 1 lần + nhãn nguồn từng phần |
| FR-039 | Chưa cấp quyền HK | Deny/chưa hỏi | Ẩn phần auto, chỉ hiện log tay, không báo lỗi |
| FR-040 | Cân hợp lệ | 30–300kg | Lưu <10s kể cả offline |
| FR-040 | Ngoài khoảng | Sai đơn vị? | Chặn + gợi ý kiểm tra kg/lb |
| FR-041 | Đủ data | ≥2 điểm | Chart + delta ±kg 1 số lẻ, tab 7/30/90 <1s |
| FR-041 | Thiếu data | <2 điểm | Gợi ý log thêm thay vì chart rỗng |
| FR-042 | Cho phép | Consent | Sync lần đầu <10s + background delivery |
| FR-042 | Từ chối | Deny | App chạy đủ không HK, nhắc lại tối đa 1 lần/tuần |
| FR-043 | Ghi thành công | Có mạng/quyền | Ghi dietary + weight <3s nền |
| FR-043 | Ghi fail | Lỗi HK | Retry 3 lần rồi bỏ qua, không chặn diary; không upload raw lên server |
| FR-044 | Có log | Ngày cũ | Snapshot diary <1s offline từ SwiftData |
| FR-044 | Ngày trống | Chưa log | Empty + nút relog ngược từ hôm nay |
| FR-051 | Giá tải được | Paywall thường | Giá bill to + kỳ hạn + trial/hủy, không cần scroll |
| FR-051 | Giá chưa tải | Lỗi server | Ẩn nút mua, hiện thử lại (cấm bán mù giá) |
| FR-052 | Mua/restore OK | Verify xong | Mở Pro ngay, entitlement đúng <5s |
| FR-052 | Hết trial không gia hạn | Hết hạn | Về free đúng quota, giữ toàn bộ dữ liệu |
| FR-053 | Receipt thật | Verify pass | Cache entitlement 24h |
| FR-053 | Receipt giả/refund | Fraud/churn | Từ chối + log fraud; refund → thu hồi Pro trong 24h |
| FR-054 | Còn quota | ≤3 scans | Scan bình thường, hiện "còn X lượt" |
| FR-054 | Hết quota | Scan thứ 4 | Paywall; log tay/search/barcode vẫn đầy đủ; lên Pro mở ngay |
| FR-055 | Xóa tài khoản | 2 bước xác nhận | Local xóa ngay, server xóa trong 30 ngày + mail xác nhận |
| FR-055 | Export | User yêu cầu | File JSON/CSV tải về <10s |
| FR-056 | Offline | Mất mạng | Banner offline + log tay/search local/history/cân nước đều chạy |
| FR-056 | Online lại | Có mạng | Delta sync <30s, conflict last-write-wins theo updated_at, không mất log |

---

## 3. Non-Functional Requirements

### 3.1 Core NFRs (Required for all projects)

#### NFR-001: Cold start <1.5s
- **Priority**: P0 | **Category**: Performance
- **Requirement**: App cold start tới màn hình tương tác được <1.5s trên iPhone 12 (iOS 17).
- **AC**: WHEN đo 100 lần cold start THEN p95 <1.5s; splash routing (FR-006) không chặn quá 300ms.

#### NFR-002: Scan p95 <5s trên 4G
- **Priority**: P0 | **Category**: Performance
- **Requirement**: Chụp → kết quả AI p95 <5s trên 4G (không tính queue offline).
- **AC**: WHEN đo backend latency log 7 ngày THEN p95 <5s; IF p95 >6s THEN release-blocker (PRD §9).

#### NFR-003: Search <500ms, API p95 <800ms
- **Priority**: P0 | **Category**: Performance
- **Requirement**: Search local <500ms; API thường (diary sync, barcode lookup) p95 <800ms; render màn hình có cache <1s.
- **AC**: WHEN search 800 món THEN <500ms trên iPhone 12; WHEN API chậm THEN hiện loading sau 300ms, timeout 12s.

#### NFR-004: Crash-free ≥99.5%
- **Priority**: P0 | **Category**: Reliability
- **Requirement**: Crash-free sessions ≥99.5% (Crashlytics), mục tiêu 6 tháng; <99.3% là release-blocker.
- **AC**: WHEN release candidate THEN 7 ngày beta ≥99.3%; IF dưới ngưỡng THEN chặn submit store.

#### NFR-005: Bảo mật Edge + RLS + TLS
- **Priority**: P0 | **Category**: Security
- **Requirement**: AI key chỉ ở Edge Function; Supabase RLS theo user_id; TLS 1.2+ mọi traffic; token trong Keychain; verify StoreKit server-side.
- **AC**: WHEN audit THEN không có key trong binary; WHEN truy cập row người khác THEN RLS từ chối; receipt giả bị từ chối (FR-053).

#### NFR-006: Privacy ATT/manifest/xóa tài khoản
- **Priority**: P0 | **Category**: Security/Compliance
- **Requirement**: Privacy Manifest + Nutrition Labels đúng; ATT chỉ khi chạy ads (MVP không ads); usage string Camera/Photos/HealthKit/Speech rõ; xóa tài khoản + export trong Settings; ảnh món TTL 90 ngày (Default ASSUMPTION); không upload HealthKit raw.
- **AC**: WHEN review THEN pass App Review Guidelines; WHEN user xóa THEN server sạch trong 30 ngày (FR-055).

### 3.2 Additional NFRs (Based on App Type)

#### NFR-007: Accessibility VoiceOver/Dynamic Type + offline log tay
- **Priority**: P0 | **Category**: Usability
- **Requirement**: VoiceOver đọc được calo/remaining/macro ring/buttons; Dynamic Type tới AX5 không vỡ layout diary; contrast WCAG AA, chạm ≥44pt; offline log tay + xem history đầy đủ (FR-056).
- **AC**: WHEN bật VoiceOver THEN diary đọc đúng thứ tự số liệu; WHEN chữ AX5 THEN không cắt nút Lưu; WHEN offline THEN log tay thành công 100%.

#### NFR-008: Localize VI/EN + hỗ trợ không dấu
- **Priority**: P1 | **Category**: Usability/Scalability
- **Requirement**: Song ngữ Việt (mặc định) + Anh; search/text/voice chấp nhận không dấu; định dạng số/đơn vị theo locale.
- **AC**: WHEN đổi ngôn ngữ THEN toàn bộ màn hình chính đổi không sót key; WHEN gõ không dấu THEN kết quả tương đương có dấu (FR-019/023).

### Business Rules

#### BR-001: Free 3 scans/ngày
- **Áp dụng UC**: UC-003, UC-021 | **FR**: FR-014, FR-054
- Free giới hạn 3 AI photo scans/ngày (reset 0h local, Default ASSUMPTION PRD §14); log tay/search/barcode/text không giới hạn; Pro unlimited.

#### BR-002: Trial 7 ngày
- **Áp dụng UC**: UC-021 | **FR**: FR-051, FR-052, FR-053
- Trial 7 ngày cho cả monthly/yearly (Default ASSUMPTION); giá bill + cách hủy hiển thị trước khi xác nhận; restore/entitlement verify server-side.

#### BR-003: Confidence <60% không auto-lưu
- **Áp dụng UC**: UC-004, UC-006 | **FR**: FR-010, FR-012, FR-022
- Item conf <60% cấm lưu auto trên mọi đường log (scan/text/voice); phải sửa tay/xác nhận mới được lưu; thoát giữa chừng chỉ lưu nháp.

#### BR-004: Conflict last-write-wins
- **Áp dụng UC**: UC-022, UC-009–UC-015 | **FR**: FR-056, FR-034
- Sync conflict giải quyết last-write-wins theo updated_at; bản local khi offline không bao giờ bị ghi đè bởi bản cũ hơn; xóa là tombstone 30 ngày.

#### BR-005: Push ≤3/ngày
- **Áp dụng UC**: UC-018 | **FR**: FR-046
- Tối đa 3 push/ngày theo timezone user, opt-in rõ sau onboarding, tắt 1 chạm; cấm dùng push để upsell agresif.

#### BR-006: Kcal hiển thị khoảng khi thiếu nguồn
- **Áp dụng UC**: UC-003, UC-006, UC-007 | **FR**: FR-009, FR-021, FR-024
- Món thiếu nguồn kiểm duyệt (Viện DD/USDA) hiển thị khoảng (VD 300–400 kcal) + nhãn "ước tính", không hiển thị số tuyệt đối gây hiểu lầm.

---

## 4. Requirements Summary

### 4.1 Functional Requirements by Priority

| ID | Requirement | Priority | Module | UC |
|----|-------------|----------|--------|----|
| FR-001 | Onboarding quiz | P0 | Onboarding | UC-001 |
| FR-002 | Goal engine TDEE + macro | P0 | Onboarding | UC-001 |
| FR-003 | Hiển thị goal + giải thích | P0 | Onboarding | UC-001 |
| FR-004 | Sign in with Apple | P0 | Auth | UC-002 |
| FR-005 | Guest mode giới hạn | P0 | Auth | UC-002 |
| FR-006 | Splash routing | P0 | Onboarding/Auth | UC-001/002 |
| FR-007 | Chụp/crop + nén <1MB | P0 | Scan | UC-003 |
| FR-008 | Edge → Gemini/GPT-4o-mini | P0 | Scan | UC-003 |
| FR-009 | JSON items + confidence | P0 | Scan | UC-003 |
| FR-010 | Conf<60% bắt nhập tay | P0 | Scan confirm | UC-004 |
| FR-011 | 3 mức khẩu phần + grams | P0 | Scan confirm | UC-004 |
| FR-012 | Không lưu khi chưa xác nhận | P0 | Scan confirm | UC-004 |
| FR-013 | Cache image-hash | P0 | Scan | UC-003 |
| FR-014 | Queue offline + p95<5s | P0 | Scan | UC-003 |
| FR-015 | Quét UPC/EAN <2s | P0 | Barcode | UC-005 |
| FR-016 | DB nội bộ + fallback | P0 | Barcode | UC-005 |
| FR-017 | Miss → gợi ý custom | P0 | Barcode | UC-005 |
| FR-018 | Serving barcode → lưu | P0 | Barcode | UC-005 |
| FR-019 | Nhập text món + lượng | P0 | Text/Voice | UC-006 |
| FR-020 | Voice tiếng Việt | P0 | Text/Voice | UC-006 |
| FR-021 | Parse → ±20% sau xác nhận | P0 | Text/Voice | UC-006 |
| FR-022 | Xác nhận text/voice | P0 | Text/Voice | UC-006 |
| FR-023 | Search <500ms 500–800 món | P0 | Search | UC-007 |
| FR-024 | Kcal/suất Việt + nguồn | P0 | Search | UC-007 |
| FR-025 | Recent 20 món | P0 | Search | UC-007 |
| FR-026 | Favorite 50 món | P1 | Search | UC-007 |
| FR-027 | Quick-add 1 chạm | P0 | Search | UC-007 |
| FR-028 | Tạo custom food | P1 | Custom | UC-008 |
| FR-029 | Tạo recipe | P1 | Custom | UC-008 |
| FR-030 | Dùng lại custom/recipe | P1 | Custom | UC-008 |
| FR-031 | Diary + macro ring | P0 | Diary | UC-009 |
| FR-032 | Remaining + Health Score | P0 | Diary | UC-009 |
| FR-033 | Food detail | P0 | Diary | UC-010 |
| FR-034 | Sửa log | P0 | Diary | UC-010 |
| FR-035 | Xóa log + modal | P0 | Diary | UC-011 |
| FR-036 | Relog từ history | P0 | Diary | UC-012 |
| FR-037 | Water log | P0 | Water/Exercise | UC-013 |
| FR-038 | Exercise log tay | P0 | Water/Exercise | UC-014 |
| FR-039 | Steps/workout HealthKit | P0 | Water/Exercise | UC-014/016 |
| FR-040 | Weight log <10s | P0 | Weight/HK | UC-015 |
| FR-041 | Chart 7/30/90 ngày | P0 | Weight/HK | UC-015 |
| FR-042 | HK đọc | P0 | Weight/HK | UC-016 |
| FR-043 | HK ghi dietary | P0 | Weight/HK | UC-016 |
| FR-044 | History theo ngày | P0 | History | UC-017 |
| FR-045 | Stats + CSV | P1 | History | UC-017 |
| FR-046 | Streaks + push | P1 | Engagement | UC-018 |
| FR-047 | Widget | P1 | Engagement | UC-018 |
| FR-048 | Fasting timer | P1 | P1 | UC-019 |
| FR-049 | Cảnh báo carb | P1 | P1 | UC-019 |
| FR-050 | Coach chat | P1 | P1 | UC-020 |
| FR-051 | Paywall minh bạch | P0 | Monetization | UC-021 |
| FR-052 | Trial 7 ngày + restore | P0 | Monetization | UC-021 |
| FR-053 | Verify StoreKit server | P0 | Monetization | UC-021 |
| FR-054 | Free quota 3 scans | P0 | Monetization | UC-021 |
| FR-055 | Settings + xóa/export | P0 | Settings | UC-022 |
| FR-056 | Offline log tay + sync | P0 | Settings | UC-022 |

**Total**: 56 FR — 46 P0, 10 P1, 0 P2.

### Ma trận FR→UC (coverage)

| UC | FRs | UC | FRs |
|----|-----|----|-----|
| UC-001 | FR-001, 002, 003, 006 | UC-012 | FR-036 |
| UC-002 | FR-004, 005, 006 | UC-013 | FR-037 |
| UC-003 | FR-007, 008, 009, 013, 014 | UC-014 | FR-038, 039 |
| UC-004 | FR-010, 011, 012 | UC-015 | FR-040, 041 |
| UC-005 | FR-015, 016, 017, 018 | UC-016 | FR-039, 042, 043 |
| UC-006 | FR-019, 020, 021, 022 | UC-017 | FR-036, 044, 045 |
| UC-007 | FR-023, 024, 025, 026, 027 | UC-018 | FR-046, 047 |
| UC-008 | FR-017, 028, 029, 030 | UC-019 | FR-048, 049 |
| UC-009 | FR-031, 032 | UC-020 | FR-050 |
| UC-010 | FR-033, 034 | UC-021 | FR-051, 052, 053, 054 |
| UC-011 | FR-035 | UC-022 | FR-055, 056 |

### 4.2 Non-Functional Requirements by Category

| Category | Count | Priority Breakdown |
|----------|-------|-------------------|
| Performance | 3 (NFR-001–003) | 3 P0 |
| Reliability | 1 (NFR-004) | 1 P0 |
| Security | 2 (NFR-005–006) | 2 P0 |
| Usability | 2 (NFR-007–008) | 1 P0, 1 P1 |

**Total**: 8 NFR (7 P0, 1 P1) + 6 BR (BR-001–006).

---

**Document Version**: 1.0
**Last Updated**: 2026-09-28
**Status**: Draft
**Dependencies**: PRD.md, Project_Overview.md
