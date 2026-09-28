# Tri thức theo từng phần — apple-design-watch

Mỗi mục là một phần giao diện/khái niệm, được đúc kết từ trang HIG tương ứng trong `research/03-watchos/notes/` (đọc qua trình duyệt thật).

## Complication

**Mục đích:** A complication displays timely, relevant information on the watch face, where people can view it each time they raise their wrist.

**Cấu trúc:** Complications | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Prefer using WidgetKit to develop complications for watchOS 9 and later.
- Support all complication families when possible.
- Consider creating multiple complications for each family.
- Make sure you help people prevent potentially sensitive information from being visible to others.
- Choose a ring or gauge style based on the data you need to display.
- Make sure images look good in tinted mode.
- Use line weights that suit the size and complexity of the image.
- Provide a set of static placeholder images for each complication you support.
- Note that complication image sizes vary per layout (and per legacy template) and the size of a placeholder image may not match the size of the actual image you supply for that complication.
- Use the following values for guidance as you create images for an extra-large circular complication.
- Use the following values to create no-content placeholder images for your circular-family complications.
- Use the following values to create no-content placeholder images for your corner-family complications.

**Nên tránh:**
- Avoid using color as the only way to communicate important information.

**Thông số:**
- 42x42 pt (84x84 px @2x)
- 44.5x44.5 pt (89x89 px @2x)
- 47x47 pt (94x94 px @2x)
- 50x50 pt (100x100 px @2x)
- 27x27 pt (54x54 px @2x)
- 28.5x28.5 pt (57x57 px @2x)
- 31x31 pt (62x62 px @2x)
- 32x32 pt (64x64 px @2x)

**Accessibility:**
- The graph uses high-contrast white and red for the primary content and a lower-contrast gray for the graph lines and labels, making the data easy to understand at a glance.

## Notification

**Mục đích:** A notification gives people timely, high-value information they can understand at a glance.

**Cấu trúc:** Notifications | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Provide concise, informative notifications.
- Use an alert — not a notification — to display an error message.
- Prefer brief titles that people can read at a glance, especially on Apple Watch, where space is limited.
- Use title-style capitalization and no ending punctuation.
- Use complete sentences, sentence case, and proper punctuation, and don’t truncate your message — the system does this automatically when necessary.
- Provide generically descriptive text to display when notification previews aren’t available.
- Use sentence-style capitalization for this text.
- Consider providing a sound to supplement your notifications.
- Provide beneficial actions that make sense in the context of your notification.
- Prefer actions that let people perform common, time-saving tasks that eliminate the need to open your app.
- Provide a simple, recognizable interface icon for each notification action.
- Use a badge only to show people how many unread notifications they have.

**Nên tránh:**
- Avoid sending multiple notifications for the same thing, even if someone hasn’t responded.
- Avoid sending a notification that tells people to perform specific tasks within your app.
- Avoid including sensitive, personal, or confidential information in a notification.
- Avoid including your app name or icon.
- Avoid providing an action that merely opens your app.
- Avoid creating a custom image or component that mimics the appearance or behavior of a badge.

**Thông số:**
- If you want to match the background color of other system notifications, use white with 18% opacity; otherwise, you can use a custom color, such as a color within your brand’s palette.

## Digital Crown

**Mục đích:** The Digital Crown is an important hardware input for Apple Vision Pro and Apple Watch.

**Cấu trúc:** Digital Crown | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- List, tab, and scroll views are vertically oriented, allowing people to use the Digital Crown to easily move between the important elements of your app’s interface.
- Consider using the Digital Crown to inspect data in contexts where navigation isn’t necessary.
- Provide visual feedback in response to Digital Crown interactions.
- Update your interface to match the speed with which people turn the Digital Crown.
- Use the default haptic feedback when it makes sense in your app.

**Nên tránh:**
- Avoid updating content at a rate that makes it difficult for people to select values.

**Accessibility:**
- Open Accessibility settings

## Action button

**Mục đích:** The Action button gives people quick access to their favorite features on supported iPhone and Apple Watch models.

**Cấu trúc:** Action button | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Support the Action button with a set of your app’s essential functions.
- Keep labels as short as possible, with a maximum of three words.
- Prefer letting the system show people how to use the Action button with your app.
- Let people use your actions without leaving their current context.
- Consider offering a secondary function that supports or advances the primary action people choose.
- Consider carefully before you offer more than one secondary function, because doing so can increase people’s cognitive load and make your app seem harder to use.
- Prefer using subsequent button presses to support additional functionality rather than to stop or conclude a function.

**Nên tránh:**
- Avoid creating content that repeats the guidance offered in Settings for the Action button, or other usage tips the system provides.

## Haptics

**Mục đích:** Playing haptics can engage people’s sense of touch and bring their familiarity with the physical world into your app or game.

**Cấu trúc:** Playing haptics | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use system-provided haptic patterns according to their documented meanings.
- Use haptics consistently throughout your app or game.
- Prefer using haptics to complement other feedback in your app or game.
- Let people turn off or mute haptics, and make sure people can still enjoy your app or game without them.
- Ensure that haptic vibrations don’t disrupt experiences involving device features like the camera, gyroscope, or microphone.
- Use standard UI components — like toggles, sliders, and pickers — that play Apple-designed system haptics by default.

## Always-On

**Mục đích:** On devices that include the Always On display, the system can continue to display an app’s interface when people suspend their interactions with the device.

**Cấu trúc:** Always On | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Keep other types of personal information glanceable when it makes sense.
- Keep important content legible and dim nonessential content.
- Note that unnecessary changes during Always On can be especially distracting on iPhone, because people often put their device face up on a surface, making motion on the screen visible even when they’re not looking directly at it.

**Nên tránh:**
- Avoid making distracting interface changes when Always On begins or ends and throughout the Always On experience.

## Watch face

**Mục đích:** A watch face is a view that people choose as their primary view in watchOS.

**Cấu trúc:** Watch faces | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Display a preview of each watch face you share.
- Aim to offer shareable watch faces for all Apple Watch devices.

## Layout

**Mục đích:** - Layout là **cấu trúc** giúp người dùng hiểu nội dung ngay khi mở app; quan hệ quen thuộc giữa

**Cấu trúc:** HIG — Layout · TL;DR · Visual hierarchy · Adaptability · Size classes · Guides & safe area · Platform considerations · macOS · tvOS · visionOS

**Thông số:**
- - Tôn trọng safe area: inset nội dung chính **60 pt** trên/dưới, **80 pt** hai bên.
- - Khoảng cách control: tâm các nút cách nhau **≥ 60 pt**.

**Accessibility:**
- - Hỗ trợ **Dynamic Type**: view cạnh nhau có thể phải xếp dọc, hàng bảng cao lên để chữ không bị cắt.
- - Thay đổi cỡ chữ (Dynamic Type)
- - **Dynamic Type**: hàng ngang có thể phải stack dọc; row container cao lên; row 1 dòng có thể thành nhiều dòng.
- - [ ] Bật Dynamic Type và test ở cỡ chữ lớn nhất.
