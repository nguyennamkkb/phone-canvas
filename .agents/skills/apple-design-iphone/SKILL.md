---
name: apple-design-iphone
description: "Senior-level iPhone (iOS) product design skill for the Apple ecosystem. Use when designing new iPhone screens, reviewing/auditing wireframes and UX flows, choosing navigation or layout, specifying components, or checking accessibility — for any app on iPhone (iOS 18–26+, Liquid Glass era). Self-contained: mindset, principles, IA, layout, component library, screens, patterns, interaction, a11y, performance, review checklist, failure modes, design-system tokens, and an AI decision framework."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "iPhone (iOS)"
  updated: "2026-09-24"
  sources: "research/01-mobile-design/"
---

# iPhone Design — Senior Skill

<!-- refs -->
> **Tham chiếu:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md)








> Nguồn nền: Apple HIG (Layout, Typography, Color, Materials, Motion, Accessibility, Navigation & search,
> Tab bars, Toolbars, Buttons, Lists & tables, Menus & actions, Modality, Searching, Onboarding, Feedback,
> Loading, Settings, Undo & redo, Entering data) + WWDC25 (356, 219, 323, 284, 359, 220, 337, 316).
> Chi tiết thô: `research/01-mobile-design/`.

## 1. Platform Mindset

- **Sinh ra để làm gì:** hoàn thành công việc nhanh, trong tay, mọi lúc mọi nơi. Là thiết bị *cá nhân*,
  *luôn bên người*, là trung tâm của hệ sinh thái Apple.
- **Hoàn cảnh người dùng:** một tay, đang di chuyển, phân tán chú ý, ánh sáng thay đổi, đôi khi mở
  nhanh 5–20 giây để làm một việc rồi cất đi.
- **Mục tiêu platform:** *fast task completion* + *glanceable return*. Không phải nơi cho luồng
  công việc dài, bảng dữ liệu dày, hay nhập liệu phức tạp.
- **Ràng buộc gốc:** màn hình hẹp (compact width), ngón tay cái che nội dung, nhập text tốn kém.
- **Hệ quả thiết kế:** ưu tiên 1 màn hình = 1 mục tiêu; luồng ngắn; progressive disclosure; mọi
  thứ quan trọng nằm trong tầm ngón tay; thoát ra luôn dễ.

## 2. Design Principles

**WHEN designing on iPhone → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Đặt nội dung quan trọng ở nửa trên & gần leading edge | Đặt hành động chính ở góc xa ngón tay cái | Thứ tự đọc trên→dưới; tay cầm một tay |
| Dùng tab bar cho 3–5 mục ngang cấp | Nhồi >5 tab hoặc tab lồng tab | Người dùng cần thấy toàn bộ bản đồ điều hướng |
| Dùng progressive disclosure (menu, sheet, nested) | Bày hết mọi lựa chọn trên một màn | Quá nhiều lựa chọn làm chậm quyết định |
| Tách control khỏi content bằng Liquid Glass + scroll edge effect | Đặt nền đặc/semi-opaque dưới control | Control phải nổi trên nội dung, không cắt nội dung |
| Tôn trọng safe area & Dynamic Island | Để nội dung chui dưới Dynamic Island | Vật lý che khuất nội dung |
| Hỗ trợ Dynamic Type tới cỡ lớn nhất | Khoá cỡ chữ / layout cứng | Người dùng phụ thuộc cỡ chữ lớn |
| Cho phép thoát modal rõ ràng (Close/Done/swipe down) | Nhốt người dùng vào luồng nhiều bước | Sợ mắc kẹt = không dám dùng |
| Dùng component hệ thống trước | Tự chế control nếu có sẵn | Hành vi & a11y miễn phí, quen thuộc |

**Quy tắc vàng:** *Nếu một luồng cần hơn 3 màn hình để hoàn tất một tác vụ phổ biến trên iPhone,
luồng đó đang sai.*

## 3. Information Architecture

