# Fold-aware layout

> Nguồn: Android foldables (WindowManager/FoldingFeature), Apple iPhone Duo (reserved regions,
> arrangement, displacement).

## 1. Nguyên tắc

- **Size-class-first:** quyết định layout theo **không gian khả dụng**, không theo tên thiết bị/posture.
- **Không fixed width**; dùng margin + safe area; **một nguồn state**.
- **Displacement** (thay vì vẽ lại): điều chỉnh *khung* phần tử hiện có để né vùng gập.

## 2. Vùng gập (fold/hinge)

| Loại | Hành vi |
|---|---|
| **Occlusion** (camera, cutout) | Chỉ **che khuất** một vùng nhỏ |
| **Division** (nếp gập) | **Chia** không gian thành nhiều vùng dùng được |

- Đọc region **active/inactive** (nếp inactive khi mở phẳng, width = 0) — dùng cả inactive cho quyết
  định cấu trúc (vd. **grid số cột chẵn** khi tồn tại division region).
- Nội dung/điều khiển quan trọng **ngoài vùng gập**; nội dung cuộn **được** băng qua.

## 3. Displacement patterns

- Phần tử tự adapt được → **đi một mình**; phần tử liên quan → **đi cùng nhau** (giữ quan hệ).
- **Không** displace nội dung cuộn (article/feed/list/document).
- Gập sách → alert/menu dồn **nửa trailing** (gần nơi tiếp tục ở màn ngoài).
- Dựng bàn → **trên** = nội dung nhìn xa; **dưới** = điều khiển chạm (bề mặt ổn định).
- Ưu tiên ngữ cảnh: search đang focus nằm **trên bàn phím**, chỉ đổi width/vị trí.
- Hệ thống thường tự lo: alert, context menu, sheet, action sheet, menu, popover; button/menu/toolbar
  có thể được "nudge" khỏi nếp.

## 4. Bố cục theo vùng

- **Split/2 pane:** khi có nếp → pane cân lại (vd. 50/50) để cả hai rõ.
- **Grid:** giữ lề ngoài, **tăng spacing quanh nếp**; mỗi ô trong vùng của nó; số cột chẵn.
- **Media:** reframe theo tỉ lệ màn; tabletop ⇒ nửa trên; không crop chủ thể.
- **Nav:** folded → bar; flat → rail/drawer.

## 5. Kích thước tham chiếu (iPhone Duo)
- Màn trong **669 × 951 pt** (1878 × 2670 px @3x); màn ngoài **466 × 678 pt** (1398 × 2034 px @3x).
- Màn trong thường dùng **landscape** (slab rộng); màn ngoài **rộng–thấp hơn** iPhone thường.

## 6. Checklist

- [ ] Tránh nếp cho nội dung/điều khiển quan trọng; cuộn thì không.
- [ ] Đọc region active/inactive; grid cột chẵn khi có division.
- [ ] Displacement đúng scope; không displace nội dung cuộn.
- [ ] Tabletop: điều khiển nửa dưới; book: chia trái/phải.
- [ ] Split pane cân lại quanh nếp; nav đổi dạng theo width.
- [ ] Reframe media theo tỉ lệ; không crop chủ thể.
