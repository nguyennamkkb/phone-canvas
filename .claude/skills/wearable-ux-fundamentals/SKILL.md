---
name: wearable-ux-fundamentals
description: "Platform-agnostic wearable/smartwatch UX fundamentals for product designers and AI agents: glanceability, one-to-two-task focus, micro-interactions, haptics, wrist ergonomics, complications/tiles as entry points, offline and battery constraints, and phone↔watch continuity. Use when designing, auditing, or reviewing a watch app, complication/tile, watch notification, or wearable interaction flow. Complements apple-design-watch and mobile-ux-fundamentals."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.0"
  platform: "Cross-platform wearable (watchOS / Wear OS)"
  updated: "2026-09-25"
  sources: "research/03-watchos/ + research/07-mobile-ux/"
---

# Wearable UX Fundamentals — Senior Skill

> **Tham chiếu:** [GLANCEABILITY](references/GLANCEABILITY.md) · [MICRO-INTERACTION](references/MICRO-INTERACTION.md) · [EVIDENCE](references/EVIDENCE.md)
> Nền tảng chung; Apple-specific: skill `apple-design-watch`.

## 1. Platform Mindset

- Watch là thiết bị **đeo trên người**, **liếc trong 1–3 giây**, tay có thể đang bận.
- Ngữ cảnh: đi lại, tập luyện, họp, nấu ăn; ngoài trời; **thường không rảnh tay**; đôi khi **không có mạng**.
- Mục tiêu: **glanceable interaction** — thông tin trước, hành động sau, thoát ngay.
- Ràng buộc gốc: màn rất nhỏ (bo tròn), pin/runtime chặt, không gõ phím, nhập liệu kém.
- Hệ quả: **1 màn = 1 ý**; ≤ 2 tầng; chữ tối thiểu; **haptics** là kênh chính; thiết kế cho **offline**.

## 2. Design Principles

| DO | DON'T | BECAUSE |
|---|---|---|
| Tập trung **1–2 tác vụ** | Bê app phone thu nhỏ | Mỏi tay, không glance được |
| Xong trong **vài giây** | Form/wizard nhiều bước | Tương tác cực ngắn |
| **≤ 2 tầng** điều hướng; ưu tiên inline | Cây sâu | Không quay lại được |
| Chữ to, **ít chữ**, nhãn ngắn | Đoạn văn, bảng dày | Đọc lướt trên màn nhỏ |
| **Haptics đúng ngữ nghĩa** | Rung vô cớ/liên tục | Mất giá trị tín hiệu |
| Cử chỉ/crown **có touch thay thế** | Bắt buộc một cách nhập | A11y & khả năng khác nhau |
| Nội dung **theo ngữ cảnh** (giờ/địa điểm/hoạt động) | Nội dung tĩnh | Watch luôn bên người |
| Thiết kế **offline-first** | Giả định luôn có mạng | Đi rừng/đi biển |
| Bắt đầu từ **complication/tile** | Bắt mở app rồi tìm | Mặt đồng hồ là màn hình chính |

**Quy tắc vàng:** *Nếu mô tả màn hình watch cần hơn một câu, nó quá phức tạp.*

## 3. Information Architecture

| Cấu trúc | Dùng khi |
|---|---|
| **Complication / Tile** | 1 dữ liệu glanceable; điểm vào chính |
| **Notification** | Cập nhật ngoài app, hành động nhanh |
| **Vertical page / scroll** | Vài khối ngắn, cuộn dọc |
| **Hierarchy ≤ 2 tầng** | Chi tiết ngắn |
| **Modal/full-screen** | Tác vụ ngắn, tập trung |

Không có tab bar kiểu phone; điều hướng = **surface → app → ≤ 2 tầng**.

## 4. Layout Rules

- **Một hướng cuộn** (dọc) — tránh trộn dọc + ngang (trừ media).
- **Hiện giờ** ở đầu app (không để trong dialog/picker).
- **Primary action ở trên/nổi** để dễ thấy; **entry point có icon + label**.
- **Nhãn ngắn ≤ 3 từ**; chữ tối thiểu ~**11 pt** cho phụ.
- **Vùng an toàn của bezel**: chữ/glyph không sát cạnh cong.
- **Always-On/dim:** giữ nội dung chính, làm mờ phần phụ, tránh thay đổi gây phân tán.
- **Scrollbar/position indicator** khi cả màn cuộn (Wear) — giúp định vị.

## 5. Component Library

| Component | Purpose | Lưu ý |
|---|---|---|
| **Complication/Tile** | Dữ liệu glanceable | 1 ý; hỗ trợ mọi family/tile size; tinted |
| **Notification** | Cập nhật + hành động | short look → long look; alert có chọn lọc |
| **List (ngắn)** | Chọn nhanh | ≤ 5–7 mục; nhóm rõ |
| **Gauge/Ring** | Tiến trình/dữ liệu | Closed = tỉ lệ; open + range = khoảng |
| **Button** | Hành động | ≤ 2–3 control/hàng; target đủ lớn |
| **Crown/Rotary** | Cuộn/chỉnh | Có haptic + touch thay thế |
| **Haptics** | Phản hồi | Đúng kiểu, đúng lúc |
| **Empty/Loading/Error** | Trạng thái | Ngắn, có lối thoát, có bản offline |

## 6. Screen Inventory

Surface (complication/tile) · App home · List/picker · Detail · Active session (workout/timer) ·
Notification · Settings (mỏng) · Permission · Offline/Empty/Error.

