# Spec Delta — chrome-test-env

## Purpose

Test chrome-resolution của exporter phải cho kết quả đúng trên mọi máy (có/không pinned Chromium) mà không làm yếu khóa version dùng cho CI.

## ADDED Requirements

### Requirement: Thiếu pinned binary thì skip, không fail

Test phụ thuộc file nhị phân trong ms-playwright cache SHALL skip có log khi binary vắng mặt, thay vì fail.

#### Scenario: Máy dev chỉ có Chrome hệ thống

- **WHEN** `playwrightChromiumPath()` trả về null (cache không có đúng `PLAYWRIGHT_CHROMIUM_VERSION`) và chạy `npm test`
- **THEN** test `treats the Playwright cache binary...` skip có log `skip: no pinned Chromium in cache`, suite còn lại vẫn chạy và pass

#### Scenario: CI có pinned binary thì test chạy thật

- **WHEN** cache có đúng binary của `PLAYWRIGHT_CHROMIUM_VERSION` và chạy `npm test`
- **THEN** test chạy đầy đủ: `resolveChrome()` với `$CHROME_PATH` trỏ pinned binary trả về `{ source: 'env' }`

### Requirement: Khóa version vẫn enforce bằng hằng số

Version Chromium pinned cho CI SHALL được khóa bằng assertion trên hằng số, độc lập với việc binary có tồn tại trên máy chạy test hay không.

#### Scenario: Ai đó đổi version không báo

- **WHEN** `PLAYWRIGHT_CHROMIUM_VERSION` bị đổi khỏi giá trị đã chốt mà không cập nhật CI
- **THEN** test `pins one Playwright Chromium version for CI` fail trên mọi máy (kể cả máy không có cache), báo lệch version ngay
