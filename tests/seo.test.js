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

test('tab titles: home, apply, admissions, own pages, menu pages and route-table pages', async () => {
  const { titleFor, HOME_TITLE, PAGE_TITLE } = await import('../src/lib/seo.js')
  assert.equal(titleFor('/'), HOME_TITLE)
  assert.equal(titleFor('/apply'), 'Apply to SRMIST')
  assert.equal(titleFor('/apply/details'), 'Apply to SRMIST')
  assert.equal(titleFor('/admissions'), 'Admissions 2027 — SRMIST')
  assert.equal(titleFor('/compare'), 'Compare programmes — SRMIST')
  assert.equal(titleFor('/about'), 'About — SRMIST')
  assert.equal(titleFor('/placements'), 'Careers & placements — SRMIST')
  assert.equal(titleFor('/no-such-page'), HOME_TITLE)
  for (const p of Object.keys(PAGE_TITLE)) assert.ok(PAGE_DESC[p], `${p} has a title but no description`)
})

test('structured data: the home page says the site is about SRMIST, other pages get a breadcrumb trail', async () => {
  const { jsonLd, ldText } = await import('../src/lib/seo.js')
  const [home] = jsonLd('/')
  assert.equal(home['@type'], 'WebSite')
  assert.equal(home.name, 'SRMIST concept redesign')
  assert.equal(home.about.url, 'https://www.srmist.edu.in/')
  const [crumbs] = jsonLd('/alumni/chapters/')
  assert.equal(crumbs['@type'], 'BreadcrumbList')
  assert.deepEqual(crumbs.itemListElement.map((i) => i.name), ['Home', 'Alumni', 'Alumni chapters'])
  assert.deepEqual(crumbs.itemListElement.map((i) => i.position), [1, 2, 3])
  assert.equal(crumbs.itemListElement[2].item, `${SITE}/alumni/chapters`)
  assert.deepEqual(jsonLd('/no-such-page'), [])
  assert.ok(!ldText('/compare').includes('<'))
  JSON.parse(ldText('/compare'))
})
