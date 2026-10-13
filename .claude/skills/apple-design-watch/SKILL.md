---
name: apple-design-watch
description: "Senior-level Apple Watch (watchOS) product design skill for the Apple ecosystem. Use when designing or auditing watchOS experiences — complications, Smart Stack, RelevanceKit, controls, Live Activities on the wrist, Always-On, Digital Crown, haptics, navigation and layout grids, health/workout features, and watchOS 26/27 APIs. Self-contained 14-section operating skill plus a deep reference library (API, COMPLICATIONS, SMART-STACK-AND-RELEVANCE, NAVIGATION-AND-LAYOUT, LIVE-ACTIVITIES-ON-WATCH, ALWAYS-ON-AND-HAPTICS, ADOPTION-TESTING), components, guidelines, specs, image analysis and assets."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "Apple Watch (watchOS)"
  updated: "2026-09-24"
  sources: "research/03-watchos/"
---

# Apple Watch Design — Senior Skill

<!-- refs -->
> **Tham chiếu:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [COMPLICATIONS](references/COMPLICATIONS.md) · [SMART-STACK-AND-RELEVANCE](references/SMART-STACK-AND-RELEVANCE.md) · [NAVIGATION-AND-LAYOUT](references/NAVIGATION-AND-LAYOUT.md) · [LIVE-ACTIVITIES-ON-WATCH](references/LIVE-ACTIVITIES-ON-WATCH.md) · [ALWAYS-ON-AND-HAPTICS](references/ALWAYS-ON-AND-HAPTICS.md) · [SYNC-AND-CONNECTIVITY](references/SYNC-AND-CONNECTIVITY.md) · [ADOPTION-TESTING](references/ADOPTION-TESTING.md)



> Nguồn nền: Apple HIG (Designing for watchOS, Complications, Notifications, Playing haptics, Digital Crown,
> Always-On, Action button, Watch faces) + **WWDC26 watchOS Group Lab**, WWDC25 334/278,
> WWDC24 10068/10098/10205/10084, WWDC23 10026/10029/10138 + WWDC26 *Principles of great design*.
> Chi tiết thô: `research/03-watchos/`.

## 1. Platform Mindset

- **Sinh ra để làm gì:** đưa thông tin & hành động quan trọng lên **cổ tay** trong **1–3 giây**, không cần
  lấy điện thoại ra. Là thiết bị **cá nhân nhất** Apple từng làm (đeo trên người, luôn bật).
- **Hoàn cảnh người dùng:** đang đi/đang tập/đang họp/đang nấu ăn; tay bận; nhìn vội; ngoài trời;
  đôi khi **không có kết nối** (đi rừng, đi biển).
- **Mục tiêu platform:** *glanceable interaction* — **"Apple Watch Moment"**: nếu có **10 giây** chú ý,
  bạn hiển thị gì?
- **Ràng buộc gốc:** màn hình rất nhỏ (nhiều kích cỡ, cạnh cong), không gõ phím, pin & runtime bị giới hạn
  nghiêm (watchdog), **Digital Crown** là trục tương tác đặc trưng, haptics là kênh phản hồi chính.
- **Hệ quả thiết kế:** 1 màn = 1 ý; chữ tối thiểu; hành động ngay màn đầu; **không form**; thiết kế cho
  **liếc** trước, **tương tác** sau, **thoát** ngay.

## 2. Design Principles

**WHEN designing on Apple Watch → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Surface thông tin quan trọng nhất trước | Bắt cuộn để tìm ý chính | Thời gian tương tác cực ngắn |
| Luồng **1–2 bước** tới hành động | Wizard nhiều bước, form dài | Một tay, đang vội |
| Nhãn ngắn **≤ 3 từ** | Câu dài, thuật ngữ | Màn nhỏ, đọc lướt |
| Tối đa **2–3 control/hàng** (3 nút glyph hoặc 2 nút text) | Nhồi nhiều nút | Ngón tay to hơn control |
| **Crown** cho cuộn/chỉnh **+ touch thay thế** | Bắt buộc Crown mới dùng được | A11y & thói quen khác nhau |
| Haptics đúng kiểu, đúng lúc | Rung vô cớ/liên tục | Mất giá trị tín hiệu |
| **Always-On**: giữ nội dung chính, dim phần phụ | Đổi giao diện gây phân tán | Liếc nhanh, không thao tác |
| Complication/Smart Stack là **cửa vào chính** | Bắt mở app rồi mới tìm | Mặt đồng hồ là màn hình chính |
| Chọn **đúng không gian**: control/widget/Live Activity | Dùng widget cho việc cần hành động | Mỗi loại có primary purpose riêng |
| Thiết kế cho **offline & first launch** | Giả định luôn có mạng | Đeo watch ở nơi không sóng |

