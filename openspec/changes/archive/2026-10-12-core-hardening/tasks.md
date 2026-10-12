# Tasks

## 1. bridge-schema (làm trước, rẻ nhất)

- [x] 1.1 Định nghĩa schema `RawPayload`/`SpecIR` (hand-rolled `src/spec/validate.ts`, thay vì `zod-mini` — giữ zero-dep), version `v:1`; bridge gửi kèm version
- [x] 1.2 Validate trong `InspectorContext onMessage`: sai → drop + counter panel thấy được
- [x] 1.3 Origin check giữ token routing; test message lạ/token sai bị bỏ qua
- [x] 1.4 `npm run gate` xanh (lint + audit:regions + vitest)

## 2. compose-parser (nợ lớn nhất)

- [x] 2.1 Thêm `parse5`, viết lại `takeAttributed`/`matchElementEnd` trên cây thật, giữ signature
- [x] 2.2 Regex cũ → `compose.legacy.ts`, so sánh + `console.warn` khi lệch
- [x] 2.3 Fixture HTML lỗi (unquoted attr, nested cùng tag, void-tag, comment chứa `<div>`); board/export byte-identical trên mọi screen hiện có
- [x] 2.4 `npm run gate` xanh

## 3. token-layers

- [x] 3.1 Chẻ `tokens.css` → `core.css` + `palettes.css` + `vocab.css`; `stylesheetsFor()` giữ thứ tự
- [x] 3.2 So PNG trước/sau trên mọi screen (không pixel nào đổi)
- [x] 3.3 `tokens-lint`: rule no-literal + dark-twin (có allowlist)
- [x] 3.4 `npm run gate` xanh

## 4. single-source-regions

- [x] 4.1 Xóa số copy trong README/SKILL/recipes → link về `openspec/specs/screen-regions/`
- [x] 4.2 Thêm `region-docs-lint.ts` vào `npm run lint`
- [x] 4.3 `npm run gate` xanh

## 5. ci-chromium-goldens (infra nặng nhất, làm cuối)

- [x] 5.1 `chrome.ts`: `$CHROME_PATH` → Chrome máy → Playwright Chromium pinned (log nguồn)
- [x] 5.2 `golden.ts`: thêm phash + ngưỡng/OS dir bên cạnh sha256; badge đọc cả 2
- [x] 5.3 Tune ngưỡng bằng golden hiện có (khởi đầu Hamming ≤ 4), verify cùng commit 2 OS đều `khớp`
- [x] 5.4 `npm run gate` xanh
