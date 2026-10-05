# Spec Delta — ci-chromium-goldens

## Purpose

Export và audit đo thật chạy được trên CI (Chromium pinned) mà không làm mất hành vi local (Chrome máy), và golden hết báo lệch giả do font/AA khác OS.

## ADDED Requirements

### Requirement: CI có Chromium pinned, local không đổi
Export và audit chạy được trên CI nhờ Chromium pinned, máy dev không đổi.


#### Scenario: Export trên máy không có Chrome vẫn chạy ở CI

- **WHEN** `npm run export` / `npm run audit:regions` chạy trên CI không có Chrome hệ thống
- **THEN** tool dùng Chromium pinned đã khai version, render cùng document (`composeScreenDoc` chung) và cùng ngưỡng đo; trên máy dev vẫn ưu tiên Chrome local/`$CHROME_PATH`

### Requirement: Golden perceptual theo OS
Golden không báo lệch giả do khác OS.


#### Scenario: Cùng commit không lệch golden giả

- **WHEN** cùng một commit render trên 2 OS (font/AA khác nhau)
- **THEN** badge golden (`khớp`/`lệch`/`chưa có`) dựa trên perceptual-hash + ngưỡng theo OS, không còn `lệch` vì vài pixel AA; sha256 byte-exact giữ lại cho so sánh local
