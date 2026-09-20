# Kế hoạch: Dashboard + Projects + Ẩn panel phải

> Ngày lập: 2026-09-20. Trạng thái: đang thực hiện.

## Mục tiêu

1. **Dashboard**: màn hình chọn dự án (project picker).
2. **Project = 1 board**: mỗi dự án chứa 1 bảng các màn hình riêng (nodes/edges/positions độc lập).
3. **Side right ẩn/hiện tùy chọn**: nút toggle + shortcut, áp dụng mọi board.

## Checklist

### P0 — Plan & nền móng
- [x] Nghiên cứu kiến trúc hiện tại (App/Board/Inspector/manifest/export)
- [x] Viết file kế hoạch này (`docs/plan-dashboard-projects.md`)
- [x] Chốt data model `Project` (ref screen id, không copy html) — `src/projects/builtin.ts` (pure, Node-safe) + `projects.ts` (helpers)

### P1 — Ẩn/hiện panel phải
- [x] State `panelVisible` ở `App` + nút ở `Board` toolbar + shortcut `Cmd/Ctrl+.`
- [x] CSS `.app.is-panel-hidden` — canvas tự giãn, iframe vẫn capture bình thường
- [x] Giữ nguyên 4 invariants (đặc biệt 1px=1pt, raw down/interpreted up)

### P2 — Projects + Dashboard
- [x] `src/projects/projects.ts`: `PROJECTS` built-in (onboarding/mood-core/freud) + helpers
- [x] `src/projects/storage.ts`: persist `nodes/edges` per-project + custom projects (localStorage)
- [x] `src/projects/Dashboard.tsx`: grid cards (tên, n màn, cover), search, + Dự án mới, xóa custom
- [x] `App.tsx`: `view: dashboard|board`, `activeProjectId`, remount `ReactFlowProvider key={projectId}`, reset selection khi đổi project
- [x] `Board.tsx`: header back `← Dashboard`, tiêu đề project, `+ Màn hình` theo project (select screen), empty-state giữ nguyên
- [x] `nodeId`: prefix theo project để không trùng cross-board

### P3 — Export + polish
- [x] `scripts/export.ts`: thêm `--project <id>` (lọc screens theo project, tương thích `--screen/--device`)
- [x] Dashboard cover: dùng `exports/*.png` nếu có, fallback khối màu + initials
- [x] `npm run typecheck` + `npm run build` pass
- [ ] Cập nhật `README.md` (mục Dashboard/Projects) + skill nếu cần
- [x] Test Playwright MCP: dashboard 3 cards, mở board Freud/Mood-core, ẩn/hiện panel, tạo project, thêm màn, reload persist, xóa project — 0 console errors

## P4 — Thư mục per-project (2026-09-20)
- [x] Dời `src/screens/*.html` → `onboarding/` (8), `mood-core/` (7), `freud/` (3); CSS dùng chung ở nguyên
- [x] `manifest.ts`: `file` thành đường dẫn tương đối có thư mục; `index.ts`: `?raw` imports theo thư mục mới
- [x] `README.md` (Layout + Adding a screen), `Board.tsx` empty-state, skill `phone-canvas` (SKILL.md + tooling.md) cập nhật đường dẫn
- [x] `typecheck` + `build` + `export --list` xanh; Playwright re-test dashboard + board Mood Core 7/7 màn, 0 lỗi

## P5 — Thư mục `project/` ở root (2026-09-20)
- [x] Dời `src/screens/<proj>/*.html` → `project/<proj>/*.html` (onboarding 8, mood-core 7, freud 3); `src/screens/` chỉ còn registry + CSS dùng chung
- [x] `manifest.ts`: `file` tương đối từ repo root; `index.ts`: `?raw` imports `../../project/...`; `export.ts` đọc màn từ `ROOT + file`, stylesheet vẫn từ `src/screens/`
- [x] `README.md`, `Board.tsx` empty-state, skill `phone-canvas` cập nhật đường dẫn `project/<dự-án>/<tên>.html`
- [x] `typecheck` + `build` + `export --list` xanh; Playwright re-test dashboard + board Freud 3/3 màn, 0 lỗi

## P7 — Xóa màn hình khỏi board (2026-09-20)
- [x] 3 cách xóa: nút × hiện khi hover label node, phím Delete/Backspace khi node được chọn (né input/select/textarea), nút "Xóa khỏi board" trong panel node-picker
- [x] Xóa node kéo theo edges liên quan, clear selection, persist layout; custom project untrack screen khi hết instance (card count/cover đúng)
- [x] Fix kèm: nút "+" fallback toàn bộ screens khi project trống (trước đây no-op)
- [x] `typecheck` + `build` xanh; Playwright E2E trên project tạm: tạo → + thêm màn → xóa bằng ×/panel/Delete → reload persist → xóa project, 0 lỗi

## P6 — Board UI clean/hiện đại (2026-09-20, trắng tối giản)
- [x] Toolbar pill nổi: blur + saturate, divider giữa các nhóm, nút back tròn, title + count chip, segmented iOS-style, select + tool hover/active states, scroll ngang khi hẹp
- [x] Canvas `#f6f6f8`, minimap/controls bo tròn có viền, empty-state card nổi có shadow
- [x] Phone label mono size, plain frame shadow nhiều lớp, selected ring 2px + glow
- [x] Dashboard: input focus ring xanh, nút tạo nhấn scale, card radius 18 hover nâng -2px, count uppercase micro, nút Xóa chỉ hiện khi hover
- [x] Panel: header/ghost/tree/field/select refined, scrollbar mảnh hiện khi hover, focus-visible toàn app
- [x] `typecheck` + `build` xanh; Playwright screenshot dashboard + board Freud, 0 lỗi

## Data model

```ts
export type Project = {
  id: string;
  title: string;
  description?: string;
  screenIds: string[];  // ref SCREEN_FILES.id
  coverId?: string;
  custom?: boolean;     // true = do user tạo, lưu localStorage
}
```

- Screen registry (`manifest.ts` + `index.ts`) giữ nguyên single-source.
- Board state (`nodes: {id, screenId, deviceId, x, y}`, `edges`) lưu `localStorage["pc.board.<projectId>"]`.
- Custom projects lưu `localStorage["pc.projects.custom"]`.
- Không persist `specs/sizes` — bridge đo lại mỗi lần mở.

## Phân nhóm built-in (từ 18 màn hiện có)

- `onboarding`: `splash` + `onb-hello..onb-watch` (8)
- `mood-core`: `home, checkin, insights, history, journal, entry, profile` (7)
- `freud`: `freud-score, freud-home, mood-stats` (3)

## Rủi ro đã biết

1. `ReactFlowProvider` phải remount per-project (`key`), nếu không `fitView/didFit` dính board cũ.
2. `InspectorProvider.frames` phải clear + `selection=null` khi đổi project (token routing theo nodeId).
3. Không cache cứng height vào storage — bridge tự `post height`.
4. Exporter giữ `composeScreenDoc` chung, chỉ lọc danh sách id.

## Nghiệm thu

- [ ] Mở app thấy Dashboard, search + tạo/xóa project hoạt động
- [ ] Vào từng project thấy đúng màn, drag node, reload vẫn giữ vị trí
- [ ] Ẩn/hiện panel bằng nút + phím tắt, số đo không đổi
- [ ] `npm run export -- --project freud` ra đúng 3 màn
- [ ] `typecheck` + `build` xanh
