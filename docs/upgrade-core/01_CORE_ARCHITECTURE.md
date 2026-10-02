# 01 — CORE ARCHITECTURE (hiện trạng audit 2026-10-02, research-only)

> Track 007 AUDIT · brief `docs/Prompt Lead & Research Team — Upgrade phone-canvas Core.md`.
> Mọi nhận định kèm path thật. Không code/refactor trong track này.

## 1. Kiến trúc module & dependency (hiện trạng)

```
AI --html--> project/*/screens/*.html ─┐
                                        ├─ deriveRegistry() ── Registry
project.json/tokens.css/components/ ────┘   (src/projects/derive.ts:143-332, pure)
        │                    │
        │ browser            │ node
        ▼                    ▼
registry.ts              scan-projects.ts
(import.meta.glob)       (fs walk)
        │                    │
        ▼                    ▼
Board/PhoneNode      export/locate/lint/audit
(buildSrcDoc → composeScreenDoc → srcdoc iframe → bridge.js RAW
  → postMessage → InspectorContext → buildSpec(infer.ts) → SpecPanel)
```

- **Một luật — hai đầu đọc.** `deriveRegistry()` là pure function duy nhất sở hữu
  convention folder-is-registry (`src/projects/derive.ts:1-22`); browser
  (`src/projects/registry.ts:15-61`, `import.meta.glob` eager + Vite HMR theo đĩa)
  và Node (`scripts/scan-projects.ts:1-30`, `fs walk`) cùng đổ vào nó.
  Registry lỗi → browser **throw** (`registry.ts:63-69`).
- **Một tài liệu hợp nhất.** `composeScreenDoc()` (`src/extractor/compose.ts:450-551`)
  là định nghĩa duy nhất của document; `buildSrcDoc.ts` (browser adapter,
  `src/extractor/buildSrcDoc.ts:37-49`) và `export.ts`/`locate.ts`/`region-audit.ts`
  cùng gọi nó → board = export = locate = audit, không thể lệch.
- **Thứ tự stylesheet là contract**: shared tokens → icons → icon-set →
  project tokens → draft (`src/extractor/assets.ts:18-24`).
- App shell (`src/App.tsx`, `src/board/BoardView.tsx`, `src/canvas/Board.tsx`,
  `src/inspect/*`, `src/tokens/*`, `src/components/*`) và pipeline đo
  (extractor/spec/inspect) tách rõ: App không chứa luật đo nào.

## 2. Data flow & schema

`project → screen → iframe → bridge → spec → inspector`:

1. Screen HTML + `@component` placeholders → `expandComponents` (string thuần,
   lỗi missing/cycle/depth giữ nguyên comment) → compose nâng slot
   (`data-slot`/`data-tab`) thành band shell → srcdoc.
2. `bridge.js` (`src/extractor/bridge.js:189,296,395,417`): gửi `spec{nodes,device}`,
   `select{id}`, `height{value,content}`, `ready`; nhận `pickAt/selectFromPanel/recapture`.
3. Parent định tuyến bằng **token/instance**, không phải `WindowProxy`
   (`src/inspect/InspectorContext.tsx:64-93`); `select` mirror 2 chiều; recapture +
   reload fallback 1.5s.
4. `buildSpec()` (`src/spec/infer.ts:270-409`) → `SpecNode`.
5. Schema (`src/spec/types.ts`): `RawNode{id,tag,parent,depth,text(+Length/ownText),
   childCount,box{x,y,w,h},scroll{x,y},attrs{src,alt,symbol,asset,iconSrc},css{}}`
   → `SpecNode{role(11),swiftUiShape,label,box,layout{direction,gap,justify,align,
   selfAlign,wrap,layer},padding,size{grow,fillW/H},typography{…lineSpacing},image
   {kind/source/symbol/asset/tint/externalMask/unmappedSymbol},surface{…backgroundKind},
   scrollable}`. Copy-JSON payload v1 đóng băng
   (`src/inspect/copy-json/copyJson.ts:10-24`).

## 3. Region system (tóm tắt — chi tiết ở `03_REGION_SYSTEM.md`)

Shell sở hữu OS + nav/tab bands; author chỉ khai slot content + `.body/.body-fixed`.
Cưỡng chế 2 tầng cùng fail gate: **lint tĩnh** 9 nhóm rule
(`scripts/region-lint.ts:10-30`: chrome-redrawn, region-shell-owned,
region-slot-unknown, region-undeclared, navbar-*, tabbar-*, touch-floor,
device-literal, region-off-without-reason; KHÔNG có warn mode) +
**audit đo** 9 check (`scripts/region-audit.ts:14-30`: chrome, background
continuity, hit regions, region order, split 50/50, division band, scroll,
overflow, shell-band; vắng Chrome → SKIPPED exit 0). Rule tập trung
`scripts/region-rules.ts` (817 dòng) để test và CLI không lệch.
Spec prose: `openspec/specs/screen-regions/spec.md` (20 requirements).

