# Thông số thiết kế — tổng hợp

Trích từ 10 nguồn đã đọc. Dùng làm token/kiểm tra trong lúc thiết kế.

| # | Thông số | Nguồn |
|---|---|---|
| 1 | When someone taps it, it transitions to the Lock Screen presentation, scaled up by 2x to fill the screen. | Live Activities / Apple Developer Docume |
| 2 | The standard layout margin for Live Activities on the Lock Screen is 14 points. | Live Activities / Apple Developer Docume |
| 3 | The Dynamic Island uses a corner radius of 44 points, and its rounded corner shape matches the TrueDepth camera. | Live Activities / Apple Developer Docume |
| 4 | Use the standard margin width for widgets — 16 points for most widgets — to avoid crowding their edges and creating a cluttered appearance. | Widgets / Apple Developer Documentation |
| 5 | If you need to use tighter margins — for example, to create content groupings for graphics, buttons, or background shapes — setting margins of 11 points can work well. | Widgets / Apple Developer Documentation |
| 6 | In general, display text using fonts at 11 points or larger. | Widgets / Apple Developer Documentation |
| 7 | Text in a font that’s smaller than 11 points can be too hard for many people to read. | Widgets / Apple Developer Documentation |
| 8 | Size in mm (scaled to 100%) | Widgets / Apple Developer Documentation |
| 9 | - Ước lượng theo lưới ô: 1 ô ≈ **40 dp**, n ô ≈ **70×n − 30 dp**; khai `minWidth/minHeight` thận trọng | Glanceable widgets — Android/Material |
| 10 | 8:30Each template size can be resized using the corner affordance, scaling from 75% to 125% while still preserving your layout. | Design widgets for visionOS - WWDC25 - V |
| 11 | 15:56Second, the happy hours tend to happen around the same time. | What’s new in widgets - WWDC25 - Videos  |
| 12 | Avoid including content past 340 points in height, which will require scrolling and introduce unexpected friction. | Design interactive snippets - WWDC25 - V |
| 13 | 11:19In this presentation, the Lock Screen view is used, scaled up to 200%. | Live Activities essentials - WWDC26 - Vi |
