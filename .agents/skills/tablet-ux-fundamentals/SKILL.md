---
name: tablet-ux-fundamentals
description: "Platform-agnostic tablet/large-screen UX fundamentals for product designers and AI agents: breakpoints and panes, canonical layouts (feed, list-detail, supporting pane), adaptive navigation (bar/rail/drawer), multitasking and window resizing, pointer/keyboard/stylus input, ergonomics and accessibility for large screens. Use when designing, auditing, or reviewing a tablet app or a large-screen/resizable layout, or when converting a phone layout to tablet — beyond Apple's iPad specifics. Complements apple-design-ipad and mobile-ux-fundamentals."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.0"
  platform: "Cross-platform tablet / large screen"
  updated: "2026-09-25"
  sources: "research/02-ipad/ + research/07-mobile-ux/"
---

# Tablet UX Fundamentals — Senior Skill

> **Tham chiếu:** [ADAPTIVE-LAYOUT](references/ADAPTIVE-LAYOUT.md) · [INPUT-AND-ERGONOMICS](references/INPUT-AND-ERGONOMICS.md) · [EVIDENCE](references/EVIDENCE.md)
> Nền tảng chung; Apple-specific: skill `apple-design-ipad`.

## 1. Platform Mindset

- Tablet không phải "phone to": nó là **bề mặt lớn, đa nhiệm, có bàn phím/chuột/bút**, dùng **hai tay**
  và thường **đặt trên bàn**.
- Mục tiêu: **làm được việc thật** (đọc, soạn, vẽ, quản lý) + **duy trì tính trực tiếp** của cảm ứng.
- Ràng buộc gốc: cửa sổ **đổi kích thước liên tục**; người dùng có thể ở *mọi* kích thước.
- Hệ quả: thiết kế theo **breakpoint + pane**, không theo thiết bị; tận dụng **không gian ngang**;
  coi pointer/keyboard/stylus là công dân hạng nhất.

## 2. Design Principles

| DO | DON'T | BECAUSE |
|---|---|---|
| Thiết kế theo **breakpoint & pane** | Hard-code "màn 11 inch" | Cửa sổ đổi kích thước liên tục |
| Thêm **pane thứ hai** khi đủ chỗ | Kéo giãn 1 cột trên màn rộng | Dòng đọc quá dài; lãng phí không gian |
| Đổi **navigation theo chỗ** (bar→rail→drawer) | Giữ bottom bar ở màn rộng | Reachability & tận dụng cạnh |
| Hỗ trợ **pointer + keyboard + stylus** | Phụ thuộc hover để hành động | Hover chỉ để dự đoán |
| Giữ **state khi đổi số pane** | Reset khi đổi layout | Người dùng mất ngữ cảnh |
| Cho **nhiều cửa sổ/instance** khi hợp lý | Khoá một cửa sổ duy nhất | Đa nhiệm là lợi thế của tablet |
| Nội dung quan trọng **trong margin/safe area** | Kéo chữ sát mép | Bar/thanh hệ thống che |

**Quy tắc vàng:** *Nếu bỏ bàn phím/chuột đi app vẫn tốt, và thêm vào app còn tốt hơn — đó là thiết kế tablet đúng.*

## 3. Information Architecture

| Cấu trúc | Dùng khi |
|---|---|
| **List-detail (2 pane)** | Duyệt danh sách + xem chi tiết |
| **Supporting pane** | Nội dung phụ chỉ có nghĩa **kèm** nội dung chính (thuộc tính, "up next") |
| **Feed** | Lưới card, lượng lớn nội dung |
| **Rail / Drawer** | Nhiều mục cấp cao, màn rộng |
| **Inspector** | Thuộc tính của mục đang chọn (collapse ⇒ sheet) |
| **Modal / sheet** | Tác vụ tách biệt; luôn có Close |

Chuyển single↔two-pane: **hiện cả hai pane khi có chỗ**, giữ **selection + scroll**, và khi về một pane
thì quay lại **đúng view trước đó**.

## 4. Layout Rules

