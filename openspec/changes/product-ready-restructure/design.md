# Design

## Context

phone-canvas hôm nay: `App.tsx` (419 dòng) ôm dashboard + board-state + persistence + keyboard + theme; board và panel giao tiếp qua `InspectorContext` + `BoardContext`; đo đạc qua `bridge.js → buildSpec`; persist bằng localStorage không version; CSS một file 1444 dòng; export là một file 568 dòng; chưa có router, test, error boundary, scaffold. Mọi spec mới (app-shell, authoring-dx, quality-gates) phải đáp xuống cấu trúc này mà không đổi wire format bridge hay contract tác giả màn hình.

## Goals / Non-Goals

**Goals:** tách App thành shell + board-view + hooks có thể test; URL điều hướng được; lỗi bị nhốt trong boundary; lint/test khóa hành vi đo đạc; thêm màn bằng một lệnh.

**Non-Goals:** không đổi `RawNode` wire format, không đổi `tokens.css` vocabulary, không đổi visual của 18 màn hiện tại (trừ màu cứng dark-mode), không backend, không i18n đa ngôn ngữ.

## Decisions

1. **Router nhẹ tự viết thay vì react-router.** App chỉ có 2 route (`/` và `/p/:id`); thêm dep router là thừa. Một `useHashRoute` hook (~40 dòng, hash-based để `vite preview` / file-static không cần server rewrite) + `saveLastProject` thành fallback. Trade-off: URL có `#` — chấp nhận, docs ghi rõ; khi cần server-rewrite sau này đổi sang history API trong một task.
2. **Error boundary class-component bọc BoardView và từng PhoneNode iframe.** React 19 không có hook boundary; một `ErrorBoundary.tsx` duy nhất dùng lại hai chỗ: sập 1 iframe → card lỗi tại chỗ + nút remount, sập cả board → recovery view. Không bọc từng element spec (quá mịn, noise).
3. **localStorage version hóa với prefix mới, đọc cũ ghi mới.** Key `pc.board.<id>` đọc được cả 2 format (nhận diện bằng field `v: 2`), nhưng luôn ghi format mới; corrupt → fresh layout + `console.warn`, không crash. Tránh migration script — dữ liệu là layout cục bộ, mất cũng tái tạo được.
4. **Scaffold là Node script thuần (`scripts/new-screen.ts`), không phụ thuộc Vite.** Đọc `manifest.ts`/`builtin.ts` bằng parse text (giống cách `export.ts` import trực tiếp file `.ts` qua Node 22 type-stripping đã dùng), ghi HTML từ template, chèn 3 điểm wiring bằng anchor comment. Registry gộp sau: bước 1 scaffold tự chèn đủ 3 chỗ cũ (an toàn), bước sau (task riêng) mới gộp `index.ts` về generate từ manifest — tách làm hai để không vừa đổi vừa gánh rủi ro.
5. **Vitest cho unit, export-smoke chạy Chrome thật.** `infer.ts`/`compose.ts`/`tokens.ts`/`storage.ts` là pure → vitest nhanh, không cần browser. Riêng export smoke tái dùng `renderPng` nhưng tách ra khỏi `export.ts` thành `scripts/export/render.ts` để test import được mà không kéo CLI parsing. Không dựng Playwright E2E lần này: cost cao, giá trị thấp hơn unit khóa số đo.
6. **CSS chẻ theo feature, không CSS-module/utility-fw.** `app.css` → `shell.css` (dashboard+layout), `board.css` (flow+node+toolbar), `panel.css` (spec/tree/detail), `tokens-ui.css` (token table). Giữ class names cũ nguyên để không vỡ snapshot DOM; chỉ chuyển dòng. Không đổi sang Tailwind — design tokens đã là system riêng, thêm layer mới gây drift.
7. **Freeze handoff bằng JSON-schema snapshot, không snapshot PNG pixel.** PNG phụ thuộc font/OS render, snapshot pixel gây flaky. Khóa: schema + 1 fixture spec của `Copy JSON`, và export smoke chỉ assert kích thước + tồn tại file.

## Risks / Trade-offs

- [Risk] Tách `App.tsx`/`Board.tsx` làm lệch behavior tinh vi (fitView timing, selection) → Mitigation: tasks tách theo slice dọc chạy được sau mỗi bước + smoke thủ công checklist trong tasks.
- [Risk] Hash-router bị coi là "không chuẩn product" → Mitigation: isolate trong `useHashRoute`, API giống history-router để thay sau một task.
- [Risk] Gộp registry (`index.ts` generate từ manifest) phá Vite `?raw` static import → Mitigation: làm sau cùng, giữ file `index.ts` checked-in do script sinh ra (không vite-plugin runtime), test bằng `vite build` trong task đó.
- [Risk] Export smoke cần Chrome trên CI → Mitigation: test tự skip có thông báo khi không tìm thấy Chrome (`findChrome` throw → `test.skip`), unit vẫn chạy đủ.
- [Risk] Sửa màu cứng `home.html` đổi visual nhẹ ở dark mode → Mitigation: đó chính là mục tiêu (đúng token), export PNG light-mode trước/sau để diff review.

## Migration Plan

Không migration dữ liệu. Triển khai theo thứ tự tasks: shell (route+boundary, tương thích URL cũ = dashboard) → tách component/CSS (không đổi behavior) → scaffold+lint (cộng thêm, không xóa flow cũ) → test (khóa lại) → registry gộp (bước rủi ro nhất, để cuối). Rollback = revert commit theo slice; mỗi slice tasks đều có gate `npm run lint && npm test` xanh.

## Open Questions

- Attribution React Flow: mua Pro hay hiện lại attribution? (Không ảnh hưởng tasks — để 1 task quyết định + thực hiện, default: hiện lại attribution.)
- Locale mặc định của UI mới (giữ Việt-Anh lẫn hay thống nhất tiếng Việt)? Không đổi spec, quyết lúc implement.
