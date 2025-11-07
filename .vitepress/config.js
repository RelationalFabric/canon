export default {
  title: '@relational-fabric/canon',
  description:
    'A modern TypeScript package template with ESLint and TypeScript configurations for starting new projects',

  // Base URL for GitHub Pages
  base: '/canon/',

  // Theme configuration
  themeConfig: {
    // Navigation bar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/docs/' },
      { text: 'Planning', link: '/planning/' },
    ],

    // Sidebar configuration
    sidebar: {
      // Documentation sidebar
      '/docs/': [
        {
          text: 'Documentation',
          items: [
            { text: 'Introduction', link: '/docs/' },
            { text: 'Canons', link: '/docs/canons' },
            { text: 'Axioms', link: '/docs/axioms' },
            {
              text: 'Examples',
              items: [
                { text: 'Deduplicating Entities', link: '/docs/examples/deduplicating-entities' },
                {
                  text: 'Tree Walk Over Mixed Entities',
                  link: '/docs/examples/tree-walk-over-mixed-entities',
                },
                {
                  text: 'User Authentication Tokens',
                  link: '/docs/examples/user-authentication-tokens',
                },
              ],
            },
            { text: 'Radar Methodology', link: '/docs/radar-methodology' },
          ],
        },
      ],

      // ADR sidebar
      '/docs/adrs/': [
        {
          text: 'Documentation',
          items: [
            { text: 'Documentation', link: '/docs/' },
            { text: 'Canons', link: '/docs/canons' },
            { text: 'Axioms', link: '/docs/axioms' },
            { text: 'Examples', link: '/docs/examples' },
          ],
        },
        {
          text: 'Architecture Decision Records',
          items: [
            { text: 'About ADRs', link: '/docs/adrs/' },
            {
              text: '1. TypeScript Package Setup',
              link: '/docs/adrs/0001-typescript-package-setup',
            },
            {
              text: '2. ESLint Configuration with Antfu',
              link: '/docs/adrs/0002-eslint-configuration-with-antfu',
            },
            {
              text: '3. Documentation Linting Inclusion',
              link: '/docs/adrs/0003-documentation-linting-inclusion',
            },
            {
              text: '4. TypeScript Configuration Separation',
              link: '/docs/adrs/0004-typescript-configuration-separation',
            },
            {
              text: '5. ESLint Configuration Abstraction',
              link: '/docs/adrs/0005-eslint-configuration-abstraction',
            },
            {
              text: '6. Unbuilt TypeScript Library',
              link: '/docs/adrs/0006-unbuilt-typescript-library',
            },
            { text: '7. Y-Statement Format', link: '/docs/adrs/0007-y-statement-format' },
            { text: '8. Dual Export Strategy', link: '/docs/adrs/0008-dual-export-strategy' },
            {
              text: '9. Node.js Version Requirement',
              link: '/docs/adrs/0009-node-js-version-requirement',
            },
            {
              text: '10. VitePress Documentation Solution',
              link: '/docs/adrs/0010-vitepress-documentation-solution',
            },
          ],
        },
      ],
      // Planning sidebar
      '/planning/': [
        {
          text: 'Planning & Strategy',
          items: [
            { text: 'Overview', link: '/planning/' },
            {
              text: 'Technology Radar',
              items: [
                { text: 'Overview', link: '/planning/radar/' },
                { text: 'Interactive Radar', link: '/planning/radar/interactive' },
                { text: 'Methodology', link: '/docs/radar-methodology' },
              ],
            },
          ],
        },
      ],
    },

    // Social links
    socialLinks: [{ icon: 'github', link: 'https://github.com/RelationalFabric/canon' }],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Relational Fabric',
    },

    // Search
    search: {
      provider: 'local',
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/RelationalFabric/canon/edit/main/:path',
      text: 'Edit this page on GitHub',
    },

    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: 'github-dark',
  },

  // Ignore dead links for now - will fix them incrementally
  ignoreDeadLinks: true,
}
