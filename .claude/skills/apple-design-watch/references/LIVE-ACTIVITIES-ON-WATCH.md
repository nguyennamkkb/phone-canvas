# Live Activities trên Apple Watch

> Đúc kết từ WWDC24 *Bring your Live Activity to Apple Watch*, *Design Live Activities for Apple Watch*,
> WWDC25 *What's new in watchOS 26* (+ *What's new in widgets*).

## 1. Xuất hiện thế nào

- Từ **iOS 18 / watchOS 11**, Live Activity của app iOS **tự xuất hiện trong Smart Stack** — kể cả khi
  **chưa có Watch app**.
- Mặc định dùng **compact leading/trailing** (view của Dynamic Island) + tiêu đề app.
- **Alerting update:** nếu đang ở mặt đồng hồ → hệ thống **tự mở Smart Stack**, hiện alert, rồi hiện
  Live Activity. Nếu app đang foreground → **banner** ở đáy với compact views.
- Chạm vào Live Activity ⇒ **full-screen presentation** + tuỳ chọn mở app trên iPhone.

## 2. Tuỳ biến cho watch

| Việc | Cách làm |
|---|---|
| Bật family nhỏ | `supplementalActivityFamilies(.small)` trên `WidgetConfiguration` |
| Biết đang ở watch hay iOS | đọc **`activityFamily`** environment: `.small` = Smart Stack · `.medium` = iOS Lock Screen |
| Bố cục riêng cho watch | Viết layout mới khi `activityFamily == .small` (Lock Screen content thường bị **truncate** trên watch) |
| Mở Watch app khi chạm | Info.plist **“Supports Launch for Live Activity Attribute Types”**: để trống = mọi activity; hoặc liệt kê từng `ActivityAttributes` |
| Xem trước | Xcode Preview cho Live Activity; Canvas Device Settings → **All Variants** hoặc **Content Smart Stack** |

## 3. Cập nhật, ngân sách, kết nối

- Update **đồng bộ tự động** sang watch — **không cần push token riêng**.
- Có **ngân sách** (tương tự iOS); update vượt ngân sách có thể **không hiện ngay khi cổ tay xuống**,
  nhưng khi giơ tay lên sẽ thấy thông tin **mới nhất**.
- Watch hỗ trợ **high-frequency updates** khi yêu cầu.
- **Kết nối hạn chế:** Start / End / alerting updates **được ưu tiên**; hệ thống hiện thông báo
  **“last connected”** trong Smart Stack để người dùng biết dữ liệu có thể cũ.
- Update cục bộ bằng ActivityKit trên iOS **cũng** đồng bộ sang watch và **tính vào ngân sách**.

## 4. Always-On Display

- Hệ thống tự chuyển **dark color scheme** + **giảm luminance** khi cổ tay xuống.
- Dùng **`isLuminanceReduced`** để bỏ/giảm phần tử sáng (vd. đổi tint gauge để dễ đọc).
- Nếu muốn giao diện sáng: đặt `preferredColorScheme(.light)` — Always-On vẫn dùng dark + reduced luminance.
- Dùng **màu semantic** (primary…) để tự thích ứng color scheme.

## 5. Thiết kế nội dung (bài học)

- Compact views phải **kịp thời, liên quan, giàu thông tin** — vì đó là thứ xuất hiện đầu tiên.
- **Alert có chọn lọc:** đừng alert mọi thay đổi. Ví dụ thể thao: bóng rổ alert theo **hiệp**, bóng đá
  alert mỗi **bàn**.
- **Kết thúc đúng lúc:** hoạt động xong thì biến mất (đừng để "treo" 5 giờ sau khi giao hàng).
- Phân biệt **alert** (cần biết ngay) vs **update thầm** (theo dõi thụ động).

## 6. Checklist Live Activity trên watch

- [ ] Bật `supplementalActivityFamilies(.small)` và **thiết kế layout riêng** cho `.small`.
- [ ] Compact leading/trailing hữu ích (không chỉ lặp lại nội dung).
- [ ] `isLuminanceReduced` xử lý đúng; màu semantic; đọc được khi Always-On.
- [ ] Không vượt ngân sách; chấp nhận update trễ khi cổ tay xuống.
- [ ] Xử lý kết nối hạn chế (start/end/alert ưu tiên) + trạng thái “last connected”.
- [ ] Alert có chọn lọc; kết thúc khi hoạt động xong.
- [ ] (Nếu có Watch app) cấu hình key launch đúng phạm vi `ActivityAttributes`.
