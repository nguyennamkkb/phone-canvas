# Từ điển HIG — apple-design-ipad

Đúc kết **11 trang Apple Human Interface Guidelines** trong `research/02-ipad/notes/`. Bản tổng hợp, không nguyên văn.

## Apple Pencil and Scribble | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble
- **Cấu trúc:** Apple Pencil and Scribble | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Support behaviors people intuitively expect when using a marking instrument.
  - Let people choose when to switch between Apple Pencil and finger input.
  - Let people make a mark the moment Apple Pencil touches the screen.
  - Use this information to affect the strokes Apple Pencil makes, such as by varying thickness and intensity.
  - Provide visual feedback to indicate a direct connection with content.
  - Make sure Apple Pencil appears to directly and immediately manipulate content it touches onscreen.
  - Avoid letting Apple Pencil appear to initiate seemingly disconnected actions, or affect content on other parts of the screen.
  - Design a great left- and right-handed experience.
  - Avoid placing controls in locations that may be obscured by either hand.
  - Use hover to help people predict what will happen when Apple Pencil touches the screen.

## Designing for iPadOS | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/designing-for-ipados
- **Cấu trúc:** Designing for iPadOS | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Display. iPad has a large, high-resolution display.
  - Take advantage of the large display to elevate the content people care about, minimizing modal interfaces and full-screen transitions, and positioning onscreen controls where they’re easy to reach, but not in the way.
  - Use viewing distance and input mode to help you determine the size and density of the onscreen content you display.
  - Let people use Multi-Touch gestures, a physical keyboard or trackpad, or Apple Pencil, and consider supporting unique interactions that combine multiple input modes.
  - Adapt seamlessly to appearance changes — like device orientation, multitasking modes, Dark Mode, and Dynamic Type — and transition effortlessly to running in macOS, letting people choose the configurations that work best for them.

## Drag and drop | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
- **Cấu trúc:** Drag and drop | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
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

## Keyboards | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/keyboards
- **Cấu trúc:** Keyboards | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
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

## Multitasking | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/multitasking
- **Cấu trúc:** Multitasking | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Avoid interfering with the system-provided multitasking behavior.

## Pointing devices | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/pointing-devices
- **Cấu trúc:** Pointing devices | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Avoid redefining systemwide trackpad gestures.
  - Remember that Mac users can customize the gestures for performing systemwide actions.
  - Provide a consistent experience in your app, whether people are using gestures, eyes, a pointing device, or a keyboard.
  - Let people use the pointer to reveal and hide controls that automatically minimize or fade out.
  - Provide a consistent experience when people press and hold a modifier key while interacting with objects in your app.
  - Use clear, simple images to create custom accessories.
  - Consider using the accessory transition to signal a change in an element’s state or behavior.
  - Use highlight for a small element that has a transparent background.
  - Use lift for a small element that has an opaque background.
  - Use hover for large elements and customize the scale, tint, and shadow attributes as needed (for guidance, see Customizing pointers).
- **Thông số:**
  - In general, it works well to add about 12 points of padding around elements that include a bezel; for elements without a bezel, it works well to add about 24 points of padding around the element’s visible edges.

## Popovers | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/popovers
- **Cấu trúc:** Popovers | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Use a popover to expose a small amount of information or functionality.
  - Consider using popovers when you want more room for content.
  - Make sure a popover’s arrow points as directly as possible to the element that revealed it.
  - Use a Close button for confirmation and guidance only.
  - Always save work when automatically closing a nonmodal popover.
  - Never show a cascade or hierarchy of popovers, in which one emerges from another.
  - Make sure nothing displays on top of a popover, except for an alert.
  - Make a popover only big enough to display its contents and point to the place it came from.
  - Provide a smooth transition when changing the size of a popover.
  - Avoid using the word popover in help documentation.

## Sidebars | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/sidebars
- **Cấu trúc:** Sidebars | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Group hierarchy with disclosure controls if your app has a lot of content.
  - Consider using familiar symbols to represent items in the sidebar.
  - Consider letting people hide the sidebar.
  - Avoid hiding the sidebar by default to ensure that it remains discoverable.
  - Make sure any sidebar icon colors you choose serve a clear purpose.
  - Consider automatically hiding and revealing a sidebar when its container window resizes.
  - Avoid putting critical information or actions at the bottom of a sidebar.

## Split views | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/split-views
- **Cấu trúc:** Split views | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Consider letting people drag and drop content between panes.
  - Prefer using a split view in a regular — not a compact — environment.
  - Set reasonable defaults for minimum and maximum pane sizes.
  - Consider letting people hide a pane when it makes sense.
  - Provide multiple ways to reveal hidden panes.
  - Avoid using thicker divider styles unless you have a specific need.
  - Choose a split view layout that keeps the panes looking balanced.
  - Display a single title above a split view, helping people understand the content as a whole.
  - Choose the title’s alignment based on the type of content the secondary pane contains.

## Windows | Apple Developer Documentation
`hig` · https://developer.apple.com/design/human-interface-guidelines/windows
- **Cấu trúc:** Windows | Apple Developer Documentation · Anh nghien cuu
- **Đúc kết:**
  - Make sure that your windows adapt fluidly to different sizes to support multitasking and multiwindow workflows.
  - Choose the right moment to open a new window.
  - Avoid opening new windows as default behavior unless it makes sense for your app.
  - Consider providing the option to view content in a new window.
  - Consider letting people view content in a new window using a command in a context menu or in the File menu.
  - Avoid making custom window frames or controls, and don’t try to replicate the system-provided appearance.
  - Use the term window in user-facing content.
  - Make sure window controls don’t overlap toolbar items.
  - Consider letting people use a gesture to open content in a new window.
  - Make sure custom windows use the system-defined appearances.
- **Thông số:**
  - By default, a window measures 1280x720 pt.

## Tablet & large-screen adaptive design — Material 3
`web` · https://m3.material.io/foundations/adaptive-design/overview
- **Cấu trúc:** Tablet / large-screen (Material 3) · Breakpoints (thay "window size classes") · Canonical layouts · Adaptive strategies · Quy tắc · Checklist
