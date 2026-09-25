# Tri thức theo từng phần — apple-design-widget

Mỗi mục là một phần giao diện/khái niệm, được đúc kết từ trang HIG tương ứng trong `research/04-widget/notes/` (đọc qua trình duyệt thật).

## Widget

**Mục đích:** A widget provides quick access to essential information and focused interactions from your app or game in additional contexts.

**Cấu trúc:** Widgets | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Consider the following aspects when you design widgets:
- Note that people can customize the Lock Screen with a tint color, and the system applies a red tint for widgets that appear on iPhone in StandBy in low-light conditions.
- Choose simple ideas that relate to your app’s main purpose.
- Include timely content and relevant functionality.
- Aim to create a widget that gives people quick access to the content they want.
- Prefer dynamic information that changes throughout the day.
- Display only the information that’s directly related to the widget’s main purpose.
- Choose between automatically displaying content and letting people customize displayed information.
- Let people know when authentication adds value.
- Use system functionality to refresh dates and times in your widget.
- Use animated transitions to bring attention to data updates.
- Ensure that a widget interaction opens your app at the right location.

**Nên tránh:**
- Avoid expanding a smaller widget’s content to simply fill a larger area.
- Avoid mirroring your widget’s appearance within your app.
- Avoid very small font sizes.

**Thông số:**
- If you need to use tighter margins — for example, to create content groupings for graphics, buttons, or background shapes — setting margins of 11 points can work well.
- In general, display text using fonts at 11 points or larger.
- Text in a font that’s smaller than 11 points can be too hard for many people to read.
- Size in mm (scaled to 100%)

**Accessibility:**
- In contrast, some widgets — like the Podcasts widget — automatically display recent content, so people don’t need to customize them.
- Always use text elements and styles to ensure that your text scales well and to allow VoiceOver to speak your content.
- In iOS, iPadOS, and visionOS, widgets support Dynamic Type sizes from Large to AX5 when you use Font to choose a system font or custom(_:size:) to choose a custom font.
- For more information about Dynamic Type sizes, see Supporting Dynamic Type.
- Offer enough contrast to ensure legibility.

## Live Activity

**Mục đích:** A Live Activity lets people track the progress of an activity, event, or task at a glance.

**Cấu trúc:** Live Activities | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
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
- Use color to express the character and identity of your app.
- Consider using bold colors for text and objects to convey the personality and brand of your app.

**Nên tránh:**
- Avoid displaying sensitive information.

**Thông số:**
- When someone taps it, it transitions to the Lock Screen presentation, scaled up by 2x to fill the screen.
- The standard layout margin for Live Activities on the Lock Screen is 14 points.
- The Dynamic Island uses a corner radius of 44 points, and its rounded corner shape matches the TrueDepth camera.

**Accessibility:**
- If you set a custom background color or image for the Lock Screen presentation, ensure sufficient contrast — especially for tint colors on devices that feature an Always-On display with reduced luminance.
- Make sure your design, assets, and colors look great and offer enough contrast in Dark Mode and on an Always-On display.
- Check that your Live Activity design uses colors that provide enough contrast in Night Mode.

## Control

**Mục đích:** A control provides quick access to a feature of your app from Control Center, the Lock Screen, or the Action button.

**Cấu trúc:** Controls | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Update controls when someone interacts with them, when an action completes, or remotely with a push notification.
- Update the contents of a control to accurately reflect the state and show if an action is still in progress.
- Choose a descriptive symbol that suggests the behavior of the control.
- Use symbol animations to highlight state changes.
- Provide hint text for the Action button.
- Hide sensitive information when the device is locked.
- Use the same camera UI in your app and your camera experience.
- Provide instructions for adding the control.

## Snippet

**Mục đích:** When someone performs a task with Siri or an App Shortcut, a snippet shows the result or asks for confirmation.

**Cấu trúc:** Snippets | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Choose a descriptive label for a confirmation snippet’s primary button.

**Accessibility:**
- By contrast, a result snippet provides information — possibly as the outcome of a confirmation — that doesn’t require further action.
- Check for sufficient contrast between the snippet’s custom content and the system-provided background in both light and dark appearances, and keep consistent margins for the content within the view.
