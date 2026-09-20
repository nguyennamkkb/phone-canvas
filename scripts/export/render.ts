import type { Cdp } from './cdp.ts'
import { sleep } from './chrome.ts'

async function evaluate(cdp: Cdp, expression: string): Promise<unknown> {
  const result = await cdp.send<{ result: { value?: unknown }; exceptionDetails?: unknown }>(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
  )
  if (result.exceptionDetails) return undefined
  return result.result.value
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
export async function waitForHeight(cdp: Cdp, timeoutMs = 15_000): Promise<number> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const value = await evaluate(
      cdp,
      `(async () => {
         if (document.readyState !== 'complete') return -1
         if (document.fonts) await document.fonts.ready
         const device = document.querySelector('.device')
         if (!device) return -1
         return Math.ceil(device.getBoundingClientRect().height)
       })()`,
    ).catch(() => undefined)

    if (typeof value === 'number' && value > 0) return value
    await sleep(60)
  }
  throw new Error('screen never produced a layout')
}

export async function renderPng(
  cdp: Cdp,
  url: string,
  width: number,
  height: number,
  scale: number,
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

    // lay out at 1x first so we can measure the content-driven height
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    })

    await cdp.send('Page.navigate', { url })

    const contentHeight = await waitForHeight(cdp)

    // re-emulate at the exact content height * scale: the frame has no fixed
    // height, so this is the only way to capture a screen taller than the device
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: contentHeight,
      deviceScaleFactor: scale,
      mobile: false,
    })
    await sleep(80)

    const shot = await cdp.send<{ data: string }>('Page.captureScreenshot', { format: 'png' })
    return Buffer.from(shot.data, 'base64')
  } finally {
    cdp.attach(null)
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {})
  }
}
