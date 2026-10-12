import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { deflateSync } from 'node:zlib'
import { parseArgs } from './cli.ts'
import {
  GOLDEN_PHASH_THRESHOLD,
  buildElementGoldenRecord,
  buildGoldenRecord,
  compareElementGolden,
  compareGolden,
  elementGoldenKey,
  goldenKey,
  goldenOs,
  hashBuffer,
  loadElementGolden,
  loadManifest,
  loadManifestCascade,
  phashDistance,
  phashPng,
  resolveGoldenDir,
  resolveGoldenOsDir,
  saveElementGolden,
  saveManifest,
  specDigest,
  upsertElementRecord,
  upsertRecord,
} from './golden.ts'

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32Bytes(data: Buffer): Buffer {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  const out = Buffer.alloc(4)
  out.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return out
}

function chunk(type: string, data: Buffer): Buffer {
  const header = Buffer.alloc(8)
  header.writeUInt32BE(data.length, 0)
  header.write(type, 4, 'ascii')
  return Buffer.concat([header, data, crc32Bytes(Buffer.concat([Buffer.from(type, 'ascii'), data]))])
}

/**
 * Minimal 8-bit RGB PNG (filter 0, single IDAT) — enough for the golden
 * decoder, which only promises RGB/RGBA non-interlaced.
 */
function encodePng(width: number, height: number, pixel: (x: number, y: number) => [number, number, number]): Buffer {
  const stride = width * 3
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y)
      raw[y * (stride + 1) + 1 + x * 3] = r
      raw[y * (stride + 1) + 1 + x * 3 + 1] = g
      raw[y * (stride + 1) + 1 + x * 3 + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

/** Gradient field so the dHash bits are meaningful (no flat tie regions). */
function gradientPng(width = 72, height = 64): Buffer {
  return encodePng(width, height, (x, y) => [(x * 3 + y) & 0xff, (x + y * 5) & 0xff, (x * 7 + y * 3) & 0xff])
}

type RGB = [number, number, number]

function uiBandsPixel(x: number, y: number): RGB {
  if (y >= 40 && y < 56 && x >= 10 && x < 62) return [30, 30, 32]
  if (x < 18) return [242, 242, 245]
  if (x < 36) {
    const n = (x + y) % 5
    return [200 + n, 200 + n, 205 + n]
  }
  if (x < 54) return [90, 120, 200]
  return [250, 250, 252]
}

/**
 * UI-like field: flat bands + one dark card, the shape real screenshots have
 * at 9×8. With `dirty`, three scattered pixels are nudged +24 (AA-level
 * noise) — close enough to stay within threshold, far enough to flip sha256.
 */
function uiBandsPng(dirty = false, width = 72, height = 64): Buffer {
  return encodePng(width, height, (x, y) => {
    const [r, g, b] = uiBandsPixel(x, y)
    if (dirty && ((x === 5 && y === 5) || (x === 40 && y === 30) || (x === 70 && y === 60))) {
      return [Math.min(255, r + 24), Math.min(255, g + 24), Math.min(255, b + 24)]
    }
    return [r, g, b]
  })
}

function goldenRecordFor(png: Buffer, timestamp = '2026-10-02T00:00:00Z') {
  return buildGoldenRecord({
    screen: 'home',
    device: 'reference',
    theme: 'light',
    scale: 2,
    full: false,
    file: 'home@2x.png',
    png,
    width: 390,
    height: 844,
    timestamp,
  })
}

/**
 * One element node in the shape `element.ts`'s `payloadFor()` writes: the
 * identity/style fields the digest keeps, plus the measured box/plumbing it
 * must ignore.
 */
function specNode(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e13',
    tag: 'button',
    parent: 'e12',
    depth: 3,
    role: 'Button',
    swiftUiShape: 'Button { HStack(spacing: 8) }',
    label: 'Button · "Start Family Trial"',
    text: 'Start Family Trial',
    box: { x: 16, y: 403, w: 114, h: 80 },
    layout: { direction: 'row', gap: 8, justify: 'center', align: 'center', selfAlign: 'auto', wrap: false, layer: false },
    padding: { top: 0, right: 28, bottom: 0, left: 28 },
    size: { w: 114, h: 80, grow: 0, fillWidth: true, fillHeight: false },
    typography: {
      family: '-apple-system',
      size: 17,
      weight: 700,
      weightName: 'bold',
      lineHeight: 22,
      lineSpacing: 5,
      tracking: 0,
      align: 'center',
      transform: 'none',
      color: 'rgb(0, 0, 0)',
      colorHex: '#000000',
    },
    image: null,
    surface: {
      background: 'rgb(255, 255, 255)',
      backgroundHex: '#ffffff',
      backgroundAlpha: 1,
      backgroundImage: '',
      backgroundKind: 'color',
      radius: 28,
      borderWidth: 0,
      borderColor: '',
      borderHex: '',
      shadow: 'none',
    },
    scrollable: false,
    ...overrides,
  }
}

