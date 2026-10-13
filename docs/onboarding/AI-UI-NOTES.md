# Ghi chú cho AI dựng UI Onboarding

> Đọc file này trước khi dựng bất kỳ màn nào trong thư mục `docs/onboarding/`.

## Thứ tự làm việc

1. **Dựng UI trước, ảnh sau.** Ảnh hero chưa có — mọi vị trí ảnh dùng **placeholder xám** (quy cách bên dưới). Không tự tạo, tải hay vẽ ảnh minh hoạ thay thế.
2. Đọc theo thứ tự:
   - [design-direction.md](design-direction.md) — màu, chữ, khung màn, 7 mẫu màn dùng chung (T1–T7), chuyển động.
   - File kịch bản cần làm: [KB1](kb1-value-first-hard-paywall.md) · [KB3](kb3-showcase-social-proof-exit-offer.md) — nội dung, copy và mã ảnh của từng màn.
3. Dựng **7 mẫu màn T1–T7 thành component dùng chung trước**, sau đó ghép các kịch bản từ các mẫu đó. Không làm mỗi kịch bản một kiểu giao diện riêng.

## Quy cách placeholder ảnh

| Thuộc tính | Giá trị |
|---|---|
| Màu nền placeholder | `#D9D9D9` trên màn sáng · `#2A3150` trên màn tối (Paywall, Exit Offer) |
| Bo góc | 24pt |
| Kích thước / tỉ lệ | **Đúng như ảnh thật**: 1:1 cho hero; chiều rộng = màn hình − 2×24pt; chiều cao không vượt ~50–55% màn (T1), ~40% (T3), ~25–30% (T5) — xem design-direction mục 4–5 |
| Nội dung bên trong | Icon `photo` (SF Symbol) màu `#A1A1A1` ở giữa + **mã ảnh** bên dưới, cỡ 12pt monospace (ví dụ `ob_hero_mirror_tv_web`) |

**Cách thay ảnh sau này phải không cần sửa code:**
- Tạo một view dùng chung (ví dụ `OnboardHeroImageView(imageName:)`) nhận **mã ảnh** làm tên asset.
- Nếu `UIImage(named: mãẢnh)` có ảnh → hiển thị ảnh (`scaleAspectFit`), ẩn placeholder.
- Nếu chưa có → hiển thị placeholder xám như bảng trên.
- Khi designer bỏ ảnh vào `Assets.xcassets/Onboarding/<mã ảnh>.imageset`, ảnh tự hiện.
- Mã ảnh nằm trong mục **"Prompt ảnh hero"** của từng file kịch bản và bảng mục 9 của design-direction.

Các vị trí **không** dùng placeholder (vẽ bằng code hoặc UI thật): radar quét thiết bị, thanh % hiệu chỉnh, đồng hồ đếm ngược, danh sách thiết bị, playground cast ảnh. Logo hãng TV (KB3-M4) tạm hiển thị **tên hãng dạng chữ** trên thẻ.

## Quy tắc khi dựng

- **Không đưa chữ vào ảnh.** Toàn bộ chữ là label của app, thêm key vào `Localizable.strings` (bản `en` là bắt buộc; các ngôn ngữ khác để tiếng Anh tạm, đánh dấu `TODO: translate`).
- **Không có nút Skip** ở màn sáng; dùng thanh tiến trình 4pt ở trên cùng. Nút [X] chỉ có trên Soft Paywall (KB3-M8) và Exit Offer.
- **Màu chỉ lấy từ bảng mục 2 của design-direction.** Dùng các màu có sẵn trong `Assets.xcassets/Colors` (`blue500`, `blue100`, `blue50`, `backgound`) khi trùng; màu mới (dark, gold, urgency) thêm thành colorset mới, không hard-code hex rải rác.
- **Giá gói:** không hard-code. Lấy từ product của StoreKit/IAP framework; khi chưa có thì hiển thị chuỗi giả `$—.——` và để `TODO: price`. Các giá trong file kịch bản đang bị lỗi/chưa chốt.
- **Paywall nào cũng phải có:** Restore Purchases, Terms of Use, Privacy Policy, và giá tổng hiển thị to ngang giá quy đổi (Guideline 3.1.2).
- **Số liệu social proof** (5M users, 4.8★, 140,000 đánh giá, tên người review): để thành hằng số/remote config, không dán cứng trong view — số liệu chưa được kiểm chứng.
- Hỗ trợ màn nhỏ (iPhone SE): nội dung cuộn được nếu không vừa, nút CTA luôn dính đáy.
- Mỗi màn gắn tên class rõ ràng (hệ thống analytics tự log `screen_go` theo tên class).

## Phạm vi giai đoạn này

- Làm: giao diện + điều hướng giữa các màn trong từng kịch bản, trạng thái chọn của quiz, đếm ngược, chuyển động cơ bản (mục 6 design-direction).
- Chưa làm: mua hàng thật, chia nhóm A/B từ remote config, gửi event analytics mới — để `TODO` tại chỗ cần nối.
