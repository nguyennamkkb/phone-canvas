#!/usr/bin/env node
/**
 * Region lint (screen-region-standard): the static half of the region gate.
 *
 *   npm run lint:regions
 *   npm run lint:regions -- --screen <id>   (only that screen; same pattern as region-audit/export)
 *
 * Everything here is knowable from the text of a screen. The measured half —
 * a hit region under 44 pt, a control sitting on the fold, whether the status
 * bar strip matches the screen background — needs a layout pass and lives in
 * `scripts/region-audit.ts`. The rules themselves are in `region-rules.ts` so
 * the tests and this CLI cannot drift.
 *
 * Rules (docs/screen-regions.md is the prose):
 *   chrome-redrawn        a screen redraws an OS band the shell injects
 *   region-shell-owned    a screen draws a nav/tab band the shell builds
 *   region-slot-unknown   an unknown or empty data-slot / data-tab
 *   region-undeclared     a fixed band built by hand instead of a slot/region
 *   navbar-too-many-actions / navbar-title-long / navbar-back-missing  (nav slot)
 *   tabbar-too-many / tabbar-unlabelled / cover-horizontal-tabbar      (data-tab)
 *   touch-floor           a governed class declares under --touch-min
 *   device-literal        px tied to one device's width or height
 *   region-off-without-reason  an exemption that does not say why
 *
 * Discovery comes from scripts/scan-projects.ts — the same registry the board
 * and the exporter read. Every line names file:line and the fix.
 *
 * Every violation fails the gate. There is no warn mode: the 21 screens that
 * used to build their top band by hand have been migrated, and a rule that only
 * warns is a rule nobody has to satisfy.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEVICES, DEFAULT_DEVICE_ID, formFactorOf } from '../src/frame/devices.ts'
import { filterByScreen, parseScreenFilter, printHelpIfRequested, reportNoScreenMatch } from './screen-filter.ts'
import { scanProjects } from './scan-projects.ts'
import {
  componentViolations,
  screenViolations,
  touchFloorViolations,
  type Violation,
} from './region-rules.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Apple's minimum hit region, mirroring `--touch-min` in src/screens/tokens.css */
const TOUCH_MIN = 44

/**
 * Classes the vocabulary declares under the floor on purpose, because a
 * parent already guarantees the hit region. Name the parent so the exception
 * is auditable — an unbacked entry here is how a 30 px button ships.
 */
const GUARANTEED_BY: Record<string, string> = {
  '.toggle': '.action-row is 46px tall; the 28px track is the glyph, not the target',
}
// A parent that CENTRES its children does not stretch them: an entry here once
// claimed `.tabbar-float` guaranteed its tab items, and the audit measured 38 pt
// inside the 68 pt bar. Every entry must be backed by a measurement, not by the
// shape of the parent.

const DEVICE_SIZES = DEVICES.flatMap((d) => [d.width, d.height] as const)

function report(file: string, violations: Violation[]): number {
  for (const v of violations) {
    console.error(`error  ${file}:${v.line}  [${v.code}] ${v.message}`)
  }
  return violations.length
}

const HELP = `
Region lint: the static half of the region gate (text-knowable rules).

  --screen <id>   only check that screen (default: all screens + components)
  --help          print this message

Examples
  npm run lint:regions
  npm run lint:regions -- --screen today
`.trim()

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  if (printHelpIfRequested(argv, HELP)) return
  const only = parseScreenFilter(argv)
  const { registry, errors: registryErrors } = await scanProjects()
  const screens = filterByScreen(registry.screens, only)
  if (only && screens.length === 0) reportNoScreenMatch('lint:regions', only)
  let violations = 0
  for (const error of registryErrors) {
    console.error(`error  ${error.file}  ${error.message}`)
    violations += 1
  }

  // 1. the shared vocabulary: a governed class must clear the touch floor
  // (the classes live in vocab.css since the token-layers split; core.css
  // holds the --touch-min scale they are measured against).
  const globalCss = await readFile(path.join(ROOT, 'src/screens/vocab.css'), 'utf8')
  const floor = touchFloorViolations(globalCss, TOUCH_MIN, GUARANTEED_BY)
  for (const v of floor) {
    console.error(`error  src/screens/vocab.css:${v.line}  [${v.code}] ${v.message}`)
  }
  violations += floor.length

  // 2. every screen, judged against the form factor its own header declares.
  //    A screen's chrome can live in a component, so each screen is judged with
  //    its own project's components in hand.
  const byCode = new Map<string, number>()
  const count = (file: string, found: Violation[]) => {
    violations += report(file, found)
    for (const v of found) byCode.set(v.code, (byCode.get(v.code) ?? 0) + 1)
  }
  const componentsOf = (projectId: string) =>
    Object.fromEntries(
      registry.components.filter((c) => c.project === projectId).map((c) => [c.id, c.html]),
    )

  for (const screen of screens) {
    const form = formFactorOf(screen.deviceId ?? DEFAULT_DEVICE_ID)
    count(
      screen.file,
      screenViolations({
        html: screen.html,
        form,
        deviceWidths: DEVICE_SIZES,
        components: componentsOf(screen.projectId),
      }),
    )
  }

  // 3. every component. After shared-screen-chrome part of a band's content
  //    lives in a component, so linting only screens would leave a hole: a
  //    `data-slot="titel"` or a `class="navbar"` in a component was invisible.
  for (const component of registry.components) {
    count(
      component.file,
      componentViolations({ html: component.html, deviceWidths: DEVICE_SIZES }),
    )
  }

  const breakdown = [...byCode.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code, n]) => `${code} ${n}`)
    .join(' · ')

  console.log(`\n${violations} lỗi vùng`)
  if (breakdown) console.log(`  ${breakdown}`)

  if (violations > 0) {
    console.error('  xem docs/screen-regions.md — hoặc khai báo `<!-- lint-region: off -->` kèm lý do')
    process.exit(1)
  }
}

main().catch((error: unknown) => {
  console.error(`lint:regions: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
