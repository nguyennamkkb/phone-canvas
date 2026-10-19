# Background Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi `.screen` root có `background-image`, nền phải là MỘT lớp full-bleed liền mạch — `.device` và `.screen` vẽ trong cùng một hệ toạ độ, không seam ở band nav; gate đo render bắt được vi phạm.

**Architecture:** Neo cả hai painter vào viewport bằng `background-attachment: fixed` (shell CSS). Tầng đo `audit:regions` kiểm bất biến "hai painter chung vùng định vị nền" bằng hàm thuần `backgroundFindings` (test không cần Chrome). Golden CI khoá điểm ảnh qua seam; dọn pin/record mồ côi `day`.

**Tech Stack:** TypeScript (ESM), Vite, Vitest, node zero-dep CLI, Chrome qua CDP.

**Spec:** `openspec/changes/background-continuity/` (proposal.md, specs/screen-regions/spec.md, design.md, tasks.md)

## Global Constraints

- Hợp đồng tác giả KHÔNG đổi: nền khai longhand trên `.screen` root; `background-color` là `var(--token)` hoặc `#000`; ảnh là `/project/<id>/assets/<file>` hoặc `/images/<file>`; `background-size: cover`; `background-repeat: no-repeat`.
- Không sửa markup màn nào. Panel/handoff không đổi: computed `background-image` của `.screen` phải giữ nguyên.
- Gate `npm run gate` = `npm run lint && npm run audit:regions && npm test`. Lỗi lint/audit phải in `file:line` (tĩnh) hoặc selector/rect đo được (đo) **kèm cách sửa**, và exit code ≠ 0.
- Thông điệp lỗi viết tiếng Việt như các lint hiện có.
- CLI trong `scripts/` là node ESM zero-dep; test chạy bằng Vitest (`npm test`).
- Giá trị chốt: `ELEMENT_PAD_PT = 24` (`scripts/export.ts:75`); `region-nav` của `halloween-offer` crop `clip 0,35 390×108pt` (đáy seam 119 pt nằm trong crop).

## Review Focus

- `.device` lệch gốc viewport (một tương lai) → cả hai `fixed` vẫn chung viewport; luật phải đỏ khi chỉ **một** bên `fixed` và rect khác.
- `.screen` KHÔNG có `background-image` (nền chỉ màu, hoặc bare preview không `.screen`) → luật không được báo nhầm, không được crash.
- Hai rect bằng nhau nhưng attachment `scroll` → nhánh OR cho qua (đúng), không báo lỗi.
- Màn có nền ảnh nhưng **không** band nav → hai hệ toạ độ vẫn phải bằng nhau.
- Giá trị computed `.device` vs `.screen` khác nhau (check cũ) vẫn phải giữ nguyên hành vi vàng đỏ.

---

### Task 1: Neo `.device` vào viewport

**Files:**
- Modify: `src/extractor/compose.ts` (`CHROME_CSS`, rule `.device` ~ dòng 90-96)
- Test: `src/extractor/compose.test.ts`

**Interfaces:**
- Consumes: `composeScreenDoc(options)` (đã có; trả cả document gồm `<style>` chứa `CHROME_CSS`).
- Produces: rule `.device` có `background-attachment: fixed`.

- [ ] **Step 1: Write the failing test**

Thêm vào `describe('composeScreenDoc', …)` trong `src/extractor/compose.test.ts`:

```ts
it('anchors .device to the viewport so its background shares .screen coordinate space', () => {
  const html = composeScreenDoc({ html: '<div class="screen"></div>', device, stylesheets: [] })
  expect(html).toMatch(/\.device\s*\{[^}]*background-attachment:\s*fixed/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/extractor/compose.test.ts -t "anchors .device"`
Expected: FAIL (không tìm thấy `background-attachment: fixed` trong rule `.device`)

- [ ] **Step 3: Implement** — trong `src/extractor/compose.ts`, `CHROME_CSS`, rule `.device`, thêm dòng sau `background: var(--bg);`:

