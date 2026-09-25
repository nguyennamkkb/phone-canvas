# Tri thức từ ảnh — Widget / Live Activity / Control

Phân tích trực tiếp ảnh minh hoạ Apple trong `assets/`.

| Ảnh | Trang HIG | Tri thức rút ra |
|---|---|---|
| `assets/live-activity-lock-screen.png` | Live Activities | Live Activity là **thẻ tối, bo tròn đồng tâm** nổi trên hình nền. Bố cục: **trái** = icon + số lượng ("3 items"); **phải** = người liên quan + đánh giá (sao); **giữa** = thông tin chính "Arriving in **8 minutes**" với **giá trị động được tô màu nhấn**. Toàn bộ nằm gọn, không che đồng hồ/nút hệ thống. |
| `assets/live-activity-margins.png` | Live Activities | Bản mở rộng có **hàng hành động** "Contact Juan C." (nút capsule rộng, teal) — hành động đặt dưới nội dung. Chú ý **margin đồng tâm** với góc bo của thẻ, không sát mép. |
| `assets/live-activity-compact.png` / `expanded.png` / `minimal.png` | Live Activities | 3 biến thể: **minimal** (1 dòng, đủ liếc), **compact** (2 vùng đối xứng), **expanded** (đầy đủ + hành động). Cùng một sự kiện, khác lượng thông tin. |
| `assets/live-activity-dynamic-island.png` | Live Activities | Khi ở Dynamic Island: nội dung phải chịu được **vùng bo 44 pt** và hai chế độ compact/expanded; không đặt chữ sát **vùng cảm biến** ở đỉnh. |
| `assets/control-anatomy.png` | Controls | Control Center: **Symbol image + Title + Value** trong **capsule kính**. Symbol nằm trái (trong đĩa tròn), Title/Value xếp phải. Đủ 3 thành phần để hiểu trạng thái mà không cần mở app. |
| `assets/widget-tinted.png` | Widgets | Chế độ **tinted**: toàn bộ nội dung đơn sắc theo tông, phân cấp bằng **kích thước & độ đậm** (mã "AAPL" + giá trị lớn "247.77"), sparkline nét mảnh. Vẫn đọc được vì tương phản tốt. |
| `assets/widget-small.png` / `medium.png` / `large.png` | Widgets | Cùng dữ liệu lịch, 3 kích thước: **small** = 1 ý, **medium** = 1 ý + ngữ cảnh, **large** = nhiều dòng. Khi lên large, tăng lượng thông tin — **không phóng to chữ**. Đáy medium/large để chừa chỗ cho **tên widget**. |

## Quy tắc rút ra cho Widget

1. **Một thẻ = một ý**, phân cấp bằng cỡ chữ/độ đậm, giá trị chính to nhất.
2. **Nội dung động được làm nổi** (màu nhấn) — ví dụ "8 minutes" — để mắt bắt ngay.
3. **Margin đồng tâm với góc bo**; chừa vùng an toàn cho Dynamic Island và tên widget.
4. **Tinted mode là bắt buộc:** phải đọc được khi mất màu; không truyền tải chỉ bằng màu.
5. **Control cần đủ Symbol + Title + Value**; nếu thiếu Value, trạng thái bật/tắt phải vẫn rõ.
6. **Hành động nằm dưới nội dung**, là nút capsule rộng trong Live Activity mở rộng.
