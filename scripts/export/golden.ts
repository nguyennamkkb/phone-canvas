/**
 * Golden store for `npm run export -- --golden`.
 *
 * Layout: `<goldenDir>/goldens.json` (manifest) + one versioned PNG per
 * record (`<screen>[-<device>][-full][-dark]@<scale>x.png`, same naming as the
 * export output). Only written when `--golden` is passed; default exports
 * never touch it.
 *
 * A re-run over unchanged input produces an identical sha256 — the hash is
 * over the PNG bytes only, never over the timestamp.
 *
 * Two comparisons live side by side: `sha256` byte-exact for the local
 * machine, and `phash` (dHash) perceptual for cross-OS runs where font/AA
 * rendering shifts a few pixels. `compareGolden` tries sha256 first, then
 * falls back to the Hamming distance against GOLDEN_PHASH_THRESHOLD.
 * OS-specific stores live one level down (`goldens/<os>/`); reads merge
 * over the shared base (read-old), writes go to the OS dir (write-new).
 *
 * The same manifest also holds element goldens (`elements`, one record per
 * cropped element: `<goldenDir>/<elementKey>.png` + `cropHash`/`specHash`).
 * One store, two granularities: a CSS edit inside one component turns the
 * element record into a `lệch` that names the component, instead of turning
 * every screen that uses it into an anonymous `lệch`.
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { inflateSync } from 'node:zlib'

export type GoldenRecord = {
  /** screen/device/theme/scale/full identity this hash belongs to */
  screen: string
  device: string
  theme: string
  scale: number
  full: boolean
  /** PNG filename inside the golden dir */
  file: string
  /** sha256 hex of the PNG bytes */
  sha256: string
  /** dHash hex (16 chars) of the PNG; '' when recorded before phash existed */
  phash: string
  bytes: number
  width: number
  height: number
  /** fresh UTC at write time; excluded from the hash */
  timestamp: string
}

/**
 * One element-level golden: the crop of a single element, hashed twice.
 *
 * `cropHash` (sha256 of the PNG bytes) is the exact-render verdict, `phash` is
 * the same dHash comparison the screen record uses (fonts/AA across OS shift a
 * few pixels without changing the element). `specHash` covers the spec JSON
 * that goes with the crop, so a spec change with identical pixels still lands
 * in the report instead of hiding behind a matching crop.
 */
export type ElementGoldenRecord = {
  /** `<screen>--<device>--<theme>--<stem>` identity inside the store */
  elementKey: string
  screen: string
  device: string
  theme: string
  scale: number
  /** sha256 hex of the crop PNG bytes */
  cropHash: string
  /** dHash hex (16 chars) of the crop PNG, same shape as the screen record */
  phash: string
  /** sha256 hex of the element's spec JSON payload; '' when recorded without one */
  specHash: string
  /** file name of the stored crop inside the golden dir */
  png: string
  /** epoch ms at write time; excluded from both hashes */
  updatedAt: number
}

export type GoldenManifest = {
  version: 1
  updatedAt: string
  records: Record<string, GoldenRecord>
  /**
   * Element goldens, keyed by `elementGoldenKey`. Optional on purpose: a
   * manifest written before element goldens existed has no such key, and a
   * screen-only re-run must not add an empty one to it — readers use
   * `elements?.[key]` / `?? {}`, so "no key" already reads as "no elements".
   */
  elements?: Record<string, ElementGoldenRecord>
}

