# Spec Delta — bridge-schema

## Purpose

Mọi message bridge → parent được validate bằng schema versioned: payload sai bị drop có đếm thay vì crash hoặc treo "Đang đọc DOM…".

## ADDED Requirements

### Requirement: RawPayload versioned và được validate
Mọi message bridge gửi lên đều mang version và đúng schema.


#### Scenario: Payload hợp lệ đi qua như cũ

- **WHEN** bridge gửi `spec`/`height`/`select` đúng schema `v:1`
- **THEN** parent xử lý đúng như hiện tại (spec tree, frame/content height, selection)

#### Scenario: Payload sai bị drop có đếm

- **WHEN** message thiếu `nodes`/`box`/`css`, sai kiểu, hoặc version khác `v:1`
- **THEN** message bị drop, bộ đếm drop tăng (nhìn được từ panel), board không crash và node đó báo rõ "chưa đọc được DOM" thay vì loading vô hạn

### Requirement: Origin check giữ token routing
Chỉ message từ iframe đã đăng ký (đúng origin + token) mới được xử lý.


#### Scenario: Message lạ không lọt

- **WHEN** một message `pc:true` đến từ origin không phải iframe đã đăng ký, hoặc token không khớp `frames.get(nodeId).token`
- **THEN** message bị bỏ qua hoàn toàn
