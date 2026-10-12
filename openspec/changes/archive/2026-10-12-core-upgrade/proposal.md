# Proposal

## Why

`docs/core-review.md` (verified bằng đọc code trực tiếp + scout LongCat đào 6
mảng có ref file:line) chỉ ra core phone-canvas đúng ở kiến trúc (compose duy
nhất, raw-down/interpreted-up, gate 2 tầng) nhưng nứt ở parity board = export
(icon CORS), gate xanh giả khi thiếu Chrome, và thiếu hoàn toàn tooling
element-level (export/thumbnail/diff trong board). Không sửa thì số đo mất uy
tín đúng chỗ quan trọng nhất: cái mắt thấy ≠ cái máy đo.

## What Changes

- Inline icon/data-URI lúc `composeScreenDoc` để board thấy đúng cái export ra
  (parity board = export).
- `audit:regions` thiếu Chrome thì fail rõ thay vì `SKIPPED exit 0`.
- Nút "Xuất element đang chọn" 1 click trên panel (nối `locate` có sẵn) +
  thumbnail live của selection.
- Node compose-failure diagnostics (nguyên nhân, không chỉ symptom
  timeout/dropped).
- Gộp board state 3 cơ chế thành một, bỏ sync XHR seed.
- Base tokens chung + siết dark-twin lint (chống drift `:root` vs dark).
- Diff visual inline (click badge `lệch` → side-by-side) + panel so sánh spec 2
  màn.
- Export children hàng loạt + golden cấp element cho component chốt.
- Test tmp isolation, gỡ `fileParallelism:false`.
- Đóng 1–9 xong mới đụng Duo/tablet shell-owned (ngoài scope change này —
  ghi nhận, không làm).

## Capabilities

### New Capabilities

- `element-tooling`: xuất/thumbnail/diff/golden ở cấp element trong board
  (hôm nay chỉ có `locate` CLI + golden screen-level).
- `board-diagnostics`: node compose-failure diagnostics + audit fail rõ khi
  thiếu Chrome.

### Modified Capabilities

- `token-layers`: siết dark-twin + base tokens (thay đổi yêu cầu về token, không
  chỉ implementation) — rule cũ "token light thiếu dark-twin báo lỗi" bị gỡ, thay
  bằng "base tokens chung, dark override tối thiểu".

## Impact

- `src/extractor/compose.ts`, `src/canvas/PhoneNode.tsx`, `src/inspect/*`
  (SpecPanel, copy-json, badges), `scripts/region-audit.ts`,
  `scripts/locate.ts`, `scripts/export/*`, `project/*/tokens.css`,
  `scripts/*-lint.ts`, `vite.config.ts` (test isolation).
- Không đổi subset flexbox, không đổi shape Copy JSON v1, không đụng
  Duo/tablet shell contract.
