# Kịch bản 1: Value-First Progressive Onboarding + Hard Paywall (8 bước)

> Đề xuất nâng cấp luồng onboarding SmartCast iOS — một trong 3 kịch bản A/B test.
> Kịch bản khác: [KB2 – Interactive Sandbox + Metered Paywall](kb2-interactive-sandbox-metered-paywall.md) · [KB3 – Feature Showcase + Social Proof + Exit Offer](kb3-showcase-social-proof-exit-offer.md)
>
> **Bản thiết kế hiện hành (2026-10-12):** UI dựng trên phone-canvas, `project/smartscreen/screens/kb1-*.html`. File này mô tả đúng bản đó; mục cuối là prompt tạo ảnh theo **đúng tỉ lệ và vị trí đặt** trong UI.

## Thông số kịch bản

| Tiêu chí | Giá trị |
| :--- | :--- |
| **Mục tiêu chính** | Tối ưu hóa RPI và chuyển đổi trả phí ngay phiên đầu tiên thông qua phễu cá nhân hóa và Hard Paywall bối cảnh hóa |
| **Phù hợp tệp người dùng** | Tìm kiếm tự nhiên (Organic Search / ASO) [106] |
| **Mô hình Paywall** | Hard Paywall + Free Trial + Anchor & Decoy [5, 73, 86] |
| **Chỉ số mục tiêu** | Doanh thu RPI cao nhất (~$3.09 / install) [73, 86] |
| **Tỷ lệ giữ chân (D1/D7)** | Trung bình |
| **Cơ chế níu chân** | Pop-up Exit Discount 50% [79] |
| **Rủi ro UX** | Ma sát cao nếu Wi-Fi yếu [87] |

## Luồng tổng quát

```
1. Intent Quiz → 2. Hero Carousel (3 slide) → 3. Social Proof → 4. Giải thích quyền
→ 5. Quét thiết bị & Web URL → 6. Aha Moment: Cast một ảnh (6a chọn ảnh → 6b đang cast)
→ 7. Hard Paywall ──[X hiện trễ]──→ 7b. Exit Offer 50% → 8. Welcome Dashboard
```

| Bước | File (`project/smartscreen/screens/`) | Ảnh dùng |
|---|---|---|
| 1 | `kb1-m1-quiz` | `ob_quiz_family` · `ob_quiz_work` · `ob_quiz_creative` |
| 2 | `kb1-m2-mirror` · `kb1-m2-media` · `kb1-m2-whiteboard` | `ob_hero_mirror_tv_web` · `ob_hero_photo_video_web` · `ob_hero_whiteboard_camera` |
| 3 | `kb1-m3-trust` | `ob_hero_trust` |
| 4 | `kb1-m4-permission` | `ob_hero_permission_network` |
| 5 | `kb1-m5-discovery` | — (radar vẽ bằng code) |
| 6 | `kb1-m6-playground` · `kb1-m6-casting` | — (TV vẽ bằng code + ảnh thật người dùng chọn) |
| 7 | `kb1-m7-paywall` · `kb1-m7-exit-offer` | `ob_hero_paywall_pro` · `ob_hero_exit_gift` |
| 8 | `kb1-m8-welcome` | `ob_hero_pro_success` |

## Ngôn ngữ thiết kế chung

- **Tiêu đề editorial:** 30pt ExtraBold, căn trái, nhấn **một** từ bằng màu accent `#0440FB` (khu Pro dùng `#BDCCFD`).
- **Tiến trình 8 đoạn** 4pt ở đỉnh màn sáng (thay nút Skip). CTA viên thuốc 56pt có mũi tên, luôn dính đáy.
- **Ảnh là sân khấu, UI nổi trên ảnh:** chip trắng bo tròn (`ob-float`) do app render đè lên ảnh và **tự che** phần ảnh bên dưới — ảnh không cần chừa vùng trống (xem mục Prompt). Không đặt chữ trong ảnh.
- **Mỗi màn một bố cục:** thẻ chọn, carousel có peek, tạp chí, chip vắt mép, radar, TV, banner, vé, huy chương — không lặp một khung.
- Màu chỉ lấy từ [design-direction §2](design-direction.md). Đỏ `#FF4D3A` chỉ ở Exit Offer; gold chỉ ở khu Pro (nhãn Best Value, vương miện, pháo giấy màn 8).

---

### Màn hình 1: Intent Quiz (Phân Loại Mục Đích Sử Dụng)
* **Mục tiêu:** Tạo trải nghiệm cá nhân hóa ngay từ giây đầu tiên, nâng cao chỉ số Psych Score [9, 110].
* **Giao diện:** Nền sáng. Tiêu đề căn trái, bên dưới là 3 thẻ chọn lớn: ảnh minh hoạ **dọc 3:4** bên trái (96×128pt), tên + mô tả, vòng chọn bên phải. Thẻ được chọn: nền `#E6ECFF`, viền 2pt `#0440FB`, dấu tích.
  * **Option A:** *Family Entertainment* — Watch 4K movies, relive photo & video albums.
  * **Option B:** *Work & Study* — Whiteboard presentations, mirror to laptop or browser.
  * **Option C:** *Create & Monitor* — Live Camera to TV, find web images & cast.
* **Copywriting:** *Tiêu đề:* "How will you use **SmartCast**?" · *Phụ đề:* "We will customize your experience"
* **Hành động:** Chạm 1 thẻ → thẻ nảy nhẹ → lưu Intent Segment → tự sang Màn 2 sau 300ms.

---

### Màn hình 2: Hero Carousel (3 slide)
* **Mục tiêu:** Giới thiệu trọn bộ giá trị "All-in-One" trước khi xin quyền hay thanh toán [110, 128].
* **Giao diện:** Thẻ ảnh **dọc 3:4** chiếm ~82% chiều ngang, **lộ mép thẻ kế tiếp** (peek) để gợi ý vuốt; slide cuối lộ mép thẻ trước. Trên mỗi ảnh có 2 chip UI nổi. Chấm trang căn trái, CTA "Continue →".

