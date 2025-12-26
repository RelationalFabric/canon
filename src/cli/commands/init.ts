import type { JsonFormattingOptions, JsonParseError } from '../../kit.js'
import { createRequire } from 'node:module'
import { basename, relative, resolve } from 'node:path'
import process from 'node:process'

import { fileURLToPath } from 'node:url'
import { Files, Hygen, Jsonc, Oclif } from '../../kit.js'

interface InitFlags {
  directory?: string
  force?: boolean
  name?: string
  templates?: boolean
  scripts?: boolean
  devDeps?: boolean
  workflows?: boolean
  ciTool?: 'github'
}

interface HygenPrompter {
  prompt: <T>(questions: T) => Promise<Record<string, unknown>>
}

const require = createRequire(import.meta.url)
const canonPackage = require('../../../package.json') as { readonly version: string }

const packageRoot = fileURLToPath(new URL('../../..', import.meta.url))
const templatesDirectory = resolve(packageRoot, 'cli/templates/_templates')
const formattingOptions: JsonFormattingOptions = {
  insertSpaces: true,
  tabSize: 2,
  eol: '\n',
}

const { command: CanonCommand, flags: CanonFlags } = Oclif
const { run: hygenRun, createLogger: createHygenLogger } = Hygen
const {
  applyEdits: applyJsonEdits,
  modify: modifyJsonContent,
  parse: parseJsonWithComments,
  printError: printParseErrorCode,
} = Jsonc

export default class InitCommand extends CanonCommand {
  static summary = 'Initialize a new project with Canon scaffolding'

  static description = 'Creates configuration files, starter source, and Canon-aligned package scripts.'

