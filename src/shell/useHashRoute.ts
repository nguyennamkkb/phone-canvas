import { useCallback, useEffect, useState } from 'react'

/**
 * Hash-based routing for two views: dashboard and board.
 *
 * Hash (not history API) on purpose: `vite preview` and any static host serve
 * this without rewrite rules. The API mirrors a history router so swapping
 * later is one task, not a rewrite.
 *
 * Routes: `#/` → dashboard, `#/p/:projectId` → board.
 */

export type Route = { view: 'dashboard' } | { view: 'board'; projectId: string }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/'
  const m = /^\/p\/([^/]+)\/?$/.exec(path)
  if (m) return { view: 'board', projectId: decodeURIComponent(m[1] as string) }
  return { view: 'dashboard' }
}

export function hrefFor(route: Route): string {
  if (route.view === 'board') return `#/p/${encodeURIComponent(route.projectId)}`
  return '#/'
}

function current(): Route {
  return parseHash(window.location.hash)
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => current())

  useEffect(() => {
    const onChange = () => setRoute(current())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((next: Route) => {
    const href = hrefFor(next)
    if (window.location.hash === href) setRoute(parseHash(href))
    else window.location.hash = href
  }, [])

  return [route, go]
}
