# Đúc kết bài giảng — apple-design-watch

Đúc kết **12 bài giảng** (WWDC / Tech Talks) trong `research/03-watchos/transcripts/` — lý do đằng sau các quy chuẩn.

## There and back again: Data transfer on Apple Watch - WWDC21 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2021/10003/
- **Cấu trúc:** There and back again: Data transfer on Apple Watch - WWDC21 - Videos - Apple Developer
- **Đúc kết:**
  - Add a webcredentials entry with your domain name.
  - Add text content types to your text fields and secure fields.
  - Use Associated Domains to easily add password autofill functionality to your app.
  - Think carefully about what information your customer really needs on their Watch.
  - Don't expect it to be instantaneous, but CloudKit will handle optimizing performance of this synchronization for your app.
  - Make sure you move the file or otherwise quickly process it before you return from this method.
  - Remember that your counterpart app won't be reachable a lot of the time, especially when you're trying to communicate to your Watch app.
  - Think of them like posting a letter: you drop it in the box, but you're not sure exactly when it's going to be there.
  - Let's look at when you should use each of these options.
  - Think about your customers' experience if their communication task fails.

## Meet watchOS 10 - WWDC23 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2023/10026/
- **Cấu trúc:** Meet watchOS 10 - WWDC23 - Videos - Apple Developer
- **Đúc kết:**
  - Use background colors to help users navigate or to aid in recognition of what app they're using.
  - Consider using color to help people who use your app understand their sense of place.
  - Use Vertical Pagination in place of horizontal pagination, which is more difficult to navigate on Apple Watch.
  - In this session, you'll learn about what's new in watchOS 10, how the Apple Design Team approaches the design of our own apps and the system, and how you can apply these design
  - watchOS 10 intelligently surfaces timely, relevant widgets right on your watch face that you can access by turning the Digital Crown.
  - And you can click the Side Button once to open Control Center from anywhere you are, or twice to open Wallet.
  - We designed watchOS 10 by following a rigorous and methodical design process centered around clear design principles that you can apply to the design of your apps.
  - In List-based views, like Mail, you can rotate the Digital Crown to scroll vertically through the list of
  - We recommend using scroll views inside pages judiciously and, if possible, placing them only after fixed height pages in your app design.

## Build widgets for the Smart Stack on Apple Watch - WWDC23 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2023/10029/
- **Cấu trúc:** Build widgets for the Smart Stack on Apple Watch - WWDC23 - Videos - Apple Developer
- **Đúc kết:**
  - Let's get started with the widget configuration by looking at the widget structure in our code.
  - Let's look at our widget's Configuration App Intent.
  - Let's move on to our widget timeline and take a look at our TimelineEntry structure.
  - Let's add the backyard property to our TimelineEntry.
  - Let's add the relevance property to our TimelineEntry.
  - Let's move on and build out our TimelineProvider.
  - Let's fix that by adding a random backyard from the app's data model.
  - Let's get the configured backyard from the backyardID in the configuration.
  - Let's fix the last SimpleEntry and give it a backyard so we can see the preview.
  - Let's add an environment property for the widgetFamily so we can build views specifically for each family.

## Design and build apps for watchOS 10 - WWDC23 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2023/10138/
- **Cấu trúc:** Design and build apps for watchOS 10 - WWDC23 - Videos - Apple Developer
- **Đúc kết:**
  - Strive to make your detail view so unmistakable at a glance that it doesn’t need a title.
  - And if I’m looking for the weather in New York, for example, my list of cities is just a single tap away from any of these detail views.
  - 4:16When designing for watchOS, consider the journey people will take from the moment they raise their wrist.
  - 4:37When you design your app, you can begin by thinking about which information would make the best Smart Stack widget and then design around those relevant and timely experiences to architect your
  - 9:32Matthew: Now you may be wondering, “Can I do that, too?” And the answer is, you can!
  - 9:37In watchOS 10, you can now drive animations based on the selection value of the TabView.
  - 10:12If your app can’t do what it needs to do by pivoting between a detail and source list, or in a few vertically paginated tabs, consider using a NavigationStack.
  - 11:17Jennifer: Now that you have chosen the best navigation structure for your app, let’s talk about the resources you can use to build each view.
  - Matthew: And you can use the same SwiftUI APIs on watchOS as you might already do on other platforms.
  - 15:23Jennifer: We also added a full screen background gradient that you can tint with your own accent colors.

