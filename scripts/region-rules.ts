/**
 * Screen-region rules — the pure core, no fs and no I/O.
 *
 * `scripts/region-lint.ts` is the CLI that walks the projects and prints what
 * these functions return; this module is what the tests drive with in-memory
 * fixtures. Keeping the rules here means the gate and its tests can never
 * disagree, and it is type-checked (`tsconfig.json` includes `scripts` with
 * `strict`) rather than trusted because a shell ran it.
 *
 * What belongs in here is only what is knowable from the text of a screen.
 * Everything geometric — a hit region under 44 pt, a control sitting on the
 * fold, whether the status bar strip matches the screen's background — needs a
 * layout pass, and that lives in `scripts/region-audit.ts`.
 *
 * The map of which region a given form factor owes is docs/screen-regions.md.
 */

/** the regions a screen author owns. The shell owns the two OS bands below. */
export const REGION_CLASSES = [
  '.split',
  '.pane',
  '.pane-lead',
  '.pane-trail',
  '.rail',
  '.rail-tools',
  '.rail-tabs',
  '.rail-item',
  '.sidebar',
  '.sidebar-head',
  '.sidebar-item',
] as const

/** every class that declares a fixed band, so declaring one is never "extra" */
export const BAND_CLASSES = [
  '.navbar',
  '.navbar-float',
  '.tabbar',
  '.tabbar-float',
  '.dock',
  '.bottom-cta',
  '.cta-bar',
  '.rail',
  '.sidebar',
  '.split',
] as const

/**
 * Classes the STATIC tier governs: a declaration under 44 px here is a
 * vocabulary defect the gate can prove from the stylesheet alone.
 *
 * Deliberately a short list. The spec raises exactly `.close-btn`,
 * `.pill-soft` and `.icon-btn`; `.tab-item` and `.toggle` are legal only
 * because a parent guarantees them (`.tabbar-float` is 68 px, `.action-row`
 * is 46 px). Everything else — `.chip`, `.seg`, `.pill-sm`, `.badge` — is
 * measured instead, because whether it is a hit target depends on the parent
 * it lands in, and a regex cannot know that. The audit reports those.
 */
export const TOUCH_CLASSES = [
  '.close-btn',
  '.pill-soft',
  '.icon-btn',
  '.tab-item',
  '.toggle',
] as const

const INTERACTIVE_TAG = /<(?:button|a|input|select|textarea)\b/i
const INTERACTIVE_CLASS =
  /\b(?:nav-round|icon-btn|icon-btn-soft|close-btn|pill|pill-sm|pill-soft|pill-ghost|pill-light|chip|seg|tab|tab-item|toggle|badge|sq-btn|plus-btn|circle-btn|searchbar)\b/
const INTERACTIVE_ROLE = /\brole\s*=\s*["'](?:button|tab|switch|link)["']/i
const FLEX_CLASS = /\b(?:row|col|split|rail|sidebar)\b/
const FLEX_STYLE = /display\s*:\s*flex/
const CONTENT_BANDS = /\b(?:body-fixed|body|screen)\b/
/** a real bottom band spreads its children across the width */
const DISTRIBUTES = /justify-content\s*:\s*(?:space-between|space-around|flex-end|end)|tabbar/
/** overlays and spacers lead or trail a band; they are not one */
const OVERLAY_CLASS = /\b(?:scrim|sheet-panel|sheet-head|grabber|spacer)\b/

/**
 * OS chrome the shell injects. A screen that declares any of these is drawing
 * the band twice — the injected one already sits outside `.viewport`.
 */
export const CHROME_PATTERNS = [
  'statusbar',
  'status-bar',
  'status_bar',
  'home-indicator',
  'homeindicator',
  'home-bar',
  'homebar',
  'dynamic-island',
  'island',
  'notch',
] as const

export const OFF_SWITCH = /<!--\s*lint-region:\s*off\s*-->/i

export type Violation = {
  /** 1-based line inside the file */
  line: number
  /** machine-stable code, so the exemption list can name a rule */
  code: string
  /** what is wrong, and what to do about it */
  message: string
}

/** strip comments while keeping every line, so line numbers stay honest */
function withoutComments(src: string): string {
  return src
    .replace(/<!--[\s\S]*?-->/g, (c) => '\n'.repeat(c.split('\n').length - 1))
    .replace(/\/\*[\s\S]*?\*\//g, (c) => '\n'.repeat(c.split('\n').length - 1))
}

export function lineOf(src: string, index: number): number {
  return src.slice(0, index).split('\n').length
}

function classesOf(tag: string): string[] {
  const m = /class\s*=\s*"([^"]*)"/i.exec(tag)
  return m?.[1] ? m[1].split(/\s+/) : []
}

