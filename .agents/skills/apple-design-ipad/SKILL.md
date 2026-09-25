---
name: apple-design-ipad
description: "Senior-level iPad (iPadOS) product design skill for the Apple ecosystem. Use when designing or auditing iPad apps — multitasking/Split View/Slide Over/Stage Manager, sidebars, split views, pointer & keyboard, Apple Pencil, drag & drop, popovers, and adaptive layouts. Self-contained: 14-section operating skill with component library, a11y, review checklist, failure modes, tokens, and an AI decision framework."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "iPad (iPadOS)"
  updated: "2026-09-24"
  sources: "research/02-ipad/"
---

# iPad Design — Senior Skill

<!-- refs -->
> **Tham chiếu:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [WINDOWS-AND-MULTITASKING](references/WINDOWS-AND-MULTITASKING.md) · [NAVIGATION-SIDEBAR-TABS](references/NAVIGATION-SIDEBAR-TABS.md) · [ADOPTION-TESTING](references/ADOPTION-TESTING.md)








> Nguồn nền: Apple HIG (Designing for iPadOS, Split views, Sidebars, Multitasking, Drag and drop,
> Pointing devices, Keyboards, Apple Pencil and Scribble, Windows, Popovers) + WWDC25 208.
> Chi tiết thô: `research/02-ipad/`.

## 1. Platform Mindset

- **Sinh ra để làm gì:** *sáng tạo & năng suất* trên màn hình lớn, cảm ứng, có bút và bàn phím.
  iPad là "canvas + workstation nhẹ", không phải iPhone phóng to.
- **Hoàn cảnh người dùng:** ngồi (bàn, ghế, sofa), thường hai tay; đa nhiệm nhiều app; vừa gõ vừa
  chạm vừa vẽ; cắm bàn phím/trackpad; có thể dùng Stage Manager với nhiều cửa sổ.
- **Mục tiêu platform:** *creation & productivity* — làm được việc "thật" (viết, vẽ, dựng, chỉnh sửa,
  quản lý), đồng thời giữ tính trực tiếp của cảm ứng.
- **Ràng buộc gốc:** cửa sổ **resizable**, đa nhiệm làm size class đổi liên tục, pointer có hover.
- **Hệ quả thiết kế:** thiết kế cho **mọi kích thước cửa sổ**, không cho một "kích thước màn hình";
  tận dụng bút/chuột/bàn phím như công dân hạng nhất; cho phép nhiều ngữ cảnh song song.

## 2. Design Principles

**WHEN designing on iPad → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Thiết kế theo **size class + resize** | Hard-code theo màn hình/thiết bị | Cửa sổ đổi kích thước liên tục (Stage Manager, Split View) |
| Dùng **sidebar** cho điều hướng cấp cao | Ép tab bar iPhone lên iPad | Màn rộng cần cấu trúc điều hướng ngang |
| Dùng **split view** cho master–detail | Bắt người dùng quay lui quay tới | So sánh & làm việc song song là lợi thế iPad |
| Hỗ trợ **pointer + hover** như lớp tăng cường | Phụ thuộc hover để kích hoạt hành động | Hover chỉ để **dự đoán**, không phải để hành động |
| Cho **multi-window / multi-scene** khi hợp lý | Khoá app vào một cửa sổ duy nhất | Người dùng muốn mở 2 tài liệu cạnh nhau |
| Hỗ trợ **Apple Pencil trực tiếp tức thời** | Bắt chạm trước rồi mới vẽ | Bút phải "chạm là mực" |
| Hỗ trợ **bàn phím + shortcut** đầy đủ | Coi bàn phím là phụ kiện hiếm | iPad thường là máy làm việc chính |
| Giữ tính năng **không đổi** khi resize | Đổi chức năng theo kích thước cửa sổ | Ổn định nhận thức |

**Quy tắc vàng:** *Nếu bỏ bàn phím/chuột đi app vẫn dùng tốt, và thêm vào app vẫn tốt hơn — đó là
thiết kế iPad đúng.*

## 3. Information Architecture

