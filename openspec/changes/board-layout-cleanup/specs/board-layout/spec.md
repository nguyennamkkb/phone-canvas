# Spec Delta

## Purpose

Định nghĩa bố cục chuẩn của trang board để toolbar, vùng canvas và inspector không bao giờ đè lẫn nhau, áp dụng thống nhất cho mọi project.

## ADDED Requirements

The system SHALL giữ toolbar trên, vùng canvas và inspector là ba vùng riêng biệt; không phần tử nào của vùng này được vẽ đè lên vùng khác.


#### Scenario: Mở board ở màn rộng
- **WHEN** người dùng mở bất kỳ board nào ở viewport rộng (ví dụ 1280px trở lên)
- **THEN** toolbar nằm trọn trong vùng của nó, canvas không bị token rail che khuất thường trực, inspector 384px nằm hẳn bên phải, không chữ nào đè lên nhau

### Requirement: Toolbar tự thu gọn khi thiếu chỗ

Khi chiều ngang không đủ, toolbar SHALL thu gọn các nhóm nút phụ (giữ lại back, tên project, mode) thay vì tràn chữ sang vùng bên cạnh.

#### Scenario: Thu hẹp cửa sổ
- **WHEN** người dùng thu hẹp viewport xuống dưới ngưỡng vừa (ví dụ ~1100px)
- **THEN** toolbar rút gọn nhóm nút phụ thành trigger gọn, mọi nút còn lại vẫn bấm được, không có chữ nào tràn ra ngoài toolbar

### Requirement: Token rail thu gọn được và nhớ trạng thái

Bảng design tokens SHALL ở dạng rail trái có hai trạng thái mở/gọn do người dùng điều khiển; trạng thái được nhớ riêng cho từng project. Giả định: mặc định là gọn để canvas thoáng (ghi nhận vì người dùng chưa chốt; đổi mặc định không vi phạm spec này miễn vẫn nhớ trạng thái).

#### Scenario: Đóng/mở rail và tải lại
- **WHEN** người dùng thu gọn rail rồi tải lại board cùng project
- **THEN** rail vẫn gọn; bấm mở thì hiện lại đầy đủ 79 biến tokens mà không mất node màn hình nào trên canvas

### Requirement: Inspector thành overlay khi màn hẹp

Dưới ngưỡng hẹp, inspector SHALL rời khỏi hàng ngang và thành lớp phủ bên phải có nút đóng riêng; đóng overlay không làm mất selection đã chọn.

#### Scenario: Mở inspector ở viewport hẹp
- **WHEN** người dùng mở board ở viewport hẹp và bật inspector
- **THEN** inspector phủ bên phải kèm nút đóng, canvas vẫn thao tác được sau khi đóng, không còn dải 384px ăn hết chiều ngang

### Requirement: Số đo SwiftUI không đổi sau sửa layout

Việc sửa layout board SHALL NOT làm thay đổi bất kỳ số đo nào của màn hình (panel spec và PNG export phải cho số cũ).

#### Scenario: So sánh trước/sau
- **WHEN** đo cùng một màn hình trước và sau khi áp dụng layout mới
- **THEN** mọi khung hình, spacing và màu trong spec đều giống hệt, export PNG cùng kích thước pixel
