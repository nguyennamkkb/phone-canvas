# API & nền tảng watchOS (mới nhất)

> Tổng hợp từ WWDC26 *watchOS Group Lab* + WWDC25 *What's new in watchOS 26* +
> WWDC24/23 (Live Activities on Watch, Smart Stack widgets, watchOS 10 design) + HIG.
> **Lưu ý:** xác minh lại tên/khả dụng trong Xcode & Apple Developer Documentation trước khi dùng.

## 1. Kiến trúc & nền tảng

| Mục | Chi tiết |
|---|---|
| **arm64** | Apple Watch Series 9+, Ultra 2 chạy **arm64** từ watchOS 26; bật **Standard Architectures** trong Xcode; chú ý khác biệt `Float/Int` và pointer math; simulator trên Apple Silicon đã là arm64 |
| Runtime | Giới hạn nghiêm (watchdog timeout, ít core) — thiết kế công việc nền nhẹ, không giữ session vô ích |
| First launch | Không có thời gian trước lần mở đầu → **bundle thứ thiết yếu**, phần còn lại tải nền; luôn có gì đó hiển thị trước spinner; nghĩ tới **offline hoàn toàn** |
| Graphics | **SceneKit deprecated (watchOS 26)** → dùng **SwiftUI Canvas** (GPU, nhanh); **RealityKit không có trên watch** |

## 2. Design system & Liquid Glass

| Mục | Chi tiết |
|---|---|
| Design language watchOS 10+ | App build cho **watchOS 10+** tự nhận **style mới** cho toolbar/control; vẫn nên chạy lại để kiểm tra legibility |
| watchOS 26 | Materials/controls mới, app icon mới (**Icon Composer**), thay đổi ở watch face & Control Center |
| watchOS 27 | **Liquid Glass tinh chỉnh**: dark edges/speculars rõ hơn, tách nội dung khi cuộn để giữ legibility, hiệu năng tốt hơn, **glass tương tác** (kéo nút) |
| Người dùng | **Không có slider clarity/tint riêng trên watch** (UI chủ yếu tối, màn nhỏ); vẫn tôn trọng **Reduce Transparency / Increase Contrast** |
| Chuyển tiếp | Presentation dùng full-screen **thin material**; navigation bar có **variable blur**; `containerBackground` cho nền full-screen |

## 3. Complications & WidgetKit

| Việc | API / ghi chú |
|---|---|
| Complication hiện đại | **WidgetKit** (watchOS 9+), không dùng ClockKit cho mới |
| Families | accessoryCircular · accessoryRectangular · accessoryInline · accessoryCorner (+ Smart Stack dùng `.accessoryRectangular`); thiết kế **mọi family** khi có thể |
| Tint theo mặt đồng hồ | `widgetAccentable()`, `widgetAccentedRenderingMode(...)` — `nil` (mặc định) · `primary` · `accent` (khớp màu mặt) · `desaturated` |
| Nền | `containerBackground(for: .widget)` — chỉ hiện trong Smart Stack, **không** hiện trên mặt đồng hồ |
| Gauge | chọn **closed** (tỉ lệ) hay **open + range** (khoảng) theo loại dữ liệu; giá trị lớn ở giữa, nhãn range dưới |
| Corner controls | Dial view cho tối đa **4 corner controls** mà không che nội dung |

## 4. Smart Stack & RelevanceKit

| Việc | API / ghi chú |
|---|---|
| Ưu tiên theo entry (cũ) | `TimelineEntryRelevance(score:duration:)` — score xếp hạng entry trong cùng timeline, duration = thời gian relevance |
| Relevant intents (cũ) | `RelevantIntentManager`, `RelevantContext` (date…), `AppIntentRecommendation` |
| **RelevanceKit** (watchOS 26) | `RelevantContext` đa dạng: **date, sleep schedule, fitness, location, point-of-interest category**; `WidgetRelevance` với attributes; hỗ trợ **relevant widget** |
| **Relevant widget** | `RelevanceEntry` · `RelevanceEntriesProvider` (`relevance` + `entry` + `placeholder`) · `RelevanceConfiguration`; **nhiều card cùng lúc** cho các sự kiện khác nhau |
| Chống trùng | `associatedKind` trên `RelevanceConfiguration` trỏ tới `WidgetConfiguration` của timeline widget → hệ thống **thay thế** card timeline bằng card relevant |
| Preview | preview với `relevanceEntries`, `relevance`, `RelevanceProvider` — xem trước theo từng kích thước/điều kiện |
| Widget cấu hình được | Trả **mảng rỗng** cho recommendations ⇒ người dùng tự cấu hình (kèm availability check cho watchOS 26) |
| Control cấu hình được | `AppIntentControlConfiguration` + `AppIntentControlValueProvider` (giống iOS) |
| Gợi ý khác | Workout app được gợi ý nếu dùng **đúng `HKWorkoutActivityType`**, đúng start/end, thêm `HKWorkoutRouteBuilder` |

