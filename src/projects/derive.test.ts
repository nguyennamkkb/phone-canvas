import { describe, expect, it } from 'vitest'
import { deriveRegistry } from './derive'
import type { DeriveInput } from './types'

const SCREEN = '<div class="screen"></div>'

function derive(input: DeriveInput) {
  return deriveRegistry(input)
}

describe('deriveRegistry — dự án', () => {
  it('folder zero-config thành dự án, title suy từ id', () => {
    const { registry, errors } = derive({
      screens: {
        'project/my-app/screens/home-today.html': SCREEN,
        'project/my-app/screens/about.html': SCREEN,
      },
    })
    expect(errors).toEqual([])
    expect(registry.projects).toHaveLength(1)
    expect(registry.projects[0]).toMatchObject({
      id: 'my-app',
      title: 'My App',
      screenIds: ['about', 'home-today'],
    })
    expect(registry.screens.map((s) => s.id)).toEqual(['about', 'home-today'])
    expect(registry.screens[0]).toMatchObject({ projectId: 'my-app', file: 'project/my-app/screens/about.html' })
  })

  it('project.json override title/description và validate cover', () => {
    const { registry, errors } = derive({
      projectJson: {
        'project/my-app/project.json': JSON.stringify({
          title: 'My App',
          description: 'Demo',
          cover: 'home',
        }),
      },
      screens: { 'project/my-app/screens/home.html': SCREEN },
    })
    expect(errors).toEqual([])
    expect(registry.projects[0]).toMatchObject({ title: 'My App', description: 'Demo', coverId: 'home' })
  })

  it('input rỗng → registry rỗng, không lỗi', () => {
    const { registry, errors } = derive({})
    expect(errors).toEqual([])
    expect(registry).toEqual({ projects: [], screens: [], components: [], tokens: {}, assets: {} })
  })

  it('tokens.css và assets đi theo project', () => {
    const { registry, errors } = derive({
      screens: { 'project/my-app/screens/home.html': SCREEN },
      tokensCss: { 'project/my-app/tokens.css': ':root { --accent: red; }' },
      assets: ['project/my-app/assets/hero.svg', 'project/my-app/assets/nested/logo.svg'],
    })
    expect(errors).toEqual([])
    expect(registry.tokens).toEqual({ 'my-app': ':root { --accent: red; }' })
    expect(registry.assets).toEqual({ 'my-app': ['hero.svg', 'nested/logo.svg'] })
  })
})

describe('deriveRegistry — header screen', () => {
  it('đọc title, lightStatusBar, deviceId từ dòng đầu', () => {
    const { registry, errors } = derive({
      screens: {
        'project/my-app/screens/home.html':
          '<!-- pc {"title":"Home · Today","lightStatusBar":true,"deviceId":"ipad-11"} -->\n<div class="screen"></div>',
      },
    })
    expect(errors).toEqual([])
    expect(registry.screens[0]).toMatchObject({
      id: 'home',
      title: 'Home · Today',
      lightStatusBar: true,
      deviceId: 'ipad-11',
    })
  })

  it('comment thường ở dòng đầu không bị coi là header', () => {
    const { registry, errors } = derive({
      screens: { 'project/my-app/screens/home.html': '<!-- ghi chú -->\n<div class="screen"></div>' },
    })
    expect(errors).toEqual([])
    expect(registry.screens[0]!.title).toBe('Home')
    expect(registry.screens[0]!.lightStatusBar).toBeUndefined()
  })

  it('lightStatusBar false tường minh được giữ', () => {
    const { registry, errors } = derive({
      screens: { 'project/my-app/screens/home.html': '<!-- pc {"lightStatusBar":false} -->\n<div></div>' },
    })
    expect(errors).toEqual([])
    expect(registry.screens[0]!.lightStatusBar).toBe(false)
  })

  it('header JSON hỏng → lỗi kèm file', () => {
    const { errors } = derive({
      screens: { 'project/my-app/screens/home.html': '<!-- pc {title: nope} -->\n<div></div>' },
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]!.file).toBe('project/my-app/screens/home.html')
    expect(errors[0]!.message).toContain('JSON')
  })

  it('khoá lạ → lỗi', () => {
    const { errors } = derive({
      screens: { 'project/my-app/screens/home.html': '<!-- pc {"dark":true} -->\n<div></div>' },
    })
    expect(errors[0]!.message).toContain('khoá lạ "dark"')
  })

  it('deviceId không tồn tại → lỗi', () => {
    const { errors } = derive({
      screens: {
        'project/my-app/screens/home.html': '<!-- pc {"deviceId":"ipad-99"} -->\n<div></div>',
      },
    })
    expect(errors[0]!.message).toContain('ipad-99')
  })
})

describe('deriveRegistry — lỗi cấu trúc', () => {
  it('trùng screen id toàn cục → lỗi nêu cả hai file', () => {
    const { errors } = derive({
      screens: {
        'project/a/screens/home.html': SCREEN,
        'project/b/screens/home.html': SCREEN,
      },
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]!.file).toBe('project/b/screens/home.html')
    expect(errors[0]!.message).toContain('project/a/screens/home.html')
  })

  it('screen id không kebab-case → lỗi', () => {
    const { errors } = derive({ screens: { 'project/a/screens/Home_Screen.html': SCREEN } })
    expect(errors[0]!.message).toContain('kebab-case')
  })

  it('HTML nằm trực tiếp trong thư mục dự án → lỗi chỉ rõ hai lane', () => {
    const { errors } = derive({ strays: { 'project/a/loose.html': SCREEN } })
    expect(errors).toHaveLength(1)
    expect(errors[0]!.file).toBe('project/a/loose.html')
    expect(errors[0]!.message).toContain('screens/')
    expect(errors[0]!.message).toContain('components/')
  })

  it('project.json hỏng / khoá lạ / cover sai → lỗi', () => {
    const broken = derive({ projectJson: { 'project/a/project.json': '{oops' } })
    expect(broken.errors[0]!.message).toContain('JSON')

    const unknown = derive({
      projectJson: { 'project/a/project.json': JSON.stringify({ name: 'A' }) },
    })
    expect(unknown.errors[0]!.message).toContain('khoá lạ "name"')

    const cover = derive({
      projectJson: { 'project/a/project.json': JSON.stringify({ cover: 'nope' }) },
      screens: { 'project/a/screens/home.html': SCREEN },
    })
    expect(cover.errors[0]!.message).toContain('cover "nope"')
  })

  it('thư mục chỉ có token/component/asset mà không có screen hay project.json → lỗi', () => {
    const { errors } = derive({
      tokensCss: { 'project/a/tokens.css': '' },
      components: { 'project/a/components/chev.html': '<span></span>' },
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]!.file).toBe('project/a/')
    expect(errors[0]!.message).toContain('thiếu screens/ và project.json')
  })

  it('tên dự án không kebab-case → lỗi', () => {
    const { errors } = derive({ screens: { 'project/My_App/screens/home.html': SCREEN } })
    expect(errors[0]!.message).toContain('My_App')
  })
})

describe('deriveRegistry — component', () => {
  it('cùng component id ở hai dự án khác nhau là hợp lệ', () => {
    const { registry, errors } = derive({
      screens: {
        'project/a/screens/home-a.html': SCREEN,
        'project/b/screens/home-b.html': SCREEN,
      },
      components: {
        'project/a/components/chev.html': '<b>a</b>',
        'project/b/components/chev.html': '<b>b</b>',
      },
    })
    expect(errors).toEqual([])
    expect(registry.components.map((c) => c.project)).toEqual(['a', 'b'])
  })
})