function tagsOf(src: string): Array<{ tag: string; index: number }> {
  return [...src.matchAll(/<[a-zA-Z][^>]*>/g)].map((m) => ({ tag: m[0], index: m.index ?? 0 }))
}

function tagName(tag: string): string {
  return /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(tag)?.[1] ?? '?'
}

function isFlex(tag: string): boolean {
  return FLEX_CLASS.test(classesOf(tag).join(' ')) || FLEX_STYLE.test(tag)
}

function isInteractive(tag: string): boolean {
  return INTERACTIVE_TAG.test(tag) || INTERACTIVE_CLASS.test(tag) || INTERACTIVE_ROLE.test(tag)
}

/**
 * Inner HTML of the element whose opening tag starts at `tagIndex`, honouring
 * nesting. The index must point AT the `<` — passing the position after the tag
 * silently re-reads the next sibling as the element, which quietly empties
 * every rule that walks a region's children.
 */
function readUntilClose(src: string, tagIndex: number): { body: string; end: number } | null {
  const open = /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/.exec(src.slice(tagIndex))
  if (!open) return null
  const name = open[1]
  const bodyStart = tagIndex + open[0].length
  const tagRe = new RegExp(`<(/?)${name}\\b([^>]*)>`, 'gi')
  tagRe.lastIndex = bodyStart
  let depth = 1
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(src)) !== null) {
    if (/\/\s*$/.test(m[2] ?? '')) continue
    depth += m[1] === '/' ? -1 : 1
    if (depth === 0) return { body: src.slice(bodyStart, m.index), end: m.index }
  }
  return null
}

/**
 * An `off` switch only counts when it says why. A bare switch is not an
 * exemption, it is a debt with better camouflage.
 */
export function offSwitchViolations(src: string): Violation[] {
  const out: Violation[] = []
  for (const m of src.matchAll(/<!--\s*lint-region:\s*off\b([\s\S]{0,200}?)-->/gi)) {
    if ((m[1] ?? '').trim().length === 0) {
      out.push({
        line: lineOf(src, m.index),
        code: 'region-off-without-reason',
        message:
          'lint-region: off mà không có lý do — viết lý do ngay sau comment, ví dụ `<!-- lint-region: off — app tự dựng overlay của riêng mình -->`',
      })
    }
  }
  return out
}

/**
 * A file-level `off` switch turns every rule off. It has to be declared before
 * any element — a screen always opens with its `<!-- pc {...} -->` header, so
 * "first line" would be wrong; "before the first tag" is what the author means.
 */
export function fileIsExempt(src: string): boolean {
  const firstTag = src.search(/<[a-zA-Z]/)
  if (firstTag < 0) return false
  return /<!--\s*lint-region:\s*off\b/i.test(src.slice(0, firstTag))
}

/** Requirement: shell owns the OS bands, an author must not redraw them. */
export function chromeViolations(src: string): Violation[] {
  const out: Violation[] = []
  const stripped = withoutComments(src)
  for (const { tag, index } of tagsOf(stripped)) {
    const haystack = `${classesOf(tag).join(' ')} ${tag.toLowerCase()}`
    const hit = CHROME_PATTERNS.find((p) => haystack.includes(p))
    if (!hit) continue
    out.push({
      line: lineOf(stripped, index),
      code: 'chrome-redrawn',
      message: `màn tự vẽ vùng OS (\`${hit}\`) — xoá markup này; shell đã inject \`.statusbar\` và \`.home-indicator\` ngoài \`.viewport\` (docs/screen-regions.md)`,
    })
  }
  return out
}

