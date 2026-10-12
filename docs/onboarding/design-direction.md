# Định hướng thiết kế Onboarding SmartCast

> Áp dụng chung cho cả 3 kịch bản: [KB1](kb1-value-first-hard-paywall.md) · [KB2](kb2-interactive-sandbox-metered-paywall.md) · [KB3](kb3-showcase-social-proof-exit-offer.md).
> Prompt tạo ảnh hero nằm trong từng file kịch bản, mục **"Prompt ảnh hero"**.

## 1. Ý tưởng chủ đạo

**"Bố cục của mẫu illustration tối giản + hình ảnh là sản phẩm thật."**

- Lấy từ mẫu tham khảo: nền sáng nhiều khoảng trắng, nét vẽ tay đen, **một màu nhấn duy nhất**, bố cục hình trên – chữ dưới – nút to dưới cùng.
- Thay đổi so với mẫu: nhân vật hoạt hình không phải trung tâm. **Trung tâm luôn là thiết bị** (iPhone → TV / laptop) với nội dung đang được chiếu, vì giá trị của app là khoảnh khắc "điện thoại hiện lên màn hình lớn". Nét vẽ tay chỉ là chi tiết trang trí xung quanh (sóng Wi-Fi, mũi tên cong, tia sáng).
- **Một phong cách cho cả 3 kịch bản.** A/B test so sánh *luồng*, không so sánh *giao diện*. Mọi kịch bản ghép từ cùng một bộ mẫu màn (mục 5).

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
| **T1 – Carousel** | KB1-M2, KB2-M2/M3, KB3-M1→M3 | Khung mục 4, ảnh hero + tiêu đề + mô tả + chấm trang. Vuốt ngang hoặc bấm nút |
| **T2 – Quiz thẻ chọn** | KB1-M1, KB3-M4 | Tiêu đề ở trên, dưới là thẻ chọn: dạng danh sách (3 thẻ to, icon trái) hoặc lưới 2 cột (hãng TV). Thẻ chọn: nền `#E6ECFF`, viền 2pt `#0440FB`, dấu tích. Chọn xong tự sang màn sau sau 300ms |
| **T3 – Xin quyền** | KB1-M4, KB2-M4, KB3-M5 | Ảnh hero nhỏ hơn (~40%), dưới là 1–3 dòng quyền dạng icon + tên + lý do. Có thể là bottom sheet (KB2) |
| **T4 – Quét / Tiến trình** | KB1-M5, KB2-M5, KB3-M6/M7 | Radar động vẽ bằng code (không dùng ảnh), danh sách thiết bị trượt vào; hoặc thanh % + dòng trạng thái chạy |
| **T5 – Paywall tối** | KB1-M7, KB2-M8, KB3-M8 | Nền dark, ảnh hero nhỏ phía trên, danh sách quyền lợi tích xanh, 2 thẻ gói, nút CTA, dòng pháp lý. Nút [X] chỉ có ở soft paywall (KB3) |
| **T6 – Exit Offer** | KB1 (đóng paywall), KB3-M9 | Popup/full-sheet trên nền dark mờ, ảnh quà tặng, giá gạch ngang + giá mới, đồng hồ đếm ngược đỏ |
| **T7 – Chúc mừng** | KB1-M8, KB2-M9 | Nền sáng, ảnh vương miện + pháo giấy, 1 nút vào app |

Các màn tương tác (sandbox vẽ, playground camera, home có đồng hồ) dùng UI thật của app, chỉ áp màu và chữ theo bộ này.

## 6. Chuyển động

- Ảnh hero carousel nên có bản động ngắn (1.5–2s, lặp): nội dung "bay" từ iPhone sang TV, sóng Wi-Fi lan ra, nét vẽ tự hiện. Làm bằng **Lottie** (ưu tiên, nhẹ) hoặc MP4 không tiếng. Ảnh tĩnh trong file kịch bản là khung hình chính của animation.
- Chuyển màn: trượt ngang 300ms. Thẻ quiz: nảy nhẹ khi chọn. CTA: nhấn co 0.97.
- Radar, thanh tiến trình, đồng hồ đếm ngược: vẽ bằng code.

## 7. Phong cách minh hoạ (dùng cho mọi prompt)

### 7.1 Đặc điểm

- **Nét:** đường viền đen đậm, đều (tương đương 3px ở ảnh 2048px), đầu nét bo tròn, cảm giác vẽ tay nhưng gọn.
- **Màu:** chỉ đen + xanh `#0440FB` + xanh nhạt `#BDCCFD` / `#E6ECFF` + trắng. Không gradient, không bóng đổ, không 3D.
- **Thiết bị:** iPhone viền mỏng không có tai thỏ rõ, TV phẳng chân mảnh, laptop mỏng — **không logo hãng nào**.
- **Nội dung trên màn hình thiết bị:** được tô màu phẳng (ảnh phong cảnh, nét vẽ, khung camera) để người xem hiểu ngay đang chiếu gì.
- **Trang trí:** vòng xoắn nét đơn, mũi tên cong nét đứt, tia sáng 3 vạch, chấm tròn nhỏ, sóng Wi-Fi 3 cung — mỗi ảnh 2–4 chi tiết, không nhiều hơn.
- **Con người:** chỉ xuất hiện một phần (bàn tay cầm điện thoại, nửa người ngồi sofa) theo kiểu nét đơn giản của mẫu; không là trung tâm.
- **Bố cục:** chủ thể nằm giữa, chiếm ~70% khung, một mảng tròn/blob `#E6ECFF` phẳng phía sau làm nền.

