import { useMemo, useState } from 'react'
import type { ThemeMode } from '../tokens/tokens'
import type { Project } from './projects'
import { countOf, coverOf } from './projects'
import { SCREEN_BY_ID } from '../screens'
import { clearAllLocalState } from './storage'
import { InlineConfirm } from '../canvas/InlineConfirm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type DashboardProps = {
  projects: Project[]
  onOpen: (id: string) => void
  onCreate: (title: string) => void
  onDelete: (id: string) => void
  uiTheme: ThemeMode
  onUiTheme: (mode: ThemeMode) => void
}

function initials(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function Cover({ project }: { project: Project }) {
  const coverId = coverOf(project)
  const screen = coverId ? SCREEN_BY_ID.get(coverId) : undefined
  // Prefer a real export if one exists (`npm run export` writes exports/*.png).
  // png name: <screenId>@2x.png (single device) or <screenId>-<device>@2x.png.
  const png = coverId ? `/exports/${coverId}@2x.png` : null
  const [imgOk, setImgOk] = useState(true)
  if (png && imgOk && coverId) {
    return (
      <div className="h-[200px] overflow-hidden bg-muted">
        <img
          src={png}
          alt={screen?.title ?? coverId}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImgOk(false)}
        />
      </div>
    )
  }
  return (
    <div className="flex h-[200px] flex-col items-center justify-center gap-1 overflow-hidden bg-muted">
      <span className="text-3xl font-bold tracking-tight text-muted-foreground">{initials(project.title)}</span>
      {screen && <span className="text-xs text-muted-foreground">{screen.title}</span>}
    </div>
  )
}

export function Dashboard({ projects, onOpen, onCreate, onDelete, uiTheme, onUiTheme }: DashboardProps) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    )
  }, [projects, query])

  const submitCreate = () => {
    const title = draft.trim()
    if (!title) return
    onCreate(title)
    setDraft('')
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Dự án <span className="text-muted-foreground">({projects.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground">Mỗi dự án là một bảng các màn hình. Chọn để mở board.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {confirmReset ? (
            <InlineConfirm
              message="Xoá bố cục board + nháp token trong trình duyệt?"
              confirmLabel="Đặt lại"
              onConfirm={() => {
                const cleared = clearAllLocalState()
                console.info(`[phone-canvas] cleared ${cleared.length} local keys`)
                window.location.reload()
              }}
              onCancel={() => setConfirmReset(false)}
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmReset(true)}
              title="Xoá bố cục board, nháp token và dự án tự tạo đang lưu trong trình duyệt. File trên đĩa giữ nguyên."
            >
              Đặt lại
            </Button>
          )}
          <div className="inline-flex items-center rounded-md border border-input bg-background p-0.5" title="Chế độ màu của dashboard">
            <Button
              type="button"
              variant={uiTheme === 'light' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onUiTheme('light')}
            >
              Sáng
            </Button>
            <Button
              type="button"
              variant={uiTheme === 'dark' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onUiTheme('dark')}
            >
              Tối
            </Button>
          </div>
          <Input
            className="w-44"
            placeholder="Tìm dự án…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Input
              className="w-44"
              placeholder="+ Tên dự án mới…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate()
              }}
            />
            <Button type="button" size="sm" onClick={submitCreate} disabled={!draft.trim()}>
              + Dự án
            </Button>
          </div>
        </div>
      </header>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {projects.length === 0
            ? 'Chưa có dự án nào — tạo dự án mới ở ô trên.'
            : `Không tìm thấy dự án nào cho “${query}”.`}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className="relative overflow-hidden transition-shadow hover:shadow-md">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpen(p.id)}
              title={`Mở ${p.title}`}
              className="flex h-auto w-full flex-col items-stretch justify-start gap-0 rounded-none p-0 text-left"
            >
              <Cover project={p} />
              <CardHeader className="gap-2 p-4 pb-0">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  {p.custom && <Badge variant="outline">tự tạo</Badge>}
                </div>
                {p.description && <CardDescription>{p.description}</CardDescription>}
              </CardHeader>
              <CardContent className="p-4">
                <Badge variant="secondary">
                  {countOf(p)} màn hình
                </Badge>
              </CardContent>
            </Button>
            {p.custom && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(p.id)}
                title="Xóa dự án này"
                className="absolute right-3 top-3"
              >
                Xóa
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
