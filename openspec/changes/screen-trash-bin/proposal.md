# Proposal

## Why

Xóa màn hình trên board hiện chỉ gỡ node khỏi canvas (cho id vào `removed` trong localStorage), file HTML và entry manifest còn nguyên, không có chỗ xem lại hay xóa hẳn. Đồng thời toàn bộ trạng thái project (layout, removed, custom projects) chỉ nằm trong localStorage — mất khi đổi máy, xóa cache, không dùng lâu dài được.

## What Changes

- Thùng rác màn hình **riêng từng project**: xóa màn hình trên board chuyển vào thùng rác thay vì biến mất; xem danh sách, khôi phục đúng vị trí cũ (position + edges), xóa vĩnh viễn từng màn hoặc dọn sạch thùng.
- Xóa khỏi thùng rác = **xóa file HTML thật**: gỡ entry khỏi `src/screens/manifest.ts`, `src/screens/generated.ts` (qua `screens:sync`), `src/projects/builtin.ts`, và xóa file `project/<id>/<name>.html` trên đĩa qua script Node (`scripts/delete-screen.ts`, đối xứng với `scripts/new-screen.ts`). Browser thuần không xóa được file — script là đường duy nhất, UI hướng dẫn chạy lệnh.
- Trạng thái project **lưu ra file dùng lâu dài**: snapshot per-project (`nodes`, `edges`, `removed`, `trash`, meta) export/import JSON dưới `project/<id>/board.json` (checked-in được, backup được); localStorage còn làm cache runtime, file là source of truth khi có.
- Nhớ vị trí màn hình nghiêm chỉnh: snapshot trash giữ `position`, `deviceId`, edges bị cắt để khôi phục 1:1.

## Capabilities

### New Capabilities

- `screen-trash`: thùng rác màn hình per-project (move vào thùng, restore đúng vị trí, xóa vĩnh viễn, dọn thùng).
- `project-state-file`: persist trạng thái project ra file JSON (export/import/sync với localStorage), dùng lâu dài, backup được.

### Modified Capabilities

- (trống — `openspec/specs/` hiện chưa có spec nào; không sửa requirement cũ)

## Impact

- App: `src/board/BoardView.tsx` (flow xóa → thùng rác), `src/projects/storage.ts` (thêm trash trong snapshot), UI board/panel (nút Thùng rác, khôi phục, xóa vĩnh viễn).
- Scripts: mới `scripts/delete-screen.ts` (+ npm script `delete-screen`), dùng lại `scripts/gen-registry.ts`; đối xứng `scripts/new-screen.ts`.
- Manifests: `src/screens/manifest.ts`, `src/screens/generated.ts`, `src/projects/builtin.ts` bị script sửa khi xóa vĩnh viễn (có xác nhận + in lại file đã xóa).
- State file: mới `project/<id>/board.json` + lệnh export/import (`scripts/board-state.ts` hoặc mở rộng export); localStorage giữ nguyên làm cache, không breaking.
