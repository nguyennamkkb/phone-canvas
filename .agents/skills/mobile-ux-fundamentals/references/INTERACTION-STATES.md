# Trạng thái tương tác (interaction states)

> Nguồn: Material Design 3 (states, state layers), Carbon Design System, thực hành component.

## 1. Bộ trạng thái chuẩn

| State | Ý nghĩa | Biểu diễn |
|---|---|---|
| **Enabled** | Mặc định, tương tác được | Styling chuẩn của component |
| **Disabled** | Không tương tác | Giảm màu/elevation, **~38% opacity**; **không** focus/hover/press |
| **Hover** | Con trỏ dừng trên phần tử | state layer **+8%** (fade nhẹ) — chỉ khi có pointer |
| **Focused** | Điều hướng bằng keyboard/voice | state layer **+10%** + **focus ring rõ** |
| **Pressed** | Tap/click | state layer **+10%**, **high-emphasis**, ripple/đổi composition; **chỉ 1 pressed** cùng lúc |
| **Dragged** | Kéo phần tử | state layer **+16%** |

## 2. State layer (Material)

- Cấu trúc 3 lớp: **container → state layer → content**.
- State layer dùng **màu của content** (thường "on color") với % opacity.
- % chuẩn: **hover 8 · focus 10 · press 10 · drag 16 · disabled 38**.
- **State layer nhỏ hơn interactive target**: state layer 40 dp nhưng **target 48 dp** —
  đừng để layer nhỏ làm bạn tưởng target nhỏ.

## 3. Nguyên tắc

- **Có thể kết hợp** state (selected + hover, focused + selected) — đừng thiết kế như loại trừ nhau.
- **Hai chỉ báo thị giác** cho mỗi state (không chỉ màu) — đảm bảo a11y.
- **Disabled không focus** và không phản ứng hover/press; disabled **không cần đạt contrast**.
- **Áp dụng nhất quán** cho mọi component trong hệ thống.
- Boot state của một màn (đang tải, trống, lỗi) là **loại khác** — xem
  [STATE-LIFECYCLE.md](STATE-LIFECYCLE.md).

## 4. Trạng thái bổ sung hay bị bỏ quên (mobile)

| State | Quy tắc |
|---|---|
| **Loading (trong control)** | Giữ **label**, thêm spinner; disable nhưng **không ẩn**; re-enable khi xong/lỗi |
| **Error (field)** | Viền/message nêu **cách sửa**; không chỉ đổi màu |
| **Success** | Xác nhận **không chỉ bằng màu** (icon + text) |
| **Selected / On / Off** | Công bố cho screen reader (value/role) |
| **Stale / Refreshing** | Cho biết dữ liệu có thể cũ; cho refresh |

## 5. Anti-pattern

- Ẩn focus ring; chỉ dùng **màu** để báo disabled; disabled vẫn click được;
- Loading xoá mất label (người dùng mất ngữ cảnh);
- Trộn state kiểu tuỳ hứng giữa các component;
- Dùng pressed state cho hành động không thực sự xảy ra (không phản hồi trung thực).

## 6. Checklist

- [ ] Đủ enabled/disabled/pressed (+ hover/focus khi có pointer/keyboard).
- [ ] Focus ring **thấy rõ**; không bị che.
- [ ] Disabled không tương tác & không focus.
- [ ] Loading giữ label + có thể huỷ khi lâu.
- [ ] Mọi state công bố được cho a11y.
- [ ] State nhất quán toàn hệ thống; % state layer theo token.
