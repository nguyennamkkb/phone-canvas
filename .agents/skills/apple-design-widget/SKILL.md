---
name: apple-design-widget
description: "Senior-level Widget/WidgetKit design skill for the Apple ecosystem (iOS/iPadOS/watchOS/macOS/visionOS). Use when designing or auditing widgets, Live Activities, Lock Screen accessories, Control Center controls, StandBy, and interactive snippets — sizes, timelines, tinted mode, margins, glanceability, interaction. Self-contained 14-section operating skill with component library, a11y, review checklist, failure modes, tokens, and an AI decision framework."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "Widget / WidgetKit"
  updated: "2026-09-24"
  sources: "research/04-widget/"
---

# Widget Design — Senior Skill

<!-- refs -->
> **Tham chiếu:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [SURFACE-SELECTION](references/SURFACE-SELECTION.md)








> Nguồn nền: Apple HIG (Widgets, Live Activities, Controls, Snippets) + WWDC25 278/255/281,
> WWDC24 10098. Chi tiết thô: `research/04-widget/`.

## 1. Platform Mindset

- **Sinh ra để làm gì:** mang **một mẩu thông tin sống** ra ngoài app — Home Screen, Lock Screen,
  Control Center, StandBy, mặt đồng hồ — để người dùng **liếc là đủ**, không cần mở app.
- **Hoàn cảnh người dùng:** đang làm việc khác; liếc điện thoại trên bàn; khoá máy; đang sạc
  (StandBy); đang tập (Watch).
- **Mục tiêu platform:** *at-a-glance value* + *deep link vào hành động*. Widget không phải app thu nhỏ.
- **Ràng buộc gốc:** không cuộn, không nhập liệu, cập nhật theo **timeline**, không gian rất hạn chế,
  tương tác bị giới hạn (App Intents).
- **Hệ quả thiết kế:** 1 widget = 1 ý; chữ lớn/đậm; margin chuẩn; ẩn dữ liệu nhạy cảm khi khoá;
  tap mở app đúng ngữ cảnh.

## 2. Design Principles

**WHEN designing a widget → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Chọn **1 thông tin quan trọng nhất** cho mỗi widget | Nhồi nhiều mục tiêu | Người dùng chỉ liếc |
| Dùng chữ lớn, **medium weight trở lên**; ít chữ nhỏ | Chữ mảnh, cỡ nhỏ | Đọc ngoài nắng/qua loa |
| Margin **16 pt** (tối thiểu 11 pt khi bí) | Sát mép | Tránh cảm giác chật, tăng khả đọc |
| Bố cục **đồng tâm (concentric)** với góc bo | Margin lệch nhau | Hài hoà thị giác |
| Ẩn thông tin nhạy cảm khi máy khoá | Hiện số dư/tin nhắn riêng tư | Quyền riêng tư trên Lock Screen |
| Cập nhật đúng lúc (timeline/push) | Cập nhật liên tục | Hệ thống giới hạn & pin |
| Tap mở **đúng màn hình liên quan** | Mở app ở Home chung | Người dùng đã có ngữ cảnh |
| Dùng tương tác App Intents cho toggle/action | Bắt mở app cho hành động đơn giản | Tăng giá trị tại chỗ |

**Quy tắc vàng:** *Nếu widget cần chú thích để hiểu, nó chưa xong.*

## 3. Information Architecture

| Cấu trúc | Dùng khi | KHÔNG dùng khi |
|---|---|---|
| **widgetSmall** | 1 số liệu/1 trạng thái | Danh sách nhiều mục |
| **widgetMedium** | 1 mục tiêu + 1–2 mục phụ | Bảng dữ liệu dày |
| **widgetLarge / ExtraLarge** | Vài mục ngang cấp, lưới nhỏ | Nội dung cần cuộn |
| **accessoryCircular** | 1 số liệu trạng thái (mặt đồng hồ/Lock) | Nội dung dài |
| **accessoryRectangular** | 2–3 dòng | Đoạn văn dài |
| **accessoryInline** | 1 dòng đơn | Nhiều thông tin |
| **accessoryCorner** | 1 giá trị ở góc | Nội dung phức tạp |
| **Live Activity (compact/minimal/expanded)** | Tiến trình đang diễn ra | Nội dung tĩnh |
| **Control Center control** | Bật/tắt, hành động nhanh | Cấu hình phức tạp |
| **StandBy** | Liếc khi sạc, đặt ngang | Nhập liệu |
| **Smart Stack** | Nhiều widget luân phiên theo ngữ cảnh | 1 mục đích duy nhất |

Nguyên tắc: **một widget = một ý**; nếu cần phân cấp, dùng kích thước lớn hơn chứ không nén nội dung.

## 4. Layout Rules

