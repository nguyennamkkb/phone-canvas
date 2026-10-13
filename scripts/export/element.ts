/**
 * Element-level crop/export pipeline, as a library.
 *
 * `npm run locate` (the CLI) and the board's dev endpoint
 * (`scripts/export/element-server.ts`) both go through here, so a crop taken
 * from the CLI and a crop taken from the board can never disagree: same
 * compose, same real bridge capture, same clamp arithmetic.
 *
 * Zero dependencies: it drives the Chrome already on the machine over CDP,
 * composes with `src/extractor/compose.ts` (the module the app and the
 * exporter use) and interprets with `src/spec/infer.ts`. Nothing here owns a
 * rule.
 *
 * Coordinates: every number is device points (1 CSS px === 1 pt), origin at
 * the device screen's top-left (status bar included) — the same space the
 * panel reports in "Khung x/y".
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { composeScreenDoc } from '../../src/extractor/compose.ts'
import { getDevice, isKnownDevice } from '../../src/frame/devices.ts'
import type { Device } from '../../src/frame/devices.ts'
import { buildSpec } from '../../src/spec/infer.ts'
import type { RawNode, SpecNode } from '../../src/spec/types.ts'
import type { Registry, ScreenDef } from '../../src/projects/types.ts'
import { scanProjects } from '../scan-projects.ts'
import { launch, shutdown } from './cdp.ts'
import type { Browser, Cdp } from './cdp.ts'
import { startSite } from './site.ts'
import type { Site } from './site.ts'
import { evaluate, waitForHeight } from './render.ts'
import { sleep } from './chrome.ts'

export type Box = { x: number; y: number; w: number; h: number }
export type Clip = { x: number; y: number; width: number; height: number }

export type ElementAttrs = {
  src: string
  alt: string
  symbol: string
  asset: string
  iconSrc: string
  /** raw `className` from the capture; `''` when absent or non-string (an `<svg>` root) */
  class: string
}

export type ElementNode = {
  id: string
  tag: string
  parent: string | null
  depth: number
  role: string
  label: string
  box: Box
  attrs: ElementAttrs
}

/* --------------------------------------------------------------- pure math */

/**
 * Padding in pt. A percentage wins over the fixed pad and is measured against
 * the box's LARGER side, so a wide-but-short row (a card, a countdown) gets
 * even breathing room instead of the sliver a height-relative pad gives.
 */
export function resolvePad(box: Box, opts: { padPt: number; padPct: number | null }): number {
  const raw = opts.padPct === null ? opts.padPt : opts.padPct * Math.max(box.w, box.h)
  return Number.isFinite(raw) && raw > 0 ? raw : 0
}

/**
 * The element box grown by `pad`, clamped inside `bounds` (the device width ×
 * the measured frame height). Never smaller than 1px: a 0-sized clip makes
 * `Page.captureScreenshot` fail outright.
 */
export function clipFor(box: Box, pad: number, bounds: { width: number; height: number }): Clip {
  const x = Math.max(0, Math.floor(Math.min(box.x - pad, bounds.width - 1)))
  const y = Math.max(0, Math.floor(Math.min(box.y - pad, bounds.height - 1)))
  return {
    x,
    y,
    width: Math.max(1, Math.floor(Math.min(box.x + box.w + pad, bounds.width) - x)),
    height: Math.max(1, Math.floor(Math.min(box.y + box.h + pad, bounds.height) - y)),
  }
}

/** smallest box containing `box` and every box in `extra` */
export function unionBox(box: Box, extra: Box[]): Box {
  let left = box.x
  let top = box.y
  let right = box.x + box.w
  let bottom = box.y + box.h
  for (const other of extra) {
    left = Math.min(left, other.x)
    top = Math.min(top, other.y)
    right = Math.max(right, other.x + other.w)
    bottom = Math.max(bottom, other.y + other.h)
  }
  return { x: left, y: top, w: right - left, h: bottom - top }
}

