# Spec Delta — tokens-define-site

## Purpose

`lint:tokens` SHALL phân biệt nơi định nghĩa token với nơi dùng giá trị cứng, để warn màu cứng chỉ bắn đúng chỗ cần sửa và không gây nhiễu trên màn tự khai token scope.

## ADDED Requirements

### Requirement: Definition-site được miễn warn màu cứng

Khai báo custom property (`--x: <màu>` trong `:root`, `[data-theme]`, hoặc `<style>` scope màn) SHALL không bị tính là "màu cứng", vì đó chính là nơi token được sinh ra.

#### Scenario: Màn tự khai palette scope

- **WHEN** chạy `npm run lint:tokens` trên `project/paywall-kit/screens/growpal-premium.html` (định nghĩa `--gp-paper: #fbf8ff`…)
- **THEN** không còn warn màu cứng cho các dòng `--gp-*: …`; tổng kết `0 lỗi, 0 cảnh báo`

### Requirement: Use-site vẫn bị warn như cũ

Giá trị màu cứng dùng trực tiếp trong property thường (ví dụ `color: #132150`) SHALL vẫn warn/error theo rule hiện tại.

#### Scenario: Màu cứng ở chỗ dùng

- **WHEN** một màn viết `color: #132150` thay vì `var(--gp-ink)`
- **THEN** `lint:tokens` vẫn báo (warn hoặc error theo rule hiện hành), không bị miễn vì change này
