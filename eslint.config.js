import createEslintConfig from './eslint.js'

export default createEslintConfig({}, {
  files: [
    'scripts/**/*',
  ],
  rules: {
    'no-console': 'off',
  },
})