export function hashBuffer(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

export function goldenKey(identity: Pick<GoldenRecord, 'screen' | 'device' | 'theme' | 'scale' | 'full'>): string {
  return `${identity.screen}--${identity.device}--${identity.theme}@${identity.scale}x${identity.full ? '-full' : ''}`
}

export function buildGoldenRecord(input: {
  screen: string
  device: string
  theme: string
  scale: number
  full: boolean
  file: string
  png: Buffer
  width: number
  height: number
  timestamp: string
}): GoldenRecord {
  return {
    screen: input.screen,
    device: input.device,
    theme: input.theme,
    scale: input.scale,
    full: input.full,
    file: input.file,
    sha256: hashBuffer(input.png),
    phash: phashPng(input.png),
    bytes: input.png.length,
    width: input.width,
    height: input.height,
    timestamp: input.timestamp,
  }
}

/**
 * Single `--project` → `project/<id>/goldens/` (next to its exports folder);
 * zero or many projects → root `goldens/`.
 */
export function resolveGoldenDir(options: { projects: string[] }): string {
  return options.projects.length === 1 ? `project/${options.projects[0]}/goldens` : 'goldens'
}

/** OS token for the perceptual store variant (`darwin` / `linux` / `win32`). */
export function goldenOs(os = process.platform): string {
  return os
}

/**
 * OS-aware variant of `resolveGoldenDir`: `<base>/<os>/` alongside the
 * shared store. The shared layout keeps working untouched — writes go to
 * the OS dir, reads cascade over both (see `loadManifestCascade`).
 */
export function resolveGoldenOsDir(options: { projects: string[] }, os = goldenOs()): string {
  return join(resolveGoldenDir(options), os)
}

export function manifestPath(goldenDir: string): string {
  return join(goldenDir, 'goldens.json')
}

export function loadManifest(goldenDir: string): GoldenManifest {
  const empty: GoldenManifest = { version: 1, updatedAt: '', records: {} }
  const file = manifestPath(goldenDir)
  if (!existsSync(file)) return empty
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<GoldenManifest>
    if (!parsed || typeof parsed.records !== 'object' || parsed.records === null) return empty
    for (const record of Object.values(parsed.records)) {
      // Records written before phash existed carry no hash — backfill so
      // every record has the same shape; compareGolden treats '' as
      // sha256-only (the old behavior).
      if (record && typeof record.sha256 === 'string' && typeof record.phash !== 'string') record.phash = ''
    }
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      records: parsed.records,
      // present only when something actually wrote an element golden: an old
      // manifest has no key and must stay that way on re-save
      ...(parsed.elements && typeof parsed.elements === 'object' ? { elements: parsed.elements } : {}),
    }
  } catch {
    return empty
  }
}

/**
 * Read-old merge: most-specific dir first (`[osDir, baseDir]`), the first
 * dir holding a key wins it, so a CI machine without OS goldens still
 * compares against the committed base.
 */
export function loadManifestCascade(dirs: string[]): GoldenManifest {
  const merged: GoldenManifest = { version: 1, updatedAt: '', records: {} }
  for (const dir of [...dirs].reverse()) {
    const manifest = loadManifest(dir)
    Object.assign(merged.records, manifest.records)
    // same read-old merge for the element half: later (more specific) dirs win
    if (manifest.elements) merged.elements = { ...merged.elements, ...manifest.elements }
    if (manifest.updatedAt > merged.updatedAt) merged.updatedAt = manifest.updatedAt
  }
  return merged
}

export function upsertRecord(manifest: GoldenManifest, record: GoldenRecord): GoldenManifest {
  return {
    ...manifest,
    updatedAt: record.timestamp,
    records: { ...manifest.records, [goldenKey(record)]: record },
  }
}

/** Element twin of `upsertRecord`: a screen upsert never drops element records and vice versa. */
export function upsertElementRecord(manifest: GoldenManifest, record: ElementGoldenRecord): GoldenManifest {
  return {
    ...manifest,
    updatedAt: new Date(record.updatedAt).toISOString(),
    elements: { ...(manifest.elements ?? {}), [record.elementKey]: record },
  }
}

export function saveManifest(goldenDir: string, manifest: GoldenManifest): void {
  mkdirSync(goldenDir, { recursive: true })
  writeFileSync(manifestPath(goldenDir), `${JSON.stringify(manifest, null, 2)}\n`)
}

/** Max Hamming distance between two dHashes that still counts as the same render. */
export const GOLDEN_PHASH_THRESHOLD = 4

/** Hamming distance between two dHash hex strings. */
export function phashDistance(a: string, b: string): number {
  let xor = BigInt(`0x${a}`) ^ BigInt(`0x${b}`)
  let distance = 0
  while (xor) {
    distance += Number(xor & 1n)
    xor >>= 1n
  }
  return distance
}

