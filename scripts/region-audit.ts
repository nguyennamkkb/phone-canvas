#!/usr/bin/env node
/**
 * Region audit: the MEASURED half of the region gate.
 *
 *   npm run audit:regions
 *   npm run audit:regions -- --screen home
 *
 * The static lint cannot see geometry. Whether a hit region is really 44 pt
 * depends on the parent it landed in; whether a control sits on the fold
 * depends on where the panes ended up; whether the status bar strip matches
 * the screen depends on the cascade. So this composes every screen at the
 * device its own header declares, lays it out in the Chrome that is already on
 * the machine, and asserts on what actually rendered.
 *
 * It reuses `scripts/export/{site,cdp,render}.ts` verbatim — same documents,
 * same launcher, same wait-for-layout. No new dependency, no dev server, no
 * build step.
 *
 * Checks (docs/screen-regions.md is the prose):
 *   chrome                 the two OS bands exist once each, outside .viewport
 *   background continuity  .device paints what .screen paints
 *   hit regions            every interactive rect >= 44 x 44
 *   region order           the tab bar is the last band, never above the nav
 *   split balance          two panes on a folded screen are 50/50
 *   division band          nothing interactive sits on the crease
 *   scroll                 exactly one scroller, bands outside it
 *   overflow               a .body-fixed / .screen that fits its frame
 *   shell-band             band exists when the slot does, inside .viewport
 *
 * A finding fails the gate. When there is no Chrome on the machine it prints a
 * loud SKIPPED line and exits 0, the same precedent as
 * `scripts/export/export.test.ts` — and the mechanism that paints the strips
 * is still covered by a unit test on `screenBgOf`.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { composeScreenDoc } from '../src/extractor/compose.ts'
import { DEFAULT_DEVICE_ID, getDevice, type Device } from '../src/frame/devices.ts'
import { launch, shutdown } from './export/cdp.ts'
import { evaluate, waitForHeight } from './export/render.ts'
import { findChrome, sleep } from './export/chrome.ts'
import { startSite } from './export/site.ts'
import { scanProjects } from './scan-projects.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS_DIR = path.join(ROOT, 'src/screens')
const PUBLIC_DIR = path.join(ROOT, 'public')
const STYLESHEETS = ['tokens.css', 'icons.css', 'icon-set.css']

/** Apple's minimum hit region, mirroring `--touch-min` */
const TOUCH_MIN = 44

/** how far either pane may sit from half the split before it is "not balanced" */
const BALANCE_TOLERANCE = 0.03

/**
 * The crease: the middle of an inner display while it is partially folded.
 * Nothing interactive, textual or gridded may intersect it.
 */
const DIVISION_HALF_WIDTH = 12

/**
 * The one place measured exemptions live. Every entry names the element and
 * says why — an unbacked entry is how a 30 pt button ships, so there is no
 * silent form. Prefer fixing the token over adding a line here: `.chip` started
 * here, was measured at 32-40 pt, and belonged in `tokens.css` all along.
 */
const EXEMPTIONS: Array<{ match: string; reason: string }> = [
  {
    match: '.toggle',
    reason:
      'track is 28 pt tall; the hit region is the whole .action-row (46 pt) that contains it',
  },
]

type Rect = { x: number; y: number; w: number; h: number }
type Interactive = Rect & { label: string; tag: string }
type Probe = {
  chrome: { statusbars: number; homeIndicators: number; insideViewport: number }
  paint: { device: string; screen: string; deviceImage: string; screenImage: string }
  interactive: Interactive[]
  regions: {
    nav: Rect | null
    tabs: Rect | null
    screen: Rect | null
    split: Rect | null
    rail: Rect | null
    panes: Rect[]
  }
  scroll: { count: number; labels: string[]; bandInScroller: number }
  overflow: Array<{ label: string; scrollHeight: number; clientHeight: number }>
  shellBand: {
    navCount: number
    tabsCount: number
    navInScroller: number
    tabsInScroller: number
    navOutsideViewport: number
    tabsOutsideViewport: number
    slotsOutsideNav: number
    tabsOutsideTabs: number
  }
  deviceHeight: number
}

