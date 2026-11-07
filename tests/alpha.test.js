import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groupByLetter } from '../src/lib/alpha.js'
import { DEPARTMENTS } from '../src/data/departments.js'

test('groupByLetter sorts names and groups them under their first letter', () => {
  const g = groupByLetter([{ name: 'Zoology' }, { name: 'Architecture' }, { name: 'Aerospace Engineering' }])
  assert.deepEqual(g.map((x) => x.letter), ['A', 'Z'])
  assert.deepEqual(g[0].items.map((i) => i.name), ['Aerospace Engineering', 'Architecture'])
})

test('names that do not start with a letter go under #, and empty input gives []', () => {
  assert.deepEqual(groupByLetter([]), [])
  const g = groupByLetter([{ name: '3D Design' }, { name: 'Botany' }])
  assert.deepEqual(g.map((x) => x.letter), ['B', '#'])
})

test('letters ignore case and leading spaces', () => {
  const g = groupByLetter([{ name: '  mathematics' }, { name: 'Management' }])
  assert.deepEqual(g.map((x) => x.letter), ['M'])
  assert.equal(g[0].items.length, 2)
})

test('the real department list is non-empty, each item links to the official site and no name repeats', () => {
  assert.ok(DEPARTMENTS.length >= 40)
  const seen = new Set()
  for (const d of DEPARTMENTS) {
    assert.match(d.href, /^https:\/\/www\.srmist\.edu\.in\/department\//)
    assert.ok(!seen.has(d.name), d.name)
    seen.add(d.name)
  }
})
