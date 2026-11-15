// After `vite build`: write dist/<route>/index.html for every known page, each with its own title, description,
// canonical address, share tags and structured data already in the HTML. The app itself is unchanged; this only
// means link previews and crawlers that do not run JavaScript see the right page details.
// If a host does not serve these files, it falls back to dist/index.html exactly as before.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { SLUGS } from '../src/data/routes.js'
import { PAGE_DESC, PAGE_TITLE, descFor, ldText, titleFor, urlFor } from '../src/lib/seo.js'

const DIST = new URL('../dist/', import.meta.url)
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** Replace exactly one match, or stop the build: a silent miss would ship the wrong tags. */
function swap(html, pattern, replacement, what) {
  const hits = html.match(new RegExp(pattern.source, 'g'))?.length ?? 0
  if (hits !== 1) throw new Error(`prerender: expected one ${what} in index.html, found ${hits}`)
  return html.replace(pattern, () => replacement)
}

export function headFor(base, path) {
  const title = esc(titleFor(path))
  const desc = esc(descFor(path))
  const url = esc(urlFor(path))
  let html = base
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, 'title')
  html = swap(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${desc}" />`, 'description')
  html = swap(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, 'canonical')
  html = swap(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`, 'og:title')
  html = swap(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${desc}" />`, 'og:description')
  html = swap(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, 'og:url')
  html = swap(html, /<\/head>/, `  <script type="application/ld+json" id="ld-json">${ldText(path)}</script>\n  </head>`, 'closing head tag')
  return html
}

const base = readFileSync(new URL('index.html', DIST), 'utf8')
const paths = new Set(['/', ...Object.keys(PAGE_DESC), ...Object.keys(PAGE_TITLE), ...SLUGS.map((s) => `/${s}`), '/apply'])
for (const path of paths) {
  const html = headFor(base, path)
  if (path === '/') {
    writeFileSync(new URL('index.html', DIST), html)
    continue
  }
  const dir = new URL(`${path.slice(1)}/`, DIST)
  mkdirSync(dir, { recursive: true })
  writeFileSync(new URL('index.html', dir), html)
}
console.log(`prerender: ${paths.size} pages given their own head tags`)
