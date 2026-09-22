# Proposal

## Why

Board đã có màn hình nhưng flow giữa các màn còn dang dở: nối được (núm Handle mới gắn) nhưng edge không chọn/xóa được trên UI, nối trùng và tự vòng vào chính mình đều lọt, gỡ màn để lại edge mồ côi sau reload, nút `+` âm thầm nhân bản màn khi mọi màn đã lên board. Khái niệm component → view (nút nào dẫn sang màn nào) chưa tồn tại. Làm bộ core cho hoàn chỉnh trước khi mở rộng prototype bấm thử được.

## What Changes

- Edge có data model chuẩn: `FlowEdge = Edge + data.flow?: { sourceComponent?: string }` — nhãn ghi nút/tab nguồn (component → view), persist cùng board snapshot, tương thích ngược snapshot cũ (thiếu thì coi như rỗng).
- Luật nối (connect): cấm tự vòng (source == target), cấm trùng (cùng cặp source/target đã có edge thì không thêm).
- Edge chọn/xóa được: bật chọn edge, Delete/Backspace gỡ edge đã chọn, hoàn tác trong 6s như xóa node.
- Dọn edge mồ côi khi mở board: edge trỏ tới node không còn (màn bị gỡ khỏi manifest hoặc node bị lọc) bị loại bỏ cùng lúc với node.
- Nút `+` không bao giờ nhân bản lén: khi mọi màn đã lên board, `+` không làm gì (hoặc mở picker chọn màn cho phép trùng chủ đích) thay vì tự thêm bản sao.
- Xóa màn: edge dính tới node bị xóa đã bị gỡ (giữ), cộng hoàn tác edge khi hoàn tác node.

## Capabilities

### New Capabilities

- `flow`: kết nối flow core trên board — view → view (edge, luật nối, chọn/xóa/undo), component → view (nhãn nguồn trên edge), thêm/xóa màn và dọn dẹp edge liên quan, validate snapshot khi tải.

### Modified Capabilities

- Không có (chưa có main spec nào; toàn bộ là delta mới).

## Impact

- `src/board/BoardView.tsx`: onConnect (luật nối), edge select/delete + undo, prune edge khi mở, onAddScreen (bỏ fallback trùng).
- `src/canvas/Board.tsx`: bật `elementsSelectable` cho edge (giữ node không đổi nếu được), phím Delete cho edge.
- `src/canvas/PhoneNode.tsx`, `src/styles/board.css`: giữ núm Handle (đã có, chưa commit); thêm hiển thị nhãn edge nếu có.
- `src/projects/storage.ts`: snapshot `{nodes, edges, removed}` giữ nguyên shape, edge mang thêm `data.flow` — đọc-cũ/viết-mới, không migration script.
- Giả định ghi nhận: user chưa chốt có làm "bấm thử trong màn" (interactive prototype) hay không — change này KHÔNG bao gồm; chỉ ghi nhãn nguồn để sau này dùng.

## Ghi nhận quyết định thay user (chưa hỏi được)

- component → view = nhãn metadata trên edge board, không phải link bấm được trong màn.
- "Hoàn chỉnh" = bộ tối thiểu + dọn dẹp/validate (nhãn edge, xác nhận xóa node giữ nguyên, undo edge, prune edge mồ côi, cấm trùng/tự vòng, `+` không nhân bản lén).
