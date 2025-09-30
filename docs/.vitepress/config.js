import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@relational-fabric/canon',
  description: 'Modern TypeScript Package Template',
  
  // Base URL for deployment - adjust if deploying to a subdirectory
  base: '/',
  
  // Theme configuration
  themeConfig: {
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/docs/' },
      { text: 'Technology Radar', link: '/docs/planning/radar/radar.html' },
      { text: 'GitHub', link: 'https://github.com/RelationalFabric/canon' }
    ],

    // Sidebar
    sidebar: {
      '/docs/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/docs/' },
            { text: 'Axioms', link: '/docs/axioms' },
            { text: 'Canons', link: '/docs/canons' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Deduplicating Entities', link: '/docs/examples/deduplicating-entities' },
            { text: 'Tree Walk Over Mixed Entities', link: '/docs/examples/tree-walk-over-mixed-entities' },
            { text: 'User Authentication Tokens', link: '/docs/examples/user-authentication-tokens' }
          ]
        },
        {
          text: 'Architecture Decisions',
          items: [
            { text: 'ADR Index', link: '/docs/adrs' },
            { text: 'ADR-001: TypeScript Package Setup', link: '/docs/adrs/0001-typescript-package-setup' },
            { text: 'ADR-002: ESLint Configuration', link: '/docs/adrs/0002-eslint-configuration-with-antfu' },
            { text: 'ADR-003: Documentation Linting', link: '/docs/adrs/0003-documentation-linting-inclusion' },
            { text: 'ADR-004: TypeScript Configuration Separation', link: '/docs/adrs/0004-typescript-configuration-separation' },
            { text: 'ADR-005: ESLint Configuration Abstraction', link: '/docs/adrs/0005-eslint-configuration-abstraction' },
            { text: 'ADR-006: Unbuilt TypeScript Library', link: '/docs/adrs/0006-unbuilt-typescript-library' },
            { text: 'ADR-007: Y-Statement Format', link: '/docs/adrs/0007-y-statement-format' },
            { text: 'ADR-008: Dual Export Strategy', link: '/docs/adrs/0008-dual-export-strategy' },
            { text: 'ADR-009: Node.js Version Requirement', link: '/docs/adrs/0009-node-js-version-requirement' },
            { text: 'ADR-010: VitePress Documentation Solution', link: '/docs/adrs/0010-vitepress-documentation-solution' }
          ]
        },
        {
          text: 'Planning & Strategy',
          items: [
            { text: 'Planning Overview', link: '/docs/planning/' },
            { text: 'Technology Radar', link: '/docs/planning/radar/' },
            { text: 'Interactive Radar', link: '/docs/planning/radar/radar.html' },
            { text: 'Radar Methodology', link: '/docs/radar-methodology' }
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/RelationalFabric/canon' }
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Relational Fabric'
    },

    // Search
    search: {
      provider: 'local'
    }
  },

  // Markdown configuration
  markdown: {
    lineNumbers: true
  },

  // Build configuration
  build: {
    outDir: '../dist'
  }
})