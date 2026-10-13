# Chọn surface & chiến lược

> Nguồn: Apple (WidgetKit/ActivityKit/Controls, Smart Stack), Android/Material (widgets, tiles),
> HIG.

## 1. Bảng chọn nhanh

| Mục đích | Surface |
|---|---|
| Thông tin suốt ngày, cập nhật theo lịch/ngữ cảnh | **Widget / Tile** |
| Tiến trình có **start–end** | **Live Activity** |
| **Hành động** một chạm | **Control / Tile action** |
| 1 dữ liệu trên **mặt đồng hồ** | **Complication** |
| Cập nhật ngoài app, cần chú ý | **Notification** |

> Primary purpose: **hành động → control** · **thông tin → widget** · **tiến trình → live activity**.

## 2. Khi nào KHÔNG dùng

- Widget cho việc cần hành động thường xuyên ⇒ **control**.
- Live Activity cho nội dung tĩnh ⇒ tốn budget, gây nhiễu.
- Control để hiển thị thông tin dài ⇒ **widget**.
- Notification thay màn hình chính của app.
- Complication cho nội dung phức tạp ⇒ **relevant widgets** (nhiều card).

## 3. Chiến lược cập nhật

```
Theo LỊCH (thời tiết, lịch)      -> timeline + reload policy
Đổi NGAY (giá, tỉ số)            -> push (APNs / watch connectivity) / invalidate từ app
Theo NGỮ CẢNH (giờ/địa điểm)     -> relevance (RelevanceKit / tương đương)
Có start–end                      -> Live Activity (realtime + kết thúc rõ)
```

## 4. Giới hạn tương tác

| Surface | Cuộn | Nhập | Hành động |
|---|---|---|---|
| Widget/Tile | ❌ | ❌ | App Intent (giới hạn) |
| Live Activity | ❌ | ❌ | App Intent / tap deep link |
| Control | ❌ | ❌ | 1 chạm |
| Complication | ❌ | ❌ | Tap mở app |

## 5. Quy tắc thiết kế chung

- **Một use case chính**; chi tiết mở trong app.
- Không cuộn; layout **responsive** theo kích thước.
- Chữ lớn; không chỉ màu; theme-aware.
- Deep link **đúng màn**; hành động đơn giản có phản hồi trạng thái.
- Tôn trọng **ngân sách**; hiển thị **stale** khi cần.

## 6. Checklist

- [ ] Xác định primary purpose.
- [ ] Chọn đúng surface (§1) và không rơi vào anti-pattern (§2).
- [ ] Chọn đúng đường cập nhật (§3).
- [ ] Tương tác trong giới hạn (§4); deep link đúng.
- [ ] Budget + trạng thái stale; riêng tư khi khoá.
