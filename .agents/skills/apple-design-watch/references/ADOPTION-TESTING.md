# Adoption & Testing — watchOS

> Đúc kết từ WWDC26 *watchOS Group Lab*, WWDC25 *What's new in watchOS 26*
> + HIG *Designing for watchOS*.

## 1. Kiến trúc & SDK

| Mục | Việc cần làm |
|---|---|
| **arm64** (Series 9+, Ultra 2, watchOS 26+) | Bật **Standard Architectures** cho target Apple Watch; chú ý `Float/Int` và pointer math; test **cả simulator lẫn thiết bị** |
| Design system | App build cho **watchOS 10+** đã tự nhận style mới; **chạy lại và audit** UI tuỳ biến để chắc còn legible |
| Icon | Dùng **Icon Composer**; icon watch hiện ở app grid/list + notification gửi trực tiếp cho watch; icon iOS hiện ở notification chuyển tiếp từ iPhone |
| Xcode | Dùng **Xcode 27**; cài beta, gửi feedback kèm log nếu còn chậm |
| Graphics | **SceneKit deprecated** → chuyển dần sang **SwiftUI Canvas** (GPU) |

## 2. Gỡ lỗi & kết nối

- **Device Hub** (từ watchOS 26/27): kết nối **watch ↔ Mac trực tiếp**, không proxy qua iPhone ⇒
  tin cậy & throughput tốt hơn.
- Cần mạng cho phép **peer-to-peer** giữa thiết bị (một số mạng công ty chặn).
- Apple Watch mới có Wi-Fi **5 GHz** ⇒ throughput tốt hơn.
- **Vẫn phải test nhiều đời máy**: dùng thiết bị thật cho đường tới hạn, Device Hub cho dải cấu hình rộng.

## 3. Ràng buộc runtime

- Hệ thống áp **watchdog timeout chặt** và giới hạn tài nguyên (ít core) —
  công việc nền phải **nhẹ, gọn, có lý do**.
- Ưu tiên: **Swift async**, URLSession, CloudKit… (API quen thuộc vẫn có), nhưng **không giữ session dài**.
- Widget có **ngân sách**; Live Activity có **ngân sách**; không đối xử như app foreground.

## 4. First launch & offline

- Lần mở đầu **không có thời gian chuẩn bị trước** ⇒ làm sao để người dùng **thấy gì đó hữu ích ngay**,
  không nhìn spinner.
- **Bundle thứ thiết yếu**; phần còn lại tải nền (background URL session).
- Thiết kế cho **offline hoàn toàn** (đi rừng, đi biển…): trạng thái không kết nối phải có nội dung thay thế.
- Foundation Models (watchOS 27) **cần mạng** ⇒ luôn có **fallback** (không cellular, quota, provider lỗi).

## 5. Ma trận kiểm thử

| Trục | Giá trị |
|---|---|
| Thiết bị | Series nhỏ nhất ↔ Ultra; nhiều kích cỡ màn hình |
| Kiến trúc | arm64 (device + simulator) |
| Màn hình | sáng/tối · **Always-On** (cổ tay xuống) · **reduced luminance** |
| Accessibility | chữ lớn · **Reduce Transparency** · **Increase Contrast** · Reduce Motion |
| Kết nối | Wi-Fi · cellular · **không kết nối** · kết nối hạn chế (Live Activity) |
| Ngôn ngữ | LTR · **RTL** · chữ dài (localization) |
| Trạng thái | first launch offline · dữ liệu stale · placeholder |
| Phiên | workout/timer/Now Playing khi Always-On |

## 6. Checklist adoption

- [ ] Build **Standard Architectures** (arm64); test device + simulator.
- [ ] Audit UI tuỳ biến sau khi lên design system mới (legible với style hệ thống).
- [ ] Icon cập nhật bằng Icon Composer.
- [ ] Dùng Device Hub; kiểm mạng peer-to-peer; test dải thiết bị.
- [ ] Công việc nền nhẹ; không giữ session; tôn trọng watchdog.
- [ ] First launch: có nội dung ngay, phần tải nền, có trạng thái offline.
- [ ] Foundation Models: kiểm availability + fallback.
- [ ] Chạy ma trận mục 5.
