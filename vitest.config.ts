import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Include only examples for in-source testing
    includeSource: ['examples/**/*.{js,ts}'],
    // Exclude certain files from testing
    exclude: ['**/node_modules/**', '**/dist/**', '**/radar/**'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts}', 'examples/**/*.{js,ts}'],
      exclude: ['src/**/*.test.ts', 'src/radar/**'],
    },
  },
  // Define for production builds to strip out test code in examples
  define: {
    'import.meta.vitest': 'undefined',
  },
})
