# Tasks

## 1. Storage v4 + trash persistence

- [x] 1.1 Mở rộng `BoardSnapshot` lên v4 thêm `trash: TrashEntry[]` (`{ screenId, node, edges, deletedAt }`), `loadBoard` normalize v1–v3 thiếu trash → `[]`, corrupt trash → warn + `[]`, và verify `npm test -- src/projects/storage.test.ts` pass với case mới
- [x] 1.2 Thêm test round-trip trash (save → load giữ position/device/edges/deletedAt, corrupt trash không vỡ board) và verify `npm test` pass

## 2. Board flow: xóa vào thùng, khôi phục 1:1

- [x] 2.1 Đổi `onConfirmDelete` trong `src/board/BoardView.tsx`: push snapshot vào `trash` (giữ `removed` khi node cuối), reconcile bỏ qua screen còn trong trash, và verify xóa → node mất, reload không hiện lại
- [x] 2.2 Implement `onRestoreTrash(entryId)`: trả node đúng position/device + nối lại edges, gỡ `removed`, và verify restore → đúng vị trí cũ, reload vẫn còn
- [x] 2.3 Implement `onDeleteTrashEntry` (gỡ entry khỏi trash, giữ `removed`) + `onEmptyTrash`, và verify từng thao tác cập nhật UI + persist qua reload

## 3. UI thùng rác per-project

- [x] 3.1 Thêm nút Thùng rác (badge số lượng) trên board toolbar/panel, dialog liệt kê newest-first (title, deletedAt) với Khôi phục / Xóa vĩnh viễn / Dọn thùng (InlineConfirm 2 bước), và verify mở dialog thấy đúng entries của project hiện tại
- [x] 3.2 Dialog "Xóa vĩnh viễn" hiện lệnh `npm run delete-screen -- --id <screen-id>` + nút copy, không giả vờ xóa từ browser, và verify copy cho ra lệnh đúng id

## 4. Script xóa file thật

- [x] 4.1 Tạo `scripts/delete-screen.ts` (`--id`, `--force`): unlink `project/<id>/<name>.html`, gỡ entry `manifest.ts` + id khỏi `builtin.ts`, chạy `gen-registry.ts`, refuse id lạ/không `--force` khi board còn node, và verify chạy thử trên màn mẫu rồi kiểm tra `npm run lint` + app khởi động được
- [x] 4.2 Thêm npm script `delete-screen`, docs 1 đoạn trong README/docs, và verify `npm run delete-screen -- --help` in usage đúng

## 5. State file dùng lâu dài

- [x] {n} UI "Xuất trạng thái" (download `board.json` `{ v: 1, projectId, exportedAt, board }`) + "Nhập" (file picker → validate version/projectId/schema → `saveBoard` + reload, file lỗi file lạ abort không đụng state), và verify export → xóa cache → import → board + trash nguyên vẹn
- [x] {n} Quy tắc load: state đã import mới hơn cache thì thắng, không file thì giữ behavior cũ, và verify cả 2 nhánh bằng test hoặc thao tác tay
- [x] {n} Chạy gate đầy đủ (`npm run gate`: lint + typecheck + tokens/subset/components + vitest) và verify xanh

## 6. Kiểm thử tích hợp

- [x] 6.1 Kịch bản cuối-cuối: tạo màn mẫu → xóa vào thùng → reload (còn trong thùng) → restore (đúng vị trí) → xóa vĩnh viễn via script (file mất, registry sạch) → export/import board.json, và verify từng bước quan sát được