**Quy tắc vàng:** *Nếu mô tả một màn hình Watch cần hơn một câu, màn hình đó quá phức tạp.*

## 3. Information Architecture

| Cấu trúc | Dùng khi | Không dùng khi |
|---|---|---|
| **Complication** (mặt đồng hồ) | 1 dữ liệu liếc nhanh | Nội dung phức tạp, nhiều bước |
| **Smart Stack — Widget** | Thông tin suốt ngày (thời tiết, lịch) | Việc cần hành động |
| **Smart Stack — Control** | Hành động nhanh (bật/tắt, mở view) | Hiển thị dữ liệu dài |
| **Smart Stack — Live Activity** | Sự kiện có **start–end** | Nội dung tĩnh |
| **Vertical page (TabView)** | 2–5 vùng ngang cấp | Cây điều hướng sâu |
| **NavigationSplitView** | Source list + detail | Chỉ 1 màn hình |
| **NavigationStack** | Phân cấp 2–3 tầng | Ngang cấp |
| **Notification** | Cập nhật ngoài app | Dùng thay màn hình chính |
| **Modal / full-screen** | Tác vụ ngắn, tập trung | Luồng dài |

Tab bar **không** phù hợp. Điều hướng = complication/Smart Stack → app → **≤ 2 tầng**.

## 4. Layout Rules

- **Grid hệ thống** dựng từ **độ cong màn hình**, tự thích ứng mọi kích cỡ (có trong Apple Design Resources).
- **Ba layout nền:**
  - **Dial-based** — thông tin dày, full-screen color/imagery, tối đa **4 corner controls**; dùng `scenePadding`.
  - **Infographic** — chart/graph + khối text + metric.
  - **List** — duyệt/tìm, cuộn dọc.
- **Thanh:** `topBarLeading` / `topBarTrailing` (đồng hồ dịch ra giữa); hành động chính ở **bottom bar**;
  `controlSize` để làm nút lớn.
- **Material nền full-screen:** `ultraThin` · `thin` · `regular` · `thick`; **vibrant fill** cho control;
  text theo thứ bậc **primary → quaternary**; `containerBackground` cho nền.
- **Bezel:** nội dung family tròn phải nằm gọn trong vùng an toàn của bezel.
- **Always-On:** dark + reduced luminance; `isLuminanceReduced`.
- **Landscape/rotation:** chỉ khi có lý do (ảnh, QR) — autorotation có kiểm soát.
- **Bàn phím:** gần như không dùng — thay bằng Crown, dictation, Scribble, danh sách chọn.
- **Kích thước complication (HIG):** 42/44.5/47/50 pt (84/89/94/100 px @2x); 27/28.5/31/32 pt (54/57/62/64 px @2x);
  11/11.5 pt (22/23 px @2x) cho biến thể nhỏ nhất.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Complication** | Dữ liệu trên mặt đồng hồ | Family + data + label | current/stale/placeholder | WidgetKit (watchOS 9+); hỗ trợ **mọi family**; nhiều biến thể | Label rõ; không chỉ màu | Chỉ 1 family; dữ liệu cũ không báo |
