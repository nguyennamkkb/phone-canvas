# Từ điển HIG — apple-design-iphone

Đúc kết **26 trang Apple Human Interface Guidelines** trong `research/01-mobile-design/notes/`. Bản tổng hợp, không nguyên văn.

## Accessibility | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/accessibility
- **Cấu trúc:** Accessibility | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use Accessibility Inspector to highlight accessibility issues with your interface and to understand how your app represents itself to people using system accessibility features.
  - Make sure people can adjust the size of your text or icons to make them more legible, visible, and comfortable to read.
  - Use recommended defaults for custom type sizes.
  - Consider increasing the font size when using a thin weight.
  - Strive to meet color contrast minimum standards.
  - Use standard contrast calculators to ensure your UI meets acceptable levels.
  - Consider allowing people to customize color schemes such as chart colors or game characters so they can personalize your interface in a way that’s comfortable for them.
  - Support text-based ways to enjoy audio and video.
  - Ensure your interface offers a comfortable experience for people with limited dexterity or mobility.
  - Strive to meet the recommended minimum control size for each platform to ensure controls and menus are comfortable for all when tapping and clicking.
- **Thông số:**
  - In general, it works well to add about 12 points of padding around elements that include a bezel.
  - For elements without a bezel, about 24 points of padding works well around the element’s visible edges.

## Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/bars
- **Cấu trúc:** Apple Developer Documentation

## Branding | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/branding
- **Cấu trúc:** Branding | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use your brand’s unique voice and tone in all the written communication you display.
  - Minimize its use on controls and instead use it intentionally for primary actions or status indicators, like badges for unread content or an icon for the selected tab in a tab bar.
  - Ensure branding always defers to content.
  - Aim to incorporate branding in refined, unobtrusive ways that don’t distract people from your experience.
  - Place UI in expected locations, use standard symbols to represent common actions, and rely on established conventions for navigation and modality.
  - Avoid using a launch screen as a branding opportunity.

## Buttons | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/buttons
- **Cấu trúc:** Buttons | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Always include a press state for a custom button.
  - Keep the number of prominent buttons to one or two per view.
  - Use style — not size — to visually distinguish the preferred choice among multiple options.
  - Avoid applying a similar color to button labels and content layer backgrounds.
  - Ensure that each button clearly communicates its purpose.
  - Consider using text when a short label communicates more clearly than an icon.
  - Use a flexible-height push button only when you need to display tall or variable height content.
  - Use square buttons in a view, not in the window frame.
  - Prefer using a symbol in a square button.
  - Avoid using labels to introduce square buttons.
- **Thông số:**
  - As a general rule, a button needs a hit region of at least 44x44 pt — in visionOS, 60x60 pt — to ensure that people can select it easily, whether they use a fingertip, a pointer, their eyes, or a remote.
  - Aim to place buttons so their centers are always at least 60 pts apart.
  - If your buttons measure 60 pts or larger, add 4 pts of padding around them to keep the hover effect from overlapping.

## Color | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/color
- **Cấu trúc:** Color | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Avoid using the same color to mean different things.
  - Use color consistently throughout your interface, especially when you use it to help communicate information like status or interactivity.
  - Make sure all your app’s colors work well in light, dark, and increased contrast contexts. iOS, iPadOS, macOS, and tvOS offer both light and dark appearance settings.
  - Test your app’s color scheme under a variety of lighting conditions.
  - Test tvOS apps on multiple brands of HD and 4K TVs, and with different display settings.
  - Consider how artwork and translucency affect nearby colors.
  - Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information.
  - Avoid using colors that make it hard to perceive content in your app.
  - Consider how the colors you use might be perceived in other countries and cultures.
  - Make sure the colors in your app send the message you intend.

