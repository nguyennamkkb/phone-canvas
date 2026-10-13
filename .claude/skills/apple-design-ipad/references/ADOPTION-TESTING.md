# Adoption & Testing — iPad

> Nguồn: WWDC25 208/282, WWDC26 251, WWDC24 10147, HIG.

## 1. Việc phải làm khi lên iPadOS 26+

| Việc | Chi tiết |
|---|---|
| **Adopt scene life cycle** | `UIScene` sẽ **bắt buộc** ở major release sau iOS 26 khi build SDK mới |
| **Bỏ compatibility modes** | `UIRequiresFullscreen` deprecated; bỏ giả định scale/letterbox |
| **Toolbar wrap window controls** | Tránh placement "trên toolbar" (chỉ compatibility) |
| **Additive windows** | Mỗi document một cửa sổ; đặt **tên cửa sổ mô tả** |
| **Container hệ thống** | `UISplitViewController` (column resize/inspector) + `UITabBarController` (tab↔sidebar) |
| **Navigation mới** | `Tab`/`TabSection` (SwiftUI), `UITab`/`UITabGroup` (UIKit), `sidebarAdaptable`/`tabSidebar` |
| **Pointer mới** | Test lại hover/highlight: pointer **1:1**, không magnetize; highlight là liquid-glass platter |
| **Menu bar** | Mỗi app có menu bar riêng: sắp theo tần suất, nhóm, symbol + shortcut; **không ẩn item** |
| **Resize mượt** | `isInteractivelyResizing` cho asset nặng; không phá layout; revert khi có thể |
| **Kích thước tối thiểu** | `UISceneSizeRestrictions` — đặt min hợp lý (đừng chặn số cột) |

## 2. Ma trận kiểm thử

| Trục | Giá trị |
|---|---|
| Kích thước | Compact (Slide Over/narrow) → Medium → Expanded → Large (cửa sổ nổi nhỏ ↔ full) |
| Orientation | Portrait · landscape |
| Multitasking | Full · Split View (trái/phải) · Slide Over · Stage Manager (nhiều cửa sổ) |
| Cửa sổ | 1 cửa sổ · nhiều cửa sổ cùng app · cửa sổ nhỏ nhất cho phép |
| Navigation | Tab bar ↔ sidebar morph; collapsed/expanded split; inspector mở/đóng |
| Input | Touch · pointer (hover/highlight, resize cột) · keyboard (shortcut, focus) · Pencil (lực/azimuth/altitude/hover/double-tap) · drag & drop |
| A11y | Dynamic Type max · VoiceOver · Reduce Motion/Transparency · Full Keyboard Access · RTL |
| Dữ liệu | Empty · loading · error · offline; trạng thái giữ khi resize/đổi cửa sổ |

## 3. Lỗi tích hợp thường gặp

| Lỗi | Vì sao sai |
|---|---|
| Vẫn dùng `UIRequiresFullscreen` | Sẽ bị bỏ qua; app không resize đúng |
| Menu ẩn item theo ngữ cảnh | Phá spatial memory; menu bar mất tính dự đoán |
| Đặt min width cửa sổ quá lớn | Giảm số cột hiển thị được; mất linh hoạt |
| "Open in place" cho document | Ghi đè cửa sổ; mất ngữ cảnh — dùng additive windows |
| Không đặt tên cửa sổ | Menu chọn cửa sổ vô dụng |
| Hover là cách duy nhất để mở chức năng | Pointer/touch/keyboard phải tương đương |
| Re-render asset mỗi frame khi resize | Giật; dùng `isInteractivelyResizing` |
| Sidebar/tab không morph | Mất lợi ích linh hoạt; mục tiêu là adaptivity theo width |

## 4. Checklist adoption

- [ ] Scene life cycle; multiple windows; tên cửa sổ.
- [ ] Container hệ thống cho nav; tab↔sidebar morph; inspector collapse ⇒ sheet.
- [ ] Toolbar wrap window controls; menu bar đầy đủ + shortcut; item không ẩn.
- [ ] Pointer mới OK; Pencil đủ thuộc tính; keyboard + drag&drop có alternative.
- [ ] Resize không phá layout; min size hợp lý; bỏ compatibility modes.
- [ ] Chạy ma trận §2; test cả máy thật và nhiều cỡ cửa sổ.
