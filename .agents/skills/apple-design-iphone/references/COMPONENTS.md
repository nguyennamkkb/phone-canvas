# Tri thức theo từng phần — apple-design-iphone

Mỗi mục là một phần giao diện/khái niệm, được đúc kết từ trang HIG tương ứng trong `research/01-mobile-design/notes/` (đọc qua trình duyệt thật).

## Button

**Mục đích:** A button initiates an instantaneous action.

**Cấu trúc:** Buttons | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Always include a press state for a custom button.
- Keep the number of prominent buttons to one or two per view.
- Use style — not size — to visually distinguish the preferred choice among multiple options.
- Ensure that each button clearly communicates its purpose.
- Consider using text when a short label communicates more clearly than an icon.
- Use a flexible-height push button only when you need to display tall or variable height content.
- Use square buttons in a view, not in the window frame.
- Prefer using a symbol in a square button.
- Use the system-provided help button to display your help documentation.
- Include no more than one help button per window.
- Use the following locations for guidance.
- Use a help button within a view, not in the window frame.

**Nên tránh:**
- Avoid applying a similar color to button labels and content layer backgrounds.
- Avoid using labels to introduce square buttons.
- Avoid displaying text that introduces a help button.
- Avoid creating a custom button that uses a white background fill and black text or icons.

**Thông số:**
- If your buttons measure 60 pts or larger, add 4 pts of padding around them to keep the hover effect from overlapping.

**Accessibility:**
- As a general rule, a button needs a hit region of at least 44x44 pt — in visionOS, 60x60 pt — to ensure that people can select it easily, whether they use a fingertip, a pointer, their eyes, or a remote.
- System buttons offer a range of styles that support customization while providing built-in interaction states, accessibility support, and appearance adaptation.
- By contrast, placing two buttons of different sizes near each other can make the interface look confusing and inconsistent.
- It tends to be easier for people to see a button when it’s enclosed in a shape that uses a contrasting background fill.
- When you place a button inline with content, it gains a material effect that contrasts with the background to ensure legibility.

## Text & Typography

**Mục đích:** Your typographic choices can help you display legible text, convey an information hierarchy, communicate important content, and express your brand or style.

**Cấu trúc:** Typography | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use font sizes that most people can read easily.
- Keep in mind that font weight can also impact how easy text is to read.
- Minimize the number of typefaces you use, even in a highly customized interface.
- Prioritize important content when responding to text-size changes.
- Consider using symbols when you need to convey a concept or depict an object, especially within text.
- Consider using the built-in text styles.
- Make sure your app’s layout adapts to all font sizes.
- Increase the size of meaningful interface icons as font size increases.
- Keep text truncation to a minimum as font size increases.
- Consider adjusting your layout at large font sizes.
- Maintain a consistent information hierarchy regardless of the current font size.
- Use the variants listed below to achieve a look that’s consistent with other apps on the platform.

**Nên tránh:**
- Avoid truncating text in scrollable regions unless people can open a separate view to read the rest of the content.

**Thông số:**
- Point size based on image resolution of 144 ppi for @2x and 216 ppi for @3x designs.
- Point size based on image resolution of 144 ppi for @2x designs.
- Point size based on image resolution of 72 ppi for @1x and 144 ppi for @2x designs.

**Accessibility:**
- If testing shows that some of your text is difficult to read, consider using a larger type size, increasing contrast by modifying the text or background colors, or using typefaces designed for optimized legibility, like the system fonts.
- Mixing too many different typefaces can obscure your information hierarchy and hinder readability, in addition to making an interface feel internally inconsistent or poorly designed.
- Text styles also allow text to scale proportionately when people change the system’s text size or make accessibility adjustments, like turning on Larger Text in Accessibility settings.
- Using text styles with the system fonts also ensures support for Dynamic Type and larger accessibility type sizes (where available), which let people choose the text size that works for them.
- For guidance, see Supporting Dynamic Type.

## Toolbar

**Mục đích:** A toolbar provides convenient access to frequently used commands, controls, navigation, and search.

