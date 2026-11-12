import type { ParsedExample } from '../cli/src/docs/examples/types.js'
import { describe, expect, it } from 'vitest'
import { renderTutorialBody } from '../cli/src/docs/examples/renderer.js'

describe('example docs renderer', () => {
  it('adjusts JSDoc description headings to the document level', async () => {
    const parsed: ParsedExample = {
      metadata: { title: 'Example' },
      referencedFiles: [],
      sourcePath: 'examples/demo/index.ts',
      sections: [{
        type: 'jsdoc',
        content: 'export function demo(): void {}',
        metadata: {
          description: '# Section\n\nBody.',
        },
      }],
    }

    const body = await renderTutorialBody(parsed, {}, 'examples/demo')

    expect(body).toContain('## Section')
    expect(body).not.toMatch(/^# Section$/m)
  })
})
