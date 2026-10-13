# Thứ bậc hành động (chính / phụ)

> Nguồn: Carbon Design System (button guidelines), Material, các design system công khai,
> thực hành ngành về CTA.

## 1. Phân cấp

| Vai trò | Dùng cho | Quy tắc |
|---|---|---|
| **Primary** | Hành động **chính** của màn | **Đúng 1 primary / view** (không tính header/modal/side panel) |
| **Secondary** | Hành động thay thế/đối lập ("Cancel", "Back") | Đi **cặp** với primary; **không dùng một mình**; không cho hành động tích cực |
| **Tertiary** | Hành động ít nổi / sub-task | Dùng độc lập hoặc cùng primary khi nhiều CTA |
| **Ghost** | Ít nổi nhất | Thường đi cùng primary ("Cancel" trong flow) |
| **Danger** | Phá huỷ (xoá/remove) | Có biến thể primary/tertiary/ghost; **tách** khỏi primary |

## 2. Quy tắc vàng

- **Một primary mỗi view.** Các CTA còn lại **hạ độ nổi**.
- **Hai primary cạnh nhau ⇒ triệt tiêu nhau** (ngoại lệ: hai lựa chọn tương đương có chủ đích).
- **Không trộn size** trong cùng container; size nhất quán trong nhóm.
- **Không để primary "cô đơn" cạnh nhiều nút ngang hàng** — thứ bậc phải thấy ngay.

## 3. Thứ tự & vị trí trong nhóm (mobile)

| Bố cục | Thứ tự |
|---|---|
| Nhóm căn **phải** | Primary **ngoài cùng phải** → rồi giảm dần |
| Nhóm căn **trái** | Primary **ngoài cùng trái** → rồi giảm dần |
| Nhóm **fluid** (tràn bề ngang) | Primary **bên trái** (theo thứ tự) |
| **Bottom-sticky** (đáy màn) | Primary **bên phải** — ergonomics ngón cái |
| 1 nút duy nhất ở đáy | **Tràn bề ngang** (full-width) |

## 4. Nhãn & nội dung

- Nhãn = **động từ ngắn (1–3 từ)** nói **kết quả**: "Lưu", "Đặt hàng", "Xoá ảnh".
- Tránh: "OK", "Submit", "Continue" chung chung (không nói chuyện gì xảy ra).
- Hành động phá huỷ: nêu rõ đối tượng ("Xoá 3 mục") và hậu quả.
- **Ưu tiên undo hơn confirm** cho hành động vừa phải; confirm cho hành động nghiêm trọng/không thể hoàn tác.

## 5. Accessibility cho thứ bậc

- Contrast: nút ≥ **3:1**, text ≥ **4.5:1**.
- Focus ring rõ cho mọi nút.
- **Không** truyền tải mức độ quan trọng **chỉ bằng màu** — kèm vị trí/kích thước/kiểu.
- Nút disabled không được là nút duy nhất cho use case chính mà không giải thích.

## 6. Checklist

- [ ] Đúng **một** primary/view; action khác hạ cấp.
- [ ] Cặp nút hợp lệ (primary + secondary/tertiary/ghost/danger).
- [ ] Tên nút là động từ, nói kết quả.
- [ ] Thứ tự trong nhóm theo bảng §3.
- [ ] Phá huỷ có confirm hoặc undo; tách khỏi primary.
- [ ] Contrast đạt; focus ring rõ; không chỉ dựa vào màu.
