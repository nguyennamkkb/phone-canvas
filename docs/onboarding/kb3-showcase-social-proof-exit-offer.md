# Kịch bản 3: All-in-One Feature Showcase + Social Proof + Soft Paywall + Exit Offer (9 màn hình)

> Đề xuất nâng cấp luồng onboarding SmartCast iOS — một trong 3 kịch bản A/B test.
> Kịch bản khác: [KB1 – Value-First + Hard Paywall](kb1-value-first-hard-paywall.md) · [KB2 – Interactive Sandbox + Metered Paywall](kb2-interactive-sandbox-metered-paywall.md)

## Thông số kịch bản

| Tiêu chí | Giá trị |
| :--- | :--- |
| **Mục tiêu chính** | Phô diễn trọn bộ 6 tính năng cao cấp, xây dựng niềm tin nhờ Bằng chứng xã hội (Social Proof Engine), tối ưu chuyển đổi cho tệp người dùng từ quảng cáo [5, 12, 83, 92] |
| **Phù hợp tệp người dùng** | Người dùng từ Quảng cáo (Paid UA / Facebook / TikTok Ads) / Traffic khám phá [73, 83, 92] |
| **Mô hình Paywall** | Soft Paywall (có nút [X]) + Social Proof Engine + Exit Offer [5, 73, 92] |
| **Chỉ số mục tiêu** | Tỷ lệ chuyển đổi phễu (Conversion Rate) [92, 107] |
| **Chỉ số RPI dự kiến** | Trung bình – Khai thác tệp giá rẻ |
| **Tỷ lệ giữ chân (D1/D7)** | Cao |
| **Cơ chế níu chân** | Pop-up Exit Offer khi đóng Paywall [79] |
| **Rủi ro UX** | Phản cảm nếu discount quá ảo [92] |

## Luồng tổng quát

```
1–3. Hero Carousel (3 trang) → 4. Chọn thương hiệu TV → 5. Giải thích & cấp quyền
→ 6. Tiến trình hiệu chỉnh kỹ thuật → 7. Tìm thấy TV → 8. Social Proof Soft Paywall
→ (bấm [X]) 9. Pop-up Exit Offer
```

---

### Màn hình 1: Hero Carousel 1 (Phản Chiếu TV & Web Browser)
- **Tiêu đề:** "Phản Chiếu Màn Hình TV & Trình Duyệt Web Không Độ Trễ"
- **Nội dung thị giác:** Slider ảnh động trình diễn truyền hình ảnh từ iPhone lên Smart TV và Trình duyệt Web Laptop cùng lúc.
- **Nút CTA:** "Khám phá tiếp" (Chỉ báo trang: ● ○ ○ ○).

### Màn hình 2: Hero Carousel 2 (Phát Ảnh/Video Thư Viện & Tìm Ảnh Web)
- **Tiêu đề:** "Phát Ảnh/Video 4K Thư Viện & Tìm Ảnh Web Truyền Lên TV"
- **Nội dung thị giác:** Trình diễn giao diện chọn video gia đình 4K và công cụ tìm kiếm ảnh chất lượng cao phát trực tiếp lên màn hình lớn.
- **Nút CTA:** "Tiếp tục" (Chỉ báo trang: ○ ● ○ ○).

### Màn hình 3: Hero Carousel 3 (Bảng Trắng & Live Camera HD)
- **Tiêu đề:** "Bảng Trắng Giảng Dạy & Live Camera Trực Tiếp"
- **Nội dung thị giác:** Hình ảnh giáo viên/diễn giả đang vẽ sơ đồ trên Bảng trắng điện thoại và góc quay Live Camera phát song song lên TV.
- **Nút CTA:** "Tiếp tục" (Chỉ báo trang: ○ ○ ● ○).

### Màn hình 4: Cá Nhân Hóa Thương Hiệu TV (Device Matching)
- **Tiêu đề:** "Bạn Đang Sử Dụng Thương Hiệu TV Nào?" / "Which TV or PC brand do you own?"
- **Nội dung thị giác:** Lưới biểu tượng các hãng TV: Samsung, LG, Sony, TCL, Roku, Xiaomi, Chromecast, TV Khác.
- **Tác dụng UX:** Giúp hệ thống tối ưu hóa thuật toán quét mã Wi-Fi riêng cho thương hiệu đó.

