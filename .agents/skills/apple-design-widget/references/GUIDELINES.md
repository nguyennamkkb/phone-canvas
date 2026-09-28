# Từ điển HIG — apple-design-widget

Đúc kết **5 trang Apple Human Interface Guidelines** trong `research/04-widget/notes/`. Bản tổng hợp, không nguyên văn.

## Controls | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/controls
- **Cấu trúc:** Controls | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Update controls when someone interacts with them, when an action completes, or remotely with a push notification.
  - Update the contents of a control to accurately reflect the state and show if an action is still in progress.
  - Choose a descriptive symbol that suggests the behavior of the control.
  - Use symbol animations to highlight state changes.
  - Provide hint text for the Action button.
  - Hide sensitive information when the device is locked.
  - Use the same camera UI in your app and your camera experience.
  - Provide instructions for adding the control.

## Live Activities | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/live-activities
- **Cấu trúc:** Live Activities | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Think about what information people find most useful and prioritize sharing it in a concise way.
  - Use large, heavier-weight text — a medium weight or higher.
  - Use small text sparingly and make sure key information is legible at a glance.
  - Adapt to different screen sizes and presentations.
  - Ensure they look great everywhere by using the values in Specifications as guidance and providing appropriately sized content.
  - Adapt the size and placement of elements in your Live Activity so they fit well together.
  - Use familiar layouts for custom views and layouts.
  - Use consistent margins and concentric placement.
  - Use even, matching margins between rounded shapes and the edges of the Live Activity, including corners, to ensure a harmonious fit.
  - Keep content compact and snug within a margin that’s concentric to the outer edge of the Live Activity.
- **Thông số:**
  - When someone taps it, it transitions to the Lock Screen presentation, scaled up by 2x to fill the screen.
  - The standard layout margin for Live Activities on the Lock Screen is 14 points.
  - The Dynamic Island uses a corner radius of 44 points, and its rounded corner shape matches the TrueDepth camera.

## Snippets | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/snippets
- **Cấu trúc:** Snippets | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Choose a descriptive label for a confirmation snippet’s primary button.

## Widgets | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/widgets
- **Cấu trúc:** Widgets | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Consider the following aspects when you design widgets:
  - Note that people can customize the Lock Screen with a tint color, and the system applies a red tint for widgets that appear on iPhone in StandBy in low-light conditions.
  - Choose simple ideas that relate to your app’s main purpose.
  - Include timely content and relevant functionality.
  - Aim to create a widget that gives people quick access to the content they want.
  - Prefer dynamic information that changes throughout the day.
  - Avoid expanding a smaller widget’s content to simply fill a larger area.
  - Display only the information that’s directly related to the widget’s main purpose.
  - Choose between automatically displaying content and letting people customize displayed information.
  - Avoid mirroring your widget’s appearance within your app.
- **Thông số:**
  - Use the standard margin width for widgets — 16 points for most widgets — to avoid crowding their edges and creating a cluttered appearance.
  - If you need to use tighter margins — for example, to create content groupings for graphics, buttons, or background shapes — setting margins of 11 points can work well.
  - In general, display text using fonts at 11 points or larger.
  - Text in a font that’s smaller than 11 points can be too hard for many people to read.
  - Size in mm (scaled to 100%)

## Glanceable widgets — Android/Material
`web` · https://developer.android.com/design/ui/widget
- **Cấu trúc:** Widget glanceable (Android/Material) · Nguyên tắc · Kích thước & co giãn · Style & theme · Checklist
- **Thông số:**
  - - Ước lượng theo lưới ô: 1 ô ≈ **40 dp**, n ô ≈ **70×n − 30 dp**; khai `minWidth/minHeight` thận trọng
