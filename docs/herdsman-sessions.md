# Herdsman Agent Sessions — cách dùng lại, compact, bộ nhớ, tra cứu

Ghi chú thực hành khi làm việc với agent Herdsman (delegate / continue / steer /
interrupt). Rút ra từ phiên làm việc trên repo phone-canvas.

## 1. Dùng lại session (`continue_agent`) vs tách session mới

Mỗi lần `delegate` tạo 1 generation mới gồm:

- `label` (vd `paywall-design`) — tên generation, xong là mất.
- `session` (UUID đầy đủ) — lịch sử, dùng để giao tiếp.
- `result ref` (vd `result:paywall-design#1`) — kết quả, truyền qua `files`.

`continue_agent(session=<UUID>, task=..., files=[...])` mở assignment mới **trên
đúng session cũ** — agent nhớ toàn bộ hội thoại, file đã đọc, kết luận trước.
Config định nghĩa resolve bản mới nhất; model/thinking kế thừa session cũ.

| Trường hợp | Cách làm |
|---|---|
| Repair/fix nối tiếp cùng artefact, cần lịch sử quyết định cũ | `continue` session cũ |
| Đổi đề bài, đổi quyền, đổi mục tiêu | Tách session mới, label mới |
| Session lỗi trắng / lịch sử rỗng | Bỏ, tách mới (không `continue` session hỏng) |

Lưu ý: `continue` vẫn là bounded — 1 assignment rồi resolve; muốn tiếp thì
`continue` tiếp. Artifact phía Lead **không tự đi theo** — phải truyền显式 qua
`files`. Muốn xem agent đã làm gì trước khi giao tiếp: `read_agent_transcript`
hoặc `inspect_agent`.

Ba chế độ khi agent **đang sống**: `steer_agent` (đổi hướng nhẹ, áp sau turn
hiện tại), `interrupt_agent` (hủy operation, đổi hướng ngay), `close_agent`
(đóng hủy — ngược với "làm tiếp").

## 2. Compact

Herdsman tự compact, không cần bấm gì:

- **~60%** context — bắt đầu nén phần cũ nhất (soft).
- **~80%** — cắt dần phần cũ (hard) để chừa chỗ làm tiếp.
- Ưu tiên giữ: system prompt → task hiện tại → tool calls gần nhất. Tóm tắt nén
  được nhét lại vào history.

Giới hạn: compact bảo vệ luồng hiện tại — task xoay nhiều phase (đọc → code →
review → docs) thì kết luận phase cũ mờ dần sau mốc 80%. Thực hành: chia task
dài thành nhiều assignment nhỏ (mỗi `continue` 1 bước); cuối mỗi phase quan
trọng, bắt agent chốt tóm tắt ngắn trong result (result nằm phía Lead, không bị
compact của agent ảnh hưởng).

## 3. Tách session có làm dày bộ nhớ không?

Có, nhưng nhẹ và có trần:

- Mỗi session chỉ giữ **result tóm tắt** phía Lead (vài chục dòng), không giữ
  toàn bộ hội thoại agent. Transcript đầy nằm ở Herdsman store, chỉ tải khi gọi
  `read_agent_transcript`.
- `continue` nhiều vòng: agent giữ lịch sử dài → tới mốc compact nhanh hơn.
- Tách mới: agent lịch sử trống → compact lâu tới hơn; đổi lại Lead giữ nhiều
  result rời rạc.
- Session resolve xong là generation bị dọn — không ăn RAM/CPU. Muốn quên hẳn:
  đừng `continue` nữa, đừng truyền ref vào task mới; vài vòng compact là mờ dần.

Quy tắc: task khác bản chất → tách (rẻ, sạch); repair nối tiếp → `continue`
(đắt dần theo lịch sử, nên chốt result gọn mỗi vòng).

## 4. Tra cứu khi có nhiều session

Phân biệt bằng 3 thứ: **label** (tên việc, do Lead đặt lúc giao),
**result ref** (truyền qua `files` cho vòng sau), **session UUID** (máy dùng lúc
`continue`). Kỷ luật đặt tên:

- Label nói việc: `<mục-tiêu>-<vòng>` — vd `paywall-design` →
  `paywall-polish` → `paywall-repair`. Nhìn label biết thứ tự, không cần nhớ UUID
  (tra transcript/session theo label được).
- Mỗi vòng chốt result tự đủ nghĩa (ids + kết quả + deviations) — nếu store hết
  hạn transcript cũ, chỉ còn result text phía Lead.
- 5+ session cùng task: giữ 1 dòng ledger trong reply (label → việc → result)
  làm index.
