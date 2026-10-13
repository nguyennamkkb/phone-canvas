---
name: apple-design-iphone-duo
description: "Senior-level iPhone Duo (dual-display foldable iPhone) design skill for the Apple ecosystem. Use when designing or auditing iPhone Duo experiences — device poses, size-class transitions, reserved regions (fold, cameras), displacement patterns, split vs overlay arrangements, vertical toolbars/tab bars, continuity of state across displays, multitasking, scenes, hinge, and camera. Self-contained 14-section operating skill with a deep reference library (POSES, RESERVED-REGIONS, ARRANGEMENTS, VERTICAL-BARS, CONTINUITY-AND-SCENES, ADOPTION-TESTING) plus components, guidelines, specs, image analysis and assets."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.1"
  platform: "iPhone Duo (foldable)"
  updated: "2026-09-24"
  sources: "research/05-iphone-duo/"
---

# iPhone Duo Design — Senior Skill

<!-- refs -->
> **Tham chiếu:** [COMPONENTS](references/COMPONENTS.md) · [GUIDELINES](references/GUIDELINES.md) · [WWDC-INSIGHTS](references/WWDC-INSIGHTS.md) · [SPECS](references/SPECS.md) · [IMAGES](references/IMAGES.md) · [SOURCES](references/SOURCES.md) · [API](references/API.md) · [POSES](references/POSES.md) · [RESERVED-REGIONS](references/RESERVED-REGIONS.md) · [ARRANGEMENTS](references/ARRANGEMENTS.md) · [VERTICAL-BARS](references/VERTICAL-BARS.md) · [CONTINUITY-AND-SCENES](references/CONTINUITY-AND-SCENES.md) · [ADOPTION-TESTING](references/ADOPTION-TESTING.md)





> Nguồn nền: HIG *Designing for iPhone Duo* (9/2026) + **6 Tech Talks 2026**: *Design for iPhone Duo*,
> *Prepare your app*, *Raise the bar*, *Strike a pose*, *Leverage multiple displays and scenes*,
> *Build a great camera experience* + apple.com/iphone-duo specs. Chi tiết thô: `research/05-iphone-duo/`.

## 1. Platform Mindset

- **Sinh ra để làm gì:** một chiếc iPhone **gập**, **hai màn hình** (outer 5,4" / inner 7,6"), có
  **bản lề** và **hai camera trước**. Gập = điện thoại quen thuộc; mở = màn lớn nhất từng có trên iPhone.
- **Hoàn cảnh người dùng:** ngoài đường gập một tay ↔ ngồi/đặt bàn mở hai tay; **đổi tư thế liên tục
  trong cùng một phiên**; có thể dựng như lều, gập như sách, tựa trên cạnh.
- **Mục tiêu platform:** **continuity across poses** — cùng app, cùng state, chỉ đổi cách bày.
  Mở/gập **không** được làm đứt luồng, mất dữ liệu, hay đổi chức năng.
- **Ràng buộc gốc:** hai tỉ lệ màn hình khác nhau; **nếp gập** chia màn khi gập một phần; **vùng camera**
  (ngoài luôn hiện, trong chỉ khi bật); **safe area & layout margin bất đối xứng** vì control dồn một cạnh;
  bản lề có góc liên tục; hỗ trợ **đa nhiệm 50/50**, **nhiều scene**, **scene accessory**.
- **Hệ quả thiết kế:** thiết kế **resizable** theo size class, **không** width cố định, **không** phụ thuộc
  màn hình; **một nguồn state**; **chrome dồn một cạnh**; **displacement** thay vì vẽ lại.

## 2. Design Principles

**WHEN designing on iPhone Duo → DO / DON'T / BECAUSE**

