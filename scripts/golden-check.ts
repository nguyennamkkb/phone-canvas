#!/usr/bin/env node
/**
 * CI gate for the element goldens of the paywall family.
 *
 * Why these four pins: `pw-card` and `pw-cta` are the components every paywall
 * screen reuses, so one CSS edit inside either of them moves the crop on
 * several screens at once — the exact drift a screen-level hash cannot name.
 * Each pin is pinned by CLASS SET, not by a single name: `pw-card` alone
 * matches five elements on seasonal-sale, and a pin that silently retargets the
 * first lookalike would go green on the wrong element.
 *
 * The work is done by `npm run export -- --element-check …` (one process per
 * pin, so one pin's failure cannot hide another's). Nothing is written: the
 * check crops the current render and compares it against the committed golden.
 * A missing golden is a FAILURE, not a skip — a green that never measured
 * anything is a lie. Exit 1 when any pin fails.
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
/** long enough for a cold Chrome + a warm element session on CI */
const PIN_TIMEOUT_MS = 240_000

type Pin = {
  screen: string
  /** `--element` query: every dot-separated token must sit on the same element */
  element: string
  why: string
}

const PINS: Pin[] = [
  { screen: 'seasonal-sale', element: 'pw-cta', why: 'the paywall CTA, one per screen' },
  { screen: 'family-plan', element: 'pw-cta', why: 'the same CTA on the second paywall screen' },
  { screen: 'family-plan', element: 'pw-card.fp-plan.is-best', why: 'the highlighted plan card' },
  { screen: 'seasonal-sale', element: 'pw-card.ss-plan.is-best', why: 'the highlighted plan card' },
  { screen: 'halloween-offer', element: 'region-nav', why: 'band nav trên nền ảnh — crop vắt qua seam .device/.screen' },
]

type Row = { pin: string; key: string; status: string }

const rows: Row[] = []
let failed = 0

for (const pin of PINS) {
  console.log(`\npin ${pin.screen}  --element ${pin.element}  (${pin.why})`)
  const run = spawnSync(
    process.execPath,
    [
      '--disable-warning=ExperimentalWarning',
      path.join(ROOT, 'scripts/export.ts'),
      // the screen's own device and light theme, scale 2: the render the
      // committed golden was shot in
      '--element-check',
      '--element',
      pin.element,
      '--screen',
      pin.screen,
      '--theme',
      'light',
      '--scale',
      '2',
    ],
    { cwd: ROOT, encoding: 'utf8', timeout: PIN_TIMEOUT_MS },
  )
  const out = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim()
  if (out) console.log(out.split('\n').map((line) => `  ${line}`).join('\n'))
  const ok = run.status === 0
  if (!ok) failed++
  rows.push({
    pin: `${pin.screen} ${pin.element}`,
    key: /^element (\S+)/m.exec(run.stdout ?? '')?.[1] ?? '—',
    status: ok ? 'ok' : 'FAIL',
  })
}

console.log('\npin'.padEnd(44) + 'key'.padEnd(48) + 'status')
for (const row of rows) console.log(row.pin.padEnd(44) + row.key.padEnd(48) + row.status)
console.log(`\n${PINS.length} pin(s), ${failed} failed`)
if (failed > 0) process.exitCode = 1
