---
name: mobile-ux-fundamentals
description: "Platform-agnostic mobile UI/UX fundamentals for product designers and AI agents: touch targets, interaction states, primary/secondary hierarchy, presentation surfaces (sheet/dialog/snackbar/banner), state lifecycle (idle/loading/empty/error/offline), feedback and response-time limits, thumb-zone ergonomics, gestures and accessibility (WCAG 2.5.x). Use when designing, auditing, or reviewing any mobile screen, flow, wireframe, or design system — or when a decision must be justified with numbers rather than taste. Complements the Apple platform skills (apple-design-iphone, apple-design-ipad, apple-design-watch, apple-design-widget, apple-design-iphone-duo)."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.0"
  platform: "Cross-platform mobile (iOS / Android / mobile web)"
  updated: "2026-09-25"
  sources: "research/07-mobile-ux/"
---

# Mobile UX Fundamentals — Senior Skill

> **Tham chiếu:** [TOUCH-AND-TARGETS](references/TOUCH-AND-TARGETS.md) · [INTERACTION-STATES](references/INTERACTION-STATES.md) · [HIERARCHY](references/HIERARCHY.md) · [PRESENTATION](references/PRESENTATION.md) · [STATE-LIFECYCLE](references/STATE-LIFECYCLE.md) · [FEEDBACK-AND-TIMING](references/FEEDBACK-AND-TIMING.md) · [GESTURES-AND-A11Y](references/GESTURES-AND-A11Y.md) · [EVIDENCE](references/EVIDENCE.md) · [SOURCES](references/SOURCES.md)

> Nguồn: WCAG 2.2 (W3C), Apple HIG, Material Design 3, IBM Carbon, Nielsen Norman Group,
> nghiên cứu ergonomics của Steven Hoober + thực hành ngành. Chi tiết thô: `research/07-mobile-ux/`.
> Đây là **lớp nền tảng chung**; khi làm trong hệ Apple, dùng kèm skill nền tảng tương ứng.

## 1. Platform Mindset

- **Điện thoại là gì trong đời sống:** thiết bị **cá nhân, luôn bên người, dùng khi bị phân tán**.
  Người dùng thường: một tay, đang di chuyển, ngoài sáng, có việc khác đang chờ.
- **Mục tiêu:** giúp hoàn tất việc **nhanh, rõ, và tha thứ lỗi** — không phải phô diễn thiết kế.
- **Ràng buộc gốc:** (1) ngón tay to hơn điểm ảnh; (2) màn nhỏ ⇒ chú ý ngắn; (3) ngữ cảnh thay đổi
  (mạng, ánh sáng, một tay, pin); (4) người dùng **không đọc, họ quét**.
- **Hệ quả:** vùng chạm đủ lớn · một mục tiêu/màn · thứ bậc rõ · trạng thái đầy đủ · phản hồi tức thời ·
  luồng ngắn và có lối thoát.

## 2. Design Principles

**WHEN designing mobile → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Vùng chạm ≥ **44×44 pt / 48×48 dp** (sàn **24×24 px**) | Icon 16 px không mở rộng vùng chạm | Ngón tay không chính xác như chuột |
| **Một primary action** mỗi màn | Nhiều nút nổi ngang nhau | Nhiều primary sẽ triệt tiêu nhau |
| Hành động chính trong **green zone** (đáy) | CTA quan trọng ở góc trên | Ngón cái không với tới / phải đổi tay |
| Nhãn nút = **động từ + kết quả** | "OK", "Submit", "Continue" chung chung | Người dùng cần biết *chuyện gì sẽ xảy ra* |
| Phản hồi **< 100 ms** cho mọi tap | Im lặng sau khi bấm | Người dùng tự hỏi "đã nhận chưa?" |
| Thiết kế **loading/empty/error/offline** cùng màn chính | Chỉ làm happy path | First-time user gặp empty state trước tiên |
| Lỗi nêu **nguyên nhân + cách sửa** | "Đã xảy ra lỗi" | Lỗi không phục hồi = dead-end |
| Cho **undo** cho hành động phá huỷ | Chỉ hỏi confirm mọi thứ | Undo nhẹ nhàng hơn; confirm gây mệt |
| Mọi cử chỉ có **đường thay thế** | Cử chỉ ẩn là cách duy nhất | Không khám phá được + kém a11y |
| Thiết kế cho **một tay, cả trái lẫn phải** | Giả định hai tay, tay phải | 49% dùng một tay, 33% trong đó là tay trái |