| DO | DON'T | BECAUSE |
|---|---|---|
| Thiết kế theo **2 size class** (outer = compact width, inner = regular) | Thiết kế layout riêng cho từng pose / hard-code "7,6 inch" | Cùng app chạy ở 6 pose, nhiều tỉ lệ |
| Giữ **chức năng + state** giống nhau giữa hai màn | Ẩn/đổi tính năng theo màn | Người dùng mở/gập liên tục |
| Chỉ **thêm một tầng hierarchy** ở màn trong | Nhồi nội dung không liên quan | Màn lớn cho thêm ngữ cảnh, không đổi việc |
| Để **control dồn cạnh trailing** (hệ thống lo sẵn) | Tự chế thanh ngang cho outer | Outer **rộng–thấp**; cần giữ không gian dọc |
| Dùng **component hệ thống** để tự né nếp gập | Tự vẽ control đè lên nếp | Button rơi đúng nếp rất khó bấm |
| Dùng **ArangementView** khi layout là split/overlay | Bọc navigation **trong** arrangement | Arrangement không có hạ tầng điều hướng |
| **Displace** phần tử tương tác ra khỏi tâm | Displace **nội dung cuộn** | Cuộn tự adapt; dịch sẽ phá liên tục |
| Xử lý **từng cạnh safe area riêng** | Giả định hai bên bằng nhau | Safe area Duo **bất đối xứng** |
| Dùng **size class**, environment, scene bounds | `UIScreen.main`, kiểm tra orientation | Sẽ deprecate; inner **không** theo orientation |
| Giữ **cùng cạnh vật lý** trong RTL | Đảo thanh sang cạnh khác | Thanh gắn với phần cứng (camera) |

**Quy tắc vàng:** *Gập/mở là một lần đổi kích thước — không phải một lần "tải lại" trải nghiệm.*

## 3. Information Architecture

| Cấu trúc | Outer (compact) | Inner (regular) |
|---|---|---|
| Navigation stack | ✓ một nhánh | ✓ giữ nguyên stack, thêm cột khi rộng |
| Tab bar | ✓ (dọc ở cạnh) | ✓ — **tuỳ chọn** chuyển thành **sidebar** (app nhiều thông tin) |
| Split view (NavigationSplitView) | 1 pane (collapse) | 2 pane, giãn quanh nếp; khi gập một phần → **50/50** |
| **ArrangementView** | split → 1 view; overlay → chồng lớp | split 2 vùng; overlay 2 bên khi gập |
| Sidebar | ✗ | ✓ ở inner (thay tab bar nếu hợp) |
| Sheet | Nút xếp **dọc**; có thể tắt thanh dọc (sheet 1 nút) | **Căn giữa**, thanh **ngang** |
| Alert / menu / context menu | Hệ thống tự né nếp | Tự né nếp |
| Modal / full-screen | Media/camera | Media, làm việc, canvas |
| Multi-window (scene) | **KHÔNG tạo được cửa sổ mới** | ✓ tạo được |

Nguyên tắc: **cùng cây điều hướng, khác cách bày**. Đổi pose **không** mất `navigation path`,
**không** mất selection, **không** reset scroll/form/media.

## 4. Layout Rules

### 4.1 Size class theo pose
| Vị trí | Portrait | Landscape | Ghi chú |
|---|---|---|---|
| Outer | compact H + regular V | compact H + compact **V** | như iPhone thường |
| Inner | **regular H + regular V** | regular H + regular V | đủ chỗ cho sidebar |

- **Inner không tôn trọng `supportedInterfaceOrientations`** → dùng size class.
- **Không tham chiếu main screen** (dùng environment/trait/scene bounds).
- `UIRequiresFullScreen` vẫn được tôn trọng nhưng app **vẫn resize**; inner **scale** kể cả multitasking.

### 4.2 Reserved regions (3 vùng)
- **Camera ngoài (occlusion):** luôn hiện, mở rộng thành **Dynamic Island** khi có Live Activities.
- **Camera trong (occlusion):** chỉ active khi camera bật; inactive ⇒ **không thấy, width = 0**.
- **Nếp gập (division):** chỉ active khi **gập một phần**; khi phẳng ⇒ inactive, **width = 0**.
- API: `reservedRegion` (GeometryProxy / UIView), `ReservedRegion` / `UIView.ReservedRegion`;
  hỏi cả **inactive** để quyết định cấu trúc (vd. grid **cột chẵn** khi có division region).

