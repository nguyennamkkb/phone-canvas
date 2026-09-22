# Spec Delta

## Purpose

Định nghĩa bộ core kết nối flow trên board: view → view (nối, luật nối, chọn/xóa/undo edge), component → view (nhãn nút nguồn trên edge), thêm/xóa màn kèm dọn dẹp edge, và snapshot tương thích ngược.

## ADDED Requirements

### Requirement: Nối hai màn bằng kéo-thả

Mỗi node màn hình SHALL có núm nối vào (trái) và núm nối ra (phải); kéo từ núm ra của màn A sang màn B SHALL tạo một edge A → B, lưu cùng board snapshot và còn nguyên sau reload.

#### Scenario: Kéo nối Home sang Journal

- **WHEN** người dùng ở chế độ Di chuyển kéo từ núm phải của Home sang Journal
- **THEN** một edge cong nối hai màn xuất hiện, reload board edge vẫn còn đó

### Requirement: Luật nối — cấm tự vòng và trùng

Hệ thống SHALL từ chối nối một màn vào chính nó, và SHALL NOT tạo edge mới khi đã có edge cùng cặp nguồn–đích (kể cả đã có nhãn khác nhau).

#### Scenario: Kéo vòng và kéo trùng

- **WHEN** người dùng kéo từ núm ra về lại chính màn đó, hoặc nối lại cặp màn đã có edge
- **THEN** không có edge mới nào được tạo, board giữ nguyên

### Requirement: Chọn và xóa edge, có hoàn tác

Người dùng SHALL chọn được edge (click) và xóa bằng Delete/Backspace; xóa edge SHALL hoàn tác được trong 6s như xóa node. Xóa node SHALL kéo theo mọi edge dính tới nó.

#### Scenario: Xóa nhầm edge

- **WHEN** người dùng xóa edge Home → Journal rồi bấm hoàn tác trong 6s
- **THEN** edge quay lại đúng vị trí cũ, không mất node nào

### Requirement: Nhãn component nguồn trên edge

Mỗi edge MAY mang nhãn ghi component nguồn (ví dụ "tab Journal", "hàng Mood Journal"); nhãn SHALL được lưu trong snapshot, hiển thị trên edge, và snapshot cũ thiếu nhãn SHALL đọc bình thường (coi như rỗng).

#### Scenario: Mở board cũ sau update

- **WHEN** board đã lưu từ trước (edge không có nhãn) được mở sau khi change này áp dụng
- **THEN** mọi edge cũ hiển thị và nối như cũ, không báo lỗi, không mất edge

### Requirement: Thêm màn không nhân bản lén

Nút `+` SHALL chỉ thêm màn chưa có trên board; khi mọi màn đã lên board, `+` SHALL NOT tự thêm bản sao — người dùng muốn trùng chủ đích phải chọn rõ màn từ picker.

#### Scenario: Bấm + khi board đã đủ màn

- **WHEN** mọi màn của project đã có trên board và người dùng bấm `+`
- **THEN** không có node mới nào xuất hiện (thay vì một bản sao lặng lẽ như trước)

### Requirement: Dọn edge mồ côi khi mở board

Khi mở board, mọi edge trỏ tới node không còn (màn bị gỡ khỏi manifest, node bị lọc) SHALL bị loại bỏ cùng lúc; snapshot hỏng SHALL rơi về layout mới như hiện tại.

#### Scenario: Gỡ màn khỏi manifest

- **WHEN** một màn bị xóa khỏi registry trong khi board đã lưu còn edge tới nó
- **THEN** lần mở sau node đó vắng mặt và không còn edge nào trỏ vào khoảng trống