### Màn hình 5: Hướng Dẫn Cấp Quyền Bối Cảnh & An Toàn Dữ Liệu
- **Tiêu đề:** "Cấp Quyền Hệ Thống Để Khởi Tạo Kết Nối"
- **Nội dung thị giác:** Đồ họa biểu tượng quyền hệ thống kèm nhãn Cam kết bảo mật:
  - 🌐 *Mạng cục bộ:* Tìm TV trong Wi-Fi.
  - 🖼️ *Thư viện ảnh:* Chọn video/ảnh để phát.
  - 📹 *Camera:* Chiếu ống kính trực tiếp.
- **Cam kết:** "Dữ liệu của bạn được xử lý 100% nội bộ trên thiết bị, không tải lên server." [333]
- **Nút CTA:** "Đồng ý & Cấp quyền".

### Màn hình 6: Tiến Trình Hiệu Chỉnh Kỹ Thuật (Smart Auto-Optimization)
- **Tiêu đề:** "Đang Tối Ưu Hóa Độ Trễ Kết Nối Cho TV Của Bạn..." / "Calibrating latency for your device..."
- **Nội dung thị giác:** Thanh tiến trình phần trăm (0% → 100%) chạy khoảng 3 giây, hiệu ứng đồ họa sóng âm, kèm các dòng trạng thái kỹ thuật chạy liên tục:
  - *"Đang kiểm tra băng thông Wi-Fi..."*
  - *"Đang tối ưu chuẩn nén video 4K..."*
  - *"Đang kích hoạt bộ lọc giảm độ trễ 0.1ms..."* [258]

### Màn hình 7: Quét Tìm TV & Báo Kết Nối Sẵn Sàng
- **Tiêu đề:** "Đã Tìm Thấy TV! Sẵn Sàng Trình Chiếu"
- **Nội dung thị giác:** Thẻ TV tìm thấy hiển thị nổi bật kèm biểu tượng sóng xanh mạnh mẽ (hiển thị cả TV và Browser tìm thấy).
- **Nút CTA:** "Tiếp tục đến màn hình Pro".

### Màn hình 8: Social Proof Soft Paywall (Tối Ưu Chuyển Đổi)
- **Tiêu đề:** "Tham Gia Cùng 5 Triệu Người Dùng SmartCast Pro" / "Join 5 Million SmartCast Users Today" [12, 13]
- **Nội dung thị giác (Social Proof Engine) [5, 12, 13]:**
  - Điểm đánh giá: **4.8 ★★★★★** (140,000+ Đánh giá trên App Store).
  - Trích dẫn nhận xét người dùng thực tế: *"Ứng dụng phản chiếu mượt nhất tôi từng dùng. Bảng trắng và Live Camera cực kỳ tiện cho việc dạy học!" - Minh Tuấn (App Store Review)*.
- **Thiết kế Paywall:** Cho phép người dùng bấm nút đóng [X] ở góc trên bên trái (Soft Paywall) [53, 73, 87].
- **Cấu trúc gói:**
  - Gói Năm (Dùng thử 3 ngày miễn phí).
  - Gói Tháng.
  > ⚠️ Giá trong bản gốc bị mất ký tự ("9.99/năm", ".99/tháng"). Cần chốt giá.
- **Nút CTA:** "BẮT ĐẦU DÙNG THỬ 3 NGÀY MIỄN PHÍ".

### Màn hình 9: Pop-Up Exit Offer (Kịch Bản Níu Chân Khách Nhạy Cảm Giá)
- **Bối cảnh xuất hiện:** Kích hoạt lập tức nếu người dùng chạm vào nút đóng [X] ở Màn hình 8 [17, 79, 92].
- **Giao diện:** Pop-up màu đỏ/cam nổi bật.
- **Tiêu đề:** "Nhận Ngay Ưu Đãi Giảm Giá 40% Cho Lần Đăng Ký Đầu Tiên"
- **Chiết khấu:** Gói Năm giảm 40%.
  > ⚠️ Giá trong bản gốc bị mất ký tự ("7.99/năm thay vì 9.99/năm"). Cần chốt giá.
- **Yếu tố thúc đẩy (Urgency):** Đồng hồ đếm ngược 03:00 phút.
- **Nút CTA:** "Áp Dụng Mã Giảm Giá & Dùng Thử" | Nút nhỏ: "Tôi chấp nhận bỏ lỡ ưu đãi".