| Slide | Tiêu đề (nhấn) | Chip trên ảnh |
|---|---|---|
| 1 | Mirror to **Any TV** & Web Browser | trên-phải: `Browser` · dưới-trái: `● Mirroring to Samsung TV` |
| 2 | Cast **Photos**, 4K Videos & Web Images | trên-phải: `Web images` · dưới-trái: `▶ Playing on TV` |
| 3 | Interactive **Whiteboard** & Live Camera | trên-trái: `Whiteboard` · dưới-trái: `● Live Camera` |

* **Mô tả (copy tạm, cần duyệt):** (1) "Cast your iPhone screen to a smart TV or any web browser, no extra app needed." (2) "Play your library on the big screen, or search the web and send images to the TV." (3) "Draw and present on the TV, or stream your iPhone camera live."
* **Hành động:** Tự trượt 4s, vuốt ngang, hoặc bấm Continue.

---

### Màn hình 3: Social Proof & Trust Building
* **Mục tiêu:** Xóa tan nghi ngờ về tính ổn định của kết nối không dây [53, 193].
* **Giao diện:** Ảnh **ngang 16:10** tràn chiều ngang, thẻ điểm trắng "**4.8** ★★★★★ App Store rating" vắt qua mép dưới-trái ảnh. Tiêu đề, rồi **dải wordmark** hãng TV (Samsung · LG · Sony · Roku · Chromecast · Fire TV) tràn mép phải như marquee. Review hiển thị dạng **chồng thẻ** (hai dải phía sau = các review kế tiếp, vuốt để lật).
* **Copywriting:** *Tiêu đề:* "Trusted by **5M+** Happy Users Globally" · *Trích dẫn:* "Connecting to my Samsung TV is so smooth, and the whiteboard is perfect for teaching!" — *Minh Anh · App Store review*
* **Hành động:** "Start Connecting →".
* ⚠️ 4.8 / 5M+ / tên người review là hằng số / remote config, **chưa kiểm chứng** (Guideline 2.3.1 / 5.6).

---

### Màn hình 4: Contextual Permission Guidance
* **Mục tiêu:** Giải thích lý do trước khi gọi System Popup [84, 112].
* **Giao diện:** Tiêu đề trên cùng; ảnh **dọc 3:4** (72% chiều ngang) ở giữa với 2 chip quyền **vắt ra ngoài mép ảnh**: `Local Network` (mép trái, phía trên) và `Photos` (mép phải, phía dưới) — cấp xong chip đổi sang dấu tích. Dưới ảnh: đoạn lý do + khối "🔒 Your data stays private on your device."
* **Copywriting:** *Tiêu đề:* "Secure **Local Network** Connection" · *Nội dung:* "SmartCast needs **Local Network** to find TVs around you and **Photos** to cast your videos and pictures."
* **Hành động:** "Allow & Scan for TVs →" → System Dialog Local Network, rồi Photos.

---

### Màn hình 5: Device & Browser Discovery
* **Mục tiêu:** Cảm giác công nghệ hiện đại, chuẩn bị Value Moment [84, 101].
* **Giao diện (vẽ bằng code, không ảnh):** Radar lớn (vòng nét đứt + 2 vòng tô + lõi Wi-Fi), sóng lan bằng animation. Thiết bị tìm thấy **bật ra thành chip chạm được trên các vòng**: `Samsung QLED 7 Series ✓` (đã kết nối, chip đen), `LG TV`, `MacBook`. Dưới radar: thẻ "Mirror to Web Browser · web.smartcast.app" kèm QR. Dòng trợ giúp: "Don't see your TV? Join the same Wi-Fi network".
* **Copywriting:** *Tiêu đề:* "Devices **Ready** to Connect" · *Phụ đề:* "Choose your TV or open the URL on your computer to mirror"
* **Hành động:** Chạm chip TV hoặc thẻ web → Màn 6.

---

### Màn hình 6: Aha Moment — Cast một ảnh (2 trạng thái)
* **Mục tiêu:** Người dùng **tự tay cast một ảnh thật** lên TV đã kết nối trong vài giây — chứng minh app hoạt động trước Paywall [64, 102]. (Thay cho playground vẽ/camera của bản cũ: cast ảnh gần giá trị cốt lõi nhất, và quyền Photos đã có từ Màn 4.)
* **6a — Chọn ảnh (`kb1-m6-playground`):** TV vẽ bằng code (viền đen 16:9 + chân đế) hiện "Waiting for your photo…", chip `● Connected · Samsung QLED 7 Series` vắt mép trên TV. Ô nét đứt "Tap to choose a photo · From your Photos library". CTA "Choose a Photo →" + "Not now".
  * Chạm ô hoặc CTA → mở **sheet Photos mặc định của iOS** (PhotosPicker — UI hệ thống, không thiết kế).
* **6b — Đang cast (`kb1-m6-casting`):** Ảnh vừa chọn hiện trên TV, chip đổi thành `✓ Casting · Samsung QLED 7 Series` + haptic success. Thanh điều khiển: thumbnail ảnh · tên ảnh · "Now on Samsung QLED" · đổi ảnh (mở lại sheet) · dừng cast. CTA "Continue →".
* **Copywriting:** 6a "Try it: Cast a **Photo**" / "Pick any photo and watch it appear on your TV instantly." · 6b "It's on your **TV**!" / "That's SmartCast. Photos, videos, your whole screen, just as fast."
* ⚠️ "Not now" là lối thoát khi người dùng huỷ sheet — lệch quy tắc "không Skip" của AI-UI-NOTES, cần chốt giữ/bỏ.

---

### Màn hình 7: Value-Stack Hard Paywall
* **Mục tiêu:** Chuyển đổi sang thuê bao dài hạn [86, 89].
* **Giao diện (giải phẫu từ `paywall-kit/ai-chat`, da tối T5):** Banner điện ảnh **21:9 tràn viền** ở đỉnh, bo hai góc dưới. Trên banner: **nút [X] hiện trễ** (góc trên-trái, ẩn 3s đầu rồi hiện mờ 60%) và **Restore** (góc trên-phải). Tiêu đề "Unlock Full **Premium** Access". Quyền lợi **lưới 2×2** tích xanh: 4K Mirroring · Unlimited Whiteboard · Live Camera HD · No Ads. Hàng toggle "3-Day Free Trial Enabled". 2 thẻ gói:
  * **Yearly (Best Value)** — nhãn gold "BEST VALUE · SAVE 80%" vắt mép trên thẻ; giá tổng **/year** 28pt Bold, quy đổi "≈ $/week" nhỏ hơn.
  * **Weekly (Decoy)** — "No free trial", giá /week.