## 7. UX Patterns

Glance · Notify · Quick-action · Track · Timer · Remote · Confirm · Suggest (relevance).

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | Target ≥ 44 pt (Wear: ~48 dp); tránh cạnh cong |
| **Crown/Rotary** | Trục chính để cuộn/chỉnh; haptic nhẹ khi qua mốc; **luôn có touch thay thế** |
| **Button phụ (Action/Side)** | Chức năng cốt lõi; nhãn ≤ 3 từ |
| **Gestures** | Cử chỉ hệ thống; không tự chế cử chỉ ẩn |
| **Voice** | Dictation/Siri thay bàn phím |
| **Haptics** | Kênh phản hồi chính; phân biệt kiểu rung theo ngữ nghĩa |
| **Keyboard** | Tránh; nếu buộc ⇒ dictation/Scribble |

## 9. Accessibility

- **VoiceOver/screen reader:** mọi phần tử có label/value; complication đọc được giá trị.
- **Text scaling** lớn ⇒ giảm lượng nội dung, không cắt chữ.
- **Contrast** đạt; **không chỉ màu** để truyền tin.
- **Reduce Motion/Transparency**; Always-On không phân tán.
- **Haptics** bổ trợ, không phải kênh duy nhất.
- **Checklist:** [ ] label · [ ] text scale · [ ] contrast · [ ] reduce motion ·
  [ ] không cần crown · [ ] mọi hành động có alternative.

## 10. Performance Rules

- **Pin & runtime:** công việc nền nhẹ; không giữ session vô ích; tôn trọng watchdog.
- **Ngân sách cập nhật:** widget/complication ~15–20 phút khi đang dùng; Live Activity có budget riêng.
- **Không jank** khi dữ liệu realtime (workout).
- **Không quá tải nhận thức:** 1 màn = 1 ý; ≤ 3 dòng.
- **Không phân cấp sâu**; **không animation nặng**.
- **First launch/offline:** có nội dung ngay; phần còn lại tải nền; trạng thái offline rõ.

## 11. Senior Review Checklist

- [ ] Hiểu màn hình trong **≤ 3 giây**.
- [ ] Từ surface tới hành động **≤ 2 bước**; luôn thoát được.
- [ ] 1–2 tác vụ; không form/bàn phím.
- [ ] Haptics đúng ngữ nghĩa; có biểu diễn thị giác.
- [ ] Mọi kích cỡ màn hình & nhiều đời máy.
- [ ] Always-On dim đúng.
- [ ] Offline có nội dung; loading/empty/error ngắn, có lối thoát.
- [ ] Nội dung theo ngữ cảnh (giờ/địa điểm/hoạt động).
- [ ] A11y: label, text scale, contrast, không cần crown.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Bê app phone vào watch | Không glance được, mỏi tay |
| Form/nhập liệu/bàn phím | Watch không phải thiết bị nhập |
| Điều hướng sâu | Người dùng bỏ cuộc |
| Nội dung dày, chữ dài | Không đọc kịp |
| Haptics vô nghĩa | Khó chịu, mất tín hiệu |
| Phụ thuộc crown/rotary | Không dùng được với a11y |
| Giả định có mạng | Trắng màn/treo spinner ngoài vùng phủ |
| Không dùng surface (complication/tile) | Mất điểm vào chính |
| Cập nhật liên tục | Tốn pin, vượt ngân sách |

## 13. Design System Rules

| Hạng mục | Quy định |
|---|---|
| **Typography** | Chữ to; text phụ ≥ 11 pt; nhãn ≤ 3 từ |
| **Spacing** | Nhịp 4/8; 2–3 control/hàng; khoảng cách rộng |
| **Target** | ≥ 44 pt (Apple) / ~48 dp (Wear) |
| **Shape** | Tôn trọng màn tròn + bezel |
| **Elevation** | Gần như không shadow; tương phản + material |
| **Motion** | Rất ngắn; tôn trọng Reduce Motion |
| **Color** | Semantic; đọc được ở dim/tinted; không chỉ màu |
| **Adaptivity** | Mọi cỡ màn (40–49 mm / nhiều đời máy) |

## 14. AI Decision Framework

```
IF wearable
THEN
  Goal      = glanceable interaction (1–3 giây)
  Layout    = 1 ý/màn; chữ to; 1 hướng cuộn; ≤ 3 dòng
  Nav       = surface → app → ≤ 2 tầng
  Ưu tiên   = 1) Thông tin  2) Hành động  3) Thoát
  Input     = touch + crown/rotary (+touch thay thế) + dictation + haptics
  Bắt buộc  = offline OK · haptics có nghĩa · dim/Always-On đúng · mọi cỡ màn
  Tránh     = form · bàn phím · nhiều bước · dày chữ · điều hướng sâu

IF tác vụ cần nhập nhiều text   THEN đẩy sang phone (hoặc dictation tối giản)
IF phiên dài (workout)          THEN metric + dim + kết thúc rõ
IF cần thông tin liếc           THEN surface (complication/tile), không mở app
IF cần đúng ngữ cảnh            THEN relevance (giờ/địa điểm/hoạt động)
IF muốn hành động nhanh         THEN 1 tap trên surface/notification + haptics
IF luồng > 2 bước               THEN rút gọn hoặc chuyển sang phone
```

**Nguồn:** `research/03-watchos/`, `research/07-mobile-ux/` · [EVIDENCE.md](references/EVIDENCE.md).
