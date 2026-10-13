# Định hướng thiết kế Onboarding SmartCast

> Áp dụng chung cho cả 2 kịch bản: [KB1](kb1-value-first-hard-paywall.md) · [KB3](kb3-showcase-social-proof-exit-offer.md).
> Prompt tạo ảnh hero nằm trong từng file kịch bản, mục **"Prompt ảnh hero"**.

## 1. Ý tưởng chủ đạo

**"Bố cục của mẫu illustration tối giản + hình ảnh là sản phẩm thật."**

- Lấy từ mẫu tham khảo: nền sáng nhiều khoảng trắng, nét vẽ tay đen, **một màu nhấn duy nhất**, bố cục hình trên – chữ dưới – nút to dưới cùng.
- Thay đổi so với mẫu: nhân vật hoạt hình không phải trung tâm. **Trung tâm luôn là thiết bị** (iPhone → TV / laptop) với nội dung đang được chiếu, vì giá trị của app là khoảnh khắc "điện thoại hiện lên màn hình lớn". Nét vẽ tay chỉ là chi tiết trang trí xung quanh (sóng Wi-Fi, mũi tên cong, tia sáng).
- **Một phong cách cho cả 2 kịch bản.** A/B test so sánh *luồng*, không so sánh *giao diện*. Mọi kịch bản ghép từ cùng một bộ mẫu màn (mục 5).

## 2. Màu

Giữ màu thương hiệu hiện tại của app (`Assets.xcassets/Colors`), không dùng màu cam của mẫu.

| Token | Hex | Dùng cho |
|---|---|---|
| `blue500` – Accent | `#0440FB` | Nút CTA, chấm trang đang chọn, thanh tiến trình, chi tiết nhấn trong ảnh |
| `blue100` | `#BDCCFD` | Mảng nền phía sau chủ thể trong ảnh, viền thẻ được chọn |
| `blue50` | `#E6ECFF` | Nền thẻ chọn trong quiz, nền icon |
| Background | `#FFFFFF` (màn) / `#F5F4F9` (thẻ, khối phụ) | Nền màn onboarding sáng |
| Text chính | `#111111` | Tiêu đề |
| Text phụ | `#8A8A8E` | Mô tả, phụ đề |
| **Dark – Paywall bg** | `#070B1F` → `#0E1638` (gradient dọc) | Chỉ dùng cho Paywall và Exit Offer |
| **Gold – Pro** | `#FFC83D` | Vương miện, sao đánh giá, nhãn "Best Value" (chỉ ở khu vực Pro) |
| Urgency – Exit Offer | `#FF4D3A` | Đồng hồ đếm ngược, nhãn giảm giá (chỉ ở Exit Offer) |

Quy tắc: mỗi màn sáng chỉ có **một** điểm màu `#0440FB` nổi bật nhất là nút CTA. Đỏ chỉ xuất hiện ở Exit Offer.

## 3. Chữ

Font hệ thống **SF Pro** (hỗ trợ sẵn 8 ngôn ngữ của app, kể cả tiếng Nhật/Hàn).

| Vai trò | Cỡ / độ đậm | Ghi chú |
|---|---|---|
| Tiêu đề | 26pt Bold, căn giữa, tối đa 2 dòng | Câu ngắn; bản dịch Đức/Pháp thường dài hơn 30% → thiết kế chừa chỗ |
| Mô tả | 15pt Regular, `#8A8A8E`, tối đa 2 dòng | |
| Nút CTA | 17pt Semibold, chữ trắng | |
| Giá trên Paywall | 28pt Bold | Giá tổng luôn to ngang giá quy đổi (Guideline 3.1.2) |
| Chữ pháp lý | 12pt Regular | Restore · Terms · Privacy |

**Không đặt chữ vào ảnh hero.** Mọi chữ do app render để dịch được 8 ngôn ngữ.

## 4. Khung một màn (sáng)

```
┌─────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 3/8       │ ← Thanh tiến trình (thay cho nút Skip)
│                             │
│                             │
│        [ ẢNH HERO 1:1 ]     │ ← ~50–55% chiều cao màn
│                             │
│                             │
│   Tiêu đề 2 dòng căn giữa   │
│   Mô tả ngắn màu xám, 2 dòng │
│                             │
│           ● ○ ○             │ ← Chấm trang (chỉ trong carousel)
│  ┌───────────────────────┐  │
│  │       Tiếp tục        │  │ ← Nút viên thuốc, cao 56pt, bo 28pt, lề 24pt
│  └───────────────────────┘  │
└─────────────────────────────┘
```