* **Copywriting:** *CTA:* "Start 3-Day Free Trial →" · *Dưới CTA:* "No payment now · 3 days free, then $—.——/year" · Terms of Use · Privacy Policy.
* **Giá:** **không hard-code** — lấy từ StoreKit; chưa có thì hiện `$—.——` (TODO: price). Giá trong bản gốc ($29.99/năm, $5.99/tuần, $0.57/tuần) chưa chốt.
* **Níu chân:** Chạm [X] → Màn 7b.
* ⚠️ [X] hiện trễ là lệch AI-UI-NOTES ("[X] chỉ ở soft paywall") — đã duyệt, vì KB1 cần đường thoát để kích hoạt Exit Offer.

### Màn hình 7b: Exit Offer 50%
* **Giao diện — "vé giảm giá":** Huy chương tròn chứa ảnh quà **trồi lên khỏi mép trên vé**. Nửa trên vé: nhãn đỏ "ONE-TIME OFFER", "**50% OFF**" cỡ 64pt màu `#FF4D3A`, "Wait! Don't miss this", mô tả. **Đường xé** nét đứt với khía tròn hai bên. Nửa dưới: giá gạch ngang + giá mới 28pt, **đồng hồ ô số 05 : 00** (MIN/SEC) màu đỏ, CTA "Claim 50% Off Now →", "No thanks, I'll miss this offer", Restore · Terms · Privacy. Nút [X] góc trên-phải vé.
* **Chuyển động:** Vé trượt lên, huy chương nảy, đồng hồ đếm ngược bằng code.
* Dùng chung KB3-M9 (mức giảm theo từng kịch bản).

---

### Màn hình 8: Welcome Dashboard
* **Mục tiêu:** Xác nhận đăng ký thành công, đưa người dùng vào dùng ngay [66].
* **Giao diện:** Huy chương tròn chứa ảnh, vòng viền `#E6ECFF`, huy hiệu vương miện gold vắt mép trên-phải; **pháo giấy vẽ bằng code** bắn một lần khi vào màn (tôn trọng Reduce Motion). Tiêu đề căn giữa. Thẻ tối "Samsung QLED 7 Series · Connected · ready to cast" nối tiếp Màn 6. Lưới 3×2 tính năng: TV Mirror · Web Mirror · Photos & Videos · Whiteboard · Web Image Cast · Live Camera.
* **Copywriting:** "Welcome! All Features **Unlocked**" · CTA "Start Casting →".
* **Hành động:** Chạm ô → vào thẳng tính năng; CTA → màn chính.

---

## Tuân thủ Apple App Store Guideline 3.1.2 (áp dụng cho Paywall + Exit Offer)
1. **Minh bạch giá:** Giá tổng /year hiển thị to nhất (28pt), giá quy đổi /week nhỏ hơn bên cạnh [87, 151].
2. **Yếu tố bắt buộc:** Restore Purchases, Terms of Use (EULA), Privacy Policy xuất hiện rõ trên cả Paywall và Exit Offer [87, 151].

---

## Prompt ảnh hero

> **Quy tắc chung cho mọi ảnh KB1**
> - **Công cụ tạo ảnh chỉ có 1:1 · 16:9 · 9:16 · 4:3 · 3:4.** Mọi ảnh tạo theo một trong các tỉ lệ này. Khung UI khác tỉ lệ (banner paywall 21:9) hiển thị `aspectFill` cắt giữa — prompt đặt chủ thể thành dải ngang ở giữa, nền tối liền màu nên phần bị cắt chỉ là nền.
> - **Tỉ lệ theo vị trí đặt trong UI** (bảng dưới). Ảnh hiển thị `scaleAspectFill` trong khung bo góc 24pt (tròn với huy chương).
> - **Không chừa vùng trống.** Chip / thẻ / nút của app là lớp nổi, tự che phần ảnh bên dưới. Mọi câu kiểu *"keep … as plain background / empty area"* đều khiến model vẽ **mảng trắng hoặc tấm chữ nhật** (đã xảy ra ở `ob_hero_mirror_tv_web` lần 1 và `ob_hero_trust` lần 1) — **không dùng nữa**. Chỉ cần chủ thể gọn trong khung, lề ≥ 8%.
> - **Không chữ, không số, không logo** trong ảnh — mọi chữ do app render. Chủ thể chừa lề ≥ 8% mỗi cạnh.
> - **Cảnh cast/mirror: nội dung trên điện thoại và trên màn lớn phải giống hệt nhau** (cùng bố cục, chi tiết, màu — chỉ khác kích thước). Mỗi ảnh chỉ một điện thoại nguồn; không thêm thiết bị phụ không tham gia cast.
> - Màn 5 (radar) và Màn 6 (TV + ảnh người dùng) **không cần ảnh**.

### Bài học từ lần tạo `ob_quiz_family` (2026-10-12)

