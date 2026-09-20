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
  /** node đang hỏi xóa inline (5.2) — null khi không hỏi */
  deleteConfirmId: string | null
  /** mở hộp hỏi xóa tại chỗ thay vì window.confirm (5.2) */
  onRequestDelete: ((id: string) => void) | null
  /** xác nhận xóa sau khi đã hỏi */
  onConfirmDelete: ((id: string) => void) | null
  /** đóng hộp hỏi xóa */
  onCancelDelete: (() => void) | null
  /** board color mode — flips every screen iframe via data-theme (v3) */
  tokenTheme: ThemeMode
  /** null outside a board */
  onTokenThemeChange: ((mode: ThemeMode) => void) | null
  /** focused screen for 100% review (3.3) — null when in overview */
  focusedNodeId: string | null
  /** zoom a screen to 100% centered (null outside a board) */
  onFocusNode: ((id: string) => void) | null
}

export const BoardContext = createContext<BoardSettings>({
  mode: 'move',
  frameStyle: 'plain',
  activeNodeId: null,
  panelVisible: true,
  deleteConfirmId: null,
  onRequestDelete: null,
  onConfirmDelete: null,
  onCancelDelete: null,
  tokenTheme: 'light',
  onTokenThemeChange: null,
  focusedNodeId: null,
  onFocusNode: null,
})

export function useBoardSettings(): BoardSettings {
  return useContext(BoardContext)
}
