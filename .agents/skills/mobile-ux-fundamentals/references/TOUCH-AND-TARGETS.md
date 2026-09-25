# Vùng chạm (touch targets)

> Nguồn: WCAG 2.2 (W3C), Apple HIG, Material Design, nghiên cứu ergonomics của Steven Hoober.
> Bằng chứng chi tiết: [EVIDENCE.md](EVIDENCE.md).

## 1. Con số phải nhớ

| Chuẩn | Kích thước | Vai trò |
|---|---|---|
| **WCAG 2.5.8 Target Size (Minimum) — AA** | **24×24 CSS px** (hoặc đủ spacing) | **Sàn pháp lý** |
| **WCAG 2.5.5 Target Size (Enhanced) — AAA** | **44×44 CSS px** | Mục tiêu nâng cao |
| **Apple HIG** | **44×44 pt** | Kích thước nên build |
| **Material Design** | **48×48 dp** | Kích thước nên build |

> **Chốt:** 24 px = số không bao giờ được thấp hơn · 44 pt / 48 dp = số để build.

## 2. Vùng chạm ≠ glyph

- Hit area là **toàn bộ vùng bấm được**, không phải hình nhìn thấy.
- Icon 16 px vẫn đạt nếu **mở rộng hit area bằng padding**:
  - Web: `min-width/min-height: 44px` + `padding` (không thu nhỏ target).
  - iOS: `.contentShape(Rectangle())` + padding cho custom shape.
  - Android: `TouchDelegate` hoặc `minWidth/minHeight = 48dp`.

## 3. Khoảng cách khi target nhỏ

- WCAG 2.5.8 cho phép target < 24 px **nếu** vòng tròn 24 px quanh tâm **không chạm** target khác.
- Vòng 24 px phải nằm **trọn trong** target (hình tròn 24 px không lọt được vào hình vuông 24 px ⇒
  target tròn cần lớn hơn một chút, hoặc phải có đủ spacing).
- **Toolbar/action dày** là chỗ fail phổ biến nhất.

## 4. Kích thước theo vị trí màn hình (Hoober)

| Vị trí | Tối thiểu | Lý do |
|---|---|---|
| Mép **trên** | ~**11 mm** (31 pt / 42 px) | Ngón cái khó với tới, góc tiếp cận xấu |
| **Giữa** | ~**7 mm** (20 pt / 27 px) | Vùng chính xác nhất |
| **Đáy** | ~**12 mm** (34 pt / 46 px) | Ngón cái tiếp cận ở **góc phẳng hơn** ⇒ cần vùng lớn hơn |

⇒ Đặt **hành động chính ở đáy** là vừa ergonomics vừa cho phép... nhưng đừng vì thế mà thu nhỏ target đáy.

## 5. Quy tắc thực chiến

1. Mọi control ≥ **44×44 pt / 48×48 dp**; sàn tuyệt đối **24×24**.
2. Không bao giờ giảm target để "đẹp"; **tăng hit area bằng padding**.
3. Control sát nhau: chừa khoảng cách để vòng 24 px không chồng.
4. Control ở mép trên/giữa: **tăng kích thước** so với mức tối thiểu.
5. Kiểm bằng: DevTools bounding box · **tap thử bằng ngón cái một tay** · axe/Lighthouse.
6. Người lớn tuổi / người hạn chế vận động hưởng lợi **không cân xứng** từ target lớn.

## 6. Checklist

- [ ] Mọi target ≥ 24 px (mục tiêu 44/48).
- [ ] Icon nhỏ → padding/`contentShape`, không thu nhỏ.
- [ ] Vòng 24 px giữa các target không chồng.
- [ ] Control mép trên/giữa/đáy đạt ngưỡng theo vị trí.
- [ ] Test một tay (trái + phải) trên máy thật.
