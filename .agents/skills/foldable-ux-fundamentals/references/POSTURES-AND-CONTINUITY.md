# Postures & continuity

> Nguồn: Android foldables (postures, continuity, multi-window), Apple iPhone Duo (poses, Tech Talks).

## 1. Posture

| Posture | Mô tả | Dùng cho | Lưu ý |
|---|---|---|---|
| **Folded** | Gập, dùng màn ngoài | Tác vụ nhanh, một tay | Compact; 1 pane; nav đáy/dọc |
| **Flat** (unfolded) | Mở phẳng | 2 pane, media, làm việc | Medium/large; rail/drawer; multi-window |
| **Tabletop** | Gập ngang, dựng như lều | Video call/playback, điều khiển | Media/nội dung **nửa trên**, điều khiển **nửa dưới** |
| **Book** | Gập dọc như sách | Đọc nội dung dài | Chia **trái/phải**; nếp là divider |
| **Tent / propped** | Dựng trên cạnh | Hands-free | Vùng trên nội dung xa, dưới điều khiển |
| **Cover** (flip) | Màn ngoài tỉ lệ vuông | Use case tập trung | Edge-to-edge; tránh camera cutout |

## 2. Continuity — bắt buộc

App **có thể stop/restart** khi đổi màn/posture ⇒ phải khôi phục:
- **Text đã nhập** trong field.
- **Bàn phím** (trạng thái).
- **Scroll position**.
- **Media playback** (tiếp tục từ chỗ dừng).
- **Selection / navigation path**.

Hai layout phải **bổ trợ nhau**: màn nhỏ có ảnh + mô tả ⇒ màn lớn **giữ nguyên** + thêm specs/reviews.

## 3. Multi-window & multi-instance

- Foldable lớn hỗ trợ **split-screen** và (một số máy) **desktop windowing**.
- **Multi-instance:** nhiều cửa sổ cùng app; **PiP** ở cả folded/unfolded; attachment có thể mở cửa sổ riêng.
- **Không khoá portrait** — gây letterbox trên màn lớn.

## 4. Hinge/fold awareness

- Xác định vùng gập/bản lề; **tránh** đặt nội dung/điều khiển quan trọng ở đó.
- **Nội dung cuộn được phép** băng qua.
- Một số nền tảng cho **góc/trạng thái bản lề** (cho hiệu ứng tương tác), nhưng **layout** nên dựa trên
  size class / region API, không dựa vào góc.

## 5. Checklist

- [ ] Hỗ trợ mọi posture (folded, flat, tabletop, book, cover).
- [ ] State khôi phục đầy đủ (text/keyboard/scroll/media/selection).
- [ ] Hai layout bổ trợ, không mâu thuẫn.
- [ ] Multi-window/multi-instance/PiP; không khoá portrait.
- [ ] Tránh nếp; nội dung cuộn không bị displace.
- [ ] Test: posture × portrait/landscape × multi-window.
