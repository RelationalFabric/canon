# Canon Technology Radar

This directory contains the Canon Technology Radar data and related files.

## Structure

- `data.yaml` - Main radar data in YAML format (human-editable)
- `data.csv` - Generated CSV format for build-your-own-radar tool
- `config.yaml` - Radar configuration and metadata
- [radar.html](./radar.html) - Generated radar visualization

## Usage

The radar functionality is now part of the main Canon package. You can use it programmatically or via npm scripts:

### Programmatic Usage

```typescript
import { convertYamlFileToCsv, validateRadarFile } from '@relational-fabric/canon'

// Convert YAML to CSV
convertYamlFileToCsv('./docs/planning/radar/data.yaml', './docs/planning/radar/data.csv')

// Validate radar data
const result = await validateRadarFile('./docs/planning/radar/data.yaml')
if (!result.isValid) {
  console.error('Validation errors:', result.errors)
}
```

### NPM Scripts

1. **Edit radar data**: Modify `data.yaml` with new entries or changes
2. **Generate CSV**: Run `npm run radar:convert` to create `data.csv`
3. **Validate data**: Run `npm run radar:validate` to check for errors
4. **Watch for changes**: Run `npm run radar:watch` to auto-convert on changes
5. **Visualize**: Use build-your-own-radar tool with generated CSV

## Radar Methodology

See [../../radar-methodology.md](../../radar-methodology.md) for detailed information about how we maintain and update the radar.