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
      { text: 'Technology Radar', link: '/planning/radar/radar.html' },
      { text: 'GitHub', link: 'https://github.com/RelationalFabric/canon' }
    ],

    // Sidebar
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/docs/' },
            { text: 'Axioms', link: '/axioms' },
            { text: 'Canons', link: '/canons' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Deduplicating Entities', link: '/examples/deduplicating-entities' },
            { text: 'Tree Walk Over Mixed Entities', link: '/examples/tree-walk-over-mixed-entities' },
            { text: 'User Authentication Tokens', link: '/examples/user-authentication-tokens' }
          ]
        },
        {
          text: 'Architecture Decisions',
          items: [
            { text: 'ADR Index', link: '/adrs' },
            { text: 'ADR-001: TypeScript Package Setup', link: '/adrs/0001-typescript-package-setup' },
            { text: 'ADR-002: ESLint Configuration', link: '/adrs/0002-eslint-configuration-with-antfu' },
            { text: 'ADR-003: Documentation Linting', link: '/adrs/0003-documentation-linting-inclusion' },
            { text: 'ADR-004: TypeScript Configuration Separation', link: '/adrs/0004-typescript-configuration-separation' },
            { text: 'ADR-005: ESLint Configuration Abstraction', link: '/adrs/0005-eslint-configuration-abstraction' },
            { text: 'ADR-006: Unbuilt TypeScript Library', link: '/adrs/0006-unbuilt-typescript-library' },
            { text: 'ADR-007: Y-Statement Format', link: '/adrs/0007-y-statement-format' },
            { text: 'ADR-008: Dual Export Strategy', link: '/adrs/0008-dual-export-strategy' },
            { text: 'ADR-009: Node.js Version Requirement', link: '/adrs/0009-node-js-version-requirement' },
            { text: 'ADR-010: VitePress Documentation Solution', link: '/adrs/0010-vitepress-documentation-solution' }
          ]
        },
        {
          text: 'Planning & Strategy',
          items: [
            { text: 'Planning Overview', link: '/planning/' },
            { text: 'Technology Radar', link: '/planning/radar/' },
            { text: 'Interactive Radar', link: '/planning/radar/radar.html' },
            { text: 'Radar Methodology', link: '/radar-methodology' }
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