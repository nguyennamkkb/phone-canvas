# 13 — Node Label Proposal (hàng dọc, dễ nhìn + dễ thao tác)

> Lead self-research (user-authorized exception: designer-omp hit engine limit, soft-closed, state preserved).
> Nguồn duy nhất: code thật đọc ngày 2026-10-02. Không bịa.

## 1. Hiện trạng (vấn đề Human nêu)

`.phone-label` hôm nay (`src/canvas/PhoneNode.tsx:136-200`, `src/styles/board.css:312-428`):

```text
[Title] [#project/screen…] [W × H] [○ golden] [⤢] [FormChip]
```

- Một flex-row duy nhất: `display:flex; align-items:baseline; justify-content:space-between; gap:8px`
  (`board.css:312-321`), font 10–11px, padding 1–2px.
- 6–7 items chen nhau trên chiều rộng đúng bằng node (390px ở reference, 169px ở widget-small
  như ảnh Human chụp) → id bị ellipsis (`max-width:150px`, `board.css:390-396`), size/golden/expand
  co lại thành các pill 10px gần như không bấm được.
- Ràng buộc cứng (không được phá):
  - Buttons `stopPropagation` (không lọt click xuống canvas drag) — `PhoneNode.tsx:151-153, 176-178`.
  - Double-click label = focus 100% — `PhoneNode.tsx:140-146`.
  - Camera zoom 0.1–2.5 (`Board.tsx` flow config) → ở zoom-out mọi chữ đều tí hon, không có cách nào
    "luôn đọc được" mà không phá 1px=1pt của iframe (label là DOM ngoài iframe nên TĂNG font được,
    nhưng vẫn bị camera scale).
  - E3 badges read-only: spans only, no handlers (`012-answer`).
  - `phone-node` là flex-column, `gap:8px` (`board.css:306-310`); label là child đầu, frame là child sau →
    TĂNG chiều cao label chỉ đẩy frame xuống (trục Y tự do), KHÔNG ảnh hưởng `nextSlotX`/COLUMN_GAP
    (trục X, `placement.ts`). Đây là điểm mấu chốt làm mọi phương án dọc đều an toàn với layout.
  - HIG 44pt touch floor áp cho SCREENS, không áp cho board chrome; ở canvas zoom 1, nút 44px sẽ
    nuốt cả label → chuẩn thực tế cho board: hit ≥ 24–28px ở zoom 1 (ghi rõ là compromise có chủ ý).

## 2. Thứ tự ưu tiên thông tin (chung cho mọi phương án)

| Lúc nào cũng thấy | Hover/selected mới thấy | Gom vào tooltip/title |
|---|---|---|
| Title + size (định danh node) | Copy-id, expand (thao tác) | Full id path, file, golden detail, device name |
| Golden dot (trạng thái, 1 ký tự ●/○) | Golden text ("khớp"/"lệch"/"chưa có") | Câu "chạy export --golden để tạo" |
| Form chip (chỉ non-phone) | Device-warn (đã hiếm) | — |

Nguyên tắc: **định danh luôn hiện, thao tác hiện khi cần, giải thích nằm trong tooltip.**

## 3. Phương án A — Stacked 2-line header (P0, diff nhỏ nhất)

Giữ label trên node, đổi thành 2 dòng:

```text
┌──────────────────────────────────┐
│ Pin                    [Widget]  │  ← dòng 1: title + form chip
│ #scratch-widget/battery 169×169  │  ← dòng 2: id (full, hết ellipsis) + size
│ [○ golden chưa có]      [⤢ mở]   │  ← dòng 3 (optional): actions
└──────────────────────────────────┘
```

- CSS: `.phone-label { flex-direction:column; align-items:stretch; gap:4px; font-size:12px; }`,
  mỗi dòng là flex-row riêng; nút action `min-height:24px; padding:4px 10px`.
- Behavior zoom-out: vẫn nhỏ đi theo camera (không phương án nào tránh được), nhưng 3 dòng thưa
  dễ phân biệt hơn 1 dòng đặc; zoom 1: hit 24px, id hiện full (hết ellipsis ở 390px, chỉ còn ellipsis ở widget 169px).
- Expanded: không đổi (contentH chỉ tính iframe, label ngoài).
- Nodes gần nhau: chỉ tốn thêm ~20px chiều cao mỗi node (trục Y tự do) → an toàn.
- Trade-off: (+) diff ~20 dòng CSS + 0 logic; giữ double-click focus, giữ mọi handler; (−) vẫn là
  chữ nhỏ ở zoom-out sâu; chưa giải quyết triệt để "khó bấm" ở zoom < 0.5.

## 4. Phương án B — Side rail dọc cạnh node (vertical toolbar)

Tiêu đề ở trên, actions thành rail dọc BÊN TRÁI frame (absolute, không chiếm layout):

