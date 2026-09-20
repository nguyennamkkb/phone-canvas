# Tasks

## 1. Setup nền tảng

- [x] 1.1 Thêm `vitest` (dev dep) + script `test`, chạy `npm test` xanh với 1 test mẫu cho `toHex`
- [x] 1.2 Thêm `public/favicon.svg` + `<link rel="icon">` trong `index.html`, verify hết 404 `favicon.ico` trong console khi load mới
- [x] 1.3 Quyết định attribution React Flow (mua Pro hoặc bỏ `hideAttribution`), verify console hết warning attribution

## 2. App shell chuẩn product (spec: app-shell)

- [x] 2.1 Thêm `useHashRoute` hook + route `/` dashboard và `/p/:projectId` board, verify mở `/p/mood-core` trực tiếp vào đúng board và nút back browser hoạt động
- [x] 2.2 Thêm `ErrorBoundary.tsx`, bọc BoardView (recovery view) và từng PhoneNode iframe (card lỗi + nút remount), verify bằng cách throw thử trong dev và thấy recovery view thay vì trắng trang
- [x] 2.3 Thêm trạng thái panel: loading khi chưa có capture, error + nút retry khi quá hạn không có capture, verify bằng cách chặn postMessage trong devtools và thấy nút retry
- [x] 2.4 Panel responsive: dưới breakpoint thành overlay có nút đóng, canvas giữ full width, verify ở viewport 390px panel không bóp canvas
- [x] 2.5 Thống nhất locale UI (mặc định tiếng Việt, giữ thuật ngữ SwiftUI/CSS tiếng Anh), verify không còn lẫn lộn trên Dashboard/Board/Panel
- [x] 2.6 Xóa màu cứng trong `project/mood-core/home.html` về token, verify `npm run lint:tokens` 0 warning và export PNG light-mode không đổi

## 3. Tái cấu trúc code (không đổi behavior)

- [x] 3.1 Tách `BoardView` khỏi `App.tsx` thành `src/board/BoardView.tsx` + `useBoardNodes` + `useBoardPersistence`, verify board mở/thêm/xóa/select node như cũ
- [x] 3.2 Tách `SpecPanel.tsx` (322 dòng) thành cây element / bảng spec / copy JSON, verify click cây + click Đo đạc + Copy JSON như cũ
- [x] 3.3 Tách `TokenNode.tsx` (297 dòng) thành bảng token / editor / draft-actions, verify sửa token preview + Copy CSS như cũ
- [x] 3.4 Chẻ `app.css` (1444 dòng) thành `shell/board/panel/tokens-ui` giữ nguyên class names, verify `vite build` pass và UI pixel-identical
- [x] 3.5 Chẻ `scripts/export.ts` (568 dòng) thành `cli/cdp/site/render` module, verify `npm run export -- --list` và export 1 màn ra đúng PNG
- [x] 3.6 Version hóa localStorage (`v: 2`, đọc cũ ghi mới, corrupt → fresh + warn), verify board cũ vẫn mở được và key hỏng không crash app

## 4. Authoring DX (spec: authoring-dx)

- [x] 4.1 Viết `scripts/new-screen.ts` scaffold từ template đúng contract (1 `.screen`, 1 `.body`, token-only, icon/art đúng lane), verify chạy thử ra file HTML pass lint
- [x] 4.2 Scaffold tự wiring manifest + `index.ts` + `builtin.ts` và từ chối input xấu (project lạ, slug sai, id trùng) không ghi file, verify bằng chạy sai + đúng
- [x] 4.3 Mở rộng lint chặn banned CSS/icon thiếu `data-symbol`/màu ngoài token với message nêu file+dòng+cách sửa, verify `npm run lint` fail rõ ràng trên fixture xấu
- [x] 4.4 Gộp registry về một nguồn (generate `index.ts` từ manifest, giữ file checked-in), verify `vite build` + `export --list` đủ 18 màn
- [x] 4.5 Cập nhật `docs/screen-authoring.md` với flow scaffold mới, verify làm theo docs từ đầu ra được màn mới lên board

## 5. Quality gates (spec: quality-gates)

- [x] 5.1 Unit test `buildSpec`: role inference + SwiftUI shape cho text/icon/row/column/ZStack-layer/Block, verify `npm test` fail khi đổi mapping
- [x] 5.2 Unit test công thức: lineSpacing/weightName/toHex/offset + `composeScreenDoc` (3-band shell, bridge on/off, theme attr, stylesheet order), verify `npm test` xanh
- [x] 5.3 Unit test `tokensOf/tokenNameForColor` (project thắng global, dark fallback light) + `storage` (snapshot hỏng → fallback không throw), verify `npm test` xanh
- [x] 5.4 Export smoke test 1 màn reference ra PNG đúng kích thước content-driven, tự skip khi thiếu Chrome, verify pass trên máy có Chrome
- [x] 5.5 Freeze schema Copy-JSON bằng snapshot/schema test có version, verify đổi payload làm test đỏ
- [x] 5.6 Gộp cửa chất lượng thành một lệnh (`typecheck + lint + test`), verify lệnh exit non-zero khi cố tình làm hỏng 1 check

## 6. Nghiệm thu

- [x] 6.1 Chạy toàn bộ gate trên cây sạch (`npm run lint && npm test && npm run build`), export đủ 18 màn, và đi hết checklist tay: dashboard → board → Đo đạc → spec → copy JSON → dark mode → viewport hẹp, verify không còn mục đỏ
