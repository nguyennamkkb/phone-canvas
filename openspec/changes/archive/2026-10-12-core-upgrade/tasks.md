# Tasks

## 1. Parity icon board = export

- [x] 1.1 Inline icon mask thành data-URI lúc `composeScreenDoc` (board srcdoc), đo kích thước srcdoc trước/sau, verify icon hiện trên board giống export (`npm run dev` + `npm run export -- --screen <id>` so bằng mắt)
- [x] 1.2 Bổ sung test: compose board-srcdoc không còn `url()` ngoài cho mask, verify `vitest run` cho suite extractor xanh
- [x] 1.3 Cập nhật `references/failure-modes.md` #1 thành "đã fix", verify docs build/link không gãy

## 2. Board diagnostics

- [x] 2.1 Node hiện nguyên nhân compose-failure (lỗi + file + dòng), verify bằng màn include component_missing → node báo đúng tên component
- [x] 2.2 `audit:regions` thiếu Chrome → lỗi显式 + exit 1, verify bằng cách chạy gate khi unset `CHROME_PATH` trên máy không Chrome (hoặc mock) → gate đỏ kèm hướng sửa
- [x] 2.3 Test cho cả hai nhánh lỗi, verify `vitest run` xanh

## 3. Element-level tooling (nối locate)

- [x] 3.1 Nút "Xuất element đang chọn" trên panel (truyền `selected.box` vào pipeline locate), verify click → ra PNG + JSON đúng box ở 3 device (reference/SE/tablet)
- [x] 3.2 Thumbnail live của selection trong panel (locate thu nhỏ scale 1, cache theo content hash), verify đổi selection → thumbnail đổi theo
- [x] 3.3 Crop pad % + option gồm ancestors 1 cấp, verify element dài (plan-card) và cụm (countdown) không cụt/thừa
- [x] 3.4 Export children hàng loạt (mỗi con 1 PNG + JSON, tên theo data-asset/class), verify trên 1 màn paywall nhiều card
- [x] 3.5 Test cho crop/naming/clamp, verify `vitest run` xanh

## 4. Golden element + diff inline

- [x] 4.1 Mở rộng `golden.ts` record `{elementKey, cropHash, specHash}`, tái dùng Hamming ≤ 4, verify `--golden` sinh record element
- [x] 4.2 Badge `lệch` click → side-by-side trên board, verify bằng 1 component sửa CSS (pw-card polish)
- [x] 4.3 Panel so sánh spec 2 màn cạnh nhau, verify đặt seasonal-sale vs family-plan thấy drift spacing/type
- [x] 4.4 Test compare + badge states, verify `vitest run` xanh

## 5. Tokens + board state + test isolation

- [x] 5.1 Lint dark-twin (đỏ khi dark copy-paste base) + codemod paywall-kit về base + override tối thiểu, verify `lint:tokens` đỏ trước / xanh sau, board render dark không đổi (so PNG)
- [x] 5.2 Gộp board state (bỏ sync XHR, migration đọc cũ → ghi mới 1 release), verify Xuất/Nhập/freeze/restore còn đúng + backup `.bak`
- [x] 5.3 Test tmp isolation mỗi suite, gỡ `fileParallelism:false`, verify `vitest run` song song xanh và nhanh hơn baseline
- [x] 5.4 Chạy `npm run gate` full (lint + audit + test) xanh toàn repo, verify không regression màn nào

## 6. Tích hợp

- [x] 6.1 Golden vào CI cho component chốt (pw-card, pw-cta), verify CI đỏ khi crop đổi ngoài ý muốn
- [x] 6.2 Cập nhật `docs/core-review.md` đánh dấu các mục đã làm + `openspec archive` change khi xong, verify `openspec status` complete
