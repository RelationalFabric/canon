import { defineUserConfig } from 'vitepress-export-pdf'

export default defineUserConfig({
  // Output configuration
  outFile: 'canon-documentation.pdf',
  outDir: '.vitepress/dist/pdf',
  
  // Route patterns to include/exclude pages
  // Exclude 404 page and include all other routes
  routePatterns: ['/**', '!/404.html'],
  
  // PDF options
  pdfOptions: {
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm',
    },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">@relational-fabric/canon Documentation</div>',
    footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  },
  
  // Keep PDF outlines/bookmarks (requires Node >= 18.5.0)
  pdfOutlines: true,
  
  // URL origin for header/footer (use localhost for local builds)
  urlOrigin: 'http://localhost:4173/canon',
  
  // Puppeteer launch options
  puppeteerLaunchOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})
