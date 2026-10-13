# Home SmartCast — phương án cải tiến + prompt ảnh

> **Nguồn:** `project/smartscreen/assets/source/Main.svg` (Figma 375×812, màn Home đang chạy).
> **Board:** `project/smartscreen/screens/` — `home-current` (dựng lại 1:1 để đối chiếu) · `home-a-grid` · `home-b-stage`.
> **2026-10-13:** phương án C (Bento + dock) **đã loại** — màn `home-c-bento` và 5 prompt `home_bento_*` đã gỡ.
> **Phong cách ảnh:** dùng nguyên bộ quy tắc ảnh của onboarding — [KB1 · Prompt ảnh hero](../onboarding/kb1-value-first-hard-paywall.md#prompt-ảnh-hero) (STYLE-LIGHT, NEGATIVE, checklist duyệt). Home và onboarding phải đọc thành một app.

---

## 1. Màn hiện tại — số đo và vấn đề

**Số đo (từ SVG):**
- Nền `#F5F4F9`, lề 16.
- Tiêu đề "CastTV" 34 Bold.
- Hàng trạng thái: "No Device Connected" 17 + "Tap to connect" 15, cả hai màu `#464646`. Nút Connect viền 1.5 `#0440FB`, kích thước 82.5×30.5, bo 9.25.
- 2 thẻ hero 165×202, bo 20, cách nhau 13:
  - Thẻ xanh ngọc `#2CFFBC`, chữ `#171F36`.
  - Thẻ `#0440FB`, chữ trắng.
  - Minh hoạ trong thẻ là ảnh raster (TV + kệ, iMac).
- 5 ô tính năng 166×115, bo 20, nền `#E6ECFF`, cách nhau 11 ngang và 12 dọc. Mỗi ô có chip icon 40×40 cách mép 8.
- Màu 5 chip:
  - Camera: `#E99B9B`
  - Online Images: `#F1A762`
  - Video: `#8F9CE1`
  - Photo: `#7DA979`
  - White Board: `#EA6767`

| # | Vấn đề | Hệ quả |
|---|---|---|
| 1 | **Kết nối, việc phải làm đầu tiên, trông như việc phụ.** Chữ xám, nút viền mảnh cao 31pt (dưới mức chạm 44pt). | Người mới không biết bắt đầu từ đâu. Thao tác nhiều nhất lại có vùng chạm nhỏ nhất. |
| 2 | **Hai thẻ hero là cùng một việc** (mirror), chỉ khác đích (TV hoặc Mac/PC). Tên cũng lệch nhau: "Screen Mirror to TV" và "Screen Mirroring Mac, PC, Desktop". | Màn chiếm 1/4 diện tích cho một quyết định mà người dùng chưa cần đưa ra. |
| 3 | **7 màu không thuộc hệ màu nào:** xanh ngọc, hồng, cam, tím, lục, đỏ, cộng với xanh brand. | Lệch hoàn toàn với onboarding (chỉ dùng xanh `#0440FB`). Đỏ đang được dành cho Exit Offer. |
| 4 | **Ô White Board mồ côi**, bỏ trống nửa hàng cuối. | Lưới trông dở dang. |
| 5 | **Lỗi copy:** White Board ghi "Cast Online Images to TV". | Lỗi nội dung thật, cần sửa ngay ở bản đang chạy. |
| 6 | **Ô tính năng cao 115pt nhưng chỉ có 2 dòng chữ và 1 chip**, khoảng 60% là nền trống. | Màn dài mà ít thông tin. |
| 7 | **Chữ trong thẻ hero đè lên minh hoạ.** Trên iPhone SE, mô tả thẻ xanh đè lên icon Wi‑Fi. | Khó đọc trên máy nhỏ. |
| 8 | **Không có lối vào Pro.** | Người dùng Free không có đường nâng cấp ngoài paywall onboarding. |
| 9 | **Tên app là "CastTV"** trong khi onboarding là "SmartCast". | Cần chốt một tên. |

---

## 2. Các phương án

Cả hai phương án còn lại đều sửa vấn đề 1–9:
- Dùng tên SmartCast và màu token của onboarding.
- Kết nối có vùng chạm ≥ 44pt.
- Gộp **Photos + Video thành "Photos & Videos"** vì PhotosPicker chọn được cả hai; KB1-M8 Welcome cũng đặt tên ô như vậy. Nếu sản phẩm muốn tách hai ô thì cần chốt.
- Có nút PRO ở header, chỉ hiện với người dùng Free.

### A · Lưới gọn — `home-a-grid`

Giữ kiến trúc màn hiện tại theo thứ tự: header → kết nối → Mirror → lưới. Chỉ sửa đúng các lỗi đã nêu.
- **Thẻ kết nối:** thẻ trắng có glyph TV, trạng thái, gợi ý "Same Wi‑Fi as your TV" và nút Connect đặc 44pt.
- **Thẻ Mirror:** gộp 2 thẻ hero cũ làm một, có 2 nút đích là **To TV** (nút chính) và **To Mac or PC** (nút phụ). Ảnh dùng lại `ob_hero_mirror_tv_web` của onboarding.
- **Lưới 2×2:** Photos & Videos, Online Images, Live Camera, Whiteboard. Mọi icon dùng chung một màu accent.
- **Ảnh mới:** không cần.
- **Công dev:** thấp nhất, vì layout giữ nguyên, chỉ đổi thẻ.
- **Hạn chế:** vẫn là "danh sách tính năng". Mọi thứ có trọng lượng gần bằng nhau.

### B · Sân khấu TV — `home-b-stage`

Home xoay quanh **một việc**: chưa kết nối thì là **Connect**, kết nối rồi thì là **Start Mirroring**.
- **Sân khấu:** TV vẽ bằng code (cùng TV ở KB1-M6) phản ánh trạng thái thật.
  - Chưa kết nối: vòng sóng chờ và chip "No TV connected".
  - Đã kết nối: ảnh xem trước, tên TV, và CTA đổi thành Start Mirroring.
- **CTA:** chỉ một nút 56pt trên màn. Đích phụ "No TV? Mirror to any browser" (QR) là dòng chữ bên dưới.
- **Quick cast:** 4 nút tròn kiểu Control Center.
- **Ideas for the big screen:** thẻ tình huống cuộn ngang (Family movie night, Present your slides, Go live on TV). Người dùng thấy *tình huống dùng* thay vì tên tính năng. Chạm thẻ thì mở tính năng tương ứng.
- **Ảnh mới:** 3 ảnh 4:3 (`home_idea_*`).
- **Ưu điểm:** người mới biết ngay phải làm gì. Phần Ideas gợi ý cách dùng nên tăng số tính năng được thử.
- **Hạn chế:** người dùng quen tay mất một bước để vào tính năng ít dùng, vì các tính năng nằm sau sân khấu.

### ~~C · Bento + dock kết nối~~ — đã loại (2026-10-13)

### So sánh

| | Hiện tại | A · Lưới gọn | B · Sân khấu TV |
|---|---|---|---|
| Việc chính rõ ràng | ✗ | ◐ thẻ kết nối đầu màn | ✓ một CTA duy nhất |
| Chạm tới tính năng | 1 chạm | 1 chạm | 1 chạm (Quick cast) |
| Đồng bộ onboarding | ✗ | ✓ | ✓ (TV của KB1-M6) |
| Ảnh mới | — | 0 | 3 |
| Công dev | — | Thấp | Trung bình (sân khấu 2 trạng thái) |
| Rủi ro | — | Thấp, ít khác biệt | Người quen tay mất một bước |

**Đề xuất:** **B** cho người dùng mới, vì luồng onboarding KB1/KB3 đều dẫn tới "kết nối rồi cast". Nếu muốn ship nhanh trước thì dùng **A** làm bước 1. Hai phương án có thể A/B test như onboarding.

---

## 3. Ảnh mới — bảng tổng

Quy tắc chung giống onboarding:
- Công cụ chỉ có các tỉ lệ 1:1 · 16:9 · 9:16 · 4:3 · 3:4.
- Ảnh hiển thị `aspectFill`.
- Không chữ, không số, không logo.
- Không chừa vùng trống.
- Trong cảnh cast/mirror, **màn nguồn và màn đích phải giống hệt nhau**.
- **Đính kèm bộ 3 ảnh quiz** (`project/smartscreen/assets/ob_quiz_family.png`, `ob_quiz_work.png`, `ob_quiz_creative.png`) làm style reference.

| Mã ảnh | Màn | Tạo | Hiển thị (reference 390) → @3x | Trạng thái |
|---|---|---|---|---|
| `home_idea_movie_night` | B · Ideas 1 | 4:3 · 2048×1536 | 156×117 → 468×351 | ✅ duyệt, đã gắn (nền đã chỉnh màu hậu kỳ) |
| `home_idea_present` | B · Ideas 2 | 4:3 · 2048×1536 | 156×117 → 468×351 | ✅ lần 2 duyệt, đã gắn (nền đã chỉnh màu hậu kỳ) |
| `home_idea_live_camera` | B · Ideas 3 | 4:3 · 2048×1536 | 156×117 → 468×351 | ✅ lần 2 duyệt, đã gắn (nền đã chỉnh màu hậu kỳ) |

Mỗi prompt bên dưới có 4 khối giống onboarding: Cảnh + bố cục · Coloring · Lấp khung · STYLE.
- Thay `[STYLE-LIGHT]` bằng khối **STYLE-LIGHT** trong KB1.
- Ô negative dán khối **NEGATIVE** của KB1 và thêm `white boxes, rectangular panels, empty cut-out areas, frames around the scene`.
- Riêng ảnh có camera (`home_idea_live_camera`): thêm `camera facing the viewer, lens facing the viewer, back of the phone, subject outside the camera's view`.

---

## 4. Prompt

### ✅ `home_idea_movie_night` — B · Ideas "Family movie night" (4:3) — ĐÃ DUYỆT
**Lần 1 (2026-10-13) đạt.** Nguồn: `project/smartscreen/assets/source/04_Using_the_attached_images_4-3.jpg`.
- Bố cục đúng: nhìn từ sau sofa, có bỏng ngô, có mũi tên từ điện thoại tới TV.
- Không có điểm ảnh ngoài bảng màu.
- **Hậu kỳ:** blob ra màu xám lavender `#E8E8F0` thay vì `#E6ECFF`. Tôi đã đưa blob về đúng `#E6ECFF`, phần mép blob chuyển dần sang trắng. Bản dùng: `project/smartscreen/assets/home_idea_movie_night.png`.
- **Ghi chú nhỏ:** TV có thêm 2 đám mây, điện thoại thì không. Ở cỡ 156pt không nhìn ra, nên chấp nhận.
```
Using the attached images as the exact style reference (same thick black outlines, same soft rounded shapes, same organic background blob, same amount of white space):
A cozy living-room scene seen from behind a small sofa. Two adults and a child sit on the sofa, drawn as very simple rounded shapes seen from the back. In front of them, a large flat-screen TV on two short feet shows a simple picture of one rounded mountain and a sun. One adult holds up a smartphone in landscape orientation; the phone screen shows exactly the same mountain and sun picture as the TV, only smaller. One curved dashed arrow flies from the phone to the TV. A small popcorn bucket sits on the sofa arm.
Coloring: sofa #BDCCFD, people filled white with black outlines, TV and phone screen backgrounds #E6ECFF, the mountain #BDCCFD, the sun and the dashed arrow royal blue #0440FB, popcorn bucket white with royal blue #0440FB stripes.
Subject centered, about 90% of the width and 75–85% of the height, at least 8% margin on every side.
[STYLE-LIGHT]
Landscape 4:3, 2048x1536.
```

### ✅ `home_idea_present` — B · Ideas "Present your slides" (4:3) — ĐÃ DUYỆT (lần 2)
**Lần 2 (2026-10-13) đạt.** Nguồn: `project/smartscreen/assets/source/ai-studio-img_1791860678033_yby6ut.png`.
- Slide trên điện thoại có đủ 3 cột và mũi tên, giống hệt slide trên TV.
- Nền là một blob phẳng, không hoạ tiết. Không có điểm ảnh ngoài bảng màu, 4 góc trắng.
- Nét dày 0.42% bề ngang, bằng ảnh live_camera.
- **Hậu kỳ:** blob ra `#D2D8FC`, đậm hơn `#E6ECFF`. Tôi đã đưa về `#E6ECFF` giống 2 ảnh còn lại.
- **Ghi chú nhỏ, chấp nhận:** TV đứng trên chân màn máy tính; thân người bị blob cắt ở đáy.

**Lần 1 (2026-10-13) trượt.** Nguồn: `project/smartscreen/assets/source/03_Using_the_attached_images_4-3.jpg`.
- Blob bị lấp bằng **hoạ tiết nét lượn nhiều màu nhạt** (be, lục, cam). Ảnh mất nền một màu `#E6ECFF` của cả bộ.
- Điện thoại chỉ có 3 cột, **thiếu mũi tên**, nên không giống hệt slide trên TV.
- TV đứng trên chân màn máy tính. Lỗi này chấp nhận được.

Prompt dưới đây đã sửa: blob là **một mảng phẳng liền, không hoạ tiết**, slide trên điện thoại phải có cả mũi tên. Ô negative thêm `pattern, squiggles, doodles in the background, decorative texture, confetti`.
```
Using the attached images as the exact style reference (same thick black outlines, same soft rounded shapes, same organic background blob, same amount of white space):
A person stands next to a large flat-screen TV on a short stand, presenting. The TV screen shows a simple slide: three rounded vertical bars of increasing height and one upward arrow. The person holds a smartphone in landscape orientation; the phone screen shows exactly the same slide — the same three bars AND the same upward arrow — only smaller. Three small Wi-Fi arcs between the phone and the TV.
Coloring: person filled #BDCCFD with a white shirt, TV and phone screen backgrounds #E6ECFF, the bars #BDCCFD with black outlines, the arrow and the Wi-Fi arcs royal blue #0440FB, device bodies white.
Background: pure white with ONE flat, solid #E6ECFF organic blob — no pattern, no squiggles, no doodles, no texture inside or around the blob.
Subject centered, about 90% of the width and 75–85% of the height, at least 8% margin on every side.
[STYLE-LIGHT]
Landscape 4:3, 2048x1536.
```

### ✅ `home_idea_live_camera` — B · Ideas "Go live on TV" (4:3) — ĐÃ DUYỆT (lần 2)
**Lần 2 (2026-10-13) đạt.** Nguồn: `project/smartscreen/assets/source/01_Using_the_attached_images_4-3.jpg`.
- Có góc nhìn ngang, ống kính quay vào con chó, nón tầm nhìn nét đứt rõ. Con chó trên TV giống hệt con chó thật.
- **Hậu kỳ:** blob ra màu xám xanh `#D8E0E8`. Tôi đã đưa về đúng `#E6ECFF`, phần mép blob chuyển dần sang trắng. Bản dùng: `project/smartscreen/assets/home_idea_live_camera.png`.

**Lần 1 (2026-10-13) trượt vì sai hướng camera.**
- Camera quay **ra phía người xem**: ta thấy mặt lưng máy và ống kính nhìn thẳng ra ngoài.
- Chú chó ngồi **dưới, lệch phải** chân tripod, nằm ngoài tầm nhìn của camera. Ảnh không đọc được thành "camera đang quay con chó".

Những phần đạt: con chó trên TV giống hệt con chó thật, đúng màu, có blob, không chữ.

**Sửa cho lần 2:**
- Tả hình học bằng **góc nhìn ngang (side view)**.
- Thứ tự trái → phải là **camera → con chó → TV**.
- Ống kính ở **cạnh phải** máy, quay thẳng vào con chó, **ngang tầm đầu** con chó.
- Thêm **nón tầm nhìn nét đứt** từ ống kính tới con chó.
- Cấm camera quay về phía người xem.
```
Using the attached images as the exact style reference (same thick black outlines, same soft rounded shapes, same organic background blob, same amount of white space):
Side view, everything on one floor line, arranged left to right: camera, puppy, TV.
On the left, a smartphone is mounted on a short tripod, seen from the side in landscape orientation. Its camera lens is on the phone's right edge and faces RIGHT, pointing straight at the puppy; the lens is at the same height as the puppy's head. Two thin royal blue dashed lines open from the lens toward the puppy like a viewing cone, showing exactly what the camera sees.
In the middle, a cute puppy sits on the floor directly in front of the lens, its body turned toward the camera, looking at the lens.
On the right, slightly behind, a large flat-screen TV on two short feet shows the live camera view: exactly the same puppy, in the same pose, larger. A small royal blue dot in the top corner of the TV screen (a dot only, no letters). One curved dashed arrow arcs high from the phone, over the puppy, to the TV.
The camera must clearly look at the puppy — never toward the viewer, never at the TV.
Coloring: puppy filled white with #BDCCFD ears and spots, TV screen background #E6ECFF, tripod and phone body white, the lens ring, the viewing-cone lines, the dot and the dashed arrow royal blue #0440FB.
Subject centered, about 90% of the width and 75–85% of the height, at least 8% margin on every side.
[STYLE-LIGHT]
Landscape 4:3, 2048x1536.
```

---

## 5. Gắn ảnh vào board

**Hậu kỳ màu nền (áp dụng cho cả 3 ảnh Ideas):** model thường cho blob lệch màu (xám xanh, xám lavender, xanh đậm).
- Mọi điểm ảnh sáng (kênh nhỏ nhất ≥ 190) và ngả xanh được trộn giữa trắng và `#E6ECFF`, theo độ đậm so với màu blob phổ biến nhất của ảnh.
- Kết quả: blob đúng `#E6ECFF`, mép blob chuyển dần sang trắng, nét và chi tiết đậm không đổi.
- Bản gốc vẫn giữ trong `assets/`.


1. Duyệt từng ảnh theo **checklist trong KB1**: màu, độ dày nét, blob, không chữ, hai màn giống hệt nhau. Sau đó đặt ảnh cạnh bộ 3 ảnh quiz ở cỡ hiển thị thật để so cùng phong cách.
2. Bản gốc đặt vào `project/smartscreen/assets/source/`. Bản dùng đặt vào `project/smartscreen/assets/<mã ảnh>.png`, màn tham chiếu `/project/smartscreen/assets/<mã ảnh>.png`.
3. Trong màn, thay `<div class="ob-ph … " data-asset="<mã>">…</div>` bằng `<img class="art …" src="/images/<mã>.png" data-asset="<mã>">`, giữ class kích thước của khung (`home-b-idea-ph` → `home-b-idea-art`) và thêm `object-fit: cover`.