/** A payload in the shape `payloadFor()` writes. */
function payloadFor(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    screen: 'family-plan',
    device: 'reference',
    theme: 'light',
    point: { x: 73, y: 443 },
    hit: true,
    selectedElement: specNode(),
    ancestors: [{ id: 'e12', role: 'VStack', label: '', box: { x: 16, y: 331, w: 358, h: 220 } }],
    candidates: 121,
    png: 'pw-cta@2x.png',
    pngClip: { x: 0, y: 379, width: 390, height: 104 },
    pngWidth: 780,
    pngHeight: 208,
    ...overrides,
  }
}

function elementRecordFor(png: Buffer, payload = payloadFor(), stem = 'pw-card') {
  const identity = { screen: 'seasonal-sale', device: 'reference', theme: 'light', stem, scale: 2 }
  return buildElementGoldenRecord({
    identity,
    png,
    payload,
    pngFile: `${elementGoldenKey(identity)}.png`,
  })
}
describe('--all-devices flag', () => {
  it('maps to devices ["all"] with explicitDevices so filenames keep suffix', () => {
    const options = parseArgs(['--screen', 'home', '--all-devices'])
    expect(options.devices).toEqual(['all'])
    expect(options.explicitDevices).toBe(true)
    expect(options.screens).toEqual(['home'])
  })

  it('defaults off: no flag keeps reference default', () => {
    const options = parseArgs(['--screen', 'home'])
    expect(options.devices).toEqual(['reference'])
  })
})

describe('--golden flag', () => {
  it('parses as boolean, default false', () => {
    expect(parseArgs(['--screen', 'home']).golden).toBe(false)
    expect(parseArgs(['--screen', 'home', '--golden']).golden).toBe(true)
  })

  it('combines with --all-devices', () => {
    const options = parseArgs(['--screen', 'home', '--all-devices', '--golden'])
    expect(options.devices).toEqual(['all'])
    expect(options.golden).toBe(true)
  })
})

