import test from 'node:test'
import assert from 'node:assert/strict'
import { PAGE_DESC, SITE } from '../src/lib/seo.js'
import { SLUGS } from '../src/data/routes.js'

test('every described page has a description of a sensible length', () => {
  for (const [path, d] of Object.entries(PAGE_DESC)) {
    assert.ok(path.startsWith('/'), path)
    assert.ok(d.length >= 40 && d.length <= 200, `${path}: ${d.length} chars`)
  }
})

test('descriptions are unique so previews are not identical', () => {
  const all = Object.values(PAGE_DESC)
  assert.equal(new Set(all).size, all.length)
})

test('site origin is https and has no trailing slash', () => {
  assert.match(SITE, /^https:\/\/[^/]+$/)
})

test('legal pages exist in the description table', () => {
  for (const p of ['/privacy', '/terms', '/accessibility', '/campus-walk']) assert.ok(PAGE_DESC[p], p)
  assert.ok(SLUGS.length > 0)
})
