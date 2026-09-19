import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { buildSpec } from '../spec/infer'
import type { RawNode, SpecNode } from '../spec/types'

export type Selection = { nodeId: string; specId: string }

type InspectorValue = {
  /** spec tree per canvas node, keyed by node id */
  specs: Record<string, SpecNode[]>
  /** content height per canvas node, reported by the screen itself */
  sizes: Record<string, number>
  selection: Selection | null
  select: (sel: Selection | null) => void
  registerFrame: (nodeId: string, el: HTMLIFrameElement | null, token: string) => void
  /** ancestor chain of the current selection, root first */
  ancestry: SpecNode[]
  childrenOf: (id: string) => SpecNode[]
  selected: SpecNode | null
}

const InspectorContext = createContext<InspectorValue | null>(null)

type Incoming = {
  pc?: boolean
  type?: string
  nodeId?: string
  token?: string
  id?: string | null
  value?: number
  nodes?: RawNode[]
}

type FrameEntry = { el: HTMLIFrameElement; token: string }

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [specs, setSpecs] = useState<Record<string, SpecNode[]>>({})
  const [sizes, setSizes] = useState<Record<string, number>>({})
  const [selection, setSelection] = useState<Selection | null>(null)
  const frames = useRef(new Map<string, FrameEntry>())

  const registerFrame = useCallback(
    (nodeId: string, el: HTMLIFrameElement | null, token: string) => {
      if (el) frames.current.set(nodeId, { el, token })
      else frames.current.delete(nodeId)
    },
    [],
  )

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as Incoming | null
      if (!data || data.pc !== true || typeof data.nodeId !== 'string') return

      // a sandboxed iframe has an opaque origin and its WindowProxy is not a
      // stable identity, so the per-node token is what actually routes this
      const entry = frames.current.get(data.nodeId)
      if (!entry || entry.token !== data.token) return

      if (data.type === 'spec' && Array.isArray(data.nodes)) {
        const spec = buildSpec(data.nodes)
        setSpecs((prev) => ({ ...prev, [data.nodeId as string]: spec }))
      } else if (data.type === 'height') {
        const h = typeof data.value === 'number' ? Math.round(data.value) : 0
        if (h > 0) {
          setSizes((prev) => (prev[data.nodeId as string] === h ? prev : { ...prev, [data.nodeId as string]: h }))
        }
      } else if (data.type === 'select') {
        setSelection(data.id ? { nodeId: data.nodeId, specId: data.id } : null)
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // mirror the selection back into every frame so panel-driven picks highlight
  useEffect(() => {
    frames.current.forEach(({ el, token }, nodeId) => {
      const id = selection && selection.nodeId === nodeId ? selection.specId : null
      el.contentWindow?.postMessage({ pc: true, type: 'selectFromPanel', id, token }, '*')
    })
  }, [selection, specs])

  const select = useCallback((sel: Selection | null) => setSelection(sel), [])

  const selectedList = selection ? (specs[selection.nodeId] ?? []) : []
  const selected = useMemo(
    () => selectedList.find((s) => s.id === selection?.specId) ?? null,
    [selectedList, selection],
  )

  const byId = useMemo(() => new Map(selectedList.map((s) => [s.id, s])), [selectedList])

  const ancestry = useMemo(() => {
    const chain: SpecNode[] = []
    let cur = selected
    let guard = 0
    while (cur && guard < 64) {
      chain.unshift(cur)
      cur = cur.parent ? (byId.get(cur.parent) ?? null) : null
      guard++
    }
    return chain
  }, [selected, byId])

  const childrenOf = useCallback(
    (id: string) => selectedList.filter((s) => s.parent === id),
    [selectedList],
  )

  const value = useMemo<InspectorValue>(
    () => ({ specs, sizes, selection, select, registerFrame, ancestry, childrenOf, selected }),
    [specs, sizes, selection, select, registerFrame, ancestry, childrenOf, selected],
  )

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>
}

export function useInspector(): InspectorValue {
  const ctx = useContext(InspectorContext)
  if (!ctx) throw new Error('useInspector must be used inside <InspectorProvider>')
  return ctx
}