| Lần | Kết quả | Nguyên nhân |
|---|---|---|
| 1 | ❌ Trượt | Prompt chỉ tả **cảnh**, để model tự chọn màu và nét → ra icon stock: nét xám mảnh, vàng/xanh lá/cam/màu da, nền xám, phản quang trên màn TV, bóng đổ dưới chân, chủ thể chỉ chiếm 50% khung, chân đế dài phí chỗ. |
| 2 | ✅ Đạt | Prompt **chỉ định màu cho từng chi tiết**, **liệt kê màu bị cấm bằng tên**, cấm phản quang/bóng đổ, quy định độ lấp khung, và yêu cầu "đọc được ở cỡ nhỏ". |
| `ob_quiz_work` lần 1 | ❌ Lệch phong cách | Màu + nội dung đúng nhưng **nét chỉ dày 0.56% bề ngang** (chuẩn ~1.2%), **viền navy** thay vì đen, **thiếu blob**, nét **thước kẻ, góc vuông nhọn** → ra sơ đồ kỹ thuật, không giống family. Prompt chưa khoá độ dày + dáng nét, và có thể đã tạo **không kèm ảnh family làm style reference**. |
| `ob_quiz_work` lần 2 | ⚠️ Trôi sang phong cách mới | Độ dày (1.34%) + viền đen đã khớp, nhưng STYLE bản trước tả *"loose, wobbly marker sketch"* và *"large blob"* → nét **kép, run kiểu phác thảo**, blob phủ **45%** khung (family 26%), chủ thể chật **89%** chiều cao (family 71%). **Bài học: tả phong cách bằng số đo của ảnh chuẩn, không dùng tính từ cảm tính** — tính từ kéo cả bộ sang một phong cách mới. |
| `ob_hero_photo_video_web` lần 2 | ✅ sau hậu kỳ | Không chữ, nội dung đúng, nhưng màn TV + nửa ô lưới là **xanh da trời `#ADD2FF`** (11.7% ảnh, ngoài bảng màu). Không tạo lại: **xoay sắc độ** riêng các điểm ảnh hue 200–220°, độ bão hoà > 0.2 về hue 227° (`#BDCCFD`), giữ nguyên nét + blob. File gốc ở `project/smartscreen/assets/`, bản sửa `public/images/ob_hero_photo_video_web.png`. Prompt các ảnh sau thêm *"not sky blue"* + NEGATIVE *sky blue, cyan, baby blue*. |
| Duyệt bộ 3 | ✅ | Đặt cạnh nhau ở cỡ thẻ 96×128pt, `family` + `work` (lần 2) + `creative` đọc thành một họ → duyệt cả bộ. STYLE dưới đây mô tả **khoảng số đo của cả 3 ảnh**, không chỉ ảnh family. |

**Vì vậy mọi prompt dưới đây đều có 4 khối, không bỏ khối nào:** (1) Cảnh + bố cục · (2) **Coloring** — chi tiết nào tô màu nào · (3) Vùng trống · (4) STYLE + tỉ lệ. Cuối cùng dán NEGATIVE nếu công cụ hỗ trợ.

**Ảnh chuẩn phong cách:** bộ 3 ảnh màn 1 đã duyệt — `public/images/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`. Nếu công cụ hỗ trợ *style reference / image prompt*, **luôn đính kèm ảnh này** khi tạo mọi ảnh nền sáng còn lại; dùng cùng công cụ, cùng seed nếu có.

| Mã ảnh | Màn | Tỉ lệ | Kích thước tạo | Hiển thị (reference) → xuất @3x | Vùng trống | Trạng thái |
|---|---|---|---|---|---|---|
| `ob_quiz_family` | 1 | 3:4 dọc | 1536×2048 | 96×128pt → 288×384 | — | ✅ đã duyệt, đã gắn vào UI |
| `ob_quiz_work` | 1 | 3:4 dọc | 1536×2048 | 96×128pt → 288×384 | — | ✅ đã duyệt (lần 2), đã gắn vào UI |
| `ob_quiz_creative` | 1 | 3:4 dọc | 1536×2048 | 96×128pt → 288×384 | — | ✅ đã duyệt, đã gắn vào UI |
| `ob_hero_mirror_tv_web` | 2.1 | 3:4 dọc | 1536×2048 | 300×400pt → 900×1200 | — (chip tự che, không chừa) | ✅ đã duyệt (lần 2), đã gắn vào UI |
| `ob_hero_photo_video_web` | 2.2 | 3:4 dọc | 1536×2048 | 300×400pt → 900×1200 | — (chip tự che, không chừa) | ✅ đã duyệt (lần 2, **đã sửa màu hậu kỳ**), đã gắn vào UI |
| `ob_hero_whiteboard_camera` | 2.3 | 3:4 dọc | 1536×2048 | 300×400pt → 900×1200 | — (chip tự che, không chừa) | ✅ đã duyệt (lần 3), đã gắn vào UI — 2 màn giống hệt nhau; ghi chú nhỏ: đầu bút chạm nửa camera thay vì nửa bảng trắng |
| `ob_hero_trust` | 3 | **16:9** ngang | 2048×1152 | 342×192pt → 1026×576 | — (UI tự che, không chừa) | ✅ đã duyệt (lần 2, 16:9), đã gắn vào UI |
| `ob_hero_permission_network` | 4 | 3:4 dọc | 1536×2048 | 246×328pt → 738×984 | — (UI tự che, không chừa) | ✅ đã duyệt, đã gắn vào UI |
| `ob_hero_paywall_pro` | 7 | **tạo 16:9**, hiển thị 21:9 (cắt giữa), tối | 2048×1152 | 390×167pt → 1170×501 | — (UI tự che, không chừa) | ✅ đã duyệt, đã gắn vào UI (cắt 16:9 → 21:9 giữ trọn chủ thể) |
| `ob_hero_exit_gift` | 7b | 1:1 cắt tròn, tối | 1024×1024 | Ø116pt → 348×348 | — (UI tự che, không chừa) | ✅ đã duyệt, đã gắn vào UI |
| `ob_demo_user_photo` | 6b | 16:9 ngang, **ảnh chụp** (demo, không ship) | 2048×1152 | TV ~310×174pt + thumb 48×48 | — | ✅ đã duyệt, đã gắn vào board (demo) |
| `ob_hero_pro_success` | 8 | 1:1 cắt tròn | 1024×1024 | Ø124pt → 372×372 | — (UI tự che, không chừa) | ✅ đã duyệt, đã gắn vào UI — board dùng bản thu 80% (tay phải chạm 88% bán kính, nằm dưới huy hiệu vương miện); người che nửa dấu tích, chấp nhận |

### Khối dùng chung

