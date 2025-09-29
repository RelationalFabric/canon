export default {
  title: '@relational-fabric/canon',
  description: 'A modern TypeScript package template with ESLint and TypeScript configurations for starting new projects',
  
  // Base URL for GitHub Pages
  base: '/canon/',
  
  // Theme configuration
  themeConfig: {
    // Navigation bar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/docs/' },
      { text: 'ADRs', link: '/adrs/' },
      { text: 'Planning', link: '/planning/' }
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
                { text: 'Tree Walk Over Mixed Entities', link: '/docs/examples/tree-walk-over-mixed-entities' },
                { text: 'User Authentication Tokens', link: '/docs/examples/user-authentication-tokens' }
              ]
            },
            { text: 'Radar Methodology', link: '/radar-methodology' }
          ]
        }
      ],
      
      // ADR sidebar
      '/adrs/': [
        {
          text: 'Architecture Decision Records',
          items: [
            { text: 'About ADRs', link: '/adrs' },
            { text: '1. TypeScript Package Setup', link: '/adrs/0001-typescript-package-setup' },
            { text: '2. ESLint Configuration with Antfu', link: '/adrs/0002-eslint-configuration-with-antfu' },
            { text: '3. Documentation Linting Inclusion', link: '/adrs/0003-documentation-linting-inclusion' },
            { text: '4. TypeScript Configuration Separation', link: '/adrs/0004-typescript-configuration-separation' },
            { text: '5. ESLint Configuration Abstraction', link: '/adrs/0005-eslint-configuration-abstraction' },
            { text: '6. Unbuilt TypeScript Library', link: '/adrs/0006-unbuilt-typescript-library' },
            { text: '7. Y-Statement Format', link: '/adrs/0007-y-statement-format' },
            { text: '8. Dual Export Strategy', link: '/adrs/0008-dual-export-strategy' },
            { text: '9. Node.js Version Requirement', link: '/adrs/0009-node-js-version-requirement' },
            { text: '10. VitePress Documentation Solution', link: '/adrs/0010-vitepress-documentation-solution' }
          ]
        }
      ],
      
      // Planning sidebar
      '/planning/': [
        {
          text: 'Planning & Strategy',
          items: [
            { text: 'Overview', link: '/planning/' },
            { text: 'Strategy', link: '/planning/strategy' },
            { text: 'Roadmap', link: '/planning/roadmap' },
            {
              text: 'Technology Radar',
              items: [
                { text: 'Overview', link: '/planning/radar/' },
                { text: 'Interactive Radar', link: '/planning/radar/radar.html' },
                { text: 'Methodology', link: '/radar-methodology' }
              ]
            }
          ]
        }
      ]
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/relational-fabric/canon' }
    ],
    
    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Relational Fabric'
    },
    
    // Search
    search: {
      provider: 'local'
    },
    
    // Edit link
    editLink: {
      pattern: 'https://github.com/relational-fabric/canon/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    
    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },
  
  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: 'github-dark'
  },
  
  // Ignore dead links for now - will fix them incrementally
  ignoreDeadLinks: true
}