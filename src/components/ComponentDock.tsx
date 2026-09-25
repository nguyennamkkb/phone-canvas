import { useEffect, useMemo, useRef, useState } from 'react'
import bridgeJs from '../extractor/bridge.js?raw'
import { composeScreenDoc } from '../extractor/compose'
import { componentsFor, stylesheetsFor } from '../extractor/assets'
import { DEFAULT_DEVICE_ID, DEVICES, getDevice, isKnownDevice } from '../frame/devices'
import { SCREEN_BY_ID } from '../screens'
import { BUILTIN_PROJECTS } from '../projects/builtin'
import { useInspector } from '../inspect/InspectorContext'
import { ElementTree } from '../inspect/element-tree/ElementTree'
import { SpecDetail } from '../inspect/spec-detail/SpecDetail'
import { tokenNameForColor } from '../tokens/tokens'
import type { ThemeMode } from '../tokens/tokens'
import { componentsOf } from './index'
import type { ComponentDef } from './index'
import { componentUsage } from './usage'

/**
 * Component catalog (component-system): every component of a project, with a
 * live preview rendered through the same compose/bridge pipeline a screen uses,
 * its usage in screens, and its SwiftUI spec.
 *
 * Preview iframes render at the real device width and are scaled down with a
 * CSS transform — the same "camera" the board uses — so the measured numbers
 * stay in points and match a screen exactly.
 */

/** scale a fixed-width stage down to the container width (never up) */
function useFitScale(width: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      if (w > 0) setScale(Math.min(1, w / width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])
  return { ref, scale }
}

const PREVIEW_DEVICE_PREFIX = 'pc.ui.compdock.device.'

/** project's first screen device (an iPad screen previews at iPad width) */
function defaultPreviewDevice(projectId: string): string {
  const project = BUILTIN_PROJECTS.find((p) => p.id === projectId)
  for (const sid of project?.screenIds ?? []) {
    const deviceId = SCREEN_BY_ID.get(sid)?.deviceId
    if (deviceId) return deviceId
  }
  return DEFAULT_DEVICE_ID
}

function loadPreviewDevice(projectId: string): string {
  try {
    const raw = localStorage.getItem(PREVIEW_DEVICE_PREFIX + projectId)
    if (raw && isKnownDevice(raw)) return raw
  } catch {
    /* private mode — fall through to the default */
  }
  const d = defaultPreviewDevice(projectId)
  return isKnownDevice(d) ? d : DEFAULT_DEVICE_ID
}

function ComponentPreview({
  projectId,
  component,
  theme,
  deviceId,
}: {
  projectId: string
  component: ComponentDef
  theme: ThemeMode
  deviceId: string
}) {
  const device = getDevice(deviceId)
  const [token] = useState(() => `c${Math.random().toString(36).slice(2, 10)}`)
  const frameId = `component:${projectId}:${component.id}`
  const frameRef = useRef<HTMLIFrameElement>(null)
  const { registerFrame, specs, sizes, selection, select } = useInspector()
  const { ref: clipRef, scale } = useFitScale(device.width)

  useEffect(() => {
    registerFrame(frameId, frameRef.current, token)
    return () => registerFrame(frameId, null, token)
  }, [frameId, registerFrame, token])

  const srcDoc = useMemo(
    () =>
      composeScreenDoc({
        html: component.html,
        device,
        stylesheets: stylesheetsFor(projectId),
        components: componentsFor(projectId),
        bridgeJs,
        nodeId: frameId,
        token,
        bare: true,
        theme,
      }),
    [component.html, device, projectId, token, theme, deviceId],
  )

  const specList = specs[frameId] ?? []
  const contentH = sizes[frameId] ?? 160
  const active = selection && selection.nodeId === frameId ? selection : null
  const selectedSpec = active ? (specList.find((s) => s.id === active.specId) ?? null) : null
  const lookup = (raw: string) => tokenNameForColor(projectId, raw, theme)

  return (
    <div className="component-preview">
      <div
        className="component-preview-clip"
        ref={clipRef}
        style={{ height: Math.round(contentH * scale) }}
      >
        <div
          className="component-preview-stage"
          style={{ width: device.width, height: contentH, transform: `scale(${scale})` }}
        >
          <iframe
            ref={frameRef}
            title={component.title}
            srcDoc={srcDoc}
            width={device.width}
            height={contentH}
            sandbox="allow-scripts"
          />
        </div>
      </div>
      {specList.length > 0 ? (
        <div className="component-spec">
          <ElementTree specList={specList} selection={active} nodeId={frameId} onPick={select} />
          {selectedSpec && <SpecDetail node={selectedSpec} lookup={lookup} />}
        </div>
      ) : (
        <p className="empty">Đang đọc DOM…</p>
      )}
    </div>
  )
}

export type ComponentDockProps = {
  projectId: string
  theme: ThemeMode
}

export function ComponentDock({ projectId, theme }: ComponentDockProps) {
  const components = useMemo(() => componentsOf(projectId), [projectId])
  const usage = useMemo(() => componentUsage(projectId), [projectId])
  const useById = useMemo(() => new Map(usage.map((u) => [u.id, u])), [usage])
  const [openId, setOpenId] = useState<string | null>(null)
  // preview width follows the consuming screens: a component used in an iPad
  // screen measures at iPad width. Remembered per project, never written to
  // board nodes.
  const [previewDevice, setPreviewDevice] = useState<string>(() => loadPreviewDevice(projectId))

  useEffect(() => {
    setPreviewDevice(loadPreviewDevice(projectId))
  }, [projectId])

  const pickPreviewDevice = (id: string) => {
    if (!isKnownDevice(id)) return
    setPreviewDevice(id)
    try {
      localStorage.setItem(PREVIEW_DEVICE_PREFIX + projectId, id)
    } catch {
      /* private mode — preview just becomes session-only */
    }
  }

  if (components.length === 0) {
    return (
      <div className="component-empty">
        <p>Dự án này chưa có component nào.</p>
        <p className="component-hint">
          Thêm <code>project/{projectId}/components/&lt;tên&gt;.html</code> và một entry trong{' '}
          <code>src/components/manifest.ts</code>, rồi chạy <code>npm run components:sync</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="component-catalog">
      <div className="component-preview-bar">
        <span className="field-key">Preview</span>
        <select
          value={previewDevice}
          onChange={(e) => pickPreviewDevice(e.target.value)}
          title="Chiều rộng preview component"
        >
          {DEVICES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      {components.map((c) => {
        const open = openId === c.id
        const u = useById.get(c.id)
        return (
          <div className={`component-item${open ? ' is-open' : ''}`} key={c.id}>
            <button
              type="button"
              className="component-row"
              onClick={() => setOpenId(open ? null : c.id)}
              title={u && u.screens.length > 0 ? `dùng ở: ${u.screens.join(', ')}` : 'chưa màn nào dùng'}
            >
              <span className="component-name">{c.title}</span>
              <code className="component-id">{c.id}</code>
              <span className="component-use">{u && u.count > 0 ? `${u.count} chỗ` : 'chưa dùng'}</span>
            </button>
            {open && <ComponentPreview projectId={projectId} component={c} theme={theme} deviceId={previewDevice} />}
          </div>
        )
      })}
    </div>
  )
}
