# 03 — REGION SYSTEM, phần HIỆN TRẠNG (audit 2026-10-02, research-only)

> Track 007 AUDIT · brief `docs/Prompt Lead & Research Team — Upgrade phone-canvas Core.md`.
> Chỉ mô tả hôm nay; thiết kế chuẩn hóa thuộc track sau.

## 1. Ownership hôm nay: shell-owned vs author-owned

| Band | Ai dựng | Bằng gì (code) |
|---|---|---|
| Status bar + home indicator (OS) | Shell (`compose.ts`) | `statusBarHtml`/`homeIndicatorHtml` (`compose.ts:122-151`), CSS `.statusbar`/`.home-indicator` (`compose.ts:92-114`), số đo từ `devices.ts` (safeTop/safeBottom) |
| Nav band (`.region-nav`) | Shell dựng, author khai ruột | Author đặt `data-slot="back\|title\|right"` trong screen; shell lift (`liftNav`, `compose.ts:437-448`), sắp theo `NAV_SLOT_ORDER`, back/right trần tự bọc nút 44pt (`ensureNavButton`, `compose.ts:356-364`), title giữ nguyên |
| Tab band (`.region-tabs`) | Shell dựng, author khai list | Author đặt `data-tab` + `data-tab-active` trên `.screen`; shell lấy **cả list từ một nguồn** (screen thắng component), suy `is-active`/`aria-current`/`aria-label "tab N trên M"` (`decorateTabs`, `compose.ts:422-434`) |
| Content (`.body` / `.body-fixed`) | Author | Một scroller dọc duy nhất (`.body`) hoặc band vừa khung (`.body-fixed` — tràn là lỗi, không phải scrollbar ẩn) |
| Duo cover/inner/fold, tablet sidebar/split | Author (tạm) | README ghi rõ chỉ phone bands là shell-owned "today"; Duo/tablet arrangements author-owned "until that form factor ships" |
| Nền strip OS | Shell replay | `screenBgOf` đọc longhand `background-color/image` của `.screen` root rồi replay lên `.device` (`compose.ts:239-267`); shorthand cố ý không parse |

## 2. Dimensions hôm nay (số thật)

- Nav ≥ 44pt; tab bar 68pt, 3–5 destination icon + nhãn; rail Duo 44pt cố định,
  không tab ngang; Duo inner 1:2 phẳng; Duo fold 50/50, nếp gập vùng cấm;
  tablet sidebar ≥ 4 vùng; gutter 16pt, lưới 4/8; mọi interactive ≥ 44×44pt.
  (README Screen regions; token hóa ở `tokens.css`: `--touch-min:44px`,
  `--navbar-min-h:44px`, `--tabbar-h:68px`, `--rail-w:44px`, `--gutter:var(--s4)`.)
- Spec prose đầy đủ: `openspec/specs/screen-regions/spec.md` (20 requirements:
  shell-sở-hữu-OS, nền nối liền, từ điển vùng, khung dọc phone, tab 3–5,
  sàn chạm 44, rail Duo, inner arrangement, fold 50/50 + continuity pose,
  tablet sidebar→tabbar thu gọn, glass in-flow, 2 tầng cưỡng chế, một scroller,
  export khung/full, board cuộn + expand, mẫu tham chiếu, new-screen hợp lệ,
  một họ band duy nhất).

## 3. Rules hôm nay (static vs measured)

**Tầng tĩnh** — `npm run lint:regions` (`scripts/region-lint.ts:10-30`), text-only,
rules ở `scripts/region-rules.ts` (817 dòng, test + CLI chung để không lệch):

- `chrome-redrawn` (screen vẽ lại band OS của shell), `region-shell-owned`
  (screen dựng band nav/tab), `region-slot-unknown` (slot/tab lạ hoặc rỗng),
  `region-undeclared` (band dựng tay thay vì slot/region),
- `navbar-too-many-actions` / `navbar-title-long` / `navbar-back-missing`,
- `tabbar-too-many` / `tabbar-unlabelled` / `cover-horizontal-tabbar`,
- `touch-floor` (class governed khai dưới `--touch-min`; ngoại lệ phải nêu parent
  bảo chứng + đo backing — tiền lệ `.tabbar-float` 38pt trong bar 68pt),
- `device-literal` (px gắn một device), `region-off-without-reason`
  (miễn trừ `lint-region: off` không nêu lý do).
- **Không warn mode**: violation nào cũng fail gate (21 screens vẽ band tay đã
  migrate xong).

**Tầng đo** — `npm run audit:regions` (`scripts/region-audit.ts:14-30`): compose
screen ở đúng device header, chạy Chrome thật, assert trên layout render:
`chrome` (2 band OS đủ một lần, ngoài `.viewport`), `background continuity`,
`hit regions` (mọi rect ≥ 44×44), `region order` (tab cuối cùng), `split balance`,
`division band` (không interactive trên nếp), `scroll` (đúng một scroller),
`overflow`, `shell-band`. Reuse `scripts/export/*` verbatim.
Tiền lệ đo bắt lỗi mắt thường không thấy: split khai 1:2 vẽ 41:59, tab item 38pt
trong bar 68pt, nút 58pt bị ép 39pt (README).

## 4. Violation hôm nay (cơ chế)

- Mọi violation fail `npm run gate` (= lint + audit + test); message nêu
  `file:line` + cách sửa; discovery duy nhất từ `scan-projects.ts`.
- Ngoại lệ: `lint-region: off` phải kèm lý do, không thì chính nó là violation.
- Lỗ hổng đã biết: vắng Chrome → audit in `SKIPPED` và **exit 0** (tiền lệ
  `export.test.ts`); cơ chế strip vẫn được unit test `screenBgOf` bao.
