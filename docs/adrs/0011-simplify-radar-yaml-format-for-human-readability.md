# 11. Simplify Radar YAML Format for Human Readability

Date: 2025-01-26

## Status

2025-01-26 accepted

## Context

The Canon Technology Radar uses a YAML format to define technology recommendations and assessments. The original format was complex with deep nesting structures that made it difficult to edit and maintain:

```yaml
# Original complex format
quadrants:
  - id: tools-libraries
    name: 'Tools & Libraries'
    description: 'Third-party libraries, build tools, and development utilities'

rings:
  - id: adopt
    name: Adopt
    description: 'Strong recommendation. Proven, stable, and recommended for use.'
    color: '#93c47d'

entries:
  tools-libraries:
    adopt:
      - name: '@antfu/eslint-config'
        description: Modern ESLint configuration with TypeScript support
        isNew: false
        justification: Proven configuration that reduces setup overhead
```

This format had several issues:
- **Deep nesting**: `entries.quadrant.ring.items[]` created 3 levels of nesting
- **Repetitive structure**: Each quadrant and ring required full object definitions
- **Hard to edit**: Adding a single item required navigating through multiple levels
- **Verbose**: Lots of metadata that could be simplified
- **Not human-friendly**: Violated the "one line for one reason" principle

## Decision

We will simplify the radar YAML format to be as shallow as possible with the following structure:

```yaml
# New simplified format
quadrants: string[] # Just the names
rings: string[] # Just the names
items: Item[] # Flat array with quadrant/ring references
```

The new format looks like this:

```yaml
metadata:
  title: Canon Technology Radar
  subtitle: Relational Fabric's technology recommendations and assessments
  version: 1.0.0
  lastUpdated: 2025-01-26

quadrants:
  - Tools & Libraries
  - Techniques & Patterns
  - Features & Capabilities
  - Data Structures, Formats & Standards

rings:
  - Adopt
  - Trial
  - Assess
  - Hold

items:
  - name: '@antfu/eslint-config'
    description: Modern ESLint configuration with TypeScript support
    quadrant: Tools & Libraries
    ring: Adopt
    isNew: false
    justification: Proven configuration that reduces setup overhead
```

This achieves the "one line for one reason" goal by:
- Quadrants and rings become simple string arrays
- Items become a flat array where each item specifies its quadrant and ring
- Much easier to add/edit individual items
- Reduces cognitive load when editing
- Maintains all necessary information while being more readable

## Consequences

### Positive
- **Easier editing**: Each radar item is now a single, self-contained block
- **Reduced complexity**: Eliminates deep nesting and repetitive structures
- **Better maintainability**: Simpler format is easier to understand and modify
- **Human-friendly**: Follows the "one line for one reason" principle
- **Preserved functionality**: All existing data is converted without loss
- **Backward compatibility**: Legacy types are maintained during migration

### Negative
- **Breaking change**: Existing tools expecting the old format need updates
- **Migration required**: All existing radar data needs conversion
- **Tool updates**: Converter and validator logic needed updates

### Implementation
- Updated TypeScript type definitions to support both old and new formats
- Created conversion script to migrate existing data
- Updated converter and validator logic to handle simplified format
- All existing radar data successfully converted (60 items)
- Validation and CSV generation continue to work correctly

The simplified format makes the radar much more maintainable while preserving all functionality and data integrity.