**STYLE-LIGHT** — thay `[STYLE-LIGHT]` trong prompt bằng đoạn này. Mỗi câu tả **một số đo của ảnh chuẩn `ob_quiz_family`** (đo 2026-10-12) — không thêm tính từ cảm tính:
```
Style: match the attached reference images exactly — same drawing hand, same line quality, same proportions.
Clean flat vector illustration. Outlines are pure black, smooth and confident, drawn as ONE single clean line each — not sketchy, not wobbly, not doubled, no rough marker texture. Outline thickness is uniform, about 1.2% of the image width (around 18px at 1536px wide), with rounded ends and rounded corners. Shapes are simple and slightly soft, like a friendly vector icon scaled up.
Strictly limited palette: black outlines, royal blue #0440FB, light blue #BDCCFD (a soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, and white — nothing else. Large flat fills of #BDCCFD, #E6ECFF and white; royal blue only on one or two small accent shapes.
Composition: the subject spans about 90% of the width and 70–90% of the height, centered, with at least 8% margin on every side. Behind the subject, one soft organic #E6ECFF blob roughly the size of the subject, covering about 25–45% of the image; the four corners always stay pure white #FFFFFF.
People are very simple rounded shapes filled with #BDCCFD or white, faces blank or minimal, no skin tones. No screen reflections or glare, no ground shadow, no drop shadows, no gradients, no 3D, no texture. Devices are simplified mockups with rounded corners, short feet and no brand logos. Absolutely no text, no letters, no numbers, no logos, no watermark.
```
> **Bắt buộc đính kèm bộ 3 ảnh màn 1 (`public/images/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`) làm style reference** cho mọi ảnh nền sáng. **Không tạo lại bộ 3 này** — chúng là chuẩn; ảnh khác phải khớp chúng, không phải ngược lại.

**STYLE-DARK** — thay `[STYLE-DARK]`:
```
Style: bold flat vector illustration with a hand-drawn feel. Every shape has a thick, uniform white or #BDCCFD outline with rounded ends, on a solid deep navy background #070B1F. Strictly limited palette: navy #070B1F and #0E1638, royal blue #0440FB, light blue #BDCCFD, white, and warm gold #FFC83D only where stated — nothing else. One soft flat circular glow in #0E1638 behind the subject. No photorealism, no gradients other than that single soft glow, no 3D, no texture, no drop shadows. Absolutely no text, no letters, no numbers, no logos, no watermark.
```

**NEGATIVE** — dán vào ô negative prompt (nếu có):
```
yellow, green, orange, red, pink, purple, skin tone, beige, gray outlines, navy outlines, thin lines, hairline strokes, ruler-straight lines, sharp corners, technical diagram, infographic, stock icon style, mostly empty white, sketchy lines, double lines, wobbly lines, rough marker texture, pencil sketch, blob covering the corners, cramped composition, sky blue, cyan, baby blue, 4K, HD, REC, video progress bar, timestamp, subtitles, handwriting, scribbled notes, letters in circles, viewfinder marks, search bar, address bar, URL, browser window, UI labels, captions, buttons with words, glass reflection, glare, shine, ground shadow, drop shadow, gradient, 3D render, photorealistic, texture, tall stand, small subject, cluttered background, multiple focal points, text, letters, numbers, logo, brand logo, Apple logo, Samsung logo, watermark, distorted hands, extra fingers, cropped device
```
> Với ảnh tối (`paywall_pro`, `exit_gift`) **bỏ "yellow"** khỏi NEGATIVE (gold được phép), còn lại giữ nguyên. Riêng `exit_gift` không bỏ "red".

---

### ✅ `ob_quiz_family` — Màn 1, thẻ "Family Entertainment" (3:4) — ĐÃ DUYỆT
**File:** `public/images/ob_quiz_family.png` (896×1200). Prompt đã cho kết quả đạt, giữ làm mẫu; nếu tạo lại thì thêm câu về chân TV (bản hiện tại bị bắp rang che mất chân phải).
```
A bold, simple vertical spot illustration that must read clearly at a tiny 96x128 size.
A big flat-screen TV fills the upper two thirds of the frame, standing on two short feet, both visible. On its screen: a family of two adults and a small child drawn as very simple rounded shapes, standing in front of one mountain and a sun. A small popcorn bucket stands in front of the TV's bottom right corner without hiding the right foot.
Coloring: people filled with #BDCCFD and white, the mountain and the sun filled with royal blue #0440FB, the TV screen background #E6ECFF, the popcorn bucket white with royal blue #0440FB stripes.
Subject centered, filling about 80% of the frame, at least 8% margin on every side.
[STYLE-LIGHT]
Portrait 3:4, 1536x2048.
```

### ✅ `ob_quiz_work` — Màn 1, thẻ "Work & Study" (3:4) — ĐÃ DUYỆT
**File:** `public/images/ob_quiz_work.png` (lần 2).
**Mô tả:** Bảng trắng trên giá vẽ (biểu đồ cột + mũi tên đi lên) + laptop mở phía trước. Phải **cùng độ dày nét, cùng dáng nét bo tròn, cùng blob** với `ob_quiz_family` — đặt cạnh nhau không phân biệt được là hai lần tạo.
**Đính kèm:** `public/images/ob_quiz_family.png` làm style reference.
```
Using the attached images as the exact style reference (same black outlines of the same thickness, same soft rounded shapes, same background blob, same amount of white space):
A bold, simple vertical spot illustration that must read clearly at a tiny 96x128 size.
A presentation whiteboard with rounded corners on a short easel, placed in the upper part of the subject area. On the board: three rounded bar-chart bars rising left to right and one chunky upward arrow. An open laptop with rounded corners sits in front of the easel's bottom right, overlapping it, its screen showing the same three small bars.
Coloring: whiteboard surface #E6ECFF, the three bars #BDCCFD, the upward arrow royal blue #0440FB, easel legs white, laptop body white with a #E6ECFF screen and #BDCCFD bars.
Subject spans about 90% of the width and 70% of the height, vertically centered, with white space above and below; a soft #E6ECFF blob slightly smaller than the subject peeks out behind it.
[STYLE-LIGHT]
Portrait 3:4, 1536x2048.
```

### ✅ `ob_quiz_creative` — Màn 1, thẻ "Create & Monitor" (3:4) — ĐÃ DUYỆT
**File:** `public/images/ob_quiz_creative.png`. Ghi chú nhỏ: cán kính lúp chạm sát mép trái, bị góc bo cắt nhẹ — nếu tạo lại thì chừa lề trái ≥ 8%.
**Mô tả:** iPhone trên tripod mini (camera + chấm "đang quay") + kính lúp đè lên khung ảnh (tìm ảnh web). Cùng phong cách với `ob_quiz_family`.
**Đính kèm:** `public/images/ob_quiz_family.png` làm style reference.
```
Using the attached images as the exact style reference (same black outlines of the same thickness, same soft rounded shapes, same background blob, same amount of white space):
A bold, simple vertical spot illustration that must read clearly at a tiny 96x128 size.
A smartphone with rounded corners stands upright on a short mini tripod in the lower two thirds of the frame, seen from the back, with one big round camera lens and a small round recording dot. In the upper left, a magnifying glass overlaps a small picture frame showing one mountain and a sun.
Coloring: phone body #E6ECFF, camera lens ring #BDCCFD with a black center and a small white highlight dot, recording dot royal blue #0440FB, tripod legs white, magnifying glass rim royal blue #0440FB with a white lens, picture frame white with a #BDCCFD mountain and a royal blue #0440FB sun.
Subject spans about 90% of the width and 70% of the height, vertically centered, with white space above and below; a soft #E6ECFF blob slightly smaller than the subject peeks out behind it.
[STYLE-LIGHT]
Portrait 3:4, 1536x2048.
```

