# Đúc kết bài giảng — apple-design-iphone

Đúc kết **10 bài giảng** (WWDC / Tech Talks) trong `research/01-mobile-design/transcripts/` — lý do đằng sau các quy chuẩn.

## Meet Liquid Glass - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/219/
- **Cấu trúc:** Meet Liquid Glass - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Let's look at some of these layers more closely.
  - 3:10How the material feels and behaves is just as important as the way it looks.
  - In some cases, like when there are pinned accessory views under a toolbar, such as column headers for example, we use a “hard style” effect instead.
  - So that’s a look at how Liquid Glass adapts across sizes, environments, and platforms, and how you can leverage it alongside the scroll edge effects to ensure clarity and legibility, all while
  - To get the most out of Liquid Glass it is important to understand it at a deeper level.
  - And in some cases, the lighting responds to device motion, making it feel like Liquid Glass is aware of its position in the real world Shadows also play an important role in helping elements feel
  - 11:58This provides separation from the content to make sure elements are always easy to spot.
  - Alright, now that i’ve gone over its structure and behaviors, I’ll talk about how and when to use Liquid Glass, as well as the different variants you can choose from.
  - So keep it in the content layer instead to ensure clarity Similarly, always avoid glass on glass Stacking Liquid Glass elements on top of each other can quickly make the interface feel cluttered and
  - 13:34When placing elements on top of Liquid Glass, avoid applying the material to both layers.

## Say hello to the new look of app icons - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/220/
- **Cấu trúc:** Say hello to the new look of app icons - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Based on gyro input, you can see light moving on the edge of the icon, which feels like it’s reflecting the world
  - In order to avoid irregular shapes, the canvas shape now acts as a mask to designs.
  - Here you can see how we’ve redesigned the icon to make better use of the canvas and include the divider tabs in its shape.
  - OK, now let’s talk about what you need to consider when drawing icons in order to make the most of our
  - With the background being glass, you can see the wallpaper through all of the translucent layers.
  - Another thing to also keep in mind while drawing your icon are smaller details.

## Build a UIKit app with the new design - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/284/
- **Cấu trúc:** Build a UIKit app with the new design - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Make sure to add these as siblings of the extension view, not as subviews.
  - Add the extensionView to your hierarchy.
  - Use AutoLayout constraints to position the image view at the top of the screen.
  - Place search at the trailing edge of the navigationBar.
  - Use the .glass() configuration to get standard glass.
  - 2:49Above the tab bar, you can have an accessory view like the mini player in the Music app.
  - If color is needed to communicate information about the action, you can specify a different tint color.
  - You can also use it with custom containers of views that overlay an edge of a scroll view!
  - 14:46On the alertController, make sure to set the sourceItem or the sourceView on popoverPresentationController, regardless of which device it’s displayed on.
  - 16:57For dedicated search views, consider including search as a section in the sidebar or tab bar.
- **Thông số:**
  - centered in the regular width on iPad.

## Principles of inclusive app design - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/316/
- **Cấu trúc:** Principles of inclusive app design - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Let’s focus on the different ways someone can import a recipe.
  - Remember, disability is just as much about the environment as it is about the body.
  - Designing your app to work for people with disabilities is so important in a day and age when your app
  - 2:44And it’s really important to think of all of these senses as a spectrum, because everyone is different.
  - So try looking for the inclusion gap in your app, and as you do, think about how you can work with
  - people who have disabilities, so that you can avoid making assumptions that might lead to unintended results.
  - It is so important to not make decisions that impact people with disabilities without them being a part of it.
  - So here are four practical things you can do to make your app more inclusive, while you look for people with disabilities to collaborate with.
  - It supports a variety of reading styles that make it so you can always read in the way that works best for you.
  - 10:34And this is great for people that prefer reading with their eyes.
- **Thông số:**
  - 8:37Second, provide customization.

## Build a SwiftUI app with the new design - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/323/
- **Cấu trúc:** Build a SwiftUI app with the new design - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Let’s start by creating a custom badge view with the Liquid Glass effect!
  - Add these transitions to your own glass container by using the glassEffectID modifier.
  - 1:43Sometimes, in life, to gain clarity and focus on what’s truly important, you may need to re-invent yourself and look at the bigger picture.
  - I’ll finish by describing how you can adopt glass into your own custom UI elements.
  - 6:06Alright, I showed you how NavigationSplitView is beautiful in Landmarks with the new design, and I shared ways you can adapt TabView-based apps too.
  - 6:53If you’ve used the presentationBackground modifier to apply a custom background to your sheets, consider removing that and let the new material shine.
  - If your app has any extra backgrounds or darkening effects behind the bar items, make sure to remove them, as these
  - And for your most important, prominent actions there is now support for extra large sized buttons.
  - For example, a button that is positioned at the bottom of a sheet should share the same corner center with the corners of the sheet.
  - 18:59For especially important views, use a tint modifier.
- **Thông số:**
  - 16:00Use the ticks closure to specify their location, like I’m doing here for ticks at 60% and 90%.

