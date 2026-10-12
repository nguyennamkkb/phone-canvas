# Kịch bản 2: Interactive Sandbox + Metered Paywall (Try-Before-You-Buy)

> Đề xuất nâng cấp luồng onboarding SmartCast iOS — một trong 3 kịch bản A/B test.
> Kịch bản khác: [KB1 – Value-First + Hard Paywall](kb1-value-first-hard-paywall.md) · [KB3 – Feature Showcase + Social Proof + Exit Offer](kb3-showcase-social-proof-exit-offer.md)

## Thông số kịch bản

| Tiêu chí | Giá trị |
| :--- | :--- |
| **Mục tiêu chính** | Cho người dùng trải nghiệm thực tế ngay trong 3–5 phút đầu để xóa bỏ hoài nghi kỹ thuật, giảm ma sát tâm lý, xây dựng niềm tin trước khi yêu cầu trả phí [86, 100]. Paywall chỉ xuất hiện khi hết thời gian thử nghiệm |
| **Phù hợp tệp người dùng** | Người dùng nhạy cảm kỹ thuật / Lo ngại ma sát [86] |
| **Mô hình Paywall** | Metered Paywall (giới hạn 3–5 phút miễn phí) [73, 86] |
| **Chỉ số mục tiêu** | Tỷ lệ giữ chân Day 1 & Giảm Churn [62, 84, 86] |
| **Chỉ số RPI dự kiến** | Trung bình – Bền vững |
| **Tỷ lệ giữ chân (D1/D7)** | Rất cao (do xác nhận app chạy tốt) |
| **Cơ chế níu chân** | Khóa tính năng Full HD / Sound / Live Camera |
| **Rủi ro UX** | Người dùng dùng xong rồi thoát [86] |

## Luồng tổng quát

```
1. Sandbox vẽ thử Bảng trắng → 2. Showcase Web Browser Mirroring → 3. Showcase Live Camera & Web Image
→ 4. Cấp quyền Local Network → 5. Quét & kết nối thiết bị → 6. Home trong phiên dùng thử (đếm ngược 04:59)
→ 7. Trải nghiệm thực tế 3–5 phút → 8. Metered Paywall → 9. Kích hoạt PRO thành công
```

---

### Màn hình 1: Interactive Sandbox (Trải Nghiệm Ngay Màn 1)
- **Tiêu đề:** "Thử Vẽ Ngay Lên Bảng Trắng Để Xem Hiệu Ứng"
- **Nội dung thị giác:** Khung Bảng trắng tương tác thu nhỏ ngay giữa màn hình kèm bộ bút màu.
- **Hành động tương tác:** Người dùng di ngón tay vẽ một nét bất kỳ → Nét vẽ xuất hiện mượt mà cùng hiệu ứng phản chiếu lên TV giả lập.
- **Nút CTA:** "Trình chiếu nét vẽ này lên TV thật".

> **Phương án thay thế cho Màn 1 (từ bản v2):**
> - *Instant Hero Video Hook:* Video ngắn 5 giây chạy lặp (Loop) không tiếng, quay cảnh người dùng vẽ trên Bảng trắng và hình ảnh xuất hiện đồng thời trên TV OLED 65 inch. Copy: "Phản chiếu mọi thứ lên màn hình lớn trong 3 giây" / "Mirror Anything to Big Screen in 3 Seconds".
> - *Interactive Sandbox Chooser:* 6 thẻ tính năng dạng lưới 2x3, cho phép chạm vào thử bất kỳ tính năng nào để xem Demo tương tác. Copy: "Chọn tính năng bạn muốn thử ngay:" / "Pick a feature to try live:".

### Màn hình 2: Interactive Showcase 2 (Phản Chiếu Trình Duyệt Web)
- **Tiêu đề:** "Phản Chiếu Lên Mọi Trình Duyệt Web (Không Cần Cài App Trên TV)"
- **Nội dung thị giác:** Minh họa việc mở địa chỉ web trên Laptop/PC/Smart TV và quét mã QR từ điện thoại.
- **Nút CTA:** "Tiếp tục thiết lập".

