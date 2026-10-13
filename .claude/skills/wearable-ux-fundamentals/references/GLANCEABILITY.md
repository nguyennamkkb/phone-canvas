# Glanceability trên wearable

> Nguồn: Apple HIG *Designing for watchOS*, Wear OS *design principles*, Material 3 Expressive (watch).

## 1. Nguyên tắc nền

- **Apple:** ưu tiên tương tác **nhanh, glanceable, một màn**; giảm độ sâu điều hướng; dùng **Digital Crown**
  cho cuộn/chuyển màn; complication là điểm vào trên mặt đồng hồ; notification để hành động không mở app.
- **Wear OS:** *critical tasks* (1–2 tác vụ) · *optimize for the wrist* (vài giây) ·
  *better together* (chia vai watch/phone) · *always relevant* (giờ/địa điểm/hoạt động) · *works offline*.
- **M3 Expressive (watch):** *embrace round* (dùng toàn canvas), motion/springs, shape morphing,
  màu giàu (3 accent), variable font (Roboto Flex) cho màn tròn.

## 2. Đơn vị thiết kế

- Một **giá trị** hoặc **một trạng thái** trên mỗi surface.
- **Icon + số** là đơn vị cơ bản (vd. "AAPL 121.96"); stack text tối đa 2–3 dòng.
- Gauge: **closed** = tỉ lệ; **open + range** = khoảng (có nhãn min/max).

## 3. Quy tắc "vài giây"

- Nếu không hiểu trong **≤ 3 giây**, thiết kế sai.
- Không có chỗ cho: đoạn văn, bảng, nhiều cột, form.
- Chữ lớn/đậm cho thông tin chính; phụ tối thiểu 11 pt.

## 4. Offline & ngữ cảnh

- Nội dung phải **hữu ích khi không mạng** (đi tập, đi biển).
- Cập nhật theo **ngữ cảnh** (giờ, địa điểm, hoạt động) thay vì cố định.
- Trạng thái **stale/last connected** phải hiển thị khi dữ liệu có thể cũ.

## 5. Checklist glanceability

- [ ] 1 ý/surface; hiểu trong ≤ 3 giây.
- [ ] Chữ lớn, ít chữ; nhãn ≤ 3 từ.
- [ ] Gauge/đồ hoạ đúng loại dữ liệu; có nhãn khi cần.
- [ ] Tinted/dim vẫn đọc được; không chỉ màu.
- [ ] Offline có nội dung; có trạng thái stale.
- [ ] Nội dung theo ngữ cảnh (giờ/địa điểm/hoạt động).