---

## Phương án thay thế: Quiz Funnel + Exit Discount 50% (từ bản v2)

Biến thể của cùng kịch bản, thay carousel bằng phễu quiz và dùng mức giảm sâu hơn. Các điểm khác so với luồng chính:

| Vị trí | Thay đổi |
| :--- | :--- |
| Màn 1–3 | Thay carousel bằng **Problem-Agitation Intro**: biểu đồ so sánh màn hình điện thoại 6 inch nhỏ hẹp, mỏi mắt với TV/Monitor 65 inch sống động. Copy: "Thưởng thức nội dung trên màn hình lớn gấp 10 lần" / "Enjoy Your Content 10x Larger" |
| Sau Màn 4 | Thêm **Multi-Step Quiz – Primary Features**: danh sách tích chọn đa nhiệm (Phim/Thư viện, Trình duyệt Web, Bảng trắng, Live Camera). Copy: "Tính năng nào quan trọng nhất với bạn?" / "Which features matter most to you?" |
| Màn 5 + 7 | Gộp thành **Permission & Instant Scan**: gọi quyền Mạng cục bộ và lập tức hiển thị TV/Browser tìm thấy |
| Màn 9 | Exit Offer **"ĐỢI ĐÃ! ƯU ĐÃI ĐẶC BIỆT CHỈ XUẤT HIỆN 1 LẦN"** / "WAIT! ONE-TIME SPECIAL OFFER": **GIẢM GIÁ 50% GÓI NĂM** – chỉ còn **$14.99/năm** (thay vì $29.99/năm), đếm ngược 05:00 phút. CTA: "NHẬN GIẢM GIÁ 50% NGAY" / "CLAIM 50% OFF NOW" |
| Thêm sau Màn 9 | **Discount Activation Confirmation**: xác nhận đã áp dụng giảm giá 50% thành công, nút FaceID hoàn tất giao dịch |
| Màn cuối | **Quick Onboarding Tip & Start**: 3 mẹo ngắn (đảm bảo chung Wi-Fi 5GHz, tắt VPN khi kết nối…). Nút "Vào ứng dụng" / "Enter App" |

---

## Tuân thủ Apple App Store Guideline 3.1.2 (áp dụng cho Paywall & Exit Offer)
1. **Minh bạch giá:** Hiển thị rõ tổng số tiền gói Năm (giá gốc và giá sau giảm) [87, 151].
2. **Yếu tố bắt buộc:** Nút Restore Purchases, Link EULA (Terms of Use) và Privacy Policy xuất hiện rõ ràng trên Paywall và Pop-up Exit Offer [87, 151].

---

## Prompt ảnh hero

> Phong cách, màu, quy cách xuất ảnh: xem [design-direction.md](design-direction.md).
> Mỗi prompt bên dưới đã gồm sẵn phần phong cách — copy nguyên khối đem đi tạo ảnh. Ảnh cùng mã dùng chung giữa các kịch bản, chỉ cần tạo một lần.
> Màn 4 (chọn hãng TV): **không tạo logo hãng bằng AI** — dùng tên hãng dạng chữ trên thẻ, hoặc bộ logo chính thức có quyền sử dụng. Màn 6 (thanh % hiệu chỉnh) vẽ bằng code.