### 4.3 Displacement (thay vì vẽ lại)
- Phần tử tự adapt được → **đi một mình**; phần tử liên quan → **đi cùng nhau** (giữ quan hệ).
- **Không** displace nội dung cuộn (article/feed/list/document).
- Gập sách → alert/menu dồn **nửa trailing**; dựng bàn → **trên** = nội dung nhìn xa, **dưới** = control.
- Ưu tiên ngữ cảnh: search đang focus nằm **trên bàn phím**, chỉ đổi width/vị trí.
- Hệ thống tự lo: alert, context menu, sheet, action sheet, menu, popover, split view,
  button/menu/toolbar button (né nếp).

### 4.4 Quy tắc bố cục
- **Không width cố định, breakpoint, hay số đo gắn màn hình.**
- Dùng **layout margins + horizontal safe area insets** (offset tránh control tự động).
- **Bất đối xứng:** xử lý từng cạnh riêng; background tràn ra ngoài safe area (`ignoresSafeArea`).
- **Bo góc đồng tâm:** `ConcentricRectangle` / `UICornerConfiguration` (iOS 26+).
- **Nội dung căn giữa** thường cần **offset** để không bị control che.
- Grid: **số cột chẵn** khi có division region; tăng spacing quanh nếp; giữ mỗi ô trong vùng của nó.
- **Immersive không cuộn** (Calculator) có thể tràn **full width**; có thể **mix** (nền/header full width,
  nội dung cuộn thì inset).

### 4.5 Token phần cứng (đã xác minh)
| Hạng mục | Màn trong | Màn ngoài |
|---|---|---|
| Kích thước | 7,6" OLED gập | 5,4" OLED |
| Độ phân giải | 1878 × 2670 px | 1398 × 2034 px |
| Mật độ | 430 ppi | 460 ppi |
| Point (3×) | **669 × 951 pt** | **466 × 678 pt** |
| Refresh | ProMotion tới 120 Hz | — |
| Độ sáng | 1000 / 1600 / 3000 nits (typical/HDR/outdoor) | — |
| Camera trước | under-display 1080p60 (max) | ultrawide 4K120 (max) |

## 5. Component Library