### 7.2 Đoạn prompt phong cách chung (STYLE)

Dán đoạn này vào **cuối mọi prompt** ảnh nền sáng:

```
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, curved dashed arrows, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### 7.3 Đoạn prompt phong cách tối (STYLE-DARK)

Dán vào cuối prompt ảnh dùng trên Paywall / Exit Offer:

```
Style: flat vector illustration with clean bold white and light-blue line art, rounded 3px strokes, on a solid deep navy background #070B1F. Accent colors only royal blue #0440FB, glowing light blue #BDCCFD and warm gold #FFC83D. Soft flat circular glow behind the main subject, no photorealism, no 3D, no texture. Centered composition, subject fills about 60% of the frame. A few small hand-drawn sparkles and dots. No text, no letters, no numbers, no logos, no watermark. Square 1:1, 2048x2048.
```

### 7.4 Negative prompt (nếu công cụ hỗ trợ)

```
text, letters, words, numbers, watermark, signature, brand logo, Apple logo, Samsung logo, LG logo, Sony logo, photorealistic, 3D render, gradient, drop shadow, noisy texture, cluttered background, multiple focal points, distorted hands, extra fingers, cropped device
```

## 8. Quy cách xuất ảnh

| Hạng mục | Quy cách |
|---|---|
| Kích thước tạo | 2048×2048 (1:1) |
| Xuất cho app | PNG nền trong suốt hoặc trắng, `@2x` 750×750, `@3x` 1125×1125, đặt vào `Assets.xcassets/Onboarding/` |
| Đặt tên | Theo mã ảnh, ví dụ `ob_hero_mirror_tv_web` |
| Vùng an toàn | Chủ thể nằm trong 80% giữa khung để không bị cắt trên máy nhỏ (iPhone SE) |
| Đồng bộ | Tạo cùng seed / cùng công cụ cho toàn bộ bộ ảnh; nếu công cụ hỗ trợ "style reference", dùng ảnh đầu tiên đạt yêu cầu làm tham chiếu cho các ảnh sau |

## 9. Danh mục ảnh hero (tạo một lần, dùng nhiều kịch bản)

| Mã ảnh | Nội dung | KB1 | KB2 | KB3 |
|---|---|:-:|:-:|:-:|
| `ob_hero_mirror_tv_web` | iPhone chiếu lên TV và laptop cùng lúc | M2 slide 1 | — | M1 |
| `ob_hero_photo_video_web` | Ảnh/video thư viện + tìm ảnh web lên TV | M2 slide 2 | — | M2 |
| `ob_hero_whiteboard_camera` | Bảng trắng + Live Camera lên TV | M2 slide 3 | — | M3 |
| `ob_quiz_family` / `ob_quiz_work` / `ob_quiz_creative` | Icon minh hoạ 3 thẻ quiz mục đích | M1 | — | — |
| `ob_hero_trust` | TV + sao đánh giá + trái tim | M3 | — | — |
| `ob_hero_permission_network` | iPhone phát sóng Wi-Fi tới TV và laptop, khiên bảo mật | M4 | M4 | — |
| `ob_hero_permission_multi` | Khiên bảo mật + 3 biểu tượng mạng / ảnh / camera | — | — | M5 |
| `ob_hero_browser_mirror` | Laptop mở trình duyệt hiển thị màn iPhone, QR | — | M2 | — |
| `ob_hero_camera_websearch` | Camera iPhone quay cảnh + kính lúp tìm ảnh lên TV | — | M3 | — |
| `ob_hero_sandbox_tv` | Khung TV trống để hiển thị nét vẽ của người dùng | — | M1 | — |
| `ob_hero_tv_found` | TV với dấu tích và sóng xanh | — | — | M7 |
| `ob_hero_paywall_pro` | Vương miện + TV phát sáng (dark) | M7 | M8 | M8 |
| `ob_hero_exit_gift` | Hộp quà mở + vé giảm giá (dark) | Exit | — | M9 |
| `ob_hero_pro_success` | Vương miện + pháo giấy (sáng) | M8 | M9 | — |
| `ob_hero_trial_timeline` | 3 icon timeline dùng thử: khoá mở / chuông / vương miện (dark, tuỳ chọn) | — | M8 | — |
| `ob_video_hook` | Video lặp 5s: vẽ trên iPhone, hiện đồng thời trên TV | — | M1 (thay thế) | — |
| `ob_hero_problem_agitation` | Người nheo mắt nhìn điện thoại vs. thư giãn xem TV lớn | — | — | Thay thế |
| `ob_hero_tips` | Router + iPhone + TV chung một mạng, nhắc tắt VPN | — | — | Thay thế |

Tổng cộng **19 ảnh tĩnh + 1 video**. Nếu chỉ chạy luồng chính của cả 3 kịch bản thì cần **16 ảnh tĩnh** (bỏ timeline tuỳ chọn và 2 ảnh của phương án thay thế).

Logo hãng TV ở KB3-M4 **không tạo bằng AI** — dùng tên hãng dạng chữ hoặc bộ logo chính thức có quyền sử dụng.

## 10. Những điều cần tránh

- Không đưa con số chưa kiểm chứng vào ảnh hay chữ (số người dùng, số đánh giá, "0 độ trễ", "4K") — dễ bị Apple từ chối theo Guideline 2.3.1 / 5.6. Thay bằng số liệu thật khi có.
- Không vẽ logo Apple, Samsung, LG, Sony… lên thiết bị trong ảnh.
- Không dùng màu cam/đỏ ngoài Exit Offer để giữ ý nghĩa "khẩn cấp" của màu đó.
