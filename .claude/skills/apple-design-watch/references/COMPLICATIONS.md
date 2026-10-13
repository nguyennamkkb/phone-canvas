# Complications & mặt đồng hồ — watchOS

> Đúc kết từ HIG *Complications*, *Watch faces* + WWDC23 *Build widgets for the Smart Stack*,
> WWDC25 *What's new in watchOS 26*.
> Ảnh: `assets/complications-intro.png`, `assets/complication-*.png`, `assets/gauge-*.png`, `assets/watch-face.png`.

## 1. Vị trí & vai trò

Complication là **điểm vào chính** của app trên cổ tay: người dùng **liếc mặt đồng hồ**, không mở app.
Mục tiêu: **một thông tin, đọc trong 1–3 giây**.

Ảnh `assets/complications-intro.png` cho thấy các **slot** quanh mặt đồng hồ: *Top Left (Earth)*,
*Date*, *Middle (Your Schedule — dạng chữ: giờ + tiêu đề + phụ đề)*, *Bottom Left (Activity rings)*,
*Bottom Middle (Compass — dial)*, *Bottom Right (Temperature — gauge 72, range 64/88)*.
⇒ **Thiết kế theo slot**, không theo "màn hình".

## 2. Families (WatchKit/WidgetKit)

| Family | Hình dạng | Dùng cho | Ghi chú |
|---|---|---|---|
| `accessoryCircular` | tròn nhỏ | 1 số/1 trạng thái, gauge, icon | Nội dung phải nằm trong **vùng an toàn của bezel** |
| `accessoryRectangular` | chữ nhật ngang | 2–3 dòng (giờ + tiêu đề + phụ đề) | **Cũng là dạng dùng trong Smart Stack** |
| `accessoryInline` | 1 dòng | câu ngắn/ký hiệu + text | Chỉ một dòng, dễ bị cắt |
| `accessoryCorner` | góc | 1 giá trị ở góc | Gắn với mặt đồng hồ cụ thể |
| *(graphic) circular stack / image / text* | tròn lớn | stack icon+text, ảnh, gauge | Ảnh `complication-circular-stack-text.png`: "AAPL" + "121.96" |

> **Hỗ trợ càng nhiều family càng tốt**; có thể tạo **nhiều biến thể cho mỗi family**.

## 3. Gauge — chọn theo dữ liệu

| Kiểu | Khi dùng | Ảnh |
|---|---|---|
| **Closed gauge** | Giá trị có tỉ lệ 0–100% / có điểm kết thúc | `assets/gauge-closed-text.png` |
| **Open gauge + range** | Giá trị có **khoảng** (min/max hợp lý) | `assets/gauge-open-range-text.png` — số lớn ở giữa ("72"), nhãn range dưới ("55 76"), mark chỉ vị trí |

- Ring/gauge **chọn theo loại dữ liệu**, không theo thẩm mỹ.
- Màu gradient/cung **mã hoá vùng** (xanh→vàng→cam) ⇒ vẫn phải đọc được khi mất màu (tinted).

## 4. Rendering theo mặt đồng hồ (tinted)

- `widgetAccentable()` — nội dung sẽ **tint theo màu mặt đồng hồ**.
- `widgetAccentedRenderingMode(...)`:
  - `nil` = không áp dụng (như chưa gọi)
  - `primary` = tô màu nội dung chính (thường thành trắng)
  - `accent` = tô theo **màu accent của mặt đồng hồ** (trên watch, accent = màu mặt)
  - `desaturated` = làm bạc màu ảnh
- Ảnh phải **trông tốt ở tinted mode** — kiểm tra cả 3 chế độ.

## 5. Nền

- `containerBackground(for: .widget)` — **chỉ dùng trong Smart Stack**, KHÔNG hiện trên mặt đồng hồ.
- Trên mặt đồng hồ: nền do hệ thống/mặt quyết định ⇒ thiết kế **trong suốt/tương phản**, không giả định nền riêng.

## 6. Layout & giới hạn

- **Dial view:** tối đa **4 corner controls** mà không che nội dung chính.
- Chữ trong family tròn phải nằm gọn **trong vùng an toàn của bezel** (`assets/bezel-circular-text.png`).
- Complication chỉ có **một ý**; nhiều số liệu ⇒ tách family khác hoặc dùng relevant widget (nhiều card).

## 7. Checklist complication

- [ ] Hỗ trợ **mọi family** hợp lý; mỗi family có biến thể.
- [ ] Một thông tin/1 family; đọc được trong 1–3 giây.
- [ ] Tinted mode OK (`widgetAccentable`, kiểm `primary`/`accent`/`desaturated`).
- [ ] Không truyền tải chỉ bằng màu (gauge/ring vẫn đọc được khi mất màu).
- [ ] Chữ gọn trong bezel; không cắt ở family tròn/inline.
- [ ] Nền: `containerBackground` chỉ cho Smart Stack; mặt đồng hồ trong suốt.
- [ ] Dữ liệu **mới**, có trạng thái stale/placeholder.