| Component | Dùng ở đâu | Hành vi Duo | Best practice | Lỗi thường gặp |
|---|---|---|---|---|
| **Adaptive container** | mọi nơi | Size class đổi khi đổi pose | Bám size class; reflow nhẹ | Dựng lại màn khi gập |
| **Split view** (`NavigationSplitView`/`UISplitViewController`) | inner | Outer: collapse 1 pane; inner: 2 pane, **50/50 khi gập** | Để hệ thống lo; giữ selection | Cột trống không placeholder |
| **ArrangementView (split)** | inner | Chia ngang khi rộng>cao, dọc khi cao>rộng; giới hạn trục ⇒ có thể chỉ 1 view | Dùng khi layout là HStack/VStack; **navigation ở ngoài** | Đặt trong List/ScrollView |
| **ArrangementView (overlay)** | inner | Chồng lớp; **tách 2 bên khi gập**; collapse được; `overlayArrangementZIndex` | Dùng khi có quan hệ foreground/background | Dùng khi cần main–detail không che nhau |
| **Vertical toolbar** | outer + inner landscape | Item cạnh trailing; trên=dẫn (Back/Close), rồi prominent (Done) | Cung cấp **title + symbol**; symbol-only ưu tiên; `AxisBehavior` khi cần | Tự dựng toolbar rời; tự thêm spacing |
| **Vertical tab bar** | outer + inner landscape | Bottom-aligned trong dải dọc; có thể chuyển **sidebar** ở inner | 3–5 mục; giữ lựa chọn khi đổi pose | Mất tab đang chọn khi mở rộng |
| **Sheet** | cả hai | Outer: nút **dọc** (hoặc tắt); inner: **căn giữa**, thanh ngang; gập → né nếp | Dùng system sheet để auto né nếp | Sheet reset khi gập |
| **Alert / menu / popover** | cả hai | Tự né reserved region | Dùng hệ thống | Tự vẽ → rơi vào nếp |
| **List / Grid** | cả hai | 1 cột (outer) → nhiều cột (inner) | Cột chẵn khi có division; tăng spacing quanh nếp | Nhồi 3 cột ở outer |
| **Media + PiP** | cả hai | PiP ghim **đỉnh**; app co dọc; gập → video nửa màn | Adapt realtime theo chiều cao | Ngắt khi đổi pose |
| **Camera preview** | inner (+ accessory outer) | 2 camera trước; virtual auto-switch (1080p60, no depth) hoặc device riêng + direction coordinator | Offset preview khi thừa không gian; `dynamicAspectRatio`; rotation coordinator; mirror khi rear hướng tới người dùng | Preview lệch chiều/gương sai khi đổi màn |
| **Scene accessory** | outer | `CameraCaptureAccessory` khi full screen inner + camera active; khả dụng **động** | Theo dõi availability; đăng ký cùng view camera | Giả định accessory luôn có |
| **Live Activity / Dynamic Island** | outer | Dynamic Island **mở rộng dọc** trong dải cạnh | Không đè vùng camera | Đặt item quan trọng ngay trên Dynamic Island |
| **Status bar** | outer + inner landscape | **Dọc** trong dải cạnh | Để hệ thống lo | Vẽ status bar giả |
| **Empty / Loading / Error** | cả hai | Giữ nguyên qua pose | Có placeholder trong từng pane | Trắng màn khi chuyển pose |

### 5.1 API mới của iPhone Duo (tóm tắt)

| Khu vực | API chính (SwiftUI · UIKit) |
|---|---|
| Size class / bo góc | `horizontalSizeClass` · `UITraitCollection`; `ConcentricRectangle` · `UICornerConfiguration` (iOS 26+) |
| **Reserved regions** | `GeometryProxy.reservedRegion` · `UIView.reservedRegion` (`ReservedRegion` · `UIView.ReservedRegion`); loại `.division` / `.occlusion`; `includeInactive` |
| **Arrangements** | `ArrangementView` · `UIArrangementViewController`; `.arrangementViewStyle(.split/.overlay)`; `.axes(...)`; `overlayArrangementZIndex` |
| **Bars** | `AxisBehavior`; `ToolbarItemVisibilityPriority`; `ToolbarVerticalCompressionBehavior`; `ToolbarOverflowMenu`; `toolbarVerticalEdge`; `toolbarVerticalBehavior`; `cancellationAction`/`topBarPinnedTrailing` · `pinnedTrailingGroup`/`leftItemSupplementsBackButton`; Badge API (iOS 26) |
| **Scene / accessory** | `UIWindowSceneActivationAction`; `sceneAccessory`; `CameraCaptureAccessory`; `onAvailabilityChange` |
| **Hinge** | `onHingeChange` · `UIHingeInteraction` — closed / partially open / fully open + **góc liên tục**; `nil` ⇒ reset state |
| **Camera** | Virtual Front Camera; device type outer/inner ultrawide; `AVCaptureDeviceDirectionCoordinator`; `AVCaptureDeviceDescriptor`; rotation coordinator; `dynamicAspectRatio`; `videoGravity` |

> Bảng đầy đủ (mục đích · cách dùng · availability · recipe phối hợp): [references/API.md](references/API.md).
> Phần lớn API Duo gắn với **SDK 27.1**; `Concentric*` và Badge có từ **iOS 26**. Không truy cập
> `UIScreen.main`, không kiểm tra orientation.

## 6. Screen Inventory

