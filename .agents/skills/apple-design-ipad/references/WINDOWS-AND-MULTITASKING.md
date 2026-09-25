# Cửa sổ & đa nhiệm — iPad

> Nguồn: WWDC25 208 (*Elevate the design of your iPad app*), 282 (*Make your UIKit app more flexible*),
> WWDC26 251 (*Modernize your UIKit app*).

## 1. Mô hình cửa sổ (iPadOS 26)

- Mọi app hỗ trợ multitasking có **handle resize ở góc dưới phải**; kéo để biến full-screen thành
  **cửa sổ nổi** trên wallpaper.
- **Window controls** ở **leading edge toolbar**: tap → mở rộng; **press-and-hold** → shortcut layout
  (chia cột, full screen…).
- **Compatibility mode:** app chưa cập nhật ⇒ hệ thống tăng safe area phía trên toolbar và đặt window
  controls ở leading edge — **chỉ để tương thích**, làm mất không gian.
- **Khuyến nghị:** **bọc toolbar quanh window controls** để chúng nằm cùng hàng ⇒ bỏ safe area dư,
  nội dung được thêm chỗ.

## 2. Đa nhiệm "cộng dồn" (additive)

- Mở tài liệu ⇒ **tạo cửa sổ mới** cho mỗi document (bỏ kiểu "open in place" ghi đè cửa sổ duy nhất).
- Cửa sổ **tồn tại tới khi người dùng đóng** ⇒ state có giá trị, đừng phá.
- Hệ quả: có thể **tích tụ nhiều cửa sổ** ⇒ phải **đặt tên mô tả** để menu chọn cửa sổ hữu ích.

## 3. Scene — nền tảng của linh hoạt

- **Scene = một instance UI** của app: chứa view controllers/views, nhận dữ liệu ngoài (URL/deep link),
  **tự lưu/khôi phục state**, cung cấp ngữ cảnh (screen, window geometry).
- **Nhiều scene độc lập** ⇒ mỗi scene có lifecycle/state riêng.
- **Scene types** cho trải nghiệm riêng (vd. compose scene cho messaging); iOS 26 cho phép **trộn
  SwiftUI + UIKit scene types**.
- **UIScene life cycle sẽ là bắt buộc** ở major release sau iOS 26 khi build SDK mới (multiple scenes
  vẫn là khuyến khích, không bắt buộc).
- **Kích thước tối thiểu:** `UISceneSizeRestrictions` (khai báo khi scene sắp connect). Đặt min quá lớn
  sẽ **giảm số cột** hiển thị được ⇒ mất linh hoạt.

## 4. Resize mượt

- **Không phá layout:** thay đổi khi resize không được để lại hậu quả vĩnh viễn; **quay lại trạng thái
  ban đầu khi có thể**.
- **Asset nặng:** dùng `isInteractivelyResizing` — chỉ re-render khi **kết thúc** tương tác.
- **Column widths:** đặt **min/max/preferred** hợp lý cho từng cột; **resize cột bằng kéo separator**
  (pointer đổi hình theo hướng).
- **Trait expanded/collapsed:** `splitViewLayoutEnvironment` để đổi UI (vd. disclosure indicator khi collapsed).
- **Orientation:** khi UI đã adaptive thì orientation gần như **dư thừa**; chỉ khoá orientation trong
  trường hợp đặc biệt (game lái xe…) qua preference API.

## 5. Bỏ các "compatibility mode"

| Cũ | Trạng thái | Thay bằng |
|---|---|---|
| `UIRequiresFullscreen` | **Deprecated**, sẽ bị bỏ qua | Layout adaptive theo size class |
| Scale/letterbox theo màn hình mới | **Không còn** khi build SDK 26 | Thiết kế cho mọi kích thước |
| "Open in place" cho document | Không khuyến nghị | **Cửa sổ mới cho mỗi document** |

## 6. Checklist cửa sổ & đa nhiệm

- [ ] Toolbar **wrap** window controls (không dùng compatibility placement).
- [ ] Mỗi document **mở cửa sổ riêng**; cửa sổ có **tên mô tả**.
- [ ] Adopt **UIScene life cycle**; multiple scenes nếu hợp lý.
- [ ] `UISceneSizeRestrictions` đặt min hợp lý (không chặn cột).
- [ ] Resize không phá layout; asset nặng chỉ cập nhật sau tương tác.
- [ ] Column min/max/preferred hợp lý; inspector collapse ⇒ sheet.
- [ ] Bỏ `UIRequiresFullscreen`; bỏ giả định scale/letterbox.
- [ ] Test: cửa sổ nổi nhỏ, Split View hai phía, Slide Over, Stage Manager, RTL, Dynamic Type.
