# Spec Delta — single-source-regions

## Purpose

Mọi con số region (44/68/16/rail/split) chỉ sống ở một nơi; docs còn lại link về, và vi phạm bị lint bắt thay vì靠 đọc.

## ADDED Requirements

### Requirement: screen-regions là nguồn số duy nhất
Con số region chỉ sống ở `openspec/specs/screen-regions/`.


#### Scenario: Đổi một band chỉ sửa một chỗ

- **WHEN** một số region thay đổi (ví dụ touch floor)
- **THEN** chỉ `openspec/specs/screen-regions/` cần sửa; README/SKILL/recipes không chứa số copy nào

### Requirement: Số trần trong docs bị lint chặn
Docs nào chứa số trần thay vì link đều fail lint.


#### Scenario: Ai đó paste số vào md

- **WHEN** `README.md`, `SKILL.md` hoặc `recipes/*.md` chứa số region trần thay vì link về spec
- **THEN** `npm run lint` (tier `region-docs-lint`) fail và chỉ đúng file:dòng cần sửa thành link
