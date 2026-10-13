# Sources — apple-design-watch

Nền tảng: **Apple Watch (watchOS)** · Bộ nghiên cứu: `../../../research/03-watchos/`

| Tài liệu trong skill | Nội dung |
|---|---|
| [`COMPONENTS.md`](COMPONENTS.md) | Tri thức theo từng phần (mục đích, cấu trúc, nguyên tắc, nên tránh, thông số, a11y) |
| [`GUIDELINES.md`](GUIDELINES.md) | Từ điển các chủ đề Apple HIG (đúc kết) |
| [`WWDC-INSIGHTS.md`](WWDC-INSIGHTS.md) | Đúc kết bài giảng WWDC / Tech Talks |
| [`SPECS.md`](SPECS.md) | Bảng thông số thiết kế tổng hợp, kèm nguồn |
| [`IMAGES.md`](IMAGES.md) | Tri thức trích từ phân tích ảnh minh hoạ trong `assets/` |
| `SOURCES.md` | File này — nguồn gốc & bản đồ dữ liệu |

## Chuyên sâu (watchOS)

| Tài liệu | Nội dung |
|---|---|
| [`API.md`](API.md) | API & nền tảng watchOS 26/27 (RelevanceKit, controls, Live Activity, health, tooling) |
| [`COMPLICATIONS.md`](COMPLICATIONS.md) | Families, gauge, tinted rendering, bezel |
| [`SMART-STACK-AND-RELEVANCE.md`](SMART-STACK-AND-RELEVANCE.md) | Control/Widget/Live Activity, RelevanceKit, ngân sách cập nhật |
| [`NAVIGATION-AND-LAYOUT.md`](NAVIGATION-AND-LAYOUT.md) | 3 mô hình điều hướng, 3 layout nền, material |
| [`LIVE-ACTIVITIES-ON-WATCH.md`](LIVE-ACTIVITIES-ON-WATCH.md) | Tuỳ biến, cập nhật, kết nối hạn chế, Always-On |
| [`ALWAYS-ON-AND-HAPTICS.md`](ALWAYS-ON-AND-HAPTICS.md) | Quy tắc Always-On + haptics |
| [`SYNC-AND-CONNECTIVITY.md`](SYNC-AND-CONNECTIVITY.md) | Tương thích, WatchConnectivity, đồng bộ iPhone ↔ Watch, background budget |
| [`ADOPTION-TESTING.md`](ADOPTION-TESTING.md) | arm64, Device Hub, ràng buộc runtime, ma trận kiểm thử |

## Bản đồ dữ liệu gốc (trong repo)

- `../../../research/03-watchos/notes/` — nội dung đầy đủ từng trang tài liệu Apple
- `../../../research/03-watchos/transcripts/` — transcript video (WWDC/Tech Talks)
- `../../../research/03-watchos/images/` — ảnh nghiên cứu
- `../../../research/03-watchos/DIGEST.md` — tóm tắt thô từng nguồn
- `../../../research/OVERVIEW.md` — tổng quan 5 nền tảng

Nguồn gốc: Apple Human Interface Guidelines, Apple Developer (WWDC / Tech Talks), apple.com.
Truy cập qua Kimi WebBridge ngày 2026-09-24; đúc kết bởi `scripts/build_references.py`.