## Dark Mode | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/dark-mode
- **Cấu trúc:** Dark Mode | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Avoid offering an app-specific appearance setting.
  - Ensure that your app looks good in both appearance modes.
  - Test your content to make sure that it remains comfortably legible in both appearance modes.
  - Avoid using hard-coded color values or colors that don’t adapt.
  - Aim for sufficient color contrast in all appearances.
  - Design separate interface icons for the light and dark appearances if necessary.
  - Make sure full-color images and icons look good in both appearances.
  - Use the same asset if it looks good in both the light and dark appearances.
  - Use asset catalogs to combine your assets into a single named image.
  - Use the system-provided label colors for labels.

## Designing for iOS | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/designing-for-ios
- **Cấu trúc:** Designing for iOS | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Display. iPhone has a medium-size, high-resolution display.
  - Adapt seamlessly to appearance changes — like device orientation, Dark Mode, and Dynamic Type — letting people choose the configurations that work best for them.
  - Support interactions that accommodate the way people usually hold their device.

## Entering data | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/entering-data
- **Cấu trúc:** Entering data | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use a secure text-entry field when appropriate.
  - Always ask people to enter their password or use biometric or keychain authentication.
  - Consider using an expansion tooltip to show the full version of clipped or truncated text in a field.

## Feedback | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/feedback
- **Cấu trúc:** Feedback | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Consider integrating status feedback into your interface.
  - Use alerts to deliver critical — and ideally actionable — information.
  - Show people when a command can’t be carried out and help them understand why.
  - Avoid displaying an indeterminate progress indicator — such as a loading indicator — in a watchOS app.

## Inclusion | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/inclusion
- **Cấu trúc:** Inclusion | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Consider the tone of your copy from different perspectives.
  - Avoid using specialized or technical terms without defining them.
  - Consider carefully before including humor.
  - Consider designing an onboarding flow that helps people who are new to your experience take a step-by-step approach while letting others skip straight to the content they want.
  - Avoid images and language that exclude people with disabilities.
  - Take a people-first approach when writing about people with disabilities.
  - Prioritize simplicity and perceivability.
  - Prefer familiar, consistent interactions that make tasks simple to perform, and ensure that everyone can perceive your content, whether they use sight, hearing, or touch.

## Layout (Human Interface Guidelines)
`hig` · https://developer.apple.com/design/human-interface-guidelines/layout
- **Cấu trúc:** HIG — Layout · TL;DR · Visual hierarchy · Adaptability · Size classes · Guides & safe area · Platform considerations · macOS · tvOS · visionOS
- **Thông số:**
  - - Tôn trọng safe area: inset nội dung chính **60 pt** trên/dưới, **80 pt** hai bên.
  - - Khoảng cách control: tâm các nút cách nhau **≥ 60 pt**.

## Lists and tables | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- **Cấu trúc:** Lists and tables | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Prefer displaying text in a list or table.
  - Let people edit a table when it makes sense.
  - Provide appropriate feedback when people select a list item.
  - Keep item text succinct so row content is comfortable to read.
  - Consider ways to preserve readability of text that might otherwise get clipped or truncated.
  - Use descriptive column headings in a multicolumn table.
  - Use nouns or short noun phrases with title-style capitalization, and don’t add ending punctuation.
  - Choose a table or list style that coordinates with your data and platform.
  - Choose a row style that fits the information you need to display.
  - Use an info button only to reveal more information about a row’s content.

## Loading | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/loading
- **Cấu trúc:** Loading | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Let people do other things in your app or game while they wait for content to load.
  - Consider using the Background Assets framework to schedule asset downloads — like game level packs, 3D character models, and textures — to occur immediately after installation, during updates, or at other nondisruptive times.
  - Consider designing a more engaging experience by using custom animations and elements that match the style of your game.