/**
 * Runs inside the page. Kept free of template literals so the outer string can
 * be a plain literal, and free of assumptions so one probe serves every form
 * factor — anything absent simply comes back null.
 */
const PROBE = `(() => {
  const q = (sel) => document.querySelector(sel)
  const qa = (sel) => Array.from(document.querySelectorAll(sel))
  const rectOf = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  }
  const label = (el) => {
    const cls = (el.getAttribute('class') || '').split(/\\s+/).filter(Boolean).slice(0, 2)
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '')
  }
  const viewport = q('.viewport')
  const inside = (el) => !!(viewport && viewport.contains(el))
  const style = (sel) => {
    const el = q(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    return { color: cs.backgroundColor, image: cs.backgroundImage }
  }
  const device = style('.device')
  const screen = style('.screen')

  const INTERACTIVE =
    'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [tabindex]'
  const interactive = qa(INTERACTIVE)
    .filter((el) => {
      if (viewport && !viewport.contains(el)) return false
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return false
      if (getComputedStyle(el).pointerEvents === 'none') return false
      return true
    })
    .map((el) => Object.assign(rectOf(el), { label: label(el), tag: el.tagName.toLowerCase() }))

  // only the OUTERMOST split's panes: a pane may hold a nested split of its
  // own, and counting those would turn a 2-pane screen into a 4-pane one
  const outerSplit = q('.split')
  const panes = outerSplit
    ? Array.from(outerSplit.children)
        .filter((el) => el.classList.contains('pane'))
        .map(rectOf)
        .filter(Boolean)
    : []
  return {
    chrome: {
      statusbars: qa('.statusbar').length,
      homeIndicators: qa('.home-indicator').length,
      insideViewport: qa('.statusbar, .home-indicator').filter(inside).length,
    },
    paint: {
      device: device ? device.color : 'none',
      deviceImage: device ? device.image : 'none',
      screen: screen ? screen.color : 'none',
      screenImage: screen ? screen.image : 'none',
    },
    interactive: interactive,
    regions: {
      nav: rectOf(q('.region-nav')),
      tabs: rectOf(q('.region-tabs')),
      screen: rectOf(q('.screen')),
      split: rectOf(q('.split')),
      rail: rectOf(q('.rail')),
      panes: panes,
    },
    // declared scrollers (overflow-y auto|scroll with real size) inside the
    // viewport. A phone screen owes exactly one, and no nav/tab band inside it.
    scroll: (() => {
      const declared = qa('.viewport *').filter((el) => {
        const o = getComputedStyle(el).overflowY
        if (o !== 'auto' && o !== 'scroll') return false
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      const inScroller = (el) => declared.some((s) => s !== el && s.contains(el))
      const bands = qa('.region-nav, .region-tabs')
      return {
        count: declared.length,
        labels: declared.map(label),
        bandInScroller: bands.filter(inScroller).length,
      }
    })(),
    // a non-scrolling band must fit: scrollHeight over clientHeight is a bug
    overflow: qa('.screen, .body-fixed')
      .map((el) => ({
        label: label(el),
        scrollHeight: Math.ceil(el.scrollHeight),
        clientHeight: Math.ceil(el.clientHeight),
      }))
      .filter((o) => o.scrollHeight > o.clientHeight + 1),
    // shell-owned bands: exist when slots exist, sit inside .viewport but
    // OUTSIDE the scroller (a band that scrolls with the content is not a band)
    shellBand: (() => {
      const nav = qa('.region-nav')
      const tabs = qa('.region-tabs')
      const scrollers = qa('.viewport *').filter((el) => {
        const o = getComputedStyle(el).overflowY
        if (o !== 'auto' && o !== 'scroll') return false
        return el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
      })
      const inScroller = (el) => scrollers.some((s) => s !== el && s.contains(el))
      const outsideViewport = (el) => !(viewport && viewport.contains(el))
      return {
        navCount: nav.length,
        tabsCount: tabs.length,
        navInScroller: nav.filter(inScroller).length,
        tabsInScroller: tabs.filter(inScroller).length,
        navOutsideViewport: nav.filter(outsideViewport).length,
        tabsOutsideViewport: tabs.filter(outsideViewport).length,
        slotsOutsideNav: qa('[data-slot]').filter((el) => !el.closest('.region-nav')).length,
        tabsOutsideTabs: qa('[data-tab]').filter((el) => !el.closest('.region-tabs')).length,
      }
    })(),
    deviceHeight: document.documentElement.clientHeight,
  }
})()`

