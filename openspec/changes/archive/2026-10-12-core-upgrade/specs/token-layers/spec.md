# token-layers Specification (delta)

## REMOVED Requirements

### Requirement: Token light thiếu dark-twin báo lỗi

## ADDED Requirements

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
