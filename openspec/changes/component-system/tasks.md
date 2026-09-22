# Tasks

## 1. Registry và expand (thuần)

- [ ] 1.1 Tạo `src/components/manifest.ts` (`{ id, title, project, file }`, id ổn định) và mở rộng `scripts/gen-registry.ts` để sinh `src/components/generated.ts` (`?raw`); thêm script `components:sync` trong `package.json` — verify: chạy `npm run components:sync`, file generated chứa đúng entry, `npm run typecheck` xanh
- [ ] 1.2 Tạo `src/components/index.ts`: dựng `COMPONENTS_BY_ID`, chặn id trùng lúc khởi động (theo khuôn `src/screens/index.ts`) — verify: unit test/khởi động báo lỗi khi hai component cùng id
- [ ] 1.3 Tạo `src/components/expand.ts` thuần: `expandComponents(html, components) → { html, errors }`, expand đệ quy `<!-- @component id -->`, chống vòng bằng `stack`, bắt id thiếu + giới hạn độ sâu — verify: `src/components/expand.test.ts` phủ expand, lồng nhau, missing, cycle, độ sâu

## 2. Tích hợp compose (một chỗ, app + export)

- [ ] 2.1 `src/extractor/compose.ts`: thêm option `components?: Record<string,string>` và gọi `expandComponents` trước khi nhúng vào `.viewport` — verify: unit test compose cho document chứa markup component
- [ ] 2.2 `src/extractor/buildSrcDoc.ts`: nạp component của project (Vite `?raw`) và truyền vào compose — verify: màn có placeholder render ra markup component trên board
- [ ] 2.3 `scripts/export.ts`: đọc cùng file component từ đĩa và truyền vào compose — verify: `npm run export -- --screen home` cho ảnh có component, không lệch board
- [ ] 2.4 Kiểm chứng "board và export khớp": so document compose của hai bên cho cùng màn — verify: test/so chuỗi bằng nhau

## 3. Lint component

- [ ] 3.1 Tạo `scripts/components-lint.ts`: id không tồn tại = lỗi, vòng = lỗi, component không dùng = cảnh báo; thêm `lint:components` và gộp vào `lint` — verify: cố ý gõ sai id → lint lỗi + exit ≠ 0; trả lại thì xanh
- [ ] 3.2 Mở rộng `scripts/subset-lint.ts` để soi cả file component bằng bộ luật subset — verify: một component dùng `display:grid` bị lint báo như screen
- [ ] 3.3 Kiểm tra gate bắt vòng component — verify: tạo tạm `a`↔`b` rồi chạy `npm run lint:components`, thấy lỗi vòng, xoá đi thì xanh

## 4. Catalog component

- [ ] 4.1 Tạo hàm thuần `componentUsage(projectId)` (khuôn `src/tokens/usage.ts`) đếm `@component` theo màn — verify: `src/components/usage.test.ts` phủ đếm và màn không dùng
- [ ] 4.2 Tạo `src/components/ComponentDock.tsx`: liệt kê component của project, preview lazy trong iframe host (compose `.viewport` + component ở device width, scale bằng transform), đăng ký frame với `useInspector` và hiện spec SwiftUI khi chọn — verify: mở dock thấy component + preview; chọn một cái thấy spec
- [ ] 4.3 Thêm tab **Components** cạnh **Tokens** trong dock trái của board (`BoardView`/`Board`) + style trong `src/styles/` — verify: chuyển tab Tokens ↔ Components không phá bố cục canvas
- [ ] 4.4 Kiểm tra catalog cập nhật theo dữ liệu: thêm một file component + entry manifest + sync → xuất hiện trong catalog không cần sửa UI — verify: live

## 5. Docs, mẫu và nghiệm thu

- [ ] 5.1 `docs/screen-authoring.md`: mô tả `<!-- @component id -->`, component là fragment (không `.screen`/`.body`), và thêm mục checklist — verify: đọc lại doc khớp hành vi
- [ ] 5.2 Thêm component mẫu `project/moodtracker/components/*.html` (ví dụ `tab`, `stat-tile`) và dùng trong một màn — verify: board render đúng, panel đo được element trong component
- [ ] 5.3 Chạy `npm run lint && npm test` — verify: lint xanh cả gate mới; test không phát sinh fail mới ngoài fail có sẵn `tokens.test.ts`
- [ ] 5.4 Nghiệm thu thủ công: màn không dùng component giữ nguyên số đo/export; màn dùng component đo đúng; catalog hiện preview + spec + usage — verify: ảnh chụp board + catalog
