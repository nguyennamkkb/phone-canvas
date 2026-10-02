# 05 — Design DNA

Track 008 · designer research-only (KHÔNG code). Mục tiêu (§6 brief): mỗi project có bản sắc riêng nhưng tuân core; AI kế thừa DNA thay vì style ngẫu nhiên. Mẫu sống: `project/calo-ai/tokens.css` ("Sang tuoi": nền trắng sạch, nhóm xám lạnh, CTA xanh đậm chữ trắng 5.39, đồ họa xanh tươi, 1 bán kính `--r-lg` 20 px cho mọi thẻ, tách bằng mặt phẳng iOS không viền/bóng).

## 1. 10 trục DNA

| # | Trục | Ghi gì (giá trị cụ thể, không tính từ) | Ví dụ calo-ai |
|---|---|---|---|
| 1 | Visual language | 1 câu + 3 tính từ cấm/khuyên | sáng, sạch, nhóm xám lạnh |
| 2 | Typography | họ chữ, scale, weight cho phép/cấm | system; headline/subhead/footnote; cấm Ultralight–Light chữ nhỏ |
| 3 | Color philosophy | vai trò màu (CTA vs đồ họa vs ink) + tỉ số tương phản tối thiểu | CTA xanh đậm (5.39), đồ họa xanh tươi, ink 14.90 |
| 4 | Surface language | phẳng / nổi / kính; quy tắc tách lớp | mặt phẳng iOS, không viền không bóng |
| 5 | Corner language | bộ bán kính + luật dùng | 1 bán kính `--r-lg` 20 px mọi thẻ nội dung |
| 6 | Spacing rhythm | lưới + gutter + nhịp dọc | grid 4/8, gutter 16, gap theo `--s*` |
| 7 | Icon language | mask SF Symbol vs art; outlined/filled theo vùng | `.icon[data-symbol]` + tint; tab filled / sidebar outlined |
| 8 | Motion | thời lượng/easing cho phép; cái gì cấm animate | (dự án hiện chưa chuẩn hóa — DNA phải ghi rõ, kể cả "không motion custom") |
| 9 | Density | thoải mái / vừa / đặc; row cao tối thiểu | (ghi số: ví dụ row ≥ 56 pt) |
| 10 | Interaction language | hollow vs accent, selected = fill không outline, toggle theo CTA | `nav-round.is-hollow`, `toggle` ăn `--cta` |

## 2. Cơ chế kế thừa (thay vì style ngẫu nhiên)

1. **Lớp override duy nhất:** `project/<id>/tokens.css` là lớp project trên `src/screens/tokens.css`. Token ngữ nghĩa (`--label`, `--accent`, `--bg-elevated`, `--separator`, `--fill`) khai ở `:root` của file project — KHÔNG scope `.app-*`, vì band shell (`.region-nav`, `.region-tabs`) nằm ngoài `.screen` nên scope màn không tới được chúng (bài học trong `docs/screen-regions.md` § cascade).
2. **Scope chỉ cho phong cách:** `.app-*` chứa hình dáng/mặt màu/namespace chống rò, không chứa token ngữ nghĩa.
3. **Nền + chữ ăn token:** nền viết longhand trên `.screen` (để `screenBgOf()` nối dải OS); core đã gán `.screen`/`.region-nav` ăn `var(--label)` nên dark-first không cần khối dark trùng light — xóa khối dark trùng (bài học "Sân khấu đêm" frank-sound).
4. **Dark là dẫn xuất:** app dark-first thì không khối `:root[data-theme='dark']`; thiếu nó, dark kế thừa light đúng ý đồ.
5. **DNA record là đầu vào bắt buộc của Screen loop:** bước Token Setup (§7 flow) chỉ được dùng token có trong DNA + core; token mới ngoài DNA phải quay lại sửa DNA trước (gate `token`).

## 3. Đề xuất `dna.md` mỗi project (file, không phải ý tưởng)

`project/<id>/dna.md`: 10 trục (bảng §1, mỗi trục ≤ 5 dòng) + palette kèm tỉ số tương phản đo thật (như header calo-ai) + luật dark (dẫn xuất hay tách) + danh sách component dùng chung (`app-nav`, `app-tabs`). AI build screen mới đọc `dna.md` + `tokens.css` trước, không tự đặt màu/radius/spacing.

## 4. Gate chống style ngẫu nhiên

- `lint`: màu/radius/spacing literal ngoài token = `device-literal`-style error (mở rộng luật hiện có sang DNA tokens của project).
- `audit`: sampled rect — radius/spacing lệch DNA = warning; tương phản < P9 = block.
- `review`: 30-giây test — che logo, còn nhận ra project nào? Không → DNA mờ, trả về.