export type GoldenCompareState = 'match' | 'mismatch' | 'missing'

export type GoldenCompare = { state: GoldenCompareState; distance: number | null }

type ComparableRecord = Pick<GoldenRecord, 'sha256'> & { phash?: string }

/**
 * sha256 byte-exact first (distance 0), then perceptual: Hamming distance of
 * the dHashes against GOLDEN_PHASH_THRESHOLD. Missing/corrupt records are
 * `missing`, never an error; undecodable PNGs and sha256-only records fall
 * back to the byte-exact verdict.
 */
export function compareGolden(
  record: ComparableRecord | null | undefined,
  pngBytes: Buffer,
): GoldenCompare {
  if (!record || typeof record.sha256 !== 'string') return { state: 'missing', distance: null }
  if (hashBuffer(pngBytes) === record.sha256) return { state: 'match', distance: 0 }
  if (typeof record.phash !== 'string' || record.phash.length === 0) return { state: 'mismatch', distance: null }
  let distance: number
  try {
    distance = phashDistance(record.phash, phashPng(pngBytes))
  } catch {
    return { state: 'mismatch', distance: null }
  }
  return { state: distance <= GOLDEN_PHASH_THRESHOLD ? 'match' : 'mismatch', distance }
}

/* ------------------------------------------------------- element records */

/**
 * Payload keys that describe the RENDER, not the element: the measured region
 * and the capture plumbing. They all move when the machine changes — a
 * different OS font renders the same stylesheet at slightly different boxes —
 * while the element's style does not.
 */
const SPEC_PAYLOAD_PLUMBING: Record<string, true> = {
  point: true,
  hit: true,
  candidates: true,
  png: true,
  pngClip: true,
  pngWidth: true,
  pngHeight: true,
  screen: true,
  device: true,
  theme: true,
  scale: true,
}

/**
 * Element-node keys kept out of the digest: capture plumbing (`id` is a
 * bridge capture position, `parent`/`depth` its shape) and the measured `box`.
 */
const SPEC_NODE_PLUMBING: Record<string, true> = { id: true, parent: true, depth: true, box: true }

/** Measured size inside `size`: keeps `grow`/`fill*` (authored css), drops `w`/`h`. */
const SPEC_SIZE_MEASURED: Record<string, true> = { w: true, h: true }

/**
 * One element node, minus its plumbing and its measured geometry. Everything
 * else stays — `role`, `tag`, `label`, `swiftUiShape`, `text`, `layout`,
 * `padding`, `typography`, `image`, `surface` (radius, borders, colors,
 * shadows) are authored or style-derived, so a style edit must move them.
 */
function specNodeOf(node: unknown): unknown {
  if (!node || typeof node !== 'object') return null
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (SPEC_NODE_PLUMBING[key]) continue
    if (key === 'size' && value && typeof value === 'object') {
      const size: Record<string, unknown> = {}
      for (const [sizeKey, sizeValue] of Object.entries(value as Record<string, unknown>)) {
        if (!SPEC_SIZE_MEASURED[sizeKey]) size[sizeKey] = sizeValue
      }
      out[key] = size
      continue
    }
    out[key] = value
  }
  return out
}

/** key order is not information: sort it, so two equal payloads always hash alike */
function canonicalKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalKeys)
  if (!value || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    out[key] = canonicalKeys((value as Record<string, unknown>)[key])
  }
  return out
}

/**
 * sha256 of a canonical, geometry-free projection of an element payload.
 *
 * Why a projection and not the payload as written: the payload carries the
 * measured `box`/`point`/`pngClip`/`png*` and the bridge's capture plumbing
 * (`id`, `parent`, `depth`), all of which shift with OS font metrics and AA
 * rendering — hashing them would make one commit read as a spec change on a
 * different machine. Style is what the digest is for: a `border-radius` tweak
 * that the coarse dHash cannot see still has to move it.
 *
 * Kept: `version`, `role`, `tag`, `label`, `swiftUiShape`, `text`, `layout`,
 * `padding`, `size` (its authored `grow`/`fill*` only), `typography`, `image`,
 * `surface`, `scrollable`, and each ancestor's same projection.
 * Dropped: the measured geometry (`point`, `pngClip`, `png*`, `box`,
 * `size.w`/`size.h`) and the capture plumbing (`screen`, `device`, `theme`,
 * `scale`, `hit`, `candidates`, `png`, `id`, `parent`, `depth`).
 */