### Màn hình 3: Interactive Showcase 3 (Live Camera & Web Search Cast)
- **Tiêu đề:** "Phát Trực Tiếp Live Camera & Tìm Ảnh Web Trình Chiếu"
- **Nội dung thị giác:** Minh họa tính năng quét không gian thực qua Camera và công cụ tìm kiếm ảnh tích hợp sẵn để Cast lên TV.
- **Nút CTA:** "Kết nối thiết bị của bạn".

### Màn hình 4: Hướng Dẫn Cấp Quyền Từng Bước (Progressive Permissions)
- **Tiêu đề:** "Cấp Quyền Để Kết Nối Mạng Wi-Fi Của TV" / "Enable Local Network to find nearby TVs"
- **Nội dung thị giác:** Minh họa hai thiết bị truyền sóng Wi-Fi cho nhau. Có thể trình bày dạng bottom sheet nhỏ gọn trượt từ dưới lên với một công tắc Toggle duy nhất.
- **Văn bản giải thích:** "Ứng dụng cần cấp quyền Local Network để tìm kiếm TV hoặc thiết bị Web Receiver trong cùng mạng Wi-Fi."
- **Nút CTA:** "Cấp quyền Mạng cục bộ".

### Màn hình 5: Quét & Kết Nối Thiết Bị Thực Tế
- **Tiêu đề:** "Đang Kết Nối Tới TV Trong Phòng..." / "Tap device to connect free"
- **Nội dung thị giác:** Danh sách thiết bị tự động cập nhật + nút mở mã QR Code để phản chiếu lên Laptop/Browser mà không cần TV:
  - 📺 *LG OLED TV (Living Room)* - [Bấm để kết nối]
  - 💻 *Web Browser Receiver (Chrome/Safari)* - [Bấm để kết nối]
- **Trạng thái:** Báo tín hiệu Wi-Fi 5GHz - Độ trễ cực thấp (<10ms).

### Màn hình 6: Giao Diện Màn Hình Chính Trong Phiên Dùng Thử (Active Trial Session)
- **Tiêu đề:** "Đã Kết Nối! Đang Phản Chiếu Miễn Phí"
- **Nội dung thị giác:** Thanh công cụ đếm ngược ở góc trên màn hình: ⏱️ *"Thời gian trải nghiệm miễn phí còn lại: 04:59"*.
- **Danh sách tính năng sẵn sàng thao tác:**
  - 🖥️ Phản chiếu màn hình
  - ✏️ Bảng trắng
  - 📹 Live Camera
  - 🖼️ Thư viện Ảnh/Video & Tìm ảnh Web

### Màn hình 7: Thao Tác Trải Nghiệm Thực Tế (Live Testing)
- **Copywriting:** "Bạn đang phản chiếu trực tiếp! Hãy thử mở ảnh, vẽ Bảng trắng hoặc bật Live Camera."
- **Nội dung:** Người dùng trực tiếp thử nghiệm phản chiếu Bảng trắng hoặc mở Live Camera phát lên TV trong 3–5 phút.
- **Trải nghiệm:** Tốc độ phản hồi tức thì, mượt mà, xác nhận ứng dụng hoạt động 100% tốt trên hạ tầng Wi-Fi của họ.

### Màn hình 8: Metered Paywall (Xung Đột Trải Nghiệm)
- **Bối cảnh xuất hiện:** Tự động xuất hiện khi hết 5 phút thử nghiệm miễn phí hoặc khi người dùng bật chế độ Full HD / Sound [6, 10, 73].
- **Tiêu đề:** "Bạn Vừa Trải Nghiệm Độ Trễ Cực Thấp Trên TV!" / "Your 5-min free trial was successful! Upgrade to Pro for unlimited access."
- **Nội dung thị giác:** Hình ảnh chụp lại khoảnh khắc kết nối thành công vừa rồi.
- **Thông điệp bán hàng (Soft Commitment Pattern) [14]:**
  - *"Tiếp tục sử dụng không giới hạn thời gian với bản Pro"*
  - *"Dùng thử miễn phí 3 ngày - Không trừ tiền hôm nay - Hủy bất kỳ lúc nào"* / "No Payment Due Now. Cancel anytime."
