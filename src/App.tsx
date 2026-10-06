import { useCallback, useEffect, useMemo, useState } from 'react'
import { BoardView } from './board/BoardView'
import { Dashboard } from './projects/Dashboard'
import { ErrorBoundary } from './shell/ErrorBoundary'
import { useHashRoute } from './shell/useHashRoute'
import { InspectorProvider } from './inspect/InspectorContext'
import { useUiTheme } from './tokens/store'
import type { Project } from './projects/projects'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  allProjects,
  clearBoard,
  loadCustomProjects,
  loadPanelVisible,
  saveCustomProjects,
  savePanelVisible,
} from './projects/storage'

function slug(title: string): string {
  const s = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
  return s || `project-${Date.now().toString(36)}`
}

/* ------------------------------------------------------------------ app -- */

export function App() {
  const [custom, setCustom] = useState<Project[]>(() => loadCustomProjects())
  const [route, go] = useHashRoute()
  const [panelVisible, setPanelVisible] = useState<boolean>(() => loadPanelVisible())
  // app-chrome theme toàn cục (5.1) — board ghi, dashboard đọc
  const [uiTheme, setUiTheme] = useUiTheme()

  const projects = useMemo(() => allProjects(custom), [custom])
  // URL is the source of truth (2.1); unknown ids fall to a not-found view
  const active =
    route.view === 'board' ? (projects.find((p) => p.id === route.projectId) ?? null) : null
  const unknownProject = route.view === 'board' && !active ? route.projectId : null

  const togglePanel = useCallback(() => {
    setPanelVisible((v) => {
      savePanelVisible(!v)
      return !v
    })
  }, [])

  // Cmd/Ctrl+. toggles the right sidebar from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        togglePanel()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePanel])

  const openProject = useCallback(
    (id: string) => go({ view: 'board', projectId: id }),
    [go],
  )

  const closeProject = useCallback(() => go({ view: 'dashboard' }), [go])

  const createProject = useCallback(
    (title: string) => {
      const id = slug(title)
      const finalId = projects.some((p) => p.id === id) ? `${id}-${Date.now().toString(36)}` : id
      const project: Project = { id: finalId, title: title.trim(), screenIds: [], custom: true }
      const next = [...custom, project]
      setCustom(next)
      saveCustomProjects(next)
      openProject(finalId)
    },
    [custom, projects, openProject],
  )

  // remember screens added to a custom project so its card count/cover stay true
  const trackScreen = useCallback((projectId: string, screenId: string) => {
    setCustom((prev) => {
      if (!prev.some((p) => p.id === projectId)) return prev
      const next = prev.map((p) =>
        p.id === projectId && !p.screenIds.includes(screenId)
          ? { ...p, screenIds: [...p.screenIds, screenId] }
          : p,
      )
      saveCustomProjects(next)
      return next
    })
  }, [])

  // forget screens removed from a custom project so its card count/cover stay true
  const untrackScreen = useCallback((projectId: string, screenId: string) => {
    setCustom((prev) => {
      if (!prev.some((p) => p.id === projectId)) return prev
      const next = prev.map((p) =>
        p.id === projectId
          ? { ...p, screenIds: p.screenIds.filter((s) => s !== screenId) }
          : p,
      )
      saveCustomProjects(next)
      return next
    })
  }, [])

  const deleteProject = useCallback(
    (id: string) => {
      const next = custom.filter((p) => p.id !== id)
      setCustom(next)
      saveCustomProjects(next)
      clearBoard(id)
      if (route.view === 'board' && route.projectId === id) closeProject()
    },
    [custom, route, closeProject],
  )

  return (
    <InspectorProvider>
      {unknownProject ? (
        <div className="app app-dashboard">
          <div className="dash">
            <div className="mx-auto my-[72px] max-w-md">
              <Card>
                <CardHeader>
                  <CardTitle>Không tìm thấy dự án “{unknownProject}”</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Liên kết này trỏ tới một board không còn tồn tại (đã xóa hoặc sai id).
                  </p>
                </CardContent>
                <CardFooter>
                  <Button type="button" onClick={closeProject}>
                    Về Dashboard
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : active ? (
        <ErrorBoundary
          fallback={(retry) => (
            <div className="app app-dashboard">
              <div className="dash">
                <div className="mx-auto my-[72px] max-w-md" role="alert">
                  <Card>
                    <CardHeader>
                      <CardTitle>Board gặp lỗi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Bố cục đã lưu của bạn vẫn còn trong bộ nhớ trình duyệt.
                      </p>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button type="button" onClick={retry}>
                        Thử mở lại board
                      </Button>
                      <Button type="button" variant="ghost" onClick={closeProject}>
                        Về Dashboard
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          )}
        >
          {/* remount flow per project so fitView/minimap never bleed across boards */}
          <BoardView
              key={active.id}
              project={active}
              panelVisible={panelVisible}
              onTogglePanel={togglePanel}
              onBack={closeProject}
              onTrackScreen={trackScreen}
              onUntrackScreen={untrackScreen}
            />
          </ErrorBoundary>
      ) : (
        <div className="app app-dashboard" data-theme={uiTheme}>
          <Dashboard
            projects={projects}
            onOpen={openProject}
            onCreate={createProject}
            onDelete={deleteProject}
            uiTheme={uiTheme}
            onUiTheme={setUiTheme}
          />
        </div>
      )}
    </InspectorProvider>
  )
}
