import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { MENUS } from '../src/data/nav.js'
import { SECTION_PATHS, SLUGS } from '../src/data/routes.js'
import { SECTION_LIST, SECTION_BY_PATH } from '../src/data/sections.js'
import { PAGE_DESC, PAGE_TITLE } from '../src/lib/seo.js'

const OFFICIAL_HOSTS = /^(https:\/\/([a-z]+\.)?srmist\.edu\.in\/|https:\/\/(www\.srmdei\.com|fablab\.srmiiec\.com|studyinindia\.gov\.in)(\/|$))/
const idsOf = (page) => new Set(page.groups.flatMap((g) => [g.id, ...g.items.map((i) => i.id).filter(Boolean)]))

test('the route list matches the content file', () => {
  assert.deepEqual([...SECTION_PATHS], SECTION_LIST.map((p) => p.path))
  assert.equal(new Set(SECTION_PATHS).size, SECTION_PATHS.length)
})

test('every item has a title, a short description and a link that is either ours or an official SRMIST address', () => {
  const fx = new Set([...readFileSync(new URL('../src/ui/fx.jsx', import.meta.url), 'utf8').match(/export const FX = \{([\s\S]*?)\n\}/)[1].matchAll(/^\s*(\w+):/gm)].map((m) => m[1]))
  for (const page of SECTION_LIST) {
    for (const g of page.groups) {
      assert.ok(fx.has(g.fx), `${page.path}: unknown effect ${g.fx}`)
      assert.ok(g.items.length > 0, `${page.path}#${g.id} is empty`)
      for (const it of g.items) {
        const name = `${page.path}#${g.id}/${it.id ?? it.year ?? it.label}`
        if (g.fx === 'timeline') {
          assert.match(it.year, /^\d{4}$/, name)
          assert.ok(it.text.length > 10 && it.text.length < 260, name)
          continue
        }
        if (g.fx === 'contact') {
          assert.ok(it.label && it.value, name)
          continue
        }
        assert.ok(it.title, name)
        if (g.fx !== 'roll') assert.ok(it.text && it.text.length >= 20 && it.text.length <= 330, `${name}: text length ${it.text?.length}`)
        assert.ok(it.href, name)
        if (it.href.startsWith('/')) assert.ok(it.ours || g.fx === 'cards' || it.href, `${name}: an own page should say so`)
        else assert.match(it.href, OFFICIAL_HOSTS, `${name}: ${it.href}`)
      }
    }
  }
})

test('anchors are unique inside a page, and every image exists', () => {
  for (const page of SECTION_LIST) {
    const ids = page.groups.flatMap((g) => [g.id, ...g.items.map((i) => i.id).filter(Boolean)])
    assert.equal(new Set(ids).size, ids.length, `${page.path} repeats an id`)
    for (const src of [page.img, ...page.groups.flatMap((g) => g.items.map((i) => i.img)).filter(Boolean)]) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `${page.path}: missing ${src}`)
  }
})

test('every page has the same title and description in the SEO tables, and its related links exist', () => {
  const known = new Set(['/', ...Object.keys(PAGE_DESC), ...Object.keys(PAGE_TITLE), ...SLUGS.map((s) => `/${s}`)])
  for (const page of SECTION_LIST) {
    assert.equal(PAGE_TITLE[page.path], page.title)
    assert.equal(PAGE_DESC[page.path], page.desc)
    assert.ok(page.groups.length > 0 && page.related.length > 0)
    for (const r of page.related) assert.ok(known.has(r), `${page.path} relates to unknown ${r}`)
  }
})

test('menu links that point into a section page land on a card that exists', () => {
  let checked = 0
  for (const m of MENUS) {
    for (const c of m.cols ?? []) {
      for (const [title, href] of c.links) {
        if (!href.startsWith('/')) continue
        const [path, hash] = href.split('#')
        if (!SECTION_BY_PATH[path]) continue
        checked++
        if (hash) assert.ok(idsOf(SECTION_BY_PATH[path]).has(hash), `${title}: ${href}`)
      }
    }
  }
  assert.ok(checked > 60, `only ${checked} menu links reach the section pages`)
})

test('no menu link still points at an official page we have redesigned', () => {
  const official = new Set(SECTION_LIST.flatMap((p) => p.groups.flatMap((g) => g.items.map((i) => i.href).filter((h) => h?.startsWith('https://www.srmist.edu.in/')))))
  for (const m of MENUS) for (const c of m.cols ?? []) for (const [title, href] of c.links) assert.ok(!official.has(href), `${title} still opens ${href}`)
})