- **Sơ đồ 3 bước dùng thử $0 (Timeline UI):**
  - *Hôm nay:* $0 (Bắt đầu dùng thử 3 ngày).
  - *Ngày 2:* Nhận thông báo nhắc nhở trước khi tính phí [54].
  - *Ngày 3:* Bắt đầu gói Năm (Hủy bất kỳ lúc nào trên App Store).
- **Cấu trúc gói cước:** Gói Tuần hoặc Gói Năm.
  > ⚠️ Giá trong bản gốc bị mất ký tự (".99/tuần hoặc 4.99/năm"); bản tóm tắt cũ ghi gói Năm $29.99. Cần chốt giá.
- **Nút CTA:** "BẮT ĐẦU DÙNG THỬ 3 NGÀY MIỄN PHÍ".

### Màn hình 9: Màn Hình Kích Hoạt Bản PRO Thành Công (Connected Control Center)
- **Tiêu đề:** "Chúc Mừng! Bạn Đã Là Thành Viên PRO"
- **Nội dung thị giác:** Pháo hoa chúc mừng, biểu tượng Vương miện PRO. Sau đó vào Bảng điều khiển kết nối với các phím tắt điều chỉnh độ phân giải, âm thanh, tắt/bật Live Camera và Bảng trắng.
- **Nút CTA:** "Trở lại màn hình điều khiển & Thưởng thức".

---

## Tuân thủ Apple App Store Guideline 3.1.2 (áp dụng cho Paywall)
1. **Minh bạch giá:** Hiển thị rõ tổng số tiền gói Năm sau khi hết thời gian dùng thử [87, 151].
2. **Yếu tố bắt buộc:** Nút Restore Purchases, Link EULA (Terms of Use) và Privacy Policy xuất hiện rõ ràng trên Paywall [87, 151].

---

## Prompt ảnh hero

> Phong cách, màu, quy cách xuất ảnh: xem [design-direction.md](design-direction.md).
> Mỗi prompt bên dưới đã gồm sẵn phần phong cách — copy nguyên khối đem đi tạo ảnh. Ảnh cùng mã dùng chung giữa các kịch bản, chỉ cần tạo một lần.
> Màn 5 (danh sách thiết bị), Màn 6–7 (Home có đồng hồ, dùng thử thật) dùng UI thật của app — không cần ảnh. Ảnh "khoảnh khắc kết nối" trên Màn 8 là ảnh chụp màn hình thật lấy lúc người dùng đang chiếu, không tạo bằng AI.

### `ob_hero_sandbox_tv` — Màn 1, Sandbox vẽ thử
**Mô tả:** Một chiếc TV phẳng lớn chiếm nửa trên khung, **màn hình TV trống hoàn toàn màu trắng** (app sẽ vẽ nét của người dùng lên vùng này theo thời gian thực). Viền TV đen dày, chân mảnh. Từ dưới đáy khung, một dải sóng xanh cong nét đứt đi lên chạm vào cạnh dưới TV (ngụ ý nét vẽ từ điện thoại bay lên). Hai bên TV có vài tia lấp lánh. Vùng màn hình TV phải là hình chữ nhật 16:9 rõ ràng, phẳng, không vật gì đè lên để dev ghép canvas vào.
```
A large flat-screen TV on a thin stand occupying the upper half of the frame, front view, perfectly straight and not tilted. The TV screen is completely blank pure white, a clean 16:9 rectangle with nothing overlapping it (it will be used as a placeholder for live drawing). From the bottom edge of the frame, one curved royal blue dashed line rises up and touches the bottom of the TV, implying a drawing stroke flying from the phone to the TV. A few small sparkles on both sides of the TV.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the TV. Centered composition, generous white space around. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_video_hook` — Phương án thay thế Màn 1, Hero Video Hook (video 5 giây)
**Mô tả:** Video lặp 5 giây không tiếng, cùng phong cách nét vẽ. Giây 0–1: iPhone nằm ngang ở dưới, TV lớn trống ở trên. Giây 1–3: một bàn tay cầm bút vẽ ngôi nhà đơn giản trên iPhone, nét vẽ xuất hiện **đồng thời** trên TV. Giây 3–4: nét vẽ trên TV được tô màu xanh, tia lấp lánh bật ra. Giây 4–5: mọi thứ mờ dần về khung đầu để lặp mượt. Dùng prompt dưới cho công cụ tạo video (Runway / Kling / Veo…), hoặc giao cho designer làm Lottie.
```
5-second seamless looping animation, no sound. A smartphone lies in landscape orientation at the bottom; a large blank flat-screen TV stands above it. A hand holding a stylus draws a simple house (square, triangle roof, door) on the phone screen with royal blue strokes; the exact same strokes appear simultaneously and in sync on the TV screen. When the drawing is complete, the house on the TV fills with light blue and three small sparkles pop out. Then the drawing gently fades and the scene returns to the first frame for a perfect loop. Smooth, calm, satisfying motion.
Style: flat vector animation, clean hand-drawn black line art with bold uniform rounded strokes, palette of only black, royal blue #0440FB, light blue #BDCCFD and #E6ECFF, and white. Pure white background with a soft flat light-blue blob behind the devices. No gradients, no shadows, no 3D, no camera movement, no text, no logos. Square 1:1.
```

