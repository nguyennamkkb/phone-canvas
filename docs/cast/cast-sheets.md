# Sheet sau khi cast — xác nhận + mời gói Sale

> **Board:** `project/smartscreen/screens/` — `cast-photo` (nền) → `cast-photo-check` (sheet 1) → `cast-photo-sale` (sheet 2).
> **Phong cách ảnh:** dùng nguyên quy tắc ảnh onboarding — [KB1 · Prompt ảnh hero](../onboarding/kb1-value-first-hard-paywall.md#prompt-ảnh-hero) (STYLE-LIGHT, NEGATIVE, checklist duyệt). Đính kèm bộ 3 ảnh quiz (`project/smartscreen/assets/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`) làm style reference.

## Luồng

```
Cast ảnh/video thành công lần đầu với một TV
→ Sheet 1 "Is the photo showing on your TV?"
   ├─ Yes, I see it → (cùng sheet, đổi nội dung mờ dần) Sheet 2 "Casting works! Get Pro for half the price"
   │                    ├─ Claim 50% Off → StoreKit
   │                    └─ Maybe later / X / kéo xuống → đóng
   ├─ No, it's not showing → màn khắc phục (cùng Wi-Fi, tắt VPN, chọn lại TV) — không mời mua
   └─ X / kéo xuống → đóng, không hỏi lại trong phiên
```

Khung chung của 2 sheet nằm trong `tokens.css` (lớp `.cast-sheet`):
- Thẻ trắng nổi, bo đủ 4 góc, cách mép màn 8pt.
- Đầu sheet: tiêu đề nhỏ ở giữa + nút X tròn.
- Thân: hình nhỏ ở giữa → tiêu đề đậm → mô tả xám → nút chính accent + nút phụ xám nhạt.

Hình giữa sheet là ảnh minh hoạ 4:3 cỡ 140×105pt (lớp `.cast-sheet-art`), giống nhau ở cả 2 sheet. Khi sheet đổi nội dung, hình chỉ thay tại chỗ: `cast_check_tv` → `cast_sale_pro`. Sheet 1 trước đây dùng TV vẽ bằng code, ghép ảnh thật của người dùng vào. Cách đó đã bỏ (2026-10-13): ghép ảnh thật vào khung TV nhỏ rất khó, và ảnh dọc hoặc ngang đều bị lệch tỉ lệ.

## Ảnh cần tạo

| Mã ảnh | Màn | Tạo | Hiển thị (reference 390) → @3x | Trạng thái |
|---|---|---|---|---|
| `cast_check_tv` | Sheet 1, hình giữa | 4:3 · 2048×1536 | 140×105 → 420×315 | ✅ duyệt, đã gắn (nguồn `project/smartscreen/assets/source/ai-studio-img_1791862398557_4cxl2v.png`, nền đã chỉnh về `#E6ECFF`). Ghi chú nhỏ: mặt trời có tia, còn ở `cast_sale_pro` thì không; tay chạm mép trái và mép dưới |
| `cast_sale_pro` | Sheet 2, hình giữa | 4:3 · 2048×1536 | 140×105 → 420×315 | ✅ duyệt, đã gắn (nguồn `project/smartscreen/assets/source/ai-studio-img_1791862217617_r62l3q.png`, nền đã chỉnh về `#E6ECFF`) |

### `cast_check_tv` — Sheet 1 "Is the photo showing on your TV?" (4:3)

**Ý ảnh:** điện thoại vừa gửi ảnh lên TV, và **cùng một ảnh** đang hiện trên cả hai màn. Ảnh không có dấu tích, vì dấu tích là "câu trả lời" và chỉ xuất hiện ở sheet 2 (`cast_sale_pro`).

**Bắt buộc đính kèm `cast_sale_pro` làm reference**, ngoài bộ 3 ảnh quiz. Như vậy 2 ảnh sẽ vẽ **cùng một chiếc TV**: cùng dáng, cùng chân, cùng hình núi và mặt trời. Khi sheet chuyển, người dùng thấy TV giữ nguyên, chỉ có thêm dấu tích.
```
Using the attached images as the exact style reference (same thick black outlines, same soft rounded shapes, same organic background blob, same amount of white space). Draw the TV exactly like the TV in the attached price-tag image: same shape, same short feet, same screen picture.
A bold, simple spot illustration that must read clearly at a tiny 140x105 size.
A flat-screen TV on two short feet fills the upper-right part of the frame. On its screen: one rounded mountain and a sun. In the bottom-left, one hand holds a smartphone in landscape orientation; the phone screen shows exactly the same mountain and sun picture as the TV, only smaller. One curved royal blue dashed arrow flies from the phone up to the TV. Three small Wi-Fi arcs above the phone.
Coloring: TV and phone screen backgrounds #E6ECFF, the mountain #BDCCFD, the sun royal blue #0440FB, dashed arrow and Wi-Fi arcs royal blue #0440FB, hand and device bodies white.
No check mark, no badge, no tag, no sparkles — only the TV, the hand with the phone, the arrow and the Wi-Fi arcs.
Subject centered, about 85% of the width and 80–90% of the height, at least 8% margin on every side.
Background: pure white with ONE flat, solid #E6ECFF organic blob behind the devices — no pattern, no squiggles, no texture; the four corners stay pure white.
[STYLE-LIGHT]
Landscape 4:3, 2048x1536.
```
**Ô negative:**
- Dán khối **NEGATIVE** của KB1.
- Thêm: `check mark, badge, question mark, price tag, sparkles, second phone, two different pictures, pattern, squiggles, decorative texture`.

**Duyệt:**
- Hình trên điện thoại và trên TV phải giống hệt nhau.
- Đặt cạnh `cast_sale_pro` ở cỡ 140×105: phải đọc được là cùng một TV.

### `cast_sale_pro` — Sheet 2 "Casting works! Get Pro for half the price" (4:3)

**Ý ảnh:** vừa nói "đã chiếu thành công" (TV đang hiện ảnh + dấu tích), vừa gợi "ưu đãi" (một nhãn giá trống, không chữ, không số).

Ảnh hiển thị rất nhỏ (140pt), nên yêu cầu:
- Chỉ 3 chủ thể: TV, dấu tích, nhãn giá.
- Nét dày.
- Không chi tiết vụn.
```
Using the attached images as the exact style reference (same thick black outlines, same soft rounded shapes, same organic background blob, same amount of white space):
A bold, simple spot illustration that must read clearly at a tiny 140x105 size.
A flat-screen TV on two short feet fills the center of the frame. On its screen: one rounded mountain and a sun. A large round royal blue check-mark badge overlaps the TV's top-right corner. In front of the TV's bottom-left corner, a blank rounded price tag with a small hole and a short curved string leans against the TV foot — the tag is completely blank, no symbols on it. Three small sparkles around the badge.
Coloring: TV screen background #E6ECFF, the mountain #BDCCFD, the sun royal blue #0440FB, the check badge royal blue #0440FB with a white check mark, the price tag white with a #BDCCFD stripe along its edge, sparkles royal blue #0440FB, TV body white.
Subject centered, about 85% of the width and 80–90% of the height, at least 8% margin on every side.
Background: pure white with ONE flat, solid #E6ECFF organic blob behind the TV — no pattern, no squiggles, no texture; the four corners stay pure white.
[STYLE-LIGHT]
Landscape 4:3, 2048x1536.
```
**Ô negative:**
- Dán khối **NEGATIVE** của KB1.
- Thêm: `percent sign, dollar sign, price text, numbers on the tag, crown, gold, coins, shopping cart, pattern, squiggles, decorative texture`.

**Duyệt:**
- Theo checklist KB1.
- Thu ảnh về 140×105 và đặt cạnh sheet thật: phải đọc ngay được "TV đã chiếu + ưu đãi".
- Blob lệch màu thì chỉnh hậu kỳ về `#E6ECFF`, như ảnh Home Ideas (`docs/home/home-redesign.md` §5).

**Gắn vào board:** thay `<div class="ob-ph cast-photo-sale-art" data-asset="cast_sale_pro">…</div>` bằng `<img class="art cast-photo-sale-art" src="/images/cast_sale_pro.png" … data-asset="cast_sale_pro">`, thêm `object-fit: cover`.

## Cần chốt

- **Terms · Privacy · Restore đã bỏ khỏi sheet 2 (2026-10-13).** Rủi ro Guideline 3.1.2: màn nào mua gói thuê bao trực tiếp phải có link Terms of Use và Privacy Policy bấm được trong app. Để giữ sheet gọn mà vẫn qua review, chọn một trong các cách:
  1. Nút CTA không mua ngay mà mở paywall đầy đủ (KB1-M7) với gói Sale đã chọn sẵn; paywall đó có đủ link.
  2. Thêm một dòng chữ nhỏ dưới mô tả: "By continuing you agree to Terms & Privacy", với 2 chữ là link.

- Mức giảm 50% áp cho gói nào: Năm hay cả Tuần? Giá hiện là `$—.——`, chờ StoreKit.
- Luồng có dùng cho cast **video** không? Tiêu đề sheet 1 hiện là "photo"; với video thì đổi thành "Is the video playing on your TV?".
- Màn khắc phục khi bấm "No" chưa dựng.
