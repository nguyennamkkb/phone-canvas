# API & nền tảng iPadOS (mới nhất)

> Tổng hợp từ WWDC25 208 (*Elevate the design of your iPad app*), 282 (*Make your UIKit app more
> flexible*), 356 (*new design system*), WWDC24 10147 (*tab & sidebar*), WWDC26 251 (*Modernize your
> UIKit app*). **Xác minh lại tên/khả dụng trong Xcode trước khi dùng.**

## 1. Windowing & scenes (iPadOS 26+)

| Mục | Chi tiết |
|---|---|
| **Cửa sổ** | Mọi app hỗ trợ multitasking có **handle ở góc dưới phải** để kéo-resize thành cửa sổ nổi |
| **Window controls** | Nằm ở **leading edge** của toolbar; tap để mở rộng, **press-and-hold** để hiện shortcut tạo layout |
| **Additive windows** | Mở tài liệu ⇒ **tạo cửa sổ mới** cho mỗi document (không "open in place"); cửa sổ **tồn tại tới khi đóng** |
| **Tên cửa sổ** | Đặt **tên mô tả** cho từng cửa sổ (vd. tên tài liệu) — menu liệt kê cửa sổ dựa vào đó |
| **Scene life cycle** | `UIScene` là **bắt buộc** ở major release sau iOS 26 khi build SDK mới; multiple scenes được khuyến khích |
| **State restoration** | Mỗi scene tự lưu/khôi phục state; dùng `restoreInteractionState`/activity |
| **Kích thước tối thiểu** | `UISceneSizeRestrictions` — khai báo preferred minimum khi scene sắp connect |
| **Orientation lock** | `prefersInterfaceOrientationLocked` + `setNeedsUpdateOfPrefersInterfaceOrientationLocked`; theo dõi qua `didUpdateEffectiveGeometry` |
| **Resize nặng** | `isInteractivelyResizing` — chỉ cập nhật asset lớn **sau khi** kết thúc tương tác |
| **Bỏ đi** | `UIRequiresFullscreen` **deprecated**, sẽ bị bỏ qua; build bằng **SDK 26** thì hệ thống **không scale/letterbox** nữa |

## 2. Container view controllers (linh hoạt nhất)

| Container | Tính năng mới |
|---|---|
| **UISplitViewController** | **Resize cột tương tác** (kéo separator; pointer đổi hình theo hướng resize); **min/max/preferred width** cho mỗi cột; trait **`splitViewLayoutEnvironment`** (expanded/collapsed) để đổi UI (vd. hiện disclosure indicator khi collapsed); **inspector column** hạng nhất (trailing; khi collapsed ⇒ tự thành **sheet**) |
| **UITabBarController** | Tab bar **tự đổi vị trí theo nền tảng** (iPhone: đáy; Mac: toolbar/sidebar; visionOS: ornament; iPad: **trên**, cạnh navigation); **morph tab bar ↔ sidebar**; **tab groups** (vd. Library → Artists/Albums); managing navigation controller + delegate `displayedViewControllersFor` |
| **Quy tắc chung** | Bọc UI trong container hệ thống để có adaptivity miễn phí; **cẩn thận đừng đặt min width quá lớn** (giảm số cột hiển thị được) |

## 3. Navigation: sidebar ↔ tab bar

| Việc | SwiftUI | UIKit |
|---|---|---|
| Sidebar thích ứng | `tabViewStyle(.sidebarAdaptable)` | `tabBarController.mode = .tabSidebar` |
| Nhóm | `TabSection` | `UITabGroup` |
| Tab | `Tab { }` (title + image + selection) | `UITab` (gán vào `tabs`) |
| Search | role `.search` (title/icon/pinned mặc định) | `UISearchTab` |
| Tuỳ biến | `TabViewCustomization` + `AppStorage` + `customizationID` | `allowsHiding`, `preferredPlacement`, `allowsReordering`, `displayOrderIdentifiers` |
| Ẩn/không cho tuỳ biến | `defaultVisibility`, `customizationBehavior` | `UITab.isHidden`, `sidebarOnly` |
| Drop lên tab | `.dropDestination` | `operationForAcceptingItemsFromDropSession`, `acceptItemsFromDropSession` |
| Khác | sidebar header/footer, swipe actions, context menu, popover neo theo tab | tương tự |

