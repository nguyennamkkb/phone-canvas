import { useInspector } from './InspectorContext'
import type { PhoneNodeData, PhoneFlowNode } from '../canvas/PhoneNode'
import { DEVICES } from '../frame/devices'
import { SCREENS } from '../screens'
import type { SpecNode } from '../spec/types'

export type SpecPanelProps = {
  nodes: PhoneFlowNode[]
  selectedNodeId: string | null
  onPatchNode: (id: string, patch: Partial<PhoneNodeData>) => void
}

const px = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2))

function edgesLabel(e: { top: number; right: number; bottom: number; left: number }): string {
  const { top, right, bottom, left } = e
  if (top === right && right === bottom && bottom === left) return `all ${px(top)}`
  const parts: string[] = []
  if (top) parts.push(`top ${px(top)}`)
  if (right) parts.push(`right ${px(right)}`)
  if (bottom) parts.push(`bottom ${px(bottom)}`)
  if (left) parts.push(`left ${px(left)}`)
  return parts.length ? parts.join('  ') : '0'
}

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  if (!value || value === '—') return null
  return (
    <div className="field">
      <span className="field-key">{label}</span>
      <span className={mono ? 'field-val mono' : 'field-val'} title={value}>
        {value}
      </span>
    </div>
  )
}

function Detail({ node }: { node: SpecNode }) {
  const t = node.typography
  const su = node.surface
  // a leaf has no layout of its own; showing "hướng: none" is just noise
  const isContainer = ['VStack', 'HStack', 'ZStack', 'Block'].includes(node.role)

  return (
    <div className="detail">
      <div className="detail-head">
        <span className="detail-tag">{node.tag}</span>
        <code className="detail-shape">{node.swiftUiShape}</code>
      </div>

      {node.role === 'Block' && (
        <p className="warn">
          Phần tử này dùng layout ngoài subset (không phải flex). Sẽ không map được sang
          SwiftUI — nên sửa HTML về flex.
        </p>
      )}

      {node.image && (
        <div className="section">
          <h4>Icon / ảnh</h4>
          <Field label="loại" value={node.image.kind} mono={false} />
          <Field label="nguồn" value={node.image.source} />
          <Field label="SF Symbol" value={node.image.symbol} />
          <Field label="asset" value={node.image.kind === 'asset' ? node.image.asset : ''} mono={false} />
          <Field
            label="tint"
            value={node.image.tintHex ? `${node.image.tintHex}  ${node.image.tint}` : ''}
          />
          {node.image.kind === 'inline' && (
            <p className="warn">
              Là &lt;svg&gt; viết thẳng trong HTML nên không có tên. Dùng
              &lt;span class=&quot;icon&quot; data-symbol=&quot;…&quot;&gt; để spec nói được tên SF
              Symbol.
            </p>
          )}
          {node.image.externalMask && (
            <p className="warn">
              Mask trỏ tới URL thay vì data URI. Iframe sandbox có origin opaque nên fetch này bị
              chặn, và mask tải thất bại thì bị coi là transparent black — icon sẽ biến mất chứ
              không báo lỗi. Thêm glyph vào <code>scripts/icons.ts</code> rồi chạy{' '}
              <code>npm run icons</code>.
            </p>
          )}
          {node.image.unmappedSymbol && (
            <p className="warn">
              <code>data-symbol=&quot;{node.image.symbol}&quot;</code> không có trong bộ đã sinh —
              mask không được áp, nên phần tử tô kín nền và hiện ra thành một ô vuông đặc. Thêm
              glyph vào <code>SYMBOLS</code> trong <code>scripts/icons.ts</code> rồi chạy{' '}
              <code>npm run icons</code>.
            </p>
          )}
        </div>
      )}

      <div className="section">
        <h4>Khung (box)</h4>
        <Field label="x / y" value={`${px(node.box.x)} , ${px(node.box.y)}`} />
        <Field label="w × h" value={`${px(node.box.w)} × ${px(node.box.h)}`} />
      </div>

      {isContainer && (
        <div className="section">
          <h4>Layout</h4>
          <Field label="hướng" value={node.layout.direction} mono={false} />
          <Field label="spacing (gap)" value={String(node.layout.gap)} />
          <Field label="justify" value={node.layout.justify} mono={false} />
          <Field label="align-items" value={node.layout.align} mono={false} />
          <Field label="align-self" value={node.layout.selfAlign} mono={false} />
          {node.layout.layer && (
            <Field label="layer" value="đặt theo toạ độ → ZStack + .offset" mono={false} />
          )}
          {node.layout.wrap && <Field label="wrap" value="true" mono={false} />}
          {node.scrollable && <Field label="cuộn được" value="ScrollView" mono={false} />}
        </div>
      )}

      <div className="section">
        <h4>Padding</h4>
        <Field label="padding" value={edgesLabel(node.padding)} />
      </div>

      {node.size.grow > 0 && (
        <div className="section">
          <h4>Kích thước</h4>
          <Field label="flex-grow" value={String(node.size.grow)} />
          <Field
            label="fill"
            value={[node.size.fillWidth ? 'width' : '', node.size.fillHeight ? 'height' : '']
              .filter(Boolean)
              .join(' + ')}
            mono={false}
          />
        </div>
      )}

      {t && (
        <div className="section">
          <h4>Chữ</h4>          <Field label="font" value={t.family} mono={false} />
          <Field label="size" value={`${px(t.size)} pt`} />
          <Field label="weight" value={`${t.weight} · ${t.weightName}`} />
          <Field label="line-height" value={`${px(t.lineHeight)}`} />
          <Field label="lineSpacing" value={`${px(t.lineSpacing)}  (SwiftUI)`} />
          <Field label="tracking" value={`${px(t.tracking)}`} />
          <Field label="align" value={t.align} mono={false} />
          <Field label="transform" value={t.transform === 'none' ? '' : t.transform} mono={false} />
          <Field label="color" value={`${t.colorHex}  ${t.color}`} />
        </div>
      )}

      <div className="section">
        <h4>Nền & viền</h4>
        <Field label="background" value={su.backgroundAlpha === 0 ? '—' : `${su.backgroundHex}  ${su.background}`} />
        <Field label="radius" value={su.radius ? `${px(su.radius)} pt` : ''} />
        <Field
          label="border"
          value={su.borderWidth ? `${px(su.borderWidth)} pt  ${su.borderHex || su.borderColor}` : ''}
        />
        <Field label="shadow" value={su.shadow === 'none' ? '' : su.shadow} />
      </div>

      {node.text && (
        <div className="section">
          <h4>Nội dung</h4>
          <p className="text-preview">{node.text}</p>
        </div>
      )}
    </div>
  )
}

