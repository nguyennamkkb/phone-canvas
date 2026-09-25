import type { SpecNode } from '../../spec/types'

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

export function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
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

export function SpecDetail({ node, lookup }: { node: SpecNode; lookup: (raw: string) => string | null }) {
  const t = node.typography
  const su = node.surface
  // a leaf has no layout of its own; showing "hướng: none" is just noise
  const isContainer = ['VStack', 'HStack', 'ZStack', 'Block'].includes(node.role)
  // a computed color that matches a token reports its name: #7c9448 = --sage-deep
  const tn = (raw: string) => {
    const name = lookup(raw)
    return name ? `  = ${name}` : ''
  }

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
            value={
              node.image.tintHex
                ? `${node.image.tintHex}  ${node.image.tint}${tn(node.image.tint)}`
                : ''
            }
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
          <h4>Chữ</h4>
          <Field label="font" value={t.family} mono={false} />
          <Field label="size" value={`${px(t.size)} pt`} />
          <Field label="weight" value={`${t.weight} · ${t.weightName}`} />
          <Field label="line-height" value={`${px(t.lineHeight)}`} />
          <Field label="lineSpacing" value={`${px(t.lineSpacing)}  (SwiftUI)`} />
          <Field label="tracking" value={`${px(t.tracking)}`} />
          <Field label="align" value={t.align} mono={false} />
          <Field label="transform" value={t.transform === 'none' ? '' : t.transform} mono={false} />
          <Field label="color" value={`${t.colorHex}  ${t.color}${tn(t.color)}`} />
        </div>
      )}

      <div className="section">
        <h4>Nền & viền</h4>
        <Field
          label="background"
          value={
            su.backgroundAlpha === 0
              ? '—'
              : `${su.backgroundHex}  ${su.background}${tn(su.background)}`
          }
        />
        {su.backgroundKind === 'image' && (
          <Field label="nền-ảnh" value={`${su.backgroundImage}  →  Image("…")`} mono={false} />
        )}
        {su.backgroundKind === 'gradient' && (
          <Field label="nền-ảnh" value={`${su.backgroundImage}  →  LinearGradient (tự viết)`} mono={false} />
        )}
        <Field label="radius" value={su.radius ? `${px(su.radius)} pt` : ''} />
        <Field
          label="border"
          value={
            su.borderWidth
              ? `${px(su.borderWidth)} pt  ${su.borderHex || su.borderColor}${tn(su.borderColor)}`
              : ''
          }
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
