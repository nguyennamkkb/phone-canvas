# Design

## Context

Xem `proposal.md — Why`. Nợ gốc từ track `ci-chromium-goldens` của `core-hardening`: test khóa version bằng cách đòi binary thật trong cache (`expect(pinned).not.toBeNull()`), nên mọi máy chưa tải đúng `chromium-1243` đều đỏ — trong khi dev box này resolve Chrome bằng binary hệ thống (`/Applications/Google Chrome.app/...`, `source=local`) và cache chỉ có `chromium-1097`. Smoke test trong cùng file đã có pattern skip (`skip: no Chrome on this machine`), test lỗi là chỗ duy nhất không theo. Warn tokens tương tự: rule không phân biệt định nghĩa token với dùng màu cứng.

## Goals / Non-Goals

**Goals:** `npm run gate` xanh trên cả 3 dạng máy (dev có Chrome hệ thống, CI có pinned Chromium, máy trắng không Chrome nào — smoke skip). Không nới lỏng khóa version CI.

**Non-Goals:** Không đổi thứ tự resolve `$CHROME_PATH` → local → pinned; không đụng `golden.ts`/ngưỡng phash; không chẻ/sửa `tokens.css` hay vocab; không sửa SpecPanel/UI.

## Decisions

- **Skip-guard thay vì mock `existsSync` hay bump version.** Mock fs làm test mất giá trị (không còn kiểm tra binary thật); bump `PLAYWRIGHT_CHROMIUM_VERSION` xuống 1097 phá CI pin. Guard `if (!pinned) { console.warn('skip: ...'); return }` theo đúng pattern smoke test đã dùng — rẻ nhất, nhất quán nhất. Alternative đã loại: `it.runIf` của vitest (tính condition lúc collect, vẫn cần import/eval — guard trong thân rõ hơn và log được lý do).
- **Giữ assertion hằng số làm khóa version.** Test `pins one Playwright Chromium version` không chạm filesystem nên pass mọi nơi — đó mới là chỗ khóa CI, không phải test binary. Tách 2 mối quan tâm: hằng số (luôn check) vs binary (check khi có).
- **Definition-site exemption bằng AST/parse hiện có, không allowlist file.** Allowlist `growpal-premium.html` chỉ chữa 1 màn; rule chung (`--*:` declaration → miễn) chữa cả lớp màn tự khai palette scope sau này. `tokens-lint.ts` đã parse được declarations (nó báo được `file:line`), nên chỉ thêm điều kiện bỏ qua khi property bắt đầu bằng `--`. Use-site giữ nguyên severity.

## Risks / Trade-offs

- Guard skip có thể che mất regression thật nếu CI quên cài Chromium → Mitigation: CI vẫn fail ở assertion khác khi `resolveChrome()` throw (smoke test báo thiếu Chrome), và log skip hiện rõ trong output; thêm check CI workflow cài đúng version pinned.
- Miễn definition-site có thể bỏ lọt màn "định nghĩa token mới thay vì dùng token có sẵn" (phình design system) → Mitigation: warn chuyển thành rule riêng ở mức thấp hơn hoặc review tay; scope change này chỉ xóa false-positive, không cấm rule mới sau này.

## Migration Plan

Không migration: 2 file sửa tương thích ngược, không đổi output board/export/PNG. Rollback = revert 2 file. Verify sau apply: `npm run gate` xanh + `npm test` trên máy này (pinned vắng → skip + log) là đủ.