**Cấu trúc:** Toolbars | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Choose items deliberately to avoid overcrowding.
- Add a More menu to contain additional actions.
- Prioritize less important actions for inclusion in the More menu.
- Reduce the use of toolbar backgrounds and tinted controls.
- Prefer using standard components in a toolbar.
- Consider temporarily hiding toolbars for a distraction-free experience.
- Aim for a word or short phrase that distills the purpose of the window or view, and keep the title under 15 characters long so you leave enough room for other controls.
- Use the standard Back and Close buttons.
- Prefer the standard symbols for each, and don’t use a text label that says Back or Close.
- Provide actions that support the main tasks people perform.
- Make sure the meaning of each control is clear.
- Prefer simple, recognizable symbols for items instead of text, except for actions like edit that aren’t well-represented by symbols.

**Nên tránh:**
- Avoid applying a similar color to toolbar item labels and content layer backgrounds.
- Avoid creating a vertical toolbar.
- Avoid using a pull-down menu in a toolbar.

**Accessibility:**
- In contrast to a toolbar, a tab bar is specifically for navigating between areas of an app.
- In contrast, it doesn’t make sense to provide a toolbar item for every menu item, because not all menu commands are important enough or used often enough to warrant space in the toolbar.

## Tab bar

**Mục đích:** A tab bar lets people navigate between top-level sections of your app.

**Cấu trúc:** Tab bars | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use a tab bar to support navigation, not to provide actions.
- Make sure the tab bar is visible when people navigate to different sections of your app.
- Use the appropriate number of tabs required to help people navigate your app.
- Include tab labels to help with navigation.
- Consider using SF Symbols to provide familiar, scalable tab bar icons.
- Prefer filled symbols or icons for consistency with the platform.
- Use a badge to indicate that critical information is available.
- Reserve badges for critical information so you don’t dilute their impact and meaning.
- Choose a font for tab items, including a different font for the selected item
- Add button icons, like settings and search

**Nên tránh:**
- Avoid applying a similar color to tab labels and content layer backgrounds.

**Thông số:**
- The height of a tab bar is 68 points, and its top edge is 46 points from the top of the screen; you can’t change either of these values.

## Navigation & search

**Mục đích:** To submit feedback on documentation, visit Feedback Assistant.

**Cấu trúc:** Navigation and search | Apple Developer Documentation · Anh nghien cuu

## List & table

**Mục đích:** Lists and tables present data in one or more columns of rows.

**Cấu trúc:** Lists and tables | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Prefer displaying text in a list or table.
- Let people edit a table when it makes sense.
- Provide appropriate feedback when people select a list item.
- Keep item text succinct so row content is comfortable to read.
- Use descriptive column headings in a multicolumn table.
- Use nouns or short noun phrases with title-style capitalization, and don’t add ending punctuation.
- Choose a table or list style that coordinates with your data and platform.
- Choose a row style that fits the information you need to display.
- Use an info button only to reveal more information about a row’s content.
- Consider using alternating row colors in a multicolumn table.
- Use an outline view instead of a table view to present hierarchical data.

**Nên tránh:**
- Avoid adding an index to a table that displays controls — like disclosure indicators — in the trailing ends of its rows.

**Accessibility:**
- In contrast, a table that lists options often highlights a row only briefly before adding an image — such as a checkmark — indicating that the item is selected.
- Consider ways to preserve readability of text that might otherwise get clipped or truncated.

## Menu & action

**Mục đích:** To submit feedback on documentation, visit Feedback Assistant.

**Cấu trúc:** Menus and actions | Apple Developer Documentation · Anh nghien cuu

## Modality

**Mục đích:** Modality is a design technique that presents content in a separate, dedicated mode that prevents interaction with the parent view and requires an explicit action to dismiss.

**Cấu trúc:** Modality | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Ensure that people receive critical information and, if necessary, act on it
- Provide options that let people confirm or modify their most recent action
- Give people an immersive experience or help them concentrate on a complex task
- Aim to keep modal tasks simple, short, and streamlined.
- Take care to avoid creating a modal experience that feels like an app within your app.
- Consider using a full-screen modal style for in-depth content or a complex task.
- Always give people an obvious way to dismiss a modal view.
- Make it easy to identify a modal view’s task.
- Let people dismiss a modal view before presenting another one.

**Accessibility:**
- In contrast, apps may also offer nonmodal types of full-screen experiences; for guidance, see Going full screen. visionOS apps can offer a range of immersive experiences; for guidance, see Immersive experiences.

## Search