- **Breakpoint (dp, tham chiếu Material):** Compact 0–599 (1 pane) · Medium 600–839 (1–2) · Expanded 840+ (2) ·
  Large 1200+ (2) · XL 1600+ (2). **Luôn flex giữa các breakpoint**, không khoá size cứng.
- **Pane là đơn vị bố cục**; pane có thể fixed/flexible/floating/semi-permanent.
- **Adaptive strategies:** *show & hide* · *levitate* (lớp nổi) · *reflow*.
- **Margin & grid:** lề rộng hơn phone; dùng column grid trong pane; giới hạn **độ rộng dòng đọc**.
- **Không letterbox:** layout phải dùng được ở mọi tỉ lệ; **không khoá orientation** trừ lý do đặc biệt.
- **Resize mượt:** không relayout nặng mỗi frame; asset nặng chỉ cập nhật **sau** tương tác.
- **Safe area bất đối xứng** khi có sidebar/rail.

## 5. Component Library

| Component | Purpose | Lưu ý tablet |
|---|---|---|
| **Navigation rail/drawer** | Điều hướng cấp cao | Thay bottom bar khi rộng; hỗ trợ thu gọn |
| **Split view / columns** | Master–detail | Cho resize cột; nhớ tỉ lệ; collapse mượt |
| **Inspector** | Thuộc tính item | Collapse ⇒ sheet; không chiếm chỗ khi hẹp |
| **Table/list đa cột** | Dữ liệu có cấu trúc | Sort/resize cột; multi-select + thanh hành động |
| **Popover** | Lựa chọn ngắn gắn item | Form dài ⇒ sheet |
| **Context menu** | Hành động phụ | Có alternative hiển thị (menu button) |
| **Toolbar + window controls** | Hành động + quản lý cửa sổ | Né window controls; nhóm action |
| **Menu bar (nếu có)** | Khám phá + shortcut | Sắp theo tần suất; **không ẩn item**; item không khả dụng ⇒ dim |
| **Canvas/Pencil** | Vẽ/đánh dấu | Nét tức thời; hover preview; double-tap dễ undo |
| **Empty/Loading/Error** | Trạng thái | Phải có placeholder **trong từng pane** |

## 6. Screen Inventory

Launch/Home · Library/Browser · Detail/Reader · Editor/Canvas · Search · Settings · Export/Share ·
Multi-window quản lý · Empty/Loading/Error (per pane).

## 7. UX Patterns

Browse · Create · Edit · **Compare** (2 pane/2 cửa sổ) · Multi-task · Drag & drop · Handoff/Continuity.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | ≥ 44×44 pt/48 dp; control ở cạnh tránh vùng tay cầm |
| **Pointer** | Hover **dự đoán** (đổi hình theo ngữ cảnh), không kích hoạt; con trỏ chính xác 1:1 |
| **Keyboard** | Full keyboard access; shortcut chuẩn; menu bar/menu tương đương; Tab focus logic |
| **Stylus** | Nét tức thời; lực/azimuth/altitude; hover preview; Scribble/viết tay |
| **Drag & drop** | Kéo giữa app; spring-loading; **luôn có alternative** (menu/nút) |
| **Gesture** | Gesture chuẩn; tránh trộn cuộn dọc + ngang (trừ media) |

## 9. Accessibility

- **Touch target** ≥ 44 pt/48 dp; item trong bảng cũng vậy.
- **VoiceOver/screen reader:** cấu trúc pane/cột được công bố; không trap focus khi chuyển pane.
- **Dynamic Type/text scaling:** bảng nhiều cột phải tái bố cục.
- **Pointer a11y:** không yêu cầu độ chính xác cao; kích thước con trỏ theo hệ thống.
- **Keyboard-only:** thao tác được **toàn bộ** chức năng; focus ring rõ.
- **RTL:** đảo chiều pane/nav đúng; không hard-code trái/phải.
- **Checklist:** [ ] target · [ ] reader · [ ] text scale · [ ] keyboard-only · [ ] RTL · [ ] reduce motion/transparency.