### `ob_hero_browser_mirror` — Màn 2, Phản chiếu trình duyệt web
**Mô tả:** Một laptop mở ở giữa, trên màn hình laptop là cửa sổ trình duyệt đơn giản (thanh địa chỉ chỉ là một vạch ngang, không có chữ, ba chấm tròn góc trái), bên trong cửa sổ hiển thị màn hình iPhone đang được phản chiếu (khung điện thoại dọc với lưới icon ứng dụng màu xanh). Phía trước bên phải là iPhone thật đang hiển thị một mã QR màu đen, có đường quét xanh nối từ QR lên laptop. Nhấn mạnh: không cần cài app trên máy tính.
```
An open thin laptop in the center; on its screen, a simple web browser window (address bar shown only as a plain horizontal bar with no text, three small dots at the top left), and inside the browser window a mirrored vertical phone screen showing a grid of simple royal blue app icons. In the front right, a real smartphone displays a black QR-code-like square pattern, with a royal blue dashed scan line connecting the QR code to the laptop screen. Message: mirror your phone to any web browser, no app install needed.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, curved dashed arrows, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_camera_websearch` — Màn 3, Live Camera & Tìm ảnh web
**Mô tả:** TV phẳng lớn phía sau hiển thị khung hình camera: một chú chó con ngồi trên thảm, góc trên màn TV có chấm tròn xanh "LIVE" (chỉ chấm, không chữ). Phía trước bên trái: iPhone trên tripod mini, ống kính hướng về chú chó thật vẽ nhỏ ở góc dưới. Phía trước bên phải: kính lúp lớn đè lên ba khung ảnh nhỏ xếp chồng (ảnh bãi biển, ảnh hoa, ảnh thành phố — vẽ phẳng), một khung đang bay lên TV theo mũi tên cong.
```
A large flat-screen TV in the background showing a live camera view of a cute puppy sitting on a rug, with a small royal blue recording dot in the top corner of the TV screen. In the front left, a smartphone on a mini tripod points its rear camera at the same small puppy drawn at the bottom of the frame. In the front right, a large magnifying glass over three small stacked flat picture frames (a beach, a flower, a city skyline), and one of the frames flies up toward the TV along a curved dashed arrow. Message: stream your camera live and cast images found on the web.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, curved dashed arrows, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_permission_network` — Màn 4, Cấp quyền Local Network (dùng chung KB1-M4)
**Mô tả:** iPhone đứng ở giữa phía dưới, màn hình là chiếc khiên có ổ khoá, phát ra 3 cung sóng Wi-Fi lớn màu xanh lan lên trên. Đầu sóng là TV (phải) và laptop (trái), mỗi thiết bị có dấu tích tròn xanh ở góc. Phía sau mờ nhạt là đường nét mái nhà gợi ý "mạng trong nhà". Nếu trình bày dạng bottom sheet, ảnh được thu nhỏ còn ~35% chiều cao sheet.
```
A smartphone standing at the bottom center, its screen showing a shield with a padlock. Three large royal blue Wi-Fi arcs radiate upward from the phone. At the ends of the waves: a flat-screen TV on the right and an open laptop on the left, each with a small royal blue round check-mark badge in its corner. Behind everything, a very light simple roof outline in #BDCCFD framing the scene to suggest a home network. Message: a safe connection inside your home Wi-Fi.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the single accent color, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame, generous white space around. Small playful hand-drawn accents: single-line loops, three-stroke sparkles, tiny dots. Devices drawn as clean simplified mockups with thin bezels and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark, no UI labels. Square 1:1, 2048x2048.
```

