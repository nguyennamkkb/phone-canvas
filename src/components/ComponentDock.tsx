import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import bridgeJs from '../extractor/bridge.js?raw'
import { composeScreenDoc } from '../extractor/compose'
import { componentsFor, stylesheetsFor } from '../extractor/assets'
import { DEFAULT_DEVICE_ID, DEVICES, getDevice, isKnownDevice } from '../frame/devices'
import { SCREEN_BY_ID } from '../screens'
import { BUILTIN_PROJECTS } from '../projects/projects'
import { useInspector } from '../inspect/InspectorContext'
import { ElementTree } from '../inspect/element-tree/ElementTree'
import { SpecDetail } from '../inspect/spec-detail/SpecDetail'
import { tokenNameForColor } from '../tokens/tokens'
import type { ThemeMode } from '../tokens/tokens'
import { componentsOf } from './index'
import type { ComponentDef } from './index'
import { componentUsage } from './usage'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

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
            scrolling="no"
            style={{ overflow: 'hidden' }}
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
          Thêm <code>project/{projectId}/components/&lt;tên&gt;.html</code> là xong — component id
          chính là tên file; board thấy ngay khi reload, không cần đăng ký.
        </p>
      </div>
    )
  }

  return (
    <div className="component-catalog flex flex-col gap-2">
      <div className="component-preview-bar flex items-center gap-2">
        <span className="field-key text-xs text-muted-foreground">Preview</span>
        <Select value={previewDevice} onValueChange={pickPreviewDevice}>
          <SelectTrigger className="h-8 w-44" title="Chiều rộng preview component">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEVICES.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {components.map((c) => {
        const open = openId === c.id
        const u = useById.get(c.id)
        const used = !!u && u.count > 0
        return (
          <Card key={c.id} className={cn('component-item py-0', open && 'is-open')}>
            <Collapsible open={open} onOpenChange={(v) => setOpenId(v ? c.id : null)}>
              <CardHeader className="p-0">
                <CollapsibleTrigger
                  className="component-row flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent"
                  title={u && u.screens.length > 0 ? `dùng ở: ${u.screens.join(', ')}` : 'chưa màn nào dùng'}
                >
                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 transition-transform', !open && '-rotate-90')}
                  />
                  <span className="component-name min-w-0 flex-1 truncate text-sm font-medium">{c.title}</span>
                  <code className="component-id shrink-0 font-mono text-xs text-muted-foreground">{c.id}</code>
                  <Badge variant="secondary" className="component-use shrink-0">
                    {used ? `${u.count} chỗ` : 'chưa dùng'}
                  </Badge>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="px-2 pb-2">
                  <ComponentPreview projectId={projectId} component={c} theme={theme} deviceId={previewDevice} />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )
      })}
    </div>
  )
}
