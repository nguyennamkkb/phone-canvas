# Proposal

## Why

Review UI/UX trên screenshot thật cho thấy Board là công cụ đo đúng nhưng khó dùng: toolbar tràn chữ ở 1440px, fit-view lần đầu co 7 màn tí hon giữa khoảng xám trống, và cặp mode Di chuyển/Đo đạc bắt user học thuộc — board hiện tại phục vụ người đã biết dùng, chưa tự dạy được người mới mở lần đầu.

## What Changes

- **Toolbar không bao giờ tràn**: gom 6 cụm thành 4 nhóm (điều hướng, xem, thêm, panel), các action phụ (`Vừa khung`, toggle panel) thành icon-button, chữ không bao giờ bị cắt ở viewport ≥ 1280px.
- **Fit-view lần đầu nhìn được ngay**: loại token-table khỏi phép tính fit (riêng node phone), màn to gần gấp đôi ngay khi mở board, khoảng xám chết giảm mạnh.
- **Token-table rời canvas thành dock trái**: collapsible, không còn là node React Flow, không ép nhỏ phone trong fit-view, không hiện trên minimap; draft/preview/Copy CSS giữ nguyên.
- **Đo không cần đổi mode**: click element trong node ở mode Di chuyển cũng chọn được spec (click node = chọn màn, click element = chọn element); giữ mode Đo đạc cho power-user; hint-bar + Esc + cursor gợi ý.
- **Focus mode duyệt màn**: double-click label zoom 100% vào màn, `←/→` qua lại giữa các màn, Esc về fit — thao tác reviewer dùng 90% thời gian.
- **Panel/Copy rỗng có CTA**: empty-state 2 dòng + nút hành động, nút Copy JSON disabled giải thích vì sao (đang đọc DOM), tree element có ô lọc.
- **Chia sẻ được phát hiện**: nút "Chép link board" cạnh tên project (URL hash đã có từ change trước).
- **Đồng bộ còn lại**: text React Flow Controls tiếng Việt, dark mode phủ cả app chrome (toolbar/panel/dashboard) thay vì chỉ iframe, 1 pattern xóa (bỏ `confirm()` native), dropdown thêm-màn chỉ liệt kê màn của project.

Non-goals: không đổi wire format bridge, không đổi contract tác giả màn hình, không đổi visual 18 màn, không chạm export PNG.

## Capabilities

### New Capabilities

- `board-toolbar`: toolbar gọn không tràn — 4 nhóm, icon-button cho action phụ, chữ đầy đủ ở mọi viewport desktop.
- `board-fitview`: fit-view lần đầu to, rõ — token-table ngoài phép tính, phone chiếm đa số viewport.
- `token-dock`: token-table là dock trái collapsible thay vì node canvas — draft/preview/copy giữ nguyên hành vi.
- `measure-without-mode`: đo element không cần đổi mode — click phân biệt node/element, hint-bar, Esc, cursor gợi ý.
- `focus-mode`: duyệt từng màn ở 100% — double-click focus, `←/→` chuyển màn, Esc về fit.
- `panel-guidance`: panel tự dẫn dắt — empty-state CTA, Copy JSON nói rõ lý do disabled, tree có lọc.
- `board-chrome-sync`: chrome đồng bộ — Controls tiếng Việt, dark mode cả app, 1 pattern xóa, dropdown thêm-màn theo project, nút chép link board.

### Modified Capabilities

- (trống — `openspec/specs/` chưa có spec nào; change trước `product-ready-restructure` đã complete nhưng chưa archive nên chưa có main spec.)

## Impact

- Mã nguồn: `src/canvas/Board.tsx` (toolbar, Controls locale, fit logic), `src/board/BoardView.tsx` (focus state, keyboard, token-dock wiring, copy-link), `src/canvas/TokenNode.tsx` + dock mới, `src/canvas/PhoneNode.tsx` (click-through đo, double-click focus), `src/inspect/*` (empty-state CTA, tree filter), `src/styles/*.css` (toolbar wrap, dock, hint-bar, focus ring), `src/projects/*` (dropdown theo project).
- Không đổi: bridge wire format, `buildSpec`, export pipeline, manifest/registry, tokens contract.
- Rủi ro chính: click-through đo trong iframe inert đòi bật `pointerEvents` có chọn lọc — sai là hỏng drag node; bọc sau ErrorBoundary đã có và test thủ công checklist.
