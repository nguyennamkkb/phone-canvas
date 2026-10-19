# Recipe — board-arrange (xếp màn thành hàng)

**Use for:** xếp board đông màn thành hàng ngang có thứ tự trái qua phải,
gom nhóm hàng (onboarding / paywall / settings…), không kéo tay từng node,
không mở browser.

## Idea

Board không có khái niệm "hàng" trong UI — hàng là dữ liệu trong file seed
`project/<id>/board.json` (`board.arrangement`: danh sách hàng, mỗi hàng là
danh sách screen id trái qua phải). Tọa độ node suy ra từ model bằng đúng
toán board dùng (`layoutRows` trong `src/board/placement.ts`: hàng reset
`x = 0`, hàng sau nằm dưới đáy hàng trước + 160). Agent chỉ cần ghi đúng
model, board tự đặt đúng chỗ.

## Steps

1. **Lấy danh sách màn** — `npm run screen -- list --project <id>`
   (id + title, thứ tự manifest — đó cũng là thứ tự mặc định của board tươi).
2. **Chia hàng trên giấy** — mỗi hàng 2–5 màn cùng một flow (ví dụ hàng 1
   `[splash, onboard-language, onboard-privacy]`, hàng 2 `[pay-1, pay-2]`).
   Đặt tên nhóm ngắn cho hàng quan trọng (`--row-names "Onboarding;Paywall"`).
3. **Chạy khô trước** — luôn `--dry-run` trước khi ghi:
   ```bash
   npm run project -- freeze <id> --dry-run --rows "splash,onboard-language;pay-1,pay-2"
   ```
   Đọc stdout: đúng thứ tự, đúng hàng, `x` tăng dần trong hàng, `y` tăng
   dần theo hàng. Sai thì sửa lệnh, chưa ghi gì nên chưa mất gì.
4. **Ghi seed** — bỏ `--dry-run` để ghi `project/<id>/board.json`
   (file cũ tự lùi thành `.bak`). Tiện nhanh khi hàng đều nhau:
   `--order a,b,c,d --row-size 2`. Màn nào không nêu tên được xếp nốt
   vào cuối theo thứ tự manifest — không bao giờ mất màn.
5. **Mở board xem** — `npm run dev`, mở project. Lần đầu (chưa có bản lưu)
   board hiện đúng hàng đã ghi. Kéo tay sau đó vẫn thắng seed (xem Gotchas).

## Flags

| Flag | Effect |
|---|---|
| `--rows "a,b;c,d"` | hàng显式 (`;` chia hàng, `,` chia màn) — ưu tiên cao nhất |
| `--order a,b,c` + `--row-size N` | đặt trước theo thứ tự rồi cắt đều mỗi hàng N màn |
| `--row-names "A;B"` | tên nhóm theo vị trí hàng (thiếu → không tên, thừa → bỏ) |
| `--sort alpha` | xếp alphabet một hàng (hành vi cũ trước arrangement) |
| `--dry-run` | in hàng + tọa độ, không ghi file |

Id lạ → lệnh thoát lỗi, nêu id, không ghi gì (kể cả `.bak`). Sửa id rồi
chạy lại.

## Gotchas

- **localStorage luôn thắng seed.** Board đã kéo tay trong browser thì seed
  mới không hiện — xóa bản lưu (DevTools → localStorage → key
  `pc.board.<id>`) rồi tải lại mới thấy hàng mới. Chi tiết ở
  `references/failure-modes.md` §12.
- **Đừng xếp quá 5 màn một hàng** — mỗi màn rộng bằng khung máy của nó (rộng trong `src/frame/devices.ts`), hàng dài phải pan ngang nhiều mới thấy hết. Hàng dọc dài thì cuộn dọc, rẻ hơn.
- **Tên hàng chỉ để đọc** — không ảnh hưởng tọa độ, đặt hay không đều xếp
  giống nhau.
- Xếp hàng không đổi số đo: verify bằng `npm run export -- --screen <id>`
  PNG cùng kích thước như trước khi xếp.
