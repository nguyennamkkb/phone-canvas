# Tasks

## 1. chrome-test-env (làm trước — gate đang đỏ ở đây)

- [x] 1.1 Thêm skip-guard vào test pinned-binary trong `scripts/export/export.test.ts` (vắng binary → `console.warn('skip: no pinned Chromium in cache')` + return), verify `npx vitest run scripts/export/export.test.ts` pass trên máy này
- [x] 1.2 Giữ nguyên assertion `PLAYWRIGHT_CHROMIUM_VERSION` và test `source=local`, verify 4 test chrome-resolution đều xanh/skip đúng (pin-lock pass, local pass, pinned skip-có-log, wrong-path throw)
- [x] 1.3 Chạy full `npm test` (339 test) verify 0 failed

## 2. tokens-define-site (warn còn lại)

- [x] 2.1 Miễn definition-site (`--*:` declarations) khỏi warn màu cứng trong `scripts/tokens-lint.ts` (extract `leftoverHardColors`, span-based), giữ nguyên use-site, verify `npm run lint:tokens` ra `0 lỗi` và warn hex-definition biến mất (warn `rgba(…)` còn lại là use-site box-shadow thật, đúng spec giữ lại)
- [x] 2.2 Thêm/bổ sung case trong `scripts/tokens-lint.test.ts` (definition miễn, use-site vẫn báo), verify test file đó xanh
- [x] 2.3 Chạy `npm run gate` (lint + audit:regions + vitest) verify xanh toàn bộ