/**
 * The region to shoot: the element box unioned with `ancestorLevels` ancestor
 * boxes, then padded, then clamped.
 *
 * Ancestors exist because a fixed pad either cuts a tall card (`plan-card`)
 * or wastes half a screen around a small pill; `ancestors` is root-first, so
 * the last N are the nearest ones (1 = the direct parent). The pad is resolved
 * against the UNION, not the element: once the region grew, the pad is a share
 * of what is actually being shot.
 */
export function cropFor(
  box: Box,
  ancestors: Box[],
  opts: { padPt: number; padPct: number | null; ancestorLevels: number },
  bounds: { width: number; height: number },
): Clip {
  const levels = Math.max(0, Math.trunc(opts.ancestorLevels))
  const region = unionBox(box, levels > 0 ? ancestors.slice(-levels) : [])
  return clipFor(region, resolvePad(region, opts), bounds)
}

/**
 * The CSS that takes the `hide` selectors out of the shot. `visibility`, never
 * `display`: a hidden overlay must not reflow the layout, because the clip is
 * measured BEFORE the hide, and a moved element would be shot off-centre.
 * An empty list is an empty string — the style element then carries no rule.
 */
export function hideStyle(selectors: readonly string[]): string {
  const clean = selectors.map((selector) => selector.trim()).filter(Boolean)
  if (clean.length === 0) return ''
  return `${clean.join(', ')} { visibility: hidden !important }`
}

/**
 * The evaluate() expression that applies `hideStyle`. It upserts ONE `<style>`
 * element by a stable id, so an empty string clears whatever the previous crop
 * hid: the warm session serves many crops in a row, and a leaked rule would
 * quietly follow every later shot.
 */
export function hideExpr(css: string): string {
  return `(() => {
    const id = 'pc-element-hide';
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = ${JSON.stringify(css)};
    return true;
  })()`
}

/* --------------------------------------------------------------- naming -- */

/** `đ` has no canonical decomposition, so NFKD alone would eat the letter */
const KEBAB_FIXES: Array<[RegExp, string]> = [
  [/[\u0300-\u036f]/g, ''],
  [/[đĐ]/g, 'd'],
]