| **Smart Stack Widget** | Thông tin theo ngữ cảnh | Entry + view + relevance | placeholder/preview/current | RelevanceKit cho đúng lúc; `containerBackground` | Đọc được; không chỉ màu | Chiếm top spot quá lâu |
| **Control** | Hành động nhanh | Symbol + title + tint + context | on/off/updating | Control Center/Smart Stack/Action button; cấu hình qua AppIntent | Title + value rõ | Action foreground iPhone app → không hiện |
| **Live Activity** | Theo dõi tiến trình | compact/minimal/expanded | active/ended/stale | `supplementalActivityFamilies(.small)`; layout riêng cho `.small` | `isLuminanceReduced`; màu semantic | Alert mọi thay đổi; treo sau khi xong |
| **Notification** | Cập nhật/lời mời hành động | App name, title, body, actions | short look/long look | Ngắn; 1 hành động chính; không lặp app | Nút ≥ 44 pt; đọc đủ | Nội dung dài, nhiều hành động mơ hồ |
| **Gauge / Ring** | Tiến trình/dữ liệu | Vòng/cung + giá trị | determinate/indeterminate | **Closed** = tỉ lệ; **Open + range** = khoảng; nhãn range | Đọc giá trị; không chỉ màu | Gauge trang trí vô nghĩa |
| **Dial view** | Thông tin dày + corner controls | Full-screen + ≤4 corner controls | — | `scenePadding`; giữ nội dung khỏi bezel | Đọc được ở cỡ nhỏ | Nhồi quá nhiều số |
| **Digital Crown** | Cuộn/chỉnh chính xác | Crown + haptic | — | Dùng cho list/giá trị; **kèm touch** | Có alternative | Bắt buộc Crown |
| **Action button** | Hành động ngoài màn | Nút vật lý + phản hồi | press/long-press | Gán **chức năng cốt lõi**; nhãn ≤ 3 từ | Không phụ thuộc duy nhất | Dạy lại cách dùng |
| **Watch face** | Cá nhân hoá | Complications + màu | — | Hỗ trợ nhiều mặt; tinted; full-screen color | Tương phản tốt | Ảnh không hợp tinted |
| **List** | Chọn/duyệt | Row + icon + label | selected | ≤ 5–7 mục/lần xem; nhóm rõ | Row = 1 phần tử | Danh sách dài không nhóm |
| **Haptics** | Phản hồi không thị giác | Kiểu rung theo ngữ nghĩa | success/warning/failure | Đúng ngữ nghĩa; không lạm dụng | Kèm biểu diễn thị giác | Rung liên tục gây khó chịu |
| **Empty/Loading/Error** | Trạng thái | Icon + 1 dòng + hành động | — | Ngắn, có lối thoát; **first launch phải có gì đó** | Đọc được | Spinner vô tận |
| **Reorder (watchOS 27)** | Sắp xếp container | Danh sách kéo được | idle/dragging | API reorderable mới trong SwiftUI | Có alternative | Không có phản hồi khi kéo |

### 5.1 API mới cần biết (tóm tắt)

| Khu vực | API chính |
|---|---|
| Kiến trúc | **Standard Architectures / arm64** (Series 9+, Ultra 2, watchOS 26+) |
| Complication/Widget | **WidgetKit**; `widgetAccentable()` · `widgetAccentedRenderingMode`; `containerBackground(for: .widget)` |
| **RelevanceKit** (26) | `RelevantContext` (date/sleep/fitness/location/POI) · `WidgetRelevance` · `RelevanceEntry` · `RelevanceEntriesProvider` · `RelevanceConfiguration` · `associatedKind` |
| Ưu tiên cũ | `TimelineEntryRelevance(score:duration:)` · `RelevantIntentManager` · `AppIntentRecommendation` |
| **Controls** (26) | WidgetKit control; Control Center/Smart Stack/Action button; `AppIntentControlConfiguration` + `AppIntentControlValueProvider` |
| Live Activity | `supplementalActivityFamilies(.small)` · `activityFamily` · key “Supports Launch for Live Activity Attribute Types” · `isLuminanceReduced` |
| Cập nhật | timeline reload policy · **APNs push (26)** · **Watch Connectivity (27)** |
| Điều hướng | `NavigationSplitView` · `TabView` (verticalPage) · `NavigationStack` · `matchedGeometryEffect` |
| Layout | `scenePadding` · toolbar `topBarLeading`/`topBarTrailing` · `controlSize` · `containerBackground` · material ultraThin→thick · text primary→quaternary · **reorderable API (27)** |
| Sức khoẻ | WorkoutKit · **heart-rate zones + cycling power zones (27)** · perimenopause/menopause (27) · workout insights/buddy (27) |
| Intelligence (27) | **Foundation Models** (qua mạng: PCC cần entitlement / language model protocol; luôn có fallback) · Vision · Core AI |
| Đồ hoạ | **SceneKit deprecated (26)** → **SwiftUI Canvas** (RealityKit không có trên watch) |
| Tooling | **Xcode 27** · **Device Hub** (watch ↔ Mac trực tiếp, peer-to-peer, 5 GHz) |

> Bảng đầy đủ: [references/API.md](references/API.md).

### 5.2 Tương thích, kết nối & đồng bộ iPhone ↔ Watch

