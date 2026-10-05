# Spec Delta — token-layers

## Purpose

Chẻ `tokens.css` god-file thành 3 lớp có thứ tự load xác định, và biến 2 quy ước miệng (dùng token thay literal, dark-mode phải có twin) thành lỗi lint.

## ADDED Requirements

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

### Requirement: Token light thiếu dark-twin báo lỗi
Mọi token light đều phải có dark twin, trừ allowlist.

#### Scenario: Project token không có dark twin


- **WHEN** `project/<id>/tokens.css` khai một token light mà không có twin trong khối dark (trừ allowlist)
- **THEN** lint báo lỗi nêu tên token; màn dark không còn rơi về màu light âm thầm
