# Continuity, Multitasking, Scenes, Hinge & Camera — iPhone Duo

> Đúc kết từ Tech Talks *Leverage multiple displays and scenes*, *Build a great camera experience*,
> *Design for iPhone Duo*, *Prepare your app* + HIG.

## 1. Continuity — nguyên tắc số 1

**Một trải nghiệm duy nhất, tự adapt theo kích thước màn hình và pose.**

- Giữ **chức năng** và **state** giống nhau giữa hai màn hình.
- Giữ **information hierarchy**; chỉ **thêm một tầng** ở màn trong khi hợp lý.
  *Ví dụ Mail:* đóng → hoặc danh sách **hoặc** nội dung; mở → **cả hai cạnh nhau**.
- **Không gắn chức năng vào một pose** — người dùng mở/gập liên tục; trải nghiệm phải **dễ đoán và
  nhất quán** trong lẫn ngoài.
- App có thể **scale** trên màn trong (kể cả Split View multitasking).
- Trong PiP: video có thể **ghim lên đỉnh**; app hiện tại co theo chiều dọc; nếu gập một phần, video
  **mở rộng nửa màn** ⇒ app phải adapt **theo thời gian thực**.

## 2. Multitasking

- **Mọi app đều tham gia** multitasking; hai app có thể nằm **side-by-side 50/50**.
- Hai layout: **side-by-side** và **video + app**; app xử lý **giống nhau**.
- Nếu đã hỗ trợ resize trên iPad / iPhone Mirroring ⇒ đã sẵn sàng.
- **Control ở mép ngoài** của từng app (app trái → control trái).
- Kéo app bằng **home indicator** để tạo split view.

## 3. Multiple scenes (nhiều instance UI)

- iPhone Duo là **iPhone đầu tiên hỗ trợ nhiều instance UI của app**.
- Nếu app hỗ trợ trên iPad → **cũng sẽ hỗ trợ** trên Duo.
- **Khác biệt quan trọng:**
  - iPad: cửa sổ mới có thể tạo **bất cứ lúc nào**.
  - Duo: **outer display KHÔNG tạo được cửa sổ mới** — chỉ **inner** được phép.
- ⇒ **Xử lý lỗi khi yêu cầu scene mới**; dùng `UIWindowSceneActivationAction` (tự ẩn khi không khả dụng).

## 4. Scene accessories (nội dung trên nhiều màn hình cùng lúc)

- Cho phép app **ghép nội dung phụ** vào UI chính, hiển thị trên **màn hình khác**.
- Hệ thống **kiểm soát khả dụng động**: mặc định bật, có thể **tắt bất cứ lúc nào**.
- **Theo dõi thay đổi khả dụng** (observation tracking / `onAvailabilityChange`) để UI đồng bộ.
- **`CameraCaptureAccessory`** (mới cho app camera): ghép UI phụ trên **outer display** trong khi UI
  chính ở **inner**.
  - Khả dụng khi app **full screen trên inner** và có **camera session active**.
  - Đăng ký trên **cùng view** với camera UI ⇒ accessory **chỉ hiện khi camera view hiện**.
  - Ứng dụng: teleprompter, màn hình cho người được chụp, nhóm video call.

## 5. Hinge (bản lề)

- API: `onHingeChange` (SwiftUI) / `UIHingeInteraction` (UIKit).
- Trạng thái mức cao: **closed · partially open · fully open**, kèm **góc liên tục (continuous angle)**.
- `nil` khi thiết bị không có bản lề ⇒ **kiểm tra tồn tại** và **reset state** khi không đọc được.
- **Dùng cho tương tác/hiệu ứng** (vd. pitch-bend như whammy bar), **KHÔNG dùng cho layout** —
  layout dùng **arrangement + reserved region**.
- Dữ liệu quan sát **live** (theo thời gian thực).

## 6. Camera (hai camera trước)

| | Outer ultrawide | Inner ultrawide (under-display) |
|---|---|---|
| Vị trí | Mặt ngoài | Sau màn hình trong |
| Tối đa | **4K @ 120fps** | **1080p @ 60fps** |
| Depth | Chỉ khi truy cập **camera riêng lẻ** | Chỉ khi truy cập **camera riêng lẻ** |

- **Virtual Front Camera** (`AVCaptureDevice` mới): tự chuyển giữa camera ngoài/trong theo pose;
  **chỉ có tính năng chung** của cả hai ⇒ tối đa **1080p60**, **không depth**.
- Muốn full khả năng: dùng **device type riêng** cho từng camera, và **tự chuyển** khi mở/gập bằng
  **`AVCaptureDeviceDirectionCoordinator`**.
- **Direction coordinator:** tạo từ (UIView của app, device types cần theo dõi, change handler).
  - Nó cho biết camera nào **hướng về phía người dùng** ở từng màn hình.
  - **Main-actor safe**; trả về `AVCaptureDeviceDescriptor` (sendable) ⇒ **không gọi AVFoundation
    trực tiếp trong handler**; chuyển descriptor sang camera actor.
  - Mỗi **màn hình có coordinator riêng** (report theo view của nó).
  - Handler: **reconfigure session** sang camera đang hướng tới người dùng; cân nhắc **mirror preview**
    khi camera sau hướng tới người dùng (để giống selfie); cập nhật UI khi đổi camera.
- **Rotation coordinator:** đảm bảo preview/ảnh **luôn đúng chiều**; trên Duo nó cập nhật khi app
  **đổi màn hình**. Sau khi adopt → **tắt camera-sensor-orientation compensation** để tăng hiệu năng.
- **Preview polish:** khi dùng full field-of-view của camera sau trên inner, có **không gian thừa quanh
  preview** → có thể **offset** preview và nhóm control vào phần còn lại, hoặc cho preview **fill**
  toàn màn (`videoGravity`). Với camera trước ultrawide (cảm biến vuông) → `dynamicAspectRatio` để
  chọn tỉ lệ ngang trên inner và **fill** màn.

## 7. Checklist continuity/scenes

- [ ] Chức năng + state giữ nguyên khi mở/gập (không reset).
- [ ] Chỉ **thêm một tầng** hierarchy ở màn trong.
- [ ] Split View 2 bên: control ở mép ngoài; PiP ghim đỉnh → app co dọc.
- [ ] Xử lý lỗi scene mới; dùng `UIWindowSceneActivationAction`; chỉ tạo cửa sổ trên inner.
- [ ] Scene accessory: theo dõi khả dụng động; đăng ký đúng view.
- [ ] Hinge: chỉ dùng cho hiệu ứng; reset khi nil.
- [ ] Camera: chọn virtual vs individual device; direction + rotation coordinator; mirror đúng;
      test camera active/inactive (ảnh hưởng reserved region).
