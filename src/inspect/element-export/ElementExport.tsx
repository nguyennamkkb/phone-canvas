import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SpecNode } from '../../spec/types'
import { Button } from '@/components/ui/button'

/**
 * Element-level export for the selected node (core-upgrade 3.1–3.4).
 *
 * The crop itself happens in Node: `POST /__pc/element/*` drives the same
 * pipeline `npm run locate` uses (compose → real bridge capture → CDP clip), so
 * what this panel writes is what the exporter would draw. This component owns
 * only the request shape, the controls, and the caching.
 *
 * Two rules borrowed from the rest of the panel: a disabled control always says
 * why (like `copyReason`), and a failure states the cause instead of leaving a
 * spinner (like the bridge dropped-counter).
 */

const ENDPOINT = '/__pc/element'

/** One request per distinct crop. Content-addressed by construction: the key IS the input. */
const thumbCache = new Map<string, string>()
const THUMB_CACHE_MAX = 24

function remember(key: string, dataUrl: string): void {
  thumbCache.set(key, dataUrl)
  // oldest-first eviction: Map preserves insertion order
  while (thumbCache.size > THUMB_CACHE_MAX) {
    const oldest = thumbCache.keys().next().value
    if (oldest === undefined) break
    thumbCache.delete(oldest)
  }
}

type CropResult = { ok: true; dataUrl: string } | { ok: false; error: string }

/** what `/__pc/element/golden` answers: the verdict plus both crops to look at */
type GoldenCompare = {
  key: string
  state: 'match' | 'mismatch' | 'missing'
  distance: number | null
  cropMatch: boolean
  specMatch: boolean | null
  before: string | null
  after: string
}

const GOLDEN_LABEL: Record<GoldenCompare['state'], string> = {
  match: '● khớp golden',
  mismatch: '● lệch golden',
  missing: '○ chưa có golden',
}

