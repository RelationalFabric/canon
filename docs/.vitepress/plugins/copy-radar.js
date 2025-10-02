import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function copyRadarPlugin() {
  return {
    name: 'copy-radar',
    generateBundle() {
      const sourcePath = join(__dirname, '..', '..', 'planning', 'radar', 'radar.html')
      const destPath = 'planning/radar/radar.html'
      
      if (existsSync(sourcePath)) {
        this.emitFile({
          type: 'asset',
          fileName: destPath,
          source: readFileSync(sourcePath, 'utf8')
        })
      }
    }
  }
}