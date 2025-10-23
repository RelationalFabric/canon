import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['examples/**/*.{js,ts}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/radar/**', 'src/**/*.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['examples/**/*.{js,ts}'],
      exclude: ['examples/**/*.test.ts'],
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
})
