# Tri thức theo từng phần — apple-design-ipad

Mỗi mục là một phần giao diện/khái niệm, được đúc kết từ trang HIG tương ứng trong `research/02-ipad/notes/` (đọc qua trình duyệt thật).

## Sidebar

**Mục đích:** A sidebar appears on the leading side of a view and lets people navigate between areas of your app or top-level collections of content, like folders and playlists.

**Cấu trúc:** Sidebars | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Group hierarchy with disclosure controls if your app has a lot of content.
- Consider using familiar symbols to represent items in the sidebar.
- Consider letting people hide the sidebar.
- Make sure any sidebar icon colors you choose serve a clear purpose.
- Consider automatically hiding and revealing a sidebar when its container window resizes.

**Nên tránh:**
- Avoid hiding the sidebar by default to ensure that it remains discoverable.
- Avoid putting critical information or actions at the bottom of a sidebar.

## Split view

**Mục đích:** A split view manages the presentation of multiple adjacent panes of content, each of which can contain a variety of components, including tables, collections, images, and custom views.

**Cấu trúc:** Split views | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Consider letting people drag and drop content between panes.
- Prefer using a split view in a regular — not a compact — environment.
- Set reasonable defaults for minimum and maximum pane sizes.
- Consider letting people hide a pane when it makes sense.
- Provide multiple ways to reveal hidden panes.
- Choose a split view layout that keeps the panes looking balanced.
- Display a single title above a split view, helping people understand the content as a whole.
- Choose the title’s alignment based on the type of content the secondary pane contains.

**Nên tránh:**
- Avoid using thicker divider styles unless you have a specific need.

**Accessibility:**
- In contrast, if the secondary pane contains a single main view of important content, consider placing the title above the primary view to give the content more room.

## Popover

**Mục đích:** A popover is a transient view that appears above other content when people click or tap a control or interactive area.

**Cấu trúc:** Popovers | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Use a popover to expose a small amount of information or functionality.
- Consider using popovers when you want more room for content.
- Make sure a popover’s arrow points as directly as possible to the element that revealed it.
- Use a Close button for confirmation and guidance only.
- Always save work when automatically closing a nonmodal popover.
- Make sure nothing displays on top of a popover, except for an alert.
- Make a popover only big enough to display its contents and point to the place it came from.
- Provide a smooth transition when changing the size of a popover.
- Make your app or game dynamically adjust its layout based on the size class of the content area.
- Reserve popovers for wide views; for compact views, use all available screen space by presenting information in a full-screen modal view like a sheet instead.
- Consider letting people detach a popover.
- Make minimal appearance changes to a detached popover.

**Nên tránh:**
- Never show a cascade or hierarchy of popovers, in which one emerges from another.
- Avoid making a popover too big.
- Avoid using the word popover in help documentation.
- Avoid using a popover to show a warning.
- Avoid displaying popovers in compact views.

## Multitasking

**Mục đích:** Multitasking lets people switch quickly from one app to another, performing tasks in each.

**Cấu trúc:** Multitasking | Apple Developer Documentation · Anh nghien cuu

**Nên tránh:**
- Avoid interfering with the system-provided multitasking behavior.

**Accessibility:**
- In contrast, people don’t generally need to know the moment a routine or secondary task completes.

## Window

**Mục đích:** A window presents UI views and components in your app or game.

**Cấu trúc:** Windows | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Make sure that your windows adapt fluidly to different sizes to support multitasking and multiwindow workflows.
- Choose the right moment to open a new window.
- Consider providing the option to view content in a new window.
- Consider letting people view content in a new window using a command in a context menu or in the File menu.
- Use the term window in user-facing content.
- Make sure window controls don’t overlap toolbar items.
- Consider letting people use a gesture to open content in a new window.
- Make sure custom windows use the system-defined appearances.
- Prefer using a window to present a familiar interface and to support familiar tasks.
- Choose an initial window size that minimizes empty areas within it.
- Aim for an initial shape that suits a window’s content.
- Choose a minimum and maximum size for each window to help keep your content looking great.

**Nên tránh:**
- Avoid opening new windows as default behavior unless it makes sense for your app.
- Avoid creating custom window UI.
- Avoid making custom window frames or controls, and don’t try to replicate the system-provided appearance.
- Avoid putting critical information or actions in a bottom bar, because people often relocate a window in a way that hides its bottom edge.

**Thông số:**
- By default, a window measures 1280x720 pt.

**Accessibility:**
- In contrast, if you want to present a familiar, UI-centric interface, it generally works best to use a window.

## Pointer

**Mục đích:** People can use a pointing device like a trackpad or mouse to navigate the interface and initiate actions.

**Cấu trúc:** Pointing devices | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Remember that Mac users can customize the gestures for performing systemwide actions.
- Provide a consistent experience in your app, whether people are using gestures, eyes, a pointing device, or a keyboard.
- Let people use the pointer to reveal and hide controls that automatically minimize or fade out.
- Provide a consistent experience when people press and hold a modifier key while interacting with objects in your app.
- Use clear, simple images to create custom accessories.
- Consider using the accessory transition to signal a change in an element’s state or behavior.
- Use highlight for a small element that has a transparent background.
- Use lift for a small element that has an opaque background.
- Use hover for large elements and customize the scale, tint, and shadow attributes as needed (for guidance, see Customizing pointers).
- Prefer the system-provided pointer appearances for standard buttons and text-entry areas.
- Prefer system-provided pointer effects for custom elements that behave like standard elements.
- Use pointer effects in consistent ways throughout your app.

