import { describe, expect, it } from 'vitest'
import { missingScreenIds } from './reconcile'

describe('missingScreenIds', () => {
  const project = ['splash', 'home', 'checkin', 'insights']

  it('appends project screens the board has never placed', () => {
    // the exact failure: a board saved when the project had two screens
    expect(missingScreenIds(project, ['splash', 'home'], [])).toEqual(['checkin', 'insights'])
  })

  it('keeps a deliberately removed screen off the board', () => {
    expect(missingScreenIds(project, ['splash', 'home'], ['checkin'])).toEqual(['insights'])
  })

  it('adds nothing when the board already covers the project', () => {
    expect(missingScreenIds(project, project, [])).toEqual([])
  })

  it('ignores screens on the board that the project no longer lists', () => {
    // a node for a screen that left the manifest is the caller's problem,
    // not a reason to append it back
    expect(missingScreenIds(project, [...project, 'old-screen'], [])).toEqual([])
  })

  it('preserves project order so appended nodes read left to right', () => {
    expect(missingScreenIds(project, [], [])).toEqual(project)
  })
})