export function SpecPanel({ nodes, selectedNodeId, onPatchNode }: SpecPanelProps) {
  const { specs, selection, select, selected } = useInspector()

  const node = nodes.find((n) => n.id === selectedNodeId) ?? null
  const specList = selectedNodeId ? (specs[selectedNodeId] ?? []) : []

  const hasSpec = specList.length > 0

  const copySpec = () => {
    const payload = selected
      ? { selectedElement: selected, screen: selectedNodeId }
      : { screen: selectedNodeId, elements: specList }
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
  }

  return (
    <aside className="panel">
      <header className="panel-head">
        <h2>
          Thông số <span className="muted">SwiftUI</span>
        </h2>
        <button type="button" className="ghost" onClick={copySpec} disabled={!hasSpec}>
          Copy JSON
        </button>
      </header>

      <div className="panel-body">
        {!node && (
          <p className="empty">
            Chọn một màn hình trên bảng (chế độ <b>Di chuyển</b>), rồi bật <b>Đo đạc</b> và
            click vào từng phần tử.
          </p>
        )}

        {node && (
          <div className="section node-picker">
            <div className="picker-row">
              <span className="field-key">Màn hình</span>
              <select
                value={node.data.screenId}
                onChange={(e) => onPatchNode(node.id, { screenId: e.target.value })}
              >
                {SCREENS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="picker-row">
              <span className="field-key">Thiết bị</span>
              <select
                value={node.data.deviceId}
                onChange={(e) => onPatchNode(node.id, { deviceId: e.target.value })}
              >
                {DEVICES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {node && !hasSpec && <p className="empty">Đang đọc DOM…</p>}

        {hasSpec && (
          <>
            <div className="section">
              <h4>
                Cây phần tử <span className="muted">({specList.length})</span>
              </h4>
              <div className="tree">
                {specList.map((s) => {
                  const active =
                    selection !== null && selection.nodeId === node?.id && selection.specId === s.id
                  return (
                    <button
                      type="button"
                      key={s.id}
                      className={`tree-row${active ? ' is-active' : ''}`}
                      style={{ paddingLeft: 8 + s.depth * 11 }}
                      onClick={() => node && select({ nodeId: node.id, specId: s.id })}
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

            {selected ? (
              <Detail node={selected} />
            ) : (
              <p className="empty">
                Chọn một dòng trong cây, hoặc bật <b>Đo đạc</b> rồi click trực tiếp vào màn
                hình.
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  )
}
