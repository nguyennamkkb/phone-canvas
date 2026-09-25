import { describe, expect, it } from 'vitest'
import { DEVICES, getDevice, isKnownDevice } from './devices'

describe('devices', () => {
  it('knows every declared device id', () => {
    for (const d of DEVICES) expect(isKnownDevice(d.id)).toBe(true)
    expect(isKnownDevice('ipad-11')).toBe(true)
    expect(isKnownDevice('iphone-15')).toBe(false)
    expect(isKnownDevice('')).toBe(false)
  })

  it('falls back to reference for unknown ids (callers warn via isKnownDevice)', () => {
    expect(getDevice('iphone-15').id).toBe('reference')
    expect(getDevice('ipad-11').width).toBe(820)
  })
})
