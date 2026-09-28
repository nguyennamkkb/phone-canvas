# Spec Delta

## Purpose

Một dự án là một thư mục tự chứa: màn hình, component, token và metadata được khám phá tự động từ chính thư mục đó, nên thêm/sửa/xoá chỉ diễn ra trong một thư mục — không cần registry trung tâm, không cần codegen, không cần restart.

## ADDED Requirements

### Requirement: Dự án là một thư mục tự chứa

Một dự án SHALL được định nghĩa bằng thư mục `project/<id>/` với `<id>` là kebab-case. Thư mục SHALL nhận các lane sau, tất cả đều tuỳ chọn trừ `screens/`:

- `project.json` — metadata dự án (`title`, `description`, `cover`).
- `tokens.css` — lớp token override của dự án.
- `screens/*.html` — màn hình.
- `components/*.html` — component tái sử dụng.
- `assets/**` — ảnh/art của dự án.

Một thư mục chỉ có `screens/` SHALL là dự án hợp lệ (zero-config): `title` mặc định suy từ `<id>`. Không file nào ngoài thư mục được yêu cầu để dự án, screen, component hay token của nó xuất hiện trên board và trong export.

#### Scenario: Dự án zero-config xuất hiện

- **WHEN** tạo `project/myapp/screens/home.html` (không có `project.json`)
- **THEN** board thấy dự án `myapp` với một màn `home`, và export được `home` mà không cần thêm bước đăng ký nào

#### Scenario: File HTML đặt sai lane

- **WHEN** có `project/myapp/loose.html` nằm trực tiếp trong thư mục dự án (không thuộc `screens/` hay `components/`)
- **THEN** khởi động/lint báo lỗi nêu rõ file và hai lane hợp lệ, thay vì bỏ qua im lặng

### Requirement: Screen id và metadata khai báo ngay trong file

Screen id SHALL là tên file (bỏ `.html`) trong `project/<id>/screens/`, phải là kebab-case và unique trên toàn bộ các dự án. Tệp màn SHALL có thể khai báo metadata ở dòng đầu bằng comment `<!-- pc {json} -->` với các khoá `title`, `lightStatusBar`, `deviceId`; `deviceId` phải là một device đã biết. Thiếu metadata thì mặc định: `title` suy từ id, `lightStatusBar` false, device mặc định của board. Metadata sai định dạng, sai khoá hoặc `deviceId` không tồn tại SHALL là lỗi khởi động/lint kèm tên file.

#### Scenario: Thả file mới là board thấy ngay

- **WHEN** thêm `project/myapp/screens/settings.html` trong lúc dev server đang chạy
- **THEN** board cập nhật danh sách màn mà không cần restart, không cần chạy script nào

#### Scenario: Metadata override mặc định

- **WHEN** `settings.html` mở đầu bằng `<!-- pc {"title":"Settings","lightStatusBar":true,"deviceId":"ipad-11"} -->`
- **THEN** board hiển thị đúng title, mở node ở device `ipad-11`, và status bar đổi màu đúng như khai báo

#### Scenario: Trùng screen id

- **WHEN** hai file cùng tên stem tồn tại ở hai dự án khác nhau
- **THEN** khởi động/lint từ chối và nêu cả hai đường dẫn, không để một màn che màn kia

### Requirement: Component theo dự án, không cần manifest

Component id SHALL là tên file (bỏ `.html`) trong `project/<id>/components/`, scoped theo dự án: trùng id trong cùng một dự án là lỗi, cùng id ở hai dự án khác nhau là hợp lệ. Screen SHALL tham chiếu component bằng `<!-- @component <id> -->`; tham chiếu SHALL chỉ resolve trong dự án sở hữu màn, và id không tồn tại SHALL bị lint báo lỗi. Thêm/xoá file component SHALL không cần sửa file nào khác trong repo.

#### Scenario: Component mới dùng được ngay

- **WHEN** thêm `project/myapp/components/stat-tile.html` và một màn dùng `<!-- @component stat-tile -->`
- **THEN** màn compose ra markup của component ở cả board lẫn export, không cần đăng ký

#### Scenario: Tham chiếu component của dự án khác