**Quy tắc vàng:** *Nếu người dùng phải suy nghĩ về việc "chạm ở đâu" hoặc "chuyện gì vừa xảy ra",
thiết kế đang thất bại.*

## 3. Information Architecture

| Quyết định | Hướng dẫn |
|---|---|
| **Độ sâu vs độ rộng** | Ưu tiên **rộng hơn sâu**: 3–5 mục ngang cấp > cây 5 tầng |
| **Điều hướng chính** | Bottom navigation/tab bar (3–5 mục), ổn định, không tự đổi |
| **Tiến sâu** | Push/navigation stack cho một nhánh; ≤ 3 tầng tới nội dung chính |
| **Tác vụ tách biệt** | Modal/sheet — luôn có Close/Back rõ |
| **Nội dung phụ** | Progressive disclosure (menu, expand, nested) |
| **Hành động phụ của một item** | Context menu / overflow, **không** để hành động chính ở đó |
| **Hành động phá huỷ** | Tách khỏi hành động chính; cần confirm hoặc undo |

**Nguyên tắc:** mỗi màn trả lời được 3 câu — *Tôi đang ở đâu? Tôi làm được gì? Tôi thoát thế nào?*

## 4. Layout Rules

- **Thumb zone (Hoober):** Green (đáy giữa) = hành động chính · Yellow (nửa dưới hai bên) = phụ ·
  Red (đỉnh, góc xa) = hiếm dùng. **67%** người dùng ngón cái **phải** khi một tay.
- **Kích thước theo vị trí:** mép trên ~**11 mm**, giữa ~**7 mm**, đáy ~**12 mm** (ngón cái tiếp cận
  đáy ở góc phẳng hơn ⇒ cần vùng chạm lớn hơn).
- **Nhịp & lề:** grid 4/8 pt; lề màn 16 pt; padding control 12/24 pt.
- **Safe area:** chừa tai thỏ/status bar/home indicator; nội dung cuộn được phép chạy dưới thanh.
- **Một cột** trên điện thoại; không bảng nhiều cột.
- **Dynamic Type / font scale:** layout phải tái bố cục, không cắt chữ; text phụ ≥ 11 pt.
- **Mật độ:** thoáng hơn desktop; nhóm bằng khoảng trắng, không bằng đường kẻ dày.
- **Orientation:** portrait là mặc định; landscape chỉ khi có lý do (media, game).
- **Bàn phím:** không che field đang nhập; có nút Done/Next đúng loại bàn phím.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Button** | Hành động | Label ± icon, container, hit area | enabled/disabled/pressed/loading (+hover/focus) | 1 primary/view; secondary/tertiary/ghost hạ dần; nhãn động từ | ≥44×44; contrast 3:1/4.5:1; focus ring | Nhiều primary; nhãn mơ hồ; loading ẩn label |
| **Icon button** | Hành động nhỏ gọn | Icon + hit area mở rộng | như button | Mở rộng vùng chạm bằng padding; tooltip/label ẩn | `aria-label`/`accessibilityLabel` | Icon 16 px không padding |
| **Text field** | Nhập liệu | Label, field, helper/error | idle/focus/error/disabled/filled | Label **luôn hiện**; bàn phím đúng loại; autofill | Error nêu cách sửa; label liên kết | Placeholder thay label; lỗi chung chung |
| **List / row** | Dữ liệu tuần tự | Leading, content, trailing | default/pressed/selected/disabled | Row = 1 mục; swipe có alternative | Row = 1 phần tử; đủ nghĩa | Bảng desktop thu nhỏ |
| **Card** | Nhóm nội dung | Media, title, meta, action | default/pressed/selected | 1 hành động chính/card; không lồng card | Toàn card là 1 target hoặc có nút rõ | Card lồng card, nhiều link |
| **Bottom navigation** | Điều hướng ngang cấp | 3–5 item icon+label | selected/unselected/badge | Không > 5; giữ trạng thái; icon+label | Công bố "tab x/y" | Đổi tab = hành động phá huỷ |
| **Search** | Tìm | Field + suggestions + results | idle/typing/results/empty/error | Recents + suggestions; empty có gợi ý | Không chỉ placeholder | Không kết quả mà không gợi ý |
| **Filter / chip** | Thu hẹp kết quả | Chip ± icon | on/off/disabled | Hiện filter đang áp dụng + "Xoá hết" | Chip = toggle, công bố trạng thái | Filter ngầm |
| **Bottom sheet** | Tác vụ ngữ cảnh | Grabber, header, content, detents | collapsed/expanded/dismissed | Tương tác **ngắn**; có Close + Back; **không stack** | Focus vào sheet; trả focus | Sheet chứa luồng dài; stack sheet |
| **Dialog / alert** | Quyết định chặn | Title, message, ≤2 nút | open/closed | Chỉ khi **cần** quyết định; nút huỷ rõ | Focus vào nút mặc định | Lạm dụng cho mọi thông báo |
| **Snackbar / toast** | Phản hồi nhẹ | Text ± 1 action | appears/dismissed | ≤1 action; không che nav/FAB; không stack | Live region công bố | Là cách duy nhất tới use case chính |
| **Banner** | Trạng thái bền | Icon + text ± action | info/warning/error | Offline/mất kết nối/lỗi toàn cục | role/status | Banner mang hành động duy nhất |
| **Skeleton** | Đang tải | Khối khớp layout | shimmer | Khớp layout thật; hiện **sau 200 ms**; trần ~5 s | `aria-hidden` khối + `aria-busy` container | Skeleton lệch layout ⇒ shift |
| **Empty state** | Giải thích trống | Visual, header, explainer, CTA | first-run/no-results/error | Trả lời *gì/vì sao/làm gì*; là onboarding | Đọc được | Màn trắng |
| **Error state** | Lỗi + phục hồi | Icon, message, action | inline/field/page | Cụ thể, hành động được, phục hồi được | Thông báo qua screen reader | "Đã xảy ra lỗi" |
| **Progress** | Tiến trình | bar/ring/spinner | determinate/indeterminate | Determinate khi biết %; > 10 s có huỷ | Công bố giá trị | Spinner vô định cho việc biết trước |

