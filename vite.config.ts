import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { generateIconSet } from './scripts/icons.ts'

/**
 * Icons are inlined into `icon-set.css` by a generator, so a glyph added to
 * `public/icons/` must be regenerated before it can render. Running it here
 * means dev and build both pick it up with no extra step.
 */
function iconSet(): Plugin {
  return {
    name: 'phone-canvas:icon-set',
    async buildStart() {
      const count = await generateIconSet()
      this.info(`icon set: ${count} glyphs`)
    },
  }
}

export default defineConfig({
  plugins: [iconSet(), react()],
  server: { port: 5273 },
})