| Cấu trúc | Dùng khi | KHÔNG dùng khi |
|---|---|---|
| **Sidebar** (leading) | Nhiều khu vực ngang cấp (≥4), cần nhảy nhanh | Chỉ 2–3 mục (dùng segmented/segmented tab) |
| **Split view** (2–3 cột) | Master–detail, duyệt + xem song song | Nội dung tuyến tính đơn giản |
| **Three-column** | Thư viện → danh sách → chi tiết | Cửa sổ hẹp (tự thu về 1–2 cột) |
| **Push (navigation stack)** | Đi sâu trong một nhánh ở cột detail | Khi cần so sánh chéo |
| **Tab bar** | 3–5 mục, ở **compact** (Slide Over/narrow) | `regular width` (chuyển thành sidebar) |
| **Popover** | Lựa chọn ngắn gắn một điểm, thuộc tính item | Luồng nhiều bước (dùng sheet) |
| **Sheet** | Tác vụ tách biệt; form | Nội dung cần duyệt song song với cha |
| **Modal / full-screen** | Nhập tâm (media, vẽ toàn màn) | Việc nhỏ |
| **Inspector** (trailing) | Thuộc tính của đối tượng đang chọn | Nội dung chính (inspector là phụ) |

**Chuyển hoá theo width:** `compact` → tab bar + 1 cột; `regular` → sidebar + 2–3 cột.
Sidebar phải **thu gọn được** và giữ trạng thái khi cửa sổ hẹp lại.

## 4. Layout Rules

- **Size class theo cửa sổ, không theo máy.** `regular width` khi đủ rộng; `compact` khi Slide Over/hẹp.
- **Cửa sổ mặc định tham chiếu:** **1280 × 720 pt** (giá trị HIG cho window mặc định) — nhưng phải
  chạy tốt ở mọi kích thước nhỏ hơn/lớn hơn.
- **Multitasking:** Slide Over (hẹp → compact), Split View (chia đôi → có thể regular/compact),
  Stage Manager (nhiều cửa sổ tự do → resize liên tục).
- **Safe area:** iPad có home indicator; cửa sổ trong Stage Manager có thanh tiêu đề riêng.
- **Bàn phím ảo:** che mất đáy — phải cuộn nội dung và giữ field đang nhập trong tầm nhìn.
- **Landscape là công dân hạng nhất**, nhưng không được vỡ ở portrait.
- **Pointer:** vùng hover mở rộng ảo (pointer "hít" vào control) — giữ khoảng cách tâm ≥ 60 pt cho
  control dễ chạm/hover; tránh hover làm xô lệch layout.
- **Pencil:** không chặn vùng vẽ bằng ngón tay; phân biệt ngón tay vs bút khi cần (Pencil-only zones);
  hỗ trợ tay trái/phải (tránh đặt control ở nơi bị tay che).
- **Dynamic Type** vẫn bắt buộc; cửa sổ lớn không miễn trừ việc hỗ trợ cỡ chữ lớn.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Sidebar** | Điều hướng cấp cao | Header, sections, item (icon+label) | selected/collapsed/editing | Cho thu gọn; giữ lựa chọn; hỗ trợ kéo-thả item | Item = 1 phần tử; công bố cấp bậc | Sidebar quá dài không nhóm |
| **Split view** | Master–detail | 2–3 cột, divider, collapse | expanded/collapsed/overlay | Cho phép kéo divider; nhớ tỉ lệ; collapse mượt | Focus theo cột | Cột detail trống không có placeholder |
| **Popover** | Lựa chọn ngắn | Arrow, content, optional title | open/closed | Dùng cho thuộc tính item; đóng khi tap ngoài | Focus vào popover; trả focus | Popover chứa luồng dài |
| **Table / List (multi-column)** | Dữ liệu có cấu trúc | Cột, header, row | sort/select/multi-select | Cho sort + resize cột; multi-select có thanh hành động | Header công bố sort state | Bảng kiểu desktop không tối ưu cho chạm |
| **Pointer menu / Context menu** | Hành động nhanh theo ngữ cảnh | Preview + actions | open/closed | Bổ sung, không thay thế hành động hiển thị | Right-click/menu button tương đương | Chôn hành động chính |
| **Keyboard shortcut bar** | Tăng tốc | Nhóm shortcut đúng ngữ cảnh | — | Dùng shortcut **chuẩn** (⌘N, ⌘S, ⌘F…); không override hệ thống | Shortcut có menu tương đương | Chỉ có shortcut, không có UI |
| **Drag & drop** | Di chuyển dữ liệu | Drag item, drop zone, preview | idle/dragging/hover-drop | Hỗ trợ kéo **giữa app**; drop zone rõ; spring-loading để mở | Có alternative (menu Move to…) | Kéo-thả là cách duy nhất |
| **Pencil canvas** | Vẽ/đánh dấu | Canvas, tool palette, layers | idle/drawing/eraser | "Chạm là mực"; dùng lực/azimuth/nghiêng; double-tap tuỳ biến | Scribble cho nhập liệu; toolbar thay thế | Trễ nét; bắt chọn tool trước khi vẽ |
| **Segmented control** | Chuyển view mode | 2–5 segment | selected | Dùng cho mode, không cho form | Công bố selected | Quá nhiều segment |
| **Toolbar** | Hành động ngữ cảnh | Leading/trailing items | enabled/disabled | Nhóm hợp lý; tránh quá 5–6 item; dùng overflow | Label rõ cho VoiceOver | Toolbar trùng chức năng sidebar |
| **Empty/Loading/Error** | Trạng thái | Icon, message, CTA | — | Trong cột detail phải có placeholder, không trắng | Đọc được | Bỏ quên vì "màn to" |

