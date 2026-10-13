# Ảnh nền màn Splash / Welcome (9:16, không chữ)

> **Nguồn:** ảnh chụp màn Welcome của app đang chạy ("Welcome to Screen Mirroring Smart Cast TV!", 2026-10-13).
> **Mục đích:** tạo lại **nền + minh hoạ** của màn đó thành **một ảnh 9:16 không có chữ**. Tiêu đề, mô tả và vòng loading do app render đè lên ảnh.

## Phân tích ảnh gốc → quy định cho ảnh mới

| Vùng (tính theo chiều cao) | Ảnh gốc | Ảnh mới |
|---|---|---|
| 0–8% | Thanh trạng thái iOS | Chỉ có nền gradient, không vật thể |
| 15–40% | Tiêu đề 3 dòng + mô tả (app render) | **Để trống:** chỉ gradient sáng nhẹ, đủ tương phản cho chữ đen |
| 45–78% | Điện thoại isometric dựng **dọc** bên trái, Smart TV bên phải, mỗi màn một nội dung khác nhau, sóng Wi‑Fi và hạt sáng ở giữa | Điện thoại **nằm ngang** ở trước bên trái, TV ở sau bên phải; **2 màn hiện cùng một khung video**; một dải tia sáng và hạt sáng từ điện thoại sang TV, nhìn là hiểu "phản chiếu" |
| 82–95% | Vòng loading (app render) | **Để trống:** chỉ gradient |
| Màu nền | Gradient xanh / tím xanh | **Nền trắng phẳng + một blob `#E6ECFF`** sau thiết bị, theo phong cách bộ ảnh SmartCast. Muốn có sắc nền thì app tự phủ gradient token phía sau ảnh |

**Chỗ phát sinh chữ trong ảnh gốc, phải chặn đích danh:**
- Chữ "SMART TV" trên màn TV.
- Giờ "11:25" trên điện thoại và trên TV.

Các ô ứng dụng nhiều màu chỉ được có **glyph đơn giản** (play, nốt nhạc, tay cầm game…), không có chữ.

## Prompt — phong cách line-art SmartCast (bản dùng)

**Yêu cầu (2026-10-13):**
- Thể hiện được **phản chiếu điện thoại lên TV**.
- **Điện thoại nằm ngang.**
- **Cùng phong cách với các prompt đã duyệt** (KB1, Home, Cast): line-art đen dày, bảng màu `#0440FB` / `#BDCCFD` / `#E6ECFF` / trắng, một blob nền.

Bản isometric nhiều màu theo app gốc đã **bỏ**, vì không đồng bộ với onboarding mới.

**Đính kèm làm style reference:**
- Bộ 3 ảnh quiz: `project/smartscreen/assets/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`.
- `project/smartscreen/assets/ob_hero_mirror_tv_web.png`: cùng cảnh hai tay cầm điện thoại ngang chiếu lên TV, để dáng tay và dáng TV khớp bộ ảnh.

**Khác các ảnh trước ở bố cục.** Đây là ảnh nền 9:16, nên chủ thể chỉ nằm ở **dải giữa (khoảng 45–78% chiều cao)**. Phía trên là chỗ cho tiêu đề, phía dưới là chỗ cho vòng loading; cả hai vùng chỉ là nền trắng tiếp nối. Vì vậy prompt **không dùng khối `[STYLE-LIGHT]` nguyên văn**: câu bố cục "subject 90% width, 70–90% height" của khối đó sẽ kéo chủ thể chiếm cả khung. Phần phong cách được chép vào, bỏ câu bố cục đó.

```
Using the attached images as the exact style reference (same thick black outlines, same soft rounded shapes, same organic background blob, same hands, same TV shape).
A tall vertical phone wallpaper, portrait 9:16. The whole canvas is pure white #FFFFFF. The illustration sits only in the middle band of the canvas, between about 45% and 78% of the height, centered horizontally; above and below that band the canvas simply continues as the same plain pure white background with nothing on it.
The illustration: a large flat-screen TV on two short feet in the upper part of the band. Below it, two hands hold a smartphone in LANDSCAPE orientation (horizontal, wider than tall), like watching a video. Both screens show EXACTLY the same picture, like a mirror: one rounded mountain and a sun, in the same landscape proportions — the TV is simply a larger copy of the phone screen. One curved dashed arrow flies from the phone up to the TV, and three small Wi-Fi arcs sit above the phone. A few small three-stroke sparkles beside the TV.
Coloring: both screen backgrounds #E6ECFF, the mountain #BDCCFD, the sun royal blue #0440FB, the dashed arrow, Wi-Fi arcs and sparkles royal blue #0440FB, hands filled white, device bodies white.
Behind the devices only, one soft flat organic #E6ECFF blob, about the size of the illustration — the blob stays inside the middle band; the top and bottom of the canvas and all four corners stay pure white.
Style: clean flat vector illustration. Outlines are pure black, smooth and confident, ONE single clean line each — not sketchy, not doubled — uniform thickness about 1.2% of the image width (around 14px at 1152px wide), rounded ends and rounded corners. Strictly limited palette: black outlines, royal blue #0440FB, light blue #BDCCFD (soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, and white — nothing else. No screen reflections or glare, no ground shadow, no drop shadows, no gradients, no 3D, no texture. Devices are simplified mockups with rounded corners, short feet and no brand logos.
Absolutely no text, no letters, no numbers, no logos, no watermark.
Portrait 9:16, 1152x2048.
```

**Ô negative:** dán khối **NEGATIVE** của KB1 (`docs/onboarding/kb1-value-first-hard-paywall.md`), thêm:
```
portrait phone, vertical phone, phone standing upright, different pictures on the two screens, blank TV screen, isometric, 3D perspective, gradient background, blob filling the whole canvas, illustration filling the whole canvas, objects near the top edge, objects near the bottom edge, white boxes, rectangular panels, frames around the scene, clock, time, SMART TV, app icon grid
```

## Duyệt ảnh

- [ ] Phóng to màn TV và màn điện thoại: **không còn chữ hay số nào**, kể cả chữ mờ hoặc chữ giả.
- [ ] Điện thoại **nằm ngang**. Hai màn hiện **cùng một khung hình** (đồi, hồ, hoàng hôn, nút play, thanh tiến trình), chỉ khác kích thước.
- [ ] Dải tia sáng đi **từ điện thoại sang TV**, nhìn vào là hiểu ngay "phản chiếu".
- [ ] 45% phía trên chỉ có gradient. Đặt thử tiêu đề đen 34pt lên vẫn đọc rõ.
- [ ] 20% phía dưới trống, đủ chỗ cho vòng loading.
- [ ] Hai thiết bị nằm trong vùng 45–78% chiều cao, không bị cắt mép trái hay phải, chừa lề ≥ 8%.
- [ ] Phong cách khớp bộ ảnh SmartCast khi đặt cạnh `ob_hero_mirror_tv_web` và bộ ảnh quiz: nét đen dày ~1.2% bề ngang, chỉ dùng các màu trong bảng, một blob, không gradient, không 3D. Blob lệch màu thì chỉnh hậu kỳ về `#E6ECFF`.
- [ ] Không có logo hãng trên thiết bị.
- [ ] Ảnh xuất 1152×2048 (hoặc 1290×2796 cho iPhone Pro Max). Trong app dùng `scaledToFill`, neo giữa, nên trên máy dài hay ngắn chỉ hụt phần gradient ở mép trên và mép dưới.

## Ghi chú

Bản này dùng phong cách line-art của bộ ảnh SmartCast (onboarding, Home, Cast), nên Splash và onboarding sẽ cùng một ngôn ngữ hình ảnh.
