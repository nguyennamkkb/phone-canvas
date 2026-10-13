# Adaptive layout cho tablet / large screen

> Nguồn: Material 3 adaptive design + canonical layouts; Apple iPad windowing/split view.

## 1. Breakpoint & pane

| Breakpoint | dp | Pane |
|---|---|---|
| Compact | 0–599 | **1 pane** |
| Medium | 600–839 | 1 (khuyến nghị) hoặc 2 |
| Expanded | 840–1199 | **2 pane** |
| Large | 1200–1599 | 2 |
| Extra-large | 1600+ | 2 |

- **Pane** là đơn vị bố cục: fixed / flexible / floating / semi-permanent.
- **Không khoá layout cứng** — phải flex *giữa* các breakpoint.

## 2. Canonical layouts

| Layout | Cấu trúc | Ghi chú |
|---|---|---|
| **Feed** | Lưới card linh hoạt | Lượng lớn nội dung; card có thể featured |
| **List-detail** | 2 pane: list + detail | Compact ⇒ 1 pane (thường detail khi có selection) |
| **Supporting pane** | Pane chính (~⅔) + phụ | Compact/Medium: phụ **ở dưới** (có thể bottom sheet); Expanded: **bên cạnh**, rộng ~**360 dp** |

**Phân biệt:** *parent–child* ⇒ list-detail; *phụ chỉ có nghĩa kèm chính* ⇒ supporting pane.

## 3. Adaptive strategies

- **Show & hide** — thành phần ẩn/hiện theo chỗ.
- **Levitate** — pane nổi trên nội dung (task-focused: giỏ hàng, form).
- **Reflow** — đổi cách sắp xếp (cột↔hàng, rail↔bar).

Quan hệ pane khi lớn: **co-planar** (cạnh nhau) · **floating** (nổi trên) · **docked** (neo mép).

## 4. Chuyển single ↔ two-pane

- Có chỗ ⇒ hiện **cả hai pane**; selection được giữ.
- Về single pane: thường hiện **detail** (có app bar) — trừ khi sản phẩm multi-select thì giữ **list** có selection.
- **Nhất quán:** nếu trước đó là list thì quay lại list.
- Giữ **scroll position** của detail khi đổi item; giữ trạng thái read/unread.

## 5. Navigation theo chỗ

| Chỗ | Nav |
|---|---|
| Compact | Bottom navigation bar |
| Medium | **Navigation rail** |
| Expanded | Rail mở rộng / **drawer** |

Rail tốt cho reachability (máy lớn cầm hai bên, không phải ở đáy).

## 6. Checklist

- [ ] Layout theo breakpoint + pane, không theo thiết bị.
- [ ] Chọn đúng canonical layout.
- [ ] Giữ selection/scroll khi đổi số pane; quay lại đúng view.
- [ ] Nav đổi dạng theo breakpoint.
- [ ] Không letterbox; hỗ trợ multi-window; không khoá orientation vô cớ.
