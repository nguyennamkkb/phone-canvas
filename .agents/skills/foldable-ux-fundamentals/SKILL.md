---
name: foldable-ux-fundamentals
description: "Platform-agnostic foldable and dual-screen UX fundamentals for product designers and AI agents: postures (folded, flat, tabletop, book, cover, tent), hinge/fold awareness, continuity of state across displays, adaptive layouts across folds, reserved regions, and testing matrices. Use when designing, auditing, or reviewing an app for a foldable phone or dual-screen device. Complements apple-design-iphone-duo and tablet-ux-fundamentals."
compatibility: "Self-contained. No network or runtime access required."
metadata:
  author: "apple-ui-lab"
  version: "1.0"
  platform: "Cross-platform foldable / dual-screen"
  updated: "2026-09-25"
  sources: "research/05-iphone-duo/ + research/02-ipad/ + research/07-mobile-ux/"
---

# Foldable / Dual-screen UX Fundamentals — Senior Skill

> **Tham chiếu:** [POSTURES-AND-CONTINUITY](references/POSTURES-AND-CONTINUITY.md) · [FOLD-AWARE-LAYOUT](references/FOLD-AWARE-LAYOUT.md) · [EVIDENCE](references/EVIDENCE.md)
> Apple-specific (iPhone Duo): skill `apple-design-iphone-duo`.

## 1. Platform Mindset

- Thiết bị **gập** = **nhiều kích thước trong một máy** + **có nếp gập/bản lề** + **đổi posture liên tục**.
- Người dùng chuyển **gập ↔ mở** giữa phiên (nhanh ↔ rộng), có thể dựng bàn, gập như sách.
- Mục tiêu: **continuity** — cùng app, cùng state, chỉ đổi cách bày; **không** đứt luồng.
- Ràng buộc gốc: **size class đổi khi gập/mở**; vùng gập/bản lề chia không gian; màn ngoài có thể có
  camera/notch; app có thể **stop/restart** khi đổi màn.
- Hệ quả: **size-class-first**, **một nguồn state**, **displacement** quanh nếp, **không fixed width**.

## 2. Design Principles

| DO | DON'T | BECAUSE |
|---|---|---|
| Thiết kế theo **size class / breakpoint** | Hard-code "màn 7,6 inch" | Cùng app chạy nhiều posture |
| **Giữ state** khi gập/mở (text, scroll, media, selection) | Reset về home | App có thể stop/restart khi đổi màn |
| **Thêm một tầng** ngữ cảnh ở màn lớn | Nhồi nội dung không liên quan | Màn lớn cho thêm ngữ cảnh, không đổi việc |
| **Tránh nếp gập** với nội dung/điều khiển quan trọng | Đặt control đè lên nếp | Nếp khó bấm, màn cong khó đọc |
| **Nội dung cuộn không cần tránh** nếp | Displace cả nội dung cuộn | Cuộn tự đảm bảo liên tục |
| Dùng **container hệ thống** (split/adaptive) | Tự dựng layout cho từng posture | Tốn công, dễ lệch hành vi |
| Layout hai bên **bổ trợ nhau** | Hai layout như hai app khác nhau | Người dùng mở/gập liên tục |
| Test **mọi posture** | Chỉ test gập + mở | Tabletop/book/cover có hành vi riêng |

**Quy tắc vàng:** *Gập/mở là một lần đổi kích thước — không phải "tải lại" trải nghiệm.*

## 3. Information Architecture

| Cấu trúc | Folded (màn ngoài) | Flat/Unfolded (màn trong) |
|---|---|---|
| Navigation stack | ✓ một nhánh | ✓ thêm cột khi rộng |
| Bottom nav / tab bar | ✓ | Có thể → **rail/drawer** |
| Split view / 2 pane | ✗ | ✓ (list-detail) |
| Supporting pane | ✗ | ✓ (bên cạnh hoặc dưới) |
| Modal/sheet | ✓ | ✓ (cân nhắc kích thước) |
| Multi-window | ✗ | ✓ |

