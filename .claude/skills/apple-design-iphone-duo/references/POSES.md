# Poses & Size Classes — iPhone Duo

> Đúc kết từ HIG *Designing for iPhone Duo* + Tech Talks *Design for iPhone Duo*,
> *Prepare your app for iPhone Duo*, *Strike a pose with adaptive layouts*.
> Ảnh: `assets/poses.png`, `assets/vertical-bars-layout.png`, `assets/splitview-open.png`, `assets/splitview-folded.png`.

## 1. Sáu tư thế (đọc từ `assets/poses.png`)

| # | Pose | Màn hình | Đặc điểm thị giác | Chiến lược |
|---|---|---|---|---|
| 1 | **Closed** (gập) | Outer | Rộng–thấp hơn iPhone thường; camera góc trên | Compact width; tác vụ nhanh, một tay |
| 2 | **Tent / standing** (dựng trên cạnh) | Outer+Inner | Dựng đứng, không cầm tay | Nội dung nhìn từ xa ở vùng trên; điều khiển ở vùng dưới |
| 3 | **Open landscape** | Inner | Slab rộng, ngang | 2 cột, media, đa nhiệm |
| 4 | **Partially folded (book)** | Inner | Màn cong qua tâm (nếp gập) chia 2 vùng | Displacement: tránh vùng gập; phần tử tương tác dạt ra hai bên |
| 5 | **Open portrait** | Inner | Cao; thanh ngang quay trở lại | Layout iPhone quen thuộc, nội dung nhiều tầng hơn |
| 6 | **Propped on edges** | Inner/Outer | Tựa nghiêng | Media trên, điều khiển trên nền ổn định |

## 2. Size class theo pose (từ Tech Talk *Prepare your app*)

| Vị trí | Portrait | Landscape | Ghi chú |
|---|---|---|---|
| **Outer** | compact **H** + regular **V** | compact H + compact **V** | Giống iPhone thường |
| **Inner** | regular H + regular V | regular H + regular V | Đủ chỗ cho sidebar |

Quy tắc bắt buộc:
- **Màn hình trong KHÔNG tôn trọng `supportedInterfaceOrientations`** — đừng kiểm tra orientation để quyết định layout, hãy dùng **size class**.
- **Không tham chiếu "main screen"** trong code (mơ hồ, sẽ bị deprecate trên thiết bị 2 màn hình). Dùng environment / trait collection / scene bounds.
- Trên màn trong, app **scale** kể cả trong Split View multitasking; `UIRequiresFullScreen` vẫn được tôn trọng nhưng app **vẫn resize** khi mở/gập.

## 3. Chỉ hai layout cần thiết kế

> "A compact width layout for the outer display and a regular width layout for the inner display
> give you the fundamentals for every pose."

- **Không** thiết kế layout riêng cho từng pose.
- **Không** dùng fixed width, breakpoint, hay số đo gắn với một màn hình cụ thể.
- Dùng **layout margins + safe area insets** (kể cả insets ngang) → offset tránh control tự động.
- Nếu app đã "freely resizable" (như trên iPad / iPhone Mirroring) thì gần như đã sẵn sàng.

## 4. Bố cục theo pose — quy tắc thực chiến

### Closed (outer)
- Thanh điều khiển **dồn về cạnh phải (trailing)**: Dynamic Island → status bar → toolbar → tab bar, từ trên xuống (`assets/vertical-bars-layout.png`).
- Vùng nội dung bên trái rộng tương đương iPhone thường ⇒ giữ nguyên trải nghiệm iPhone.
- Sheet: nút có thể xếp **dọc**; có thể **tắt thanh dọc** cho sheet 1 nút (sheet dừng ngay trước camera, status bar tự dịch).

### Inner — landscape
- Thanh dọc giữ nguyên **cùng cạnh** với outer ⇒ liền mạch khi mở.
- Split view: cột mở rộng; Notes điều chỉnh bề rộng mỗi pane để cả hai vẫn thấy rõ (`assets/splitview-open.png`).
- 2 app multitasking: mỗi app đặt control ở **mép ngoài của nó** (app bên trái → control bên trái).

### Inner — portrait
- **Ngoại lệ:** đủ không gian dọc ⇒ thanh **ngang** quay lại như iPhone quen thuộc.
- Sheet dùng thanh ngang chuẩn (cả landscape lẫn portrait).

### Partially folded (book)
- Màn cong chia inner thành 2 vùng dùng được; **nếp gập là đường phân chia tự nhiên**.
- Chữ/ảnh **dịch ra khỏi tâm**; phần tử tương tác dạt ra hai bên (dễ chạm).
- **Nội dung cuộn không cần tránh nếp gập** (bản thân cuộn đã xử lý liên tục).
- Split view: hệ thống chỉnh bề rộng 2 cột về **50/50** để cả hai rõ ràng (`assets/splitview-folded.png`).
- Grid: giữ lề ngoài, **tăng khoảng cách quanh nếp gập** ⇒ mỗi ô nằm gọn trong vùng của nó.
- Sheet/alert/menu/button tự **né nếp gập** (system components).

### Propped / tent
- Vùng **trên** = nội dung nhìn từ xa (media, trạng thái).
- Vùng **dưới** = điều khiển tương tác (bề mặt chạm ổn định).
- Layout "table-top" là **tuỳ chọn**; nếu làm, phải giữ **cùng control + cùng hierarchy** như các pose khác.

## 5. Checklist pose

- [ ] Chạy thử 6 pose trong Device Hub (open/close/rotate/fold).
- [ ] Không có fixed width / screen reference / orientation check.
- [ ] State + chức năng giữ nguyên khi đổi pose.
- [ ] Dynamic Type lớn: bố cục tái cấu trúc, không cắt chữ.
- [ ] Safe area & layout margin **bất đối xứng** được xử lý từng cạnh riêng.
- [ ] Pane/split điều chỉnh quanh nếp gập; grid dùng số cột chẵn.