- **WHEN** màn của `myapp` dùng `<!-- @component chev -->` nhưng `chev` chỉ tồn tại trong dự án khác
- **THEN** lint báo lỗi "component không tồn tại trong dự án này", không âm thầm resolve chéo dự án

### Requirement: Token của dự án được compose tự động

`project/<id>/tokens.css` SHALL được nạp tự động cho mọi màn của dự án đó, đặt sau stylesheet token chung, ở cả board lẫn export — không cần khai báo import ở đâu. Dự án không có file này SHALL chỉ dùng token chung.

#### Scenario: Override token trong dự án

- **WHEN** `project/myapp/tokens.css` định nghĩa lại `--accent`
- **THEN** màn của `myapp` đổi màu ở cả board và PNG export, còn màn của dự án khác không đổi

### Requirement: Một logic khám phá dùng chung cho app và script

Việc khám phá và validate registry (dự án, screen, component, token, metadata) SHALL do một logic thuần duy nhất quyết định, nhận đầu vào là nội dung file theo đường dẫn. App trên trình duyệt SHALL dựng registry từ `import.meta.glob`; script Node (export, lint, CLI) SHALL quét filesystem rồi dùng **cùng** logic đó. Với cùng một cây thư mục, hai đường SHALL cho ra registry giống nhau.

#### Scenario: Board và script đồng ý

- **WHEN** chạy test so registry do đường glob (trình duyệt) và đường quét fs (Node) trên cùng cây `project/`
- **THEN** hai kết quả bằng nhau (cùng id, title, file, cấu trúc)

#### Scenario: Lỗi validate hiện ở mọi cửa vào

- **WHEN** registry có lỗi (id trùng, header hỏng, `deviceId` lạ, HTML sai lane)
- **THEN** dev server, `npm run build` và `npm run lint` đều thất bại với thông báo nêu file, không có cửa nào render im lặng

### Requirement: Bỏ registry trung tâm và codegen

Thêm, sửa, xoá hay đổi tên screen/component/dự án SHALL chỉ cần thay đổi bên trong `project/<id>/`, không được yêu cầu sửa file trung tâm hay chạy lệnh sinh code. Các registry trung tâm và generator hiện tại SHALL bị xoá; dev SHALL phản ánh file thêm/xoá mà không cần restart.

#### Scenario: Xoá màn

- **WHEN** xoá `project/myapp/screens/settings.html`
- **THEN** màn biến mất khỏi board và khỏi export mà không phải sửa file nào khác

#### Scenario: Xoá dự án

- **WHEN** xoá cả thư mục `project/myapp/`
- **THEN** dự án biến mất khỏi dashboard; board trong localStorage trỏ tới screen của nó tự prune khi mở (hành vi reader-side hiện có)

### Requirement: CLI vòng đời ghi trong thư mục dự án

`npm run screen -- add|rename|remove` và `npm run project -- add|remove|list` SHALL chỉ ghi bên trong `project/<id>/`, validate trước khi ghi và từ chối khi input sai (id không hợp lệ, trùng, file đã tồn tại) mà không để lại trạng thái nửa vời. `rename` SHALL đổi tên file và cập nhật tham chiếu trong `project/<id>/board.json` nếu file này tồn tại. `remove` (screen hoặc project) SHALL từ chối khi có `board.json` còn tham chiếu, trừ khi truyền `--force`.

#### Scenario: Thêm screen chỉ tạo một file

- **WHEN** chạy `npm run screen -- add --project myapp --name settings --title "Settings"`
- **THEN** chỉ `project/myapp/screens/settings.html` được tạo; không file trung tâm nào bị sửa, board thấy màn ngay

#### Scenario: Rename cập nhật board trên đĩa

- **WHEN** chạy `npm run screen -- rename --id settings --to prefs` và `project/myapp/board.json` đang tham chiếu `settings`
- **THEN** file được đổi tên và `board.json` được cập nhật sang `prefs`; CLI cảnh báo board trong trình duyệt sẽ prune node cũ

#### Scenario: Xoá khi board còn tham chiếu

- **WHEN** chạy `npm run screen -- remove --id prefs` mà `board.json` còn node `prefs`
- **THEN** CLI từ chối và chỉ rõ tham chiếu; có `--force` thì mới xoá
