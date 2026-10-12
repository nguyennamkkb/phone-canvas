# token-layers Specification

## Purpose
Chẻ `tokens.css` god-file thành 3 lớp có thứ tự load xác định, và biến 2 quy ước miệng (dùng token thay literal, dark-mode phải có twin) thành lỗi lint.

## Requirements

### Requirement: Tokens 3 lớp, thứ tự load cố định
Tokens tổ chức thành 3 lớp có thứ tự cascade cố định, render không đổi.

#### Scenario: Board và export thấy cùng một cascade

- **WHEN** một screen dùng token từ bất kỳ lớp nào (core spacing/region/type, palette, vocab)
- **THEN** board (`buildSrcDoc`) và export (đọc disk) áp dụng cùng thứ tự core → palette → vocab → project override, và màn render không đổi so với trước khi chẻ

### Requirement: Literal thay token bị chặn
Mọi giá trị có token tương đương mà dùng literal đều là lỗi lint.

#### Scenario: Giá trị cứng trong screen báo lỗi

- **WHEN** screen khai màu/spacing/radius/giá trị có token tương đương mà dùng literal
- **THEN** `lint:tokens` báo lỗi nêu file:dòng + token thay thế

### Requirement: Base tokens chung, dark override tối thiểu

Mỗi `project/<id>/tokens.css` SHALL có base tokens chung ở `:root`; khối
`:root[data-theme='dark']` SHALL chỉ override những token đổi màu ở dark, SHALL
NOT copy toàn bộ khối `:root`. `lint:tokens` SHALL đỏ khi phát hiện token dark
giống hệt base (copy-paste) hoặc token base thiếu mà dark có.

#### Scenario: Copy-paste nguyên khối dark

- **WHEN** `tokens.css` có khối dark trùng >90% số dòng với `:root` (như
  paywall-kit trước change này)
- **THEN** `lint:tokens` báo lỗi kèm danh sách token thừa, hướng sửa: xoá khỏi
  dark, giữ ở base

#### Scenario: Dark override hợp lệ

- **WHEN** khối dark chỉ override `--bg`, `--label` và các token màu đổi thật
- **THEN** lint xanh; board render dark đúng vì base + override cộng lại đủ bộ