### `ob_hero_mirror_tv_web` — Màn 1, Carousel 1 (dùng chung KB1-M2 slide 1)
**Mô tả:** Bàn tay cầm iPhone ở giữa, màn hình điện thoại là ảnh phong cảnh (núi, mặt trời) màu xanh. Hai mũi tên cong nét đứt bay ra: một lên TV phẳng lớn phía sau bên phải, một sang laptop mở phía trái. TV và laptop hiển thị **đúng** bức ảnh đó. Vài cung sóng Wi-Fi quanh điện thoại.
```
A hand holding a smartphone in the center foreground; the phone screen shows a simple landscape picture (mountains and a sun) filled in royal blue and light blue. Two curved dashed arrows fly out from the phone: one to a large flat-screen TV on a thin stand at the back right, one to an open thin laptop at the back left. Both the TV and the laptop display exactly the same landscape picture as the phone, larger. Three small Wi-Fi arcs radiate from the phone. Message: one phone mirroring to every screen at once.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, curved dashed arrows, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_photo_video_web` — Màn 2, Carousel 2 (dùng chung KB1-M2 slide 2)
**Mô tả:** TV lớn ở giữa đang phát video (nút play tam giác xanh giữa hình). Trước bên trái là iPhone với lưới ảnh 3×3, một ô bay ra hướng về TV. Trên bên phải là kính lúp lớn với vài khung ảnh nhỏ lơ lửng (tìm ảnh web).
```
A large flat-screen TV in the center playing a video, with a big royal blue triangular play button in the middle of the picture. In the front left, a smartphone shows a 3x3 photo gallery grid of colorful flat thumbnails, and one thumbnail is flying out of the grid toward the TV along a curved dashed arrow. In the upper right, a large magnifying glass with a few small floating picture frames around it, representing web image search. Message: your photos, videos and web images all go to the TV.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, curved dashed arrows, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_whiteboard_camera` — Màn 3, Carousel 3 (dùng chung KB1-M2 slide 3)
**Mô tả:** TV lớn phía sau chia đôi màn hình. Trước bên trái: bàn tay cầm bút vẽ sơ đồ (ba hình tròn nối mũi tên) lên iPhone nằm ngang. Trước bên phải: iPhone trên tripod mini, camera hướng ra ngoài, chấm xanh "đang quay". Nửa trái TV hiện đúng sơ đồ, nửa phải hiện khung camera (chậu cây trên bàn).
```
A large flat-screen TV in the background with a split-screen picture. In front left, a hand holding a stylus draws a simple diagram (three circles connected by arrows) on a smartphone lying in landscape orientation. In front right, a smartphone on a mini tripod with its rear camera facing outward and a small royal blue recording dot. The TV's left half shows the exact same hand-drawn diagram, the right half shows the live camera view of a potted plant on a desk. Message: draw or film on the phone, see it live on the TV.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, curved dashed arrows, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_permission_multi` — Màn 5, Cấp quyền & An toàn dữ liệu
**Mô tả:** Một chiếc khiên lớn màu xanh ở giữa, trên khiên là ổ khoá trắng và dấu tích. Quanh khiên xếp hình vòng cung 3 bong bóng tròn, mỗi bong bóng một biểu tượng quyền: (trái) sóng Wi-Fi — Mạng cục bộ; (trên) khung ảnh có núi — Thư viện ảnh; (phải) máy quay — Camera. Mỗi bong bóng nối với khiên bằng một đường nét đứt ngắn. Phía dưới khiên là một iPhone nhỏ. Thông điệp: dữ liệu ở lại trên máy, an toàn.
```
A large royal blue shield in the center with a white padlock and a check mark on it. Arranged in an arc around the shield, three round bubbles each containing one permission symbol: on the left a Wi-Fi symbol (local network), on top a picture frame with a mountain (photo library), on the right a video camera (camera). Each bubble is connected to the shield by a short dashed line. A small smartphone sits beneath the shield. Message: your data stays safely on your device.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_tv_found` — Màn 7, Đã tìm thấy TV
**Mô tả:** TV phẳng lớn ở giữa, màn hình TV màu xanh nhạt có dấu tích tròn lớn màu xanh đậm ở chính giữa. Phía trên TV là 3 cung sóng Wi-Fi đậm, đầy đủ (tín hiệu mạnh). Phía dưới trước TV là iPhone nhỏ nghiêng, màn hình có cùng dấu tích nhỏ, nối với TV bằng một đường nét liền (đã kết nối, không còn nét đứt). Vài tia lấp lánh hai bên.
```
A large flat-screen TV in the center; its screen is filled with light blue #E6ECFF and shows a big round royal blue check mark in the middle. Above the TV, three bold, fully filled Wi-Fi arcs indicating a strong signal. In front of the TV at the bottom, a small tilted smartphone whose screen shows the same small check mark, connected to the TV by a solid (not dashed) royal blue line indicating a successful connection. A few sparkles on both sides. Message: TV found, ready to cast.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_paywall_pro` — Màn 8, Social Proof Soft Paywall (nền tối, dùng chung KB1-M7, KB2-M8)
**Mô tả:** Nền navy đậm, TV phẳng phát sáng xanh nhẹ với vương miện vàng lớn trên màn hình. Trước TV là iPhone nhỏ nghiêng có vương miện nhỏ, nối với TV bằng dải sóng xanh phát sáng. Vài tia lấp lánh vàng. Ở paywall này ảnh nhỏ hơn (~25% màn) để chừa chỗ cho khối 4.8★ và trích dẫn đánh giá — các phần đó do app render.
```
On a deep navy background, a flat-screen TV with a soft blue glow, its screen showing a large golden crown. In front of the TV, a small tilted smartphone whose screen also shows a small golden crown, connected to the TV by a glowing light-blue wave ribbon. A few golden sparkles around. Message: premium, unlocked, powerful.
Style: flat vector illustration with clean bold white and light-blue line art, rounded 3px strokes, on a solid deep navy background #070B1F. Accent colors only royal blue #0440FB, glowing light blue #BDCCFD and warm gold #FFC83D. Soft flat circular glow behind the main subject, no photorealism, no 3D, no texture. Centered composition, subject fills about 60% of the frame. A few small hand-drawn sparkles and dots. No text, no letters, no numbers, no logos, no watermark. Square 1:1, 2048x2048.
```

