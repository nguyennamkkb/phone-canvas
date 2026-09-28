# Vertical Bars (toolbar / tab bar / navigation) — iPhone Duo

> Đúc kết từ HIG *Designing for iPhone Duo* (mục Vertical controls) +
> Tech Talk *Raise the bar with iPhone Duo* + *Design for iPhone Duo*.
> Ảnh: `assets/vertical-bars-layout.png`, `assets/compression-tabbar.png`, `assets/compression-toolbar.png`, `assets/pane-controls.png`.

## 1. Vì sao thanh chuyển sang cạnh

Outer display **rộng nhưng thấp** hơn iPhone thường. Để **giữ không gian dọc cho nội dung** và đưa
control **tới gần ngón tay cái**, control thường ở trên/dưới **chuyển sang cạnh (trailing)**.

- **Vẫn là các component cũ**, chỉ đổi cách bố trí.
- Vị trí giữ nguyên khi mở máy sang **inner landscape** ⇒ liền mạch.
- **Ngoại lệ duy nhất:** inner display **portrait** giữ **thanh ngang** (đủ không gian dọc).
- Dải dọc bên cạnh là **vùng chia sẻ** giữa system và app: **Dynamic Island → status bar → toolbar →
  tab bar**, từ trên xuống (`assets/vertical-bars-layout.png`).
- Trong **Split View multitasking**, mỗi app đặt control ở **mép ngoài của nó** (app trái → control trái).
- Vì gắn với phần cứng, thanh **giữ nguyên một cạnh vật lý** kể cả trong **RTL**; nội dung tự đổi
  hướng quanh nó.

## 2. Ràng buộc theo container (rất dễ sai)

| Ngữ cảnh | Hành vi |
|---|---|
| Split view | **Chỉ cột detail** tham gia thanh dọc; các cột khác giữ thanh ngang |
| Inspector (mở rộng) | **Không** nhận thanh dọc riêng (đã có sẵn thanh của cột detail) — tránh trùng lặp |
| Sheet — outer | Có toolbar → hiển thị **dọc** |
| Sheet — inner | **Căn giữa**, item **giữ ngang** |
| Sheet `preferredPlacement` | Đặt **trái** → không có thanh dọc; đặt **phải** → có thanh dọc |
| Accessory bar (trên bàn phím) | **Ở lại với bàn phím**, không chuyển sang trục dọc |
| Tab bar + toolbar | Có thể **cùng tồn tại** trong dải dọc (vd. Fitness) |

## 3. Thứ tự item (ordering)

Giữ **hierarchy trên→dưới** rõ ràng:

1. **Đầu (trên):** điều hướng chính — **Back / Close**.
2. **Sau đó:** hành động nổi bật — **Done**.
3. **Còn lại:** giữ **nguyên nhóm gốc**; hệ thống chèn **khoảng dọc** giữa nhóm đến từ thanh trên và
   thanh dưới để phân tách.

| Việc | SwiftUI | UIKit |
|---|---|---|
| Back/close tuỳ biến | `cancellationAction` | leading item + `leftItemSupplementsBackButton = false` (mặc định) |
| Prominent action | `topBarPinnedTrailing` | `pinnedTrailingGroup` |
| Nhóm item | `ToolbarItemGroup` | `UIBarButtonItemGroup` |

**Đừng tự thêm spacing** — group đã tự lo; tự thêm sẽ lệch khi không gian đổi.

## 4. Trục của item (Axis behavior)

- Thanh **ngang**: item **cố định chiều cao**, bề rộng linh hoạt.
- Thanh **dọc**: item **cố định bề rộng**, chiều cao linh hoạt ⇒ **hợp với item chỉ có symbol**.
- Chọn biểu diễn: có icon → ưu tiên **icon** (đổi được sang trục dọc); **text-only** → **giữ ngang**;
  khi vào overflow → hiện **cả title + icon**.
