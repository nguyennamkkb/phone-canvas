#!/usr/bin/env node
/**
 * Generate `src/screens/icon-set.css` from `public/icons/*.svg`.
 *
 * Why this exists
 * ---------------
 * Icons are CSS masks, and a mask image is fetched in **CORS mode** — unlike an
 * `<img>`, which is a no-cors fetch. A screen renders inside a sandboxed iframe
 * with an opaque origin, so `url('/icons/x.svg')` is a cross-origin request that
 * Chrome refuses. And a mask that fails to load is treated as *transparent
 * black*, so the element does not fall back to a visible square — it vanishes.
 *
 * Inlining the artwork as a data URI removes the fetch entirely. A glyph then
 * renders identically on the board, in an export, and on a static host with no
 * headers to configure. `--icon-src` keeps the original file name reportable in
 * the spec panel.
 *
 * `public/icons/` stays the source of truth: drop an SVG in, add one line to
 * SYMBOLS, and this regenerates. It runs automatically from vite.config.ts.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ICON_DIR = path.join(ROOT, 'public/icons')
const OUT_FILE = path.join(ROOT, 'src/screens/icon-set.css')

/**
 * SF Symbol name → file in `public/icons/`.
 *
 * The symbol is what the design says and what SwiftUI needs; the file is an
 * implementation detail of the web preview. Keep this the single mapping.
 */
const SYMBOLS: Record<string, string> = {
  magnifyingglass: 'search.svg',
  book: 'book.svg',
  'chart.bar': 'chart-bar.svg',
  'slider.horizontal.3': 'slider.svg',
  'chevron.left': 'chevron-left.svg',
  'chevron.down': 'chevron-down.svg',
  ellipsis: 'ellipsis.svg',
  'arrow.left': 'arrow-left.svg',
  'arrow.right': 'arrow-right.svg',
  'arrow.up.right': 'arrow-up-right.svg',
  plane: 'plane.svg',
  'chevron.right': 'chevron-right.svg',
  house: 'house.svg',
  clock: 'clock.svg',
  checkmark: 'checkmark.svg',
  bookmark: 'bookmark.svg',
  'bolt.fill': 'bolt.svg',
  'square.and.arrow.up': 'share.svg',
  'book.fill': 'book.svg',
  xmark: 'xmark.svg',
  pencil: 'pencil.svg',
  feather: 'feather.svg',
  folder: 'folder.svg',
  trash: 'trash.svg',
  'square.on.square': 'duplicate.svg',
  bell: 'bell.svg',
  sparkles: 'sparkles.svg',
  'face.smiling': 'face-smiling.svg',
  flame: 'flame.svg',
  trend: 'trend.svg',
  tag: 'tag.svg',
  moon: 'moon.svg',
  download: 'download.svg',
  star: 'star.svg',
  'shield.fill': 'shield.svg',
  'leaf.fill': 'leaf.svg',
  'heart.fill': 'heart.svg',
  heart: 'heart-outline.svg',
  'staroflife.fill': 'life.svg',
  'pills.fill': 'pills.svg',
  'figure.walk': 'walk.svg',
  'dumbbell.fill': 'dumbbell.svg',
  'drop.fill': 'drop.svg',
  'info.circle': 'info.svg',
  stethoscope: 'stethoscope.svg',
  'doc.text': 'report.svg',
  'paperplane.fill': 'send.svg',
  calendar: 'calendar.svg',
  'bubble.left': 'bubble.svg',
  person: 'person.svg',
  plus: 'plus.svg',
  gear: 'gear.svg',
  car: 'car.svg',
  location: 'location.svg',
  photo: 'photo.svg',
  'cloud.sun': 'cloud-sun.svg',
  sun: 'sun.svg',
  cloud: 'cloud.svg',
  'text.quote': 'quote.svg',
  hourglass: 'hourglass.svg',
  timer: 'timer.svg',
  ruler: 'ruler.svg',
  eye: 'eye.svg',
  'list.bullet': 'list.svg',
  textformat: 'textformat.svg',
  paintbrush: 'paintbrush.svg',
  'square.grid.2x2': 'grid.svg',
  'circle.lefthalf.filled': 'contrast.svg',
  crop: 'crop.svg',
  'text.alignleft': 'align-left.svg',
  'text.aligncenter': 'align-center.svg',
  'text.alignright': 'align-right.svg',
  'hand.raised': 'hand.svg',
  'speaker.wave.2': 'speaker.svg',
  'arrow.triangle.2.circlepath': 'sync.svg',
  'questionmark.circle': 'help.svg',
  lock: 'lock.svg',
  'lock.fill': 'lock-fill.svg',
  'checkmark.fill': 'checkmark-fill.svg',
  'bell.fill': 'bell-fill.svg',
  'person.fill': 'person-fill.svg',
  barcode: 'barcode.svg',
  microphone: 'microphone.svg',
  camera: 'camera.svg',
  wifi: 'wifi.svg',
  scale: 'scale.svg',
  minus: 'minus.svg',
  'play.fill': 'play.svg',
  'pause.fill': 'pause-fill.svg',
  'backward.fill': 'backward-fill.svg',
  'forward.fill': 'forward-fill.svg',
  expand: 'expand.svg',
  crown: 'crown.svg',
  robot: 'robot.svg',
  compass: 'compass.svg',
  flag: 'flag.svg',
  shuffle: 'shuffle.svg',
  repeat: 'repeat.svg',
  disc: 'disc.svg',
  'phone.fill': 'phone-fill.svg',
  'phone.down': 'phone-down.svg',
  'mic.off': 'mic-off.svg',
  keypad: 'keypad.svg',
  'envelope.fill': 'envelope-fill.svg',
  'wallet.fill': 'wallet-fill.svg',
  'dollarsign.circle': 'currency-dollar.svg',
  tv: 'tv.svg',
  laptopcomputer: 'laptop.svg',
  qrcode: 'qrcode.svg',
  globe: 'globe.svg',
  gift: 'gift.svg',
  video: 'video.svg',
  'star.fill': 'star.svg',
  // SmartCast — bộ icon riêng (project smartscreen*), cùng quy cách: khung 24,
  // nét 1.8, đầu/góc bo tròn, hình lớn bo 3. SwiftUI: custom symbol trong
  // Assets.xcassets, Image("sc.photo") — không phải Image(systemName:).
  'sc.arrow.right': 'sc-arrow-right.svg',
  'sc.checkmark': 'sc-checkmark.svg',
  'sc.xmark': 'sc-xmark.svg',
  'sc.chevron.left': 'sc-chevron-left.svg',
  'sc.chevron.right': 'sc-chevron-right.svg',
  'sc.chevron.down': 'sc-chevron-down.svg',
  'sc.photo': 'sc-photo.svg',
  'sc.web.image': 'sc-web-image.svg',
  'sc.tv': 'sc-tv.svg',
  'sc.cast': 'sc-cast.svg',
  'sc.laptop': 'sc-laptop.svg',
  'sc.whiteboard': 'sc-whiteboard.svg',
  'sc.camera': 'sc-camera.svg',
  'sc.video': 'sc-video.svg',
  'sc.globe': 'sc-globe.svg',
  'sc.wifi': 'sc-wifi.svg',
  'sc.qrcode': 'sc-qrcode.svg',
  'sc.gear': 'sc-gear.svg',
  'sc.crown': 'sc-crown.svg',
  'sc.sparkles': 'sc-sparkles.svg',
  'sc.magnifyingglass': 'sc-magnifyingglass.svg',
  'sc.info.circle': 'sc-info-circle.svg',
  'sc.arrow.circlepath': 'sc-arrow-circlepath.svg',
  'sc.star.fill': 'sc-star-fill.svg',
  'sc.shield.fill': 'sc-shield-fill.svg',
  'sc.play.fill': 'sc-play-fill.svg',
  'sc.lock.fill': 'sc-lock-fill.svg',
  'sc.text.quote': 'sc-text-quote.svg',
  'sc.backward.fill': 'sc-backward-fill.svg',
  'sc.forward.fill': 'sc-forward-fill.svg',
  'sc.gobackward.15': 'sc-gobackward-15.svg',
  'sc.goforward.15': 'sc-goforward-15.svg',
  'sc.speaker': 'sc-speaker.svg',
  'sc.speaker.slash': 'sc-speaker-slash.svg',
  'sc.minus': 'sc-minus.svg',
  'sc.plus': 'sc-plus.svg',
  'sc.pause.fill': 'sc-pause-fill.svg',
}

