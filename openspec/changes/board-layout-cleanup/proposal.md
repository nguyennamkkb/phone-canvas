# Proposal

## Why

Trang board ở viewport ~1170px bị chèn ép từ 3 phía: toolbar trên tràn vào vùng panel phải, token table 360px chiếm chỗ canvas bên trái, panel inspector 384px cố định bên phải. Kết quả là vùng vẽ còn lại quá hẹp, chữ đè nhau, không còn "clean".

## What Changes

- Định nghĩa contract layout cho board: 3 vùng riêng biệt (toolbar trên, canvas giữa, inspector phải), không vùng nào được đè/ăn không gian vùng khác ở desktop.
- Toolbar co giãn an toàn: hết chỗ thì thu gọn nhóm nút (ưu tiên giữ back/title/mode), không tràn chữ vào panel.
- Token table rời khỏi canvas: thành rail trái có thể thu gọn, mặc định gọn, mở rộng khi cần tra cứu.
- Inspector phải giữ 384px ở desktop rộng; khi viewport hẹp chuyển thành overlay có nút đóng (mở rộng breakpoint hiện tại vốn chỉ có ở 900px).
- Chuẩn hoá breakpoint + trạng thái thu gọn của 2 rail, áp dụng mọi board.

## Capabilities

### New Capabilities

- `board-layout`: contract bố cục trang board — phân vùng top/canvas/right, quy tắc không chồng lấn, hành vi overflow của toolbar, trạng thái thu gọn của token rail và inspector, breakpoint responsive.

### Modified Capabilities

- Không có. Repo hiện chưa có spec nào (`openspec list --specs` rỗng); đây là behavior mới được ghi lần đầu.

## Impact

- Ảnh hưởng: `src/styles/board.css` (`.toolbar`), `src/styles/shell.css` (`.app`, `.board-wrap`), `src/styles/panel.css` (`.panel`), `src/styles/tokens-ui.css` + `src/canvas/TokenNode.tsx` (token rail), `src/board/BoardView.tsx` (state thu gọn).
- Không chạm 4 invariants đo đạc (1px=1pt, screen không giới hạn chiều cao, safe areas, raw down/interpreted up) và không chạm pipeline extractor/spec/export.
- Không breaking change về dữ liệu: layout board đã lưu (`localStorage`) giữ nguyên.
