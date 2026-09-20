import { toRgba, tokensOf } from './tokens'

/**
 * v2 SwiftUI handoff: the project's tokens as a Color/CGFloat extension.
 *
 * Colors carry both modes through UIColor(dynamicProvider:); spacing and
 * radii become plain numbers. Type tokens stay out — a px size is not a
 * UIFont, that mapping is a human decision per call site.
 *
 * Regenerate after editing tokens.css; never hand-edit the output.
 */

function swiftName(name: string): string {
  const parts = name.slice(2).split('-').filter(Boolean)
  const base = parts
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '')
  return base || 'token'
}

function rgbaArgs(v: [number, number, number, number]): string {
  const f = (x: number) => +(x / 255).toFixed(3)
  return `red: ${f(v[0])}, green: ${f(v[1])}, blue: ${f(v[2])}, opacity: ${+v[3].toFixed(2)}`
}

function pxNumber(value: string): number | null {
  const m = /^([0-9.]+)px$/.exec(value.trim())
  return m ? Number(m[1]) : null
}

export function swiftUITokens(projectId: string, title: string): string {
  const tokens = tokensOf(projectId)
  const lines: string[] = [
    'import SwiftUI',
    '',
    `// Design tokens · ${title}`,
    '// Sinh từ project/<id>/tokens.css — sửa file rồi sinh lại, đừng sửa tay.',
    '',
    'extension Color {',
  ]

  for (const t of tokens.filter((x) => x.group === 'color')) {
    const l = toRgba(t.light)
    const d = toRgba(t.dark)
    if (!l || !d) continue
    const name = swiftName(t.name)
    if (t.light === t.dark) {
      lines.push(`  static let ${name} = Color(.sRGB, ${rgbaArgs(l)})`)
    } else {
      lines.push(`  static var ${name}: Color {`)
      lines.push('    Color(UIColor { trait in')
      lines.push('      trait.userInterfaceStyle == .dark')
      lines.push(`        ? UIColor(${rgbaArgs(d)})`)
      lines.push(`        : UIColor(${rgbaArgs(l)})`)
      lines.push('    })')
      lines.push('  }')
    }
  }
  lines.push('}')

  const numbers = tokens.filter((t) => t.group === 'spacing' || t.group === 'radius')
  if (numbers.length > 0) {
    lines.push('', 'enum Spacing {')
    for (const t of numbers) {
      const n = pxNumber(t.light)
      if (n === null) continue
      lines.push(`  static let ${swiftName(t.name)}: CGFloat = ${n}`)
    }
    lines.push('}')
  }

  return lines.join('\n') + '\n'
}
