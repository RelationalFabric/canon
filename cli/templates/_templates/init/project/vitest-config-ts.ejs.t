---
to: vitest.config.ts
if_exists: skip
---
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Include source files for in-source testing
    includeSource: ['src/**/*.{js,ts}'],
    // Explicit test files
    include: ['tests/**/*.test.ts'],
    // Exclude certain files from testing
    exclude: ['**/node_modules/**', '**/dist/**'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['src/**/*.test.ts'],
    },
  },
  // Define for production builds to strip out test code
  define: {
    'import.meta.vitest': 'undefined',
  },
})
