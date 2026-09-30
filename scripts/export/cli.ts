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
  --list           print available screens and devices, then exit
  --help           print this message

Examples
  npm run export
  npm run export -- --screen my-screen --scale 3
  npm run export -- --screen my-screen --device ipad-11   # my-screen-ipad-11@2x.png
  npm run export -- --screen my-screen --full             # my-screen-full@2x.png
  npm run export -- --device all --out docs/shots
`.trim()

export function parseArgs(argv: string[]): Options {
  const options: Options = { screens: ['all'], devices: ['reference'], projects: [], themes: ['light'], scale: 2, out: 'exports', explicitOut: false, explicitDevices: false, full: false }
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
      default:
        throw new Error(`unknown option: ${arg}`)
    }
  }

  options.screens = screens.length ? screens : ['all']
  options.devices = devices.length ? devices : ['reference']
  options.explicitDevices = devices.length > 0
  options.themes = themes.length ? themes : ['light']
  options.projects = projects
  if (!options.explicitOut && projects.length === 1) {
    options.out = `project/${projects[0]}/exports`
  }
  return options
}