/** Tighten the markup, then percent-encode it so it is safe inside url("…") */
function toDataUri(svg: string): string {
  const compact = svg
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(compact)}`
}

const HEADER = `/* ============================================================================
 * GENERATED by scripts/icons.ts — DO NOT EDIT.
 *
 * Each glyph is inlined as a data URI rather than referenced by URL. A mask
 * image is fetched in CORS mode, and a screen renders in a sandboxed iframe
 * with an opaque origin — a plain url('/icons/x.svg') is refused there, and a
 * mask that fails to load makes the element disappear instead of degrading.
 * Inlining removes the fetch, so glyphs render on the board, in an export, and
 * on any static host with nothing to configure.
 *
 * To change the set: edit public/icons/, update SYMBOLS in scripts/icons.ts,
 * and run \`npm run icons\`.
 * ========================================================================== */
`

export async function generateIconSet(): Promise<number> {
  const present = new Set(await readdir(ICON_DIR))
  const missing: string[] = []
  const rules: string[] = [HEADER]

  for (const [symbol, file] of Object.entries(SYMBOLS)) {
    if (!present.has(file)) {
      missing.push(`  ${symbol}  ->  public/icons/${file}`)
      continue
    }
    const svg = await readFile(path.join(ICON_DIR, file), 'utf8')
    rules.push(
      `.icon[data-symbol='${symbol}'] {\n` +
        `  --icon: url('${toDataUri(svg)}');\n` +
        `  --icon-src: '/icons/${file}';\n` +
        `}\n`,
    )
  }

  if (missing.length) {
    throw new Error(`scripts/icons: missing files for these symbols:\n${missing.join('\n')}`)
  }

  await writeFile(OUT_FILE, rules.join('\n'))
  return Object.keys(SYMBOLS).length
}

const invokedDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  generateIconSet()
    .then((count) => {
      console.log(`icons: wrote ${count} glyphs -> src/screens/icon-set.css`)
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    })
}