- **Margin chuẩn:** **16 pt** cho hầu hết widget; khi cần nhóm nội dung/đồ hoạ, có thể **11 pt**.
- **Chữ:** dùng font **≥ 11 pt**; chữ nhỏ hơn khó đọc với nhiều người.
- **Live Activity:** margin Lock Screen **14 pt**; Dynamic Island bo góc **44 pt**; khi tap chuyển
  sang Lock Screen phóng to **2×**; custom view tối đa **400 pt** chiều cao.
- **Đồng tâm:** margin phải/khoảng cách phải **đồng tâm** với bán kính góc của container.
- **Tinted/vibrant:** nội dung phải trông tốt ở chế độ tinted (Lock Screen/tinted Home).
- **Dynamic Type/scale:** widget có thể bị scale; nội dung phải chịu được thay đổi cỡ.
- **Không cuộn, không nhập liệu** — mọi thứ nằm gọn trong khung.
- **Template resize:** widget có thể co giãn **75%–125%** — thiết kế chịu được cả hai cực.

## 5. Component Library

| Component | Purpose | Anatomy | States | Best practices | A11y | Failure |
|---|---|---|---|---|---|---|
| **Widget (static)** | Liếc thông tin | Container + content + optional label | placeholder/current/stale | 1 ý; chữ lớn; margin chuẩn | Label đầy đủ; không chỉ màu | Dữ liệu cũ không báo; quá nhiều mục |
| **Interactive button** | Hành động tại chỗ | Label/icon + intent | idle/in-progress/done | Chỉ hành động đơn giản, rõ; phản hồi trạng thái | Label rõ; trạng thái đọc được | Hành động mơ hồ; không phản hồi |
| **Toggle (control)** | Bật/tắt | Symbol + title + value | on/off/updating | Cập nhật chính xác khi tương tác/push | Công bố trạng thái | Đổi màu không thông báo |
| **Progress / Gauge** | Tiến trình | Bar/ring + value | determinate/indeterminate | Dùng khi có tiến trình thật | Giá trị đọc được | Gauge vô định cho dữ liệu biết trước |
| **Timeline entries** | Cập nhật theo thời gian | Entries + policy | current/future/stale | Cập nhật đúng lúc, không lạm dụng | Nội dung mới đọc lại | Cập nhật trễ/không cập nhật |
| **Live Activity** | Tiến trình đang diễn ra | compact/minimal/expanded | active/ended/stale | Nội dung thay đổi realtime; kết thúc rõ | Trạng thái đọc được | Lạm dụng cho nội dung tĩnh |
| **Control** | Hành động Control Center | Symbol + title + value | active/inactive/config | Symbol gợi hành vi; hint text; ẩn khi khoá | Title + value rõ | Symbol khó hiểu; không hint |
| **Snippet** | UI tương tác nhỏ trong link/App Intents | Compact view | — | Dùng UI quen thuộc; gọn | Tương phản tốt | Nhồi UI phức tạp |
| **Placeholder / Empty** | Chưa có dữ liệu | Neutral content | placeholder/redacted | Giữ bố cục ổn định | Đọc "đang tải" | Nhấp nháy/nhảy layout |

## 6. Screen Inventory

| Bề mặt | Mục tiêu | Lưu ý |
|---|---|---|
| Home Screen widget | Liếc nhanh | 1 ý; tinted mode |
| Lock Screen accessory | Liếc khi khoá | Ẩn dữ liệu nhạy cảm |
| Live Activity (Lock/DI) | Theo dõi tiến trình | compact/minimal/expanded; kết thúc gọn |
| Control Center | Hành động nhanh | Symbol + title + value + hint |
| StandBy | Liếc khi sạc | Chữ lớn, tương phản cao |
| Smart Stack | Luân phiên theo ngữ cảnh | Ưu tiên đúng lúc |
| Watch complication | Liếc trên cổ tay | Xem skill Apple Watch |

## 7. UX Patterns

**Glance · Live-progress · Quick-toggle · Deep-link · Context-rotate (Smart Stack)**

- **Glance:** dữ liệu mới nhất ngay, không cần mở app.
- **Live-progress:** bắt đầu → cập nhật → kết thúc; không để "treo" trạng thái.
- **Quick-toggle:** 1 chạm đổi trạng thái, phản hồi ngay.
- **Deep-link:** tap → màn hình liên quan (không phải home chung).

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Tap** | Mở deep link hoặc chạy App Intent |
| **Button/Toggle** | Chỉ hành động đơn giản, an toàn, dễ hiểu |
| **Scrolling** | ❌ không có trong widget |
| **Keyboard/Voice** | ❌ không có trong widget (dùng trong app) |
| **Focus (watchOS/macOS)** | Hỗ trợ điều hướng focus cho phần tử tương tác |
| **VoiceOver** | Mỗi phần tử có label; trạng thái được công bố |

## 9. Accessibility

