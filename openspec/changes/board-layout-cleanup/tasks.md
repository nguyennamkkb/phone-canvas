# Tasks

## 1. Toolbar compaction

 - [x] 1.1 Chia nút toolbar thành nhóm thiết yếu và nhóm phụ gộp vào trigger khi `board-wrap` hẹp (đo bằng ResizeObserver trên wrapper), verify bằng cách thu viewport tới ~1000px và xác nhận không còn chữ tràn ra ngoài toolbar
 - [x] 1.2 Thêm style thu gọn cho toolbar (trigger gọn, dropdown đầy đủ tiêu đề), verify bằng(UI): mọi nút phụ vẫn bấm được ở chế độ gọn và `npm run build` xanh

## 2. Token rail trái

 - [x] 2.1 Dời token table khỏi canvas thành rail trái của `board-wrap` (sibling của flow, không còn là node pan/zoom được), verify bằng cách mở board và xác nhận canvas không còn node token chiếm chỗ
 - [x] 2.2 Thêm trạng thái gọn/mở cho rail (mặc định gọn), lưu per-project vào localStorage, verify bằng cách thu gọn, tải lại board và xác nhận rail vẫn gọn, mở ra vẫn đủ biến tokens
 - [x] 2.3 Thêm coach-mark một lần cho người dùng cũ (vị trí bảng tokens mới), verify bằng cách mở board lần đầu sau update và xác nhận hint hiện đúng một lần

## 3. Inspector responsive

 - [x] 3.1 Nâng ngưỡng overlay của panel từ 900px lên ~1100px (tái dùng CSS overlay và nút đóng hiện có), verify bằng cách đặt viewport 1000px và xác nhận panel thành lớp phủ có nút đóng thay vì ăn 384px ngang
 - [x] 3.2 Đảm bảo đóng overlay không mất selection, verify bằng cách chọn một element, mở/đóng overlay và xác nhận selection còn nguyên

## 4. Hồi quy và nghiệm thu

 - [ ] 4.1 Chạy `npm run lint` và `npm test`, verify cả hai xanh — LINT XANH (2026-09-22); test 37/38, 1 fail có sẵn ở `src/tokens/tokens.test.ts` (tokenNameForColor --clay vs --label-2, file ngoài scope change này; đã chứng minh fail cả khi stash 6 file của change). Cần chủ repo quyết: sửa token order riêng hay để lại.
 - [x] 4.2 So sánh số đo một màn hình (spec panel + `npm run export`) trước/sau change, verify mọi khung hình và kích thước PNG giống hệt nhau
 - [x] 4.3 Mở board ở 3 viewport (rộng ≥1280, ~1100, hẹp <900) qua browser thật và chụp ảnh, verify không còn chữ đè nhau ở cả ba cỡ