export function specDigest(payload: Record<string, unknown>): string {
  const spec: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(payload)) {
    if (SPEC_PAYLOAD_PLUMBING[key]) continue
    if (key === 'selectedElement') {
      spec[key] = specNodeOf(value)
      continue
    }
    if (key === 'ancestors') {
      spec[key] = Array.isArray(value) ? value.map(specNodeOf) : []
      continue
    }
    spec[key] = value
  }
  return hashBuffer(Buffer.from(JSON.stringify(canonicalKeys(spec)), 'utf8'))
}

/**
 * Identity of one element golden: screen, device and theme name the render it
 * was shot in, `stem` names the element inside that render (`elementStem` from
 * the element pipeline). Same shape as `goldenKey`, one `-` more, so a screen
 * key can never collide with an element key.
 *
 * Known limitation: `elementStem` keeps ONE class token, so two elements of
 * one family on one screen share a stem — and therefore share a key. On
 * seasonal-sale the first `pw-card.ss-cell` and the `pw-card.ss-plan.is-best`
 * button both key as `seasonal-sale--reference--light--pw-card`, so only one
 * of the two can be stored; the second write replaces the first. Pin elements
 * with the dot-token query (`pw-card.ss-plan.is-best`) and keep one golden per
 * family per screen, or the store silently keeps the last one written.
 */
export function elementGoldenKey(identity: { screen: string; device: string; theme: string; stem: string }): string {
  return `${identity.screen}--${identity.device}--${identity.theme}--${identity.stem}`
}

export function buildElementGoldenRecord(input: {
  identity: { screen: string; device: string; theme: string; stem: string; scale: number }
  png: Buffer
  payload: Record<string, unknown>
  pngFile: string
}): ElementGoldenRecord {
  return {
    elementKey: elementGoldenKey(input.identity),
    screen: input.identity.screen,
    device: input.identity.device,
    theme: input.identity.theme,
    scale: input.identity.scale,
    cropHash: hashBuffer(input.png),
    phash: phashPng(input.png),
    specHash: specDigest(input.payload),
    png: input.pngFile,
    updatedAt: Date.now(),
  }
}

export type ElementGoldenCompare = {
  state: GoldenCompareState
  distance: number | null
  cropMatch: boolean
  /** null when the record carries no spec hash — nothing to compare */
  specMatch: boolean | null
}

/**
 * Crop verdict for one element: the screen rule (sha256, then Hamming ≤
 * GOLDEN_PHASH_THRESHOLD) over the crop PNG, plus the spec digest comparison
 * reported beside it. A spec change with identical pixels is a falsy
 * `specMatch`, never a change of `state`: the two answer different questions
 * ("did the crop move?" vs "did the declared style change?"), and a caller
 * that has to fail on both — the CI check — reads both.
 */
export function compareElementGolden(
  record: ElementGoldenRecord | null | undefined,
  png: Buffer,
  payload: Record<string, unknown>,
): ElementGoldenCompare {
  const crop = compareGolden(record ? { sha256: record.cropHash, phash: record.phash } : null, png)
  const specMatch =
    record && typeof record.specHash === 'string' && record.specHash.length > 0
      ? specDigest(payload) === record.specHash
      : null
  return { state: crop.state, distance: crop.distance, cropMatch: crop.state === 'match', specMatch }
}

/**
 * The stored crop of one element, or null: no record, or a record whose PNG is
 * gone (a record without its crop cannot be compared or shown as "before").
 */
export function loadElementGolden(goldenDir: string, key: string): { record: ElementGoldenRecord; png: Buffer } | null {
  const record = loadManifest(goldenDir).elements?.[key]
  if (!record || typeof record.png !== 'string' || !record.png) return null
  const file = join(goldenDir, record.png)
  if (!existsSync(file)) return null
  return { record, png: readFileSync(file) }
}

