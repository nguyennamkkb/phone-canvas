# Smart Stack, RelevanceKit & chọn đúng không gian — watchOS

> Đúc kết từ WWDC25 *What's new in watchOS 26*, WWDC23 *Build widgets for the Smart Stack*,
> WWDC26 *watchOS Group Lab*, WWDC25 *What's new in widgets*.

## 1. Smart Stack chứa gì (watchOS 26+)

| Loại | Mục đích | Khi dùng |
|---|---|---|
| **Control** | **Hành động** nhanh (bật/tắt, mở view cụ thể) | "Tôi muốn làm ngay một việc" |
| **Widget** | **Thông tin** suốt ngày (thời tiết, lịch) | "Tôi muốn liếc thông tin" |
| **Live Activity** | Sự kiện có **bắt đầu/kết thúc** (trận đấu, chuyến bay, giao hàng) | "Theo dõi tiến trình trong lúc diễn ra" |

> Câu hỏi chọn: **primary purpose là gì?** Hành động → control · Thông tin → widget · Tiến trình → Live Activity.

## 2. Relevance — đưa nội dung đúng lúc

### 2.1 Cách cũ (vẫn dùng)
- `TimelineEntryRelevance(score:duration:)`: **score** xếp hạng entry trong cùng timeline; **duration** = thời gian còn relevant.
- `RelevantIntentManager` + `RelevantContext` (theo **date**) để báo trước khung giờ widget nên nổi lên.
- `AppIntentRecommendation` cho gallery cấu hình.

### 2.2 RelevanceKit (watchOS 26)
- Context sẵn có: **date · sleep schedule · fitness · location · point-of-interest category** (grocery, cafe, beach…).
- `WidgetRelevance` với **attributes** cho tất cả context liên quan; trả `nil` nếu category không hỗ trợ.
- **Relevant widget**: `RelevanceEntry` → `RelevanceEntriesProvider` (`relevance`, `entry`, `placeholder`) → `RelevanceConfiguration`.
  - Khi nhiều sự kiện cùng relevant (vd. 10:00 có 3 event), hệ thống gợi ý **nhiều card**, mỗi card một sự kiện — giải quyết bài toán *truncation* của timeline widget.
- **Chống trùng:** `associatedKind` trỏ tới kind của timeline widget ⇒ hệ thống **thay thế** card timeline bằng các card relevant.
- Preview: `relevanceEntries`, `relevance`, `RelevanceProvider` để xem trước theo kích thước & điều kiện.

### 2.3 Bài học từ đội watchOS (Group Lab)
- **Đừng chiếm top spot quá lâu** — người dùng sẽ bắt đầu dismiss.
- Phân biệt **alert** vs **suggestion**: có thông tin nên *hiện* nhưng không nhất thiết *alert* (vd. cảnh báo tiếng ồn → suggestion trước, notification sau).
- **Không phải mọi thứ đều alert**: ví dụ thể thao — bóng rổ alert theo hiệp, bóng đá alert mỗi bàn.

## 3. Cập nhật widget & ngân sách

| Đường cập nhật | Ghi chú |
|---|---|
| Timeline + reload policy | Có **expiration** ⇒ bảo đảm refresh sau đó |
| Invalidate từ app | Khi có dữ liệu mới |
| **APNs push** (watchOS 26) | Mọi widget trên mọi nền tảng WidgetKit |
| **Watch Connectivity** (watchOS 27) | Đẩy từ iPhone sang watch ⇒ đồng bộ iOS ↔ watch |

**Ngân sách:**
- Mặt đồng hồ = tier cao nhất — cập nhật khoảng **15–20 phút** khi đang được dùng nhiều.
- Smart Stack: phụ thuộc **tần suất người dùng xem** (ít xem ⇒ có thể ~1 lần/ngày).
- Hệ thống tối ưu theo **nền tảng + mức tương tác**; đừng đối xử với widget như app.

## 4. Control trên watch (watchOS 26+)

- Xuất hiện ở **Control Center, Smart Stack, Action button** (Ultra).
- Thành phần: **symbol + title + tint + context**.
- Từ **iPhone app** (không cần Watch app) hoặc từ Watch app; cùng API như iOS.
- Control từ iPhone app: hành động chạy **trên iPhone**; control có action **foreground iPhone app** ⇒ **không xuất hiện** trên watch.
- Cấu hình được: `AppIntentControlConfiguration` + `AppIntentControlValueProvider`.

## 5. Checklist Smart Stack

- [ ] Chọn đúng loại: control / widget / Live Activity theo **primary purpose**.
- [ ] Widget cấu hình được khi cần (trả mảng rỗng recommendations + availability check).
- [ ] RelevanceKit: gắn context (date/location/fitness/sleep/POI) — đúng **real-world context**.
- [ ] Nhiều sự kiện chồng nhau ⇒ dùng **relevant widget** + `associatedKind` chống trùng.
- [ ] Chọn đường cập nhật phù hợp (timeline/APNs/Watch Connectivity) và tôn trọng budget.
- [ ] Không lạm dụng vị trí top; phân biệt alert vs suggestion.
- [ ] Workout app: đúng activity type + route để được gợi ý.
