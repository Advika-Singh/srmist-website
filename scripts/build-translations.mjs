// Builds src/data/translations-extra-{ta,hi}.json: Tamil and Hindi for the long strings that live in our data files
// (menus, section pages, inner-page copy, event titles), so they appear at once instead of waiting for the live translator.
// It sends batches to the running dev server's /api/translate (which holds the Gemini key), keeps what it already has,
// and can be stopped and restarted:   npm run dev   then   node scripts/build-translations.mjs [ta|hi]
// The result is machine translation; have a native speaker review it before launch (docs/ROADMAP.md, phase 4).
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { AUX, CAMPUSES, MENUS, STRIP } from '../src/data/nav.js'
import { EVENTS } from '../src/data/events.js'
import { SECTION_LIST } from '../src/data/sections.js'

const BASE = process.env.TR_BASE || 'http://localhost:5174'
const pages = JSON.parse(readFileSync(new URL('../src/data/pages.json', import.meta.url), 'utf8'))

const found = new Set()
const add = (s) => {
  if (typeof s !== 'string') return
  const t = s.trim()
  if (t.length < 3 || t.length > 600 || !/[A-Za-z]{2,}/.test(t) || /^(\/|https?:|tel:|mailto:)/.test(t)) return
  found.add(t)
}
const walk = (v) => (Array.isArray(v) ? v.forEach(walk) : v && typeof v === 'object' ? Object.values(v).forEach(walk) : add(v))

;[...STRIP, ...AUX, ...CAMPUSES].forEach(([label]) => add(label))
for (const m of MENUS) {
  add(m.label)
  add(m.blurb)
  for (const c of m.cols ?? []) {
    add(c.title)
    c.links.forEach(([label]) => add(label))
  }
}
for (const p of SECTION_LIST) {
  ;[p.title, p.eyebrow, p.h1, p.lede].forEach(add)
  for (const g of p.groups) {
    ;[g.title, g.intro].forEach(add)
    ;(g.cats ?? []).forEach(([, label]) => add(label))
    ;(g.eras ?? []).forEach(([, label]) => add(label))
    ;(g.lanes ?? []).forEach(add)
    for (const it of g.items) {
      ;[it.title, it.text, it.meta, it.role, it.stamp, it.tab, it.label].forEach(add)
      ;(it.rows ?? []).forEach(([k]) => add(k))
      ;(it.bands ?? []).forEach(([k]) => add(k))
    }
  }
}
EVENTS.forEach((e) => add(e.title))
walk(pages)

const strings = [...found]
console.log(`${strings.length} strings to cover`)

async function run(lang) {
  const file = fileURLToPath(new URL(`../src/data/translations-extra-${lang}.json`, import.meta.url))
  const have = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const todo = strings.filter((s) => !(s in have))
  console.log(`${lang}: ${Object.keys(have).length} done, ${todo.length} to go`)
  for (let i = 0; i < todo.length; i += 40) {
    const batch = todo.slice(i, i + 40)
    let ok = false
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      try {
        const r = await fetch(`${BASE}/api/translate`, { method: 'POST', headers: { 'content-type': 'application/json', origin: BASE }, body: JSON.stringify({ lang, texts: batch }), signal: AbortSignal.timeout(90_000) })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const { translations } = await r.json()
        if (!Array.isArray(translations) || translations.length !== batch.length) throw new Error('bad shape')
        batch.forEach((s, k) => translations[k] && (have[s] = translations[k]))
        writeFileSync(file, JSON.stringify(have, null, 1))
        ok = true
        console.log(`${lang}: ${Object.keys(have).length}/${strings.length}`)
      } catch (e) {
        console.log(`${lang}: batch ${i / 40 + 1} attempt ${attempt + 1} failed (${e.message})`)
        await new Promise((r) => setTimeout(r, 4000))
      }
    }
  }
}

for (const lang of process.argv[2] ? [process.argv[2]] : ['ta', 'hi']) await run(lang)
console.log('done')
