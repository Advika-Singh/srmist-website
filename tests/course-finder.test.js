import assert from 'node:assert/strict'
import test from 'node:test'
import { QUESTIONS } from '../src/data/finder-questions.js'
import { PROGRAMMES } from '../src/data/programmes.js'
import { recommend, unanswered } from '../src/lib/courseFinder.js'

test('every weight points at a real field of study', () => {
  const ids = new Set(PROGRAMMES.map((p) => p.id))
  for (const q of QUESTIONS) for (const o of q.options) for (const id of Object.keys(o.w)) assert.ok(ids.has(id), `${q.id}/${o.id}: ${id}`)
})

test('biology and wanting to help people put medicine first', () => {
  const r = recommend({ self: ['help'], school: ['biology'], after: 'profession', level: 'UG' })
  assert.equal(r[0].id, 'medicine')
  assert.equal(r[0].label, 'Best match')
  assert.ok(r[0].reasons.length > 0)
})

test('design and art put architecture first', () => {
  assert.equal(recommend({ self: ['space'], school: ['art'], level: 'UG' })[0].id, 'architecture')
})

test('computers and maths put engineering first', () => {
  assert.equal(recommend({ self: ['build'], school: ['computers', 'maths'], after: 'industry', level: 'UG' })[0].id, 'engineering')
})

test('doctoral level leaves out fields that have no doctoral programme', () => {
  const ids = recommend({ self: ['debate', 'host', 'space'], level: 'Doctoral' }, 8).map((r) => r.id)
  for (const id of ['law', 'hotel', 'architecture']) assert.ok(!ids.includes(id), id)
})

test('returns at most three, best first, with strength relative to the best', () => {
  const r = recommend({ self: ['build', 'curious', 'lead'], learn: 'hands', after: 'research', level: 'UG' })
  assert.ok(r.length <= 3)
  assert.equal(r[0].strength, 1)
  for (let i = 1; i < r.length; i++) assert.ok(r[i].strength <= r[i - 1].strength)
})

test('no answers gives no recommendation instead of a random one', () => {
  assert.deepEqual(recommend({}), [])
})

test('unanswered ignores the optional question and lists the rest', () => {
  assert.deepEqual(unanswered({}), ['self', 'learn', 'after', 'level'])
  assert.deepEqual(unanswered({ self: ['build'], learn: 'hands', after: 'industry', level: 'UG' }), [])
})