describe('golden record format', () => {
  it('hashBuffer is sha256 hex of the bytes', () => {
    const bytes = Buffer.from('fake-png-bytes')
    expect(hashBuffer(bytes)).toBe(createHash('sha256').update(bytes).digest('hex'))
  })

  it('re-run identical input does not change the hash', () => {
    const a = hashBuffer(Buffer.from('same-bytes'))
    const b = hashBuffer(Buffer.from('same-bytes'))
    expect(a).toBe(b)
    expect(a).toHaveLength(64)
  })

  it('different input changes the hash', () => {
    expect(hashBuffer(Buffer.from('a'))).not.toBe(hashBuffer(Buffer.from('b')))
  })

  it('buildGoldenRecord carries hash + timestamp + screen/device identity', () => {
    const png = gradientPng()
    const record = buildGoldenRecord({
      screen: 'home',
      device: 'reference',
      theme: 'light',
      scale: 2,
      full: false,
      file: 'home@2x.png',
      png,
      width: 390,
      height: 844,
      timestamp: '2026-10-02T00:00:00Z',
    })
    expect(record).toMatchObject({
      screen: 'home',
      device: 'reference',
      theme: 'light',
      scale: 2,
      full: false,
      file: 'home@2x.png',
      width: 390,
      height: 844,
      timestamp: '2026-10-02T00:00:00Z',
    })
    expect(record.sha256).toBe(hashBuffer(png))
    expect(record.bytes).toBe(png.length)
    expect(record.phash).toBe(phashPng(png))
    expect(record.phash).toHaveLength(16)
  })

  it('goldenKey is stable per screen/device/theme/scale/full', () => {
    expect(goldenKey({ screen: 'h', device: 'd', theme: 'light', scale: 2, full: false } as never)).toBe(
      goldenKey({ screen: 'h', device: 'd', theme: 'light', scale: 2, full: false } as never),
    )
    expect(goldenKey({ screen: 'h', device: 'd', theme: 'light', scale: 2, full: false } as never)).not.toBe(
      goldenKey({ screen: 'h', device: 'd', theme: 'dark', scale: 2, full: false } as never),
    )
  })
})

describe('golden manifest round-trip', () => {
  it('upsert + save + load preserves the record; identical re-run keeps hash', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goldens-'))
    const png = gradientPng()
    const record = buildGoldenRecord({
      screen: 'home',
      device: 'reference',
      theme: 'light',
      scale: 2,
      full: false,
      file: 'home@2x.png',
      png,
      width: 390,
      height: 844,
      timestamp: '2026-10-02T00:00:00Z',
    })
    const manifest = upsertRecord(loadManifest(dir), record)
    saveManifest(dir, manifest)
    const reloaded = loadManifest(dir)
    const key = goldenKey(record)
    expect(reloaded.records[key].sha256).toBe(hashBuffer(png))
    // re-run identical: same bytes → same stored hash
    const rerun = buildGoldenRecord({ ...record, png, timestamp: '2026-10-02T00:00:01Z' })
    expect(rerun.sha256).toBe(reloaded.records[key].sha256)
    expect(JSON.parse(readFileSync(join(dir, 'goldens.json'), 'utf8')).records[key].screen).toBe('home')
  })

  it('loadManifest on empty dir returns an empty manifest', () => {
    expect(loadManifest(mkdtempSync(join(tmpdir(), 'goldens-empty-'))).records).toEqual({})
  })
})

describe('resolveGoldenDir', () => {
  it('single --project stores under project/<id>/goldens', () => {
    expect(resolveGoldenDir({ projects: ['calo-ai'] } as never)).toBe('project/calo-ai/goldens')
  })

  it('zero or many projects fall back to root goldens/', () => {
    expect(resolveGoldenDir({ projects: [] } as never)).toBe('goldens')
    expect(resolveGoldenDir({ projects: ['a', 'b'] } as never)).toBe('goldens')
  })
})

describe('phash (dHash)', () => {
  it('is stable hex for identical bytes', () => {
    const png = gradientPng()
    expect(phashPng(png)).toBe(phashPng(Buffer.from(png)))
    expect(phashPng(png)).toMatch(/^[0-9a-f]{16}$/)
  })

  it('phashDistance counts differing bits', () => {
    expect(phashDistance('ffffffffffffffff', 'ffffffffffffffff')).toBe(0)
    // last hex digit f (1111) vs 7 (0111): one bit
    expect(phashDistance('ffffffffffffffff', 'ffffffffffffff7f')).toBe(1)
    expect(phashDistance('0000000000000000', 'ffffffffffffffff')).toBe(64)
  })

  it('rejects non-PNG and unsupported PNG kinds', () => {
    expect(() => phashPng(Buffer.from('not-a-png'))).toThrow()
    // flip the IHDR color type to grayscale (0): decoder only does RGB/RGBA
    const gray = Buffer.from(gradientPng())
    gray[25] = 0
    expect(() => phashPng(gray)).toThrow()
  })
})

