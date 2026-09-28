# Tasks

## 1. Logic derive thuần

- [x] 1.1 Tạo `src/projects/types.ts` (ProjectDef/ScreenDef/ComponentDef + kiểu registry, không fs/Vite) và `src/projects/derive.ts`: nhận `Record<path, content>` → registry + danh sách lỗi, theo convention `project/<id>/{project.json?, tokens.css?, screens/*.html, components/*.html, assets/**}` — verify: `src/projects/derive.test.ts` phủ happy path (folder zero-config, project.json đầy đủ) và shape trả về
- [x] 1.2 Trong derive: screen id = tên file, unique toàn cục, parse header `<!-- pc {json} -->` (title/lightStatusBar/deviceId), default title từ id; lỗi nêu file khi JSON hỏng, khoá lạ, `deviceId` không tồn tại, id trùng — verify: test cho từng lỗi ở trên (assert message chứa cả hai path khi trùng)
- [x] 1.3 Trong derive: component id theo dự án (trùng trong dự án = lỗi, khác dự án = hợp lệ), `tokens.css` theo dự án, HTML nằm trực tiếp trong `project/<id>/` = lỗi chỉ rõ lane — verify: test từng luật
- [x] 1.4 `npm run typecheck` xanh và `npx vitest run src/projects/derive.test.ts` xanh — verify: chạy hai lệnh trên

## 2. Hai reader dùng chung derive

- [x] 2.1 Tạo `scripts/scan-projects.ts` (Node, fs) đọc cây `project/` → input → derive, xuất registry + lỗi — verify: chạy trên repo hiện tại (0 dự án) trả registry rỗng không lỗi; trên thư mục fixture tạm trong test trả đúng project/screen/component/token
- [x] 2.2 Tạo `src/projects/registry.ts`: hàm thuần `buildRegistry(inputs)` + module-level thu thập input bằng `import.meta.glob` (`/project/*/screens/*.html` `?raw`, `/project/*/project.json`, `/project/*/tokens.css` `?raw`, `/project/*/components/*.html` `?raw`), gọi derive, throw khi có lỗi — verify: typecheck + import được trong vitest trên repo rỗng
- [x] 2.3 Test parity: dựng cây fixture trên đĩa (tmp), chạy scanner fs và `buildRegistry` với input literal tương ứng, so deep-equal — verify: `npx vitest run` test parity xanh

## 3. Chuyển app sang registry mới

- [x] 3.1 `src/screens/index.ts` và `src/components/index.ts` đọc từ registry mới nhưng giữ nguyên named export (`SCREENS`, `SCREEN_BY_ID`, `COMPONENTS`, `COMPONENTS_BY_ID`, `componentMap`) — verify: typecheck; app boot ở `npm run dev` không lỗi khi registry rỗng
- [x] 3.2 `src/projects/projects.ts` + `src/projects/storage.ts` dùng danh sách dự án từ registry thay `BUILTIN_PROJECTS`; merge custom project giữ nguyên — verify: `npx vitest run src/projects/storage.test.ts` xanh; Dashboard hiện 0 dự án với thông điệp rỗng
- [x] 3.3 `src/tokens/tokens.ts` và `src/extractor/assets.ts` lấy `tokens.css` theo dự án từ registry (bỏ import tĩnh + `PROJECT_CSS`); `src/canvas/TokenNode.tsx` bỏ `PROJECT_ACCENT` — verify: `npx vitest run src/tokens/tokens.test.ts` xanh; board render không lỗi
- [x] 3.4 Dev-HMR: thêm/xoá `project/<id>/screens/<name>.html` khi dev server đang chạy, board cập nhật không cần restart — verify: thao tác tay trên scratch project rồi xoá

## 4. Chuyển script sang scanner

