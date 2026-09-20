# Tasks

## 1. Toolbar gọn + fit-view (spec: board-toolbar, board-fitview)

- [x] 1.1 Gom toolbar thành 4 nhóm (điều hướng, xem, thêm, panel), `Vừa khung` + toggle panel thành icon-button có tooltip tiếng Việt, verify mở board ở 1440px không còn chữ nào bị cắt (so screenshot trước/sau)
- [x] 1.2 Fit lần đầu + nút fit chỉ tính phone nodes (`fitView({ nodes })`), refit debounce sau khi `sizes` ổn định, verify 7 màn mood-core mở lên chiếm đa số viewport thay vì dải thumbnail
- [x] 1.3 Controls React Flow tiếng Việt (tooltips phóng to/thu nhỏ/vừa khung), verify hover không còn chữ tiếng Anh

## 2. Token-dock (spec: token-dock)

- [x] 2.1 Dựng dock trái collapsible tái dùng `token-table/` (ColorRow/SizeCell/DraftActions), xóa `type: 'token'` khỏi canvas + minimap + fit, verify sửa token/preview/Copy CSS/undefined-vars như cũ
- [x] 2.2 Board cũ có token node mở không lỗi (lọc im lặng, giữ nguyên vị trí phone), dock hiện tokens thay thế, verify bằng board đã lưu từ bản trước

## 3. Đo không cần đổi mode + focus-mode (spec: measure-without-mode, focus-mode)

- [x] 3.1 Click-through đo ở move mode: click element trong node chọn spec + highlight, click chrome/drag vẫn chọn/di chuyển node, verify không cần bật Đo đạc mà drag node vẫn nguyên
- [x] 3.2 Hint-bar trong `.board-wrap` cho measure/focus mode + Esc về move/fit, cursor gợi ý trên node, verify bar hiện đúng mode và Esc thoát đúng thứ tự (focus → measure → move)
- [x] 3.3 Focus-mode: double-click label zoom 100% giữa màn, `←/→` chuyển màn theo thứ tự x + inspector bám theo, Esc về fit, verify đi hết 7 màn bằng phím không lạc

## 4. Panel tự dẫn dắt (spec: panel-guidance)

- [x] 4.1 Empty-state 2 dòng + nút CTA (focus màn đầu), Copy JSON disabled nêu rõ lý do (đang đọc DOM / retry sau timeout), verify user mới biết phải làm gì trong 5 giây
- [x] 4.2 Ô lọc cây element theo role/label/size + giữ selection khi xóa lọc, verify gõ "Text" trên màn 60+ dòng chỉ còn dòng khớp kèm count

## 5. Chrome đồng bộ (spec: board-chrome-sync)

- [x] 5.1 Dark mode phủ app chrome (toolbar/panel/dashboard/dock) qua `data-theme` + token sẵn có, verify số đo trong iframe không đổi và không còn hex cứng trong `src/styles/*.css`
- [x] 5.2 Một pattern xóa: component `InlineConfirm` dùng chung node × và panel, bỏ `window.confirm`, verify cả 2 đường hỏi/xác nhận/hoàn-tác-nhanh giống hệt nhau
- [x] 5.3 Dropdown thêm-màn mặc định màn của project, opt-in mới thấy tất cả 18 màn; nút chép link board cạnh tên project có feedback "Đã chép", verify add không lạc project và mở link tab mới ra đúng board

## 6. Nghiệm thu

- [ ] 6.1 `npm run gate` xanh + `npm run build` pass, export 1 màn đúng PNG, đi hết checklist tay trên 1440px và 390px: mở board (to rõ) → click đo không đổi mode → double-click + phím duyệt màn → sửa token ở dock → xóa inline → chép link mở tab mới → dark mode cả app, verify không còn mục đỏ
