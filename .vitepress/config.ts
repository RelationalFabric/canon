import { defineConfig } from 'vitepress'

export default defineConfig({
  srcDir: '.',
  cleanUrls: true,
  lastUpdated: true,
  title: '@relational-fabric/canon',
  description: 'Modern TypeScript package template with ESLint and TS configs',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Planning', link: '/planning/' },
      { text: 'GitHub', link: 'https://github.com/RelationalFabric/canon' }
    ],
    sidebar: {
      '/docs/': [
        {
          text: 'Documentation',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/docs/' },
            { text: 'Canons', link: '/docs/canons' },
            { text: 'Axioms', link: '/docs/axioms' },
            { text: 'Radar Methodology', link: '/docs/radar-methodology' },
            { text: 'Examples', link: '/docs/examples/' },
            { text: 'ADRs', link: '/docs/adrs/' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'API', link: '/reference/api' },
            { text: 'Canons', link: '/reference/canons' },
            { text: 'Axioms', link: '/reference/axioms' },
            { text: 'Third-Party', link: '/reference/third-party' },
            { text: 'Augmentable Interfaces', link: '/reference/augmentable-interfaces' }
          ]
        }
      ],
      '/planning/': [
        {
          text: 'Planning',
          items: [
            { text: 'Overview', link: '/planning/' },
            { text: 'Technology Radar', link: '/planning/radar/' }
          ]
        }
      ]
    }
  }
})

