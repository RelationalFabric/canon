declare module 'hygen' {
  import type Logger from 'hygen/dist/logger'

  interface HygenAction {
    readonly abort: boolean
    readonly body: string
    readonly attributes: Record<string, unknown>
    readonly command?: string
    readonly filePath?: string
  }

  interface HygenPrompter {
    readonly prompt: <T>(questions: T) => Promise<Record<string, unknown>>
  }

  interface RunnerConfig {
    readonly templates: string
    readonly cwd: string
    readonly logger: Logger
    readonly debug?: boolean
    readonly helpers?: Record<string, unknown>
    readonly createPrompter?: () => HygenPrompter
    readonly exec?: (action: HygenAction) => Promise<void>
  }

  export function runner(argumentsList: string[], config: RunnerConfig): Promise<void>
}

declare module 'hygen/dist/logger' {
  export default class Logger {
    constructor(log: (message: string) => void)
    colorful(message: string): void
    notice(message: string): void
    warn(message: string): void
    err(message: string): void
    ok(message: string): void
  }
}