**Mục đích:** People use various search techniques to find content on their device, within an app, and within a document or file.

**Cấu trúc:** Searching | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Aim to make your app’s content searchable through a single location.
- Use a descriptive placeholder text, a scope bar, or a title to help reinforce what someone is currently searching.
- Provide suggestions to make searching easier.
- Take privacy into consideration before displaying search history.
- Make your app’s content searchable in Spotlight.
- Use Spotlight to offer advanced file-search capabilities within the context of your app.
- Prefer using the system-provided open and save views.

## Onboarding

**Mục đích:** Onboarding can help people get a quick start using your app or game.

**Cấu trúc:** Onboarding | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Consider providing a collection of context-specific tips instead of a single onboarding flow.
- Keep onboarding content focused on the experience you provide.
- Aim to display your splash screen just long enough for people to absorb the information at a glance without feeling that it’s delaying their experience.
- Consider including enough media and other content in your software package to prevent people from having to wait for downloads to complete before they can start interacting with your app or game.
- Let the App Store display agreements and disclaimers so people can read them before downloading your app or game.
- Provide reasonable default settings so most people can immediately start interacting with your app or game without performing additional configuration.
- Prefer letting people experience your app or game before prompting them for ratings or purchases.

**Nên tránh:**
- Avoid displaying licensing details within your onboarding flow.

**Accessibility:**
- In contrast, if you try to teach too much, people can feel overwhelmed and may be less likely to remember what they learned.

## Feedback

**Mục đích:** Feedback helps people know what’s happening, discover what they can do next, understand the results of actions, and avoid mistakes.

**Cấu trúc:** Feedback | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Consider integrating status feedback into your interface.
- Use alerts to deliver critical — and ideally actionable — information.
- Show people when a command can’t be carried out and help them understand why.

**Nên tránh:**
- Avoid displaying an indeterminate progress indicator — such as a loading indicator — in a watchOS app.

**Accessibility:**
- In contrast, a warning about possible data loss needs to interrupt people so they have a chance to avoid the problem.
- Make sure all feedback is accessible.
- In contrast, don’t warn people when data loss is the expected result of their action.

## Loading

**Mục đích:** The best content-loading experience finishes before people become aware of it.

**Cấu trúc:** Loading | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Let people do other things in your app or game while they wait for content to load.
- Consider using the Background Assets framework to schedule asset downloads — like game level packs, 3D character models, and textures — to occur immediately after installation, during updates, or at other nondisruptive times.
- Consider designing a more engaging experience by using custom animations and elements that match the style of your game.

## Settings

**Mục đích:** People expect apps and games to just work, but they also appreciate having ways to customize the experience to fit their needs.

**Cấu trúc:** Settings | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Aim to provide default settings that give the best experience to the largest number of people.
- Minimize the number of settings you offer.
- Make settings available in ways people expect.
- Respect people’s systemwide settings and avoid including redundant versions of them in your custom settings area.
- Add only the most rarely changed options to the system-provided Settings app.
- Include a settings item in the App menu.
- Update the window’s title to reflect the currently visible pane.

**Nên tránh:**
- Avoid using settings to ask for setup information you can get in other ways.
- Avoid adding settings buttons to a window’s toolbar, because doing so decreases the space available for essential commands that people use frequently.

**Accessibility:**
- On all Apple platforms, the system-provided Settings app lets people adjust things like the overall appearance of the system, network connections, account details, accessibility requirements, and language and region settings.
- People expect to use the system-provided Settings app to manage global options like accessibility accommodations, scrolling behavior, and authentication methods, and they expect all apps and games to adhere to their choices.

## Text entry

**Mục đích:** When you need information from people, design ways that make it easy for them to provide it without making mistakes.

**Cấu trúc:** Entering data | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use a secure text-entry field when appropriate.
- Always ask people to enter their password or use biometric or keychain authentication.
- Consider using an expansion tooltip to show the full version of clipped or truncated text in a field.

**Nên tránh:**
- Never prepopulate a password field.

## Undo & redo

**Mục đích:** Undo and redo gives people easy ways to reverse many types of actions, which can also help people explore and experiment safely as they learn a new interface or task.

**Cấu trúc:** Undo and redo | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Consider giving people the option to revert multiple changes at once.
- Provide undo and redo buttons only when necessary.
- Place undo and redo commands in the Edit menu and support the standard keyboard shortcuts.