/**
 * Requirement: a fixed band is expressed with a region class.
 *
 * The signal is position, not a keyword: a band is the FIRST element child of
 * the content band (a top band) or the LAST one (a bottom band). Looking
 * there rather than scanning for `space-between` is what keeps this rule
 * from flagging a content row that merely distributes its children.
 *
 * A candidate is a violation when it is a flex container that either holds
 * controls directly, or holds two or more flex children — the second shape is
 * a hand-built split or rail arrangement, which is exactly what `.split` and
 * `.rail` exist to name.
 */
export function undeclaredRegionViolations(src: string, form: string): Violation[] {
  const out: Violation[] = []
  const stripped = withoutComments(src)
  // `.screen` and `.body-fixed`/`.body` are the same kind of wrapper, nested.
  // Bands are the children of the INNERMOST one, so take the last match.
  const bandTag = tagsOf(stripped)
    .filter(({ tag }) => CONTENT_BANDS.test(classesOf(tag).join(' ')))
    .at(-1)
  if (!bandTag) return out
  const inner = readUntilClose(stripped, bandTag.index)
  if (!inner) return out

  // Overlays lead or trail a sheet, so they are not the band. A screen may
  // have one band, two, or a single element that is both.
  const candidates = directChildren(inner.body).filter(
    (c) => !OVERLAY_CLASS.test(classesOf(c.tag).join(' ')),
  )
  const bandLine = lineOf(stripped, bandTag.index)
  const seen = new Set<number>()
  for (const [position, child] of [
    ['trên', candidates[0]],
    ['dưới', candidates[candidates.length - 1]],
  ] as const) {
    if (!child || seen.has(child.offset)) continue
    seen.add(child.offset)
    const { tag, offset } = child
    const classes = classesOf(tag)
    if (classes.some((c) => BAND_CLASSES.map((b) => b.slice(1)).includes(c))) continue
    if (!isFlex(tag)) continue

    const body = readUntilClose(inner.body, offset)?.body ?? ''
    const direct = directChildren(body)
    const holdsControl = direct.some((c) => isInteractive(c.tag))
    // a hand-built arrangement: panes carrying their own flex basis
    const flexKids = direct.filter((c) => FLEX_CLASS.test(classesOf(c.tag).join(' '))).length
    const basisKids = direct.filter((c) => /flex\s*:\s*\d/.test(c.tag)).length
    const arrangement = basisKids >= 2 || flexKids >= 2
    if (!holdsControl && !arrangement) continue
    // The bottom of a screen is where content lives, so position alone is not
    // evidence: a trailing card holding a button is content, not a band. A
    // real bottom band *distributes* its children across the width. The top of
    // a screen is unambiguous, so it needs no such test. Anything this misses
    // is caught by the audit, which can see where the band actually sits.
    if (position === 'dưới' && !DISTRIBUTES.test(tag)) continue

    const at = bandLine + lineOf(inner.body, offset) - 1
    const kind = arrangement ? 'split / dải dọc dựng tay' : 'thanh điều hướng dựng tay'
    out.push({
      line: at,
      code: 'region-undeclared',
      message: `vùng chưa khai báo — \`<${tagName(tag)} class="${classes.join(' ')}">\` là ${kind} ở mép ${position} của vùng nội dung, form \`${form}\`, mà không mang class vùng. Dùng \`.navbar\` (phone), \`.split\` + \`.pane\` (inner/fold), \`.rail\` (cover), \`.sidebar\` (tablet) — docs/screen-regions.md`,
    })
  }
  return out
}

/** element children of a fragment, skipping anything nested inside another tag */
function directChildren(fragment: string): Array<{ tag: string; offset: number }> {
  const out: Array<{ tag: string; offset: number }> = []
  const stack: number[] = []
  for (const m of fragment.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const closing = m[1] === '/'
    const selfClosing = /\/\s*$/.test(m[3] ?? '')
    if (selfClosing) {
      if (stack.length === 0) out.push({ tag: m[0], offset: m.index })
      continue
    }
    if (closing) {
      stack.pop()
      continue
    }
    if (stack.length === 0) out.push({ tag: m[0], offset: m.index })
    stack.push(0)
  }
  return out
}

