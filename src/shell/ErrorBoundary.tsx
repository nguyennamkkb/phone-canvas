import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** shown when the subtree throws — recovery actions, never a blank page */
  fallback: (retry: () => void) => ReactNode
}

type State = { failed: boolean }

/**
 * One boundary, two mounting points: around BoardView (board-level recovery)
 * and around each PhoneNode iframe (per-screen card error + remount).
 * React 19 has no hook form, so this stays a class.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown): void {
    console.error('[phone-canvas] boundary caught:', error)
  }

  private retry = (): void => {
    this.setState({ failed: false })
  }

  render(): ReactNode {
    if (this.state.failed) return this.props.fallback(this.retry)
    return this.props.children
  }
}
