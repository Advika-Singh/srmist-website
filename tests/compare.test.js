import assert from 'node:assert/strict'
import test from 'node:test'
import { PROGRAMMES } from '../src/data/programmes.js'
import { MAX_COMPARE, NO_EXAM_TEXT, SHORTLIST_KEY, cleanIds, clearShortlist, columns, idsFromQuery, queryFor, readShortlist, toggleId, toggleShortlist } from '../src/lib/compare.js'

const memory = (initial = {}) => {
  const data = { ...initial }
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = String(v)), removeItem: (k) => void delete data[k] }
}

test('unknown, repeated and extra ids are dropped', () => {
  assert.deepEqual(cleanIds(['law', 'nope', 'law', 'science', 'engineering', 'hotel']), ['law', 'science', 'engineering'])
  assert.deepEqual(cleanIds(null), [])
  assert.deepEqual(cleanIds([1, {}, 'law']), ['law'])
})

test('toggling adds, removes and stops at the limit', () => {
  assert.deepEqual(toggleId([], 'law'), ['law'])
  assert.deepEqual(toggleId(['law'], 'law'), [])
  const full = ['law', 'science', 'engineering']
  assert.equal(full.length, MAX_COMPARE)
  assert.deepEqual(toggleId(full, 'hotel'), full)
  assert.deepEqual(toggleId(full, 'science'), ['law', 'engineering'])
  assert.deepEqual(toggleId(['law'], 'not-a-field'), ['law'])
})

test('a column only repeats what the programme data says', () => {
  for (const p of PROGRAMMES) {
    const [c] = columns([p.id])
    assert.equal(c.field, p.field)
    assert.equal(c.levels, p.levels)
    assert.equal(c.duration.join(' · '), p.duration)
    assert.equal(c.examples.join(', '), p.examples)
    assert.match(c.official, /^https:\/\/([a-z]+\.)?srmist\.edu\.in\//)
    assert.equal(c.apply, `/apply/programme?field=${encodeURIComponent(p.field)}`)
    assert.ok(c.entrance.length > 0)
  }
})

test('entrance exams match what SRMIST publishes, and nothing is guessed for the rest', () => {
  const by = Object.fromEntries(columns(['engineering', 'management', 'law']).map((c) => [c.id, c]))
  assert.equal(by.engineering.entrance, 'SRMJEEE, for B.Tech and M.Tech (Integrated)')
  assert.equal(by.engineering.guide, '/srmjeee')
  assert.equal(by.management.entrance, 'SRMJEEM, for MBA')
  assert.equal(by.law.entrance, 'SRMJEEL, for Law (UG)')
  const rest = columns(['science', 'architecture', 'hotel'])
  for (const c of rest) assert.equal(c.entrance, NO_EXAM_TEXT)
  assert.equal(columns(['medicine'])[0].entrance, 'SRMJEEH, for Health Science (UG and PG)')
})

test('a selection survives a round trip through the address', () => {
  assert.equal(queryFor(['law', 'science']), '?fields=law,science')
  assert.equal(queryFor([]), '')
  assert.deepEqual(idsFromQuery('?fields=law,science'), ['law', 'science'])
  assert.deepEqual(idsFromQuery('?fields=<script>,law'), ['law'])
  assert.deepEqual(idsFromQuery(''), [])
})

test('the shortlist is saved, read back and cleared', () => {
  const store = memory()
  assert.deepEqual(readShortlist(store), [])
  assert.deepEqual(toggleShortlist(store, 'law'), ['law'])
  assert.deepEqual(toggleShortlist(store, 'hotel'), ['law', 'hotel'])
  assert.deepEqual(readShortlist(store), ['law', 'hotel'])
  assert.deepEqual(toggleShortlist(store, 'law'), ['hotel'])
  assert.deepEqual(clearShortlist(store), [])
  assert.deepEqual(readShortlist(store), [])
})

test('the shortlist can hold every field, and bad or blocked storage never throws', () => {
  const store = memory()
  for (const p of PROGRAMMES) toggleShortlist(store, p.id)
  assert.equal(readShortlist(store).length, PROGRAMMES.length)
  assert.deepEqual(readShortlist(memory({ [SHORTLIST_KEY]: '{not json' })), [])
  assert.deepEqual(readShortlist(memory({ [SHORTLIST_KEY]: '"law"' })), [])
  const blocked = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') }, removeItem() { throw new Error('blocked') } }
  assert.deepEqual(readShortlist(blocked), [])
  assert.deepEqual(toggleShortlist(blocked, 'law'), ['law'])
  assert.deepEqual(clearShortlist(blocked), [])
})
