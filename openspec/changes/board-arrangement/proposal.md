# Proposal

## Why

Board hiện chỉ biết một hàng duy nhất (`y = 0`, append bằng `nextSlotX`): agent/skill không có cách nào nói "xếp các màn này thành hàng, trái qua phải" hay "gom nhóm này lại với nhau". Kết quả là board 20–30 màn (paywall-kit 28, watch-lab 20) luôn là một dải dài một hàng, phải kéo tay, không version được, không review được. `board-freeze` còn xếp theo alphabet, lệch với thứ tự manifest mà board tươi dùng.

## What Changes

- Định nghĩa arrangement model cho board: danh sách hàng có thứ tự, mỗi hàng là danh sách screen id có thứ tự trái qua phải; tọa độ `x,y` của node là suy ra từ model (cùng toán `nodeOuterWidth + gap` đã có), không phải số tay.
- Board đọc đúng model khi mở (record `pc.board.<id>`, seed `board.json`, import): vị trí drag tay vẫn được giữ, nhưng lần xếp lại theo model cho kết quả deterministic.
- `board-freeze` (và `screen -- list` làm đầu vào) hỗ trợ xếp theo thứ tự显式 + chia hàng (`--order`, `--row-size`/`--rows`), thay vì một hàng alphabet duy nhất.
- Skill `phone-canvas` có recipe "xếp hàng": agent nhận danh sách màn + nhóm hàng, ghi ra `board.json` hợp lệ mà không cần mở browser.
- Tương thích ngược: snapshot cũ không có model (v5 positions thuần) vẫn mở như hiện tại — đọc-cũ/ghi-mới, không migration bắt buộc.

## Capabilities

### New Capabilities

- `board-arrangement`: model sắp xếp board — hàng có thứ tự, thứ tự trái qua phải trong hàng, nhóm hàng, cách suy ra tọa độ, quy tắc reconcile/seed/import, và CLI + skill dùng nó.

### Modified Capabilities

- Không có. Các spec hiện tại (`screen-regions`, `element-tooling`, `board-diagnostics`…) không định nghĩa bố cục board; đây là behavior mới ghi lần đầu. Thay đổi code (`placement.ts`, `BoardView.tsx`, `board-freeze.ts`, skill `tooling.md`) là implementation của capability mới, không sửa requirement cũ.

## Impact

- Ảnh hưởng: `src/board/placement.ts` (toán hàng), `src/board/BoardView.tsx` (`freshNodes`/`reconciledNodes`/live-sync + `COLUMN_GAP`), `src/projects/storage.ts` (snapshot v5 + `seedBoard`/`parseStateFile`), `scripts/board-freeze.ts` (`FREEZE_GAP`, thứ tự alphabet), `.agents/skills/phone-canvas/references/tooling.md` + recipe mới.
- Không chạm 5 invariants đo đạc và pipeline `compose.ts`/bridge/`infer.ts`/export.
- Không breaking dữ liệu: board đã lưu trong `localStorage` của user luôn thắng seed (quy tắc newer-wins giữ nguyên).
