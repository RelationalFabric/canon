#!/usr/bin/env tsx

/**
 * Generate Examples Documentation
 *
 * This script generates documentation from the example files in the /examples directory.
 * It extracts metadata, descriptions, and creates links to the source files on GitHub.
 *
 * The generated documentation maintains the testability of examples while providing
 * comprehensive documentation that's always up-to-date with the source code.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

interface ExampleInfo {
  name: string
  path: string
  description: string
  keyConcepts: string[]
  prerequisites?: string[]
  githubUrl: string
  isDirectory: boolean
  subExamples?: ExampleInfo[]
}

const GITHUB_BASE_URL = 'https://github.com/RelationalFabric/canon/tree/main/examples'

/**
 * Extract metadata from a TypeScript file
 */
function extractMetadata(filePath: string): Partial<ExampleInfo> {
  const content = readFileSync(filePath, 'utf-8')

  // Extract description from JSDoc comments (first comment block)
  const descriptionMatch = content.match(/\/\*\*[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*\*\s*([^*\n]+)/)
  const description = descriptionMatch ? descriptionMatch[1].trim() : ''

  // Extract key concepts from comments
  const keyConceptsMatch = content.match(/Key Concepts?:[\s\S]*?(- [^\n]+)/g)
  const keyConcepts: string[] = []
  if (keyConceptsMatch) {
    keyConceptsMatch.forEach((match) => {
      const concepts = match.match(/- ([^\n]+)/g)
      if (concepts) {
        concepts.forEach((concept) => {
          keyConcepts.push(concept.replace('- ', '').trim())
        })
      }
    })
  }

  // Extract key takeaways as additional concepts (simplified regex)
  const takeawaysSection = content.match(/Key Takeaways?:[\s\S]*?(?=\n\n|\n\*\*|$)/)
  if (takeawaysSection) {
    const takeaways = takeawaysSection[0].match(/\d+\.\s+([^\n]+)/g)
    if (takeaways) {
      takeaways.forEach((takeaway) => {
        keyConcepts.push(takeaway.replace(/\d+\.\s+/, '').trim())
      })
    }
  }

  // Extract prerequisites
  const prerequisitesMatch = content.match(/Prerequisites?:[\s\S]*?(- [^\n]+)/g)
  const prerequisites: string[] = []
  if (prerequisitesMatch) {
    prerequisitesMatch.forEach((match) => {
      const prereqs = match.match(/- ([^\n]+)/g)
      if (prereqs) {
        prereqs.forEach((prereq) => {
          prerequisites.push(prereq.replace('- ', '').trim())
        })
      }
    })
  }

  return {
    description,
    keyConcepts,
    prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
  }
}

/**
 * Process a single example file or directory
 */
function processExample(examplePath: string, relativePath: string): ExampleInfo {
  const fullPath = join('/workspace/examples', examplePath)
  const stat = statSync(fullPath)
  const isDirectory = stat.isDirectory()

  const name = basename(examplePath, extname(examplePath))
  const githubUrl = `${GITHUB_BASE_URL}/${relativePath}`

  let exampleInfo: ExampleInfo = {
    name,
    path: relativePath,
    description: '',
    keyConcepts: [],
    githubUrl,
    isDirectory,
  }

  if (isDirectory) {
    // Process directory - look for README.md and sub-files
    const readmePath = join(fullPath, 'README.md')
    if (statSync(readmePath).isFile()) {
      const readmeContent = readFileSync(readmePath, 'utf-8')
      const descriptionMatch = readmeContent.match(/^#\s+([^\n]+)/)
      if (descriptionMatch) {
        exampleInfo.description = descriptionMatch[1].trim()
      }
    }

    // Process sub-files
    const subFiles = readdirSync(fullPath)
      .filter(file => file.endsWith('.ts') && file !== 'README.md')
      .map(file => processExample(join(examplePath, file), join(relativePath, file)))

    if (subFiles.length > 0) {
      exampleInfo.subExamples = subFiles
    }
  }
  else {
    // Process single file
    const metadata = extractMetadata(fullPath)
    exampleInfo = { ...exampleInfo, ...metadata }
  }

  return exampleInfo
}

/**
 * Generate the main examples documentation
 */
function generateExamplesDocumentation(examples: ExampleInfo[]): string {
  const header = `# Examples

This directory contains practical examples demonstrating how to use the @relational-fabric/canon package and its configurations.

## Available Examples

`

  const examplesContent = examples.map((example) => {
    let content = `### [${example.name}](./${example.path})\n`

    if (example.description) {
      content += `${example.description}\n\n`
    }

    if (example.keyConcepts.length > 0) {
      content += `**Key Concepts:**\n`
      example.keyConcepts.forEach((concept) => {
        content += `- ${concept}\n`
      })
      content += '\n'
    }

    if (example.prerequisites && example.prerequisites.length > 0) {
      content += `**Prerequisites:**\n`
      example.prerequisites.forEach((prereq) => {
        content += `- ${prereq}\n`
      })
      content += '\n'
    }

    if (example.isDirectory) {
      content += `**Pattern:** Module-style canon definition\n\n`
    }
    else {
      content += `**Pattern:** Declarative canon registration\n\n`
    }

    content += `**Source:** [View on GitHub](${example.githubUrl})\n\n`

    if (example.subExamples && example.subExamples.length > 0) {
      content += `**Files:**\n`
      example.subExamples.forEach((subExample) => {
        content += `- [${subExample.name}](${subExample.githubUrl})`
        if (subExample.description) {
          content += ` - ${subExample.description}`
        }
        content += '\n'
      })
      content += '\n'
    }

    return content
  }).join('')

  const footer = `## Example Patterns

The examples demonstrate two main patterns for working with Canon:

### Declarative Style (01-basic-id-axiom)
- **Use case**: Internal, app-specific canons
- **Pattern**: Define and register canons directly in your application
- **Benefits**: Simple, direct, perfect for internal use
- **Example**: \`declareCanon('Internal', { ... })\`

### Module Style (02-module-style-canon)
- **Use case**: Shared, reusable canons
- **Pattern**: Define canons in separate modules, register when needed
- **Benefits**: Reusable, testable, composable, versionable
- **Example**: \`defineCanon({ ... })\` + \`registerCanons({ ... })\`

## Getting Started

Each example includes:
- **Complete code samples** with full TypeScript typing
- **Step-by-step explanations** of the implementation
- **Best practices** and common pitfalls to avoid
- **Integration examples** showing how to use with the canon configurations
- **Live source code** linked directly to GitHub

## Prerequisites

Before running these examples, ensure you have:

- Node.js 22.0.0 or higher
- TypeScript 5.0.0 or higher
- ESLint 9.0.0 or higher

## Installation

\`\`\`bash
npm install @relational-fabric/canon
\`\`\`

## Usage

Each example can be run independently. Copy the code samples and adapt them to your specific use case. The examples are designed to work with the TypeScript and ESLint configurations provided by this package.

For more information about the package configurations, see the main [documentation](../README.md).

## Running Examples

You can run examples directly using tsx:

\`\`\`bash
# Run a specific example
npx tsx examples/01-basic-id-axiom.ts

# Run all examples
npx tsx examples/01-basic-id-axiom.ts && npx tsx examples/02-module-style-canon/usage.ts
\`\`\`

## Testing

All examples include built-in tests using Vitest's in-source testing pattern. The examples serve as:
1. **Documentation** - Show how to use the framework
2. **Integration tests** - Verify the complete workflow works
3. **Regression tests** - Ensure changes don't break functionality

Run the tests with:
\`\`\`bash
npm test
\`\`\`
`

  return header + examplesContent + footer
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Scanning examples directory...')

  const examplesDir = '/workspace/examples'
  const files = readdirSync(examplesDir)
    .filter((file) => {
      const fullPath = join(examplesDir, file)
      const stat = statSync(fullPath)
      return stat.isDirectory() || file.endsWith('.ts')
    })
    .sort()

  console.log(`📁 Found ${files.length} examples`)

  const examples = files.map((file) => {
    console.log(`📄 Processing: ${file}`)
    return processExample(file, file)
  })

  console.log('📝 Generating documentation...')

  const documentation = generateExamplesDocumentation(examples)

  const outputPath = '/workspace/docs/examples/README.md'
  writeFileSync(outputPath, documentation)

  console.log(`✅ Documentation generated: ${outputPath}`)
  console.log(`📊 Processed ${examples.length} examples`)

  // Print summary
  examples.forEach((example) => {
    console.log(`  - ${example.name}: ${example.description || 'No description'}`)
    if (example.subExamples) {
      example.subExamples.forEach((sub) => {
        console.log(`    └─ ${sub.name}`)
      })
    }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