**Nên tránh:**
- Avoid placing unnecessary limits on the number of times people can undo or redo.
- Avoid redefining standard gestures for undo and redo.

## Color

**Mục đích:** Judicious use of color can enhance communication, evoke your brand, provide visual continuity, communicate status and feedback, and help people understand information.

**Cấu trúc:** Color | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use color consistently throughout your interface, especially when you use it to help communicate information like status or interactivity.
- Test your app’s color scheme under a variety of lighting conditions.
- Test tvOS apps on multiple brands of HD and 4K TVs, and with different display settings.
- Consider how artwork and translucency affect nearby colors.
- Consider how the colors you use might be perceived in other countries and cultures.
- Make sure the colors in your app send the message you intend.
- Use APIs like Color to apply system colors.
- Use wide color to enhance the visual experience on compatible displays.
- Note that you need to use a wide color display to design wide color images and select P3 colors.
- Provide color space–specific image and color variations if necessary.
- Consider choosing a limited color palette that coordinates with your app logo.
- Use color sparingly, especially on glass.

**Nên tránh:**
- Avoid using the same color to mean different things.
- Avoid relying solely on color to differentiate between objects, indicate interactivity, or communicate essential information.
- Avoid using colors that make it hard to perceive content in your app.
- Avoid hard-coding system color values in your app.
- Avoid redefining the semantic meanings of dynamic system colors.
- Avoid using similar colors in control labels if your app has a colorful background.

**Accessibility:**
- The system defines colors that look good on various backgrounds and appearance modes, and can automatically adapt to vibrancy and accessibility settings.
- Make sure all your app’s colors work well in light, dark, and increased contrast contexts. iOS, iPadOS, macOS, and tvOS offer both light and dark appearance settings.
- System colors vary subtly depending on the system appearance, adjusting to ensure proper color differentiation and contrast for text, symbols, and other elements.
- With the Increase Contrast setting turned on, the color differences become far more apparent.
- If you define a custom color, make sure to supply light and dark variants, and an increased contrast option for each variant that provides a significantly higher amount of visual differentiation.

## Dark Mode

**Mục đích:** Dark Mode is a systemwide appearance setting that uses a dark color palette to provide a comfortable viewing experience tailored for low-light environments.

**Cấu trúc:** Dark Mode | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Ensure that your app looks good in both appearance modes.
- Test your content to make sure that it remains comfortably legible in both appearance modes.
- Design separate interface icons for the light and dark appearances if necessary.
- Make sure full-color images and icons look good in both appearances.
- Use the same asset if it looks good in both the light and dark appearances.
- Use asset catalogs to combine your assets into a single named image.
- Use the system-provided label colors for labels.
- Use system views to draw text fields and text views.
- Include some transparency in custom component backgrounds when appropriate.

**Nên tránh:**
- Avoid offering an app-specific appearance setting.
- Avoid using hard-coded color values or colors that don’t adapt.

**Accessibility:**
- In Dark Mode, the system uses a dark color palette for all screens, views, menus, and controls, and may also use greater perceptual contrast to make foreground content stand out against the darker backgrounds.
- For example, in Dark Mode with Increase Contrast and Reduce Transparency turned on (both separately and together), you may find places where dark text is less legible when it’s on a dark background.
- You might also find that turning on Increase Contrast in Dark Mode can result in reduced visual contrast between dark text and a dark background.
- Although people with strong vision might still be able to read lower contrast text, such text could be illegible for many.
- For guidance, see Accessibility.

## Materials

**Mục đích:** A material is a visual effect that creates a sense of depth, layering, and hierarchy between foreground and background elements.

**Cấu trúc:** Materials | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use the regular variant when background content might create legibility issues, or when components have a significant amount of text, such as alerts, sidebars, or popovers.
- Use this variant for components that float above media backgrounds — such as photos and videos — to create a more immersive content experience.
- Use standard materials and effects — such as blur, vibrancy, and blending modes — to convey a sense of structure in the content beneath Liquid Glass.
- Choose materials and effects based on semantic meaning and recommended usage.
- Choose when to allow vibrancy in custom views and controls.
- Test your interface in a variety of contexts to discover when vibrancy enhances the appearance and improves communication.
- Choose a background blending mode that complements your interface design. macOS defines two modes that blend background content: behind window and within window.
- Prefer translucency to opaque colors in windows.
- Use the following examples for guidance.
- Use UIVibrancyEffectStyle.label for standard text.
- Use UIVibrancyEffectStyle.secondaryLabel for descriptive text like footnotes and subtitles.
- Use UIVibrancyEffectStyle.tertiaryLabel for inactive elements, and only when text doesn’t need high legibility.

