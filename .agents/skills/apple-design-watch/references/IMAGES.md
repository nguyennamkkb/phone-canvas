# Tri thức từ ảnh — Apple Watch (phân tích sâu)

Phân tích trực tiếp 16 ảnh trong `assets/`.

## 1. Mặt đồng hồ & complication

| Ảnh | Tri thức |
|---|---|
| `assets/complications-intro.png` | Mặt đồng hồ với các **slot**: **Top Left** (Earth), **Date** (FRI 23), **Middle** = complication dạng chữ (**8:00–9:00AM / Yoga / Gym** — giờ + tiêu đề + phụ đề), **Bottom Left** (Activity rings), **Bottom Middle** (Compass — dial la bàn), **Bottom Right** (Temperature — gauge **72** với range **64–88**). ⇒ Thiết kế theo **slot**, mỗi slot một vai trò; dữ liệu ngắn, tương phản cao trên nền tối. |
| `assets/watch-face.png` | Ba mặt đồng hồ: **Solar Graph** (full-screen color + line chart + nhiệt độ), **GMT** (analog, **complication rải quanh bezel**), **Unity Lights** (hoạ tiết radial). ⇒ Mặt đồng hồ dùng **màu/đồ hoạ toàn màn** và **tint** complication theo tông mặt. |
| `assets/complication-circular-stack-text.png` | Complication tròn: **"AAPL"** (trắng) + **"121.96"** (xanh = tăng). ⇒ Stack text 2 dòng; **màu truyền tín hiệu tăng/giảm** nhưng phải còn đọc được khi mất màu. |
| `assets/complication-circular-stack.png` | Icon mặt trời + **7:24**: **icon + một giá trị** trên nền đen tuyền — đúng tinh thần "một ý". |
| `assets/complication-circular-image.png` | Biến thể **ảnh** trong family tròn — ảnh phải đọc được ở tinted/desaturated. |
| `assets/complication-open-gauge-range.png` | Gauge **open + range** trong slot tròn: cung gradient + giá trị lớn giữa + nhãn range. |
| `assets/complication-closed-gauge-text.png` | Gauge **closed** (vòng kín) khi giá trị là tỉ lệ/điểm kết thúc. |
| `assets/bezel-circular-text.png` | Chữ trong family tròn phải nằm gọn **vùng an toàn của bezel**; chữ dài bị cắt ở cạnh cong. |

## 2. Gauge

| Ảnh | Tri thức |
|---|---|
| `assets/gauge-open-range-text.png` | Cung gradient (xanh→vàng→cam) mã hoá **vùng**, số **72** lớn ở giữa, nhãn **55 76** dưới, mark tròn chỉ vị trí hiện tại. |
| `assets/gauge-closed-text.png` | Vòng kín = tỉ lệ 0–100%. |

## 3. Thông báo

| Ảnh | Tri thức |
|---|---|
| `assets/notification-short-look.png` | **Short look**: icon app lớn, **Title đậm**, 2 dòng mô tả, **căn giữa**, nền mờ gradient. |
| `assets/notification-long-look.png` | **Long look**: mở rộng khi giơ tay — thêm chi tiết + **nút hành động**. |
| `assets/notification-intro.png` | Bộ ví dụ notification: nội dung ngắn, không lặp lại app. |

## 4. Tương tác & trạng thái

| Ảnh | Tri thức |
|---|---|
| `assets/digital-crown.png` | Crown là **trục cuộn/chỉnh**; luôn có **touch thay thế**. |
| `assets/action-button.png` | Glyph Action button (mũi tên + khung) đặt trên **grid hệ thống** (vòng tròn + crosshair). ⇒ Glyph/icon thiết kế theo **grid chuẩn của Apple**. |
| `assets/always-on.png` | Glyph trạng thái **giảm sáng/tắt** (điện thoại có gạch chéo) trên grid. ⇒ Always-On phải **dim phần phụ**, giữ nội dung chính. |

## 5. Quy tắc rút ra

1. **Thiết kế theo slot/family**, không theo "màn hình"; mỗi slot **một ý**.
2. **Icon + một giá trị** là đơn vị cơ bản; stack text tối đa 2–3 dòng.
3. **Gauge chọn theo dữ liệu:** closed = tỉ lệ; open + range = khoảng; luôn có nhãn range khi cần.
4. **Tint/tinted là mặc định** trên mặt đồng hồ — không truyền tải chỉ bằng màu.
5. **Chữ phải nằm trong bezel**; glyph theo grid hệ thống.
6. **Thông báo chia 2 tầng:** short look (liếc) → long look (chi tiết + hành động).
7. **Always-On = dim, không phân tán** — nội dung chính sáng, phần phụ mờ.