## 6. Screen Inventory

| Màn hình | Mục tiêu | Lưu ý iPad |
|---|---|---|
| Launch / Home | Vào nhanh | Hỗ trợ mở nhiều cửa sổ (multi-scene) |
| Library / Browser | Duyệt kho nội dung | Sidebar + grid/list linh hoạt, sort/filter |
| Editor / Canvas | Tạo & chỉnh | Toolbar + inspector; Pencil; undo/redo; multi-window |
| Detail / Reader | Xem/chỉnh một mục | Cột detail giàu; có thể mở cửa sổ riêng |
| Search | Tìm | Search trong sidebar; kết quả ở cột giữa |
| Settings | Cấu hình | Có thể là cửa sổ riêng (⌘,) |
| Export / Share | Đưa dữ liệu ra | Share sheet + Files; kéo-thả ra ngoài app |
| Empty / Error / Loading | Trạng thái | Placeholder trong từng cột |

## 7. UX Patterns

**Browse · Create · Edit · Compare · Multi-task · Drag & drop · Handoff · Share**

- **Compare:** cho mở 2 tài liệu (split hoặc 2 cửa sổ) — đây là lợi thế lớn nhất của iPad.
- **Create/Edit:** Pencil + keyboard + undo/redo là bộ ba; autosave + trạng thái "đã lưu".
- **Multi-task:** không chiếm toàn màn hình nếu không cần; tôn trọng Slide Over/Split.
- **Continuity:** Handoff, Universal Clipboard, Sidecar — coi như tính năng mặc định.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | ≥ 44×44 pt; control ở cạnh tránh vùng tay giữ máy |
| **Pointer / Trackpad** | Hover để preview/làm nổi; con trỏ đổi hình theo ngữ cảnh; không dùng hover để kích hoạt |
| **Keyboard** | Full keyboard access + shortcut chuẩn + menu bar (⌘) tương đương; Tab di chuyển focus |
| **Apple Pencil** | Nét tức thời; lực/azimuth/nghiêng; hover để *dự đoán* (không kích hoạt); double-tap tuỳ biến, ưu tiên hành động dễ undo |
| **Gestures** | Pinch zoom, 2-finger scroll, drag & drop, Scribble, 3–4 finger chuyển app (hệ thống) |
| **Voice / Siri** | Điều khiển bằng giọng cho tác vụ chính |
| **Controller** | Nếu là game: hỗ trợ controller chuẩn |

## 9. Accessibility

- **VoiceOver:** sidebar/split công bố cấu trúc; chuyển cột có thông báo; focus không nhảy lung tung.
- **Dynamic Type:** bảng nhiều cột phải tái bố cục, không cắt chữ.
- **Pointer a11y:** kích thước con trỏ theo cài đặt hệ thống; không yêu cầu độ chính xác cao.
- **Pencil/Scribble:** Scribble nhập text tay; mọi hành động Pencil có thay thế bằng touch/keyboard.
- **Contrast/Motion:** như iOS; tôn trọng Reduce Motion/Transparency.
- **Checklist:** [ ] VoiceOver theo cột · [ ] Dynamic Type max · [ ] keyboard-only ·
  [ ] pointer hover không bắt buộc · [ ] Scribble · [ ] contrast · [ ] reduce motion.

## 10. Performance Rules

- Không jank khi **resize cửa sổ** (tính toán layout rẻ, tránh relayout nặng mỗi frame).
- Không quá tải nhận thức: sidebar + 3 cột tối đa; mỗi cột 1 mục tiêu.
- Không phân cấp sâu: sidebar là phẳng, không lồng nhiều tầng.
- Không animation nặng khi đa nhiệm; animation phải rẻ để chạy mượt khi cửa sổ nhỏ.
- Không điều hướng phức tạp: giữ lựa chọn sidebar ổn định; collapse cột có animation rõ.

## 11. Senior Review Checklist

