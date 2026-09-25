# Tri thức từ ảnh — iPad (phân tích sâu)

Phân tích trực tiếp ảnh trong `assets/` (đã xem) + đối chiếu HIG/WWDC.

| Ảnh | Tri thức |
|---|---|
| `assets/split-view-horizontal.png` | Split ngang: **2 pane + divider**, pane dẫn hẹp hơn; nội dung chạy sát safe area (iPad tận dụng gần hết bề mặt). ⇒ iPad là **không gian đa pane**, không phải iPhone phóng to. |
| `assets/split-view-multiple.png` | Nhiều pane cùng tồn tại; mỗi pane vai trò riêng; collapse không mất ngữ cảnh. |
| `assets/sidebar-intro.png` | Sidebar = cột dẫn **thu gọn được**, điều hướng cấp cao; thay tab bar khi `regular width`. |
| `assets/popover-attached.png` | Popover **gắn** nguồn bằng arrow ⇒ quan hệ nhân–quả rõ; đóng khi tap ngoài. |
| `assets/popover-detached.png` | Popover **tách rời** = panel **inspector/thuộc tính** (tên, thời gian, người tham gia) ⇒ popover chứa **form ngắn**, không luồng dài. |
| `assets/padding-without-bezel.png` | Phần tử **không bezel** ("Button" chữ): padding **24 pt** mỗi bên. |
| `assets/padding-with-bezel.png` | Phần tử **có bezel** (nút tròn): padding ~**12 pt** quanh bezel. |
| `assets/padding-glyph.png` | Glyph cần padding để đủ vùng chạm. |
| `assets/pencil-pressure.png` | **Lực** ⇒ độ dày/đậm nét (cong dày dần). |
| `assets/pencil-azimuth.png` | **Azimuth** = hướng ngòi (vòng chia độ + chùm hướng) ⇒ đổi hướng nét như bút chì dẹt. |
| `assets/pencil-altitude.png` | **Altitude** = góc nâng ⇒ hiệu ứng nghiêng khác nhau. |
| `assets/pointer-pointing-hand.png` | Pointer **đổi hình theo ngữ cảnh**; hover để *dự đoán*, không để kích hoạt. |

## Quy tắc rút ra cho iPad

1. **Đa pane là mặc định:** split/sidebar/inspector thay vì đẩy màn hình.
2. **Popup ngắn, gắn ngữ cảnh:** popover cho lựa chọn/thuộc tính; form dài dùng sheet.
3. **Vùng chạm tính từ padding:** 24 pt (không bezel) / 12 pt (có bezel); glyph cần đệm.
4. **Pencil là công cụ thật:** lực + azimuth + altitude ⇒ nét phản hồi tức thời, không trễ.
5. **Pointer chỉ để dự đoán:** đổi hình theo ngữ cảnh; không dùng hover làm hành động duy nhất.
6. **Cửa sổ đổi kích thước ⇒ layout phải theo size class**, không theo "iPad" nói chung.
