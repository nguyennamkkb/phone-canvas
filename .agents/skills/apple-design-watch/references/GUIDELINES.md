# Từ điển HIG — apple-design-watch

Đúc kết **9 trang Apple Human Interface Guidelines** trong `research/03-watchos/notes/`. Bản tổng hợp, không nguyên văn.

## Action button | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/action-button
- **Cấu trúc:** Action button | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Support the Action button with a set of your app’s essential functions.
  - Keep labels as short as possible, with a maximum of three words.
  - Prefer letting the system show people how to use the Action button with your app.
  - Avoid creating content that repeats the guidance offered in Settings for the Action button, or other usage tips the system provides.
  - Let people use your actions without leaving their current context.
  - Consider offering a secondary function that supports or advances the primary action people choose.
  - Consider carefully before you offer more than one secondary function, because doing so can increase people’s cognitive load and make your app seem harder to use.
  - Prefer using subsequent button presses to support additional functionality rather than to stop or conclude a function.

## Always On | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/always-on
- **Cấu trúc:** Always On | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Keep other types of personal information glanceable when it makes sense.
  - Keep important content legible and dim nonessential content.
  - Avoid making distracting interface changes when Always On begins or ends and throughout the Always On experience.
  - Note that unnecessary changes during Always On can be especially distracting on iPhone, because people often put their device face up on a surface, making motion on the screen visible even when they’re not looking directly at it.

## Complications | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/complications
- **Cấu trúc:** Complications | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Prefer using WidgetKit to develop complications for watchOS 9 and later.
  - Support all complication families when possible.
  - Consider creating multiple complications for each family.
  - Make sure you help people prevent potentially sensitive information from being visible to others.
  - Choose a ring or gauge style based on the data you need to display.
  - Make sure images look good in tinted mode.
  - Avoid using color as the only way to communicate important information.
  - Use line weights that suit the size and complexity of the image.
  - Provide a set of static placeholder images for each complication you support.
  - Note that complication image sizes vary per layout (and per legacy template) and the size of a placeholder image may not match the size of the actual image you supply for that complication.
- **Thông số:**
  - 42x42 pt (84x84 px @2x)
  - 44.5x44.5 pt (89x89 px @2x)
  - 47x47 pt (94x94 px @2x)
  - 50x50 pt (100x100 px @2x)
  - 27x27 pt (54x54 px @2x)
  - 28.5x28.5 pt (57x57 px @2x)
  - 31x31 pt (62x62 px @2x)
  - 32x32 pt (64x64 px @2x)

## Designing for watchOS | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/designing-for-watchos
- **Cấu trúc:** Designing for watchOS | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Support quick, glanceable, single-screen interactions that deliver critical information succinctly and help people perform targeted actions with a simple gesture or two.
  - Minimize the depth of hierarchy in your app’s navigation, and use the Digital Crown to provide vertical navigation for scrolling or switching between screens.
  - Use complications to provide relevant, potentially dynamic data and graphics right on the watch face where people can view them on every wrist raise and tap them to dive straight into your app.
  - Use notifications to deliver timely, high-value information and let people perform important actions without opening your app.
  - Use background content such as color to convey useful supporting information, and use materials to illustrate hierarchy and a sense of place.
  - Design your app to function independently, complementing your notifications and complications by providing additional details and functionality.

## Digital Crown | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/digital-crown
- **Cấu trúc:** Digital Crown | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - List, tab, and scroll views are vertically oriented, allowing people to use the Digital Crown to easily move between the important elements of your app’s interface.
  - Consider using the Digital Crown to inspect data in contexts where navigation isn’t necessary.
  - Provide visual feedback in response to Digital Crown interactions.
  - Update your interface to match the speed with which people turn the Digital Crown.
  - Avoid updating content at a rate that makes it difficult for people to select values.
  - Use the default haptic feedback when it makes sense in your app.

## Notifications | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/notifications
- **Cấu trúc:** Notifications | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Provide concise, informative notifications.
  - Avoid sending multiple notifications for the same thing, even if someone hasn’t responded.
  - Avoid sending a notification that tells people to perform specific tasks within your app.
  - Use an alert — not a notification — to display an error message.
  - Avoid including sensitive, personal, or confidential information in a notification.
  - Prefer brief titles that people can read at a glance, especially on Apple Watch, where space is limited.
  - Use title-style capitalization and no ending punctuation.
  - Use complete sentences, sentence case, and proper punctuation, and don’t truncate your message — the system does this automatically when necessary.
  - Provide generically descriptive text to display when notification previews aren’t available.
  - Use sentence-style capitalization for this text.
- **Thông số:**
  - If you want to match the background color of other system notifications, use white with 18% opacity; otherwise, you can use a custom color, such as a color within your brand’s palette.

## Playing haptics | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- **Cấu trúc:** Playing haptics | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use system-provided haptic patterns according to their documented meanings.
  - Use haptics consistently throughout your app or game.
  - Prefer using haptics to complement other feedback in your app or game.
  - Let people turn off or mute haptics, and make sure people can still enjoy your app or game without them.
  - Ensure that haptic vibrations don’t disrupt experiences involving device features like the camera, gyroscope, or microphone.
  - Use standard UI components — like toggles, sliders, and pickers — that play Apple-designed system haptics by default.

## Watch faces | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/watch-faces
- **Cấu trúc:** Watch faces | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Display a preview of each watch face you share.
  - Aim to offer shareable watch faces for all Apple Watch devices.

## Wearable UX principles — Wear OS
`web` · https://developer.android.com/design/ui/wear/guides/get-started/design-for-wearables/principles
- **Cấu trúc:** Nguyên tắc wearable (Wear OS + Apple Watch) · Năm nguyên tắc (Wear OS) · App trên watch (Wear OS) · M3 Expressive (watch) · Checklist
