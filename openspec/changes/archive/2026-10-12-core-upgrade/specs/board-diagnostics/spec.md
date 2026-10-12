# board-diagnostics Specification

## Purpose

Định nghĩa chẩn đoán lỗi显式 cho board phone-canvas — node báo nguyên nhân
compose-failure và audit báo rõ khi thiếu Chrome — để không còn "trắng im lặng"
hay "xanh giả" trong vòng đo.

## ADDED Requirements

### Requirement: Node báo nguyên nhân compose-failure

Khi document của node compose lỗi, node SHALL hiện nguyên nhân (lỗi gì, file
nào, dòng nào) thay vì iframe trắng; panel đã có timeout 8s và dropped-counter
là symptom — spec này SHALL bổ sung root cause.

#### Scenario: Compose lỗi component_missing

- **WHEN** màn include `<!-- @component app-nav -->` không tồn tại trong project
- **THEN** node hiện khung lỗi显式 (tên lỗi + id component + file màn hình)
  thay vì "Screen not found" chung chung hoặc iframe trắng

### Requirement: Audit thiếu Chrome thì fail rõ

Khi `audit:regions` không tìm thấy Chrome, nó SHALL báo lỗi显式 (thiếu Chrome,
cách khắc phục) và exit non-zero; SHALL NOT `SKIPPED exit 0` im lặng như hiện tại.

#### Scenario: Chạy gate trên máy không Chrome

- **WHEN** chạy `npm run gate` mà không có Chrome/`$CHROME_PATH`/Playwright Chromium
- **THEN** audit báo `MISSING CHROME` + hướng sửa, gate đỏ; không có màn nào
  được "pass" khi chưa hề được đo
