import { describe, expect, it } from 'vitest'
import { DEVICES, formChip, formFactorOf, getDevice, isKnownDevice } from './devices'

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

  it('labels form-factor from the declared form, phone chipless', () => {
    expect(formFactorOf('reference')).toBe('phone')
    expect(formFactorOf('ipad-11')).toBe('tablet')
    expect(formFactorOf('duo-cover')).toBe('cover')
    expect(formFactorOf('duo-inner')).toBe('inner')
    expect(formFactorOf('nope')).toBe('phone')
    expect(formChip('phone')).toBe('')
    expect(formChip('tablet')).toBe('Tablet')
    expect(formChip('cover')).toBe('Cover')
    expect(formChip('inner')).toBe('Inner')
  })

  it('declares the foldable Duo pair at their point sizes', () => {
    expect(getDevice('duo-cover')).toMatchObject({ width: 466, height: 678 })
    expect(getDevice('duo-inner')).toMatchObject({ width: 890, height: 626 })
    expect(isKnownDevice('duo-cover')).toBe(true)
    expect(isKnownDevice('duo-inner')).toBe(true)
  })
})