| Màn hình | Outer | Inner |
|---|---|---|
| Lock / Always-On | Liếc nhanh, ẩn dữ liệu nhạy cảm | Lock Screen căn giữa, phụ trợ dồn góc |
| Home / Feed | 1 cột | Giãn cột / 2 cột |
| List ↔ Detail (Mail) | **1 pane** (list **hoặc** detail) | **2 pane** cạnh nhau |
| Notes (master–detail) | 1 pane | Pane lệch khi mở; **50/50 khi gập** |
| Media / Reader | Điện thoại | Nhập tâm, reframe theo tỉ lệ |
| Camera / FaceTime | Chụp nhanh | Viewfinder lớn + **teleprompter/preview phụ ở outer** |
| Multitasking | — | 2 app side-by-side; control ở mép ngoài |
| Editor / Create | Tác vụ nhanh | Không gian làm việc, undo rõ |
| Settings | 1 cột | Cột rộng/2 cột |
| Empty / Error / Loading | Giữ nguyên | Placeholder từng pane |

## 7. UX Patterns

**Continue · Expand · Split · Overlay · Displace · Pin · Fold**

- **Continue:** mở giữa phiên → tiếp tục đúng chỗ (video, form, scroll, selection).
- **Expand:** thêm ngữ cảnh ở inner (cột phụ, metadata) — **không đổi chức năng**.
- **Split vs Overlay:** main–detail không được che → **split**; foreground/background chấp nhận che → **overlay**.
- **Displace:** chỉ điều khiển & nội dung ngắn; **không** nội dung cuộn.
- **Pin:** PiP ghim đỉnh; app co dọc theo thời gian thực.
- **Fold:** nếp gập là **đường chia tự nhiên**; hệ thống nudge tương tác ra khỏi nếp.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | ≥ 44×44 pt ở cả hai màn; tương tác tránh vùng gập |
| **Bars ở cạnh** | Back/Close trên cùng → prominent → nhóm còn lại; **không tự thêm spacing** |
| **Fold / Hinge** | `onHingeChange` / `UIHingeInteraction`: closed / partially open / fully open + **góc liên tục**; dùng cho **hiệu ứng**, không cho layout; nil ⇒ reset state |
| **Multitasking** | Kéo app bằng home indicator; 50/50; control ở mép ngoài; PiP ghim đỉnh |
| **Scenes** | Nhiều instance UI (nếu iPad đã hỗ trợ); **chỉ inner tạo cửa sổ mới**; xử lý lỗi |
| **Keyboard** | Bàn phím + accessory bar **ở lại với bàn phím** (không chuyển dọc) |
| **Camera** | Virtual front camera (auto) **hoặc** device riêng + **direction coordinator** (descriptor, main-actor safe) + **rotation coordinator** |
| **RTL** | Thanh giữ **cùng cạnh vật lý**; nội dung tự đảo quanh thanh |
| **Voice / Pencil / Pointer** | Như iOS/iPadOS; đảm bảo mọi hành động chính có đường thay thế |

## 9. Accessibility

- **VoiceOver:** focus & thứ tự đọc **giữ nguyên khi đổi pose**; công bố khi bố cục đổi lớn.
- **Dynamic Type:** cả hai màn; bố cục tái cấu trúc (2 cột → 1), không cắt chữ.
- **Touch target:** ≥ 44×44 pt ở màn trong lẫn ngoài; **tránh vùng gập**.
- **Contrast:** đạt chuẩn ở cả hai màn; lưu ý nền kính/Liquid Glass trên nội dung.
- **Transparency/Motion:** thanh dọc **có nền** khi bật **Reduce Transparency**; tôn trọng Reduce Motion
  khi reflow.
- **Checklist:** [ ] focus/state qua pose · [ ] Dynamic Type cả hai màn · [ ] touch target ·
  [ ] tránh nếp gập · [ ] reduce transparency/motion · [ ] RTL giữ cạnh thanh · [ ] ẩn dữ liệu nhạy cảm khi gập.

## 10. Performance Rules

