declare module '../eslint.js' {
  export type EslintConfig = Record<string, unknown>

  const createEslintConfig: (
    options?: EslintConfig,
    ...configs: Record<string, unknown>[]
  ) => Record<string, unknown>

  export default createEslintConfig
}

declare module '../eslint' {
  export { default } from '../eslint.js'
}

export {}
