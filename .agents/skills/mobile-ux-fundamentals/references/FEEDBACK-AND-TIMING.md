# Phản hồi & thời gian (feedback and timing)

> Nguồn: Nielsen (response time limits, từ Miller 1968), thực hành performance mobile.

## 1. Ba ngưỡng phản hồi

| Ngưỡng | Ý nghĩa tâm lý | Thiết kế tương ứng |
|---|---|---|
| **0.1 s** | Cảm giác **tức thời**, "trực tiếp thao tác" | Không cần chỉ báo — chỉ hiện kết quả (highlight, haptic, pressed state) |
| **1 s** | Giữ **dòng suy nghĩ** liền mạch; người dùng **nhận ra** trễ | Bắt đầu cần chỉ báo "đang xử lý" |
| **10 s** | Giữ **chú ý** vào tác vụ | Cần **progress xác định + cách huỷ**; quá 10 s người dùng chuyển việc |

## 2. Quy tắc áp dụng mobile

- **< 100 ms:** phản hồi ngay cho mọi tap (visual + haptic) — không để người dùng tự hỏi "đã nhận chưa".
- **100 ms – 1 s:** không cần spinner, nhưng nếu **có thể** vượt 1 s thì hiện chỉ báo.
- **> 1 s:** skeleton/spinner; **> 10 s:** progress xác định + huỷ + ước lượng.
- **Che khuất:** giữ phản hồi **tại chỗ** (inline) thay vì chặn toàn màn cho tác vụ nhỏ.
- **Nhất quán ngữ nghĩa:** cùng loại hành động ⇒ cùng loại phản hồi (rung/âm/hiển thị).

## 3. Tải & cảm nhận tốc độ

- **First load:** hiển thị nội dung tương tác đầu tiên **< 5 s** (mục tiêu dài hạn ~2 s, 3G máy tầm trung).
- **> 3 s** ⇒ rủi ro bỏ đi tăng mạnh (dữ liệu ngành ~40% bỏ ở > 3 s).
- **Ảo giác nhanh:** skeleton + progressive loading + hiển thị nội dung có sẵn trước.
- **Không quá nhanh:** thay đổi quá nhanh khiến người dùng bỏ lỡ ⇒ có animation ngắn hoặc trạng thái ổn định tối thiểu.

## 4. Animation & frame budget

- Ngân sách mỗi frame **16 ms** (60 fps); xử lý logic ~6 ms ⇒ ~**10 ms/frame** cho render.
- Chuyển tiếp UI **150–300 ms**; vào ease-out, ra ease-in.
- Mỗi chuyển động phải **có mục đích** (giải thích thay đổi trạng thái), không trang trí.
- Tôn trọng **Reduce Motion**.

## 5. Trạng thái của control khi chờ

- **Button loading:** giữ **label** + spinner; disable nhưng **không ẩn**; chống double-submit.
- Re-enable khi xong **hoặc** khi lỗi (để retry).
- Tác vụ dài: cho **huỷ**; nếu không huỷ được, giải thích vì sao.

## 6. Checklist

- [ ] Mọi tap có phản hồi **< 100 ms**.
- [ ] Thao tác > 1 s có chỉ báo; > 10 s có progress + huỷ.
- [ ] Không có màn trắng/spinner vô định cho việc biết trước thời lượng.
- [ ] Button loading giữ label; chống double-submit.
- [ ] Animation 150–300 ms, có mục đích; 60 fps.
- [ ] Tôn trọng Reduce Motion.
