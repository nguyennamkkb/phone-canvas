# Bằng chứng & nguồn — widget-ux-fundamentals

Truy cập 2026-09-25. Ghi chú: `research/04-widget/notes/web-widget-glanceable.md`,
`research/04-widget/transcripts/` (5 bài giảng 2025–2026), `research/03-watchos/`.

## Apple
- **HIG Widgets / Live Activities / Controls / Snippets:** 1 ý; chữ ≥ 11 pt; margin 16 pt (min 11);
  tinted; placeholder; ẩn dữ liệu nhạy cảm.
- **WWDC25 278 — What's new in widgets:** interactive widgets, controls, Smart Stack trên watchOS,
  `widgetAccentedRenderingMode`, push updates.
- **WWDC25 334 — watchOS 26:** controls (Control Center/Smart Stack/Action button), widget cấu hình được,
  RelevanceKit, relevant widget, APNs push.
- **WWDC26 277 — WidgetKit foundations / 223 — Live Activities essentials** (nguồn API).
- **WWDC24 10098 — Design Live Activities for Apple Watch:** suggested widgets, interactive widgets,
  thiết kế Live Activity cho watch.
- Số liệu: Live Activity margin Lock Screen 14 pt; Dynamic Island bo 44 pt; custom view ≤ 400 pt;
  widget template 75–125%; budget mặt đồng hồ ~15–20 phút.

## Android / Material
- **Widgets on Android (design):** 1 use case chính; không cuộn; responsive theo kích thước;
  color token + dynamic color; light/dark; corner radius hệ thống; type scale 5 vai trò;
  widget picker quality.
- **App Widget Design Guidelines:** lưới ô; 1 ô ≈ 40 dp; n ô ≈ 70n−30 dp; `minWidth/minHeight` thận trọng;
  `minResize`; nine-patch/radius.
- **App widgets overview:** responsive + exact-size layouts; không gesture bị hạn chế; resize mode.

## Nguyên tắc chung
- Không truyền tải chỉ bằng màu; contrast theo WCAG (text 4.5:1, UI 3:1) — xem `mobile-ux-fundamentals`.
