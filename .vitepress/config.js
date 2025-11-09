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
      {
        text: 'Reference',
        items: [
          { text: 'Overview', link: '/docs/reference/' },
          { text: 'API Reference', link: '/docs/reference/api' },
          { text: 'Core Axioms', link: '/docs/reference/axioms' },
          { text: 'Canons', link: '/docs/reference/canons' },
          {
            text: 'Augmentable Interfaces',
            link: '/docs/reference/augmentable-interfaces',
          },
          { text: 'Canon Kit', link: '/docs/reference/kit' },
        ],
      },
      { text: 'Planning', link: '/planning/' },
    ],

    // Sidebar configuration
    sidebar: {
      '/docs/': [
        {
          text: 'Documentation',
          items: [
            { text: 'Introduction', link: '/docs/' },
            { text: 'Axioms', link: '/docs/axioms' },
            { text: 'Canons', link: '/docs/canons' },
            { text: 'Type Testing', link: '/docs/type-testing/' },
            { text: 'Examples', link: '/docs/examples/' },
          ],
        },
      ],
      '/docs/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/docs/reference/' },
            { text: 'API Reference', link: '/docs/reference/api' },
            { text: 'Core Axioms', link: '/docs/reference/axioms' },
            { text: 'Canons', link: '/docs/reference/canons' },
            {
              text: 'Augmentable Interfaces',
              link: '/docs/reference/augmentable-interfaces',
            },
            { text: 'Canon Kit', link: '/docs/reference/kit' },
          ],
        },
      ],
      '/docs/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/docs/examples/' },
            { text: 'Basic ID Axiom', link: '/docs/examples/01-basic-id-axiom' },
            { text: 'Module Style Canon', link: '/docs/examples/02-module-style-canon' },
            { text: 'Multi Axiom Canon', link: '/docs/examples/03-multi-axiom-canon' },
            {
              text: 'Format Conversion',
              link: '/docs/examples/04-format-conversion-examples',
            },
            {
              text: 'Error Handling & Edge Cases',
              link: '/docs/examples/05-error-handling-and-edge-cases',
            },
            {
              text: 'Real-World Business Scenarios',
              link: '/docs/examples/06-real-world-business-scenarios',
            },
            { text: 'Custom Axioms', link: '/docs/examples/07-custom-axioms-example' },
          ],
        },
      ],
      '/docs/type-testing/': [
        {
          text: 'Type Testing',
          items: [{ text: 'Overview', link: '/docs/type-testing/' }],
        },
      ],
      '/docs/adrs/': [
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
            {
              text: '11. Examples Documentation Generation',
              link: '/docs/adrs/0011-examples-documentation-generation-from-source-files',
            },
            {
              text: '12. Type Testing Framework',
              link: '/docs/adrs/0012-type-testing-framework',
            },
          ],
        },
      ],
      '/planning/': [
        {
          text: 'Planning & Strategy',
          items: [{ text: 'Overview', link: '/planning/' }],
        },
      ],
      '/planning/radar/': [
        {
          text: 'Technology Radar',
          items: [
            { text: 'Overview', link: '/planning/radar/' },
            { text: 'Interactive Radar', link: '/planning/radar/interactive' },
            { text: 'Methodology', link: '/planning/radar/methodology' },
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
