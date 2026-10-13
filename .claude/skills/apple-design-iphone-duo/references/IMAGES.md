# Tri thức từ ảnh — iPhone Duo (phân tích sâu)

Phân tích trực tiếp 22 ảnh trong `assets/` (đọc bằng mắt + đối chiếu HIG/Tech Talks).

## 1. Tư thế & hình dáng

| Ảnh | Tri thức |
|---|---|
| `assets/poses.png` | **6 tư thế**: (1) gập dọc, camera góc trên; (2) dựng nghiêng như lều; (3) mở ngang (slab rộng); (4) **gập kiểu sách** — màn cong hình chữ V, nếp gập chia đôi; (5) mở dọc (cao); (6) tựa trên cạnh (hình thang). Mỗi tư thế đều có home indicator. ⇒ Phải chạy thử **cả 6**, không chỉ mở/gập. |
| `assets/anatomy-outer.png` | Outer: camera trước ở **góc**, luôn hiện; bản lề ở cạnh trong. |
| `assets/anatomy-inner.png` | Inner: **nếp gập giữa** + camera trong **ẩn dưới màn hình**. |
| `assets/duo-dimensions-open.jpg` / `duo-dimensions-close.jpg` | Tỉ lệ mở (slab rộng) vs gập (thanh cao); nút/đầu nối ở **cạnh bên**. |
| `assets/duo-display.jpg` | Inner landscape: Lock Screen **căn giữa**, phụ trợ dồn góc (weather góc phải trên, quick actions đáy phải). ⇒ màn trong là **không gian ngang**. |

## 2. Reserved regions

| Ảnh | Tri thức |
|---|---|
| `assets/reserved-inner-fold-camera.png` | Inner: **dải dọc giữa = vùng gập** (division); **vòng tròn nửa phải gần đỉnh = camera trong** (occlusion). Vùng gập chia màn thành **2 vùng dùng được**. |
| `assets/reserved-outer-camera.png` | Outer: vùng camera góc — **luôn hiện**, mở rộng thành Dynamic Island khi có Live Activities. |

## 3. Thanh dọc & bố cục

| Ảnh | Tri thức |
|---|---|
| `assets/vertical-bars-layout.png` | **Sơ đồ vàng của Duo**: dải dọc cạnh phải, từ trên xuống = **Dynamic Island → status bar (9:41+wifi) → toolbar (back, …) → tab bar (Photos/Albums/Search)**. Nội dung chiếm toàn bộ vùng trái. ⇒ Control là **chrome một cạnh**; nội dung bất đối xứng. |
| `assets/compression-toolbar.png` | Khi thiếu chỗ ở outer landscape: **toolbar nén vào overflow**, **tab bar giữ nguyên** (navigation-focused — mặc định). |
| `assets/compression-tabbar.png` | Chế độ task-oriented: **tab bar nén thành một control**, **toolbar giữ** (action của tác vụ). |
| `assets/pane-controls.png` | Mail inner: control của **pane dẫn** nằm **trên đỉnh pane**; control của **pane nội dung** nằm **dọc mép phải**. ⇒ Control đi cùng vùng nội dung nó ảnh hưởng, không dồn hết ra cạnh. |
| `assets/mail-compact.png` | Outer: 1 pane (nội dung email). |
| `assets/mail-full.png` | Inner: **2 pane** — danh sách (leading, hẹp hơn) + nội dung (trailing). ⇒ "Thêm một tầng hierarchy", không đổi chức năng. |
| `assets/splitview-open.png` | Notes **mở phẳng**: pane dẫn **hẹp hơn** pane nội dung. |
| `assets/splitview-folded.png` | Notes **gập một phần**: hai pane **rộng bằng nhau**, **nếp gập là divider tự nhiên**; mép phải có toolbar dọc (expand/share/…) + nút compose nổi; pane dẫn có control riêng ở đỉnh + search ở đáy. ⇒ Hệ thống tự cân lại pane quanh nếp. |
| `assets/splitview-multitasking.png` | Hai app side-by-side: **mỗi app control ở mép ngoài** (trái ↔ trái, phải ↔ phải), cách xa vùng gập. |
| `assets/calculator-full-width.png` | Calculator: iPhone 16 = **4 cột × 5**; Duo outer = **5 cột × 4**. ⇒ Outer **rộng–thấp** → tăng cột, giảm hàng; layout tràn full width vì không cần thanh. |

## 4. Arrangements

| Ảnh | Tri thức |
|---|---|
| `assets/arrangement-split.png` | Inner: primary (tím) **nửa trái** + secondary (xanh) **nửa phải**, divider dọc giữa. Status bar ở **góc phải trên**. |
| `assets/arrangement-overlay.png` | Inner: secondary **phủ toàn màn**; primary là **thẻ bo tròn nằm dưới, căn giữa ngang** (bottom-aligned). ⇒ Overlay = lớp nổi, không chia đôi. |
| `assets/hero-inner.png` / `hero-outer.png` | Home Screen trên 2 màn hình — bố cục icon giãn theo bề ngang. |

## 5. Quy tắc rút ra

1. **Cùng app, hai tầng hiển thị:** outer = 1 pane/1 tầng; inner = 2 pane/thêm tầng — **chức năng không đổi**.
2. **Chrome dồn một cạnh** (trailing) ở outer + inner landscape; **ngoại lệ** inner portrait (thanh ngang).
3. **Nếp gập là đường chia tự nhiên:** split 50/50 khi gập, pane lệch khi mở; control/tương tác **tránh vùng gập**; nội dung cuộn thì không cần.
4. **Mỗi vùng giữ control của mình** (pane controls) — không dồn tất cả ra cạnh.
5. **Overlay khác split ở bản chất:** split chia đôi (main–detail, không được che nhau); overlay xếp lớp (foreground/background, chấp nhận che một phần).
6. **Nén có chủ đích:** navigation-focused → toolbar nén trước; task-oriented → tab bar nén trước; outer landscape là nơi hay nén nhất.
7. **Outer rộng–thấp ⇒ tăng cột, giảm hàng** (Calculator 5×4), không kéo dãn theo chiều dọc.