- [ ] **Adaptivity:** chạy tốt ở compact, regular, mọi tỉ lệ cửa sổ, cả 2 orientation.
- [ ] **Navigation:** sidebar/split hợp lý; chuyển cấp có animation & nhớ trạng thái.
- [ ] **Hierarchy:** mỗi cột một vai trò; detail có placeholder khi trống.
- [ ] **Accessibility:** mục 9 pass.
- [ ] **Discoverability:** hành động có UI + shortcut + menu (⌘) tương đương.
- [ ] **Keyboard/Pointer:** thao tác được hoàn toàn bằng bàn phím; hover không bắt buộc.
- [ ] **Pencil:** nét tức thời; có hover preview; double-tap đúng chuẩn; hỗ trợ tay trái/phải.
- [ ] **Performance:** resize mượt; không jank.
- [ ] **Empty/Error/Loading:** có ở mọi cột.
- [ ] **Multi-window:** mở/đóng scene không mất dữ liệu.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Bê nguyên UI iPhone, phóng to | Lãng phí không gian; không có master–detail; tab bar thừa |
| Hard-code theo "iPad 11 inch" | Stage Manager/Split làm cửa sổ đổi kích thước liên tục |
| Dùng hover làm hành động duy nhất | Trackpad/touch khác nhau; a11y kém |
| Popover chứa form dài | Popover là lựa chọn ngắn; form dài cần sheet |
| Bảng dày kiểu desktop | Cột nhỏ khó chạm; chữ vỡ ở Dynamic Type |
| Sidebar không thu gọn được | Chiếm không gian khi cửa sổ hẹp |
| Bỏ qua bàn phím | iPad thường là máy chính, có Magic Keyboard |
| Pencil bị trễ nét / bắt đổi tool | Phá vỡ cảm giác "bút thật" |
| Kéo-thả là cách duy nhất | Không khám phá được, khó a11y |
| Không thiết kế multi-window | Người dùng dựng 2 cửa sổ → state hỏng |

## 13. Design System Rules (token)

| Hạng mục | Quy định |
|---|---|
| **Typography** | SF Pro/Dynamic Type; cho phép cỡ lớn ở màn rộng; nội dung dài ưu tiên cột có giới hạn độ rộng để dễ đọc |
| **Spacing** | Nhịp 4/8 pt; lề nội dung rộng rãi hơn iPhone; padding control 12/24 pt |
| **Radius** | Nhất quán; control hệ thống giữ radius hệ thống; cửa sổ có bán kính riêng theo hệ thống |
| **Elevation** | Material/Liquid Glass cho thanh & panel; tránh shadow nặng trong cửa sổ |
| **Motion** | 200–400 ms; collapse/expand cột mượt; tôn trọng Reduce Motion |
| **Color** | Semantic; dark mode hạng nhất; sidebar/material theo hệ thống |
| **Adaptivity** | Mọi bố cục định nghĩa theo `compact`/`regular`, không theo "iPad" nói chung |

## 14. AI Decision Framework

```
IF platform == iPad
THEN
  Primary goal  = creation & productivity
  Layout        = theo size class CỦA CỬA SỔ; compact→1 cột+tab bar; regular→sidebar+2–3 cột
  Navigation    = sidebar + split view (master–detail); popover cho lựa chọn ngắn
  Input         = touch + pointer(hover) + keyboard(shortcuts/menu) + Pencil
  Ưu tiên       = 1) Nội dung  2) Hành động  3) Điều hướng ngang
  Bắt buộc      = resize tốt · multi-window state · keyboard · placeholder cột trống
  Tránh         = hard-code kích thước · hover-only · iPhone UI phóng to · bảng desktop dày

IF nội dung là master–detail            THEN split view + sidebar
IF cửa sổ hẹp (compact)                 THEN thu về tab bar + push, giữ nguyên chức năng
IF cần so sánh 2 mục                    THEN cho mở 2 cửa sổ / 2 cột
IF người dùng có Pencil                 THEN hover preview (không kích hoạt) + double-tap dễ undo
IF người dùng có bàn phím               THEN shortcut chuẩn + menu ⌘ + Tab focus
IF hành động chỉ có long-press/hover    THEN THÊM nút/menu hiển thị
IF dữ liệu dài, nhiều cột               THEN giới hạn độ rộng đọc + tái bố cục theo Dynamic Type
```

**Nguồn:** `research/02-ipad/{SUMMARY,CHECKLIST,DIGEST}.md` · `notes/hig-*.md` · `transcripts/2025-208-*.md`.
