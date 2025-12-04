import createEslintConfig from './eslint.js'

export default createEslintConfig(
  {
    ignores: ['docs/examples/**', 'docs/blog/**'],
  },
  {
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
)
