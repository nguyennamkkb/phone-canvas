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
   * True when the user passed ≥1 `--device` explicitly. The exporter keeps a
   * device suffix in that case even for a single device, so a phone export and
   * an iPad export of the same screen never silently overwrite each other.
   */
  explicitDevices: boolean
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
): string {
  const devSuffix = multiDevice ? `-${deviceId}` : ''
  const themeSuffix = theme === 'dark' ? '-dark' : ''
  return `${screenId}${devSuffix}${themeSuffix}@${scale}x.png`
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
  --out <dir>      output directory                          (default: exports)
  --list           print available screens and devices, then exit
  --help           print this message

Examples
  npm run export
  npm run export -- --screen journal-list --scale 3
  npm run export -- --screen home --device ipad-11   # home-ipad-11@2x.png
  npm run export -- --device all --out docs/shots
`.trim()

export function parseArgs(argv: string[]): Options {
  const options: Options = { screens: ['all'], devices: ['reference'], projects: [], themes: ['light'], scale: 2, out: 'exports', explicitDevices: false }
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
  return options
}
