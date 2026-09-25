# Bằng chứng & nguồn — foldable-ux-fundamentals

Truy cập 2026-09-25. Ghi chú: `research/05-iphone-duo/notes/web-foldable-postures.md`,
`research/05-iphone-duo/transcripts/` (6 Tech Talks 2026), `research/02-ipad/`.

## Android
- **Learn about foldables (Android):** posture *flat / folded / tabletop / book / cover*; half-opened ⇒
  tabletop (gập ngang) hoặc book (gập dọc); **continuity** (giữ text, bàn phím, scroll, media);
  hai layout **bổ trợ**; multitasking (split-screen, desktop windowing).
- **Postures and orientation (Android):** tabletop ⇒ media/controls riêng; **tránh hinge**;
  cover ⇒ edge-to-edge, tránh cutout; không khoá portrait.
- **Adaptive app quality — foldables:** `Foldables_Postures` (tabletop/book), `Foldables_Camera`
  (preview folded/unfolded, front/back), `Foldables_Multitasking_Scenarios` (PiP, attachments),
  `Foldables_Multi-Instance`.
- **Tablet & large screen support:** app có thể stop/restart khi đổi màn ⇒ **saving UI state** là bắt buộc
  nếu không muốn mất dữ liệu form.

## Apple (iPhone Duo)
- **HIG Designing for iPhone Duo:** poses (6), reserved regions (outer camera, inner camera, fold),
  displacement, split view, arrangement (split/overlay), vertical controls, safe area bất đối xứng.
- **Tech Talks 111461–111466:** prepare (SDK 27/27.1), raise the bar (vertical bars),
  strike a pose (điện thoại gập/điện thoại), leverage scenes (hinge, scene accessory),
  camera (2 camera trước, direction coordinator), design (poses, 2 size class).
- Kích thước: inner **669×951 pt** (1878×2670 px @3x) · outer **466×678 pt** (1398×2034 px @3x).

## Liên quan
- Vùng chạm, states, a11y gesture: `mobile-ux-fundamentals`.
- Tablet/large-screen sau khi mở: `tablet-ux-fundamentals`.
- Apple-specific: `apple-design-iphone-duo`.
