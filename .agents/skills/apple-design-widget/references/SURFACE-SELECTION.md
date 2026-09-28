# Chọn đúng bề mặt — Widget / Live Activity / Control / Complication

> Nguồn: WWDC25 *What's new in watchOS 26* / *What's new in widgets*, WWDC26 *WidgetKit foundations*,
> *Live Activities essentials*, HIG (Widgets, Live Activities, Controls).

## 1. Câu hỏi quyết định

| Mục đích | Bề mặt |
|---|---|
| **Hiển thị thông tin** suốt ngày, cập nhật theo lịch/ngữ cảnh | **Widget** (Home/Lock/Smart Stack) |
| **Theo dõi tiến trình** có **bắt đầu – kết thúc** | **Live Activity** |
| **Thực hiện hành động** nhanh (bật/tắt, mở view) | **Control** |
| 1 dữ liệu ngay trên **mặt đồng hồ** | **Complication** (WidgetKit) |
| Cập nhật **ngoài app**, cần người dùng chú ý | **Notification** |

> "Primary purpose" quyết định: **hành động → control** · **thông tin → widget** · **tiến trình → Live Activity**.

## 2. So sánh nhanh

| | Widget | Live Activity | Control | Complication |
|---|---|---|---|---|
| Thời gian sống | Bền | Có start–end | Bền | Bền |
| Cập nhật | Timeline / push / relevance | Realtime + push | Khi tương tác/push | Timeline / push |
| Tương tác | App Intent (giới hạn) | App Intent / tap | 1 chạm | Tap mở app |
| Bề mặt | Home, Lock, StandBy, Smart Stack | Lock, Dynamic Island, StandBy, Smart Stack | Control Center, Smart Stack, Action button | Mặt đồng hồ |
| Ngân sách | Có | Có (rộng hơn khi active) | — | Có |

## 3. Khi nào KHÔNG dùng

- **Widget** cho việc cần hành động thường xuyên ⇒ dùng **control**.
- **Live Activity** cho nội dung tĩnh ⇒ lãng phí ngân sách, gây nhiễu.
- **Control** để hiển thị thông tin dài ⇒ dùng widget.
- **Notification** thay cho màn hình chính của app.
- **Complication** cho nội dung phức tạp ⇒ dùng relevant widget (nhiều card).

## 4. Chiến lược cập nhật

```
Dữ liệu theo LỊCH (thời tiết, lịch)        -> timeline + reload policy
Dữ liệu đổi NGAY (giá, tỉ số)              -> APNs push / invalidate từ app
Cần ĐÚNG NGỮ CẢNH (địa điểm, giờ, fitness) -> RelevanceKit (watchOS 26+)
Đẩy từ iPhone sang watch                   -> Watch Connectivity (watchOS 27)
Sự kiện có start–end                        -> Live Activity (update realtime + kết thúc rõ)
```

## 5. Ngân sách & kỳ vọng

- Mặt đồng hồ (đang dùng nhiều): ~**15–20 phút**/lần cập nhật.
- Smart Stack: theo **tần suất người dùng xem** (ít xem ⇒ ~1 lần/ngày).
- Live Activity: cập nhật trễ khi cổ tay xuống nhưng **giơ tay thấy bản mới nhất**.
- **Đừng đối xử widget như app** — không cập nhật liên tục, không giữ session.

## 6. Checklist chọn bề mặt

- [ ] Primary purpose là thông tin / tiến trình / hành động?
- [ ] Có start–end rõ ⇒ Live Activity.
- [ ] Cần 1 chạm ⇒ control.
- [ ] Trên watch ⇒ cân nhắc complication + relevance.
- [ ] Chọn đúng đường cập nhật + tôn trọng budget.
- [ ] Nếu nhiều sự kiện chồng nhau ⇒ relevant widget + `associatedKind`.
- [ ] Tap luôn mở **đúng màn hình** liên quan (deep link).