| Trục | Quy tắc |
|---|---|
| **Companion / Independent / Family Setup** | WatchConnectivity **chỉ** khi có iPhone ghép đôi; **Family Setup ⇒ không có companion** → dùng iCloud Keychain / Core Data + CloudKit / URLSession |
| **Chọn công cụ** | Keychain+iCloud (nhỏ, nhạy cảm, ít đổi) · Core Data+CloudKit (DB, không cần companion) · **WatchConnectivity** (dữ liệu chỉ có ở một bên, tối ưu trải nghiệm cặp đôi) · **URLSession background** (gọi server) · Sockets (streaming audio) |
| **WatchConnectivity** | `applicationContext` (một dict, **ghi đè** = giá trị mới nhất) · `transferUserInfo` (xếp hàng, **đúng thứ tự**, cancel được) · `transferFile` (inbox, **xử lý đồng bộ** trong callback) · `sendMessage` (cần **reachable** + reply) · `transferCurrentComplicationUserInfo` (ưu tiên, có **ngân sách**) |
| **Reachability** | **Không đối xứng**: iOS app có thể bị đánh thức trong nền ⇒ reachable nhiều hơn hẳn; Watch extension cần foreground/background ưu tiên cao |
| **Đồng bộ state** | Một nguồn sự thật; đẩy dữ liệu phone đã có sang watch để **khởi động nhanh**; watch chỉ nhận phần cần (Core Data nhiều configuration) |
| **Background** | URLSession background + `sendsLaunchEvents`; khi có complication đang hiện: **≤ 4 refresh/giờ** và cách nhau **≥ 15 phút**; **luôn set task completed** |
| **Widget / Live Activity** | Widget: APNs (**26**) / Watch Connectivity (**27**); Live Activity **tự đồng bộ**, tính vào budget |
| **Kiến trúc** | **arm64 / Standard Architectures** (Series 9+, Ultra 2, watchOS 26+); test máy thật **không cắm debugger** |

> Chi tiết + failure modes + checklist: [references/SYNC-AND-CONNECTIVITY.md](references/SYNC-AND-CONNECTIVITY.md).

## 6. Screen Inventory

| Màn hình | Mục tiêu | Lưu ý |
|---|---|---|
| Complication / mặt đồng hồ | Liếc dữ liệu | 1 thông tin, tinted, cập nhật đúng lúc |
| Smart Stack | Gợi ý theo ngữ cảnh | RelevanceKit; đừng chiếm top quá lâu |
| App Home | Điểm vào | 1 hành động chính |
| List / Picker | Chọn nhanh | Ngắn, Crown hỗ trợ |
| Detail | Xem/nghe | Ít chữ, hành động ở đầu |
| Phiên hoạt động (workout/timer) | Theo dõi liên tục | Metric ưu tiên; Always-On quan trọng |
| Notification | Xử lý nhanh | Hành động ngay trên thông báo |
| Settings (mỏng) | Tuỳ chỉnh tối thiểu | Mặc định tốt; ít lựa chọn |
| Permission | Xin quyền | Đúng lúc, giải thích ngắn |
| Empty / Offline / Error | Trạng thái | First launch & offline phải có nội dung |

## 7. UX Patterns

**Glance · Notify · Quick-action · Track · Timer · Remote · Confirm · Suggest**

- **Glance:** dữ liệu mới nhất ở complication/Smart Stack; mở app để biết thêm.
- **Suggest (RelevanceKit):** đưa widget lên đúng **real-world context** (địa điểm, thời gian, fitness, sleep).
- **Track (workout):** bắt đầu nhanh → metric + Always-On trong phiên → kết thúc rõ.
- **Notify:** short look → long look; phân biệt **alert** vs **suggestion**.
- **Confirm:** phản hồi xúc giác tức thời.
- **Quick-action (control):** 1 chạm, không mở app.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | ≥ 44×44 pt; tránh cạnh cong |
| **Digital Crown** | Cuộn/chỉnh; haptic nhẹ khi qua mốc; **luôn có touch thay thế** |
| **Side / Action button** | Chức năng cốt lõi; nhãn ≤ 3 từ; watchOS 26 gắn **controls** vào Action button (Ultra) |
| **Gestures** | Double tap & cử chỉ hệ thống; không tự chế cử chỉ ẩn |
| **Voice** | Dictation + Siri thay bàn phím |
| **Haptics** | Kênh phản hồi chính (xác nhận/cảnh báo/nhịp) |
| **Keyboard** | Hạn chế tối đa; nếu buộc → dictation/Scribble |
| **Reorder (27)** | Kéo-sắp-xếp container (API reorderable mới) |