- [x] 4.1 `scripts/export.ts` lấy screen/project/token/component/file path từ scanner (bỏ import manifest/builtin) — verify: `npm run export -- --list` chạy với registry rỗng; export 1 screen fixture ra PNG đúng kích thước device
- [x] 4.2 `scripts/tokens-lint.ts`, `scripts/subset-lint.ts`, `scripts/components-lint.ts` duyệt theo scanner; thêm luật mới: HTML sai lane, id trùng, asset URL chéo dự án/thiếu file — verify: cố ý tạo từng lỗi → lint đỏ kèm file:line; xoá → `npm run lint` xanh
- [x] 4.3 Cập nhật test hiện có còn tham chiếu registry cũ (nếu có) — verify: `npm run gate` xanh

## 5. CLI theo thư mục

- [x] 5.1 `scripts/new-screen.ts` (và `scripts/screen.ts add`): chỉ ghi `project/<id>/screens/<name>.html`, validate slug/trùng/tồn tại trước khi ghi, không sửa file trung tâm — verify: chạy add trên scratch project, `git status` chỉ thấy file mới, board thấy màn ngay
- [x] 5.2 `rename`: đổi tên file + cập nhật tham chiếu trong `project/<id>/board.json` nếu có + cảnh báo board trình duyệt sẽ prune — verify: fixture có board.json tham chiếu id cũ, chạy rename, JSON đổi đúng
- [x] 5.3 `remove` (chặn khi board.json còn ref, `--force` bỏ qua) và CLI dự án mới `scripts/project.ts` (`add|remove|list`) + script `project` trong `package.json` — verify: remove bị chặn rồi `--force` xoá; `project add` tạo thư mục + `project.json`; `project remove --force` xoá cả thư mục
- [x] 5.4 `scripts/delete-screen.ts` cũ được thay bằng `screen remove` (không còn rewrite manifest) — verify: `grep -rn "manifest" scripts/*.ts` không còn chỗ rewrite registry

## 6. Lane asset

- [x] 6.1 Route `/project/<id>/assets/**` trong `scripts/export/site.ts` trỏ về thư mục dự án — verify: export screen fixture dùng `<img class="art">` + nền asset → PNG chứa ảnh
- [x] 6.2 Hook copy `project/*/assets` vào `dist/project/...` trong `vite.config.ts` — verify: `npm run build` rồi serve `dist` bằng static server, URL asset trả 200 và màn render đủ ảnh
- [x] 6.3 Lint asset: URL phải là `/project/<id>/assets/...` của chính dự án sở hữu màn; asset thiếu = lỗi — verify: test hai trường hợp lỗi rồi sửa xanh

## 7. Dọn registry cũ + docs

- [x] 7.1 Xoá `src/screens/manifest.ts`, `src/screens/generated.ts`, `src/components/manifest.ts`, `src/components/generated.ts`, `src/projects/builtin.ts`, `scripts/gen-registry.ts`; bỏ script `screens:sync`/`components:sync` khỏi `package.json` và mọi nơi gọi — verify: `grep -rn "screens:sync\|components:sync\|SCREEN_FILES\|COMPONENT_FILES\|BUILTIN_PROJECTS" src scripts package.json` không còn kết quả; `npm run gate` xanh
- [x] 7.2 Cập nhật `README.md` (layout cây thư mục, "Adding a screen" = thả file, bỏ codegen) và `docs/screen-authoring.md` (bỏ bước manifest/generated, thêm header `<!-- pc -->`, lane `screens/`/`components/`/`assets/`) — verify: các lệnh trong docs chạy đúng trên scratch project
- [x] 7.3 Rà `docs/devices.md` và các chỗ nhắc `new-screen`/wiring cũ — verify: không còn hướng dẫn trỏ tới manifest/generated

## 8. Nghiệm thu end-to-end

- [x] 8.1 Kịch bản scratch: `project add` → 2 screen + 1 component + override token + 1 asset → board (di chuyển/đo/token dock/component) → export PNG → build + serve dist → rename 1 screen → remove 1 screen (chặn rồi `--force`) → `project remove --force`; dọn sạch — verify: mọi bước hành xử đúng spec, `git status` sạch sau khi dọn
- [x] 8.2 Chạy `npm run gate`, `npm run build`, `npm run export -- --list` trên repo sạch (0 dự án) — verify: cả ba xanh, không có bước codegen nào phải chạy tay
