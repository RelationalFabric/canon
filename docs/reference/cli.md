# Canon CLI Reference

The Canon CLI provides a unified interface for all project workflows and scripts. All commands are accessible via `canon` or `npx canon`, making them easily discoverable and consistent across projects.

## Getting Help

All commands support multiple help flags:

```bash
canon -?          # Show help
canon -h          # Show help
canon --help      # Show help
canon help         # Show help
canon help <command>  # Show help for specific command
```

For unknown or incomplete commands, the CLI automatically provides suggestions and usage information.

## Available Commands

### Project Initialization

#### `canon init`

Initialize a new project with Canon scaffolding.

**Description**: Creates configuration files, starter source, and Canon-aligned package scripts. This is the recommended way to bootstrap a new project with Canon.

**Flags**:
- `--directory`, `-d` - Target directory for the new project (default: current directory)
- `--name`, `-n` - Project name for generated files (defaults to directory name)
- `--force` - Overwrite existing files when templates already exist
- `--templates` / `--no-templates` - Generate starter source and configuration files (default: true)
- `--scripts` / `--no-scripts` - Add Canon workflow scripts to package.json (default: true)
- `--dev-deps` / `--no-dev-deps` - Ensure Canon, ESLint, and TypeScript are in devDependencies (default: true)
- `--workflows` / `--no-workflows` - Generate GitHub Actions workflow for Canon checks (default: true)
- `--ci-tool` - Continuous integration provider to scaffold (options: `github`, default: `github`)

**Examples**:
```bash
# Initialize current directory
canon init

# Initialize with custom name
canon init --name my-project

# Initialize in specific directory
canon init --directory ./packages/api --name api-service

# Force overwrite existing files
canon init --force
```

### Architecture Decision Records (ADRs)

#### `canon adr:index`

Generate ADR index table.

**Description**: Scans ADR files and generates/updates the index table in the ADR README. This command parses all ADR markdown files, extracts metadata (status, date, title), and creates a formatted table.

**Flags**:
- `--adrs-dir` - Directory containing ADR files (default: `docs/adrs`)
- `--readme-path` - Path to ADR README file relative to adrs-dir (default: `README.md`)

**Examples**:
```bash
# Generate index with defaults
canon adr:index

# Custom ADR directory
canon adr:index --adrs-dir ./decisions
```

### Documentation

#### `canon docs:examples`

Generate examples documentation.

**Description**: Generates tutorial-first narrative documentation from example files using AST parsing, Markdown processing, and test integration. This command discovers examples, extracts metadata, and creates comprehensive documentation.

**Flags**:
- `--examples-dir` - Directory containing example files (default: `examples`)
- `--output-dir` - Output directory for generated documentation (default: `docs/examples`)
- `--test-report-path` - Path to Vitest JSON report for test status integration (default: `.scratch/vitest-report.json`)

**Examples**:
```bash
# Generate examples documentation
canon docs:examples

# Custom paths
canon docs:examples --examples-dir ./samples --output-dir ./docs/samples
```

#### `canon docs:rename-readmes`

Rename README.md files to/from index.md for VitePress build.

**Description**: Renames README.md files to index.md for VitePress routing (default), or restores index.md files back to README.md when `--restore` is used. This is typically used as part of the documentation build process.

**Flags**:
- `--docs-dir` - Directory containing documentation files (default: `docs`)
- `--exclude` - Comma-separated list of directory names to exclude from renaming (default: `.vitepress`)
- `--restore` - Restore index.md files back to README.md (reverse operation)
- `--keep-main-index` / `--no-keep-main-index` - Keep docs/index.md as index.md when restoring (default: true)

**Examples**:
```bash
# Rename README.md to index.md (for build)
canon docs:rename-readmes

# Restore index.md to README.md (after build)
canon docs:rename-readmes --restore

# Custom docs directory
canon docs:rename-readmes --docs-dir ./documentation
```

### Technology Radar

#### `canon radar:convert`

Convert radar YAML to CSV.

**Description**: Converts radar planning data from YAML format to CSV for visualization. This command reads the radar YAML file and generates a CSV file suitable for radar visualization tools.

**Flags**:
- `--input`, `-i` - Input YAML file path (default: `planning/radar/data.yaml`)
- `--output`, `-o` - Output CSV file path (default: `.vitepress/public/planning/radar/data.csv`)

**Examples**:
```bash
# Convert with defaults
canon radar:convert

# Custom input/output paths
canon radar:convert -i ./radar/data.yaml -o ./public/radar.csv
```

#### `canon radar:validate`

Validate radar YAML file.

**Description**: Validates the structure and content of a radar planning YAML file. This command checks for required fields, valid values, and data consistency, providing detailed error messages and warnings.

**Flags**:
- `--file`, `-f` - Path to radar YAML file (default: `planning/radar/data.yaml`)

**Examples**:
```bash
# Validate with defaults
canon radar:validate

# Validate custom file
canon radar:validate --file ./my-radar.yaml
```

## Command Organization

Commands are organized by category using the `:` separator:

- **Project Management**: `init`
- **ADRs**: `adr:*`
- **Documentation**: `docs:*`
- **Radar**: `radar:*`

This organization makes commands easily discoverable and groups related functionality together.

## Universal Compatibility

All CLI commands are designed to work universally across projects:

- **Configurable paths**: All file and directory paths can be customized via flags
- **Sensible defaults**: Commands work out of the box with Canon's standard directory structure
- **Zero adjustment**: Downstream projects using Canon get the same commands that work identically
- **Cross-platform**: All commands are implemented in TypeScript, working on all platforms

## Integration with Package Scripts

The CLI commands are integrated into Canon's package.json scripts, so you can use either:

```bash
# Direct CLI usage
canon adr:index

# Via npm script (same command)
npm run build:adr:index
```

All scripts generated by `canon init` use the CLI commands, ensuring consistency and discoverability.

## Error Handling

All commands provide:
- Clear error messages with context
- Helpful suggestions when commands fail
- Proper exit codes for scripting
- Detailed logging for debugging

## See Also

- [Project Setup Guide](../project-setup/README.md) - Step-by-step project initialization
- [ADR-0013: Canon CLI Foundation](../adrs/0013-canon-cli-foundation.md) - Architecture decision for CLI design
- [Canon Kit Reference](./kit.md) - Underlying utilities used by CLI commands
