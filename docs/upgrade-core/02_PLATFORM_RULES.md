# 02 — Platform Rules (machine-checkable)
> Ghi chú 2026-10-02: các trích dẫn `docs/screen-regions.md`, `docs/devices.md` đọc khi file còn tồn tại; worktree hiện tại đã xóa 4 file `docs/*.md` (không phải do track này) — số đo đã chép nguyên văn vào đây và Phụ lục A nên doc này đứng độc lập.

Track 008 · designer research-only (KHÔNG code). Nguồn HIG đọc live ngày 2026-10-02 qua kimi-webbridge (session `design-007`, đã close); số đo repo đọc từ code. Mọi ngưỡng dưới đây kèm **cách đo** — rule không đo được là guideline, không phải gate.

Quy ước chung: 1 CSS px = 1 pt (`README.md` invariant 1). Mọi rect tương tác đo sau layout (hình học thật, không phải khai báo).

## 1. iPhone (phone)

Nguồn HIG: `designing-for-ios`, `layout`, `typography`, `tab-bars`, `buttons`.

| # | Rule | Ngưỡng | Đo bằng |
|---|---|---|---|
| P1 | Vùng chạm tối thiểu | ≥ 44×44 pt mỗi rect tương tác (button, tab item, row action) | `audit:regions hit-region` (rect thật). Tiền lệ: `.btn` khai 58 pt đo còn 39 pt do `flex-shrink` → lỗi đúng |
| P2 | Tâm control gần nhau | cách nhau ≥ 60 pt; nút ≥ 60 pt thì +4 pt padding chống dính hover | audit rect (mở rộng từ P1; ngưỡng lấy từ `docs/screen-regions.md` § Sàn chạm) |
| P3 | Nav band | cao ≥ 44 pt; lề 16 pt; ≤ 3 slot (`back\|title\|right`); title < 15 ký tự; back = symbol chuẩn, cấm chữ "Back"/"Close" | lint `region-slot-unknown`, `navbar-too-many-actions`, `navbar-title-long`, `navbar-back-missing` + audit `shell-band` |
| P4 | Tab bar | cao 68 pt; 3–5 destinations; icon + nhãn (từ đơn); tab = navigation, KHÔNG action (action → toolbar) | lint `region-tab-*`, `tabbar-too-many`, `tabbar-unlabelled` + audit rect |
| P5 | Tab bar luôn hiện | hiện trên mọi section; chỉ modal được che; cấm disable/hide tab item (kể cả khi content rỗng → giải thích lý do trong content) | review (hành vi điều hướng; chưa có lint — đề xuất `region-tab-visibility` P2) |
| P6 | Chữ | default 17 pt / tối thiểu 11 pt; weight Regular–Bold, cấm Ultralight/Thin/Light ở chữ nhỏ; SF (+rounded) / NY; text style (body/headline) để co giãn theo Dynamic Type | review + audit tương phản (xem P9) |
| P7 | Reachability | control chính ở giữa/đáy màn; hỗ trợ swipe-back và row action | review (ergonomics; HIG: middle/bottom dễ với nhất) |
| P8 | Thứ bậc thị giác | quan trọng ở top + leading (RTL: dùng component hệ thống tự đảo); align để scan, indent = subordinate; group bằng negative space/container/separator; progressive disclosure cho phần còn lại | review |
| P9 | Tương phản | chữ ≥ 4.5:1, chữ lớn/UI ≥ 3:1 | audit màu (đề xuất gate `contrast`, hiện calo-ai ghi tay tỉ số trong `project/calo-ai/tokens.css:1-5`) |
| P10 | Thích ứng | xoay/dark/Dynamic Type/multitasking không vỡ: view kề nhau chuyển xếp chồng khi chữ lớn; row 1 dòng được phép cao lên nhiều dòng; không crop/overlap | audit `overflow` + manual Dynamic Type AX5 pass |

## 2. iPad (tablet)

Nguồn HIG: `designing-for-ipados`, `sidebars`. HIG nhấn: màn lớn → **bớt** depth/modal/fullscreen transition, không phóng to layout iPhone.