## 5. Controls trên Apple Watch (watchOS 26+)

| Mục | Chi tiết |
|---|---|
| Nơi xuất hiện | **Control Center · Smart Stack · Action button** (Ultra) |
| Thành phần | Symbol + title + **tint** + context |
| Nguồn | Từ **iPhone app** (kể cả không có Watch app) hoặc từ Watch app — **cùng API như iOS** |
| Hành vi | Chạm trên watch ⇒ thực thi **trên iPhone** (nếu control đến từ iPhone app); control có action **foreground iPhone app** sẽ **không** xuất hiện trên watch |
| Chọn loại | **Control** = hành động; **Widget** = thông tin; **Live Activity** = sự kiện có bắt đầu/kết thúc |

## 6. Live Activities trên Apple Watch (watchOS 11+)

| Mục | Chi tiết |
|---|---|
| Tự động | Live Activity iOS **tự xuất hiện trong Smart Stack**; dùng **compact leading/trailing** views (từ Dynamic Island) nếu chưa tùy biến |
| Tùy biến | `supplementalActivityFamilies(.small)` trên `WidgetConfiguration`; đọc **`activityFamily`** environment: `.small` = Smart Stack, `.medium` = iOS Lock Screen |
| Mở app | Info.plist: **“Supports Launch for Live Activity Attribute Types”** (trống = mọi activity; hoặc liệt kê từng `ActivityAttributes`) |
| Cập nhật | Đồng bộ **tự động** sang watch (không cần push token riêng); **có ngân sách**; hỗ trợ **high-frequency** khi yêu cầu |
| Kết nối hạn chế | Start / End / alerting updates **được ưu tiên**; hệ thống hiện “last connected” trong Smart Stack |
| Alerting update | Nếu đang ở mặt đồng hồ: tự mở Smart Stack → hiện alert → hiện Live Activity; nếu app foreground: banner đáy với compact views |
| Always-On | Hệ thống chuyển **dark + reduced luminance**; dùng **`isLuminanceReduced`** để bỏ/giảm phần sáng; `preferredColorScheme(.light)` vẫn thành dark khi Always-On; dùng **màu semantic** |

## 7. Điều hướng

| Cấu trúc | Khi dùng | Ghi chú |
|---|---|---|
| **NavigationSplitView** | Có source list + detail (thời tiết, cổ phiếu) | Source list **gấp dưới** detail, mở bằng tap; **khởi tạo selection** để mở thẳng detail; detail nên rõ tới mức không cần title |
| **TabView** | 2–5 vùng ngang cấp, cuộn dọc | `verticalPage` style; **một tab có thể giãn** theo nội dung (localization, chữ lớn); animation theo **selection** + `matchedGeometryEffect`; list bên trong tự mở rộng |
| **NavigationStack** | Phân cấp sâu | **Large title ở view đầu**, không dùng ở view con có back |

## 8. Layout, thanh & vật liệu

| Mục | Chi tiết |
|---|---|
| Grid hệ thống | Dựa trên **độ cong màn hình**; có trong **Apple Design Resources** |
| 3 layout nền | **Dial-based** (dày thông tin, full-screen color, ≤4 corner controls) · **Infographic** (chart + text + metric) · **List** (cuộn tìm) |
| Insets | `scenePadding` để dựng dial view đúng inset |
| Toolbar | Placement `topBarLeading` / `topBarTrailing` (đồng hồ dịch ra giữa), nút ở **bottom bar**; `controlSize` để làm nút lớn/nổi bật |
| Material | `ultraThin` · `thin` · `regular` · `thick` cho nền full-screen; **vibrant fill** cho control/platter cell; text **primary/secondary/tertiary/quaternary** |
| Nền | `containerBackground` + gradient tint theo accent; dùng màu để **truyền tin** (thời gian trong ngày, trạng thái) |
| Navigation bar | **variable blur** khi nội dung cuộn dưới |

## 9. Nhập liệu & phản hồi

