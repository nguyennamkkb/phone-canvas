import { createContext, useContext } from 'react'
import type { ThemeMode } from '../tokens/tokens'

/**
 * `move`    — iframes are inert; drag/pan the board like any canvas.
 * `inspect` — iframes receive pointer events; elements highlight and select.
 *
 * Screens deliberately have no interactive behaviour of their own, so there is
 * never a reason to want both at once. One switch keeps the model obvious.
 */
export type CanvasMode = 'move' | 'inspect'

/**
 * `plain`  — a rectangle the width of the device. No chassis, no island.
 * `device` — bezel + dynamic island, for when you want to *show* the product.
 *
 * Purely cosmetic: it never changes the width or the measured numbers.
 */
export type FrameStyle = 'plain' | 'device'

export type BoardSettings = {
  mode: CanvasMode
  frameStyle: FrameStyle
  /**
   * Which node the inspector is looking at. Deliberately NOT react-flow's own
   * selection state: that is cleared by internal re-measurement passes, which
   * would silently blank the spec panel a second after you picked a node.
   */
  activeNodeId: string | null
  /** right sidebar collapsed or not — cosmetic, never changes measurements */
  panelVisible: boolean
  /** remove a screen instance from the board (null outside a board) */
  onDeleteNode: ((id: string) => void) | null
  /** board color mode — flips every screen iframe via data-theme (v3) */
  tokenTheme: ThemeMode
  /** null outside a board */
  onTokenThemeChange: ((mode: ThemeMode) => void) | null
}

export const BoardContext = createContext<BoardSettings>({
  mode: 'move',
  frameStyle: 'plain',
  activeNodeId: null,
  panelVisible: true,
  onDeleteNode: null,
  tokenTheme: 'light',
  onTokenThemeChange: null,
})

export function useBoardSettings(): BoardSettings {
  return useContext(BoardContext)
}