- Lề ngang 24pt; khoảng cách ảnh → tiêu đề 32pt; tiêu đề → mô tả 12pt.
- **Không có nút Skip.** Thay bằng thanh tiến trình mảnh (4pt) ở trên cùng để người dùng biết còn bao nhiêu bước.
- Nút CTA luôn ở cùng một vị trí trên mọi màn để người dùng bấm theo nhịp.

## 5. Bộ mẫu màn dùng chung

| Mẫu | Dùng ở | Mô tả |
|---|---|---|
| **T1 – Carousel** | KB1-M2, KB3-M1→M3 | Khung mục 4, ảnh hero + tiêu đề + mô tả + chấm trang. Vuốt ngang hoặc bấm nút |
| **T2 – Quiz thẻ chọn** | KB1-M1, KB3-M4 | Tiêu đề ở trên, dưới là thẻ chọn: dạng danh sách (3 thẻ to, icon trái) hoặc lưới 2 cột (hãng TV). Thẻ chọn: nền `#E6ECFF`, viền 2pt `#0440FB`, dấu tích. Chọn xong tự sang màn sau sau 300ms |
| **T3 – Xin quyền** | KB1-M4, KB3-M5 | Ảnh hero nhỏ hơn (~40%), dưới là 1–3 dòng quyền dạng icon + tên + lý do |
| **T4 – Quét / Tiến trình** | KB1-M5, KB3-M6/M7 | Radar động vẽ bằng code (không dùng ảnh), danh sách thiết bị trượt vào; hoặc thanh % + dòng trạng thái chạy |
| **T5 – Paywall tối** | KB1-M7, KB3-M8 | Nền dark, ảnh hero nhỏ phía trên, danh sách quyền lợi tích xanh, 2 thẻ gói, nút CTA, dòng pháp lý. Nút [X] chỉ có ở soft paywall (KB3) |
| **T6 – Exit Offer** | KB1 (đóng paywall), KB3-M9 | Popup/full-sheet trên nền dark mờ, ảnh quà tặng, giá gạch ngang + giá mới, đồng hồ đếm ngược đỏ |
| **T7 – Chúc mừng** | KB1-M8 | Nền sáng, ảnh vương miện + pháo giấy, 1 nút vào app |

Các màn tương tác (playground cast ảnh) dùng UI thật của app, chỉ áp màu và chữ theo bộ này.

## 6. Chuyển động

- Ảnh hero carousel nên có bản động ngắn (1.5–2s, lặp): nội dung "bay" từ iPhone sang TV, sóng Wi-Fi lan ra, nét vẽ tự hiện. Làm bằng **Lottie** (ưu tiên, nhẹ) hoặc MP4 không tiếng. Ảnh tĩnh trong file kịch bản là khung hình chính của animation.
- Chuyển màn: trượt ngang 300ms. Thẻ quiz: nảy nhẹ khi chọn. CTA: nhấn co 0.97.
- Radar, thanh tiến trình, đồng hồ đếm ngược: vẽ bằng code.

## 7. Phong cách minh hoạ (dùng cho mọi prompt)

### 7.1 Đặc điểm

- **Nét:** đường viền đen đậm, đều — dày **~1.2% bề ngang ảnh** (≈18px ở ảnh 1536px; đo từ ảnh chuẩn `ob_quiz_family`), đầu nét bo tròn. Vẽ bằng **một đường sạch**, không nét kép, không run kiểu phác thảo.
- **Màu:** chỉ đen + xanh `#0440FB` + xanh nhạt `#BDCCFD` / `#E6ECFF` + trắng. Không gradient, không bóng đổ, không 3D.
- **Thiết bị:** iPhone viền mỏng không có tai thỏ rõ, TV phẳng chân mảnh, laptop mỏng — **không logo hãng nào**.
- **Nội dung trên màn hình thiết bị:** được tô màu phẳng (ảnh phong cảnh, nét vẽ, khung camera) để người xem hiểu ngay đang chiếu gì.
- **Trang trí:** vòng xoắn nét đơn, mũi tên cong nét đứt, tia sáng 3 vạch, chấm tròn nhỏ, sóng Wi-Fi 3 cung — mỗi ảnh 2–4 chi tiết, không nhiều hơn.
- **Con người:** chỉ xuất hiện một phần (bàn tay cầm điện thoại, nửa người ngồi sofa) theo kiểu nét đơn giản của mẫu; không là trung tâm.
- **Bố cục:** chủ thể nằm giữa, chiếm ~70% khung, một mảng tròn/blob `#E6ECFF` phẳng phía sau làm nền.

