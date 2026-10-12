# Design

## Context

Xem `proposal.md` (Why). Trạng thái hiện tại (đọc từ code):

- `src/board/placement.ts`: `nodeOuterWidth` / `rightEdge` / `nextSlotX(nodes, gap)` — đúng cho một hàng, chưa có khái niệm hàng dọc. `y` luôn `0` ở mọi đường auto-place.
- `src/board/BoardView.tsx`: `COLUMN_GAP = 120`; `freshNodes` xếp theo `resolveScreens(project)` (thứ tự manifest); `reconciledNodes` + live-sync append màn thiếu vào cuối bằng `nextSlotX`; `openingNodes` giữ vị trí đã lưu verbatim.
- `scripts/board-freeze.ts`: `FREEZE_GAP = 120`, xếp theo `sort localeCompare` (alphabet), một hàng `y = 0` — lệch với thứ tự manifest của board tươi.
- `src/projects/storage.ts`: snapshot v5 `{nodes, edges, removed, trash}` + `savedAt`; `seedBoard` chỉ thắng khi `exportedAt > savedAt`; `parseStateFile` validate shape.
- Skill `phone-canvas` (`references/tooling.md`): biết seed/import/freeze nhưng không có recipe xếp hàng nào.

## Goals / Non-Goals

**Goals:** một hàm xếp hàng duy nhất cho mọi đường đi (board tươi, reconcile, freeze, seed); CLI nhận thứ tự + chia hàng; snapshot cũ mở không đổi; skill có recipe agent làm được không cần browser.

**Non-Goals:** kéo-thả nhóm trên canvas (vẫn kéo từng node như cũ); auto-layout bám edge flow; đổi visual node/edge; đụng 5 invariants đo đạc và pipeline extractor/spec/export.

## Decisions

1. **Model hàng là dữ liệu, tọa độ là suy ra.** Snapshot thêm field optional `arrangement: { rows: { name?: string; screens: string[] }[] }` (đọc-cũ/ghi-mới; snapshot v5 không có field này mở đường cũ). Mọi đường auto-place gọi một hàm duy nhất `layoutRows(rows, gapX, gapY)` trong `placement.ts` — hàm này dùng lại `nodeOuterWidth`/`nextSlotX` cho trục `x`, mỗi hàng reset `x = 0`, `y` hàng sau = đáy hàng trước + `ROW_GAP`. Không nhân bản toán cột ở `board-freeze.ts`.
2. **`y` theo chiều cao node ngoài.** Đáy hàng = `max(position.y + outerHeight(device))` của hàng đó; `outerHeight = device.height + bezel*2` (đối xứng với `nodeOuterWidth`). `ROW_GAP = 160` (lớn hơn `COLUMN_GAP = 120` để hai hàng tablet/phone không dính nhãn node hai dòng) — hằng số cạnh `COLUMN_GAP` trong `BoardView`, freeze dùng cùng giá trị.
3. **Thống nhất thứ tự mặc định theo manifest.** `freeze` không `--order` chuyển từ alphabet sang thứ tự `resolveScreens` (giống board tươi). Alphabet vẫn có qua `--sort alpha` cho ai cần output ổn định kiểu cũ. Lý do: hai đường "mặc định" phải cho cùng một board; alphabet là chi tiết triển khai lọt ra ngoài, không phải contract.
4. **CLI tối thiểu, validate trước khi ghi.** `board-freeze` thêm `--order a,b,c` (thứ tự显式), `--row-size N` (cắt hàng đều), `--rows "a,b;c,d"` (hàng显式, `;` chia hàng, tên hàng `--row-names` optional). Thứ tự ưu tiên: `--rows` > (`--order` + `--row-size`) > mặc định manifest. Validate toàn bộ id trước khi tính toán: id lạ → exit 1, nêu id, không ghi file, không chạm `.bak` (cùng pattern `rename-screen`/`delete-screen` đã có).
5. **Drag tay không bị model ghi đè.** Mở board: nếu có bản lưu `localStorage` thì giữ vị trí tay verbatim (kể cả khi lệch model); model chỉ chạy khi xếp mới (board trống / reconcile màn mới / apply seed). Màn mới reconcile vào hàng nào: hàng cuối cùng theo model đã lưu, fallback hàng duy nhất; không tự sắp lại các node cũ. Tránh class bug "mở lại board tự nhảy".
6. **Skill recipe thay vì UI mới.** Thêm `recipes/board-arrange.md` + mục trong `references/tooling.md`: đầu vào `screen -- list`, đầu ra file seed đúng shape `parseStateFile` (agent tự kiểm tra bằng `--dry-run` của freeze trước khi ghi). Không thêm nút "auto-arrange" trên board trong change này — model + CLI + recipe là đủ khép vòng; UI là follow-up.

## Risks / Trade-offs

- Đổi mặc định freeze alphabet → manifest: diff `board.json` cũ/mới ở project đông màn (paywall-kit 28). Chặn bằng `--sort alpha` + ghi rõ trong `tooling.md`; không phải breaking input (loader đọc cả hai).
- Node expanded (full content height) làm đáy hàng tính lúc freeze khác lúc mở. Chấp nhận: layout tính trên chiều cao frame chuẩn (`device.height`), expanded là trạng thái xem tạm, không phải bố cục — giống cách export luôn dùng frame chuẩn.
- `arrangement.screens` có thể stale khi màn bị xóa/rename: `pruneZombieNodes` + `missingScreenIds` hiện tại đã xử lý (drop zombie, append thiếu vào hàng cuối) — model không cần cơ chế dọn riêng.
- Seed newer-wins gây nhầm ("freeze rồi mà board không đổi" khi localStorage mới hơn): đã có `failure-modes.md §12`; recipe mới nhắc lại một dòng, không đổi semantics thắng-thua.