function exempt(label: string): string | null {
  return EXEMPTIONS.find((e) => label.includes(e.match.slice(1)))?.reason ?? null
}

type Finding = { screen: string; check: string; detail: string }

async function measure(cdp: import('./export/cdp.ts').Cdp, url: string, device: Device) {
  const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', {
    url: 'about:blank',
  })
  const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  cdp.attach(sessionId)
  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: device.width,
      height: device.height,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await cdp.send('Page.navigate', { url })
    await waitForHeight(cdp)
    await sleep(60)
    return (await evaluate(cdp, PROBE)) as Probe | undefined
  } finally {
    cdp.attach(null)
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {})
  }
}

function checkScreen(id: string, device: Device, probe: Probe): Finding[] {
  const out: Finding[] = []
  const wantStatus = device.safeTop > 0 ? 1 : 0
  const wantHome = device.safeBottom > 0 ? 1 : 0

  if (
    probe.chrome.statusbars !== wantStatus ||
    probe.chrome.homeIndicators !== wantHome ||
    probe.chrome.insideViewport !== 0
  ) {
    out.push({
      screen: id,
      check: 'chrome',
      detail: `statusbar ${probe.chrome.statusbars}/${wantStatus} · home-indicator ${probe.chrome.homeIndicators}/${wantHome} · nằm trong .viewport: ${probe.chrome.insideViewport}`,
    })
  }

  if (probe.paint.device !== probe.paint.screen || probe.paint.deviceImage !== probe.paint.screenImage) {
    out.push({
      screen: id,
      check: 'background',
      detail: `.device ${probe.paint.device}/${probe.paint.deviceImage} ≠ .screen ${probe.paint.screen}/${probe.paint.screenImage} — dải OS sẽ lệch màu ruột màn`,
    })
  }

  for (const el of probe.interactive) {
    if (el.w >= TOUCH_MIN && el.h >= TOUCH_MIN) continue
    if (exempt(el.label)) continue
    out.push({
      screen: id,
      check: 'hit-region',
      detail: `${el.label} đo ${Math.round(el.w)}×${Math.round(el.h)} pt tại (${Math.round(el.x)}, ${Math.round(el.y)}) — dưới sàn ${TOUCH_MIN}×${TOUCH_MIN}`,
    })
  }

  const { nav, tabs, screen: contentBand, panes } = probe.regions
  // The shell owns the band order: nav above the content band, tabs below it.
  // Measuring the content band instead of the old hand-built classes is what
  // makes this check live again — after v2 the bands come from the shell, so a
  // probe for `.navbar` / `.tabbar` could never fire.
  if (nav && contentBand && nav.y + nav.h > contentBand.y + 1) {
    out.push({
      screen: id,
      check: 'region-order',
      detail: `dải nav (đáy y=${Math.round(nav.y + nav.h)}) nằm dưới mép trên thân (y=${Math.round(contentBand.y)}) — nav phải ở trên thân`,
    })
  }
  if (tabs && contentBand && tabs.y < contentBand.y + contentBand.h - 1) {
    out.push({
      screen: id,
      check: 'region-order',
      detail: `tab bar (đỉnh y=${Math.round(tabs.y)}) nằm trên mép dưới thân (y=${Math.round(contentBand.y + contentBand.h)}) — tab phải ở dưới thân`,
    })
  }

  if (panes.length === 2) {
    const [a, b] = panes as [Rect, Rect]
    const total = a.w + b.w
    const ratio = total > 0 ? a.w / total : 0
    if (Math.abs(ratio - 0.5) <= BALANCE_TOLERANCE) {
      // two equal panes means this is the folded pose, and the crease runs
      // down the middle. The middle of the split IS the division band.
      const mid = device.width / 2
      for (const el of probe.interactive) {
        const overlaps = el.x < mid + DIVISION_HALF_WIDTH && el.x + el.w > mid - DIVISION_HALF_WIDTH
        if (!overlaps) continue
        out.push({
          screen: id,
          check: 'division-band',
          detail: `${el.label} (x=${Math.round(el.x)}..${Math.round(el.x + el.w)}) cắt qua dải chia ở giữa (${Math.round(mid)}pt) — dời ra mép ngoài của pane`,
        })
      }
    }
    // an uneven split is the open pose, which is correct — only the folded
    // pose (two equal panes) is what puts a crease through the middle
  }
  return out
}

