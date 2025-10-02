import { defineConfig } from 'vitepress'

// VitePress site configuration.
// All links are expressed relative to the repository root, with docs served from /.
export default defineConfig({
  srcDir: '.',
  base: '/',
  title: 'Canon',
  description: 'Relational Fabric Canon Documentation',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'ADRs', link: '/adrs/' },
      { text: 'Axioms', link: '/axioms' },
      { text: 'Canons', link: '/canons' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Radar', link: '/public/radar/radar.html' }
    ],
    sidebar: {
      '/adrs/': [
        {
          text: 'Architecture Decision Records',
          collapsed: false,
          items: [
            { text: 'Index', link: '/adrs/' },
            { text: '0001 - TypeScript Package Setup', link: '/adrs/0001-typescript-package-setup' },
            { text: '0002 - ESLint Configuration with antfu', link: '/adrs/0002-eslint-configuration-with-antfu' },
            { text: '0003 - Documentation Linting Inclusion', link: '/adrs/0003-documentation-linting-inclusion' },
            { text: '0004 - TypeScript Configuration Separation', link: '/adrs/0004-typescript-configuration-separation' },
            { text: '0005 - ESLint Configuration Abstraction', link: '/adrs/0005-eslint-configuration-abstraction' },
            { text: '0006 - Unbuilt TypeScript Library', link: '/adrs/0006-unbuilt-typescript-library' },
            { text: '0007 - Y-Statement Format', link: '/adrs/0007-y-statement-format' },
            { text: '0008 - Dual Export Strategy', link: '/adrs/0008-dual-export-strategy' },
            { text: '0009 - Node.js Version Requirement', link: '/adrs/0009-node-js-version-requirement' },
            { text: '0010 - VitePress Documentation Solution', link: '/adrs/0010-vitepress-documentation-solution' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          collapsed: false,
          items: [
            { text: 'Index', link: '/examples/' },
            { text: 'Deduplicating Entities', link: '/examples/deduplicating-entities' },
            { text: 'Tree Walk Over Mixed Entities', link: '/examples/tree-walk-over-mixed-entities' },
            { text: 'User Authentication Tokens', link: '/examples/user-authentication-tokens' }
          ]
        }
      ],
      '/': [
        {
          text: 'Guides',
          items: [
            { text: 'Axioms', link: '/axioms' },
            { text: 'Canons', link: '/canons' },
            { text: 'Radar Methodology', link: '/radar-methodology' }
          ]
        }
      ]
    }
  }
})