describe('compareGolden', () => {
  it('self-compare is a match at distance 0 (khớp)', () => {
    const png = gradientPng()
    const verdict = compareGolden(goldenRecordFor(png), png)
    expect(verdict).toEqual({ state: 'match', distance: 0 })
  })

  it('a few corrupted pixels stay within threshold (still khớp)', () => {
    const clean = uiBandsPng()
    const record = goldenRecordFor(clean)
    // 3 scattered pixels nudged +24: AA-level noise, flips sha256 but not the eye
    const dirty = uiBandsPng(true)
    expect(hashBuffer(dirty)).not.toBe(record.sha256)
    const verdict = compareGolden(record, dirty)
    expect(verdict.state).toBe('match')
    expect(verdict.distance).not.toBeNull()
    expect(verdict.distance as number).toBeLessThanOrEqual(GOLDEN_PHASH_THRESHOLD)
  })

  it('a heavily edited render flips to mismatch (lệch)', () => {
    const width = 72
    const height = 64
    const clean = gradientPng(width, height)
    const record = goldenRecordFor(clean)
    const inverted = encodePng(width, height, (x, y) => [255 - ((x * 3 + y) & 0xff), 255 - ((x + y * 5) & 0xff), 255 - ((x * 7 + y * 3) & 0xff)])
    const verdict = compareGolden(record, inverted)
    expect(verdict.state).toBe('mismatch')
    expect(verdict.distance as number).toBeGreaterThan(GOLDEN_PHASH_THRESHOLD)
  })

  it('missing record is missing, never an error', () => {
    expect(compareGolden(null, gradientPng())).toEqual({ state: 'missing', distance: null })
    expect(compareGolden(undefined, gradientPng())).toEqual({ state: 'missing', distance: null })
  })

  it('sha256-only records (pre-phash goldens) keep the old byte-exact verdict', () => {
    const png = gradientPng()
    const legacy = { ...goldenRecordFor(png), phash: '' }
    expect(compareGolden(legacy, png).state).toBe('match')
    const other = uiBandsPng()
    // sanity: fixtures really differ
    expect(hashBuffer(other)).not.toBe(legacy.sha256)
    expect(compareGolden(legacy, other)).toEqual({ state: 'mismatch', distance: null })
  })

  it('loadManifest backfills phash on pre-phash goldens', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goldens-legacy-'))
    const png = gradientPng()
    const record = goldenRecordFor(png)
    const legacy: Record<string, unknown> = JSON.parse(JSON.stringify(record))
    delete legacy.phash
    expect('phash' in legacy).toBe(false)
    writeFileSync(join(dir, 'goldens.json'), JSON.stringify({ version: 1, updatedAt: record.timestamp, records: { [goldenKey(record)]: legacy } }))
    const reloaded = loadManifest(dir)
    expect(reloaded.records[goldenKey(record)].phash).toBe('')
    expect(compareGolden(reloaded.records[goldenKey(record)], png).state).toBe('match')
  })
})

describe('resolveGoldenOsDir (read-old / write-new)', () => {
  it('nests the OS token under the shared dir', () => {
    expect(resolveGoldenOsDir({ projects: [] } as never, 'darwin')).toBe(join('goldens', 'darwin'))
    expect(resolveGoldenOsDir({ projects: ['calo-ai'] } as never, 'linux')).toBe(
      join('project/calo-ai/goldens', 'linux'),
    )
  })

  it('goldenOs defaults to the current platform', () => {
    expect(goldenOs()).toBe(process.platform)
  })

  it('cascade reads the OS record first, falls back to the shared base', () => {
    const base = mkdtempSync(join(tmpdir(), 'goldens-base-'))
    const osDir = mkdtempSync(join(tmpdir(), 'goldens-os-'))
    const png = gradientPng()
    const baseManifest = upsertRecord(loadManifest(base), goldenRecordFor(png, '2026-10-02T00:00:00Z'))
    saveManifest(base, baseManifest)
    // no OS manifest yet: cascade still finds the base record (read-old)
    const fallback = loadManifestCascade([osDir, base])
    expect(fallback.records[goldenKey(baseManifest.records[Object.keys(baseManifest.records)[0]])]).toBeDefined()
    // OS manifest overlays per key (write-new wins)
    const osPng = encodePng(72, 64, (x, y) => [((x * 3 + y) & 0xff) ^ 0x0f, (x + y * 5) & 0xff, (x * 7 + y * 3) & 0xff])
    const osRecord = { ...goldenRecordFor(osPng, '2026-10-03T00:00:00Z') }
    saveManifest(osDir, upsertRecord(loadManifest(osDir), osRecord))
    const merged = loadManifestCascade([osDir, base])
    expect(merged.records[goldenKey(osRecord)].sha256).toBe(hashBuffer(osPng))
    expect(merged.updatedAt).toBe('2026-10-03T00:00:00Z')
  })
})

