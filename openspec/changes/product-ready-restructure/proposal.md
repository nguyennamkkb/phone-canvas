# Proposal — product-ready-restructure

## Why

phone-canvas đã chứng minh được giá trị cốt lõi (render HTML thật trong iframe, đo spec chính xác, export PNG khớp board), nhưng vẫn ở trạng thái prototype: component god (`App.tsx` 419 dòng ôm hết board-state/persistence/keyboard/theme), không routing (deep-link không tồn tại), thiếu error state, UI lẫn lộn Việt/Anh, CSS 1444 dòng trong một file, flow tạo màn hình mới thủ công 3–4 bước dễ quên, và **zero test** — mọi hồi quy về số đo đều câm lặng. Change này đưa dự án lên chuẩn product và dọn đường cho lần tích hợp MCP tiếp theo (lấy thiết kế từng màn hình để sinh code), vốn đòi hỏi đầu ra spec/export ổn định và có test khóa lại.

## What Changes

- **App shell chuẩn product**: routing bằng URL (`/` dashboard, `/p/:projectId` board, quay lại/nút back của browser hoạt động), error boundary cho board + iframe, kiểm kê và补 đủ các trạng thái loading/empty/error (spec đang đọc, spec thất bại, board trống, screen mất file), panel phải responsive (overlay trên màn hẹp thay vì bóp canvas), dark-mode hoàn tất (xóa màu cứng còn sót trong `home.html`), favicon + hết 404 console, quyết định attribution React Flow (mua Pro hoặc hiện lại).
- **Tái cấu trúc code**: tách `BoardView` khỏi `App.tsx` thành `BoardView.tsx` + hooks (`useBoardNodes`, `useBoardPersistence`), tách `SpecPanel` (cây element / bảng spec / copy JSON) và `TokenNode` (bảng token / draft) thành component nhỏ hơn, chẻ `app.css` theo feature (shell/board/panel/tokens), chẻ `scripts/export.ts` (cli/cdp/site/render), giữ ranh giới Node-safe (`compose.ts`, `builtin.ts`, `manifest.ts`) không dính import Vite-only.
- **DX tạo giao diện thuận tiện**: CLI `npm run new-screen -- --project <id> --name <slug> --title "..."` sinh file HTML từ template đúng contract + tự chèn manifest/registry/project wiring (hoặc gộp registry về một nguồn duy nhất để khỏi sửa 2–3 chỗ), `npm run lint` mở rộng kiểm tra subset CSS/icon/token và fail rõ ràng, cập nhật `docs/screen-authoring.md`.
- **Test cơ bản khóa hành vi**: thêm `vitest`, unit test cho `buildSpec` (role inference, ZStack, lineSpacing, image kind, cảnh báo mask), `composeScreenDoc` (3-band shell, bridge on/off, theme attr), `tokensOf/tokenNameForColor`, `storage` (snapshot corrupt → fallback), smoke test export 1 màn; `npm test` + `npm run lint` xanh là cửa bắt buộc.
- **Chuẩn bị cho MCP (không làm MCP)**: đóng băng format đầu ra — `Copy JSON` schema và PNG export byte-layout — bằng test snapshot, để change MCP lần sau chỉ việc cắm vào.

Non-goals (lần sau hoặc ngoài phạm vi): tích hợp MCP server, sinh code SwiftUI, edge/flow đa màn hình, backend persistence, i18n đầy đủ nhiều ngôn ngữ (lần này chỉ dựng nền + thống nhất một locale mặc định).

## Capabilities

### New Capabilities

- `app-shell`: shell chuẩn product — routing URL, error boundary, đủ trạng thái loading/empty/error, panel responsive, dark-mode hoàn chỉnh, favicon, attribution hợp lệ.
- `authoring-dx`: tạo màn hình mới bằng một lệnh scaffold + registry một nguồn + lint chặn lỗi subset/icon/token lúc dev.
- `quality-gates`: test cơ bản (vitest unit + export smoke) và cửa chất lượng `typecheck + lint + test` xanh.

### Modified Capabilities

- (trống — dự án chưa có spec nào trong `openspec/specs/`, mọi hành vi đo đạc/export hiện tại được khóa lại bằng test chứ không đổi requirement.)

## Impact

- Mã nguồn: `src/App.tsx` (tách `BoardView`), `src/canvas/*`, `src/inspect/*`, `src/app.css` (chẻ file), `scripts/export.ts` (chẻ module), `src/screens/*` (registry), `scripts/new-screen.*` mới, `package.json` (+vitest), `index.html` (favicon).
- Không đổi contract tác giả màn hình (`project/*/*.html`, tokens, bridge wire format) — các màn hiện tại chạy tiếp không sửa.
- localStorage keys (`pc.board.*`, `pc.projects.custom`, `pc.ui.*`, `pc.tokens.*`) được version hóa; key cũ đọc tiếp được, ghi theo format mới.
- Phụ thuộc mới duy nhất: `vitest` (dev). Không thêm runtime dep.
