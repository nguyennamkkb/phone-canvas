# Devices — phone + tablet trên một board

Nguồn duy nhất: `src/frame/devices.ts` (`DEVICES`). NodePicker, export,
PhoneNode, placement, compose đều đọc từ mảng này — thêm device mới chỉ cần
thêm 1 object, không hardcode width ở logic.

## Bảng hiện tại

| id | name | width×height (pt) | bezel | radius | safeTop | safeBottom | island |
|---|---|---|---|---|---|---|---|
| `reference` (default) | Reference 390×844 | 390×844 | 12 | 44 | 59 | 34 | dynamic |
| `iphone-16-pro` | iPhone 16 Pro | 402×874 | 11 | 50 | 62 | 34 | dynamic |
| `iphone-se` | iPhone SE | 375×667 | 14 | 20 | 20 | 0 | none |
| `ipad-11` | iPad 11″ · 820×1180 | 820×1180 | 16 | 18 | 24 | 20 | none |
| `ipad-mini` | iPad mini · 744×1133 | 744×1133 | 16 | 18 | 24 | 20 | none |

Ý nghĩa field: `width/height` là pt (1:1 CSS px trong iframe); `bezel/radius`
vẽ khung ngoài (cosmetic, không đổi số đo); `safeTop/safeBottom` là vùng OS
chrome do shell inject; `island` quyết định có vẽ Dynamic Island hay không.
`safeBottom: 0` (SE) nghĩa là không có home indicator.

## Quy tắc thêm device mới

1. Thêm object đủ 7 field vào `DEVICES`. `id` kebab-case, ổn định vĩnh viễn
   (board snapshot lưu `deviceId`, đổi id làm board cũ rơi về reference +
   badge ⚠).
2. Không `safeBottom: 0` trừ khi thiết bị thật không có home bar.
3. Không sửa gì khác — NodePicker/export/preview tự thấy device mới.

## Màn tablet

* Layout khác hẳn (vd list+detail) → **screen riêng**, không branch trong
  HTML (invariant #5). Scaffold:
  `npm run new-screen -- --project <id> --name <x> --title "..." --device ipad-11`
  (template 2 cột fluid, `deviceId` ghi vào manifest, board mới tự mở đúng 820).
* Chỉ giãn spacing → giữ 1 file fluid (token classes, tỉ lệ flex unitless).
* Đổi device của node có sẵn: Panel → dropdown **Thiết bị** (thắng manifest,
  persist vào board). Board đã lưu không tự đổi theo manifest.
* Preview component: dropdown **Preview** trong tab Components (nhớ theo
  project, default theo màn đầu tiên của project).

## Export theo device

```bash
npm run export -- --screen home --device ipad-11   # home-ipad-11@2x.png, 820px
npm run export -- --device all                     # mọi device, có suffix
```

Truyền `--device` (kể cả một device duy nhất) luôn giữ suffix `-<device>`
để bản phone và bản tablet không ghi đè nhau. Export render theo `--device`
truyền vào, không theo `deviceId` trong manifest/board.

## Giới hạn đã biết

* Board snapshot giữ `deviceId` cũ của node — đổi manifest sau khi mở board
  không tự đổi node cũ (đúng thiết kế “per-node thắng”).
* Board lẫn node 390 + 820: fit tổng zoom ra xa, focus 100% ở màn hẹp phải
  pan ngang, minimap tablet áp đảo — overlap thì không (placement đo theo
  outer width từng node).
* `type: 'phone'` là tên lịch sử, bao cả tablet (đổi tên = migrate board.json,
  không đáng).
