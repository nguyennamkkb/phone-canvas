# Tri thức từ ảnh — iPhone

Phân tích trực tiếp các ảnh minh hoạ Apple trong `assets/` (đọc bằng mắt, không suy diễn từ tên file).

| Ảnh | Trang HIG | Tri thức rút ra |
|---|---|---|
| `assets/tab-bar-anatomy.png` | Tab bars | Một tab = **Icon (trên) + Label (dưới)**. Tab đang chọn nằm trong **capsule nổi** (nền sáng hơn). Search tách thành **nút tròn riêng** ở cạnh phải thanh, không trộn vào nhóm tab. |
| `assets/tab-bar-badges.png` | Tab bars | Badge gắn trên icon để báo trạng thái mới; **không** đổi label, **không** đổi kích thước tab. |
| `assets/liquid-glass-tab-bar.png` | Color / Tab bars | Tab bar là **Liquid Glass trong suốt**, thấy nội dung phía sau; tab chọn hiện capsule sáng. Vì trong suốt, nội dung dưới phải đủ tương phản để icon còn đọc được. |
| `assets/toolbar-grouping-correct.png` | Toolbars | Gom action thành **cụm 2 bên** (trái: back/forward; phải: bút + overflow), chừa **vùng giữa trống** cho title. Khoảng cách giữa các nút trong cụm nhỏ, giữa hai cụm lớn. |
| `assets/toolbar-grouping-incorrect.png` | Toolbars | Rải nút đều khắp thanh → mất nhóm, khó quét, title bị chen. |
| `assets/toolbar-symbols-correct.png` / `toolbar-symbols-incorrect.png` | Toolbars | Ưu tiên **symbol** thay chữ; **không** thêm outline/vòng bao quanh icon (gây nặng thị giác). |
| `assets/toolbar-prominent-action.png` | Toolbars | Chỉ **một** hành động chính được làm nổi (tint/filled capsule); các action còn lại trung tính. |
| `assets/text-hierarchy.png` | Typography | Thứ bậc chuẩn: **Large title** → Subtitle (phụ, xám) → row: **Title (đậm)** + Body 2 dòng + Subtitle. Toolbar cùng màn: back chevron (trái), hành động "Select" dạng capsule, overflow "…". Title lớn co lại khi cuộn. |
| `assets/button-roles-alert.png` | Buttons | Alert: title ngắn + **message 1 câu**; nút xếp **dọc**: primary (filled xanh) → destructive (đỏ) → secondary (xám). Thứ tự = mức ưu tiên/nguy hiểm. |
| `assets/button-loading-visible.png` | Buttons | Nút có **activity indicator** khi đang xử lý; ẩn khi xong. Không đổi kích thước nút để tránh layout nhảy. |
| `assets/control-spacing-correct.png` | Accessibility | 3 nút tròn có **vùng chạm tách biệt**, khoảng cách đủ để không chạm nhầm; nút to hơn có vùng chạm lớn hơn. |
| `assets/control-spacing-incorrect.png` | Accessibility | Các nút bị **dán sát nhau**, vùng chạm chồng lên nhau → chạm nhầm. Cần chừa đệm giữa control. |
| `assets/list-disclosure.png` | Lists & tables | Chevron (`>`) trong row = **báo có màn chi tiết**; chỉ dùng khi row thực sự dẫn tới nơi khác. |
| `assets/size-class-square.png` / `size-class-full.png` | Layout | Cùng app, **cửa sổ nhỏ (square) ↔ toàn màn (full)**: nội dung phải tự tái bố cục — minh hoạ vì sao thiết kế theo **size class**, không theo thiết bị. |

## Quy tắc rút ra cho iPhone

1. **Thanh control là chrome, không phải nội dung:** tab bar/toolbar nổi trên nội dung bằng Liquid Glass; nội dung chạy dưới.
2. **Nhóm, đừng rải:** action cùng nhóm đặt sát nhau, nhóm khác cách xa; tối đa 1 hành động nổi bật.
3. **Thứ bậc đọc được ngay:** Large title → Title → Body → Subtitle, độ tương phản giảm dần.
4. **Trạng thái phải thấy:** badge (mới), capsule (đang chọn), spinner (đang tải), chevron (đi tiếp).
5. **Vùng chạm tách biệt:** sai lầm phổ biến nhất là control sát nhau; chừa đệm ≥ khoảng cách an toàn.
