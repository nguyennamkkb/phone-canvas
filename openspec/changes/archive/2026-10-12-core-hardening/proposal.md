# Proposal

## Why

Đọc hết core (`compose.ts`, `bridge.js`, `infer.ts`, registry, board, scripts) thấy 5 nợ có thật: parse HTML bằng regex, `tokens.css` god-file 2209 dòng, bridge/IR không schema runtime, export/audit kẹt Chrome máy local, số region copy ở 3 đầu docs. Mỗi cái đã có guard tạm (subset-lint, token routing, SKIPPED exit 0, "spec wins") nhưng đều靠 kỷ luật tay thay vì enforce bằng code.

## What Changes

- `compose.ts`: thay string-scan (`matchElementEnd`, `takeAttributed`, `splitOpenTag`) bằng DOM parser thật; giữ nguyên signature `composeScreenDoc/liftNav/slotNames/activeTabOf/screenBgOf`; regex cũ giữ 1 release làm fallback có warn khi lệch.
- `tokens.css`: chẻ thành `core.css` (spacing/region/type) + `palettes.css` + `vocab.css`; `stylesheetsFor()` load theo thứ tự; `tokens-lint` thêm rule cấm literal thay token + bắt dark-twin.
- Bridge → parent: định nghĩa `RawPayload`/`SpecIR` bằng schema validate 2 chiều trong `InspectorContext onMessage`; bridge gửi `v:1`; payload sai version bị drop + đếm; `postMessage('*')` thêm origin check, giữ token check hiện tại.
- Export/audit: `chrome.ts` hỗ trợ Chromium pinned cho CI (local vẫn Chrome máy); `golden.ts` thêm phash + ngưỡng theo OS bên cạnh sha256 hiện tại.
- Docs region: `openspec/specs/screen-regions/` là nguồn số duy nhất; README/SKILL/recipes chỉ link; thêm `region-docs-lint` grep số trần trong docs vào `npm run lint`.

## Capabilities

### New Capabilities

- `compose-parser`: DOM parser thật sau lưng regex trong `composeScreenDoc` (fallback warn 1 release, fixture HTML lỗi, board/export byte-identical).
- `token-layers`: chẻ tokens 3 lớp + 2 rule lint mới (no-literal, dark-twin).
- `bridge-schema`: schema `RawPayload`/`SpecIR`, version `v:1`, drop-đếm, origin check.
- `ci-chromium-goldens`: Chromium pinned cho CI + golden perceptual theo OS.
- `single-source-regions`: region docs 1 nguồn sinh + `region-docs-lint`.

### Modified Capabilities

(none — không spec hiện có nào bao hành vi trên; `screen-regions` là prose nguồn, change này chỉ enforce nó.)

## Impact

- `src/extractor/compose.ts`, `src/extractor/assets.ts`, `src/screens/tokens.css` (+2 file mới), `scripts/tokens-lint.ts`, `src/inspect/InspectorContext.tsx`, `src/extractor/bridge.js`, `src/spec/types.ts`, `scripts/export/chrome.ts`, `scripts/export/golden.ts`, docs region + `package.json` lint.
- Không đổi 5 invariants, không đổi SpecPanel UI, không đổi registry/derive contract. Gate (`lint + audit:regions + vitest`) vẫn xanh suốt từng track.
