# Design

## Context

Board hiện tại: `Board.tsx` (toolbar 6 cụm + ReactFlow + Controls + MiniMap), `BoardView.tsx` (state mode/focus/nodes + keyboard), `PhoneNode.tsx` (label + iframe `pointerEvents: none` ở move mode), token-table là node canvas, panel là sibling `.app > .panel`. Change trước đã có ErrorBoundary, hash-route, spec-timeout. Xem proposal.md về động cơ.

## Goals / Non-Goals

**Goals:** toolbar gọn không tràn; fit lần đầu to rõ; token rời canvas; đo không cần đổi mode; focus duyệt màn; panel tự dẫn dắt; chrome đồng bộ (locale/dark/delete/dropdown/link).

**Non-Goals:** không đổi bridge wire format, `buildSpec`, export pipeline, manifest/registry, tokens contract, visual 18 màn.

## Decisions

1. **Click-through đo bằng "pointerEvents theo vùng", không bật cả iframe.** Giữ `pointerEvents: none` mặc định để drag node nguyên vẹn; overlay trong suốt trên node bắt click, hit-test qua `document.elementFromPoint` sau khi tạm bật iframe 1 frame để bridge báo element. Thay thế đã cân nhắc: bật `pointerEvents: auto` toàn iframe ở move mode — rẻ nhưng giết drag node, loại.
2. **Fit-view theo phone nodes qua `fitView({ nodes })`.** React Flow hỗ trợ fit theo danh sách node id — truyền id các phone node, bỏ token node, giữ `padding 0.12`. Không tự tính viewport tay.
3. **Token-dock = TokenNode cũ render ngoài canvas.** Tái dùng toàn bộ `token-table/` (ColorRow/SizeCell/DraftActions) trong dock trái, xóa `type: 'token'` khỏi BoardNode; board cũ có token node thì `withTokenNode`/`openingNodes` lọc bỏ im lặng. Thay thế đã cân nhắc: giữ node + `hidden` khỏi fit — vẫn vướng minimap và drag lạc, loại.
4. **Focus-mode bằng `setCenter` + zoom 1.0, state trong BoardView.** `useReactFlow().setCenter(x, y, { zoom: 1, duration: 320 })`; double-click trên `.phone-label` (không phải iframe) nên không xung đột drag; `←/→` theo thứ tự x của phone nodes; Esc thoát (cũng thoát measure-mode — một Esc làm một việc, ưu tiên thoát focus trước).
5. **Hint-bar là div trong `.board-wrap`, không phải toast.** Luôn thấy khi ở measure/focus mode, nêu click/drag/Esc; rẻ, không thư viện, không timer.
6. **Dark app-chrome bằng `data-theme` trên `.app` + CSS vars có sẵn.** Iframe đã theo `tokenTheme`; toolbar/panel/dashboard dùng cùng token (bg/label/separator) qua 4 file styles hiện có — không theme system mới. Đo lường không đổi vì nằm trong iframe.
7. **Xóa inline-confirm: 1 component `InlineConfirm` dùng chung node × và panel.** Bỏ `window.confirm`; confirm/cancel tại chỗ, timeout tự hủy sau 6s nếu không chọn. Không undo-stack (quá scope — file HTML giữ nguyên nên khôi phục = thêm lại node).
8. **Dropdown thêm-màn lọc theo project trước.** `SCREENS` đã có + `resolveScreens(project)`; default list = project screens, opt-in "Tất cả màn hình" mới hiện 18 màn. Không đổi registry.

## Risks / Trade-offs

- [Risk] Hit-test qua iframe làm click đo trễ 1 frame → Mitigation: chỉ bật cho click (không phải hover), hover-highlight vẫn chỉ ở measure mode.
- [Risk] `fitView({ nodes })` với node chưa đo xong (height ước lượng) → Mitigation: refit sau khi `sizes` ổn định (debounce 300ms), giữ fit thủ công của user (không refit sau lần đầu).
- [Risk] Dock trái bóp canvas trên màn hẹp → Mitigation: dock collapsible + overlay dưới 900px như panel hiện tại.
- [Risk] Dark app-chrome lộ màu cứng trong styles/*.css → Mitigation: rà soát hex cứng trong 4 file styles khi implement, thay bằng token.
- [Risk] Bỏ `confirm()` làm user xóa nhầm → Mitigation: inline-confirm nêu rõ "File html giữ nguyên" + nút hoàn tác nhanh = thêm lại màn vừa xóa trong 6s.

## Migration Plan

Thứ tự: toolbar/fit/chrome-sync (không đụng node) → token-dock (lọc node cũ) → click-through đo → focus-mode → panel-guidance. Mỗi slice build + mở board verify. Rollback = revert slice; localStorage v2 tương thích (nodes phone giữ nguyên id/vị trí).

## Open Questions

- Không có — các quyết định locale (tiếng Việt), icon-button cho action phụ, và first-match token đã chốt ở review và change trước.