## Materials | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/materials
- **Cấu trúc:** Materials | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use the regular variant when background content might create legibility issues, or when components have a significant amount of text, such as alerts, sidebars, or popovers.
  - Use this variant for components that float above media backgrounds — such as photos and videos — to create a more immersive content experience.
  - Use standard materials and effects — such as blur, vibrancy, and blending modes — to convey a sense of structure in the content beneath Liquid Glass.
  - Choose materials and effects based on semantic meaning and recommended usage.
  - Avoid selecting a material or effect based on the apparent color it imparts to your interface, because system settings can change its appearance and behavior.
  - Consider contrast and visual separation when choosing a material to combine with blur and vibrancy effects.
  - Choose when to allow vibrancy in custom views and controls.
  - Test your interface in a variety of contexts to discover when vibrancy enhances the appearance and improves communication.
  - Choose a background blending mode that complements your interface design. macOS defines two modes that blend background content: behind window and within window.
  - Prefer translucency to opaque colors in windows.
- **Thông số:**
  - If the underlying content is bright, consider adding a dark dimming layer of 35% opacity.

## Menus and actions | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/menus-and-actions
- **Cấu trúc:** Menus and actions | Apple Developer Documentation · Anh nghien cuu

## Modality | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/modality
- **Cấu trúc:** Modality | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Ensure that people receive critical information and, if necessary, act on it
  - Provide options that let people confirm or modify their most recent action
  - Give people an immersive experience or help them concentrate on a complex task
  - Aim to keep modal tasks simple, short, and streamlined.
  - Take care to avoid creating a modal experience that feels like an app within your app.
  - Consider using a full-screen modal style for in-depth content or a complex task.
  - Always give people an obvious way to dismiss a modal view.
  - Make it easy to identify a modal view’s task.
  - Let people dismiss a modal view before presenting another one.

## Motion | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/motion
- **Cấu trúc:** Motion | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Add motion purposefully, supporting the experience without overshadowing it.
  - Strive for realistic feedback motion that follows people’s gestures and expectations.
  - Aim for brevity and precision in feedback animations.
  - Consider using animated symbols where it makes sense.
  - Make sure your game’s motion looks great by default on each platform you support.
  - Let people customize the visual experience of your game to optimize performance or battery life.
  - Consider using fades when you need to relocate an object.
  - Consider giving people a stationary frame of reference.
  - Avoid showing objects that oscillate in a sustained way.
  - Design considerations for vision and motion
- **Thông số:**
  - In particular, you want to avoid showing an oscillation that has a frequency of around 0.2 Hz because people can be very sensitive to this frequency.

## Navigation and search | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/navigation-and-search
- **Cấu trúc:** Navigation and search | Apple Developer Documentation · Anh nghien cuu

## Onboarding | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/onboarding
- **Cấu trúc:** Onboarding | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Consider providing a collection of context-specific tips instead of a single onboarding flow.
  - Keep onboarding content focused on the experience you provide.
  - Aim to display your splash screen just long enough for people to absorb the information at a glance without feeling that it’s delaying their experience.
  - Consider including enough media and other content in your software package to prevent people from having to wait for downloads to complete before they can start interacting with your app or game.
  - Avoid displaying licensing details within your onboarding flow.
  - Let the App Store display agreements and disclaimers so people can read them before downloading your app or game.
  - Provide reasonable default settings so most people can immediately start interacting with your app or game without performing additional configuration.
  - Prefer letting people experience your app or game before prompting them for ratings or purchases.

## Searching | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/searching
- **Cấu trúc:** Searching | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Aim to make your app’s content searchable through a single location.
  - Use a descriptive placeholder text, a scope bar, or a title to help reinforce what someone is currently searching.
  - Provide suggestions to make searching easier.
  - Take privacy into consideration before displaying search history.
  - Make your app’s content searchable in Spotlight.
  - Use Spotlight to offer advanced file-search capabilities within the context of your app.
  - Prefer using the system-provided open and save views.

## Settings | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/settings
- **Cấu trúc:** Settings | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Aim to provide default settings that give the best experience to the largest number of people.
  - Minimize the number of settings you offer.
  - Make settings available in ways people expect.
  - Avoid using settings to ask for setup information you can get in other ways.
  - Respect people’s systemwide settings and avoid including redundant versions of them in your custom settings area.
  - Add only the most rarely changed options to the system-provided Settings app.
  - Include a settings item in the App menu.
  - Avoid adding settings buttons to a window’s toolbar, because doing so decreases the space available for essential commands that people use frequently.
  - Update the window’s title to reflect the currently visible pane.