| Cấu trúc | Dùng khi | KHÔNG dùng khi |
|---|---|---|
| **Tab bar** (dưới, 3–5 mục) | 3–5 khu vực ngang cấp, người dùng qua lại thường xuyên | >5 mục, hoặc các mục phụ thuộc nhau |
| **Hierarchy / push** | Đi sâu vào chi tiết theo một nhánh | Cần nhảy ngang nhiều lần |
| **Modal (sheet)** | Tác vụ tách biệt, cần hoàn tất hoặc huỷ rõ ràng | Nội dung cần duyệt qua lại với màn cha |
| **Full-screen modal** | Trải nghiệm nhập tâm (media, camera, onboarding) | Việc nhỏ, không cần chặn ngữ cảnh |
| **Popover** | Lựa chọn ngắn gắn với một điểm (thường iPad) | Trên iPhone: dùng sheet/action sheet |
| **Action sheet / alert** | Quyết định không thể hoàn tác, huỷ rõ | Thông tin thông thường (dùng banner/inline) |
| **Context menu (long-press)** | Hành động phụ trên một item | Hành động chính (phải hiển thị rõ) |
| **Overlay / HUD** | Tiến trình ngắn, không chặn lâu | Trạng thái dài (dùng inline progress) |

**Nguyên tắc phân cấp:** mỗi màn có **một** tiêu điểm thị giác; tiêu đề nói *đang ở đâu*, không
lặp lại nội dung; điều hướng ngang = tab bar, điều hướng dọc = push, tác vụ = modal.

## 4. Layout Rules

- **Size class là chân lý:** iPhone dọc = `compact width`; iPhone ngang (phần lớn) = `compact height`.
  Quyết định layout theo size class, **không** theo device/idiom.
- **Safe area:** tôn trọng top (Dynamic Island/status bar) và bottom (home indicator). Nội dung cuộn
  được phép chạy *dưới* thanh control, nhưng control phải nổi trên.
- **Dynamic Type:** text phải giãn nở; hàng ngang có thể phải **stack dọc** ở cỡ lớn; hàng bảng cao
  lên để không cắt chữ; dùng style hệ thống thay vì cỡ cố định.
- **Compact width:** một cột. Không đặt hai cột nội dung trên iPhone.
- **Landscape:** với app thường, giữ trải nghiệm quen thuộc; tránh "lộ" layout chỉ ở landscape.
  Nếu khoá orientation (game/media), vẫn phải resize tốt.
