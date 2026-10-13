# Freshness, kích thước & legibility

> Nguồn: Apple (HIG Widgets/Live Activities, WWDC25 widgets, WWDC26 WidgetKit foundations),
> Android/Material (widget sizing, style/theme).

## 1. Freshness

| Cơ chế | Khi dùng | Ghi chú |
|---|---|---|
| Timeline + reload policy | Dữ liệu theo lịch | Có **expiration** ⇒ đảm bảo refresh sau đó |
| Invalidate từ app | Có dữ liệu mới | Reload ngay |
| Push (APNs) | Server đẩy | Dùng cho tin tức/giá |
| Push từ phone → watch | Watch connectivity | Giữ 2 thiết bị đồng bộ |
| Relevance | Nội dung đúng ngữ cảnh | Giờ/địa điểm/hoạt động |

**Ngân sách (Apple):** mặt đồng hồ ~**15–20 phút** khi đang dùng; Smart Stack theo **tần suất xem**;
Live Activity có budget riêng. **Không** cập nhật liên tục; **không** để stale âm thầm.

## 2. Kích thước & co giãn

- **Apple:** family `systemSmall/Medium/Large/ExtraLarge` + accessory (circular/rectangular/inline/corner);
  widget template chịu **75%–125%**.
- **Android:** ước lượng theo ô: 1 ô ≈ **40 dp**, n ≈ **70×n − 30 dp**; khai `minWidth/minHeight`
  thận trọng; `minResize` cho ngưỡng không dùng được; responsive/exact-size layouts.
- **Lớn dần ⇒ thêm ngữ cảnh theo trục**, không phóng to chữ.

## 3. Legibility

- Chữ **≥ 11 pt** (Apple); trọng số **≥ medium** cho thông tin chính.
- Phân cấp bằng **size / weight / line-height / letter-spacing** (type scale 5 vai trò: display→body).
- Giá trị chính **to nhất**; phụ nhỏ và ít.
- **Margin đồng tâm** với góc bo; 16 pt chuẩn (11 pt khi cần nhóm).
- **Radius hệ thống** (Android); Apple theo container.

## 4. Theme & tinted

- Dùng **color token / dynamic color** ⇒ hợp theme thiết bị; hỗ trợ **light/dark** + contrast.
- **Tinted** (Apple): `widgetAccentable`, `widgetAccentedRenderingMode` (primary/accent/desaturated).
- **Không truyền tải chỉ bằng màu**; kiểm cả tinted và Always-On dim.

## 5. Placeholder & trạng thái

- Placeholder **giữ layout ổn định** (tránh shift khi dữ liệu về).
- Hiển thị **stale / last connected** khi dữ liệu có thể cũ.
- Live Activity: kết thúc đúng lúc; không để "mồ côi".

## 6. Checklist

- [ ] Chọn đúng đường cập nhật; tôn trọng budget.
- [ ] Có trạng thái stale/placeholder ổn định.
- [ ] Co giãn 75–125% / nhiều cỡ ô không vỡ.
- [ ] Chữ ≥ 11 pt; phân cấp rõ.
- [ ] Margin đồng tâm; radius hệ thống.
- [ ] Light/dark/tinted/dim đọc được; không chỉ màu.
