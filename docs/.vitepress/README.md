# VitePress Documentation Setup

This directory contains the VitePress configuration and theme files for the Canon documentation.

## README File Strategy

This project uses `README.md` files consistently for all directory entry points:

### File Structure
- **`README.md`** - Standard directory entry point for both GitHub and VitePress

### Why README Files?

1. **GitHub Compatibility**: GitHub displays `README.md` files by default when browsing directories
2. **Consistency**: Single file naming convention across the entire project
3. **Industry Standard**: README files are the de facto standard for project documentation

### How VitePress Handles README Files

VitePress generates `README.html` files from `README.md` source files. The navigation is configured to link directly to these README files:

- `/docs/README` → `/docs/README.html`
- `/adrs/README` → `/adrs/README.html`
- `/planning/README` → `/planning/README.html`
- `/planning/radar/README` → `/planning/radar/README.html`

## Configuration

The VitePress configuration in `config.js` handles:
- Navigation structure (all links point to README files)
- Sidebar configuration
- Theme settings
- Search functionality

## Development

```bash
# Start dev server
npm run docs:dev

# Build documentation
npm run docs:build

# Preview built docs
npm run docs:preview
```

## Publishing

The documentation is published to GitHub Pages at:
https://relationalfabric.github.io/canon/

## Maintenance

When adding new folders with documentation:
1. Create `README.md` as the directory entry point
2. Update navigation in `config.js` to link to `/path/README`
3. Test both GitHub and VitePress rendering