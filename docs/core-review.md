# Đánh giá core phone-canvas — điểm tốt, điểm chưa tốt, đề xuất nâng cấp

> Verified 2 nguồn: đọc trực tiếp + scout LongCat (`longcat-deep`,
> op-zen-hoang/longcat-2.5-preview-free) đào 6 mảng có ref `file:line`.
> Chưa chạy `npm run gate`/build — cần verify bằng gate trước khi chốt.

## 0. Trạng thái sau `core-upgrade` (2026-10-12)

Change `openspec/changes/core-upgrade` đã xử lý các mục dưới đây. Cột "verify"
là thứ đã thực sự chạy, không phải suy luận từ đọc code.

| # | Phát hiện (§) | Trạng thái | Verify |
|---|---|---|---|
| 1 | Board ≠ export, icon mask mất trên board (§3.1) | ✅ fix | icon inline data-URI lúc compose; board + export so bằng mắt; `compose.test.ts` chặn `url()` ngoài còn sót |
| 2 | `audit:regions` thiếu Chrome → `SKIPPED exit 0` (§3.3) | ✅ fix | `MISSING CHROME` + exit 1 + 3 cách sửa; `scripts/region-audit.test.ts` (CLI thật, `CHROME_PATH` sai) |
| 3 | Node không nói nguyên nhân compose-failure (§4.2) | ✅ fix | badge `thiếu component: <id> · <file>` từ `onExpandError`; `expand.test.ts` + `compose.test.ts` |
| 4 | Board state 3 cơ chế + sync XHR (§3.4) | ✅ fix | một store `pc.board.<id>` v5; seed đọc `board.json` bằng `fetch`; `grep XMLHttpRequest src/` = rỗng |
| 5 | Tokens copy-paste, dark-twin ngược (§3.5) | ✅ fix | lint `dark-copy`/`dark-orphan` thay rule cũ (rule cũ CHÍNH LÀ thứ ép copy-paste); codemod 63 dòng thừa ở 5 project; 162 PNG trước/sau byte-identical |
| 6 | Test chữa triệu chứng, `fileParallelism:false` (§3.6) | ✅ fix | mỗi suite một `mkdtemp`; bỏ flag; suite đầy đủ 390 test ≈4.5s (baseline tuần tự 8.3s) |
| 7 | Không có tooling cấp element (§5.1–§5.5) | ✅ fix | nút "Xuất element này" + thumbnail live + pad %/ancestors + xuất children + golden element (`lệch` → side-by-side) |
| 8 | Diff inline + so spec 2 màn (§4.3, §4.5) | ✅ fix | panel `So lệch hai màn` (207 dòng lệch seasonal-sale ↔ family-plan, gom theo loại) |
| 9 | Golden chưa vào CI (§6) | ✅ fix | `npm run golden:check` + `.github/workflows/gate.yml`, 4 pin (pw-card/pw-cta) |
| 10 | **Không nằm trong review này:** inspector chết trong browser thật | ✅ fix | `shouldAccept` đòi `origin === location.origin`, nhưng iframe `sandbox="allow-scripts"` báo origin `"null"` → mọi message của bridge bị chặn. Sửa: chấp nhận opaque origin, token per-node vẫn là thứ xác thực. Trước khi sửa, panel đứng ở "Đang đọc DOM…" vĩnh viễn — nghĩa là phần lớn tính năng trong bảng này chỉ được verify bằng đọc code, chưa từng chạy |
| 11 | Duo/tablet shell-owned (§3.2) | ⏸ ngoài scope | ghi nhận, chưa làm (đúng như proposal) |
| 12 | `gate --fast`, skill graph (§3.7–§3.8) | ⏸ chưa làm | không thuộc change này |

Đã chạy: `npm run lint` (0 lỗi, 12 cảnh báo có sẵn) · `npm run audit:regions`
(84 màn, 0 lỗi vùng, 14.5s) · `npx vitest run` (32 file, 390 test) ·
`npm run typecheck`.

## 1. Kiến trúc core (đã verify)

```
project/<id>/screens/*.html + tokens.css + components/
  → registry (folder-is-registry, derive.ts; trùng id thì throw)
  → composeScreenDoc() — src/extractor/compose.ts, ĐỊNH NGHĨA DUY NHẤT
  → <iframe srcdoc sandbox="allow-scripts"> ở natural width (1px = 1pt)
  → bridge.js capture viewportEl.querySelectorAll('*') → postMessage RAW
  → InspectorContext buildSpec() → src/spec/infer.ts diễn giải SwiftUI
  → SpecPanel (tree + spec + Copy JSON) / export PNG / locate PNG+JSON
```

- `devices.ts:1-6` chốt `1 CSS px === 1 pt`; `PhoneNode.tsx` iframe
  `width={device.width}`, zoom chỉ qua camera transform.