## 4. Device system

`src/frame/devices.ts:31-164`: 12 presets (reference 390×844 safeTop 59/safeBottom 34
dynamic … widget 360×169); `getDevice` fallback im lặng, `isKnownDevice`/
`formFactorOf`/`formChip` cho identity显式. Node override device qua NodePicker;
manifest `deviceId` thắng default.

## 5. Token system

Vocab `src/screens/tokens.css` (2209 dòng): spacing `--s*` (4pt grid), radius
`--r-*`, region metrics (`--touch-min:44px`, `--tabbar-h:68px`, `--gutter:16pt`…),
màu iOS system + dark, type `--t-*` (large 34 … caption 12) + class `.t-*`.
`tokens.ts`: parse `?raw`, tách light/dark, `groupOf`, project-first merge,
khớp màu theo rgba **kể cả alpha** (`toRgba`/`tokenNameForColor`).
`usageOf` đếm `var(--x)` trực tiếp (bỏ qua --icon/--device-/--safe-/--status-).
`swiftUITokens()` sinh extension Color/CGFloat, loại type tokens.
Dock: draft preview `draftCss()` + promote Copy-CSS paste tay (không backend).

## 6. Component system

`@component id` + `componentMap(projectId)`; **components never cross projects**
(lint error). Slot-lifting: screen-lift trước, component chỉ lấp chỗ trống;
tabs: screen khai là thắng cả list (`compose.ts:473-509`). Ownership hiện tại:
100% project-scoped — **chưa có khái niệm core component**. Catalog preview
`bare:true` cùng pipeline.

## 7. Audit / lint / gate

`lint` = typecheck + 4 lint (tokens: undefined-var error/hardcode-hex warn/
global-color warn; subset: grid/float/transform/clip-path/filter error,
nameless-svg error, root-bg error; components: missing/cycle error, unused warn;
regions: 9 nhóm error). `gate` = lint + audit:regions + test. CLI zero-dep,
`// @ts-nocheck`, "checked by running it". Discovery duy nhất từ
`scan-projects.ts` → lint không bao giờ thấy cây khác board.

## 8. Export / locate

Chung compose + bridge thật + infer thật ("Nothing here owns a rule" —
`locate.ts:15-25`). Export: Chrome CDP sẵn máy (`$CHROME_PATH`), chassis React
bị loại, mặc định khung device, `--full` toàn trang. Locate: điểm pt gốc
top-left (gồm status bar), xuất PNG vùng + JSON Copy-shape, `miss` vẫn chụp ô vuông.

## 9. Board state & persistence

localStorage, không backend (`storage.ts:7-26`): `pc.board.<id>` {nodes,edges,
removed,trash}, `pc.projects.custom`, `pc.ui.panelVisible`, `pc.tokens.draft./
theme.`, `pc.ui.dock.`, `pc.ui.theme`, `pc.statefile.*`. Board file v4
export/import + reload. Reconcile khi mở (tôn trọng removed), zombie prune,
xếp cột theo mép phải + gap 120, flow cấm tự vòng/trùng cặp + nhãn edge.
Xóa 2 bước + undo 6s (file HTML giữ nguyên).

## 10. Coupling / debt + bảng KEEP–REFACTOR–REPLACE–ADD

| Quyết định | Mục (vấn đề → nguyên nhân → tác động) |
|---|---|
| KEEP | deriveRegistry pure + dual-reader; composeScreenDoc single-def; raw-down/interpreted-up (infer duy nhất); stylesheet order contract; token routing thay WindowProxy; activeNodeId riêng khỏi react-flow selection |
| KEEP | lint 2 tầng static+measured cùng fail gate, rule tập trung region-rules.ts |
| REFACTOR | `getDevice` fallback im lặng (nguyên nhân: hot-path tiện; tác động: sai device chìm) → đã có `isKnownDevice` warn ở BoardView, cần áp mọi consumer |
| REFACTOR | audit vắng Chrome → SKIPPED exit 0 (nguyên nhân: tiền lệ export test; tác động: gate xanh giả trên máy không Chrome) |
| REFACTOR | 2 hàm đặt id node (`BoardView:42` project-scope vs `nodeId.ts` global) — usage `nodeId.ts` chưa xác minh |
| REFACTOR | `screenBgOf` chỉ longhand (nguyên nhân: cố ý; tác động: shorthand im lặng mất nền strip) — đã có lint chặn, giữ nhưng cần doc显式 |
| REPLACE | Không có — chưa đủ bằng chứng thay iframe/bridge/infer (brief §1: giữ nếu không có lý do kỹ thuật mạnh) |
| ADD | Khái niệm core component (hiện 100% project-scoped, trùng lặp cross-project không ai phát hiện — components-lint chỉ unused trong project) |
| ADD | IR/canonical model giữa SpecNode và SwiftUI (hiện `swiftUiShape` là string, không parse được ngược) |
| ADD | Machine-checkable rules cho platform ngoài phone (Duo/tablet/watch/widget mới ở mức preset + doc) |
| ADD | Golden/snapshot regression cho export (hiện chỉ gate lint+audit+unit, không ảnh chuẩn) |