| # | Rule | Ngưỡng | Đo bằng |
|---|---|---|---|
| T1 | Sidebar cho ≥ 4 vùng ngang hàng; 2–3 mục thì dùng segmented/tab, cấm sidebar | đếm destination | lint (đề xuất `sidebar-min-destinations`) / review |
| T2 | Một tiêu đề duy nhất trên split; split 2–3 cột, cột hỗ trợ ~360 pt | 360 pt | audit rect / review |
| T3 | Sidebar thu gọn được, giữ selection, KHÔNG ẩn mặc định; cấm đặt thông tin/hành động quan trọng ở đáy sidebar | hành vi | review |
| T4 | Sidebar ↔ tab bar là morph theo chiều rộng (compact → tab + 1 cột, không mất chức năng), không phải hai màn | hành vi resize | manual resize pass (đề xuất `responsive` gate) |
| T5 | Glyph: tab bar filled, sidebar outlined | asset | lint asset (đề xuất) / review |
| T6 | Đa input: touch + pointer (hover state) + keyboard shortcut + Pencil (canvas); DnD nguồn + đích hợp lệ | hành vi | review checklist |
| T7 | Multi-window: mỗi window state độc lập; resize/Stage Manager không reset task/state | hành vi | manual pass |

## 3. Widget

Nguồn HIG: `widgets` (system small/medium/large/XL + accessory circular/corner/inline/rectangular; ngữ cảnh Home/Lock/StandBy/Desktop/visionOS/Watch Smart Stack).

| # | Rule | Ngưỡng | Đo bằng |
|---|---|---|---|
| W1 | Một widget = một ý, liếc là đủ; chữ ≥ 11 pt, thông tin chính ≥ medium weight | 11 pt | review + audit rect |
| W2 | Lề 16 pt, đồng tâm với bo container | 16 pt | audit rect |
| W3 | KHÔNG cuộn, KHÔNG nhập liệu; cập nhật theo timeline | hành vi | review (static lint: cấm `overflow:auto` + `input` trong widget — đề xuất) |
| W4 | Hỗ trợ Dynamic Type Large → AX5 | render pass | manual |
| W5 | Kích thước theo system family của ngữ cảnh (small 169×169, medium 360×169 trong repo `devices.ts`) | pt | audit khung |

## 4. watchOS

Nguồn: `designing-for-watchos` (đọc live) + tham chiếu `apple-design-watch/*` đã ghi trong `docs/screen-regions.md` § Watch.

| # | Rule | Ngưỡng | Đo bằng |
|---|---|---|---|
| A1 | Một màn = một ý, ≤ 3 dòng chính; tương tác < 1 phút, 1–2 gesture | đếm dòng | review |
| A2 | Nhãn ≤ 3 từ, một giá trị/trạng thái mỗi bề mặt; chữ phụ ≥ 11 pt | 11 pt | review |
| A3 | Hành động chính ở bottom bar, phóng to bằng `controlSize` | vị trí | review |
| A4 | Độ sâu ≤ 2 tầng; không tab bar; Digital Crown = cuộn/chuyển màn dọc | đếm tầng | review |
| A5 | Chạm ≥ 44×44 pt, tránh mép cong; thanh trên `topBarLeading` + `topBarTrailing` | 44 pt | audit rect |
| A6 | Lưới hệ thống theo độ cong + `scenePadding`, cấm padding tay | — | review |

## 5. Duo cover / inner / fold

Nguồn: `docs/screen-regions.md` § cover/inner/fold (tổng hợp từ `apple-design-iphone-duo/*`).

| # | Rule | Ngưỡng | Đo bằng |
|---|---|---|---|
| D1 | Cover: rail dọc trailing rộng cố định 44 pt, item cao linh hoạt ≥ 44 pt; thứ tự Back/Close trên cùng → Done → còn lại giữ thứ tự gốc; cấm padding/gap tay giữa nhóm; **cấm tab ngang đáy** | 44 pt | lint `cover-horizontal-tabbar` + audit |
| D2 | Inner: split lead/trail, pane dẫn hẹp hơn (mở phẳng 1:2); mỗi pane giữ control của nó ở cạnh ngoài; arrangement ngoài navigation container; pane hậu rỗng phải có placeholder | tỉ lệ render | audit (tiền lệ: khai 1:2 vẽ 41:59 bị bắt) |
| D3 | Fold (1:1): dải chia là vùng cấm (không control/chữ/lưới; nội dung cuộn được qua); split 50/50; lưới lề ngoài + tăng gap quanh nếp, số cột chẵn; alert/menu sang nửa trailing | 50/50, 0 control trên dải | audit `division-band` |
| D4 | Continuity: chuyển pose không reset Home, không mất selection/độ sâu/cuộn; inner chỉ +tối đa 1 tầng thông tin | hành vi | review |

