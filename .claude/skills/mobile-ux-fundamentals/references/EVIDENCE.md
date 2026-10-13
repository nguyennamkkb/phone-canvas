# Bằng chứng & trích dẫn (evidence)

Mọi con số trong skill này đến từ các nguồn dưới đây. Truy cập 2026-09-25 qua tìm kiếm web;
bản ghi đầy đủ trong `research/07-mobile-ux/notes/`.

## Vùng chạm
- **W3C — WCAG 2.2 SC 2.5.8 Target Size (Minimum), AA:** ≥ 24×24 CSS px, hoặc spacing tương đương;
  ngoại lệ inline/user-agent/essential. `w3.org/WAI/WCAG22/Understanding/target-size-minimum`
- **W3C — SC 2.5.5 Target Size (Enhanced), AAA:** 44×44 CSS px.
  `w3.org/WAI/WCAG22/Understanding/target-size-enhanced`
- **Apple HIG:** vùng chạm tối thiểu 44×44 pt. **Material Design:** 48×48 dp.
- **Hoober (Touch Design for Mobile Interfaces):** kích thước theo vị trí — trên ~11 mm, giữa ~7 mm,
  đáy ~12 mm (ngón cái tiếp cận đáy ở góc phẳng hơn).
- **Spacing exception:** vòng tròn 24 px quanh tâm target không được chạm target khác.

## Trạng thái tương tác
- **Material Design 3 — States / State layers:** enabled · disabled (38%) · hover (8%) ·
  focus (10%) · press (10%) · drag (16%); state layer giữa container và content; state layer 40 dp
  nhưng **interactive target 48 dp**; disabled không focus/hover/press; có thể kết hợp state.
  `m3.material.io/foundations/interaction/states`

## Thứ bậc hành động
- **Carbon Design System — Button guidelines:** "each page should have only one primary button";
  secondary đi cặp với primary; tertiary/ghost cho ít nổi; danger cho phá huỷ; tổ hợp nút hợp lệ.
- **UX Collective (button placement):** thứ tự primary trong nhóm căn phải/trái; bottom-sticky ưu tiên phải.
- **Thực hành chung:** contrast nút 3:1, text 4.5:1; ưu tiên undo/confirm cho hành động phá huỷ.

## Cách thể hiện
- **NN/g — Bottom Sheets: Definition and UX Guidelines:** sheet giữ thấy nội dung nền; cho Back để đóng;
  có Close; **không stack**; chỉ tương tác ngắn; "reachability" là lý do **hiểu nhầm**.
  `nngroup.com/articles/bottom-sheet`
- **Material — Snackbars:** đáy màn; mobile ≤ 2 dòng; không icon; ≥ 2 action ⇒ dialog; không là cách
  duy nhất tới use case cốt lõi.
- **Material — Dialogs:** ưu tiên cao nhất, chặn tương tác; chỉ dùng khi cần.
- **Android — Toasts:** dùng snackbar khi app foreground; notification khi background.

## Thời gian phản hồi
- **Nielsen — Response Time Limits (1993, từ Miller 1968):** 0.1 s tức thời · 1 s giữ flow · 10 s giữ chú ý;
  > 10 s cần percent-done + cách huỷ. `nngroup.com/articles/response-times-3-important-limits`
- **First load:** mục tiêu nội dung tương tác đầu tiên < 5 s (mục tiêu dài hạn 2 s, 3G tầm trung).
- **Frame budget:** 16 ms (60 fps); ~10 ms/frame cho render.

## Vùng ngón tái & một tay
- **Hoober:** 49% một tay · 36% cầm một tay + tay kia · 15% hai tay; **67%** dùng ngón cái phải khi một tay;
  người dùng chính xác hơn khi tap giữa màn hình, chậm lại ở góc/cạnh.
- **Case study ngành:** thumb-friendly redesign ⇒ +14% hoàn tất mua hàng tuần đầu (báo cáo tổng hợp).

## Vòng đời trạng thái
- **NN/g — Empty states:** đừng mặc định màn trắng; dùng empty state để hướng dẫn; cung cấp đường tới
  hành động tạo nội dung; phân biệt "đang tải" vs "không có dữ liệu".
- **Carbon — Loading pattern:** skeleton cho container-based components; không dùng skeleton cho toast/
  menu/modal; screen reader cần được thông báo loading/busy.
- **State-first practice:** skeleton hiện sau ~200 ms, trần ~5 s; button loading giữ label;
  empty = giải thích + CTA + visual; error = cụ thể + hành động + phục hồi.

## Cử chỉ
- **W3C — SC 2.5.1 Pointer Gestures (A):** alternative single-pointer, không path-based.
- **W3C — SC 2.5.7 Dragging Movements (AA):** alternative không kéo; **không** dùng swipe làm alternative.
- **W3C — SC 2.5.2 Pointer Cancellation:** kích hoạt khi nhả; cho huỷ/undo.

## Ghi chú độ tin cậy
- Con số WCAG là **chuẩn** (bắt buộc nếu cần tuân thủ).
- Con số Apple/Material là **khuyến nghị nền tảng** (mạnh hơn "best practice" chung).
- Số liệu ngành (%, thời gian chờ) mang tính **tham khảo**, không phải chuẩn.
