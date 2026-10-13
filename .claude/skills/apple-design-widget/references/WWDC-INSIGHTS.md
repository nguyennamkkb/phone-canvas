# Đúc kết bài giảng — apple-design-widget

Đúc kết **5 bài giảng** (WWDC / Tech Talks) trong `research/04-widget/transcripts/` — lý do đằng sau các quy chuẩn.

## Design widgets for visionOS - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/255/
- **Cấu trúc:** Design widgets for visionOS - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Think about where your widget might live -- mounted on a wall or sitting next to a workspace -- and
  - Design with print or wayfinding principles in mind, use clear hierarchy, strong typography, and thoughtful scale to make sure your content stays clear from a range of distances.
  - In this session, we’ll show you how these ideas extend to visionOS, and how you can design widgets that feel at home in people’s spaces, by taking advantage of the platform’s spatial and visual
  - 3:03People can personalize how your widgets look in their space, while you can offer styling options that help your widget feel at home in a wide range of spaces.
  - 4:49When thinking about what kinds of widgets to bring to visionOS, or designing one from scratch, it helps to consider them as part of the room they are in.
  - Just keep in mind, they only snap to physical surfaces, they won’t attach or persist in virtual environments.
  - On the other hand, if your goal is to let people decorate their space while using Vision Pro with something visually rich, like an artwork or photography, consider using the extra large template
  - As people can resize your widgets, and view them from up close, make sure you always work with high resolution assets.
  - When designing your widget, you can define its overall appearance by choosing between two stylistic treatments: Paper, a more grounded
  - 11:06Glass also introduces visual separation between foreground and background, so you can decide which parts of your interface respond to the environment and which will remain consistent.
- **Thông số:**
  - 8:30Each template size can be resized using the corner affordance, scaling from 75% to 125% while still preserving your layout.

## What’s new in widgets - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/278/
- **Cấu trúc:** What’s new in widgets - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Use fullColor for Images that represent media content, such as album artwork or a book cover.
  - Use the same techniques I covered to make your widget look its best in these color themes.
  - Use the widgetAccentedRenderingMode modifier to customize the presentation of your images.
  - Use the pushTokenDidChange method as an opportunity to send your push token and widget info to your server.
  - Remember that these widget reloads are budgeted.
  - Take some time to explore these new platforms for widgets.
  - Make sure your widgets look great in new appearances on iOS and macOS.
  - In CarPlay, glanceable information, large typography, and legibility are all important to help make your widget easy to read on the car’s
  - Widget interactions are supported on touchscreens, and you can use the CarPlay simulator available on the developer site to test your widget.
  - And check out “Meet Push Notifications Console” to see how you can easily test push notification requests.
- **Thông số:**
  - 15:56Second, the happy hours tend to happen around the same time.

## Design interactive snippets - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/281/
- **Cấu trúc:** Design interactive snippets - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Make sure to provide enough space between elements to avoid cluttering the layout.
  - Avoid including content past 340 points in height, which will require scrolling and introduce unexpected friction.
  - Make sure your snippet offers clear, relevant actions to supplement the main task.
  - Use confirmations when the intent needs an action before it can show the result.
  - Let’s wrap with what we learned, and what’s next.
  - Design lightweight, routine snippets using a glanceable appearance, simple interactions, and the right snippet types.
  - 1:30Snippets are designed with App Intents for quick, in-the-moment experiences, so it’s important for the content to be easy to read and understand.
  - Larger type draws attention to the most important information in the moment.
  - You can use the ContainerRelativeShape API to ensure these margins are responsive and adapt correctly across different platforms and screen sizes.
  - Instead, keep the content concise with only the most important information.
- **Thông số:**
  - Avoid including content past 340 points in height, which will require scrolling and introduce unexpected friction.

## Live Activities essentials - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/223/
- **Cấu trúc:** Live Activities essentials - WWDC26 - Videos - Apple Developer
- **Đúc kết:**
  - 0:25Then, I'll touch on how you can further optimize them for your app.
  - This makes it super easy for people to glance at the key information they need from your app, no matter where they are.
  - You'll want to craft a design that prioritizes the key things people need to know over time.
  - I'll need to consider which parts of the data are static, and which parts of the data are dynamic.
  - Carefully consider which information is essential from the larger presentation to appear in these views.
  - Using the ActivityKit framework, you can start one directly any time your app is running in the foreground or a Live Activity can be
  - Alternatively, you can also start it from a push notification.
  - 11:12Another presentation to consider is StandBy, which can appear when iPhone is charging in landscape.
- **Thông số:**
  - 11:19In this presentation, the Lock Screen view is used, scaled up to 200%.

## WidgetKit foundations - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/277/
- **Cấu trúc:** WidgetKit foundations - WWDC26 - Videos - Apple Developer
- **Đúc kết:**
  - Let's have a closer look at what is expected of the timeline provider and how timelines keep widgets relevant.
  - Use this when automatic reloads don't make sense.
  - Consider whether your widget's content should change depending on who's using it.
  - Keep configuration fast — one or two parameters is usually all you need.
  - Take the time to test that your interactions still feel right when someone's using them from a Mac.
  - Consider how you can extend and personalize your widget experience by integrating with your app.
  - For example, weather shows me just enough information about the current forecast to help me get ready
  - 1:43Using WidgetKit and SwiftUI you can provide great glanceable, relevant, and personalizable widgets for your apps content.
  - You can use something like a shared database or user defaults.
  - When you do need to reload, you can do this with an explicit call to WidgetCenter's reload APIs or by sending a push
