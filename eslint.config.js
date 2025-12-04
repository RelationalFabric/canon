import createEslintConfig from './eslint.js'

export default createEslintConfig(
  {
    ignores: ['docs/examples/**', 'articles/**'],
  },
  {
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
)
