# Điều hướng, layout & vật liệu — watchOS

> Đúc kết từ WWDC23 *Design and build apps for watchOS 10* (Jennifer Patton & Matthew Koonce)
> + HIG *Designing for watchOS*.

## 1. Nguyên tắc: "Apple Watch Moment"

- Câu hỏi trung tâm: **"10 giây chú ý của người dùng — tôi hiển thị thông tin gì?"**
- **Brief & focused:** bỏ tab/level thừa; ví dụ News trên watch chỉ còn **5 tin hàng đầu**, feed **stack dọc + mở rộng inline**.
- **Đưa dữ liệu hữu hạn lên trước** (Heart Rate: số liệu ngắn gọn rồi mới tới animation toàn màn).
- **Digital Crown là trục tương tác chính** (cuộn, phân trang, chỉnh chính xác) **nhưng luôn có touch thay thế**.
- Bắt đầu thiết kế từ câu hỏi: **widget nào là tốt nhất cho Smart Stack**, rồi mới kiến trúc app quanh nó.

## 2. Ba mô hình điều hướng

| Mô hình | Khi dùng | Quy tắc |
|---|---|---|
| **NavigationSplitView** | Có **source list + detail** (thời tiết, cổ phiếu) | Source list **gấp dưới** detail, mở bằng 1 tap; **khởi tạo selection** để mở thẳng detail (dùng location/recency/frequency); detail rõ tới mức **không cần title**; source list không cần title/nút đóng ⇒ thanh ngắn, xem được nhiều dữ liệu so sánh |
| **TabView** | 2–5 vùng **ngang cấp**, cuộn dọc | `verticalPage`; **một tab giãn theo nội dung** (localization/chữ lớn); animation theo **selection** + `matchedGeometryEffect` (vd. Activity rings thu vào toolbar); `List` bên trong tự mở rộng |
| **NavigationStack** | Phân cấp sâu | **Large title ở view đầu**, không dùng ở view con có back; animation push mới nhấn mạnh view được chọn |

**Chọn mô hình để đạt "Apple Watch Moment" với ít tương tác nhất.**

## 3. Ba layout nền (grid hệ thống)

Grid dựng từ **độ cong màn hình** (có trong **Apple Design Resources**), tự thích ứng mọi kích cỡ.

| Layout | Dùng cho | Ghi chú |
|---|---|---|
| **Dial-based** | Thông tin dày, liếc nhanh | Full-screen color/imagery; tối đa **4 corner controls**; dùng `scenePadding` để đúng inset |
| **Infographic** | Chart/graph + khối text + metric | Kết hợp dữ liệu trực quan với con số |
| **List** | Duyệt/tìm mục | Cuộn dọc; row gọn |

## 4. Thanh & control

- `topBarLeading` / `topBarTrailing` — **đồng hồ tự dịch ra giữa** khi thêm nút góc phải.
- Nút hành động chính đặt ở **bottom bar** (vd. Now Playing: play/pause); dùng `controlSize` để làm nút **lớn/nổi bật**.
- SwiftUI dùng **cùng grid** ⇒ **không cần padding thủ công**.

## 5. Màu & vật liệu

- **4 mức material nền full-screen:** `ultraThin` · `thin` · `regular` · `thick`.
- **Full-screen background gradient** tint theo accent — dùng để **đặt tông** và **phân biệt tab** (Move/Exercise/Stand).
- **Màu truyền tin:** solar gradient (World Clock), đổi màu khi trạng thái đổi (Timer: đen → cam khi xong).
- **Vibrant fill** cho control/platter cell + **vibrant text**: primary · secondary · tertiary · quaternary.
- Presentation dùng **full-screen thin material** (thấy mờ nền phía sau ⇒ biết mình đang ở đâu).
- **Navigation bar variable blur** khi cuộn.
- `containerBackground` cho nền full-screen của view.

## 6. Checklist điều hướng/layout

- [ ] Trả lời được "Apple Watch Moment" trong **10 giây**.
- [ ] Chọn đúng 1 trong 3 mô hình điều hướng; ≤ 2–3 tầng.
- [ ] Chọn đúng 1 trong 3 layout nền; dùng grid/`scenePadding` thay vì tự đặt padding.
- [ ] Crown là trục chính **và** có touch thay thế.
- [ ] Material/vibrant text đúng thứ bậc; nền dùng `containerBackground`.
- [ ] Toolbar placements đúng; đồng hồ không bị che.
- [ ] Chữ lớn/localization ⇒ tab giãn, không cắt.
