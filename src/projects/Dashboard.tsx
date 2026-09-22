import { useMemo, useState } from 'react'
import type { ThemeMode } from '../tokens/tokens'
import type { Project } from './projects'
import { countOf, coverOf } from './projects'
import { SCREEN_BY_ID } from '../screens'
import { clearAllLocalState } from './storage'
import { InlineConfirm } from '../canvas/InlineConfirm'

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
      <div className="dash-cover">
        <img
          src={png}
          alt={screen?.title ?? coverId}
          loading="lazy"
          onError={() => setImgOk(false)}
        />
      </div>
    )
  }
  return (
    <div className="dash-cover dash-cover-fallback">
      <span className="dash-cover-initials">{initials(project.title)}</span>
      {screen && <span className="dash-cover-name">{screen.title}</span>}
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
    <div className="dash">
      <header className="dash-head">
        <div>
          <h1>
            Dự án <span className="muted">({projects.length})</span>
          </h1>
          <p className="dash-sub">Mỗi dự án là một bảng các màn hình. Chọn để mở board.</p>
        </div>
        <div className="dash-actions">
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
            <button
              type="button"
              className="ghost dash-reset"
              onClick={() => setConfirmReset(true)}
              title="Xoá bố cục board, nháp token và dự án tự tạo đang lưu trong trình duyệt. File trên đĩa giữ nguyên."
            >
              Đặt lại
            </button>
          )}
          <div className="segmented" title="Chế độ màu của dashboard">
            <button
              type="button"
              className={uiTheme === 'light' ? 'is-on' : ''}
              onClick={() => onUiTheme('light')}
            >
              Sáng
            </button>
            <button
              type="button"
              className={uiTheme === 'dark' ? 'is-on' : ''}
              onClick={() => onUiTheme('dark')}
            >
              Tối
            </button>
          </div>
          <input
            className="dash-search"
            placeholder="Tìm dự án…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="dash-create">
            <input
              className="dash-search"
              placeholder="+ Tên dự án mới…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate()
              }}
            />
            <button type="button" className="dash-btn" onClick={submitCreate} disabled={!draft.trim()}>
              + Dự án
            </button>
          </div>
        </div>
      </header>

      {filtered.length === 0 && (
        <p className="empty">Không tìm thấy dự án nào cho “{query}”.</p>
      )}

      <div className="dash-grid">
        {filtered.map((p) => (
          <article key={p.id} className="dash-card">
            <button type="button" className="dash-open" onClick={() => onOpen(p.id)} title={`Mở ${p.title}`}>
              <Cover project={p} />
              <div className="dash-meta">
                <div className="dash-title-row">
                  <h3>{p.title}</h3>
                  {p.custom && <span className="dash-badge">tự tạo</span>}
                </div>
                {p.description && <p className="dash-desc">{p.description}</p>}
                <span className="dash-count">
                  {countOf(p)} màn hình
                </span>
              </div>
            </button>
            {p.custom && (
              <button
                type="button"
                className="dash-delete"
                onClick={() => onDelete(p.id)}
                title="Xóa dự án này"
              >
                Xóa
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
