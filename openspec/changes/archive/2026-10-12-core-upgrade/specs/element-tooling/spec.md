# element-tooling Specification

## Purpose

Định nghĩa tooling cấp element trong board phone-canvas — xuất PNG, thumbnail,
diff và golden cho đúng element đang chọn — để vòng đo khép kín mà không phải
đoán tọa độ tay qua CLI như `locate` hiện tại.

## ADDED Requirements

### Requirement: Xuất element đang chọn bằng một click

Panel SHALL có nút "Xuất element này" khi có selection; output SHALL gồm PNG
crop theo bounding box thật + pad và JSON spec (cùng shape với Copy JSON v1)
ghi ra file handoff, không chỉ clipboard.

#### Scenario: Xuất plan-card đang chọn

- **WHEN** người dùng chọn một element trên panel/board rồi bấm "Xuất element này"
- **THEN** hệ thống ghi 1 PNG (element box + pad, clamp vào document, đúng
  device scale) và 1 JSON (`selectedElement` + `ancestors` + `pngClip`) vào thư
  mục export; tên file dẫn xuất từ `data-asset`/class/id của element

#### Scenario: Không có selection

- **WHEN** chưa chọn element nào mà bấm nút
- **THEN** nút disabled kèm lý do显式, giống quy tắc `copyReason` hiện tại

### Requirement: Thumbnail live của selection

Panel SHALL hiện thumbnail của element đang chọn (crop nhỏ tự động theo box
thật), cập nhật mỗi khi selection đổi.

#### Scenario: Chọn element mới

- **WHEN** selection đổi sang element khác
- **THEN** thumbnail đổi theo trong cùng panel, không cần chạy lệnh ngoài

### Requirement: Golden cấp element cho component chốt

Component chốt của project SHALL có golden ở cấp element (hash crop + spec
JSON) để review before/after khi sửa CSS riêng; `lệch` SHALL mở được
side-by-side ngay trên board.

#### Scenario: Sửa CSS riêng của pw-card

- **WHEN** `pw-card` đổi style rồi chạy so sánh golden element
- **THEN** hệ thống báo `khớp`/`lệch` theo hash crop; `lệch` cho xem ảnh
  before/after của đúng element đó

## Ghi chú hiện trạng (không phải requirement)

Các grep đã verify: `thumbnail`/`toPng`/`html2canvas`/`pixelmatch`/`resemble`
không có trong `src/`; crop duy nhất là `locate` CLI; golden duy nhất là
screen-level `--golden`. Các requirement trên lấp đúng 4 lỗ đó, không vẽ lại
thứ đã có.
