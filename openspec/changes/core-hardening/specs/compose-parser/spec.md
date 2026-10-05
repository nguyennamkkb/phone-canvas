# Spec Delta — compose-parser

## Purpose

Thay string-scan bằng DOM parser thật trong `composeScreenDoc` mà không đổi hành vi ngoài: board và export render byte-identical, mọi API công khai giữ nguyên chữ ký.

## ADDED Requirements

### Requirement: Kết quả compose không đổi khi đổi parser
Document đầu ra của parser mới phải giống hệt regex cũ trên mọi input hợp lệ hiện có.


#### Scenario: Screen chuẩn render giống hệt trước và sau

- **WHEN** cùng một screen HTML được compose bằng parser mới
- **THEN** document đầu ra giống byte-identical với document từ regex cũ (trừ khi input thuộc nhóm HTML lỗi đã liệt kê, khi đó parser mới thắng và có warn)

#### Scenario: HTML lỗi được xử lý đúng thay vì vỡ âm thầm

- **WHEN** screen chứa attribute không quote, nested cùng tag-name, void-tag không đóng, hoặc comment chứa `<div>`
- **THEN** slot lifting (`data-slot`/`data-tab`), `activeTabOf`, `screenBgOf` cho kết quả đúng theo DOM thật, và một cảnh báo ghi rõ input nào khiến regex cũ lệch

### Requirement: Fallback regex 1 release có cảnh báo
Regex cũ được giữ 1 release làm đối chiếu, và mọi lệch đều có cảnh báo nhìn được.


#### Scenario: Lệch giữa 2 parser không bao giờ im lặng

- **WHEN** kết quả parser mới khác regex cũ trên cùng input
- **THEN** một `console.warn` ghi rõ input và điểm lệch, document dùng kết quả parser mới