- **VoiceOver:** label cho mọi giá trị; không truyền tải chỉ bằng màu.
- **Dynamic Type:** chữ ≥ 11 pt; chịu được scale 75–125%.
- **Contrast:** đạt chuẩn ngay trong tinted mode.
- **Motion:** hạn chế animation; không nhấp nháy.
- **Privacy:** ẩn thông tin nhạy cảm ở Lock Screen/Always-On.
- **Checklist:** [ ] VoiceOver labels · [ ] ≥11 pt · [ ] tinted mode · [ ] contrast ·
  [ ] không chỉ màu · [ ] ẩn dữ liệu nhạy cảm · [ ] placeholder ổn định.

## 10. Performance Rules

- Tôn trọng ngân sách cập nhật (timeline): cập nhật khi cần, không "vì có thể".
- Tránh ảnh lớn/nén kém; dùng nội dung vector/text.
- Không animation nặng trong widget/Live Activity.
- Không nhồi nội dung → widget phải "đọc được trong 1 giây".
- Không để stale âm thầm: đánh dấu thời điểm cập nhật khi cần.
- Live Activity: kết thúc đúng lúc, không để trạng thái mồ côi.

## 11. Senior Review Checklist

- [ ] **Glanceability:** hiểu trong ≤1–2 giây.
- [ ] **Information hierarchy:** 1 ý chính; phần phụ không lấn.
- [ ] **Accessibility:** mục 9 pass (đặc biệt tinted & chữ ≥11 pt).
- [ ] **Discoverability:** tap mở đúng màn hình; không có hành động ẩn.
- [ ] **Performance:** cập nhật hợp lý, không stale.
- [ ] **Empty/Loading/Error:** placeholder ổn định, không nhảy layout.
- [ ] **Privacy:** ẩn dữ liệu nhạy cảm khi khoá.
- [ ] **Sizes:** thiết kế đủ cho small→large + accessory; chịu 75–125%.
- [ ] **Interactive:** nếu có toggle/button → có phản hồi trạng thái.
- [ ] **Margin:** 16 pt (hoặc 11 pt) và đồng tâm với góc bo.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Widget như app thu nhỏ | Không cuộn/không nhập được → vô dụng |
| Chữ nhỏ (<11 pt) | Không đọc được ngoài nắng, kém a11y |
| Nhồi nhiều số liệu | Không glance được |
| Cập nhật liên tục | Vượt ngân sách, tốn pin, bị hạn chế |
| Hiện dữ liệu nhạy cảm khi khoá | Rò rỉ quyền riêng tư |
| Tap mở app ở home chung | Mất ngữ cảnh, thêm bước |
| Live Activity cho nội dung tĩnh | Sai mục đích, gây nhiễu |
| Margin lệch, sát mép | Trông chật, thiếu chuyên nghiệp |
| Không test tinted mode | Vỡ màu trên Lock Screen |
| Không có placeholder | Layout nhảy khi dữ liệu về |

## 13. Design System Rules (token)

| Hạng mục | Quy định |
|---|---|
| **Typography** | ≥ 11 pt; medium weight trở lên cho thông tin chính; chữ nhỏ dùng tiết chế |
| **Spacing** | Margin 16 pt (tối thiểu 11 pt); khoảng cách **đồng tâm** với góc bo |
| **Radius** | Theo hệ thống; nội dung phải "fit" đồng tâm |
| **Elevation** | Không shadow; dùng tương phản/material hệ thống |
| **Motion** | Tối thiểu; không nhấp nháy; chuyển trạng thái rõ ràng |
| **Color** | Semantic; hoạt động ở tinted/vibrant; không chỉ màu |
| **Adaptivity** | Chịu scale 75–125%; đủ mọi kích thước & accessory |

## 14. AI Decision Framework

```
IF loại == Widget / Live Activity / Control
THEN
  Primary goal  = glanceable value + deep link
  Layout        = 1 ý; chữ ≥11pt; margin 16pt (min 11pt); đồng tâm
  Cập nhật      = timeline/push đúng lúc, không liên tục
  Input         = tap (deep link) + App Intents (toggle/action)
  Ưu tiên       = 1) Thông tin  2) Hành động nhanh  3) Mở app
  Bắt buộc      = tinted OK · ẩn dữ liệu nhạy cảm · placeholder ổn định · mọi kích thước
  Tránh         = cuộn · nhập liệu · chữ nhỏ · nhiều mục tiêu · cập nhật liên tục

IF nội dung là "đang diễn ra"     THEN Live Activity (compact+expanded), kết thúc rõ
IF hành động đơn giản (bật/tắt)   THEN Control/App Intent, không mở app
IF cần >1 mục tiêu                THEN tách widget hoặc tăng kích thước, không nén
IF dữ liệu riêng tư               THEN ẩn khi khoá/Always-On
IF cập nhật thất thường           THEN timeline policy + trạng thái stale rõ
IF nội dung cần đọc lâu           THEN mở app — widget chỉ để liếc
```

**Nguồn:** `research/04-widget/{SUMMARY,CHECKLIST,DIGEST}.md` · `notes/hig-*.md` · `transcripts/2025-278-*.md`.
