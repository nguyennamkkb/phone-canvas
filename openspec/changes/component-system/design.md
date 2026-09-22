# Design

## Context

Xem `proposal.md` (Why) và `specs/components/spec.md` (yêu cầu). Trạng thái hiện tại quan sát từ code:

- `composeScreenDoc` (`src/extractor/compose.ts`) là **một định nghĩa duy nhất** của document màn: nhận `html` + `stylesheets` + `bridgeJs`, dựng `.device/.viewport`. Cả `buildSrcDoc` (app, Vite `?raw`) và `scripts/export.ts` (Node, đọc file) đều gọi nó → export không thể lệch board.
- Screens: `project/<id>/*.html`, id ổn định ở `src/screens/manifest.ts`, sinh `src/screens/generated.ts` (`?raw`) bằng `scripts/gen-registry.ts`; `src/screens/index.ts` dựng `SCREEN_BY_ID` + chặn id trùng lúc khởi động.
- Tokens: parse CSS thành data (`src/tokens/tokens.ts`) + đếm usage (`src/tokens/usage.ts`) + dock UI (`src/canvas/TokenDock.tsx`). Đây là khuôn mẫu cho một catalog theo dự án.
- Hôm nay chỉ có "component vocabulary" bằng class CSS trong `docs/screen-authoring.md`; không có định nghĩa markup tái sử dụng.
- App **không ghi HTML**; file là nguồn sự thật. Iframe sandboxed srcdoc; icon inline data-URI; 1 CSS px = 1 pt.

## Goals / Non-Goals

**Goals:**

- Component là file HTML có id ổn định theo dự án; màn tham chiếu bằng `<!-- @component id -->`.
- Expand ở **một chỗ** (compose) để app và export luôn khớp.
- Catalog theo dự án: render thật, đo được, spec SwiftUI, usage.
- Lint bắt id sai, vòng lặp, và lỗi subset trong component.

**Non-Goals:**

- Props/slot/tham số hoá, hành vi tương tác trong component.
- Sinh SwiftUI subview tái sử dụng (chỉ đo instance như mọi element).
- Ghi/sửa file component từ UI.
- Component xuyên dự án (component thuộc đúng một dự án).

## Decisions

1. **Component = file + manifest id, theo đúng khuôn screens.**
   `project/<id>/components/<component-id>.html`; `src/components/manifest.ts` giữ `{ id, title, project, file }`; `scripts/gen-registry.ts` sinh thêm `src/components/generated.ts` (`?raw`); `src/components/index.ts` dựng `COMPONENTS_BY_ID` + chặn id trùng. Vì sao: identity ổn định, không suy từ tên file/thứ tự, và Node (export/lint) đọc manifest trực tiếp được.

2. **Cú pháp: `<!-- @component id -->` (placeholder comment).**
   Vì sao: HTML hợp lệ, vô hình trước khi expand (không phá layout nếu quên expand), không cần parse DOM hay định nghĩa custom element. Thay thế đã loại: `<x-id>` — custom element mặc định là inline và có thể vẽ ra hộp lạ nếu chưa expand; và phải parse DOM thay vì thay chuỗi.

3. **Expand trong `composeScreenDoc`, qua module thuần `src/components/expand.ts`.**
   `composeScreenDoc` nhận thêm `components?: Record<string,string>` và gọi `expandComponents(html, components)`. Vì sao: đây là hàm duy nhất cả app lẫn export gọi, nên component không thể lệch hai bên. `expand.ts` thuần (không import Vite/Node) để test bằng dữ liệu, và để lint/app dùng lại cho validation. Thay thế đã loại: expand trong `buildSrcDoc` (export sẽ drift), hoặc sinh sẵn screen đã expand ở build (mất tính chỉnh sửa trực tiếp).

4. **Đệ quy có chống vòng; lỗi không làm treo, không im lặng.**
   `expandComponents` mang một `stack` id; gặp vòng → trả lỗi `cycle`. Id không tồn tại → lỗi `missing`. Cả hai giữ nguyên placeholder dưới dạng comment (không tạo layout) và trả `errors[]`. Board hiện badge cảnh báo trên node (tính parent-side từ HTML gốc), lint là gate cứng. Vì sao: compose vẫn thuần và đo sạch, mà lỗi vẫn lộ ra ở hai chỗ.