  static flags = {
    directory: CanonFlags.string({
      char: 'd',
      description: 'Target directory for the new project',
      default: '.',
    }),
    force: CanonFlags.boolean({
      description: 'Overwrite existing files when templates already exist',
      default: false,
    }),
    name: CanonFlags.string({
      char: 'n',
      description: 'Project name for generated files (defaults to directory name)',
    }),
    templates: CanonFlags.boolean({
      description: 'Generate starter source and configuration files',
      allowNo: true,
      default: true,
    }),
    scripts: CanonFlags.boolean({
      description: 'Add Canon workflow scripts to package.json',
      allowNo: true,
      default: true,
    }),
    devDeps: CanonFlags.boolean({
      description: 'Ensure Canon, ESLint, and TypeScript are listed in devDependencies',
      allowNo: true,
      default: true,
    }),
    workflows: CanonFlags.boolean({
      description: 'Generate GitHub Actions workflow for Canon checks',
      allowNo: true,
      default: true,
    }),
    ciTool: CanonFlags.string({
      description: 'Continuous integration provider to scaffold',
      options: ['github'],
      default: 'github',
      allowNo: false,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(InitCommand)
    const resolvedFlags = flags as InitFlags
    const directory = resolve(process.cwd(), resolvedFlags.directory ?? '.')
    await Files.ensureDir(directory)

    const projectName = this.normalizeName(resolvedFlags.name ?? this.deriveName(directory))
    const templatesEnabled = resolvedFlags.templates !== false
    const scriptsEnabled = resolvedFlags.scripts !== false
    const devDependenciesEnabled = resolvedFlags.devDeps !== false
    const ciTool = resolvedFlags.ciTool ?? 'github'
    const workflowsEnabled = resolvedFlags.workflows !== false && ciTool === 'github'

    if (resolvedFlags.workflows !== false && ciTool !== 'github') {
      throw new Error(`Unsupported CI provider "${ciTool}". Supported options: github.`)
    }

    if (workflowsEnabled && !scriptsEnabled) {
      throw new Error('Cannot enable GitHub workflows when scripts are disabled. Re-enable scripts or disable workflows.')
    }

    await this.generateTemplates(directory, {
      force: resolvedFlags.force ?? false,
      name: projectName,
      templates: templatesEnabled,
      workflows: workflowsEnabled,
    })

    await this.updatePackageJson(directory, projectName, {
      scripts: scriptsEnabled,
      devDependencies: devDependenciesEnabled,
    })

    const relativePath = relative(process.cwd(), directory) || '.'
    this.log(`✅ Canon project ready at ${relativePath}`)
  }

  private deriveName(directory: string): string {
    const base = basename(directory)
    return base === '' ? 'canon-project' : base
  }

  private normalizeName(name: string): string {
    const trimmed = name.trim().toLowerCase()
    const normalized = trimmed.replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')
    return normalized === '' ? 'canon-project' : normalized
  }

  private async generateTemplates(
    directory: string,
    context: { force: boolean, name: string, templates: boolean, workflows: boolean },
  ): Promise<void> {
    if (!context.templates && !context.workflows) {
      return
    }

    const args = [
      'init',
      'project',
      '--name',
      context.name,
      '--templates',
      String(context.templates),
      '--workflows',
      String(context.workflows),
    ]
    if (context.force) {
      args.push('--force')
    }

    const logger = createHygenLogger((message: string) => {
      const trimmed = message.trim()
      if (trimmed.length > 0) {
        this.log(trimmed)
      }
    })

    const createPrompter = (): HygenPrompter => ({
      async prompt<T>(_questions: T): Promise<Record<string, unknown>> {
        return {}
      },
    })

    await hygenRun(args, {
      cwd: directory,
      templates: templatesDirectory,
      logger,
      debug: false,
      helpers: {},
      createPrompter,
    })
  }

  private async updatePackageJson(
    directory: string,
    name: string,
    options: { scripts: boolean, devDependencies: boolean },
  ): Promise<void> {
    const packageJsonPath = resolve(directory, 'package.json')
    let contents = '{\n}\n'

    if (await Files.pathExists(packageJsonPath)) {
      contents = await Files.readFile(packageJsonPath, 'utf8')
      this.assertPackageJsonValid(contents)
    }

    contents = this.ensureJsonValue(contents, ['name'], name)
    contents = this.ensureJsonValue(contents, ['type'], 'module')
    contents = this.ensureJsonValue(contents, ['engines', 'node'], '>=22.0.0')

    if (options.scripts) {
      const scripts: Record<string, string> = {
        'check:lint': 'eslint .',
        'check:lint:fix': 'eslint . --fix',
        'check:types': 'tsc --noEmit',
        'check:test': 'vitest run',
        'check:test:watch': 'vitest run --watch',
        'check:test:coverage': 'vitest run --coverage',
        'check:radar': 'tsx scripts/validate-radar.ts',
        'check:all': 'npm-run-all check:lint check:types check:test check:radar',
        'check:all:fix': 'npm-run-all check:lint:fix check:types check:test',
        'build:docs:examples': 'tsx scripts/generate-examples-docs.ts',
        'build:docs': 'npm run build:docs:examples && scripts/rename-readmes-for-build.sh && npx vitepress build && scripts/restore-readmes-from-build.sh',
        'build:radar': 'tsx scripts/convert-radar.ts',
        'build:adr': 'npm-run-all build:adr:toc build:adr:index',
        'build:adr:index': 'node scripts/generate-adr-index.js',
        'build:adr:toc': 'cd docs/adrs && npx adr-tools generate toc',
        'dev': 'tsx --watch src/index.ts',
        'test': 'npm run check:test',
      }

      for (const [script, command] of Object.entries(scripts)) {
        contents = this.ensureJsonValue(contents, ['scripts', script], command)
      }
    }

    if (options.devDependencies) {
      const devDependencies: Record<string, string> = {
        '@relational-fabric/canon': `^${canonPackage.version}`,
        'eslint': '^9.0.0',
        'typescript': '^5.0.0',
      }

      for (const [dependency, version] of Object.entries(devDependencies)) {
        contents = this.ensureJsonValue(contents, ['devDependencies', dependency], version)
      }
    }

    await Files.writeFile(packageJsonPath, this.ensureTrailingNewline(contents), 'utf8')
  }

  private ensureJsonValue(source: string, path: Array<string | number>, value: unknown): string {
    const edits = modifyJsonContent(source, path, value, { formattingOptions })
    return applyJsonEdits(source, edits)
  }

  private ensureTrailingNewline(content: string): string {
    return content.endsWith('\n') ? content : `${content}\n`
  }

  private assertPackageJsonValid(contents: string): void {
    const errors: JsonParseError[] = []
    parseJsonWithComments(contents, errors, { allowTrailingComma: true })
    if (errors.length === 0) {
      return
    }

    const details = errors
      .map(error => `- ${printParseErrorCode(error.error)} at offset ${error.offset}`)
      .join('\n')
    throw new Error(`Unable to update package.json due to existing syntax errors:\n${details}`)
  }
}