> **3 ảnh carousel (màn 2): không chừa vùng trống.** Chip của app là lớp nổi, tự che phần ảnh bên dưới. Lần tạo `ob_hero_mirror_tv_web` đầu tiên, câu *"keep … as plain background"* khiến model vẽ **mảng trắng chữ nhật** ở góc ảnh — vì vậy đã bỏ hẳn. Chỉ cần chủ thể nằm gọn trong khung, lề ≥ 8%.
> **Đính kèm bộ 3 ảnh quiz** làm style reference. Lần đầu (không đủ tham chiếu) ra nét mảnh 0.22% bề ngang, viền xám, nền là các tấm chữ nhật xanh phủ 72% khung — lệch hẳn bộ quiz.

### `ob_hero_mirror_tv_web` — Màn 2, slide 1 (3:4, dùng chung KB3-M1)
**Bố cục dọc:** TV lớn ở trên, laptop mở ở giữa, bàn tay cầm iPhone **nằm ngang** ở dưới. Hai mũi tên cong nét đứt bay **lên** TV và laptop; cả ba màn hình hiện **cùng** một bức phong cảnh (màn ngang nên ba hình cùng tỉ lệ, đọc ngay là "chiếu y hệt").
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Vertical composition, three devices stacked from top to bottom. At the top, a large flat-screen TV on two short feet. In the middle, an open laptop slightly to the left. At the bottom, two hands holding a smartphone horizontally in landscape orientation, like watching a video. Two curved dashed arrows fly upward from the phone, one to the laptop and one to the TV. Three small Wi-Fi arcs above the phone. All three screens show exactly the same simple landscape picture: one rounded mountain and a sun, in the same landscape proportions.
Coloring: every screen background #E6ECFF, the mountain #BDCCFD, the sun royal blue #0440FB, dashed arrows and Wi-Fi arcs royal blue #0440FB, hands filled white, device bodies white.
Subject centered, about 90% of the width and 80–90% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width (around 18px at 1536px wide) — rounded ends and rounded corners, never thin or gray. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene (not rectangles, not panels), the four corners stay white.
[STYLE-LIGHT]
Portrait 3:4, 1536x2048.
```

### `ob_hero_photo_video_web` — Màn 2, slide 2 (3:4, dùng chung KB3-M2)
**Bố cục dọc:** TV lớn ở trên hiện ảnh núi với **chỉ một tam giác play** (không thanh video). iPhone ở dưới với lưới 3×3 ô trơn, một ô bay lên TV theo mũi tên cong. Kính lúp + vài khung ảnh nhỏ ở giữa bên cạnh — **không ô tìm kiếm, không trình duyệt**.
> ⚠️ Lần tạo trước có **chữ trong ảnh**. Nguồn chữ hay gặp ở ảnh này: thanh tiến trình video + giờ, nhãn 4K/HD, ô tìm kiếm / thanh địa chỉ khi tả "web search", và dòng "Message: …" bị vẽ thành chữ. Prompt dưới đã chặn đích danh từng thứ.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Vertical composition. At the top, a large flat-screen TV on two short feet. Its screen shows a simple picture of one rounded mountain, with a big rounded triangular play symbol drawn on top of it — just the triangle, nothing else on the screen. At the bottom right, a smartphone held upright; its screen is a 3x3 grid of plain rounded squares, each square showing only a tiny mountain shape. One square flies out of the grid up toward the TV along a curved dashed arrow. In the middle left, a magnifying glass hovering over three small floating picture frames, each frame showing only a tiny mountain and sun.
Coloring: TV screen #E6ECFF, mountain #BDCCFD, play triangle royal blue #0440FB, grid squares alternating #BDCCFD and #E6ECFF, the flying square royal blue #0440FB, dashed arrow royal blue, magnifying glass rim royal blue #0440FB with a white lens, picture frames white with #BDCCFD content, device bodies white.
Absolutely no text anywhere in the image: no letters, no numbers, no "4K", no "HD", no video progress bar, no timestamps, no subtitles, no search bar, no address bar, no URL, no browser window, no buttons with words, no labels on the photos.
Subject centered, about 90% of the width and 80–90% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width (around 18px at 1536px wide) — rounded ends and rounded corners, never thin or gray. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene (not rectangles, not panels), the four corners stay white.
[STYLE-LIGHT]
Portrait 3:4, 1536x2048.
```