/** Requirement: navbar anatomy — at most three trailing actions, one-line title. */
export function navbarViolations(src: string): Violation[] {
  const out: Violation[] = []
  const stripped = withoutComments(src)
  for (const { tag, index } of tagsOf(stripped)) {
    const classes = classesOf(tag)
    if (!classes.includes('navbar') && !classes.includes('navbar-float')) continue
    const start = lineOf(stripped, index)
    const inner = readUntilClose(stripped, index)
    if (!inner) continue

    const buttons = [...inner.body.matchAll(/<button\b/gi)].length
    if (buttons > 3) {
      out.push({
        line: start,
        code: 'navbar-too-many-actions',
        message: `navbar có ${buttons} action — tối đa 3 ở slot cuối, phần dư vào menu More (apple-design-iphone)`,
      })
    }
    const title = /class="[^"]*\bnav-title\b[^"]*"[^>]*>([^<]*)</.exec(inner.body)?.[1]
    if (title && title.trim().length >= 15) {
      out.push({
        line: start,
        code: 'navbar-title-long',
        message: `tiêu đề navbar "${title.trim()}" dài ${title.trim().length} ký tự — giữ dưới 15 để chừa chỗ cho control`,
      })
    }
    if (isPushScreen(inner.body) && !hasBackButton(inner.body)) {
      out.push({
        line: start,
        code: 'navbar-back-missing',
        message:
          'màn push (có nút back trong leading slot) phải dùng symbol chuẩn `chevron.left`; không dùng chữ "Back"/"Close"',
      })
    }
  }
  return out
}

/** a push screen is one that already carries a back affordance or a back label */
function isPushScreen(body: string): boolean {
  return /aria-label\s*=\s*"[^"]*(?:Quay lại|Back|Đóng|Close)/i.test(body)
}

function hasBackButton(body: string): boolean {
  return /data-symbol\s*=\s*["'](?:chevron\.left|arrow\.left|xmark)/.test(body)
}

/**
 * A destination counts as labelled if it carries an aria-label, a `tab-label`
 * element, or any visible text. The repo's own tabs spell the label as a plain
 * sibling `<span>Home</span>`, so requiring a class would flag correct screens.
 */
function isLabelledTab(fragment: string, index: number, tag: string): boolean {
  if (/aria-label\s*=\s*"[^"]*\S[^"]*"/.test(tag)) return true
  const inner = readUntilClose(fragment, index)?.body
  if (inner === undefined) return false
  if (/\btab-label\b/.test(inner)) return true
  // an element with a real text node is the visible label — `[^<\s]` so a
  // closing tag does not read as text
  return /<(?:span|p|em|strong)\b[^>]*>\s*[^<\s]/.test(inner)
}

/** Requirement: 3–5 destinations, every one labelled, never horizontal on cover. */
export function tabbarViolations(src: string, form: string): Violation[] {
  const out: Violation[] = []
  const stripped = withoutComments(src)
  for (const { tag, index } of tagsOf(stripped)) {
    const classes = classesOf(tag)
    const isTabbar = classes.includes('tabbar') || classes.includes('tabbar-float')
    if (!isTabbar) continue
    const start = lineOf(stripped, index)
    const inner = readUntilClose(stripped, index)
    if (!inner) continue

    const items = [...inner.body.matchAll(/<(?:button|span|a)\b([^>]*\bclass\s*=\s*"[^"]*\btab\b[^"]*")/gi)]
    if (items.length > 5) {
      out.push({
        line: start,
        code: 'tabbar-too-many',
        message: `tab bar có ${items.length} destination — tối đa 5; gộp vào More ở hẹp, hoặc chuyển sang \`.sidebar\` ở rộng`,
      })
    }
    for (const item of items) {
      const at = lineOf(inner.body, item.index ?? 0) + start - 1
      if (isLabelledTab(inner.body, item.index ?? 0, item[0])) continue
      out.push({
        line: at,
        code: 'tabbar-unlabelled',
        message: 'destination thiếu nhãn — tab luôn có icon **và** nhãn (apple-design-iphone)',
      })
    }
  }

  if (form === 'cover') {
    const m = /<[a-zA-Z][^>]*class\s*=\s*"[^"]*\btabbar\b/.exec(stripped)
    if (m) {
      out.push({
        line: lineOf(stripped, m.index),
        code: 'cover-horizontal-tabbar',
        message:
          'pose `cover` không được có tab ngang ở đáy — destination chuyển lên dải dọc `.rail-tabs` (apple-design-iphone-duo)',
      })
    }
  }
  return out
}