5. **Component là fragment, không phải màn.**
   Component không chứa `.screen`/`.body`; nó là một mảnh để chèn vào `.viewport` của màn. Vì sao: nếu component tự là `.screen` thì lồng sẽ phá cấu trúc safe-area 3 tầng. Lint cảnh báo nếu component chứa `.screen`.

6. **Catalog là một dock/panel theo dự án, render preview bằng chính pipeline.**
   `src/components/ComponentDock.tsx`: liệt kê component của project, mỗi cái render trong một iframe host (document = `.viewport` chứa component, dùng `composeScreenDoc` với `components` map) ở **device width thật**, rồi scale bằng CSS transform để làm thumbnail — transform là "camera", không phá invariant 1px=1pt. Preview lazy (chỉ render khi mở rộng) để không nổ iframe. Thay thế đã loại: catalog là một screen sinh tự động (không phải "bảng", trộn concern).

7. **Đo component bằng cách tái dùng inspector hiện có.**
   Mỗi iframe component tự đăng ký với `useInspector().registerFrame('component:<project>:<id>', el, token)`; `specs['component:…']` do `buildSpec` dựng như mọi frame. Chọn một component → hiện spec SwiftUI (dùng `SpecDetail` sẵn có). Vì sao: không viết lại cơ chế đo; token định danh đã là cách route message an toàn.

8. **Usage đếm theo placeholder.**
   Hàm thuần `componentUsage(projectId)` quét `@component` trong HTML các màn (khuôn `src/tokens/usage.ts`), trả về màn nào dùng component nào. Vì sao: một chỗ, test được, và là dữ liệu cho catalog + cảnh báo "component không được dùng".

9. **Lint: một script mới + mở rộng subset-lint.**
   `scripts/components-lint.ts` (`npm run lint:components`, gộp vào `lint`): id không tồn tại = lỗi, vòng = lỗi, component không dùng = cảnh báo. `scripts/subset-lint.ts` được mở rộng để soi **cả file component** bằng đúng bộ luật subset (banned layout, `.icon` thiếu `data-symbol`, `var(--x)` chưa định nghĩa). Vì sao: luật subset phải áp cho markup sẽ render, và component render như screen.

10. **Vị trí catalog: tab trong dock trái.**
    Dock trái hiện là Tokens; thêm tab **Components** (chuyển giữa hai bảng) thay vì mở thêm một cột. Vì sao: không giành thêm bề ngang canvas; hai bảng cùng là "design system của project".

11. **Không migration, không đổi snapshot.**
    Component là file mới; expand chỉ chạy khi HTML có placeholder. `pc.board` giữ nguyên shape.

## Risks / Trade-offs

- [Risk] Nhiều iframe trong catalog → tốn tài nguyên → Mitigation: preview lazy, chỉ mount khi mở rộng; thu gọn dock thì unmount.
- [Risk] Component đổi cấu trúc làm `data-pc-id` của màn dịch → spec id tạm thời khác → Mitigation: id vốn là tạm (không persist); không ảnh hưởng số đo.
- [Risk] Vòng lặp hoặc lồng sâu → Mitigation: `stack` chặn vòng + giới hạn độ sâu; lỗi trả về chứ không treo.
- [Risk] Component chứa `.screen`/`.body` phá layout → Mitigation: lint cảnh báo + docs nói rõ fragment.
- [Risk] Id component trùng giữa các dự án → Mitigation: registry chặn trùng lúc khởi động (như screens).
- [Risk] Expand làm thay đổi số đo so với màn không dùng component → Mitigation: chỉ màn có placeholder đổi; màn cũ giữ nguyên (test tương thích ngược).
- [Risk] `compose.ts` đang "dependency-free" → Mitigation: `expand.ts` cũng thuần, không import gì; compose chỉ import type + hàm thuần.

## Migration Plan

Không migration. Component là file mới, không có placeholder thì không có gì đổi; `pc.board` không đổi shape. Rollback = revert code; file component còn lại vô hại (không được tham chiếu). Thứ tự: manifest/registry + expand (thuần, có test) → compose/buildSrcDoc/export → lint → catalog → docs + component mẫu.

## Open Questions

Không có câu hỏi nào chặn spec/approach/tasks. (Điểm để sau, không đổi thiết kế: props/slot, và đo component ở nhiều width.)