**Nên tránh:**
- Avoid redefining systemwide trackpad gestures.
- Avoid creating gratuitous pointer and content effects.
- Avoid displaying instructional text with a pointer.

**Thông số:**
- In general, it works well to add about 12 points of padding around elements that include a bezel; for elements without a bezel, it works well to add about 24 points of padding around the element’s visible edges.

**Accessibility:**
- When people move the pointer close to an element, the system starts transforming the pointer’s shape as soon as it reaches the element’s hit region.
- Because an element’s hit region typically extends beyond its visible boundaries, the pointer begins to transform before it appears to touch the element itself, creating the illusion that the element is pulling the pointer toward it.
- Add padding around interactive elements to create comfortable hit regions.
- You might need to experiment to determine the right size for an element’s hit region.
- If the hit region is too small, it can make people feel that they have to be extra precise when interacting with the element.

## Keyboard

**Mục đích:** A physical keyboard can be an essential input device for entering text, playing games, controlling apps, and more.

**Cấu trúc:** Keyboards | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Support Full Keyboard Access when possible.
- Show or hide the Spotlight search field.
- Show the Spotlight search results window.
- Display the definition of the selected word in the Dictionary app.
- Hide the windows of the currently running app.
- Hide the windows of all other running apps.
- Minimize all windows of the active app to the Dock.
- Display a dialog for choosing a document to open.
- Toggle between the current and last input source.
- Use modifier keys in ways that people expect.
- Prefer the Command key as the main modifier key in a custom keyboard shortcut.
- Prefer the Shift key as a secondary modifier that complements a related shortcut.

**Nên tránh:**
- Avoid using the Control key as a modifier.
- Avoid adding Shift to a shortcut that uses the upper character of a two-character key.
- Avoid creating a new shortcut by adding a modifier to an existing shortcut for an unrelated command.

**Accessibility:**
- To test Full Keyboard Access in your app or game, turn it on in the Accessibility area of the system-supplied Settings app.
- Turn VoiceOver on or off.
- Decrease screen contrast.
- Increase screen contrast.

## Apple Pencil

**Mục đích:** Apple Pencil helps make drawing, handwriting, and marking effortless and natural, in addition to performing well as a pointer and UI interaction tool.

**Cấu trúc:** Apple Pencil and Scribble | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Support behaviors people intuitively expect when using a marking instrument.
- Let people choose when to switch between Apple Pencil and finger input.
- Let people make a mark the moment Apple Pencil touches the screen.
- Use this information to affect the strokes Apple Pencil makes, such as by varying thickness and intensity.
- Provide visual feedback to indicate a direct connection with content.
- Make sure Apple Pencil appears to directly and immediately manipulate content it touches onscreen.
- Design a great left- and right-handed experience.
- Use hover to help people predict what will happen when Apple Pencil touches the screen.
- Prefer showing a preview value that’s near the middle in a range of dynamic values.
- Consider using hover to support relevant interactions close to where people are marking.
- Prefer showing hover previews for Apple Pencil, not for a pointing device.
- Respect people’s settings for the double-tap gesture when they make sense in your app.

**Nên tránh:**
- Avoid letting Apple Pencil appear to initiate seemingly disconnected actions, or affect content on other parts of the screen.
- Avoid placing controls in locations that may be obscured by either hand.
- Avoid using hover to initiate an action.
- Avoid using the double-tap gesture to perform an action that modifies content.
- Avoid distracting people while they write.

**Accessibility:**
- In contrast to double tap and squeeze, barrel roll is naturally related to marking and doesn’t make sense for performing an interface action.

## Drag & drop

**Mục đích:** Using drag and drop, people can move or duplicate selected photos, text, and other content by dragging the selection from one location to another.

**Cấu trúc:** Drag and drop | Apple Developer Documentation · Anh nghien cuu

**Nguyên tắc:**
- Support multi-item drag and drop when it makes sense.
- Prefer letting people undo a drag-and-drop operation.
- Consider offering multiple versions of dragged content, ordered from highest to lowest fidelity.
- Display a drag image as soon as people drag a selection about three points.
- Display the drag image until people drop the content.
- Show people whether a destination can accept dragged content.
- Display highlighting or other visual cues only while the content is positioned above the destination, removing the visual feedback when people drag the content away.
- Provide feedback when dropped content needs time to transfer.
- Provide feedback when dropped content initiates a task or action.
- Let people perform multiple simultaneous drag activities.
- Consider letting people drag content from your app into the Finder.
- Note that a drag-and-drop clipping isn’t related to the Clipboard.

**Accessibility:**
- On a Mac, people can interact with a pointing device, use full keyboard access mode, or use VoiceOver to perform drag and drop.

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
