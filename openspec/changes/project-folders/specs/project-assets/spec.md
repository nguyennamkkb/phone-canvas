# Spec Delta

## Purpose

Asset (ảnh/art) thuộc về thư mục dự án và render đúng trên board, trong PNG export và ở bản build tĩnh — không cần đăng ký trung tâm, không cần copy thủ công khi dev.

## ADDED Requirements

### Requirement: Asset nằm trong thư mục dự án và tham chiếu bằng URL ổn định

Asset của dự án SHALL nằm dưới `project/<id>/assets/**`. Screen SHALL tham chiếu asset bằng URL tuyệt đối `/project/<id>/assets/<path>`, dùng được cho cả `<img class="art">` lẫn `background-image` của `.screen`. Screen của dự án nào SHALL chỉ tham chiếu asset của chính dự án đó; URL trỏ sang dự án khác hoặc ra ngoài thư mục (qua `..`) SHALL bị lint báo lỗi kèm file:line.

#### Scenario: Art và nền dùng asset của dự án

- **WHEN** `project/myapp/screens/home.html` dùng `<img class="art" src="/project/myapp/assets/hero.svg">` và `.screen` có `background-image: url(/project/myapp/assets/pattern.svg)`
- **THEN** cả hai render trên board, và spec của ảnh vẫn báo `Image("hero")` như trước

#### Scenario: Tham chiếu chéo dự án

- **WHEN** màn của `myapp` tham chiếu `/project/otherapp/assets/logo.svg`
- **THEN** lint báo lỗi asset ngoài dự án kèm file:line

### Requirement: Dev phục vụ asset trực tiếp, không copy

Dev server SHALL phục vụ `/project/<id>/assets/**` trực tiếp từ đĩa, không cần bước copy hay build; thêm/thay file asset SHALL hiển thị sau khi trang reload, không cần restart.

#### Scenario: Thả asset mới trong lúc dev

- **WHEN** copy `hero.svg` vào `project/myapp/assets/` rồi reload màn đang tham chiếu nó
- **THEN** ảnh render, không cần chạy lệnh nào

### Requirement: Export render asset giống board

Static site của export SHALL phục vụ asset dưới cùng URL `/project/<id>/assets/**`, nên PNG export SHALL chứa đúng asset như board hiển thị, không phụ thuộc `public/` dùng chung.

#### Scenario: Export màn có asset dự án

- **WHEN** chạy `npm run export -- --screen home` với màn dùng asset trong `project/myapp/assets/`
- **THEN** PNG chứa asset đó, kích thước và vị trí khớp board

### Requirement: Bản build tĩnh vẫn resolve asset dự án

`npm run build` SHALL tạo output mà URL `/project/<id>/assets/**` vẫn resolve khi thư mục `dist/` được phục vụ tĩnh, để app build không vỡ ảnh.

#### Scenario: Phục vụ dist

- **WHEN** chạy `npm run build` rồi phục vụ `dist/` bằng static server và mở board
- **THEN** màn dùng asset dự án render đủ ảnh, không 404

### Requirement: Vòng đời asset không cần đăng ký

Xoá đổi tên asset hay cả thư mục dự án SHALL không cần cập nhật danh sách trung tâm nào. Khi một screen còn tham chiếu asset không tồn tại, lint SHALL báo lỗi kèm file:line thay vì để ảnh vỡ im lặng.

#### Scenario: Xoá asset còn được tham chiếu

- **WHEN** xoá `project/myapp/assets/hero.svg` nhưng `home.html` vẫn tham chiếu nó
- **THEN** `npm run lint` báo lỗi asset thiếu kèm file:line

#### Scenario: Xoá dự án

- **WHEN** xoá cả `project/myapp/`
- **THEN** assets của nó biến mất cùng thư mục; không còn danh sách trung tâm nào nhắc tới chúng
