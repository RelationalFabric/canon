import createEslintConfig from './eslint.js'

export default createEslintConfig(
  {
    ignores: ['docs/examples/**'],
  },
  {
    files: ['scripts/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
)