### 7.2 Đoạn prompt phong cách chung (STYLE-LIGHT) — nguồn duy nhất

Thay `[STYLE-LIGHT]` trong prompt bằng đoạn này, cho **mọi ảnh nền sáng**. Mỗi câu tả **một số đo của ảnh chuẩn `ob_quiz_family`** (đo 2026-10-12) — không thêm tính từ cảm tính, vì tính từ kéo cả bộ sang một phong cách mới:

```
Style: match the attached reference images exactly — same drawing hand, same line quality, same proportions.
Clean flat vector illustration. Outlines are pure black, smooth and confident, drawn as ONE single clean line each — not sketchy, not wobbly, not doubled, no rough marker texture. Outline thickness is uniform, about 1.2% of the image width (around 18px at 1536px wide), with rounded ends and rounded corners. Shapes are simple and slightly soft, like a friendly vector icon scaled up.
Strictly limited palette: black outlines, royal blue #0440FB, light blue #BDCCFD (a soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, and white — nothing else. Large flat fills of #BDCCFD, #E6ECFF and white; royal blue only on one or two small accent shapes.
Composition: the subject spans about 90% of the width and 70–90% of the height, centered, with at least 8% margin on every side. Behind the subject, one soft organic #E6ECFF blob roughly the size of the subject, covering about 25–45% of the image; the four corners always stay pure white #FFFFFF.
People are very simple rounded shapes filled with #BDCCFD or white, faces blank or minimal, no skin tones. No screen reflections or glare, no ground shadow, no drop shadows, no gradients, no 3D, no texture. Devices are simplified mockups with rounded corners, short feet and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark.
```

> **Bắt buộc đính kèm bộ 3 ảnh màn 1 (`project/smartscreen/assets/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`) làm style reference** cho mọi ảnh nền sáng. **Không tạo lại bộ 3 này** — chúng là chuẩn; ảnh khác phải khớp chúng, không phải ngược lại.

### 7.3 Đoạn prompt phong cách tối (STYLE-DARK)

Thay `[STYLE-DARK]` trong prompt ảnh dùng trên Paywall / Exit Offer:

```
Style: bold flat vector illustration with a hand-drawn feel. Every shape has a thick, uniform white or #BDCCFD outline with rounded ends, on a solid deep navy background #070B1F. Strictly limited palette: navy #070B1F and #0E1638, royal blue #0440FB, light blue #BDCCFD, white, and warm gold #FFC83D only where stated — nothing else. One soft flat circular glow in #0E1638 behind the subject. No photorealism, no gradients other than that single soft glow, no 3D, no texture, no drop shadows. Absolutely no text, no letters, no numbers, no logos, no watermark.
```

**Đính kèm bộ 3 ảnh quiz (chỉ lấy nét vẽ)** — cùng lý do như 7.2.

### 7.4 Negative prompt (nếu công cụ hỗ trợ)

```
yellow, green, orange, red, pink, purple, skin tone, beige, gray outlines, navy outlines, thin lines, hairline strokes, ruler-straight lines, sharp corners, technical diagram, infographic, stock icon style, mostly empty white, sketchy lines, double lines, wobbly lines, rough marker texture, pencil sketch, blob covering the corners, cramped composition, sky blue, cyan, baby blue, 4K, HD, REC, video progress bar, timestamp, subtitles, handwriting, scribbled notes, letters in circles, viewfinder marks, search bar, address bar, URL, browser window, UI labels, captions, buttons with words, glass reflection, glare, shine, ground shadow, drop shadow, gradient, 3D render, photorealistic, texture, tall stand, small subject, cluttered background, multiple focal points, text, letters, numbers, logo, brand logo, Apple logo, Samsung logo, watermark, distorted hands, extra fingers, cropped device
```