### `ob_hero_whiteboard_camera` — Màn 2, slide 3 (3:4, dùng chung KB3-M3)
**Bố cục dọc:** TV lớn ở trên, **một** điện thoại cầm ngang ở dưới (tay cầm bút đang vẽ). Màn TV và màn điện thoại hiện **cùng một khung chia đôi, giống hệt nhau**: trái là sơ đồ 3 vòng tròn đang vẽ, phải là khung camera chậu cây. Sóng Wi-Fi + mũi tên nét đứt từ điện thoại lên TV — cùng ngôn ngữ với `ob_hero_mirror_tv_web`.
> ⚠️ Lần 2 (đã tạm gắn UI) **khó hiểu**: TV chia đôi nhưng có 2 điện thoại khác nhau (một trên tripod màn trống, một chỉ có sơ đồ) → không biết máy nào đang cast. **Nguyên tắc: trong cảnh cast/mirror, nội dung trên điện thoại và trên TV phải giống hệt nhau** (cùng bố cục, cùng chi tiết, cùng màu), chỉ khác kích thước. Không thêm thiết bị phụ không tham gia cast.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Vertical composition with exactly two devices. At the top, a large flat-screen TV on two short feet. At the bottom, one smartphone held horizontally in landscape orientation by one hand, while the other hand holds a stylus touching its screen. Three small Wi-Fi arcs above the phone and one curved dashed arrow flying up from the phone to the TV. The stylus tip touches the left half of the phone screen, finishing the last circle.
The phone screen and the TV screen show EXACTLY THE SAME picture, identical in layout and detail, only different in size: a screen split in two halves by one vertical line — the left half shows three solid filled circles connected by two short arrows (empty circles, no letters), the right half shows a potted plant with three rounded leaves as seen by a camera.
Coloring: both screens #E6ECFF, the three circles and arrows royal blue #0440FB, plant leaves #BDCCFD in a white pot, dashed arrow and Wi-Fi arcs royal blue #0440FB, hands filled white, stylus white, device bodies white.
No third device, no tripod, no extra phone. Absolutely no text anywhere in the image: no letters or words inside or under the circles, no handwriting, no "REC" label, no timestamps, no viewfinder numbers, no labels, no captions.
Subject centered, about 90% of the width and 80–90% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width (around 18px at 1536px wide) — rounded ends and rounded corners, never thin or gray. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene (not rectangles, not panels), the four corners stay white.
[STYLE-LIGHT]
Portrait 3:4, 1536x2048.
```

> **Các ảnh từ màn 3 trở đi: không chừa vùng trống** (xem quy tắc chung). Mỗi prompt tự đủ — đã gộp STYLE, chỉ cần đính kèm ảnh tham chiếu và dán nguyên khối.

### `ob_hero_trust` — Màn 3, Social Proof (16:9 ngang)
**Bố cục:** TV ở giữa khung, trên màn là trái tim lớn; vòng cung 5 sao phía trên TV; hai bong bóng hội thoại hai bên (chỉ vạch ngang); bàn tay giơ ngón cái. Thẻ "4.8 ★★★★★" của app đè lên mép dưới-trái — **tự che, không chừa chỗ**.
> ⚠️ Lần 1 có **mảng trắng** do câu *"keep the bottom-left area as plain background"* — đã bỏ. Bong bóng hội thoại dễ sinh chữ (*"review text"*) → chỉ tả *ba vạch ngang trơn*.
**Đính kèm:** bộ 3 ảnh quiz.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Wide horizontal composition. A flat-screen TV on two short feet in the center, with one big heart on its screen. Above the TV, an arc of five stars. On each side of the TV, one small rounded speech bubble containing only three plain horizontal lines. Below the right speech bubble, a hand giving a thumbs-up.
Coloring: TV screen #E6ECFF, heart royal blue #0440FB, stars royal blue #0440FB (not gold, not yellow), speech bubbles white with #BDCCFD lines, hand filled white, TV body white.
No letters or words inside the speech bubbles, no numbers, no rating text, no app store badge.
Subject centered, about 85% of the width and 80% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners, never thin or gray. Clean flat vector, one clean line per edge. Strictly limited palette: black, royal blue #0440FB, light blue #BDCCFD (soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, white — nothing else. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene — one continuous blob, no rectangles, no panels, no white boxes cut into it. No reflections, no shadows, no gradients, no 3D. Absolutely no text, letters, numbers, logos or watermark.
Landscape 16:9, 2048x1152.
```

