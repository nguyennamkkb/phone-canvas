# Kịch bản 3: High-Converting Quiz Funnel + Exit Discount (9 màn hình)

> Đề xuất nâng cấp luồng onboarding SmartCast iOS — một trong 2 kịch bản A/B test.
> Kịch bản khác: [KB1 – Value-First + Hard Paywall](kb1-value-first-hard-paywall.md)
>
> **Trạng thái (2026-10-12):** tài liệu đã chuẩn hoá theo format KB1, **chưa dựng UI**. Dựng trên phone-canvas tại `project/smartscreen/screens/kb3-*.html`, **dùng lại ngôn ngữ thiết kế, lớp khung và ảnh của KB1** (xem [KB1 · Ngôn ngữ thiết kế chung](kb1-value-first-hard-paywall.md#ngôn-ngữ-thiết-kế-chung)). Trước khi dựng cần chốt các điểm ở mục **Duyệt logic**.

## Thông số kịch bản

| Tiêu chí | Giá trị |
| :--- | :--- |
| **Mục tiêu chính** | Tối ưu hóa chuyển đổi cho tệp người dùng đến từ quảng cáo User Acquisition (Facebook / TikTok Ads) [83, 92] |
| **Phù hợp tệp người dùng** | Paid UA — người dùng chưa biết app, cần được "nêu vấn đề" trước khi giới thiệu giải pháp |
| **Mô hình Paywall** | Paywall chứng thực xã hội (có [X]) + Exit Discount 50% |
| **Chỉ số mục tiêu** | Tỷ lệ chuyển đổi phễu (Conversion Rate) [92, 107] |
| **Khác KB1 ở đâu** | Mở bằng **nêu vấn đề** thay vì quiz mục đích; **2 bước quiz** (hãng thiết bị + tính năng) thay carousel; **gộp** xin quyền + quét; **không** màn trải nghiệm thử; social proof nằm **trong** Paywall; sau Exit có **màn xác nhận ưu đãi** + **mẹo sử dụng** thay Welcome dashboard |
| **Rủi ro UX** | Phản cảm nếu discount "ảo" [92]; màn chờ kỹ thuật dễ bị coi là tiến trình giả (xem L2) |

## Luồng tổng quát

```
1. Problem-Agitation Intro → 2. Quiz: hãng thiết bị → 3. Quiz: tính năng cần nhất
→ 4. Màn chờ cá nhân hoá → 5. Cấp quyền & quét ngay (5a giải thích → 5b đã tìm thấy)
→ 6. Paywall chứng thực xã hội ──[X]──→ 7. Exit Discount 50%
                                          └─ nhận ưu đãi → 8. Xác nhận ưu đãi → (StoreKit) → 9. Mẹo nhanh & vào app
```

| Bước | File dự kiến (`project/smartscreen/screens/`) | Dùng lại từ KB1 | Ảnh |
|---|---|---|---|
| 1 | `kb3-m1-intro` | khung T1 (ảnh 3:4 + tiêu đề editorial) | `ob_hero_problem_agitation` — **mới** |
| 2 | `kb3-m2-brand` | thẻ chọn KB1-M1 → lưới 2 cột | — (tên hãng dạng chữ) |
| 3 | `kb3-m3-features` | thẻ chọn KB1-M1 → chọn nhiều | — (glyph) |
| 4 | `kb3-m4-setup` | radar/vòng KB1-M5 | — (vẽ bằng code) |
| 5 | `kb3-m5-permission` · `kb3-m5-scan` | KB1-M4 (5a) · KB1-M5 (5b) | `ob_hero_permission_network` — **dùng lại** |
| 6 | `kb3-m6-paywall` | KB1-M7 (giải phẫu `paywall-kit/ai-chat`) + khối social proof KB1-M3 | `ob_hero_paywall_pro` — **dùng lại** |
| 7 | `kb3-m7-exit-offer` | KB1-M7b vé giảm giá | `ob_hero_exit_gift` — **dùng lại** |
| 8 | `kb3-m8-discount-applied` | vé KB1-M7b ở trạng thái "đã áp dụng" | — (vẽ bằng code) |
| 9 | `kb3-m9-tips` | khung T3 (ảnh + danh sách dòng) | `ob_hero_tips` — **mới** |

**Tổng: 2 ảnh mới, 3 ảnh dùng lại, 5 màn vẽ bằng code.**

## Ngôn ngữ thiết kế chung

Dùng nguyên của KB1 — không tạo phong cách riêng cho KB3 (A/B test so sánh *luồng*, không so sánh *giao diện*, design-direction §1):
- Tiêu đề editorial 30pt căn trái, nhấn một từ màu accent; tiến trình **9 đoạn** ở đỉnh màn sáng; CTA viên thuốc 56pt có mũi tên, dính đáy.
- Ảnh là sân khấu, chip UI nổi trên ảnh; mỗi màn một bố cục; màu chỉ từ design-direction §2 (đỏ chỉ ở Exit; gold chỉ khu Pro).
- Khu Pro (Paywall, Exit, Xác nhận ưu đãi) nền tối `#070B1F → #0E1638`.

---

### Màn hình 1: Problem-Agitation Intro (Nêu Bật Vấn Đề)
* **Mục tiêu:** Người đến từ quảng cáo chưa biết app — chạm vào nỗi đau "màn hình nhỏ, mỏi mắt" trước khi giới thiệu giải pháp.
* **Giao diện:** Ảnh **dọc 3:4** so sánh hai nửa: trái — người nheo mắt nhìn điện thoại nhỏ; phải — cùng người đó thư giãn trên sofa xem TV lớn. Hai chip UI nổi trên ảnh: `6″` (nửa trái) và `65″` (nửa phải). Tiêu đề + mô tả, CTA "Continue →".
* **Copywriting:** *Tiêu đề:* "Enjoy Your Content **10x** Larger" / "Thưởng thức nội dung trên màn hình lớn gấp 10 lần" · *Mô tả (copy tạm, cần duyệt):* "Stop squinting at your phone. Put photos, videos and your whole screen on the TV."
* **Hành động:** Continue → Màn 2.
* ⚠️ "10x": tỉ lệ đường chéo 65″ / 6″ ≈ 10.8 → đúng nếu hiểu theo **đường chéo**; theo diện tích là ~117 lần. Giữ "10x" nhưng không ghi đơn vị khác.

---

### Màn hình 2: Quiz — Chọn hãng thiết bị (Device Selection)
* **Mục tiêu:** Cá nhân hoá + chuẩn bị gợi ý kết nối đúng thiết bị.
* **Giao diện:** Lưới **2 cột** thẻ chọn (mẫu T2 của KB1, dạng lưới), **tên hãng dạng chữ**, không logo: Samsung · LG · Sony · TCL · Roku · Chromecast · Fire TV · Mac / PC · Other. Chọn **một**; thẻ được chọn nền `#E6ECFF`, viền 2pt `#0440FB`, dấu tích. Chọn xong tự sang Màn 3 sau 300ms.
* **Copywriting:** "Which TV or PC brand do you own?" / "TV hoặc máy tính bạn muốn kết nối thuộc hãng nào?"
* **Hành động:** Chạm 1 thẻ → lưu `device_brand` → Màn 3.
* ⚠️ Danh sách hãng là đề xuất (bản gốc chỉ ghi "các thương hiệu TV và PC/Mac") — cần chốt. Logo hãng **không** dùng (rủi ro nhãn hiệu, design-direction §9).

---

### Màn hình 3: Quiz — Tính năng cần nhất (Primary Features)
* **Mục tiêu:** Biết tính năng người dùng quan tâm để Paywall + màn mẹo nói đúng nhu cầu.
* **Giao diện:** Danh sách **chọn nhiều** (checkbox) 4 thẻ, mỗi thẻ có glyph trong ô `#E6ECFF`: Movies & Photo Library · Web Browser Mirroring · Whiteboard · Live Camera. Khác Màn 2: chọn nhiều nên **có CTA** "Continue →" (mờ đến khi chọn ≥ 1).
* **Copywriting:** "Which features matter most to you?" / "Tính năng nào quan trọng nhất với bạn?" · *Phụ đề:* "Pick all that apply"
* **Hành động:** Chọn ≥ 1 → Continue → lưu `primary_features[]` → Màn 4.

---

### Màn hình 4: Màn chờ cá nhân hoá (thay "Technical Calibration")
* **Mục tiêu:** Tạo cảm giác "app đang chuẩn bị riêng cho bạn" trong 2–3 giây trước khi xin quyền.
* **Giao diện (vẽ bằng code):** Vòng tiến trình tròn + 3 dòng checklist tick dần theo **chính lựa chọn của người dùng**: "Matching settings for **Samsung**" · "Preparing **Whiteboard** and **Photos**" · "Getting ready to find your TV". Không thanh %, không con số kỹ thuật.
* **Copywriting:** "Setting up SmartCast for you…" / "Đang thiết lập SmartCast cho bạn…"
* **Hành động:** Tự sang Màn 5 khi 3 dòng tick xong (~2.5s).
* ⚠️ Bản gốc: thanh **0% → 100% trong 3 giây** + "Calibrating **latency**" — đây là **tiến trình giả** + claim kỹ thuật không có thật (xem L2). Bản trên giữ nhịp chờ nhưng nói đúng việc app làm (áp lựa chọn quiz). **Cần chốt.**

---

### Màn hình 5: Cấp quyền & Quét ngay (2 trạng thái)
* **Mục tiêu:** Xin **một** quyền Mạng cục bộ đúng lúc, và cho thấy kết quả ngay sau khi cấp.
* **5a — Giải thích (`kb3-m5-permission`):** dùng lại KB1-M4: ảnh `ob_hero_permission_network` (3:4) + chip `Local Network`. Chỉ xin **Local Network** — Photos/Camera xin theo ngữ cảnh khi người dùng dùng tính năng đó. CTA "Allow & Scan →" → System Dialog.
* **5b — Đã tìm thấy (`kb3-m5-scan`):** dùng lại KB1-M5: radar vẽ bằng code, thiết bị tìm thấy bật ra thành chip; **thiết bị thuộc hãng đã chọn ở Màn 2 được đẩy lên đầu** + thẻ "Mirror to Web Browser · web.smartcast.app" + QR. CTA "Continue →".
* **Copywriting:** 5a "Secure **Local Network** Connection" · 5b "Your **TV** is ready" / "Chọn TV của bạn để tiếp tục"
* **Hành động:** Cấp quyền → quét → 5b → chạm thiết bị hoặc Continue → Màn 6.
* ⚠️ Người dùng **từ chối** quyền: 5b hiện trạng thái "Can't see your TV" + nút mở Settings + vẫn cho đi tiếp Màn 6 (không chặn phễu).

---

### Màn hình 6: Paywall chứng thực xã hội (Social Proof Paywall)
* **Mục tiêu:** Chuyển đổi bằng niềm tin số đông.
* **Giao diện (giải phẫu `paywall-kit/ai-chat` như KB1-M7, da tối T5):** Banner `ob_hero_paywall_pro` tràn viền trên; nút **[X] góc trên-trái**, Restore góc trên-phải. Tiêu đề, **khối social proof** (thẻ "4.8 ★★★★★ · App Store rating" + một review) thay cho lưới quyền lợi 2×2; toggle dùng thử 3 ngày; 2 thẻ gói; CTA; dòng pháp lý.
* **Copywriting:** *Tiêu đề:* "Join **5 Million** SmartCast Users Today" / "Tham gia cùng 5 triệu người dùng SmartCast ngay hôm nay" · *Review (tạm):* "The smoothest mirroring app I've used. Whiteboard and Live Camera are perfect for teaching!" — *Minh Tuấn · App Store review* · *CTA:* "Start 3-Day Free Trial →"
* **Giá:** **không hard-code** — StoreKit; chưa có thì `$—.——` (TODO: price).
* **Hành động:** Mua → Màn 9 · Chạm [X] → Màn 7.
* ⚠️ Bản gốc ghi "**Hard** Paywall" nhưng có [X] → về bản chất giống KB1 (đã chốt: [X] hiện trễ). Cần chốt: [X] **hiện ngay** (soft) hay **hiện trễ 3s** (như KB1). Gói nào (Năm + Tuần như KB1, hay Năm + Tháng) — bản gốc không ghi.
* ⚠️ 4.8 / 5M / tên người review là hằng số / remote config, **chưa kiểm chứng** (Guideline 2.3.1 / 5.6).

---

### Màn hình 7: Exit Discount 50% (Ưu đãi níu chân)
* **Mục tiêu:** Giữ người dùng nhạy cảm về giá khi họ đóng Paywall [92].
* **Giao diện:** **Dùng lại vé giảm giá KB1-M7b** (huy chương `ob_hero_exit_gift` trồi khỏi vé, đường xé, "50% OFF" 64pt đỏ, đồng hồ ô số **05 : 00**), Restore · Terms · Privacy, [X] trên vé.
* **Copywriting:** *Nhãn:* "ONE-TIME OFFER" · *Tiêu đề:* "Wait! One-Time Special Offer" / "Đợi đã! Ưu đãi đặc biệt chỉ xuất hiện 1 lần" · *Ưu đãi:* "50% OFF the Yearly plan" · *Giá:* giá gốc gạch ngang + giá mới (`$—.——`) · *CTA:* "Claim 50% Off Now →" · *Phụ:* "No thanks, I'll miss this offer"
* **Hành động:** Claim → Màn 8 · No thanks / [X] → Màn 9 (bản miễn phí).
* ⚠️ Bản gốc: "pop-up **màu đỏ/cam** nổi bật" — design-direction §2 chỉ cho đỏ ở **chi tiết khẩn cấp** (đồng hồ, nhãn giảm giá), không phủ cả pop-up; giữ vé tối của KB1. Giá $14.99 / $29.99 trong bản gốc → `$—.——` (TODO: price).

---

### Màn hình 8: Xác nhận ưu đãi (Discount Applied)
* **Mục tiêu:** Khẳng định ưu đãi đã được giữ, đẩy người dùng hoàn tất mua.
* **Giao diện (khu Pro, vẽ bằng code):** Vé KB1-M7b ở trạng thái **đã áp dụng**: đồng hồ thay bằng dấu tích tròn + "50% discount applied"; tóm tắt: gói Năm, giá gốc gạch ngang, giá mới, "then renews at $—.——/year"; Restore · Terms · Privacy.
* **Copywriting:** *Tiêu đề:* "Your **50%** Discount Is Applied" / "Đã áp dụng ưu đãi 50%" · *CTA:* "Continue to Purchase →"
* **Hành động:** CTA → **sheet thanh toán của App Store** (StoreKit, Face ID do hệ thống) → thành công → Màn 9.
* ⚠️ Bản gốc: "nút **FaceID** hoàn tất giao dịch" — app **không** tự vẽ nút Face ID; xác thực nằm trong sheet thanh toán của Apple. CTA của app chỉ mở sheet đó.

---

### Màn hình 9: Mẹo nhanh & Vào app (Quick Tips & Start)
* **Mục tiêu:** Giảm lỗi kết nối lần đầu (nguyên nhân gỡ app phổ biến), kết thúc onboarding.
* **Giao diện (nền sáng):** Ảnh **ngang 16:9** `ob_hero_tips` (router + iPhone + TV chung mạng). Dưới là **3 dòng mẹo** dạng glyph + tiêu đề + mô tả:
  1. `wifi` **Same Wi-Fi network** — "Connect your iPhone and TV to the same Wi-Fi, 5GHz works best."
  2. `shield` **Turn off VPN** — "A VPN can hide your TV from SmartCast."
  3. `tv` **Keep your TV on** — "Make sure your TV is on and its screen-sharing feature is enabled." *(mẹo thứ 3 là copy tạm — bản gốc chỉ có 2)*
* **Copywriting:** *Tiêu đề:* "3 Tips for a **Smooth** Connection" / "3 mẹo để kết nối mượt" · *CTA:* "Enter App →" / "Vào ứng dụng"
* **Hành động:** Enter App → màn chính (Pro hoặc miễn phí tuỳ kết quả Màn 6–8).

---

## Duyệt logic (2026-10-12)

| # | Chỗ trong bản gốc | Vì sao chưa triển khai được như viết | Xử lý trong bản này |
|---|---|---|---|
| L1 | Màn 1 "lớn gấp **10 lần**" | Đúng theo đường chéo (65/6 ≈ 10.8), sai theo diện tích | Giữ "10x", không thêm đơn vị khác |
| L2 | Màn 4 thanh **0→100% trong 3s** + "Calibrating **latency**" | Tiến trình giả + claim kỹ thuật không có thật (Guideline 2.3.1) | Màn chờ cá nhân hoá, checklist theo lựa chọn quiz, không %. **Cần chốt** |
| L3 | Màn 6 "**Hard** Paywall" nhưng có [X] | Có [X] ngay = soft paywall | **Cần chốt** [X] hiện ngay hay hiện trễ (KB1: trễ 3s) |
| L4 | Màn 6 không ghi gói | Thiếu dữ liệu dựng thẻ gói | Đề xuất dùng như KB1 (Năm Best Value + Tuần, toggle trial). **Cần chốt** |
| L5 | Màn 7 giá $14.99 / $29.99 | Giá không hard-code (AI-UI-NOTES) | `$—.——` + TODO: price |
| L6 | Màn 7 "pop-up **màu đỏ/cam**" | Đỏ chỉ cho chi tiết khẩn cấp (design-direction §2) | Dùng vé tối KB1, đỏ ở nhãn/đồng hồ/50% |
| L7 | Màn 8 "nút **FaceID**" | Face ID là của sheet thanh toán Apple, app không vẽ | CTA mở sheet StoreKit |
| L8 | Màn 5 xin quyền gì? | Bản gốc chỉ nói Mạng cục bộ | Chỉ Local Network; Photos/Camera xin theo ngữ cảnh |
| L9 | Màn 9 chỉ có **2** mẹo nhưng tiêu đề "3 mẹo" | Thiếu một mẹo | Thêm mẹo "Keep your TV on" (copy tạm) |
| L10 | Không nói người dùng **không mua** đi đâu | Thiếu nhánh | No thanks ở Màn 7 → Màn 9 bản miễn phí |

### Điểm cần chốt trước khi dựng
1. **Màn 4:** đồng ý thay thanh % "calibrating latency" bằng màn chờ cá nhân hoá? (L2)
2. **Màn 6:** [X] hiện ngay hay hiện trễ 3s? Gói Năm + Tuần như KB1, hay Năm + Tháng? (L3, L4)
3. **Màn 2:** danh sách hãng thiết bị cuối cùng.
4. **Copy tạm cần duyệt:** mô tả Màn 1, review Màn 6, mẹo thứ 3 Màn 9.

---

## Tuân thủ Apple App Store Guideline 3.1.2 (Paywall, Exit, Xác nhận ưu đãi)
1. **Minh bạch giá:** Giá tổng /year to nhất; giá quy đổi nhỏ hơn; ở Exit + Màn 8 hiện **cả giá gốc và giá sau giảm**, và giá gia hạn sau năm đầu [87, 151].
2. **Yếu tố bắt buộc:** Restore Purchases, Terms of Use (EULA), Privacy Policy trên Màn 6, 7 và 8 [87, 151].
3. **Ưu đãi thật:** "One-time" phải đúng là một lần (không hiện lại mỗi lần mở Paywall) — tránh "discount ảo" (rủi ro UX ở bảng thông số).

---

## Prompt ảnh hero

> **Áp dụng toàn bộ quy tắc ảnh của KB1** ([KB1 · Prompt ảnh hero](kb1-value-first-hard-paywall.md#prompt-ảnh-hero)): công cụ chỉ có **1:1 · 16:9 · 9:16 · 4:3 · 3:4**; **không chừa vùng trống** (chip tự che); **không chữ**, chặn đích danh các thứ hay sinh chữ; cảnh cast thì **màn nguồn và màn đích giống hệt nhau**; chặn xanh da trời; **đính kèm bộ 3 ảnh quiz KB1** (`public/images/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`) làm style reference; duyệt theo **checklist** cuối file KB1.

| Mã ảnh | Màn | Tỉ lệ | Kích thước tạo | Hiển thị (reference) → @3x | Trạng thái |
|---|---|---|---|---|---|
| `ob_hero_problem_agitation` | 1 | 3:4 dọc | 1536×2048 | ~300×400pt → 900×1200 | ❌ lần 1 thừa một màn/khối giữa người và TV — tạo lại |
| `ob_hero_permission_network` | 5a | 3:4 dọc | — | 246×328pt | ✅ dùng lại KB1 |
| `ob_hero_paywall_pro` | 6 | tạo 16:9, hiển thị 21:9 | — | 390×167pt | ✅ dùng lại KB1 |
| `ob_hero_exit_gift` | 7 | 1:1 cắt tròn | — | Ø116pt | ✅ dùng lại KB1 |
| `ob_hero_tips` | 9 | 16:9 ngang | 2048×1152 | 342×192pt → 1026×576 | chờ tạo |

### `ob_hero_problem_agitation` — Màn 1 (3:4 dọc)
**Bố cục:** Chia đôi dọc bằng một đường cong nét đứt. Trái: một người nheo mắt cúi nhìn điện thoại nhỏ trong tay. Phải: **cùng người đó** ngả trên sofa, mỉm cười xem TV lớn. Trên điện thoại và trên TV là **cùng một** bức ảnh (núi + mặt trời) — chỉ khác kích thước, nhấn ý "cùng nội dung, màn lớn hơn". Chip `6″` / `65″` của app đè lên hai nửa — tự che, không chừa chỗ.
> Nguồn chữ dễ sinh ở ảnh này: số "6″ / 65″", thước đo, mũi tên có nhãn → cấm đích danh.
> ⚠️ Lần 1: phong cách + màu đạt, nhưng nửa phải có **thêm một khối trắng trên chân đế giữa người và TV** (như TV thứ hai quay lưng) → không rõ đang xem màn nào; người hai nửa khác cỡ. Prompt đã thêm: **đúng một TV**, không vật gì giữa sofa và TV, cùng cỡ + cùng áo.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Vertical composition split into a left and a right half by one curved dashed line. Left half: a simple cartoon person squinting and leaning in close to a small smartphone held in one hand. Right half: the same person — same size, same shirt, same head shape — sitting relaxed on a small rounded sofa seen from the side, smiling, looking at ONE large flat-screen TV standing on two short feet in front of the sofa. Exactly one TV in the whole image; nothing stands between the sofa and the TV — no second screen, no board, no box, no TV seen from the back. The phone screen and the TV screen show exactly the same simple picture — one rounded mountain and a sun — only different in size.
Coloring: both screens #E6ECFF with a #BDCCFD mountain and a royal blue #0440FB sun, person's shirt #BDCCFD, head and hands white, sofa #BDCCFD, TV and phone bodies white, dashed divider royal blue #0440FB.
No text anywhere: no numbers, no inch marks, no "6" or "65", no rulers, no measurement arrows, no labels, no captions.
Subject centered, about 90% of the width and 80–90% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners, never thin or gray. Clean flat vector, one clean line per edge. Strictly limited palette: black, royal blue #0440FB, light blue #BDCCFD (soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, white — nothing else. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene — one continuous blob, no rectangles, no panels, no white boxes cut into it. No reflections, no shadows, no gradients, no 3D. Absolutely no text, letters, numbers, logos or watermark.
Portrait 3:4, 1536x2048.
```

### `ob_hero_tips` — Màn 9 (16:9 ngang)
**Bố cục:** Router Wi-Fi ở giữa phía trên phát 3 cung sóng xuống hai bên; trái là iPhone, phải là TV — cả hai có dấu tích tròn (cùng mạng). Một khiên nhỏ có dấu gạch chéo nằm cạnh iPhone gợi ý "tắt VPN". Đây **không** phải cảnh cast → màn iPhone/TV để trơn.
> Nguồn chữ dễ sinh: tên mạng Wi-Fi, chữ "VPN", "5GHz", đèn router có nhãn → cấm đích danh.
```
Using the attached images as the exact style reference (same thick black outlines of the same thickness, same soft rounded shapes, same organic background blob, same amount of white space):
Wide horizontal composition. In the top center, a rounded Wi-Fi router with two short antennas and three small round lights, sending three Wi-Fi arcs down to both sides. On the left, a smartphone standing upright; on the right, a flat-screen TV on two short feet. Each device has a small round check-mark badge on its corner. Next to the smartphone, a small shield crossed by one diagonal line, suggesting a VPN turned off. The phone and TV screens are plain #E6ECFF with nothing on them.
Coloring: router body white with royal blue #0440FB lights, Wi-Fi arcs royal blue #0440FB, check-mark badges royal blue with white ticks, small shield #BDCCFD with a black diagonal line, device screens #E6ECFF, device bodies white.
No text anywhere: no network name, no "VPN", no "5GHz", no labels on the router, no numbers, no captions.
Subject centered, about 85% of the width and 80% of the height, at least 8% margin on every side.
Outlines: pure black, thick and uniform — about 1.2% of the image width — rounded ends and rounded corners, never thin or gray. Clean flat vector, one clean line per edge. Strictly limited palette: black, royal blue #0440FB, light blue #BDCCFD (soft periwinkle, not sky blue, not cyan), very light blue #E6ECFF, white — nothing else. Background: pure white #FFFFFF with one soft organic #E6ECFF blob behind the scene — one continuous blob, no rectangles, no panels, no white boxes cut into it. No reflections, no shadows, no gradients, no 3D. Absolutely no text, letters, numbers, logos or watermark.
Landscape 16:9, 2048x1152.
```

**NEGATIVE** (cả 2 ảnh):
```
second TV, two screens, TV seen from the back, blank board, white box on legs, white boxes, rectangular panels, empty cut-out areas, text, letters, words, numbers, inch marks, ruler, measurement arrows, network name, VPN, 5GHz, labels, captions, thin lines, gray outlines, sky blue, cyan, baby blue, yellow, gold, green, orange, red, skin tone, shadow, gradient, glare, 3D, photorealistic, logo, watermark
```
