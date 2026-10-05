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

export type GoldenManifest = {
  version: 1
  updatedAt: string
  records: Record<string, GoldenRecord>
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
    return { version: 1, updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '', records: parsed.records }
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
