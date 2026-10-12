# Tasks

## 1. Toán hàng dùng chung (`placement.ts`)

- [x] 1.1 Thêm `layoutRows(rows, gapX, gapY)`: mỗi hàng reset `x = 0`, dùng `nodeOuterWidth`/`nextSlotX` cho `x`, `y` hàng sau = đáy hàng trước + `ROW_GAP`; export `ROW_GAP = 160` và `outerHeight` cạnh `nodeOuterWidth`
- [x] 1.2 Thêm `placement.test.ts`: 3 màn một hàng đúng thứ tự + không overlap khi lẫn tablet/phone; 2 hàng tách dọc đúng `ROW_GAP`; cùng input cho cùng output (deterministic)

## 2. Board dùng model hàng (`BoardView.tsx`, `storage.ts`)
- [x] 2.1 Snapshot thêm `arrangement?: { rows: { name?: string; screens: string[] }[] }` (đọc-cũ/ghi-mới, v5 không field này mở đường cũ); `parseStateFile`/`validBoardSnapshot` chấp nhận cả hai
- [x] 2.2 `freshNodes`/`reconciledNodes`/live-sync gọi `layoutRows` thay vì `nextSlotX` lẻ; màn mới vào hàng cuối của model đã lưu, không xếp lại node cũ
- [x] 2.3 Mở board kiểm chứng: snapshot cũ verbatim, seed chỉ thắng khi `exportedAt > savedAt` (giữ newer-wins); reconcile màn mới không nhảy vị trí cũ

## 3. CLI freeze (`board-freeze.ts`, `project.ts`)

- [x] 3.1 Thêm `--order a,b,c`, `--row-size N`, `--rows "a,b;c,d"` (+ `--sort alpha` giữ hành vi alphabet cũ); ưu tiên `--rows` > `--order`+`--row-size` > manifest; mặc định không flag = manifest một hàng
- [x] 3.2 Validate toàn bộ id trước khi tính: id lạ exit 1 + nêu id, không ghi file/không chạm `.bak`; thêm `--dry-run` in hàng + tọa độ ra stdout để agent tự kiểm tra
- [x] 3.3 Test CLI: `--order` + `--row-size` ra 2 hàng đúng thứ tự; id lạ exit 1 và không ghi gì; không flag giữ tương thích (trừ alphabet → manifest đã chốt ở design)

## 4. Skill recipe (`phone-canvas`)

- [x] 4.1 Thêm `recipes/board-arrange.md`: đầu vào `screen -- list`, quy tắc chia hàng/đặt tên nhóm, ghi seed + `--dry-run`, nhắc newer-wins (localStorage thắng seed) và `failure-modes.md §12`
- [x] 4.2 Cập nhật `references/tooling.md`: mục freeze mới (flags hàng, shape `parseStateFile`, `.bak`) + trỏ recipe; `SKILL.md` không cần đổi loop

## 5. Gate + verify browser
- [x] 5.1 `npm run gate` xanh (typecheck + lint + `audit:regions` + vitest, gồm test mới ở 1.2 và 3.3)
- [x] 5.2 Verify trên `npm run dev`: freeze 2 hàng cho một project thật → xóa bản lưu → mở board đúng 2 hàng đúng thứ tự; kéo 1 node → reload giữ vị trí tay; export 1 màn trong board đã xếp, PNG cùng kích thước như trước