describe('element golden key', () => {
  it('is screen--device--theme--stem, distinct per axis', () => {
    const key = elementGoldenKey({ screen: 'seasonal-sale', device: 'reference', theme: 'light', stem: 'pw-card' })
    expect(key).toBe('seasonal-sale--reference--light--pw-card')
    expect(elementGoldenKey({ screen: 'seasonal-sale', device: 'reference', theme: 'dark', stem: 'pw-card' })).not.toBe(key)
    expect(elementGoldenKey({ screen: 'seasonal-sale', device: 'ipad-11', theme: 'light', stem: 'pw-card' })).not.toBe(key)
    expect(elementGoldenKey({ screen: 'family-plan', device: 'reference', theme: 'light', stem: 'pw-card' })).not.toBe(key)
    expect(elementGoldenKey({ screen: 'seasonal-sale', device: 'reference', theme: 'light', stem: 'pw-cta' })).not.toBe(key)
    // an element key can never be mistaken for a screen key of the same render
    expect(key).not.toBe(goldenKey({ screen: 'seasonal-sale', device: 'reference', theme: 'light', scale: 2, full: false }))
  })
})

describe('specDigest', () => {
  it('ignores measured geometry and capture plumbing', () => {
    const base = payloadFor()
    // a different machine/render: another OS box, another crop, another capture
    const shifted = payloadFor({
      screen: 'seasonal-sale',
      device: 'ipad-11',
      theme: 'dark',
      scale: 3,
      point: { x: 80, y: 450 },
      candidates: 130,
      png: 'other@3x.png',
      pngClip: { x: 0, y: 380, width: 390, height: 110 },
      pngWidth: 780,
      pngHeight: 220,
      selectedElement: specNode({
        id: 'e40',
        parent: 'e20',
        depth: 4,
        box: { x: 16, y: 410, w: 114, h: 86 },
        size: { w: 120, h: 86, grow: 0, fillWidth: true, fillHeight: false },
      }),
      ancestors: [{ id: 'e20', role: 'VStack', label: '', box: { x: 0, y: 0, w: 390, h: 844 } }],
    })
    expect(specDigest(shifted)).toBe(specDigest(base))
    // key order is not information either
    const reordered = Object.fromEntries(Object.entries(base).reverse())
    expect(specDigest(reordered)).toBe(specDigest(base))
  })

  it('moves for a radius, a color, a font or a text change', () => {
    const base = specDigest(payloadFor())
    const node = specNode()
    const withNode = (change: Record<string, unknown>) => specDigest(payloadFor({ selectedElement: specNode(change) }))
    expect(withNode({ surface: { ...node.surface, radius: 4 } })).not.toBe(base)
    expect(withNode({ surface: { ...node.surface, backgroundHex: '#7a2b98' } })).not.toBe(base)
    expect(withNode({ typography: { ...node.typography, size: 15 } })).not.toBe(base)
    expect(withNode({ text: 'Start Free Trial' })).not.toBe(base)
    // the authored layout is style too: gap and padding must move it
    expect(withNode({ layout: { ...node.layout, gap: 12 } })).not.toBe(base)
    expect(withNode({ padding: { ...node.padding, left: 40 } })).not.toBe(base)
    // an ancestor's identity/role is context, not geometry
    expect(specDigest(payloadFor({ ancestors: [{ id: 'e12', role: 'ZStack', label: '', box: { x: 0, y: 0, w: 390, h: 844 } }] }))).not.toBe(base)
  })
})

