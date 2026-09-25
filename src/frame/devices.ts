/**
 * Device presets.
 *
 * All numbers are logical points (pt), which we treat as 1:1 with CSS px.
 * The screen iframe is always rendered at its natural size so that
 * `getBoundingClientRect()` inside it returns pt directly, at any canvas zoom.
 */
export type Device = {
  id: string
  name: string
  /** screen size in pt */
  width: number
  height: number
  /** hardware bezel around the screen, in px of chassis */
  bezel: number
  /** corner radius of the screen itself */
  radius: number
  /** top inset that the status bar occupies */
  safeTop: number
  /** bottom inset that the home indicator occupies (0 = none) */
  safeBottom: number
  island: 'dynamic' | 'notch' | 'none'
  /**
   * Form-factor label for the board chip. Declared per device (manifest-side
   * source of truth); a node that overrides its device in NodePicker follows
   * the resolved device automatically.
   */
  form: 'phone' | 'tablet' | 'cover' | 'inner'
}

export const DEVICES: Device[] = [
  {
    id: 'reference',
    form: 'phone',
    name: 'Reference 390×844',
    width: 390,
    height: 844,
    bezel: 12,
    radius: 44,
    safeTop: 59,
    safeBottom: 34,
    island: 'dynamic',
  },
  {
    id: 'iphone-16-pro',
    form: 'phone',
    name: 'iPhone 16 Pro',
    width: 402,
    height: 874,
    bezel: 11,
    radius: 50,
    safeTop: 62,
    safeBottom: 34,
    island: 'dynamic',
  },
  {
    id: 'iphone-se',
    form: 'phone',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    bezel: 14,
    radius: 20,
    safeTop: 20,
    safeBottom: 0,
    island: 'none',
  },
  {
    id: 'ipad-11',
    form: 'tablet',
    name: 'iPad 11″ · 820×1180',
    width: 820,
    height: 1180,
    bezel: 16,
    radius: 18,
    safeTop: 24,
    safeBottom: 20,
    island: 'none',
  },
  {
    id: 'ipad-mini',
    form: 'tablet',
    name: 'iPad mini · 744×1133',
    width: 744,
    height: 1133,
    bezel: 16,
    radius: 18,
    safeTop: 24,
    safeBottom: 20,
    island: 'none',
  },
  {
    id: 'duo-cover',
    form: 'cover',
    name: 'iPhone Duo · Cover 466×678',
    width: 466,
    height: 678,
    bezel: 12,
    radius: 30,
    safeTop: 44,
    safeBottom: 24,
    island: 'none',
  },
  {
    id: 'duo-inner',
    form: 'inner',
    name: 'iPhone Duo · Inner 890×626',
    width: 890,
    height: 626,
    bezel: 14,
    radius: 20,
    safeTop: 24,
    safeBottom: 20,
    island: 'none',
  },
]

export const DEFAULT_DEVICE_ID = 'reference'

export function getDevice(id: string): Device {
  return DEVICES.find((d) => d.id === id) ?? DEVICES[0]
}

/**
 * Strict membership check. `getDevice` falls back to reference silently (hot
 * paths depend on it), so callers that surface identity — board labels, load
 * warnings — use this to say the fallback happened instead of hiding it.
 */
export function isKnownDevice(id: string): boolean {
  return DEVICES.some((d) => d.id === id)
}

export type FormFactor = 'phone' | 'tablet' | 'cover' | 'inner'

/**
 * Board label source of truth. Declared `form` wins; a device without one
 * (or an unknown id, already covered by the P2 badge) is inferred by width
 * so future presets never render chipless by accident.
 */
export function formFactorOf(id: string): FormFactor {
  const found = DEVICES.find((d) => d.id === id)
  if (found?.form) return found.form
  const width = found ? found.width : getDevice(id).width
  return width >= 600 ? 'tablet' : 'phone'
}

/** short chip text for the board label — phone is the default, chipless */
export function formChip(form: FormFactor): string {
  return form === 'phone' ? '' : form === 'tablet' ? 'Tablet' : form === 'cover' ? 'Cover' : 'Inner'
}
