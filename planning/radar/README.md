# Canon Technology Radar

This directory contains the Canon Technology Radar source data and configuration files.

## Structure

- `data.yaml` - Main radar data in YAML format (human-editable)
- `config.yaml` - Radar configuration and metadata
- `README.md` - This documentation file

## Generated Files

The compiled/generated files are stored in `docs/public/radar/` (created automatically by scripts):

- `data.csv` - Generated CSV format for build-your-own-radar tool
- `radar.html` - Generated radar visualization (when using build-your-own-radar tool)

**Note**: The `docs/public/radar/` directory is gitignored as it contains generated files.

## Usage

The radar functionality is now part of the main Canon package. You can use it programmatically or via npm scripts:

### Programmatic Usage

```typescript
import { convertYamlFileToCsv, validateRadarFile } from '@relational-fabric/canon'

// Convert YAML to CSV (outputs to docs/public/radar/)
convertYamlFileToCsv('./data.yaml', '../../public/radar/data.csv')

// Validate radar data
const result = await validateRadarFile('./data.yaml')
if (!result.isValid) {
  console.error('Validation errors:', result.errors)
}
```

### NPM Scripts

1. **Edit radar data**: Modify `data.yaml` with new entries or changes
2. **Generate CSV**: Run `npm run build:radar` to create `data.csv` in `docs/public/radar/`
3. **Validate data**: Run `npm run check:radar` to check for errors
4. **Visualize**: Use build-your-own-radar tool with generated CSV from `docs/public/radar/`

## Radar Methodology

See [./methodology.md](./methodology.md) for detailed information about how we maintain and update the radar.
