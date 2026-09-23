import bridgeJs from '../extractor/bridge.js?raw'
import type { Device } from '../frame/devices'
import { composeScreenDoc } from './compose'
import { componentsFor, stylesheetsFor } from './assets'

export type BuildOptions = {
  /** the screen's own markup (below the status bar, above the home indicator) */
  html: string
  device: Device
  /** identify which canvas node this iframe belongs to */
  nodeId: string
  /**
   * Opaque per-node token. A sandboxed iframe's WindowProxy is not a stable
   * identity across navigations, so the parent routes messages by this instead
   * of by comparing `event.source` against `iframe.contentWindow`.
   */
  token: string
  /** dark surfaces need a light status bar */
  lightStatusBar?: boolean
  /** project whose tokens.css is layered after the shared stylesheets */
  projectId?: string
  /** color mode — sets data-theme on <html> */
  theme?: 'light' | 'dark'
  /** v2 draft overrides, layered last so they preview over everything */
  extraCss?: string | null
}

/**
 * Browser-side adapter: pulls the raw assets through Vite and hands them to the
 * shared composer. `scripts/export.ts` reads the same files off disk.
 *
 * Asset URLs are root-absolute (`/images/…`), served by Vite from `public/`. A
 * srcdoc iframe inherits the parent's base URL, so they resolve unchanged.
 * Icons are never URLs — they are inlined by scripts/icons.ts, because a mask
 * image is a CORS-mode fetch that a sandboxed iframe's opaque origin refuses.
 */
export function buildSrcDoc(options: BuildOptions): string {
  return composeScreenDoc({
    html: options.html,
    device: options.device,
    nodeId: options.nodeId,
    token: options.token,
    lightStatusBar: options.lightStatusBar,
    theme: options.theme,
    stylesheets: stylesheetsFor(options.projectId, options.extraCss),
    components: componentsFor(options.projectId),
    bridgeJs,
  })
}
