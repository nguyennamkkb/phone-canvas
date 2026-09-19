import tokensCss from '../screens/tokens.css?raw'
import iconsCss from '../screens/icons.css?raw'
import iconSetCss from '../screens/icon-set.css?raw'
import bridgeJs from '../extractor/bridge.js?raw'
import type { Device } from '../frame/devices'
import { composeScreenDoc } from './compose'

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
    stylesheets: [tokensCss, iconsCss, iconSetCss],
    bridgeJs,
  })
}
