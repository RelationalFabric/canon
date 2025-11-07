/*
  Marginalia-Style Examples Documentation Generator

  Generates per-example markdown in docs/examples/ by extracting narrative from
  JSDoc and top-level comment blocks and interleaving with TypeScript code.

  Rules and heuristics:
  - JSDoc blocks (/** ... */) become narrative prose
  - Top-level single-line comment blocks (// ...), separated by blank lines
    from code, become narrative prose
  - Inline comments remain inside code blocks
  - Optional section markers: // ---SECTION: Title--- produce markdown sections
  - Vitest in-source test blocks (if (import.meta.vitest) { ... }) are excluded
  - Multi-file examples (directories) are combined into one doc with file headings

  Output:
  - docs/examples/<example>.md, preserving README.md in that folder
  - docs/examples/README.md is updated to include a generated index between
    BEGIN/END markers, preserving surrounding static content
*/

import { promises as fs } from 'node:fs'
import path from 'node:path'

type Segment =
  | { kind: 'narrative'; text: string }
  | { kind: 'code'; code: string }
  | { kind: 'section'; title: string }

interface ParsedSource {
  filePath: string
  segments: Segment[]
}

interface ExampleInfo {
  name: string // e.g., 01-basic-id-axiom or 02-module-style-canon
  title: string
  files: ParsedSource[]
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath)
    return true
  }
  catch {
    return false
  }
}

function toTitleFromSlug(slug: string): string {
  const withSpaces = slug.replace(/[-_]+/g, ' ').trim()
  // Preserve any numeric prefix but add space after common patterns like 01-
  const spaced = withSpaces.replace(/^(\d{1,3})\s+/, (_, n: string) => `${n} `)
  return spaced
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function stripBlockCommentStars(lines: string[]): string[] {
  return lines.map((line) => {
    const trimmed = line.trimStart()
    if (trimmed.startsWith('*')) {
      return trimmed.replace(/^\*\s?/, '')
    }
    return line
  })
}

function isBlank(line: string): boolean {
  return line.trim() === ''
}

function parseSourceFile(filePath: string, raw: string): ParsedSource {
  const lines = raw.split(/\r?\n/)
  const segments: Segment[] = []
  let codeBuffer: string[] = []

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      // Trim leading/trailing blank lines in the code block
      while (codeBuffer.length > 0 && isBlank(codeBuffer[0])) codeBuffer.shift()
      while (codeBuffer.length > 0 && isBlank(codeBuffer[codeBuffer.length - 1])) codeBuffer.pop()
      if (codeBuffer.length > 0) {
        segments.push({ kind: 'code', code: codeBuffer.join('\n') })
      }
      codeBuffer = []
    }
  }

  let i = 0
  let skippingVitest = false
  let vitestBraceDepth = 0
  while (i < lines.length) {
    const line = lines[i]

    // Handle start of vitest in-source block
    if (!skippingVitest && /\bif\s*\(\s*import\.meta\.vitest\s*\)/.test(line)) {
      skippingVitest = true
      // Initialize brace depth from this line and forward
      const rest = line.slice(line.indexOf('{') >= 0 ? line.indexOf('{') : line.length)
      vitestBraceDepth = (rest.match(/\{/g) || []).length - (rest.match(/\}/g) || []).length
      if (vitestBraceDepth <= 0) {
        // Might be on next lines; ensure at least 1 to enter skipping
        vitestBraceDepth = 1
      }
      i += 1
      // Flush any preceding code so we don't interleave with narrative
      flushCode()
      // Skip lines until balanced
      while (i < lines.length && vitestBraceDepth > 0) {
        const ln = lines[i]
        vitestBraceDepth += (ln.match(/\{/g) || []).length
        vitestBraceDepth -= (ln.match(/\}/g) || []).length
        i += 1
      }
      skippingVitest = false
      continue
    }

    // Section marker
    const sectionMatch = line.match(/^\s*\/\/\s*---SECTION:\s*(.+?)\s*---\s*$/)
    if (sectionMatch) {
      flushCode()
      segments.push({ kind: 'section', title: sectionMatch[1].trim() })
      i += 1
      continue
    }

    // Block comment: treat uniformly for JSDoc and regular block comments
    if (/^\s*\/\*/.test(line)) {
      const prevLineForBlock = i > 0 ? lines[i - 1] : ''
      const isTopLevelBlock = i === 0 || isBlank(prevLineForBlock)

      const rawBlock: string[] = []
      const innerLines: string[] = []

      // Capture opening line
      rawBlock.push(lines[i])
      i += 1

      // Capture inner and closing line
      while (i < lines.length) {
        rawBlock.push(lines[i])
        if (/\*\//.test(lines[i])) {
          i += 1
          break
        }
        innerLines.push(lines[i])
        i += 1
      }

      if (isTopLevelBlock) {
        flushCode()
        const cleaned = stripBlockCommentStars(innerLines).join('\n').trim()
        if (cleaned.length > 0) {
          segments.push({ kind: 'narrative', text: cleaned })
        }
        // Skip trailing blank lines between comment block and code
        while (i < lines.length && isBlank(lines[i])) i += 1
      }
      else {
        // Inline/embedded block comment stays inside code
        for (const rb of rawBlock) codeBuffer.push(rb)
      }
      continue
    }

    // Top-level narrative single-line comment block: must be preceded by blank code context
    const isCommentLine = /^\s*\/\//.test(line)
    const prevLine = i > 0 ? lines[i - 1] : ''
    if (isCommentLine && (i === 0 || isBlank(prevLine))) {
      // Peek ahead to collect contiguous comment lines
      const commentBlock: string[] = []
      while (i < lines.length && /^\s*\/\//.test(lines[i])) {
        // Capture text after //
        const m = lines[i].match(/^\s*\/\/\s?(.*)$/)
        commentBlock.push(m ? m[1] : '')
        i += 1
      }
      // If the next non-empty line starts with code (not another comment) we treat this as narrative
      const nextNonEmptyIndex = (() => {
        let j = i
        while (j < lines.length && isBlank(lines[j])) j += 1
        return j
      })()
      const nextIsComment = nextNonEmptyIndex < lines.length && /^\s*\/\//.test(lines[nextNonEmptyIndex])
      const text = commentBlock.join('\n').trim()
      if (!nextIsComment && text.length > 0) {
        flushCode()
        segments.push({ kind: 'narrative', text })
        // Skip trailing blank lines between comment block and code
        while (i < lines.length && isBlank(lines[i])) i += 1
        continue
      }
      // Otherwise, fall through and treat original captured lines as code; push them back into buffer
      for (const original of commentBlock.map((t) => `// ${t}`)) {
        codeBuffer.push(original)
      }
      continue
    }

    // Default: part of code
    codeBuffer.push(line)
    i += 1
  }

  flushCode()
  return { filePath, segments }
}

