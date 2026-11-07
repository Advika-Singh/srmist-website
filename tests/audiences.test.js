import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AUDIENCES, DEFAULT_AUDIENCE, SECTION_KEYS, isAudience, neighbours, orderFor, parseAudience } from '../src/data/audiences.js'

test('every audience orders all six sections exactly once', () => {
  assert.equal(SECTION_KEYS.length, 6)
  for (const a of AUDIENCES) {
    const positions = SECTION_KEYS.map((k) => orderFor(a.id, k)).sort((x, y) => x - y)
    assert.deepEqual(positions, [0, 1, 2, 3, 4, 5], a.id)
  }
})

test("applicant order is today's page", () => {
  assert.deepEqual(SECTION_KEYS.map((k) => orderFor('applicant', k)), [0, 1, 2, 3, 4, 5])
  assert.equal(DEFAULT_AUDIENCE, 'applicant')
})

test('parent view puts rankings before the programme list, student view starts with research', () => {
  assert.ok(orderFor('parent', 'rankings') < orderFor('parent', 'fields'))
  assert.equal(orderFor('student', 'research'), 0)
})

test('news (What’s happening) is the last section for every audience', () => {
  for (const a of AUDIENCES) assert.equal(orderFor(a.id, 'news'), 5, a.id)
})

test('each audience has exactly four links and every href is /path or https://', () => {
  for (const a of AUDIENCES) {
    assert.equal(a.links.length, 4, a.id)
    for (const [label, href] of a.links) {
      assert.ok(label.length > 0)
      assert.match(href, /^(\/[^/]|https:\/\/)/, `${a.id}: ${href}`)
    }
  }
})

test('parseAudience: URL wins, then stored value, then the default', () => {
  assert.equal(parseAudience('?for=parent', null), 'parent')
  assert.equal(parseAudience('?for=bogus', 'visitor'), 'visitor')
  assert.equal(parseAudience('', 'zzz'), 'applicant')
  assert.equal(parseAudience('', null), 'applicant')
  assert.equal(parseAudience('?for=student', 'parent'), 'student')
})

test('isAudience accepts only the four ids', () => {
  assert.ok(isAudience('visitor'))
  assert.ok(!isAudience('zzz'))
  assert.ok(!isAudience(undefined))
})

test('unknown audience falls back to the applicant order', () => {
  assert.equal(orderFor('nope', 'about'), orderFor('applicant', 'about'))
})

test('neighbours: the sections just before and after a section for an audience', () => {
  assert.deepEqual(neighbours('applicant', 'triplet'), { prev: 'about', next: 'rankings' })
  assert.deepEqual(neighbours('student', 'triplet'), { prev: 'about', next: 'fields' })
  assert.deepEqual(neighbours('applicant', 'about'), { prev: null, next: 'triplet' })
  assert.deepEqual(neighbours('applicant', 'news'), { prev: 'research', next: null })
  assert.deepEqual(neighbours('nope', 'triplet'), neighbours('applicant', 'triplet'))
})