### `ob_hero_permission_network` — Màn 4, Giải thích quyền (3:4 dọc, dùng chung KB2-M4)
**Bố cục:** iPhone đứng ở dưới (màn: khiên + ổ khoá), 3 cung Wi-Fi lan lên; TV (trên-phải) và laptop (giữa-trái) ở đầu sóng, mỗi máy có dấu tích tròn; mái nhà nét nhạt bao cảnh. Hai chip quyền của app vắt từ mép ảnh vào — **tự che, không chừa chỗ**. Đây không phải cảnh cast nên màn TV/laptop **để trơn** (không nội dung, tránh sinh chữ).
**Đính kèm:** bộ 3 ảnh quiz.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Vertical composition. A smartphone standing upright in the lower third, centered, its screen showing one shield with a padlock. Three large Wi-Fi arcs radiate upward from the phone. At the ends of the waves: a flat-screen TV on two short feet in the upper right and an open laptop in the middle left, each with a small round check-mark badge on its corner; their screens are plain #E6ECFF with nothing on them. Behind everything, a very light simple roof outline (a wide triangle over the scene) to suggest a home.
Coloring: shield royal blue #0440FB with a white padlock, Wi-Fi arcs royal blue #0440FB, check-mark badges royal blue with white ticks, TV and laptop screens #E6ECFF, device bodies white, roof outline drawn only in #BDCCFD (no black outline on the roof).
No text, no network name, no password dots, no labels on any screen.
Subject centered, about 90% of the width and 80–90% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners, never thin or gray. Clean flat vector, one clean line per edge. Strictly limited palette: black, royal blue #0440FB, light blue #BDCCFD (soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, white — nothing else. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene — one continuous blob, no rectangles, no panels, no white boxes cut into it. No reflections, no shadows, no gradients, no 3D. Absolutely no text, letters, numbers, logos or watermark.
Portrait 3:4, 1536x2048.
```

### `ob_hero_paywall_pro` — Màn 7, banner Hard Paywall (tạo 16:9, hiển thị 21:9; tối; dùng chung KB2-M8, KB3-M8)
**Bố cục:** TV phát sáng ở giữa, trên màn là vương miện vàng; iPhone nghiêng phía trước bên trái, **màn hiện đúng vương miện đó** (luật màn giống hệt nhau); dải sóng sáng nối hai máy; lấp lánh vàng hai bên. Nút [X] và Restore của app đè hai góc trên — **tự che, không chừa chỗ**.
**Đính kèm:** bộ 3 ảnh quiz (chỉ lấy nét vẽ).
```
Using the attached images as the style reference for line quality and shapes only (same thick rounded outlines, same soft simple shapes), but on a dark background:
Wide horizontal composition laid out as one horizontal strip across the vertical middle of the image; the navy background simply continues above and below the strip. A flat-screen TV on two short feet in the center, its screen showing one large crown. In front of it on the left, a small tilted smartphone whose screen shows exactly the same crown on the same background, only smaller. A soft glowing wave ribbon connects the phone to the TV. A few small four-point sparkles on both sides.
Coloring: both crowns warm gold #FFC83D with white outlines, both screens #0E1638 with a soft royal blue #0440FB glow around the crown, the wave ribbon #BDCCFD, sparkles gold #FFC83D and white, device bodies #0E1638 with white outlines.
No text, no "PRO" or "PREMIUM" word, no numbers, no price, no badge with letters.
The whole subject (TV, phone, ribbon, sparkles) fits inside the middle 60% of the height and the middle 70% of the width.
Outlines: white or #BDCCFD, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners. Clean flat vector, one clean line per edge. Strictly limited palette: navy #070B1F background, deep navy #0E1638, royal blue #0440FB, light blue #BDCCFD, white, and warm gold #FFC83D only where stated — nothing else. Background: solid navy #070B1F filling the whole image with one soft round #0E1638 glow behind the subject — no panels, no rectangles, no frames, no lighter boxes. No photorealism, no 3D, no texture, no drop shadows. Absolutely no text, letters, numbers, logos or watermark.
Landscape 16:9, 2048x1152.
```

### `ob_hero_exit_gift` — Màn 7b, huy chương Exit Offer (1:1, cắt tròn, tối; dùng chung KB3-M9)
**Bố cục:** Hộp quà bật nắp ở giữa, chùm sáng + vài mảnh pháo giấy bay ra. **Không** vé, không ký hiệu % — vé và "50% OFF" là UI của app. Ảnh bị cắt tròn → chủ thể gọn, nằm giữa.
**Đính kèm:** bộ 3 ảnh quiz (chỉ lấy nét vẽ).
```
Using the attached images as the style reference for line quality and shapes only (same thick rounded outlines, same soft simple shapes), but on a dark background:
Centered composition for a circular crop. One open gift box in the center with its lid popping off upward, a soft beam of light and a few small confetti pieces bursting out of it.
Coloring: gift box royal blue #0440FB with a white ribbon and bow, lid royal blue, light beam #BDCCFD, confetti warm gold #FFC83D and white.
No ticket, no coupon, no percent sign, no numbers, no text, no tag with letters.
Subject compact and centered, fitting within the middle 70% of the image.
Outlines: white or #BDCCFD, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners. Clean flat vector, one clean line per edge. Strictly limited palette: navy #070B1F background, deep navy #0E1638, royal blue #0440FB, light blue #BDCCFD, white, and warm gold #FFC83D only where stated — nothing else. Background: solid navy #070B1F filling the whole image with one soft round #0E1638 glow behind the subject — no panels, no rectangles, no frames, no lighter boxes. No photorealism, no 3D, no texture, no drop shadows. Absolutely no text, letters, numbers, logos or watermark.
Square 1:1, 1024x1024, designed to be cropped to a circle.
```

### `ob_hero_pro_success` — Màn 8, huy chương Welcome (1:1, cắt tròn, sáng; dùng chung KB2-M9)
**Bố cục:** Nửa người đơn giản giơ hai tay ăn mừng trước TV có dấu tích lớn. **Không** vương miện (app có huy hiệu vương miện vắt mép trên-phải) và không pháo giấy (app vẽ bằng code). Ảnh bị cắt tròn → chủ thể gọn, nằm giữa.
**Đính kèm:** bộ 3 ảnh quiz.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Centered composition for a circular crop. A simple half-body cartoon person drawn as rounded shapes, raising both arms in celebration, standing in front of a flat-screen TV on two short feet whose screen shows one large round check mark.
Coloring: person's shirt #BDCCFD, head and hands white, blank face or a minimal smile, TV screen #E6ECFF, check-mark circle royal blue #0440FB with a white tick, TV body white.
No crown, no confetti, no stars, no text.
Subject compact and centered, fitting within the middle 70% of the image.
Outlines: pure black, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners, never thin or gray. Clean flat vector, one clean line per edge. Strictly limited palette: black, royal blue #0440FB, light blue #BDCCFD (soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, white — nothing else. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene — one continuous blob, no rectangles, no panels, no white boxes cut into it. No reflections, no shadows, no gradients, no 3D. Absolutely no text, letters, numbers, logos or watermark.
Square 1:1, 1024x1024, designed to be cropped to a circle.
```

**NEGATIVE dùng chung cho 5 ảnh trên** (ảnh tối: bỏ "yellow, gold"):
```
white boxes, rectangular panels, empty cut-out areas, frames around the scene, lighter rectangles, text, letters, words, numbers, rating text, app store badge, PRO, PREMIUM, price, percent sign, ticket, network name, labels, captions, thin lines, gray outlines, sky blue, cyan, baby blue, yellow, gold, green, orange, red, skin tone, shadow, gradient, glare, 3D, photorealistic, logo, watermark
```

### `ob_demo_user_photo` — Màn 6b, ảnh demo "người dùng vừa chọn" (16:9, ảnh chụp) — CHỈ DÙNG TRÊN BOARD
**Không phải asset onboarding, không ship.** Trong app, TV và thumbnail hiển thị ảnh thật người dùng chọn qua PhotosPicker. Ảnh này chỉ để board/mockup thể hiện khoảnh khắc "It's on your TV!". Vì vậy **được phép là ảnh chụp thật** (ngoại lệ duy nhất với quy tắc minh hoạ vector) — tấm ảnh đời thường mới thuyết phục.
**Dùng ở:** màn TV 16:9 (cover) + thumbnail vuông 48pt (cắt giữa) → chủ thể nằm giữa khung.
**Không cần** đính kèm bộ ảnh quiz.
```
A warm, natural candid family photo: two parents and a young child laughing together on a sunny beach in the late afternoon, soft golden light, calm blue sea and clear sky behind them, the family standing in the center of the frame. Shot on a smartphone, realistic, slightly casual composition like a real camera-roll photo, gentle colors with plenty of blue sky and sea.
The people stay in the middle third of the image so both a 16:9 view and a centered square crop show them.
No text, no captions, no watermark, no logos, no brand names on clothing, no signs, no date stamp.
Landscape 16:9, 2048x1152.
```
NEGATIVE: `text, caption, watermark, logo, brand, date stamp, sign, illustration, cartoon, vector, 3D render, distorted faces, extra fingers, oversaturated, HDR, heavy filter`

### Checklist duyệt ảnh (dùng cho mọi ảnh trước khi gắn vào UI)
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
