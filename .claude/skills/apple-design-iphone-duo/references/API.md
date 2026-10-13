# API mới cho iPhone Duo (SwiftUI + UIKit / AVKit)

> Tổng hợp từ 6 Tech Talks 2026 (*Design*, *Prepare*, *Raise the bar*, *Strike a pose*,
> *Leverage multiple displays and scenes*, *Camera*).
> **Lưu ý:** tên/khả dụng theo tài liệu tại thời điểm 2026-09; một số API gắn với SDK cụ thể
> (iOS 26, iOS 27, **iOS 27.1**). Luôn xác minh lại trong Xcode/Apple Developer Documentation.

## 1. Độ sẵn sàng theo SDK

| SDK | Hành vi đạt được |
|---|---|
| trước iOS 27 | App chạy được; outer dùng vùng trái status bar; inner ở kích thước quen thuộc |
| iOS 27 | Mở rộng sang trái vùng status bar trên inner (nhờ hỗ trợ iPhone resizing) |
| **iOS 27.1** | **Full screen + thanh dọc**; **ReservedRegion** và **Arrangement** khả dụng |

## 2. Layout, size class, bo góc

| Mục đích | SwiftUI | UIKit | Ghi chú |
|---|---|---|---|
| Đọc size class | `@Environment(\.horizontalSizeClass/\.verticalSizeClass)` | `UITraitCollection` | Nguồn chân lý thay cho orientation |
| Bo góc đồng tâm | `ConcentricRectangle` | `UICornerConfiguration` | iOS 26+; đã cập nhật cho hình dạng Duo |
| Nền tràn safe area | `ignoresSafeArea(...)` | dùng `view.bounds` | Foreground trong safe area, background tràn |
| Insets | `safeAreaInsets` (environment) | `safeAreaInsets`, `safeAreaLayoutGuide` | **Bất đối xứng** — xử lý từng cạnh |

## 3. Reserved regions (iOS 27.1)

| Mục đích | SwiftUI | UIKit |
|---|---|---|
| Truy cập region | `GeometryProxy.reservedRegion(...)` trong `GeometryReader` / `onGeometryChange` | `UIView.reservedRegion(...)` |
| Khung của region | — | `frame` (của `UIView.ReservedRegion`) |
| Lọc theo trạng thái | mặc định chỉ **active** | `includeInactive` để lấy cả inactive |
| Loại region | `.division` (nếp gập), `.occlusion` (camera) | tương ứng |
| Đẩy nội dung ra khỏi vùng | `ReservedRegion` | `UIView.ReservedRegion` |

**Quy tắc dùng:** chỉ **active** để né hiện tại; đọc cả **inactive** cho quyết định cấu trúc
(vd. grid **số cột chẵn** khi tồn tại division region dù đang phẳng).

## 4. Arrangements (iOS 27.1)

| Mục đích | SwiftUI | UIKit |
|---|---|---|
| Container | `ArrangementView(primary:secondary:)` | `UIArrangementViewController` (+ `primaryViewController`, `secondaryViewController`) |
| Chọn kiểu | `.arrangementViewStyle(.split / .overlay)` | `updateArrangement(...)` với `UISplitArrangement` |
| Giới hạn trục (split) | `.axes(...)` | cấu hình trục trên `UISplitArrangement` |
| Lớp overlay | `@Environment(\.overlayArrangementZIndex)` | `stateForViewPlacement(...)` → `zIndex` |
| Collapse secondary | hỗ trợ sẵn | hỗ trợ sẵn |

**Cấm kỵ:** đặt navigation container **trong** arrangement; đặt arrangement **trong** `List`/`ScrollView`.

## 5. Bars — thanh dọc, trục, overflow

| Mục đích | SwiftUI | UIKit |
|---|---|---|
| Ưu tiên hiển thị item | `ToolbarItemVisibilityPriority` | `UIBarButtonItemVisibilityPriority` |
| Chọn ai nén trước | `ToolbarVerticalCompressionBehavior` | `UIVerticalBarCompressionBehavior` |
| Gộp overflow của app vào menu hệ thống | `ToolbarOverflowMenu` | `additionalOverflowItems` |
| Trục của item | `AxisBehavior` (`.horizontal`, `.verticalPreferred`…) | tương ứng |
| Biết đang ở thanh dọc | `@Environment(\.toolbarVerticalEdge)` | trait tương ứng |
| Tắt/bật thanh dọc | `toolbarVerticalBehavior`, `preferredVerticalBarBehavior` | tương ứng |
| Vị trí đặc biệt | `cancellationAction` (Back/Close), `topBarPinnedTrailing` (prominent) | leading item + `leftItemSupplementsBackButton = false`; `pinnedTrailingGroup` |
| Badge chuẩn (biến text→symbol-only) | Badge API (iOS 26) | Badge API (iOS 26) |

