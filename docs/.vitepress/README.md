# VitePress Documentation Setup

This directory contains the VitePress configuration and theme files for the Canon documentation.

## Dual File Strategy

This project uses a dual-file approach to ensure compatibility with both GitHub and VitePress:

### File Structure
- **`index.md`** - VitePress entry point (becomes `index.html`)
- **`README.md`** - GitHub folder documentation (becomes `README.html`)

### Why Both Files?

1. **VitePress Routing**: VitePress treats `index.md` as directory entry points
2. **GitHub Navigation**: GitHub displays `README.md` files for folder documentation
3. **Best of Both Worlds**: Users get proper navigation in both contexts

### Content Strategy

- **`index.md`**: Full interactive documentation content with VitePress features
- **`README.md`**: GitHub-optimized content with links to the full documentation

### Key Directories

- `/docs/` - Main documentation (both `index.md` and `README.md`)
- `/docs/planning/radar/` - Technology radar (both `index.md` and `README.md`)

## Configuration

The VitePress configuration in `config.js` handles:
- Navigation structure
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
1. Create `index.md` for VitePress routing
2. Create `README.md` for GitHub navigation
3. Update navigation in `config.js` if needed
4. Test both GitHub and VitePress rendering