- **Luôn cung cấp cả title lẫn symbol** cho item (kể cả item là ảnh), vì hệ thống dùng title trong
  overflow/expanded form.
- `AxisBehavior` API dùng khi:
  - Item **chuyển đổi symbol ↔ text** (vd. Edit) → đặt **`horizontal-only`** để không nhảy trục.
  - **Custom view phức tạp** → mặc định giữ ngang; nếu hỗ trợ dọc → đặt **`vertical-preferred`**.
- **Badge API (iOS 26+):** biến item "text + symbol" (vd. số đếm trong inbox) thành **symbol-only**
  ⇒ phù hợp thanh dọc, vẫn giữ glanceability.
- Đánh giá text: nếu text chỉ **củng cố** symbol → bỏ text; nếu mang **thông tin độc lập**
  (vd. giỏ hàng hiện số tiền) → **giữ ở thanh ngang**.

## 5. Custom view trong thanh dọc

- Phải **vừa bề rộng cố định** của thanh **hoặc** có layout thích ứng dọc.
- Cân nhắc chỉnh metric cho bản dọc (vd. ẩn title, thấp hơn một chút để nhường chỗ).
- Đọc `toolbarVerticalEdge` (environment/trait) để biết đang ở thanh dọc (nil = không thể).
- Thanh dọc **không có scroll-edge effect** mặc định; **có nền** khi bật **Reduce Transparency** ⇒
  nội dung custom phải đủ tương phản trong cả hai trường hợp.
- **Flexible spacer = 0** ở trục dọc; **fixed spacer** vẫn giữ kích thước tối thiểu.

## 6. Overflow & compression

- Outer **landscape** overflow **nhiều hơn** vì ít không gian dọc; bàn phím / Picture-in-Picture cũng
  tranh chỗ.
- Quyết định ai ở lại lâu hơn:
  - **Navigation-focused** (vd. Podcasts) → **toolbar nén trước**, giữ tab bar & điểm đến chính.
    Đây là **mặc định**.
  - **Task-oriented** (vd. Games) → **tab bar nén trước**, giữ action của tác vụ
    (`toolbarCompressionBehavior`).
- **Gộp overflow của app vào menu hệ thống** (`ToolbarOverflowMenu` / `additionalOverflowItems`).
- **Dành dấu "…" cho overflow**; menu khác dùng symbol khác.
- **Visibility priority:** mặc định overflow **từ dưới lên trên**; có thể đặt **high/low/custom**.
  Đặt **theo nhóm trước**, rồi **từng item** nếu cần.
  Ưu tiên giữ: hành động thường dùng (Compose/New Note) và item mang **trạng thái quan trọng (badge)**.

## 7. Khi nào TẮT thanh dọc

Không phải app nào cũng nên dọc:
- **Single-page, bottom-heavy** (vd. Calculator) → cân nhắc giữ ngang để nội dung tràn đầy.
- **Sheet chỉ có 1 control** (vd. nút Close) → tắt thanh dọc để không mất không gian.
- API: `toolbarVerticalBehavior` / `preferredVerticalBarBehavior`.

## 8. Checklist thanh dọc

- [ ] Bar nằm trong navigation container chuẩn (TabView/NavigationStack); **không** tự dựng UIToolbar rời.
- [ ] Thứ tự: Back/Close trên cùng → prominent action → nhóm còn lại.
- [ ] Mỗi item có **cả title + symbol**.
- [ ] Symbol-only cho item phù hợp; badge thay cho text đếm.
- [ ] Item chuyển symbol↔text đặt `horizontal-only`.
- [ ] Custom view: vừa bề rộng cố định hoặc có layout dọc; đọc `toolbarVerticalEdge`.
- [ ] Overflow: gộp menu riêng vào hệ thống; đặt visibility priority theo nhóm rồi item.
- [ ] Chọn compression behavior đúng (navigation-focused vs task-oriented).
- [ ] Kiểm tra RTL, Reduce Transparency, và trường hợp nén cả toolbar + tab bar.