## 9. Accessibility

- **VoiceOver:** mọi phần tử có label; complication đọc được giá trị; thứ tự đọc = thị giác.
- **Dynamic Type:** chữ lớn làm giảm lượng nội dung — thiết kế cho điều đó (tab giãn, list mở rộng).
- **Contrast:** đạt chuẩn; **không truyền tải chỉ bằng màu** (đặc biệt complication/gauge).
- **Reduce Transparency / Increase Contrast:** thanh & material phải còn đọc được.
- **Motion:** giảm chuyển động; Always-On **không phân tán**.
- **Haptics:** bổ trợ, không phải kênh duy nhất.
- **Checklist:** [ ] VoiceOver · [ ] Dynamic Type · [ ] contrast · [ ] reduce transparency/motion ·
  [ ] haptics có nghĩa · [ ] thao tác không cần Crown · [ ] mọi hành động có alternative.

## 10. Performance Rules

- **Pin & runtime:** watchdog chặt, ít core ⇒ công việc nền **nhẹ, gọn, có lý do**; không giữ session.
- **Ngân sách cập nhật:** widget mặt đồng hồ ~15–20 phút khi đang dùng; Smart Stack theo tần suất xem;
  Live Activity có ngân sách riêng — **không đối xử như app foreground**.
- **Không jank** khi dữ liệu realtime (workout).
- **Không quá tải nhận thức:** 1 màn = 1 ý; ≤ 3 dòng chính.
- **Không phân cấp sâu:** ≤ 2 tầng push.
- **Không animation nặng:** animation ngắn, mục đích rõ; tôn trọng Reduce Motion.
- **First launch/offline:** có nội dung ngay, tải nền phần còn lại, trạng thái offline rõ ràng.

## 11. Senior Review Checklist

- [ ] **Glanceability:** hiểu màn hình trong **≤ 3 giây**.
- [ ] **Navigation:** từ complication tới hành động ≤ 2 bước; luôn thoát được.
- [ ] **Hierarchy:** thông tin quan trọng nhất ở trên cùng / ở slot chính.
- [ ] **Accessibility:** mục 9 pass.
- [ ] **Discoverability:** không cử chỉ ẩn; không phụ thuộc Crown.
- [ ] **Performance:** pin & cập nhật hợp lý; không jank; tôn trọng budget.
- [ ] **Empty/Loading/Error/Offline:** ngắn, có lối thoát, có nội dung khi mất mạng.
- [ ] **Always-On:** dim đúng, không phân tán.
- [ ] **Haptics:** đúng kiểu, đúng lúc.
- [ ] **Complication:** mọi family; tinted OK; dữ liệu mới.
- [ ] **Smart Stack:** chọn đúng control/widget/Live Activity; relevance đúng ngữ cảnh; không chiếm top quá lâu.
- [ ] **Kiến trúc:** arm64/Standard Architectures; test nhiều đời máy + Device Hub.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Form dài / nhiều bước | Không gõ được; tương tác quá ngắn |
| Yêu cầu nhập bàn phím | Watch không phải thiết bị nhập liệu |
| Nội dung dày, chữ dài | Không glance được |
| Điều hướng sâu | Người dùng bỏ cuộc |
| Chỉ hỗ trợ 1 complication family | Bỏ lỡ phần lớn mặt đồng hồ |
| Bỏ qua Always-On | Màn mờ làm mất thông tin |
| Lạm dụng animation | Tốn pin, gây phân tán |
| Haptics vô nghĩa | Gây khó chịu, mất tín hiệu |
| Phụ thuộc Digital Crown | Không thao tác được bằng touch/a11y |
| Dùng widget cho việc cần hành động | Sai primary purpose (dùng control) |
| Chiếm top Smart Stack quá lâu | Người dùng dismiss app |
| Alert mọi thay đổi | Alert fatigue (vd. thể thao chỉ alert mốc lớn) |
| Giả định có mạng ở first launch | Trắng màn/treo spinner ngoài vùng phủ |
| Bỏ kiến trúc arm64 | Sai kiểu số trên Series 9+/Ultra 2 |
| Lạm dụng Foundation Models on-device | WatchOS 27 chạy **qua mạng** — cần fallback |

