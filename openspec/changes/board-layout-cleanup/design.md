# Design

## Context

Xem `proposal.md` (Why). Trạng thái hiện tại (đọc từ code, không đoán):

- `.toolbar` (`src/styles/board.css:41-59`) là `position: absolute; top: 14px; left: 14px; max-width: calc(100% - 28px)` — nổi trên canvas, không có cơ chế thu gọn nhóm nút nên ở ~1170px chữ tràn vào tiêu đề panel phải.
- `.app` là flex row (`src/styles/shell.css:76-80`): `.board-wrap` (`flex: 1 1 auto; min-width: 0`) + `.panel` (`flex: 0 0 384px`, `src/styles/panel.css:6-14`). Panel chỉ thành overlay dưới 900px (`board.css:184-199`).
- Token table là một canvas node (`TokenNode`, `.token-node { width: 360px }`, `src/styles/tokens-ui.css:9-11`) nằm thường trực trên canvas, chiếm chỗ vẽ.
- Ràng buộc cứng: 4 invariants đo đạc và pipeline `compose.ts` / bridge / `infer.ts` / export không được đụng.

## Goals / Non-Goals

**Goals:** hết chồng lấn ở desktop; toolbar có compaction; token rail gọn/mở được và nhớ trạng thái; inspector overlay ở màn hẹp hơn 900px.

**Non-Goals:** không đổi visual design (màu, radius, font) của toolbar/panel; không đổi cấu trúc node/edge đã lưu; không thêm breakpoint tinh chỉnh từng px — một ngưỡng overlay mới duy nhất; không đụng theme sáng/tối.

## Decisions

1. **Toolbar: giữ absolute, thêm compaction theo nhóm.** Toolbar đã là overlay theo thiết kế (pill nổi); sửa thành hàng ngang cố định sẽ xô toàn bộ canvas. Thay vào đó chia nút thành nhóm thiết yếu (back, title+count, mode) và nhóm phụ (frame style, theme, add, fit, panel toggle) — nhóm phụ gộp vào một trigger khi `board-wrap` hẹp (đo bằng `ResizeObserver` trên wrapper, không phải window, vì panel bật/tắt làm chiều ngang canvas đổi mà window không đổi).
2. **Token rail: rời khỏi canvas thành rail trái của `board-wrap`, mặc định gọn.** Lý do rời canvas: node token hiện tại ăn không gian vẽ và bị pan/zoom cùng canvas — sai bản chất của một bảng tra cứu. Rail là sibling của flow (giống panel phải), `flex: 0 0 auto`, rộng ~300px khi mở, 40px khi gọn. Trạng thái lưu `localStorage` per-project (tái dùng pattern `pc.board.<id>` ở `src/projects/storage.ts`), mặc định gọn (giả định đã ghi trong spec; người dùng chưa chốt).
3. **Inspector: giữ 384px ở desktop, hạ ngưỡng overlay từ 900px lên ~1100px và thêm nút đóng.** Ngưỡng 900px hiện tại không cứu được case 1173px trong ảnh (384 panel + 360 token node + chrome trình duyệt). Khi token rail đã gọn, 1100px đủ cho canvas + panel; dưới đó panel thành overlay như behavior 900px hiện có (tái dùng CSS, chỉ đổi breakpoint + nút đóng đã tồn tại ở bản mobile).
4. **Không dời DOM của React Flow.** Mọi thay đổi nằm ở lớp chrome (CSS + state thu gọn), node/edge/selection giữ nguyên nên `reconcile.ts` và inspector router không bị ảnh hưởng.

## Risks / Trade-offs

- Toolbar compaction bằng `ResizeObserver` trên wrapper: thêm một listener nhẹ; rủi ro vòng lặp resize thấp vì chỉ toggle class, không đổi kích thước wrapper. Fallback: nếu không đo được, giữ nguyên toolbar đầy đủ (fail-open).
- Rail mặc định gọn có thể làm người dùng cũ tưởng mất bảng tokens — chặn bằng: lần đầu sau update hiện coach-mark một lần (hoặc tooltip trên nút mở rail), và spec vẫn yêu cầu nhớ trạng thái sau lần đầu.
- Đổi breakpoint 900px → ~1100px: người dùng màn 900–1100px đang quen panel cạnh sẽ thấy overlay — chấp nhận được vì đúng nhóm đang bị chèn ép; panel toggle trên toolbar vẫn một chạm để tắt hẳn.