```css
  background-attachment: fixed;
```

(longhand đứng sau shorthand để thắng; cả `.device` lẫn `.screen` neo viewport ⇒ chung một hệ toạ độ)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/extractor/compose.test.ts -t "anchors .device"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/extractor/compose.ts src/extractor/compose.test.ts
git commit -m "fix(shell): anchor .device background to the viewport"
```

### Task 2: Neo `.screen` vào viewport + ghi tài liệu cơ chế

**Files:**
- Modify: `src/screens/vocab.css` (rule `.screen`)
- Modify: `docs/screen-regions.md`
- Modify: `.agents/skills/phone-canvas/recipes/screen-background.md`
- Test: `src/screens/vocab.test.ts` (mới)

**Interfaces:**
- Consumes: Task 1 (`.device` đã `fixed`) — cùng hệ toạ độ viewport.
- Produces: rule `.screen` có `background-attachment: fixed`; tài liệu mô tả bất biến.

- [ ] **Step 1: Write the failing test**

Tạo `src/screens/vocab.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const vocab = readFileSync(join(here, 'vocab.css'), 'utf8')

describe('vocab.css .screen', () => {
  it('anchors the screen background to the viewport (fixed), matching .device', () => {
    const rule = /\.screen\s*\{[^}]*\}/.exec(vocab)?.[0] ?? ''
    expect(rule).toMatch(/background-attachment:\s*fixed/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/vocab.test.ts`
Expected: FAIL nếu `.screen` chưa có `background-attachment: fixed`. (Nếu bản vá đang có sẵn trong working tree, tạm gỡ dòng đó để thấy đỏ, rồi làm lại ở Step 3.)

- [ ] **Step 3: Implement** — trong `src/screens/vocab.css`, rule `.screen`, bảo đảm có (đặt sau `background: var(--bg);`) dòng:

```css
  background-attachment: fixed;
```

kèm comment ngắn giải thích: `.screen` và `.device` phải chung hệ toạ độ nền (cả hai neo viewport) để band status/nav/tab nổi trên một lớp nền liền mạch; `.screen` không cuộn nên `fixed` không đổi hành vi cuộn.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/screens/vocab.test.ts`
Expected: PASS

- [ ] **Step 5: Cập nhật tài liệu**

Trong `docs/screen-regions.md`: thêm một dòng vào hợp đồng nền — "Nền là MỘT lớp full-bleed: `.device` và `.screen` cùng neo viewport (`background-attachment: fixed`); band status/nav/tab nổi trong suốt trên nó."
Trong `.agents/skills/phone-canvas/recipes/screen-background.md`: thêm mục ghi cơ chế (cách tác giả viết KHÔNG đổi; shell chịu trách nhiệm hệ toạ độ).

- [ ] **Step 6: Verify docs → chạy lint tài liệu**

Run: `npm run lint:regions-docs`
Expected: PASS (0 lỗi)

- [ ] **Step 7: Commit**

```bash
git add src/screens/vocab.css src/screens/vocab.test.ts docs/screen-regions.md .agents/skills/phone-canvas/recipes/screen-background.md
git commit -m "fix(shell): anchor .screen background to the viewport; document the invariant"
```

---

### Task 3: Gate đo render — bất biến hình học nền

**Files:**
- Modify: `scripts/region-audit.ts` (`type Probe`, `PROBE`, `checkScreen`; thêm hàm export)
- Test: `scripts/region-audit.test.ts`

**Interfaces:**
- Consumes: `Probe` (đang có), `Finding = { screen: string; check: string; detail: string }`, `Rect`.
- Produces: `export function backgroundFindings(id: string, probe: Pick<Probe, 'paint' | 'bgGeom'>): Finding[]` — dùng lại trong `checkScreen`. `Probe['paint']` thêm `deviceAttachment: string; screenAttachment: string`; thêm `Probe['bgGeom']: { device: Rect; screen: Rect | null; viewport: { w: number; h: number } }`.

- [ ] **Step 1: Write the failing test**

Thêm vào `scripts/region-audit.test.ts` (import ở đầu file: `import { backgroundFindings } from './region-audit.ts'` cùng chỗ `describeMissingChrome`):

```ts
const rect = (x: number, y: number, w: number, h: number) => ({ x, y, w, h })
const bgProbe = () => ({
  paint: {
    device: 'rgb(1,1,1)', screen: 'rgb(1,1,1)',
    deviceImage: 'url("/a.png")', screenImage: 'url("/a.png")',
    deviceAttachment: 'fixed', screenAttachment: 'fixed',
  },
  bgGeom: { device: rect(0, 0, 390, 844), screen: rect(0, 59, 390, 785), viewport: { w: 390, h: 844 } },
})

describe('backgroundFindings (nền chung một hệ toạ độ)', () => {
  it('passes when both painters anchor to the viewport', () => {
    expect(backgroundFindings('x', bgProbe())).toEqual([])
  })

  it('flags two coordinate spaces when only one painter is viewport-anchored', () => {
    const probe = bgProbe()
    const out = backgroundFindings('x', { ...probe, paint: { ...probe.paint, screenAttachment: 'scroll' } })
    expect(out.some((f) => f.check === 'background' && f.detail.includes('hai hệ toạ độ'))).toBe(true)
  })

  it('passes when rects are equal even without fixed anchoring', () => {
    const probe = bgProbe()
    const out = backgroundFindings('x', {
      paint: { ...probe.paint, deviceAttachment: 'scroll', screenAttachment: 'scroll' },
      bgGeom: { ...probe.bgGeom, screen: rect(0, 0, 390, 844) },
    })
    expect(out).toEqual([])
  })

  it('ignores a screen with no background image', () => {
    const probe = bgProbe()
    const out = backgroundFindings('x', {
      ...probe,
      paint: { ...probe.paint, deviceImage: 'none', screenImage: 'none', screenAttachment: 'scroll' },
    })
    expect(out).toEqual([])
  })

  it('keeps the value mismatch check', () => {
    const probe = bgProbe()
    expect(backgroundFindings('x', { ...probe, paint: { ...probe.paint, screen: 'rgb(2,2,2)' } })
      .some((f) => f.check === 'background')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/region-audit.test.ts -t "backgroundFindings"`
Expected: FAIL — `backgroundFindings` chưa được export (import undefined)

- [ ] **Step 3: Implement** — trong `scripts/region-audit.ts`:

1. `type Probe`: thêm vào `paint` hai field `deviceAttachment: string; screenAttachment: string`; thêm khoá mới:
```ts
  bgGeom: { device: Rect; screen: Rect | null; viewport: { w: number; h: number } }
```
2. `PROBE`: trong `const style = (sel) => …` thêm `attachment: cs.backgroundAttachment` vào object trả về; thêm trước `return {`:
```js
  const bgGeom = {
    device: rectOf(q('.device')),
    screen: rectOf(q('.screen')),
    viewport: { w: document.documentElement.clientWidth, h: document.documentElement.clientHeight },
  }
```
và trong `return` thêm vào `paint`: `deviceAttachment: device ? device.attachment : 'none'`, `screenAttachment: screen ? screen.attachment : 'none'`, cùng khoá `bgGeom`.
3. Thêm hàm thuần (đặt cạnh `exempt`):
```ts
const BG_RECT_TOL = 1
const fmtRect = (r: Rect) => `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.w)}×${Math.round(r.h)}`

export function backgroundFindings(id: string, probe: Pick<Probe, 'paint' | 'bgGeom'>): Finding[] {
  const out: Finding[] = []
  const { paint, bgGeom } = probe
  if (paint.device !== paint.screen || paint.deviceImage !== paint.screenImage) {
    out.push({
      screen: id,
      check: 'background',
      detail: `.device ${paint.device}/${paint.deviceImage} ≠ .screen ${paint.screen}/${paint.screenImage} — dải OS sẽ lệch màu ruột màn`,
    })
  }
  const hasImage = (v: string) => v !== '' && v !== 'none'
  if (!hasImage(paint.deviceImage) && !hasImage(paint.screenImage)) return out
  const bothFixed = paint.deviceAttachment === 'fixed' && paint.screenAttachment === 'fixed'
  const s = bgGeom.screen
  const sameRect =
    s !== null &&
    Math.abs(bgGeom.device.x - s.x) <= BG_RECT_TOL &&
    Math.abs(bgGeom.device.y - s.y) <= BG_RECT_TOL &&
    Math.abs(bgGeom.device.w - s.w) <= BG_RECT_TOL &&
    Math.abs(bgGeom.device.h - s.h) <= BG_RECT_TOL
  if (!bothFixed && !sameRect) {
    out.push({
      screen: id,
      check: 'background',
      detail:
        `hai hệ toạ độ nền khác nhau — .device attachment=${paint.deviceAttachment} rect ${fmtRect(bgGeom.device)}` +
        ` vs .screen attachment=${paint.screenAttachment} rect ${s ? fmtRect(s) : 'none'}` +
        ` — cần cả hai neo viewport (background-attachment: fixed) hoặc hai rect bằng nhau`,
    })
  }
  return out
}
```
4. `checkScreen`: thay khối `if (probe.paint.device !== probe.paint.screen || …)` hiện có bằng:
```ts
  out.push(...backgroundFindings(id, probe))
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/region-audit.test.ts -t "backgroundFindings"`
Expected: PASS (cả 5 ca)

- [ ] **Step 5: Chạy tầng đo thật**

Run: `npm run audit:regions`
Expected: in `background: ok`, `0 lỗi vùng đo được`

- [ ] **Step 6: Commit**

```bash
git add scripts/region-audit.ts scripts/region-audit.test.ts
git commit -m "feat(audit): flag backgrounds painted in two coordinate spaces"
```

---

### Task 4: Golden CI cho `halloween-offer` + dọn mồ côi `day`

**Files:**
- Modify: `scripts/golden-check.ts` (`PINS`)
- Modify: golden store chứa record `day--reference--light@2x` → `goldens/goldens.json`
- Delete: `goldens/day-reference@2x.png`
- Create (qua lệnh): element golden `region-nav` + record cấp màn cho `halloween-offer`

**Interfaces:**
- Consumes: `npm run export -- --golden …` (ghi record), `npm run golden:check` (soát `PINS`).
- Produces: pin `halloween-offer`/`region-nav` được soát; không còn pin/record `day`.

- [ ] **Step 1: Ghi golden vắt qua seam**

Run: `npm run export -- --golden --element region-nav --screen halloween-offer`
Expected: dòng `element halloween-offer--reference--light--region-nav  clip 0,35 390×108pt …`; crop ghi vào store.

- [ ] **Step 2: Nhìn crop để chắc vắt qua ranh giới**

Run: `open exports` (hoặc mở file crop trong store vừa ghi)
Expected: PNG crop có **nửa trên** là nền do `.device` vẽ (đáy status + band nav, thấy nút ×) và **nửa dưới** là nền do `.screen` vẽ — ranh giới seam nằm giữa crop, không có bước nhảy màu.

- [ ] **Step 3: Ghi record cấp màn (nhãn board)**

Run: `npm run export -- --golden --screen halloween-offer`
Expected: record toàn khung cho `halloween-offer` xuất hiện trong store (đường dẫn in ra stdout).

- [ ] **Step 4: Thêm pin, xoá pin `day`**

Trong `scripts/golden-check.ts`, `PINS`:
- Xoá dòng `{ screen: 'day', element: 'day-cell.is-on', … }`.
- Thêm `{ screen: 'halloween-offer', element: 'region-nav', why: 'band nav trên nền ảnh — crop vắt qua seam .device/.screen' }`.

- [ ] **Step 5: Xoá record + ảnh mồ côi `day`**

- Trong golden store (xác nhận bằng `grep -rn "\"day\"" goldens`): xoá record `day--reference--light@2x` khỏi `goldens/goldens.json`.
- Run: `git rm goldens/day-reference@2x.png` (và xoá PNG phụ nếu lệnh báo còn).

- [ ] **Step 6: Verify**

Run: `npm run golden:check`
Expected: `5 pin(s), 0 failed` (pin `halloween-offer … region-nav  ok`), không còn dòng FAIL.
Run: `grep -rn "day-cell" scripts goldens`
Expected: rỗng (exit 1)

- [ ] **Step 7: Commit**

```bash
git add scripts/golden-check.ts goldens project/paywall-kit/goldens
git rm --cached goldens/day-reference@2x.png 2>/dev/null; git add -A goldens
git commit -m "test(golden): pin halloween-offer nav across the seam; drop orphan day"
```

---

### Task 5: Tích hợp (chỉ kiểm chứng hệ thống)

**Files:** không tạo/sửa file sản phẩm; chỉ chạy và khôi phục.

- [ ] **Step 1: Gate đầy đủ**

Run: `npm run gate`
Expected: `npm run lint` 0 lỗi; `audit:regions` in `background: ok` + `0 lỗi vùng đo được`; `vitest` tất cả PASS.

- [ ] **Step 2: Export và NHÌN + đo điểm ảnh**

Run: `npm run export -- --screen halloween-offer`
Rồi so nền render với chính ảnh gốc (cột mép trái không bị nội dung phủ):

```bash
python3 - <<'PY'
from PIL import Image
src = Image.open("project/paywall-kit/assets/hw-night.jpg").convert("RGB")
out = Image.open("exports/halloween-offer@2x.png").convert("RGB")
for x in (0, 10, 15, 30, 760, 779):
    md = max(max(abs(a-b) for a, b in zip(src.getpixel((x, y)), out.getpixel((x, y)))) for y in range(out.height))
    print(f"x={x:3d}  max|render-src| = {md}")
PY
```

Expected: mọi cột in `= 0` (nền trùng ảnh gốc qua cả dải status và band nav); và **nhìn** PNG không seam.

- [ ] **Step 3: Kiểm chứng âm — gate bắt được seam**

Tạm gỡ `background-attachment: fixed;` khỏi rule `.screen` trong `src/screens/vocab.css`.
Run: `npm run audit:regions -- --screen halloween-offer`
Expected: exit ≠ 0, finding `background` với detail chứa "hai hệ toạ độ nền khác nhau".
Khôi phục dòng vừa gỡ (verify: `npx vitest run src/screens/vocab.test.ts` PASS lại).

- [ ] **Step 4: Commit (nếu Step 3 để lại thay đổi)**

```bash
git status --short   # phải sạch; nếu còn, khôi phục rồi commit trạng thái sạch
```

---

## Self-Review (đã chạy)

- **Spec coverage:** bất biến nền (Task 1-2) ✓; gate đo render (Task 3) ✓; golden + dọn `day` (Task 4) ✓; tài liệu (Task 2 Step 5) ✓; nghiệm thu export/original (Task 5) ✓.
- **Type consistency:** `backgroundFindings(id, probe)`, `Probe['paint'].{deviceAttachment,screenAttachment}`, `Probe['bgGeom'].{device,screen,viewport}` dùng thống nhất giữa Task 3 và test.
- **Review Focus → test:** "chỉ một bên fixed" → test `flags two coordinate spaces…`; "không `.screen`/không ảnh" → test `ignores a screen with no background image`; "rect bằng nhau, scroll" → test `passes when rects are equal…`; "check giá trị" → test `keeps the value mismatch check`.
- **Proportion:** plan ngắn hơn spec+lõi nó mô tả; không chép thân hàm nào ngoài `backgroundFindings` (algorithms cần chốt).