- `bridge.js:96-104` — capture bỏ qua overlay `#pc-highlight`, internals của
  `<svg>`, `display:none`/`visibility:hidden`, rect < 1px; gán `data-pc-id`
  `e0..en`; gửi `{pc:true, v:1, nodeId, token, type:'spec'|'height'|'ready'|
  'select', nodes, device}` (`bridge.js:152-154, 210-216, 276-282`).
- Capture gồm: NUMERIC 12 trường (`bridge.js:14-27`: gap, 4 padding,
  fontSize/Weight, lineHeight, letterSpacing, flexGrow/Shrink, 2 borderWidth,
  radius, opacity) + TEXTUAL 26 trường (`bridge.js:29-52`: display, position,
  flex-*, justify/align, text-*, color, background-*, border-*, boxShadow,
  maskImage, overflow-*, fontFamily) + tag/parent/depth/text(160ch)/box/attrs
  (src/alt/symbol/asset/iconSrc)/scroll (`bridge.js:120-150`).
- `infer.ts:158-190` `roleOf` (+ `shapeOf` `infer.ts:203-237`): svg/img→Image,
  button→Button, leaf+text→Text, leaf+mask/symbol→Image, leaf+surface→
  Circle/Capsule/Rectangle, leaf+flexGrow→Spacer; non-leaf: no-direction→
  Block, row→HStack, column→VStack; ZStack override khi con absolute/fixed
  (`infer.ts:243-246`); inline-text override (`infer.ts:247-249`).
- **Thiếu role:** không có List/Form/Toggle/Slider/TextField (rơi về
  HStack/VStack/Block); ScrollView chỉ suy ra qua flag `scrollable`, không
  phải role; Divider chỉ xuất hiện trong shape string, role vẫn Rectangle;
  Spacer chỉ từ flexGrow≥1 leaf.
- Copy JSON shape đóng băng v1 (`copyJson.ts`): `{version, screen,
  selectedElement? | elements?}`.

## 2. Core làm tốt (giữ)

1. **Một định nghĩa duy nhất cho screen document** — board, export, audit,
   locate cùng gọi `composeScreenDoc`. Export không thể drift khỏi board.
2. **Raw down, interpreted up** — bridge chỉ gửi raw; logic SwiftUI nằm ở
   `infer.ts` (type-checked, test được).
3. **Gate 2 tầng** — `lint:regions` static (`region-rules.ts` pure + test) +
   `audit:regions` đo bằng Chrome CDP.
4. **Registry = folder**, header `<!-- pc -->` là metadata duy nhất, không
   manifest/codegen.
5. **Board đã có empty/error states cơ bản** (tốt hơn nhận định cũ): SpecPanel
   có empty state + CTA "Focus màn đầu", spec timeout 8s (`SpecPanel.tsx:53-65`,
   "stuck, not loading"), dropped-counter显式 thay vì "Đang đọc DOM…" vô hạn,
   nút Copy JSON giải thích vì sao disabled (`copyReason`), PhoneNode fallback
   "Screen not found". Không phải "im lặng trắng" như đánh giá trước.

## 3. Chưa tốt (xếp theo độ đau, có ref)