## 10. Performance Rules

- Resize mượt (60 fps) — relayout rẻ, debounce asset nặng.
- Không quá tải nhận thức: mỗi pane **một vai trò**; ≤ 3 cột.
- Không phân cấp sâu; không điều hướng rối khi đổi cửa sổ.
- Không jank do shadow/blur nhiều lớp.
- Tải nội dung theo pane (không chặn toàn app vì một pane).

## 11. Senior Review Checklist

- [ ] Chạy tốt ở **Compact → XL** và mọi tỉ lệ cửa sổ.
- [ ] Navigation đổi dạng đúng theo breakpoint; giữ selection/scroll.
- [ ] Mỗi pane một vai trò; placeholder khi pane rỗng.
- [ ] Keyboard-only + pointer + stylus đều thao tác được.
- [ ] Menu/item **không ẩn** theo ngữ cảnh (dim thay vì ẩn).
- [ ] Không letterbox/khoá orientation vô cớ.
- [ ] Empty/Loading/Error có ở mọi pane.
- [ ] RTL + text scale lớn + reduce motion.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Bê UI phone phóng to | Lãng phí không gian, dòng quá dài |
| Hard-code kích thước "tablet" | Cửa sổ đổi liên tục (split/multi-window) |
| Bottom bar ở màn rộng | Reachability kém, phí cạnh |
| Hover là cách duy nhất | Kém a11y, touch/keyboard không làm được |
| Ẩn menu item theo ngữ cảnh | Phá spatial memory |
| Reset khi đổi số pane | Mất ngữ cảnh |
| Không hỗ trợ multi-instance | Người dùng mở 2 cửa sổ ⇒ state hỏng |
| Bảng dày kiểu desktop | Chữ vỡ ở text scale lớn |

## 13. Design System Rules

| Hạng mục | Quy định |
|---|---|
| **Breakpoints** | Compact <600 · Medium 600–839 · Expanded 840–1199 · Large 1200–1599 · XL 1600+ (dp) |
| **Spacing** | Nhịp 4/8; lề rộng hơn phone; padding pane 16–24 |
| **Pane** | 2 pane khi ≥ Expanded; supporting pane bên cạnh (rộng ~360 dp) hoặc dưới |
| **Radius/Material** | Concentric; material cho thanh/panel; không shadow nặng |
| **Motion** | 150–300 ms; collapse/expand mượt; tôn trọng Reduce Motion |
| **Color** | Semantic; dark mode hạng nhất; contrast đạt |
| **Adaptivity** | Mọi layout định nghĩa theo **breakpoint**, không theo thiết bị |

## 14. AI Decision Framework

```
IF tablet / large screen
THEN
  Layout    = breakpoint + pane; KHÔNG hard-code kích thước
  IA        = list-detail / supporting pane / feed / rail
  Nav       = bar (compact) → rail (medium) → drawer/rail (expanded)
  Input     = touch + pointer(hover dự đoán) + keyboard + stylus
  Ưu tiên   = 1) Nội dung  2) Hành động  3) Điều hướng ngang
  Bắt buộc  = resize OK · giữ selection/scroll · placeholder mỗi pane · keyboard-only
  Tránh     = phone phóng to · hover-only · ẩn menu item · letterbox · bottom bar ở màn rộng

IF cửa sổ ≥ Expanded              THEN 2 pane (list + detail)
IF có nội dung phụ                THEN supporting pane (bên cạnh khi rộng, dưới/bottom sheet khi hẹp)
IF pane rỗng                      THEN placeholder hướng dẫn
IF người dùng có bàn phím         THEN shortcut chuẩn + menu + Tab focus
IF có stylus                      THEN hover preview + lực/azimuth; double-tap dễ undo
IF item chỉ có hover/context menu THEN THÊM nút/menu hiển thị
IF đổi số pane                    THEN giữ selection + scroll, quay lại đúng view
```

**Nguồn:** `research/02-ipad/`, `research/07-mobile-ux/` · chi tiết: [EVIDENCE.md](references/EVIDENCE.md).
