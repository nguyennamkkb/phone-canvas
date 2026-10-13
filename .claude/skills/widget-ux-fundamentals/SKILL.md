---
name: widget-ux-fundamentals
description: "Platform-agnostic glanceable-surface UX fundamentals for product designers and AI agents: choosing between widget, live activity, control, complication and notification; freshness strategies (timeline, push, relevance); sizing, legibility, tinted/dynamic color, margins; and the limits of interaction outside the app. Use when designing, auditing, or reviewing a widget, Live Activity, complication, tile, control, or any at-a-glance surface. Complements apple-design-widget, apple-design-watch and mobile-ux-fundamentals."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.0"
  platform: "Cross-platform glanceable surfaces"
  updated: "2026-09-25"
  sources: "research/04-widget/ + research/03-watchos/ + research/07-mobile-ux/"
---

# Widget / Glanceable Surfaces — Senior Skill

> **Tham chiếu:** [SURFACE-SELECTION](references/SURFACE-SELECTION.md) · [FRESHNESS-AND-LEGIBILITY](references/FRESHNESS-AND-LEGIBILITY.md) · [EVIDENCE](references/EVIDENCE.md)
> Apple-specific (WidgetKit/ActivityKit API): skill `apple-design-widget`.

## 1. Platform Mindset

- Glanceable surface tồn tại **ngoài app**: Home Screen, Lock Screen, mặt đồng hồ, Control Center, StandBy.
- Người dùng **liếc**, không ngồi lại; không cuộn, không nhập liệu.
- Mục tiêu: **một thông tin có giá trị + đường vào hành động**; không phải "app thu nhỏ".
- Ràng buộc gốc: không gian nhỏ, cập nhật **bị ngân sách**, tương tác giới hạn, dữ liệu có thể **cũ**.
- Hệ quả: **1 surface = 1 ý**; chữ lớn; cập nhật đúng lúc; **deep link đúng màn**; tinted/theme-aware.

## 2. Design Principles

| DO | DON'T | BECAUSE |
|---|---|---|
| **Một** use case chính mỗi surface | Nhồi nhiều mục tiêu | Người dùng chỉ liếc |
| Chọn **đúng loại surface** (xem §3) | Dùng widget cho việc cần hành động | Mỗi loại có primary purpose |
| Chữ lớn, trọng số ≥ medium, ≥ 11 pt | Chữ nhỏ/mảnh | Đọc ngoài nắng, mắt lướt |
| Cập nhật **đúng lúc** (timeline/push/relevance) | Cập nhật liên tục | Ngân sách + pin |
| **Deep link** tới đúng màn | Mở app ở home chung | Mất ngữ cảnh |
| Theme/tinted-aware; không chỉ màu | Hard-code màu | Lock screen/tinted/dark mode |
| Ẩn dữ liệu nhạy cảm khi khoá | Hiện số dư/tin riêng tư | Quyền riêng tư |
| Hành động đơn giản bằng App Intent | Bắt mở app cho toggle | Tăng giá trị tại chỗ |

**Quy tắc vàng:** *Nếu widget cần chú thích để hiểu, nó chưa xong.*

## 3. Information Architecture

| Surface | Primary purpose | Thời gian sống |
|---|---|---|
| **Widget / Tile** | **Thông tin** theo lịch/ngữ cảnh | Bền |
| **Live Activity** | **Tiến trình** có start–end | Tạm |
| **Control** | **Hành động** một chạm | Bền |
| **Complication** | 1 dữ liệu trên mặt đồng hồ | Bền |
| **Notification** | Cập nhật/lời mời hành động | Tạm |

Chi tiết chọn: [SURFACE-SELECTION.md](references/SURFACE-SELECTION.md).

## 4. Layout Rules

- **Kích thước/family** quyết định lượng thông tin: nhỏ ⇒ 1 ý; lớn dần ⇒ **thêm ngữ cảnh theo trục**.
- **Margin:** 16 pt chuẩn (Apple); 11 pt khi cần nhóm; **đồng tâm** với góc bo; Android dùng **corner radius hệ thống**.
- **Chữ ≥ 11 pt**; phân cấp bằng size/weight; giá trị chính **to nhất**.
- **Không cuộn, không nhập liệu**; mọi thứ vừa trong khung.
- **Co giãn:** thiết kế chịu được khoảng **75%–125%** (Apple) / nhiều cỡ ô (Android, `minResize`).
- **Tint/dim:** đọc được khi mất màu; Always-On dim phần phụ.

## 5. Component Library

| Component | Purpose | Lưu ý |
|---|---|---|
| **Widget layout** | 1 ý + giá trị chính | Text/list/grid canonical (Android); family (Apple) |
| **Interactive button/toggle** | Hành động đơn giản | App Intent; phản hồi trạng thái |
| **Gauge/Progress** | Tiến trình | Determinate khi biết |
| **Relevance entries** | Nhiều card theo ngữ cảnh | watchOS RelevanceKit |
| **Live Activity view** | compact/minimal/expanded | Không alert mọi thay đổi |
| **Placeholder/Empty** | Chưa có dữ liệu | Giữ layout ổn định |

## 6. Screen Inventory

