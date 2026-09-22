# Proposal

## Why

Một màn hình hiện là HTML viết tay: các khối như tab bar, stat tile, list row bị **copy lại** ở từng màn. Thứ duy nhất được tái sử dụng hôm nay là *class CSS* (`.card`, `.btn`, `.tabbar` trong `docs/screen-authoring.md`) — nó chỉ chia sẻ style, không chia sẻ markup, nên sửa một chỗ không lan ra, và không có nơi nào nói "đây là component Tab của dự án". Dự án cần một **component system**: định nghĩa một lần, màn compose từ đó, và component trở thành một artifact thiết kế hạng nhất để xem/đo như tokens.

## What Changes

- **Định nghĩa component theo dự án**: `project/<id>/components/<component-id>.html` (một mảnh HTML tĩnh) + manifest id ổn định (`src/components/manifest.ts`), sinh registry qua `npm run components:sync` (giống cơ chế `screens:sync`).
- **Cú pháp dùng trong màn**: `<!-- @component <id> -->` trong screen HTML; khi compose, placeholder được thay bằng HTML của component. **Tĩnh** — chưa có props/slot/đổi text.
- **Expand ở compose-time, một chỗ duy nhất**: `composeScreenDoc` (module app và export dùng chung) nhận map `components` và expand placeholder, chống đệ quy vòng. Vì cả board lẫn `npm run export` đều gọi cùng hàm, component không thể lệch giữa hai bên.
- **Adapter cấp dữ liệu**: `buildSrcDoc` đưa component của project (Vite `?raw`); `scripts/export.ts` đọc cùng file đó từ đĩa.
- **Bảng catalog component**: một dock/panel theo dự án liệt kê component với preview render thật (đo được), số lần dùng trong các màn, và spec SwiftUI — đọc qua chính pipeline inspector hiện có.
- **Lint**: gate mới (trong `npm run lint`) bắt `@component` trỏ tới id không tồn tại và phát hiện vòng lặp component.
- **Không migration**: màn không có placeholder chạy y như cũ; component là file mới, app chỉ đọc.

## Capabilities

### New Capabilities

- `components`: hệ component theo dự án — định nghĩa component bằng file + id ổn định, expand `@component` vào màn khi compose, và catalog để xem/đo/spec component.

### Modified Capabilities

- Không có (chưa có main spec nào; đây là capability mới).

## Impact

- `src/extractor/compose.ts` — nhận `components` map + expand `@component` (thuần, không phụ thuộc).
- `src/extractor/buildSrcDoc.ts`, `scripts/export.ts` — nạp component của project và truyền vào compose.
- `src/components/manifest.ts`, `src/components/generated.ts`, `src/components/index.ts` (mới) — registry component, theo khuôn `src/screens/`.
- `scripts/gen-registry.ts` (mở rộng) hoặc `scripts/gen-components.ts` (mới) + script `components:sync`.
- `scripts/components-lint.ts` (mới) + `package.json` (`lint:components`, `lint`).
- `src/components/ComponentDock.tsx` + `src/styles/` (mới) — bảng catalog; dùng lại `useInspector`/`buildSpec` để đo.
- `src/canvas/Board.tsx` / `BoardView.tsx` — gắn catalog vào bố cục board theo project.
- `docs/screen-authoring.md` — hợp đồng `@component` + checklist.
- `project/moodtracker/components/*.html` — vài component thật (tab, stat-tile…) để minh hoạ.

## Ghi nhận quyết định thay user (đã hỏi)

- Cú pháp tham chiếu: **placeholder comment** `<!-- @component id -->` (không dùng custom element).
- Phạm vi: **compose + bảng catalog** (có render thật, đo, spec).
- Component **tĩnh** trước (không props/slot).

## Non-Goals (ghi nhận, không làm ở change này)

- Component có tham số/slot/đổi nội dung.
- Sinh SwiftUI subview tái sử dụng từ component (chỉ đo instance như mọi element).
- Sửa file component từ UI (app không ghi HTML, như screen và token).
- Hành vi tương tác/bấm thử trong component.
