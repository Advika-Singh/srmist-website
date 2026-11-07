import assert from 'node:assert/strict'
import test from 'node:test'
import { TOPICS, VOICES, filterVoices } from '../src/data/student-voices.js'

test('every answer is either consented to by the student or sourced to a public page', () => {
  assert.ok(VOICES.length >= 1)
  for (const v of VOICES) {
    assert.ok(TOPICS.some(([id]) => id === v.topic), `${v.id} has an unknown topic`)
    assert.ok(v.consent === true || /^https:\/\//.test(v.source ?? ''), `${v.id} needs consent or an https source`)
    assert.ok(v.q && v.a && v.who && v.department, `${v.id} is incomplete`)
  }
})

test('filterVoices narrows by topic and department, and an empty filter returns everything', () => {
  assert.equal(filterVoices(VOICES, {}).length, VOICES.length)
  const placed = filterVoices(VOICES, { topic: 'placements' })
  assert.ok(placed.length >= 1 && placed.every((v) => v.topic === 'placements'))
  const dept = placed[0].department
  assert.ok(filterVoices(VOICES, { department: dept }).every((v) => v.department === dept))
  assert.deepEqual(filterVoices(VOICES, { topic: 'no-such-topic' }), [])
})
