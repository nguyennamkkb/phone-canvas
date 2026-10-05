# Design

## Context

Xem `proposal.md — Why`. 5 track độc lập về file, chung một gate (`lint + audit:regions + vitest` xanh suốt). Constraint lớn nhất: `composeScreenDoc` là hàm duy nhất cả app (`buildSrcDoc` qua `?raw`) và exporter (đọc disk) cùng gọi — mọi thay đổi ở đó phải giữ contract byte-identical.

## Goals / Non-Goals

**Goals:** 5 spec trong `specs/` đều implementable độc lập, merge theo thứ tự 3 → 1 → 2 → 5 → 4 mà không block nhau quá 1 ngày.

**Non-Goals:** Không đổi 5 invariants; không sửa SpecPanel UI; không đụng registry/derive; không thêm backend/collab.

## Decisions

- **Parser: `parse5` đằng sau signature cũ.** `parse5` chạy được cả Node lẫn browser (cho `composeScreenDoc`), không cần DOM đầy đủ. `takeAttributed`/`matchElementEnd` viết lại trên cây parse5; hàm regex cũ giữ trong `compose.legacy.ts` 1 release, so sánh + warn khi lệch. Alternative (linkedom/jsdom): nặng hơn, jsdom không chạy trong Vite build path.
- **Tokens: chẻ file, không chẻ concept.** Tên biến giữ nguyên (`--s*`, `--touch-min`…) nên screen không sửa dòng nào; chỉ đổi nơi định nghĩa + thứ tự cascade trong `stylesheetsFor()`. Rule lint mới tái dùng `tokensOf()` đã có trong `src/tokens/tokens.ts`.
- **Schema: `zod-mini` thay vì zod đầy đủ.** Bundle board quan tâm KB; validate chỉ ở `onMessage` (đường nóng nhưng payload nhỏ). `RawPayload.v=1`, mismatch → drop + counter trong `InspectorContext` (panel đọc được).
- **CI Chromium: Playwright pinned, local-first.** `chrome.ts` thứ tự: `$CHROME_PATH` → Chrome máy → Playwright Chromium (log rõ đang dùng nguồn nào). Golden giữ `sha256` cho local, thêm `phash` + ngưỡng/OS dir cho CI — 2 cơ chế song song, badge đọc cả 2.
- **Docs: lint thay vì convention.** `region-docs-lint.ts` grep số trần (`44|68|16|…` trong ngữ cảnh pt) ngoài `openspec/specs/screen-regions/`; allowlist cho đoạn nói về chính lint. Chạy trong `npm run lint`.

## Risks / Trade-offs

- parse5 thêm ~300KB vào exporter (Node, không sao) và vào Vite bundle qua `compose.ts` — mitigate: `import` lazy chỉ khi không fallback, hoặc tách `compose.node.ts`/`compose.dom.ts` nếu bundle phình (đo sau).
- Chẻ tokens đổi cascade: rủi ro specificity đảo thứ tự — mitigate bằng test so PNG trước/sau trên mọi screen hiện có.
- phash ngưỡng sai gây miss regression thật — mitigate: ngưỡng khởi đầu chặt (Hamming ≤ 4), tune bằng golden hiện có.
