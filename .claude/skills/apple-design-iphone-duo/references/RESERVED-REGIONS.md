# Reserved Regions & Displacement — iPhone Duo

> Đúc kết từ HIG *Designing for iPhone Duo* (mục Reserved regions, Dynamic layouts) +
> Tech Talk *Strike a pose with adaptive layouts on iPhone Duo*.
> Ảnh: `assets/reserved-outer-camera.png`, `assets/reserved-inner-fold-camera.png`, `assets/anatomy-inner.png`.

## 1. Reserved region là gì

Vùng trong màn hình mà **nội dung phải tránh che** hoặc **component phải tự điều chỉnh** để né.
Tương tự "window controls" trên iPadOS — hãy coi như một vùng layout bình thường cần adapt.

Có **hai loại**:

| Loại | Hành vi | Trên Duo |
|---|---|---|
| **Occlusion region** | Không chia vùng, chỉ **che khuất** (như một frame nhỏ trong bounds) | Camera trước ngoài; camera trong (FaceTime) |
| **Division region** | **Chia** một vùng lớn thành nhiều vùng nhỏ dùng được | Nếp gập (folding region) |

## 2. Ba reserved region cụ thể

### 2.1 Camera trước ngoài — occlusion
- **Luôn hiện diện**; **mở rộng thành Dynamic Island** khi có Live Activities.
- Khi control nằm ở cạnh, hệ thống **tự sắp xếp** phần tử để không đè.
- Ảnh `assets/vertical-bars-layout.png`: Dynamic Island là phần tử trên cùng của dải dọc bên phải.

### 2.2 Camera trước trong — occlusion
- **Chỉ active khi camera hoạt động** (under-display). Khi inactive: **không thấy, width = 0**.
- Khi camera bật, UI **dịch sang** để nhường chỗ.
- Ảnh `assets/reserved-inner-fold-camera.png`: vòng tròn camera ở nửa phải, gần đỉnh.
- Nếu viewfinder là trung tâm app: **giữ nội dung/điều khiển quan trọng tránh xa vùng này**.

### 2.3 Nếp gập — division
- **Có điều kiện**: chỉ active khi máy **đang gập một phần**. Khi mở phẳng: **inactive, width = 0**.
- Khi gập, nó chia màn trong thành 2 vùng; vùng ở tâm (nơi màn cong) **bị loại khỏi vùng dùng được**.
- Ảnh `assets/reserved-inner-fold-camera.png`: dải dọc giữa màn hình = vùng gập.

## 3. API

| Việc | SwiftUI | UIKit |
|---|---|---|
| Đọc region | `GeometryProxy.reservedRegion` (trong `GeometryReader` / `onGeometryChange`) | `UIView.reservedRegion(...)` |
| Lấy khung | — | `frame` của region |
| Lọc active | mặc định chỉ trả **active** | `includeInactive` để lấy cả inactive |
| Loại region | `.division`, `.occlusion` | tương ứng |
| Đẩy nội dung ra khỏi vùng | `ReservedRegion` | `UIView.ReservedRegion` |
| Bo góc đồng tâm | `ConcentricRectangle` (iOS 26+) | `UICornerConfiguration` |

> Dùng **inactive region** để ra quyết định cấp cao: ví dụ grid chọn **số cột chẵn** khi tồn tại
> division region, bất kể nó đang active hay không.

## 4. Displacement — dịch chuyển thay vì vẽ lại

**Định nghĩa:** điều chỉnh *khung* của các phần tử đã có theo không gian khả dụng, giữ nội dung
quan trọng **thấy được, chạm được, không bị che** khi máy gập một phần.

### 4.1 Nguyên tắc
- **Phạm vi (scope):** phần tử nào tự adapt được thì **di chuyển một mình**; các phần tử **liên quan
  thì di chuyển cùng nhau** để giữ quan hệ.
- **Đừng di chuyển quá xa nguồn** — sẽ làm yếu quan hệ thị giác (ví dụ context menu phải đi cùng
  ảnh được chọn, không nhảy sang nửa đối diện).
- **Không displace nội dung cuộn liên tục** (bài viết, feed, tài liệu, danh sách) — chúng vốn đã
  adapt bằng cuộn; dịch chuyển sẽ phá tính liên tục.
- **Mục đích quyết định đích đến**, và đích có thể đổi theo cách dùng:
  - Gập kiểu sách → alert/menu dồn về **nửa trailing** (gần nơi chúng sẽ xuất hiện khi đóng máy).
  - Dựng trên bàn → **vùng trên** cho nội dung cần nhìn từ xa; **vùng dưới** cho điều khiển chạm.
- **Ưu tiên giữ tính ngữ cảnh:** search đang focus vẫn nằm trên bàn phím; khi mở máy, field rộng ra
  nhưng khi gập, vị trí và bề rộng adapt để vẫn nằm trên view đang tìm.
- **Thuộc tính adapt:** thường là **vị trí + kích thước**, nhưng có thể là thuộc tính thị giác khác.

### 4.2 Hệ thống làm sẵn (dùng trước khi tự làm)
- Alerts, context menus, sheets, action sheets, menus, popovers → **tự né reserved region**.
- Split view (vd. Reminders) → giữ **cả hai cột** bằng cách chỉnh width về **50/50**.
- Buttons/menus/toolbar buttons → được **"nudge" khỏi nếp gập** (khó bấm khi rơi đúng nếp).
- Nếp gập trở thành **đường phân chia tự nhiên** cho layout.

### 4.3 Khi phải tự làm
- Dùng **ReservedRegion API** cho custom UI / custom bars / edge-to-edge.
- Grid: tăng spacing quanh nếp, giữ mỗi container trong vùng của nó.
- Audit các layout **căn giữa** — phần lớn cần **offset** để không bị control che.

### 4.4 Bảng quyết định nhanh

```
Nội dung cuộn liên tục (article, feed, list)      -> KHÔNG displace (để cuộn tự lo)
Menu/alert/popover gắn với một phần tử            -> đi CÙNG phần tử đó
Alert khi gập sách                                 -> dồn về nửa trailing
Media khi dựng bàn                                  -> vùng trên; điều khiển -> vùng dưới
Search đang focus                                   -> giữ trên bàn phím, adapt width/position
Grid nhiều ô                                        -> giữ lề ngoài, tăng spacing quanh nếp, cột chẵn
Custom bar/edge-to-edge                             -> ReservedRegion API
```

## 5. Checklist reserved regions

- [ ] Dùng component hệ thống cho alert/menu/sheet/button (được né nếp miễn phí).
- [ ] Custom UI: đọc `reservedRegion`, kể cả **inactive** khi cần quyết định cấu trúc.
- [ ] Grid: số cột **chẵn** khi có division region; tăng spacing quanh nếp.
- [ ] Nội dung cuộn **không** bị displace.
- [ ] Kiểm tra camera trong ở trạng thái **active/inactive**.
- [ ] Kiểm tra layout căn giữa → đã offset đúng chưa.