### 5.1 Chuẩn số phải nhớ

| Hạng mục | Giá trị |
|---|---|
| Vùng chạm tối thiểu (pháp lý, WCAG 2.5.8 AA) | **24×24 CSS px** (hoặc spacing tương đương) |
| Vùng chạm nên build | **44×44 pt** (Apple) · **48×48 dp** (Material); nâng cao AAA **44×44** |
| Kích thước theo vị trí | trên ~11 mm · giữa ~7 mm · đáy ~12 mm |
| Phản hồi | **< 100 ms**; > 1 s cần chỉ báo; > 10 s cần progress + huỷ |
| Skeleton | hiện sau **200 ms**, trần **~5 s** |
| Contrast | text **4.5:1** (lớn 3:1); UI/đồ hoạ **3:1** |
| Nhịp/lề | grid 4/8 pt; lề 16 pt; padding 12/24 pt |
| State layer (Material) | hover 8% · focus 10% · press 10% · drag 16% · disabled 38% |

> Chi tiết: [TOUCH-AND-TARGETS](references/TOUCH-AND-TARGETS.md) · [INTERACTION-STATES](references/INTERACTION-STATES.md).

## 6. Screen Inventory

| Màn hình | Mục tiêu | Bắt buộc có |
|---|---|---|
| Splash / Launch | Chuyển tiếp tức thời | Không quảng cáo, không chặn |
| Onboarding | Định hướng giá trị | Ngắn, có Skip; xin quyền đúng lúc |
| Sign-in | Vào nhanh | Autofill/passkey; không form dài |
| Home / Feed | Điểm vào nội dung | 1 tiêu điểm; nav ổn định |
| Search | Tìm & khám phá | Recents, suggestions, empty state |
| Detail | Quyết định | Thông tin chính ở màn đầu; CTA rõ |
| Create / Edit | Tạo nội dung | Autosave hoặc Done; **undo** |
| Profile / Settings | Danh tính & tuỳ chỉnh | Tách tài khoản vs cài đặt; mặc định tốt |
| Notifications / Inbox | Cập nhật | Nhóm theo thời gian; hành động nhanh |
| **States** (loading/empty/error/offline) | Trạng thái | **Thiết kế cùng màn chính** |

## 7. UX Patterns

**Browse · Search · Discover · Create · Edit · Transact · Notify · Onboard · Recover**

