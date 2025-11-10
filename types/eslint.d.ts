declare module '../eslint.js' {
  export type EslintConfig = Record<string, unknown>

  const createEslintConfig: (
    options?: EslintConfig,
    ...configs: EslintConfig[]
  ) => Promise<ReadonlyArray<EslintConfig>>

  export default createEslintConfig
}

declare module '../eslint' {
  export { default } from '../eslint.js'
}

declare module '@relational-fabric/canon/eslint' {
  export type { EslintConfig } from '../eslint.js'
  export { default } from '../eslint.js'
}

export {}
