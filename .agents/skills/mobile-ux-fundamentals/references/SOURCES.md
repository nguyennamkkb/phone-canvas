# Sources — mobile-ux-fundamentals

Nền tảng: **Cross-platform mobile (iOS / Android / mobile web)** · Bộ nghiên cứu: `../../../research/07-mobile-ux/`

| Tài liệu trong skill | Nội dung |
|---|---|
| [`TOUCH-AND-TARGETS.md`](TOUCH-AND-TARGETS.md) | Vùng chạm: WCAG 2.5.8/2.5.5, Apple 44pt, Material 48dp, kích thước theo vị trí |
| [`INTERACTION-STATES.md`](INTERACTION-STATES.md) | State: enabled/disabled/hover/focus/pressed/dragged, state layer |
| [`HIERARCHY.md`](HIERARCHY.md) | Primary/secondary/tertiary/ghost/danger, một primary mỗi view |
| [`PRESENTATION.md`](PRESENTATION.md) | Chọn sheet / dialog / snackbar / toast / banner / inline |
| [`STATE-LIFECYCLE.md`](STATE-LIFECYCLE.md) | idle · loading · empty · error · partial · offline; skeleton rules |
| [`FEEDBACK-AND-TIMING.md`](FEEDBACK-AND-TIMING.md) | Ngưỡng 0.1/1/10 s, first load, frame budget, control chờ |
| [`GESTURES-AND-A11Y.md`](GESTURES-AND-A11Y.md) | WCAG 2.5.1 / 2.5.7 / 2.5.2 + checklist a11y mobile |
| [`EVIDENCE.md`](EVIDENCE.md) | Bằng chứng & trích dẫn cho mọi con số |

## Bản đồ dữ liệu gốc (trong repo)

- `../../../research/07-mobile-ux/notes/` — ghi chú nguồn web (WCAG, Material, Carbon, NN/g, Hoober…)
- `../../../research/07-mobile-ux/DIGEST.md` — tóm tắt thô từng nguồn
- `../../../research/07-mobile-ux/CHECKLIST.md` — checklist thiết bị / quy trình / thông số
- `../../../research/OVERVIEW.md` — tổng quan các nền tảng Apple

## Nguồn gốc

W3C WCAG 2.2 · Apple Human Interface Guidelines · Material Design 3 · IBM Carbon Design System ·
Nielsen Norman Group · Steven Hoober (ergonomics/thumb zone) · thực hành ngành.
Truy cập 2026-09-25 qua tìm kiếm web; đúc kết — không trích nguyên văn.

## Liên hệ với các skill nền tảng

- `apple-design-iphone` · `apple-design-ipad` · `apple-design-watch` · `apple-design-widget` ·
  `apple-design-iphone-duo` — quy chuẩn **riêng của Apple** (HIG, API, hành vi hệ thống).
- **Skill này** là lớp **nền tảng dùng chung** (ergonomics, states, hierarchy, presentation, a11y),
  dùng để biện luận bằng số và để kiểm tra chéo khi thiết kế trên bất kỳ nền tảng mobile nào.
