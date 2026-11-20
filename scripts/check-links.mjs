// Internal link check: every same-site link found in the app's source and data must point at a page the app answers.
// Run after `npm run build`:  node scripts/check-links.mjs
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const known = (p) => {
  const clean = p.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  return clean === '/' ? existsSync(join(dist, 'index.html')) : existsSync(join(dist, clean, 'index.html')) || existsSync(join(dist, clean)) || existsSync(join(dist, clean + '.html'))
}
const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(jsx?|json)$/.test(f) && files.push(p) } }
walk(new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const bad = new Map()
let total = 0
for (const f of files) {
  const txt = readFileSync(f, 'utf8')
  for (const m of txt.matchAll(/(?:href|to|path)\s*[=:]\s*["'`](\/[a-z0-9][a-z0-9\-/]*)(?:[?#][^"'`]*)?["'`]/gi)) {
    total++
    if (!known(m[1])) bad.set(`${m[1]}  (${f.split(/[\/]src[\/]/)[1]})`, 1)
  }
}
console.log(`checked ${total} internal links in ${files.length} files`)
if (bad.size) { console.log('BROKEN:'); for (const k of bad.keys()) console.log(' ', k); process.exitCode = 1 } else console.log('no broken internal links')
