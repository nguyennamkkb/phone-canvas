# Spec Delta

## Purpose

Định nghĩa cách board sắp xếp các màn hình thành hàng có thứ tự từ trái qua phải và gom thành nhóm hàng, để agent lẫn người đều xếp được board đông màn mà không cần kéo tay từng node.

## ADDED Requirements

### Requirement: Hàng màn hình có thứ tự trái qua phải

Board SHALL xếp mỗi hàng màn hình theo đúng thứ tự đã khai: màn đứng trước nằm bên trái, màn đứng sau nằm bên phải, khoảng cách ngang giữa hai node kề nhau bằng nhau trên toàn board.

#### Scenario: Khai thứ tự ba màn

- **WHEN** arrangement khai một hàng gồm `[splash, home, detail]` rồi mở board mới (chưa có bản lưu)
- **THEN** ba node nằm trên cùng một đường ngang theo đúng thứ tự `splash → home → detail` từ trái qua phải, không màn nào đè lên nhau

#### Scenario: Màn rộng và màn hẹp chung hàng

- **WHEN** một hàng gồm màn tablet rộng và màn phone hẹp đứng cạnh nhau
- **THEN** màn đứng sau bắt đầu sau cạnh phải của màn đứng trước cộng đúng một khoảng hở chung, không bao giờ chồng lấn dù hai màn khác chiều rộng

### Requirement: Nhiều hàng để gom nhóm

Board SHALL hỗ trợ nhiều hàng xếp chồng từ trên xuống: mỗi hàng là một nhóm (có tên tùy chọn như "onboarding", "paywall"), hàng dưới nằm hoàn toàn dưới hàng trên, khoảng cách dọc giữa các hàng bằng nhau.

#### Scenario: Hai nhóm hàng

- **WHEN** arrangement khai hàng 1 `[splash, home]` và hàng 2 `[pay-1, pay-2, pay-3]`
- **THEN** board hiện hai hàng tách biệt theo chiều dọc, mỗi hàng giữ đúng thứ tự trái qua phải của nó, hàng 2 không đè lên hàng 1 ở bất kỳ chiều rộng device nào

#### Scenario: Hàng không tên vẫn hợp lệ

- **WHEN** arrangement khai hàng mà không đặt tên nhóm
- **THEN** board vẫn xếp hàng đó bình thường như hàng có tên — tên nhóm chỉ để người đọc hiểu, không ảnh hưởng tọa độ

### Requirement: Cùng đầu vào cho cùng tọa độ

Cùng một arrangement và cùng một bộ device của các màn SHALL luôn cho cùng một bộ tọa độ node, trên mọi máy và mọi lần mở. Tọa độ là suy ra, không phải số tay chỉnh từng node.

#### Scenario: Mở lại board đã xếp

- **WHEN** mở cùng một arrangement hai lần trên hai máy khác nhau (cùng code)
- **THEN** mọi node nằm đúng cùng vị trí pixel, không xê dịch do thứ tự đọc file hay kích thước màn hình browser

### Requirement: CLI xếp hàng không cần browser

Người dùng SHALL xếp được board từ terminal mà không mở browser: lệnh freeze nhận thứ tự màn显式 và cách chia hàng, ghi ra file seed hợp lệ; id lạ SHALL báo lỗi và không ghi gì.

#### Scenario: Freeze theo thứ tự chỉ định

- **WHEN** chạy freeze với `--order splash,home,detail --row-size 2`
- **THEN** file seed chứa hai hàng (`[splash, home]`, `[detail]`), node có tọa độ theo đúng quy tắc hàng, thứ tự trong file giữ đúng thứ tự đã truyền

#### Scenario: Freeze gặp id không tồn tại

- **WHEN** chạy freeze với một id không có trong registry
- **THEN** lệnh thoát lỗi, nêu rõ id nào lạ, và không ghi hay sửa bất kỳ file seed nào (kể cả `.bak`)

#### Scenario: Không truyền thứ tự

- **WHEN** chạy freeze mà không truyền `--order`
- **THEN** hành vi giữ như hiện tại (toàn bộ màn của project, một hàng) — không đổi gì với người dùng cũ

### Requirement: Board cũ vẫn mở được, bản kéo tay luôn thắng seed

Snapshot board đã lưu (vị trí kéo tay trong `localStorage`) SHALL được giữ nguyên khi mở; file seed chỉ dùng khi chưa có bản lưu hoặc seed mới hơn. Snapshot cũ không có khái niệm hàng SHALL mở đúng như trước khi có tính năng này.

#### Scenario: Seed mới thua bản kéo tay

- **WHEN** user đã kéo board trong browser (đã có bản lưu) rồi freeze ra seed mới hơn ngoài terminal
- **THEN** lần mở tiếp theo vẫn hiện đúng vị trí đã kéo tay; chỉ khi xóa bản lưu hoặc seed mới hơn bản lưu thì seed mới được áp dụng

#### Scenario: Mở snapshot thời chưa có hàng

- **WHEN** mở một snapshot v5 cũ (chỉ có `position` từng node, không có model hàng)
- **THEN** board hiện đúng các vị trí cũ, không tự xếp lại, không mất node/edge/trash nào

### Requirement: Agent xếp board bằng file, không cần browser

Agent SHALL xếp được board mà không mở browser: đọc danh sách màn (`screen -- list`), ghi file seed đúng shape validator chấp nhận, và board mở ra đúng hàng đã ghi sau khi import/seed.

#### Scenario: Agent giao board 2 hàng

- **WHEN** agent ghi seed gồm 2 hàng rồi board được mở từ seed đó (máy chưa có bản lưu)
- **THEN** board hiện đúng 2 hàng theo đúng thứ tự agent đã ghi, panel/inspector/export đo số như bình thường — việc xếp hàng không làm lệch bất kỳ số đo nào của màn hình
