# Design

## Context

Xem `proposal.md` — Why. Trạng thái kỹ thuật quyết định cách làm:

- Repo vừa được dọn sạch: `SCREEN_FILES`, `COMPONENT_FILES`, `BUILTIN_PROJECTS` đều rỗng ⇒ **không có dữ liệu phải migrate**; đổi convention bây giờ miễn phí.
- Registry hiện tại là 4 file trung tâm + 2 file generated + 1 generator, cộng import tĩnh `project/*/tokens.css` trong `src/tokens/tokens.ts` và `src/extractor/assets.ts`.
- App chạy Vite 8.3; script chạy Node thuần, **không được** import module Vite-only (`?raw`, `import.meta.glob`).
- Invariant phải giữ: 1 CSS px = 1pt; compose dùng chung app/export; board localStorage; screen/component HTML là hợp đồng handoff.
- Đã kiểm chứng thực nghiệm trên Vite 8.3 (scratch project): `import.meta.glob` eager `?raw` tự thấy file thêm/xoá lúc dev (page reload, không restart); dev server phục vụ file tĩnh dưới root (`/project/...` → 200); glob/virtual module chạy trong vitest 5.

## Goals / Non-Goals

**Goals:**

- Một cây thư mục `project/<id>/` là nguồn sự thật duy nhất; app và script cùng suy ra registry từ nó, không có bản sao nào phải đồng bộ tay.
- Thêm/sửa/xoá screen, component, token, asset, dự án chỉ chạm file trong thư mục đó.
- Giữ nguyên shape dữ liệu mà app/export/lint đang tiêu thụ, để phần lớn code không đổi.
- Lỗi cấu hình fail-loud ở mọi cửa vào (dev, build, lint, CLI) kèm file:line.

**Non-Goals (design-level):**

- Không thêm backend: browser vẫn không ghi file; `board.json` chỉ đọc/ghi bởi CLI/export-import.
- Không đổi schema board trong localStorage (screen id vẫn tham chiếu toàn cục).
- Không lazy-load màn (bundle vẫn eager như hiện tại); không tối ưu dung lượng ở change này.
- Không đụng pipeline icon toàn cục (`public/icons`, `icon-set.css`).

## Decisions

### D1. Convention + một logic derive thuần, hai reader (thay vì virtual module / generated registry)

**Chọn:** một module thuần `src/projects/derive.ts` nhận `Record<path, content>` → registry + lỗi validate. Hai reader:

- Browser: `src/projects/registry.ts` thu thập input bằng `import.meta.glob` (html `?raw`, `project.json`, `tokens.css ?raw`, component `?raw`) rồi gọi derive.
- Node: `scripts/scan-projects.ts` đọc fs rồi gọi **cùng** derive; export/lint/CLI/test dùng nó.

**Vì sao:** HMR add/remove của glob đã được chứng minh, nên không cần plugin/watcher tự viết. Derive thuần test được không cần fs, và là nơi duy nhất chứa luật validate.

**Loại bỏ:**

- *Virtual module + plugin `load()` gọi scanner*: chạy được (đã thử), nhưng thêm plugin load-bearing, khó unit-test, và không cần vì glob đã tự invalidate.
- *Giữ generated registry, tự sinh lại*: vẫn còn file dẫn xuất trong `src/` và một bước codegen — đúng thứ proposal muốn bỏ.
- *Chỉ dùng glob ở app, tự parse ở Node*: hai bản logic dễ drift; derive chung + test parity chặn việc đó.

### D2. Screen id = tên file, unique toàn cục (P1)

**Chọn:** id là stem của `project/<id>/screens/<name>.html`, kebab-case, unique trên mọi dự án; trùng → lỗi nêu cả hai path.

**Vì sao:** zero-config, đúng tinh thần "thả file là biết". Doctrine cũ ("không suy identity từ filename") sinh ra để chống lệch giữa manifest và generated — khi thư mục là nguồn duy nhất thì không còn bản thứ hai để lệch. Board localStorage và tên file export đang tham chiếu id toàn cục, nên P1 giữ unique toàn cục để không phải migrate schema.

**Loại bỏ:** `project.json` liệt kê screens (lại có danh sách phải sửa, mất tính auto); id khai trong front-matter (thừa vì tên file đã là id); id scoped theo dự án (cần đổi schema board — để change sau).

### D3. Metadata: project-level trong `project.json`, screen-level trong header `<!-- pc {json} -->`

**Chọn:** `project.json` (tuỳ chọn) giữ `title`, `description`, `cover`. Mỗi screen khai `title`, `lightStatusBar`, `deviceId` ngay dòng đầu file; vắng thì lấy mặc định.

**Vì sao:** thông tin đi cùng artifact, xoá/đổi tên file không để lại entry mồ côi; `project.json` chỉ chứa thứ thuộc cấp dự án. Header là HTML comment nên không tạo element, không ảnh hưởng đo.

**Loại bỏ:** sidecar `.json` cho từng screen (hai file cho một artifact, dễ lệch); nhét tất cả vào `project.json` (một file phình ra, sửa screen nào cũng đụng file chung).

### D4. Asset: URL ổn định + phục vụ tại chỗ; không rewrite `?url`

**Chọn:** screen tham chiếu `/project/<id>/assets/<file>`. Dev phục vụ trực tiếp từ root (đã kiểm chứng). Export thêm route `/project/*` vào static site. Build copy `project/*/assets` vào `dist/project/...` bằng một hook nhỏ trong `vite.config.ts`.