- **Margin & nhịp:** mép lề chuẩn 16 pt; nhịp 4/8 pt; cỡ chữ tối thiểu 11 pt (widget/annotation).
- **Che khuất:** vùng ngón tay cái (đáy) dành cho hành động chính; đỉnh dành cho thông tin/tiêu đề.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Button** | Kích hoạt hành động | Label ± icon, nền, vùng chạm | normal/pressed/disabled/loading | Tối đa 1 nút "primary" mỗi vùng; label là **động từ** | Vùng chạm ≥ 44×44 pt; label đọc được | Nút mờ không rõ vì sao; label "OK" chung chung |
| **Tab bar** | Điều hướng ngang cấp | 2–5 item, icon + label | selected/unselected/badge | Cao **68 pt**, mép trên cách đỉnh **46 pt** (hệ thống); không dùng cho hành động | VoiceOver đọc "tab, 2/5" | Nhồi quá 5; đổi tab = hành động phá huỷ |
| **Navigation bar / Toolbar** | Ngữ cảnh + hành động màn | Title, back, actions | inline/large title | Title ngắn; action ≤ 3; dùng Liquid Glass | Header là heading trong focus order | Nhồi 6 action; title dài xuống 2 dòng |
| **List** | Dữ liệu tuần tự, dễ quét | Row (leading, content, trailing) | plain/inset-grouped; swipe actions | Ưu tiên list cho nội dung dạng hàng; row cao đủ cho Dynamic Type | Row = 1 phần tử; swipe có alternative | Bảng dày đặc kiểu desktop; thiếu phân cách |
| **Grid / Collection** | Nội dung đồng dạng, thị giác | Cell, spacing, section header | lưới/ngang cuộn | 2 cột trên iPhone; giữ tỉ lệ ô ổn định | Cell có label đủ nghĩa | 4–5 cột trên iPhone = không đọc được |
| **Search** | Tìm trong tập lớn | Field + scope + results | idle/typing/results/empty | Đặt ở nơi dễ với tới; có **recent & suggestion**; empty state rõ | Không chỉ dựa vào placeholder; label tồn tại | Tìm không có kết quả mà không gợi ý |
| **Filter / Chip** | Thu hẹp tập kết quả | Chip label ± icon, trạng thái chọn | on/off/disabled | Hiển thị filter đang áp dụng; có "Xoá hết" | Chip = toggle, công bố trạng thái | Filter ngầm, người dùng không biết vì sao thiếu kết quả |
| **Carousel** | Duyệt ngang nội dung nổi bật | Card ngang, peek item kế | idle/dragging | Peek để gợi ý còn nội dung; snap | Có alternative dạng list cho VoiceOver | Cuộn ngang không dấu hiệu; item bị cắt vô tội vạ |
| **Sheet / Bottom sheet** | Tác vụ phụ, giữ ngữ cảnh | Grabber, header, content, detents | medium/large; dismissible | Có detents; swipe-down để đóng; không lồng sheet trong sheet | Focus bắt đầu trong sheet; trả focus khi đóng | Sheet chứa luồng dài cần nhiều màn |
| **Alert** | Quyết định chặn, quan trọng | Title, message, 2 nút | 1–2 nút | Dùng cho hậu quả nghiêm trọng; nút huỷ bên trái/ rõ ràng | Focus vào nút mặc định; đọc đủ title+message | Lạm dụng alert cho mọi thông báo |
| **Context menu** | Hành động phụ tại item | Preview + danh sách action | open/closed | Chỉ hành động phụ; giữ danh sách ngắn | Long-press có alternative (nút "More") | Chôn hành động chính trong menu ẩn |
| **Empty state** | Giải thích "trống" + hướng đi | Icon, tiêu đề, mô tả, CTA | first-run/no-results/error | Luôn có CTA tiếp theo; phân biệt "chưa có" vs "không tìm thấy" | Đọc được bởi VoiceOver | Màn trắng trơn không lời giải thích |
| **Loading state** | Cho biết đang xử lý | Spinner/skeleton/progress | determinate/indeterminate | <1s: không hiện; >1s: skeleton; >10s: progress + huỷ | `accessibilityLabel` "đang tải" | Spinner vô tận; layout nhảy khi tải xong |
| **Error state** | Giải thích lỗi + phục hồi | Icon, message, action | inline/toast/page | Nói **cái gì** sai và **làm gì** tiếp; không mã lỗi trần | Thông báo qua VoiceOver | Chỉ "Đã xảy ra lỗi" |
| **Progress indicator** | Tiến trình | Bar/ring/spinner | determinate/indeterminate | Determinate khi biết %; đặt gần nội dung liên quan | Cập nhật giá trị cho VoiceOver | Quay vô định cho tác vụ biết trước thời lượng |
| **Segmented control** | Chọn chế độ xem (2–5) | Segment ngang | selected/unselected | Dùng cho **view mode**, không cho form | Công bố "selected" | Quá nhiều segment → chữ bóp méo |
| **Toggle / Slider / Stepper** | Chỉnh giá trị | Control + label + giá trị | on/off/min/max | Áp dụng ngay (không cần Save); label rõ nghĩa | Điều khiển được bằng VoiceOver adjustable | Slider không hiện giá trị hiện tại |
| **Text field** | Nhập liệu | Label, field, helper/error | idle/focus/error/disabled | Label luôn hiển thị (không chỉ placeholder); bàn phím đúng loại | Error nêu cách sửa | Placeholder biến mất khi gõ |
| **Picker / Date picker** | Chọn từ tập giá trị | Wheel/menu/inline | idle/open | Dùng menu/wheel phù hợp ngữ cảnh; mặc định hợp lý | Value đọc được | Danh sách quá dài không tìm kiếm |
| **Toast / Banner** | Phản hồi không chặn | Icon + text, tự ẩn | appears/dismissed | Ngắn, không chứa hành động quan trọng duy nhất | Live region thông báo | Banner mang thông tin cần hành động |

## 6. Screen Inventory (mẫu theo loại app)

| Màn hình | Mục tiêu | Lưu ý thiết kế |
|---|---|---|
| Splash / Launch | Chuyển tiếp tức thời | Không quảng cáo; không chặn |
| Onboarding | Định hướng giá trị, xin quyền đúng lúc | Ngắn, có "Skip"; xin quyền khi cần |
| Sign-in / Sign-up | Vào app nhanh | Sign in with Apple, passkey; không form dài |
| Home / Feed | Điểm vào nội dung chính | 1 tiêu điểm; tab bar ổn định |
| Search | Tìm & khám phá | Recents + suggestions + empty state |
| Category / Browse | Duyệt theo cấu trúc | Filter rõ, đếm kết quả |
| Detail | Quyết định | Thông tin chính trên màn đầu; CTA cố định |
| Create / Edit | Tạo nội dung | Lưu tự động hoặc Done rõ; undo |
| Player / Viewer | Tiêu thụ nội dung | Control nổi, ẩn chrome, cử chỉ chuẩn |
| Profile / Account | Danh tính & cài đặt | Tách "tài khoản" khỏi "cài đặt app" |
| Settings | Tuỳ chỉnh | Nhóm logic; mặc định hợp lý; không bắt buộc |
| Notifications / Inbox | Cập nhật | Nhóm theo thời gian/ngữ cảnh; hành động nhanh |
| Empty / Error / Loading | Trạng thái hệ thống | Luôn thiết kế cùng màn chính |