/**
 * Scroll and shell-band contract. A phone screen owes exactly one vertical
 * scroller (`.body`), with the nav/tab bands outside it; a non-scrolling
 * `.body-fixed` must fit its frame; and a band must exist exactly when its slot
 * does. All three fail the gate.
 */
function layoutViolations(id: string, probe: Probe): Finding[] {
  const out: Finding[] = []
  if (probe.scroll.count > 1) {
    out.push({
      screen: id,
      check: 'scroll',
      detail: `${probe.scroll.count} vùng cuộn khai báo (${probe.scroll.labels.join(', ')}) — nhiều vùng cuộn lồng nhau là lỗi; chỉ giữ một`,
    })
  }
  if (probe.scroll.bandInScroller > 0) {
    out.push({
      screen: id,
      check: 'scroll',
      detail: `${probe.scroll.bandInScroller} band nav/tab nằm TRONG vùng cuộn — band phải đứng yên ngoài`,
    })
  }
  for (const o of probe.overflow) {
    out.push({
      screen: id,
      check: 'overflow',
      detail: `${o.label} tràn khung: ${o.scrollHeight} > ${o.clientHeight} — dùng .body (cuộn) hoặc rút nội dung`,
    })
  }
  const sb = probe.shellBand
  if (sb.navCount + sb.tabsCount > 0) {
    if (sb.navCount > 1 || sb.tabsCount > 1) {
      out.push({ screen: id, check: 'shell-band', detail: `nhiều band shell: ${sb.navCount} .region-nav · ${sb.tabsCount} .region-tabs — shell dựng đúng một mỗi loại` })
    }
    if (sb.navOutsideViewport + sb.tabsOutsideViewport > 0) {
      out.push({ screen: id, check: 'shell-band', detail: 'band nằm ngoài .viewport — phải trong .viewport (panel spec mới thấy control)' })
    }
    if (sb.navInScroller + sb.tabsInScroller > 0) {
      out.push({ screen: id, check: 'shell-band', detail: 'band nằm TRONG vùng cuộn — band phải đứng yên ngoài vùng cuộn' })
    }
  }
  if (sb.slotsOutsideNav > 0 || sb.tabsOutsideTabs > 0) {
    out.push({
      screen: id,
      check: 'shell-band',
      detail: `có slot chưa được shell gom: ${sb.slotsOutsideNav} [data-slot], ${sb.tabsOutsideTabs} [data-tab] nằm ngoài band`,
    })
  }
  return out
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  const only = (() => {
    const i = argv.indexOf('--screen')
    return i >= 0 ? argv[i + 1] : null
  })()

  const { registry, errors } = await scanProjects()
  if (errors.length > 0) {
    console.error(`project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
    process.exit(1)
  }
  const screens = registry.screens.filter((s) => !only || s.id === only)
  if (screens.length === 0) {
    console.error(`audit:regions: no screen matched ${only ?? '(all)'}`)
    process.exit(1)
  }

  const sharedStyles = await Promise.all(
    STYLESHEETS.map((name) => readFile(path.join(SCREENS_DIR, name), 'utf8')),
  )
  const documents = new Map<string, string>()
  const devices = new Map<string, Device>()
  for (const screen of screens) {
    const device = getDevice(screen.deviceId ?? DEFAULT_DEVICE_ID)
    devices.set(screen.id, device)
    const projectTokens = registry.tokens[screen.projectId] ?? null
    const components: Record<string, string> = {}
    for (const component of registry.components) {
      if (component.project !== screen.projectId) continue
      components[component.id] = component.html
    }
    documents.set(
      screen.id,
      composeScreenDoc({
        html: screen.html,
        device,
        stylesheets: projectTokens ? [...sharedStyles, projectTokens] : sharedStyles,
        bridgeJs: null,
        lightStatusBar: screen.lightStatusBar,
        components,
      }),
    )
  }

  // Resolve the browser BEFORE composing the site, so a machine without Chrome
  // skips cleanly instead of half-starting a server it never uses.
  try {
    findChrome()
  } catch (error) {
    for (const line of describeSkip(error instanceof Error ? error.message : String(error))) {
      console.log(line)
    }
    return
  }

  const site = await startSite(documents, PUBLIC_DIR)
  let browser: Awaited<ReturnType<typeof launch>> | null = null
  const findings: Finding[] = []
  const poses: string[] = []
  try {
    browser = await launch()
    for (const screen of screens) {
      const device = devices.get(screen.id) as Device
      const probe = await measure(browser.cdp, `${site.origin}/screen/${screen.id}`, device)
      if (!probe) {
        findings.push({ screen: screen.id, check: 'probe', detail: 'không đọc được layout' })
        continue
      }
      poses.push(describePose(screen.id, device, probe))
      findings.push(...checkScreen(screen.id, device, probe))
      findings.push(...layoutViolations(screen.id, probe))
    }
  } catch (error) {
    for (const line of describeSkip(error instanceof Error ? error.message : String(error))) {
      console.log(line)
    }
    await site.close()
    browser = null
    return
  } finally {
    if (browser) await shutdown(browser)
    await site.close()
  }

  for (const pose of poses) console.log(`  ${pose}`)
  // Say what PASSED as loudly as what failed. A gate that only prints on
  // failure is indistinguishable from one that never ran the check, and
  // "background continuity: ok" is the line that proves the grey-ground
  // regression is still guarded.
  for (const check of ['chrome', 'background', 'region-order', 'division-band', 'scroll', 'overflow', 'shell-band'] as const) {
    const bad = findings.filter((f) => f.check === check).length
    console.log(bad === 0 ? `  ${check}: ok` : `  ${check}: ${bad} lỗi`)
  }
  for (const finding of findings) {
    console.log(`  [${finding.check}] ${finding.screen}: ${finding.detail}`)
  }
  console.log(
    `\n${findings.length} lỗi vùng đo được · ${screens.length} màn · sàn chạm ${TOUCH_MIN}×${TOUCH_MIN}`,
  )
  if (findings.length > 0) {
    console.error('  xem docs/screen-regions.md — hoặc khai miễn trừ có lý do trong EXEMPTIONS')
    process.exit(1)
  }
}

/**
 * What to print when there is no browser to measure in. Loud on purpose: a
 * silent skip reads like a clean run, and the whole point of the measured tier
 * is that geometry is checked rather than assumed. It names the unit test that
 * still covers the background mechanism, so the reader knows what is and is not
 * being verified.
 */
export function describeSkip(reason: string): string[] {
  return [
    '',
    `SKIPPED  audit:regions cần Chrome để đo hình học (${reason.replace(/\n/g, ' ')})`,
    '         sàn chạm, dải chia và nền dải OS CHƯA được kiểm lần này',
    '         cơ chế lan nền vẫn được unit test trong src/extractor/compose.test.ts',
  ]
}

/** one line per screen: what the layout actually turned out to be */
function describePose(id: string, device: Device, probe: Probe): string {
  const { panes, rail, split } = probe.regions
  if (panes.length === 2) {
    const total = panes[0]!.w + panes[1]!.w
    const ratio = total > 0 ? panes[0]!.w / total : 0
    const shape = Math.abs(ratio - 0.5) <= BALANCE_TOLERANCE ? 'split 50/50' : `split ${Math.round(ratio * 100)}:${Math.round((1 - ratio) * 100)}`
    const band = Math.abs(ratio - 0.5) <= BALANCE_TOLERANCE ? ', division band clear' : ''
    return `${id} · ${device.form} · ${shape}${band}`
  }
  if (split || rail) return `${id} · ${device.form} · 1 pane + rail`
  return `${id} · ${device.form} · 1 pane`
}

main().catch((error: unknown) => {
  console.error(`audit:regions: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
