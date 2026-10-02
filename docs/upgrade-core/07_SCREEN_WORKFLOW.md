# 07 — Screen Workflow (section-level loop)

Track 008 · designer research-only (KHÔNG code). Luật sắt (§8 brief): **cấm one-shot full-screen** — agent thiết kế từng phần → kiểm tra → sửa → kiểm tra lại. Mỗi bước: input / tool / output / gate.

## 1. Loop chuẩn (12 bước)

| Bước | Input | Tool | Output | Gate (fail = dừng, sửa, quay lại) |
|---|---|---|---|---|
| 1 Define | product definition, IA, DNA (`dna.md`), platform mục tiêu | brief + `02` | section list + region map (band nào shell dựng) | region map duyệt: không slot lạ, đúng 1 `.body` |
| 2 Wire structure | section list | board new-screen | khung `.screen` + `.body` trống đúng device | `lint:regions region-body-*` |
| 3 Build sections | từng section, 1 section/lần | HTML + token core | 1 section render được | xem được trên board (không build mù) |
| 4 Apply components | catalog component project | `<!-- @component … -->` / slot ghi đè | section dùng component dùng chung | `region-tab-source` (1 nguồn tab duy nhất) |
| 5 Apply tokens | DNA + `tokens.css` | token classes, cấm literal | section ăn token | lint literal/token |
| 6 Platform adaptation | form factor thứ 2+ | device switch, không `if-device` trong file | screen riêng nếu layout khác căn bản | invariant #5 (fluid, không branch) |
| 7 Visual review | export PNG (`npm run export`) | mắt + HIG checklist (`02`) | note sửa cụ thể | 30-giây test + hierarchy/reachability |
| 8 Automated audit | screen trên board | `lint:regions` + `audit:regions` | log xanh | gate: hit-region/order/scroll/overflow/shell-band/background |
| 9 Accessibility review | screen sau audit | checklist A11y (`02` P6/P9/P10) | Dynamic Type + contrast + VoiceOver order pass | block nếu tương phản/Dynamic Type fail |
| 10 Fix | list lỗi 8+9 | sửa đúng section lỗi | diff gọn theo section | không sửa section xanh để "tiện" |
| 11 Re-render + Compare | screen đã fix | export lại + diff ảnh với bản trước | ảnh before/after + số đo | chỉ section lỗi đổi số; section khác bit-identical |
| 12 Approve | tất cả trên | golden snapshot | freeze (golden ref, xem `11`) | Lead/human accept |

## 2. Skill-loop design (research → approve) — map vào tool repo

```text
research (02/05/11 + HIG) → build (section) → audit (lint+audit:regions)
→ fix (đúng section) → re-render (export) → compare (diff ảnh+số)
→ approve (golden) → next section…
```

Mỗi vòng lặp ôm **1 section**, không bao giờ cả màn. Vòng fail ở audit → fix → re-render → compare, không quay về research trừ khi thiếu DNA/rule (lúc đó sửa `02`/`05` trước, đúng pipeline lesson ≠ expertise).

## 3. Ví dụ chạy (giả định: màn Stats mới)

Define: sections = segmented + summary card + chart card + log list; region map: title/right slots + `data-tab-active=diary` + `.body`. → Wire: khung 390×844. → Build từng card (mẫu sống: `project/calo-ai/screens/stats.html`). → Components: `app-tabs`. → Tokens: `paper-card`, `--s4`, `t-headline`. → Adaptation: iPad = screen riêng (list+detail), không branch. → Review/audit/a11y → fix → compare → approve → golden.

## Phụ lục — Board UI/UX optimization (audit từ `docs/phone-canvas-app-analysis.html`)

Mỗi đề xuất: vấn đề → giải pháp → trade-off. Không đụng pipeline/bridge/spec.

| # | Vấn đề (nguồn) | Giải pháp | Trade-off |
|---|---|---|---|
| B1 | Panel guidance yếu: SpecPanel là bảng số thô, không nói "đúng/sai" (panel §4) | Thêm dải gate-status đầu panel: `lint`/`audit` pass-fail theo section đang chọn, link tới rule `02` | Panel thành reviewer — tốn 1 hàng dọc; phải giữ số đo hiện tại intact |
| B2 | Measure flow 2 mode rời rạc: switch Di chuyển/Đo đạc đơn, không song song (`BoardContext.ts:4-11`) | Cho phép hover-đo ngay ở Move mode (giữ click-through chọn ở Measure), Esc vẫn thang thoát | Rủi ro pick nhầm khi kéo — giữ luật >5px = kéo (hiện có) |
| B3 | Multi-device switching thủ công: NodePicker đổi từng node (`NodePicker.tsx:28-70`) | "Mirror set": 1 màn × N device (phone+cover+inner+tablet+watch+widget) render song song, cùng selection | Tốn RAM iframe ×N; giới hạn mirror ≤ 4 + lazy |
| B4 | Toolbar tràn khi hẹp: nhóm phụ ẩn vào ⋯ theo width wrapper (`Board.tsx:108-129`) — khó đoán | Ưu tiên hiển thị theo loop §2 (audit/export/compare luôn thấy; +Màn hình vào ⋯ trước) | Cứng hóa thứ tự — project lạ có thể muốn khác |
| B5 | Không có compare view cho bước 11 | Split view before/after trong board (2 iframe cùng màn, khác revision) + diff số | Nhân đôi iframe; chỉ bật trong bước Compare |
| B6 | TokenDock draft là phủ preview, promote = copy-paste tay (`store.ts:161-176`) | Nút "ghi vào tokens.css" có review diff — nhưng là WRITE code → ngoài lease designer; ghi làm P1 tooling, quyết ở track khác | Scope creep — dừng ở đề xuất, không thiết kế sâu |
| B7 | Kính chrome dark lệch sáng (`tokens-ui.css:360-437` gradient trắng cố định, quan sát từ code) | Token hóa gradient kính theo theme | Việc nhỏ, cho vào P2 polish |
| B8 | Xóa board 2 bước + undo 6s tốt; nhưng xóa file thật phải chạy lệnh tay (`TrashDialog`) | Giữ nguyên (an toàn > tiện) — chỉ thêm hint lệnh ngay trong dialog (đã có) | Không đổi |