> Sau `core-upgrade`: mục 1, 3, 4, 5, 6 đã fix, mục 2 ghi nhận ngoài scope, mục
> 7–8 chưa làm — xem bảng §0. Lưu ý: mục 4.2 (route origin) không có trong danh
> sách này nhưng là lỗi nặng nhất tìm được khi verify trên browser thật (§0 #10).

1. **Board ≠ export (nặng nhất).** Icon mask `url()` bị CORS trong iframe
   sandbox opaque-origin → biến mất trên board, export same-origin lại hiện
   (failure-mode #1). Mắt thấy ≠ máy đo, đúng chỗ quan trọng nhất. Fix đúng:
   inline data-URI ngay lúc `composeScreenDoc`, đừng đổ cho `npm run icons`.
2. **Hợp đồng 2 tốc độ.** Chỉ phone bands shell-owned; Duo/tablet author-owned.
   Spec `screen-regions/` viết cho mọi form factor nhưng gate chỉ phủ phone.
3. **`audit:regions` thiếu Chrome → `SKIPPED, exit 0`.** Gate xanh giả. Phải
   warn lớn hoặc fail-fast.
4. **Board state 3 cơ chế chồng nhau** — `board.json` freeze (seed) + Xuất/Nhập
   file + localStorage (prune reader-side); seed đọc bằng sync XHR (legacy).
   Gộp thành một.
5. **Tokens copy-paste** — `paywall-kit/tokens.css` `:root` và
   `[data-theme='dark']` gần như giống hệt. Cần base chung + dark override tối
   thiểu, lint dark-twin siết.
6. **Test chữa triệu chứng** — share thư mục export/golden → fix bằng
   `fileParallelism:false`. Đúng phải là tmp dir riêng mỗi suite.
7. **Ma sát contributor** — `gate` đòi Chrome + full lint + vitest cho cả sửa 1
   màn. Cần `gate --fast` (static only).
8. **Skill graph nặng** — 12 recipes + 4 references + adapter + thứ tự skill
   ngoài. Quyền cuối rõ (subset thắng) nhưng đường đọc dài.

## 4. UI core — hiện trạng verified + đề xuất

> Sau `core-upgrade`: đề xuất 2, 3, 5 đã làm (node compose-failure, diff inline
> → side-by-side, so spec 2 màn). Đề xuất 1 làm ở §5.1. Đề xuất 4 (responsive
> preview) và 6 (token→usages) chưa làm. Xem bảng §0.

**Đã có (verify, đừng làm lại):**

- 2 mode Di chuyển/Đo đạc; Đo không cần đổi mode — overlay trong suốt bắt click
  ở move mode, chuyển thành `pickAt` (`PhoneNode.tsx:121-130`).
- Khung đơn giản/máy chỉ cosmetic (`plain`, bezel/radius), không đổi số đo.
- Panel là view của spec; golden badge read-only, manifest-injected
  (`badges.ts:74-101`, `khớp/lệch/chưa có golden`, Hamming ≤ 4).
- TokenDock 2 tab Tokens/Components + **token draft đã live-preview**
  (`TokenDock.tsx` + `useTokenDraft`; `PhoneNode.tsx: extraCss` inject
  `draftCssText` vào iframe) — đừng đề xuất "TokenDock live" như tính năng mới;
  cái thiếu (nếu có) chỉ là click-token → highlight usages (`tokens/usage.ts`
  đã tồn tại `usageOf`, cần check dock có dùng chưa).
- Hai chiều click-to-spec **ĐÃ THÔNG, đừng làm lại**: panel→iframe qua
  `InspectorContext.tsx:117-124` post `selectFromPanel` cho mọi frame đã
  đăng ký, bridge hiện khung highlight xanh (`bridge.js:291-303`);
  iframe→panel qua bridge post `{type:'select'}`
  (`bridge.js:276-282, 320-328`) → `InspectorContext.tsx:100-102` set
  selection. Bảo mật message: `route.ts:23-49` (`shouldAccept`: cùng origin
  + frame đã đăng ký + token khớp + v:1), token random mỗi node
  (`PhoneNode.tsx:50`).
- Selection state KHÔNG dùng ReactFlow's own mà dùng `activeNodeId` riêng
  (`BoardContext.ts:22-24`) vì re-measurement của ReactFlow sẽ xóa selection
  và làm trắng panel — quyết định đúng, giữ.
- Board có empty state khi 0 màn (`Board.tsx:291-305`), hint bar theo mode
  (`Board.tsx:306-317`), undo bar (`Board.tsx:318-325`), phím tắt guarded
  (`Board.tsx:172-200`); node báo `device lạ` (`PhoneNode.tsx:196-201`).
- SpecDetail hiện đủ 10 nhóm/element (`SpecDetail.tsx:60-184`): header shape,
  cảnh báo Block, Image/Icon (kèm 3 warning mask/symbol/SVG), Box, Layout,
  Padding, Size, Typography, Surface, text preview.
- TokenDock: 2 tab Tokens/Components (`TokenDock.tsx:139-157`), 4 nhóm token
  (`TokenDock.tsx:39-43`), cảnh báo token dùng mà chưa định nghĩa
  (`TokenDock.tsx:181-196`); component expand đệ quy `MAX_DEPTH=20`
  (`expand.ts:25, 36-58`), chạy trong `composeScreenDoc` nên board = export.

**Đề xuất (đã trừ thứ đã có):**

1. Parity icon board = export (mục §3.1) — giá trị cao nhất.
2. Node-level compose-failure diagnostics (lỗi compose nào, dòng nào) — panel
   đã có timeout/dropped nhưng làita symptom, không phải nguyên nhân.
3. Diff visual inline: click badge `lệch` → side-by-side ngay trên node (hôm nay
   chỉ là nhãn).
4. Responsive preview: kéo node qua các width check fluid trên board thay vì
   export từng `--device`.
5. Panel so sánh spec 2 màn cạnh nhau (26 màn paywall cùng DNA, cần bắt drift).
6. Token→usages highlight nếu `usageOf` chưa được dock dùng.

Thứ tự: 1 → 2 → 3 → 5 → 4 → 6. Không làm: realtime collab, theme editor đồ họa
— board là công cụ đo, mọi cải tiến phải trả lời "số đo có tin hơn không?".

## 5. Đọc + xuất element-level — hiện trạng verified + đề xuất

> Sau `core-upgrade`: đề xuất 1–5 đã làm (nút xuất element, thumbnail live, pad
> %/ancestors, xuất children, golden element + side-by-side). Đề xuất 6 ("Copy
> SwiftUI") chưa làm. Xem bảng §0 #7.

**Đã có:**

- Đọc full cây: bridge capture toàn bộ `*` trong `.viewport` (statusbar/home
  ngoài viewport nên không lọt spec — đúng invariant #3).
- `locate` (`scripts/locate.ts`): defaults pad 24 / scale 2 / reference /
  light (`locate.ts:44`); `hitTest` deepest, tie → box nhỏ nhất
  (`locate.ts:96-104`); crop = element box + pad, clamp vào
  `device.width`×`contentHeight` (`locate.ts:228-243`); scale qua
  `deviceScaleFactor` của CDP chứ không scale clip (`locate.ts:245-248`);
  compose kèm bridge thật + ép `recapture` (`locate.ts:152-160, 176-190`).
- `export` defaults (`cli.ts:117`): all screens, reference, light, scale 2,
  `full:false`, `golden:false`; không `--device` thì mỗi màn render theo
  header `deviceId` của nó (`export.ts:88-96`); golden chỉ khi `--golden`
  (sha256 + dHash, Hamming ≤ 4 — `golden.ts:186-200`); board KHÔNG fetch
  goldens.json runtime nên badge luôn `missing` khi thiếu manifest-inject
  (`PhoneNode.tsx:66-70`).
- **Không tồn tại (LongCat grep xác nhận):** thumbnail/toPng/html2canvas
  trong `src/` (duy nhất locate CLI crop); pixel-diff element
  (pixelmatch/resemble chỉ có golden screen-level); crop trong board
  (`crop`/`clip` ở src chỉ là CSS preview + comment đo height); export file
  element đơn lẻ (Copy JSON chỉ chép clipboard, không ghi file handoff).

**Thiếu → đề xuất:**

1. **"Xuất element đang chọn" 1 click trên panel** — nối `locate` có sẵn: thay
   point tay bằng `selected.box` (tâm box). Rẻ nhất, giá trị ngay. Lưu ý: locate
   chạy ngoài board (compose + Chrome riêng), không tái dùng iframe đang mở —
   chấp nhận được vì cùng `composeScreenDoc`.
2. **Thumbnail live của selection trong panel** — crop nhỏ tự động (như locate
   nhưng không cần lệnh). Nhìn số + hình cùng lúc mới biết spec "đọc đúng" không.
3. **Crop theo bounding box thật + pad %** — hôm nay `pad` pt cố định; element
   dài (plan-card) hoặc cụm (countdown 3 ô) cần pad tương đối + option gồm
   ancestors 1 cấp.
4. **Export children hàng loạt** — chọn node cha → mỗi con 1 PNG + JSON (tên
   theo `data-asset`/class). Không thể làm tay với 26 màn × N card.
5. **Golden cấp element** cho component chốt (`pw-card`, `pw-cta`): hash crop +
   spec JSON, before/after khi sửa CSS riêng (vòng polish vừa rồi không có cái
   này để review).
6. **"Copy SwiftUI" cho element** — đoạn mã dựng sẵn từ `spec-to-swiftui.md`
   thay vì dịch tay từ Copy JSON.

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6. 1–2 nối đồ có sẵn; 4–6 đụng golden/store. Risk
chung: crop trong sandbox cần đúng device scale — test ở 2–3 device.

## 6. Chức năng nên / chưa nên / không nên

- **Nên, nhỏ:** golden vào CI; locate thành deep-link; catalog component preview
  (`bare` mode đã có, thiếu trang tổng hợp); mục §5.1–§5.2.
- **Chưa nên:** shell-owned Duo/tablet (đóng phone trước); realtime; device mới
  khi audit chưa phủ hết device cũ.
- **Không nên:** abstraction/CSS framework mới — subset flexbox là tài sản.

## 7. Thứ tự tổng (gộp §3–§5)

> Sau `core-upgrade`: bước 1–9 đã xong (bước 5 gộp board state, bước 6 tokens +
> dark-twin lint, bước 7 diff + so 2 màn, bước 8 xuất children + golden element,
> bước 9 test tmp isolation). Bước 10 (Duo/tablet shell-owned) vẫn để nguyên.

1. Parity icon (board = export).
2. Audit fail rõ khi thiếu Chrome.
3. Nút "Xuất element đang chọn" + thumbnail selection (§5.1–§5.2).
4. Node compose-failure diagnostics (§4.2).
5. Gộp board state, bỏ sync XHR.
6. Base tokens + dark-twin lint.
7. Diff inline + so sánh 2 màn (§4.3, §4.5).
8. Export children + golden element (§5.4–§5.5).
9. Test tmp isolation.
10. Xong 1–9 mới đụng Duo/tablet shell-owned.
