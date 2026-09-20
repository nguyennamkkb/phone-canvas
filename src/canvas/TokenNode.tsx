import { memo, useMemo } from 'react'
import type { Node, NodeProps } from '@xyflow/react'
import { tokensOf } from '../tokens/tokens'
import type { TokenGroup } from '../tokens/tokens'
import type { PhoneFlowNode } from './PhoneNode'

/** everything that can sit on a project board */
export type BoardNode = PhoneFlowNode | TokenFlowNode

export type TokenNodeData = {
  projectId: string
  title: string
}

export type TokenFlowNode = Node<TokenNodeData, 'token'>

const GROUPS: Array<{ id: TokenGroup; title: string }> = [
  { id: 'color', title: 'Màu · sáng / tối' },
  { id: 'spacing', title: 'Khoảng cách' },
  { id: 'radius', title: 'Bo góc' },
  { id: 'type', title: 'Chữ' },
]

function TokenNodeInner({ data }: NodeProps) {
  const d = data as unknown as TokenNodeData
  const tokens = useMemo(() => tokensOf(d.projectId), [d.projectId])
  const colors = tokens.filter((t) => t.group === 'color')

  return (
    <div className="token-node">
      <div className="token-label">
        <span className="token-label-title">Design tokens · {d.title}</span>
        <span className="token-label-size">{tokens.length} biến</span>
      </div>

      <div className="token-card nodrag">
        {GROUPS.map((g) => {
          const list = tokens.filter((t) => t.group === g.id)
          if (list.length === 0) return null
          return (
            <div className="token-section" key={g.id}>
              <h4>{g.title}</h4>
              {g.id === 'color' ? (
                <div className="token-colors">
                  {list.map((t) => (
                    <div
                      className="token-row"
                      key={t.name}
                      title={`${t.name}\nsáng: ${t.light}\ntối: ${t.dark}`}
                    >
                      <span
                        className="token-swatch"
                        style={{
                          background: `linear-gradient(90deg, ${t.light} 50%, ${t.dark} 50%)`,
                        }}
                      />
                      <code className="token-name">{t.name}</code>
                      <span className="token-val">{t.light}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="token-grid">
                  {list.map((t) => (
                    <div className="token-cell" key={t.name} title={`${t.name}: ${t.light}`}>
                      <code className="token-name">{t.name}</code>
                      <span className="token-val">{t.light}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {colors.length === 0 && <p className="token-empty">Chưa đọc được token nào.</p>}
      </div>
    </div>
  )
}

export const TokenNode = memo(TokenNodeInner)