## 11. Đề xuất khung 10 khối (sơ bộ, chờ track thiết kế)

`Core Engine` (compose+bridge+infer hiện tại, giữ) · `Device System` (mở rộng
preset + capability) · `Region System` (xem 03) · `Component System` (thêm tầng
core + ownership 3 cấp) · `Design Token System` (tokens-as-data đã có, thêm
promotion pipeline thay paste-tay) · `Design Rules` (region-rules.ts hôm nay →
rule registry có severity block/warn/review) · `Spec/IR` (SpecNode → IR chuẩn,
`swiftUiShape` string → cấu trúc) · `Validation/Audit` (lint+audit hôm nay +
golden + a11y/responsive/platform) · `Project Runtime` (registry+board state v4
→ versioned state + migration) · `AI Agent Interface` (Copy-JSON v1 → versioned
handoff + MCP).

## 12. Data model / IR sơ bộ

Giữ `RawNode` (wire iframe→parent, đã ổn). Tách `SpecNode` thành 2 lớp: (a) lớp
đo — số liệu thuần (box/layout/padding/typo/surface, không chuỗi SwiftUI);
(b) lớp diễn giải — emitter theo target (SwiftUI hôm nay, target khác mai sau).
`swiftUiShape: string` hiện tại gộp 2 lớp → bước IR đầu tiên là thay bằng struct
`{container:{kind,spacing,alignment}, text:{…}, image:{…}}` rồi mới render string.

## 13. Diagram ASCII (target)

```
Screens/Components ──derive──▶ Registry ──compose──▶ srcdoc iframe ──bridge──▶ RawNode
   (project DNA)      (pure)              (shell bands)   (RAW)        (wire, giữ)
                                                                            │
Tokens ──tokens.ts──▶ Token table ──draft/preview──┐                         ▼
Components(core+project) ──expand──┘          Measurement ──▶ IR ──▶ Emitters (SwiftUI/…)
                                                   │           │         │
Rules registry ──lint(static)──┘                   │      Validation(audit/golden/a11y)
Chrome CDP ──audit(measured)/export/locate ────────┘
Board state v4 ──reconcile/persist──▶ Board
```

## 14. Folder structure đề xuất (sơ bộ)

```
src/core/{compose,bridge-protocol,spec-measure}   # từ extractor+spec hôm nay
src/core/ir/{model,emitters/swiftui}              # MỚI: tách infer.ts
src/systems/{devices,regions,tokens,components}   # gom devices + region-rules +
                                                  # tokens + component registry
src/rules/{registry,severities}                   # MỚI: rule có block/warn/review
src/validation/{lint,audit,golden,a11y}           # gom scripts/* + MỚI
src/project-runtime/{registry,board-state}        # derive + storage, versioned
src/agent/{handoff-vN,mcp}                        # copyJson v1 →
scripts/  (mỏng dần: chỉ CLI wiring, luật dời vào src/systems + src/rules)
```

## A. Current State (góp Lead tổng hợp)

- **Tốt:** single-source-of-truth triệt để (một derive, một compose, một infer,
  một stylesheet order, một discovery cho lint); cưỡng chế 2 tầng static+measured
  cùng fail gate, không warn mode ở regions; sandbox/token/activeNodeId là 3 bài
  học chạy-thật (không đọc chay); zero-dep CLI lái Chrome sẵn máy.
- **Thiếu:** tầng core component; IR chuẩn (shape còn string); rule có severity;
  golden regression; platform rules ngoài phone ở dạng machine-checkable;
  promotion pipeline cho token draft; versioned board state + migration.
- **Rủi ro:** audit SKIPPED-xanh-giả khi thiếu Chrome; `getDevice` fallback im;
  dual id-scheme chưa dọn; glass trắng cố định lệch dark chrome; docs `docs/*.md`
  (screen-regions/devices) bị xóa khỏi working tree trong khi README + lint header
  vẫn trích dẫn (đã ghi 004/006).

## C. Gap Analysis (current → target, gạch đầu dòng)

- Đo lường: SpecNode string-shape → IR 2 lớp + emitter theo target.
- Component: 100% project-scoped → ownership 3 cấp (core / design-system / project)
  + phát hiện trùng cross-project.
- Rule: error-only + skip-im-lặng → registry có block/warn/review + skip显式 báo.
- Kiểm chứng: lint+audit+unit → thêm golden ảnh chuẩn + a11y/responsive/platform audit.
- Token: draft paste-tay → promote pipeline có review.
- State: board file v4 không migration → versioned state + migrate script.
- Platform: preset + prose → machine-checkable ruleset cho iPad/Duo/Watch/Widget.
- Handoff: Copy-JSON v1 đơn lẻ → versioned agent interface (+MCP khi cần).
- Tri thức: README + header comment → 12 deliverables `01–12` + decision records.