- **Browse → Detail:** giữ vị trí cuộn khi quay lại.
- **Search:** 4 trạng thái bắt buộc (idle/typing/results/empty) + lỗi mạng.
- **Create/Edit:** undo/redo; thoát giữa chừng phải hỏi nếu mất dữ liệu.
- **Transact:** bước rõ, tiến trình, không mất dữ liệu khi lỗi.
- **Notify:** phân biệt **alert** (cần biết ngay) vs **suggestion** (nhẹ nhàng).
- **Onboard:** empty state = onboarding; có Skip ở mọi bước.
- **Recover:** lỗi biết cách sửa; offline có nội dung thay thế; retry dễ.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | ≥ 44×44 pt/48 dp; khoảng cách an toàn; tap phản hồi ngay |
| **Gestures** | Chỉ cử chỉ chuẩn; **mọi cử chỉ có alternative** (WCAG 2.5.1); drag có cách không-kéo (2.5.7) |
| **Keyboard** | Focus order logic; focus ring rõ; shortcut chuẩn |
| **Voice** | Mọi hành động chính có đường voice; label đọc được |
| **Pointer** | Hover chỉ để *dự đoán*, không để kích hoạt |
| **Feedback** | Visual + haptic trong < 100 ms; nhất quán theo ngữ nghĩa |
| **Cancellation** | Hành động kích hoạt khi **nhả** (không phải khi nhấn); cho phép huỷ |

## 9. Accessibility

- **Target size:** ≥ 24×24 px (AA) — nên 44/48; control gần nhau phải có spacing.
- **Gestures:** alternative cho multipoint/path-based (2.5.1) và dragging (2.5.7).
- **Contrast:** text ≥ 4.5:1 (lớn ≥ 3:1); UI/đồ hoạ ≥ 3:1; **không** truyền tải chỉ bằng màu.
- **Screen reader:** mọi phần tử có label/value/role; thứ tự đọc = thị giác; trạng thái được công bố.
- **Text scaling:** hỗ trợ cỡ chữ lớn nhất; không cắt/che; text spacing không vỡ (1.4.12).
- **Motion:** tôn trọng Reduce Motion; tránh nhấp nháy/dao động.
- **Focus:** focus ring thấy rõ; không trap focus; trả focus khi đóng modal.
- **Checklist:** [ ] targets · [ ] gestures · [ ] contrast · [ ] labels · [ ] text scale ·
  [ ] focus · [ ] reduce motion · [ ] không chỉ màu.

## 10. Performance Rules

- **Ngưỡng phản hồi:** < 100 ms tức thời · ≤ 1 s giữ flow · ≤ 10 s giữ chú ý · > 10 s cần progress + huỷ.
- **Không jank:** giữ 60 fps; tránh shadow/blur lồng nhau.
- **Không layout shift:** skeleton khớp layout; ảnh có kích thước trước.
- **Không quá tải nhận thức:** 1 mục tiêu/màn; ≤ 3 lựa chọn ngang cấp.
- **Không phân cấp sâu:** ≤ 3 tầng tới nội dung chính.
- **Không animation trang trí:** mỗi chuyển động có mục đích; 150–300 ms cho UI.
- **Tải:** đừng để người dùng nhìn màn trắng; có nội dung hữu ích sớm.

## 11. Senior Review Checklist

- [ ] **Touch:** mọi target ≥ 44/48; control gần nhau có đủ spacing.
- [ ] **Hierarchy:** đúng 1 primary/màn; nhãn nút là động từ; hậu quả rõ.
- [ ] **Ergonomics:** hành động chính trong green zone; test một tay (trái + phải).
- [ ] **Navigation:** đến mọi nơi ≤ 3 bước; luôn biết đang ở đâu & thoát thế nào.
- [ ] **States:** có **idle · loading · empty · error** (+ partial/offline) — không chỉ happy path.
- [ ] **Feedback:** < 100 ms; > 1 s có chỉ báo; > 10 s có progress + huỷ.
- [ ] **Accessibility:** mục 9 pass.
- [ ] **Gestures:** mọi gesture có alternative; drag có cách không-kéo.
- [ ] **Performance:** không jank, không layout shift, không spinner trắng.
- [ ] **Copy:** ngắn, cụ thể, nêu kết quả; lỗi nêu cách sửa.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Target < 24 px hoặc icon nhỏ không padding | Fail WCAG 2.5.8; người có tremor không dùng được |
| Nhiều primary button trên một màn | Triệt tiêu thứ bậc; người dùng không biết chọn gì |
| CTA quan trọng ở góc trên (red zone) | Phải đổi tay/duỗi; tăng lỗi và bỏ dở |
| Placeholder thay label | Khi gõ mất ngữ cảnh |
| Chỉ thiết kế happy path | Empty/loading/error là trạng thái phổ biến nhất lúc đầu |
| Lỗi chung chung, không phục hồi | Dead-end; người dùng bỏ |
| Spinner giữa màn trắng | Không cho biết đang chờ gì; cảm giác chậm |
| Skeleton không khớp layout | Layout shift khi dữ liệu về |
| Cử chỉ ẩn là cách duy nhất | Không khám phá được; fail 2.5.1 |
| Bắt buộc kéo-thả | Fail 2.5.7; khó với người hạn chế vận động |
| Stack nhiều sheet / sheet chứa luồng dài | Mất phương hướng, khó thoát |
| Snackbar mang use case chính | Nó biến mất; không phải chỗ của hành động cốt lõi |
| Confirm cho mọi hành động | Mệt mỏi; nên ưu tiên undo |
| Quên test một tay / cỡ chữ lớn | Vỡ ở điều kiện thật |

