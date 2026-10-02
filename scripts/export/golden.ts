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
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

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
    return { version: 1, updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '', records: parsed.records }
  } catch {
    return empty
  }
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