**Vì sao:** URL trong HTML giữ nguyên ở mọi môi trường, không cần compose biết về asset, không đụng `compose.ts` (thứ app/export chia sẻ). Copy khi build chỉ chạy một lần, rẻ.

**Loại bỏ:** glob `?url` + rewrite URL trong compose (đẩy logic build vào module dùng chung, export phải giả lập mapping); đưa asset vào `public/` (mất tính tự chứa của thư mục).

### D5. Lane `screens/` và `components/` là bắt buộc; HTML ngoài lane là lỗi

**Chọn:** màn nằm trong `screens/`, component trong `components/`; `.html` nằm trực tiếp trong `project/<id>/` → lỗi khi khởi động/lint, chỉ rõ lane hợp lệ.

**Vì sao:** thư mục vừa được dọn nên không có file legacy; đặt sai lane mà bị bỏ qua im lặng là kiểu lỗi tệ nhất. Đây cũng là dịp cố định cấu trúc trước khi có màn mới.

### D6. Xoá registry trung tâm; script đọc scanner

**Chọn:** xoá `src/screens/manifest.ts`, `src/screens/generated.ts`, `src/components/manifest.ts`, `src/components/generated.ts`, `src/projects/builtin.ts`, `scripts/gen-registry.ts`. `src/screens/index.ts` và `src/components/index.ts` trở thành adapter mỏng trên registry mới, giữ tên export (`SCREENS`, `SCREEN_BY_ID`, `COMPONENTS`, `componentMap`) để phần app còn lại ít phải sửa. `tokens.ts`/`assets.ts` lấy `tokens.css` từ registry thay vì import tĩnh.

### D7. Chống drift giữa hai reader bằng test parity

**Chọn:** test dựng một cây `project/` fixture, chạy derive qua input glob (vitest xử lý `import.meta.glob`) và qua scanner fs, so deep-equal. Lint/export chỉ tin scanner.

### D8. CLI validate-trước-khi-ghi, xử lý `board.json` trên đĩa

**Chọn:** `screen add|rename|remove`, `project add|remove|list` chỉ ghi trong `project/<id>/`; mọi kiểm tra (slug, trùng, file tồn tại, board refs) chạy trước khi ghi. `rename` cập nhật `board.json` nếu có; `remove` từ chối khi `board.json` còn tham chiếu, `--force` để bỏ qua.

**Vì sao:** giữ doctrine hiện có (refuse-without-writing) và bảo vệ layout đã export; board trong trình duyệt vẫn prune reader-side như hôm nay — CLI chỉ cảnh báo.

### D9. Custom project (localStorage) giữ nguyên hành vi

**Chọn:** dự án tạo từ Dashboard vẫn không có thư mục; nó tham chiếu screen toàn cục từ các thư mục dự án, token/component/asset riêng = rỗng.

**Vì sao:** browser không ghi file; thêm backend là thay đổi sản phẩm lớn, không thuộc change này. API registry trả map rỗng cho id không có thư mục, đúng như `projectTokensOf`/`componentsFor` hôm nay.

## Risks / Trade-offs

- **Rename screen làm board localStorage prune node cũ** → đã là hành vi hiện có; CLI cảnh báo rõ và cập nhật `board.json`; muốn hết hẳn cần board.json ghi từ browser (change sau).
- **Trùng tên file giữa hai dự án là lỗi** → thông báo nêu cả hai path; nếu thành phiền, change sau chuyển sang id scoped (kèm migrate board).
- **Glob eager giữ toàn bộ HTML trong bundle** → y như hiện tại, không tệ thêm; lazy-load là tối ưu riêng.
- **Full page reload khi thêm/xoá file** → chấp nhận; đúng cơ chế Vite, không mất dữ liệu vì board nằm localStorage.
- **Copy asset khi build có thể quên đồng bộ với dev** → cùng một convention URL; test smoke build + serve `dist` là điều kiện nghiệm thu.
- **Header `<!-- pc ... -->` hỏng làm chết khởi động** → cố ý fail-loud; lỗi nêu file và JSON parse error, sửa một dòng là xong.
- **`import.meta.glob` không nhận pattern động** → pattern là hằng theo convention, không cần động.

## Migration Plan

1. Thêm derive + test thuần; thêm registry glob + scanner fs (song song với registry cũ, chưa xoá gì).
2. Chuyển app sang registry mới (screens/components/projects/tokens/assets); chạy gate.
3. Chuyển export + 3 lint + CLI sang scanner; xoá registry cũ + generator + phần rewrite manifest trong CLI.
4. Thêm lane asset (route export, copy build, lint URL), CLI `project`.
5. Cập nhật `README.md` + `docs/screen-authoring.md`; xác minh bằng scratch project (tạo, xem board, export, build, xoá).

Rollback: mỗi bước là một commit độc lập; revert commit bước đó là quay lại trạng thái trước (không có dữ liệu người dùng phải migrate).

## Open Questions

- Icon riêng theo dự án (`project/<id>/icons/` + mapping SF Symbol) — thiết kế convention và pipeline inline để change sau, không ảnh hưởng các quyết định ở đây.
- Ghi `board.json` từ browser qua dev-server endpoint — change sau, khi nhu cầu "dự án tự chứa cả layout" thành yêu cầu thật.