- **Không reload** dữ liệu khi đổi pose — cache + **một nguồn state**.
- Reflow phải **rẻ** (chỉ đổi frame/size), tránh dựng lại view tree.
- Không nhồi 2 mục đích vào màn trong; mỗi pane một vai trò.
- Không animation nặng khi gập/mở; ưu tiên reflow ngắn/tức thời.
- Không phân cấp sâu; giữ nguyên navigation stack khi đổi pose.
- **Nhiều scene/2 màn hình = 2 view tree**: quản lý bộ nhớ; 1 direction coordinator **cho mỗi view**.
- Camera: tắt sensor-orientation compensation sau khi adopt rotation coordinator.

## 11. Senior Review Checklist

- [ ] **Continuity:** gập/mở giữa phiên không mất media/form/scroll/selection/navigation path.
- [ ] **Pose matrix:** chạy đủ **6 pose** (closed, open P/L, book, propped, tent).
- [ ] **Size class:** chỉ compact H (outer) & regular (inner); không fixed width / main screen / orientation check.
- [ ] **Reserved regions:** fold né đúng (control/tương tác), nội dung cuộn **không** bị displace;
      camera trong active/inactive OK; grid cột chẵn.
- [ ] **IA:** outer 1 pane ↔ inner 2 pane; chỉ **thêm một tầng** hierarchy; không mất tab khi mở rộng.
- [ ] **Bars:** dọc ở outer + inner landscape; ngang ở inner portrait; ordering đúng; overflow/priority hợp lý;
      RTL giữ cạnh.
- [ ] **Arrangement:** chọn split/overlay đúng; navigation **ngoài**; không nằm trong List/ScrollView.
- [ ] **Multitasking/scenes:** split trái/phải; PiP ghim đỉnh; scene mới chỉ trên inner + xử lý lỗi.
- [ ] **Accessibility:** mục 9 pass.
- [ ] **Empty/Loading/Error:** giữ qua pose, có placeholder từng pane.
- [ ] **Build SDK 27.1** + chạy **App Resizability**.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Kéo giãn UI iPhone khi mở | Lãng phí màn lớn; dòng đọc quá dài |
| Hard-code "7,6 inch" / fixed width | Vỡ ở pose và multitasking khác |
| Kiểm tra orientation / dùng `UIScreen.main` | Inner không theo orientation; main screen sẽ deprecate |
| Reset về Home khi gập/mở | Mất continuity |
| Hai state riêng cho hai màn | Dữ liệu lệch khi chuyển pose |
| Tự vẽ control đè nếp gập | Khó bấm; hệ thống đã có cơ chế né |
| Displace nội dung cuộn | Phá tính liên tục của bài viết/feed |
| Đặt navigation trong ArrangementView | Arrangement không có hạ tầng điều hướng |
| Tạo cửa sổ mới trên outer | Outer **không** cho phép |
| Giả định safe area hai bên bằng nhau | Duo bất đối xứng |
| Dựng toolbar rời (UIToolbar) | Không được chuyển trục dọc |
| Sheet nhiều control vẫn tắt thanh dọc | Mất chỗ vô ích; ngược lại sheet 1 nút bật thanh dọc |
| Camera dùng virtual khi cần depth/4K | Virtual chỉ có tính năng chung (1080p60, no depth) |
| Không reset pitch-bend khi hinge nil | Giá trị "ma" trên thiết bị không bản lề |

## 13. Design System Rules (token & quy chuẩn)

| Hạng mục | Quy định |
|---|---|
| **Typography** | SF Pro / Dynamic Type; giới hạn độ rộng đọc ở inner; **không** scale chữ theo màn |
| **Spacing** | Nhịp 4/8 pt; lề 16 pt; padding control 12/24 pt; giữ vùng an toàn quanh nếp |
| **Radius** | `ConcentricRectangle` / `UICornerConfiguration`; nội dung không chạm vùng cong/nếp |
| **Elevation** | Liquid Glass/material hệ thống; không shadow nặng |
| **Motion** | Reflow 200–300 ms khi đổi pose; tôn trọng Reduce Motion |
| **Color** | Semantic; dark mode hạng nhất; tương phản đạt ở cả hai màn |
| **Adaptivity** | **Size-class-first**; cấm hard-code màn hình; **một nguồn state** |
| **Bars** | Dọc ở outer + inner landscape; trục item theo `AxisBehavior`; overflow theo priority |
| **Poses** | 6 pose; gập một phần ⇒ né nếp + pane 50/50; dựng bàn ⇒ trên nội dung / dưới control |

