# Adoption & Testing — iPhone Duo

> Đúc kết từ Tech Talk *Prepare your app for iPhone Duo* (+ *Design for*, *Strike a pose*).

## 1. Ba mức độ SDK (quyết định app trông thế nào)

| SDK | Trải nghiệm trên Duo |
|---|---|
| **Trước iOS 27** | App **vẫn chạy**. Khi đóng: dùng vùng bên trái status bar + camera. Khi mở: kích thước & tỉ lệ **quen thuộc**. |
| **iOS 27 SDK** | App **mở rộng sang trái** vùng status bar trên màn trong (nhờ đã hỗ trợ iPhone resizing). |
| **iOS 27.1 SDK** | **Full screen**: app tràn tới mép; **thanh điều hướng/toolbar xếp dọc dưới status bar** — trải nghiệm Duo đầy đủ. |

⇒ Muốn có thanh dọc + toàn bộ hành vi mới: **build bằng SDK 27.1**.

## 2. Thiết lập kiểm thử

1. Tải **Xcode 27.1**.
2. Chọn **iPhone Duo simulator**.
3. Chạy trong **Device Hub**.
4. Dùng **nút điều khiển ở đáy màn hình** để **open / close / rotate / fold**.
5. Dùng **App Resizability skill** (trước là modernization skill) — nay hỗ trợ **SwiftUI** và Duo —
   để rà soát best practice resize.

## 3. Quy tắc code (tránh "mùi" thiết kế sai)

| Nên | Không nên | Lý do |
|---|---|---|
| Size class (environment / trait collection) | Kiểm tra **interface orientation** | Màn trong **không** tôn trọng orientation |
| Environment / trait / scene bounds | Tham chiếu **main screen** | Mơ hồ trên thiết bị 2 màn hình; sẽ deprecate |
| Layout margins + safe area insets | **Fixed width**, breakpoint, số đo theo màn hình | App xuất hiện ở vô số kích thước |
| `ConcentricRectangle` / `UICornerConfiguration` | Tự tính bo góc | Hình dạng màn Duo mới; API iOS 26+ đã cập nhật |
| Bar chuẩn trong navigation container | Tự dựng `UIToolbar`/`UINavigationBar` rời | Bar rời **không được** xét khi chuyển trục |
| Background/artwork tràn ra ngoài safe area | Chỉ vẽ trong safe area | `ignoresSafeArea` (SwiftUI) / bounds (UIKit) |
| Xử lý **từng cạnh** riêng | Giả định inset hai bên bằng nhau | Safe area & margin trên Duo **bất đối xứng** |

## 4. Ma trận kiểm thử

| Trục kiểm thử | Các giá trị |
|---|---|
| Pose | closed · open portrait · open landscape · partially folded (book) · propped/tent |
| Màn hình | outer · inner |
| Orientation | portrait · landscape |
| Multitasking | full · split trái · split phải · PiP ghim đỉnh |
| Reserved regions | fold active/inactive · camera trong active/inactive |
| Ngôn ngữ | LTR · **RTL** (bar giữ nguyên cạnh vật lý) |
| Accessibility | Dynamic Type lớn nhất · Reduce Transparency · Reduce Motion |
| State | mở/gập **giữa phiên** (media, form, scroll, selection) |
| Multi-window | tạo scene trên **inner**; yêu cầu scene trên **outer** (phải fail êm) |
| Camera | virtual front camera · camera riêng · chuyển khi mở/gập · rotation |

## 5. Lỗi tích hợp thường gặp

| Lỗi | Vì sao sai |
|---|---|
| Không rebuild SDK 27.1 nhưng mong có thanh dọc | Hành vi mới gắn với SDK |
| Dùng `UIScreen.main` | Sẽ deprecate; sai khi app ở màn hình khác |
| Kiểm tra orientation để chọn layout | Inner không theo orientation |
| Tự dựng toolbar rời | Không được hệ thống chuyển trục |
| Giả định inset hai bên bằng nhau | Duo bất đối xứng (control một cạnh) |
| Yêu cầu scene mới trên outer | Outer **không** tạo được cửa sổ mới |
| Không reset state khi hinge nil | Gây giá trị "ma" khi không có hinge |

## 6. Checklist adoption

- [ ] Build bằng **SDK 27.1**; chạy Device Hub; thử **cả 6 pose**.
- [ ] Chạy **App Resizability skill**; sửa hết cảnh báo.
- [ ] Không còn `UIScreen.main`, orientation check, fixed width.
- [ ] Safe area/margin xử lý **từng cạnh**; background tràn hợp lệ.
- [ ] Bar nằm trong container chuẩn; kiểm tra nén toolbar/tab bar ở outer landscape.
- [ ] Kiểm ma trận mục 4 (tối thiểu: 6 pose × 2 orientation × 2 phía multitasking × RTL).
- [ ] Kiểm camera active/inactive và đổi màn hình.
