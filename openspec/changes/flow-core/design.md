# Design

## Context

Xem `proposal.md` (Why). Trạng thái hiện tại quan sát từ code:

- `PhoneNode` đã có núm `Handle` trái/phải (chưa commit), `Board.onConnect → addEdge` nguyên bản.
- `Board` đặt `elementsSelectable={false}` nên edge không bao giờ được chọn/xóa trên UI.
- `openingNodes` lọc node mất màn (`isPhoneNode`) nhưng trả `saved.edges` nguyên vẹn → edge mồ côi.
- `onAddScreen` fallback `pool[ns.length % pool.length]` → nhân bản lén khi board đủ màn (đã gặp thật: 2 node Home).
- Snapshot `pc.board.<id> = {v:3, nodes, edges, removed}`, quy ước đọc-cũ/viết-mới, không migration script.
- Xóa node đã dọn edge + undo 6s; xóa edge chưa tồn tại.

## Goals / Non-Goals

- Goal: edge là công dân đầy đủ (tạo có luật, chọn/xóa/undo, nhãn nguồn, prune khi tải).
- Non-Goal: bấm thử trong màn (interactive prototype); nhiều núm trên một node (mỗi node một vào/một ra, `sourceComponent` chỉ là chữ); custom edge routing.

## Decisions

1. **Edge model: `data.flow?: { sourceComponent?: string }` trên chính ReactFlow Edge.**
   Vì sao: `addEdge`, undo snapshot, `saveBoard` đều mang nguyên object edge đi — nhãn đi theo miễn phí, xóa node/undo không bao giờ lệch. Thay thế đã loại: sidecar map `edgeId → label` (lệch khi undo/xóa, thêm state đồng bộ vô ích).

2. **Luật nối nằm trong `BoardView.onConnect`, không trong `Board`.**
   Check `source === target` và cặp `(source,target)` đã có edge trước khi gọi `addEdge`. Vì sao: chặn tại nguồn thì snapshot không bao giờ thấy edge bẩn; cho phép rồi prune sau gây nháy + churn localStorage.

3. **Bật chọn edge bằng `elementsSelectable` (toàn cục), giữ chọn node bằng `activeNodeId` custom như cũ.**
   Vì sao: node selection của app không dùng RF selection (`onNodeClick → onSelectNode` riêng, `selectionOnDrag=false` đã bật) nên bật RF selection chỉ ảnh hưởng edge. Key Delete mở rộng: đang chọn edge → xóa edge + undo; đang chọn node → giữ hành vi cũ. Thay thế đã loại: tự vẽ click-hit overlay cho edge (viết lại cái RF có sẵn).

4. **Nhãn edge render qua prop `label`, sửa bằng double-click → prompt (v1).**
   Vì sao: boring, không thêm mặt UI mới; nhãn là text ngắn ("tab Journal"). Editor tử tế trong inspector để dành khi làm prototype playback.

5. **Prune edge khi mở: giữ edge chỉ khi cả source lẫn target còn trong node list sau lọc.**
   Đặt cạnh `isPhoneNode` trong `openingNodes` — một chỗ dọn, node và edge cùng luật.

6. **`onAddScreen` bỏ fallback trùng: hết màn thì no-op.**
   Muốn trùng chủ đích thì chọn rõ từ picker (đã hỗ trợ `screenId`). Không disable nút `+` vì picker vẫn cần nó.

7. **Không migration.** `data.flow` optional; `validNodesEdges` không đổi (chỉ check shape nodes/edges array); snapshot cũ đọc thẳng, thiếu nhãn = rỗng.

## Risks / Trade-offs

- [Risk] `elementsSelectable=true` bật cả chọn node nội bộ của RF, đè визуал? → Mitigation: app không có CSS cho `.selected`, chọn node hiển thị vẫn do `activeNodeId`; kiểm tra bằng mắt sau implement.
- [Risk] Double-click prompt bị chặn hoặc khó phát hiện → Mitigation: title tooltip trên edge ("Double-click để đặt nhãn"); test thủ công một lần.
- [Risk] Edge id do `addEdge` tự sinh, undo snapshot giữ nguyên object → không lệch; nối lại cặp cũ sau xóa được id mới, không trùng.

## Migration Plan

Không migration. Rollback = revert code; snapshot có `data.flow` được code cũ đọc bình thường (field thừa trong JSON).

## Open Questions

Không có.