## 14. AI Decision Framework

```
IF platform == iPhone Duo
THEN
  Primary goal = continuity across poses (gập = nhanh, mở = rộng)
  Layout       = size-class-first (outer compact H, inner regular) ; 1 cột ↔ 2 pane
  Navigation   = cùng cây; tab bar ↔ sidebar; KHÔNG reset khi đổi pose
  Chrome       = dồn cạnh trailing (toolbar/tab bar/status bar) ; ngoại lệ inner portrait
  State        = một nguồn sự thật; giữ scroll/selection/form/media
  Regions      = né camera ngoài (always) & camera trong (active) & nếp gập (khi gập)
  Ưu tiên      = 1) Liền mạch  2) Nội dung  3) Hành động
  Tránh        = fixed width · main screen · orientation check · 2 state · dừng media ·
                 nhồi nhiều cột ở outer · navigation trong ArrangementView

# Đổi pose
IF người dùng gập/mở giữa phiên      THEN giữ nguyên state & vị trí (KHÔNG restart)
IF máy gập một phần                  THEN né nếp; pane → 50/50; alert/menu dồn trailing
IF inner landscape                   THEN giữ thanh dọc (liền mạch với outer)
IF inner portrait                    THEN thanh NGANG (ngoại lệ)

# Bố cục nội dung
IF layout hiện tại là HStack/VStack   THEN split arrangement
IF layout hiện tại là ZStack          THEN overlay arrangement
IF main–detail, không được che nhau   THEN split view/arrangement
IF foreground–background, che được    THEN overlay arrangement
IF cần thêm tầng ở inner              THEN 2 pane (Mail list|detail) — KHÔNG đổi chức năng
IF nội dung cuộn                      THEN KHÔNG displace
IF grid + có division region          THEN ưu tiên số cột CHẴN, tăng spacing quanh nếp

# Thanh & overflow
IF outer landscape (rộng–thấp)        THEN dễ overflow → đặt visibility priority (nhóm trước, item sau)
IF navigation-focused                 THEN toolbar nén trước (mặc định)
IF task-oriented                      THEN tab bar nén trước
IF item symbol-only                   THEN cho lên trục dọc; text-only giữ ngang
IF item chuyển symbol↔text            THEN AxisBehavior = horizontal-only
IF sheet 1 control/bottom-heavy app   THEN cân nhắc TẮT thanh dọc

# Hệ thống & thiết bị
IF cần cửa sổ mới                     THEN chỉ trên inner; dùng UIWindowSceneActivationAction
IF cần UI phụ trên màn khác           THEN scene accessory (CameraCaptureAccessory khi camera active)
IF cần phản ứng bản lề                THEN onHingeChange/UIHingeInteraction cho HIỆU ỨNG (không layout)
IF cần full khả năng camera           THEN device riêng + direction coordinator (virtual chỉ 1080p60/no depth)
IF camera/ảnh bị lệch chiều           THEN rotation coordinator + tắt sensor compensation
IF layout căn giữa                    THEN offset tránh control; hoặc tràn full width nếu không cuộn
IF Dynamic Type lớn                   THEN tái bố cục cột (2→1) thay vì cắt chữ
```

**Nguồn:** `research/05-iphone-duo/{SUMMARY,CHECKLIST,DIGEST,INDEX}.md` · `notes/hig-designing-for-iphone-duo.md` ·
`notes/apple-iphone-duo-specs.md` · `transcripts/2026-techtalk-*.md` (6 talks) · `assets/` (22 ảnh).
