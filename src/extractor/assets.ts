import coreCss from '../screens/core.css?raw'
import palettesCss from '../screens/palettes.css?raw'
import vocabCss from '../screens/vocab.css?raw'
import iconsCss from '../screens/icons.css?raw'
import iconSetCss from '../screens/icon-set.css?raw'

import { componentMap } from '../components'
import { tokensCssFor } from '../projects/registry'

/**
 * Browser-side asset assembly, shared by the board iframes and the component
 * catalog. Vite-only (`?raw`): `scripts/export.ts` reads the same files off disk
 * instead, through the manifests.
 *
 * Stylesheet order is the contract: core scales → palettes → component
 * vocabulary → icons → project tokens → draft overrides, so a project can
 * override a global name and a draft previews over everything.
 */

export function stylesheetsFor(projectId?: string, extraCss?: string | null): string[] {
  const out = [coreCss, palettesCss, vocabCss, iconsCss, iconSetCss]
  const projectCss = projectId ? tokensCssFor(projectId) : null
  if (projectCss) out.push(projectCss)
  if (extraCss) out.push(extraCss)
  return out
}

/** id → html map for a project's components (what compose expands against) */
export function componentsFor(projectId?: string): Record<string, string> {
  return projectId ? componentMap(projectId) : {}
}

const ICON_RULE = /\.icon\[[^\]]*\]\s*\{([^{}]*)\}/g
const ICON_MASK = /--icon:\s*url\(\s*(?:(['"])([^'"]*)\1|([^)'"]*))\s*\)/
const ICON_SRC = /--icon-src:\s*(['"]?)([^'";\s]+)\1/
let iconMasks: Record<string, string> | null = null

/**
 * `/icons/<file>.svg` → the glyph as a bare `data:image/svg+xml,…` URI.
 *
 * Read out of `icon-set.css` rather than a second source: the generated sheet
 * is already the one place a glyph lives as artwork, and `--icon-src` names the
 * file it came from. compose pairs the two so a stylesheet that still points at
 * the file by URL (a project token, a draft override) can be inlined — the mask
 * lane is a CORS-mode fetch, which a sandboxed srcdoc iframe refuses.
 */
export function iconMasksFor(): Record<string, string> {
  if (iconMasks) return iconMasks
  const out: Record<string, string> = {}
  for (const rule of iconSetCss.matchAll(ICON_RULE)) {
    const block = rule[1] ?? ''
    const data = ICON_MASK.exec(block)?.[2]
    const src = ICON_SRC.exec(block)?.[2]
    if (data && src) out[src] = data
  }
  iconMasks = out
  return out
}