Home widget · Lock screen accessory · StandBy · Control Center · Smart Stack · Mặt đồng hồ ·
Live Activity (compact/expanded).

## 7. UX Patterns

Glance · Live-progress · Quick-toggle · Deep-link · Context-rotate (Smart Stack) · Alert có chọn lọc.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Tap** | Deep link đúng màn |
| **Button/toggle** | Hành động đơn giản, an toàn, dễ hiểu |
| **Scroll** | ❌ không có |
| **Keyboard/Voice** | ❌ trong widget |
| **Focus (watchOS/macOS)** | Điều hướng focus cho phần tử tương tác |
| **A11y** | Mọi giá trị có label; state được công bố |

## 9. Accessibility

- Mọi phần tử có label/value; **không chỉ màu**.
- Chữ ≥ 11 pt; chịu scale 75–125%.
- Contrast đạt trong **tinted** và **Always-On dim**.
- Ẩn dữ liệu nhạy cảm khi khoá.
- **Checklist:** [ ] label · [ ] chữ ≥ 11 pt · [ ] tinted/dim · [ ] contrast ·
  [ ] không chỉ màu · [ ] riêng tư · [ ] placeholder ổn định.

## 10. Performance Rules

- Tôn trọng **ngân sách cập nhật**; không cập nhật liên tục.
- Tránh ảnh lớn/nén kém; ưu tiên text/vector.
- Không animation nặng; không nhấp nháy.
- Không để **stale âm thầm** — cho biết thời điểm/last connected khi cần.
- Live Activity: **kết thúc đúng lúc**, không để trạng thái mồ côi.

## 11. Senior Review Checklist

- [ ] Hiểu trong ≤ 1–2 giây; 1 ý chính.
- [ ] Chọn đúng loại surface (thông tin/tiến trình/hành động).
- [ ] Cập nhật đúng lúc + có trạng thái stale/placeholder.
- [ ] Tinted/dark/Always-On đọc được; không chỉ màu.
- [ ] Chữ ≥ 11 pt; margin chuẩn, đồng tâm; chịu 75–125%.
- [ ] Deep link đúng màn; hành động đơn giản có phản hồi.
- [ ] Riêng tư khi khoá; budget hợp lý.
- [ ] Mọi family/kích thước đã kiểm.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Widget như app thu nhỏ | Không cuộn/nhập ⇒ vô dụng |
| Chữ nhỏ (< 11 pt) | Không đọc ngoài nắng |
| Nhồi nhiều số liệu | Không glance được |
| Cập nhật liên tục | Vượt ngân sách, tốn pin |
| Hiện dữ liệu nhạy cảm khi khoá | Rò rỉ riêng tư |
| Tap mở app ở home chung | Thêm bước, mất ngữ cảnh |
| Live Activity cho nội dung tĩnh | Sai mục đích, gây nhiễu |
| Không test tinted/dim | Vỡ màu trên lock/dim |
| Không có placeholder | Layout nhảy khi dữ liệu về |
| Chọn sai surface | Dùng widget cho hành động, control cho thông tin |

## 13. Design System Rules

| Hạng mục | Quy định |
|---|---|
| **Typography** | ≥ 11 pt; trọng số ≥ medium cho thông tin chính; phân cấp size/weight |
| **Spacing** | Margin 16 pt (min 11); đồng tâm; padding trong khung |
| **Radius** | Theo hệ thống (corner radius); nội dung fit đồng tâm |
| **Elevation** | Không shadow; tương phản/material hệ thống |
| **Motion** | Tối thiểu; không nhấp nháy |
| **Color** | Token/dynamic color; light/dark/tinted; không chỉ màu |
| **Adaptivity** | Chịu scale 75–125% / nhiều cỡ ô; không cuộn |

## 14. AI Decision Framework

```
IF glanceable surface
THEN
  Goal      = 1 ý + deep link (hoặc 1 hành động)
  Type      = widget (thông tin) / live activity (start–end) / control (hành động) / complication
  Layout    = chữ ≥11pt; margin 16pt đồng tâm; không cuộn; chịu 75–125%
  Update    = timeline / push / relevance — tôn trọng budget
  Ưu tiên   = 1) Thông tin  2) Hành động nhanh  3) Mở app
  Bắt buộc  = tinted/dim OK · ẩn dữ liệu nhạy cảm · placeholder ổn định · mọi kích thước
  Tránh     = cuộn · nhập liệu · chữ nhỏ · nhiều mục tiêu · cập nhật liên tục

IF nội dung "đang diễn ra"        THEN Live Activity, kết thúc rõ, alert có chọn lọc
IF hành động đơn giản (bật/tắt)   THEN Control/App Intent, không mở app
IF cần >1 mục tiêu                THEN tách surface hoặc dùng relevant widgets (nhiều card)
IF dữ liệu đổi ngay               THEN push (APNs / watch connectivity)
IF dữ liệu theo ngữ cảnh          THEN relevance (giờ/địa điểm/hoạt động)
IF dữ liệu riêng tư               THEN ẩn khi khoá/dim
IF nội dung cần đọc lâu           THEN mở app — surface chỉ để liếc
```

**Nguồn:** `research/04-widget/`, `research/03-watchos/`, `research/07-mobile-ux/` · [EVIDENCE.md](references/EVIDENCE.md).