describe('element golden record', () => {
  it('hashes the crop with the pipeline rules and the spec digest', () => {
    const png = uiBandsPng()
    const payload = payloadFor()
    const record = elementRecordFor(png, payload)
    expect(record).toMatchObject({
      elementKey: 'seasonal-sale--reference--light--pw-card',
      screen: 'seasonal-sale',
      device: 'reference',
      theme: 'light',
      scale: 2,
      png: 'seasonal-sale--reference--light--pw-card.png',
    })
    expect(record.cropHash).toBe(hashBuffer(png))
    expect(record.phash).toBe(phashPng(png))
    expect(record.phash).toMatch(/^[0-9a-f]{16}$/)
    expect(record.specHash).toBe(specDigest(payload))
    expect(record.specHash).toHaveLength(64)
    expect(Number.isFinite(record.updatedAt)).toBe(true)
    // a re-run over unchanged bytes keeps the crop hash; a style edit does not
    expect(elementRecordFor(png, payload).cropHash).toBe(record.cropHash)
    const styled = payloadFor({ selectedElement: specNode({ surface: { ...specNode().surface, radius: 4 } }) })
    expect(elementRecordFor(png, styled).specHash).not.toBe(record.specHash)
    expect(elementRecordFor(png, styled).cropHash).toBe(record.cropHash)
  })
})

describe('compareElementGolden', () => {
  it('missing record is missing, never an error', () => {
    const png = uiBandsPng()
    for (const nothing of [null, undefined]) {
      expect(compareElementGolden(nothing, png, payloadFor())).toEqual({
        state: 'missing',
        distance: null,
        cropMatch: false,
        specMatch: null,
      })
    }
  })

  it('byte-exact crop with the same spec is khớp', () => {
    const png = gradientPng()
    const payload = payloadFor()
    const record = elementRecordFor(png, payload)
    expect(compareElementGolden(record, png, payload)).toEqual({
      state: 'match',
      distance: 0,
      cropMatch: true,
      specMatch: true,
    })
  })

  it('AA-level noise stays within threshold (still khớp) and reports the distance', () => {
    const record = elementRecordFor(uiBandsPng())
    const dirty = uiBandsPng(true)
    expect(hashBuffer(dirty)).not.toBe(record.cropHash)
    const verdict = compareElementGolden(record, dirty, payloadFor())
    expect(verdict.state).toBe('match')
    expect(verdict.cropMatch).toBe(true)
    expect(verdict.distance).not.toBeNull()
    expect(verdict.distance as number).toBeGreaterThan(0)
    expect(verdict.distance as number).toBeLessThanOrEqual(GOLDEN_PHASH_THRESHOLD)
  })

  it('a heavily edited crop is lệch with a distance', () => {
    const width = 72
    const height = 64
    const record = elementRecordFor(gradientPng(width, height))
    const inverted = encodePng(width, height, (x, y) => [
      255 - ((x * 3 + y) & 0xff),
      255 - ((x + y * 5) & 0xff),
      255 - ((x * 7 + y * 3) & 0xff),
    ])
    const verdict = compareElementGolden(record, inverted, payloadFor())
    expect(verdict.state).toBe('mismatch')
    expect(verdict.cropMatch).toBe(false)
    expect(verdict.distance as number).toBeGreaterThan(GOLDEN_PHASH_THRESHOLD)
  })

  it('a style change the crop cannot see still reports specMatch false', () => {
    const png = uiBandsPng()
    const record = elementRecordFor(png, payloadFor())
    // the border-radius case: identical pixels, a different declared style
    const styled = payloadFor({
      selectedElement: specNode({ surface: { ...specNode().surface, radius: 4 } }),
    })
    const verdict = compareElementGolden(record, png, styled)
    expect(verdict.state).toBe('match')
    expect(verdict.cropMatch).toBe(true)
    expect(verdict.specMatch).toBe(false)
  })

  it('specMatch is null when the record carries no spec hash', () => {
    const png = uiBandsPng()
    const record = { ...elementRecordFor(png), specHash: '' }
    const verdict = compareElementGolden(record, png, payloadFor())
    expect(verdict.specMatch).toBeNull()
    expect(verdict.cropMatch).toBe(true)
  })
})