Nguyên tắc: **cùng cây điều hướng, khác cách trình bày**; chuyển posture **không mất** navigation path/selection.

## 4. Layout Rules

- **Size class theo posture, không theo máy:** folded ≈ compact; flat ≈ medium/expanded;
  tabletop/book chia vùng.
- **Không fixed width / không phụ thuộc màn hình cụ thể.**
- **Nếp gập/bản lề:** giữ nội dung & điều khiển quan trọng **ngoài vùng gập**; không đặt điểm chạm ngay tâm.
- **Split content khi half-opened:** tabletop ⇒ **trên/dưới**; book ⇒ **trái/phải**.
- **Tabletop:** media/nội dung ở nửa trên, **điều khiển ở nửa dưới** (bề mặt ổn định).
- **Book:** đọc nội dung dài; nếp là đường chia tự nhiên.
- **Cover (flip):** edge-to-edge; tránh camera cutout; use case tập trung.
- **Continuity:** giữ **text đã nhập, bàn phím, scroll, media, selection**; hai layout **bổ trợ**.
- **Resize mượt:** không relayout nặng mỗi frame; asset nặng cập nhật sau tương tác.

## 5. Component Library

| Component | Lưu ý foldable |
|---|---|
| **Adaptive container** | Size-class branch; reflow nhẹ khi đổi posture |
| **Split view** | Folded ⇒ 1 pane; flat ⇒ 2 pane (giữ selection) |
| **Supporting pane** | Ở dưới khi hẹp, bên cạnh khi rộng |
| **Nav (bar/rail/drawer)** | Đổi dạng theo width; giữ mục đang chọn |
| **Media/PiP** | Nửa trên khi tabletop; không ngắt khi gập |
| **Camera** | Preview đúng ở folded/unfolded; tránh cutout |
| **Sheet/modal** | Né nếp; kích thước theo posture |
| **Empty/Loading/Error** | Giữ nguyên qua posture |

## 6. Screen Inventory

Lock/Home · Feed/List · Detail · Media/Reader · Editor · Camera/Call · Multi-window · Settings ·
Empty/Loading/Error (per posture).

## 7. UX Patterns

Continue · Expand · Split · Overlay · Displace · Reframe · Resume.

## 8. Interaction Model

| Input | Quy tắc |
|---|---|
| **Touch** | ≥ 44 pt/48 dp ở cả hai màn; tránh vùng gập |
| **Hinge/fold** | Coi gập/mở như **resize** (tái bố cục, không restart); API bản lề cho **hiệu ứng**, không layout |
| **Gestures** | Cử chỉ hệ thống; không tự chế |
| **Keyboard/pointer** | Hỗ trợ ở màn lớn (như tablet) |
| **Multi-window** | Hỗ trợ multi-instance/PiP nếu nền tảng cho phép |

## 9. Accessibility

- **Target** ≥ 44 pt/48 dp cả hai màn; **tránh vùng gập** cho điểm chạm.
- **Screen reader:** focus/state giữ khi đổi posture; công bố khi bố cục đổi lớn.
- **Text scaling** lớn ⇒ tái bố cục cột, không cắt chữ.
- **Reduce Motion** khi reflow; **RTL** đảo đúng.
- **Checklist:** [ ] state qua posture · [ ] target · [ ] tránh nếp · [ ] text scale · [ ] reduce motion · [ ] RTL.

## 10. Performance Rules

- **Không reload** dữ liệu khi đổi posture (cache + một nguồn state).
- Reflow **rẻ**; tránh dựng lại view tree.
- Không animation nặng khi gập/mở.
- Không phân cấp sâu; giữ navigation stack.
- 2 màn hình/multi-instance ⇒ quản lý bộ nhớ.

## 11. Senior Review Checklist

