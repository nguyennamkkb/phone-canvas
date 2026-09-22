# Spec Delta

## Purpose

Định nghĩa component tái sử dụng theo từng dự án — một mảnh HTML có id ổn định, được màn tham chiếu bằng placeholder và expand khi compose — cùng một bảng catalog để xem, đo và lấy spec SwiftUI của component.

## ADDED Requirements

### Requirement: Component là file có id ổn định theo dự án

Mỗi component SHALL được định nghĩa bằng một file HTML trong `project/<id>/components/` và một entry id ổn định trong manifest component (không suy id từ tên file hay thứ tự). Id SHALL unique trong toàn bộ registry, và mỗi component SHALL thuộc đúng một dự án.

#### Scenario: Khai báo một component

- **WHEN** thêm `project/moodtracker/components/tab.html` và một entry `tab` vào manifest rồi chạy `npm run components:sync`
- **THEN** registry chứa component `tab` trỏ tới file đó, không cần build step nào khác

#### Scenario: Id trùng

- **WHEN** hai component cùng id được khai báo
- **THEN** registry từ chối (báo lỗi) thay vì để hai định nghĩa tranh nhau một id

### Requirement: Màn tham chiếu component bằng placeholder

Screen HTML SHALL tham chiếu component bằng `<!-- @component <id> -->`. Khi màn được compose, mỗi placeholder SHALL được thay bằng HTML của component **trước khi** màn được render và đo, nên các element của component xuất hiện trong spec như element của chính màn đó.

#### Scenario: Màn dùng component

- **WHEN** `home.html` chứa `<!-- @component tab -->` và `tab` có định nghĩa
- **THEN** màn render đúng markup của `tab`, và panel đo được các element bên trong component như mọi element khác

#### Scenario: Màn không dùng component

- **WHEN** một màn không có placeholder nào
- **THEN** màn compose y hệt trước change, số đo và export không đổi

### Requirement: Expand ở compose, dùng chung cho app và export

Việc expand `@component` SHALL do module compose dùng chung (`composeScreenDoc`) thực hiện, nhận một map component làm đầu vào. App (board) và `npm run export` SHALL cho ra cùng document cho cùng một màn.

#### Scenario: Board và export khớp nhau

- **WHEN** cùng một màn có placeholder được compose bởi board và bởi export
- **THEN** document HTML của hai bên giống nhau, nên ảnh export không thể lệch khỏi board

### Requirement: Component lồng nhau và chống vòng

Một component MAY chứa `@component` của component khác. Hệ thống SHALL expand đệ quy và SHALL phát hiện vòng lặp (A chứa B, B chứa A) để báo lỗi thay vì treo hoặc expand vô hạn.

#### Scenario: Component lồng nhau

- **WHEN** component `card` chứa `<!-- @component icon-row -->` và `icon-row` có định nghĩa
- **THEN** cả hai được expand đúng thứ tự, màn render đủ markup

#### Scenario: Vòng lặp

- **WHEN** component `a` chứa `b` và `b` chứa `a`
- **THEN** hệ thống báo vòng lặp rõ ràng và không treo

### Requirement: Placeholder trỏ tới id không tồn tại

Một placeholder trỏ tới id không có trong registry SHALL bị báo là lỗi (lint và board/panel), SHALL NOT bị bỏ qua im lặng, và SHALL NOT làm vỡ phần còn lại của màn.

#### Scenario: Id gõ sai

- **WHEN** một màn chứa `<!-- @component tabs -->` nhưng registry chỉ có `tab`
- **THEN** lint báo lỗi kèm file:dòng, và board báo màn đó có tham chiếu component không tồn tại

### Requirement: Bảng catalog component

Hệ thống SHALL cung cấp một bảng catalog theo dự án, liệt kê mọi component với tên và một preview render thật; preview SHALL dùng đúng pipeline compose/bridge nên số đo khớp với màn, và người dùng SHALL xem được spec SwiftUI của component.

#### Scenario: Xem danh sách component

- **WHEN** người dùng mở bảng catalog của một dự án
- **THEN** mọi component của dự án hiện ra, mỗi cái có tên và preview

#### Scenario: Xem spec của component

- **WHEN** người dùng chọn một component trong catalog
- **THEN** panel hiện spec SwiftUI của các element trong component đó

#### Scenario: Component mới xuất hiện

- **WHEN** thêm một file component + entry manifest rồi sync
- **THEN** component mới xuất hiện trong catalog mà không cần đổi code UI

### Requirement: Catalog báo component được dùng ở đâu

Catalog SHALL báo mỗi component đang được dùng ở những màn nào, đếm theo placeholder trong screen HTML.

#### Scenario: Component dùng ở hai màn

- **WHEN** `tab` được tham chiếu trong hai màn
- **THEN** catalog hiện số lần dùng là 2 kèm tên hai màn

### Requirement: Lint component trong gate

`npm run lint` SHALL kiểm tra: placeholder trỏ tới id không tồn tại = lỗi; vòng lặp component = lỗi; và file component SHALL được soi cùng bộ luật subset như screen (banned layout, glyph thiếu `data-symbol`, `var(--x)` chưa định nghĩa). Component không được màn nào dùng SHALL được báo (cảnh báo), không làm gate thất bại.

#### Scenario: Gate bắt id sai và vòng lặp

- **WHEN** một màn tham chiếu id không tồn tại hoặc tồn tại vòng component, rồi chạy `npm run lint`
- **THEN** lint in lỗi kèm file:dòng và thoát mã khác 0

#### Scenario: Component lỗi subset

- **WHEN** một file component dùng `display:grid` hoặc `.icon` thiếu `data-symbol`
- **THEN** lint báo như khi lỗi nằm trong screen

### Requirement: Tương thích ngược

Screens và snapshot board hiện có SHALL chạy y như trước change; component là file mới và việc expand chỉ xảy ra khi có placeholder.

#### Scenario: Board cũ mở sau update

- **WHEN** board đã lưu từ trước được mở sau khi change áp dụng
- **THEN** số node, dây nối, số đo và export giữ nguyên, không báo lỗi