### `ob_hero_trial_timeline` — Màn 8, minh hoạ cạnh Timeline 3 bước (nền tối, tuỳ chọn)
**Mô tả:** Ba icon tròn nhỏ xếp dọc, nối bằng một đường thẳng nét đứt (app tự vẽ đường và chữ, ảnh này chỉ là 3 icon tách riêng nếu designer muốn dùng ảnh): (1) ổ khoá đang mở màu xanh — "Hôm nay, $0"; (2) chuông thông báo màu vàng — "Ngày 2, nhắc nhở"; (3) vương miện vàng — "Ngày 3, bắt đầu gói". Tạo 3 ảnh riêng, mỗi ảnh một icon.
```
A set of three separate round icon badges on a deep navy background, arranged in a vertical column with equal spacing: (1) an open padlock in royal blue, (2) a notification bell in warm gold with two small ring lines, (3) a golden crown. Each icon sits inside a circle with a thin light-blue outline. Simple, bold, readable at 40pt.
Style: flat vector icons with clean bold white and light-blue line art, rounded 3px strokes, on a solid deep navy background #070B1F. Accent colors only royal blue #0440FB, light blue #BDCCFD and warm gold #FFC83D. No photorealism, no 3D, no texture, no gradients. No text, no letters, no numbers, no logos, no watermark. Portrait 1:3, 1024x3072.
```

### `ob_hero_paywall_pro` — Màn 8, Metered Paywall (nền tối, dùng chung KB1-M7, KB3-M8)
**Mô tả:** Trên nền xanh navy đậm, TV phẳng phát sáng xanh nhẹ, màn hình TV là vương miện vàng lớn. Phía trước là iPhone nhỏ nghiêng có vương miện nhỏ, nối với TV bằng dải sóng xanh phát sáng. Vài tia lấp lánh vàng. Ảnh nằm phần trên paywall (~30% màn).
```
On a deep navy background, a flat-screen TV with a soft blue glow, its screen showing a large golden crown. In front of the TV, a small tilted smartphone whose screen also shows a small golden crown, connected to the TV by a glowing light-blue wave ribbon. A few golden sparkles around. Message: premium, unlocked, powerful.
Style: flat vector illustration with clean bold white and light-blue line art, rounded 3px strokes, on a solid deep navy background #070B1F. Accent colors only royal blue #0440FB, glowing light blue #BDCCFD and warm gold #FFC83D. Soft flat circular glow behind the main subject, no photorealism, no 3D, no texture. Centered composition, subject fills about 60% of the frame. A few small hand-drawn sparkles and dots. No text, no letters, no numbers, no logos, no watermark. Square 1:1, 2048x2048.
```

### `ob_hero_pro_success` — Màn 9, Kích hoạt PRO thành công (dùng chung KB1-M8)
**Mô tả:** Nền trắng, vương miện vàng lớn ở giữa với dấu tích xanh tròn đè góc phải dưới. Pháo giấy xanh, vàng bay tung. Một nửa người đơn giản giơ hai tay ăn mừng ở dưới bên trái.
```
A large golden crown in the center with a round royal blue check-mark badge overlapping its bottom-right corner. Blue and gold confetti bursting around it. At the bottom left, a simple half-body cartoon person drawn in friendly minimal line art raising both arms in celebration. Message: welcome, everything is unlocked.
Style: flat vector illustration, clean hand-drawn black line art with bold uniform 3px rounded strokes, minimal and friendly, limited color palette of only black outlines, royal blue #0440FB as the main accent color, warm gold #FFC83D for the crown only, light blue tints #BDCCFD and #E6ECFF, and white. No gradients, no drop shadows, no 3D, no texture. Pure white background #FFFFFF with one soft flat light-blue #E6ECFF rounded blob behind the main subject. Centered composition, subject fills about 70% of the frame. Absolutely no text, no letters, no numbers, no logos, no watermark. Square 1:1, 2048x2048.
```