> Với ảnh tối (`paywall_pro`, `exit_gift`) **bỏ "yellow"** khỏi NEGATIVE (gold được phép), còn lại giữ nguyên. Riêng `exit_gift` không bỏ "red".

### 7.5 Quy tắc viết prompt (đúc từ vòng lặp KB1)

1. **Bốn khối, không bỏ khối nào:** (1) Cảnh + bố cục · (2) **Coloring** — chi tiết nào tô màu nào, bằng hex · (3) **Lề** (chủ thể 80–90%, lề ≥ 8%) · (4) `[STYLE-LIGHT]` / `[STYLE-DARK]` + tỉ lệ + kích thước.
2. **Không "chừa vùng trống".** Chip / thẻ / nút của app là lớp nổi, tự che phần ảnh bên dưới. Câu kiểu *"keep … as plain background / empty area"* khiến model vẽ **mảng trắng hoặc tấm chữ nhật** (đã xảy ra ở `ob_hero_mirror_tv_web` lần 1 và `ob_hero_trust` lần 1).
3. **Không câu `Message: …`** — model vẽ nguyên câu đó thành chữ trong ảnh.
4. **Chặn đích danh nguồn sinh chữ của từng ảnh** (thanh tiến trình video, nhãn `4K`/`HD`, ô tìm kiếm, thanh địa chỉ, `REC`, timestamp, tên mạng Wi-Fi) — chặn chung "no text" là không đủ.
5. **Liệt kê màu bị cấm bằng tên** ngay trong prompt; thêm *"not sky blue"* cho mọi ảnh có màn hình.
6. **Cảnh cast / mirror: nội dung trên màn nguồn và màn đích giống hệt nhau** (cùng bố cục, chi tiết, màu — chỉ khác kích thước); mỗi ảnh chỉ **một** thiết bị nguồn, không thêm thiết bị phụ không tham gia cast.
7. **Đính kèm bộ 3 ảnh quiz làm style reference**, cùng công cụ, cùng seed nếu có.
8. **Tỉ lệ chỉ được chọn trong 1:1 · 16:9 · 9:16 · 4:3 · 3:4** (bộ chọn tỉ lệ của công cụ). Khung UI khác tỉ lệ (banner paywall 21:9) hiển thị `aspectFill` cắt giữa → chủ thể đặt thành dải ngang ở giữa, nền liền màu nên phần bị cắt chỉ là nền.
9. **Lệch màu nhẹ thì sửa hậu kỳ, không tạo lại** — xoay sắc độ riêng các điểm ảnh sai về hue của màu cho phép (tiền lệ: `ob_hero_photo_video_web` có màn TV xanh `#ADD2FF` → xoay hue 200–220° về 227° = `#BDCCFD`).

### 7.6 Checklist duyệt ảnh (dùng cho mọi ảnh trước khi gắn vào UI)

- [ ] Chỉ các màu cho phép (đo: không còn điểm ảnh vàng/lục/cam/màu da — trừ gold ở ảnh tối, đỏ không có ở đâu cả).
- [ ] Viền **đen tuyền** (trắng ở ảnh tối), dày **~1.2% bề ngang ảnh**, đầu tròn, dáng vẽ tay bo tròn; không nét mảnh, không navy, không thước kẻ góc nhọn.
- [ ] Blob `#E6ECFF` chiếm ~25–45% khung, 4 góc vẫn trắng; chủ thể ~90% rộng × 70–90% cao, lề ≥ 8% (bộ chuẩn: blob 26 / 45 / 46%, cao 71 / 89 / 90%).
- [ ] Nét là **một đường sạch**, không kép, không run kiểu phác thảo.
- [ ] Đặt cạnh bộ 3 ảnh màn 1 ở cỡ hiển thị: đọc thành cùng một họ.
- [ ] Nền đúng màu ở cả 4 góc (`#FFFFFF` sáng / `#070B1F` tối); không bóng đổ, không phản quang, không gradient.
- [ ] Đúng tỉ lệ; chủ thể ~80–90%, lề ≥ 8%.
- [ ] **Không có mảng trắng, tấm chữ nhật hay ô cắt** trên nền — chỉ một blob liền (ảnh sáng) hoặc nền navy liền + một quầng sáng tròn (ảnh tối).
- [ ] Cảnh có nhiều thiết bị: màn nguồn và màn đích **giống hệt nhau**; chỉ một thiết bị nguồn.
- [ ] Thu về cỡ hiển thị thật vẫn đọc được ý chính.
- [ ] Không chữ, số, logo.

