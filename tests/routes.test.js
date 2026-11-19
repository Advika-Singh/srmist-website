import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { SECTION_PATHS, SLUGS } from '../src/data/routes.js'
import { PAGE_DESC, PAGE_TITLE } from '../src/lib/seo.js'

// vercel.json no longer rewrites unknown addresses to the app (so they get a real 404 status), which means every address
// the app answers must have its own pre-rendered file. scripts/prerender-head.mjs writes one for each of these.
const APPLY_STEPS = ['/apply', '/apply/programme', '/apply/details', '/apply/review']
const prerendered = new Set(['/', ...Object.keys(PAGE_DESC), ...Object.keys(PAGE_TITLE), ...SLUGS.map((s) => `/${s}`), ...APPLY_STEPS])

test('every route in App.jsx has a pre-rendered page, except the 404 page itself', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const paths = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*' && p !== '/404')
  assert.ok(paths.length > 25, `only found ${paths.length} routes`)
  for (const p of [...paths, ...SECTION_PATHS, ...SLUGS.map((s) => `/${s}`)]) assert.ok(prerendered.has(p), `${p} has no pre-rendered page and would return 404`)
})

test('the Vercel config does not send unknown addresses to the app any more', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
  assert.equal(config.rewrites, undefined)
})
