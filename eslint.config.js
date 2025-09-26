import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  node: true,
  ignores: [
    'dist',
    'node_modules',
  ],
})