async function crop(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<CropResult> {
  try {
    const res = await fetch(`${ENDPOINT}/crop`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
    const json = (await res.json()) as {
      ok?: boolean
      dataUrl?: string
      error?: string
    }
    if (!res.ok || !json.ok || !json.dataUrl) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` }
    }
    return { ok: true, dataUrl: json.dataUrl }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export type ElementExportProps = {
  screenId: string
  deviceId: string
  theme: 'light' | 'dark'
  /** the element picked in the tree or by click — null disables everything */
  selected: SpecNode | null
  /** ancestor chain of the selection, root first (for the 1-level option) */
  ancestry: SpecNode[]
}

export function ElementExport({ screenId, deviceId, theme, selected, ancestry }: ElementExportProps) {
  const [padPt, setPadPt] = useState(24)
  const [padPct, setPadPct] = useState<number | null>(null)
  const [withAncestors, setWithAncestors] = useState(false)
  const [thumb, setThumb] = useState<{ key: string; dataUrl: string } | null>(null)
  const [thumbError, setThumbError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'crop' | 'export' | 'children' | 'golden' | 'goldenWrite' | null>(
    null,
  )
  const [written, setWritten] = useState<{ png: string; json: string }[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  // golden compare is on demand (never per selection change: it reads a file
  // and reports a verdict, which is a decision, not a preview)
  const [golden, setGolden] = useState<GoldenCompare | null>(null)
  const [goldenKey, setGoldenKey] = useState<string | null>(null)
  const [goldenError, setGoldenError] = useState<string | null>(null)

  const ancestorLevels = withAncestors ? 1 : 0
  const box = selected?.box ?? null

  const request = useMemo(() => {
    if (!box) return null
    return {
      screen: screenId,
      device: deviceId,
      theme,
      box,
      elementId: selected?.id,
      // `ancestry` is the chain root-first INCLUDING the element itself, so the
      // last entry is dropped: "gồm khung cha" must mean the parent, not the
      // element unioned with its own box (which is a silent no-op).
      ancestors: ancestry.slice(0, -1).map((a) => a.box),
      padPt,
      padPct,
      ancestorLevels,
    }
  }, [box, screenId, deviceId, theme, selected?.id, ancestry, padPt, padPct, ancestorLevels])

  const key = request ? JSON.stringify(request) : null

  // Live thumbnail: debounced, cached by the request itself, and every stale
  // response is dropped — a fast tree walk must not paint an old element.
  const seq = useRef(0)
  useEffect(() => {
    if (!request || !key) {
      setThumb(null)
      setThumbError(null)
      return
    }
    const hit = thumbCache.get(key)
    if (hit) {
      setThumb({ key, dataUrl: hit })
      setThumbError(null)
      return
    }
    const mine = ++seq.current
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      // same crop the export writes, only at scale 1 — the preview must show
      // exactly what pad %/ancestors do to the region, or the controls are blind
      void crop({ ...request, scale: 1 }, controller.signal)
        .then((result) => {
          if (mine !== seq.current) return
          if (result.ok) {
            remember(key, result.dataUrl)
            setThumb({ key, dataUrl: result.dataUrl })
            setThumbError(null)
          } else {
            setThumbError(result.error)
          }
        })
        .catch(() => {
          /* aborted by the next selection — nothing to report */
        })
    }, 220)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [request, key])

  const run = useCallback(
    async (kind: 'export' | 'children') => {
      if (!request) return
      setBusy(kind === 'export' ? 'crop' : 'children')
      setActionError(null)
      setWritten([])
      try {
        const res = await fetch(`${ENDPOINT}/${kind}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...request, scale: 2 }),
        })
        const json = (await res.json()) as {
          ok?: boolean
          files?: Array<{ png: string; json: string }>
          error?: string
        }
        if (!res.ok || !json.ok) {
          setActionError(json.error ?? `HTTP ${res.status}`)
          return
        }
        setWritten(json.files ?? [])
      } catch (error) {
        setActionError(error instanceof Error ? error.message : String(error))
      } finally {
        setBusy(null)
      }
    },
    [request],
  )

  /**
   * Compare the current crop against the stored element golden, or bless the
   * current crop as the new golden (write) and then compare — the verdict after
   * a write is always `khớp`, so the panel proves the write landed instead of
   * claiming it.
   */
  const runGolden = useCallback(
    async (write: boolean) => {
      if (!request) return
      setBusy(write ? 'goldenWrite' : 'golden')
      setGoldenError(null)
      try {
        const post = async (route: string) => {
          const res = await fetch(`${ENDPOINT}${route}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ ...request, scale: 2 }),
          })
          const json = (await res.json()) as Record<string, unknown>
          if (!res.ok || json.ok !== true) {
            throw new Error(typeof json.error === 'string' ? json.error : `HTTP ${res.status}`)
          }
          return json
        }
        if (write) await post('/golden/write')
        const verdict = (await post('/golden')) as unknown as GoldenCompare
        setGolden(verdict)
        setGoldenKey(key)
      } catch (error) {
        setGolden(null)
        setGoldenError(error instanceof Error ? error.message : String(error))
      } finally {
        setBusy(null)
      }
    },
    [request, key],
  )

  const copyPath = (path: string) => {
    void navigator.clipboard.writeText(path).then(() => {
      setCopied(path)
      window.setTimeout(() => setCopied(null), 1200)
    })
  }

  const disabledReason = !selected
    ? 'Chọn một element trong cây hoặc bật Đo đạc rồi click vào màn hình'
    : null

  return (
    <div className="element-export flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">Element đang chọn</span>
        {selected && (
          <span className="text-xs text-muted-foreground" title={selected.swiftUiShape}>
            {selected.role} · {Math.round(selected.box.w)}×{Math.round(selected.box.h)} pt
          </span>
        )}
      </div>

      {disabledReason && <p className="empty text-xs">{disabledReason}</p>}

      {selected && (
        <>
          <div className="element-thumb" title="Crop thật của element (scale 1, pad 8 pt)">
            {thumb && thumb.key === key ? (
              <img src={thumb.dataUrl} alt={`Crop của ${selected.label}`} />
            ) : (
              <span className="empty text-xs">
                {thumbError ? `Không crop được: ${thumbError}` : 'Đang crop…'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="flex items-center gap-1">
              pad
              <input
                type="number"
                min={0}
                max={200}
                value={padPt}
                onChange={(e) => {
                  setPadPt(Math.max(0, Number(e.target.value) || 0))
                  setPadPct(null)
                }}
                className="w-14 rounded border px-1 py-0.5"
                aria-label="Pad theo pt"
              />
              pt
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={padPct !== null}
                onChange={(e) => setPadPct(e.target.checked ? 0.1 : null)}
              />
              pad % cạnh dài
            </label>
            {padPct !== null && (
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round(padPct * 100)}
                onChange={(e) => setPadPct(Math.max(0, Number(e.target.value) || 0) / 100)}
                className="w-14 rounded border px-1 py-0.5"
                aria-label="Pad theo phần trăm cạnh dài"
              />
            )}
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={withAncestors}
                onChange={(e) => setWithAncestors(e.target.checked)}
              />
              gồm khung cha (1 cấp)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy !== null}
              title="Ghi PNG crop + JSON spec vào project/<id>/exports"
              onClick={() => void run('export')}
            >
              {busy === 'crop' ? 'Đang xuất…' : 'Xuất element này'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ghost"
              disabled={busy !== null}
              title="Mỗi con một PNG + JSON (tên theo data-asset/class)"
              onClick={() => void run('children')}
            >
              {busy === 'children' ? 'Đang xuất…' : 'Xuất children'}
            </Button>
          </div>

          {/* Golden cấp element (4.1/4.2): so crop hiện tại với bản đã chốt,
              và cho xem before/after của ĐÚNG element này — không phải cả màn. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold">Golden element</span>
            {golden && goldenKey === key && (
              <span
                className={
                  golden.state === 'match'
                    ? 'element-golden is-match'
                    : golden.state === 'mismatch'
                      ? 'element-golden is-mismatch'
                      : 'element-golden'
                }
                title={
                  golden.distance === null
                    ? GOLDEN_LABEL[golden.state]
                    : `${GOLDEN_LABEL[golden.state]} — Hamming ${golden.distance} (ngưỡng 4)`
                }
              >
                {GOLDEN_LABEL[golden.state]}
                {golden.distance !== null && ` · d=${golden.distance}`}
                {golden.specMatch === false && ' · spec lệch'}
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ghost"
              disabled={busy !== null}
              title="So crop hiện tại với golden đã chốt (hash crop + spec)"
              onClick={() => void runGolden(false)}
            >
              {busy === 'golden' ? 'Đang so…' : 'So sánh golden'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ghost"
              disabled={busy !== null}
              title="Chốt crop hiện tại làm golden cho element này"
              onClick={() => void runGolden(true)}
            >
              {busy === 'goldenWrite' ? 'Đang ghi…' : 'Ghi golden'}
            </Button>
          </div>

          {goldenError && <p className="empty text-xs">Golden: {goldenError}</p>}

          {golden && goldenKey === key && golden.state !== 'missing' && (
            <div className="element-golden-diff" title="golden ↔ hiện tại">
              <figure>
                <img src={golden.before ?? golden.after} alt="Golden đã chốt" />
                <figcaption>golden</figcaption>
              </figure>
              <figure>
                <img src={golden.after} alt="Crop hiện tại" />
                <figcaption>hiện tại</figcaption>
              </figure>
            </div>
          )}

          {actionError && <p className="empty text-xs">Lỗi xuất: {actionError}</p>}
          {written.length > 0 && (
            <ul className="element-export-files flex flex-col gap-0.5 text-xs">
              {written.map((file) => (
                <li key={file.png}>
                  <button
                    type="button"
                    className="text-left"
                    title="Click để chép đường dẫn"
                    onClick={() => copyPath(file.png)}
                  >
                    {copied === file.png ? 'Đã chép: ' : ''}
                    <code>{file.png}</code>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
