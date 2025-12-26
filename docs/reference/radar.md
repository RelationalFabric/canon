# Technology Radar Utilities

Supporting APIs for the documentation build pipeline. These helpers are exported from `@relational-fabric/canon/radar` and are intended for scripts that convert and validate radar data stored under `planning/radar`.

## Runtime helpers

### `convertYamlToCsv`

```ts
function convertYamlToCsv(yamlContent: string): string
```

Parses in-memory YAML content and returns a CSV string using the canonical quadrant and ring labels.

### `convertYamlFileToCsv`

```ts
function convertYamlFileToCsv(yamlPath: string, csvPath: string): void
```

Reads a YAML file, converts it with `convertYamlToCsv`, and writes the resulting CSV to the given path. Throws on I/O or parsing failures.

### `parseRadarYaml`

```ts
function parseRadarYaml(yamlContent: string): RadarData
```

Produces a strongly typed `RadarData` object graph from YAML content. Used by the conversion and validation scripts.

### `readRadarYaml`

```ts
function readRadarYaml(yamlPath: string): RadarData
```

Convenience wrapper that reads a file from disk and returns the parsed `RadarData`.

### `validateRadarData`

```ts
function validateRadarData(data: unknown): ValidationResult
```

Performs structural validation of a `RadarData` payload. Returns a `ValidationResult` containing `errors`, `warnings`, and a computed `isValid` flag.

### `validateRadarFile`

```ts
function validateRadarFile(filePath: string): Promise<ValidationResult>
```

Loads a YAML file from disk, parses it, and validates the structure. Surfaces file-system or parsing failures as `invalid_structure` errors in the result.

## Type surfaces

The following types are re-exported alongside the runtime helpers and live in `src/types/radar.ts`:

- `RadarEntry`
- `Quadrant`
- `Ring`
- `RadarMetadata`
- `RadarData`
- `RadarConfig`
- `CsvRow`
- `QuadrantKey`
- `RingKey`

Validation utilities also expose the diagnostic types declared in `src/radar/validator.ts`:

- `ValidationError`
- `ValidationResult`

Refer to the source files for field-level documentation and examples.
