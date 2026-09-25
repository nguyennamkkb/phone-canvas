# API & nền tảng WidgetKit / ActivityKit

> Tổng hợp từ WWDC26 *WidgetKit foundations*, *Live Activities essentials*, WWDC25 *What's new in
> widgets* / *What's new in watchOS 26*, WWDC24/23 (controls, Smart Stack, Live Activities on Watch).
> **Xác minh tên/khả dụng trong Xcode trước khi dùng.**

## 1. Widget cơ bản

| Thành phần | Vai trò |
|---|---|
| **Entry** (`TimelineEntry` / `RelevanceEntry`) | Dữ liệu để render 1 trạng thái |
| **Provider** (`AppIntentTimelineProvider` / `RelevanceEntriesProvider`) | Tạo entry + **advise WidgetKit khi nào cập nhật** |
| **Configuration** (`AppIntentConfiguration` / `RelevanceConfiguration`) | Ghép provider + entry + view |
| **View** | SwiftUI; dùng `containerBackground(for: .widget)` |
| **Families** | `systemSmall` · `systemMedium` · `systemLarge` · `systemExtraLarge`; **accessory**: `circular` · `rectangular` · `inline` · `corner` |
| **Placeholder** | Trạng thái chưa có dữ liệu (redacted) |
| **Previews** | `#Preview` theo family/size; preview relevance để xem trước Smart Stack |

## 2. Cập nhật (freshness)

| Đường | Khi dùng | Ghi chú |
|---|---|---|
| **Timeline + reload policy** | Dữ liệu thay đổi theo lịch | Có **expiration** ⇒ bảo đảm refresh sau đó |
| **Invalidate từ app** | Có dữ liệu mới ngay | `WidgetCenter.reloadTimelines` |
| **APNs push** (watchOS 26+ / mọi nền tảng) | Server đẩy cập nhật | Dùng cho tin tức/giá… |
| **Watch Connectivity push** (watchOS 27) | Đẩy từ iPhone sang watch | Giữ iOS ↔ watch đồng bộ |
| **RelevanceKit** (watchOS 26) | Nội dung đúng **ngữ cảnh** | Context: date · sleep · fitness · location · POI |
| **Relevant widget** | Nhiều card theo sự kiện | `RelevanceEntry` + `associatedKind` chống trùng |

**Ngân sách:** mặt đồng hồ ~**15–20 phút** khi đang dùng · Smart Stack theo tần suất xem ·
hệ thống tối ưu theo **nền tảng + mức tương tác**.

## 3. Tương tác

- **Widget tương tác**: `Button` / `Toggle` với **App Intent** — hành động đơn giản, an toàn, dễ hiểu.
- **Control** (watchOS 26 / iOS 18+): WidgetKit control cho **Control Center, Smart Stack, Action button**;
  thành phần **symbol + title + tint + value**; cấu hình bằng `AppIntentControlConfiguration` +
  `AppIntentControlValueProvider`; có thể đến từ **app iPhone** (không cần app watch).
- **Snippet**: UI tương tác nhỏ trong link/App Intent.
- **Không**: cuộn, nhập liệu, gesture phức tạp trong widget.

## 4. Live Activities (ActivityKit)

| Mục | Chi tiết |
|---|---|
| Khai báo | `ActivityAttributes`; bắt đầu/kết thúc/kết thúc sớm |
| Bề mặt | Lock Screen · **Dynamic Island** (compact leading/trailing, minimal, expanded) · StandBy |
| Trên watch | **Tự xuất hiện trong Smart Stack** (watchOS 11+); tuỳ biến bằng `supplementalActivityFamilies(.small)` + đọc `activityFamily` (`.small` = Smart Stack, `.medium` = Lock Screen iOS) |
| Mở app watch | Info.plist “Supports Launch for Live Activity Attribute Types” |
| Cập nhật | Đồng bộ tự động sang watch; **có ngân sách**; hỗ trợ **high-frequency** khi yêu cầu |
| Kết nối hạn chế | Start/End/alerting **được ưu tiên**; hiện “last connected” |
| Always-On | `isLuminanceReduced`; hệ thống chuyển dark + giảm sáng |
| Alert có chọn lọc | Không alert mọi thay đổi (vd. thể thao: alert theo mốc lớn) |

## 5. Rendering & style

| Mục | Chi tiết |
|---|---|
| Nền | `containerBackground(for: .widget)` — chỉ hiện ở Smart Stack, không hiện trên mặt đồng hồ |
| Tint | `widgetAccentable()` + `widgetAccentedRenderingMode` (`nil`/`primary`/`accent`/`desaturated`) |
| Margin | **16 pt** chuẩn; **11 pt** khi cần nhóm; phải **đồng tâm** với góc bo |
| Chữ | **≥ 11 pt**; trọng số **medium** trở lên cho thông tin chính |
| Live Activity | margin Lock Screen **14 pt**; Dynamic Island bo **44 pt**; custom view ≤ **400 pt**; scale 2× khi mở |
| Resize | Widget template co giãn **75%–125%** |
| Tinted mode | Bắt buộc đọc được khi mất màu |

## 6. Nền tảng

| Nền tảng | Điểm khác |
|---|---|
| iOS/iPadOS | Home Screen, Lock Screen accessories, StandBy, Control Center |
| watchOS | Mặt đồng hồ (complication), **Smart Stack**, RelevanceKit, controls |
| macOS | Desktop widgets; notification center |
| visionOS | Widget nổi trong không gian, depth |
| CarPlay | Widget trên màn xe (cùng size class với Smart Stack) |

## 7. Recipe

```
1) Chọn bề mặt: widget (thông tin) / Live Activity (start–end) / control (hành động) / complication
2) Thiết kế 1 ý; chữ ≥11pt; margin 16pt đồng tâm; tinted OK
3) Chọn đường cập nhật: timeline policy → APNs → Watch Connectivity → relevance
4) Tương tác tối giản: App Intent button/toggle; tap → deep link đúng màn
5) Live Activity: compact/minimal/expanded + supplementalActivityFamilies(.small) + isLuminanceReduced
6) Test: mọi family/kích thước, tinted, dark/light, Always-On, resize 75–125%, budget
```