function deriveTitle(exampleName: string, parsedFiles: ParsedSource[]): string {
  // If the first segment is a narrative and starts with a Markdown H1, use it.
  for (const parsed of parsedFiles) {
    for (const seg of parsed.segments) {
      if (seg.kind === 'narrative') {
        const firstLine = seg.text.split(/\r?\n/)[0] ?? ''
        const m = firstLine.match(/^\s*#\s+(.*)$/)
        if (m) return m[1].trim()
        break
      }
      if (seg.kind === 'code') break // code before narrative, stop scanning this file
    }
  }
  return toTitleFromSlug(exampleName)
}

async function readText(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf8')
}

async function listExampleEntries(examplesDir: string): Promise<{ files: string[]; dirs: string[] }> {
  const entries = await fs.readdir(examplesDir, { withFileTypes: true })
  const files: string[] = []
  const dirs: string[] = []
  for (const e of entries) {
    if (e.isDirectory()) dirs.push(e.name)
    else if (e.isFile()) files.push(e.name)
  }
  return { files, dirs }
}

function sortExampleFiles(fileNames: string[]): string[] {
  // Prefer usage.ts, then index.ts, then alphabetical
  const orderKey = (name: string): string => {
    if (name === 'usage.ts') return '0-usage.ts'
    if (name === 'index.ts') return '1-index.ts'
    return `z-${name}`
  }
  return [...fileNames].sort((a, b) => orderKey(a).localeCompare(orderKey(b)))
}

async function processExample(exampleRoot: string, entry: string): Promise<ExampleInfo> {
  const abs = path.join(exampleRoot, entry)
  const stat = await fs.lstat(abs)
  if (stat.isFile()) {
    const raw = await readText(abs)
    const parsed = parseSourceFile(abs, raw)
    const name = entry.replace(/\.[^.]+$/, '')
    const title = deriveTitle(name, [parsed])
    return { name, title, files: [parsed] }
  }
  // Directory: collect .ts files
  const dirEntries = await fs.readdir(abs)
  const tsFiles = dirEntries.filter((f) => f.endsWith('.ts'))
  const ordered = sortExampleFiles(tsFiles)
  const files: ParsedSource[] = []
  for (const f of ordered) {
    const full = path.join(abs, f)
    const raw = await readText(full)
    files.push(parseSourceFile(full, raw))
  }
  const name = entry
  const title = deriveTitle(name, files)
  return { name, title, files }
}

function escapeCodeFence(code: string): string {
  // Ensure we don't accidentally close our own fence if code includes ```
  return code.replace(/```/g, '``\u0060')
}

function generateExampleMarkdown(example: ExampleInfo, examplesDir: string): string {
  const lines: string[] = []
  lines.push(`# ${example.title}`)
  lines.push('')
  for (const parsed of example.files) {
    // Add a heading for secondary files or always for multi-file examples
    if (example.files.length > 1) {
      lines.push(`## File: ${path.relative(path.join(examplesDir, example.name), parsed.filePath)}`)
      lines.push('')
    }
    for (const seg of parsed.segments) {
      if (seg.kind === 'section') {
        lines.push(`## ${seg.title}`)
        lines.push('')
      }
      else if (seg.kind === 'narrative') {
        lines.push(seg.text.trim())
        lines.push('')
      }
      else if (seg.kind === 'code') {
        const code = escapeCodeFence(seg.code)
        lines.push('```typescript')
        lines.push(code)
        lines.push('```')
        lines.push('')
      }
    }
  }
  return lines.join('\n')
}

async function writeExampleMarkdown(example: ExampleInfo, outputDir: string, examplesDir: string): Promise<string> {
  const outName = `${example.name}.md`
  const outPath = path.join(outputDir, outName)
  const content = generateExampleMarkdown(example, examplesDir)
  await fs.writeFile(outPath, `${content}\n`, 'utf8')
  return outPath
}

interface IndexEntry { title: string; description: string; filename: string }

async function extractTitleAndDescription(filePath: string): Promise<{ title: string; description: string }> {
  const raw = await readText(filePath)
  const lines = raw.split(/\r?\n/)
  let title = ''
  let description = ''
  for (const line of lines) {
    if (!title) {
      const m = line.match(/^#\s+(.*)$/)
      if (m) {
        title = m[1].trim()
        continue
      }
    }
    else if (!description) {
      if (line.trim().length === 0) continue
      if (line.startsWith('```')) break
      description = line.trim()
      break
    }
  }
  if (!title) title = toTitleFromSlug(path.basename(filePath, '.md'))
  return { title, description }
}

function upsertGeneratedIndex(original: string, entries: IndexEntry[]): string {
  const begin = '<!-- BEGIN GENERATED EXAMPLES INDEX -->'
  const end = '<!-- END GENERATED EXAMPLES INDEX -->'
  const listLines: string[] = []
  listLines.push('## Generated Example Docs')
  listLines.push('')
  for (const e of entries) {
    const desc = e.description ? ` — ${e.description}` : ''
    listLines.push(`- [${e.title}](./${e.filename})${desc}`)
  }
  const block = `${begin}\n\n${listLines.join('\n')}\n\n${end}`
  if (original.includes(begin) && original.includes(end)) {
    return original.replace(new RegExp(`${begin}[\s\S]*?${end}`), block)
  }
  // Append at the end, with spacing
  const trimmed = original.trimEnd()
  return `${trimmed}\n\n${block}\n`
}

async function generateExamplesDocumentation(): Promise<void> {
  const repoRoot = path.resolve(__dirname, '..')
  const examplesDir = path.join(repoRoot, 'examples')
  const outputDir = path.join(repoRoot, 'docs', 'examples')

  if (!(await pathExists(examplesDir))) {
    throw new Error(`Examples directory not found at ${examplesDir}`)
  }
  if (!(await pathExists(outputDir))) {
    await fs.mkdir(outputDir, { recursive: true })
  }

  const { files, dirs } = await listExampleEntries(examplesDir)
  const exampleFiles = files.filter((f) => f.endsWith('.ts'))
  const exampleDirs = dirs

  // Process single-file examples
  const allExamples: ExampleInfo[] = []
  for (const f of exampleFiles) {
    allExamples.push(await processExample(examplesDir, f))
  }
  // Process multi-file examples (directories)
  for (const d of exampleDirs) {
    allExamples.push(await processExample(examplesDir, d))
  }

  // Write individual markdown files
  const written: string[] = []
  for (const ex of allExamples) {
    const outPath = await writeExampleMarkdown(ex, outputDir, examplesDir)
    written.push(outPath)
  }

  // Update docs/examples/README.md with index
  const readmePath = path.join(outputDir, 'README.md')
  const existingReadme = (await pathExists(readmePath))
    ? await readText(readmePath)
    : '# Examples\n\n' // minimal fallback; project already has one

  const entries: IndexEntry[] = []
  const mdFiles = (await fs.readdir(outputDir)).filter((f) => f.endsWith('.md') && f !== 'README.md')
  for (const f of mdFiles) {
    const { title, description } = await extractTitleAndDescription(path.join(outputDir, f))
    entries.push({ title, description, filename: f })
  }
  entries.sort((a, b) => a.filename.localeCompare(b.filename))
  const updatedReadme = upsertGeneratedIndex(existingReadme, entries)
  await fs.writeFile(readmePath, `${updatedReadme}\n`, 'utf8')
}

// Execute when run directly
generateExamplesDocumentation().catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exitCode = 1
})
