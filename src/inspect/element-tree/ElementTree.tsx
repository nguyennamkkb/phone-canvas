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
  return (
    <div className="section">
      <h4>
        Cây phần tử <span className="muted">({specList.length})</span>
      </h4>
      <div className="tree">
        {specList.map((s) => {
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
      </div>
    </div>
  )
}
