# Cách thể hiện (presentation surfaces)

> Nguồn: NN/g (bottom sheet), Material (sheets/snackbars/dialogs), thực hành ngành.

## 1. Bảng chọn bề mặt

| Bề mặt | Chặn tương tác? | Dùng khi | Không dùng khi |
|---|---|---|---|
| **Dialog / Alert** | **Có** | Cần **quyết định** để tiếp tục; thông tin quan trọng cao | Thông tin thường; lạm dụng |
| **Bottom sheet (modal)** | Có | Tác vụ ngữ cảnh, **3+ hành động** không cần giải thích; thay inline menu trên mobile | Luồng dài; stack nhiều sheet |
| **Bottom sheet (standard)** | Không | Chi tiết/điều khiển **bổ trợ**, vẫn thấy nội dung chính | Nội dung cần toàn màn |
| **Snackbar** | Không | **Phản hồi nhẹ** sau hành động; **0–1 action** | Nhiều action; là cách **duy nhất** tới use case chính |
| **Toast** | Không | Thông báo hệ thống, ngắn, **không action**, không vuốt tắt | Cần action |
| **Banner** | Không (thường) | Trạng thái **bền** (offline/mất mạng/lỗi toàn cục) | Thông báo thoáng qua |
| **Inline** | Không | Lỗi field, trạng thái trong ngữ cảnh | Thông tin toàn cục |

## 2. Bottom sheet — quy tắc NN/g

- **Cho phép Back để đóng** (người dùng tưởng là trang thường).
- **Luôn có nút Close** rõ ràng.
- **Không xếp chồng** sheet (người dùng không hiểu Back vs X của stack).
- Chỉ cho **tương tác ngắn**; không biến sheet thành luồng nhiều bước.
- Giữ **thấy nội dung nền liên quan** — đó là lợi thế của sheet.
- **Không** dùng lý do "dễ với tay" (hiểu nhầm phổ biến về reachability).
- Khi sheet mở rộng toàn màn: thêm **dismiss button ở header** (trái) và vẫn hỗ trợ kéo xuống.
- Sheet mở rộng có thể **che bottom nav/FAB** ⇒ cân nhắc thứ tự lớp.

## 3. Dialog — quy tắc

- Chỉ cho **thông tin/quyết định quan trọng** vì nó **chặn** người dùng.
- **≤ 2 nút**; nút huỷ rõ; nút phá huỷ phân biệt bằng màu **và** vị trí.
- Focus vào nút mặc định an toàn; đọc đủ title + message; trả focus khi đóng.
- Không dùng dialog cho thông tin thường (gây "alert fatigue").

## 4. Snackbar / toast — quy tắc Material

- Đặt **đáy** màn; **không che** target/navigation/FAB (đẩy FAB lên).
- Mobile: tối đa **2 dòng**; desktop/tablet: **1 dòng**.
- **Không dùng icon**; **không** là cách duy nhất tới use case cốt lõi; **không** stack.
- Có action thì theo spacing/affordance của dialog; **≥ 2 action ⇒ dialog**.
- Tự biến mất; cho vuốt tắt (riêng toast thì không tắt được).

## 5. Quy tắc chung

- **Một bề mặt một lúc**; không mở chồng lớp.
- Bề mặt chặn phải có **lối thoát rõ** (Close/Back/Cancel).
- Nội dung dài ⇒ **màn hình riêng**, không nhét vào sheet/dialog.
- Trạng thái bền (offline/lỗi) ⇒ **banner/inline**, không dùng snackbar biến mất.
- Luôn giữ **ngữ cảnh**: người dùng phải biết mình đang ở đâu sau khi đóng.

## 6. Checklist

- [ ] Cần **chặn** để lấy quyết định? → dialog/alert.
- [ ] Tác vụ **ngắn** + cần thấy nền? → bottom sheet có Close + Back.
- [ ] Chỉ **phản hồi thoáng qua**? → snackbar ≤ 1 action.
- [ ] Trạng thái **bền**? → banner/inline.
- [ ] Không stack; không lạm dụng dialog; không chôn use case chính vào snackbar.
- [ ] Focus/đọc được; có lối thoát; ngữ cảnh được giữ.
