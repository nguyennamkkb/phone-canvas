# Proposal

## Why

`npm run gate` đang đỏ 1 điểm duy nhất: `scripts/export/export.test.ts` fail ở test Playwright pinned binary trên mọi máy chưa tải `chromium-1243` (338/339 pass, lint + audit:regions đều 0 lỗi). Kèm 1 warn `lint:tokens` báo màu cứng ngay tại chỗ định nghĩa token (`--gp-*` trong `growpal-premium.html`). Cả hai đều là guard bắn nhầm, không phải lỗi sản phẩm — nhưng gate đỏ thì mọi change khác không chứng minh được mình xanh.

## What Changes

- Test `treats the Playwright cache binary as an explicit $CHROME_PATH` chuyển sang skip có log khi pinned binary vắng mặt (cùng pattern `skip: no Chrome` mà smoke test đã dùng); assertion khóa version `PLAYWRIGHT_CHROMIUM_VERSION` giữ nguyên, không nới.
- `tokens-lint`: miễn warn màu cứng tại definition-site (`--x: #...` trong `:root`/`<style>` scope màn) — warn chỉ còn bắn ở use-site (giá trị dùng trực tiếp trong property thường).
- Không đổi thứ tự resolve Chrome (`$CHROME_PATH` → máy → pinned), không đổi ngưỡng golden, không đổi contract `composeScreenDoc`.

## Capabilities

### New Capabilities

- `chrome-test-env`: test chrome-resolution chịu được máy thiếu pinned binary (skip + log), khóa version vẫn enforce bằng assertion hằng số.
- `tokens-define-site`: phân biệt definition-site vs use-site trong `tokens-lint`, warn màu cứng chỉ ở use-site.

### Modified Capabilities

(none — không spec hiện có nào bao hành vi test/lint trên; `screen-regions` là prose nguồn region, change này không đụng nó.)

## Impact

- `scripts/export/export.test.ts`, `scripts/tokens-lint.ts` (+ test của nó).
- Không đổi runtime board/export/audit; không đổi 5 invariants; `npm run gate` xanh toàn bộ sau change.
