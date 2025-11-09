# ADR-0011: Examples Documentation Generation from Source Files

# ADR-0011: Examples Documentation Generation from Source Files

- Status: accepted
- Date: 2025-01-26

## Context

The Canon project has examples in the `/examples` directory that demonstrate key functionality, but the documentation in `/docs/examples/` was static and required manual maintenance. This created several problems:

1. **Documentation Drift**: Static documentation could become outdated as examples evolved
2. **Maintenance Burden**: Changes to examples required separate updates to documentation
3. **Inconsistency**: Documentation might not accurately reflect the current state of examples
4. **Missing Information**: Static docs couldn't capture all the rich metadata available in the source files

The examples serve multiple purposes:

- **Documentation**: Show how to use the framework
- **Integration tests**: Verify the complete workflow works
- **Regression tests**: Ensure changes don't break functionality

## Decision

We will implement automatic documentation generation from example source files using a custom TypeScript script that:

1. **Scans the `/examples` directory** for all example files and directories
2. **Extracts metadata** from JSDoc comments and code structure
3. **Generates comprehensive documentation** with links to GitHub source files
4. **Maintains testability** by keeping examples as executable TypeScript files
5. **Integrates with build process** to ensure documentation stays current

### Implementation Details

**Script Location**: `/scripts/generate-examples-docs.ts`

**Key Features**:

- Extracts descriptions from JSDoc comments
- Identifies key concepts and prerequisites
- Generates GitHub links to source files
- Supports both single files and directory-based examples
- Maintains pattern information (declarative vs module-style)

**Build Integration**:

- Added `npm run build:docs:examples` script
- Integrated into `npm run build:docs` process
- Documentation regenerated on every build

**Generated Documentation Structure**:

- Overview of all examples with descriptions
- Pattern explanations (declarative vs module-style)
- Direct links to GitHub source files
- Key concepts and prerequisites
- Running and testing instructions

## Consequences

### Positive

1. **Always Current**: Documentation automatically reflects the current state of examples
2. **Single Source of Truth**: Examples serve as both code and documentation
3. **Reduced Maintenance**: No need to manually update documentation when examples change
4. **Better Discoverability**: GitHub links make it easy to view and run examples
5. **Preserved Testability**: Examples remain executable and testable as part of the test suite
6. **Rich Metadata**: Can extract more information from source files than static docs

### Negative

1. **Build Dependency**: Documentation generation requires TypeScript execution
2. **Script Maintenance**: Custom script needs to be maintained as examples evolve
3. **Limited Formatting**: Generated docs may be less flexible than hand-written ones

### Neutral

1. **Learning Curve**: Developers need to understand the generation process
2. **File Structure**: Examples must follow consistent patterns for metadata extraction

## Implementation

The solution includes:

1. **Documentation Generation Script** (`/scripts/generate-examples-docs.ts`)
2. **NPM Script** (`npm run build:docs:examples`)
3. **Build Integration** (updated `build:docs` script)
4. **Removed Static Files** (deleted outdated static documentation)
5. **Updated Documentation** (generated comprehensive examples overview)

## Examples

### Before

- Static markdown files with hardcoded information
- Manual maintenance required
- Potential for documentation drift

### After

- Dynamic documentation generated from source
- Automatic updates on build
- Direct links to GitHub source files
- Rich metadata extraction from code

## Related Decisions

- ADR-0010: VitePress Documentation Solution (provides the documentation framework)
- ADR-0008: Dual Export Strategy (enables the TypeScript execution environment)

## References

- [Generated Examples Documentation](/docs/examples/)
- [Documentation Generation Script](/scripts/generate-examples-docs.ts)
- [Example Files](/examples/)