## What’s new in SF Symbols 7 - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/337/
- **Cấu trúc:** What’s new in SF Symbols 7 - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Let’s jump into what’s new this year to learn how these details are crafted into our latest experiences.
  - Let's jump into the SF Symbols app to try to replicate this annotation.
  - Remember that symbols support nine different weights and three scales.
  - Let’s review the current placement of our guide points.
  - If you haven’t already, make sure to watch last year’s WWDC session, “What’s New in SFSymbols 6” As it’s a great resource for getting up to speed and ready for what’s next.
  - 1:31Some shapes are created with two different paths, oriented in opposite directions, that enable each individual path to refine its appearance, and is an important piece to defining the way these
  - If you’re looking for a quicker more immediate effect, you can animate with Whole Symbol, which draws all layers together, where each draw path starts and ends at the same time.
  - Or you can leverage our brand new playback option for draw presets, Individually, that draws each layer one by one, waiting for the previous layer to finish before starting the next one.
  - For example, wind draws left to right to convey motion, whereas this Arabic character draws from right to left, matching its writing direction.
  - 4:55If you’re familiar with variable color, you may remember that some symbols support variable rendering as a way of conveying strength or progress through color.

## Get to know the new design system - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/356/
- **Cấu trúc:** Get to know the new design system - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Think of it like playing in the same music key—your interface elements should complement the system’s rhythm and tone, not clash with it.
  - Group bar items by function and frequency.
  - Avoid placing screen-specific actions here—a checkout button, for example, belongs with the content it supports.
  - Use it for hero images, tinted backgrounds, or any surface meant to feel expansive.
  - Use the same symbols across devices to preserve meaning and build familiarity through repetition.
  - Use the symbol once to introduce the group, and let text do the rest.
  - It’s important that your own visual design language and interface elements harmonize with Liquid Glass.
  - 7:15When making custom controls, use the same approach, and make sure to apply the material directly to the control, not its inner views.
  - 11:28And remember, scroll edge effects are not decorative.
  - You should avoid mixing or stacking them on top of each other.

## Design foundations from idea to interface - WWDC25 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2025/359/
- **Cấu trúc:** Design foundations from idea to interface - WWDC25 - Videos - Apple Developer
- **Đúc kết:**
  - Let’s see how it answers those questions — starting from the top.
  - Design is never really finished, and there’s no single right answer.
  - 2:20And finally, I ask: “Where can I go from here?” A clear sense of next steps keeps the flow going and helps me avoid hesitation or second-guessing.
  - And for displaying a large number of images — as I need — it’s best to consider using a collection.
  - 14:14To improve it, I’m going to turn this suggestion into a visual anchor by making what’s most important larger or higher in contrast, so it naturally draws attention first.
  - Today we explored the foundations and you can take your app even further with typography, UX writing, and animation.

## Communicate your brand identity on iOS - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/251/
- **Cấu trúc:** Communicate your brand identity on iOS - WWDC26 - Videos - Apple Developer
- **Đúc kết:**
  - Use platform components for conventional tasks and customize components to cater to your specific
  - Aim to incorporate branding like this in refined and unobtrusive ways that don't distract people from your experience.
  - But each of these placements should consider the context.
  - I'll cover ways to make your content shine, the appropriate places to use color in your interface, considerations when using custom fonts, and examples of great iconography and resources you can use.
  - At a glance you can tell the app has a distinct identity: playful illustrations and detailed data
  - 3:46Establishing a baseline of platform familiarity is important.
  - In a recipe detail view, comments are an important part of the content.
  - 9:09People remember how a product makes them feel design an experience that's satisfying, enriching and a joy to use.
  - The other thing to consider here is that color can be distracting and make an interface feel overwhelming.
  - Intentional use of color communicates status, feedback, and selection states helping people focus on what's important.

## Design intuitive search experiences - WWDC26 - Videos - Apple Developer
`wwdc` · https://developer.apple.com/videos/play/wwdc2026/292/
- **Cấu trúc:** Design intuitive search experiences - WWDC26 - Videos - Apple Developer
- **Đúc kết:**
  - Let's start by taking a look at the Search Field...
  - Remember, when results and suggestions are ranked efficiently, people generally shouldn't have to type out their entire search.
  - Search is one of the most important tools for helping people find, navigate, and discover content.
  - Which is why designing a great search experience, is an important part of your app.
  - If your app has its own distinct brand and set of iconography, make sure to keep the core elements of a Search Field intact.
  - 3:16It's important to highlight that where you place search, directly impacts where the field animates to, when active.
  - For example, Apple TV uses the Search Tab to present the various genres, and categories available before searching.
  - 8:04On both platforms, you can place your apps primary Search Field... in the trailing position of the Toolbar at the top of the Sidebar, or at the top of a dedicated Search Tab or section.
  - 8:49You should also consider placing Search in the toolbar if you would expect search results to appear in the detail view of your app.
  - For example, here in Freeform, where Search directly filters the boards below.
