# Bằng chứng & nguồn — tablet-ux-fundamentals

Truy cập 2026-09-25; ghi chú đầy đủ: `research/02-ipad/notes/web-tablet-adaptive.md`, `research/07-mobile-ux/notes/`.

## Adaptive layout
- **Material 3 — Adaptive design / canonical layouts:** breakpoints Compact 0–599 · Medium 600–839 ·
  Expanded 840–1199 · Large 1200–1599 · XL 1600+; pane (fixed/flexible/floating/semi-permanent);
  adaptive strategies *show & hide / levitate / reflow*; co-planar / floating / docked.
- **Material — List-detail:** 1 pane (compact) → 2 pane (medium/expanded); giữ selection & scroll khi đổi.
- **Material — Supporting pane:** chính ~⅔; phụ dưới (compact/medium, có thể bottom sheet) hoặc bên cạnh
  (expanded, rộng ~360 dp).
- **Android navigation:** bar (compact) → rail (medium+) → drawer; rail tốt cho reachability.

## Apple iPadOS
- **WWDC25 208 — Elevate the design of your iPad app:** windowing mới, window controls ở leading edge,
  toolbar wrap window controls; additive windows (mỗi document một cửa sổ) + tên cửa sổ; pointer mới
  1:1, không magnetize, highlight liquid-glass; **menu bar** riêng cho mỗi app (sắp theo tần suất,
  **không ẩn item**).
- **WWDC25 282 — Make your UIKit app more flexible:** scene life cycle (bắt buộc sau iOS 26);
  UISplitViewController (resize cột, min/max/preferred, inspector); UITabBarController (tab↔sidebar);
  `UISceneSizeRestrictions`; safe area bất đối xứng; `isInteractivelyResizing`;
  `UIRequiresFullscreen` deprecated; bỏ scale/letterbox với SDK 26.
- **WWDC24 10147 — tab & sidebar:** tab bar trên cùng (iPadOS 18+), tab↔sidebar morph, search pinned,
  tuỳ biến (fixed/customizable/pinned), icon outline/filled.

## A11y & ergonomics
- **WCAG 2.2:** 2.5.8 target ≥ 24×24 px; 2.5.5 ≥ 44×44; 2.5.1/2.5.7 gesture/drag alternatives
  (xem `mobile-ux-fundamentals`).
- **Hoober:** người dùng chính xác hơn ở giữa màn hình; góc/cạnh họ chậm lại.
