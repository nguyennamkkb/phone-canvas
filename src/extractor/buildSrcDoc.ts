import bridgeJs from '../extractor/bridge.js?raw'
import type { Device } from '../frame/devices'
import { composeScreenDoc } from './compose'
import { componentsFor, iconMasksFor, stylesheetsFor } from './assets'
import type { ExpandError } from '../components/expand'

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
 * `iconMasksFor()` closes the last gap: a stylesheet that still names a glyph by
 * URL (a project token, a draft override) is inlined here too, so an icon can
 * never vanish on the board while an export still draws it.
 */
export function buildSrcDoc(options: BuildOptions): string {
  return buildSrcDocWithErrors(options).srcDoc
}

/**
 * Board path with the component-expansion root cause exposed: which
 * placeholder failed (missing id, cycle, depth) so the node can show it
 * instead of a blank iframe (core-upgrade 2.1).
 */
export function buildSrcDocWithErrors(options: BuildOptions): {
  srcDoc: string
  expandErrors: ExpandError[]
} {
  const expandErrors: ExpandError[] = []
  const srcDoc = composeScreenDoc({
    html: options.html,
    device: options.device,
    nodeId: options.nodeId,
    token: options.token,
    lightStatusBar: options.lightStatusBar,
    theme: options.theme,
    stylesheets: stylesheetsFor(options.projectId, options.extraCss),
    components: componentsFor(options.projectId),
    bridgeJs,
    iconMasks: iconMasksFor(),
    onExpandError: (errors) => expandErrors.push(...errors),
  })
  return { srcDoc, expandErrors }
}