## Bring your Live Activity to Apple Watch - WWDC24 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2024/10068/
- **Cấu trúc:** Bring your Live Activity to Apple Watch - WWDC24 - Videos - Apple Developer
- **Đúc kết:**
  - Let’s modify it to customize the Live Activity view for Apple Watch.
  - Ensure your Dynamic Island Compact Views are timely, relevant, and informative.
  - 0:53Then I’ll show you how you can customize your Live Activity view for the SmartStack.
  - This is a great opportunity for you to consider whether your compact views are making the best use of the space available to keep people up to date.
  - But if you do have a Watch App, you can also opt-in to open it from a tap on the Live Activity in the Smart Stack.
  - On Apple Watch, there are a few additional things you should know to make sure your Live Activity is showing the most up-to-date information possible and works just how you intended.
  - 7:15In your iOS app, consider cases where your Live Activity is updated locally with ActivityKit.
  - Also consider adjustments your activity view may need for Always On Display.

## Build custom swimming workouts with WorkoutKit - WWDC24 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2024/10084/
- **Cấu trúc:** Build custom swimming workouts with WorkoutKit - WWDC24 - Videos - Apple Developer
- **Đúc kết:**
  - Let me quickly recap the structure of a custom workout.
  - For example, you can simply schedule a cycling workout, leaving the user to decide if they want to do this workout outdoors or maybe indoors if it’s raining.
  - Starting in watchOS 10.4, you can specify between current and average power alerts for both range and threshold alerts.
  - You can set a custom step name by using the new displayName property on WorkoutStep.
  - the brand new view you can reach simply by scrolling down.
  - 5:04To create this goal, you can use the new poolSwimDistanceWithTime goal type, and pass in a Measurement for the distance length and time duration.
  - And, using these new enhancements you can do even more to customize your workouts!

## Design Live Activities for Apple Watch - WWDC24 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2024/10098/
- **Cấu trúc:** Design Live Activities for Apple Watch - WWDC24 - Videos - Apple Developer
- **Đúc kết:**
  - 0:50So in this session, we’re going to cover: the improvements we’re bringing to Smart Stack, which is the primary surface for Live Activities; all the different ways you can interact with Live
  - For example, this new precipitation widget shows up 15 minutes before it rains and then disappears once the skies clear up.
  - So you can track its progress just by raising your wrist.
  - New, in watchOS 11, the Smart Stack will remain visible when you put your wrist down so you can continue to glance at both the time and the Live Activity you are tracking.
  - If your wrist is down and you are on your watch face, you can simply raise your wrist to see a full-sized representation of the Live Activity you’re tracking.
  - As you can see, there is a significant difference in quality and experience between these two options.
  - To answer that, we recommend showing only what is necessary to communicate significant states in the live activity.
  - To help you make the most of the space we recommend using one of our existing design layouts which can accommodate different levels of information density and
  - You can learn more about these layouts in last year's session: "Design Widgets for the Smart Stack on Apple Watch." If, however, you want to do something completely custom, we
  - If you’re interested in getting a fuller understanding of each of these experiences, we recommend