### `ob_hero_exit_gift` — Màn 9, Pop-up Exit Offer (nền tối, dùng chung KB1 Exit)
**Mô tả:** Nền navy đậm, hộp quà bật nắp, bay ra một tấm vé giảm giá (chữ nhật răng cưa hai đầu, ký hiệu % lớn màu đỏ-cam) cùng pháo giấy vàng và xanh. Mức "40%"/"50%", giá gạch ngang và đồng hồ đếm ngược do app render.
```
On a deep navy background, an open gift box with its lid popping off; out of it flies a discount ticket (a rectangle with notched edges) printed with a large percent symbol in bright red-orange #FF4D3A, surrounded by gold and light-blue confetti. Message: a one-time special offer.
Style: flat vector illustration with clean bold white and light-blue line art, rounded 3px strokes, on a solid deep navy background #070B1F. Accent colors only royal blue #0440FB, glowing light blue #BDCCFD, warm gold #FFC83D, and red-orange #FF4D3A used only on the ticket. Soft flat circular glow behind the main subject, no photorealism, no 3D, no texture. Centered composition, subject fills about 60% of the frame. No text, no letters, no numbers except the single percent symbol, no logos, no watermark. Square 1:1, 2048x2048.
```

### Ảnh cho Phương án thay thế (Quiz Funnel)

#### `ob_hero_problem_agitation` — Problem-Agitation Intro
**Mô tả:** So sánh hai bên. Bên trái nhỏ: một người vẽ nét đơn giản nheo mắt, cúi sát nhìn chiếc iPhone bé xíu (vẻ mỏi mắt, có vài vạch nhỏ quanh mắt). Bên phải lớn hơn hẳn: cùng người đó ngồi thư giãn trên sofa, mỉm cười xem TV lớn đang chiếu cùng nội dung (ảnh phong cảnh xanh). Giữa hai bên là mũi tên cong lớn màu xanh từ trái sang phải. Tỉ lệ kích thước hai bên thể hiện rõ "màn hình lớn gấp 10 lần".
```
A side-by-side comparison. Left side, small: a simple line-art person squinting and leaning close to a tiny smartphone, with small strain lines near the eyes. Right side, much larger: the same person relaxing on a sofa, smiling while watching a big flat-screen TV that shows the same landscape picture (mountains and sun) in royal blue. A large curved royal blue arrow points from left to right between the two scenes. The size difference clearly conveys a much bigger screen.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the right scene. Generous white space. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark. Square 1:1, 2048x2048.
```

#### `ob_hero_tips` — Quick Onboarding Tip & Start
**Mô tả:** Một router Wi-Fi có hai ăng-ten ở giữa phát sóng xanh, bên trái là iPhone, bên phải là TV, cả hai cùng nằm trong vùng sóng (một vòng tròn nét đứt bao quanh cả ba thiết bị — "chung một mạng"). Góc dưới là một biểu tượng khiên VPN bị gạch chéo nhẹ (nhắc tắt VPN). Ảnh nhỏ, đặt trên danh sách 3 mẹo.
```
A Wi-Fi router with two antennas in the center emitting royal blue waves; a smartphone on the left and a flat-screen TV on the right, both inside one large dashed circle that surrounds all three devices, meaning they are on the same network. In the bottom corner, a small shield icon with a gentle diagonal strike-through line, as a reminder to turn off VPN.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, generous white space. Devices drawn as clean simplified mockups with no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark. Square 1:1, 2048x2048.
```
