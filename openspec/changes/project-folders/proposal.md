# Proposal

## Why

Một dự án hiện không tự chứa: thêm/xoá một screen hay một dự án phải sửa tới 6 file trung tâm (`src/screens/manifest.ts`, `src/screens/generated.ts`, `src/projects/builtin.ts`, `src/components/manifest.ts`, `src/tokens/tokens.ts`, `src/extractor/assets.ts`) rồi chạy codegen. Thư mục `project/<id>/` đã tồn tại nhưng không phải nguồn sự thật — registry trung tâm mới là. Repo vừa được dọn sạch (0 screen), nên đây là thời điểm đổi kiến trúc với chi phí migration bằng 0.

## What Changes

- **Convention thư mục tự chứa**: `project/<id>/` gồm `project.json` (tuỳ chọn), `tokens.css` (tuỳ chọn), `screens/*.html`, `components/*.html`, `assets/**`; thả file vào là board biết ngay.
- **Id = tên file**: screen id là tên file trong `screens/` (unique toàn cục), component id là tên file trong `components/` (scoped theo dự án). Metadata của screen (title, `lightStatusBar`, `deviceId`) khai báo tuỳ chọn ngay đầu file bằng `<!-- pc {json} -->`.
- **Tự động khám phá**: một hàm derive thuần (không `fs`, không Vite) dựng registry từ `path → nội dung`; app dùng `import.meta.glob` (HMR add/remove đã kiểm chứng trên Vite 8.3), script Node dùng scanner fs gọi **cùng** hàm derive. Không cần restart, không cần codegen.
- **Token / component / asset theo thư mục**: `tokens.css` của dự án được compose tự động sau token global; component expand như hiện tại nhưng không cần manifest; asset nằm ở `project/<id>/assets/**` và tham chiếu bằng URL `/project/<id>/assets/<file>` (dev phục vụ trực tiếp, export thêm route, build copy vào `dist`).
- **BREAKING — xoá registry trung tâm**: `src/screens/manifest.ts`, `src/screens/generated.ts`, `src/components/manifest.ts`, `src/components/generated.ts`, `src/projects/builtin.ts`, `scripts/gen-registry.ts` bị xoá; `tokens.ts`/`assets.ts` không còn import tĩnh `project/*/tokens.css`; `TokenNode` không còn map accent thủ công.
- **CLI theo thư mục**: `npm run screen -- add|rename|remove` và `npm run project -- add|remove|list` chỉ ghi trong `project/<id>/`, không rewrite manifest; rename cập nhật `board.json` trên đĩa nếu có.
- **Lint/export/test dùng chung scanner**: bắt id trùng, header hỏng, `project.json` hỏng, `@component` lạ, asset trỏ ra ngoài dự án — báo kèm file, fail lúc khởi động/lint.

## Capabilities

### New Capabilities

- `project-folders`: convention thư mục tự chứa, khám phá + validate registry (screen/component/token/metadata), CLI vòng đời theo thư mục, và việc bỏ registry/codegen trung tâm.
- `project-assets`: asset của dự án nằm trong `project/<id>/assets/`, tham chiếu bằng URL ổn định, render đúng trên board, export và bản build.

### Modified Capabilities

- Không có (chưa có main spec nào được sync; hai capability trên là mới).

## Impact

- Xoá: `src/screens/manifest.ts`, `src/screens/generated.ts`, `src/components/manifest.ts`, `src/components/generated.ts`, `src/projects/builtin.ts`, `scripts/gen-registry.ts`.
- Sửa: `src/screens/index.ts`, `src/components/index.ts`, `src/projects/{projects,storage}.ts`, `src/tokens/tokens.ts`, `src/extractor/assets.ts`, `src/canvas/TokenNode.tsx`, `src/board/*`, `scripts/export.ts`, `scripts/export/site.ts`, ba lint (`tokens/subset/components`), `scripts/{new,rename,delete}-screen.ts` + `screen.ts`, `vite.config.ts` (copy asset khi build).
- Thêm mới: `src/projects/derive.ts` (thuần) + test, `src/projects/registry.ts` (glob), `scripts/scan-projects.ts` (fs), `scripts/project.ts` (CLI dự án).
- Docs: `README.md`, `docs/screen-authoring.md` (bỏ bước wiring manifest), `docs/devices.md` (giữ nguyên hành vi device).
- Không đổi: invariant px↔pt, compose dùng chung app/export, board localStorage, custom project (localStorage).

## Non-Goals (ghi nhận, không làm ở change này)

- Ghi `board.json` từ browser (cần dev-server endpoint) — board vẫn localStorage như hiện tại.
- Screen id scoped theo dự án (cần migrate schema board) — P1 giữ unique toàn cục.
- Custom project (tạo từ Dashboard) có thư mục — vẫn là board localStorage không token/component riêng.
- Icon riêng theo dự án (glyph + mapping SF Symbol) — làm ở change sau; `public/icons` toàn cục giữ nguyên.