```text
│⤢│ ┌───────────────┐
│# │ │               │
│○ │ │    FRAME      │   ← rail: expand / copy-id / golden-dot, mỗi ô 28×28
│  │ │               │
└──┴─┴───────────────┘
     Pin · 169×169 [Widget]
```

- Rail `position:absolute; left:-36px; top:0; display:flex; flex-direction:column; gap:6px;`,
  mỗi nút `width:28px; height:28px; border-radius:8px` → hit 28px ở zoom 1, tốt nhất trong 3 phương án.
- Label trên chỉ còn title + size + chip → 1 dòng thoáng, hết chen lấn.
- Behavior zoom-out: rail vẫn co theo camera nhưng nút vuông 28px dễ bấm hơn pill 10px ở mọi zoom.
- Nodes gần nhau: rail absolute TRÀN sang trái → 2 nodes sát nhau (gap 120px theo COLUMN_GAP nên
  thực tế hiếm collide; nhưng nodes do user kéo tay có thể đè lên rail nhau) → cần `z-index` + quy tắc
  rail ẩn khi node không selected (kết hợp C).
- Trade-off: (+) hit lớn nhất, tách định danh khỏi thao tác triệt để; (−) CSS/React nhiều nhất;
  cần kiểm chứng va chạm với ReactFlow Handles (top/bottom) và node drag (rail phải `stopPropagation`
  + `nodrag` class của ReactFlow); thay đổi footprint thị giác của node.

## 5. Phương án C — Progressive disclosure (tiêu đề gọn + actions khi selected/hover)

Mặc định chỉ 2 items; mọi thao tác hiện khi node được chọn (tap = select, không cần hover → ổn cả touch):

```text
mặc định:   Pin · 169×169 [Widget]
                                  (○ golden dot gộp vào sau size: "169×169 ○")

selected:   Pin · 169×169 ○
            ┌─────────────────────┐
            │ #scratch-widget/… ⧉ │  ← tap để chép (full id, không ellipsis)
            │ ○ chưa có golden    │
            │ [⤢ Mở rộng]         │  ← nút full-width, cao 28px
            └─────────────────────┘
```

- Selected state đã có sẵn (`activeNodeId === id`, `PhoneNode.tsx:48`) → không thêm state mới.
- Behavior zoom-out: mặc định gọn nhất trong 3 phương án (chỉ 1 dòng ngắn) → board đông nodes dễ đọc nhất.
- Nodes gần nhau: panel actions xổ XUỐNG ĐÈ lên frame của chính node (absolute overlay) → không đẩy layout.
- Trade-off: (+) sạch nhất lúc đông, không layout shift, discoverability giữ được nhờ "selected là hiện";
  (−) expand/copy cần thêm 1 tap so với hiện tại (luôn hiện); cần viết CSS overlay + kiểm tra overlay không
  chặn pickAt ở inspect mode (overlay nằm ngoài iframe nên chỉ cần `pointer-events` đúng vùng).

## 6. Đề xuất chính (Lead)

**Làm A ngay (P0), rồi C (P1). Bỏ B** trừ khi Human yêu cầu riêng:

1. **A trước** vì: diff nhỏ, 0 logic, 0 layout-shift trục X, giữ nguyên mọi handler/ràng buộc,
   giải quyết đúng phàn nàn ("khó nhìn" do chen 1 dòng) với chi phí thấp nhất. Xong A là Human đã dùng được.
2. **C sau** vì: giải quyết "khó thao tác" triệt để hơn (nút 28px full-width khi selected), nhưng cần
   thiết kế overlay cẩn thận (không chặn pickAt, không vỡ ở widget 169px). Làm sau khi A đã ổn định.
3. **Không làm B** vì: lợi ích hit-target không hơn C bao nhiêu, nhưng rủi ro va chạm Handles/drag và
   footprint thị giác là lớn nhất; rail absolute tràn trái là pattern lạ với người dùng board.

Thứ tự: A (1 task engineer) → Human dùng thử → C (1 task engineer) → đóng 13.

## 7. Acceptance cho task implement (ghi sẵn để dispatch)

- [ ] Label mới không đổi số đo nào (size text vẫn `device.width × contentH`, không đụng iframe).
- [ ] Double-click focus, click-copy-id, expand toggle, stopPropagation giữ nguyên (test tay 4 thao tác).
- [ ] Zoom 1: mọi nút bấm được bằng chuột thường; zoom 0.5: title + size vẫn phân biệt được.
- [ ] Widget 169px: không tràn chữ ra ngoài node width (ellipsis chỉ ở dòng id).
- [ ] `npm run gate` + `npm test` + `tsc` xanh; CSS append/sửa scoped `.phone-label*`, không đụng `.device`/`.body`/frame rules.
