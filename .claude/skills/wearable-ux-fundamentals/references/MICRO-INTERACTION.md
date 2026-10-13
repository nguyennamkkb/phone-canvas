# Micro-interaction & haptics trên wearable

> Nguồn: Apple HIG (Playing haptics, Digital Crown, Always-On, Action button),
> Wear OS (app principles), thực hành watch.

## 1. Phản hồi là bắt buộc, rất nhanh

- Mọi tap/crown phải có phản hồi **tức thời** (< 100 ms): visual + haptic.
- Phản hồi phải **nhất quán ngữ nghĩa** (thành công ≠ cảnh báo ≠ lỗi).
- Không có "chờ im lặng" — người dùng không biết đã nhận chưa.

## 2. Haptics

| Nguyên tắc | Chi tiết |
|---|---|
| Đúng lúc | Xác nhận hành động, cảnh báo quan trọng, mốc trong phiên tập |
| Đúng kiểu | Mỗi loại phản hồi có kiểu rung riêng, người dùng học được |
| Không lạm dụng | Rung vô cớ/liên tục ⇒ mất giá trị + khó chịu |
| Có bổ trợ | Luôn có biểu diễn thị giác tương ứng (không phụ thuộc haptics) |
| Trong Always-On | Không gây phân tán trừ cảnh báo thật |

## 3. Crown / rotary

- Là trục **cuộn/chỉnh** chính, chính xác (không che màn).
- Kèm **haptic nhẹ** khi qua mốc để "cảm" được giá trị.
- **Luôn có touch thay thế** (a11y + thói quen khác nhau).

## 4. Nút phụ (Action/Side button)

- Gán **1 chức năng cốt lõi**, nhãn ≤ 3 từ.
- Để **hệ thống dạy** người dùng, không lặp lại hướng dẫn.
- Phản hồi tức thời để người dùng tin là đã nhận.

## 5. Always-On / dim

- Khi cổ tay xuống: **giảm sáng**, giữ **nội dung chính**, mờ phần phụ.
- **Tránh thay đổi/animation** khi bật/tắt Always-On.
- Trong phiên tập: metric chính vẫn đọc được khi dim.

## 6. Checklist micro-interaction

- [ ] Mọi tap có phản hồi < 100 ms.
- [ ] Haptic đúng kiểu, đúng lúc; có biểu diễn thị giác.
- [ ] Crown có haptic + touch thay thế.
- [ ] Nút phụ: chức năng cốt lõi, nhãn ≤ 3 từ.
- [ ] Always-On: dim đúng, không phân tán.
- [ ] Phiên tập: nhịp/kết thúc rõ bằng xúc giác + thị giác.