/** Requirement: no px tied to one device's width or height. */
export function deviceLiteralViolations(
  src: string,
  deviceWidths: readonly number[],
): Violation[] {
  const out: Violation[] = []
  const stripped = withoutComments(src)
  for (const size of deviceWidths) {
    for (const m of stripped.matchAll(new RegExp(`(?:width|height)\\s*:\\s*${size}px`, 'g'))) {
      out.push({
        line: lineOf(stripped, m.index),
        code: 'device-literal',
        message: `số px gắn với kích thước thiết bị (${size}px) — màn phải fluid, dùng \`var(--s*)\` hoặc tỉ lệ flex (invariant #5)`,
      })
    }
  }
  return out
}

/** every text-knowable rule over one screen */
export function screenViolations(input: {
  html: string
  form: string
  deviceWidths: readonly number[]
}): Violation[] {
  if (fileIsExempt(input.html)) return []
  return [
    ...offSwitchViolations(input.html),
    ...chromeViolations(input.html),
    ...undeclaredRegionViolations(input.html, input.form),
    ...navbarViolations(input.html),
    ...tabbarViolations(input.html, input.form),
    ...deviceLiteralViolations(input.html, input.deviceWidths),
  ]
}

export type CssRule = { selector: string; body: string }

/** split a stylesheet into flat rules — enough for "does this class exist" */
export function rulesOf(css: string): CssRule[] {
  const out: CssRule[] = []
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    for (const selector of m[1].split(',')) {
      const trimmed = selector.trim()
      if (trimmed) out.push({ selector: trimmed, body: m[2] })
    }
  }
  return out
}

/**
 * Requirement: a class the vocabulary declares as a hit target must clear the
 * touch floor. A parent that guarantees it is the documented exception.
 */
export function touchFloorViolations(
  css: string,
  touchMin: number,
  guaranteedBy: Record<string, string>,
): Violation[] {
  const out: Violation[] = []
  const declared = new Map<string, number[]>()
  for (const rule of rulesOf(css)) {
    for (const cls of rule.selector.split(/\s+/)) {
      if (!cls.startsWith('.')) continue
      const values = declared.get(cls) ?? []
      // anchored to a property boundary: an unanchored /height:/ also matches
      // inside `line-height: 13px`, which once reported a 13 px hit region
      const w = /(?:^|[;{])\s*width\s*:\s*(\d+)px/.exec(rule.body)?.[1]
      const h = /(?:^|[;{])\s*(?:min-)?height\s*:\s*(\d+)px/.exec(rule.body)?.[1]
      if (w) values.push(Number(w))
      if (h) values.push(Number(h))
      declared.set(cls, values)
    }
  }
  for (const cls of TOUCH_CLASSES) {
    if (guaranteedBy[cls]) continue
    const values = declared.get(cls)
    if (!values || values.length === 0) continue
    const worst = Math.min(...values)
    if (worst < touchMin) {
      out.push({
        line: 0,
        code: 'touch-floor',
        message: `${cls} khai báo ${worst}px — dưới sàn chạm ${touchMin}px; nâng lên \`var(--touch-min)\`, hoặc khai trong \`GUARANTEED_BY\` nếu vùng cha thật sự bảo đảm`,
      })
    }
  }
  return out
}
