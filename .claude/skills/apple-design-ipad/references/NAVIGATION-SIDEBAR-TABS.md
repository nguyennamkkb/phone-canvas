# Điều hướng: sidebar ↔ tab bar — iPad

> Nguồn: WWDC24 10147 (*Elevate your tab and sidebar experience in iPadOS*),
> WWDC25 208/282.

## 1. Chọn mô hình

| Mô hình | Dùng khi | Ghi chú |
|---|---|---|
| **Sidebar** | Nhiều sub-view / hierarchy sâu (Mail, Music) | **Làm phẳng điều hướng**, lộ cấu trúc ra cấp cao nhất |
| **Tab bar** | Ít mục ngang cấp, cần **tối đa nội dung** | Gọn, linh hoạt; **nên bắt đầu từ đây** rồi scale lên sidebar |
| **Split view** | Master–detail | Gấp cột khi hẹp |
| **Inspector** | Thuộc tính của mục đang chọn | Collapsed ⇒ **tự thành sheet** |

> **Bắt đầu với tab bar** nếu chưa chắc: tab bar **morph thành sidebar** dễ dàng khi app lớn lên.

## 2. Morph tab bar ↔ sidebar

- Sidebar có thể **morph thành tab bar** (và ngược lại) — người dùng chọn kiểu họ thích.
- Tab bar **nhỏ hơn** ⇒ nội dung chiếm nhiều chỗ hơn, cảm giác immersive.
- Khi ẩn sidebar, nó **animate về tab bar**; người dùng vẫn điều hướng được ngay.
- **Adaptive:** xoay portrait ⇒ sidebar có thể morph về tab bar; bản chất là **thay đổi bề rộng** ⇒
  app phải reflow theo **mọi width** (kể cả cửa sổ nổi).

## 3. Cấu trúc & thành phần

- Định nghĩa **Tab** cho mỗi mục cấp cao; nhóm bằng **TabSection / UITabGroup**.
- Tab bar 3 vùng: **fixed** (không tuỳ biến) · **customizable** (kéo-thả, thêm từ sidebar) ·
  **pinned** (cuối, vd. Search).
- **Search role** ⇒ tab có title/icon/pinned mặc định.
- Sidebar: header/footer tuỳ biến, **swipe actions**, **context menu**, **popover neo theo tab**.
- Tab có thể là **drop destination** (kéo ảnh vào collection…).

## 4. Tuỳ biến (customization)

- Người dùng **ẩn/hiện, sắp xếp lại** tab; thay đổi **được persist tự động**.
- API: `TabViewCustomization` + `AppStorage` (persist) + `customizationID`; `customizationBehavior`,
  `defaultVisibility`; UIKit: `allowsHiding`, `preferredPlacement`, `allowsReordering`,
  `displayOrderIdentifiers`.
- `sidebarOnly`: tab chỉ có trong sidebar, không cho lên tab bar.
- Delegate thông báo thay đổi visibility/order (UIKit).
- **Gợi ý:** mục quan trọng (Watch Now, Library) nên **fixed**; phần còn lại cho tuỳ biến.

## 5. Icon & nhãn

- **Tab bar ưu tiên glyph FILLED; sidebar ưu tiên OUTLINE.**
- Dùng **biến thể outline** khi khai báo symbol; hệ thống tự chọn filled khi hiển thị trên tab bar.
- Nhãn **nhất quán giữa iPhone/iPad**; **không nhồi quá nhiều tab**.

## 6. Checklist điều hướng iPad

- [ ] Chọn đúng sidebar/tab bar/split/inspector theo độ sâu hierarchy.
- [ ] Morph tab ↔ sidebar hoạt động; giữ selection/state.
- [ ] Reflow mọi width (portrait, cửa sổ nổi); thay đổi **không phá layout**.
- [ ] Tab fixed/customizable/pinned hợp lý; search pinned.
- [ ] Tuỳ biến persist; mục quan trọng không cho ẩn.
- [ ] Icon outline (sidebar) / filled (tab bar) đúng quy ước.
- [ ] Sidebar có header/footer/swipe/context menu/popover khi cần.
- [ ] Drop lên tab hoạt động (nếu có tính năng kéo-thả).
