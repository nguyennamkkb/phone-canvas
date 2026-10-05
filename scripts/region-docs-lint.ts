#!/usr/bin/env node
// @ts-nocheck — small zero-dep cli, checked by running it, not by tsc
/**
 * Region-docs lint (single-source-regions gate): region numbers live in
 * `openspec/specs/screen-regions/` (device sizes in `src/frame/devices.ts`);
 * the docs below only link to them, never restate them.
 *
 *   npm run lint:regions-docs
 *
 * Scans README.md, `.agents/skills/phone-canvas/SKILL.md`,
 * `.agents/skills/phone-canvas/references/*.md` and `recipes/*.md` for bare
 * region numbers. Every hit fails with file:line + the link to use instead.
 *
 * Rules (error, exit 1):
 *   docs-region-pt      44/68/16 in pt/px (touch floor / tab bar / gutter)
 *   docs-region-rect    44x44 with x/× (touch-floor rect, no unit needed)
 *   docs-region-ratio   50/50, 1:2, 41:59, 35:65 (split ratios from the spec)
 *   docs-region-tabs    3–5 / 3-5 (tab destination range)
 *   docs-region-device  a known device dim in pt (820 pt…) or WxH (390×844…)
 *
 * Deliberately NOT flagged: clock times (09:12 has a leading zero, split
 * ratios never do), contrast ratios (5.3:1), type/component sizes (48px,
 * 52 square), token names (--s4), grid talk (4/8 pt). A line describing what
 * a lint/audit tier checks may keep its numbers, but only with an explicit
 * marker on the same line:
 *
 *   <!-- lint-docs: keep -->
 *
 * The marker is the whole allowlist — one mechanism, no sidecar list to
 * drift. A line carrying both a link and a bare number still fails: linking
 * does not excuse restating.
 */

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKILL_DIR = '.agents/skills/phone-canvas'
const KEEP = 'lint-docs: keep'
const SPEC_LINK = 'openspec/specs/screen-regions/'
const DEVICES_LINK = 'src/frame/devices.ts'

const RULES = [
  {
    code: 'docs-region-pt',
    re: /\b(44|68|16)\s?(pt|px)\b/g,
    fix: `bare region number — link ${SPEC_LINK} instead of restating it`,
  },
  {
    code: 'docs-region-rect',
    re: /\b44\s?[×x]\s?44\b/g,
    fix: `bare touch-floor rect — link ${SPEC_LINK} instead of restating it`,
  },
  {
    code: 'docs-region-ratio',
    re: /(\b50\/50\b|\b(1:2|41:59|35:65)\b)/g,
    fix: `bare split ratio — link ${SPEC_LINK} instead of restating it`,
  },
  {
    code: 'docs-region-tabs',
    re: /\b3\s?[–—-]\s?5\b/g,
    fix: `bare destination range — link ${SPEC_LINK} instead of restating it`,
  },
  {
    code: 'docs-region-device',
    re: /(\b(375|390|402|430|466|626|678|744|820|890|932|844|874|667|1133|1180|198|242|169|360)\s?pt\b|\b\d{3,4}\s?[×x]\s?\d{3,4}\b)/g,
    fix: `bare device size — link ${DEVICES_LINK} instead of restating it`,
  },
]

export function docViolations(text) {
  const found = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.includes(KEEP)) continue
    for (const rule of RULES) {
      rule.re.lastIndex = 0
      const m = rule.re.exec(line)
      if (m) found.push({ line: i + 1, code: rule.code, hit: m[0], fix: rule.fix })
    }
  }
  return found
}

async function collectFiles() {
  const files = ['README.md', `${SKILL_DIR}/SKILL.md`]
  for (const sub of ['references', 'recipes']) {
    const dir = path.join(ROOT, SKILL_DIR, sub)
    const entries = await readdir(dir)
    for (const name of entries.filter((n) => n.endsWith('.md')).sort()) {
      files.push(`${SKILL_DIR}/${sub}/${name}`)
    }
  }
  return files
}

const HELP = `
Region-docs lint: single-source-regions gate (docs link, never restate).

  npm run lint:regions-docs
  --help          print this message

Scans README.md, SKILL.md, references/*.md and recipes/*.md for bare region
numbers (44/68/16 pt, 44x44, split ratios, 3–5, device sizes). A line about
what a lint/audit tier checks may keep numbers with <!-- lint-docs: keep -->.
`.trim()

async function main() {
  const argv = process.argv.slice(2)
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(HELP)
    return
  }
  let violations = 0
  for (const file of await collectFiles()) {
    const text = await readFile(path.join(ROOT, file), 'utf8')
    for (const v of docViolations(text)) {
      console.error(`error  ${file}:${v.line}  [${v.code}] bare ${JSON.stringify(v.hit)} — ${v.fix}`)
      violations += 1
    }
  }
  console.log(`\n${violations} lỗi region-docs`)
  if (violations > 0) process.exit(1)
}

main().catch((error) => {
  console.error(`lint:regions-docs: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
