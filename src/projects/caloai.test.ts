import { describe, expect, it } from 'vitest'
import { SCREEN_BY_ID } from '../screens'
import { BUILTIN_PROJECTS } from './builtin'
import { resolveScreens } from './projects'
import { rawIds } from '../screens/generated'

const EXPECTED = ['c01-splash','c02-welcome','c03-goal','c04-motivation','c05-profile','c06-target-weight','c07-activity','c08-diet','c09-your-target','c10-forecast','c11-paywall','c12-diary','c13-add-hub','c14-camera','c15-review','c16-meal-detail','c17-barcode','c18-search','c19-builder','c20-plans','c21-recipe','c22-activity-burn','c23-water','c24-progress','c25-metrics','c26-fasting','c27-healthkit','c28-notifications','c29-profile','c30-premium']

describe('caloai wiring 006', () => {
  it('builtin caloai lists 30 in order', () => {
    const p = BUILTIN_PROJECTS.find((x) => x.id === 'caloai')!
    expect(p).toBeDefined()
    expect(p.screenIds).toEqual(EXPECTED)
  })
  it('all 30 in manifest + generated, resolve 30/30 no zombie', () => {
    const p = BUILTIN_PROJECTS.find((x) => x.id === 'caloai')!
    for (const id of EXPECTED) expect(SCREEN_BY_ID.has(id), id).toBe(true)
    const raw = new Set(rawIds())
    for (const id of EXPECTED) expect(raw.has(id), id).toBe(true)
    expect(resolveScreens(p)).toEqual(EXPECTED)
  })
})
