# Cử chỉ & khả năng tiếp cận

> Nguồn: WCAG 2.2 — SC 2.5.1 Pointer Gestures, SC 2.5.7 Dragging Movements, SC 2.5.2 Pointer Cancellation.

## 1. WCAG 2.5.1 Pointer Gestures (Level A)

- Mọi chức năng dùng **multipoint** (2+ ngón) hoặc **path-based** (đường đi quan trọng: vuốt thẳng,
  vẽ hình) phải có **alternative một pointer, không path** — trừ khi cử chỉ là **essential**.
- **Path-based** = hướng/đường đi quan trọng. **Dragging** (chỉ quan tâm điểm đầu/cuối) thuộc 2.5.7.
- **WCAG 2.2 bổ sung:** alternative của 2.5.1 **không được** chỉ dựa vào **dragging** (sẽ fail 2.5.7).

## 2. WCAG 2.5.7 Dragging Movements (Level AA)

- Mọi chức năng cần **kéo** phải làm được bằng **một pointer không kéo** (tap/click), trừ khi kéo là essential.
- Alternative hợp lệ:
  - **Nút mũi tên** lên/xuống để sắp xếp từng bước.
  - **Menu "Move to…"** chọn đích.
  - Chọn nhiều item + hành động theo lô.
  - Trường nhập số thay cho slider.
- **Không** dùng swipe/flick làm alternative (vi phạm 2.5.1).

## 3. SC 2.5.2 Pointer Cancellation

- Hành động nên kích hoạt khi **nhả** (không phải khi nhấn) ⇒ cho phép kéo ra ngoài để huỷ.
- Cho **undo** khi hành động đã xảy ra.

## 4. Hệ quả thiết kế mobile

- Mọi cử chỉ (swipe, pinch, drag, long-press, xoay) cần **đường thay thế hiển thị**.
- Cử chỉ ẩn ⇒ **không khám phá được** + kém a11y ⇒ cần hint/onboarding hoặc nút tương đương.
- Slider: tap trên track hoặc nút +/-.
- Carousel: nút prev/next (không bắt buộc vuốt).
- Sắp xếp danh sách: chế độ "Edit" với nút di chuyển, không chỉ kéo-thả.
- **Keyboard/switch/voice** phải làm được chức năng tương đương; focus order logic.

## 5. Accessibility checklist (mobile)

- [ ] **Target size:** ≥ 24×24 px (AA), mục tiêu 44 pt / 48 dp; đủ spacing.
- [ ] **Gestures:** alternative single-pointer cho mọi gesture; drag có cách không-kéo.
- [ ] **Cancellation:** kích hoạt khi nhả; có undo.
- [ ] **Contrast:** text ≥ 4.5:1 (lớn ≥ 3:1); UI ≥ 3:1; không chỉ màu.
- [ ] **Screen reader:** label/value/role đầy đủ; thứ tự đọc = thị giác; state được công bố.
- [ ] **Text scaling / spacing:** hỗ trợ cỡ lớn nhất; không cắt chữ (SC 1.4.12).
- [ ] **Reflow:** dùng được ở 320 px không cần cuộn hai chiều (SC 1.4.10).
- [ ] **Orientation:** không khoá cứng một chiều nếu không cần (SC 1.3.4).
- [ ] **Motion:** tôn trọng Reduce Motion; không nhấp nháy.
- [ ] **Focus:** ring rõ; không trap; trả focus khi đóng modal.
