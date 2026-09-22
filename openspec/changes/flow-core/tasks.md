# Tasks

## 1. Luật nối và model edge

 - [x] 1.1 Thêm type `FlowEdge` (`Edge + data.flow?: { sourceComponent?: string }`) và chặn tự vòng/trùng trong `onConnect`, verify bằng unit test `src/board/flow.test.ts` (7 tests) + kéo nối thật trên board
 - [x] 1.2 Render nhãn `data.flow.sourceComponent` lên edge qua prop `label`, verify bằng cách seed edge có nhãn vào localStorage, reload và thấy nhãn "tab Journal" hiện trên dây nối (screenshot 20:34)

## 2. Chọn, xóa, undo edge

 - [x] 2.1 Bật chọn edge (`elementsSelectable`, giữ chọn node qua `activeNodeId`), verify bằng cách click dây nối thấy class `selected`, chọn node và drag node vẫn như cũ
 - [x] 2.2 Delete/Backspace xóa edge đang chọn + hoàn tác 6s, verify live: Delete xóa edge, undo bar "Đã xóa “liên kết Home · Today → Journal”", bấm Hoàn tác edge về kèm nhãn
 - [x] 2.3 Double-click edge đặt/sửa nhãn nguồn qua prompt, verify live bằng stub `window.prompt` + dblclick: nhãn "hàng Mood Journal" hiện và lưu vào `data.flow`

## 3. Thêm/xóa màn và dọn dẹp

 - [x] 3.1 Bỏ fallback nhân bản lén trong `onAddScreen` (hết màn thì no-op), verify live: bấm `+` khi board đủ 2 màn, số node 2→2
 - [x] 3.2 Prune edge mồ côi trong `openingNodes` (giữ edge chỉ khi cả hai đầu còn node), verify live: seed edge tới "ghost-node", reload còn đúng ["e1"], 1 dây trên canvas, không lỗi
 - [x] 3.3 Giữ nguyên xóa node dọn edge + undo khôi phục cả edge, verify live: xóa Journal (node + e1 cùng mất), Hoàn tác cả hai về đủ trên canvas và localStorage

## 4. Hồi quy và nghiệm thu

 - [x] 4.1 Chạy `npm run lint` và `npm test`, verify cả hai xanh (ngoại trừ fail có sẵn `tokens.test.ts` đã ghi nhận ở change board-layout-cleanup)
 - [x] 4.2 Mở board thật, nối/xóa/undo/nhãn/prune một lượt và chụp ảnh, verify spec panel + export PNG của màn không đổi số đo
