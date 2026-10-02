import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { parseArgs } from './cli.ts'
import {
  buildGoldenRecord,
  goldenKey,
  hashBuffer,
  loadManifest,
  resolveGoldenDir,
  saveManifest,
  upsertRecord,
} from './golden.ts'

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
    const record = buildGoldenRecord({
      screen: 'home',
      device: 'reference',
      theme: 'light',
      scale: 2,
      full: false,
      file: 'home@2x.png',
      png: Buffer.from('fake-png-bytes'),
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
    expect(record.sha256).toBe(hashBuffer(Buffer.from('fake-png-bytes')))
    expect(record.bytes).toBe(Buffer.from('fake-png-bytes').length)
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
    const png = Buffer.from('stable-bytes')
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
