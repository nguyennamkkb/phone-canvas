# Always-On Display & Haptics — watchOS

> Đúc kết từ HIG *Always On*, *Playing haptics*, *Designing for watchOS* + các Tech Talks/WWDC liên quan.
> Ảnh: `assets/always-on.png`, `assets/action-button.png`.

## 1. Always-On — nguyên tắc

- Khi cổ tay xuống, hệ thống **giảm luminance** và chuyển **dark color scheme**; khi giơ tay, giao diện
  trở lại bình thường.
- **Đừng gây phân tán khi Always-On bắt đầu/kết thúc** hay trong suốt trạng thái Always-On.
- **Giữ nội dung quan trọng sáng, làm mờ phần không thiết yếu** (dim nonessential).
  - Trong phiên (workout/timer/Now Playing): giữ **metric chính** sáng, ẩn chi tiết phụ.
- **Tránh thay đổi giao diện không cần thiết** — trên iPhone còn khó chịu hơn vì máy thường đặt úp/ngửa
  trên bàn, chuyển động dễ bị thấy.
- API: **`isLuminanceReduced`** (Live Activity/Widget), màu **semantic**, tránh phần tử sáng chói.
- Ảnh `assets/always-on.png`: glyph minh hoạ trạng thái **giảm sáng/tắt** — nội dung phải "đọc được nhưng
  không chói".

## 2. Always-On checklist

- [ ] Trạng thái Always-On hiển thị **thông tin chính**, ẩn chi tiết.
- [ ] Không animation/đổi màu mạnh khi bật/tắt Always-On.
- [ ] `isLuminanceReduced` được xử lý (đặc biệt Live Activity, gauge, nền sáng).
- [ ] Dùng màu semantic; kiểm tra độ tương phản ở mức sáng thấp.
- [ ] Metric trong phiên tập vẫn đọc được khi cổ tay xuống.

## 3. Haptics — nguyên tắc

- Haptics là **kênh phản hồi chính** trên watch (nhiều tình huống tắt tiếng, tay bận, nhìn vội).
- Dùng cho: **xác nhận** hành động, **cảnh báo** điều quan trọng, **nhịp** trong phiên tập.
- **Đúng kiểu rung theo ngữ nghĩa** (thành công ≠ cảnh báo ≠ lỗi) — người dùng học được ý nghĩa.
- **Không rung vô cớ, không rung liên tục** — sẽ mất giá trị tín hiệu và gây khó chịu.
- Haptics **bổ trợ**, không phải kênh duy nhất để hiểu trạng thái (phải có biểu diễn thị giác tương ứng).

## 4. Haptics checklist

- [ ] Mỗi loại phản hồi có **kiểu rung riêng, nhất quán**.
- [ ] Chỉ rung khi có ý nghĩa (xác nhận/cảnh báo/mốc quan trọng).
- [ ] Có biểu diễn thị giác tương ứng (không phụ thuộc haptics).
- [ ] Phiên tập: nhịp/kết thúc rõ bằng xúc giác.
- [ ] Không dùng rung để thay thế thông tin quan trọng bị ẩn.

## 5. Liên hệ với tương tác

- **Digital Crown** thường đi kèm phản hồi xúc giác nhẹ khi qua mốc (giúp "cảm" được giá trị).
- **Action button** (Ultra) và **double tap** cần phản hồi tức thời để người dùng tin là đã nhận.
- Trong Always-On, **không** phát haptics gây phân tán (trừ cảnh báo thật sự).
