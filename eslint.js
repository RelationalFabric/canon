import process from 'node:process'
import antfu from '@antfu/eslint-config'
import { defu } from 'defu'

/**
 * Create an ESLint configuration using antfu's config with optional custom overrides
 * @param {object} [options] - Optional configuration to merge with the default antfu config
 * @returns {object} ESLint configuration object
 */
export default function createEslintConfig(options = {}, ...configs) {
  const defaultConfig = {
    typescript: true,
    node: true,
    stylistic: true, // Use ESLint Stylistic for formatting instead of Prettier
    ignores: ['dist', 'node_modules'],
  }

  const mergedConfig = defu(options, defaultConfig)

  return antfu(
    mergedConfig,
    {
      rules: {
        'no-console': process.env.CI ? 'off' : 'warn',
        'node/prefer-global/process': 'off',
      },
    },
    ...configs,
  )
}