## 7. UX Patterns

**Browse · Search · Discover · Create · Edit · Watch · Listen · Navigate · Track · Share**

- **Browse → Detail:** list/grid giữ vị trí cuộn khi quay lại.
- **Search:** luôn có trạng thái *đang gõ*, *có kết quả*, *không kết quả*, *lỗi mạng*.
- **Create/Edit:** có **Undo/Redo** (shake hoặc nút); thoát giữa chừng phải hỏi nếu mất dữ liệu.
- **Watch/Listen:** cử chỉ chuẩn (tap giữa = play/pause; cuộn ngang = seek); không tự chế.
- **Track/Progress:** trạng thái tiến trình hiển thị ngay tại item, không cần mở chi tiết.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | Vùng chạm ≥ 44×44 pt; khoảng cách tâm ≥ 60 pt khi dễ chạm nhầm |
| **Gestures** | Tap, long-press, swipe, pinch, drag. Chỉ dùng cử chỉ **chuẩn hệ thống**; mọi cử chỉ ẩn phải có alternative hiển thị |
| **Haptics** | Phản hồi cho hành động có ý nghĩa (thành công, cảnh báo); không rung vô cớ |
| **Keyboard** | Hỗ trợ Full Keyboard Access; tôn trọng shortcut hệ thống |
| **Voice** | Voice Control cho mọi hành động; Siri cho tác vụ tần suất cao |
| **Motion** | Dùng chuyển động để giải thích thay đổi trạng thái; tôn trọng Reduce Motion |
| **Focus order** | Theo thứ tự đọc; trả focus về nơi xuất phát khi đóng modal |

## 9. Accessibility

- **VoiceOver:** mọi phần tử tương tác có label; nhóm hợp lý; thứ tự đọc = thứ tự thị giác.
- **Dynamic Type:** hỗ trợ tới cỡ lớn nhất; không cắt/che chữ; layout tái bố cục.
- **Contrast:** đạt chuẩn tối thiểu; dùng công cụ đo contrast chuẩn; không truyền tải chỉ bằng màu.
- **Motion:** tôn trọng Reduce Motion; tránh dao động tần số ~0.2 Hz (dễ gây khó chịu).
- **Hit region:** ≥ 44×44 pt; padding ~12 pt quanh phần tử có bezel, ~24 pt quanh phần tử không bezel.
- **Nhiều kênh:** chức năng cốt lõi truy cập được qua >1 cách (touch, voice, keyboard, switch).
- **Checklist:** [ ] VoiceOver labels · [ ] Dynamic Type max · [ ] contrast · [ ] reduce motion ·
  [ ] hit regions · [ ] Voice Control · [ ] Full Keyboard Access.

## 10. Performance Rules (nhận thức & kỹ thuật)

- Không jank: animation 60/120 fps; tránh shadow lớn + blur lồng nhau.
- Không quá tải nhận thức: ≤ 1 hành động chính/màn; ≤ 3 lựa chọn ngang cấp.
- Không phân cấp sâu: ≤ 3 tầng push tới nội dung chính.
- Không animation nặng: mỗi màn 1–2 chuyển động có mục đích; tránh "motion trang trí".
- Không điều hướng rối: trạng thái tab ổn định; không tự đổi tab.
- Tải nội dung: skeleton thay vì spinner toàn màn; giữ vị trí cuộn; tránh layout shift.

## 11. Senior Review Checklist