## 8. Quy cách xuất ảnh

| Hạng mục | Quy cách |
|---|---|
| Tỉ lệ tạo | Chọn trong **1:1 · 16:9 · 9:16 · 4:3 · 3:4** (bộ chọn của công cụ). Tỉ lệ lấy theo **vị trí đặt trong UI**, không theo sở thích: thẻ carousel / thẻ quiz / ảnh dọc → **3:4** (1536×2048); ảnh ngang tràn viền → **16:9** (2048×1152); huy chương cắt tròn → **1:1** (1024×1024) |
| Xuất cho app | PNG (nền trắng với ảnh sáng, nền navy với ảnh tối), `@2x`/`@3x` theo tỉ lệ của chính ảnh, đặt vào `Assets.xcassets/Onboarding/` |
| Đặt tên | Theo mã ảnh, ví dụ `ob_hero_mirror_tv_web` |
| Vùng an toàn | Chủ thể nằm trong 80% giữa khung để không bị cắt trên máy nhỏ (iPhone SE) |
| Đồng bộ | Tạo cùng seed / cùng công cụ cho toàn bộ bộ ảnh; đính kèm bộ 3 ảnh quiz làm style reference cho mọi ảnh nền sáng |

## 9. Danh mục ảnh hero (tạo một lần, dùng nhiều kịch bản)

| Mã ảnh | Nội dung | KB1 | KB3 |
|---|---|:-:|:-:|
| `ob_hero_mirror_tv_web` | iPhone chiếu lên TV và laptop cùng lúc | M2 slide 1 | M1 |
| `ob_hero_photo_video_web` | Ảnh/video thư viện + tìm ảnh web lên TV | M2 slide 2 | M2 |
| `ob_hero_whiteboard_camera` | Bảng trắng + Live Camera lên TV | M2 slide 3 | M3 |
| `ob_quiz_family` / `ob_quiz_work` / `ob_quiz_creative` | Icon minh hoạ 3 thẻ quiz mục đích | M1 | — |
| `ob_hero_trust` | TV + sao đánh giá + trái tim | M3 | — |
| `ob_hero_permission_network` | iPhone phát sóng Wi-Fi tới TV và laptop, khiên bảo mật | M4 | — |
| `ob_hero_permission_multi` | Khiên bảo mật + 3 biểu tượng mạng / ảnh / camera | — | M5 |
| `ob_hero_tv_found` | TV với dấu tích và sóng xanh | — | M7 |
| `ob_hero_paywall_pro` | Vương miện + TV phát sáng (dark) | M7 | M8 |
| `ob_hero_exit_gift` | Hộp quà mở + vé giảm giá (dark) | Exit | M9 |
| `ob_hero_pro_success` | Vương miện + pháo giấy (sáng) | M8 | — |
| `ob_hero_problem_agitation` | Người nheo mắt nhìn điện thoại vs. thư giãn xem TV lớn | — | Thay thế |
| `ob_hero_tips` | Router + iPhone + TV chung một mạng, nhắc tắt VPN | — | Thay thế |

Tổng cộng **15 ảnh tĩnh**.

Logo hãng TV ở KB3-M4 **không tạo bằng AI** — dùng tên hãng dạng chữ hoặc bộ logo chính thức có quyền sử dụng.

## 10. Những điều cần tránh

- Không đưa con số chưa kiểm chứng vào ảnh hay chữ (số người dùng, số đánh giá, "0 độ trễ", "4K") — dễ bị Apple từ chối theo Guideline 2.3.1 / 5.6. Thay bằng số liệu thật khi có.
- Không vẽ logo Apple, Samsung, LG, Sony… lên thiết bị trong ảnh.
- Không dùng màu cam/đỏ ngoài Exit Offer để giữ ý nghĩa "khẩn cấp" của màu đó.