## Tab bars | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/tab-bars
- **Cấu trúc:** Tab bars | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use a tab bar to support navigation, not to provide actions.
  - Make sure the tab bar is visible when people navigate to different sections of your app.
  - Use the appropriate number of tabs required to help people navigate your app.
  - Include tab labels to help with navigation.
  - Consider using SF Symbols to provide familiar, scalable tab bar icons.
  - Prefer filled symbols or icons for consistency with the platform.
  - Use a badge to indicate that critical information is available.
  - Reserve badges for critical information so you don’t dilute their impact and meaning.
  - Avoid applying a similar color to tab labels and content layer backgrounds.
  - Choose a font for tab items, including a different font for the selected item
- **Thông số:**
  - The height of a tab bar is 68 points, and its top edge is 46 points from the top of the screen; you can’t change either of these values.

## Toolbars | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/toolbars
- **Cấu trúc:** Toolbars | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Choose items deliberately to avoid overcrowding.
  - Add a More menu to contain additional actions.
  - Prioritize less important actions for inclusion in the More menu.
  - Reduce the use of toolbar backgrounds and tinted controls.
  - Avoid applying a similar color to toolbar item labels and content layer backgrounds.
  - Prefer using standard components in a toolbar.
  - Consider temporarily hiding toolbars for a distraction-free experience.
  - Aim for a word or short phrase that distills the purpose of the window or view, and keep the title under 15 characters long so you leave enough room for other controls.
  - Use the standard Back and Close buttons.
  - Prefer the standard symbols for each, and don’t use a text label that says Back or Close.

## Typography | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/typography
- **Cấu trúc:** Typography | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use font sizes that most people can read easily.
  - Keep in mind that font weight can also impact how easy text is to read.
  - Minimize the number of typefaces you use, even in a highly customized interface.
  - Prioritize important content when responding to text-size changes.
  - Consider using symbols when you need to convey a concept or depict an object, especially within text.
  - Consider using the built-in text styles.
  - Make sure your app’s layout adapts to all font sizes.
  - Increase the size of meaningful interface icons as font size increases.
  - Keep text truncation to a minimum as font size increases.
  - Avoid truncating text in scrollable regions unless people can open a separate view to read the rest of the content.
- **Thông số:**
  - Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
  - Point size based on image resolution of 144 ppi for @2x designs.
  - Point size based on image resolution of 72 ppi for @1x and 144 ppi for @2x designs.

## Undo and redo | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/undo-and-redo
- **Cấu trúc:** Undo and redo | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Avoid placing unnecessary limits on the number of times people can undo or redo.
  - Consider giving people the option to revert multiple changes at once.
  - Provide undo and redo buttons only when necessary.
  - Avoid redefining standard gestures for undo and redo.
  - Place undo and redo commands in the Edit menu and support the standard keyboard shortcuts.

## Writing | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/writing
- **Cấu trúc:** Writing | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Think about who you’re talking to, so you can figure out the type of vocabulary you’ll use.
  - Consider what people are doing while they’re using your app — both in the physical world and within the app itself.
  - Choose words that are easily understood and convey the right thing.
  - Choose simple, plain language and write with accessibility and localization in mind, avoiding jargon and gendered terminology.
  - Prioritize clarity and avoid the temptation to be too cute or clever with your labels.
  - Choose a style for each UI element type and use it consistently throughout your app — for example, title case for all alerts or sentence case for all headlines.
  - Give clear guidance and use consistent language throughout processes with multiple steps.
  - Make it clear when a flow is complete by using language like “Done.”
  - Avoid using we altogether because it may be unclear who the “we” in question refers to.
  - Make sure you describe gestures correctly on each device — for example, not saying “click” for a touch device like iPhone or iPad where you mean “tap.”
