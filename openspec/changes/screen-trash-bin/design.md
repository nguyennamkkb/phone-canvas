# Design

## Context

Xem `proposal.md` (Why) và `specs/screen-trash/spec.md`, `specs/project-state-file/spec.md` (requirements).

Trạng thái hiện tại (đã đọc code):

- `src/board/BoardView.tsx`: `onConfirmDelete` xóa node, snapshot `{ kind: 'node', node, screenId, edges }` cho undo 6s, `removed` gắn vào `saveBoard`. Undo không nhớ vị trí nghiêm chỉnh ngoài snapshot内存.
- `src/projects/storage.ts`: snapshot v3 `{ nodes, edges, removed }` trong `pc.board.<id>`; `loadBoard` normalize v1/v2 → v3. `reconcile.ts` + `openingNodes` giữ `removed` khỏi bị thêm lại.
- `src/screens/manifest.ts` là single source of truth cho screen id; `scripts/new-screen.ts` ghi file + manifest + chạy `gen-registry.ts`; `scripts/gen-registry.ts` tái sinh `generated.ts`. Chưa có chiều ngược (delete).
- State chỉ trong localStorage — không file, không backup.

## Goals / Non-Goals

**Goals:**

- Xóa board → vào thùng rác per-project, restore 1:1 vị trí + edges.
- Xóa khỏi thùng → xóa file HTML thật + sạch registry (qua script Node).
- State project ra file `project/<id>/board.json`, dùng lâu dài.

**Non-Goals:**

- Thùng rác chung toàn app; version history/undo nhiều bước ngoài 6s hiện có.
- Backend/sync đa máy realtime; file state chỉ là snapshot thủ công + load khi mở.
- Xóa file trực tiếp từ browser (bất khả thi) — browser chỉ gọi script/hướng dẫn lệnh.

## Decisions

1. **Trash entry = node snapshot + metadata, lưu trong BoardSnapshot v4.**
   Mở rộng `BoardSnapshot` thành `{ v: 4, nodes, edges, removed, trash: TrashEntry[] }`, `TrashEntry = { screenId, node, edges, deletedAt }` (`node: PhoneFlowNode`, `edges: Edge[]`). Lý do: tái dùng đúng snapshot undo 6s hiện có, chỉ kéo dài tuổi thọ + persist. Alternative đã loại: bảng trash riêng key localStorage — thêm key, lệch pha với `saveBoard` write-through hiện tại.

2. **Xóa board → trash, giữ nguyên `removed` semantics.**
   `onConfirmDelete` hiện tại push snapshot vào `trash` thay vì chỉ `undone`; `removed` vẫn append khi node cuối của screenId bị gỡ (để reconcile không thêm lại). Restore thì gỡ `removed` + trả node/edges. Alternative đã loại: bỏ `removed`, dùng trash làm nguồn reconcile — vỡ khi empty-trash (màn đã xóa hẳn sẽ bị thêm lại từ `builtin.ts`).

3. **Xóa vĩnh viễn = script `scripts/delete-screen.ts`, đối xứng `new-screen.ts`.**
   `npm run delete-screen -- --id <screen-id> [--force]`: đọc manifest tìm `file`, unlink file, gỡ entry khỏi `manifest.ts` (sửa text), gỡ id khỏi `builtin.ts`/`custom` projects, chạy lại `gen-registry.ts`, in xác nhận. Refuse khi id không tồn tại/không có `--force` mà còn node trên board (kiểm tra qua `project/*/board.json` nếu có). Lý do: browser không có fs; script là đường duy nhất xóa file thật, và đối xứng với flow tạo màn hiện có. UI trash chỉ hiển thị lệnh cần chạy + nút copy, không giả vờ xóa được từ browser.

4. **State file `project/<id>/board.json`, format `{ v: 1, projectId, exportedAt, board: BoardSnapshot-v4 }`.**
   Script `scripts/board-state.ts` với `export --project <id>` (đọc localStorage? không — đọc từ browser via UI "Xuất trạng thái" ghi file qua download + hướng dẫn đặt vào repo; `import` đọc file JSON, validate, `saveBoard`). Thực tế: UI export tạo blob download `board.json`; user đặt vào `project/<id>/`; lần mở sau nếu file bundle cùng app (import tĩnh optional) hoặc qua import thủ công sẽ nạp. Đơn giản hơn: UI có "Xuất" (download) + "Nhập" (file picker → validate → `saveBoard` + reload nodes). Không đụng build pipeline. `loadBoard` ưu tiên: file đã import (mới nhất, qua timestamp trong snapshot) > cache cũ. Alternative đã loại: ghi trực tiếp từ browser vào repo (không thể), backend sync (ngoài scope).

5. **UI: nút Thùng rác trên board toolbar + panel.**
   Badge số lượng; dialog liệt kê newest-first (title, deletedAt); mỗi dòng: Khôi phục / Xóa vĩnh viễn (hiện lệnh `npm run delete-screen -- --id …`, nút copy); nút Dọn thùng (InlineConfirm 2 bước như delete hiện có). Không thêm route mới.

## Risks / Trade-offs

- [Risk] Browser không xóa được file → user tưởng đã xóa hẳn nhưng file còn → Mitigation: nút "Xóa vĩnh viễn" trong UI không tự xóa mà hiện lệnh chính xác + copy; spec yêu cầu file biến mất chỉ tính khi chạy script.
- [Risk] Snapshot v4 vỡ tương thích v1–v3 → Mitigation: `loadBoard` normalize như hiện tại (`trash` thiếu → `[]`), read-old/write-new, không migration script (đúng pattern storage.ts).
- [Risk] Xóa file nhưng `generated.ts` chưa regen → app crash (`index.ts` throw khi thiếu raw) → Mitigation: script luôn chạy `gen-registry.ts` cuối cùng, fail thì rollback manifest edit (giữ backup text trong memory trước khi ghi).
- [Risk] State file và localStorage lệch (file cũ hơn cache) → Mitigation: so `exportedAt`/mtime, cái mới hơn thắng; import luôn overwrite có xác nhận.
- [Trade-off] Export/import thủ công thay vì auto-sync → chấp nhận vì không có backend; đủ cho "làm lâu dài" (backup/check-in).

## Migration Plan

1. Ship storage v4 + trash UI (backward-compat, không đụng file cũ).
2. Ship `delete-screen.ts` + docs lệnh trong trash dialog.
3. Ship export/import `board.json` (download + file picker, không đổi load path mặc định).
4. Rollback: từng phần độc lập; xóa trash UI = revert BoardView; snapshot v4 đọc được bởi code cũ nếu bỏ field `trash` (forward-tolerant vì normalize).

## Open Questions

- (Không có — 3 câu hỏi phạm vi đã chốt với user: trash per-project, script xóa file, state ra file.)