- [ ] **Navigation:** đến mọi nơi ≤ 3 bước; luôn biết đang ở đâu & thoát thế nào.
- [ ] **Hierarchy:** 1 tiêu điểm/màn; tiêu đề nói vị trí; nội dung quan trọng trên màn đầu.
- [ ] **Accessibility:** mục 9 pass toàn bộ.
- [ ] **Discoverability:** hành động chính hiển thị; không chôn trong long-press.
- [ ] **Performance:** không jank; ít chuyển động; tải có skeleton.
- [ ] **Empty states:** có CTA; phân biệt chưa-có vs không-tìm-thấy.
- [ ] **Error states:** nêu nguyên nhân + cách phục hồi.
- [ ] **Loading states:** ngưỡng 1s/10s; có huỷ khi lâu.
- [ ] **Touch targets:** ≥ 44×44 pt; khoảng cách an toàn.
- [ ] **Dynamic Type & dark mode:** kiểm ở cỡ lớn nhất và cả hai giao diện màu.

## 12. Failure Modes (lỗi junior hay mắc)

| Lỗi | Vì sao sai |
|---|---|
| Bê UI desktop/iPad sang iPhone | Cột đôi + bảng dày không đọc nổi trên màn hẹp |
| Nhồi 6–7 tab | Vượt giới hạn nhận thức; tab bar bị nén, label mất |
| Dùng alert cho mọi thông báo | Alert là ngắt quãng mạnh; lạm dụng gây "alert fatigue" |
| Placeholder thay label | Khi gõ, người dùng mất ngữ cảnh |
| Long-press là cách duy nhất | Không khám phá được; a11y kém |
| Spinner toàn màn cho tải ngắn | Tạo cảm giác chậm; layout nhảy |
| Modal lồng modal | Mất phương hướng; khó thoát |
| Khoá cỡ chữ / layout cứng | Vỡ ở Dynamic Type lớn |
| Cử chỉ tự chế không alternative | Không khám phá được, xung đột hệ thống |
| Không thiết kế empty/error/loading | Trạng thái phổ biến nhất bị bỏ quên |

## 13. Design System Rules (token)

| Hạng mục | Quy định |
|---|---|
| **Typography** | SF Pro; dùng Dynamic Type style (largeTitle…caption); không hard-code; font mỏng → tăng cỡ; tối thiểu 11 pt cho chữ phụ |
| **Spacing** | Nhịp 4/8 pt; lề chuẩn 16 pt; padding control 12/24 pt (có/không bezel) |
| **Radius** | Bo góc nhất quán theo container; control hệ thống giữ radius hệ thống; không trộn nhiều bán kính tuỳ tiện |
| **Elevation** | Ưu tiên **material** (Liquid Glass) hơn shadow; shadow nhẹ, tối đa 1 tầng |
| **Motion** | 200–400 ms cho chuyển tiếp UI; spring cho tương tác trực tiếp; ease-out khi vào, ease-in khi ra; tôn trọng Reduce Motion |
| **Color** | Dùng màu semantic hệ thống; độ tương phản đạt chuẩn; không truyền tải chỉ bằng màu; dark mode là hạng nhất |
| **Adaptivity** | Layout theo size class; text giãn nở; component tự thích ứng trước khi vẽ cái mới |

## 14. AI Decision Framework

```
IF platform == iPhone
THEN
  Primary goal   = hoàn tất tác vụ nhanh
  Layout         = 1 cột, compact width, theo size class
  Navigation     = tab bar (3–5) + push; tác vụ = sheet/modal
  Action chính   = 1/màn, đặt trong tầm ngón tay, label là động từ
  Ưu tiên        = 1) Nội dung  2) Hành động  3) Thoát
  Bắt buộc       = safe area · Dynamic Type · 44pt · dark mode · empty/error/loading
  Tránh          = bảng nhiều cột · form dài · >5 tab · long-press-only · modal lồng nhau

IF tác vụ cần >3 màn hình        THEN rút gọn hoặc chuyển sang iPad/Mac
IF nội dung cần so sánh nhiều cột THEN đó là tín hiệu của iPad, không phải iPhone
IF cần nhập nhiều text           THEN ưu tiên autofill/scan/voice, giảm gõ
IF hành động phá huỷ             THEN confirm rõ (alert/action sheet) + undo nếu được
IF tải >1s                       THEN skeleton; >10s THEN progress + huỷ
IF dữ liệu nhạy cảm              THEN ẩn khi khoá máy; không hiện trên lock screen
```

**Nguồn:** `research/01-mobile-design/{SUMMARY,CHECKLIST,DIGEST}.md` · `notes/hig-*.md` · `transcripts/2025-*.md`.