## What’s new in watchOS 11 - WWDC24 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2024/10205/
- **Cấu trúc:** What’s new in watchOS 11 - WWDC24 - Videos - Apple Developer
- **Đúc kết:**
  - Use the .small family for the Smart Stack or the .medium family for the Lock Screen on iOS and iPadOS.
  - Use the App Intent RelevantContext API to let the system know when your widget is likely to be most relevant.
  - Let’s take a look at how to use RelevantContext in your widgets with an example from the Reminders app.
  - Let’s take a look at an example from a Coffee Shop widget.
  - Let’s look at how to bring interactivity to your widgets with an example from the Home widget.
  - In this session, I will be talking about how you can take advantage of these same features in your apps.
  - We’ll cover how iOS Live Activities appear on Apple Watch, and how you can customize its experience for watchOS.
  - When you add the .supplementalActivityFamilies modifier to the ActivityConfiguration, the system will prefer your custom content view over the Dynamic Island views.
  - You can provide relevant contexts such as Date, Inferred or precise location, Sleep, including the bedtime and wakeup time Fitness cues, including active workout and incomplete activity rings and
  - For example, if you have a sleep data widget, it might be relevant to someone after they wake up.

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

## What’s new in watchOS 26 - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/334/
- **Cấu trúc:** What’s new in watchOS 26 - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Let’s check out some new places where you can take your app.
  - Let’s keep exploring and keep going new places together with your apps.
  - My name is Anne, and I’m happy to be with you today to share some of the great new features for watchOS 26 and tips on how you can use them in your apps.
  - I’m going to introduce you to updates to watchOS 26, show you how you can take your watchOS and iOS apps to more places on Apple Watch, and share new ways to show timely and relevant content from
  - 3:15And make sure to test both on the simulator and on devices.
  - 5:09If you have a Watch app, you can also build Apple Watch controls using the same API used to build controls for iOS.
  - 5:51Build a widget to display information throughout the day, for example to display weather information or upcoming events.
  - For example, in my beach app, I’d like to provide an additional configuration for my meditation timer control.
  - You can search for a nearby point of interest like a grocery store, get routes to locations using a transport type like driving, walking, or cycling, and show routes as an overlay on a map with
  - You can show people the information and actions they want when it matters most, and keep that information up to date. watchOS 26 introduces a new framework: RelevanceKit.

## Principles of great design - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/250/
- **Cấu trúc:** Principles of great design - WWDC26 - Videos - Apple Developer
- **Đúc kết:**
  - Take a second with it, because I think a lot of us, if we're being honest, would jump to "design is how something looks" or maybe even "design is how
  - Think about what it means to responsibly add AI capabilities to your product.
  - Think realistically about what could go wrong, and add safeguards.
  - Make sure every element helps clarify your point.
  - It's focusing on what's most important to people, so you can build something they will truly value.
  - These are valuable things you can't afford to waste.
  - 1:08Purpose, is one of the foundational principles, that you can use to design great experiences on Apple platforms.
  - 3:16People really appreciate it, when you help them avoid disaster.
  - And even though there's tons of information you can request from someone, it's not the best way to build a relationship.
  - That could do real-world harm and it's just something you can't leave to chance.

## watchOS Group Lab - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/8014/
- **Cấu trúc:** watchOS Group Lab - WWDC26 - Videos - Apple Developer
- **Đúc kết:**
  - Let's talk about foundation models on watch.
  - Think about those core moments and experiences that really shine on the platform, with the intimate qualities of the
  - 3:22You can use PCC or you can use anything that conforms to the language model.
  - 3:36But you can conform to language model yourself, but it will require a network call.
  - 3:45But I've had a lot of fun this year working with that team and playing with that framework, and there's so many fun things that you can do with that that are great use cases on watch, like
  - 4:31And now you can go see how it applies and you can use it to build some really amazing experiences.
  - 4:40But I think it's things like that, the text summarization, or take all this data and go and go feed it to an LLM and see like what kind of insights you can provide to your users to be such an
  - So make sure that you're checking that before you're making these calls.
  - Or you can use another language model conforming protocol.
  - What core architectural paradigms or hidden pitfalls should we keep in mind when handling heavy off main thread work like CloudKit syncing without relying on iOS habits.
