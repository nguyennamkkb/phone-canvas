import { useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'
import type { SpecNode } from '../../spec/types'
import { DRIFT_ROW_CAP, diffSpecs, driftCounts, type DriftKind, type DriftRow } from './compare'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

/** one board screen the panel can compare — board order is the order given */
export type CompareScreen = { nodeId: string; screenId: string; title: string }

export type CompareSpecsProps = {
  screens: CompareScreen[]
  /** interpreted trees by board node id; a missing/empty entry means "still reading the DOM" */
  specs: Record<string, SpecNode[]>
}

/** short Vietnamese label per drift kind — the summary line is read at a glance */
const KIND_LABEL: Record<DriftKind, string> = {
  role: 'vai trò',
  box: 'kích thước',
  gap: 'spacing',
  padding: 'padding',
  fontSize: 'size',
  fontWeight: 'weight',
  lineHeight: 'line-height',
  letterSpacing: 'tracking',
  radius: 'radius',
  color: 'màu chữ',
  background: 'nền',
  text: 'nội dung',
}

/** `null` is "không có" on that side — shown as an em dash, never as the word "null" */
const shown = (v: string | null): string => (v === null ? '—' : v)

function DriftPair({ row }: { row: DriftRow }): JSX.Element {
  return (
    <span className="spec-compare-pair" title={`${shown(row.a)} → ${shown(row.b)}`}>
      <span className={`spec-compare-val is-a${row.a === null ? ' is-null' : ''}`}>{shown(row.a)}</span>
      <span className="spec-compare-arrow">→</span>
      <span className={`spec-compare-val is-b${row.b === null ? ' is-null' : ''}`}>{shown(row.b)}</span>
    </span>
  )
}

/**
 * Drift board between two mounted screens (core-upgrade 4.3/4.4).
 *
 * The spec trees already sit in the board context, so comparing two of them is
 * pure derivation — it belongs here, next to the tree and the detail panel,
 * rather than in a separate tool. Screens without a spec are still selectable:
 * the panel then states that the DOM is still being read instead of silently
 * comparing against nothing.
 */
export function CompareSpecs({ screens, specs }: CompareSpecsProps): JSX.Element {
  // default to the first two screens that already have a spec, in board order;
  // a screen without a spec is only picked when there is nothing better
  const defaults = useMemo(() => {
    const read = screens.filter((s) => (specs[s.nodeId]?.length ?? 0) > 0)
    const first = read[0]?.nodeId ?? screens[0]?.nodeId ?? ''
    const second = read[1]?.nodeId ?? screens.find((s) => s.nodeId !== first)?.nodeId ?? ''
    return { first, second }
  }, [screens, specs])

  const [aId, setAId] = useState(defaults.first)
  const [bId, setBId] = useState(defaults.second)
  // 200 rows of detail would bury the tree and the element export below them;
  // the summary is the signal, the rows are drill-down
  const [showRows, setShowRows] = useState(false)

  useEffect(() => {
    // the board changes under us (screen added/removed): drop a selection that is gone
    setAId((prev) => (screens.some((s) => s.nodeId === prev) ? prev : defaults.first))
    setBId((prev) => (screens.some((s) => s.nodeId === prev) ? prev : defaults.second))
  }, [screens, defaults.first, defaults.second])

  const specA = specs[aId] ?? []
  const specB = specs[bId] ?? []
  const rows = useMemo(
    () => (specA.length > 0 && specB.length > 0 ? diffSpecs(specA, specB) : []),
    [specA, specB],
  )
  const counts = useMemo(() => driftCounts(rows), [rows])

  const titleOf = (id: string) => screens.find((s) => s.nodeId === id)?.title ?? id

  if (screens.length < 2) {
    return (
      <div className="section spec-compare">
        <h4>
          So lệch hai màn <span className="muted">(drift)</span>
        </h4>
        <p className="empty">
          {screens.length === 0
            ? 'Bảng chưa có màn nào — cần ít nhất 2 màn để so lệch.'
            : 'Bảng mới có 1 màn — cần ít nhất 2 màn để so lệch. Thêm màn rồi mở lại mục này.'}
        </p>
      </div>
    )
  }

  const pickRow = (label: string, value: string, onChange: (v: string) => void) => (
    <div className="picker-row">
      <span className="field-key">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {screens.map((s) => (
            <SelectItem key={s.nodeId} value={s.nodeId}>
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const ready = specA.length > 0 && specB.length > 0
  // picking the same screen twice is "nothing to compare", not "no drift"
  const identical = ready && rows.length === 0 && aId !== bId

  return (
    <div className="section spec-compare">
      <h4>
        So lệch hai màn <span className="muted">(drift)</span>
      </h4>

      {pickRow('Màn A', aId, setAId)}
      {pickRow('Màn B', bId, setBId)}

      {aId === bId && <p className="empty">Đang chọn cùng một màn — chọn màn B khác để so.</p>}

      {!ready && aId !== bId && (
        <p className="empty">
          Đang đọc DOM… — màn {specA.length === 0 ? `A (“${titleOf(aId)}”)` : `B (“${titleOf(bId)}”)`}{' '}
          chưa có spec nên chưa so được.
        </p>
      )}

      {identical && <p className="empty">Hai màn không lệch: mọi field đã so đều trùng nhau.</p>}

      {ready && rows.length > 0 && (
        <>
          <p className="spec-compare-summary">
            <b>{rows.length}</b> dòng lệch —{' '}
            {counts.map((c) => `${c.count} ${KIND_LABEL[c.kind]}`).join(' · ')}
          </p>

          {rows.length >= DRIFT_ROW_CAP && (
            <p className="spec-compare-note">
              Chỉ so {DRIFT_ROW_CAP} dòng đầu — cây dài hơn mức này thường là ghép cặp sai, nên
              phần còn lại bị bỏ qua.
            </p>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ghost"
            onClick={() => setShowRows((v) => !v)}
          >
            {showRows ? 'Thu gọn dòng lệch' : `Xem ${rows.length} dòng lệch`}
          </Button>

          {showRows &&
            counts.map((c) => (
              <div className="spec-compare-group" key={c.kind}>
                <h5 className="spec-compare-kind">
                  {KIND_LABEL[c.kind]} <span className="muted">({c.count})</span>
                </h5>
                {rows
                  .filter((r) => r.kind === c.kind)
                  .map((r, i) => (
                    <div className="spec-compare-row" key={`${r.kind}-${i}`}>
                      <span className="spec-compare-path" title={r.path}>
                        {r.path}
                      </span>
                      <DriftPair row={r} />
                    </div>
                  ))}
              </div>
            ))}
        </>
      )}
    </div>
  )
}