- **Tab bar ưu tiên glyph FILLED; sidebar ưu tiên OUTLINE** — dùng biến thể **outline**, hệ thống tự chọn filled.
- Tab bar có 3 vùng: **fixed** (quan trọng, không tuỳ biến) · **customizable** (kéo-thả) · **pinned** (luôn ở cuối, vd. Search).

## 4. Pointer, Pencil, keyboard, drag & drop

| Input | Chi tiết (iPadOS 26) |
|---|---|
| **Pointer** | Hình mới **chính xác 1:1**, **không** còn magnetize/rubber-band; **highlight là liquid-glass platter** đè lên control (thay cho kiểu pointer morph cũ); đổi hình theo ngữ cảnh (resize cột, drop, hand…); hover chỉ để **dự đoán** |
| **Apple Pencil** | Nét tức thời; **lực** ⇒ độ dày/đậm; **azimuth** ⇒ hướng; **altitude** ⇒ nghiêng; **hover** để xem trước (không kích hoạt); **double-tap** hành động dễ undo; Scribble cho nhập liệu |
| **Keyboard** | Full keyboard access; shortcut chuẩn; **menu bar** liệt kê + gán shortcut |
| **Drag & drop** | Kéo giữa app, spring-loading, drop trên tab; luôn có alternative (menu "Move to…", nút mũi tên) |
| **Menu bar** | Mở bằng pointer lên mép trên hoặc vuốt xuống; cấu trúc: **app menu → menu hệ thống → menu riêng**; sắp theo **tần suất dùng**, nhóm section, submenu cho phụ, gán symbol + shortcut; **View menu** chứa tab + toggle sidebar; **không ẩn menu/item** theo ngữ cảnh (item không khả dụng thì **dim**, giữ nguyên vị trí) |

## 5. Layout & nền tảng thị giác

| Mục | Chi tiết |
|---|---|
| **Toolbar + window controls** | **Bọc toolbar quanh window controls** để chúng nằm cùng hàng (tránh phải chừa safe area phía trên — placement "trên toolbar" chỉ là **compatibility**) |
| **Safe area bất đối xứng** | Sidebar tạo inset bất đối xứng cho cột kề; **background** được tràn dưới sidebar; **content** nằm trong safe area |
| **Layout margins** | Inset từ safe area; dùng layout guide cho nội dung trong container |
| **Window control & UI** | Dùng layout guide có **horizontal corner adaptation** cho bar ở đỉnh scene; component hệ thống (`UINavigationBar`) tự né window control |
| **Scroll edge effect** | Nội dung vẽ **dưới** toolbar bằng edge effect (soft mặc định; tránh trộn/stack soft+hard) |
| **Content extension** | Tràn nội dung dưới toolbar/sidebar; quan trọng với **cửa sổ nổi nhỏ** |
| **Concentricity** | `ConcentricRectangle`/`UICornerConfiguration` (iOS 26) — sidebar/toolbar lồng khớp trong cửa sổ |
| **Resize không phá layout** | Thay đổi khi resize **không** được làm hỏng layout; **quay lại trạng thái cũ khi có thể** (opportunistic revert) |
| **Nội dung tràn viền** | Ảnh/hero có thể tràn full-bleed; chữ/điều khiển giữ trong margin |

## 6. Recipe

```
1) Chọn navigation: tab bar (bắt đầu) → sidebar khi hierarchy giàu; morph linh hoạt
2) Bọc trong container hệ thống: UISplitViewController / UITabBarController
3) Windowing: toolbar wrap window controls; tạo cửa sổ mới cho mỗi document; đặt tên cửa sổ
4) Layout theo size class + safe area + layout guide (né window control)
5) Tương tác: pointer 1:1 + highlight; Pencil đủ lực/azimuth/altitude/hover; menu bar + shortcut
6) Adapt: resize không phá layout; min/max/preferred width hợp lý; isInteractivelyResizing cho asset nặng
7) A11y: target ≥ 44pt; Dynamic Type; VoiceOver; không phụ thuộc hover
8) Test: nhiều cửa sổ, Split View hai phía, Slide Over, Stage Manager, RTL, chữ lớn
```