**Nên tránh:**
- Avoid selecting a material or effect based on the apparent color it imparts to your interface, because system settings can change its appearance and behavior.
- Avoid removing or replacing material backgrounds for modal sheets when they’re provided by default.

**Thông số:**
- If the underlying content is bright, consider adding a dark dimming layer of 35% opacity.

**Accessibility:**
- In contrast to Liquid Glass, the standard materials help with visual differentiation within the content layer.
- For optimal contrast and legibility, determine whether to add a dimming layer behind components with clear Liquid Glass:
- When you use system-defined vibrant colors, you don’t need to worry about colors seeming too dark, bright, saturated, or low contrast in different contexts.
- Poor contrast between the material and systemGray3 label
- Good contrast between the material and vibrant color label

## Motion

**Mục đích:** Beautiful, fluid motions bring the interface to life, conveying status, providing feedback and instruction, and enriching the visual experience of your app or game.

**Cấu trúc:** Motion | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Add motion purposefully, supporting the experience without overshadowing it.
- Strive for realistic feedback motion that follows people’s gestures and expectations.
- Aim for brevity and precision in feedback animations.
- Consider using animated symbols where it makes sense.
- Make sure your game’s motion looks great by default on each platform you support.
- Let people customize the visual experience of your game to optimize performance or battery life.
- Consider using fades when you need to relocate an object.
- Consider giving people a stationary frame of reference.
- Design considerations for vision and motion

**Nên tránh:**
- Avoid showing objects that oscillate in a sustained way.

**Thông số:**
- In particular, you want to avoid showing an oscillation that has a frequency of around 0.2 Hz because people can be very sensitive to this frequency.

**Accessibility:**
- System components might also adjust their motion in response to factors like accessibility settings or different input methods.
- Although adjusting translucency and contrast can help in this scenario, consider also keeping a window’s size fairly small.
- In contrast, if the entire surrounding area appears to move — for example, in a game that automatically moves a player through space — people can feel unwell.

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

## Accessibility

**Mục đích:** Accessible user interfaces empower everyone to have a great experience with your app or game.

**Cấu trúc:** Accessibility | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Make sure people can adjust the size of your text or icons to make them more legible, visible, and comfortable to read.
- Use recommended defaults for custom type sizes.
- Consider increasing the font size when using a thin weight.
- Consider allowing people to customize color schemes such as chart colors or game characters so they can personalize your interface in a way that’s comfortable for them.
- Support text-based ways to enjoy audio and video.
- Ensure your interface offers a comfortable experience for people with limited dexterity or mobility.
- Strive to meet the recommended minimum control size for each platform to ensure controls and menus are comfortable for all when tapping and clicking.
- Consider spacing between controls as important as size.
- Include enough padding between elements to reduce the chance that someone taps the wrong control.
- Support simple gestures for common interactions.
- Let people use the keyboard alone to navigate and interact with your app.
- Ensure that people can navigate your interface using easy-to-remember and consistent interactions.

**Nên tránh:**
- Avoid overriding system-defined keyboard shortcuts and evaluate your app to ensure it works well with Full Keyboard Access.
- Avoid autoplaying audio and video content without also providing controls to start and stop it.
- Avoid anchoring content to the wearer’s head, which may make them feel stuck and confined, and also prevent them from using assistive technologies like Pointer Control.

**Thông số:**
- In general, it works well to add about 12 points of padding around elements that include a bezel.
- For elements without a bezel, about 24 points of padding works well around the element’s visible edges.

**Accessibility:**
- # Accessibility | Apple Developer Documentation
- Accessible user interfaces empower everyone to have a great experience with your app or game.
- When you design for accessibility, you reach a larger audience and create a more inclusive experience.
- An accessible interface allows people to experience your app or game regardless of their capabilities or how they use their devices.
- Accessibility makes information and interactions available to everyone.
