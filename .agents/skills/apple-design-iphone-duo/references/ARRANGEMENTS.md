# Arrangements — iPhone Duo

> Đúc kết từ HIG *Designing for iPhone Duo* (mục Arrangement views) +
> Tech Talk *Strike a pose with adaptive layouts on iPhone Duo*.
> Ảnh: `assets/arrangement-split.png`, `assets/arrangement-overlay.png`.

## 1. Định nghĩa

**Arrangement view** = container bố cục nằm *giữa* container điều hướng và container nội dung.
Nó giữ **hai view**: `primary` + `secondary`, và **tự tổ chức** theo display size, orientation và
reserved regions.

> Mô hình tư duy: hàm **inputs → outputs**.
> **Inputs:** horizontal/vertical size class · tỉ lệ width/height · có division region active hay không.
> **Outputs:** có hiển thị view không · nếu có thì **frame** là gì.

## 2. Hai kiểu arrangement

### 2.1 Split arrangement (`assets/arrangement-split.png`)
- **Chia** diện tích giữa primary và secondary.
- Mặc định: **chia ngang** khi vùng **rộng hơn cao**; **chia dọc** khi **cao hơn rộng**.
- Có thể **giới hạn trục** (`axes`): nếu không thể chia theo trục **chính**, arrangement chọn
  **chỉ hiển thị một view** (thường là primary).
- Ảnh: primary (tím) nửa trái, secondary (xanh) nửa phải, divider dọc.

### 2.2 Overlay arrangement (`assets/arrangement-overlay.png`)
- **Xếp lớp** primary lên secondary.
- Khi máy **gập một phần**: hai view **tự tách ra hai bên** (tận dụng 2 vùng của màn gập).
- Khi bình thường: primary **nằm trên** secondary (ảnh: primary là thẻ bo tròn ở đáy, secondary
  phủ toàn màn).
- Có thể **collapse secondary** khi không muốn nó xuất hiện.
- `overlayArrangementZIndex` (environment) cho biết lớp của primary — dùng để đổi giữa bản
  **collapsed / expanded** khi người dùng gập/mở.

## 3. Khi nào dùng gì

```
Layout hiện tại là HStack / VStack (cạnh nhau / trên-dưới)   -> split arrangement
Layout hiện tại là ZStack (chồng lớp)                        -> overlay arrangement
Quan hệ foreground / background rõ ràng                     -> overlay
   (vd. Accessibility Reader: control ở foreground, nội dung đọc ở background;
    nội dung có thể bị che một phần vì vẫn cuộn được)
Quan hệ main–detail rõ ràng                                  -> split
   (vd. Podcasts: transcript là chi tiết của podcast đang phát; KHÔNG được che nhau)
Cần expanding/collapsing + điều hướng đầy đủ                 -> NavigationSplitView, không phải Arrangement
```

Quy tắc chọn: **bám pattern có sẵn của app**; chỉ khi không có pattern để dựa thì mới quyết định
theo quan hệ foreground/background (overlay) hay main–detail (split).

## 4. Cấm kỵ

- ❌ **Đặt container điều hướng bên trong ArrangementView** (ArrangementView **không** cung cấp hạ
  tầng điều hướng). Đặt `NavigationSplitView`/`NavigationStack` **bọc ngoài** arrangement.
- ❌ **Đặt ArrangementView bên trong `List` / `ScrollView`** — bản chất view cuộn không phù hợp làm
  cha của một container bố cục động.

## 5. API

| Việc | SwiftUI | UIKit |
|---|---|---|
| Container | `ArrangementView` | `UIArrangementViewController` |
| Đặt primary/secondary | tham số khởi tạo | `primaryViewController`, `secondaryViewController` |
| Chọn kiểu | `arrangementViewStyle` (mặc định `.split`) | `updateArrangement(...)` |
| Giới hạn trục | `.axes(...)` trên split style | `UISplitArrangement` với trục tương ứng |
| Collapse secondary | có | có |
| Lớp overlay | `overlayArrangementZIndex` | `stateForViewPlacement(...)` → `zIndex` |

## 6. Checklist arrangement

- [ ] Có thật sự cần arrangement, hay component hệ thống đã đủ?
- [ ] Split: xác định **trục** đúng; kiểm tra trường hợp "không chia được" (chỉ còn 1 view).
- [ ] Overlay: kiểm tra hành vi **gập một phần** (2 bên) và **bình thường** (chồng lớp).
- [ ] Navigation nằm **ngoài**; arrangement **không** nằm trong List/ScrollView.
- [ ] Nội dung quan trọng **không bao giờ bị che** khi dùng split.
- [ ] Overlay: nội dung bị che một phần vẫn **cuộn tiếp được**.
