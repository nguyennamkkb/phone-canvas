import { useMemo, useState } from 'react'
import type { Selection } from '../InspectorContext'
import type { SpecNode } from '../../spec/types'

export type ElementTreeProps = {
  specList: SpecNode[]
  selection: Selection | null
  nodeId: string
  onPick: (sel: Selection) => void
}

/** flat indented element list — depth drives the indent, not nesting */
export function ElementTree({ specList, selection, nodeId, onPick }: ElementTreeProps) {
  // lọc theo role/label/size (4.2) — chỉ ẩn dòng, selection giữ nguyên
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return specList
    return specList.filter((s) => {
      const size = `${Math.round(s.box.w)}×${Math.round(s.box.h)}`
      return (
        s.role.toLowerCase().includes(q) ||
        s.label.toLowerCase().includes(q) ||
        size.includes(q)
      )
    })
  }, [specList, query])

  return (
    <div className="section">
      <h4>
        Cây phần tử <span className="muted">({visible.length}/{specList.length})</span>
      </h4>
      <input
        className="tree-filter"
        placeholder="Lọc: Text, 390×844…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Lọc cây phần tử"
      />
      <div className="tree">
        {visible.map((s) => {
          const active = selection !== null && selection.nodeId === nodeId && selection.specId === s.id
          return (
            <button
              type="button"
              key={s.id}
              className={`tree-row${active ? ' is-active' : ''}`}
              style={{ paddingLeft: 8 + s.depth * 11 }}
              onClick={() => onPick({ nodeId, specId: s.id })}
              title={s.label}
            >
              <span className={`dot role-${s.role.toLowerCase()}`} />
              <span className="tree-label">{s.label}</span>
              <span className="tree-size">
                {Math.round(s.box.w)}×{Math.round(s.box.h)}
              </span>
            </button>
          )
        })}
        {visible.length === 0 && (
          <p className="empty">Không khớp “{query}” — xóa lọc để xem toàn cây.</p>
        )}
      </div>
    </div>
  )
}