## 13. Design System Rules (token)

| Hạng mục | Quy định |
|---|---|
| **Touch** | 44 pt / 48 dp (nên 48 px+ cho người lớn tuổi); mở rộng bằng padding |
| **Spacing** | grid 4/8; lề 16; padding control 12/24; khoảng cách tối thiểu giữa target = đủ để vòng 24 px không chồng |
| **Typography** | thang bậc rõ (display → caption); text phụ ≥ 11 pt; hỗ trợ font scale |
| **Radius** | nhất quán theo container; không trộn tuỳ tiện |
| **Elevation** | ưu tiên material/tương phản hơn shadow; shadow tối đa 1 tầng |
| **Motion** | 150–300 ms; vào ease-out, ra ease-in; tôn trọng Reduce Motion |
| **Color** | semantic; contrast 4.5:1 text / 3:1 UI; không chỉ màu để truyền tin |
| **States** | định nghĩa đủ enabled/disabled/pressed/loading/focus; state layer theo Material (8/10/10/16/38%) |
| **Content** | microcopy ngắn, động từ, nêu kết quả; lỗi nêu cách sửa |

## 14. AI Decision Framework

```
IF mobile screen/flow
THEN
  Primary goal = hoàn tất việc nhanh, rõ, tha thứ lỗi
  Layout       = 1 cột; hành động chính ở green zone; nhịp 4/8; lề 16
  Hierarchy    = ĐÚNG 1 primary/màn; nhãn = động từ + kết quả
  States       = BẮT BUỘC idle · loading · empty · error (+ partial/offline nếu có)
  Feedback     = < 100 ms; > 1 s có chỉ báo; > 10 s có progress + huỷ
  Touch        = ≥ 44×44 pt / 48×48 dp (sàn 24×24)
  Tránh        = nhiều primary · CTA ở red zone · placeholder-only · dead-end error ·
                 cử chỉ ẩn không alternative · kéo-thả bắt buộc · spinner trắng

# Chọn vùng chạm
IF target < 24 px                          THEN FAIL (WCAG 2.5.8) — thêm padding hoặc spacing
IF control nằm mép trên/giữa               THEN tăng ≥ 31/20 pt (11/7 mm)
IF control hay dùng ở đáy                  THEN tăng ≥ 34 pt (12 mm) + đặt trong green zone

# Chọn bề mặt thể hiện
IF cần QUYẾT ĐỊNH để tiếp tục               THEN dialog/alert (≤2 nút, huỷ rõ)
IF tác vụ NGẮN + cần thấy nội dung nền      THEN bottom sheet (có Close + Back, KHÔNG stack)
IF chỉ PHẢN HỒI thoáng qua                  THEN snackbar (≤1 action)
IF trạng thái BỀN (offline/mất mạng/lỗi)    THEN banner
IF nội dung là trang/thông tin dài          THEN màn hình riêng, không sheet

# Trạng thái
IF đang tải > 200 ms                        THEN skeleton khớp layout (không spinner trắng)
IF tải > 5 s                                THEN chuyển progress/timeout + retry
IF dữ liệu rỗng                             THEN empty state: gì + vì sao + CTA (onboarding)
IF lỗi                                      THEN cụ thể + hành động + phục hồi (retry)
IF có thể mất dữ liệu                       THEN undo > confirm; nếu phá huỷ ⇒ confirm rõ

# Tương tác & a11y
IF dùng gesture (swipe/pinch/drag/long-press) THEN cung cấp alternative single-pointer
IF có kéo-thả                                THEN thêm nút/menu để làm không cần kéo
IF frame > 200 ms                            THEN giữ label + spinner (không ẩn label)
IF text scale lớn                            THEN tái bố cục, không cắt chữ
IF hành động phá huỷ                         THEN tách khỏi primary + confirm/undo
```

**Nguồn:** `research/07-mobile-ux/notes/*.md` (WCAG 2.2, Material 3, Carbon, NN/g, Hoober, thực hành ngành).
Skill nền tảng Apple tương ứng: `apple-design-iphone` (và các skill nền tảng khác).