/** ASCII kebab-case: accents folded, every other non-alphanumeric run a `-` */
function kebab(value: string): string {
  let out = value.normalize('NFKD')
  for (const [pattern, replacement] of KEBAB_FIXES) out = out.replace(pattern, replacement)
  return out
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** `star.fill.svg` → `star.fill`: the name of the art, not the file */
function fileStem(value: string): string {
  const base = (value.split(/[?#]/)[0] ?? '').split('/').pop() ?? ''
  return base.replace(/\.[a-z0-9]+$/i, '')
}

/**
 * The class token to name a file after.
 *
 * Component classes are hyphenated (`pw-card`, `pw-cta`, `ss-cell`), utilities
 * are not (`col`, `row`, `grow`), and a DOM class list carries no order worth
 * trusting — so: the LONGEST hyphenated token, ties to the first one, else the
 * first token. Deterministic on purpose: the same element must yield the same
 * stem on every run, or an element golden keyed on it would silently go
 * missing after an unrelated edit.
 */
function classToken(className: string): string {
  const tokens = className.split(/\s+/).filter(Boolean)
  let best = ''
  for (const token of tokens) {
    if (token.includes('-') && token.length > best.length) best = token
  }
  return best || tokens[0] || ''
}

/**
 * File stem for one element's PNG + JSON.
 *
 * Order: the author's `data-asset` (the asset-catalog name the handoff will
 * use anyway), then `data-symbol` / the icon-or-image file name, then the
 * element's class, then the bridge id, then `role-index`.
 *
 * The class comes before the id because the id (`e12`) is a capture position:
 * it shifts the moment the screen's markup changes, so a golden keyed on it
 * would vanish after an unrelated edit. Always non-empty and ASCII, so a card
 * never lands as `plan card@2x.png`.
 */
export function elementStem(node: ElementNode, index = 1): string {
  const candidates = [
    node.attrs.asset,
    node.attrs.symbol,
    fileStem(node.attrs.iconSrc),
    fileStem(node.attrs.src),
    classToken(node.attrs.class),
    node.id,
  ]
  for (const candidate of candidates) {
    const stem = kebab(candidate)
    if (stem) return stem
  }
  return `${kebab(node.role) || 'element'}-${index}`
}

/**
 * File names for one batch of stems: the first keeps the stem, the next ones
 * take `-2`, `-3`, … in document order.
 *
 * A stem is not unique: `elementStem` keeps ONE class token, so five `pw-card`
 * children all ask for `pw-card`, and the last writer would silently erase the
 * other four. The suffix is the fix the batch can make on its own — renaming
 * the *element* is the author's job (a dot-token query pins one of them).
 */
export function uniqueNames(stems: string[]): string[] {
  const used = new Set<string>()
  return stems.map((stem) => {
    let candidate = stem
    let n = 2
    while (used.has(candidate)) candidate = `${stem}-${n++}`
    used.add(candidate)
    return candidate
  })
}

/**
 * Every descendant of `id`, at any depth, in document order. The bridge
 * captures in DOM order, so an ancestor always precedes its children and one
 * forward pass is enough — no recursion, no re-sorting.
 */
export function descendantsOf(nodes: ElementNode[], id: string): ElementNode[] {
  const inside = new Set([id])
  const out: ElementNode[] = []
  for (const node of nodes) {
    if (node.parent !== null && inside.has(node.parent)) {
      inside.add(node.id)
      out.push(node)
    }
  }
  return out
}

/* ------------------------------------------------------------------ input */

export type ElementExportInput = {
  /** screen id (registry id, e.g. `seasonal-sale`) */
  screen: string
  /** the element's box in device points (1 CSS px === 1 pt), origin = device top-left */
  box: Box
  /** bridge node id from the live capture (`e12`); preferred over the box when it matches */
  elementId?: string
  /** ancestor boxes, root-first, for `ancestorLevels` */
  ancestors?: Box[]
  device?: string // device id, default 'reference'
  theme?: 'light' | 'dark' // default 'light'
  padPt?: number // default 24
  padPct?: number | null // default null
  ancestorLevels?: number // default 0
  scale?: number // default 2
  /**
   * CSS selectors to hide before the shot (visibility:hidden, so layout is
   * untouched and the measured clip stays valid). For overlays that sit on top
   * of the element being exported — e.g. `['.ob-float']` for a chip that rides
   * the edge of a TV crop. The spec/JSON is measured first, so hiding changes
   * the pixels only; a node the element itself owns is never affected.
   */
  hide?: string[]
}

export type ElementExportResult = {
  png: Buffer
  clip: Clip
  /** the JSON written beside the PNG: Copy-JSON v1 shape + point/box/pngClip/pngWidth/pngHeight */
  payload: Record<string, unknown>
  element: ElementNode | null
  ancestors: ElementNode[]
}

export type ElementSession = {
  /** capture only, nothing written — the panel thumbnail path */
  crop(input: ElementExportInput): Promise<ElementExportResult>
  /** capture + write `<stem>@<scale>x.png` and `<stem>.json` into outDir (default: project/<projectId>/exports) */
  export(
    input: ElementExportInput & { outDir?: string },
  ): Promise<ElementExportResult & { files: { png: string; json: string } }>
  /** one PNG + one JSON per direct child of the element, names from elementStem() */
  exportChildren(
    input: ElementExportInput & { outDir?: string },
  ): Promise<{ files: Array<{ png: string; json: string }>; count: number }>
  close(): Promise<void>
}

/* ------------------------------------------------------------ internals -- */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const SCREENS_DIR = path.join(ROOT, 'src/screens')
const PUBLIC_DIR = path.join(ROOT, 'public')
const STYLESHEETS = ['core.css', 'palettes.css', 'vocab.css', 'icons.css', 'icon-set.css']

const DEFAULT_DEVICE = 'reference'
const DEFAULT_PAD_PT = 24
const DEFAULT_SCALE = 2
/** screens kept loaded in the warm session (each one is a Chrome tab) */
const MAX_TARGETS = 4

type Theme = 'light' | 'dark'

/**
 * Force one fresh capture. The bridge posts its spec to `window.parent` — here
 * the page IS the top window, so we listen for our own message and then ask
 * for a capture (its load-time post happened before we could listen).
 */
const RECAPTURE = `(async () => new Promise((resolve, reject) => {
  const to = setTimeout(() => reject(new Error('timeout')), 8000);
  const h = (e) => {
    const d = e.data;
    if (d && d.pc === true && d.type === 'spec' && Array.isArray(d.nodes)) {
      clearTimeout(to);
      removeEventListener('message', h);
      resolve({ nodes: d.nodes, device: d.device || null });
    }
  };
  addEventListener('message', h);
  postMessage({ pc: true, type: 'recapture', token: '' }, '*');
}))()`

/** deepest node containing the point; ties break toward the smallest box */
function hitTest(nodes: SpecNode[], x: number, y: number): SpecNode | null {
  let best: SpecNode | null = null
  for (const node of nodes) {
    const b = node.box
    if (x < b.x || x >= b.x + b.w || y < b.y || y >= b.y + b.h) continue
    if (!best || node.depth > best.depth || (node.depth === best.depth && b.w * b.h < best.box.w * best.box.h)) {
      best = node
    }
  }
  return best
}

type Target = { targetId: string; sessionId: string; frameHeight: number; html: string }

type Capture = {
  cdp: Cdp
  target: Target
  screen: ScreenDef
  device: Device
  theme: Theme
  scale: number
  box: Box
  padPt: number
  padPct: number | null
  ancestorLevels: number
  /** selectors whose matches are painted out for the shot (see hideStyle) */
  hide: string[]
  bounds: { width: number; height: number }
  spec: SpecNode[]
  rawById: Map<string, RawNode>
  specById: Map<string, SpecNode>
  candidates: number
  element: SpecNode | null
  ancestors: SpecNode[]
  ancestorBoxes: Box[]
  point: { x: number; y: number }
}

type Rendered = {
  capture: Capture
  clip: Clip
  png: Buffer
  payload: Record<string, unknown>
  element: ElementNode | null
  ancestors: ElementNode[]
  stem: string
}

/**
 * Validate the input against the registry and fill in the defaults. Error
 * strings are load-bearing: `npm run locate` prints them verbatim.
 */
function optionsFor(input: ElementExportInput, registry: Registry) {
  const screen = registry.screens.find((s) => s.id === input.screen)
  if (!screen) throw new Error(`unknown screen "${input.screen}". Try --list`)

  const deviceId = input.device ?? DEFAULT_DEVICE
  if (!isKnownDevice(deviceId)) throw new Error(`unknown device "${deviceId}"`)

  const theme: Theme = input.theme ?? 'light'
  if (theme !== 'light' && theme !== 'dark') throw new Error('unknown theme (want: light | dark)')

  const box = input.box
  for (const key of ['x', 'y', 'w', 'h'] as const) {
    if (!Number.isFinite(box[key])) throw new Error(`box.${key} must be a finite number`)
  }

  return {
    screen,
    device: getDevice(deviceId),
    theme,
    box,
    scale: Number.isFinite(input.scale) && (input.scale ?? 0) > 0 ? (input.scale as number) : DEFAULT_SCALE,
    padPt: Number.isFinite(input.padPt) && (input.padPt ?? -1) >= 0 ? (input.padPt as number) : DEFAULT_PAD_PT,
    padPct: input.padPct === null || input.padPct === undefined ? null : input.padPct,
    ancestorLevels: Math.max(0, Math.trunc(input.ancestorLevels ?? 0)),
    hide: Array.isArray(input.hide) ? input.hide.filter((s): s is string => typeof s === 'string') : [],
  }
}

/**
 * The composed document for one screen/device/theme, rebuilt on every call:
 * the project's files are the input, and a warm session that served the
 * previous revision would make the live thumbnail lie. The reads are a few KB
 * and the capture dominates the cost.
 */
async function composeDocument(
  registry: Registry,
  screen: ScreenDef,
  device: Device,
  theme: Theme,
): Promise<string> {
  const shared = await Promise.all(STYLESHEETS.map((name) => readFile(path.join(SCREENS_DIR, name), 'utf8')))
  const bridgeJs = await readFile(path.join(ROOT, 'src/extractor/bridge.js'), 'utf8')
  const tokens = registry.tokens[screen.projectId] ?? null
  const components: Record<string, string> = {}
  for (const component of registry.components) {
    if (component.project === screen.projectId) components[component.id] = component.html
  }

  // bridge included: we need its real capture, not a clean export document.
  // Its hover overlay stays display:none without input, so the shot is clean.
  return composeScreenDoc({
    html: screen.html,
    device,
    stylesheets: tokens ? [...shared, tokens] : shared,
    bridgeJs,
    lightStatusBar: screen.lightStatusBar,
    theme,
    components,
  })
}

function resolveElement(
  spec: SpecNode[],
  byId: Map<string, SpecNode>,
  input: ElementExportInput,
): SpecNode | null {
  // the panel's selection is authoritative while the capture still has it;
  // a stale id (element gone after an edit) falls through to the box
  if (input.elementId) {
    const named = byId.get(input.elementId)
    if (named) return named
  }
  return hitTest(spec, input.box.x + input.box.w / 2, input.box.y + input.box.h / 2)
}

function ancestorsOf(byId: Map<string, SpecNode>, element: SpecNode | null): SpecNode[] {
  const chain: SpecNode[] = []
  let current = element?.parent ? byId.get(element.parent) : undefined
  while (current) {
    chain.unshift(current)
    current = current.parent ? byId.get(current.parent) : undefined
  }
  return chain
}

function toElementNode(spec: SpecNode, rawById: Map<string, RawNode>): ElementNode {
  const attrs = rawById.get(spec.id)?.attrs
  return {
    id: spec.id,
    tag: spec.tag,
    parent: spec.parent,
    depth: spec.depth,
    role: spec.role,
    label: spec.label,
    box: { x: spec.box.x, y: spec.box.y, w: spec.box.w, h: spec.box.h },
    attrs: {
      src: attrs?.src ?? '',
      alt: attrs?.alt ?? '',
      symbol: attrs?.symbol ?? '',
      asset: attrs?.asset ?? '',
      iconSrc: attrs?.iconSrc ?? '',
      class: attrs?.class ?? '',
    },
  }
}

/**
 * The JSON written beside the PNG: Copy-JSON v1 (`version` / `screen` /
 * `selectedElement`) plus the locate extras. Key order is load-bearing —
 * `npm run locate` output is compared byte for byte.
 */
function payloadFor(args: {
  screen: string
  device: string
  theme: Theme
  point: { x: number; y: number }
  element: SpecNode | null
  ancestors: SpecNode[]
  candidates: number
  png: Buffer
  pngName: string
  clip: Clip
}): Record<string, unknown> {
  return {
    version: 1,
    screen: args.screen,
    device: args.device,
    theme: args.theme,
    point: args.point,
    hit: args.element !== null,
    selectedElement: args.element,
    ancestors: args.ancestors.map((a) => ({ id: a.id, role: a.role, label: a.label, box: a.box })),
    candidates: args.candidates,
    png: args.pngName,
    pngClip: args.clip,
    pngWidth: args.png.readUInt32BE(16),
    pngHeight: args.png.readUInt32BE(20),
  }
}

async function writeHandoff(
  outDir: string,
  stem: string,
  scale: number,
  png: Buffer,
  payload: Record<string, unknown>,
): Promise<{ png: string; json: string }> {
  const pngFile = path.join(outDir, `${stem}@${scale}x.png`)
  const jsonFile = path.join(outDir, `${stem}.json`)
  await writeFile(pngFile, png)
  await writeFile(jsonFile, JSON.stringify({ ...payload, png: path.basename(pngFile) }, null, 2) + '\n')
  return { png: pngFile, json: jsonFile }
}

class Session implements ElementSession {
  private site: Site | null = null
  private browser: Browser | null = null
  /** keyed `screen--device--theme`; `startSite` reads the map per request, so later adds are served */
  private readonly documents = new Map<string, string>()
  private readonly loaded = new Map<string, Target>()
  private closed = false

  private async ensure(): Promise<{ site: Site; browser: Browser }> {
    if (this.closed) throw new Error('element session is closed')
    if (!this.site) this.site = await startSite(this.documents, PUBLIC_DIR)
    if (!this.browser) this.browser = await launch()
    return { site: this.site, browser: this.browser }
  }

  /**
   * One target per screen, re-navigated only when the composed document
   * actually changed: a repeated crop of an untouched screen must not pay a
   * page load, but an edited one must never shoot the previous revision.
   */
  private async ensureTarget(
    cdp: Cdp,
    origin: string,
    key: string,
    html: string,
    device: Device,
  ): Promise<Target> {
    const cached = this.loaded.get(key)
    if (cached && cached.html === html) {
      // re-insert so Map order stays least-recently-used first
      this.loaded.delete(key)
      this.loaded.set(key, cached)
      return cached
    }
    if (cached) {
      this.loaded.delete(key)
      cdp.attach(null)
      await cdp.send('Target.closeTarget', { targetId: cached.targetId }).catch(() => {})
    }

    // browser-level command: never sent on a page session
    cdp.attach(null)
    const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', { url: 'about:blank' })
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
      await cdp.send('Page.navigate', { url: `${origin}/screen/${key}` })
      const frameHeight = await waitForHeight(cdp)
      const target: Target = { targetId, sessionId, frameHeight, html }
      this.loaded.set(key, target)

      // a dev server lives for hours: keep the reuse, but never keep every
      // screen ever cropped open as a Chrome tab
      while (this.loaded.size > MAX_TARGETS) {
        const oldest = this.loaded.keys().next()
        if (oldest.done || oldest.value === key) break
        const evicted = this.loaded.get(oldest.value) as Target
        this.loaded.delete(oldest.value)
        cdp.attach(null)
        await cdp.send('Target.closeTarget', { targetId: evicted.targetId }).catch(() => {})
      }
      cdp.attach(sessionId)
      return target
    } catch (error) {
      cdp.attach(null)
      await cdp.send('Target.closeTarget', { targetId }).catch(() => {})
      throw error
    }
  }

  /** open the screen, capture it and resolve the element — no pixels yet */
  private async open(input: ElementExportInput): Promise<Capture> {
    const { registry, errors } = await scanProjects()
    if (errors.length > 0) {
      throw new Error(`project registry:\n  ${errors.map((e) => `${e.file}: ${e.message}`).join('\n  ')}`)
    }

    const options = optionsFor(input, registry)
    const { site, browser } = await this.ensure()
    const cdp = browser.cdp

    const key = `${options.screen.id}--${options.device.id}--${options.theme}`
    const html = await composeDocument(registry, options.screen, options.device, options.theme)
    // the site reads this map per request, so the fresh document must land here
    // before the navigation that asks for it
    this.documents.set(key, html)
    const target = await this.ensureTarget(cdp, site.origin, key, html, options.device)
    cdp.attach(target.sessionId)

    const payload = await evaluate(cdp, RECAPTURE)
    const nodes = (payload as { nodes?: RawNode[] } | undefined)?.nodes ?? []
    if (nodes.length === 0) throw new Error('bridge captured nothing — the screen produced no layout')

    const spec = buildSpec(nodes)
    const specById = new Map(spec.map((node) => [node.id, node]))
    const element = resolveElement(spec, specById, input)
    const ancestors = ancestorsOf(specById, element)

    return {
      cdp,
      target,
      screen: options.screen,
      device: options.device,
      theme: options.theme,
      scale: options.scale,
      box: options.box,
      padPt: options.padPt,
      padPct: options.padPct,
      ancestorLevels: options.ancestorLevels,
      hide: options.hide,
      bounds: { width: options.device.width, height: target.frameHeight },
      spec,
      rawById: new Map(nodes.map((node) => [node.id, node])),
      specById,
      candidates: nodes.length,
      element,
      ancestors,
      // the panel's boxes are root-first too, and win: the board knows the
      // live selection even when the capture's parent chain differs
      ancestorBoxes: input.ancestors?.length ? input.ancestors : ancestors.map((a) => a.box),
      point: { x: options.box.x + options.box.w / 2, y: options.box.y + options.box.h / 2 },
    }
  }

  /** device scale + frame height, then settle before the shot */
  private async applyScale(capture: Capture): Promise<void> {
    capture.cdp.attach(capture.target.sessionId)
    await capture.cdp.send('Emulation.setDeviceMetricsOverride', {
      width: capture.device.width,
      height: capture.target.frameHeight,
      deviceScaleFactor: capture.scale,
      mobile: false,
    })
    await sleep(80)
  }

  private async shoot(capture: Capture, clip: Clip): Promise<Buffer> {
    capture.cdp.attach(capture.target.sessionId)
    const shot = await capture.cdp.send<{ data: string }>('Page.captureScreenshot', {
      format: 'png',
      clip: { ...clip, scale: 1 },
    })
    return Buffer.from(shot.data, 'base64')
  }

  /**
   * Shoot with the `hide` rules applied, then always clear them. The clear runs
   * in `finally` because the session is warm and shared: a leaked rule would
   * silently change every crop that follows.
   */
  private async shootHidden(capture: Capture, clip: Clip): Promise<Buffer> {
    const css = hideStyle(capture.hide)
    if (!css) return this.shoot(capture, clip)
    capture.cdp.attach(capture.target.sessionId)
    await evaluate(capture.cdp, hideExpr(css))
    try {
      return await this.shoot(capture, clip)
    } finally {
      await evaluate(capture.cdp, hideExpr(''))
    }
  }

  private async render(input: ElementExportInput): Promise<Rendered> {
    const capture = await this.open(input)
    const clip = cropFor(
      capture.element ? capture.element.box : capture.box,
      capture.ancestorBoxes,
      { padPt: capture.padPt, padPct: capture.padPct, ancestorLevels: capture.ancestorLevels },
      capture.bounds,
    )
    await this.applyScale(capture)
    const png = await this.shootHidden(capture, clip)

    const element = capture.element ? toElementNode(capture.element, capture.rawById) : null
    // a crop that hit nothing still needs a name: screen + the box it shot
    const stem = element
      ? elementStem(element)
      : kebab(`${capture.screen.id}-${Math.round(capture.box.x)}x${Math.round(capture.box.y)}`) || 'element'
    const payload = payloadFor({
      screen: capture.screen.id,
      device: capture.device.id,
      theme: capture.theme,
      point: capture.point,
      element: capture.element,
      ancestors: capture.ancestors,
      candidates: capture.candidates,
      png,
      // crop() writes nothing: `png` names the file export() would write
      pngName: `${stem}@${capture.scale}x.png`,
      clip,
    })

    return {
      capture,
      clip,
      png,
      payload,
      element,
      ancestors: capture.ancestors.map((a) => toElementNode(a, capture.rawById)),
      stem,
    }
  }

  async crop(input: ElementExportInput): Promise<ElementExportResult> {
    const rendered = await this.render(input)
    return {
      png: rendered.png,
      clip: rendered.clip,
      payload: rendered.payload,
      element: rendered.element,
      ancestors: rendered.ancestors,
    }
  }

  async export(
    input: ElementExportInput & { outDir?: string },
  ): Promise<ElementExportResult & { files: { png: string; json: string } }> {
    const rendered = await this.render(input)
    const outDir = path.resolve(
      ROOT,
      input.outDir ?? path.join('project', rendered.capture.screen.projectId, 'exports'),
    )
    await mkdir(outDir, { recursive: true })
    const files = await writeHandoff(outDir, rendered.stem, rendered.capture.scale, rendered.png, rendered.payload)
    return {
      png: rendered.png,
      clip: rendered.clip,
      payload: { ...rendered.payload, png: path.basename(files.png) },
      element: rendered.element,
      ancestors: rendered.ancestors,
      files,
    }
  }

  async exportChildren(
    input: ElementExportInput & { outDir?: string },
  ): Promise<{ files: Array<{ png: string; json: string }>; count: number }> {
    const capture = await this.open(input)
    const parent = capture.element
    if (!parent) throw new Error('no element to export children of — nothing matched the box')

    const children = capture.spec.filter((node) => node.parent === parent.id)
    const outDir = path.resolve(ROOT, input.outDir ?? path.join('project', capture.screen.projectId, 'exports'))
    await mkdir(outDir, { recursive: true })
    await this.applyScale(capture)

    // names decided for the whole batch up front: a class-based stem is shared
    // by siblings, and two children writing one file would lose one of them
    const stems = children.map((child, index) => elementStem(toElementNode(child, capture.rawById), index + 1))
    const names = uniqueNames(stems)
    const collisions = stems.filter((stem, index) => names[index] !== stem)
    if (collisions.length > 0) {
      console.log(
        `element: ${collisions.length} of ${children.length} children share the name "${[...new Set(collisions)].join('", "')}"` +
          ` — wrote ${names.join(', ')}`,
      )
    }

    const files: Array<{ png: string; json: string }> = []
    for (const [index, child] of children.entries()) {
      // the child IS the region: an ancestor level here would pull the parent back in
      const clip = cropFor(
        child.box,
        [],
        { padPt: capture.padPt, padPct: capture.padPct, ancestorLevels: 0 },
        capture.bounds,
      )
      const png = await this.shootHidden(capture, clip)
      const stem = names[index]
      const payload = payloadFor({
        screen: capture.screen.id,
        device: capture.device.id,
        theme: capture.theme,
        point: { x: child.box.x + child.box.w / 2, y: child.box.y + child.box.h / 2 },
        element: child,
        ancestors: ancestorsOf(capture.specById, child),
        candidates: capture.candidates,
        png,
        pngName: `${stem}@${capture.scale}x.png`,
        clip,
      })
      files.push(await writeHandoff(outDir, stem, capture.scale, png, payload))
    }
    return { files, count: files.length }
  }

  async close(): Promise<void> {
    if (this.closed) return
    this.closed = true
    const browser = this.browser
    this.browser = null
    const targets = [...this.loaded.values()]
    this.loaded.clear()
    if (browser) {
      browser.cdp.attach(null)
      for (const target of targets) {
        await browser.cdp.send('Target.closeTarget', { targetId: target.targetId }).catch(() => {})
      }
      await shutdown(browser)
    }
    const site = this.site
    this.site = null
    await site?.close()
  }
}

/**
 * Warm session: one site + one Chrome, reused across calls (the dev endpoint
 * keeps it alive for the life of the server). Nothing is spawned until the
 * first call — a bad screen id must not leave a stray Chrome behind.
 */
export async function openElementSession(): Promise<ElementSession> {
  return new Session()
}

/** one-shot: opens, uses, closes — what the CLI calls */
export async function exportElement(
  input: ElementExportInput & { outDir?: string },
): Promise<ElementExportResult & { files: { png: string; json: string } }> {
  const session = await openElementSession()
  try {
    return await session.export(input)
  } finally {
    await session.close()
  }
}