/** Write the crop of one element golden into the golden dir (manifest is the caller's). */
export function saveElementGolden(goldenDir: string, record: ElementGoldenRecord, png: Buffer): void {
  mkdirSync(goldenDir, { recursive: true })
  writeFileSync(join(goldenDir, record.png), png)
}

/**
 * dHash hex (16 chars) of a PNG: decode → 9×8 grayscale → 64 adjacent-cell
 * comparisons. Hand-rolled (inflate + unfilter) so the exporter stays
 * dependency-free; CDP screenshots are always 8-bit RGB/RGBA non-interlaced,
 * anything else throws.
 */
export function phashPng(png: Buffer): string {
  const { width, height, gray } = decodePngToGray(png)
  const small = new Uint8Array(9 * 8)
  for (let ty = 0; ty < 8; ty++) {
    const y0 = Math.floor((ty * height) / 8)
    const y1 = Math.max(y0 + 1, Math.floor(((ty + 1) * height) / 8))
    for (let tx = 0; tx < 9; tx++) {
      const x0 = Math.floor((tx * width) / 9)
      const x1 = Math.max(x0 + 1, Math.floor(((tx + 1) * width) / 9))
      let sum = 0
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) sum += gray[y * width + x]
      small[ty * 9 + tx] = Math.round(sum / ((x1 - x0) * (y1 - y0)))
    }
  }
  let hash = 0n
  for (let i = 0; i < 64; i++) {
    const y = Math.floor(i / 8)
    const x = i % 8
    if (small[y * 9 + x] > small[y * 9 + x + 1]) hash |= 1n << BigInt(63 - i)
  }
  return hash.toString(16).padStart(16, '0')
}

function decodePngToGray(png: Buffer): { width: number; height: number; gray: Uint8Array } {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (png.length < 33 || !png.subarray(0, 8).equals(signature)) throw new Error('not a PNG')
  let offset = 8
  let width = 0
  let height = 0
  let bitDepth = 0
  let colorType = 0
  let interlace = 1
  const idat: Buffer[] = []
  while (offset + 8 <= png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    const data = png.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = data.readUInt32BE(0)
      height = data.readUInt32BE(4)
      bitDepth = data[8]
      colorType = data[9]
      interlace = data[12]
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }
    offset += 12 + length
  }
  if (width === 0 || height === 0) throw new Error('PNG has no IHDR')
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported PNG: bitDepth=${bitDepth} colorType=${colorType} (need 8-bit RGB/RGBA)`)
  }
  if (interlace !== 0) throw new Error('unsupported PNG: interlaced')
  const bytesPerPixel = colorType === 2 ? 3 : 4
  const stride = width * bytesPerPixel
  const raw = inflateSync(Buffer.concat(idat.map((chunk) => Buffer.from(chunk))))
  if (raw.length !== height * (stride + 1)) throw new Error('PNG IDAT length mismatch')
  const gray = new Uint8Array(width * height)
  const previous = new Uint8Array(stride)
  const row = new Uint8Array(stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    if (filter > 4) throw new Error(`unsupported PNG filter ${filter}`)
    row.set(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    for (let i = 0; i < stride; i++) {
      const a = i >= bytesPerPixel ? row[i - bytesPerPixel] : 0
      const b = previous[i]
      const c = i >= bytesPerPixel ? previous[i - bytesPerPixel] : 0
      let correction: number
      switch (filter) {
        case 1:
          correction = a
          break
        case 2:
          correction = b
          break
        case 3:
          correction = (a + b) >> 1
          break
        default: {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          correction = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
          break
        }
      }
      row[i] = (row[i] + correction) & 255
    }
    for (let x = 0; x < width; x++) {
      const r = row[x * bytesPerPixel]
      const g = row[x * bytesPerPixel + 1]
      const b = row[x * bytesPerPixel + 2]
      gray[y * width + x] = ((r * 299 + g * 587 + b * 114 + 500) / 1000) | 0
    }
    previous.set(row)
  }
  return { width, height, gray }
}
