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

  it('does not turn an included status line and the closer into a heading', async () => {
    const parsed: ParsedExample = {
      metadata: { title: 'Example' },
      referencedFiles: [],
      sourcePath: 'examples/02-module-style-canon/index.ts',
      sections: [{
        type: 'include',
        content: '',
        metadata: { includePath: './mongodb-canon.ts' },
      }],
    }

    const body = await renderTutorialBody(
      parsed,
      {},
      'examples/02-module-style-canon',
      undefined,
      {
        testResults: [{
          name: 'examples/02-module-style-canon/mongodb-canon.ts',
          status: 'passed',
          assertionResults: [
            { title: 'The canon uses "_id" as the Id key.', status: 'passed' },
            { title: 'The canon metadata specifies objectid type and hex format.', status: 'passed' },
          ],
        }],
      },
      '',
    )

    expect(body).toContain('_Status:_ ✅ pass')
    expect(body).not.toMatch(/_Status:_ ✅ pass\n--/)
    expect(body).toMatch(/_Status:_ ✅ pass\n\n--$/)
  })
})
