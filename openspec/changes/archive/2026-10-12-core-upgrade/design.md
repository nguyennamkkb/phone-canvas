# Design

## Context

Xem proposal.md (Why). Trạng thái hiện tại đã verify: `composeScreenDoc` là
định nghĩa duy nhất (`compose.ts`); bridge capture NUMERIC 12 + TEXTUAL 26
(`bridge.js:14-52`); hai chiều select đã thông (`InspectorContext.tsx:100-124`,
`bridge.js:276-328`); `locate` crop box+pad qua CDP (`locate.ts:228-248`);
golden screen-level (`golden.ts:186-200`); board không fetch goldens runtime
(`PhoneNode.tsx:66-70`). Xem specs/ cho requirements.

## Goals / Non-Goals

**Goals:**

- Board thấy đúng cái export ra (parity icon).
- Mọi lỗi câm/xanh giả thành lỗi显式 (compose-failure, missing-Chrome).
- Element-level tooling nối đồ có sẵn (locate, Copy JSON v1, golden store).

**Non-Goals:**

- Không đổi subset flexbox, shape Copy JSON v1, shell contract phone.
- Không đụng Duo/tablet shell-owned (ghi nhận ở proposal, ngoài change).
- Không realtime collab, theme editor đồ họa.

## Decisions

1. **Inline data-URI lúc compose, không sửa pipeline icons** — vì root cause là
   CORS trong iframe sandbox (`composeScreenDoc` là nơi duy nhất dựng document
   cho cả board lẫn export). Alternative (sửa `bridge.js` bỏ qua mask-fail)
   chỉ giấu symptom. Thay vào đó: `assets.ts`/`compose.ts` inline mask thành
   data-URI khi dựng srcdoc cho board; export giữ nguyên (đã đúng).
2. **"Xuất element" = gọi lại pipeline locate với box thay vì point** — vì
   `locate.ts` đã có compose + bridge thật + CDP crop + JSON ancestors; chỉ
   thiếu nút bấm truyền `selected.box`. Không tái dùng iframe đang mở (khác
   process CDP), chấp nhận vì cùng `composeScreenDoc`. Alternative (chụp DOM
   trong iframe bằng canvas) sai device scale + dính sandbox.
3. **Thumbnail = locate thu nhỏ, không thêm renderer** — cùng pipeline §2 với
   pad nhỏ + scale 1, cache theo `data-pc-id` + content hash. Không dùng
   html2canvas (sai số vs CDP).
4. **Golden element = mở rộng store hiện có, không store mới** — `golden.ts`
   thêm record `{elementKey, cropHash, specHash}` cạnh record screen; badge
   `badges.ts` thêm state element. Alternative (store riêng) gây 2 nguồn truth.
5. **Audit missing-Chrome → exit 1 + message** — vì `SKIPPED exit 0` làm gate
   xanh giả; CI không Chrome phải đỏ显式. Không tự tải Chrome (zero-dep là
   tài sản của repo).
6. **Base tokens + lint thay vì codemod một lần** — vì drift tái diễn; lint
   dark-twin bắt vĩnh viễn. Codemod paywall-kit đi kèm 1 lần trong tasks.
7. **Test tmp isolation thay vì giữ `fileParallelism:false`** — vì flag hiện
   tại đánh đổi tốc độ toàn suite; tmp dir mỗi suite (pattern
   `export/golden.test.ts` đã có) là fix đúng.

## Risks / Trade-offs

- [Inline data-URI phình srcdoc] → Mitigation: chỉ inline mask icon (KB), không
  inline art lớn; đo kích thước srcdoc trước/sau trong task.
- [CDP crop sai scale trên device lạ] → Mitigation: test ở 3 device
  (reference/SE/tablet) như risk đã ghi ở core-review §5.
- [Golden element nhạy font/AA cross-OS] → Mitigation: tái dùng Hamming ≤ 4
  như golden screen hiện tại.
- [Gộp board state mất dữ liệu localStorage cũ] → Mitigation: migration đọc +
  prune một lần, rollback = giữ file backup `.bak`.

## Migration Plan

1. Từng mục tasks.md đi sau gate xanh từng bước (lint → audit → test).
2. Board state: ship song song 1 release (đọc cả cũ lẫn mới, ghi mới), release
   sau bỏ đọc cũ.
3. Rollback: revert commit đơn lẻ mỗi task (không squash cả change).

## Open Questions

- Thumbnail cache invalid khi nào (mỗi selection đổi hay theo content hash)?
  → Trả lời ở task implementation, không đổi spec.