- [ ] Continuity: gập/mở giữa phiên không mất state (text/scroll/media/selection/nav).
- [ ] Posture matrix: folded, flat, tabletop, book, cover (+ tent nếu có).
- [ ] Không fixed width / không phụ thuộc màn hình.
- [ ] Tránh nếp cho nội dung/điều khiển quan trọng; nội dung cuộn không bị displace.
- [ ] IA: 1 pane ↔ 2 pane; chỉ **thêm một tầng**; không mất mục đang chọn.
- [ ] Tabletop: điều khiển ở nửa dưới; media nửa trên.
- [ ] Hai layout **bổ trợ**; không mất chức năng.
- [ ] A11y + RTL + text scale lớn.
- [ ] Multi-window/PiP OK; state giữ.
- [ ] Test cả hai màn + mọi posture.

## 12. Failure Modes

| Lỗi | Vì sao sai |
|---|---|
| Bê UI phone kéo giãn | Lãng phí màn lớn; dòng quá dài |
| Fixed width / số đo theo màn | Vỡ ở posture khác |
| Reset khi gập/mở | Mất continuity |
| Ẩn tính năng ở màn ngoài | Người dùng tưởng mất chức năng |
| Hai state riêng cho hai màn | Dữ liệu lệch |
| Đặt control lên nếp | Khó bấm, che nội dung |
| Displace nội dung cuộn | Phá liên tục |
| Dừng media khi đổi posture | Phá trải nghiệm |
| Không test tabletop/book/cover | Lỗi chỉ xuất hiện ở posture đó |
| Khoá portrait trên màn lớn | Letterbox, mất không gian |

## 13. Design System Rules

| Hạng mục | Quy định |
|---|---|
| **Typography** | Text scale; giới hạn độ rộng đọc ở màn lớn; không scale chữ theo màn |
| **Spacing** | Nhịp 4/8; lề 16; giữ vùng an toàn quanh nếp |
| **Radius** | Theo hệ thống; nội dung không chạm vùng cong/nếp |
| **Elevation** | Material hệ thống; không shadow nặng |
| **Motion** | Reflow 200–300 ms; tôn trọng Reduce Motion |
| **Color** | Semantic; dark mode; contrast đạt ở cả hai màn |
| **Adaptivity** | **Size-class-first**; một nguồn state; không hard-code màn hình |

## 14. AI Decision Framework

```
IF foldable / dual-screen
THEN
  Goal      = continuity across postures
  Layout    = size-class-first; 1 pane ↔ 2 pane
  Nav       = cùng cây; bar ↔ rail/drawer; KHÔNG reset khi đổi posture
  State     = một nguồn; giữ text/scroll/media/selection
  Regions   = tránh nếp/bản lề cho nội dung & điều khiển quan trọng
  Ưu tiên   = 1) Liền mạch  2) Nội dung  3) Hành động
  Bắt buộc  = không fixed width · state giữ · hai layout bổ trợ · test mọi posture
  Tránh     = hard-code màn · 2 state · dừng media · control trên nếp · khoá portrait

IF gập/mở giữa phiên        THEN giữ nguyên state + vị trí (không restart)
IF tabletop                 THEN media/nội dung nửa trên, điều khiển nửa dưới
IF book                     THEN chia trái/phải; đọc nội dung dài; nếp là divider
IF flat & rộng              THEN 2 pane (list-detail/supporting), nav rail/drawer
IF cover (flip)             THEN edge-to-edge, tránh cutout, use case tập trung
IF nội dung cuộn            THEN KHÔNG displace
IF có multi-window/PiP      THEN hỗ trợ + giữ state; không khoá portrait
IF text scale lớn           THEN tái bố cục cột (2→1) thay vì cắt chữ
```

**Nguồn:** `research/05-iphone-duo/`, `research/02-ipad/`, `research/07-mobile-ux/` · [EVIDENCE.md](references/EVIDENCE.md).
