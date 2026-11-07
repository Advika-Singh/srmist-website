import assert from 'node:assert/strict'
import { test } from 'node:test'
import { KITS, MOMENTS, PINNED, SLUGS, kitFor } from '../src/data/page-kits.js'

const TWELVE = ['about', 'research', 'international', 'placements', 'rankings', 'scholarships', 'events', 'library', 'departments', 'examinations', 'alumni', 'campus-life']

test('every one of the 12 pages has a kit', () => {
  for (const s of TWELVE) assert.ok(KITS[s], s)
  assert.deepEqual([...SLUGS].sort(), [...TWELVE].sort())
})

test('every moment type is a known moment', () => {
  for (const [slug, k] of Object.entries(KITS)) for (const m of k.moments) assert.ok(MOMENTS.includes(m.type), `${slug}: ${m.type}`)
})

test('every kit has a moment, a hex accent and a crop', () => {
  for (const [slug, k] of Object.entries(KITS)) {
    assert.ok(k.moments.length >= 1, slug)
    assert.match(k.accent, /^#[0-9a-f]{6}$/i, slug)
    assert.ok(k.crop.length > 0, slug)
  }
})

test('no two pages share an accent colour', () => {
  const accents = Object.values(KITS).map((k) => k.accent.toLowerCase())
  assert.equal(new Set(accents).size, accents.length)
})

test('no page pins more than three moments, so scroll length stays within the cap', () => {
  for (const [slug, k] of Object.entries(KITS)) assert.ok(k.moments.filter((m) => PINNED.includes(m.type)).length <= 3, slug)
})

test('kitFor returns null for a page without a kit', () => {
  assert.equal(kitFor('nope'), null)
  assert.equal(kitFor('research').accent, KITS.research.accent)
})
