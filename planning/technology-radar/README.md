# Canon Technology Radar

This directory contains the Canon Technology Radar data and related files.

## Structure

- `data.yaml` - Main radar data in YAML format (human-editable)
- `data.csv` - Generated CSV format for build-your-own-radar tool
- `config.yaml` - Radar configuration and metadata
- `scripts/` - Tools for data conversion and radar generation

## Usage

1. **Edit radar data**: Modify `data.yaml` with new entries or changes
2. **Generate CSV**: Run conversion script to create `data.csv`
3. **Visualize**: Use build-your-own-radar tool with generated CSV
4. **Commit changes**: Version control both YAML and CSV files

## Radar Methodology

See [docs/radar-methodology.md](../docs/radar-methodology.md) for detailed information about how we maintain and update the radar.