import type { Cdp } from './cdp.ts'
import { sleep } from './chrome.ts'

export async function evaluate(cdp: Cdp, expression: string): Promise<unknown> {
  const result = await cdp.send<{ result: { value?: unknown }; exceptionDetails?: unknown }>(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
  )
  if (result.exceptionDetails) return undefined
  return result.result.value
}

/** the device frame height and the height the content takes when un-clipped */
export type Heights = { deviceHeight: number; contentHeight: number }

/**
 * Un-clip stylesheet: remove the fixed device height and the viewport clip for
 * one measurement, while keeping the device's own minimum so a short screen
 * still measures at least the frame (the pre-v2 `min-height` behaviour).
 *
 * `.device` is fixed at the device height and `.viewport` clips, so neither
 * `.device.scrollHeight` nor the frame's bounding box can tell us how tall the
 * screen really is — the overflow lives inside `.screen`. Un-clipping for one
 * layout pass is the only reliable way to ask "how tall is this screen?".
 */
const UNCLIP_CSS =
  'html, body, .device { height: auto !important; min-height: var(--device-h) !important } .viewport { overflow: visible !important }'

async function layoutHeights(cdp: Cdp): Promise<Heights | null> {
  const value = await evaluate(
    cdp,
    `(async () => {
       if (document.readyState !== 'complete') return null
       if (document.fonts) await document.fonts.ready
       const device = document.querySelector('.device')
       if (!device) return null
       const deviceHeight = Math.ceil(device.getBoundingClientRect().height)
       if (deviceHeight <= 0) return null
       const style = document.createElement('style')
       style.textContent = ${JSON.stringify(UNCLIP_CSS)}
       document.head.appendChild(style)
       const contentHeight = Math.ceil(device.getBoundingClientRect().height)
       style.remove()
       return { deviceHeight, contentHeight }
     })()`,
  ).catch(() => undefined)
  if (!value || typeof value !== 'object') return null
  const heights = value as Heights
  if (!(heights.deviceHeight > 0) || !(heights.contentHeight > 0)) return null
  return heights
}

/**
 * Wait until the document has actually been laid out.
 *
 * Two traps here, both hit in practice:
 *  - the load event is not the same thing as having layout; until the browser
 *    has laid the frame out every rect is 0 and we would export nothing
 *  - webfonts land late and change wrapping, which changes the height
 * So: poll until the height is real, with fonts settled, rather than sleeping.
 */
export async function waitForHeights(cdp: Cdp, timeoutMs = 15_000): Promise<Heights> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const heights = await layoutHeights(cdp)
    if (heights) return heights
    await sleep(60)
  }
  throw new Error('screen never produced a layout')
}

/**
 * The device frame height only. Callers that capture the frame (or assert on
 * it) do not need the content height, and this reads the same as before v2.
 */
export async function waitForHeight(cdp: Cdp, timeoutMs = 15_000): Promise<number> {
  return (await waitForHeights(cdp, timeoutMs)).deviceHeight
}

async function emulate(cdp: Cdp, width: number, height: number, scale: number): Promise<void> {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: false,
  })
}

export async function renderPng(
  cdp: Cdp,
  url: string,
  width: number,
  height: number,
  scale: number,
  /**
   * Capture the whole document instead of the device frame. Default is the
   * frame: the device is height-fixed, so a capture is what the phone shows.
   * `full` un-clips the document and captures its content height (the pre-v2
   * behaviour that `npm run export -- --full` restores).
   */
  full = false,
): Promise<Buffer> {
  const { targetId } = await cdp.send<{ targetId: string }>('Target.createTarget', {
    url: 'about:blank',
  })
  const { sessionId } = await cdp.send<{ sessionId: string }>('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  cdp.attach(sessionId)

  try {
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')

    // lay out at 1x first so we can measure both heights
    await emulate(cdp, width, height, 1)
    await cdp.send('Page.navigate', { url })

    const heights = await waitForHeights(cdp)
    const captureHeight = full ? heights.contentHeight : heights.deviceHeight

    if (full) {
      // keep the document un-clipped so the tall capture is not cut off
      await evaluate(
        cdp,
        `(() => {
           const style = document.createElement('style')
           style.textContent = ${JSON.stringify(UNCLIP_CSS)}
           document.head.appendChild(style)
           return true
         })()`,
      )
    }

    await emulate(cdp, width, captureHeight, scale)
    await sleep(80)

    const shot = await cdp.send<{ data: string }>('Page.captureScreenshot', { format: 'png' })
    return Buffer.from(shot.data, 'base64')
  } finally {
    cdp.attach(null)
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {})
  }
}
