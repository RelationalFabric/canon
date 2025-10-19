import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Include source files for in-source testing
    includeSource: ['src/**/*.{js,ts}'],
    // Exclude certain files from testing
    exclude: ['**/node_modules/**', '**/dist/**', '**/radar/**'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['src/**/*.test.ts', 'src/radar/**', 'src/test-*.ts'],
    },
  },
  // Define for production builds to strip out test code
  define: {
    'import.meta.vitest': 'undefined',
  },
})