| Mục | Chi tiết |
|---|---|
| **Digital Crown** | `digitalCrownRotation` (SwiftUI); Crown là **trục tương tác chính** (cuộn, phân trang, chỉnh chính xác) **nhưng luôn có touch thay thế** |
| **Action button** | Gắn chức năng cốt lõi (Ultra); watchOS 26 đưa **controls** tới Action button |
| **Double tap / gestures** | Cử chỉ hệ thống; không tự chế cử chỉ ẩn |
| **Haptics** | Phản hồi xúc giác thay cho âm thanh/hình ảnh; dùng **đúng kiểu & đúng lúc** |
| Dictation / Scribble | Đường nhập liệu chính — tránh bàn phím |
| Reorder (watchOS 27) | API **reorderable** mới trong SwiftUI (Apple dùng để làm Control Center) — lần đầu có thể kéo-sắp-xếp container trên watch |

## 10. Health & Workout

| Mục | Chi tiết |
|---|---|
| WorkoutKit | Custom workouts, goal/pacer, **alert** (power, pace), preview trên watch |
| **Heart rate zones + cycling power zones** (watchOS 27) | API linh hoạt; dùng cho cả lúc tập **và** phân tích sau tập (thời gian ở zone) |
| **Perimenopause / menopause** (watchOS 27) | API HealthKit mới |
| Workout insights / buddy (watchOS 27) | So sánh hiệu suất theo tuần/tháng/năm; trải nghiệm workout |
| Đúng activity type | Dùng đúng `HKWorkoutActivityType` + start/end + route để được gợi ý trong Smart Stack |

## 11. Cập nhật widget (đường cập nhật)

| Đường | Chi tiết |
|---|---|
| Timeline + reload policy | Có **expiration** ⇒ bảo đảm được refresh sau đó (hệ thống có thể giữ timeline cũ một lúc) |
| Invalidate từ app | Khi có dữ liệu mới, gọi reload |
| **APNs push updates** | Có từ **watchOS 26** (mọi nền tảng WidgetKit) |
| **Watch Connectivity updates** | Có từ **watchOS 27** — đẩy từ iPhone sang watch |
| Ngân sách | Mặt đồng hồ = tier cao nhất, cập nhật ~**15–20 phút** khi đang được dùng; Smart Stack phụ thuộc **tần suất người dùng xem** (có thể ~1 lần/ngày nếu ít xem) |
| Tài liệu | Apple: *Keeping your widget up to date*; WWDC26 *WidgetKit foundations* |

## 12. Intelligence trên watch (watchOS 27)

| Framework | Ghi chú |
|---|---|
| **Foundation Models** | Chạy **qua mạng** (không on-device, không mượn model iPhone): **PCC** (cần entitlement) hoặc provider theo **language model protocol** (Claude/Gemini sắp hỗ trợ, hoặc tự conform) |
| Kiểm tra trước khi gọi | API kiểm tra availability; **luôn có fallback** (không cellular, hết quota, token usage) |
| Ứng dụng hợp | Tóm tắt văn bản dài cho màn nhỏ, làm text dễ hiểu hơn, insight từ dữ liệu sức khoẻ |
| Vision · Core AI | Có mặt trên watchOS 27 |

## 13. Tooling & kiểm thử

| Mục | Chi tiết |
|---|---|
| Xcode 27 | Build/watch debugging nhanh hơn; nhớ **Standard Architectures** (arm64) |
| **Device Hub** | Kết nối **watch ↔ Mac trực tiếp** (không proxy qua iPhone) ⇒ tin cậy & throughput tốt hơn; cần mạng cho phép **peer-to-peer** (một số mạng công ty chặn); watch mới có Wi-Fi **5 GHz** |
| Kiểm thử | Vẫn phải test trên **nhiều đời Apple Watch** (người dùng không ai giống ai) + Device Hub cho nhiều cấu hình |
| Feedback | File Feedback Assistant + Developer Forums khi gặp giới hạn nền tảng |

## 14. Recipe phối hợp

```
1) Chọn system space: Control (hành động) / Widget (thông tin) / Live Activity (có start–end)
2) Complication: thiết kế mọi family, hỗ trợ tinted (widgetAccentable), nền qua containerBackground
3) Smart Stack: gắn RelevanceKit (date/location/fitness/sleep/POI) + relevant widget khi nhiều card
4) Cập nhật: timeline policy + APNs (26) / Watch Connectivity (27), tôn trọng budget
5) Live Activity: supplementalActivityFamilies(.small) + activityFamily + isLuminanceReduced
6) Điều hướng: NavigationSplitView / TabView(verticalPage) / NavigationStack
7) Layout: grid hệ thống, dial/infographic/list, scenePadding, toolbar placements, vibrant text/fill
8) Input: Crown (+touch thay thế), Action button, haptics, dictation
9) Test: Device Hub nhiều đời máy + arm64 + Always-On + limited connectivity + offline first launch
```
