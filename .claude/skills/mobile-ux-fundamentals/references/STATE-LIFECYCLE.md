# Vòng đời trạng thái màn hình

> Nguồn: state-first design, NN/g (empty states), Carbon (loading pattern), thực hành ngành.

## 1. Máy trạng thái chuẩn

```
idle     -> FETCH -> loading
loading  -> SUCCESS(data rỗng)     -> empty
loading  -> SUCCESS(data)          -> success
loading  -> SUCCESS(data một phần) -> partial
loading  -> ERROR(mạng)            -> offline
loading  -> ERROR(server)          -> error
conflict (cộng tác)                 -> conflict
```

> Dùng **state machine / enum**, không dùng cờ boolean chồng chéo (`isLoading && !isError` rất dễ sai).

## 2. Từng trạng thái

| State | Phải có | Lỗi thường gặp |
|---|---|---|
| **Idle** | Hành động chính rõ ràng | Coi "form trống" là idle (nó là **empty**) |
| **Loading** | **Skeleton khớp layout thật**; hiện **sau ~200 ms**; trần **~5 s** rồi chuyển progress/timeout | Spinner giữa màn trắng; skeleton nhấp nháy khi mạng nhanh |
| **Empty** | Giải thích **vì sao trống** + **CTA** + (tuỳ) visual | "No data"; màn trắng |
| **Error** | **Cụ thể**, **hành động được**, **phục hồi được** (Retry) | "Đã xảy ra lỗi"; dead-end |
| **Partial** | Xử lý khi nhiều nguồn dữ liệu, một phần lỗi | Coi như success |
| **Offline** | Nội dung thay thế + đồng bộ lại sau | Spinner vô tận |
| **Success** | Xác nhận **không chỉ bằng màu** | Chỉ đổi màu xanh |
| **Conflict** | Giải quyết xung đột (cộng tác) | Ghi đè âm thầm |

## 3. Skeleton — quy tắc

- **Khớp layout cuối** (cùng grid, cùng cỡ ô, cùng số dòng ước lượng) ⇒ tránh layout shift.
- Hiện **sau 200 ms** — tránh nháy với phản hồi nhanh.
- **Trần ~5 s** — sau đó chuyển sang progress/timeout + retry.
- **Pulse/shimmer nhẹ**; không thêm spinner chồng lên skeleton (một tín hiệu là đủ).
- Giữ **ổn định** phần cố định (avatar, title); skeleton phần biến đổi (body, list).
- A11y: khối skeleton **`aria-hidden`**, container chuyển đổi **`aria-busy`**, có **live region** báo.

## 4. Empty state — anatomy & loại

```
Visual (tuỳ chọn) · Header (trạng thái) · Explainer (vì sao + lợi ích) · CTA
```

Luôn trả lời 3 câu: **đang xảy ra gì · vì sao · làm gì tiếp**.

| Loại | Ngữ cảnh | Thiết kế |
|---|---|---|
| **First-time (pending user action)** | Người dùng chưa tạo gì | Giới thiệu mục này là gì, lợi ích, CTA tạo mục đầu tiên |
| **No results** | Tìm/lọc không ra | Gợi ý nới filter, sửa từ khoá |
| **Cleared** | Người dùng xoá hết | Xác nhận + CTA/hoàn tác nếu cần |
| **Gated / paywall** | Cần nâng cấp/quyền | Nêu giá trị + đường nâng cấp |

> Empty state là **onboarding miễn phí** — first-time user gặp nó trước mọi màn khác.

## 5. Error state — quy tắc

- **Cụ thể** thắng chung chung; **hành động được** thắng dead-end; **phục hồi được** thắng fatal.
- Field-level: chỉ rõ trường nào, sai gì, sửa thế nào; giữ dữ liệu người dùng đã nhập.
- Page-level: giữ **navigation**, có **Retry**, có đường liên hệ/trợ giúp.
- Không hiển thị mã lỗi trần trụi; ghi log kỹ thuật ra monitoring.
- Thông báo qua screen reader (live region).

## 6. Ưu tiên thiết kế

> **Thiết kế "unhappy path" trước** (loading/empty/error) ⇒ happy path sẽ chuẩn hơn, vì các trạng thái
> này đặt ra ràng buộc thật cho layout và copy.

## 7. Checklist

- [ ] Có đủ **idle · loading · empty · error** (+ partial/offline/conflict nếu cần).
- [ ] Skeleton khớp layout, hiện sau 200 ms, không gây shift.
- [ ] Empty giải thích + CTA; là onboarding.
- [ ] Error cụ thể + phục hồi được; không dead-end; giữ dữ liệu đã nhập.
- [ ] Offline có nội dung thay thế.
- [ ] Dùng state machine, không dùng boolean chồng chéo.
- [ ] Trạng thái công bố được cho screen reader.
