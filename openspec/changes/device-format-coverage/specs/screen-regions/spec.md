# Spec Delta

## MODIFIED Requirements

### Requirement: Màn phone lõi là mẫu tham chiếu

Bộ màn phone lõi của `calo-ai` — `stats`, `food-detail`, `settings` — SHALL là hiện thân chuẩn của v2: dải nav và tab do shell dựng từ slot, thân cuộn bằng `.body` khi nội dung dài hơn khung. Mọi màn phone mới SHALL theo cấu trúc này thay vì tự phát minh.

#### Scenario: Gate trên mẫu

- **WHEN** chạy `npm run gate` sau v2
- **THEN** cả 3 màn xanh ở cả hai tầng; `npm run audit:regions` in ra `chrome: ok`, `scroll: ok`, `overflow: ok`

#### Scenario: Dùng mẫu làm khuôn

- **WHEN** một màn phone mới được tạo
- **THEN** cấu trúc vùng của nó dùng slot `data-slot` / `data-tab` và không khai `.navbar` / `.tabbar`, và lint tĩnh không báo lỗi cấu trúc vùng

## ADDED Requirements

### Requirement: Gate áp luật theo mặt, không ép mọi mặt thành phone

Static tier SHALL NOT áp luật thân `.body` / `.body-fixed` ngoài `form: phone`;
audit SHALL NOT fail một mặt chỉ vì nó có không scroller nào. Luật thêm cho
mặt mới (nếu vòng sample cần) SHALL sống chung một gate, không fork gate riêng.

#### Scenario: Widget không cuộn vẫn xanh

- **WHEN** một mặt widget vừa khít khung, không khai scroller nào
- **THEN** `scroll` và `overflow` không báo lỗi cho nó

#### Scenario: Một gate duy nhất

- **WHEN** thêm probe cho mặt mới
- **THEN** probe đó chạy trong `lint:regions` / `audit:regions` hiện có, không thêm gate mới