## 6. Region system chuẩn (11 regions, §4 brief)

AI không tự quyết status/nav/tabbar: shell dựng band, author chỉ khai ruột.

| Region | Owner | Số đo / luật | Violation |
|---|---|---|---|
| Status | shell | cao = `safeTop` (bảng Phụ lục A) | `chrome-redrawn` |
| Navigation | shell (ruột author `data-slot`) | ≥ 44 pt, lề 16, ≤ 3 slot | `region-shell-owned`, `region-slot-unknown`, `navbar-*` |
| Toolbar | author | action trên content hiện tại; không điều hướng section | review (lẫn với tab → P4) |
| Content | author | `.body` (cuộn, duy nhất) / `.body-fixed` (vừa khung, tràn = lỗi) | `region-body-*`, `scroll`, `overflow` |
| TabBar | shell (ruột author `data-tab`) | 68 pt, 3–5, icon+nhãn | `region-tab-*`, `tabbar-*` |
| BottomAction | author | CTA chính trên đáy content (watch: bottom bar); ≥ 44 pt, cách home indicator | audit rect |
| Sidebar | author (tablet) | ≥ 4 vùng; thu gọn được | T1–T3 |
| Sheet | author | scoped task gần ngữ cảnh; Cancel (bỏ, không lưu) / Done (lưu) / Back (bước trước, không dismiss); iOS/iPad modal hoặc nonmodal, nền khác luôn modal | review |
| Modal | shell/system | toàn màn cho flow phức tạp/dài; có lối thoát + giữ data khi back | review |
| SafeArea | shell | status/home là element thật, ngoài `.viewport` → không lọt spec | audit `chrome`, `shell-band` |
| SystemOverlay | system | call/background/mất mạng/popup quyền — flow phải resume, không mất data | review (interrupt pass) |

Nesting: band shell trong `.viewport` nhưng ngoài `.screen`/`.body` (không cuộn theo); nền `.screen` viết longhand để `screenBgOf()` nối liền dải OS (`background continuity`).

## Phụ lục A — Bảng multi-device (nguồn: `src/frame/devices.ts`, pt)

| Device (id) | Form | W×H | safeTop | safeBottom | Ghi chú |
|---|---|---|---|---|---|
| reference | phone | 390×844 | 59 | 34 | mặc định, island dynamic |
| iphone-16-pro | phone | 402×874 | 62 | 34 | island dynamic |
| iphone-se | phone | 375×667 | 20 | 0 | không home indicator |
| appstore-67 | phone | 430×932 | 0 | 0 | khung shot store |
| duo-cover | cover | 466×678 | 44 | 24 | rail 44 pt, cấm tab ngang |
| duo-inner | inner/fold | 890×626 | 24 | 20 | 1:2 phẳng / 50-50 gập |
| ipad-11 | tablet | 820×1180 | 24 | 20 | sidebar + split |
| ipad-mini | tablet | 744×1133 | 24 | 20 | như trên, hẹp hơn |
| watch-45 | watch | 198×242 | 0 | 0 | 1 ý/màn, ≤ 2 tầng |
| widget-small | widget | 169×169 | 0 | 0 | system small |
| widget-medium | widget | 360×169 | 0 | 0 | system medium |

## Phụ lục B — Rule đo được (gate map, hiện trạng → đề xuất)

Hiện có: `lint:regions` (tĩnh: shell-owned, slot/tab anatomy, touch-floor khai báo, device-literal) + `audit:regions` (đo: hit-region, order, scroll, overflow, shell-band, division-band, background). Thiếu (P2 đề xuất): `contrast` (P9), `sidebar-min-destinations` (T1), `widget-no-input` (W3), `responsive/resize` pass (T4), `region-tab-visibility` (P5). Lỗi chạm/sai tỉ lệ/sai band = block; thiếu nhãn/badge lạm dụng = warning; chữ dài/Dynamic Type edge = review.
