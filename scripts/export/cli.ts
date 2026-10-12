/**
 * CLI parsing for `npm run export` — pure, no side effects, unit-testable
 * without launching Chrome.
 */

export type Options = {
  screens: string[]
  devices: string[]
  projects: string[]
  themes: string[]
  scale: number
  out: string
  /**
   * True when the user passed `--out` explicitly. A single `--project` picks
   * a project folder default only when `--out` was not given.
   */
  explicitOut: boolean
  /**
   * True when the user passed ≥1 `--device` explicitly. The exporter keeps a
   * device suffix in that case even for a single device, so a phone export and
   * an iPad export of the same screen never silently overwrite each other.
   */
  explicitDevices: boolean
  /**
   * Capture the whole document instead of the device frame. Default is the
   * frame: `.device` is height-fixed, so a capture is what the phone shows and
   * taller content is scrolled out.
   */
  full: boolean
  /**
   * Render every screen at every width in DEVICES (via the existing --device
   * all loop). Shorthand so reviewers never hand-list devices.
   */
  allDevices: boolean
  /**
   * Write versioned PNGs + a sha256 record per render into the golden store
   * (`project/<id>/goldens/` for a single --project, else `goldens/`).
   * Off by default; plain exports never touch the store.
   */
  golden: boolean
  /**
   * Element to record a golden for, by name (`--element pw-card`): the first
   * element in document order whose `elementStem`, `data-asset` or class
   * matches. A dot-separated set (`pw-card.fp-plan.is-best`) requires every
   * token on the same element, in any order. Requires `--golden` — element
   * records live in the same store — unless `--element-check` is set.
   */
  element: string | null
  /**
   * Compare-only twin of `--element`: crop every selected render and report
   * khớp/lệch against the stored golden without writing anything. Exits 1 on a
   * `lệch`, a missing golden, an ambiguous match or no match at all.
   */
  elementCheck: boolean
}

/**
 * Output filename for one render. `multiDevice` must be true whenever more
 * than one device renders — or the user named a device explicitly.
 */
export function exportFileName(
  screenId: string,
  deviceId: string,
  theme: string,
  scale: number,
  multiDevice: boolean,
  full = false,
): string {
  const devSuffix = multiDevice ? `-${deviceId}` : ''
  const fullSuffix = full ? '-full' : ''
  const themeSuffix = theme === 'dark' ? '-dark' : ''
  return `${screenId}${devSuffix}${fullSuffix}${themeSuffix}@${scale}x.png`
}

export const HELP = `
Export phone screens to PNG.

  --screen <id>    screen to export, repeatable, or "all"   (default: all)
  --project <id>   project to export (union with --screen), repeatable
  --device <id>    device to render at, repeatable, or "all" (default: reference)
                   naming --device (even once) keeps a -<device> filename
                   suffix, so phone and tablet exports never overwrite
  --theme <mode>   light, dark, or all, repeatable            (default: light)
  --scale <n>      pixel density multiplier                  (default: 2)
  --out <dir>      output directory (default: exports, or project/<id>/exports with one --project)
  --full           capture the whole document, not the device frame
                   (default: the device frame; taller content is scrolled out)
  --all-devices    render every screen at every width in DEVICES
                   (shorthand for --device all)
  --golden         also write versioned PNGs + a sha256 record per render
                   into the golden store (project/<id>/goldens/ for a single
                   --project, else goldens/). Off by default.
  --element <name> also record one element golden per selected screen: the
                   first element in document order whose stem (data-asset /
                   data-symbol / icon or image file / class / id), data-asset
                   or class is <name>. Crop PNG + record go into the same
                   golden store; the run prints khớp/lệch against the stored
                   crop. Needs --golden, and <name> must exist on EVERY
                   selected screen.
                   A dot-separated set requires every token on ONE element,
                   in any order: "pw-card" alone matches five elements on
                   seasonal-sale, "pw-card.ss-plan.is-best" matches exactly the
                   plan card. Pin the set, not the first lookalike.
  --element-check  compare only: crop each --element match and report
                   khớp/lệch against the stored golden, writing nothing.
                   Exits 1 on lệch, on a missing golden, on an ambiguous match
                   (it lists every candidate instead of taking the first) and
                   on no match. Needs --element, not --golden.
  --list           print available screens and devices, then exit
  --help           print this message

Examples
  npm run export
  npm run export -- --screen my-screen --scale 3
  npm run export -- --screen my-screen --device ipad-11   # my-screen-ipad-11@2x.png
  npm run export -- --screen my-screen --full             # my-screen-full@2x.png
  npm run export -- --device all --out docs/shots
  npm run export -- --golden --element pw-card --screen seasonal-sale
  npm run export -- --element-check --element pw-card.ss-plan.is-best --screen seasonal-sale
`.trim()

export function parseArgs(argv: string[]): Options {
  const options: Options = { screens: ['all'], devices: ['reference'], projects: [], themes: ['light'], scale: 2, out: 'exports', explicitOut: false, explicitDevices: false, full: false, allDevices: false, golden: false, element: null, elementCheck: false }
  const screens: string[] = []
  const devices: string[] = []
  const projects: string[] = []
  const themes: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const next = () => {
      const value = argv[++i]
      if (value === undefined) throw new Error(`${arg} needs a value`)
      return value
    }
    switch (arg) {
      case '--help':
      case '-h':
        console.log(HELP)
        process.exit(0)
      case '--list':
        options.screens = []
        options.devices = []
        return options
      case '--screen':
        screens.push(next())
        break
      case '--project':
        projects.push(next())
        break
      case '--device':
        devices.push(next())
        break
      case '--theme':
        themes.push(next())
        break
      case '--scale': {
        const scale = Number(next())
        if (!Number.isFinite(scale) || scale <= 0) throw new Error('--scale must be a positive number')
        options.scale = scale
        break
      }
      case '--out':
        options.out = next()
        options.explicitOut = true
        break
      case '--full':
        options.full = true
        break
      case '--all-devices':
        devices.push('all')
        options.allDevices = true
        break
      case '--golden':
        options.golden = true
        break
      case '--element':
        options.element = next()
        break
      case '--element-check':
        options.elementCheck = true
        break
      default:
        throw new Error(`unknown option: ${arg}`)
    }
  }

  options.screens = screens.length ? screens : ['all']
  options.devices = devices.length ? devices : ['reference']
  options.explicitDevices = devices.length > 0
  options.themes = themes.length ? themes : ['light']
  options.projects = projects
  // an element golden is a record in the golden store: without --golden there
  // is nowhere to write it and nothing to compare against. The check mode only
  // reads the store, so it needs no --golden.
  if (options.element && !options.golden && !options.elementCheck) throw new Error('--element needs --golden')
  if (options.elementCheck && !options.element) throw new Error('--element-check needs --element')
  // a query with no tokens ("" / ".") would match every element on the screen
  if (options.element !== null && options.element.split('.').filter(Boolean).length === 0) {
    throw new Error('--element needs a non-empty name')
  }
  if (!options.explicitOut && projects.length === 1) {
    options.out = `project/${projects[0]}/exports`
  }
  return options
}
