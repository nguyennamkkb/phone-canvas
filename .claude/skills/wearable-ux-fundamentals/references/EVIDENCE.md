# Bằng chứng & nguồn — wearable-ux-fundamentals

Truy cập 2026-09-25. Ghi chú đầy đủ: `research/03-watchos/notes/web-wearable-principles.md`,
`research/03-watchos/transcripts/` (12 bài giảng 2021–2026), `research/07-mobile-ux/notes/`.

## Nguyên tắc nền tảng
- **Wear OS — UX design principles for wearables:** *design for critical tasks* (1–2 tác vụ) ·
  *optimize for the wrist* (vài giây) · *better together* (chia vai watch/phone) · *always relevant* ·
  *works offline*. `developer.android.com/design/ui/wear/.../principles`
- **Wear OS — app principles:** focused · shallow & linear (≤ 2 tầng) · cuộn dọc ·
  hiện giờ ở đầu · entry point icon + label · primary action nổi · label định hướng · scrollbar.
- **Material 3 Expressive (Wear):** embrace round · motion/springs · shape morphing ·
  màu giàu (3 accent) · Roboto Flex.
- **Apple HIG — Designing for watchOS:** glanceable, single-screen; giảm độ sâu; Digital Crown cho
  cuộn; complication là điểm vào; notification để hành động không mở app; app hoạt động độc lập.

## Haptics & tương tác (Apple)
- HIG *Playing haptics*: đúng kiểu & đúng lúc; không lạm dụng.
- HIG *Always-On*: giữ nội dung chính, dim phần phụ, tránh thay đổi gây phân tán.
- HIG *Digital Crown* / *Action button*: nhãn ≤ 3 từ; luôn có touch thay thế.

## Kích thước & hiển thị
- Complication sizes (HIG): 42/44.5/47/50 pt (84/89/94/100 px @2x); 27/28.5/31/32 pt; 11/11.5 pt.
- Nhãn ≤ 3 từ; 2–3 control/hàng (HIG Layout).

## Liên quan
- Vùng chạm, ngưỡng phản hồi 0.1/1/10 s, a11y gesture: xem `mobile-ux-fundamentals`.
- Apple-specific (API, Smart Stack, RelevanceKit, sync): xem `apple-design-watch`.