## 13. Design System Rules (token)

| Hạng mục | Quy định |
|---|---|
| **Typography** | SF Compact/Dynamic Type; chữ to, ít chữ; text phụ tối thiểu 11 pt; nhãn ≤ 3 từ |
| **Spacing** | Nhịp 4/8 pt; khoảng cách rộng; tối đa **2–3 control/hàng** |
| **Complication sizes** | 42/44.5/47/50 pt (84/89/94/100 px @2x); 27/28.5/31/32 pt (54/57/62/64 px @2x); 11/11.5 pt (22/23 px @2x) |
| **Radius** | Tôn trọng hình dạng màn (bo tròn) & bezel |
| **Elevation** | Gần như không shadow; dùng tương phản & material hệ thống |
| **Materials** | full-screen: ultraThin/thin/regular/thick; vibrant fill cho control; `containerBackground` |
| **Text prominence** | primary · secondary · tertiary · quaternary (vibrant) |
| **Motion** | Rất ngắn, rõ mục đích; tôn trọng Reduce Motion |
| **Color** | Semantic; hoạt động ở tinted/Always-On; **không chỉ màu** để truyền tin |
| **Adaptivity** | Chạy tốt mọi cỡ 40–49 mm + **nhiều đời máy**; layout dọc |

## 14. AI Decision Framework

```
IF platform == Apple Watch
THEN
  Primary goal = glanceable interaction ("Apple Watch Moment": 10 giây)
  Layout       = dọc, 1 ý/màn, ≤ 3 dòng chính, 2–3 control/hàng, theo grid hệ thống
  Navigation   = complication/Smart Stack → app → ≤ 2 tầng; luôn có lối thoát
  Ưu tiên      = 1) Thông tin  2) Hành động  3) Thoát
  Input        = touch + Crown (+touch thay thế) + dictation + haptics
  Bắt buộc     = Always-On đúng · nhãn ≤ 3 từ · haptics có nghĩa · hỗ trợ mọi kích cỡ/mọi đời máy
  Tránh        = form · bàn phím · nhiều bước · nội dung dày · điều hướng sâu · chỉ 1 family

# Chọn không gian
IF mục đích là HÀNH ĐỘNG nhanh        THEN Control (Control Center/Smart Stack/Action button)
IF mục đích là THÔNG TIN suốt ngày     THEN Widget (timeline)
IF là SỰ KIỆN có start–end             THEN Live Activity (→ tự lên Smart Stack)
IF cần nội dung đúng ngữ cảnh thực     THEN RelevanceKit (date/sleep/fitness/location/POI)
IF nhiều sự kiện chồng nhau            THEN relevant widget + associatedKind (chống trùng)

# Bố cục & tương tác
IF điều hướng ngang cấp 2–5           THEN TabView (verticalPage), tab giãn theo nội dung
IF có source list + detail             THEN NavigationSplitView, khởi tạo selection
IF phân cấp sâu                       THEN NavigationStack (large title ở view đầu)
IF thông tin dày + corner controls     THEN Dial view (scenePadding, ≤ 4 corner controls)
IF chart/metric                        THEN Infographic layout
IF cần chỉnh giá trị                   THEN Crown + haptics + touch thay thế
IF hành động ngoài màn hình            THEN Action button (≤ 3 từ) + haptics

# Trạng thái & kỹ thuật
IF Always-On                           THEN dim phần phụ, giữ nội dung chính; isLuminanceReduced
IF tác vụ cần nhập nhiều text          THEN chuyển sang iPhone (hoặc dictation tối giản)
IF phiên dài (workout)                 THEN metric + Always-On + kết thúc rõ
IF widget cần cập nhật                 THEN timeline policy / APNs (26) / Watch Connectivity (27), tôn trọng budget
IF first launch không mạng             THEN có nội dung ngay + tải nền + trạng thái offline
IF dùng Foundation Models              THEN kiểm availability + fallback (network-only)
IF render 3D                           THEN SwiftUI Canvas (SceneKit deprecated; RealityKit không có)
```

**Nguồn:** `research/03-watchos/{SUMMARY,CHECKLIST,DIGEST,INDEX}.md` · `notes/hig-*.md` ·
`transcripts/` (12 bài giảng 2021–2026) · `assets/` (16 ảnh).
