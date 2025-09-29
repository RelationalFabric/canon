# VitePress Documentation Implementation

This directory contains the VitePress configuration and theme files for the Canon documentation site.

## Implementation Summary

Following ADR-0010, we've implemented a VitePress-based documentation solution with the following features:

### ✅ Completed Features

1. **VitePress Setup**
   - Complete VitePress configuration in `.vitepress/config.js`
   - Custom theme with radar component support
   - GitHub Pages deployment configuration

2. **Navigation Structure**
   - Home page with hero section and features
   - Documentation section (primary content)
   - ADRs section (architectural decisions)
   - Planning section (strategy and roadmap)
   - Tech Radar section (interactive visualization)

3. **Technology Radar Integration**
   - Static HTML radar using build-your-own-radar
   - Vue component wrapper for embedding
   - Data sourced from `planning/technology-radar/data.yaml`

4. **GitHub Actions Workflow**
   - Automated deployment to GitHub Pages
   - Builds tech radar data and VitePress site
   - Deploys on push to main branch

5. **Package Scripts**
   - `npm run docs:dev` - Development server
   - `npm run docs:build` - Production build
   - `npm run docs:preview` - Preview production build

### 📁 Directory Structure

```
docs/
├── .vitepress/
│   ├── config.js          # VitePress configuration
│   ├── theme/
│   │   ├── index.js       # Theme configuration
│   │   └── radar.vue      # Tech radar component
│   └── README.md          # This file
├── adrs/                  # ADR files (existing)
├── planning/              # Planning docs (existing)
├── radar/
│   ├── index.md           # Radar landing page
│   └── radar.html         # Static radar visualization
├── index.md               # Home page
└── [existing docs]        # All existing documentation
```

### 🚀 Deployment

The documentation is automatically deployed to GitHub Pages via the `.github/workflows/docs.yml` workflow:

1. Triggers on push to `main` branch
2. Installs dependencies and builds tech radar data
3. Builds VitePress site
4. Deploys to GitHub Pages

### 🔧 Development

To work on the documentation locally:

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

### 📝 Notes

- Dead links are currently ignored (`ignoreDeadLinks: true`)
- Tech radar uses static HTML with build-your-own-radar
- All existing documentation structure is preserved
- Minimal impact on existing codebase

## Next Steps

1. Fix dead links incrementally
2. Enhance tech radar with dynamic data loading
3. Add more interactive components as needed
4. Optimize build performance