describe('element golden manifest round-trip', () => {
  it('holds both halves: an element upsert never drops screen records', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goldens-'))
    const screenRecord = goldenRecordFor(gradientPng())
    const elementRecord = elementRecordFor(uiBandsPng())
    saveManifest(dir, upsertRecord(loadManifest(dir), screenRecord))
    saveManifest(dir, upsertElementRecord(loadManifest(dir), elementRecord))
    const manifest = loadManifest(dir)
    expect(Object.keys(manifest.records)).toEqual([goldenKey(screenRecord)])
    expect(Object.keys(manifest.elements ?? {})).toEqual([elementRecord.elementKey])
    // and the screen-only path leaves the element half alone on re-run
    saveManifest(dir, upsertRecord(loadManifest(dir), goldenRecordFor(gradientPng(), '2026-10-05T00:00:00Z')))
    const again = loadManifest(dir)
    expect(Object.keys(again.elements ?? {})).toEqual([elementRecord.elementKey])
    expect(again.updatedAt).toBe('2026-10-05T00:00:00Z')
    expect(JSON.parse(readFileSync(join(dir, 'goldens.json'), 'utf8')).elements[elementRecord.elementKey].png).toBe(
      elementRecord.png,
    )
  })

  it('an old manifest without `elements` still loads, with no element goldens', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goldens-old-'))
    const record = goldenRecordFor(gradientPng())
    writeFileSync(
      join(dir, 'goldens.json'),
      JSON.stringify({ version: 1, updatedAt: record.timestamp, records: { [goldenKey(record)]: record } }),
    )
    const manifest = loadManifest(dir)
    expect(Object.keys(manifest.records)).toEqual([goldenKey(record)])
    // the missing key reads as an empty set, and a re-save does not invent one
    expect(Object.keys(manifest.elements ?? {})).toEqual([])
    expect('elements' in manifest).toBe(false)
    expect(loadElementGolden(dir, 'seasonal-sale--reference--light--pw-card')).toBeNull()
  })

  it('saveElementGolden + loadElementGolden round-trips the crop bytes', () => {
    const dir = mkdtempSync(join(tmpdir(), 'goldens-el-'))
    const png = uiBandsPng()
    const record = elementRecordFor(png)
    saveElementGolden(dir, record, png)
    saveManifest(dir, upsertElementRecord(loadManifest(dir), record))
    const loaded = loadElementGolden(dir, record.elementKey)
    expect(loaded?.png.equals(png)).toBe(true)
    expect(loaded?.record.cropHash).toBe(hashBuffer(png))
    expect(loadElementGolden(dir, 'seasonal-sale--reference--light--nope')).toBeNull()
    // a record whose crop file is gone has nothing to compare against
    unlinkSync(join(dir, record.png))
    expect(loadElementGolden(dir, record.elementKey)).toBeNull()
  })

  it('cascade merges the element half per key', () => {
    const base = mkdtempSync(join(tmpdir(), 'goldens-base-'))
    const osDir = mkdtempSync(join(tmpdir(), 'goldens-os-'))
    const baseRecord = elementRecordFor(gradientPng())
    saveManifest(base, upsertElementRecord(loadManifest(base), baseRecord))
    saveManifest(osDir, upsertElementRecord(loadManifest(osDir), { ...baseRecord, cropHash: 'f'.repeat(64) }))
    const merged = loadManifestCascade([osDir, base])
    expect(merged.elements?.[baseRecord.elementKey].cropHash).toBe('f'.repeat(64))
  })
})