**Ghi nhớ:** item **symbol-only** đi trục dọc; **text-only** giữ ngang; item **chuyển symbol↔text**
đặt `horizontal-only`; mỗi item nên có **cả title + symbol**; **không tự thêm spacing** (dùng group).

## 6. Window / scene / accessory

| Mục đích | API |
|---|---|
| Tạo cửa sổ mới (chỉ **inner**) | scene APIs; `UIWindowSceneActivationAction` (tự ẩn khi không khả dụng) |
| Ghép UI phụ trên màn khác | **scene accessory**: `sceneAccessory` modifier |
| Camera accessory | **`CameraCaptureAccessory`** (khi app full screen trên inner + camera session active) |
| Theo dõi khả dụng accessory | `onAvailabilityChange` / observation tracking |
| Xử lý lỗi tạo scene | bắt lỗi khi request; outer **không** tạo được cửa sổ mới |

## 7. Hinge

| Mục đích | API |
|---|---|
| Lắng nghe bản lề | `onHingeChange` (SwiftUI) · `UIHingeInteraction` (UIKit) |
| Dữ liệu | trạng thái **closed / partially open / fully open** + **góc liên tục** |
| Lưu ý | `nil` khi thiết bị **không có bản lề** → kiểm tra tồn tại + **reset state**; dùng cho **hiệu ứng**, không cho layout |

## 8. Camera (AVKit / AVFoundation)

| Mục đích | API |
|---|---|
| Tìm camera trước | `AVCaptureDeviceDiscoverySession`, position `.front` (+ Wide/Ultra Wide) |
| Tự chuyển camera theo pose | **Virtual Front Camera** (chỉ tính năng chung: **1080p60, không depth**) |
| Full khả năng từng camera | device type **outer ultrawide** (4K120) · **inner ultrawide** (1080p60) — **depth chỉ khi dùng camera riêng** |
| Tự chuyển khi mở/gập | **`AVCaptureDeviceDirectionCoordinator`** (UIView + device types + change handler) |
| Truyền an toàn qua actor | **`AVCaptureDeviceDescriptor`** (main-actor safe, sendable) |
| Preview đúng chiều | **rotation coordinator**; sau đó **tắt sensor-orientation compensation** |
| Tỉ lệ preview theo màn | `dynamicAspectRatio` trên `AVCaptureDevice` (cảm biến vuông) |
| Cách preview lấp khung | `videoGravity` trên `AVCaptureVideoPreviewLayer` |
| Mirror | Bật mirror khi **camera sau hướng về người dùng** (trải nghiệm selfie tự nhiên) |

## 9. Công cụ (không phải API)

| Công cụ | Việc |
|---|---|
| **Xcode 27.1** | SDK cho trải nghiệm Duo đầy đủ |
| **Device Hub** | Chạy iPhone Duo simulator; nút **open / close / rotate / fold** |
| **App Resizability skill** | Rà soát best practice resize (hỗ trợ SwiftUI + Duo) |
| Apple Design Resources | Margins & safe areas, screenshot specifications |

## 10. Mẫu phối hợp API (recipe)

```
1) Đọc size class        -> quyết định 1 pane / 2 pane
2) Đọc reservedRegion    -> né nếp + camera; grid cột chẵn
3) Chọn container        -> NavigationSplitView (main–detail) hoặc ArrangementView (split/overlay)
4) Thanh                 -> để hệ thống chuyển trục; set AxisBehavior + visibility priority + compression
5) Hinge                 -> chỉ dùng cho hiệu ứng tương tác (không layout)
6) Camera                -> virtual mặc định; device riêng + direction coordinator khi cần depth/4K
7) Scene/accessory       -> chỉ inner tạo cửa sổ; accessory theo dõi availability
8) Test                  -> Device Hub 6 pose × 2 orientation × 2 phía multitasking × RTL
```
