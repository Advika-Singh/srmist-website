// Writes public/sitemap.xml from the route list. Run automatically before `vite build`.
import { writeFileSync } from 'node:fs'
import { SLUGS } from '../src/data/routes.js'
import { PAGE_DESC, SITE } from '../src/lib/seo.js'

const paths = new Set(['/', ...Object.keys(PAGE_DESC), ...SLUGS.map((s) => `/${s}`), '/apply'])
const day = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths]
  .sort()
  .map((p) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${day}</lastmod></url>`)
  .join('\n')}\n</urlset>\n`
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap: ${paths.size} urls`)
